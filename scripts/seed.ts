/**
 * BTA LAB CMS — Database Seed Script
 *
 * Seeds initial CMS content into a clean Supabase project.
 * Safe to run multiple times — uses upserts with stable conflict keys.
 *
 * Usage:
 *   npm run seed
 *
 * Required environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_EMAIL
 *   ADMIN_DISPLAY_NAME
 *
 * Required when creating a new Auth user:
 *   ADMIN_PASSWORD       — Must be at least 12 characters and include mixed character types
 */

import { config } from "dotenv";
import { createHash } from "node:crypto";
import kaDict from "../src/locales/ka.json";
import enDict from "../src/locales/en.json";
import { getServicePackageKaLocalization } from "../src/data/service-package-localizations";
import { getContentDictionaryKey } from "../src/lib/content-dictionary-keys";
import { getTeamMemberKaLocalization } from "../src/data/team-localizations";
import {
  createSupabaseAdminClient,
  getAdminCredentialsFromEnv,
  syncAdminAccount,
} from "./admin-bootstrap";

// ── Load .env from project root ────────────────────────────────────────

console.log("Loading environment from .env");

const envResult = config({ path: ".env" });

if (envResult.error) {
  console.error("\n❌ Failed to load .env:", envResult.error.message);
  console.error("   Create .env in the project root with the required variables.");
  process.exit(1);
}

// ── Environment validation ──────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_DISPLAY_NAME = process.env.ADMIN_DISPLAY_NAME;

const errors: string[] = [];
if (!SUPABASE_URL) errors.push("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!SERVICE_ROLE_KEY) errors.push("Missing SUPABASE_SERVICE_ROLE_KEY");
if (!ADMIN_EMAIL) errors.push("Missing ADMIN_EMAIL");
if (!ADMIN_PASSWORD) errors.push("Missing ADMIN_PASSWORD");
if (!ADMIN_DISPLAY_NAME) errors.push("Missing ADMIN_DISPLAY_NAME");

if (errors.length > 0) {
  console.error("\n❌ Environment validation failed:\n");
  for (const err of errors) {
    console.error(`   ${err}`);
  }
  console.error(
    "\n   Create .env in the project root with all required variables.\n"
  );
  process.exit(1);
}

// ── Helpers ─────────────────────────────────────────────────────────────

function deterministicId(seed: string): string {
  const hash = createHash("sha256").update(seed).digest("hex");
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    "4" + hash.substring(13, 16),
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) +
      hash.substring(18, 20),
    hash.substring(20, 32),
  ].join("-");
}

const KA_DICT = kaDict as Record<string, string>;
const EN_DICT = enDict as Record<string, string>;
const GEORGIAN_RE = /[\u10A0-\u10FF]/;

const languageNeutralContentKeys = new Set([
  "contact.form.phonePlaceholder",
]);

const languageNeutralLabels = new Set(["UI/UX"]);

const requiredTables = [
  "admin_profiles",
  "site_content",
  "site_settings",
  "service_packages",
  "portfolio_categories",
  "portfolio_projects",
  "team_members",
  "contact_messages",
  "service_requests",
  "service_feature_tooltips",
  "legal_policies",
] as const;

const categoryLabelsKa: Record<string, string> = {
  Web: "ვებ",
  "E-commerce": "ონლაინ მაღაზია",
  Branding: "ბრენდინგი",
  Marketing: "მარკეტინგი",
  "UI/UX": "UI/UX",
};

const settingsKa: Record<string, string> = {
  site_description: "თანამედროვე ვებგვერდები და ციფრული გადაწყვეტები თქვენი ბიზნესის ზრდისთვის",
  contact_address: "თბილისი, წერონისის 208",
  contact_location: "თბილისი, წერონისის 208",
  site_footer_description: "ციფრული ლაბორატორია, სადაც სტუდენტური იდეები ინდუსტრიის რეალურ გადაწყვეტილებებად იქცევა.",
};

function contentDictionaryKey(entry: SiteContentSeed): string {
  return getContentDictionaryKey(entry.page, entry.section, entry.content_key);
}

function withBilingualSetting(setting: SiteSettingSeed) {
  return {
    ...setting,
    value_ka: settingsKa[setting.setting_key] || setting.setting_value,
    value_en: setting.setting_value,
  };
}

function withBilingualContent(entry: SiteContentSeed) {
  const key = contentDictionaryKey(entry);
  const kaValue = KA_DICT[key]?.trim();
  const enValue = (EN_DICT[key] || entry.content_value_en).trim();
  const isNeutral = languageNeutralContentKeys.has(key);

  if (!kaValue) {
    throw new Error(`Missing Georgian CMS seed value for ${key}`);
  }

  if (!isNeutral && kaValue === enValue) {
    throw new Error(`Georgian CMS seed value matches English for ${key}`);
  }

  if (!isNeutral && /[A-Za-z]{3,}/.test(kaValue) && !GEORGIAN_RE.test(kaValue)) {
    throw new Error(`Georgian CMS seed value is not translated for ${key}`);
  }

  return {
    page: entry.page,
    section: entry.section,
    content_key: entry.content_key,
    content_value_ka: kaValue,
    content_value_en: enValue,
    content_type: entry.content_type,
    sort_order: entry.sort_order,
  };
}

function withBilingualCategory(category: PortfolioCategorySeed) {
  const nameKa = categoryLabelsKa[category.name];
  if (!nameKa && !languageNeutralLabels.has(category.name)) {
    throw new Error(`Missing Georgian portfolio category label for ${category.name}`);
  }

  return {
    ...category,
    name_ka: nameKa || category.name,
    name_en: category.name,
  };
}

function inferPriceSuffixEn(hasKaSuffix: boolean) {
  if (!hasKaSuffix) return "";
  return " From";
}

async function assertSchemaReady(): Promise<void> {
  const missingTables: string[] = [];

  for (const table of requiredTables) {
    const { error } = await supabase
      .from(table)
      .select("id")
      .limit(1);

    if (error?.message.includes("Could not find the table")) {
      missingTables.push(table);
    } else if (error) {
      throw new Error(`Schema check failed for ${table}: ${error.message}`);
    }
  }

  if (missingTables.length > 0) {
    throw new Error(
      "Supabase schema is not ready. Missing tables: " +
        missingTables.join(", ") +
        ". Apply supabase/migrations/001_initial_schema.sql and supabase/migrations/002_legal_policies.sql to the project, then run npm run seed again."
    );
  }
}

function withBilingualProject(project: PortfolioProjectSeed) {
  const qeyKa = project.slug === "qey-ge"
    ? {
        title_ka: "qey.ge",
        description_ka: "თანამედროვე ონლაინ მაღაზიის პლატფორმა საქართველოს ბაზრისთვის, სწრაფი გადახდითა და მარაგების რეალურ დროში მართვით.",
        full_description_ka: "qey.ge არის სრული ონლაინ მაღაზიის გადაწყვეტა საქართველოს ბაზრისთვის. პლატფორმა აერთიანებს თანამედროვე ადაპტირებულ დიზაინს, მობილურ შოპინგზე აქცენტს, სწრაფ ჩატვირთვას და მარტივ გადახდის პროცესს.",
        problem_ka: "ბაზარზე არ იყო საკმარისად სწრაფი, თანამედროვე და მომხმარებელზე ორიენტირებული ონლაინ მაღაზიის პლატფორმა, რომელიც ადგილობრივ საჭიროებებს მოერგებოდა.",
        solution_ka: "ავაშენეთ პერსონალური ონლაინ მაღაზიის პლატფორმა წარმადობაზე, მობილურ გამოცდილებასა და ადგილობრივ მოთხოვნებზე ფოკუსით.",
        results_ka: [
          "გვერდები იტვირთება 60%-ით სწრაფად",
          "კალათის მიტოვება შემცირდა 35%-ით",
          "ჩაერთო 200-ზე მეტი მერჩანტი",
          "მომხმარებელთა საშუალო შეფასება 4.8/5",
        ],
        alt_text_ka: "qey.ge ვებგვერდის სრული პრევიუ",
        seo_title_ka: "qey.ge ონლაინ მაღაზიის პლატფორმა",
        seo_description_ka: "თანამედროვე ონლაინ მაღაზიის პლატფორმა საქართველოს ბაზრისთვის.",
      }
    : {};

  if (!qeyKa.title_ka) {
    throw new Error(`Missing Georgian portfolio project localization for ${project.slug}`);
  }

  return {
    ...project,
    title_ka: qeyKa.title_ka,
    title_en: project.title,
    category_label_ka: categoryLabelsKa[project.category] || project.category,
    category_label_en: project.category,
    description_ka: qeyKa.description_ka,
    description_en: project.description,
    full_description_ka: qeyKa.full_description_ka,
    full_description_en: project.full_description,
    problem_ka: qeyKa.problem_ka,
    problem_en: project.problem,
    solution_ka: qeyKa.solution_ka,
    solution_en: project.solution,
    results_ka: qeyKa.results_ka,
    results_en: project.results,
    alt_text_ka: qeyKa.alt_text_ka,
    alt_text_en: project.alt_text,
    seo_title_ka: qeyKa.seo_title_ka,
    seo_title_en: project.seo_title,
    seo_description_ka: qeyKa.seo_description_ka,
    seo_description_en: project.seo_description,
  };
}

