"use client";

import { FadeIn } from "@/components/animations/fade-in";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useTranslation } from "@/lib/use-dictionary";
import type { Stat } from "@/types";

interface StatsSectionProps {
  size?: "sm" | "lg";
  stats: Stat[];
}

export function StatsSection({ size = "sm", stats }: StatsSectionProps) {
  const { t } = useTranslation();
  const valueClass =
    size === "lg"
      ? "text-5xl md:text-6xl font-bold tracking-tight text-gradient"
      : "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gradient";

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="rounded-3xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] px-6 py-12 md:px-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {stats.map((stat, index) => (
            <FadeIn key={stat.label} delay={index * 0.1}>
              <div className="text-center">
                <div className={valueClass}>
                  <AnimatedCounter
                    to={stat.value}
                    suffix={stat.suffix || ""}
                    duration={2}
                  />
                </div>
                <p className="mt-2 text-sm text-[var(--color-fg-tertiary)]">
                  {t(`stats.${stat.translationKey!}`)}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
