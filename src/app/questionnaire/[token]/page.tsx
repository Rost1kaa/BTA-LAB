import type { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { questionnaireContent } from "@/data/questionnaire";
import { QuestionnaireForm } from "@/components/questionnaire/questionnaire-form";
import { QuestionnaireIntro } from "@/components/questionnaire/questionnaire-intro";
import { LinkIcon, Clock, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: questionnaireContent.title,
  robots: { index: false, follow: false },
};

interface QuestionnairePageProps {
  params: Promise<{ token: string }>;
}

export default async function QuestionnairePage({ params }: QuestionnairePageProps) {
  const { token } = await params;

  const supabase = createServiceRoleClient();
  const { data: invitation } = (await supabase
    .from("questionnaire_invitations")
    .select("id, token, status, draft_answers")
    .eq("token", token)
    .maybeSingle()) as unknown as {
    data: {
      id: string;
      token: string;
      status: "pending" | "submitted";
      draft_answers: Record<string, unknown>;
    } | null;
    error: unknown;
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {/* BTA LAB branded intro — fullscreen overlay, CSS-driven, self-removing */}
      <QuestionnaireIntro />

      {/* Subtle decorative background — purely visual, never intercepts input */}
      <QuestionnaireBackground />

      <div className="questionnaire-card-in relative z-10 flex flex-col items-center px-4 pt-24 md:pt-28 pb-16">
        {!invitation ? (
          <StatusCard
            icon={<ShieldAlert size={28} />}
            title={questionnaireContent.invalidLinkTitle}
            message={questionnaireContent.invalidLinkMessage}
          />
        ) : invitation.status === "submitted" ? (
          <StatusCard
            icon={<Clock size={28} />}
            title={questionnaireContent.usedLinkTitle}
            message={questionnaireContent.usedLinkMessage}
          />
        ) : (
          <QuestionnaireForm token={invitation.token} initialAnswers={invitation.draft_answers || {}} />
        )}
      </div>
    </div>
  );
}

/**
 * Decorative backdrop for the questionnaire: a soft grid, two blurred orbs
 * and a couple of geometric ornaments. Everything is aria-hidden and
 * pointer-events-none so it never interferes with the form, readability,
 * accessibility, or performance.
 */
function QuestionnaireBackground() {
  return (
    <div className="questionnaire-bg-in absolute inset-0 pointer-events-none select-none" aria-hidden="true">
      {/* Fine grid pattern */}
      <div
        className="absolute inset-0 grid-pattern opacity-[0.5] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />

      {/* Soft glow orbs */}
      <div className="absolute top-20 -right-20 w-72 h-72 rounded-full bg-[var(--color-accent)]/[0.05] blur-3xl" />
      <div className="absolute -bottom-32 -left-28 w-80 h-80 rounded-full bg-[var(--color-accent)]/[0.06] blur-3xl" />
      <div className="absolute top-1/3 -left-20 w-52 h-52 rounded-full bg-[var(--color-accent)]/[0.04] blur-2xl" />

      {/* Geometric ornaments */}
      <div className="absolute top-36 right-[12%] hidden md:block animate-float">
        <div className="w-10 h-10 border border-[var(--color-border-primary)] rounded-lg rotate-12 opacity-40" />
      </div>
      <div
        className="absolute top-1/2 left-[7%] hidden lg:block animate-float"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="w-6 h-6 border border-[var(--color-border-primary)] rounded-full opacity-30" />
      </div>
      <div
        className="absolute bottom-24 right-[16%] hidden md:block animate-float"
        style={{ animationDelay: "2.1s" }}
      >
        <div className="w-3.5 h-3.5 bg-[var(--color-fg-tertiary)]/15 rotate-45" />
      </div>
      <div
        className="absolute bottom-40 left-[14%] hidden lg:block animate-pulse-soft"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="w-5 h-5 rounded-sm border border-[var(--color-accent)]/20" />
      </div>

      {/* Minimal line pattern (top-right corner) */}
      <div className="absolute top-28 left-[6%] hidden lg:block space-y-1.5 opacity-25">
        <div className="w-16 h-px bg-[var(--color-fg-tertiary)]/30" />
        <div className="w-11 h-px bg-[var(--color-fg-tertiary)]/20 ml-2" />
        <div className="w-7 h-px bg-[var(--color-fg-tertiary)]/15 ml-4" />
      </div>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] p-8 text-center shadow-sm">
      <div className="w-14 h-14 rounded-full bg-[var(--color-overlay)] flex items-center justify-center mx-auto mb-5 text-[var(--color-fg-tertiary)]">
        {icon}
      </div>
      <h1 className="text-xl font-bold text-[var(--color-fg-primary)]">{title}</h1>
      <p className="mt-3 text-sm text-[var(--color-fg-tertiary)] leading-relaxed">{message}</p>
      <div className="mt-6 inline-flex items-center gap-2 text-xs text-[var(--color-fg-tertiary)]/50">
        <LinkIcon size={12} />
        BTA LAB
      </div>
    </div>
  );
}
