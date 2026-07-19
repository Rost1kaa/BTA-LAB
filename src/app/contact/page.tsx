import { getContentMapServer, getSiteConfigServer, getServicePackagesServer } from "@/lib/cms-server";
import { getServerLocale } from "@/lib/locale";
import { ContactPageClient } from "./contact-client";

export default async function ContactPage() {
  const locale = await getServerLocale();
  const [content, siteConfig, packages] = await Promise.all([
    getContentMapServer("contact", locale),
    getSiteConfigServer(locale),
    getServicePackagesServer(undefined, locale),
  ]);

  return (
    <ContactPageClient
      content={content}
      siteConfig={siteConfig}
      packages={packages}
    />
  );
}
