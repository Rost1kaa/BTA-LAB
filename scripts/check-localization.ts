import kaDict from "../src/locales/ka.json";
import enDict from "../src/locales/en.json";
import { getContentKeyOverrides } from "../src/lib/content-dictionary-keys";

const ka = kaDict as Record<string, string>;
const en = enDict as Record<string, string>;
const missing: string[] = [];

for (const [key, enValue] of Object.entries(en)) {
  const kaValue = ka[key]?.trim();

  if (enValue.trim() && !kaValue) {
    missing.push(key);
  }
}

for (const [cmsKey, dictionaryKey] of Object.entries(getContentKeyOverrides())) {
  if (!ka[dictionaryKey]?.trim()) {
    missing.push(`${cmsKey} -> ${dictionaryKey}`);
  }
}

if (missing.length > 0) {
  console.warn("[localization] Missing Georgian translations:");
  missing.forEach((key) => console.warn(`- ${key}`));
  process.exitCode = 1;
} else {
  console.log("[localization] Georgian translations complete.");
}
