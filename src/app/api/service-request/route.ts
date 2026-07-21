import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/logging";
import { getClientIpFromHeaders, verifySameOriginHeaders } from "@/lib/security/request";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getServerLocale } from "@/lib/locale";

const serviceRequestSchema = z.object({
  locale: z.enum(["ka", "en"]).optional().default("ka"),
  serviceId: z.string().trim().min(1).max(120),
  serviceName: z.string().trim().min(1).max(200),
  clientName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(1).max(60),
  businessType: z.string().trim().min(1).max(60),
  businessDescription: z.string().trim().min(1).max(3000),
  hasExistingWebsite: z.boolean(),
  websiteUrl: z.string().trim().max(500).default(""),
  deadline: z.string().trim().min(1).max(60),
  budget: z.string().trim().min(1).max(60),
  additionalInfo: z.string().trim().max(3000).default(""),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({}),
});

export async function POST(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);
  const route = new URL(request.url).pathname;

  if (!verifySameOriginHeaders(request.headers)) {
    logSecurityEvent({ event: "contact_rate_limited", route, ip, reason: "origin_mismatch" });
    return NextResponse.json({ error: "Request could not be accepted." }, { status: 403 });
  }

  const ipLimit = checkRateLimit("service-request-ip", ip, {
    limit: 5,
    windowMs: 10 * 60_000,
    blockMs: 30 * 60_000,
  });

  if (!ipLimit.allowed) {
    logSecurityEvent({ event: "contact_rate_limited", route, ip, reason: "ip_limit" });
    return NextResponse.json({ error: "Please wait before submitting again." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = serviceRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Check the form fields and try again." }, { status: 400 });
  }

  console.info(
    "[service-request]",
    JSON.stringify({
      timestamp: new Date().toISOString(),
      route,
      serviceId: parsed.data.serviceId,
      clientName: parsed.data.clientName,
      email: parsed.data.email,
      businessType: parsed.data.businessType,
    })
  );

  try {
    const supabase = createServiceRoleClient();

    const answersJsonb: Record<string, unknown> = {
      ...parsed.data.answers,
      additionalInfo: parsed.data.additionalInfo,
      businessDescription: parsed.data.businessDescription,
    };

    const { error } = await supabase.from("service_requests").insert({
      locale: parsed.data.locale,
      service_type: "website_creation",
      service_package: parsed.data.serviceId,
      service_name: parsed.data.serviceName,
      customer_name: parsed.data.clientName,
      customer_email: parsed.data.email,
      customer_phone: parsed.data.phone,
      client_name: parsed.data.clientName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      business_type: parsed.data.businessType,
      business_description: parsed.data.businessDescription,
      has_existing_website: parsed.data.hasExistingWebsite,
      website_url: parsed.data.websiteUrl,
      deadline: parsed.data.deadline,
      budget: parsed.data.budget,
      answers: answersJsonb,
      status: "new",
    } as never);

    if (error) {
      console.error("Service request insert failed:", error.message);
      return NextResponse.json({ error: "Invalid request." }, { status: 500 });
    }
  } catch (error) {
    console.error("Service request insert failed:", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Submission received successfully.",
  });
}
