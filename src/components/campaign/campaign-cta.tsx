"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import type { CampaignCTA } from "@/lib/campaign-types";

interface CampaignCTAWithContent {
  cta: CampaignCTA[];
  locale?: string;
  badge?: string;
}

export function CampaignCTA({ cta, locale = "ka", badge }: CampaignCTAWithContent) {
  if (!cta || cta.length === 0) return null;

  const primaryCTA = cta[0];

  const title = locale === "ka" ? primaryCTA.title_ka : primaryCTA.title_en;
  const description = locale === "ka" ? primaryCTA.description_ka : primaryCTA.description_en;
  const buttonText = locale === "ka" ? primaryCTA.button_text_ka : primaryCTA.button_text_en;
  const buttonUrl = primaryCTA.button_url;
  const secondaryText = locale === "ka" ? primaryCTA.secondary_button_text_ka : primaryCTA.secondary_button_text_en;
  const secondaryUrl = primaryCTA.secondary_button_url;

  if (!title) return null;

  return (
    <FadeIn direction="up">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border-primary)] p-10 md:p-16 lg:p-20 text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-glow)] rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          {badge && (
            <Badge variant="outline" className="mb-4">
              {badge}
            </Badge>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gradient">
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-base md:text-lg text-[var(--color-fg-tertiary)] leading-relaxed">
              {description}
            </p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {buttonText && buttonUrl && (
              <Link href={buttonUrl}>
                <Button size="lg" variant="primary" className="gap-2 group">
                  {buttonText}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
            {secondaryText && secondaryUrl && (
              <Link href={secondaryUrl}>
                <Button size="lg" variant="secondary">
                  {secondaryText}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
