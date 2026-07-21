import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyTurnstileToken } from "@/lib/security/captcha";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/logging";
import { getClientIpFromHeaders, verifySameOriginHeaders } from "@/lib/security/request";
import { getDictionary, translate } from "@/lib/get-dictionary";
import { getServerLocale, type Locale } from "@/lib/locale";
import { createServiceRoleClient } from "@/lib/supabase/server";

const contactSchema = z.object({
  locale: z.enum(["ka", "en"]).optional().default("ka"),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(60).optional().default(""),
  company: z.string().trim().max(160).optional().default(""),
  service: z.string().trim().max(120).optional().default(""),
  budget: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().min(1).max(3000),
  website: z.string().max(0).optional().default(""),
  turnstileToken: z.string().optional().default(""),
});

export async function POST(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);
  const route = new URL(request.url).pathname;
  const serverLocale = await getServerLocale();
  let dict = await getDictionary(serverLocale);
  const message = (key: string) => translate(dict, key);

  if (!verifySameOriginHeaders(request.headers)) {
    logSecurityEvent({ event: "contact_rate_limited", route, ip, reason: "origin_mismatch" });
    return NextResponse.json({ error: message("api.errors.originRejected") }, { status: 403 });
  }

  const ipLimit = checkRateLimit("contact-ip", ip, {
    limit: 5,
    windowMs: 10 * 60_000,
    blockMs: 30 * 60_000,
  });

  if (!ipLimit.allowed) {
    logSecurityEvent({ event: "contact_rate_limited", route, ip, reason: "ip_limit" });
    return NextResponse.json({ error: message("api.errors.rateLimited") }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: message("api.errors.invalidRequest") }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
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

  const emailLimit = checkRateLimit("contact-email", parsed.data.email.toLowerCase(), {
    limit: 3,
    windowMs: 10 * 60_000,
    blockMs: 30 * 60_000,
  });

  if (!emailLimit.allowed) {
    logSecurityEvent({
      event: "contact_rate_limited",
      route,
      ip,
      email: parsed.data.email,
      reason: "email_limit",
    });
    return NextResponse.json({ error: message("api.errors.rateLimited") }, { status: 429 });
  }

  const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
  if (!captcha.ok) {
    logSecurityEvent({
      event: "captcha_failed",
      route,
      ip,
      email: parsed.data.email,
      reason: "contact",
    });
    return NextResponse.json({ error: message("api.errors.captchaFailed") }, { status: 400 });
  }

  console.info(
    "[contact]",
    JSON.stringify({
      timestamp: new Date().toISOString(),
      route,
      emailDomain: parsed.data.email.split("@")[1],
      hasPhone: Boolean(parsed.data.phone),
      hasCompany: Boolean(parsed.data.company),
      service: parsed.data.service || undefined,
      budget: parsed.data.budget || undefined,
    })
  );

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("contact_messages").insert({
      locale: parsed.data.locale,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      company: parsed.data.company,
      service: parsed.data.service,
      budget: parsed.data.budget,
      message: parsed.data.message,
      status: "new",
    } as never);

    if (error) {
      console.error("Contact message insert failed:", error.message);
      return NextResponse.json({ error: message("api.errors.invalidRequest") }, { status: 500 });
    }
  } catch (error) {
    console.error("Contact message insert failed:", error);
    return NextResponse.json({ error: message("api.errors.invalidRequest") }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