function withBilingualServicePackage(pkg: ServicePackageSeed) {
  const ka = getServicePackageKaLocalization(pkg.section, pkg.name);
  if (!ka) {
    throw new Error(`Missing Georgian service package localization for ${pkg.section}/${pkg.name}`);
  }

  const ctaKa: Record<string, string> = {
    "Choose Package": "პაკეტის არჩევა",
    "Choose Service": "სერვისის არჩევა",
    "Choose Add-on": "სერვისის არჩევა",
    "Plan Your Project": "პროექტის დაგეგმვა",
    "Get Consultation": "კონსულტაციის მიღება",
  };
  return {
    ...pkg,
    category: pkg.section,
    name_ka: ka.name,
    name_en: pkg.name,
    price_suffix_ka: ka.priceSuffix || "",
    price_suffix_en: inferPriceSuffixEn(!!ka.priceSuffix),
    custom_price_label_ka: pkg.custom_price ? ka.customPriceLabel || ka.price || "ინდივიდუალური" : "",
    custom_price_label_en: pkg.custom_price ? "Custom" : "",
    billing_label_ka: ka.billingLabel ?? "",
    billing_label_en: pkg.billing_label === "One-time" ? "One-time" : pkg.billing_label === "თვეში" ? "Monthly" : "",
    description_ka: ka.description ?? "",
    description_en: pkg.description || "",
    ideal_for_ka: ka.idealFor ?? "",
    ideal_for_en: pkg.ideal_for || "",
    features_ka: ka.features,
    features_en: pkg.features,
    delivery_time_ka: ka.deliveryTime ?? "",
    delivery_time_en: pkg.delivery_time || "",
    cta_ka: ka.cta || ctaKa[pkg.cta] || "",
    cta_en: pkg.cta,
    cta_label_ka: ka.cta || ctaKa[pkg.cta] || "",
    cta_label_en: pkg.cta,
    price_explanation_ka: ka.priceExplanation ?? "",
    price_explanation_en: pkg.price_explanation || "",
    active: pkg.published,
  };
}

function withBilingualTeamMember(member: TeamMemberSeed) {
  const ka = getTeamMemberKaLocalization(member.name);
  if (!ka) {
    throw new Error(`Missing Georgian team member localization for ${member.name}`);
  }

  return {
    ...member,
    name_ka: member.name,
    name_en: member.name_en || member.name,
    position_ka: ka.position,
    position_en: member.position_en || member.position,
    bio_ka: ka.bio,
    bio_en: member.bio_en || member.bio,
    image_alt_ka: `${member.name} პორტრეტი`,
    image_alt_en: `${member.name_en || member.name} portrait`,
  };
}

// ── Supabase client (service role — never expose to client) ─────────────

const supabase = createSupabaseAdminClient();

// ── Seed data ───────────────────────────────────────────────────────────

// ── Site Settings ───────────────────────────────────────────────────────

interface SiteSettingSeed {
  setting_key: string;
  setting_value: string;
  setting_type: "text" | "textarea" | "url" | "image" | "boolean" | "json";
}

const siteSettings: SiteSettingSeed[] = [
  { setting_key: "site_name", setting_value: "BTA LAB", setting_type: "text" },
  {
    setting_key: "site_description",
    setting_value:
      "A digital lab where we create modern websites, online stores, and digital solutions for business growth.",
    setting_type: "textarea",
  },
  {
    setting_key: "contact_phone",
    setting_value: "+995 579 009 247",
    setting_type: "text",
  },
  {
    setting_key: "contact_location",
    setting_value: "Tbilisi, Tseronisi 208",
    setting_type: "text",
  },
  {
    setting_key: "contact_address",
    setting_value: "თბილისი, წერონისის 208",
    setting_type: "text",
  },
  {
    setting_key: "social_facebook",
    setting_value: "https://www.facebook.com/bta.lab.official",
    setting_type: "url",
  },
  {
    setting_key: "social_instagram",
    setting_value: "https://www.instagram.com/bta.lab.official",
    setting_type: "url",
  },
  {
    setting_key: "social_tiktok",
    setting_value: "https://www.tiktok.com/@bta.lab.official",
    setting_type: "url",
  },
  {
    setting_key: "site_footer_description",
    setting_value:
      "A digital lab where student ideas become real industry solutions.",
    setting_type: "textarea",
  },
  {
    setting_key: "stat_completed_projects",
    setting_value: "48",
    setting_type: "text",
  },
  {
    setting_key: "stat_technologies",
    setting_value: "20",
    setting_type: "text",
  },
];

// ── Site Content ────────────────────────────────────────────────────────

interface SiteContentSeed {
  page: string;
  section: string;
  content_key: string;
  content_value_en: string;
  content_type:
    | "text"
    | "textarea"
    | "number"
    | "url"
    | "image"
    | "rich_text"
    | "boolean"
    | "json";
  sort_order: number;
}

