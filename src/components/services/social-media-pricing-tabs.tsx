"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/animations/fade-in";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/use-dictionary";
import { ChevronDown, Clock } from "lucide-react";
import { FeatureTooltip } from "@/components/ui/feature-tooltip";
import type { PricingSection } from "@/types";
import type { FeatureTooltipData } from "@/types";

interface SocialMediaTabbedPricingProps {
  section: PricingSection;
  onPlanProject?: (pkgId: string, pkgName: string, pkgPrice: string, isCustomPrice: boolean) => void;
  maxVisibleFeatures?: number;
}

export function SocialMediaTabbedPricing({
  section,
  onPlanProject,
  maxVisibleFeatures = 8,
}: SocialMediaTabbedPricingProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const selectedPkg = section.packages[activeIndex];
  const effectiveMaxVisible =
    selectedPkg?.visibleItemCount ?? maxVisibleFeatures;
  const hasManyFeatures =
    effectiveMaxVisible !== undefined &&
    selectedPkg?.features.length > effectiveMaxVisible;
  const visibleFeatures =
    !expanded && hasManyFeatures
      ? selectedPkg.features.slice(0, effectiveMaxVisible)
      : selectedPkg.features;

  // Reset collapse when switching tabs
  useEffect(() => {
    setExpanded(false);
  }, [activeIndex]);

  // Auto-scroll active tab into view on narrow screens
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex]);

  const handleCta = () => {
    if (selectedPkg && onPlanProject) {
      onPlanProject(
        selectedPkg.id,
        selectedPkg.name,
        selectedPkg.price,
        !!selectedPkg.customPrice,
      );
    }
  };

  if (!section.packages.length) return null;

  return (
    <section className="relative py-20 md:py-28">
      <Container>
        {/* Header */}
        <FadeIn direction="up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gradient">
            {section.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-[var(--color-fg-tertiary)] leading-relaxed">
            {section.description}
          </p>
        </FadeIn>

        {/* Tab Switcher */}
        <FadeIn direction="up" delay={0.1}>
          <div
            ref={tabsScrollRef}
            className="relative mt-10 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex gap-1 p-1.5 rounded-2xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)] w-fit min-w-full sm:min-w-0 mx-auto snap-x snap-mandatory">
              {section.packages.map((pkg, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={pkg.id}
                    ref={isActive ? activeTabRef : undefined}
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      "relative px-4 md:px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap snap-start",
                      "transition-all duration-300 select-none",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-subtle)]",
                      isActive
                        ? "text-[var(--color-fg-primary)] font-semibold"
                        : "text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-secondary)]",
                    )}
                    aria-selected={isActive}
                    role="tab"
                  >
                    {/* Active tab background with spring animation */}
                    {isActive && (
                      <motion.span
                        layoutId="social-active-tab"
                        className="absolute inset-0 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-accent)]/40 shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 32,
                        }}
                      />
                    )}
                    {/* Glow effect for active tab */}
                    {isActive && (
                      <span className="absolute inset-0 rounded-xl bg-[var(--color-accent)]/8" />
                    )}
                    <span className="relative z-10">
                      {pkg.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Selected Package Card — animated */}
        <div className="relative mt-8">
          <AnimatePresence mode="wait">
            {selectedPkg && (
              <motion.div
                key={selectedPkg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div
                  className={cn(
                    "relative rounded-2xl border transition-all duration-500 overflow-hidden",
                    selectedPkg.highlighted
                      ? "border-[var(--color-accent)] bg-[var(--color-bg-surface)] shadow-lg shadow-[var(--color-accent)]/8"
                      : "border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] hover:border-[var(--color-fg-tertiary)]/30",
                  )}
                >
                  {/* Subtle accent gradient overlay for highlighted package */}
                  {selectedPkg.highlighted && (
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/4 to-transparent pointer-events-none" />
                  )}

                  {/* Recommendation badge */}
                  {selectedPkg.highlighted && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-b-xl bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-xs font-medium tracking-wider uppercase z-10">
                      {t("pricing.recommended")}
                    </div>
                  )}

                  <div className="relative z-[1] p-6 md:p-8">
                    {/* Header */}
                    <div>
                      <h3
                        className={cn(
                          "text-xl md:text-2xl font-bold text-[var(--color-fg-primary)] tracking-tight",
                          selectedPkg.highlighted && "mt-2",
                        )}
                      >
                        {selectedPkg.name}
                      </h3>

                      {selectedPkg.description && (
                        <p className="mt-3 text-base text-[var(--color-fg-secondary)] leading-relaxed max-w-2xl">
                          {selectedPkg.description}
                        </p>
                      )}

                      {/* Price */}
                      <div className="mt-5">
                        <div className="flex items-baseline gap-1 flex-wrap">
                          <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-accent)] tracking-tight">
                            {selectedPkg.price}
                          </span>
                          {selectedPkg.billingLabel &&
                            !selectedPkg.price.includes(
                              selectedPkg.billingLabel,
                            ) && (
                              <span className="text-sm text-[var(--color-fg-tertiary)] ml-1">
                                / {selectedPkg.billingLabel}
                              </span>
                            )}
                        </div>
                        {selectedPkg.priceExplanation && (
                          <p className="mt-2 text-sm text-[var(--color-fg-tertiary)] leading-relaxed">
                            {selectedPkg.priceExplanation}
                          </p>
                        )}
                        {selectedPkg.idealFor && (
                          <p className="mt-3 text-sm text-[var(--color-fg-secondary)] leading-relaxed">
                            {selectedPkg.idealFor}
                          </p>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="mt-6 mb-5 border-t border-[var(--color-border-primary)]" />
                    </div>

                    {/* Features */}
                    <motion.ul
                      layout
                      className="space-y-3"
                      transition={{
                        duration: 0.35,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    >
                      {visibleFeatures.map((feature, i) => {
                        const tooltipData: FeatureTooltipData | undefined = selectedPkg.featureTooltips?.[feature];
                        return (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-base text-[var(--color-fg-secondary)] leading-relaxed"
                          >
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]/60 flex-shrink-0" />
                            <span className="flex items-center gap-1.5">
                              {feature}
                              {tooltipData && (
                                <FeatureTooltip tooltip={tooltipData} />
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </motion.ul>

                    {/* Expand / Collapse */}
                    {hasManyFeatures && (
                      <div className="mt-5 flex justify-center">
                        <button
                          onClick={() => setExpanded(!expanded)}
                          className="flex items-center gap-1.5 text-sm text-[var(--color-fg-tertiary)]/60 hover:text-[var(--color-fg-secondary)] transition-colors cursor-pointer"
                          aria-expanded={expanded}
                        >
                          <ChevronDown
                            size={14}
                            className={cn(
                              "transition-transform duration-300",
                              expanded && "rotate-180",
                            )}
                          />
                          <span>
                            {expanded
                              ? t("pricing.hideFeatures")
                              : t("pricing.showAllFeatures")}
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Bottom — delivery time + CTA */}
                    <div className="mt-8">
                      {selectedPkg.deliveryTime && (
                        <div className="mb-5 text-center">
                          <p className="inline-flex items-center gap-1.5 text-sm md:text-base font-medium text-[var(--color-fg-secondary)]">
                            <Clock
                              size={14}
                              className="text-[var(--color-fg-tertiary)]"
                            />
                            <span>{selectedPkg.deliveryTime}</span>
                          </p>
                        </div>
                      )}

                      <Button
                        onClick={handleCta}
                        variant={
                          selectedPkg.highlighted ? "primary" : "secondary"
                        }
                        size="lg"
                        className={cn(
                          "w-full",
                          !selectedPkg.highlighted &&
                            "bg-[var(--color-overlay)] border-0",
                        )}
                      >
                        {selectedPkg.cta}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Advertising budget note */}
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
      </Container>
    </section>
  );
}
