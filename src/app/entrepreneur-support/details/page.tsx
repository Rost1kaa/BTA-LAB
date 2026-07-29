import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { FadeIn } from "@/components/animations/fade-in";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Details | Entrepreneur Support Campaign",
  description: "Campaign details for the BTA LAB Entrepreneur Support Campaign",
};

export const revalidate = 60;

interface CampaignDetail {
  id: number;
  title: string;
  content: string;
  updated_at: string;
}

async function getCampaignDetails(): Promise<CampaignDetail | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("campaign_details")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.error("[campaign-details] Failed to fetch:", error?.message);
    return null;
  }

  return data as CampaignDetail;
}

export default async function CampaignDetailsPage() {
  const detail = await getCampaignDetails();

  return (
    <div className="min-h-screen pt-[80px] md:pt-[96px] pb-20">
      <Container>
        {/* Back link */}
        <div className="mb-8">
          <Link
            href="/entrepreneur-support"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>უკან დაბრუნება</span>
          </Link>
        </div>

        {!detail ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-fg-tertiary)]">კამპანიის დეტალები ჯერ არ არის ხელმისაწვდომი.</p>
          </div>
        ) : (
          <Section>
            <div className="max-w-4xl mx-auto">
              <FadeIn direction="up">
                <Badge variant="outline" className="mb-4">
                  კამპანიის დეტალები
                </Badge>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gradient">
                  {detail.title}
                </h1>
              </FadeIn>

              <FadeIn direction="up" delay={0.15}>
                <div
                  className="prose prose-sm md:prose-base lg:prose-lg max-w-none prose-headings:text-[var(--color-fg-primary)] prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-[var(--color-fg-secondary)] prose-p:leading-relaxed prose-strong:text-[var(--color-fg-primary)] prose-ul:list-disc prose-ul:pl-6 prose-li:text-[var(--color-fg-secondary)] prose-li:leading-relaxed prose-li:my-1.5 dark:prose-invert mt-10"
                  dangerouslySetInnerHTML={{ __html: detail.content }}
                />
              </FadeIn>

              {detail.updated_at && (
                <FadeIn direction="up" delay={0.3}>
                  <p className="mt-12 text-xs text-[var(--color-fg-tertiary)]">
                    ბოლო განახლება: {new Date(detail.updated_at).toLocaleDateString("ka-GE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </FadeIn>
              )}
            </div>
          </Section>
        )}
      </Container>
    </div>
  );
}
