"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { TextReveal } from "@/components/animations/text-reveal";
import { useTranslation } from "@/lib/use-dictionary";

interface HeroProps {
  content?: Record<string, string>;
}

export function Hero({ content = {} }: HeroProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const eyebrow = content.eyebrow || t("hero.eyebrow");
  const heading = content.heading || t("hero.heading");
  const description = content.description || t("hero.description");
  const primaryCta = content.primaryCta || t("hero.primaryCta");
  const secondaryCta = content.secondaryCta || t("hero.secondaryCta");

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;

      if (reducedMotionQuery.matches) {
        contentElement.style.opacity = "";
        contentElement.style.transform = "";
        return;
      }

      const progress = Math.min(Math.max(window.scrollY / (window.innerHeight * 0.8), 0), 1);
      const opacity = Math.max(0, 1 - progress);
      const translateY = -100 * progress;
      const scale = 1 - 0.05 * progress;

      contentElement.style.opacity = opacity.toFixed(3);
      contentElement.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", requestUpdate);
    } else {
      reducedMotionQuery.addListener(requestUpdate);
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (typeof reducedMotionQuery.removeEventListener === "function") {
        reducedMotionQuery.removeEventListener("change", requestUpdate);
      } else {
        reducedMotionQuery.removeListener(requestUpdate);
      }
    };
  }, []);

  return (
    <section
      className="public-copy-scope relative min-h-screen flex flex-col justify-center pt-28 md:pt-36 overflow-hidden"
    >
      {/* Animated Grid Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg-primary)] z-10" />

        {/* Subtle glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-glow)] blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--color-glow)] blur-[80px]" />

        {/* Animated gradient line */}
        <div
          className="absolute top-1/3 left-0 right-0 h-[1px] hero-line"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--color-border-subtle) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Content */}
      <Container className="relative z-20">
        <div ref={contentRef} className="flex flex-col items-center text-center hero-content-motion">
          {/* Badge */}
          <div className="mb-8 hero-fade-in hero-delay-1">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border-primary)] bg-[var(--color-overlay)] text-xs font-medium text-[var(--color-fg-tertiary)] tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-fg-tertiary)]/50 animate-pulse-soft" />
              {eyebrow}
            </span>
          </div>

          {/* Headline */}
          <div className="max-w-5xl overflow-visible hero-heading-motion">
            <TextReveal
              as="h1"
              className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight text-gradient"
              staggerChildren={0.025}
            >
              {heading}
            </TextReveal>
          </div>

          {/* Subtitle */}
          <p className="mt-6 md:mt-8 max-w-2xl text-base md:text-lg text-[var(--color-fg-tertiary)] leading-relaxed hero-fade-in hero-delay-2">
            {description}
          </p>

          {/* CTAs */}
          <div className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center gap-4 hero-fade-in hero-delay-3">
            <Link href="/portfolio">
              <Button size="lg" variant="primary" className="gap-2 group">
                {primaryCta}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </Link>
            <Link href="/team">
              <Button size="lg" variant="secondary">
                {secondaryCta}
              </Button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hero-fade-in hero-delay-4">
            <div className="flex flex-col items-center gap-2 hero-scroll-bounce">
              <span className="text-xs text-[var(--color-fg-tertiary)]/40 tracking-[0.2em] uppercase">
                {t("hero.scroll")}
              </span>
              <div className="w-px h-8 bg-gradient-to-b from-[var(--color-fg-tertiary)]/30 to-transparent" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