const siteContent: SiteContentSeed[] = [
  // ── Home / Hero ──
  {
    page: "home",
    section: "hero",
    content_key: "eyebrow",
    content_value_en: "BTA LAB — Digital Innovation Lab",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "home",
    section: "hero",
    content_key: "heading",
    content_value_en: "We help small businesses grow.",
    content_type: "text",
    sort_order: 1,
  },
  {
    page: "home",
    section: "hero",
    content_key: "description",
    content_value_en:
      "We create modern websites, online stores, and digital experiences that help businesses achieve real results.",
    content_type: "textarea",
    sort_order: 2,
  },
  {
    page: "home",
    section: "hero",
    content_key: "primaryCta",
    content_value_en: "View Our Work",
    content_type: "text",
    sort_order: 3,
  },
  {
    page: "home",
    section: "hero",
    content_key: "secondaryCta",
    content_value_en: "Meet the Team",
    content_type: "text",
    sort_order: 4,
  },

  // ── Home / Featured ──
  {
    page: "home",
    section: "featured",
    content_key: "sectionTitle",
    content_value_en: "Featured Projects",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "home",
    section: "featured",
    content_key: "sectionDescription",
    content_value_en:
      "Real projects built by real students — see what we've created.",
    content_type: "textarea",
    sort_order: 1,
  },

  // ── Home / CTA ──
  {
    page: "home",
    section: "cta",
    content_key: "heading",
    content_value_en: "Ready to Start Your Project?",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "home",
    section: "cta",
    content_key: "description",
    content_value_en:
      "Let's discuss your ideas and turn them into a stunning digital experience.",
    content_type: "textarea",
    sort_order: 1,
  },
  {
    page: "home",
    section: "cta",
    content_key: "buttonLabel",
    content_value_en: "Start a Project",
    content_type: "text",
    sort_order: 2,
  },
  {
    page: "home",
    section: "cta",
    content_key: "learnMoreLabel",
    content_value_en: "Learn More",
    content_type: "text",
    sort_order: 3,
  },

  // ── About / Hero ──
  {
    page: "about",
    section: "hero",
    content_key: "badge",
    content_value_en: "About Us",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "about",
    section: "hero",
    content_key: "heading",
    content_value_en: "We're Building the Future of Digital Innovation",
    content_type: "text",
    sort_order: 1,
  },
  {
    page: "about",
    section: "hero",
    content_key: "description",
    content_value_en:
      "BTA LAB is a digital innovation lab and student-powered agency. We create real-world digital products while empowering the next generation of designers, developers, and marketers with hands-on experience.",
    content_type: "textarea",
    sort_order: 2,
  },

  // ── About / Mission ──
  {
    page: "about",
    section: "mission",
    content_key: "title",
    content_value_en: "Our Mission",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "about",
    section: "mission",
    content_key: "description",
    content_value_en:
      "To provide students with real-world experience through hands-on client projects, bridging the gap between academic knowledge and professional practice while delivering exceptional digital solutions.",
    content_type: "textarea",
    sort_order: 1,
  },

  // ── About / Vision ──
  {
    page: "about",
    section: "vision",
    content_key: "title",
    content_value_en: "Our Vision",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "about",
    section: "vision",
    content_key: "description",
    content_value_en:
      "To become a leading digital innovation lab that sets the standard for student-powered agencies, creating a future where education and industry work seamlessly together.",
    content_type: "textarea",
    sort_order: 1,
  },

  // ── About / CTA ──
  {
    page: "about",
    section: "cta",
    content_key: "heading",
    content_value_en: "Want to Be Part of Our Story?",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "about",
    section: "cta",
    content_key: "description",
    content_value_en:
      "Whether you're a potential client or a student looking to join the team, we'd love to connect.",
    content_type: "textarea",
    sort_order: 1,
  },
  {
    page: "about",
    section: "cta",
    content_key: "getInTouch",
    content_value_en: "Get in Touch",
    content_type: "text",
    sort_order: 2,
  },
  {
    page: "about",
    section: "cta",
    content_key: "exploreServices",
    content_value_en: "Explore Services",
    content_type: "text",
    sort_order: 3,
  },

  // ── Services / Hero ──
  {
    page: "services",
    section: "hero",
    content_key: "badge",
    content_value_en: "What We Do",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "services",
    section: "hero",
    content_key: "heading",
    content_value_en: "Comprehensive Digital Services",
    content_type: "text",
    sort_order: 1,
  },
  {
    page: "services",
    section: "hero",
    content_key: "description",
    content_value_en:
      "From strategy to execution, we offer end-to-end digital services that help businesses establish their presence, engage their audience, and achieve measurable results.",
    content_type: "textarea",
    sort_order: 2,
  },

  // ── Services / CTA ──
  {
    page: "services",
    section: "cta",
    content_key: "heading",
    content_value_en: "Not Sure Which Service You Need?",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "services",
    section: "cta",
    content_key: "description",
    content_value_en:
      "We'll help you figure it out. Schedule a free consultation and we'll guide you toward the right solution.",
    content_type: "textarea",
    sort_order: 1,
  },
  {
    page: "services",
    section: "cta",
    content_key: "button",
    content_value_en: "Book a Consultation",
    content_type: "text",
    sort_order: 2,
  },

  // ── Services / Addons ──
  {
    page: "services",
    section: "addons",
    content_key: "title",
    content_value_en: "Additional Services",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "services",
    section: "addons",
    content_key: "description",
    content_value_en:
      "Services to help you rank better on Google and start working with a technically sound setup.",
    content_type: "textarea",
    sort_order: 1,
  },

  // ── Portfolio / Hero ──
  {
    page: "portfolio",
    section: "hero",
    content_key: "badge",
    content_value_en: "Our Work",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "portfolio",
    section: "hero",
    content_key: "heading",
    content_value_en: "Selected Projects",
    content_type: "text",
    sort_order: 1,
  },
  {
    page: "portfolio",
    section: "hero",
    content_key: "description",
    content_value_en:
      "A curated selection of projects that showcase our expertise across web development, e-commerce, branding, marketing, and UI/UX design.",
    content_type: "textarea",
    sort_order: 2,
  },

  // ── Team / Hero ──
  {
    page: "team",
    section: "hero",
    content_key: "badge",
    content_value_en: "Our Team",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "team",
    section: "hero",
    content_key: "heading",
    content_value_en: "Meet the Team",
    content_type: "text",
    sort_order: 1,
  },
  {
    page: "team",
    section: "hero",
    content_key: "description",
    content_value_en:
      "A diverse group of talented students, designers, developers, and marketers working together to bring ideas to life.",
    content_type: "textarea",
    sort_order: 2,
  },

  // ── Team / Join ──
  {
    page: "team",
    section: "join",
    content_key: "heading",
    content_value_en: "Want to Join the Team?",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "team",
    section: "join",
    content_key: "description",
    content_value_en:
      "We're always looking for talented individuals who are passionate about digital creation. If that sounds like you, we'd love to hear from you.",
    content_type: "textarea",
    sort_order: 1,
  },

  // ── Contact / Hero ──
  {
    page: "contact",
    section: "hero",
    content_key: "badge",
    content_value_en: "Contact",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "contact",
    section: "hero",
    content_key: "heading",
    content_value_en: "Let's Create Something Together",
    content_type: "text",
    sort_order: 1,
  },
  {
    page: "contact",
    section: "hero",
    content_key: "description",
    content_value_en:
      "Have a project in mind? We'd love to hear about it. Tell us about your vision and we'll get back to you within 24 hours.",
    content_type: "textarea",
    sort_order: 2,
  },

  // ── Contact / Form ──
  {
    page: "contact",
    section: "form",
    content_key: "name",
    content_value_en: "Full Name",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "contact",
    section: "form",
    content_key: "namePlaceholder",
    content_value_en: "Your name",
    content_type: "text",
    sort_order: 1,
  },
  {
    page: "contact",
    section: "form",
    content_key: "email",
    content_value_en: "Email",
    content_type: "text",
    sort_order: 2,
  },
  {
    page: "contact",
    section: "form",
    content_key: "emailPlaceholder",
    content_value_en: "your@email.com",
    content_type: "text",
    sort_order: 3,
  },
  {
    page: "contact",
    section: "form",
    content_key: "phone",
    content_value_en: "Phone",
    content_type: "text",
    sort_order: 4,
  },
  {
    page: "contact",
    section: "form",
    content_key: "phonePlaceholder",
    content_value_en: "+995 579 009 247",
    content_type: "text",
    sort_order: 5,
  },
  {
    page: "contact",
    section: "form",
    content_key: "company",
    content_value_en: "Company",
    content_type: "text",
    sort_order: 6,
  },
  {
    page: "contact",
    section: "form",
    content_key: "companyPlaceholder",
    content_value_en: "Company name",
    content_type: "text",
    sort_order: 7,
  },
  {
    page: "contact",
    section: "form",
    content_key: "message",
    content_value_en: "Message",
    content_type: "text",
    sort_order: 12,
  },
  {
    page: "contact",
    section: "form",
    content_key: "messagePlaceholder",
    content_value_en: "Tell us about your project...",
    content_type: "text",
    sort_order: 13,
  },
  {
    page: "contact",
    section: "form",
    content_key: "submit",
    content_value_en: "Send Message",
    content_type: "text",
    sort_order: 14,
  },
  {
    page: "contact",
    section: "form",
    content_key: "successTitle",
    content_value_en: "Message Sent!",
    content_type: "text",
    sort_order: 15,
  },
  {
    page: "contact",
    section: "form",
    content_key: "successDescription",
    content_value_en: "Thank you for reaching out. We'll get back to you within 24 hours.",
    content_type: "textarea",
    sort_order: 16,
  },
  {
    page: "contact",
    section: "form",
    content_key: "sendAnother",
    content_value_en: "Send Another Message",
    content_type: "text",
    sort_order: 17,
  },
];

// ── Portfolio Categories ────────────────────────────────────────────────

interface PortfolioCategorySeed {
  name: string;
  slug: string;
  sort_order: number;
}

const portfolioCategories: PortfolioCategorySeed[] = [
  { name: "Web", slug: "web", sort_order: 0 },
  { name: "E-commerce", slug: "ecommerce", sort_order: 1 },
  { name: "Branding", slug: "branding", sort_order: 2 },
  { name: "Marketing", slug: "marketing", sort_order: 3 },
  { name: "UI/UX", slug: "uiux", sort_order: 4 },
];

