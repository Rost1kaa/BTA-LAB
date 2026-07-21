"use client";

import { type CSSProperties, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { REVEAL_INITIAL } from "@/lib/reveal-constants";
import type { PricingPackage } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Globe,
  Star,
  ShoppingCart,
  Zap,
  Wrench,
  ChevronDown,
  Clock,
} from "lucide-react";
import { useTranslation } from "@/lib/use-dictionary";
import { scrollToPageTop } from "@/lib/public-scroll";

const iconMap: Record<string, React.ReactNode> = {
  Rocket: <Rocket size={24} />,
  Globe: <Globe size={24} />,
  Star: <Star size={24} />,
  ShoppingCart: <ShoppingCart size={24} />,
  Zap: <Zap size={24} />,
  Wrench: <Wrench size={24} />,
};

interface PricingCardProps {
  pkg: PricingPackage;
  index?: number;
  onPlanProject?: (pkgId: string, pkgName: string, pkgPrice: string, isCustomPrice: boolean) => void;
  /** If set, cards with more features than this will truncate with a toggle to show/hide the rest */
  maxVisibleFeatures?: number;
  onExpandedChange?: (pkgId: string, expanded: boolean) => void;
  /** Fixed height in px to apply when collapsed (matching the reference card's natural height) */
  fixedHeight?: number;
  /** Callback to report the card's natural rendered height (used by the reference card) */
  onMeasure?: (height: number) => void;
}

