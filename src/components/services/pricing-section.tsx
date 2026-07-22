"use client";

import { useState, useCallback } from "react";
import { FadeIn } from "@/components/animations/fade-in";
import { PricingCard } from "@/components/services/pricing-card";
import { cn } from "@/lib/utils";
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
  const usesFeatureLimit = maxVisibleFeatures !== undefined;

  // Find the reference card (the one with the most features that fits within maxVisibleFeatures —
  // this will be the "Business" card whose natural height all other cards must match)
  const referencePkgIndex = (() => {
    if (!usesFeatureLimit) return -1;
    let bestIdx = -1;
    let bestCount = -1;
    section.packages.forEach((pkg, i) => {
      if (pkg.features.length <= maxVisibleFeatures && pkg.features.length > bestCount) {
        bestCount = pkg.features.length;
        bestIdx = i;
      }
    });
    return bestIdx;
  })();

  const [referenceCardHeight, setReferenceCardHeight] = useState<number | null>(null);

  const handleCardMeasure = useCallback((height: number) => {
    setReferenceCardHeight(height);
  }, []);

  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        {/* Header */}
        <FadeIn direction="up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gradient">
            {section.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-[var(--color-fg-tertiary)] leading-relaxed">
            {section.description}
          </p>
        </FadeIn>

        {/* Packages Grid */}
        <div
          className={cn(
            section.packages.length === 1
              ? "mt-10 max-w-md mx-auto grid grid-cols-1 gap-x-8 gap-y-12"
              : section.packages.length === 2
                ? "mt-10 grid grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto gap-x-8 gap-y-12"
                : section.packages.length === 4
                  ? "mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-12"
                  : "mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12",
            usesFeatureLimit
              ? "items-start"
              : section.packages.length === 4 && "items-start"
          )}
        >
          {section.packages.map((pkg, i) => {
            const isRef = i === referencePkgIndex;
            const effectiveMaxVisible =
              pkg.visibleItemCount ?? cardVisibleFeatureOverrides?.[pkg.id] ?? maxVisibleFeatures;
            return (
              <PricingCard
                key={pkg.id}
                pkg={pkg}
                index={i}
                onPlanProject={onPlanProject}
                maxVisibleFeatures={effectiveMaxVisible}
                fixedHeight={usesFeatureLimit && !isRef && referenceCardHeight !== null ? referenceCardHeight : undefined}
                onMeasure={usesFeatureLimit && isRef ? handleCardMeasure : undefined}
              />
            );
          })}
        </div>

        {/* Note — advertising budget disclaimer */}
        {section.note && (
          <FadeIn direction="up" delay={0.2}>
            <div className="mt-12 mx-auto max-w-4xl">
              <div className="flex items-start gap-4 px-5 py-4 md:px-7 md:py-5 rounded-xl border border-[var(--color-border-secondary)] bg-[var(--color-overlay)]">
                <div className="w-0.5 self-stretch shrink-0 rounded-full bg-[var(--color-accent)]/40" />
                <p className="text-sm md:text-base text-[var(--color-fg-secondary)] font-medium leading-relaxed md:whitespace-nowrap">
                  {section.note}
                </p>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
