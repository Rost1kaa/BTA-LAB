import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { siteConfig, stats as hardcodedStats } from "@/data/site";
import { projects as hardcodedProjects } from "@/data/projects";
import { teamMembers as hardcodedTeam } from "@/data/team";
import { pricingData } from "@/data/pricing";
import { getServicePackageKaLocalization } from "@/data/service-package-localizations";
import type { PortfolioProject, TeamMember, ServicePackage } from "@/types/supabase";
import {
  getLocalizedArray,
  getLocalizedText,
  localizeContentRows,
  type LocaleCode,
} from "@/lib/localized-fields";

// ── Helpers ──

const LEGACY_QEY_COVER = "/images/projects/qey-cover.jpg";
const QEY_COVER = "/images/qey_ge.webp";

function normalizeProject(project: PortfolioProject): PortfolioProject {
  return project.cover_image === LEGACY_QEY_COVER
    ? { ...project, cover_image: QEY_COVER }
    : project;
}

function normalizeTeamMember(member: TeamMember): TeamMember {
  return /^\/images\/team\/member-[1-8]\.jpg$/.test(member.image)
    ? { ...member, image: "" }
    : member;
}

function localizeProject(project: PortfolioProject, locale: LocaleCode): PortfolioProject {
  const record = project as unknown as Record<string, unknown>;
  return {
    ...project,
    title: getLocalizedText(record, "title", locale),
    category_label: getLocalizedText(record, "category_label", locale, "category"),
    description: getLocalizedText(record, "description", locale),
    full_description: getLocalizedText(record, "full_description", locale),
    problem: getLocalizedText(record, "problem", locale),
    solution: getLocalizedText(record, "solution", locale),
    results: getLocalizedArray(record, "results", locale),
    alt_text: getLocalizedText(record, "alt_text", locale),
    seo_title: getLocalizedText(record, "seo_title", locale) || null,
    seo_description: getLocalizedText(record, "seo_description", locale) || null,
  };
}

function localizeTeamMember(member: TeamMember, locale: LocaleCode): TeamMember {
  const record = member as unknown as Record<string, unknown>;
  return {
    ...member,
    name: getLocalizedText(record, "name", locale),
    role: getLocalizedText(record, "role", locale),
    bio: getLocalizedText(record, "bio", locale),
    skills: getLocalizedArray(record, "skills", locale),
    image_alt: getLocalizedText(record, "image_alt", locale, "name"),
  };
}

function hasLocalizedServiceText(record: Record<string, unknown>, field: string, locale: LocaleCode) {
  const fallbackLocale: LocaleCode = locale === "ka" ? "en" : "ka";
  const localized = typeof record[`${field}_${locale}`] === "string" ? String(record[`${field}_${locale}`]).trim() : "";
  const fallback = typeof record[`${field}_${fallbackLocale}`] === "string" ? String(record[`${field}_${fallbackLocale}`]).trim() : "";
  const legacy = typeof record[field] === "string" ? String(record[field]).trim() : "";
  return Boolean(localized && localized !== fallback && localized !== legacy);
}

function hasLocalizedServiceArray(record: Record<string, unknown>, field: string, locale: LocaleCode) {
  const fallbackLocale: LocaleCode = locale === "ka" ? "en" : "ka";
  const localized = Array.isArray(record[`${field}_${locale}`]) ? record[`${field}_${locale}`] as unknown[] : [];
  const fallback = Array.isArray(record[`${field}_${fallbackLocale}`]) ? record[`${field}_${fallbackLocale}`] as unknown[] : [];
  const legacy = Array.isArray(record[field]) ? record[field] as unknown[] : [];
  return localized.length > 0
    && JSON.stringify(localized) !== JSON.stringify(fallback)
    && JSON.stringify(localized) !== JSON.stringify(legacy);
}

function localizeServicePrice(pkg: ServicePackage, record: Record<string, unknown>, locale: LocaleCode) {
  const customLabel = getLocalizedText(record, "custom_price_label", locale);
  const suffix = getLocalizedText(record, "price_suffix", locale);

  if (pkg.custom_price && customLabel) {
    return customLabel;
  }

  if (!suffix || pkg.price.endsWith(suffix)) {
    return pkg.price;
  }

  return `${pkg.price}${suffix}`;
}