export function PricingCard({
  pkg,
  index = 0,
  onPlanProject,
  maxVisibleFeatures,
  onExpandedChange,
  fixedHeight,
  onMeasure,
}: PricingCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isCollapsed = maxVisibleFeatures !== undefined && !expanded;
  const hasManyFeatures = maxVisibleFeatures !== undefined && pkg.features.length > maxVisibleFeatures;
  const visibleFeatures = isCollapsed
    ? pkg.features.slice(0, maxVisibleFeatures)
    : pkg.features;

  const featureListId = `features-${pkg.id}`;
  const usesFeatureLimit = maxVisibleFeatures !== undefined;

  // Measure this card's natural height and report it to the parent (for the reference card only)
  useEffect(() => {
    if (onMeasure && cardRef.current) {
      onMeasure(cardRef.current.getBoundingClientRect().height);
    }
  }, [onMeasure]);

  // Build inline style: CSS variables for reveal animation + fixed height when collapsed
  const cardStyle = {
    "--reveal-delay": `${index * 0.08}s`,
    "--reveal-duration": "0.5s",
    "--reveal-distance": "24px",
    ...(fixedHeight !== undefined && !expanded
      ? { height: fixedHeight, overflow: "hidden" as const }
      : {}),
  } as CSSProperties;

  const handleCta = () => {
    if (onPlanProject) {
      onPlanProject(pkg.id, pkg.name, pkg.price, !!pkg.customPrice);
    } else {
      scrollToPageTop();
      router.push(`/contact?package=${pkg.id}`, { scroll: false });
    }
  };

  return (
    <div
      ref={cardRef}
      data-reveal-direction="up"
      data-reveal-armed={REVEAL_INITIAL.armed}
      data-reveal-state={REVEAL_INITIAL.state}
      style={cardStyle}
      className={cn(
        "relative flex flex-col rounded-2xl border transition-all duration-500",
        "overflow-hidden",
        pkg.highlighted
          ? cn(
              "border-[var(--color-accent)] bg-[var(--color-bg-surface)] shadow-lg shadow-[var(--color-overlay)] z-10",
              !usesFeatureLimit && "md:scale-105"
            )
          : "border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] hover:border-[var(--color-fg-tertiary)] hover:bg-[var(--color-bg-surface-hover)]"
      )}
    >
      {/* Highlighted badge */}
      {pkg.highlighted && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-b-xl bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-xs font-medium tracking-wider uppercase">
          {t("pricing.recommended")}
        </div>
      )}

      <div className="flex flex-col h-full min-w-0 max-w-full p-6 md:p-8 pb-6 md:pb-8">
        {/* Card Header */}
        <div>
          {/* Icon + Name */}
          <div className="flex items-center gap-3">
            {pkg.iconName && iconMap[pkg.iconName] && (
              <span className="w-10 h-10 rounded-xl bg-[var(--color-overlay)] flex items-center justify-center text-[var(--color-fg-tertiary)]/70 flex-shrink-0">
                {iconMap[pkg.iconName]}
              </span>
            )}
            <h3
              className={cn(
                "text-lg md:text-xl font-bold text-[var(--color-fg-primary)]",
                pkg.highlighted && "mt-1"
              )}
            >
              {pkg.name}
            </h3>
          </div>

          {/* Description */}
          {pkg.description && (
            <p className="mt-3 text-sm text-[var(--color-fg-secondary)] leading-relaxed">
              {pkg.description}
            </p>
          )}

          {/* Price */}
          <div className="mt-4">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-accent)] tracking-tight break-words">
                {pkg.price}
              </span>
              {pkg.billingLabel && (
                <span className="text-xs text-[var(--color-fg-tertiary)] ml-1 break-words">
                  / {pkg.billingLabel}
                </span>
              )}
            </div>
            {pkg.priceExplanation && (
              <p className="mt-1 text-xs text-[var(--color-fg-tertiary)] leading-relaxed">
                {pkg.priceExplanation}
              </p>
            )}
            {pkg.idealFor && (
              <p className="mt-3 text-xs text-[var(--color-fg-secondary)] leading-relaxed">
                {pkg.idealFor}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="mt-5 mb-4 border-t border-[var(--color-border-primary)]" />
        </div>

        {/* Features — flex-1 only when NOT using a fixed height (Website section needs it; Social Media cards with fixed height don't to avoid empty gaps) */}
        <motion.ul
          layout
          id={featureListId}
          className={cn(
            "space-y-2 min-h-0",
            fixedHeight === undefined && "flex-1"
          )}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {visibleFeatures.map((feature, i) => (
            <li
              key={i}
              className="service-feature-text flex items-start gap-2 text-sm text-[var(--color-fg-secondary)] leading-relaxed"
            >
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-fg-muted)] flex-shrink-0" />
              {feature}
            </li>
          ))}
        </motion.ul>

        {/* Expand / Collapse toggle — directly after feature list in normal document flow (NOT inside mt-auto) so it always appears right below the last visible feature, never overlapping it */}
        {hasManyFeatures && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {
                const nextExpanded = !expanded;
                setExpanded(nextExpanded);
                onExpandedChange?.(pkg.id, nextExpanded);
              }}
              className="flex items-center gap-1 text-xs text-[var(--color-fg-tertiary)]/60 hover:text-[var(--color-fg-secondary)] transition-colors cursor-pointer"
              aria-expanded={expanded}
              aria-controls={featureListId}
            >
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform duration-300 flex-shrink-0",
                  expanded && "rotate-180"
                )}
              />
                <span
                  key={expanded ? "hide" : "show"}
                  className="inline-block dropdown-pop"
                >
                  {expanded
                    ? t("pricing.hideFeatures")                      : t("pricing.showAllFeatures")}
                </span>
            </button>
          </div>
        )}

        {/* Bottom section — just delivery time + CTA, pushed to bottom via mt-auto */}
        <div className="mt-auto pt-8">
          {/* Delivery time — centered above CTA */}
          {pkg.deliveryTime && (
            <div className="mb-5 text-center">
              <p className="inline-flex items-center gap-1.5 text-sm md:text-base font-medium text-[var(--color-fg-secondary)]">
                <Clock size={14} className="flex-shrink-0 text-[var(--color-fg-tertiary)]" />
                <span>{pkg.deliveryTime}</span>
              </p>
            </div>
          )}

          {/* CTA — using shared Button component for liquid-fill + consistent sizing */}
          <Button
            onClick={handleCta}
            variant={pkg.highlighted ? "primary" : "secondary"}
            size="md"
            className={cn(
              "w-full",
              !pkg.highlighted && "bg-[var(--color-overlay)] border-0"
            )}
          >
            {pkg.cta}
          </Button>
        </div>
      </div>
    </div>
  );
}
