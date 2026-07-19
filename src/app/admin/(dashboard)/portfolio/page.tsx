import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PortfolioList } from "./portfolio-list";
import type { PortfolioProject, PortfolioCategory } from "@/types/supabase";

export default async function PortfolioAdminPage() {
  const supabase = await createServerSupabaseClient();

  const [projectsResult, categoriesResult] = await Promise.all([
    supabase.from("portfolio_projects").select("*").order("display_order").order("created_at", { ascending: false }),
    supabase.from("portfolio_categories").select("*").order("sort_order"),
  ]);

  if (projectsResult.error || categoriesResult.error) {
    throw new Error("Portfolio data could not be loaded.");
  }

  const rawProjects = projectsResult.data;
  const rawCategories = categoriesResult.data;

  const projects = (rawProjects || []) as PortfolioProject[];
  const categories = (rawCategories || []) as PortfolioCategory[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            Portfolio
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            Manage your portfolio projects
          </p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="inline-flex items-center gap-2 h-11 px-5 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium rounded-xl hover:opacity-90 transition-opacity text-sm"
        >
          <Plus size={16} />
          Add Project
        </Link>
      </div>

      <PortfolioList
        projects={projects}
        categories={categories.map((c) => c.name)}
      />
    </div>
  );
}
