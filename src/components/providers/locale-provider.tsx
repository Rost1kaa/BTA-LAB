"use client";

import { TranslationContext } from "@/lib/use-dictionary";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/locale";
import type { ReactNode } from "react";

interface TranslationProviderProps {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}

export function TranslationProvider({
  locale,
  dict,
  children,
}: TranslationProviderProps) {
  const t = (key: string): string => dict[key] ?? key.split(".").pop() ?? key;

  return (
    <TranslationContext.Provider value={{ locale, dict, t }}>
      {children}
    </TranslationContext.Provider>
  );
}
