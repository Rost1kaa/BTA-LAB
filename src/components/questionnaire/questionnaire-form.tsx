"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  questionnaireContent,
  QUESTIONNAIRE_TOTAL_STEPS,
  type QuestionnaireItem,
  type QuestionnaireOption,
  type QuestionnaireStep,
} from "@/data/questionnaire";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Clock,
  Info,
  Loader2,
  LinkIcon,
} from "lucide-react";

type Answers = Record<string, unknown>;
type Stage = "start" | "steps" | "completion" | "success";

const content = questionnaireContent;
const TOTAL = QUESTIONNAIRE_TOTAL_STEPS;

/**
 * Remove answers of fields that are currently hidden by conditional
 * visibility (showWhen) or by a deselected option, so stale answers are
 * never submitted.
 */
function pruneHiddenAnswers(answers: Answers): Answers {
  const next = { ...answers };
  for (const step of content.steps) {
    for (const item of step.items) {
      if (item.kind === "question") {
        // Drop the revealed text input of an option that is not selected.
        const selected = next[item.id];
        const selectedIds = Array.isArray(selected)
          ? (selected as string[])
          : selected
            ? [selected as string]
            : [];
        for (const option of item.options) {
          if (!option.textFieldLabel) continue;
          if (!selectedIds.includes(option.id)) {
            delete next[`${item.id}__${option.id}`];
          }
        }
        continue;
      }
      if (!("showWhen" in item) || !item.showWhen) continue;
      const parent = next[item.showWhen.fieldId];
      const parentIds = Array.isArray(parent)
        ? (parent as string[])
        : parent
          ? [parent as string]
          : [];
      const matches = item.showWhen.optionIds.some((id) => parentIds.includes(id));
      if (!matches) {
        delete next[item.id];
        for (const key of Object.keys(next)) {
          if (key.startsWith(`${item.id}__`)) delete next[key];
        }
      }
    }
  }
  return next;
}

/** Whether a stored answer is a non-empty (trimmed) string. */
function isNonEmptyText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

interface QuestionnaireFormProps {
  token: string;
  initialAnswers: Answers;
}

