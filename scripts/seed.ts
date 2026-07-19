/**
 * BTA LAB CMS — Database Seed Script
 *
 * Seeds initial CMS content into Supabase for a fresh project setup.
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
 *   ADMIN_PASSWORD       — Must be at least 8 characters
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import type { Database } from "../src/types/supabase";
import kaDict from "../src/locales/ka.json";
import enDict from "../src/locales/en.json";
import { getServicePackageKaLocalization } from "../src/data/service-package-localizations";

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

// ── Normalize admin credentials ────────────────────────────────────────

const normalizedEmail = ADMIN_EMAIL!.trim().toLowerCase();
const adminDisplayName = ADMIN_DISPLAY_NAME!.trim();

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

const categoryLabelsKa: Record<string, string> = {
  Web: "ვებ",
  "E-commerce": "ონლაინ მაღაზია",
  Branding: "ბრენდინგი",
  Marketing: "მარკეტინგი",
  "UI/UX": "UI/UX",
};

const settingsKa: Record<string, string> = {
  site_tagline: "ჩვენ ვეხმარებით მცირე ბიზნესს ზრდაში.",
  contact_location: "თბილისი, საქართველო",
  contact_availability: "ვმუშაობთ ონლაინ",
  copyright_text: "© 2024 BTA LAB. ყველა უფლება დაცულია.",
};

const contentKeyOverrides: Record<string, string> = {
  "home.hero.eyebrow": "hero.eyebrow",
  "home.hero.heading": "hero.heading",
  "home.hero.description": "hero.description",
  "home.hero.primaryCta": "hero.primaryCta",
  "home.hero.secondaryCta": "hero.secondaryCta",
  "home.featured.sectionTitle": "home.projectsHeading",
  "home.featured.sectionDescription": "home.projectsDescription",
  "home.cta.buttonLabel": "home.ctaButton",
  "home.cta.learnMoreLabel": "home.ctaLearnMore",
  "contact.form.budgetOptions_small": "contact.form.budgetOptions.small",
  "contact.form.budgetOptions_medium": "contact.form.budgetOptions.medium",
  "contact.form.budgetOptions_large": "contact.form.budgetOptions.large",
  "contact.form.budgetOptions_enterprise": "contact.form.budgetOptions.enterprise",
  "footer.brand.description": "footer.brandDescription",
  "footer.copyright.text": "footer.copyright",
};

function contentDictionaryKey(entry: SiteContentSeed): string {
  const compound = `${entry.page}.${entry.section}.${entry.content_key}`;
  return contentKeyOverrides[compound] || compound;
}

async function tableHasColumn(table: keyof Database["public"]["Tables"], column: string): Promise<boolean> {
  const { error } = await supabase.from(table).select(column).limit(1);
  return !error;
}

function withBilingualSetting(setting: SiteSettingSeed, enabled: boolean) {
  if (!enabled) return setting;
  return {
    ...setting,
    value_ka: settingsKa[setting.setting_key] || setting.setting_value,
    value_en: setting.setting_value,
  };
}

function withBilingualContent(entry: SiteContentSeed, enabled: boolean) {
  if (!enabled) return entry;
  const key = contentDictionaryKey(entry);
  return {
    ...entry,
    value_ka: KA_DICT[key] || entry.content_value,
    value_en: EN_DICT[key] || entry.content_value,
  };
}

function withBilingualCategory(category: PortfolioCategorySeed, enabled: boolean) {
  if (!enabled) return category;
  return {
    ...category,
    name_ka: categoryLabelsKa[category.name] || category.name,
    name_en: category.name,
  };
}

function inferPriceSuffixKa(price: string | undefined) {
  if (!price) return "";
  if (price.endsWith("-დან")) return "-დან";
  return "";
}

function withBilingualProject(project: PortfolioProjectSeed, enabled: boolean) {
  if (!enabled) return project;
  const qeyKa = project.slug === "qey-ge"
    ? {
        title_ka: "qey.ge",
        description_ka: "თანამედროვე ელ-კომერციის პლატფორმა საქართველოს ბაზრისთვის, სწრაფი გადახდითა და მარაგების რეალურ დროში მართვით.",
        full_description_ka: "qey.ge არის სრული ელ-კომერციის გადაწყვეტა საქართველოს ბაზრისთვის. პლატფორმა აერთიანებს თანამედროვე ადაპტირებულ დიზაინს, მობილურ შოპინგზე აქცენტს, სწრაფ ჩატვირთვას და მარტივ გადახდის პროცესს.",
        problem_ka: "ბაზარზე არ იყო საკმარისად სწრაფი, თანამედროვე და მომხმარებელზე ორიენტირებული ელ-კომერციის პლატფორმა, რომელიც ადგილობრივ საჭიროებებს მოერგებოდა.",
        solution_ka: "ავაშენეთ პერსონალური ელ-კომერციის პლატფორმა წარმადობაზე, მობილურ გამოცდილებასა და ადგილობრივ მოთხოვნებზე ფოკუსით.",
        results_ka: [
          "გვერდები იტვირთება 60%-ით სწრაფად",
          "კალათის მიტოვება შემცირდა 35%-ით",
          "ჩაერთო 200-ზე მეტი მერჩანტი",
          "მომხმარებელთა საშუალო შეფასება 4.8/5",
        ],
        alt_text_ka: "qey.ge ვებგვერდის სრული პრევიუ",
        seo_title_ka: "qey.ge ელ-კომერციის პლატფორმა",
        seo_description_ka: "თანამედროვე ელ-კომერციის პლატფორმა საქართველოს ბაზრისთვის.",
      }
    : {};

  return {
    ...project,
    title_ka: qeyKa.title_ka || project.title,
    title_en: project.title,
    category_label_ka: categoryLabelsKa[project.category] || project.category,
    category_label_en: project.category,
    description_ka: qeyKa.description_ka || project.description,
    description_en: project.description,
    full_description_ka: qeyKa.full_description_ka || project.full_description,
    full_description_en: project.full_description,
    problem_ka: qeyKa.problem_ka || project.problem,
    problem_en: project.problem,
    solution_ka: qeyKa.solution_ka || project.solution,
    solution_en: project.solution,
    results_ka: qeyKa.results_ka || project.results,
    results_en: project.results,
    alt_text_ka: qeyKa.alt_text_ka || project.alt_text,
    alt_text_en: project.alt_text,
    seo_title_ka: qeyKa.seo_title_ka || project.seo_title,
    seo_title_en: project.seo_title,
    seo_description_ka: qeyKa.seo_description_ka || project.seo_description,
    seo_description_en: project.seo_description,
  };
}

function withBilingualServicePackage(pkg: ServicePackageSeed, enabled: boolean) {
  if (!enabled) return pkg;
  const ka = getServicePackageKaLocalization(pkg.section, pkg.name);
  const ctaKa: Record<string, string> = {
    "Choose Package": "პაკეტის არჩევა",
    "Choose Service": "სერვისის არჩევა",
    "Choose Add-on": "სერვისის არჩევა",
    "Plan Your Project": "პროექტის დაგეგმვა",
    "Get Consultation": "კონსულტაციის მიღება",
  };
  return {
    ...pkg,
    name_ka: ka?.name || pkg.name,
    name_en: pkg.name,
    price_suffix_ka: ka?.priceSuffix || inferPriceSuffixKa(ka?.price),
    price_suffix_en: "",
    custom_price_label_ka: pkg.custom_price ? ka?.customPriceLabel || ka?.price || "ინდივიდუალური" : "",
    custom_price_label_en: pkg.custom_price ? "Custom" : "",
    billing_label_ka: ka?.billingLabel ?? pkg.billing_label ?? "",
    billing_label_en: pkg.billing_label || "",
    description_ka: ka?.description ?? pkg.description ?? "",
    description_en: pkg.description || "",
    ideal_for_ka: ka?.idealFor ?? pkg.ideal_for ?? "",
    ideal_for_en: pkg.ideal_for || "",
    features_ka: ka?.features ?? pkg.features,
    features_en: pkg.features,
    delivery_time_ka: ka?.deliveryTime ?? pkg.delivery_time ?? "",
    delivery_time_en: pkg.delivery_time || "",
    cta_ka: ka?.cta || ctaKa[pkg.cta] || pkg.cta,
    cta_en: pkg.cta,
    cta_label_ka: ka?.cta || ctaKa[pkg.cta] || pkg.cta,
    cta_label_en: pkg.cta,
    price_explanation_ka: ka?.priceExplanation ?? pkg.price_explanation ?? "",
    price_explanation_en: pkg.price_explanation || "",
  };
}

function withBilingualTeamMember(member: TeamMemberSeed, enabled: boolean) {
  if (!enabled) return member;
  return {
    ...member,
    name_ka: member.name,
    name_en: member.name,
    role_ka: member.role,
    role_en: member.role,
    bio_ka: member.bio,
    bio_en: member.bio,
    skills_ka: member.skills,
    skills_en: member.skills,
    image_alt_ka: `${member.name} პორტრეტი`,
    image_alt_en: `${member.name} portrait`,
  };
}

// ── Admin user resolution ──────────────────────────────────────────────

interface ResolvedAdmin {
  id: string;
  email: string;
}

async function resolveAdminUser(): Promise<ResolvedAdmin> {
  // Paginate through Auth users to find the configured admin email
  const pageSize = 50;
  let page = 1;

  while (true) {
    const {
      data: users,
      error: listError,
    } = await supabase.auth.admin.listUsers({
      page,
      perPage: pageSize,
    });

    if (listError) {
      throw new Error(`Auth user lookup failed: ${listError.message}`);
    }

    if (!users || users.users.length === 0) {
      break; // End of pagination
    }

    for (const user of users.users) {
      if (user.email?.toLowerCase().trim() === normalizedEmail) {
        console.log(`  ✓  Existing admin user found: ${normalizedEmail}`);
        return { id: user.id, email: normalizedEmail };
      }
    }

    if (users.users.length < pageSize) {
      break; // Last page
    }

    page++;
  }

  // User not found — create one
  console.log("  ℹ  Admin user not found");

  if (!ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_PASSWORD is required because no existing Auth user was found. " +
      "Provide a password of at least 8 characters."
    );
  }

  if (ADMIN_PASSWORD.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 8 characters."
    );
  }

  console.log("  ℹ  Creating administrator account");

  const {
    data: newUser,
    error: createError,
  } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      display_name: adminDisplayName,
    },
  });

  if (createError) {
    // Handle duplicate-email race condition
    const msg = createError.message.toLowerCase();
    if (
      msg.includes("already exists") ||
      msg.includes("duplicate") ||
      msg.includes("already registered")
    ) {
      console.log(
        "  ℹ  Duplicate-email race detected — retrying lookup"
      );

      // Retry lookup — the user was created by another process
      const retryResult = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (retryResult.error) {
        throw new Error(
          `Failed to resolve user after duplicate-email race: ${retryResult.error.message}`
        );
      }

      for (const user of retryResult.data?.users ?? []) {
        if (user.email?.toLowerCase().trim() === normalizedEmail) {
          console.log(`  ✓  Existing admin user found after retry: ${normalizedEmail}`);
          return { id: user.id, email: normalizedEmail };
        }
      }

      throw new Error(
        `Could not resolve user by email after duplicate-email race: ${normalizedEmail}`
      );
    }

    throw new Error(
      `Failed to create administrator account: ${createError.message}`
    );
  }

  if (!newUser?.user) {
    throw new Error("Administrator account creation returned no user data.");
  }

  console.log("  ✓  Administrator account created");
  return { id: newUser.user.id, email: normalizedEmail };
}

// ── Supabase client (service role — never expose to client) ─────────────

const supabase = createClient<Database>(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

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
    setting_key: "site_tagline",
    setting_value: "We help small businesses grow.",
    setting_type: "text",
  },
  {
    setting_key: "contact_email",
    setting_value: "hello@bta-lab.com",
    setting_type: "text",
  },
  {
    setting_key: "contact_phone",
    setting_value: "+1 (555) 123-4567",
    setting_type: "text",
  },
  {
    setting_key: "contact_location",
    setting_value: "Tbilisi, Georgia",
    setting_type: "text",
  },
  {
    setting_key: "contact_availability",
    setting_value: "Working online",
    setting_type: "text",
  },
  {
    setting_key: "social_facebook",
    setting_value: "https://facebook.com/bta-lab",
    setting_type: "url",
  },
  {
    setting_key: "social_instagram",
    setting_value: "https://instagram.com/bta_lab",
    setting_type: "url",
  },
  {
    setting_key: "copyright_text",
    setting_value: "© 2024 BTA LAB. All rights reserved.",
    setting_type: "text",
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
  content_value: string;
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
    content_value: "BTA LAB — Digital Innovation Lab",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "home",
    section: "hero",
    content_key: "heading",
    content_value: "We help small businesses grow.",
    content_type: "text",
    sort_order: 1,
  },
  {
    page: "home",
    section: "hero",
    content_key: "description",
    content_value:
      "We create modern websites, online stores, and digital experiences that help businesses achieve real results.",
    content_type: "textarea",
    sort_order: 2,
  },
  {
    page: "home",
    section: "hero",
    content_key: "primaryCta",
    content_value: "View Our Work",
    content_type: "text",
    sort_order: 3,
  },
  {
    page: "home",
    section: "hero",
    content_key: "secondaryCta",
    content_value: "Meet the Team",
    content_type: "text",
    sort_order: 4,
  },

  // ── Home / Featured ──
  {
    page: "home",
    section: "featured",
    content_key: "sectionTitle",
    content_value: "Featured Projects",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "home",
    section: "featured",
    content_key: "sectionDescription",
    content_value:
      "Real projects built by real students — see what we've created.",
    content_type: "textarea",
    sort_order: 1,
  },

  // ── Home / CTA ──
  {
    page: "home",
    section: "cta",
    content_key: "heading",
    content_value: "Ready to Start Your Project?",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "home",
    section: "cta",
    content_key: "description",
    content_value:
      "Let's discuss your ideas and turn them into a stunning digital experience.",
    content_type: "textarea",
    sort_order: 1,
  },
  {
    page: "home",
    section: "cta",
    content_key: "buttonLabel",
    content_value: "Start a Project",
    content_type: "text",
    sort_order: 2,
  },
  {
    page: "home",
    section: "cta",
    content_key: "learnMoreLabel",
    content_value: "Learn More",
    content_type: "text",
    sort_order: 3,
  },

  // ── About / Hero ──
  {
    page: "about",
    section: "hero",
    content_key: "badge",
    content_value: "About Us",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "about",
    section: "hero",
    content_key: "heading",
    content_value: "We're Building the Future of Digital Innovation",
    content_type: "text",
    sort_order: 1,
  },
  {
    page: "about",
    section: "hero",
    content_key: "description",
    content_value:
      "BTA LAB is a digital innovation lab and student-powered agency. We create real-world digital products while empowering the next generation of designers, developers, and marketers with hands-on experience.",
    content_type: "textarea",
    sort_order: 2,
  },

  // ── About / Mission ──
  {
    page: "about",
    section: "mission",
    content_key: "title",
    content_value: "Our Mission",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "about",
    section: "mission",
    content_key: "description",
    content_value:
      "To provide students with real-world experience through hands-on client projects, bridging the gap between academic knowledge and professional practice while delivering exceptional digital solutions.",
    content_type: "textarea",
    sort_order: 1,
  },

  // ── About / Vision ──
  {
    page: "about",
    section: "vision",
    content_key: "title",
    content_value: "Our Vision",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "about",
    section: "vision",
    content_key: "description",
    content_value:
      "To become a leading digital innovation lab that sets the standard for student-powered agencies, creating a future where education and industry work seamlessly together.",
    content_type: "textarea",
    sort_order: 1,
  },

  // ── About / CTA ──
  {
    page: "about",
    section: "cta",
    content_key: "heading",
    content_value: "Want to Be Part of Our Story?",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "about",
    section: "cta",
    content_key: "description",
    content_value:
      "Whether you're a potential client or a student looking to join the team, we'd love to connect.",
    content_type: "textarea",
    sort_order: 1,
  },
  {
    page: "about",
    section: "cta",
    content_key: "getInTouch",
    content_value: "Get in Touch",
    content_type: "text",
    sort_order: 2,
  },
  {
    page: "about",
    section: "cta",
    content_key: "exploreServices",
    content_value: "Explore Services",
    content_type: "text",
    sort_order: 3,
  },

  // ── Services / Hero ──
  {
    page: "services",
    section: "hero",
    content_key: "badge",
    content_value: "What We Do",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "services",
    section: "hero",
    content_key: "heading",
    content_value: "Comprehensive Digital Services",
    content_type: "text",
    sort_order: 1,
  },
  {
    page: "services",
    section: "hero",
    content_key: "description",
    content_value:
      "From strategy to execution, we offer end-to-end digital services that help businesses establish their presence, engage their audience, and achieve measurable results.",
    content_type: "textarea",
    sort_order: 2,
  },

  // ── Services / CTA ──
  {
    page: "services",
    section: "cta",
    content_key: "heading",
    content_value: "Not Sure Which Service You Need?",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "services",
    section: "cta",
    content_key: "description",
    content_value:
      "We'll help you figure it out. Schedule a free consultation and we'll guide you toward the right solution.",
    content_type: "textarea",
    sort_order: 1,
  },
  {
    page: "services",
    section: "cta",
    content_key: "button",
    content_value: "Book a Consultation",
    content_type: "text",
    sort_order: 2,
  },

  // ── Services / Addons ──
  {
    page: "services",
    section: "addons",
    content_key: "title",
    content_value: "Additional Services",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "services",
    section: "addons",
    content_key: "description",
    content_value:
      "Services to help you rank better on Google and start working with a technically sound setup.",
    content_type: "textarea",
    sort_order: 1,
  },

  // ── Portfolio / Hero ──
  {
    page: "portfolio",
    section: "hero",
    content_key: "badge",
    content_value: "Our Work",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "portfolio",
    section: "hero",
    content_key: "heading",
    content_value: "Selected Projects",
    content_type: "text",
    sort_order: 1,
  },
  {
    page: "portfolio",
    section: "hero",
    content_key: "description",
    content_value:
      "A curated selection of projects that showcase our expertise across web development, e-commerce, branding, marketing, and UI/UX design.",
    content_type: "textarea",
    sort_order: 2,
  },

  // ── Team / Hero ──
  {
    page: "team",
    section: "hero",
    content_key: "badge",
    content_value: "Our Team",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "team",
    section: "hero",
    content_key: "heading",
    content_value: "Meet the People Behind the Work",
    content_type: "text",
    sort_order: 1,
  },
  {
    page: "team",
    section: "hero",
    content_key: "description",
    content_value:
      "A diverse team of passionate creators, engineers, and strategists dedicated to turning bold ideas into exceptional digital experiences.",
    content_type: "textarea",
    sort_order: 2,
  },

  // ── Team / Join ──
  {
    page: "team",
    section: "join",
    content_key: "heading",
    content_value: "Want to Join the Team?",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "team",
    section: "join",
    content_key: "description",
    content_value:
      "We're always looking for talented individuals who are passionate about digital creation. If that sounds like you, we'd love to hear from you.",
    content_type: "textarea",
    sort_order: 1,
  },

  // ── Contact / Hero ──
  {
    page: "contact",
    section: "hero",
    content_key: "badge",
    content_value: "Get in Touch",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "contact",
    section: "hero",
    content_key: "heading",
    content_value: "Let's Create Something Together",
    content_type: "text",
    sort_order: 1,
  },
  {
    page: "contact",
    section: "hero",
    content_key: "description",
    content_value:
      "Have a project in mind? We'd love to hear about it. Tell us about your vision and we'll get back to you within 24 hours.",
    content_type: "textarea",
    sort_order: 2,
  },

  // ── Contact / Info ──
  {
    page: "contact",
    section: "info",
    content_key: "email",
    content_value: "hello@bta-lab.com",
    content_type: "text",
    sort_order: 0,
  },
  {
    page: "contact",
    section: "info",
    content_key: "phone",
    content_value: "+1 (555) 123-4567",
    content_type: "text",
    sort_order: 1,
  },

  // ── Footer / Brand ──
  {
    page: "footer",
    section: "brand",
    content_key: "description",
    content_value:
      "A digital lab where we create modern websites, online stores, and digital solutions for business growth.",
    content_type: "textarea",
    sort_order: 0,
  },

  // ── Footer / Copyright ──
  {
    page: "footer",
    section: "copyright",
    content_key: "text",
    content_value: "© 2024 BTA LAB. All rights reserved.",
    content_type: "text",
    sort_order: 0,
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
    price: "$199",
    billing_label: "One-time payment",
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
    price: "$300",
    billing_label: "One-time payment",
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
    price: "$799",
    billing_label: "One-time payment",
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
    price: "$999",
    billing_label: "One-time payment",
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
    billing_label: "One-time payment",
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
    price: "$99",
    billing_label: "per month",
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
    price: "$150",
    billing_label: "per month",
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
    price: "$450",
    billing_label: "per month",
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
    price: "$800",
    billing_label: "per month",
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
    highlighted: true,
    custom_price: false,
    price_explanation: null,
    icon_name: null,
    display_order: 2,
    published: true,
  },
  {
    section: "social-media",
    name: "Full Social Media Management",
    price: "1500+ ₾ / month",
    billing_label: "per month",
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
    highlighted: false,
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
    price: "199 ₾-დან",
    billing_label: null,
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
    price: "99 ₾",
    billing_label: null,
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
    price: "79 ₾",
    billing_label: null,
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
    price: "49 ₾",
    billing_label: null,
    description: "Professional email setup using your own domain.",
    ideal_for: "info@yourbusiness.ge",
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
    price: "49 ₾",
    billing_label: null,
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

// ── Team Members ────────────────────────────────────────────────────────

interface TeamMemberSeed {
  name: string;
  role: string;
  bio: string;
  skills: string[];
  image: string;
  socials: Record<string, string>;
  display_order: number;
  published: boolean;
}

const teamMembers: TeamMemberSeed[] = [
  {
    name: "Alex Morgan",
    role: "Full Stack Developer",
    bio: "Full stack developer with expertise in React, Node.js, and cloud architecture. Passionate about building scalable web applications and mentoring junior developers.",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker"],
    image: "",
    socials: {
      linkedin: "https://linkedin.com/in/alexmorgan",
      github: "https://github.com/alexmorgan",
      twitter: "https://twitter.com/alexmorgan",
    },
    display_order: 0,
    published: true,
  },
  {
    name: "Sarah Chen",
    role: "Frontend Developer",
    bio: "Frontend specialist with a keen eye for design and performance. Expert in creating smooth, responsive interfaces using modern frameworks and animation libraries.",
    skills: ["Next.js", "Tailwind CSS", "Framer Motion", "TypeScript", "Figma"],
    image: "",
    socials: {
      linkedin: "https://linkedin.com/in/sarahchen",
      github: "https://github.com/sarahchen",
      website: "https://sarahchen.dev",
    },
    display_order: 1,
    published: true,
  },
  {
    name: "Marcus Johnson",
    role: "Backend Developer",
    bio: "Backend engineer specializing in API design, database optimization, and serverless architecture. Ensures every application runs efficiently at scale.",
    skills: ["Python", "Django", "PostgreSQL", "Redis", "GraphQL", "Docker"],
    image: "",
    socials: {
      linkedin: "https://linkedin.com/in/marcusjohnson",
      github: "https://github.com/marcusjohnson",
    },
    display_order: 2,
    published: true,
  },
  {
    name: "Emily Rodriguez",
    role: "UI/UX Designer",
    bio: "Designer focused on creating intuitive, user-centered interfaces. Combines research-driven design with visual excellence to craft memorable digital experiences.",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Usability Testing"],
    image: "",
    socials: {
      linkedin: "https://linkedin.com/in/emilyrodriguez",
      twitter: "https://twitter.com/emilyrodriguez",
      website: "https://emilyrodriguez.design",
    },
    display_order: 3,
    published: true,
  },
  {
    name: "Jordan Lee",
    role: "Graphic Designer",
    bio: "Creative designer specializing in brand identity, visual communication, and print design. Turns complex ideas into beautiful, memorable visuals.",
    skills: ["Illustrator", "Photoshop", "After Effects", "Brand Identity", "Typography"],
    image: "",
    socials: {
      linkedin: "https://linkedin.com/in/jordanlee",
      instagram: "https://instagram.com/jordanlee.design",
    },
    display_order: 4,
    published: true,
  },
  {
    name: "Taylor Kim",
    role: "Video Editor",
    bio: "Video production specialist with expertise in storytelling, motion graphics, and post-production. Creates compelling visual narratives for brands and campaigns.",
    skills: ["Premiere Pro", "After Effects", "DaVinci Resolve", "Motion Graphics", "Color Grading"],
    image: "",
    socials: {
      linkedin: "https://linkedin.com/in/taylorkim",
      website: "https://taylorkim.video",
    },
    display_order: 5,
    published: true,
  },
  {
    name: "Priya Patel",
    role: "Digital Marketer",
    bio: "Data-driven marketer specializing in growth strategies, SEO, and conversion optimization. Helps businesses reach their ideal audience and drive measurable results.",
    skills: ["SEO", "Google Analytics", "Content Strategy", "PPC", "Email Marketing"],
    image: "",
    socials: {
      linkedin: "https://linkedin.com/in/priyapatel",
      twitter: "https://twitter.com/priyapatel",
    },
    display_order: 6,
    published: true,
  },
  {
    name: "Dylan Okonkwo",
    role: "Social Media Manager",
    bio: "Social media strategist with a passion for building communities and crafting content that resonates. Expert in multi-platform brand presence and audience growth.",
    skills: ["Content Strategy", "Community Management", "Analytics", "Meta Ads", "Brand Voice"],
    image: "",
    socials: {
      linkedin: "https://linkedin.com/in/dylanokonkwo",
      instagram: "https://instagram.com/dylanokonkwo",
    },
    display_order: 7,
    published: true,
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
  const supportsBilingualCms = await Promise.all([
    tableHasColumn("site_content", "value_ka"),
    tableHasColumn("portfolio_projects", "title_ka"),
    tableHasColumn("service_packages", "name_ka"),
    tableHasColumn("service_packages", "cta_label_en"),
    tableHasColumn("team_members", "name_ka"),
    tableHasColumn("site_settings", "value_ka"),
  ]).then((checks) => checks.every(Boolean));

  if (supportsBilingualCms) {
    console.log("  ℹ  Bilingual CMS columns detected");
  } else {
    console.log("  ℹ  Bilingual CMS columns not detected; seeding legacy columns only");
  }

  // ── 1. Resolve Admin Auth User ───────────────────────────────────

  console.log("  ── Checking Supabase Auth user ───────────────");

  let adminUserId: string;

  try {
    const resolved = await resolveAdminUser();
    adminUserId = resolved.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗  ${message}`);
    process.exit(1);
  }

  // ── 2. Upsert Admin Profile ───────────────────────────────────────

  console.log("");
  console.log("  ── Admin Profile ──────────────────────────");

  try {
    const { error: profileError } = await supabase
      .from("admin_profiles")
      .upsert(
        {
          id: adminUserId,
          email: normalizedEmail,
          display_name: adminDisplayName,
        } as never,
        { onConflict: "id" }
      );

    if (profileError) {
      console.error(`  ✗  Admin profile upsert failed: ${profileError.message}`);
      hasError = true;
    } else {
      console.log("  ✓  Admin profile upserted");
      counts["Admin profiles"] = 1;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗  Admin profile upsert failed: ${message}`);
    hasError = true;
  }

  console.log("");

  // ── 3. Site Settings ──────────────────────────────────────────────

  console.log("  ── Site Settings ───────────────────────────");

  for (const setting of siteSettings) {
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert(withBilingualSetting(setting, supportsBilingualCms) as never, { onConflict: "setting_key" });

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

  for (const entry of siteContent) {
    try {
      const { error } = await supabase
        .from("site_content")
        .upsert(withBilingualContent(entry, supportsBilingualCms) as never, { onConflict: "page, section, content_key" });

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
        .upsert(withBilingualCategory(cat, supportsBilingualCms) as never, { onConflict: "slug" });

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
            ...withBilingualProject(project, supportsBilingualCms),
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
          ...withBilingualServicePackage(pkg, supportsBilingualCms),
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

  // ── 8. Team Members ───────────────────────────────────────────────

  console.log("");
  console.log("  ── Team Members ─────────────────────────────");

  for (const member of teamMembers) {
    try {
      const id = deterministicId(`team-member-${member.name}`);
      const { error } = await supabase.from("team_members").upsert(
          {
          id,
          ...withBilingualTeamMember(member, supportsBilingualCms),
          skills: member.skills,
          socials: member.socials,
        } as never,
        { onConflict: "id" }
      );

      if (error) {
        console.error(`  ✗  ${member.name}: ${error.message}`);
        hasError = true;
      } else {
        counts["Team members"] = (counts["Team members"] || 0) + 1;
      }
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
