"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

import { useTranslation } from "@/lib/use-dictionary";
import { ProjectPreview } from "@/components/portfolio/project-preview";

import type { PortfolioProject } from "@/types/supabase";



function ProjectDetailContent({
  project,
  relatedProjects,
}: {
  project: PortfolioProject;
  relatedProjects: PortfolioProject[];
}) {
  const { t } = useTranslation();

  return (
    <>
      {/* Back navigation */}
      <div className="pt-24 pb-4 md:pt-28">
        <Container>
          <FadeIn direction="up">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-fg-tertiary)]/50 hover:text-[var(--color-fg-secondary)] transition-colors"
            >
              <ArrowLeft size={16} />
              {t("portfolio.detail.back")}
            </Link>
          </FadeIn>
        </Container>
      </div>

      {/* Hero */}
      <Section className="pt-8 pb-16 md:pt-12 md:pb-20">
        <Container>
          <FadeIn direction="up">
            <Badge variant="outline">{project.category_label || project.category}</Badge>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-gradient">
              {project.title}
            </h1>
          </FadeIn>

          <FadeIn direction="up" delay={0.15}>
            <p className="mt-6 max-w-3xl text-base md:text-lg text-[var(--color-fg-tertiary)] leading-relaxed">
              {project.full_description}
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-3">
              {(project.technologies || []).map((tech: string) => (
                <span
                  key={tech}
                  className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-overlay)] border border-[var(--color-border-primary)] text-[var(--color-fg-tertiary)]/70"
                >
                  {tech}
                </span>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.25}>
            <div className="mt-8 flex items-center gap-4">
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="lg" className="gap-2 group">
                    {t("portfolio.detail.visitProject")}
                    <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              )}
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* Hero Image Area */}
      <Section className="py-8 md:py-12">
        <Container>
          <FadeIn direction="up">
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border-primary)]">
              <ProjectPreview
                imageSrc={project.detail_cover_image_url || project.cover_image || "/images/qey_ge.webp"}
                altText={project.alt_text || `${project.title} full website preview`}
                previewHeight="h-[420px] md:h-[620px]"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) calc(100vw - 48px), min(1280px, calc(100vw - 96px))"
                quality={85}
                eager
              />
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* Problem & Solution */}
      <Section className="py-16 md:py-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <FadeIn direction="up">
              <div>
                <Badge variant="subtle">{t("portfolio.detail.problem")}</Badge>
                <p className="mt-4 text-base text-[var(--color-fg-secondary)] leading-relaxed">{project.problem}</p>
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={0.1}>
              <div>
                <Badge variant="subtle">{t("portfolio.detail.solution")}</Badge>
                <p className="mt-4 text-base text-[var(--color-fg-secondary)] leading-relaxed">{project.solution}</p>
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>

      {/* Results */}
      <Section className="py-16 md:py-20 bg-[var(--color-bg-secondary)]">
        <Container>
          <FadeIn direction="up">
            <Badge variant="outline">{t("portfolio.detail.results")}</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gradient">
              {t("portfolio.detail.impactOutcomes")}
            </h2>
          </FadeIn>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(project.results || []).map((result: string, index: number) => (
              <FadeIn key={index} delay={index * 0.05}>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
                  <CheckCircle2 size={18} className="text-[var(--color-fg-tertiary)]/50 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[var(--color-fg-secondary)]">{result}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* Technologies Used */}
      <Section className="py-16 md:py-20">
        <Container>
          <FadeIn direction="up">
            <Badge variant="outline">{t("portfolio.detail.technologies")}</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gradient">
              {t("portfolio.detail.toolsStack")}
            </h2>
          </FadeIn>

          <div className="mt-8 flex flex-wrap gap-3">
            {(project.technologies || []).map((tech: string, idx: number) => (
              <FadeIn key={tech} delay={idx * 0.03}>
                <span className="text-sm px-4 py-2 rounded-xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)] text-[var(--color-fg-tertiary)]/70">
                  {tech}
                </span>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <Section className="py-16 md:py-20 border-t border-[var(--color-border-primary)]">
          <Container>
            <FadeIn direction="up">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <Badge variant="outline">{t("portfolio.detail.related")}</Badge>
                  <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gradient">
                    {t("portfolio.detail.moreProjects")}
                  </h2>
                </div>
                <Link href="/portfolio">
                  <Button variant="ghost" className="gap-2 group">
                    {t("portfolio.allProjects")}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedProjects.map((related, index) => (
                <FadeIn key={related.id} delay={index * 0.1}>
                  <Link href={`/portfolio/${related.slug}`} className="group block">
                    <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-surface-hover)] transition-all duration-500">
                      <Badge variant="subtle" size="sm">{related.category_label || related.category}</Badge>
                      <h3 className="mt-3 text-xl font-semibold text-[var(--color-fg-primary)] group-hover:text-[var(--color-fg-primary)]/90 transition-colors">
                        {related.title}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--color-fg-tertiary)] line-clamp-2">{related.description}</p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-fg-tertiary)]/50 group-hover:text-[var(--color-fg-tertiary)]/80 transition-colors">
                        {t("portfolio.detail.viewDetails")}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}

export function ProjectDetailClient({
  project,
  relatedProjects,
}: {
  project: PortfolioProject;
  relatedProjects: PortfolioProject[];
}) {
  return <ProjectDetailContent project={project} relatedProjects={relatedProjects} />;
}
