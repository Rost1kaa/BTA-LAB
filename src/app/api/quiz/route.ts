import { NextResponse } from "next/server";

const SUBMISSION_COOLDOWN_MS = 60_000; // 1 minute
const MAX_SUBMISSIONS_PER_IP = 5;
const MAX_SUBMISSIONS_PER_DAY = 20;

// In-memory rate limiting (use a proper store in production)
const ipMap = new Map<string, { count: number; lastReset: number }>();
const globalSubmissionTimes: number[] = [];

function checkRateLimit(ip: string): { allowed: boolean; reason?: string } {
  const now = Date.now();

  // Global daily limit
  const todayStart = now - 86_400_000;
  const recentGlobal = globalSubmissionTimes.filter((t) => t > todayStart);
  if (recentGlobal.length >= MAX_SUBMISSIONS_PER_DAY) {
    return { allowed: false, reason: "Daily submission limit reached" };
  }

  // Per-IP limit
  const ipData = ipMap.get(ip) || { count: 0, lastReset: now };
  if (now - ipData.lastReset > 86_400_000) {
    ipData.count = 0;
    ipData.lastReset = now;
  }
  if (ipData.count >= MAX_SUBMISSIONS_PER_IP) {
    return { allowed: false, reason: "Too many submissions from this IP" };
  }

  // Cooldown
  const lastSubmission = globalSubmissionTimes[globalSubmissionTimes.length - 1];
  if (lastSubmission && now - lastSubmission < SUBMISSION_COOLDOWN_MS) {
    return { allowed: false, reason: "Please wait before submitting again" };
  }

  return { allowed: true };
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    // Rate limit check
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.reason },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate honeypot (anti-spam)
    if (body.website?.length > 0) {
      // Honeypot filled — likely a bot
      return NextResponse.json({ success: true });
    }

    // Validate required fields
    if (!body.contact?.name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!body.contact?.email?.trim() && !body.contact?.phone?.trim()) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    // Normalize and validate email
    if (body.contact?.email) {
      const email = body.contact.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
      body.contact.email = email;
    }

    // Validate package
    if (body.package && body.package !== "custom-website") {
      return NextResponse.json(
        { error: "Invalid package" },
        { status: 400 }
      );
    }

    // Sanitize all string inputs
    const sanitize = (str: string): string =>
      str.replace(/<[^>]*>/g, "").trim();

    const sanitizedBody = {
      package: body.package,
      locale: body.locale || "ka",
      submittedAt: body.submittedAt || new Date().toISOString(),
      answers: body.answers || {},
      customInputs: body.customInputs || {},
      contact: {
        name: sanitize(body.contact.name || ""),
        company: sanitize(body.contact.company || ""),
        phone: sanitize(body.contact.phone || ""),
        email: sanitize(body.contact.email || ""),
        preferredContact: sanitize(body.contact.preferredContact || ""),
        additionalInfo: sanitize(body.contact.additionalInfo || ""),
      },
    };

    // In production, save to database or send email
    // For now, log the structured data
    console.log("[Quiz Submission]", JSON.stringify(sanitizedBody, null, 2));

    // Update rate limiting
    ipMap.set(ip, {
      count: (ipMap.get(ip)?.count || 0) + 1,
      lastReset: ipMap.get(ip)?.lastReset || Date.now(),
    });
    globalSubmissionTimes.push(Date.now());

    return NextResponse.json({
      success: true,
      message: "Submission received successfully",
    });
  } catch (error) {
    console.error("[Quiz API Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
