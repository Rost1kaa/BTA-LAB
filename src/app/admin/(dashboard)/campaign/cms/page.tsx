import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Edit, Eye, Plus, FileText, MessageSquare, Layout, List } from "lucide-react";

async function getCMSStats() {
  const supabase = createServiceRoleClient();
  const [sections, faq, cards, timeline, stats, cta] = await Promise.all([
    supabase.from("campaign_sections").select("id, section_key, title_ka, is_active").eq("page_slug", "entrepreneur-support").order("sort_order"),
    supabase.from("campaign_faq").select("id", { count: "exact", head: true }).eq("page_slug", "entrepreneur-support"),
    supabase.from("campaign_cards").select("id", { count: "exact", head: true }).eq("page_slug", "entrepreneur-support"),
    supabase.from("campaign_timeline").select("id", { count: "exact", head: true }).eq("page_slug", "entrepreneur-support"),
    supabase.from("campaign_statistics").select("id", { count: "exact", head: true }).eq("page_slug", "entrepreneur-support"),
    supabase.from("campaign_cta").select("id", { count: "exact", head: true }).eq("page_slug", "entrepreneur-support"),
  ]);
  return {
    sections: (sections.data || []) as Array<{ id: string; section_key: string; title_ka: string; is_active: boolean }>,
    faqCount: faq.count || 0,
    cardsCount: cards.count || 0,
    timelineCount: timeline.count || 0,
    statsCount: stats.count || 0,
    ctaCount: cta.count || 0,
  };
}

export default async function CampaignCMSPage() {
  const data = await getCMSStats();

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/campaign" className="p-2 rounded-lg hover:bg-[var(--color-overlay)] transition-colors">
          <ArrowLeft size={18} className="text-[var(--color-fg-tertiary)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">Landing Page CMS</h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">Edit campaign landing page content — all sections, FAQ, cards, and CTAs</p>
        </div>
      </div>

      {/* Content summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <div className="flex items-center gap-2 mb-2">
            <Layout size={16} className="text-[var(--color-fg-tertiary)]" />
            <p className="text-sm font-semibold text-[var(--color-fg-primary)]">Sections</p>
          </div>
          <p className="text-2xl font-bold">{data.sections.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className="text-[var(--color-fg-tertiary)]" />
            <p className="text-sm font-semibold text-[var(--color-fg-primary)]">FAQ</p>
          </div>
          <p className="text-2xl font-bold">{data.faqCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-[var(--color-fg-tertiary)]" />
            <p className="text-sm font-semibold text-[var(--color-fg-primary)]">Cards</p>
          </div>
          <p className="text-2xl font-bold">{data.cardsCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <div className="flex items-center gap-2 mb-2">
            <List size={16} className="text-[var(--color-fg-tertiary)]" />
            <p className="text-sm font-semibold text-[var(--color-fg-primary)]">Timeline</p>
          </div>
          <p className="text-2xl font-bold">{data.timelineCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-[var(--color-fg-tertiary)]" />
            <p className="text-sm font-semibold text-[var(--color-fg-primary)]">Stats</p>
          </div>
          <p className="text-2xl font-bold">{data.statsCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <div className="flex items-center gap-2 mb-2">
            <Edit size={16} className="text-[var(--color-fg-tertiary)]" />
            <p className="text-sm font-semibold text-[var(--color-fg-primary)]">CTA</p>
          </div>
          <p className="text-2xl font-bold">{data.ctaCount}</p>
        </div>
      </div>

      {/* Section list */}
      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border-primary)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">Landing Page Sections</h2>
          <span className="text-xs text-[var(--color-fg-tertiary)]">Direct Supabase DB editing</span>
        </div>
        <div className="divide-y divide-[var(--color-border-primary)]">
          {data.sections.map((section) => (
            <div key={section.id} className="flex items-center justify-between p-4 hover:bg-[var(--color-overlay)] transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${section.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="text-sm font-medium text-[var(--color-fg-primary)]">{section.title_ka || section.section_key}</p>
                  <p className="text-xs text-[var(--color-fg-tertiary)]">Key: {section.section_key}</p>
                </div>
              </div>
              <span className="px-3 py-1 text-xs rounded-full bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)]">
                {section.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
        <p className="text-sm text-amber-600">
          Edit campaign content directly in Supabase tables. Go to Supabase Dashboard → Table Editor to modify campaign_sections, campaign_faq, campaign_cards, campaign_timeline, campaign_statistics, and campaign_cta tables.
        </p>
      </div>
    </div>
  );
}
