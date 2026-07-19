import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/actions/portfolio";
import { getSiteUrl } from "@/lib/site-url";

const staticRoutes = ["/", "/about", "/services", "/portfolio", "/team", "/contact", "/privacy", "/cookies"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  let projectRoutes: MetadataRoute.Sitemap = [];

  try {
    const projects = await getPublishedProjects();
    projectRoutes = projects.map((project) => ({
      url: `${siteUrl}/portfolio/${project.slug}`,
      lastModified: project.updated_at ? new Date(project.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    projectRoutes = [];
  }

  const publicRoutes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: now,
      changeFrequency: route === "/" ? "weekly" : "monthly",
      priority: route === "/" ? 1 : 0.8,
  }));

  return [
    ...publicRoutes,
    ...projectRoutes,
  ];
}
