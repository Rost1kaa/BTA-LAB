export type LocaleCode = "ka" | "en";

type LocalizedRecord = Record<string, unknown>;

function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function arrayValue(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

export function getLocalizedText(
  record: LocalizedRecord,
  field: string,
  locale: LocaleCode,
  legacyField = field
): string {
  const primary = textValue(record[`${field}_${locale}`]);
  if (primary) return primary;

  const fallbackLocale: LocaleCode = locale === "ka" ? "en" : "ka";
  const fallback = textValue(record[`${field}_${fallbackLocale}`]);
  if (fallback) return fallback;

  return textValue(record[legacyField]);
}

export function getLocalizedArray(
  record: LocalizedRecord,
  field: string,
  locale: LocaleCode,
  legacyField = field
): string[] {
  const primary = arrayValue(record[`${field}_${locale}`]);
  if (primary.length > 0) return primary;

  const fallbackLocale: LocaleCode = locale === "ka" ? "en" : "ka";
  const fallback = arrayValue(record[`${field}_${fallbackLocale}`]);
  if (fallback.length > 0) return fallback;

  return arrayValue(record[legacyField]);
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
    const valueKa = textValue(item.value_ka);
    const valueEn = textValue(item.value_en) || textValue(item.content_value);
    grouped[section][key] = locale === "ka" ? valueKa : valueEn;
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
