"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PortfolioProject, TeamMember, ServicePackage } from "@/types/supabase";
import type { LocaleCode } from "@/lib/localized-fields";

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

// ── Content map hook (section-grouped) ──
// Returns { section: { key: value } }
export function useContentMap(page: string, locale: LocaleCode = "ka") {
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchContent() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("site_content")
          .select("section, content_key, content_value_ka, content_value_en")
          .eq("page", page);

        if (error) throw error;
        if (mounted && data) {
          const grouped: Record<string, Record<string, string>> = {};
          data.forEach((item: { section: string; content_key: string; content_value_ka?: string; content_value_en?: string }) => {
            if (!grouped[item.section]) grouped[item.section] = {};
            grouped[item.section][item.content_key] =
              locale === "ka" ? item.content_value_ka || "" : item.content_value_en || "";
          });
          setContent(grouped);
        }
      } catch {
        // Silently fail
      } finally {
        if (mounted) setLoaded(true);
      }
    }

    fetchContent();
    return () => { mounted = false; };
  }, [page, locale]);

  return { content, loaded };
}

// ── Settings hook ──
export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchSettings() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("site_settings").select("setting_key, setting_value");
        if (error) throw error;
        if (mounted && data) {
          const map: Record<string, string> = {};
          (data as Array<{ setting_key: string; setting_value: string }>).forEach((s) => (map[s.setting_key] = s.setting_value));
          setSettings(map);
        }
      } catch {
        // Silently fail
      } finally {
        if (mounted) setLoaded(true);
      }
    }

    fetchSettings();
    return () => { mounted = false; };
  }, []);

  return { settings, loaded };
}

// ── Portfolio projects hook ──
export function usePortfolioProjects(publishedOnly = true) {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchProjects() {
      try {
        const supabase = createClient();
        let query = supabase
          .from("portfolio_projects")
          .select("*")
          .order("display_order")
          .order("created_at", { ascending: false });

        if (publishedOnly) {
          query = query.eq("published", true);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (mounted) {
          setProjects((data || []).map(normalizeProject));
        }
      } catch {
        // Silently fail — use empty array
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProjects();
    return () => { mounted = false; };
  }, [publishedOnly]);

  return { projects, loading };
}

// ── Featured projects hook ──
export function useFeaturedProjects() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchFeatured() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("featured", true)
          .eq("published", true)
          .order("display_order")
          .limit(6);

        if (error) throw error;
        if (mounted) setProjects((data || []).map(normalizeProject));
      } catch {
        // Silently fail — use empty array
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchFeatured();
    return () => { mounted = false; };
  }, []);

  return { projects, loading };
}

// ── Single project hook ──
export function useProject(slug: string) {
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchProject() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle();

        if (error) throw error;
        if (mounted) setProject(data ? normalizeProject(data) : null);
      } catch {
        // Silently fail — return null
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProject();
    return () => { mounted = false; };
  }, [slug]);

  return { project, loading };
}

// ── Team members hook ──
export function useTeamMembers(publishedOnly = true) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchMembers() {
      try {
        const supabase = createClient();
        let query = supabase
          .from("team_members")
          .select("*")
          .order("display_order");

        if (publishedOnly) {
          query = query.eq("published", true);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (mounted) setMembers((data || []).map(normalizeTeamMember));
      } catch {
        // Silently fail — use empty array
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchMembers();
    return () => { mounted = false; };
  }, [publishedOnly]);

  return { members, loading };
}

// ── Service packages hook ──
export function useServicePackages(section?: string) {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchPackages() {
      try {
        const supabase = createClient();
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

        if (mounted) setPackages(data || []);
      } catch {
        // Silently fail — use empty array
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPackages();
    return () => { mounted = false; };
  }, [section]);

  return { packages, loading };
}

// ── Stats hook ──
export function useStats() {
  const [stats, setStats] = useState<Array<{ label: string; value: number; suffix?: string; translationKey?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const supabase = createClient();
        const [settingsResult, teamResult, servicesResult] = await Promise.all([
          supabase.from("site_settings").select("setting_key, setting_value")
            .in("setting_key", ["stat_completed_projects", "stat_technologies"]),
          supabase.from("team_members").select("*", { count: "exact", head: true }),
          supabase.from("service_packages").select("*", { count: "exact", head: true }),
        ]);

        if (settingsResult.error || teamResult.error || servicesResult.error) {
          throw settingsResult.error || teamResult.error || servicesResult.error;
        }

        if (mounted) {
          const map: Record<string, string> = {};
          ((settingsResult.data || []) as Array<{ setting_key: string; setting_value: string }>).forEach((s) => (map[s.setting_key] = s.setting_value));

          setStats([
            { label: "Team Members", value: teamResult.count ?? 0, translationKey: "teamMembers" },
            { label: "Completed Projects", value: parseInt(map.stat_completed_projects) || 0, suffix: "+", translationKey: "completedProjects" },
            { label: "Services", value: servicesResult.count ?? 0, translationKey: "services" },
            { label: "Technologies", value: parseInt(map.stat_technologies) || 0, suffix: "+", translationKey: "technologies" },
          ]);
        }
      } catch {
        // Use empty stats
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchStats();
    return () => { mounted = false; };
  }, []);

  return { stats, loading };
}

// ── Site config hook ──
export function useSiteConfig() {
  const { settings, loaded } = useSettings();

  return {
    name: settings.site_name || "",
    tagline: "We help small businesses grow.",
    description: settings.site_description || "",
    phone: settings.contact_phone || "",
    address: settings.contact_address || "",
    location: settings.contact_location || "",
    socials: {
      facebook: settings.social_facebook || "",
      instagram: settings.social_instagram || "",
    },
  };
}
