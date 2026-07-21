"use client";

import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { Section } from "@/components/ui/section";
import { TextReveal } from "@/components/animations/text-reveal";

import { useTranslation } from "@/lib/use-dictionary";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import Image from "next/image";

import type { TeamMember } from "@/types/supabase";



const socialIcons: Record<string, React.ReactNode> = {
  linkedin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  twitter: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46L20 4" />
    </svg>
  ),
  github: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
  website: <Globe size={16} />,
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),
};

function TeamPageContent({
  content,
  members,
}: {
  content: Record<string, Record<string, string>>;
  members: TeamMember[];
}) {
  const { t } = useTranslation();
  const heroContent = content.hero || {};

  return (
    <>
      {/* Hero */}
      <Section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <Container>
          <FadeIn direction="up">
            <Badge variant="outline">{heroContent.badge || t("team.badge")}</Badge>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <TextReveal
              as="h1"
              className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-gradient"
              staggerChildren={0.02}
            >
              {heroContent.heading || t("team.heading")}
            </TextReveal>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <p className="mt-6 max-w-2xl text-base md:text-lg text-[var(--color-fg-tertiary)] leading-relaxed">
              {heroContent.description || t("team.description")}
            </p>
          </FadeIn>
        </Container>
      </Section>

      {/* Team Grid */}
      <Section className="py-16 md:py-20">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member, index) => (
              <FadeIn key={member.id} delay={index * 0.05}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="group p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-surface-hover)] hover:border-[var(--color-border-primary)] transition-all duration-500 h-full flex flex-col"
                >
                  {/* Avatar */}
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-overlay)] to-transparent border border-[var(--color-border-primary)] flex items-center justify-center mb-4 overflow-hidden">
                    {member.image ? (
                      <Image src={member.image} alt={member.image_alt || t("team.imageAlt").replace("%name%", member.name)} fill sizes="64px" className="object-cover" />
                    ) : (
                      <span className="text-xl font-semibold text-[var(--color-fg-tertiary)]/70">
                        {member.name.split(" ").map((name) => name[0]).join("")}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--color-fg-primary)] group-hover:text-[var(--color-fg-primary)]/90 transition-colors">
                      {member.name}
                    </h3>
                    <p className="mt-3 text-xs text-[var(--color-fg-tertiary)]/60 leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="mt-4 pt-4 border-t border-[var(--color-border-primary)] flex items-center gap-2">
                    {member.socials && Object.entries(member.socials).map(([platform, url]) =>
                      url ? (
                        <a
                          key={platform}
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t("team.socialLabel").replace("%name%", member.name).replace("%platform%", platform)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-overlay)] flex items-center justify-center text-[var(--color-fg-tertiary)]/50 hover:bg-[var(--color-overlay)] hover:text-[var(--color-fg-secondary)] transition-all duration-300"
                        >
                          {socialIcons[platform] || <Globe size={16} />}
                        </a>
                      ) : null
                    )}
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* Join the Team CTA */}
      <Section className="py-16 md:py-20">
        <Container>
          <FadeIn direction="up">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[var(--color-overlay)] to-transparent border border-[var(--color-border-primary)] p-10 md:p-16 text-center">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-glow)] rounded-full blur-[100px]" />
              <div className="relative z-10 max-w-xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">
                  {t("team.join.heading")}
                </h2>
                <p className="mt-4 text-base text-[var(--color-fg-tertiary)] leading-relaxed">
                  {t("team.join.description")}
                </p>
                <div className="mt-8">
                  <a href="mailto:careers@bta-lab.com">
                    <span className="inline-flex items-center gap-2 text-sm text-[var(--color-fg-tertiary)]/70 hover:text-[var(--color-fg-secondary)] transition-colors">
                      careers@bta-lab.com
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}

export function TeamPageClient({
  content,
  members,
}: {
  content: Record<string, Record<string, string>>;
  members: TeamMember[];
}) {
  return <TeamPageContent content={content} members={members} />;
}
