"use client";

import { type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { REVEAL_INITIAL } from "@/lib/reveal-constants";
import type { ServiceAddon } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  BarChart3,
  Mail,
  Globe,
} from "lucide-react";
import { useTranslation } from "@/lib/use-dictionary";
import { scrollToPageTop } from "@/lib/public-scroll";

const iconMap: Record<string, React.ReactNode> = {
  Search: <Search size={24} />,
  MapPin: <MapPin size={24} />,
  BarChart3: <BarChart3 size={24} />,
  Mail: <Mail size={24} />,
  Globe: <Globe size={24} />,
};

interface ServiceAddonCardProps {
  addon: ServiceAddon;
  index?: number;
}

export function ServiceAddonCard({
  addon,
  index = 0,
}: ServiceAddonCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleCta = () => {
    scrollToPageTop();
    router.push(`/contact?service=${addon.id}`, { scroll: false });
  };

  return (
    <div
      data-reveal-direction="up"
      data-reveal-armed={REVEAL_INITIAL.armed}
      data-reveal-state={REVEAL_INITIAL.state}
      style={{
        "--reveal-delay": `${index * 0.06}s`,
        "--reveal-duration": "0.4s",
        "--reveal-distance": "20px",
      } as CSSProperties}
      className="relative flex flex-col rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] p-6 md:p-8 hover:border-[var(--color-fg-tertiary)] hover:bg-[var(--color-bg-surface-hover)] transition-all duration-300 overflow-hidden"
    >
      <div className="flex flex-col h-full min-w-0 max-w-full">
        {/* Icon + Name */}
        <div className="flex items-center gap-3">
          {addon.iconName && iconMap[addon.iconName] && (
            <span className="w-10 h-10 rounded-xl bg-[var(--color-overlay)] flex items-center justify-center text-[var(--color-fg-tertiary)]/70 flex-shrink-0">
              {iconMap[addon.iconName]}
            </span>
          )}
          <h3 className="text-lg md:text-xl font-bold text-[var(--color-fg-primary)]">
            {addon.name}
          </h3>
        </div>

        {/* Price — matching main pricing card hierarchy */}
        <div className="mt-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl md:text-4xl font-bold text-[var(--color-accent)] tracking-tight break-words">
              {addon.price}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-base text-[var(--color-fg-secondary)] leading-relaxed flex-1">
          {addon.description}
        </p>

        {/* Example */}
        {addon.example && (
          <p className="mt-3 text-sm text-[var(--color-fg-muted)] font-mono">
            {addon.example}
          </p>
        )}

        {/* Bottom section — pushed to bottom */}
        <div className="mt-auto pt-8">
          {/* Divider */}
          <div className="mb-5 border-t border-[var(--color-border-primary)]" />

          {/* CTA */}
          <Button
            onClick={handleCta}
            variant="secondary"
            size="md"
            className="w-full bg-[var(--color-overlay)] border-0"
          >
            {t("pricing.choosePackage")}
          </Button>
        </div>
      </div>
    </div>
  );
}
