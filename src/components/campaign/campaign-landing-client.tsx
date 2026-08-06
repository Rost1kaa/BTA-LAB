"use client";

import { useState, useRef, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Award, Clock, Code, Heart, Shield, Handshake, TrendingUp,
  Star, Zap, ChevronDown, Phone, MessageCircle, Camera, Music,
  Check, FileText, Search, Gift,
  Globe, Package, MessageSquare, ShoppingCart, Rocket,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Section } from "@/components/ui/section";
import { useTranslation } from "@/lib/use-dictionary";
import type {
  CampaignSection, CampaignFAQ as CampaignFAQType,
  CampaignCard, CampaignTimelineItem, CampaignStatistic,
  CampaignCTA as CampaignCTAType,
} from "@/lib/campaign-types";

// ═══════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Award, Clock, Code, Heart, Shield, Star, Zap,
  Handshake, TrendingUp,
  ArrowRight,
};

function Icon({ name, className, size = 24 }: { name?: string; className?: string; size?: number }) {
  if (!name) return null;
  const C = ICON_MAP[name];
  if (!C) return null;
  return <C size={size} className={className} />;
}

interface CampaignLocaleContent {
  sections: CampaignSection[];
  faq: CampaignFAQType[];
  cards: Record<string, CampaignCard[]>;
  timeline: Record<string, CampaignTimelineItem[]>;
  statistics: Record<string, CampaignStatistic[]>;
  cta: Record<string, CampaignCTAType[]>;
  settings: Record<string, string>;
}

function useLocale(section: CampaignSection): {
  title: string; subtitle: string; description: string; content: string;
  badge: string; buttonText: string; buttonUrl: string;
} {
  const { locale } = useTranslation();
  return {
    title: locale === "ka" ? section.title_ka : section.title_en,
    subtitle: locale === "ka" ? section.subtitle_ka : section.subtitle_en,
    description: locale === "ka" ? section.description_ka : section.description_en,
    content: locale === "ka" ? section.content_ka : section.content_en,
    badge: locale === "ka" ? section.badge_ka : section.badge_en,
    buttonText: locale === "ka" ? section.button_text_ka : section.button_text_en,
    buttonUrl: section.button_url,
  };
}

function useCardLocale(card: CampaignCard): { title: string; description: string; badge: string } {
  const { locale } = useTranslation();
  return {
    title: locale === "ka" ? card.title_ka : card.title_en,
    description: locale === "ka" ? card.description_ka : card.description_en,
    badge: locale === "ka" ? card.badge_ka : card.badge_en,
  };
}

// ── Bullet icon mapping ────────────────────────────────────────────────────
// Maps known bullet text fragments to Lucide icons

const BULLET_ICONS: Array<{ match: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
  { match: "შეექმნათ პროფესიული", icon: Globe },
  { match: "წარმოაჩინონ საკუთარი", icon: Package },
  { match: "გააუმჯობესონ მომხმარებელთან", icon: MessageSquare },
  { match: "მიიღონ ონლაინ განაცხადები", icon: ShoppingCart },
  { match: "დაიწყონ ან გააძლიერონ", icon: Rocket },
];

