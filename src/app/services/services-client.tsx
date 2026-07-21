"use client";

import { useState, useCallback } from "react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { Section } from "@/components/ui/section";
import { TextReveal } from "@/components/animations/text-reveal";

import { useTranslation } from "@/lib/use-dictionary";

// Mapping from pricing package IDs to questionnaire keys
const PACKAGE_TO_QUESTIONNAIRE: Record<string, string> = {
  "landing-starter": "website-landing",
  "one-page-website": "website-one-page",
  "business-website": "website-business",
  "online-store": "online-store",
  "custom-website": "custom-website",
  "website-maintenance": "website-maintenance",
  "social-starter": "social-media",
  "social-business": "social-media",
  "social-premium": "social-media",
  "social-full": "social-media",
};
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PricingSectionBlock } from "@/components/services/pricing-section";
import { ServiceAddonCard } from "@/components/services/service-addon-card";
import { ServiceRequestForm } from "@/components/services/service-request-form";
import { pricingData } from "@/data/pricing";

import type { ServicePackage } from "@/types/supabase";
import type { PricingPackage, ServiceAddon } from "@/types";

const PRICING_PACKAGE_CONFIG = new Map(
  [...pricingData.website.packages, ...pricingData.socialMedia.packages].map((pkg) => [
    pkg.id,
    pkg,
  ])
);

const PRICING_PACKAGE_CONFIG_BY_SECTION_NAME = new Map<string, PricingPackage>(
  [
    ...pricingData.website.packages.map((pkg) => [`website:${pkg.name}`, pkg] as const),
    ...pricingData.socialMedia.packages.map((pkg) => [`social-media:${pkg.name}`, pkg] as const),
  ]
);

function toPricingPackage(item: ServicePackage): PricingPackage {
  const configuredPackage =
    PRICING_PACKAGE_CONFIG.get(item.id) ??
    PRICING_PACKAGE_CONFIG_BY_SECTION_NAME.get(`${item.section}:${item.name_en || item.name}`);

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
    visibleItemCount: configuredPackage?.visibleItemCount,
  };
}

function ServicesPageContent({
  content,
  packages,
}: {
  content: Record<string, Record<string, string>>;
  packages: ServicePackage[];
}) {
  const { t } = useTranslation();
  const heroContent = content.hero || {};
  const ctaContent = content.cta || {};

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState({ id: "", name: "", price: "", isCustomPrice: false });

  const openForm = useCallback((pkgId: string, pkgName: string, pkgPrice: string, isCustomPrice: boolean) => {
    // Map the pricing package ID to the questionnaire key
    const questionnaireId = PACKAGE_TO_QUESTIONNAIRE[pkgId] || pkgId;
    setSelectedService({ id: questionnaireId, name: pkgName, price: pkgPrice, isCustomPrice });
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    // Delay resetting selected service until after animation completes
    setTimeout(() => setSelectedService({ id: "", name: "", price: "", isCustomPrice: false }), 300);
  }, []);

  const websiteSection = {
    ...pricingData.website,
    title: t("pricing.website.title"),
    description: t("pricing.website.description"),
    packages: packages
      .filter((item) => item.section === "website")
      .map(toPricingPackage),
  };
  const socialSection = {
    ...pricingData.socialMedia,
    title: t("pricing.social.title"),
    description: t("pricing.social.description"),
    note: t("pricing.social.note"),
    packages: packages
      .filter((item) => item.section === "social-media")
      .map(toPricingPackage),
  };
  const addons: ServiceAddon[] = packages
    .filter((item) => item.section === "addons")
    .map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description || "",
      example: item.ideal_for || undefined,
      iconName: item.icon_name || undefined,
    }));

  return (
    <>
      {/* Hero */}
      <Section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <Container>
          <FadeIn direction="up">
            <Badge variant="outline">{heroContent.badge || t("services.badge")}</Badge>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <TextReveal
              as="h1"
              className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-gradient"
              staggerChildren={0.02}
            >
              {heroContent.heading || t("services.heading")}
            </TextReveal>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <p className="mt-6 max-w-2xl text-base md:text-lg text-[var(--color-fg-tertiary)] leading-relaxed">
              {heroContent.description || t("services.description")}
            </p>
          </FadeIn>
        </Container>
      </Section>

      {/* Website Development Pricing */}
      <Section className="py-16 md:py-20 bg-[var(--color-bg-secondary)]">
        <Container>
          <PricingSectionBlock
            section={websiteSection}
            onPlanProject={openForm}
          />
        </Container>
      </Section>

      {/* Social Media Pricing */}
      <Section className="py-16 md:py-20">
        <Container>
          <PricingSectionBlock
            section={socialSection}
            onPlanProject={openForm}
            maxVisibleFeatures={9}
          />
        </Container>
      </Section>

      {/* Add-ons */}
      <Section className="py-16 md:py-20 bg-[var(--color-bg-secondary)]">
        <Container>
          <FadeIn direction="up">
            <Badge variant="outline">{content.addons?.title || t("services.addons.title")}</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gradient">
              {content.addons?.description || t("services.addons.description")}
            </h2>
          </FadeIn>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {addons.map((addon, index) => (
              <ServiceAddonCard key={addon.id} addon={addon} index={index} />
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA - Can't Choose the Right Service */}
      <Section className="py-16 md:py-20">
        <Container>
          <FadeIn direction="up">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[var(--color-overlay)] to-transparent border border-[var(--color-border-primary)] p-10 md:p-16 text-center">
              <div className="absolute top-0 left-0 w-80 h-80 bg-[var(--color-glow)] rounded-full blur-[100px]" />
              <div className="relative z-10 max-w-xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">
                  {ctaContent.heading || t("services.cta_choose.heading")}
                </h2>
                <p className="mt-4 text-base text-[var(--color-fg-tertiary)] leading-relaxed">
                  {ctaContent.description || t("services.cta_choose.description")}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/contact">
                    <Button variant="primary" size="lg" className="gap-2 group">
                      {ctaContent.button || t("services.cta.button")}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* Service Request Form Modal */}
      {isFormOpen && selectedService.id && (
        <ServiceRequestForm
          isOpen={isFormOpen}
          onClose={closeForm}
          serviceId={selectedService.id}
          serviceName={selectedService.name}
          servicePrice={selectedService.price}
          isCustomPrice={selectedService.isCustomPrice}
        />
      )}
    </>
  );
}

export function ServicesPageClient({
  content,
  packages,
}: {
  content: Record<string, Record<string, string>>;
  packages: ServicePackage[];
}) {
  return <ServicesPageContent content={content} packages={packages} />;
}
