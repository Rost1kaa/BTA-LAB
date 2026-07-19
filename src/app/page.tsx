import {
  getContentMapServer,
  getFeaturedProjectsServer,
  getServicePackagesServer,
  getStatsServer,
} from "@/lib/cms-server";
import { getServerLocale } from "@/lib/locale";
import { HomePageClient } from "./home-client";

export default async function HomePage() {
  const locale = await getServerLocale();
  const [content, featuredProjects, servicePackages, stats] = await Promise.all([
    getContentMapServer("home", locale),
    getFeaturedProjectsServer(locale),
    getServicePackagesServer("website", locale),
    getStatsServer(),
  ]);

  return (
    <HomePageClient
      content={content}
      featuredProjects={featuredProjects}
      servicePackages={servicePackages}
      stats={stats}
    />
  );
}
