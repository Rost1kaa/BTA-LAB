import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/logging";
import { getClientIpFromHeaders, verifySameOriginHeaders } from "@/lib/security/request";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { questionnaireContent } from "@/data/questionnaire";

const MAX_ANSWER_KEYS = 80;
const MAX_TEXT_LENGTH = 4000;

const submitSchema = z.object({
  token: z.string().trim().min(32).max(256),
  answers: z.record(z.string(), z.unknown()).default({}),
  mode: z.enum(["submit", "draft"]).default("submit"),
});

/** All valid answer keys (field ids + option text keys like `${fieldId}__${optionId}`). */
function buildValidKeys(): Set<string> {
  const keys = new Set<string>();
  for (const step of questionnaireContent.steps) {
    for (const item of step.items) {
      if (item.kind === "question") {
        keys.add(item.id);
        item.options
          .filter((o) => o.textFieldLabel)
          .forEach((o) => keys.add(`${item.id}__${o.id}`));
      } else if (item.kind === "text") {
        keys.add(item.id);
      }
    }
  }
  return keys;
}

const validKeys = buildValidKeys();

/** Whether a field is currently relevant based on conditional visibility (showWhen). */
function isFieldRelevant(fieldId: string, answers: Record<string, unknown>): boolean {
  for (const step of questionnaireContent.steps) {
    for (const item of step.items) {
      if ((item.kind === "question" || item.kind === "text") && item.id === fieldId) {
        if (!item.showWhen) return true;
        const parent = answers[item.showWhen.fieldId];
        const parentIds = Array.isArray(parent) ? parent : parent ? [parent] : [];
        return item.showWhen.optionIds.some((id) => parentIds.includes(id));
      }
    }
  }
  return true;
}

/**
 * Structural validation of answers against the questionnaire definition.
 * In partial mode (drafts) values are validated but required questions are not
 * enforced. In full mode (submit) every relevant question must be answered.
 */
function validateAnswers(
  answers: Record<string, unknown>,
  partial: boolean
): { ok: true } | { ok: false; message: string } {
  const entries = Object.entries(answers);
  if (entries.length > MAX_ANSWER_KEYS) {
    return { ok: false, message: "პასუხები ვერ დამუშავდა." };
  }

  // Reject unknown keys and invalid value shapes.
  for (const [key, value] of entries) {
    if (!validKeys.has(key)) {
      return { ok: false, message: "პასუხები ვერ დამუშავდა." };
    }
    if (typeof value !== "string" && !Array.isArray(value)) {
      return { ok: false, message: "პასუხები ვერ დამუშავდა." };
    }
    if (typeof value === "string" && value.length > MAX_TEXT_LENGTH) {
      return { ok: false, message: "პასუხები ვერ დამუშავდა." };
    }
  }

  // Provided answers must be valid option ids / texts.
  for (const step of questionnaireContent.steps) {
    for (const item of step.items) {
      if (item.kind !== "question") continue;
      const value = answers[item.id];
      if (value !== undefined) {
        if (item.type === "single") {
          if (typeof value !== "string" || !item.options.some((o) => o.id === value)) {
            return { ok: false, message: "ზოგიერთ კითხვაზე პასუხი არასწორია." };
          }
        } else {
          if (
            !Array.isArray(value) ||
            !value.every((v) => typeof v === "string" && item.options.some((o) => o.id === v))
          ) {
            return { ok: false, message: "ზოგიერთ კითხვაზე პასუხი არასწორია." };
          }
        }
      }
      for (const option of item.options.filter((o) => o.textFieldLabel)) {
        const text = answers[`${item.id}__${option.id}`];
        if (text !== undefined && (typeof text !== "string" || text.length > MAX_TEXT_LENGTH)) {
          return { ok: false, message: "პასუხები ვერ დამუშავდება." };
        }
      }
    }
  }

  if (!partial) {
    for (const step of questionnaireContent.steps) {
      for (const item of step.items) {
        // Every relevant (visible) question must be answered.
        if (item.kind === "question" && isFieldRelevant(item.id, answers)) {
          const value = answers[item.id];
          if (item.type === "single" && (typeof value !== "string" || value.length === 0)) {
            return { ok: false, message: "ზოგიერთ კითხვაზე პასუხი არ არის შევსებული." };
          }
          if (item.type === "multiple" && (!Array.isArray(value) || value.length === 0)) {
            return { ok: false, message: "ზოგიერთ კითხვაზე პასუხი არ არის შევსებული." };
          }
          // A selected option that reveals a text input requires it to be filled.
          const selectedIds =
            item.type === "multiple" ? (value as string[]) : [value as string];
          for (const option of item.options.filter((o) => o.textFieldLabel)) {
            if (selectedIds.includes(option.id)) {
              const text = answers[`${item.id}__${option.id}`];
              if (typeof text !== "string" || text.trim().length === 0) {
                return { ok: false, message: "ზოგიერთი სავალდებულო ველი არ არის შევსებული." };
              }
            }
          }
        }
        // Conditionally-revealed text fields (e.g. domain / hosting after "დიახ")
        // are REQUIRED once they are relevant (visible).
        if (item.kind === "text" && item.showWhen && isFieldRelevant(item.id, answers)) {
          const value = answers[item.id];
          if (typeof value !== "string" || value.trim().length === 0) {
            return { ok: false, message: "ზოგიერთი სავალდებულო ველი არ არის შევსებული." };
          }
        }
      }
    }
  }

  return { ok: true };
}

