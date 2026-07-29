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
    { label: "Landing Page CMS", href: "/admin/campaign/cms", icon: FileText, description: "Edit campaign landing page content" },
    { label: "Applications", href: "/admin/campaign/applications", icon: Users, description: `Manage ${stats.totalApplications} applications` },
    { label: "SEO", href: "/admin/campaign/seo", icon: Search, description: "Campaign SEO settings" },
    { label: "Email Templates", href: "/admin/campaign/emails", icon: Mail, description: "Automated email templates" },
    { label: "Settings", href: "/admin/campaign/settings", icon: SettingsIcon, description: "Campaign configuration" },
  ];

  const detailItems = [
    { label: "დეტალების რედაქტირება", href: "/admin/campaign/details", icon: Edit, description: "Edit full text content, title, and detailed terms for /entrepreneur-support/details" },
    { label: "კამპანიის ეტაპები", href: "/admin/campaign/steps", icon: Layers, description: "Change the active campaign progress step (1-4) to control the green progress bar on the landing page" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Megaphone size={24} className="text-[var(--color-fg-primary)]" />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
              Campaign Management
            </h1>
          </div>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            Entrepreneur Support Campaign — manage applications and content
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm">
        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <p className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">{stats.totalApplications}</p>
          <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">Applications</p>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <p className="text-2xl font-bold tracking-tight text-amber-500">{stats.pendingReview}</p>
          <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">Pending Review</p>
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
          Content Management
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