function localizeServicePackage(pkg: ServicePackage, locale: LocaleCode): ServicePackage {
  const record = pkg as unknown as Record<string, unknown>;
  const localized = {
    ...pkg,
    name: getLocalizedText(record, "name", locale),
    price: localizeServicePrice(pkg, record, locale),
    billing_label: getLocalizedText(record, "billing_label", locale) || null,
    description: getLocalizedText(record, "description", locale) || null,
    ideal_for: getLocalizedText(record, "ideal_for", locale) || null,
    features: getLocalizedArray(record, "features", locale),
    delivery_time: getLocalizedText(record, "delivery_time", locale) || null,
    cta: getLocalizedText(record, "cta_label", locale, "cta") || getLocalizedText(record, "cta", locale),
    price_explanation: getLocalizedText(record, "price_explanation", locale) || null,
  };

  if (locale !== "ka") return localized;

  const englishName = pkg.name_en || pkg.name;
  const ka = getServicePackageKaLocalization(pkg.section, englishName);

  if (!ka) return localized;

  return {
    ...localized,
    name: hasLocalizedServiceText(record, "name", "ka") ? localized.name : ka.name,
    price: hasLocalizedServiceText(record, "price_suffix", "ka") || hasLocalizedServiceText(record, "custom_price_label", "ka")
      ? localized.price
      : ka.price || localized.price,
    billing_label: hasLocalizedServiceText(record, "billing_label", "ka") ? localized.billing_label : ka.billingLabel ?? localized.billing_label,
    description: hasLocalizedServiceText(record, "description", "ka") ? localized.description : ka.description ?? localized.description,
    ideal_for: hasLocalizedServiceText(record, "ideal_for", "ka") ? localized.ideal_for : ka.idealFor ?? localized.ideal_for,
    features: hasLocalizedServiceArray(record, "features", "ka") ? localized.features : ka.features ?? localized.features,
    delivery_time: hasLocalizedServiceText(record, "delivery_time", "ka") ? localized.delivery_time : ka.deliveryTime ?? localized.delivery_time,
    cta: hasLocalizedServiceText(record, "cta_label", "ka") ? localized.cta : ka.cta ?? localized.cta,
    price_explanation: hasLocalizedServiceText(record, "price_explanation", "ka") ? localized.price_explanation : ka.priceExplanation ?? localized.price_explanation,
  };
}

// ── Fallback data ──

const fallbackProjects: PortfolioProject[] = hardcodedProjects.map((project, index) => ({
  id: project.id,
  title: project.title,
  slug: project.slug,
  category_id: null,
  category: project.category,
  description: project.description,
  full_description: project.fullDescription,
  problem: project.problem,
  solution: project.solution,
  results: project.results,
  technologies: project.technologies,
  cover_image: project.coverImage,
  gallery: project.gallery,
  link: project.link || null,
  featured: project.featured,
  published: true,
  display_order: index,
  alt_text: `${project.title} full website preview`,
  seo_title: null,
  seo_description: null,
  created_at: "",
  updated_at: "",
  created_by: null,
  updated_by: null,
}));

const fallbackTeam: TeamMember[] = hardcodedTeam.map((member, index) => ({
  ...member,
  image: member.image || "",
  display_order: index,
  published: true,
  created_at: "",
  updated_at: "",
  updated_by: null,
}));

const fallbackServices: ServicePackage[] = [
  ...pricingData.website.packages.map((item, index) => ({
    id: item.id,
    section: "website",
    name: item.name,
    price: item.price,
    billing_label: item.billingLabel || null,
    description: item.description || null,
    ideal_for: item.idealFor || null,
    features: item.features,
    delivery_time: item.deliveryTime || null,
    cta: item.cta,
    highlighted: item.highlighted || false,
    custom_price: item.customPrice || false,
    price_explanation: item.priceExplanation || null,
    icon_name: item.iconName || null,
    display_order: index,
    published: true,
    created_at: "",
    updated_at: "",
    updated_by: null,
  })),
  ...pricingData.socialMedia.packages.map((item, index) => ({
    id: item.id,
    section: "social-media",
    name: item.name,
    price: item.price,
    billing_label: item.billingLabel || null,
    description: item.description || null,
    ideal_for: item.idealFor || null,
    features: item.features,
    delivery_time: item.deliveryTime || null,
    cta: item.cta,
    highlighted: item.highlighted || false,
    custom_price: item.customPrice || false,
    price_explanation: item.priceExplanation || null,
    icon_name: item.iconName || null,
    display_order: index,
    published: true,
    created_at: "",
    updated_at: "",
    updated_by: null,
  })),
  ...pricingData.addons.map((item, index) => ({
    id: item.id,
    section: "addons",
    name: item.name,
    price: item.price,
    billing_label: null,
    description: item.description,
    ideal_for: item.example || null,
    features: [],
    delivery_time: null,
    cta: "Choose Add-on",
    highlighted: false,
    custom_price: false,
    price_explanation: null,
    icon_name: item.iconName || null,
    display_order: index,
    published: true,
    created_at: "",
    updated_at: "",
    updated_by: null,
  })),
];

