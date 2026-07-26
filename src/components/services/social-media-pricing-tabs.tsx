"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/animations/fade-in";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/use-dictionary";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ServiceCard } from "@/components/services/service-card";
import { formatPrice } from "@/lib/format-price";
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
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

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

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= section.packages.length) return;
      setActiveIndex(index);
    },
    [section.packages.length],
  );

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [goTo, activeIndex]);

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [goTo, activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const handleCta = () => {
    if (selectedPkg && onPlanProject) {
      onPlanProject(
        selectedPkg.id,
        selectedPkg.name,
        String(selectedPkg.price),
        !!selectedPkg.customPrice,
      );
    }
  };

  if (!section.packages.length) return null;

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < section.packages.length - 1;

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-transparent via-[var(--color-bg-secondary)]/30 to-transparent">
      <Container>
        {/* Header Text Block — matches pricing-section.tsx pattern */}
        <FadeIn direction="up">
          <div className="w-full max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.05] text-gradient">
              {section.title}
            </h2>
            <p className="mt-5 text-[17px] md:text-xl text-[var(--color-fg-tertiary)] leading-relaxed">
              {section.description}
            </p>
          </div>
        </FadeIn>

        {/* Billing Switcher — centered below text with flexible width */}
        <FadeIn direction="up" delay={0.1}>
          <div className="w-full flex justify-center items-center mt-8">
            <div className="flex items-center justify-center gap-4 w-full max-w-4xl px-4">

              {/* ── Desktop: full with chevrons (≥1280px) ── */}
              <div className="hidden xl:flex items-center gap-4">
                <button
                  onClick={goPrev}
                  disabled={!hasPrev}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                    "border border-[var(--color-border-primary)]/60",
                    !hasPrev
                      ? "opacity-25 cursor-not-allowed"
                      : "hover:bg-[var(--color-overlay)] hover:border-[var(--color-fg-tertiary)]/30 cursor-pointer",
                  )}
                  aria-label="Previous package"
                >
                  <ChevronLeft size={18} className="text-[var(--color-fg-tertiary)]" />
                </button>

                <div
                  ref={tabsContainerRef}
                  className="w-auto max-w-full inline-flex items-center justify-center gap-1 p-1.5 rounded-2xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)]/60"
                  role="tablist"
                  aria-label="Social media packages"
                >
                  {section.packages.map((pkg, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => setActiveIndex(i)}
                        className={cn(
                          "relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm font-medium whitespace-nowrap select-none",
                          "transition-all duration-300",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-subtle)]",
                          isActive
                            ? "text-[var(--color-fg-primary)]"
                            : "text-[var(--color-fg-tertiary)]/70 hover:text-[var(--color-fg-secondary)]",
                        )}
                        role="tab"
                        aria-selected={isActive}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="social-active-tab"
                            className="absolute inset-0 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-accent)]/30 shadow-sm"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            }}
                          />
                        )}
                        <span className="relative z-10">{pkg.name}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={goNext}
                  disabled={!hasNext}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                    "border border-[var(--color-border-primary)]/60",
                    !hasNext
                      ? "opacity-25 cursor-not-allowed"
                      : "hover:bg-[var(--color-overlay)] hover:border-[var(--color-fg-tertiary)]/30 cursor-pointer",
                  )}
                  aria-label="Next package"
                >
                  <ChevronRight size={18} className="text-[var(--color-fg-tertiary)]" />
                </button>
              </div>

              {/* ── Mid-range: wrapped tabs without chevrons (1024px–1279px) ── */}
              <div className="hidden lg:flex xl:hidden w-full">
                <div
                  className="flex flex-wrap justify-center items-center gap-2 p-2 rounded-2xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)]/60 w-full"
                  role="tablist"
                  aria-label="Social media packages"
                >
                  {section.packages.map((pkg, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => setActiveIndex(i)}
                        className={cn(
                          "relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm font-medium whitespace-nowrap select-none",
                          "transition-all duration-300",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-subtle)]",
                          isActive
                            ? "text-[var(--color-fg-primary)]"
                            : "text-[var(--color-fg-tertiary)]/70 hover:text-[var(--color-fg-secondary)]",
                        )}
                        role="tab"
                        aria-selected={isActive}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="social-active-tab-mid"
                            className="absolute inset-0 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-accent)]/30 shadow-sm"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            }}
                          />
                        )}
                        <span className="relative z-10">{pkg.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Below lg: flex-wrap centered tabs ── */}
              <div className="lg:hidden w-full">
                <div
                  className="flex flex-wrap justify-center items-center gap-2 p-2 rounded-2xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)]/60 w-full"
                  role="tablist"
                  aria-label="Social media packages"
                >
                  {section.packages.map((pkg, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => setActiveIndex(i)}
                        className={cn(
                          "relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap select-none",
                          "transition-all duration-300",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-subtle)]",
                          isActive
                            ? "text-[var(--color-fg-primary)]"
                            : "text-[var(--color-fg-tertiary)]/70 hover:text-[var(--color-fg-secondary)]",
                        )}
                        role="tab"
                        aria-selected={isActive}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="social-active-tab-responsive"
                            className="absolute inset-0 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-accent)]/30 shadow-sm"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            }}
                          />
                        )}
                        <span className="relative z-10">{pkg.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </FadeIn>

        {/* === CAROUSEL CONTENT AREA === */}
        <div className="relative mt-10 md:mt-12" ref={carouselRef}>
          {/* ── Wide desktop: carousel with side previews (≥1280px) ── */}
          <div className="hidden xl:block relative overflow-visible pt-8 pb-8">
            {/* Edge fade masks */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/60 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/60 to-transparent" />

            <div className="flex items-stretch justify-center gap-8">
              {/* ── Previous card preview ── */}
              <AnimatePresence mode="popLayout">
                {hasPrev && (
                  <motion.div
                    key={`preview-${section.packages[activeIndex - 1].id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
                    animate={{ opacity: 0.35, scale: 0.92, filter: "blur(6px)" }}
                    exit={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    className="w-[260px] shrink-0 pointer-events-none"
                  >
                    <SocialMediaPreviewCard pkg={section.packages[activeIndex - 1]} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Active card ── */}
              <div className="w-full max-w-lg z-10 shrink-0">
                <AnimatePresence mode="wait">
                  {selectedPkg && (                      <motion.div
                      key={selectedPkg.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{
                        duration: 0.35,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    >
                      <SocialMediaCard
                        pkg={selectedPkg}
                        expanded={expanded}
                        setExpanded={setExpanded}
                        hasManyFeatures={hasManyFeatures}
                        visibleFeatures={visibleFeatures}
                        handleCta={handleCta}
                        t={t}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Next card preview ── */}
              <AnimatePresence mode="popLayout">
                {hasNext && (
                  <motion.div
                    key={`preview-${section.packages[activeIndex + 1].id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
                    animate={{ opacity: 0.35, scale: 0.92, filter: "blur(6px)" }}
                    exit={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    className="w-[260px] shrink-0 pointer-events-none"
                  >
                    <SocialMediaPreviewCard pkg={section.packages[activeIndex + 1]} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Mid-range: single card with side dots (1024px–1279px) ── */}
          <div className="hidden lg:block xl:hidden">
            <AnimatePresence mode="wait">
              {selectedPkg && (
                <motion.div
                  key={selectedPkg.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  <SocialMediaCard
                    pkg={selectedPkg}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    hasManyFeatures={hasManyFeatures}
                    visibleFeatures={visibleFeatures}
                    handleCta={handleCta}
                    t={t}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Below lg: single card ── */}
          <div className="lg:hidden">
            <AnimatePresence mode="wait">
              {selectedPkg && (
                <motion.div
                  key={selectedPkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  <SocialMediaCard
                    pkg={selectedPkg}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    hasManyFeatures={hasManyFeatures}
                    visibleFeatures={visibleFeatures}
                    handleCta={handleCta}
                    t={t}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Carousel dots indicator */}
          <div className="mt-8 flex justify-center items-center gap-2">
            {section.packages.map((pkg, i) => (
              <button
                key={pkg.id}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "transition-all duration-300 rounded-full cursor-pointer",
                  i === activeIndex
                    ? "w-8 h-2 bg-[var(--color-accent)]"
                    : "w-2 h-2 bg-[var(--color-border-primary)]/50 hover:bg-[var(--color-fg-tertiary)]/40",
                )}
                aria-label={`Go to ${pkg.name}`}
              />
            ))}
          </div>
        </div>

        {/* Advertising budget note */}
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
      </Container>
    </section>
  );
}

// ── Social Media Card (full card) ───────────────────────────────────────

function SocialMediaCard({
  pkg,
  expanded,
  setExpanded,
  hasManyFeatures,
  visibleFeatures,
  handleCta,
  t,
}: {
  pkg: PricingSection["packages"][0];
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  hasManyFeatures: boolean;
  visibleFeatures: string[];
  handleCta: () => void;
  t: (key: string) => string;
}) {
  return (
    <ServiceCard
      index={0}
      title={pkg.name}
      price={formatPrice(pkg.price, pkg.priceSuffix)}
      billingLabel={pkg.billingLabel}
      features={visibleFeatures}
      featureTooltips={pkg.featureTooltips as Record<string, FeatureTooltipData> | undefined}
      deliveryTime={pkg.deliveryTime}
      showExpandToggle={hasManyFeatures}
      expanded={expanded}
      onToggleExpand={() => setExpanded(!expanded)}
      cta={pkg.cta}
      onSelect={handleCta}
    />
  );
}

// ── Social Media Preview Card (simplified, used in side carousel) ──────

function SocialMediaPreviewCard({ pkg }: { pkg: PricingSection["packages"][0] }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border-primary)]/40 bg-[var(--color-bg-surface)] h-full">
      <div className="p-6 md:p-7 select-none">
        <h4 className="text-[17px] md:text-xl font-bold text-[var(--color-fg-primary)] tracking-tight">
          {pkg.name}
        </h4>

        <div className="mt-4">
          <div className="inline-flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-bold text-[var(--color-fg-primary)] tracking-tight">
              {formatPrice(pkg.price, pkg.priceSuffix)}
            </span>
            {pkg.billingLabel && !String(pkg.price).includes(pkg.billingLabel) && (
              <span className="text-sm text-[var(--color-fg-tertiary)] font-medium">
                / {pkg.billingLabel}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {pkg.features.slice(0, 4).map((feature, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2 w-1 h-1 rounded-full bg-[var(--color-fg-muted)] shrink-0" />
              <span className="text-sm text-[var(--color-fg-tertiary)] line-clamp-1">
                {feature}
              </span>
            </div>
          ))}
          {pkg.features.length > 4 && (
            <p className="text-xs text-[var(--color-fg-muted)]">
              +{pkg.features.length - 4} more features
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