function getBulletIcon(text: string): React.ComponentType<{ size?: number; className?: string }> | null {
  const trimmed = text.replace(/^[•-]\s*/, "").trim();
  for (const entry of BULLET_ICONS) {
    if (trimmed.startsWith(entry.match)) return entry.icon;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO — Two-Column Layout with Right-Side Widget Cards
// ═══════════════════════════════════════════════════════════════════════════

function RoadmapCard({ currentStep }: { currentStep: number }) {
  const { locale } = useTranslation();

  const steps = [
    { id: 1, key: "submission", label_ka: "განაცხადი", label_en: "Submission", icon: FileText },
    { id: 2, key: "review", label_ka: "განხილვა", label_en: "Review", icon: Search },
    { id: 3, key: "selection", label_ka: "შერჩევა", label_en: "Selection", icon: Check },
    { id: 4, key: "funding", label_ka: "დაფინანსება", label_en: "Funding", icon: Gift },
  ];

  // Progress percentage: 0% at step 1, 33.33% at step 2, 66.66% at step 3, 100% at step 4
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="relative rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)]/90 backdrop-blur-sm p-5 md:p-6 overflow-hidden">
      {/* Subtle background ornament */}
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[var(--color-accent)]/5 rounded-full blur-xl" />
      <div className="relative z-10">
        <p className="text-sm font-medium text-[var(--color-fg-tertiary)] mb-5">
          {locale === "ka" ? "კამპანიის ეტაპები" : "Campaign Roadmap"}
        </p>

        <div className="relative w-full pt-2 pb-2">
          {/* 1. Base grey track line — BEHIND circles (z-0) */}
          <div className="absolute top-[28px] left-[24px] right-[24px] h-[3px] bg-slate-200 rounded-full z-0" />

          {/* 2. Active green progress line — BEHIND circles (z-0) */}
          <div
            className="absolute top-[28px] left-[24px] h-[3px] bg-emerald-500 rounded-full z-0 transition-all duration-500 ease-in-out"
            style={{ width: `calc(${progressPercentage}% - ${progressPercentage === 100 ? 48 : 24}px)` }}
          />

          {/* 3. Stepper nodes — ON TOP of lines (z-10) with solid bg to prevent bleed-through */}
          <div className="relative z-10 flex justify-between items-center">
            {steps.map((step) => {
              const isActive = step.id <= currentStep;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center">
                  {/* Circle — solid bg, no transparency */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-md ring-4 ring-white"
                        : "bg-white border-2 border-slate-200 text-slate-400 shadow-sm"
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  {/* Label below circle — high contrast */}
                  <span
                    className={`text-xs mt-2.5 font-medium transition-colors ${
                      isActive ? "text-slate-900 font-semibold" : "text-slate-400"
                    }`}
                  >
                    {locale === "ka" ? step.label_ka : step.label_en}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Process hero description with styled highlights and external links ──

function renderRichSegment(segment: string, index: number): React.ReactNode {
  const ACADEMY_TEXT = "ბიზნესისა და ტექნოლოგიების აკადემია";
  const PROJECT_COUNT = "10 პროექტი";
  const PERCENTAGE_PATTERN = /(100%|60%|30%-?იან)/g;

  // Check for academy link
  if (segment === ACADEMY_TEXT) {
    return (
      <a
        key={index}
        href="https://bta.edu.ge"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-accent)] underline decoration-[var(--color-accent)]/40 underline-offset-4 hover:decoration-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 rounded-sm transition-all duration-200 font-semibold"
      >
        {ACADEMY_TEXT}
      </a>
    );
  }

  // Check for project count
  if (segment === PROJECT_COUNT) {
    return (
      <span
        key={index}
        className="underline decoration-[var(--color-accent)]/40 underline-offset-4 font-semibold"
      >
        {PROJECT_COUNT}
      </span>
    );
  }

  // Check for percentage patterns — split further to highlight only the percentage part
  const parts = segment.split(PERCENTAGE_PATTERN);
  if (parts.length > 1) {
    return (
      <span key={index}>
        {parts.map((part, i) => {
          if (PERCENTAGE_PATTERN.test(part)) {
            return (
              <span
                key={i}
                className="underline decoration-[var(--color-accent)]/40 underline-offset-4 font-semibold"
              >
                {part}
              </span>
            );
          }
          // Re-test the regex because .test() advances lastIndex
          PERCENTAGE_PATTERN.lastIndex = 0;
          return part;
        })}
      </span>
    );
  }

  // Plain text — return as-is
  return <Fragment key={index}>{segment}</Fragment>;
}

function parseRichParagraph(paragraph: string): React.ReactNode[] {
  const ACADEMY_TEXT = "ბიზნესისა და ტექნოლოგიების აკადემია";
  const PROJECT_COUNT = "10 პროექტი";
  const PERCENTAGE_PATTERN = /(100%|60%|30%-?იან)/g;

  // Split by academy text first
  const academyParts = paragraph.split(ACADEMY_TEXT);
  const nodes: React.ReactNode[] = [];

  academyParts.forEach((part, idx) => {
    if (idx > 0) {
      nodes.push(renderRichSegment(ACADEMY_TEXT, nodes.length));
    }
    if (part) {
      // Further split by "10 პროექტი"
      const projectParts = part.split(PROJECT_COUNT);
      projectParts.forEach((projectPart, pIdx) => {
        if (pIdx > 0) {
          nodes.push(renderRichSegment(PROJECT_COUNT, nodes.length));
        }
        if (projectPart) {
          // Check if this segment contains percentage patterns
          if (PERCENTAGE_PATTERN.test(projectPart)) {
            PERCENTAGE_PATTERN.lastIndex = 0;
            nodes.push(renderRichSegment(projectPart, nodes.length));
          } else {
            PERCENTAGE_PATTERN.lastIndex = 0;
            nodes.push(<Fragment key={nodes.length}>{projectPart}</Fragment>);
          }
        }
      });
    }
  });

  return nodes;
}

function HeroDescription({ text }: { text: string; locale: string }) {
  if (!text) return null;

  // Split into paragraphs on double newline
  const paragraphs = text.split('\n\n').filter(Boolean);

  if (paragraphs.length <= 1) {
    // Single paragraph — render inline
    return <>{parseRichParagraph(text)}</>;
  }

  // Multiple paragraphs — render each as its own <p>
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i} className={i > 0 ? 'mt-4' : ''}>
          {parseRichParagraph(para)}
        </p>
      ))}
    </>
  );
}

