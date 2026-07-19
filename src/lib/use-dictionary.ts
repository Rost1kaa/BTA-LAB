"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "./get-dictionary";
import type { Locale } from "./locale";

export interface TranslationContextValue {
  locale: Locale;
  dict: Dictionary;
  t: (key: string) => string;
}

export const TranslationContext = createContext<TranslationContextValue>({
  locale: "ka",
  dict: {},
  t: (key: string) => key.split(".").pop() ?? key,
});

/**
 * Hook that returns translation utilities.
 * Must be used within a TranslationProvider.
 */
export function useTranslation() {
  return useContext(TranslationContext);
}


