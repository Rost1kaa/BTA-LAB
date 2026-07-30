import type { Metadata } from "next";
import {
  getContentMapServer,
  getFeaturedProjectsServer,
  getServicePackagesServer,
  getStatsServer,
} from "@/lib/cms-server";
import { getServerLocale } from "@/lib/locale";
import { HomePageClient } from "./home-client";

export const metadata: Metadata = {
  title: "ბითიეი ლაბი, ბიზნესისა და ტექნოლოგიების აკადემიის საწარმო",
  openGraph: {
    title: "ბითიეი ლაბი, ბიზნესისა და ტექნოლოგიების აკადემიის საწარმო",
  },
  twitter: {
    title: "ბითიეი ლაბი, ბიზნესისა და ტექნოლოგიების აკადემიის საწარმო",
  },
};

// ISR: revalidate data every 30 seconds so Supabase updates reflect
// without forcing a full SSR render on every single request.
export const revalidate = 30;

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