function HeroSection({ section, stats, currentStep }: { section: CampaignSection; stats?: CampaignStatistic[]; currentStep: number }) {
  const { locale } = useTranslation();
  const loc = useLocale(section);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "start end"] });
  // Smooth premium fade + upward parallax motion:
  // - Stays fully visible through first ~35% of scroll
  // - Gradually fades from 1 → 0.1 and moves upward
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [1, 1, 0.35, 0.08]);
  const y = useTransform(scrollYProgress, [0, 0.35, 0.85], [0, 0, -120]);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-20" id="campaign-hero">
      {/* Background Glows */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[var(--color-glow)] rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[var(--color-glow)] rounded-full blur-[150px]" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Dot grid top-right */}
        <svg className="absolute top-12 right-8 w-32 h-32 opacity-20" viewBox="0 0 100 100">
          <pattern id="dot-grid" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="var(--color-fg-tertiary)" />
          </pattern>
          <rect width="100" height="100" fill="url(#dot-grid)" />
        </svg>

        {/* Floating diamond */}
        <svg className="absolute top-1/3 right-1/3 w-16 h-16 opacity-10 animate-float" viewBox="0 0 40 40" style={{ animationDelay: "1s" }}>
          <rect x="10" y="10" width="20" height="20" rx="2" transform="rotate(45 20 20)" fill="none" stroke="var(--color-fg-tertiary)" strokeWidth="2" />
        </svg>

        {/* Bottom-left cross pattern */}
        <svg className="absolute bottom-20 left-10 w-24 h-24 opacity-10" viewBox="0 0 60 60">
          <line x1="30" y1="0" x2="30" y2="60" stroke="var(--color-fg-tertiary)" strokeWidth="1.5" />
          <line x1="0" y1="30" x2="60" y2="30" stroke="var(--color-fg-tertiary)" strokeWidth="1.5" />
        </svg>

        {/* Right side decorative dots */}
        <svg className="absolute bottom-1/4 right-4 w-20 h-20 opacity-15" viewBox="0 0 50 50">
          <circle cx="10" cy="10" r="2" fill="var(--color-accent)" />
          <circle cx="25" cy="10" r="2" fill="var(--color-accent)" />
          <circle cx="40" cy="10" r="2" fill="var(--color-accent)" />
          <circle cx="10" cy="25" r="2" fill="var(--color-accent)" />
          <circle cx="25" cy="25" r="2" fill="var(--color-accent)" />
          <circle cx="40" cy="25" r="2" fill="var(--color-accent)" />
          <circle cx="10" cy="40" r="2" fill="var(--color-accent)" />
          <circle cx="25" cy="40" r="2" fill="var(--color-accent)" />
          <circle cx="40" cy="40" r="2" fill="var(--color-accent)" />
        </svg>

        {/* Top-left geometric ring */}
        <svg className="absolute top-16 left-8 w-20 h-20 opacity-10 animate-float" viewBox="0 0 60 60" style={{ animationDelay: "2.5s" }}>
          <circle cx="30" cy="30" r="20" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
          <circle cx="30" cy="30" r="12" fill="none" stroke="var(--color-accent)" strokeWidth="1" />
        </svg>
      </div>

      <motion.div style={{ opacity, y }} className="relative z-10 w-full">
        <Container>
          {/* Two-column responsive grid — no mx-auto centering */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full py-16 md:py-24">
            {/* ── LEFT COLUMN: col-span-7 ────────────────────────── */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                {loc.badge && (
                  <Badge variant="outline" size="md" className="mb-6">{loc.badge}</Badge>
                )}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gradient leading-[1.05]">
                  {loc.title}
                </h1>
                <div className="mt-6 text-lg md:text-xl text-[var(--color-fg-tertiary)] leading-relaxed">
                  <HeroDescription text={loc.description} locale={locale} />
                </div>
                <div className="mt-8 flex flex-wrap gap-4">
                  {loc.buttonText && (
                    <Link href={loc.buttonUrl || "/entrepreneur-support/apply"}>
                      <Button size="xl" variant="primary" className="gap-2 group text-base">
                        {loc.buttonText}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  )}
                  <Link href="/entrepreneur-support/details">
                    <Button size="xl" variant="secondary">
                      {locale === "ka" ? "შეიტყვე მეტი" : "Learn More"}
                    </Button>
                  </Link>
                </div>

                {/* Stat Cards — left-aligned */}
                {stats && stats.length > 0 && (
                  <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                    {stats.map((s, i) => {
                      const showCounter = s.sort_order < 2;
                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                          className="group py-[14px] px-4 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)]/80 backdrop-blur-sm hover:bg-[var(--color-bg-surface)] transition-all duration-300 hover:scale-[1.02] flex flex-col"
                        >
                          {/* Stat Header: Icon + Number on same line */}
                          <div className="flex items-center gap-3 mb-0.5 min-h-[36px]">
                            <div className="shrink-0">
                              {s.icon && <Icon name={s.icon} className="text-[var(--color-fg-primary)]" />}
                            </div>
                            {showCounter ? (
                              <span className="text-xl font-semibold tracking-tight text-[var(--color-fg-primary)]">
                                <AnimatedCounter to={s.value} suffix={locale === "ka" ? s.suffix_ka : s.suffix_en} duration={2} />
                              </span>
                            ) : (
                              <span className="sr-only">{s.value}{locale === "ka" ? s.suffix_ka : s.suffix_en}</span>
                            )}
                          </div>
                          {/* Stat Title below */}
                          <p className="text-xs md:text-sm text-[var(--color-fg-tertiary)] leading-tight">
                            {locale === "ka" ? s.label_ka : s.label_en}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── RIGHT COLUMN: col-span-5 ───────────────────────── */}
            <div className="lg:col-span-5 space-y-5 lg:pt-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <RoadmapCard currentStep={currentStep} />
              </motion.div>
            </div>
          </div>
        </Container>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT SECTION (alternating layouts)
// ═══════════════════════════════════════════════════════════════════════════

function ContentSection({ section, index }: { section: CampaignSection; index: number }) {
  const loc = useLocale(section);
  const isReversed = index % 2 === 1;
  if (!loc.title && !loc.description) return null;

  return (
    <Section id={`campaign-${section.section_key}`} className={index % 2 === 1 ? "bg-[var(--color-bg-secondary)]" : ""}>
      <Container>
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center`}>
          {/* Left: Illustration — large logo for overview section */}
          <FadeIn direction={isReversed ? "right" : "left"}>
            <div className="relative group">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-slate-900/5 via-indigo-500/10 to-blue-600/5 dark:from-slate-900/20 dark:via-indigo-500/15 dark:to-blue-600/10 border border-white/10 dark:border-white/5 overflow-hidden shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 transition-all duration-300 ease-out hover:scale-[1.01]">
                <div className="absolute inset-0">
                  {section.section_key === "overview" ? (
                    <>
                      <Image
                        src="/images/campain.webp"
                        alt="Campaign Illustration"
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="w-full h-full object-cover"
                        priority
                      />
                      {/* Gradient overlay to ensure readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-[var(--color-overlay)] flex items-center justify-center mb-4">
                          {section.icon && <Icon name={section.icon} size={32} className="text-[var(--color-fg-primary)]" />}
                        </div>
                        <p className="text-sm text-[var(--color-fg-tertiary)]">{loc.badge || section.section_key}</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Decorative grid */}
                <div className="absolute inset-0 grid-pattern opacity-20" />
              </div>
            </div>
          </FadeIn>

          {/* Right: Content */}
          <FadeIn direction={isReversed ? "left" : "right"} delay={0.1}>
            <div className={isReversed ? "lg:order-first" : ""}>
              {loc.badge && <Badge variant="outline" className="mb-4">{loc.badge}</Badge>}
              {loc.title && (
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gradient">
                  {loc.title}
                </h2>
              )}
              {loc.description && (
                <div className="mt-4 space-y-2">
                  {loc.description.split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed);
                    const isBold = trimmed.startsWith('**') && trimmed.endsWith('**');
                    if (!trimmed) return <div key={i} className="h-4" />;
                    const BulletIcon = isBullet ? getBulletIcon(trimmed) : null;
                    return (
                      <p key={i} className={`text-sm md:text-base leading-relaxed flex items-start gap-3 ${
                        isBullet
                          ? 'text-[var(--color-fg-tertiary)]'
                          : isBold
                            ? 'text-[var(--color-fg-primary)] font-semibold'
                            : 'text-[var(--color-fg-tertiary)]'
                      }`}>
                        {BulletIcon && (
                          <BulletIcon size={18} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                        )}
                        <span>{isBullet ? trimmed.replace(/^[•-]\s*/, '') : line}</span>
                      </p>
                    );
                  })}
                </div>
              )}

              {section.section_key !== "overview" && loc.content && (
                <div className="mt-6 p-5 rounded-xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)]">
                  {loc.content.split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed);
                    const isBold = trimmed.startsWith('**') && trimmed.endsWith('**');
                    const isItalic = trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('**');
                    if (!trimmed) return <div key={i} className="h-1" />;
                    const BulletIcon = isBullet ? getBulletIcon(trimmed) : null;
                    const contentText = trimmed.replace(/^\*\*(.*)\*\*$/, '$1').replace(/^\*(.*)\*$/, '$1');
                    return (
                      <p key={i} className={`leading-relaxed flex items-start gap-2 ${
                        isBullet
                          ? 'text-sm text-[var(--color-fg-secondary)]'
                          : isBold
                            ? 'text-sm text-[var(--color-fg-primary)] font-semibold'
                            : isItalic
                              ? 'text-sm text-[var(--color-fg-tertiary)] italic'
                              : 'text-sm text-[var(--color-fg-secondary)]'
                      }`}>
                        {BulletIcon && (
                          <BulletIcon size={16} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                        )}
                        <span>{isBullet ? contentText.replace(/^[•-]\s*/, '') : contentText}</span>
                      </p>
                    );
                  })}
                </div>
              )}

              {loc.buttonText && loc.buttonUrl && (
                <div className="mt-8">
                  <Link href={loc.buttonUrl}>
                    <Button variant="primary" className="gap-2 group">
                      {loc.buttonText}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNDING CARDS (premium pricing style)
// ═══════════════════════════════════════════════════════════════════════════

function FundingCards({ cards }: { cards: CampaignCard[] }) {
  const { locale } = useTranslation();
  const percentages = [100, 60, 30];

  // Distinct icons per funding level
  const cardIcons = ["Shield", "Handshake", "TrendingUp"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.slice(0, 3).map((card, i) => {
        const loc = useCardLocale(card);
        const isFeatured = i === 0;
        const pct = percentages[i] || 50;

        return (
          <FadeIn key={card.id} delay={i * 0.1}>
            <motion.div
              whileHover={{ y: -6 }}
              className={`relative p-8 rounded-2xl border transition-all duration-300 h-full ${
                isFeatured
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-xl shadow-black/10"
                  : "border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] hover:shadow-lg hover:shadow-black/5"
              }`}
            >
              {isFeatured && (
                <Badge variant="default" className="absolute -top-3 left-6 bg-[var(--color-accent)] text-[var(--color-accent-foreground)]">
                  {locale === "ka" ? "რეკომენდებული" : "Recommended"}
                </Badge>
              )}

              {/* Animated percentage */}
              <div className="mb-6">
                <p className={`text-5xl font-bold tracking-tight ${isFeatured ? "text-[var(--color-accent)]" : "text-gradient"}`}>
                  <AnimatedCounter to={pct} suffix="%" duration={2.5} />
                </p>
              </div>

              <div className="mb-4 w-14 h-14 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
                <Icon name={cardIcons[i]} className="text-[var(--color-accent)]" size={28} />
              </div>
              <h3 className={`text-xl font-semibold ${isFeatured ? "text-[var(--color-accent)]" : "text-[var(--color-fg-primary)]"}`}>
                {loc.title}
              </h3>
              {loc.description && (
                <p className="mt-2 text-sm text-[var(--color-fg-tertiary)] leading-relaxed">{loc.description}</p>
              )}
            </motion.div>
          </FadeIn>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ELIGIBILITY SECTION (rendered as structured list from CMS description)
// ═══════════════════════════════════════════════════════════════════════════

function EligibilitySection({ section }: { section: CampaignSection }) {
  const loc = useLocale(section);
  if (!loc.title && !loc.description) return null;

  // Split description into paragraphs and bullet items
  const lines = loc.description.split('\n').filter((l) => l.trim());
  const headerLines = lines.filter((l) => !l.trim().startsWith('•') && !l.trim().startsWith('- '));
  const bulletLines = lines.filter((l) => l.trim().startsWith('•') || l.trim().startsWith('-'));

  // Split bullets into two equal columns
  const mid = Math.ceil(bulletLines.length / 2);
  const leftBullets = bulletLines.slice(0, mid);
  const rightBullets = bulletLines.slice(mid);

  return (
    <Section id="campaign-eligibility" className="bg-[var(--color-bg-secondary)]">
      <Container>
        <FadeIn direction="up">
          {loc.badge && <Badge variant="outline" className="mb-4">{loc.badge}</Badge>}
          {loc.title && <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">{loc.title}</h2>}
        </FadeIn>

        {/* Two-column layout for content + bullet lists */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left column: header text */}
          <FadeIn direction="left">
            <div className="space-y-4">
              {headerLines.map((line, i) => (
                <p key={i} className="text-base md:text-lg text-[var(--color-fg-primary)] font-medium leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </FadeIn>

          {/* Right column: bullet items */}
          <FadeIn direction="right" delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div className="space-y-3">
                {leftBullets.map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={16} className="text-emerald-500 shrink-0 mt-1" />
                    <p className="text-sm md:text-base text-[var(--color-fg-tertiary)] leading-relaxed">
                      {line.trim().replace(/^[•-]\s*/, '')}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {rightBullets.map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={16} className="text-emerald-500 shrink-0 mt-1" />
                    <p className="text-sm md:text-base text-[var(--color-fg-tertiary)] leading-relaxed">
                      {line.trim().replace(/^[•-]\s*/, '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {loc.content && (
          <FadeIn direction="up" delay={0.15}>
            <div className="mt-8 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <p className="text-sm text-amber-600">{loc.content}</p>
            </div>
          </FadeIn>
        )}
      </Container>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CULTURE & ADDITIONAL ADVANTAGE (12-point criteria list)
// ═══════════════════════════════════════════════════════════════════════════

function CulturalAdvantage({ section }: { section: CampaignSection }) {
  const loc = useLocale(section);

  // Parse the 12-point criteria from the description field (each bullet on its own line)
  const criteria = loc.description.split('\n')
    .filter((line) => /^\d+\./.test(line.trim()))
    .map((line) => line.trim().replace(/^\d+\.\s*/, ''));

  return (
    <Section>
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-bg-surface)] via-[var(--color-accent)]/5 to-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] p-10 md:p-16">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-glow)] rounded-full" style={{ filter: 'blur(0)' }} />

          <div className="relative z-10">
            <FadeIn direction="up">
              {loc.badge && <Badge variant="outline" className="mb-4">{loc.badge}</Badge>}
              {loc.title && <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">{loc.title}</h2>}
              {loc.description && (
                <p className="mt-4 text-base md:text-lg text-[var(--color-fg-tertiary)] leading-relaxed max-w-4xl">
                  {loc.description.split('\n')[0]}
                </p>
              )}
            </FadeIn>

            {/* 12-point numbered grid */}
            {criteria.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                {criteria.map((item, i) => (
                  <FadeIn key={i} delay={i * 0.04}>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-bg-surface)]/80 border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-surface)] transition-all duration-200">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[var(--color-accent)]">{i + 1}</span>
                      </div>
                      <p className="text-sm text-[var(--color-fg-secondary)] leading-relaxed">{item}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}

            {/* Note */}
            {loc.content && (
              <FadeIn direction="up" delay={0.2}>
                <div className="mt-8 p-5 rounded-xl border-l-4 border-[var(--color-accent)] bg-[var(--color-overlay)]">
                  <p className="text-sm italic text-[var(--color-fg-tertiary)]">
                    {loc.content}
                  </p>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CAMPAIGN TIMELINE (vertical timeline, Georgian named)
// ═══════════════════════════════════════════════════════════════════════════

function CampaignTimelineSection({ items }: { items: CampaignTimelineItem[] }) {
  const { locale } = useTranslation();
  if (!items || items.length === 0) return null;

  return (
    <Section className="bg-[var(--color-bg-secondary)]">
      <Container>
        <FadeIn direction="up">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient text-center">
            {locale === "ka" ? "კამპანიის ვადები" : "Campaign Timeline"}
          </h2>
        </FadeIn>

        <div className="mt-12 max-w-3xl mx-auto relative">
          {/* Clean vertical line — no gradient blur */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-[var(--color-border-primary)]" />

          <div className="space-y-8">
            {items.map((item, i) => {
              const title = locale === "ka" ? item.title_ka : item.title_en;
              const desc = locale === "ka" ? item.description_ka : item.description_en;
              const date = locale === "ka" ? item.date_ka : item.date_en;

              return (
                <FadeIn key={item.id} delay={i * 0.1}>
                  <div className="relative pl-20">
                    {/* Step number — clean circle, no shadow artifacts */}
                    <div className="absolute left-4 top-0 w-9 h-9 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </div>

                    {/* Step card — no blur, clean border */}
                    <div className="p-5 md:p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] hover:border-[var(--color-border-secondary)] transition-all duration-200">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-base md:text-lg font-semibold text-[var(--color-fg-primary)]">{title}</h3>
                        {/* Duration rendered dynamically from CMS if provided — no hardcoded fallback */}
                        {date && (
                          <span className="shrink-0 text-xs font-medium text-[var(--color-fg-tertiary)] bg-[var(--color-overlay)] px-2.5 py-1 rounded-md">{date}</span>
                        )}
                      </div>
                      {desc && (
                        <p className="mt-2 text-sm text-[var(--color-fg-tertiary)] leading-relaxed">{desc}</p>
                      )}
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FINAL CTA (premium gradient block + contact cards)
// ═══════════════════════════════════════════════════════════════════════════

function FinalCTA({ ctaItems, settings }: { ctaItems: CampaignCTAType[]; settings: Record<string, string> }) {
  const { locale } = useTranslation();
  const primaryCTA = ctaItems[0];
  if (!primaryCTA) return null;

  const title = locale === "ka" ? primaryCTA.title_ka : primaryCTA.title_en;
  const description = locale === "ka" ? primaryCTA.description_ka : primaryCTA.description_en;
  const btnText = locale === "ka" ? primaryCTA.button_text_ka : primaryCTA.button_text_en;
  const btnUrl = primaryCTA.button_url;

  return (
    <Section>
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-10 md:p-16 lg:p-20 text-center shadow-lg">
          {/* Floating elements */}
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-zinc-900/5 dark:bg-white/5 animate-float" />
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-zinc-900/5 dark:bg-white/5 animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-zinc-900/5 dark:bg-white/5 animate-float" style={{ animationDelay: "1s" }} />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            {description && (
              <p className="mt-4 text-lg text-slate-700 dark:text-zinc-300 leading-relaxed">{description}</p>
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {btnText && btnUrl && (
                <Link href={btnUrl}>
                  <Button size="xl" variant="secondary" className="gap-2 group bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 border-none shadow-sm">
                    {btnText}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
              <Link href="/entrepreneur-support/details">
                <Button size="xl" variant="secondary" className="bg-transparent text-slate-800 border border-slate-800 hover:bg-slate-200/20 dark:text-zinc-300 dark:border-zinc-300 dark:hover:bg-white/10">
                  {locale === "ka" ? "შეიტყვე მეტი" : "Learn More"}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Cards — all links from CMS settings */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Phone, label: "Phone", value: settings.campaign_phone || "+995 579 009 247", href: `tel:${settings.campaign_phone}` },
            { icon: MessageCircle, label: "Facebook", value: settings.campaign_facebook_label || "@bta.lab.official", href: settings.campaign_facebook_url || "https://www.facebook.com/bta.lab.official" },
            { icon: Camera, label: "Instagram", value: settings.campaign_instagram_label || "@bta.lab.official", href: settings.campaign_instagram_url || "https://www.instagram.com/bta.lab.official" },
            { icon: Music, label: "TikTok", value: settings.campaign_tiktok_label || "@bta.lab.official", href: settings.campaign_tiktok_url || "https://www.tiktok.com/@bta.lab.official" },
          ].map((contact, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <a href={contact.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-surface-hover)] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-overlay)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <contact.icon size={18} className="text-[var(--color-fg-primary)]" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-[var(--color-fg-tertiary)]">{contact.label}</p>
                  <p className="text-sm font-medium text-[var(--color-fg-primary)]">{contact.value}</p>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 bg-[var(--color-accent)] z-[100] origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING APPLY BUTTON (desktop) + STICKY CTA (mobile)
// ═══════════════════════════════════════════════════════════════════════════

function FloatingCTA() {
  const { t, locale } = useTranslation();

  return (
    <>
      {/* Desktop floating button */}
      <div className="hidden md:block fixed right-6 bottom-6 z-50">
        <Link href="/entrepreneur-support/apply">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-xl shadow-black/20 hover:shadow-2xl transition-shadow"
          >
            <Zap size={18} />
            <span className="text-sm font-semibold">{locale === "ka" ? "განაცხადი" : "Apply"}</span>
          </motion.div>
        </Link>
      </div>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-[var(--color-bg-primary)]/95 backdrop-blur-xl border-t border-[var(--color-border-primary)]">
        <Link href="/entrepreneur-support/apply" className="block w-full">
          <Button variant="primary" size="lg" className="w-full gap-2">
            <Zap size={18} />
            {locale === "ka" ? "განაცხადის გაკეთება" : "Apply Now"}
          </Button>
        </Link>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LANDING CLIENT
// ═══════════════════════════════════════════════════════════════════════════

interface Props {
  sections: CampaignSection[];
  faq: CampaignFAQType[];
  cards: Record<string, CampaignCard[]>;
  timeline: Record<string, CampaignTimelineItem[]>;
  statistics: Record<string, CampaignStatistic[]>;
  cta: Record<string, CampaignCTAType[]>;
  settings: Record<string, string>;
  currentStep: number;
}

export function CampaignLandingClient({
  sections, faq, cards, timeline, statistics, cta,  settings,
  currentStep,
}: Props) {
  const { locale, t } = useTranslation();

  const sectionMap = new Map(sections.map((s) => [s.section_key, s]));

  const heroSection = sections.find((s) => s.section_type === "hero");
  const heroStats = statistics["hero"];
  const faqSection = sectionMap.get("faq");
  const ctaItems = cta["cta"] || [];
  const footerCta = cta["footer"] || [];

  const fundingCards = cards["funding"] || [];
  const timelineItems = timeline["selection"] || [];
  const culturalSection = sectionMap.get("cultural");
  const eligibilitySection = sectionMap.get("eligibility");

  return (
    <>
      <ScrollProgress />

      {/* HERO */}
      {heroSection && <HeroSection section={heroSection} stats={heroStats} currentStep={currentStep} />}

      {/* OVERVIEW (content section) */}
      {sectionMap.get("overview") && (
        <ContentSection section={sectionMap.get("overview")!} index={0} />
      )}

      {/* FUNDING */}
      {sectionMap.get("funding") && fundingCards.length > 0 && (
        <Section id="campaign-funding" className="bg-[var(--color-bg-secondary)]">
          <Container>
            <FadeIn direction="up">
              <Badge variant="outline" className="mb-4">
                {locale === "ka" ? "დაფინანსება" : "Funding"}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">
                {locale === "ka" ? "დაფინანსების მოდელი" : "Funding Model"}
              </h2>
            </FadeIn>
            <div className="mt-10">
              <FundingCards cards={fundingCards} />
            </div>
            <FadeIn direction="up" delay={0.3}>
              <div className="mt-8 p-5 rounded-2xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)]">
                <p className="text-sm text-[var(--color-fg-tertiary)]">
                  {locale === "ka"
                    ? "* დაფინანსების პროცენტი და ოდენობა განისაზღვრება პროექტის შეფასების შედეგების მიხედვით."
                    : "* Funding percentage and amount are determined based on project evaluation results."}
                </p>
              </div>
            </FadeIn>
          </Container>
        </Section>
      )}

      {/* ELIGIBILITY — rendered as structured list from CMS */}
      {eligibilitySection && <EligibilitySection section={eligibilitySection} />}

      {/* CULTURE & ADDITIONAL ADVANTAGE — 12-point criteria */}
      {culturalSection && <CulturalAdvantage section={culturalSection} />}

      {/* FAQ */}
      {faqSection && faq.length > 0 && (
        <Section id="campaign-faq">
          <Container>
            <FadeIn direction="up">
              <Badge variant="outline" className="mb-4">
                {locale === "ka" ? "ხშირად დასმული კითხვები" : "FAQ"}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">
                {locale === "ka" ? faqSection.title_ka : faqSection.title_en}
              </h2>
            </FadeIn>
            <div className="mt-10">
              <div className="space-y-4">
                {faq.map((item, i) => {
                  const question = locale === "ka" ? item.question_ka : item.question_en;
                  const answer = locale === "ka" ? item.answer_ka : item.answer_en;
                  if (!question) return null;
                  return <PremiumFAQItem key={item.id} question={question} answer={answer} index={i} />;
                })}
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* FINAL CTA */}
      {ctaItems.length > 0 && <FinalCTA ctaItems={ctaItems} settings={settings} />}

      {/* FLOATING + STICKY CTA */}
      <FloatingCTA />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM FAQ ACCORDION
// ═══════════════════════════════════════════════════════════════════════════

function PremiumFAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-2xl border transition-all duration-300 ${
        isOpen
          ? "border-[var(--color-accent)]/30 bg-[var(--color-bg-surface)] shadow-lg shadow-black/5"
          : "border-[var(--color-border-primary)] bg-[var(--color-bg-surface)]/80 hover:bg-[var(--color-bg-surface)] hover:shadow-md hover:border-[var(--color-fg-tertiary)]/20"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 p-5 md:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-fg-tertiary)]/30"
      >
        <span className={`text-base md:text-lg font-medium pr-4 transition-colors duration-300 ${
          isOpen ? "text-[var(--color-fg-primary)]" : "text-[var(--color-fg-secondary)]"
        }`}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="shrink-0 w-8 h-8 rounded-lg bg-[var(--color-overlay)] flex items-center justify-center"
        >
          <ChevronDown size={16} className="text-[var(--color-fg-tertiary)]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
              <div className="pt-4 border-t border-[var(--color-border-primary)]">
                <p className="text-sm md:text-base text-[var(--color-fg-tertiary)] leading-relaxed">
                  {answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


