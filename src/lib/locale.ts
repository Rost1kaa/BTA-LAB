import "server-only";

import { cookies } from "next/headers";

export const DEFAULT_LOCALE = "ka";
export const LOCALE_COOKIE = "locale";

export const locales = ["ka", "en"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

/**
 * Read the locale from the cookie on the server.
 * Returns the default locale if no cookie is set or the cookie value is invalid.
 */
export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get(LOCALE_COOKIE);
    const value = localeCookie?.value;
    if (value && isLocale(value)) {
      return value;
    }
  } catch {
    // cookies() may throw during build/static generation
  }
  return DEFAULT_LOCALE;
}

/**
 * Set the locale cookie on the server via a Response.
 */
export function setLocaleCookie(locale: Locale): string {
  return `${LOCALE_COOKIE}=${locale}; Path=/; SameSite=Lax; Max-Age=31536000`;
}
