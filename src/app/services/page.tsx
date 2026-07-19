import { getContentMapServer, getServicePackagesServer } from "@/lib/cms-server";
import { getServerLocale } from "@/lib/locale";
import { ServicesPageClient } from "./services-client";

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