// ── Server-side Content Map ──
// Returns { section: { key: value } }

const getCachedContentRows = unstable_cache(
  async (page: string) => {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("*")
      .eq("page", page);

    if (error) throw error;
    return (data || []) as Array<Record<string, unknown>>;
  },
  ["cms-content"],
  { tags: ["cms-content"], revalidate: 3600 }
);

export const getContentMapServer = cache(async (page: string, locale: LocaleCode = "ka") => {
  try {
    const data = await getCachedContentRows(page);
    return localizeContentRows(data, locale);
  } catch {
    return {};
  }
})

// ── Server-side Settings ──

const getCachedSettingsRows = unstable_cache(
  async () => {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*");

    if (error) throw error;
    return (data || []) as Array<Record<string, unknown>>;
  },
  ["cms-settings"],
  { tags: ["cms-settings"], revalidate: 3600 }
);

export const getSettingsServer = cache(async (locale: LocaleCode = "ka") => {
  try {
    const rows = await getCachedSettingsRows();
    const localizedSettingKeys = new Set([
      "site_description",
      "contact_address",
      "contact_location",
      "contact_availability",
      "copyright_text",
    ]);

    return Object.fromEntries(rows.map((row) => {
      const key = String(row.setting_key || "");
      const isLocalized = localizedSettingKeys.has(key);
      const value = isLocalized
        ? getLocalizedText(row, "value", locale, locale === "ka" ? "value" : "setting_value")
        : getLocalizedText(row, "value", "en", "setting_value");
      return [key, value];
    }).filter(([key]) => key));
  } catch {
    return {};
  }
})

// ── Server-side Published Projects ──

const getCachedPublishedProjects = unstable_cache(
  async () => {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("published", true)
      .order("display_order")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ((data || []) as PortfolioProject[]).map(normalizeProject);
  },
  ["cms-projects-published"],
  { tags: ["cms-projects"], revalidate: 3600 }
);

export const getPublishedProjectsServer = cache(async (locale: LocaleCode = "ka") => {
  try {
    const data = await getCachedPublishedProjects();
    return data.map((project) => localizeProject(project, locale));
  } catch {
    return fallbackProjects.filter((p) => p.published).map((project) => localizeProject(project, locale));
  }
})

// ── Server-side Featured Projects ──

const getCachedFeaturedProjects = unstable_cache(
  async () => {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("featured", true)
      .eq("published", true)
      .order("display_order")
      .limit(6);

    if (error) throw error;
    return ((data || []) as PortfolioProject[]).map(normalizeProject);
  },
  ["cms-projects-featured"],
  { tags: ["cms-projects"], revalidate: 3600 }
);

export const getFeaturedProjectsServer = cache(async (locale: LocaleCode = "ka") => {
  try {
    const data = await getCachedFeaturedProjects();
    return data.map((project) => localizeProject(project, locale));
  } catch {
    return fallbackProjects.filter((p) => p.featured).map((project) => localizeProject(project, locale));
  }
})

// ── Server-side Single Project ──

export const getProjectBySlugServer = cache(async (slug: string, locale: LocaleCode = "ka") => {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error) throw error;
    return data ? localizeProject(normalizeProject(data as PortfolioProject), locale) : null;
  } catch {
    const project = fallbackProjects.find((p) => p.slug === slug);
    return project ? localizeProject(project, locale) : null;
  }
})

// ── Server-side Team Members ──

