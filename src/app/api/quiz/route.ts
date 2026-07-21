import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/logging";
import { getClientIpFromHeaders, verifySameOriginHeaders } from "@/lib/security/request";
import { getDictionary, translate } from "@/lib/get-dictionary";
import { getServerLocale, type Locale } from "@/lib/locale";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ServiceRequestType } from "@/types/supabase";

const quizSubmissionSchema = z.object({
  package: z.string().trim().max(120).optional(),
  locale: z.enum(["ka", "en"]).optional().default("ka"),
  submittedAt: z.string().trim().max(80).optional(),
  website: z.string().max(0).optional().default(""),
  answers: z.record(z.string(), z.unknown()).optional().default({}),
  customInputs: z.record(z.string(), z.unknown()).optional().default({}),
  contact: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(180).optional().or(z.literal("")),
    phone: z.string().trim().max(60).optional().default(""),
    company: z.string().trim().max(160).optional().default(""),
    preferredContact: z.string().trim().max(40).optional().default(""),
    additionalInfo: z.string().trim().max(3000).optional().default(""),
  }),
});

function resolveServiceType(packageName = "", answers: Record<string, unknown>): ServiceRequestType {
  const haystack = `${packageName} ${Object.values(answers).join(" ")}`.toLowerCase();

  if (haystack.includes("social") || haystack.includes("facebook") || haystack.includes("instagram")) {
    return "social_media";
  }

  if (haystack.includes("ads") || haystack.includes("advertising") || haystack.includes("meta")) {
    return "advertising";
  }

  if (haystack.includes("seo") || haystack.includes("google") || haystack.includes("analytics") || haystack.includes("search")) {
    return "seo_services";
  }

  return "website_creation";
}

export async function POST(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);
  const route = new URL(request.url).pathname;
  const serverLocale = await getServerLocale();
  let dict = await getDictionary(serverLocale);
  const message = (key: string) => translate(dict, key);

  if (!verifySameOriginHeaders(request.headers)) {
    logSecurityEvent({ event: "quiz_rate_limited", route, ip, reason: "origin_mismatch" });
    return NextResponse.json({ error: message("api.errors.originRejected") }, { status: 403 });
  }

  const ipLimit = checkRateLimit("quiz-ip", ip, {
    limit: 5,
    windowMs: 10 * 60_000,
    blockMs: 30 * 60_000,
  });

  if (!ipLimit.allowed) {
    logSecurityEvent({ event: "quiz_rate_limited", route, ip, reason: "ip_limit" });
    return NextResponse.json({ error: message("api.errors.rateLimited") }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: message("api.errors.invalidRequest") }, { status: 400 });
  }

  const parsed = quizSubmissionSchema.safeParse(body);
  const requestLocale = (body as { locale?: Locale } | null)?.locale;
  if (requestLocale === "ka" || requestLocale === "en") {
    dict = await getDictionary(requestLocale);
  }

  if (!parsed.success) {
    return NextResponse.json({ error: message("api.errors.formInvalid") }, { status: 400 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ success: true });
  }

  if (!parsed.data.contact.email && !parsed.data.contact.phone) {
    return NextResponse.json({ error: message("api.errors.contactRequired") }, { status: 400 });
  }

  console.info(
    "[quiz]",
    JSON.stringify({
      timestamp: new Date().toISOString(),
      route,
      locale: parsed.data.locale,
      package: parsed.data.package,
      hasEmail: Boolean(parsed.data.contact.email),
      hasPhone: Boolean(parsed.data.contact.phone),
    })
  );

  try {
    const supabase = createServiceRoleClient();
    const contact = parsed.data.contact;
    const { error } = await supabase.from("service_requests").insert({
      locale: parsed.data.locale,
      service_type: resolveServiceType(parsed.data.package, parsed.data.answers),
      service_package: parsed.data.package || "",
      customer_name: contact.name,
      customer_email: contact.email || "",
      customer_phone: contact.phone,
      customer_company: contact.company,
      preferred_contact: contact.preferredContact,
      answers: {
        answers: parsed.data.answers,
        customInputs: parsed.data.customInputs,
        additionalInfo: contact.additionalInfo,
        submittedAt: parsed.data.submittedAt || new Date().toISOString(),
      },
      status: "new",
    } as never);

    if (error) {
      console.error("Service request insert failed:", error.message);
      return NextResponse.json({ error: message("api.errors.invalidRequest") }, { status: 500 });
    }
  } catch (error) {
    console.error("Service request insert failed:", error);
    return NextResponse.json({ error: message("api.errors.invalidRequest") }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: message("api.success.submissionReceived"),
  });
}
