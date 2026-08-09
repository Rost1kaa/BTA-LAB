import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Megaphone, FileText, Users, Search, Mail, Settings as SettingsIcon, Edit, Layers } from "lucide-react";

async function getCampaignStats() {
  const supabase = createServiceRoleClient();

  const [appsResult, pendingResult] = await Promise.all([
    supabase.from("campaign_applications").select("*", { count: "exact", head: true }),
    supabase.from("campaign_applications").select("status").eq("status", "UNOPENED"),
  ]);

  return {
    totalApplications: appsResult.count || 0,
    pendingReview: (pendingResult.data || []).length,
  };
}

export default async function CampaignAdminPage() {
  const stats = await getCampaignStats();

  const menuItems = [
    { label: "მთავარი გვერდის CMS", href: "/admin/campaign/cms", icon: FileText, description: "კამპანიის მთავარი გვერდის კონტენტის რედაქტირება" },
    { label: "განაცხადები", href: "/admin/campaign/applications", icon: Users, description: `${stats.totalApplications} განაცხადის მართვა` },
    { label: "SEO", href: "/admin/campaign/seo", icon: Search, description: "კამპანიის SEO პარამეტრები" },
    { label: "ელფოსტის შაბლონები", href: "/admin/campaign/emails", icon: Mail, description: "ავტომატური ელფოსტის შაბლონები" },
    { label: "პარამეტრები", href: "/admin/campaign/settings", icon: SettingsIcon, description: "კამპანიის კონფიგურაცია" },
  ];

  const detailItems = [
    { label: "დეტალების რედაქტირება", href: "/admin/campaign/details", icon: Edit, description: "სრული ტექსტის, სათაურისა და დეტალური პირობების რედაქტირება /entrepreneur-support/details გვერდისთვის" },
    { label: "კამპანიის ეტაპები", href: "/admin/campaign/steps", icon: Layers, description: "აქტიური კამპანიის ეტაპის (1-4) შეცვლა მთავარ გვერდზე მწვანე პროგრესის ზოლის სამართავად" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Megaphone size={24} className="text-[var(--color-fg-primary)]" />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
              კამპანიის მართვა
            </h1>
          </div>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            მეწარმეთა მხარდაჭერის კამპანია — განაცხადებისა და კონტენტის მართვა
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm">
        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <p className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">{stats.totalApplications}</p>
          <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">განაცხადები</p>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <p className="text-2xl font-bold tracking-tight text-amber-500">{stats.pendingReview}</p>
          <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">განხილვამდე</p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-surface-hover)] transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-overlay)] flex items-center justify-center group-hover:bg-[var(--color-border-primary)] transition-colors">
                <item.icon size={18} className="text-[var(--color-fg-tertiary)]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--color-fg-primary)]">{item.label}</h3>
            </div>
            <p className="text-xs text-[var(--color-fg-tertiary)]/70">{item.description}</p>
          </Link>
        ))}
      </div>

      {/* Content Management Section */}
      <div className="mt-10 mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-fg-secondary)] uppercase tracking-wider">
          კონტენტის მართვა
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {detailItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-surface-hover)] transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-overlay)] flex items-center justify-center group-hover:bg-[var(--color-border-primary)] transition-colors">
                <item.icon size={18} className="text-[var(--color-fg-tertiary)]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--color-fg-primary)]">{item.label}</h3>
            </div>
            <p className="text-xs text-[var(--color-fg-tertiary)]/70">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
