import { NextResponse } from "next/server";
import { LOCALE_COOKIE, locales, type Locale } from "@/lib/locale";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const locale = body.locale as string;

    if (!locales.includes(locale as Locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const referer = request.headers.get("referer") || "/";
    const response = NextResponse.redirect(new URL(referer), 302);

    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 31536000, // 1 year
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
