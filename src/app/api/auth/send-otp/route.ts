export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/logging";
import { getClientIpFromHeaders, verifySameOriginHeaders } from "@/lib/security/request";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendOtpEmail } from "@/lib/email/send-otp";
import { generateOtpCode } from "@/lib/email/otp-utils";

const sendOtpSchema = z.object({
  email: z.string().trim().email().max(255),
});

export async function POST(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);
  const route = new URL(request.url).pathname;

  // Origin check
  if (!verifySameOriginHeaders(request.headers)) {
    logSecurityEvent({ event: "otp_rate_limited", route, ip, reason: "origin_mismatch" });
    return NextResponse.json({ error: "origin_rejected" }, { status: 403 });
  }

  // Per-IP rate limit: max 5 OTP requests per hour
  const ipLimit = checkRateLimit("send-otp-ip", ip, {
    limit: 5,
    windowMs: 60 * 60_000,
    blockMs: 120 * 60_000,
  });

  if (!ipLimit.allowed) {
    logSecurityEvent({ event: "otp_rate_limited", route, ip, reason: "ip_limit" });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = sendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  // Per-email rate limit: max 3 OTP requests per hour
  const emailLimit = checkRateLimit("send-otp-email", email, {
    limit: 3,
    windowMs: 60 * 60_000,
    blockMs: 120 * 60_000,
  });

  if (!emailLimit.allowed) {
    logSecurityEvent({
      event: "otp_rate_limited",
      route,
      ip,
      email,
      reason: "email_otp_limit",
    });
    return NextResponse.json({ error: "rate_limited_email" }, { status: 429 });
  }

  const supabase = createServiceRoleClient();

  // Check if email already submitted an application
  const { data: existingApp } = await supabase
    .from("campaign_applications")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (existingApp && existingApp.length > 0) {
    return NextResponse.json({
      error: "ამ ელ-ფოსტით განაცხადი უკვე მიღებულია.",
      errorKey: "application_already_submitted",
    }, { status: 409 });
  }

  // Generate OTP
  const otpCode = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP in database
  const { error: dbError } = await (supabase as any)
    .from("email_otp_codes")
    .insert({
      email,
      otp_code: otpCode,
      expires_at: expiresAt.toISOString(),
    });

  if (dbError) {
    console.error("[send-otp] DB insert failed:", dbError.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // Send OTP via email
  const result = await sendOtpEmail(email, otpCode);

  if (!result.success) {
    console.error("[send-otp] Failed to send email:", result.error);
    return NextResponse.json({ error: "email_failed" }, { status: 500 });
  }

  console.info("[send-otp] OTP sent to", email);

  return NextResponse.json({
    success: true,
    // Return masked email for display
    maskedEmail: email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => `${a}${"*".repeat(Math.min(b.length, 4))}${c}`),
    expiresIn: 600,
  });
}
