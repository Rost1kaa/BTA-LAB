"use client";

import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { FadeIn } from "@/components/animations/fade-in";
import type { CampaignSection } from "@/lib/campaign-types";

interface RulesClientProps {
  sections: CampaignSection[];
  locale: string;
}

export function RulesClient({ sections, locale }: RulesClientProps) {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <Container>
        <FadeIn direction="up">
          <Badge variant="outline" className="mb-4">
            {locale === "ka" ? "წესები და პირობები" : "Rules & Regulations"}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">
            {locale === "ka" ? "კამპანიის წესები" : "Campaign Rules"}
          </h1>
        </FadeIn>

        <div className="mt-10 space-y-8">
          {sections.map((section) => {
            const title = locale === "ka" ? section.title_ka : section.title_en;
            const description = locale === "ka" ? section.description_ka : section.description_en;
            const content = locale === "ka" ? section.content_ka : section.content_en;

            if (!title && !description && !content) return null;

            return (
              <FadeIn key={section.id}>
                <div className="p-6 md:p-8 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)]">
                  {title && (
                    <h2 className="text-xl font-semibold text-[var(--color-fg-primary)]">{title}</h2>
                  )}
                  {description && (
                    <p className="mt-3 text-base text-[var(--color-fg-tertiary)] leading-relaxed">{description}</p>
                  )}
                  {content && (
                    <div className="mt-4 text-base text-[var(--color-fg-secondary)] leading-relaxed whitespace-pre-line">
                      {content}
                    </div>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
