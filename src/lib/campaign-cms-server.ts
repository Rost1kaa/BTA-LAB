import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { LocaleCode } from "@/lib/localized-fields";
import type {
  CampaignPage,
  CampaignSection,
  CampaignFAQ,
  CampaignCard,
  CampaignTimelineItem,
  CampaignStatistic,
  CampaignCTA,
  CampaignSetting,
  CampaignSEO,
  CampaignApplication,
} from "./campaign-types";

// ── Generic Cached Fetcher ─────────────────────────────────────────────

function createCampaignFetcher<T>(
  tag: string,
  fetcher: () => Promise<T[]>
) {
  return unstable_cache(
    fetcher,
    [`campaign-${tag}`],
    { revalidate: 60, tags: [`campaign-${tag}`] }
  );
}

// ── Campaign Pages ──────────────────────────────────────────────────────

const getCachedCampaignPages = createCampaignFetcher<CampaignPage>(
  "pages",
  async () => {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("campaign_pages")
      .select("*")
      .eq("is_active", true)
      .order("created_at");

    if (error) throw error;
    return (data || []) as CampaignPage[];
  }
);

export const getCampaignPagesServer = cache(async () => {
  try {
    return await getCachedCampaignPages();
  } catch {
    return [];
  }
});

// ── Campaign Sections ───────────────────────────────────────────────────

const getCachedCampaignSections = createCampaignFetcher<CampaignSection>(
  "sections",
  async () => {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("campaign_sections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error) throw error;
    return (data || []) as CampaignSection[];
  }
);

export const getCampaignSectionsServer = cache(async (pageSlug: string) => {
  try {
    const all = await getCachedCampaignSections();
    return all.filter((s) => s.page_slug === pageSlug);
  } catch {
    return [];
  }
});

// ── Campaign FAQ ────────────────────────────────────────────────────────

const getCachedCampaignFAQ = createCampaignFetcher<CampaignFAQ>(
  "faq",
  async () => {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("campaign_faq")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error) throw error;
    return (data || []) as CampaignFAQ[];
  }
);

export const getCampaignFAQServer = cache(async (pageSlug: string) => {
  try {
    const all = await getCachedCampaignFAQ();
    return all.filter((item) => item.page_slug === pageSlug);
  } catch {
    return [];
  }
});

// ── Campaign Cards ──────────────────────────────────────────────────────

const getCachedCampaignCards = createCampaignFetcher<CampaignCard>(
  "cards",
  async () => {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("campaign_cards")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error) throw error;
    return (data || []) as CampaignCard[];
  }
);

export const getCampaignCardsServer = cache(async (pageSlug: string, sectionKey?: string) => {
  try {
    const all = await getCachedCampaignCards();
    let filtered = all.filter((c) => c.page_slug === pageSlug);
    if (sectionKey) {
      filtered = filtered.filter((c) => c.section_key === sectionKey);
    }
    return filtered;
  } catch {
    return [];
  }
});

// ── Campaign Timeline ───────────────────────────────────────────────────

const getCachedCampaignTimeline = createCampaignFetcher<CampaignTimelineItem>(
  "timeline",
  async () => {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("campaign_timeline")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error) throw error;
    return (data || []) as CampaignTimelineItem[];
  }
);

export const getCampaignTimelineServer = cache(async (pageSlug: string, sectionKey?: string) => {
  try {
    const all = await getCachedCampaignTimeline();
    let filtered = all.filter((t) => t.page_slug === pageSlug);
    if (sectionKey) {
      filtered = filtered.filter((t) => t.section_key === sectionKey);
    }
    return filtered;
  } catch {
    return [];
  }
});

// ── Campaign Statistics ─────────────────────────────────────────────────

const getCachedCampaignStatistics = createCampaignFetcher<CampaignStatistic>(
  "statistics",
  async () => {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("campaign_statistics")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error) throw error;
    return (data || []) as CampaignStatistic[];
  }
);

export const getCampaignStatisticsServer = cache(async (pageSlug: string, sectionKey?: string) => {
  try {
    const all = await getCachedCampaignStatistics();
    let filtered = all.filter((s) => s.page_slug === pageSlug);
    if (sectionKey) {
      filtered = filtered.filter((s) => s.section_key === sectionKey);
    }
    return filtered;
  } catch {
    return [];
  }
});

// ── Campaign CTA ────────────────────────────────────────────────────────

const getCachedCampaignCTA = createCampaignFetcher<CampaignCTA>(
  "cta",
  async () => {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("campaign_cta")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;
    return (data || []) as CampaignCTA[];
  }
);

