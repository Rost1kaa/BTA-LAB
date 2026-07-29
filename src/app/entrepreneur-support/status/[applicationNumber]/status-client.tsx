"use client";

import { CheckCircle, Clock, FileText, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { useTranslation } from "@/lib/use-dictionary";
import { CAMPAIGN_STATUS_LABELS } from "@/lib/campaign-types";
import type { CampaignApplication, CampaignStatusHistory, CampaignApplicationStatus } from "@/lib/campaign-types";

interface CampaignStatusClientProps {
  application: CampaignApplication;
  statusHistory: CampaignStatusHistory[];
  locale: string;
}

function StatusBadge({ status }: { status: CampaignApplicationStatus }) {
  const labels = CAMPAIGN_STATUS_LABELS[status];
  if (!labels) return <Badge variant="outline">{status}</Badge>;

  const colorMap: Partial<Record<CampaignApplicationStatus, string>> = {
    UNOPENED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    CHECKED: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  return (
    <Badge variant="outline" className={colorMap[status] || ""}>
      {labels.ka || labels.en || status}
    </Badge>
  );
}

export function CampaignStatusClient({
  application,
  statusHistory,
  locale,
}: CampaignStatusClientProps) {
  const { t } = useTranslation();

  const labels = CAMPAIGN_STATUS_LABELS[application.status];
  const statusLabel = locale === "ka" ? labels?.ka : labels?.en;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <Container size="md">
        <FadeIn direction="up">
          {/* Header */}
          <div className="mb-10">
            <Badge variant="outline" className="mb-4">
              {t("campaign.statusBadge") || "Application Status"}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">
              {application.application_number}
            </h1>
            <p className="mt-2 text-base text-[var(--color-fg-tertiary)]">
              {t("campaign.statusSubmitted") || "Submitted"}: {new Date(application.submitted_at).toLocaleDateString()}
            </p>
          </div>

          {/* Current Status */}
          <div className="p-6 md:p-8 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={20} className="text-[var(--color-fg-tertiary)]" />
              <h2 className="text-lg font-semibold text-[var(--color-fg-primary)]">
                {t("campaign.currentStatus") || "Current Status"}
              </h2>
            </div>
            <div className="mt-4">
              <StatusBadge status={application.status} />
              {statusLabel && (
                <p className="mt-2 text-base text-[var(--color-fg-primary)] font-medium">{statusLabel}</p>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          {statusHistory.length > 0 && (
            <div className="p-6 md:p-8 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] mb-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText size={20} className="text-[var(--color-fg-tertiary)]" />
                <h2 className="text-lg font-semibold text-[var(--color-fg-primary)]">
                  {t("campaign.statusTimeline") || "Timeline"}
                </h2>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--color-border-primary)]" />

                <div className="space-y-6">
                  {statusHistory.map((entry) => {
                    const prevLabel = entry.previous_status
                      ? (locale === "ka" ? CAMPAIGN_STATUS_LABELS[entry.previous_status]?.ka : CAMPAIGN_STATUS_LABELS[entry.previous_status]?.en)
                      : null;
                    const newLabel = locale === "ka" ? CAMPAIGN_STATUS_LABELS[entry.new_status]?.ka : CAMPAIGN_STATUS_LABELS[entry.new_status]?.en;

                    return (
                      <div key={entry.id} className="relative pl-10">
                        <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-[var(--color-fg-primary)] border-4 border-[var(--color-bg-surface)]" />
                        <p className="text-sm text-[var(--color-fg-tertiary)]">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-[var(--color-fg-primary)]">
                          {prevLabel && <span className="text-[var(--color-fg-tertiary)]">{prevLabel} → </span>}
                          {newLabel || entry.new_status}
                        </p>
                        {entry.notes && (
                          <p className="text-sm text-[var(--color-fg-tertiary)] mt-1">{entry.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="p-6 md:p-8 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)]">
            <div className="flex items-center gap-3 mb-4">
              <ArrowRight size={20} className="text-[var(--color-fg-tertiary)]" />
              <h2 className="text-lg font-semibold text-[var(--color-fg-primary)]">
                {t("campaign.nextSteps") || "Next Steps"}
              </h2>
            </div>
            <p className="text-base text-[var(--color-fg-tertiary)] leading-relaxed">
              {t("campaign.nextStepsDescription") || "We will review your application and contact you at the email address provided. You can check back here anytime to see the latest status updates."}
            </p>
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}
