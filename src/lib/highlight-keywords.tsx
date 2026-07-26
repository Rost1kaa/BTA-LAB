import type { ReactNode } from "react";

/**
 * Known technical/service keywords to highlight in feature lists.
 * Covers both English and Georgian terms used across BTA LAB service packages.
 */
const KEYWORDS_TO_HIGHLIGHT = [
  "SEO ოპტიმიზაცია",
  "API ინტეგრაციები",
  "CMS",
  "Google Analytics",
  "Google Maps",
  "Google Business",
  "Meta Pixel",
  "ონლაინ გადახდის ინტეგრაცია",
  "ადაპტირებული დიზაინი",
  "CRM ინტეგრაცია",
  "AI ინტეგრაცია",
  "რეკლამის ოპტიმიზაცია",
  "A/B Testing",
  "Remarketing",
  "Conversion Tracking",
  "SEO",
  "API",
  "AI",
  "CRM",
] as const;

/**
 * Sort keywords by length (descending) so longer compound phrases
 * are matched before their shorter substrings.
 */
const SORTED_KEYWORDS = [...KEYWORDS_TO_HIGHLIGHT].sort(
  (a, b) => b.length - a.length,
);

/**
 * Build regex once. Each keyword is escaped for safe regex injection.
 */
const KEYWORD_PATTERN = new RegExp(
  `(${SORTED_KEYWORDS.map((kw) =>
    kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ).join("|")})`,
  "gi",
);

/**
 * Wraps known technical/service keywords in `<strong>` tags for visual emphasis.
 *
 * Dynamically scans the feature text, finds matching keywords (case-insensitive),
 * and wraps them in strong elements. Longer compound matches take priority over
 * shorter sub-matches due to pre-sorting.
 *
 * @example
 * highlightKeywords("SEO optimization") → <strong>SEO</strong> optimization
 * highlightKeywords("SEO ოპტიმიზაცია") → <strong>SEO ოპტიმიზაცია</strong>
 */
export function highlightKeywords(text: string): ReactNode {
  if (!text) return text;

  const parts = text.split(KEYWORD_PATTERN);

  // No keywords found — return plain text
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    const match = SORTED_KEYWORDS.find(
      (kw) => kw.toLowerCase() === part.toLowerCase(),
    );
    if (match) {
      return <strong key={i}>{part}</strong>;
    }
    return part;
  });
}
