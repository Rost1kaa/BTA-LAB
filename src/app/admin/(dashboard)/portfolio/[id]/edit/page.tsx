import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjectForm } from "../../project-form";
import { getPortfolioCategories } from "@/lib/actions/portfolio";
import type { PortfolioProject } from "@/types/supabase";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const [projectResult, categories] = await Promise.all([
    supabase.from("portfolio_projects").select("*").eq("id", id).maybeSingle(),
    getPortfolioCategories(),
  ]);
  if (projectResult.error) throw new Error("Project could not be loaded.");
  const rawProject = projectResult.data;

  const project = rawProject as PortfolioProject | null;

  if (!project) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
          Edit Project
        </h1>
        <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
          Editing &ldquo;{project.title}&rdquo;
        </p>
      </div>
      <ProjectForm project={project} categories={categories.map((category) => String(category.name))} />
    </div>
  );
}
