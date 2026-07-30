import type { Metadata } from "next";
import { getContentMapServer, getPublishedProjectsServer } from "@/lib/cms-server";
import { getServerLocale } from "@/lib/locale";
import { PortfolioPageClient } from "./portfolio-client";

export const metadata: Metadata = {
  title: "ნამუშევრები",
};

export default async function PortfolioPage() {
  const locale = await getServerLocale();
  const [content, projects] = await Promise.all([
    getContentMapServer("portfolio", locale),
    getPublishedProjectsServer(locale),
  ]);

  return (
    <PortfolioPageClient
      content={content}
      projects={projects}
    />
  );
}
