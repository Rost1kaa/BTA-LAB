export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/logging";
import { getClientIpFromHeaders, verifySameOriginHeaders } from "@/lib/security/request";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { generateVerificationToken } from "@/lib/email/otp-utils";

const verifyOtpSchema = z.object({
  email: z.string().trim().email().max(255),
  otpCode: z.string().trim().length(6),
});

export async function POST(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);
  const route = new URL(request.url).pathname;

  // Origin check
  if (!verifySameOriginHeaders(request.headers)) {
    logSecurityEvent({ event: "contact_rate_limited", route, ip, reason: "origin_mismatch" });
    return NextResponse.json({ error: "origin_rejected" }, { status: 403 });
  }

  // Per-IP rate limit: max 10 verify attempts per hour
  const ipLimit = checkRateLimit("verify-otp-ip", ip, {
    limit: 10,
    windowMs: 60 * 60_000,
    blockMs: 120 * 60_000,
  });

  if (!ipLimit.allowed) {
    logSecurityEvent({ event: "contact_rate_limited", route, ip, reason: "ip_limit" });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const otpCode = parsed.data.otpCode;

  const supabase = createServiceRoleClient();

  // Find the most recent unverified, non-expired OTP for this email
  const { data: otpRecords, error: queryError } = await supabase
    .from("email_otp_codes")
    .select("*")
    .eq("email", email)
    .eq("is_verified", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  if (queryError) {
    console.error("[verify-otp] Query failed:", queryError.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (!otpRecords || otpRecords.length === 0) {
    return NextResponse.json({ error: "invalid_or_expired_code" }, { status: 400 });
  }

  const otpRecord = otpRecords[0] as {
    id: string;
    email: string;
    otp_code: string;
    expires_at: string;
    is_verified: boolean;
  };

  // Check OTP code match
  if (otpRecord.otp_code !== otpCode) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  // Mark OTP as verified
  const { error: updateError } = await (supabase as any)
    .from("email_otp_codes")
    .update({ is_verified: true })
    .eq("id", otpRecord.id);

  if (updateError) {
    console.error("[verify-otp] Update failed:", updateError.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // Check for existing application with this email (duplicate prevention)
  const { data: existingApp } = await supabase
    .from("campaign_applications")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (existingApp && existingApp.length > 0) {
    console.info("[verify-otp] Duplicate application blocked for", email);
    return NextResponse.json({
      error: "duplicate_application",
      message: "\u10d0\u10db \u10d4\u10da-\u10e4\u10dd\u10e1\u10e2\u10d8\u10d7 \u10d2\u10d0\u10dc\u10d0\u10ea\u10ee\u10d0\u10d3\u10d8 \u10e3\u10d9\u10d5\u10d4 \u10db\u10d8\u10e6\u10d4\u10d1\u10e3\u10da\u10d8\u10d0.",
    }, { status: 409 });
  }

  // Generate signed verification token
  const verificationToken = generateVerificationToken(email);

  console.info("[verify-otp] OTP verified successfully for", email);

  return NextResponse.json({
    success: true,
    token: verificationToken,
    email,
  });
}
