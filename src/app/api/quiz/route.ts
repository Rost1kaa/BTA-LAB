import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/logging";
import { getClientIpFromHeaders, verifySameOriginHeaders } from "@/lib/security/request";

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

export async function POST(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);
  const route = new URL(request.url).pathname;

  if (!verifySameOriginHeaders(request.headers)) {
    logSecurityEvent({ event: "quiz_rate_limited", route, ip, reason: "origin_mismatch" });
    return NextResponse.json({ error: "Request could not be accepted." }, { status: 403 });
  }

  const ipLimit = checkRateLimit("quiz-ip", ip, {
    limit: 5,
    windowMs: 10 * 60_000,
    blockMs: 30 * 60_000,
  });

  if (!ipLimit.allowed) {
    logSecurityEvent({ event: "quiz_rate_limited", route, ip, reason: "ip_limit" });
    return NextResponse.json({ error: "Please wait before submitting again." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = quizSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the form fields and try again." }, { status: 400 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ success: true });
  }

  if (!parsed.data.contact.email && !parsed.data.contact.phone) {
    return NextResponse.json({ error: "Email or phone is required." }, { status: 400 });
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

  return NextResponse.json({
    success: true,
    message: "Submission received successfully",
  });
}
