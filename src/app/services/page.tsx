import { getContentMapServer, getServicePackagesServer } from "@/lib/cms-server";
import { getServerLocale } from "@/lib/locale";
import { ServicesPageClient } from "./services-client";

// Force dynamic rendering to prevent stale RSC cache from serving
// previously-rendered HTML with post-hydration data-reveal attribute values.
// This ensures the server always sends fresh SSR with the correct initial
// reveal state (armed=false, state=pending).
export const dynamic = "force-dynamic";

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
