"use client";

import { type CSSProperties, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
  onPlanProject?: () => void;
}

const SOCIAL_FULL_INITIAL = 8;

/** Only social-full is allowed to be collapsible */
function isCollapsible(id: string): boolean {
  return id === "social-full";
}

export function PricingCard({ pkg, index = 0, onPlanProject }: PricingCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const collapsible = isCollapsible(pkg.id);

  // social-full: show first 8 features, collapse rest
  // all other packages: show all features permanently
  const hasManyFeatures = collapsible && pkg.features.length > SOCIAL_FULL_INITIAL;
  const visibleFeatures = hasManyFeatures
    ? (showAll ? pkg.features : pkg.features.slice(0, SOCIAL_FULL_INITIAL))
    : pkg.features;

  const featureListId = `features-${pkg.id}`;
  const hiddenCount = hasManyFeatures ? pkg.features.length - SOCIAL_FULL_INITIAL : 0;

  const handleCta = () => {
    if (pkg.customPrice && onPlanProject) {
      onPlanProject();
    } else {
      router.push(`/contact?package=${pkg.id}`);
    }
  };

  return (
    <div
      data-reveal-direction="up"
      data-reveal-state="visible"
      style={{
        "--reveal-delay": `${index * 0.08}s`,
        "--reveal-duration": "0.5s",
        "--reveal-distance": "24px",
      } as CSSProperties}
      className={cn(
        "relative flex flex-col rounded-2xl border transition-all duration-500",
        "overflow-hidden",
        pkg.highlighted
          ? "border-[var(--color-accent)] bg-[var(--color-bg-surface)] shadow-lg shadow-[var(--color-overlay)] md:scale-105 z-10"
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

        {/* Features — flex-1 to fill available space */}
        <ul id={featureListId} className="flex-1 space-y-2 min-h-0">
          {visibleFeatures.map((feature, i) => (
            <li
              key={i}
              className="service-feature-text flex items-start gap-2 text-sm text-[var(--color-fg-secondary)] leading-relaxed"
            >
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-fg-muted)] flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        {/* Bottom section — pushed to bottom via mt-auto */}
        <div className="mt-auto pt-8">
          {/* Expand / Collapse — only for social-full */}
          {hasManyFeatures && (
            <div className="mb-4 flex justify-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-1 text-xs text-[var(--color-fg-tertiary)]/60 hover:text-[var(--color-fg-secondary)] transition-colors cursor-pointer"
                aria-expanded={showAll}
                aria-controls={featureListId}
              >
                <ChevronDown
                  size={14}
                  className={cn(
                    "transition-transform duration-300 flex-shrink-0",
                    showAll && "rotate-180"
                  )}
                />
                  <span
                    key={showAll ? "hide" : "show"}
                    className="inline-block dropdown-pop"
                  >
                    {showAll
                      ? t("pricing.hideFeatures")
                      : t("pricing.showAllFeatures").replace("%count%", String(hiddenCount))}
                  </span>
              </button>
            </div>
          )}

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
