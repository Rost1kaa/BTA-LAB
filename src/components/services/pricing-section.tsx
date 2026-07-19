"use client";

import { FadeIn } from "@/components/animations/fade-in";
import { PricingCard } from "@/components/services/pricing-card";
import type { PricingSection as PricingSectionType } from "@/types";

interface PricingSectionProps {
  section: PricingSectionType;
  onPlanProject?: () => void;
}

export function PricingSectionBlock({
  section,
  onPlanProject,
}: PricingSectionProps) {
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
          className={
            section.packages.length === 1
              ? "mt-10 max-w-md mx-auto grid grid-cols-1 gap-x-8 gap-y-12"
              : section.packages.length === 2
                ? "mt-10 grid grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto gap-x-8 gap-y-12"
                : section.packages.length === 4
                  ? "mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 items-start gap-x-8 gap-y-12"
                  : "mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
          }
        >
          {section.packages.map((pkg, i) => (
            <PricingCard key={pkg.id} pkg={pkg} index={i} onPlanProject={onPlanProject} />
          ))}
        </div>

        {/* Note */}
        {section.note && (
          <FadeIn direction="up" delay={0.2}>
            <p className="mt-12 text-base md:text-lg text-[var(--color-fg-secondary)] text-center max-w-2xl mx-auto leading-relaxed">
              {section.note}
            </p>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