// ── Portfolio Projects ──────────────────────────────────────────────────

interface PortfolioProjectSeed {
  title: string;
  slug: string;
  category: string;
  description: string;
  full_description: string;
  problem: string;
  solution: string;
  results: string[];
  technologies: string[];
  cover_image: string;
  gallery: string[];
  link: string;
  featured: boolean;
  published: boolean;
  display_order: number;
  alt_text: string;
  seo_title: string;
  seo_description: string;
}

const portfolioProjects: PortfolioProjectSeed[] = [
  {
    title: "qey.ge",
    slug: "qey-ge",
    category: "E-commerce",
    description:
      "A modern e-commerce platform with seamless checkout, real-time inventory management, and an intuitive admin dashboard.",
    full_description:
      "qey.ge is a comprehensive e-commerce solution built for the Georgian market. The platform features a modern, responsive design with a focus on mobile shopping, fast load times, and a frictionless checkout experience. The admin panel provides real-time analytics, inventory tracking, and order management.",
    problem:
      "The existing e-commerce landscape lacked a modern, fast, and user-friendly platform tailored to local market needs. Businesses struggled with outdated systems that offered poor mobile experiences and limited features.",
    solution:
      "We built a custom e-commerce platform from the ground up, focusing on performance, mobile-first design, and local market requirements. The platform includes advanced search, filtering, and a streamlined checkout process that reduced cart abandonment significantly.",
    results: [
      "60% faster page load times",
      "35% reduction in cart abandonment",
      "200+ merchants onboarded",
      "4.8/5 average user rating",
    ],
    technologies: ["Next.js", "Node.js", "PostgreSQL", "Redis", "Stripe", "Docker"],
    cover_image: "/images/qey_ge.webp",
    gallery: [],
    link: "https://qey.ge",
    featured: true,
    published: true,
    display_order: 0,
    alt_text: "qey.ge e-commerce platform full website preview",
    seo_title: "qey.ge — E-commerce Platform Case Study | BTA LAB",
    seo_description:
      "A modern e-commerce platform built for the Georgian market with Next.js, featuring seamless checkout and real-time inventory management.",
  },
];

// ── Service Packages ────────────────────────────────────────────────────

interface ServicePackageSeed {
  section: string;
  name: string;
  price: string;
  billing_label: string | null;
  description: string | null;
  ideal_for: string | null;
  features: string[];
  delivery_time: string | null;
  cta: string;
  highlighted: boolean;
  custom_price: boolean;
  price_explanation: string | null;
  icon_name: string | null;
  display_order: number;
  published: boolean;
}

const servicePackages: ServicePackageSeed[] = [
  // ── Website Development ──
  {
    section: "website",
    name: "Landing Starter",
    price: "199",
    billing_label: "One-time",
    description: null,
    ideal_for: "For small businesses, new services, or showcasing a specific offer.",
    features: [
      "Simple Landing Page",
      "One main offer or service",
      "Business short description",
      "Contact information",
      "Contact button",
      "Responsive design",
      "Basic SEO optimization",
      "7-day technical support",
    ],
    delivery_time: "1–3 business days",
    cta: "Choose Package",
    highlighted: false,
    custom_price: false,
    price_explanation: null,
    icon_name: "Rocket",
    display_order: 0,
    published: true,
  },
  {
    section: "website",
    name: "One Page Website",
    price: "300",
    billing_label: "One-time",
    description: null,
    ideal_for:
      "For small businesses, personal brands, service providers, and companies wanting a complete single-page website.",
    features: [
      "Full single-page website",
      "Required sections on one page",
      "Company or brand information",
      "Services or products showcase",
      "Portfolio section",
      "Pricing section",
      "FAQ section",
      "Contact form",
      "Google Maps integration",
      "Social media links",
      "Responsive design",
      "Basic SEO optimization",
      "7-day technical support",
    ],
    delivery_time: "2–5 business days",
    cta: "Choose Package",
    highlighted: false,
    custom_price: false,
    price_explanation: null,
    icon_name: "Globe",
    display_order: 1,
    published: true,
  },
  {
    section: "website",
    name: "Business Website",
    price: "799",
    billing_label: "One-time",
    description: null,
    ideal_for: "For companies and growing businesses.",
    features: [
      "2–4 individual pages",
      "Custom design",
      "Admin panel — CMS",
      "Responsive design",
      "SEO optimization",
      "Contact form",
      "Google Maps integration",
      "Google Analytics setup",
      "API integrations",
      "14-day technical support",
    ],
    delivery_time: "5–10 business days",
    cta: "Choose Package",
    highlighted: true,
    custom_price: false,
    price_explanation: null,
    icon_name: "Star",
    display_order: 2,
    published: true,
  },
  {
    section: "website",
    name: "Online Store",
    price: "999",
    billing_label: "One-time",
    description: null,
    ideal_for: "For online stores and product-selling businesses.",
    features: [
      "Product catalog",
      "Product categories",
      "Product search",
      "Shopping cart",
      "Order system",
      "Admin panel",
      "Online payment integration",
      "Responsive design",
      "SEO optimization",
      "API integrations",
      "All relevant Business Website features",
    ],
    delivery_time: "10–20 business days",
    cta: "Choose Package",
    highlighted: false,
    custom_price: false,
    price_explanation: null,
    icon_name: "ShoppingCart",
    display_order: 3,
    published: true,
  },
  {
    section: "website",
    name: "Custom Website",
    price: "CUSTOM",
    billing_label: "One-time",
    description: null,
    ideal_for: "For large-scale, unique, and custom digital projects.",
    features: [
      "Custom design and functionality",
      "Online booking system",
      "CRM integration",
      "Multilingual website",
      "API integrations",
      "AI integration",
      "User authentication",
      "Subscription system",
      "Payment systems",
      "Custom admin panel",
      "Any additional functionality development",
    ],
    delivery_time: "Determined by project scope",
    cta: "Plan Your Project",
    highlighted: false,
    custom_price: true,
    price_explanation:
      "Price depends on project requirements and functionality.",
    icon_name: "Zap",
    display_order: 4,
    published: true,
  },
  {
    section: "website",
    name: "Website Maintenance",
    price: "99",
    billing_label: "თვეში",
    description:
      "Continuous website operation, updates, and security monitoring.",
    ideal_for: null,
    features: [
      "Website updates",
      "Backup creation",
      "Security monitoring",
      "Minor technical changes",
      "Technical issue resolution",
      "Website performance monitoring",
    ],
    delivery_time: null,
    cta: "Choose Service",
    highlighted: false,
    custom_price: false,
    price_explanation: null,
    icon_name: "Wrench",
    display_order: 5,
    published: true,
  },

  // ── Social Media ──
  {
    section: "social-media",
    name: "Starter",
    price: "150",
    billing_label: "თვეში",
    description: null,
    ideal_for: null,
    features: ["5 posts", "Custom design", "Copywriting", "Post planning", "Post publishing"],
    delivery_time: null,
    cta: "Choose Package",
    highlighted: false,
    custom_price: false,
    price_explanation: null,
    icon_name: null,
    display_order: 0,
    published: true,
  },
  {
    section: "social-media",
    name: "Business",
    price: "450",
    billing_label: "თვეში",
    description: null,
    ideal_for: null,
    features: [
      "10 posts",
      "Professional design",
      "Copywriting",
      "Monthly content plan",
      "Post planning and publishing",
      "Monthly report",
      "1 ad campaign creation",
      "Target audience selection",
      "Periodic ad optimization",
    ],
    delivery_time: null,
    cta: "Choose Package",
    highlighted: false,
    custom_price: false,
    price_explanation: null,
    icon_name: null,
    display_order: 1,
    published: true,
  },
  {
    section: "social-media",
    name: "Premium",
    price: "800",
    billing_label: "თვეში",
    description: null,
    ideal_for: null,
    features: [
      "15 posts",
      "Reels ideas and scripts",
      "Full content plan",
      "Professional design",
      "Copywriting",
      "Post planning and publishing",
      "3 ad campaigns creation",
      "Target audience selection",
      "A/B Testing",
      "Remarketing",
      "Meta Pixel setup",
      "Conversion Tracking",
      "Weekly ad optimization",
      "Monthly analytics report",
    ],
    delivery_time: null,
    cta: "Choose Package",
    highlighted: false,
    custom_price: false,
    price_explanation: null,
    icon_name: null,
    display_order: 2,
    published: true,
  },
  {
    section: "social-media",
    name: "Full Social Media Management",
    price: "1500",
    billing_label: "თვეში",
    description: null,
    ideal_for:
      "For businesses wanting to fully delegate social media to a professional team.",
    features: [
      "Full social media strategy creation",
      "Monthly content plan preparation",
      "Professional post design",
      "Copywriting",
      "Reels ideas and scripts",
      "Video editing",
      "Regular post and Stories publishing",
      "Facebook and Instagram ad management",
      "Ad campaign creation",
      "Target audience selection",
      "A/B Testing",
      "Remarketing",
      "Meta Pixel setup",
      "Conversion Tracking setup",
      "Continuous ad monitoring and optimization",
      "Comment replies",
      "Direct message replies",
      "Daily customer communication",
      "Community Management",
      "Monthly detailed report and analytics",
    ],
    delivery_time: null,
    cta: "Get Consultation",
    highlighted: true,
    custom_price: false,
    price_explanation:
      "Price depends on number of pages, content volume, and project complexity.",
    icon_name: null,
    display_order: 3,
    published: true,
  },

  // ── Add-ons ──
  {
    section: "addons",
    name: "SEO Optimization",
    price: "199",
    billing_label: "",
    description: "Technical and search engine optimization for your website.",
    ideal_for: null,
    features: [],
    delivery_time: null,
    cta: "Choose Add-on",
    highlighted: false,
    custom_price: false,
    price_explanation: null,
    icon_name: "Search",
    display_order: 0,
    published: true,
  },
  {
    section: "addons",
    name: "Google Business Profile Setup",
    price: "99",
    billing_label: "",
    description:
      "Create and optimize your business presence on Google Maps and Search.",
    ideal_for: null,
    features: [],
    delivery_time: null,
    cta: "Choose Add-on",
    highlighted: false,
    custom_price: false,
    price_explanation: null,
    icon_name: "MapPin",
    display_order: 1,
    published: true,
  },
  {
    section: "addons",
    name: "Google Analytics + Search Console",
    price: "79",
    billing_label: "",
    description:
      "Set up tracking for visitors, search performance, and user behavior.",
    ideal_for: null,
    features: [],
    delivery_time: null,
    cta: "Choose Add-on",
    highlighted: false,
    custom_price: false,
    price_explanation: null,
    icon_name: "BarChart3",
    display_order: 2,
    published: true,
  },
  {
    section: "addons",
    name: "Business Email Setup",
    price: "49",
    billing_label: "",
    description: "Professional email setup using your own domain.",
    ideal_for: null,
    features: [],
    delivery_time: null,
    cta: "Choose Add-on",
    highlighted: false,
    custom_price: false,
    price_explanation: null,
    icon_name: "Mail",
    display_order: 3,
    published: true,
  },
  {
    section: "addons",
    name: "Domain & Hosting Setup",
    price: "49",
    billing_label: "",
    description: "Connect your domain, configure hosting, and publish your site.",
    ideal_for: null,
    features: [],
    delivery_time: null,
    cta: "Choose Add-on",
    highlighted: false,
    custom_price: false,
    price_explanation: null,
    icon_name: "Globe",
    display_order: 4,
    published: true,
  },
];

