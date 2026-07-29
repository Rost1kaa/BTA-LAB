import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";

export default async function CampaignSettingsPage() {
  const supabase = createServiceRoleClient();
  const { data } = await (supabase.from("campaign_settings") as any).select("*").order("setting_key");

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/campaign" className="p-2 rounded-lg hover:bg-[var(--color-overlay)] transition-colors">
          <ArrowLeft size={18} className="text-[var(--color-fg-tertiary)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">Campaign Settings</h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">Configure campaign parameters</p>
        </div>
      </div>

      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">Settings</h2>
        </div>
        <div className="divide-y divide-[var(--color-border-primary)]">
          {(data || []).map((setting: any) => (
            <div key={setting.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-fg-primary)]">{setting.setting_key}</p>
                <p className="text-xs text-[var(--color-fg-tertiary)]">Type: {setting.setting_type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--color-fg-secondary)]">KA: {setting.setting_value_ka}</p>
                <p className="text-xs text-[var(--color-fg-tertiary)]">EN: {setting.setting_value_en}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
        <p className="text-sm text-amber-600">Edit campaign settings directly in the campaign_settings Supabase table.</p>
      </div>
    </div>
  );
}
