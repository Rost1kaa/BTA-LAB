import { NextResponse } from "next/server";
import { LOCALE_COOKIE, locales, type Locale } from "@/lib/locale";
import { verifySameOriginHeaders } from "@/lib/security/request";

export async function POST(request: Request) {
  try {
    if (!verifySameOriginHeaders(request.headers)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 403 });
    }

    const body = await request.json();
    const locale = body.locale as string;

    if (!locales.includes(locale as Locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 31536000, // 1 year
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
