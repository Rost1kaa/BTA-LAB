import "server-only";

import type { Locale } from "./locale";

export type Dictionary = Record<string, string>;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ka: () => import("@/locales/ka.json").then((m) => m.default as Dictionary),
  en: () => import("@/locales/en.json").then((m) => m.default as Dictionary),
};

/**
 * Load the dictionary for the given locale on the server.
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

/**
 * Get a translated value from a dictionary.
 * Falls back to the key itself if not found.
 */
export function translate(dict: Dictionary, key: string): string {
  return dict[key] ?? key.split(".").pop() ?? key;
}

/**
 * Replace placeholders in a translated string.
 * E.g. translateWithVars(dict, "footer.copyright", { "%year%": "2024" })
 */
export function translateWithVars(
  dict: Dictionary,
  key: string,
  vars: Record<string, string>
): string {
  let value = translate(dict, key);
  for (const [placeholder, replacement] of Object.entries(vars)) {
    value = value.replaceAll(placeholder, replacement);
  }
  return value;
}
