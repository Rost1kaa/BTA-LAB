"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { Section } from "@/components/ui/section";
import { Hero } from "@/components/sections/hero";
import { StatsSection } from "@/components/sections/stats-section";

import { FeaturedProjectCard } from "@/components/portfolio/project-card";
import { useTranslation } from "@/lib/use-dictionary";
import { PricingCard } from "@/components/services/pricing-card";

import type { PortfolioProject, ServicePackage } from "@/types/supabase";
import type { PricingPackage, Stat } from "@/types";

const categoryToKey: Record<string, string> = {
  Web: "web",
  "E-commerce": "ecommerce",
  Branding: "branding",
  Marketing: "marketing",
  "UI/UX": "uiux",
};

function HomePageContent({
  content,
  featuredProjects,
  servicePackages,
  stats,
}: {
  content: Record<string, Record<string, string>>;
  featuredProjects: PortfolioProject[];
  servicePackages: ServicePackage[];
  stats: Stat[];
}) {
  const { t } = useTranslation();
  const heroContent = content.hero || {};
  const featured = content.featured || {};
  const cta = content.cta || {};

  return (
    <>
      <Hero content={heroContent} />

      {/* Statistics Section */}
      <Section className="py-20 md:py-24">
        <StatsSection stats={stats} />
      </Section>

      {/* Pricing Preview */}
      <Section className="py-24 md:py-32">
        <Container>
          <FadeIn direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div className="max-w-2xl">
                <Badge variant="outline">{t("home.servicesBadge")}</Badge>
                <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gradient">
                  {t("home.servicesHeading")}
                </h2>
                <p className="mt-4 text-base text-[var(--color-fg-tertiary)] leading-relaxed">
                  {t("home.servicesDescription")}
                </p>
              </div>
              <Link href="/services">
                <Button variant="ghost" className="gap-2 group">
                  {t("home.allServices")}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicePackages.slice(0, 3).map((pkg, i) => (
              <PricingCard key={pkg.id} pkg={toPricingPackage(pkg)} index={i} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Featured Projects - 3 Column Grid */}
      <Section className="py-24 md:py-32 bg-[var(--color-bg-secondary)]">
        <Container>
          <FadeIn direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div className="max-w-2xl">
                <Badge variant="outline">{t("home.projectsBadge")}</Badge>
                <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gradient">
                  {featured.sectionTitle || t("home.projectsHeading")}
                </h2>
                <p className="mt-4 text-base text-[var(--color-fg-tertiary)] leading-relaxed">
                  {featured.sectionDescription || t("home.projectsDescription")}
                </p>
              </div>
              <Link href="/portfolio">
                <Button variant="ghost" className="gap-2 group">
                  {t("home.viewAllProjects")}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects
              .filter((p) => p.featured)
              .slice(0, 3)
              .map((project, index) => (
                <FadeIn key={project.id} delay={index * 0.1}>
                  <FeaturedProjectCard
                    project={project}
                    categoryLabel={
                      project.category_label || t(`portfolio.filters.${categoryToKey[project.category] || "web"}`)
                    }
                    detailsLabel={t("home.viewProject")}
                  />
                </FadeIn>
              ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-24 md:py-32">
        <Container>
          <FadeIn direction="up">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[var(--color-overlay)] to-transparent border border-[var(--color-border-primary)] p-10 md:p-16 lg:p-20 text-center">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-glow)] rounded-full blur-[120px]" />
              <div className="relative z-10 max-w-2xl mx-auto">
                <Badge variant="outline">{t("home.ctaBadge")}</Badge>
                <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gradient">
                  {cta.heading || t("home.ctaHeading")}
                </h2>
                <p className="mt-4 text-base text-[var(--color-fg-tertiary)] leading-relaxed">
                  {cta.description || t("home.ctaDescription")}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/contact">
                    <Button size="lg" variant="primary" className="gap-2 group">
                      {cta.buttonLabel || t("home.ctaButton")}
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="secondary">
                      {cta.learnMoreLabel || t("home.ctaLearnMore")}
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

export function HomePageClient({
  content,
  featuredProjects,
  servicePackages,
  stats,
}: {
  content: Record<string, Record<string, string>>;
  featuredProjects: PortfolioProject[];
  servicePackages: ServicePackage[];
  stats: Stat[];
}) {
  return <HomePageContent content={content} featuredProjects={featuredProjects} servicePackages={servicePackages} stats={stats} />;
}

function toPricingPackage(item: ServicePackage): PricingPackage {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    billingLabel: item.billing_label || undefined,
    description: item.description || undefined,
    idealFor: item.ideal_for || undefined,
    features: item.features || [],
    deliveryTime: item.delivery_time || undefined,
    cta: item.cta,
    highlighted: item.highlighted,
    customPrice: item.custom_price,
    priceExplanation: item.price_explanation || undefined,
    iconName: item.icon_name || undefined,
  };
}
