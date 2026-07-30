import type { Metadata } from "next";
import { getServerLocale } from "@/lib/locale";
import { getCampaignSectionsServer } from "@/lib/campaign-cms-server";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { FadeIn } from "@/components/animations/fade-in";
import { RulesClient } from "./rules-client";

export const metadata: Metadata = {
  title: "წესები",
};

export const revalidate = 30;

export default async function EntrepreneurSupportRulesPage() {
  const locale = await getServerLocale();
  const sections = await getCampaignSectionsServer("entrepreneur-support-rules");

  return <RulesClient sections={sections} locale={locale} />;
}
