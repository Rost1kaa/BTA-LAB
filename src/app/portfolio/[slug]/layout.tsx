import type { Metadata } from "next";
import { getProjectBySlugServer } from "@/lib/cms-server";
import { getServerLocale } from "@/lib/locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const project = await getProjectBySlugServer(slug, locale);

  if (!project) {
    return { title: "Project Not Found | BTA LAB" };
  }

  return {
    title: project.seo_title || `${project.title} | BTA LAB`,
    description: project.seo_description || project.description,
  };
}

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
