"use client";

import { useState, useCallback, useRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/use-dictionary";
import { FadeIn } from "@/components/animations/fade-in";
import type { CampaignFAQ } from "@/lib/campaign-types";

interface CampaignFAQProps {
  sectionTitle?: string;
  sectionDescription?: string;
  items: CampaignFAQ[];
  locale?: string;
}

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "group border-b border-[var(--color-border-primary)] transition-colors duration-300",
        isOpen && "border-[var(--color-fg-tertiary)]/30"
      )}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
        className={cn(
          "flex w-full items-center justify-between gap-4 py-5 md:py-6 text-left",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-fg-tertiary)]/30",
          "transition-colors duration-200"
        )}
      >
        <span
          className={cn(
            "text-base md:text-lg font-medium leading-relaxed pr-4 transition-colors duration-300",
            isOpen
              ? "text-[var(--color-fg-primary)]"
              : "text-[var(--color-fg-secondary)] group-hover:text-[var(--color-fg-primary)]"
          )}
        >
          {question}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
            isOpen && "rotate-180",
            isOpen ? "text-[var(--color-fg-primary)]" : "text-[var(--color-fg-tertiary)]"
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        ref={contentRef}
        className={cn(
          "overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
        style={{
          transitionTimingFunction: isOpen
            ? "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
            : "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
        }}
      >
        <div className="pb-5 md:pb-6 pr-12">
          <div className="prose prose-sm max-w-none text-[var(--color-fg-tertiary)] leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CampaignFAQ({
  sectionTitle,
  sectionDescription,
  items,
  locale = "ka",
}: CampaignFAQProps) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full">
      {/* Section header */}
      {(sectionTitle || sectionDescription) && (
        <div className="mb-10 md:mb-14">
          {sectionTitle && (
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-fg-primary)]">
              {sectionTitle}
            </h2>
          )}
          {sectionDescription && (
            <p className="mt-4 text-base md:text-lg text-[var(--color-fg-tertiary)] max-w-3xl leading-relaxed">
              {sectionDescription}
            </p>
          )}
        </div>
      )}

      {/* FAQ List */}
      <div className="divide-y divide-[var(--color-border-primary)] border-t border-[var(--color-border-primary)]">
        {items.map((item, index) => {
          const question = locale === "ka" ? item.question_ka : item.question_en;
          const answer = locale === "ka" ? item.answer_ka : item.answer_en;

          if (!question && !answer) return null;

          return (
            <FadeIn key={item.id || index} delay={index * 0.03}>
              <FAQItem
                question={question || "—"}
                answer={answer || "—"}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
                index={index}
              />
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