/**
 * Drop answers that belong to currently hidden (conditional) fields or to
 * options that are not selected, so stale answers are never persisted.
 */
function pruneIrrelevantAnswers(answers: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(answers)) {
    const fieldId = key.includes("__") ? key.split("__")[0] : key;
    if (!isFieldRelevant(fieldId, answers)) continue;

    // Option text inputs (key like `${fieldId}__${optionId}`) are kept only
    // when their option is actually selected.
    const sepIndex = key.indexOf("__");
    if (sepIndex !== -1) {
      const optionId = key.slice(sepIndex + 2);
      const parentValue = answers[fieldId];
      const parentIds = Array.isArray(parentValue)
        ? parentValue
        : parentValue
          ? [parentValue]
          : [];
      if (!parentIds.includes(optionId)) continue;
    }

    next[key] = value;
  }
  return next;
}

export async function POST(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);
  const route = new URL(request.url).pathname;

  if (!verifySameOriginHeaders(request.headers)) {
    logSecurityEvent({ event: "questionnaire_rate_limited", route, ip, reason: "origin_mismatch" });
    return NextResponse.json({ error: "მოთხოვნა ვერ დამუშავდა." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "მოთხოვნა ვერ დამუშავდა." }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "მოთხოვნა ვერ დამუშავდა." }, { status: 400 });
  }

  const { token, mode } = parsed.data;
  const rawAnswers = parsed.data.answers as Record<string, unknown>;

  const ipLimit = checkRateLimit("questionnaire-api", `${ip}:${token}`, {
    limit: 120,
    windowMs: 15 * 60_000,
    blockMs: 30 * 60_000,
  });
  if (!ipLimit.allowed) {
    logSecurityEvent({ event: "questionnaire_rate_limited", route, ip, reason: "ip_limit" });
    return NextResponse.json({ error: "ძალიან ბევრი მოთხოვნა. გთხოვთ, სცადოთ მოგვიანებით." }, { status: 429 });
  }

  const isSubmit = mode === "submit";
  const validation = validateAnswers(rawAnswers, !isSubmit);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }
  const answers = pruneIrrelevantAnswers(rawAnswers);

  const supabase = createServiceRoleClient();

  // The invitation must exist and still be pending before any write.
  const { data: existing } = (await supabase
    .from("questionnaire_invitations")
    .select("id, status")
    .eq("token", token)
    .maybeSingle()) as unknown as {
    data: { id: string; status: "pending" | "submitted" } | null;
    error: unknown;
  };

  if (!existing) {
    return NextResponse.json({ error: "ეს ბმული არასწორია." }, { status: 404 });
  }

  if (existing.status === "submitted") {
    return NextResponse.json({ error: "ეს ბმული უკვე გამოყენებულია." }, { status: 409 });
  }

  if (mode === "draft") {
    // Conditional update: drafts never touch an already-submitted invitation.
    const { data: draftSaved } = (await supabase
      .from("questionnaire_invitations")
      .update({ draft_answers: answers as never } as never)
      .eq("id", existing.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle()) as unknown as { data: { id: string } | null; error: unknown };

    if (!draftSaved) {
      // Lost the race — the link was just submitted.
      return NextResponse.json({ error: "ეს ბმული უკვე გამოყენებულია." }, { status: 409 });
    }
    return NextResponse.json({ success: true, saved: true });
  }

  // ── ATOMIC ONE-TIME SUBMISSION ─────────────────────────────────────
  // Single conditional UPDATE: only a pending invitation can be claimed.
  // In PostgreSQL (READ COMMITTED) two concurrent updates on the same row
  // serialize: the second re-evaluates the WHERE clause after the first
  // commits and sees status <> 'pending', updating 0 rows. Two simultaneous
  // requests can therefore never create two submissions.
  const { data: claimed } = (await supabase
    .from("questionnaire_invitations")
    .update({
      answers: answers as never,
      draft_answers: answers as never,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    } as never)
    .eq("id", existing.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle()) as unknown as { data: { id: string } | null; error: unknown };

  if (!claimed) {
    // Lost the race or already used — the one-time guard held.
    return NextResponse.json({ error: "ეს ბმული უკვე გამოყენებულია." }, { status: 409 });
  }

  console.info("[questionnaire] submitted", {
    timestamp: new Date().toISOString(),
    route,
    invitationId: claimed.id,
  });

  return NextResponse.json({ success: true, message: "კითხვარი წარმატებით გაიგზავნა." });
}
