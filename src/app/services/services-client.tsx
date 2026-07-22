"use client";

import { useState, useCallback, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { Section } from "@/components/ui/section";
import { TextReveal } from "@/components/animations/text-reveal";

import { useTranslation } from "@/lib/use-dictionary";
import { createClient } from "@/lib/supabase/client";
import type { FeatureTooltipData } from "@/types";

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
import { SocialMediaTabbedPricing } from "@/components/services/social-media-pricing-tabs";
import { ServiceAddonCard } from "@/components/services/service-addon-card";
import { ServiceRequestForm } from "@/components/services/service-request-form";
import { FeatureTooltipProvider } from "@/components/ui/feature-tooltip";
import type { ServicePackage } from "@/types/supabase";
import type { PricingPackage, ServiceAddon } from "@/types";

// Build a feature name → tooltip lookup map from raw DB rows.
// Keys by BOTH Georgian and English names so tooltips work regardless
// of the locale the features are displayed in.
function buildTooltipMap(
  rows: Array<{ name_ka: string; name_en: string; description_ka: string; description_en: string }>,
): Record<string, FeatureTooltipData> {
  const map: Record<string, FeatureTooltipData> = {};
  for (const row of rows) {
    const nameKa = (row.name_ka || "").trim();
    const nameEn = (row.name_en || "").trim();
    const data: FeatureTooltipData = {
      nameKa: row.name_ka || "",
      nameEn: row.name_en || "",
      descriptionKa: row.description_ka || "",
      descriptionEn: row.description_en || "",
    };
    if (nameKa) map[nameKa] = data;
    if (nameEn && nameEn !== nameKa) map[nameEn] = data;
  }
  return map;
}

function toPricingPackage(item: ServicePackage, tooltipMap: Record<string, FeatureTooltipData>): PricingPackage {
  const features = item.features || [];

  // Build a per-feature tooltip lookup. For each feature text, check whether
  // a tooltip was registered by its Georgian or English name.
  const featureTooltips: Record<string, FeatureTooltipData> = {};
  for (const feature of features) {
    const trimmed = feature.trim();
    if (!trimmed) continue;
    if (tooltipMap[trimmed]) {
      featureTooltips[trimmed] = tooltipMap[trimmed];
    }
  }

  return {
    id: item.id,
    name: item.name,
    price: item.price,
    billingLabel: item.billing_label || undefined,
    description: item.description || undefined,
    idealFor: item.ideal_for || undefined,
    features,
    featureTooltips: Object.keys(featureTooltips).length > 0 ? featureTooltips : undefined,
    deliveryTime: item.delivery_time || undefined,
    cta: item.cta,
    highlighted: item.highlighted,
    customPrice: item.custom_price,
    priceExplanation: item.price_explanation || undefined,
    iconName: item.icon_name || undefined,
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

  // Ensure page always opens at the top, even when the global navigation
  // interception (public-site-effects) disables Next.js scroll restoration
  // via router.push(url, { scroll: false }). This corrects any scroll drift
  // that can occur during hydration or layout shifts.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch feature tooltips from Supabase on mount
  const [tooltipMap, setTooltipMap] = useState<Record<string, FeatureTooltipData>>({});
  useEffect(() => {
    let mounted = true;
    async function fetchTooltips() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("service_feature_tooltips")
          .select("name_ka, name_en, description_ka, description_en");
        if (mounted && data) {
          setTooltipMap(buildTooltipMap(data as Array<{ name_ka: string; name_en: string; description_ka: string; description_en: string }>));
        }
      } catch {
        // Silently fail
      }
    }
    fetchTooltips();
    return () => { mounted = false; };
  }, []);

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
    id: "website",
    title: t("pricing.website.title"),
    description: t("pricing.website.description"),
    packages: packages
      .filter((item) => item.section === "website")
      .map((item) => toPricingPackage(item, tooltipMap)),
  };
  const socialSection = {
    id: "social-media",
    title: t("pricing.social.title"),
    description: t("pricing.social.description"),
    note: t("pricing.social.note"),
    packages: packages
      .filter((item) => item.section === "social-media")
      .map((item) => toPricingPackage(item, tooltipMap)),
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
      <Section id="web-development" className="py-16 md:py-20 bg-[var(--color-bg-secondary)] scroll-mt-24">
        <Container>
          <PricingSectionBlock
            section={websiteSection}
            onPlanProject={openForm}
          />

          {/* Can't decide? — CTA callout after the last website package */}
          <FadeIn direction="up" delay={0.2}>
            <div className="mt-12 mx-auto max-w-4xl">
              <div className="rounded-xl border border-[var(--color-border-secondary)] bg-[var(--color-overlay)] px-5 py-5 md:px-7 md:py-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <div className="w-0.5 self-stretch shrink-0 rounded-full bg-[var(--color-accent)]/40" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-[var(--color-fg-primary)] tracking-tight">
                      {t("services.cta_choose.heading")}
                    </h3>
                    <p className="mt-1.5 text-sm md:text-base text-[var(--color-fg-tertiary)] leading-relaxed">
                      {t("services.cta_choose.description")}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Link href="/contact">
                      <Button variant="primary" size="md" className="gap-2 group whitespace-nowrap">
                        {t("services.cta.button")}
                        <ArrowRight
                          size={16}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* Social Media Pricing — premium tabbed layout */}
      <div id="social-media" className="scroll-mt-24">
        <SocialMediaTabbedPricing
          section={socialSection}
          onPlanProject={openForm}
          maxVisibleFeatures={9}
        />
      </div>

      {/* Add-ons */}
      <Section id="additional-services" className="py-16 md:py-20 bg-[var(--color-bg-secondary)] scroll-mt-24">
        <Container>
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gradient">
              {content.addons?.title || t("services.addons.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-base md:text-lg text-[var(--color-fg-tertiary)] leading-relaxed">
              {content.addons?.description || t("services.addons.description")}
            </p>
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
  return (
    <FeatureTooltipProvider>
      <ServicesPageContent content={content} packages={packages} />
    </FeatureTooltipProvider>
  );
}
