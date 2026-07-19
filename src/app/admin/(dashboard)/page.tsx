import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  FolderKanban,
  FileText,
  Users,
  Plus,
  ExternalLink,
  ArrowUpRight,
  Clock,
} from "lucide-react";

async function getDashboardStats() {
  const supabase = await createServerSupabaseClient();

  // Split count and select to avoid TypeScript issues with count option
  const [projectsRes, projectCount, contentRes, teamCount, servicesCount] = await Promise.all([
    supabase.from("portfolio_projects").select("id, published, featured, updated_at"),
    supabase.from("portfolio_projects").select("*", { count: "exact", head: true }),
    supabase.from("site_content").select("updated_at").order("updated_at", { ascending: false }).limit(1),
    supabase.from("team_members").select("*", { count: "exact", head: true }),
    supabase.from("service_packages").select("*", { count: "exact", head: true }),
  ]);

  const queryError = [projectsRes, projectCount, contentRes, teamCount, servicesCount]
    .map((result) => result.error)
    .find(Boolean);
  if (queryError) {
    throw new Error("Dashboard data could not be loaded.");
  }

  const projectData = (projectsRes.data || []) as Array<{ id: string; published: boolean; featured: boolean; updated_at: string }>;
  const totalProjects = projectCount.count || projectData.length;
  const publishedProjects = projectData.filter((p) => p.published).length;
  const draftProjects = projectData.filter((p) => !p.published).length;
  const contentData = (contentRes.data || []) as Array<{ updated_at: string }>;
  const lastUpdated = contentData[0]?.updated_at || projectData[0]?.updated_at || "";
  const totalTeam = teamCount.count || 0;
  const totalServices = servicesCount.count || 0;

  const recentProjects = [...projectData]
    .sort((a: { updated_at: string }, b: { updated_at: string }) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return { totalProjects, publishedProjects, draftProjects, lastUpdated, totalTeam, totalServices, recentProjects };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            Welcome back to BTA LAB Admin
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-overlay)] flex items-center justify-center">
              <FolderKanban size={18} className="text-[var(--color-fg-tertiary)]" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            {stats.totalProjects}
          </p>
          <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">Total Projects</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
              <ArrowUpRight size={18} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            {stats.publishedProjects}
          </p>
          <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">Published</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <FileText size={18} className="text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            {stats.draftProjects}
          </p>
          <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">Drafts</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-overlay)] flex items-center justify-center">
              <Users size={18} className="text-[var(--color-fg-tertiary)]" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            {stats.totalTeam}
          </p>
          <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">Team Members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6">
            <h2 className="text-sm font-semibold text-[var(--color-fg-primary)] mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/portfolio/new"
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-overlay)] hover:bg-[var(--color-border-primary)] transition-colors"
              >
                <Plus size={18} className="text-[var(--color-fg-tertiary)] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-fg-primary)]">Add Project</p>
                  <p className="text-xs text-[var(--color-fg-tertiary)]/70">New portfolio project</p>
                </div>
              </Link>
              <Link
                href="/admin/content"
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-overlay)] hover:bg-[var(--color-border-primary)] transition-colors"
              >
                <FileText size={18} className="text-[var(--color-fg-tertiary)] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-fg-primary)]">Edit Content</p>
                  <p className="text-xs text-[var(--color-fg-tertiary)]/70">Website text & media</p>
                </div>
              </Link>
              <Link
                href="/admin/portfolio"
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-overlay)] hover:bg-[var(--color-border-primary)] transition-colors"
              >
                <FolderKanban size={18} className="text-[var(--color-fg-tertiary)] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-fg-primary)]">Manage Portfolio</p>
                  <p className="text-xs text-[var(--color-fg-tertiary)]/70">All projects</p>
                </div>
              </Link>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-overlay)] hover:bg-[var(--color-border-primary)] transition-colors"
              >
                <ExternalLink size={18} className="text-[var(--color-fg-tertiary)] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-fg-primary)]">View Website</p>
                  <p className="text-xs text-[var(--color-fg-tertiary)]/70">Open public site</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6">
            <h2 className="text-sm font-semibold text-[var(--color-fg-primary)] mb-4">
              Recent Updates
            </h2>
            {stats.lastUpdated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-[var(--color-fg-tertiary)]">
                  <Clock size={14} className="shrink-0" />
                  <span>Last content update:</span>
                </div>
                <p className="text-xs text-[var(--color-fg-tertiary)]/70">
                  {new Date(stats.lastUpdated).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {stats.recentProjects.length > 0 && (
                  <div className="pt-3 border-t border-[var(--color-border-primary)]">
                    <p className="text-xs text-[var(--color-fg-tertiary)]/70 mb-2">
                      Recent projects:
                    </p>
                    {stats.recentProjects.slice(0, 3).map((p) => (
                      <div key={p.id} className="flex items-center gap-2 py-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${p.published ? "bg-green-500" : "bg-amber-500"}`} />
                        <span className="text-xs text-[var(--color-fg-tertiary)]">
                          {p.id.slice(0, 8)}...
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-fg-tertiary)]/70">
                No content yet. Start by adding content via the CMS.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