export function QuestionnaireForm({ token, initialAnswers }: QuestionnaireFormProps) {
  const [stage, setStage] = useState<Stage>(Object.keys(initialAnswers).length > 0 ? "steps" : "start");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<"used" | "invalid" | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const topRef = useRef<HTMLDivElement>(null);
  const savingRef = useRef(false);
  const pendingDraftRef = useRef<Answers | null>(null);

  const currentStep = content.steps[stepIndex];

  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      topRef.current?.focus?.();
    });
  }, []);

  // ── Draft autosave (შუალედური შენახვა) ────────────────────────────────
  // Serialized saves: a slow older request can never overwrite a newer draft
  // because only the latest snapshot is flushed while one request is in flight.
  const saveDraft = useCallback(
    async (current: Answers) => {
      pendingDraftRef.current = current;
      if (savingRef.current) return;
      savingRef.current = true;
      try {
        while (pendingDraftRef.current) {
          const snapshot = pendingDraftRef.current;
          pendingDraftRef.current = null;
          const res = await fetch("/api/questionnaire/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, answers: snapshot, mode: "draft" }),
          });
          if (res.status === 409) {
            setBlocked("used");
            return;
          }
          if (res.status === 404) {
            setBlocked("invalid");
            return;
          }
          if (res.ok) {
            setDraftSavedAt(new Date().toISOString());
          }
        }
      } catch {
        // Silent — draft saving must never block the user.
      } finally {
        // The while loop re-checks the pending ref after every await, so any
        // snapshot queued while a request is in flight is drained here — no
        // recursion is needed and newer drafts always win.
        savingRef.current = false;
      }
    },
    [token]
  );

  useEffect(() => {
    if (stage !== "steps" && stage !== "completion") return;
    if (Object.keys(answers).length === 0) return;
    const timer = setTimeout(() => {
      setSavingDraft(true);
      saveDraft(answers).finally(() => setSavingDraft(false));
    }, 1200);
    return () => clearTimeout(timer);
  }, [answers, stage, saveDraft]);

  // ── Helpers ────────────────────────────────────────────────────────────

  const isVisible = useCallback(
    (item: QuestionnaireItem): boolean => {
      if (!("showWhen" in item) || !item.showWhen) return true;
      const parent = answers[item.showWhen.fieldId];
      const parentIds = Array.isArray(parent) ? (parent as string[]) : parent ? [parent as string] : [];
      return item.showWhen.optionIds.some((id) => parentIds.includes(id));
    },
    [answers]
  );

  const isStepValid = useCallback(
    (step: QuestionnaireStep): boolean => {
      return step.items.every((item) => {
        if (!isVisible(item)) return true;

        if (item.kind === "question") {
          const value = answers[item.id];
          if (item.type === "single") {
            if (typeof value !== "string" || value.length === 0) return false;
          } else {
            if (!Array.isArray(value) || value.length === 0) return false;
          }
          // Every selected option that reveals a text input must have it filled.
          const selectedIds =
            item.type === "multiple" ? (value as string[]) : [value as string];
          return item.options
            .filter((o) => o.textFieldLabel)
            .every((o) => !selectedIds.includes(o.id) || isNonEmptyText(answers[`${item.id}__${o.id}`]));
        }

        // Conditionally-visible text fields (e.g. domain / hosting inputs after
        // selecting "დიახ") are REQUIRED once they become visible.
        if (item.kind === "text" && item.showWhen) {
          return isNonEmptyText(answers[item.id]);
        }

        return true;
      });
    },
    [answers, isVisible]
  );

  const stepValid = useMemo(() => isStepValid(currentStep), [currentStep, isStepValid]);

  const handleToggle = (fieldId: string, type: "single" | "multiple", optionId: string) => {
    setAnswers((prev) => {
      let next: Answers;
      if (type === "single") {
        next = { ...prev, [fieldId]: optionId };
      } else {
        const current = prev[fieldId];
        const list = Array.isArray(current) ? (current as string[]) : [];
        const updated = list.includes(optionId)
          ? list.filter((id) => id !== optionId)
          : [...list, optionId];
        next = { ...prev, [fieldId]: updated };
      }
      // Clear answers of fields hidden by conditional visibility.
      return pruneHiddenAnswers(next);
    });
  };

  const handleTextChange = (fieldId: string, value: string) => {
    setAnswers((prev) => pruneHiddenAnswers({ ...prev, [fieldId]: value }));
  };

  const handleGoNext = () => {
    if (!stepValid) return;
    if (stepIndex < TOTAL - 1) {
      setStepIndex((i) => i + 1);
      scrollToTop();
    } else {
      setStage("completion");
      scrollToTop();
    }
    // Flush the draft immediately on navigation.
    saveDraft(answers);
  };

  const handleGoBack = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
      scrollToTop();
    } else {
      setStage("start");
    }
    saveDraft(answers);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, answers, mode: "submit" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setBlocked("used");
        return;
      }
      if (res.status === 404) {
        setBlocked("invalid");
        return;
      }
      if (!res.ok) {
        setSubmitError(data.error || "გაგზავნა ვერ მოხერხდა.");
        return;
      }
      setStage("success");
      scrollToTop();
    } catch {
      setSubmitError("გაგზავნა ვერ მოხერხდა.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (blocked) {
    const used = blocked === "used";
    return (
      <BlockedCard
        title={used ? content.usedLinkTitle : content.invalidLinkTitle}
        message={used ? content.usedLinkMessage : content.invalidLinkMessage}
      />
    );
  }

  const percent = Math.round(((stepIndex + 1) / TOTAL) * 100);

  return (
    <div
      ref={topRef}
      tabIndex={-1}
      className="w-full max-w-2xl outline-none"
      aria-label={content.title}
    >
      <div className="rounded-3xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 md:px-8 pt-6 md:pt-8 pb-4 border-b border-[var(--color-border-primary)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-[var(--color-fg-primary)]">
                {content.title}
              </h1>
              {stage === "start" && (
                <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">{content.subtitle}</p>
              )}
            </div>
            {stage !== "start" && stage !== "success" && (
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-fg-tertiary)]/60 shrink-0">
                {savingDraft ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : draftSavedAt ? (
                  <Check size={12} className="text-green-500" />
                ) : null}
                <span>{savingDraft ? "ინახება..." : draftSavedAt ? "შენახულია" : ""}</span>
              </div>
            )}
          </div>

          {/* Progress bar + step counter */}
          {stage === "steps" && (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--color-border-primary)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[var(--color-accent)]"
                    initial={false}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                </div>
                <span className="text-xs font-medium text-[var(--color-fg-tertiary)] whitespace-nowrap">
                  {content.controls.stepLabel} {stepIndex + 1} {content.controls.ofLabel} {TOTAL} ({percent}%{" "}
                  {content.controls.percentCompleted})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-5 md:px-8 py-6 md:py-8 min-h-[320px]">
          <AnimatePresence mode="wait">
            {stage === "start" && (
              <motion.div
                key="start"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                className="text-center py-6 md:py-10"
              >
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-6">
                  <LinkIcon size={28} className="text-[var(--color-accent)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--color-fg-primary)]">
                  {content.subtitle}
                </h2>
                <div className="mt-4 space-y-3 text-sm text-[var(--color-fg-tertiary)] leading-relaxed max-w-lg mx-auto">
                  {content.introParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <button
                  onClick={() => setStage("steps")}
                  className="mt-8 inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-sm font-semibold hover:opacity-90 transition-all duration-200 cursor-pointer"
                >
                  {content.startButton}
                </button>
              </motion.div>
            )}

            {stage === "steps" && (
              <motion.div
                key={`step-${stepIndex}`}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 text-xs text-[var(--color-fg-tertiary)]/60 mb-1">
                  <Clock size={12} />
                  {currentStep.estimatedTime}
                </div>
                <h2 className="text-base md:text-lg font-semibold text-[var(--color-fg-primary)] leading-snug">
                  {currentStep.title}
                </h2>
                <div className="mt-5 space-y-7">
                  {currentStep.items.map((item, index) => (
                    <StepItemRenderer
                      key={`${currentStep.id}-${index}`}
                      item={item}
                      answers={answers}
                      visible={isVisible(item)}
                      onToggle={handleToggle}
                      onTextChange={handleTextChange}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {stage === "completion" && (
              <motion.div
                key="completion"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                className="text-center py-6 md:py-8"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <Check size={30} className="text-green-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--color-fg-primary)]">
                  {content.completion.heading}
                </h2>
                <div className="mt-4 space-y-3 text-sm text-[var(--color-fg-tertiary)] leading-relaxed max-w-lg mx-auto text-left">
                  {content.completion.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <div className="mt-6 max-w-lg mx-auto text-left rounded-2xl bg-[var(--color-overlay)] p-5">
                  <p className="text-sm font-semibold text-[var(--color-fg-primary)]">
                    {content.completion.nextStepsTitle}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {content.completion.nextSteps.map((stepText) => (
                      <li key={stepText} className="flex items-start gap-2 text-sm text-[var(--color-fg-tertiary)]">
                        <Check size={14} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                        <span>{stepText}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {submitError && (
                  <p className="mt-4 text-sm text-red-500" role="alert">
                    {submitError}
                  </p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={cn(
                    "mt-8 inline-flex items-center gap-2 px-7 h-11 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer",
                    isSubmitting
                      ? "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)]/50 cursor-not-allowed"
                      : "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {content.controls.submitting}
                    </>
                  ) : (
                    content.completion.submit
                  )}
                </button>
              </motion.div>
            )}

            {stage === "success" && (
              <motion.div
                key="success"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-10 md:py-14"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <Check size={32} className="text-green-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--color-fg-primary)]">
                  {content.success.title}
                </h2>
                <p className="mt-3 text-sm text-[var(--color-fg-tertiary)] leading-relaxed max-w-md mx-auto">
                  {content.success.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {stage === "steps" && (
          <div className="px-5 md:px-8 py-4 md:py-5 border-t border-[var(--color-border-primary)] flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-fg-tertiary)]/60 hover:text-[var(--color-fg-secondary)] hover:bg-[var(--color-overlay)] transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft size={16} />
              {content.controls.back}
            </button>
            <button
              onClick={handleGoNext}
              disabled={!stepValid}
              className={cn(
                "inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                stepValid
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90"
                  : "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)]/40 cursor-not-allowed"
              )}
            >
              {content.controls.continue}
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {stage === "completion" && (
          <div className="px-5 md:px-8 py-4 md:py-5 border-t border-[var(--color-border-primary)]">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-fg-tertiary)]/60 hover:text-[var(--color-fg-secondary)] hover:bg-[var(--color-overlay)] transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft size={16} />
              {content.controls.back}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Blocked (used / invalid link) card ─────────────────────────────────── */

function BlockedCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] p-8 text-center shadow-sm">
      <div className="w-14 h-14 rounded-full bg-[var(--color-overlay)] flex items-center justify-center mx-auto mb-5 text-[var(--color-fg-tertiary)]">
        <Clock size={26} />
      </div>
      <h1 className="text-xl font-bold text-[var(--color-fg-primary)]">{title}</h1>
      <p className="mt-3 text-sm text-[var(--color-fg-tertiary)] leading-relaxed">{message}</p>
    </div>
  );
}

/* ── Step item renderer ─────────────────────────────────────────────────── */

function StepItemRenderer({
  item,
  answers,
  visible,
  onToggle,
  onTextChange,
}: {
  item: QuestionnaireItem;
  answers: Answers;
  visible: boolean;
  onToggle: (fieldId: string, type: "single" | "multiple", optionId: string) => void;
  onTextChange: (fieldId: string, value: string) => void;
}) {
  if (!visible) return null;

  if (item.kind === "info") {
    return (
      <div className="rounded-2xl bg-[var(--color-overlay)] p-5">
        {item.title && (
          <h3 className="text-sm font-semibold text-[var(--color-fg-primary)]">{item.title}</h3>
        )}
        <div className={cn("space-y-2", item.title && "mt-2")}>
          {item.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm text-[var(--color-fg-tertiary)] leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
        {item.bullets && item.bullets.length > 0 && (
          <ul className="mt-3 space-y-2">
            {item.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm text-[var(--color-fg-tertiary)]">
                <Check size={14} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (item.kind === "note") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
        <p className="text-sm text-[var(--color-fg-tertiary)] leading-relaxed">{item.text}</p>
      </div>
    );
  }

  if (item.kind === "text") {
    // Conditionally-revealed text fields (showWhen) become REQUIRED once visible.
    const isConditionalRequired = Boolean(item.showWhen);
    const textValue = typeof answers[item.id] === "string" ? (answers[item.id] as string) : "";
    const showTextError = isConditionalRequired && textValue.trim().length === 0;
    const inputClass = cn(
      "mt-3 w-full rounded-xl bg-[var(--color-overlay)] border text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none transition-all",
      showTextError
        ? "border-red-500/60 focus:border-red-500/80"
        : "border-[var(--color-border-primary)] focus:border-[var(--color-fg-tertiary)]/30"
    );

    return (
      <div>
        <label htmlFor={`q-${item.id}`} className="block text-sm font-medium text-[var(--color-fg-primary)]">
          {item.label}
          {isConditionalRequired && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {item.description && (
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)] whitespace-pre-line leading-relaxed">
            {item.description}
          </p>
        )}
        {item.multiline ? (
          <textarea
            id={`q-${item.id}`}
            value={textValue}
            onChange={(e) => onTextChange(item.id, e.target.value)}
            rows={4}
            placeholder={item.placeholder}
            aria-required={isConditionalRequired}
            aria-invalid={showTextError}
            className={cn(inputClass, "px-4 py-3")}
          />
        ) : (
          <input
            id={`q-${item.id}`}
            type="text"
            value={textValue}
            onChange={(e) => onTextChange(item.id, e.target.value)}
            placeholder={item.placeholder}
            aria-required={isConditionalRequired}
            aria-invalid={showTextError}
            className={cn(inputClass, "h-10 px-4")}
          />
        )}
        {showTextError && (
          <p className="mt-1.5 text-xs text-red-500" role="alert">
            ეს ველი აუცილებელია
          </p>
        )}
      </div>
    );
  }

  // Question
  const selected = answers[item.id];
  const selectedIds = item.type === "multiple"
    ? (Array.isArray(selected) ? (selected as string[]) : [])
    : selected ? [selected as string] : [];

  return (
    <fieldset>
      <legend className="block text-sm font-medium text-[var(--color-fg-primary)]">
        {item.label}
        <span className="ml-1 text-red-500" aria-hidden="true">
          *
        </span>
      </legend>
      {item.description && (
        <p className="mt-1 text-sm text-[var(--color-fg-tertiary)] whitespace-pre-line leading-relaxed">
          {item.description}
        </p>
      )}
      <div className="mt-3 space-y-2">
        {item.options.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          return (
            <div key={option.id}>
              <button
                type="button"
                role={item.type === "multiple" ? "checkbox" : "radio"}
                aria-checked={isSelected}
                onClick={() => onToggle(item.id, item.type, option.id)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left text-sm transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-fg-primary)]"
                    : "bg-[var(--color-overlay)] border border-transparent text-[var(--color-fg-secondary)] hover:bg-[var(--color-border-primary)] hover:text-[var(--color-fg-primary)]"
                )}
              >
                <span
                  className={cn(
                    item.type === "multiple" ? "rounded" : "rounded-full",
                    "w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                    isSelected
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                      : "border-[var(--color-fg-tertiary)]/30"
                  )}
                >
                  {isSelected && <Check size={12} className="text-[var(--color-accent-foreground)]" />}
                </span>
                <span className="flex-1">
                  <span>{option.label}</span>
                  {option.hint && (
                    <span className="block mt-0.5 text-xs text-[var(--color-fg-tertiary)]/70">
                      {option.hint}
                    </span>
                  )}
                </span>
              </button>
              {option.textFieldLabel && isSelected && (
                <OptionTextField
                  itemId={item.id}
                  option={option}
                  value={
                    typeof answers[`${item.id}__${option.id}`] === "string"
                      ? (answers[`${item.id}__${option.id}`] as string)
                      : ""
                  }
                  onChange={(value) => onTextChange(`${item.id}__${option.id}`, value)}
                />
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ── Option text field (e.g. "სხვა" custom input) ──────────────────────── */

function OptionTextField({
  itemId,
  option,
  value,
  onChange,
}: {
  itemId: string;
  option: QuestionnaireOption;
  value: string;
  onChange: (value: string) => void;
}) {
  const showError = value.trim().length === 0;
  const inputId = `q-${itemId}__${option.id}`;

  return (
    <div className="mt-2 pl-8">
      <label
        htmlFor={inputId}
        className="block text-xs font-medium text-[var(--color-fg-tertiary)]/80 mb-1.5"
      >
        {option.textFieldLabel}
        <span className="ml-1 text-red-500" aria-hidden="true">
          *
        </span>
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={option.textFieldPlaceholder}
        aria-required="true"
        aria-invalid={showError}
        className={cn(
          "w-full h-10 px-4 rounded-xl bg-[var(--color-overlay)] border text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none transition-all",
          showError
            ? "border-red-500/60 focus:border-red-500/80"
            : "border-[var(--color-border-primary)] focus:border-[var(--color-fg-tertiary)]/30"
        )}
      />
      {showError && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          ეს ველი აუცილებელია
        </p>
      )}
    </div>
  );
}
