// Content key definitions for each page/section
export const CONTENT_KEYS = {
  home: {
    hero: ["eyebrow", "heading", "description", "primaryCta", "secondaryCta"],
    featured: ["sectionTitle", "sectionDescription"],
    stats: ["teamMembers", "completedProjects", "services", "technologies"],
    cta: ["heading", "description", "buttonLabel", "learnMoreLabel"],
  },
  about: {
    hero: ["badge", "heading", "description"],
    mission: ["title", "description"],
    vision: ["title", "description"],
    values: ["badge", "heading", "description"],
    valuesItems: ["0_title", "0_description", "1_title", "1_description", "2_title", "2_description", "3_title", "3_description"],
    journey: ["badge", "heading"],
    timeline: ["0_title", "0_description", "1_title", "1_description", "2_title", "2_description", "3_title", "3_description", "4_title", "4_description"],
    cta: ["heading", "description", "getInTouch", "exploreServices"],
  },
  services: {
    hero: ["badge", "heading", "description"],
    addons: ["title", "description"],
    cta: ["heading", "description", "button"],
  },
  portfolio: {
    hero: ["badge", "heading", "description"],
    filters: ["all", "web", "ecommerce", "branding", "marketing", "uiux"],
    detail: ["back", "visitProject", "problem", "solution", "results", "technologies", "toolsStack", "related", "moreProjects", "viewDetails", "visit", "details", "noProjects", "allProjects"],
  },
  team: {
    hero: ["badge", "heading", "description"],
    join: ["heading", "description"],
  },
  contact: {
    hero: ["badge", "heading", "description"],
    info: ["email", "phone", "address"],
    form: ["name", "namePlaceholder", "email", "emailPlaceholder", "phone", "phonePlaceholder", "company", "companyPlaceholder", "service", "servicePlaceholder", "budget", "budgetPlaceholder", "message", "messagePlaceholder", "submit", "successTitle", "successDescription", "sendAnother", "budgetOptions_small", "budgetOptions_medium", "budgetOptions_large", "budgetOptions_enterprise"],
  },
  footer: {
    brand: ["description"],
    terms: ["about", "terms", "privacy"],
    contact: ["location", "availability"],
    copyright: ["text"],
  },
} as const;

export type ContentPage = keyof typeof CONTENT_KEYS;
export type ContentSection<T extends ContentPage> = keyof typeof CONTENT_KEYS[T];
export type ContentKey<T extends ContentPage, S extends ContentSection<T>> = 
  typeof CONTENT_KEYS[T][S] extends readonly string[] ? typeof CONTENT_KEYS[T][S][number] : never;

// Content entry as stored in DB
export interface ContentEntry {
  page: string;
  section: string;
  content_key: string;
  content_value: string;
  content_type: "text" | "textarea" | "number" | "url" | "image" | "rich_text" | "boolean" | "json";
}

// Content grouped by page/section for admin forms
export interface ContentGroup {
  page: string;
  section: string;
  label: string;
  entries: ContentEntry[];
}

// Revalidation helpers
export function getRevalidationPaths(type: "content" | "portfolio" | "team" | "services"): string[] {
  switch (type) {
    case "content":
      return ["/", "/about", "/services", "/portfolio", "/team", "/contact"];
    case "portfolio":
      return ["/", "/portfolio"];
    case "team":
      return ["/team"];
    case "services":
      return ["/services"];
  }
}
