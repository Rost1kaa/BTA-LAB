"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { Section } from "@/components/ui/section";
import { TextReveal } from "@/components/animations/text-reveal";
import { Button } from "@/components/ui/button";

import { useTranslation } from "@/lib/use-dictionary";
import type { ServicePackage } from "@/types/supabase";

type SiteConfigShape = {
  email: string;
  phone: string;
  address: string;
  location: string;
  availability: string;
  socials: {
    facebook: string;
    instagram: string;
  };
  [key: string]: unknown;
};

function ContactFormContent({
  siteConfig,
  packages,
  content,
}: {
  siteConfig: SiteConfigShape;
  packages: ServicePackage[];
  content: Record<string, Record<string, string>>;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { locale, t } = useTranslation();
  const searchParams = useSearchParams();
  const preselectedPackage = searchParams.get("package") || "";
  const [selectedPackage, setSelectedPackage] = useState(preselectedPackage);

  const email = siteConfig.email;
  const phone = siteConfig.phone;
  const address = siteConfig.address;
  const allPricingPackages = packages
    .filter((item) => item.section !== "addons")
    .map((item) => ({ id: item.id, name: item.name }));
  const formContent = content.form || {};
  const formText = (key: string) => formContent[key] || t(`contact.form.${key}`);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        setSubmitError(result.error || t("contact.form.errorGeneric"));
        return;
      }

      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
      {/* Form */}
      <div className="lg:col-span-3">
        <FadeIn direction="up">
          <div className="p-8 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitError && (
                  <p role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
                    {submitError}
                  </p>
                )}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <input type="hidden" name="locale" value={locale} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                      {formText("name")}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder={formText("namePlaceholder")}
                      className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 focus:bg-[var(--color-overlay)] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                      {formText("email")}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder={formText("emailPlaceholder")}
                      className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 focus:bg-[var(--color-overlay)] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                      {formText("phone")}
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder={formText("phonePlaceholder")}
                      className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 focus:bg-[var(--color-overlay)] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                      {formText("company")}
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder={formText("companyPlaceholder")}
                      className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 focus:bg-[var(--color-overlay)] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="service" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                      {formText("service")}
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={selectedPackage}
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-tertiary)]/80 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 focus:bg-[var(--color-overlay)] transition-all appearance-none"
                    >
                      <option value="">{formText("servicePlaceholder")}</option>
                      {allPricingPackages.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="budget" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                      {formText("budget")}
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-tertiary)]/80 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 focus:bg-[var(--color-overlay)] transition-all appearance-none"
                    >
                      <option value="">{formText("budgetPlaceholder")}</option>
                      <option value="small">{formContent.budgetOptions_small || t("contact.form.budgetOptions.small")}</option>
                      <option value="medium">{formContent.budgetOptions_medium || t("contact.form.budgetOptions.medium")}</option>
                      <option value="large">{formContent.budgetOptions_large || t("contact.form.budgetOptions.large")}</option>
                      <option value="enterprise">{formContent.budgetOptions_enterprise || t("contact.form.budgetOptions.enterprise")}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                    {formText("message")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    placeholder={formText("messagePlaceholder")}
                    className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 focus:bg-[var(--color-overlay)] transition-all resize-none"
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full gap-2 group">
                  {formText("submit")}
                  <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--color-overlay)] flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} className="text-[var(--color-fg-tertiary)]/70" />
                </div>
                <h3 className="text-2xl font-semibold text-[var(--color-fg-primary)]">
                  {formText("successTitle")}
                </h3>
                <p className="mt-3 text-sm text-[var(--color-fg-tertiary)] max-w-sm mx-auto">
                  {formText("successDescription")}
                </p>
                <Button variant="secondary" size="md" className="mt-6" onClick={() => setSubmitted(false)}>
                  {formText("sendAnother")}
                </Button>
              </motion.div>
            )}
          </div>
        </FadeIn>
      </div>

      {/* Contact Info */}
      <div className="lg:col-span-2">
        <FadeIn direction="up" delay={0.1}>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-overlay)] flex items-center justify-center text-[var(--color-fg-tertiary)]/70 mb-4">
                <Mail size={20} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--color-fg-tertiary)]/80 uppercase tracking-wider mb-1">
                {t("contact.info.email")}
              </h3>
              <a href={`mailto:${email}`} className="text-base text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-secondary)] transition-colors">
                {email}
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-overlay)] flex items-center justify-center text-[var(--color-fg-tertiary)]/70 mb-4">
                <Phone size={20} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--color-fg-tertiary)]/80 uppercase tracking-wider mb-1">
                {t("contact.info.phone")}
              </h3>
              <a href={`tel:${phone}`} className="text-base text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-secondary)] transition-colors">
                {phone}
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-overlay)] flex items-center justify-center text-[var(--color-fg-tertiary)]/70 mb-4">
                <MapPin size={20} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--color-fg-tertiary)]/80 uppercase tracking-wider mb-1">
                {t("contact.info.address")}
              </h3>
              <p className="text-base text-[var(--color-fg-tertiary)]">{address}</p>
            </div>

            {/* Google Maps Embed */}
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border-primary)] h-48 bg-[var(--color-bg-surface)] relative group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.966!2d-73.9857!3d40.7484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ0JzU0LjIiTiA3M8KwNTknMDguNSJX!5e0!3m2!1sen!2sus!4v1!4m1!1i1024!2i768"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(1) invert(0.9)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t("contact.mapTitle")}
                className="opacity-70 hover:opacity-100 transition-opacity duration-500"
              />
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

function ContactPageContent({
  content,
  siteConfig,
  packages,
}: {
  content: Record<string, Record<string, string>>;
  siteConfig: SiteConfigShape;
  packages: ServicePackage[];
}) {
  const { t } = useTranslation();
  const heroContent = content.hero || {};

  return (
    <>
      {/* Hero */}
      <Section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <Container>
          <FadeIn direction="up">
            <Badge variant="outline">{heroContent.badge || t("contact.badge")}</Badge>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <TextReveal
              as="h1"
              className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-gradient"
              staggerChildren={0.02}
            >
              {heroContent.heading || t("contact.heading")}
            </TextReveal>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <p className="mt-6 max-w-2xl text-base md:text-lg text-[var(--color-fg-tertiary)] leading-relaxed">
              {heroContent.description || t("contact.description")}
            </p>
          </FadeIn>
        </Container>
      </Section>

      {/* Contact Form + Info */}
      <Section className="py-16 md:py-20">
        <Container>
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-[var(--color-overlay)]" />}>
            <ContactFormContent siteConfig={siteConfig} packages={packages} content={content} />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}

export function ContactPageClient({
  content,
  siteConfig,
  packages,
}: {
  content: Record<string, Record<string, string>>;
  siteConfig: SiteConfigShape;
  packages: ServicePackage[];
}) {
  return (
    <ContactPageContent
      content={content}
      siteConfig={siteConfig}
      packages={packages}
    />
  );
}