const getCachedTeamMembers = unstable_cache(
  async (publishedOnly: boolean) => {
    const supabase = createServiceRoleClient();
    let query = supabase
      .from("team_members")
      .select("*")
      .order("display_order");

    if (publishedOnly) {
      query = query.eq("published", true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return ((data || []) as TeamMember[]).map(normalizeTeamMember);
  },
  ["cms-team"],
  { tags: ["cms-team", "cms-stats"], revalidate: 3600 }
);

export const getTeamMembersServer = cache(async (publishedOnly = true, locale: LocaleCode = "ka") => {
  try {
    const data = await getCachedTeamMembers(publishedOnly);
    return data.map((member) => localizeTeamMember(member, locale));
  } catch {
    return fallbackTeam.map((member) => localizeTeamMember(member, locale));
  }
})

// ── Server-side Service Packages ──

const getCachedServicePackages = unstable_cache(
  async (section?: string) => {
    const supabase = createServiceRoleClient();
    let query = supabase
      .from("service_packages")
      .select("*")
      .eq("published", true)
      .order("display_order");

    if (section) {
      query = query.eq("section", section);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as ServicePackage[];
  },
  ["cms-services"],
  { tags: ["cms-services", "cms-stats"], revalidate: 3600 }
);

export const getServicePackagesServer = cache(async (section?: string, locale: LocaleCode = "ka") => {
  try {
    const data = await getCachedServicePackages(section);
    return data.map((pkg) => localizeServicePackage(pkg, locale));
  } catch {
    if (section) {
      return fallbackServices.filter((item) => item.section === section).map((pkg) => localizeServicePackage(pkg, locale));
    }
    return fallbackServices.map((pkg) => localizeServicePackage(pkg, locale));
  }
})

// ── Server-side Stats ──

const getCachedStatsData = unstable_cache(
  async () => {
    const supabase = createServiceRoleClient();
    const [teamResult, servicesResult, settingsResult] = await Promise.all([
      supabase.from("team_members").select("*", { count: "exact", head: true }),
      supabase.from("service_packages").select("*", { count: "exact", head: true }),
      supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", [
          "stat_completed_projects",
          "stat_technologies",
        ]),
    ]);

    if (teamResult.error || servicesResult.error || settingsResult.error) {
      throw teamResult.error || servicesResult.error || settingsResult.error;
    }

    return {
      teamMembersCount: teamResult.count ?? 0,
      servicesCount: servicesResult.count ?? 0,
      settings: (settingsResult.data || []) as Array<{ setting_key: string; setting_value: string }>,
    };
  },
  ["cms-stats"],
  { tags: ["cms-stats", "cms-settings"], revalidate: 3600 }
);

export const getStatsServer = cache(async () => {
  let teamMembersCount = 0;
  let servicesCount = 0;

  try {
    const data = await getCachedStatsData();
    teamMembersCount = data.teamMembersCount;
    servicesCount = data.servicesCount;

    if (data.settings.length > 0) {
      const map: Record<string, string> = {};
      data.settings.forEach(
        (s) => (map[s.setting_key] = s.setting_value)
      );

      return [
        {
          label: "Team Members",
          value: teamMembersCount,
          translationKey: "teamMembers" as const,
        },
        {
          label: "Completed Projects",
          value: parseInt(map.stat_completed_projects) || 48,
          suffix: "+",
          translationKey: "completedProjects" as const,
        },
        {
          label: "Services",
          value: servicesCount,
          translationKey: "services" as const,
        },
        {
          label: "Technologies",
          value: parseInt(map.stat_technologies) || 20,
          suffix: "+",
          translationKey: "technologies" as const,
        },
      ];
    }
  } catch {
    // Fall through to static stats for the unchanged counters.
  }

  return hardcodedStats.map((stat) => {
    if (stat.translationKey === "teamMembers") {
      return { ...stat, value: teamMembersCount };
    }

    if (stat.translationKey === "services") {
      return { ...stat, value: servicesCount };
    }

    return stat;
  });
})

// ── Server-side Site Config ──

export const getSiteConfigServer = cache(async (locale: LocaleCode = "ka") => {
  const settings = await getSettingsServer(locale);
  return {
    ...siteConfig,
    email: settings.contact_email || siteConfig.email,
    phone: settings.contact_phone || siteConfig.phone,
    address: settings.contact_address || (locale === "ka" ? "თბილისი, საქართველო" : siteConfig.address),
    location: settings.contact_location || (locale === "ka" ? "თბილისი, საქართველო" : siteConfig.location),
    availability: settings.contact_availability || (locale === "ka" ? "ვმუშაობთ ონლაინ" : siteConfig.availability),
    socials: {
      facebook: settings.social_facebook || siteConfig.socials.facebook,
      instagram: settings.social_instagram || siteConfig.socials.instagram,
    },
  };
})