// ── Feature Tooltips ────────────────────────────────────────────────────

interface FeatureTooltipSeed {
  name_ka: string;
  name_en: string;
  description_ka: string;
  description_en: string;
}

const featureTooltips: FeatureTooltipSeed[] = [
  // ── Website Creation Tooltips ──
  {
    name_ka: "SEO ოპტიმიზაცია",
    name_en: "SEO Optimization",
    description_ka:
      "ვებგვერდის გაუმჯობესება Google-ის საძიებო სისტემისთვის, რათა მომხმარებლებმა უფრო მარტივად იპოვონ თქვენი ბიზნესი.",
    description_en:
      "Improving your website for Google's search system so customers can find your business more easily.",
  },
  {
    name_ka: "საბაზისო SEO ოპტიმიზაცია",
    name_en: "Basic SEO Optimization",
    description_ka:
      "საწყისი ტექნიკური გამართვა, რომელიც ეხმარება ვებგვერდს სწორად გამოჩნდეს Google-ში.",
    description_en:
      "Initial technical setup that helps your website appear correctly in Google search results.",
  },
  {
    name_ka: "ადმინ პანელი - CMS",
    name_en: "Admin Panel - CMS",
    description_ka:
      "მართვის სისტემა, სადაც თქვენ თავად შეძლებთ ტექსტების, ფოტოებისა და ინფორმაციის შეცვლას პროგრამისტის დახმარების გარეშე.",
    description_en:
      "A management system where you can edit texts, photos, and information yourself without needing a developer.",
  },
  {
    name_ka: "API ინტეგრაციები",
    name_en: "API Integrations",
    description_ka:
      "სხვადასხვა სისტემების დაკავშირება ერთმანეთთან, მაგალითად გადახდის, CRM-ის ან სხვა ბიზნეს ინსტრუმენტების დაკავშირება.",
    description_en:
      "Connecting different systems together, such as payment processors, CRM, or other business tools.",
  },
  {
    name_ka: "Google Analytics-ის გამართვა",
    name_en: "Google Analytics Setup",
    description_ka:
      "სისტემა, რომელიც გაჩვენებთ რამდენი ადამიანი სტუმრობს თქვენს საიტს და როგორ იქცევიან ისინი.",
    description_en:
      "A system that shows you how many people visit your website and how they behave on it.",
  },
  {
    name_ka: "Google Maps ინტეგრაცია",
    name_en: "Google Maps Integration",
    description_ka:
      "თქვენი ბიზნესის მდებარეობის დამატება ვებგვერდზე, რათა მომხმარებლებმა მარტივად იპოვონ ადგილი.",
    description_en:
      "Adding your business location to the website so customers can easily find where you are.",
  },
  {
    name_ka: "ონლაინ გადახდის ინტეგრაცია",
    name_en: "Online Payment Integration",
    description_ka:
      "საიტზე საბანკო ბარათით ან სხვა მეთოდით ონლაინ გადახდის შესაძლებლობის დამატება.",
    description_en:
      "Adding the ability to accept online payments on your website via credit card or other methods.",
  },
  {
    name_ka: "CRM ინტეგრაცია",
    name_en: "CRM Integration",
    description_ka:
      "მომხმარებლებისა და გაყიდვების მართვის სისტემასთან დაკავშირება, რათა კლიენტებთან მუშაობა უფრო მარტივი გახდეს.",
    description_en:
      "Connecting with customer and sales management systems to make working with clients easier.",
  },
  {
    name_ka: "AI ინტეგრაცია",
    name_en: "AI Integration",
    description_ka:
      "ხელოვნური ინტელექტის ფუნქციების დამატება ბიზნესის პროცესების გასაუმჯობესებლად.",
    description_en:
      "Adding artificial intelligence features to improve your business processes.",
  },
  {
    name_ka: "მომხმარებლის ავტორიზაცია",
    name_en: "User Authentication",
    description_ka:
      "მომხმარებლებისთვის პირადი ანგარიშის შექმნისა და სისტემაში შესვლის შესაძლებლობა.",
    description_en:
      "Allowing users to create personal accounts and log in to your system.",
  },
  {
    name_ka: "მრავალენოვანი ვებგვერდი",
    name_en: "Multilingual Website",
    description_ka:
      "ვებგვერდის რამდენიმე ენაზე მუშაობის შესაძლებლობა სხვადასხვა მომხმარებლისთვის.",
    description_en:
      "The ability for your website to work in multiple languages for different users.",
  },
  {
    name_ka: "გამოწერის სისტემა",
    name_en: "Subscription System",
    description_ka:
      "სერვისი, სადაც მომხმარებლებს შეუძლიათ პერიოდული გადახდით მიიღონ პროდუქტი ან მომსახურება.",
    description_en:
      "A service where users can receive a product or service through recurring payments.",
  },
  {
    name_ka: "ინდივიდუალური ადმინ პანელი",
    name_en: "Custom Admin Panel",
    description_ka:
      "თქვენი ბიზნესისთვის სპეციალურად შექმნილი მართვის სისტემა, სადაც თავად მართავთ ყველა მონაცემს.",
    description_en:
      "A management system built specifically for your business where you control all your data.",
  },

  {
    name_ka: "30-დღიანი ტექნიკური მხარდაჭერა",
    name_en: "30-Day Technical Support",
    description_ka:
      "მხარდაჭერა არ გულისხმობს დიზაინის შეცვლას, არამედ მოიცავს ჩვენი მხრიდან შეცდომის გამოსწორებას ან ხარვეზის აღმოფხვრას.",
    description_en:
      "Support does not include design changes but covers error correction or bug fixing from our side.",
  },
  {
    name_ka: "30-დღიანი ტექნიკური მხარდაჭერა",
    name_en: "30-Day Technical Support",
    description_ka:
      "მხარდაჭერა არ გულისხმობს დიზაინის შეცვლას, არამედ მოიცავს ჩვენი მხრიდან შეცდომის გამოსწორებას ან ხარვეზის აღმოფხვრას.",
    description_en:
      "Support does not include design changes but covers error correction or bug fixing from our side.",
  },

  // ── Social Media Tooltips ──
  {
    name_ka: "Reels იდეები და სცენარები",
    name_en: "Reels Ideas and Scripts",
    description_ka:
      "მოკლე ვიდეოების იდეები და მომზადებული გეგმები Instagram-ისა და TikTok-ისთვის.",
    description_en:
      "Ideas and prepared scripts for short videos for Instagram and TikTok.",
  },
  {
    name_ka: "კონტენტ გეგმა",
    name_en: "Content Plan",
    description_ka:
      "წინასწარ დაგეგმილი გეგმა, თუ რა კონტენტი უნდა გამოქვეყნდეს და როდის.",
    description_en:
      "A pre-planned schedule of what content should be published and when.",
  },
  {
    name_ka: "A/B ტესტირება",
    name_en: "A/B Testing",
    description_ka:
      "სხვადასხვა რეკლამის ან დიზაინის შედარება, რათა გაირკვეს რომელი მუშაობს უკეთ.",
    description_en:
      "Comparing different ads or designs to find out which one performs better.",
  },
  {
    name_ka: "რემარკეტინგი",
    name_en: "Remarketing",
    description_ka:
      "რეკლამის ჩვენება იმ ადამიანებისთვის, ვინც უკვე ეწვია თქვენს საიტს ან დაინტერესდა თქვენი ბიზნესით.",
    description_en:
      "Showing ads to people who have already visited your website or shown interest in your business.",
  },
  {
    name_ka: "Meta Pixel-ის გამართვა",
    name_en: "Meta Pixel Setup",
    description_ka:
      "ინსტრუმენტი, რომელიც ეხმარება Facebook-სა და Instagram-ს სწორად გაზომოს რეკლამის შედეგები.",
    description_en:
      "A tool that helps Facebook and Instagram correctly measure your ad performance.",
  },
  {
    name_ka: "კონვერსიების თვალყურის დევნება",
    name_en: "Conversion Tracking",
    description_ka:
      "გაზომვა იმისა, რამდენმა მომხმარებელმა შეასრულა სასურველი მოქმედება, მაგალითად შეკვეთა ან კონტაქტი.",
    description_en:
      "Measuring how many users completed a desired action, such as placing an order or contacting you.",
  },
  {
    name_ka: "სამიზნე აუდიტორიის შერჩევა",
    name_en: "Target Audience Selection",
    description_ka:
      "რეკლამის ჩვენება იმ ადამიანებისთვის, რომლებიც ყველაზე მეტად არიან დაინტერესებული თქვენი პროდუქტით ან მომსახურებით.",
    description_en:
      "Showing your ads to people who are most likely interested in your product or service.",
  },
  {
    name_ka: "სარეკლამო კამპანიის შექმნა",
    name_en: "Ad Campaign Creation",
    description_ka:
      "რეკლამის სრული დაგეგმვა, გაშვება და მართვა კონკრეტული მიზნის მისაღწევად.",
    description_en:
      "Complete planning, launching, and management of ads to achieve a specific goal.",
  },
  {
    name_ka: "ვიდეო მონტაჟი",
    name_en: "Video Editing",
    description_ka:
      "ვიდეო მასალის დამუშავება, გაფორმება და მომზადება სოციალურ ქსელებში გამოსაქვეყნებლად.",
    description_en:
      "Processing, enhancing, and preparing video content for publication on social networks.",
  },
  {
    name_ka: "ანალიტიკის ანგარიში",
    name_en: "Analytics Report",
    description_ka:
      "ანგარიში, რომელიც აჩვენებს რეკლამისა და კონტენტის შედეგებს.",
    description_en:
      "A report that shows the results of your ads and content performance.",
  },
];

