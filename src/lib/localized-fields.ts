import kaDict from "@/locales/ka.json";
import enDict from "@/locales/en.json";
import { getContentDictionaryKey } from "@/lib/content-dictionary-keys";

export type LocaleCode = "ka" | "en";

type LocalizedRecord = Record<string, unknown>;
type Dictionary = Record<string, string>;

const dictionaries: Record<LocaleCode, Dictionary> = {
  ka: kaDict as Dictionary,
  en: enDict as Dictionary,
};

const GEORGIAN_RE = /[\u10A0-\u10FF]/;

function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function arrayValue(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function warnMissingKa(context: string, englishValue: string) {
  if (process.env.NODE_ENV !== "development" || !englishValue) return;
  console.warn(
    `[localization] Missing Georgian translation for ${context}; English value exists.`
  );
}

function resolveLocalizedText(
  localized: string,
  fallbackSameLanguage: string,
  englishValue: string,
  locale: LocaleCode,
  context: string
): string {
  if (locale === "ka") {
    if (localized) {
      if (
        fallbackSameLanguage &&
        GEORGIAN_RE.test(fallbackSameLanguage) &&
        !GEORGIAN_RE.test(localized)
      ) {
        warnMissingKa(context, englishValue || localized);
        return fallbackSameLanguage;
      }
      return localized;
    }

    if (fallbackSameLanguage && GEORGIAN_RE.test(fallbackSameLanguage)) {
      return fallbackSameLanguage;
    }

    warnMissingKa(context, englishValue || fallbackSameLanguage);
    return "";
  }

  return localized || fallbackSameLanguage || englishValue;
}

export function getLocalizedText(
  record: LocalizedRecord,
  field: string,
  locale: LocaleCode,
  legacyField = field
): string {
  const localized = textValue(record[`${field}_${locale}`]);
  const legacy = textValue(record[legacyField]);
  const englishValue = textValue(record[`${field}_en`]) || legacy;

  return resolveLocalizedText(
    localized,
    legacy,
    englishValue,
    locale,
    `${field}_${locale}`
  );
}

export function getLocalizedArray(
  record: LocalizedRecord,
  field: string,
  locale: LocaleCode,
  legacyField = field
): string[] {
  const primary = arrayValue(record[`${field}_${locale}`]);
  if (primary.length > 0) return primary;

  const legacy = arrayValue(record[legacyField]);
  const englishValue = arrayValue(record[`${field}_en`]);

  if (locale === "ka") {
    if (legacy.some((item) => GEORGIAN_RE.test(item))) return legacy;
    if (legacy.length > 0 || englishValue.length > 0) {
      warnMissingKa(`${field}_${locale}`, (englishValue[0] || legacy[0]) ?? "");
    }
    return [];
  }

  return englishValue.length > 0 ? englishValue : legacy;
}

export function localizeContentRows(
  rows: Array<Record<string, unknown>>,
  locale: LocaleCode
): Record<string, Record<string, string>> {
  const grouped: Record<string, Record<string, string>> = {};

  for (const item of rows) {
    const section = textValue(item.section);
    const key = textValue(item.content_key);
    if (!section || !key) continue;

    if (!grouped[section]) grouped[section] = {};
    const page = textValue(item.page);
    const dictionaryKey = getContentDictionaryKey(page, section, key);
    const dictionaryValue = textValue(dictionaries[locale][dictionaryKey]);
    const valueKa = textValue(item.content_value_ka);
    const valueEn = textValue(item.content_value_en);

    grouped[section][key] =
      locale === "ka"
        ? resolveLocalizedText(
            valueKa,
            dictionaryValue,
            valueEn,
            locale,
            `${page}.${section}.${key}`
          )
        : valueEn || dictionaryValue;
  }

  return grouped;
}

export function localizeSettingsRows(
  rows: Array<Record<string, unknown>>,
  locale: LocaleCode
): Record<string, string> {
  return Object.fromEntries(
    rows
      .map((item) => [
        textValue(item.setting_key),
        getLocalizedText(item, "value", locale, "setting_value"),
      ])
      .filter(([key]) => key.length > 0)
  );
}
