import { ProjectForm } from "../project-form";
import { getPortfolioCategories } from "@/lib/actions/portfolio";

export default async function NewProjectPage() {
  const categories = await getPortfolioCategories();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">New Project</h1>
        <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">Create a new portfolio project</p>
      </div>
      <ProjectForm categories={categories.map((category) => String(category.name))} />
    </div>
  );
}
