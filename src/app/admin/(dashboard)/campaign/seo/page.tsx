import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CampaignSEOPage() {
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("campaign_seo") as any).select("*").eq("page_slug", "entrepreneur-support").maybeSingle();

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/campaign" className="p-2 rounded-lg hover:bg-[var(--color-overlay)] transition-colors">
          <ArrowLeft size={18} className="text-[var(--color-fg-tertiary)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">SEO</h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">Campaign SEO settings</p>
        </div>
      </div>

      {data ? (
        <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border-primary)]">
            <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">SEO Metadata</h2>
          </div>
          <div className="p-4 space-y-4">
            <div><p className="text-xs text-[var(--color-fg-tertiary)]">Title (KA)</p><p className="text-sm">{data.title_ka}</p></div>
            <div><p className="text-xs text-[var(--color-fg-tertiary)]">Title (EN)</p><p className="text-sm">{data.title_en}</p></div>
            <div><p className="text-xs text-[var(--color-fg-tertiary)]">Description (KA)</p><p className="text-sm text-[var(--color-fg-secondary)]">{data.description_ka}</p></div>
            <div><p className="text-xs text-[var(--color-fg-tertiary)]">Description (EN)</p><p className="text-sm text-[var(--color-fg-secondary)]">{data.description_en}</p></div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] text-center">
          <p className="text-[var(--color-fg-tertiary)]">No SEO data found. Run the campaign seed script to populate SEO.</p>
        </div>
      )}
    </div>
  );
}
