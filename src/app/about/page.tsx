import { getContentMapServer, getStatsServer } from "@/lib/cms-server";
import { getServerLocale } from "@/lib/locale";
import { AboutPageClient } from "./about-client";

export default async function AboutPage() {
  const locale = await getServerLocale();
  const [content, stats] = await Promise.all([
    getContentMapServer("about", locale),
    getStatsServer(),
  ]);

  return <AboutPageClient content={content} stats={stats} />;
}
