import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CampaignEmailsPage() {
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("campaign_email_templates") as any).select("*").order("event");

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/campaign" className="p-2 rounded-lg hover:bg-[var(--color-overlay)] transition-colors">
          <ArrowLeft size={18} className="text-[var(--color-fg-tertiary)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">Email Templates</h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">Automated email templates for campaign notifications</p>
        </div>
      </div>

      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">Templates ({(data || []).length})</h2>
        </div>
        <div className="divide-y divide-[var(--color-border-primary)]">
          {(data || []).map((t: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <div key={t.id} className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-[var(--color-fg-primary)]">{t.event.replace(/_/g, ' ')}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${t.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{t.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <p className="text-xs text-[var(--color-fg-tertiary)]">KA: {t.subject_ka}</p>
              <p className="text-xs text-[var(--color-fg-tertiary)]">EN: {t.subject_en}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
