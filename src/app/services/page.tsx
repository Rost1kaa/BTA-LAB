import type { Metadata } from "next";
import { getContentMapServer, getServicePackagesServer } from "@/lib/cms-server";
import { getServerLocale } from "@/lib/locale";
import { ServicesPageClient } from "./services-client";

export const metadata: Metadata = {
  title: "მომსახურება",
};

// ISR: revalidate data every 30 seconds so Supabase updates reflect
// without forcing a full SSR render on every single request.
export const revalidate = 30;

export default async function ServicesPage() {
  const locale = await getServerLocale();
  const [content, packages] = await Promise.all([
    getContentMapServer("services", locale),
    getServicePackagesServer(undefined, locale),
  ]);

  return (
    <ServicesPageClient
      content={content}
      packages={packages}
    />
  );
}
