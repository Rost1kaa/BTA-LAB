import { notFound } from "next/navigation";
import { getProjectBySlugServer, getPublishedProjectsServer } from "@/lib/cms-server";
import { getServerLocale } from "@/lib/locale";
import { ProjectDetailClient } from "./detail-client";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getServerLocale();

  const [project, allProjects] = await Promise.all([
    getProjectBySlugServer(slug, locale),
    getPublishedProjectsServer(locale),
  ]);

  if (!project) {
    notFound();
  }

  const relatedProjects = allProjects
    .filter((p) => p.category === project.category && p.id !== project.id)
    .slice(0, 2);

  return (
    <ProjectDetailClient
      project={project}
      relatedProjects={relatedProjects}
    />
  );
}
