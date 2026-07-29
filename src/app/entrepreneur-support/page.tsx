import { getServerLocale } from "@/lib/locale";
import {
  getCampaignLandingDataServer,
  getCampaignDetailsServer,
} from "@/lib/campaign-cms-server";
import { CampaignLandingClient } from "@/components/campaign/campaign-landing-client";

export const revalidate = 60;

export default async function EntrepreneurSupportPage() {
  const locale = await getServerLocale();
  const [data, campaignDetails] = await Promise.all([
    getCampaignLandingDataServer("entrepreneur-support", locale),
    getCampaignDetailsServer(),
  ]);

  return (
    <CampaignLandingClient
      sections={data.sections}
      faq={data.faq}
      cards={data.cards}
      timeline={data.timeline}
      statistics={data.statistics}
      cta={data.cta}
      settings={data.settings}
      currentStep={campaignDetails?.current_step ?? 1}
    />
  );
}