// ── Team Members ────────────────────────────────────────────────────────

interface TeamMemberSeed {
  name: string;
  position: string;
  bio: string;
  image: string;
  socials: Record<string, string>;
  display_order: number;
  published: boolean;
  name_en?: string;
  position_en?: string;
  bio_en?: string;
}

const teamMembers: TeamMemberSeed[] = [
  {
    name: "სოფიო მაჭარაშვილი",
    position: "დირექტორი",
    bio: "კომპანიის განვითარების, სტრატეგიული მიმართულებებისა და გუნდის მართვის პასუხისმგებელი პირი.",
    image: "/team/sofio.webp",
    socials: {},
    display_order: 0,
    published: true,
    name_en: "Sopio Macharashvili",
    position_en: "Director",
    bio_en: "Responsible for company development, strategic direction, and team management.",
  },
  {
    name: "მარიამ კაკიაშვილი",
    position: "გუნდის ხელმძღვანელი",
    bio: "მარიამი კოორდინაციას უწევს ტექნიკურ მიმართულებას და ვებ პროექტების განხორციელებას. მრავალწლიანი გამოცდილებითა და ლიდერული უნარებით, ის უზრუნველყოფს თითოეული პროექტის უმაღლესი სტანდარტებით შესრულებას.",
    image: "/team/mariami.webp",
    socials: {},
    display_order: 1,
    published: true,
    name_en: "Mariam Kakiashvili",
    position_en: "Team Lead",
    bio_en: "Mariam coordinates the technical direction and implementation of web projects. With years of experience and leadership skills, she ensures that every project is delivered to the highest standards.",
  },
  {
    name: "გაიოზ კუპრაშვილი",
    position: "ლექტორი",
    bio: "გაიოზი ეხმარება დამწყებ დეველოპერებს ვებტექნოლოგიების შესწავლაში. თავისი გამოცდილებითა და მარტივი ახსნის მანერით, ის სტუდენტებს პრაქტიკულ უნარებს გადასცემს და უზიარებს იმ ცოდნას, რომელიც რეალური პროექტების შესაქმნელად არის საჭირო.",
    image: "/team/kupra.webp",
    socials: {},
    display_order: 2,
    published: true,
    name_en: "Gaioz Kupravishvili",
    position_en: "Lecturer",
    bio_en: "Gaioz helps beginner developers learn web technologies. Through his experience and simple teaching style, he passes practical skills to students and shares the knowledge needed to build real projects.",
  },
  {
    name: "ცოტნე ჩადუნელი",
    position: "ლექტორი",
    bio: "ცოტნე აერთიანებს მდიდარ პრაქტიკულ გამოცდილებას და ღრმა აკადემიურ ცოდნას. როგორც დარგის წამყვანი სპეციალისტი, ის უწევს მენტორობას ჩვენს გუნდს, აზიარებს თანამედროვე ტექნოლოგიურ ტენდენციებს და ზრუნავს სერვისების ხარისხის მუდმივ ზრდაზე.",
    image: "/team/cotne.webp",
    socials: {},
    display_order: 3,
    published: true,
    name_en: "Tsotne Chaduneli",
    position_en: "Lecturer",
    bio_en: "Tsotne combines rich practical experience with deep academic knowledge. As a leading specialist in the field, he mentors our team, shares modern technology trends, and ensures the continuous growth of service quality.",
  },
  {
    name: "ლუკა მეკოკიშვილი",
    position: "ვებ დეველოპერი",
    bio: "ლუკა სპეციალიზებულია თანამედროვე, სრულყოფილად გამართული ვებ აპლიკაციებისა და საიტების შექმნაზე. მისი პრიორიტეტია მომხმარებლისთვის მოსახერხებელი, სწრაფი და უსაფრთხო ციფრული პროდუქტების მიწოდება.",
    image: "/team/rostika.webp",
    socials: {},
    display_order: 4,
    published: true,
    name_en: "Luka Mekokishvili",
    position_en: "Web Developer",
    bio_en: "Luka specializes in building modern, fully functional web applications and websites. His priority is delivering user-friendly, fast, and secure digital products.",
  },
  {
    name: "ლუკა ხარაიშვილი",
    position: "ვებ დეველოპერი",
    bio: "ლუკა არის ნიჭიერი და პერსპექტიული დეველოპერი, რომელიც თავისი მოტივაციითა და რთული ტექნიკური ამოცანების გადაჭრის უნარით მნიშვნელოვან წვლილს შეიტანს ჩვენს პროექტებში.",
    image: "/team/xaraishvili.webp",
    socials: {},
    display_order: 5,
    published: true,
    name_en: "Luka Kharaishvili",
    position_en: "Web Developer",
    bio_en: "Luka is a talented and promising developer whose motivation and ability to solve complex technical problems make a significant contribution to our projects.",
  },
  {
    name: "გაგა ტრაპაიძე",
    position: "სოციალური მედიის მართვა",
    bio: "გაგა წარმატებით აერთიანებს ტექნიკურ კომპეტენციას და კომუნიკაციის უნარებს. ის წარმართავს კომპანიის სოციალურ ურთიერთობებს, რაც უზრუნველყოფს მჭიდრო კავშირს მომხმარებლებთან და პარტნიორებთან.",
    image: "/team/gaga.webp",
    socials: {},
    display_order: 6,
    published: true,
    name_en: "Gaga Trapaidze",
    position_en: "Social Media Manager",
    bio_en: "Gaga successfully combines technical competence with communication skills. He manages the company's social relations, ensuring a close connection with customers and partners.",
  },
];

