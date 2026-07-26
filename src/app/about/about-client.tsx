"use client";

import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { Section } from "@/components/ui/section";
import { StatsSection } from "@/components/sections/stats-section";
import { TextReveal } from "@/components/animations/text-reveal";

import { useTranslation } from "@/lib/use-dictionary";
import {
  ArrowRight,
  Goal,
  Eye,
  Heart,
  Lightbulb,
  Users,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Stat } from "@/types";




const values = [
  {
    icon: <Lightbulb size={20} />,
    titleKey: "about.values.items.0.title",
    descriptionKey: "about.values.items.0.description",
  },
  {
    icon: <Users size={20} />,
    titleKey: "about.values.items.1.title",
    descriptionKey: "about.values.items.1.description",
  },
  {
    icon: <Heart size={20} />,
    titleKey: "about.values.items.2.title",
    descriptionKey: "about.values.items.2.description",
  },
  {
    icon: <Rocket size={20} />,
    titleKey: "about.values.items.3.title",
    descriptionKey: "about.values.items.3.description",
  },
];

const timeline = [
  {
    titleKey: "data.about.timeline.0.title",
    descriptionKey: "data.about.timeline.0.description",
  },
  {
    titleKey: "data.about.timeline.1.title",
    descriptionKey: "data.about.timeline.1.description",
  },
  {
    titleKey: "data.about.timeline.2.title",
    descriptionKey: "data.about.timeline.2.description",
  },
  {
    titleKey: "data.about.timeline.3.title",
    descriptionKey: "data.about.timeline.3.description",
  },
  {
    titleKey: "data.about.timeline.4.title",
    descriptionKey: "data.about.timeline.4.description",
  },
];

function AboutPageContent({
  content,
  stats,
}: {
  content: Record<string, Record<string, string>>;
  stats: Stat[];
}) {
  const { t } = useTranslation();
  const heroContent = content.hero || {};
  const missionContent = content.mission || {};
  const visionContent = content.vision || {};
  const ctaContent = content.cta || {};

  return (
    <>
      {/* Hero */}
      <Section className="pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        <Container>
          <FadeIn direction="up">
            <Badge variant="outline">{heroContent.badge || t("about.badge")}</Badge>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <TextReveal
              as="h1"
              className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-gradient"
              staggerChildren={0.02}
            >
              {heroContent.heading || t("about.heading")}
            </TextReveal>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <p className="mt-6 max-w-2xl text-base md:text-lg text-[var(--color-fg-tertiary)] leading-relaxed">
              {heroContent.description || t("about.description")}
            </p>
          </FadeIn>
        </Container>
      </Section>

      {/* Mission & Vision */}
      <Section className="py-16 md:py-20 bg-[var(--color-bg-secondary)]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <FadeIn direction="up">
              <div className="p-8 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] h-full">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-overlay)] flex items-center justify-center text-[var(--color-fg-tertiary)]/70 mb-4">
                  <Goal size={20} />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-fg-primary)]">
                  {missionContent.title || t("about.mission.title")}
                </h2>
                <p className="mt-3 text-base text-[var(--color-fg-tertiary)] leading-relaxed">
                  {missionContent.description || t("about.mission.description")}
                </p>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.1}>
              <div className="p-8 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] h-full">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-overlay)] flex items-center justify-center text-[var(--color-fg-tertiary)]/70 mb-4">
                  <Eye size={20} />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-fg-primary)]">
                  {visionContent.title || t("about.vision.title")}
                </h2>
                <p className="mt-3 text-base text-[var(--color-fg-tertiary)] leading-relaxed">
                  {visionContent.description || t("about.vision.description")}
                </p>
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section className="py-16 md:py-20">
        <Container>
          <FadeIn direction="up">
            <Badge variant="outline">{t("about.values.badge")}</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gradient">
              {t("about.values.heading")}
            </h2>
            <p className="mt-4 text-base text-[var(--color-fg-tertiary)] leading-relaxed max-w-xl">
              {t("about.values.description")}
            </p>
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, index) => (
              <FadeIn key={index} delay={index * 0.05}>
                <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-surface-hover)] transition-all duration-500 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-overlay)] flex items-center justify-center text-[var(--color-fg-tertiary)]/70 mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-fg-primary)]">
                    {t(value.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-fg-tertiary)] leading-relaxed">
                    {t(value.descriptionKey)}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* Statistics */}
      <Section className="py-16 md:py-20 bg-[var(--color-bg-secondary)]">
        <StatsSection size="lg" stats={stats} />
      </Section>

      {/* Timeline */}
      <Section className="py-16 md:py-20">
        <Container>
          <FadeIn direction="up">
            <Badge variant="outline">{t("about.journey.badge")}</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gradient">
              {t("about.journey.heading")}
            </h2>
          </FadeIn>

          <div className="mt-12 relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-border-primary)]/50 via-[var(--color-border-primary)]/30 to-transparent hidden md:block" />

            <div className="space-y-8 md:space-y-12">
              {timeline.map((item, index) => (
                <FadeIn key={index} delay={index * 0.1}>
                  <div className="relative md:flex gap-8">
                    <div className="hidden md:flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full bg-[var(--color-overlay)] border border-[var(--color-border-primary)]">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-fg-tertiary)]/50" />
                    </div>

                    <div className="flex-1 pt-0 md:pt-1 ml-12 md:ml-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-fg-tertiary)]/50">
                          {["2020", "2021", "2022", "2023", "2024"][index]}
                        </span>
                        <div className="h-px flex-1 bg-[var(--color-border-primary)]" />
                      </div>
                      <h3 className="text-xl font-semibold text-[var(--color-fg-primary)]">
                        {t(item.titleKey)}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--color-fg-tertiary)] leading-relaxed max-w-xl">
                        {t(item.descriptionKey)}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="py-16 md:py-20">
        <Container>
          <FadeIn direction="up">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[var(--color-overlay)] to-transparent border border-[var(--color-border-primary)] p-10 md:p-16 text-center">
              <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-glow)] rounded-full blur-[100px]" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">
                  {ctaContent.heading || t("about.cta.heading")}
                </h2>
                <p className="mt-4 text-base text-[var(--color-fg-tertiary)] leading-relaxed max-w-lg mx-auto">
                  {ctaContent.description || t("about.cta.description")}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/contact">
                    <Button variant="primary" size="lg" className="gap-2 group">
                      {ctaContent.getInTouch || t("about.cta.getInTouch")}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button variant="secondary" size="lg">
                      {ctaContent.exploreServices || t("about.cta.exploreServices")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}

export function AboutPageClient({
  content,
  stats,
}: {
  content: Record<string, Record<string, string>>;
  stats: Stat[];
}) {
  return <AboutPageContent content={content} stats={stats} />;
}
