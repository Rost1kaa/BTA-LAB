import type { Metadata } from "next";
import { getContentMapServer, getStatsServer } from "@/lib/cms-server";
import { getServerLocale } from "@/lib/locale";
import { AboutPageClient } from "./about-client";

export const metadata: Metadata = {
  title: "ჩვენს შესახებ",
};

export default async function AboutPage() {
  const locale = await getServerLocale();
  const [content, stats] = await Promise.all([
    getContentMapServer("about", locale),
    getStatsServer(),
  ]);

  return <AboutPageClient content={content} stats={stats} />;
}
