"use client";

import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { highlightKeywords } from "@/lib/highlight-keywords";
import { REVEAL_INITIAL } from "@/lib/reveal-constants";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, CheckCircle2 } from "lucide-react";
import { FeatureTooltip } from "@/components/ui/feature-tooltip";
import { useTranslation } from "@/lib/use-dictionary";
import type { FeatureTooltipData } from "@/types";

export interface ServiceCardProps {
  index?: number;

  /** Optional icon node rendered in a circular badge */
  icon?: React.ReactNode;
  title: string;

  /** Price row */
  price: string;
  billingLabel?: string;

  /**
   * Features mode – when provided the card renders a feature checklist.
   * When omitted (or empty) the card falls into description mode.
   */
  features?: string[];
  featureTooltips?: Record<string, FeatureTooltipData>;
  featureListId?: string;

  /**
   * Description mode – rendered when features are not provided.
   * Only used by add-on cards.
   */
  description?: string;

  /** Pricing extras */
  deliveryTime?: string;

  /** Expand / collapse toggle (features mode only) */
  showExpandToggle?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;

  /** CTA */
  cta: string;
  onSelect: () => void;
}

export function ServiceCard({
  index = 0,
  icon,
  title,
  price,
  billingLabel,
  features,
  featureTooltips,
  featureListId,
  description,
  deliveryTime,
  showExpandToggle,
  expanded,
  onToggleExpand,
  cta,
  onSelect,
}: ServiceCardProps) {
  const { t } = useTranslation();
  const hasFeatures = features !== undefined && features.length > 0;
  const listId = featureListId || `sc-features-${index}`;

  return (
    <div
      data-reveal-direction="up"
      data-reveal-armed={REVEAL_INITIAL.armed}
      data-reveal-state={REVEAL_INITIAL.state}
      style={{
        "--reveal-delay": `${index * 0.08}s`,
        "--reveal-duration": "0.5s",
        "--reveal-distance": "24px",
      } as CSSProperties}
      className="relative flex flex-col rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] hover:border-[var(--color-fg-tertiary)] hover:bg-[var(--color-bg-surface-hover)] shadow-sm transition-all duration-500 h-full w-full"
    >
      <div className="flex flex-col justify-between h-full min-w-0 max-w-full p-6">
        {/* Header: Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          {icon && (
            <div className="w-10 h-10 rounded-full bg-[#F2F3F3] flex items-center justify-center shrink-0">
              <span className="text-[#858584]">{icon}</span>
            </div>
          )}
          <h3 className="text-[22px] font-bold leading-snug text-[var(--color-fg-primary)]">
            {title}
          </h3>
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight break-words text-[var(--color-fg-primary)]">
            {price}
          </span>
          {billingLabel && !price.includes(billingLabel) && (
            <span className="text-[15px] text-[var(--color-fg-tertiary)] ml-1 break-words">
              / {billingLabel}
            </span>
          )}
        </div>

        {/* ── Body ── */}
        {hasFeatures ? (
          <>
            {/* Divider */}
            <div className="mt-5 mb-4 border-t border-[var(--color-border-primary)]" />

            {/* Features list */}
            <ul id={listId} className="flex-1 space-y-2 min-h-0 relative">
              <AnimatePresence initial={false}>
              {features!.map((feature, i) => {
                const td = featureTooltips?.[feature];
                return (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="flex items-start gap-2.5 overflow-hidden"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="flex-1 text-[17px] text-[var(--color-fg-primary)]/85 leading-relaxed text-left">
                      {highlightKeywords(feature)}
                      {td && <FeatureTooltip tooltip={td} />}
                    </span>
                  </motion.li>
                );
              })}
              </AnimatePresence>
            </ul>

            {/* Expand / collapse toggle */}
            {showExpandToggle && (
              <div className="mt-5 flex justify-center">
                <button
                  onClick={onToggleExpand}
                  className="flex items-center gap-1 text-sm text-[var(--color-fg-tertiary)]/60 hover:text-[var(--color-fg-secondary)] transition-colors cursor-pointer"
                  aria-expanded={expanded}
                  aria-controls={listId}
                >
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform duration-300 flex-shrink-0",
                      expanded && "rotate-180",
                    )}
                  />
                  <span>
                    {expanded ? t("pricing.hideFeatures") : t("pricing.showAllFeatures")}
                  </span>
                </button>
              </div>
            )}

            {/* Delivery time */}
            {deliveryTime && (
              <div className="mt-4 text-center">
                <p className="inline-flex items-center gap-1.5 text-base md:text-[17px] font-medium text-[var(--color-fg-secondary)]">
                  <Clock size={14} className="flex-shrink-0 text-[var(--color-fg-tertiary)]" />
                  <span>{deliveryTime}</span>
                </p>
              </div>
            )}
          </>
        ) : (
          /* ── Description mode (addon cards) — no divider ── */
          <>
            {description && (
              <div className="mt-3 flex-1">
                <p className="text-[17px] text-[var(--color-fg-tertiary)] leading-relaxed">
                  {description}
                </p>
              </div>
            )}
          </>
        )}

        {/* CTA Button — always at the bottom */}
        <div className="mt-auto pt-6">
          <Button
            onClick={onSelect}
            variant="secondary"
            size="md"
            className="w-full bg-[var(--color-overlay)] border-0"
          >
            {cta}
          </Button>
        </div>
      </div>
    </div>
  );
}
