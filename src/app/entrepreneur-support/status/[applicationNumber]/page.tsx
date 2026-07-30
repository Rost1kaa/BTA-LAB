import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerLocale } from "@/lib/locale";
import { getCampaignApplicationServer, getCampaignApplicationStatusHistoryServer } from "@/lib/campaign-cms-server";
import { CampaignStatusClient } from "./status-client";

export const metadata: Metadata = {
  title: "განაცხადის სტატუსი",
};

export const revalidate = 10;

export default async function ApplicationStatusPage({
  params,
}: {
  params: Promise<{ applicationNumber: string }>;
}) {
  const { applicationNumber } = await params;
  const locale = await getServerLocale();
  const application = await getCampaignApplicationServer(applicationNumber);

  if (!application) {
    notFound();
  }

  const statusHistory = await getCampaignApplicationStatusHistoryServer(application.id);

  // Filter only public history entries for applicant viewing
  const publicHistory = (statusHistory as any[]).filter((h: any) => h.is_public);

  return (
    <CampaignStatusClient
      application={application}
      statusHistory={publicHistory}
      locale={locale}
    />
  );
}