// ── Seed Runner ─────────────────────────────────────────────────────────

interface SeedCounts {
  [key: string]: number;
}

async function seed(): Promise<void> {
  console.log("");
  console.log("  ╔══════════════════════════════════════╗");
  console.log("  ║   🌱  BTA LAB CMS — Seed Script      ║");
  console.log("  ╚══════════════════════════════════════╝");
  console.log("");

  const counts: SeedCounts = {};
  let hasError = false;
  console.log("  ℹ  Target schema: clean bilingual Supabase setup");

  try {
    await assertSchemaReady();
    console.log("  ✓  Required Supabase tables are available");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗  ${message}`);
    process.exit(1);
  }

  // 1. Sync Admin Auth User and Profile

  console.log("  -- Syncing Supabase admin account --");

  const adminCredentials = getAdminCredentialsFromEnv();

  try {
    const result = await syncAdminAccount({
      supabase,
      credentials: adminCredentials,
      log: (message) => console.log(`  OK  ${message}`),
    });
    counts["Admin profiles"] = result.profileSynced ? 1 : 0;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ERROR  ${message}`);
    process.exit(1);
  }

  console.log("");

  // 2. Site Settings

  console.log("  ── Site Settings ───────────────────────────");

  for (const setting of siteSettings) {
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert(withBilingualSetting(setting) as never, { onConflict: "setting_key" });

      if (error) {
        console.error(`  ✗  ${setting.setting_key}: ${error.message}`);
        hasError = true;
      } else {
        counts["Site settings"] = (counts["Site settings"] || 0) + 1;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  ${setting.setting_key}: ${message}`);
      hasError = true;
    }
  }

  console.log(`  ✓  ${counts["Site settings"] || 0} settings processed`);

  // ── 4. Site Content ───────────────────────────────────────────────

  console.log("");
  console.log("  ── Site Content ────────────────────────────");

  try {
    const pages = ["home", "about", "services", "portfolio", "team", "contact", "footer"];
    const { error } = await supabase.from("site_content").delete().in("page", pages);
    if (error) {
      console.error(`  ✗  Existing site content cleanup failed: ${error.message}`);
      hasError = true;
    } else {
      console.log("  ✓  Existing public site content cleared");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗  Existing site content cleanup failed: ${message}`);
    hasError = true;
  }

  for (const entry of siteContent) {
    try {
      const { error } = await supabase
        .from("site_content")
        .upsert(withBilingualContent(entry) as never, { onConflict: "page, section, content_key" });

      if (error) {
        console.error(
          `  ✗  ${entry.page}/${entry.section}/${entry.content_key}: ${error.message}`
        );
        hasError = true;
      } else {
        counts["Site content"] = (counts["Site content"] || 0) + 1;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `  ✗  ${entry.page}/${entry.section}/${entry.content_key}: ${message}`
      );
      hasError = true;
    }
  }

  console.log(`  ✓  ${counts["Site content"] || 0} records processed`);

  // ── 5. Portfolio Categories ───────────────────────────────────────

  console.log("");
  console.log("  ── Portfolio Categories ────────────────────");

  for (const cat of portfolioCategories) {
    try {
      const { error } = await supabase
        .from("portfolio_categories")
        .upsert(withBilingualCategory(cat) as never, { onConflict: "slug" });

      if (error) {
        console.error(`  ✗  ${cat.name}: ${error.message}`);
        hasError = true;
      } else {
        counts["Portfolio categories"] =
          (counts["Portfolio categories"] || 0) + 1;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  ${cat.name}: ${message}`);
      hasError = true;
    }
  }

  console.log(
    `  ✓  ${counts["Portfolio categories"] || 0} categories processed`
  );

  // ── 6. Portfolio Projects ─────────────────────────────────────────

  console.log("");
  console.log("  ── Portfolio Projects ───────────────────────");

  for (const project of portfolioProjects) {
    try {
      const { error } = await supabase
        .from("portfolio_projects")
        .upsert(
          {
            ...withBilingualProject(project),
            results: project.results,
            technologies: project.technologies,
            gallery: project.gallery,
          } as never,
          { onConflict: "slug" }
        );

      if (error) {
        console.error(`  ✗  ${project.title}: ${error.message}`);
        hasError = true;
      } else {
        counts["Portfolio projects"] =
          (counts["Portfolio projects"] || 0) + 1;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  ${project.title}: ${message}`);
      hasError = true;
    }
  }

  console.log(
    `  ✓  ${counts["Portfolio projects"] || 0} projects processed`
  );

  // ── 7. Service Packages ───────────────────────────────────────────

  console.log("");
  console.log("  ── Service Packages ─────────────────────────");

  for (const pkg of servicePackages) {
    try {
      const id = deterministicId(`service-package-${pkg.section}-${pkg.name}`);
      const { error } = await supabase.from("service_packages").upsert(
          {
            id,
          ...withBilingualServicePackage(pkg),
          features: pkg.features,
        } as never,
        { onConflict: "id" }
      );

      if (error) {
        console.error(`  ✗  [${pkg.section}] ${pkg.name}: ${error.message}`);
        hasError = true;
      } else {
        counts["Service packages"] = (counts["Service packages"] || 0) + 1;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  [${pkg.section}] ${pkg.name}: ${message}`);
      hasError = true;
    }
  }

  console.log(
    `  ✓  ${counts["Service packages"] || 0} packages processed`
  );

  // ── 8. Feature Tooltips ──────────────────────────────────────────

  console.log("");
  console.log("  ── Feature Tooltips ───────────────────────────");

  for (const tooltip of featureTooltips) {
    try {
      const id = deterministicId(`tooltip-${tooltip.name_ka}`);
      const { error } = await supabase
        .from("service_feature_tooltips")
        .upsert({ id, ...tooltip } as never, { onConflict: "id" });

      if (error) {
        console.error(`  ✗  ${tooltip.name_ka}: ${error.message}`);
        hasError = true;
      } else {
        counts["Feature tooltips"] = (counts["Feature tooltips"] || 0) + 1;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  ${tooltip.name_ka}: ${message}`);
      hasError = true;
    }
  }

  console.log(
    `  ✓  ${counts["Feature tooltips"] || 0} tooltips processed`
  );

  // ── 9. Legal Policies ─────────────────────────────────────────────

  console.log("");
  console.log("  ── Legal Policies ───────────────────────────");

  const legalPolicies = [
    {
      type: "PRIVACY_POLICY",
      title_ka: "კონფიდენციალურობის პოლიტიკა",
      title_en: "Privacy Policy",
      description_ka:
        "ბითიეი ლაბი აგროვებს მხოლოდ იმ ინფორმაციას, რომელიც საჭიროა მოთხოვნებზე პასუხისთვის, ვებსაიტის მუშაობისთვის და ადმინისტრირების პანელის დასაცავად.",
      description_en:
        "BTA LAB collects only the information needed to respond to inquiries, operate the website, and protect the Admin Panel.",
      content_ka:
        "## რა ინფორმაციას ვაგროვებთ\n\nსაკონტაქტო ფორმა შეიძლება მოიცავდეს თქვენს სახელს, ელფოსტას, ტელეფონს, კომპანიას, პროექტის პრეფერენციებს და შეტყობინებას. ადმინისტრატორის ავტორიზაცია მუშავდება Supabase Auth-ის მეშვეობით.\n\n## როგორ ვიყენებთ ინფორმაციას\n\nმონაცემებს ვიყენებთ მოთხოვნებზე პასუხისთვის, სერვისების დაგეგმვისთვის, საქმიანი კომუნიკაციის ჩანაწერებისთვის და ბოროტად გამოყენების თავიდან ასაცილებლად.\n\n## უსაფრთხოება\n\nსაიტს აქვს სერვერის მხარეს ვალიდაცია, დაცული ადმინისტრირების მარშრუტები, Row Level Security, ატვირთვების შემოწმება, უსაფრთხოების სათაურები და შეზღუდული ლოგირება შენიღბული პერსონალური მონაცემებით.\n\n## ქუქიები\n\nაუცილებელი ქუქიები გამოიყენება ენის არჩევისა და უსაფრთხო სესიებისთვის. არჩევითი ანალიტიკური ან მარკეტინგული ქუქიები გამოიყენება მხოლოდ თანხმობის შემდეგ.\n\n## კონტაქტი\n\nპერსონალურ ინფორმაციაზე წვდომის, გასწორების ან წაშლის მოთხოვნისთვის დაგვიკავშირდით კონტაქტის გვერდზე მითითებული მონაცემებით.",
      content_en:
        "## Information We Collect\n\nContact form submissions may include your name, email, phone, company, project preferences, and message. Admin authentication is handled by Supabase Auth.\n\n## How We Use Information\n\nWe use submitted information to reply to requests, plan services, keep records of legitimate business communication, and prevent abuse.\n\n## Security\n\nThe site uses server-side validation, protected admin routes, Row Level Security, upload validation, security headers, and limited logging with masked personal data.\n\n## Cookies\n\nNecessary cookies support language preference and secure sessions. Optional analytics or marketing cookies are used only after consent.\n\n## Contact\n\nTo request access, correction, or deletion of personal information, contact BTA LAB using the details on the Contact page.",
    },
    {
      type: "COOKIE_POLICY",
      title_ka: "ქუქიების პოლიტიკა",
      title_en: "Cookie Policy",
      description_ka:
        "ეს გვერდი განმარტავს, როგორ იყენებს ბითიეი ლაბი ქუქიებს და ბრაუზერის მსგავს საცავებს საჯარო ვებსაიტზე.",
      description_en:
        "This page explains how BTA LAB uses cookies and similar browser storage on the public website.",
      content_ka:
        "## აუცილებელი ქუქიები\n\nაუცილებელი ქუქიები ინახავს არჩეულ ენას, იცავს ადმინისტრირების სესიებს და უზრუნველყოფს საიტის ძირითად მუშაობას. მათი გამორთვა ბანერიდან შეუძლებელია.\n\n## არჩევითი ქუქიები\n\nანალიტიკური და მარკეტინგული ქუქიები გამორთულია, სანამ მათ მიღებას ან პარამეტრებიდან ჩართვას არ აირჩევთ.\n\n## პარამეტრების შეცვლა\n\nსაჯარო ვებსაიტის ქვედა ნაწილში გამოიყენეთ ქუქიების ღილაკი, რათა ნებისმიერ დროს გახსნათ პარამეტრები და შეცვალოთ არჩევანი.\n\n## მესამე მხარეები\n\nჩაშენებულმა რუკებმა და CAPTCHA პროვაიდერებმა შეიძლება დაამუშაონ ტექნიკური მონაცემები მათი ვიჯეტების ჩატვირთვისას. Production გარემოში უნდა დარჩეს მხოლოდ უსაფრთხოების კონფიგურაციაში მითითებული პროვაიდერები.",
      content_en:
        "## Necessary Cookies\n\nNecessary cookies keep the selected language, protect admin sessions, and support basic site operation. They cannot be turned off from the banner.\n\n## Optional Cookies\n\nAnalytics and marketing cookies stay disabled unless you accept them or enable them in cookie preferences.\n\n## Changing Preferences\n\nUse the Cookies button at the bottom of the public website to reopen preferences and update your choice at any time.\n\n## Third Parties\n\nEmbedded maps and CAPTCHA providers may process technical data when their widgets are loaded. Production deployment should keep only the providers listed in the security configuration.",
    },
  ];

  for (const policy of legalPolicies) {
    try {
      const { error } = await supabase
        .from("legal_policies")
        .upsert(policy as never, { onConflict: "type" });

      if (error) {
        console.error(`  ✗  ${policy.type}: ${error.message}`);
        hasError = true;
      } else {
        counts["Legal policies"] = (counts["Legal policies"] || 0) + 1;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  ${policy.type}: ${message}`);
      hasError = true;
    }
  }

  console.log(`  ✓  ${counts["Legal policies"] || 0} policies processed`);

  // ── 10. Team Members ───────────────────────────────────────────────

  console.log("");
  console.log("  ── Team Members ─────────────────────────────");

  for (const member of teamMembers) {
    try {
      const id = deterministicId(`team-member-${member.name}`);

      // Upsert the canonical (deterministic-id) row first, so a failed upsert
      // never leaves the member missing.
      const { error } = await supabase.from("team_members").upsert(
          {
          id,
          ...withBilingualTeamMember(member),
          socials: member.socials,
        } as never,
        { onConflict: "id" }
      );

      if (error) {
        console.error(`  ✗  ${member.name}: ${error.message}`);
        hasError = true;
        continue;
      }

      // Consolidate: remove any pre-existing rows for this member that use a
      // different id (e.g. the fixed UUIDs from migration 016 or rows created
      // through the admin panel). Matches both the legacy `name` column and
      // `name_ka` so rows stored with English names are consolidated too.
      // After this, exactly one row per team member remains — no duplicates.
      const { error: deleteError } = await supabase
        .from("team_members")
        .delete()
        .or(`name.eq."${member.name}",name_ka.eq."${member.name}"`)
        .neq("id", id);

      if (deleteError) {
        console.error(`  ✗  ${member.name}: ${deleteError.message}`);
        hasError = true;
        continue;
      }

      counts["Team members"] = (counts["Team members"] || 0) + 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  ${member.name}: ${message}`);
      hasError = true;
    }
  }

  console.log(`  ✓  ${counts["Team members"] || 0} members processed`);

  // ── Summary ───────────────────────────────────────────────────────

  console.log("");
  console.log("  ╔══════════════════════════════════════╗");
  if (hasError) {
    console.log("  ║   ⚠ Seed completed with errors       ║");
    console.log("  ╚══════════════════════════════════════╝");
  } else {
    console.log("  ║   ✅ Seed completed successfully      ║");
    console.log("  ╚══════════════════════════════════════╝");
  }
  console.log("");

  for (const [label, count] of Object.entries(counts)) {
    console.log(`     ${label.padEnd(25)} ${count}`);
  }

  console.log("");

  if (hasError) {
    process.exit(1);
  }
}

seed().catch((err) => {
  console.error("\n  ❌ Fatal error:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
