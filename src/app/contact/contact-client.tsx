"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { Section } from "@/components/ui/section";
import { TextReveal } from "@/components/animations/text-reveal";
import { Button } from "@/components/ui/button";

import { useTranslation } from "@/lib/use-dictionary";

type SiteConfigShape = {
  phone: string;
  address: string;
  location: string;
  socials: {
    facebook: string;
    instagram: string;
  };
  [key: string]: unknown;
};

function ContactFormContent({
  siteConfig,
  content,
}: {
  siteConfig: SiteConfigShape;
  content: Record<string, Record<string, string>>;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { locale, t } = useTranslation();

  const phone = siteConfig.phone;
  const address = siteConfig.address;
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
                src="https://www.google.com/maps/embed?pb=!1m22!1m8!1m3!1d3540.7367394949943!2d44.82653284270519!3d41.73361900108122!3m2!1i1024!2i768!4f13.1!4m11!3e6!4m3!3m2!1d41.7334244!2d44.828559999999996!4m5!1s0x40440d55b5eda87d%3A0x9219acbfd8de3158!2z4YOR4YOY4YOW4YOc4YOU4YOh4YOY4YOh4YOQIOGDk-GDkCDhg6Lhg5Thg6Xhg5zhg53hg5rhg53hg5Lhg5jhg5Thg5Hhg5jhg6Eg4YOQ4YOZ4YOQ4YOT4YOU4YOb4YOY4YOQLCAxODUg4YOs4YOU4YOg4YOd4YOc4YOY4YOh4YOY4YOhIOGDpeGDo-GDqeGDkCwg4YOX4YOR4YOY4YOa4YOY4YOh4YOY!3m2!1d41.7333581!2d44.8285699!5e0!3m2!1ska!2sge!4v1785440331826!5m2!1ska!2sge"
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
}: {
  content: Record<string, Record<string, string>>;
  siteConfig: SiteConfigShape;
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
            <ContactFormContent siteConfig={siteConfig} content={content} />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}

export function ContactPageClient({
  content,
  siteConfig,
}: {
  content: Record<string, Record<string, string>>;
  siteConfig: SiteConfigShape;
}) {
  return (
    <ContactPageContent
      content={content}
      siteConfig={siteConfig}
    />
  );
}
