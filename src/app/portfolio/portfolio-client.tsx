"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { Section } from "@/components/ui/section";
import { TextReveal } from "@/components/animations/text-reveal";

import { useTranslation } from "@/lib/use-dictionary";
import { PortfolioProjectCard } from "@/components/portfolio/project-card";
import type { PortfolioProject } from "@/types/supabase";



function PortfolioPageContent({
  content,
  projects,
}: {
  content: Record<string, Record<string, string>>;
  projects: PortfolioProject[];
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const { t } = useTranslation();
  const heroContent = content.hero || {};

  // Get unique categories from projects (received from CMS/Supabase)
  const dbCategories = [...new Set(projects.map((p) => p.category))];

  // Build filter options from DB categories only — always show "All" first
  const allCategories = [
    { label: "All", value: "all" },
    ...dbCategories.map((c) => ({ label: c, value: c })),
  ];

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  const categoryToKey: Record<string, string> = {
    Web: "web",
    "E-commerce": "ecommerce",
    Branding: "branding",
    Marketing: "marketing",
    "UI/UX": "uiux",
  };

  const getTranslatedCategory = (category: string): string => {
    const key = categoryToKey[category] || category.toLowerCase();
    return t(`portfolio.filters.${key}`) || category;
  };

  const getProjectCategoryLabel = (project: PortfolioProject): string =>
    project.category_label || getTranslatedCategory(project.category);

  return (
    <>
      {/* Hero */}
      <Section className="pt-28 pb-8 md:pt-32 md:pb-8">
        <Container>
          <FadeIn direction="up">
            <Badge variant="outline">{heroContent.badge || t("portfolio.badge")}</Badge>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <TextReveal
              as="h1"
              className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-gradient"
              staggerChildren={0.02}
            >
              {heroContent.heading || t("portfolio.heading")}
            </TextReveal>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <p className="mt-6 max-w-2xl text-base md:text-lg text-[var(--color-fg-tertiary)] leading-relaxed">
              {heroContent.description || t("portfolio.description")}
            </p>
          </FadeIn>
        </Container>
      </Section>

      {/* Filter */}
      <Section className="!py-4 md:!py-4">
        <Container>
          <FadeIn direction="up">
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveFilter(cat.value)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-subtle)] ${
                    activeFilter === cat.value
                      ? "text-[var(--color-fg-primary)] bg-[var(--color-overlay)]"
                      : "text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-secondary)] hover:bg-[var(--color-overlay)]/50"
                  }`}
                >
                  <span className="relative z-10">
                    {cat.value === "all"
                      ? t("portfolio.filters.all")
                      : getTranslatedCategory(cat.value)}
                  </span>
                  {activeFilter === cat.value && (
                    <motion.div
                      layoutId="filter-indicator"
                      className="absolute inset-0 bg-[var(--color-overlay)] rounded-lg -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* Projects Grid */}
      <Section className="py-8 md:py-10">
        <Container>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 items-start justify-items-start"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex w-full"
                >
                  <PortfolioProjectCard
                    project={project}
                    categoryLabel={getProjectCategoryLabel(project)}
                    detailsLabel={t("portfolio.details")}
                    visitLabel={t("portfolio.visit")}
                    imagePriority={index === 0}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[var(--color-fg-tertiary)]/50">
                {t("portfolio.noProjects")}
              </p>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

export function PortfolioPageClient({
  content,
  projects,
}: {
  content: Record<string, Record<string, string>>;
  projects: PortfolioProject[];
}) {
  return <PortfolioPageContent content={content} projects={projects} />;
}
