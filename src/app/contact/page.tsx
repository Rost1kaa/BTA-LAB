import { getContentMapServer, getSiteConfigServer } from "@/lib/cms-server";
import { getServerLocale } from "@/lib/locale";
import { ContactPageClient } from "./contact-client";

export default async function ContactPage() {
  const locale = await getServerLocale();
  const [content, siteConfig] = await Promise.all([
    getContentMapServer("contact", locale),
    getSiteConfigServer(locale),
  ]);

  return (
    <ContactPageClient
      content={content}
      siteConfig={siteConfig}
    />
  );
}