export const getCampaignCTAServer = cache(async (pageSlug: string, sectionKey?: string) => {
  try {
    const all = await getCachedCampaignCTA();
    let filtered = all.filter((c) => c.page_slug === pageSlug);
    if (sectionKey) {
      filtered = filtered.filter((c) => c.section_key === sectionKey);
    }
    return filtered;
  } catch {
    return [];
  }
});

// ── Campaign Settings ───────────────────────────────────────────────────

const getCachedCampaignSettings = createCampaignFetcher<CampaignSetting>(
  "settings",
  async () => {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("campaign_settings")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;
    return (data || []) as CampaignSetting[];
  }
);

export const getCampaignSettingsServer = cache(async (locale: LocaleCode = "ka") => {
  try {
    const all = await getCachedCampaignSettings();
    const result: Record<string, string> = {};
    for (const setting of all) {
      result[setting.setting_key] = locale === "ka"
        ? setting.setting_value_ka
        : setting.setting_value_en;
    }
    return result;
  } catch {
    return {};
  }
});

// ── Campaign SEO ────────────────────────────────────────────────────────

const getCachedCampaignSEO = createCampaignFetcher<CampaignSEO>(
  "seo",
  async () => {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("campaign_seo")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;
    return (data || []) as CampaignSEO[];
  }
);

export const getCampaignSEOServer = cache(async (pageSlug: string) => {
  try {
    const all = await getCachedCampaignSEO();
    return all.find((s) => s.page_slug === pageSlug) || null;
  } catch {
    return null;
  }
});

// ── Campaign Details (for current_step, etc.) ────────────────────────────

export interface CampaignDetailsData {
  current_step: number;
}

export const getCampaignDetailsServer = cache(async (): Promise<CampaignDetailsData | null> => {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await (supabase as any)
      .from("campaign_details")
      .select("current_step")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;
    return data as CampaignDetailsData | null;
  } catch {
    return null;
  }
});

// ── Campaign Application ────────────────────────────────────────────────

export const getCampaignApplicationServer = cache(async (applicationNumber: string) => {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("campaign_applications")
      .select("*")
      .eq("application_number", applicationNumber)
      .maybeSingle();

    if (error) throw error;
    return (data || null) as CampaignApplication | null;
  } catch {
    return null;
  }
});

export const getCampaignApplicationStatusHistoryServer = cache(async (applicationId: string) => {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("campaign_application_status_history")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
});

// ── Campaign All-in-One Loader ──────────────────────────────────────────

export interface CampaignLandingData {
  sections: CampaignSection[];
  faq: CampaignFAQ[];
  cards: Record<string, CampaignCard[]>;
  timeline: Record<string, CampaignTimelineItem[]>;
  statistics: Record<string, CampaignStatistic[]>;
  cta: Record<string, CampaignCTA[]>;
  settings: Record<string, string>;
  seo: CampaignSEO | null;
}

export const getCampaignLandingDataServer = cache(async (
  pageSlug: string,
  locale: LocaleCode = "ka"
): Promise<CampaignLandingData> => {
  const [sections, faq, allCards, allTimeline, allStats, allCta, settings, seo] = await Promise.all([
    getCampaignSectionsServer(pageSlug),
    getCampaignFAQServer(pageSlug),
    getCampaignCardsServer(pageSlug),
    getCampaignTimelineServer(pageSlug),
    getCampaignStatisticsServer(pageSlug),
    getCampaignCTAServer(pageSlug),
    getCampaignSettingsServer(locale),
    getCampaignSEOServer(pageSlug),
  ]);

  // Group cards, timeline, statistics, cta by section_key
  const cards: Record<string, CampaignCard[]> = {};
  for (const card of allCards) {
    if (!cards[card.section_key]) cards[card.section_key] = [];
    cards[card.section_key].push(card);
  }

  const timeline: Record<string, CampaignTimelineItem[]> = {};
  for (const item of allTimeline) {
    if (!timeline[item.section_key]) timeline[item.section_key] = [];
    timeline[item.section_key].push(item);
  }

  const statistics: Record<string, CampaignStatistic[]> = {};
  for (const stat of allStats) {
    if (!statistics[stat.section_key]) statistics[stat.section_key] = [];
    statistics[stat.section_key].push(stat);
  }

  const cta: Record<string, CampaignCTA[]> = {};
  for (const c of allCta) {
    if (!cta[c.section_key]) cta[c.section_key] = [];
    cta[c.section_key].push(c);
  }

  return { sections, faq, cards, timeline, statistics, cta, settings, seo };
});
