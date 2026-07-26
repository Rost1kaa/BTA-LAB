"use client";

import { FadeIn } from "@/components/animations/fade-in";
import { PricingCard } from "@/components/services/pricing-card";
import type { PricingSection as PricingSectionType } from "@/types";

interface PricingSectionProps {
  section: PricingSectionType;
  onPlanProject?: (pkgId: string, pkgName: string, pkgPrice: string, isCustomPrice: boolean) => void;
  /** Global max visible features — applied to all cards unless overridden per card */
  maxVisibleFeatures?: number;
  /** Per-card overrides for visible feature count. Keyed by package ID. */
  cardVisibleFeatureOverrides?: Record<string, number>;
}

export function PricingSectionBlock({
  section,
  onPlanProject,
  maxVisibleFeatures,
  cardVisibleFeatureOverrides,
}: PricingSectionProps) {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1600px] px-6 md:px-8 lg:px-12">
        {/* Header */}
        <FadeIn direction="up">
          <div className="w-full max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.05] text-gradient">
              {section.title}
            </h2>
            <p className="mt-5 max-w-5xl text-[17px] md:text-xl text-[var(--color-fg-tertiary)] leading-relaxed">
              {section.description}
            </p>
          </div>
        </FadeIn>

        {/* Packages Grid — standardized layout */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {section.packages.map((pkg, i) => {
            const effectiveMaxVisible =
              pkg.visibleItemCount ?? cardVisibleFeatureOverrides?.[pkg.id] ?? maxVisibleFeatures;
            return (
              <div
                key={pkg.id}
                className="flex"
              >
                <PricingCard
                  pkg={pkg}
                  index={i}
                  onPlanProject={onPlanProject}
                  maxVisibleFeatures={effectiveMaxVisible}
                />
              </div>
            );
          })}
        </div>

        {/* Note — advertising budget disclaimer */}
        {section.note && (
          <FadeIn direction="up" delay={0.2}>
            <div className="mt-16 mx-auto max-w-3xl">
              <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border-secondary)] bg-[var(--color-overlay)]/60 backdrop-blur-sm px-6 py-5 md:px-8 md:py-6">
                <div className="flex items-start gap-4">
                  <div className="w-0.5 self-stretch shrink-0 rounded-full bg-[var(--color-accent)]/30" />
                  <div>
                    <p className="text-[15px] md:text-[17px] text-[var(--color-fg-secondary)] font-medium leading-relaxed">
                      {section.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
