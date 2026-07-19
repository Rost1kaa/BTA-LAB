"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { quizContent } from "@/data/quiz";
import { useTranslation } from "@/lib/use-dictionary";
import type { QuizOption } from "@/data/quiz";
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Globe,
  FileText,
  ShoppingCart,
  Image,
  BookOpen,
  Palette,
  Monitor,
  GraduationCap,
  HelpCircle,
  Layout,
  Calendar,
  type LucideIcon,
} from "lucide-react";

interface ProjectQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuizAnswers {
  [stepId: number]: string | string[] | { value: string | string[]; customInput?: string } | string[];
}

const TOTAL_STEPS = 10;
const content = quizContent;

const projectTypeIcons: Record<string, LucideIcon> = {
  landing: Globe,
  "one-page": FileText,
  business: Monitor,
  ecommerce: ShoppingCart,
  portfolio: Image,
  blog: BookOpen,
  booking: Calendar,
  learning: GraduationCap,
  "custom-web": Layout,
  unsure: HelpCircle,
};

export function ProjectQuiz({ isOpen, onClose }: ProjectQuizProps) {
  const router = useRouter();
  const { locale } = useTranslation();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [contactInfo, setContactInfo] = useState<Record<string, string>>({});
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [existingUrl, setExistingUrl] = useState("");
  const [colorValue, setColorValue] = useState("#000000");
  const [exampleUrls, setExampleUrls] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const resetQuiz = useCallback(() => {
    setCurrentStep(0);
    setAnswers({});
    setContactInfo({});
    setContactErrors({});
    setIsSubmitting(false);
    setIsSubmitted(false);
    setSubmitError(null);
    setShowConfirmClose(false);
    setExistingUrl("");
    setColorValue("#000000");
    setExampleUrls("");
  }, []);

  // Trap focus and handle escape
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => modalRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSubmitted) return;
        if (currentStep > 0) {
          setShowConfirmClose(true);
        } else {
          onClose();
        }
      }
    },
    [currentStep, isSubmitted, onClose]
  );

  const handleClose = useCallback(() => {
    if (currentStep > 0 && !isSubmitted) {
      setShowConfirmClose(true);
    } else {
      onClose();
      resetQuiz();
    }
  }, [currentStep, isSubmitted, onClose, resetQuiz]);

  const isStepOptional = (stepId: number): boolean => {
    return content.steps[stepId]?.optional === true;
  };

  const isStepMultiple = (stepId: number): boolean => {
    return content.steps[stepId]?.multiple === true;
  };

  const getStepAnswers = (stepId: number): string | string[] => {
    const answer = answers[stepId];
    if (!answer) return isStepMultiple(stepId) ? [] : "";
    if (typeof answer === "object" && !Array.isArray(answer)) {
      return (answer as { value: string | string[] }).value;
    }
    return answer;
  };

  const isCurrentStepValid = (): boolean => {
    if (currentStep < TOTAL_STEPS) {
      const stepId = currentStep + 1;
      if (isStepOptional(stepId)) return true;
      const answer = getStepAnswers(stepId);
      if (isStepMultiple(stepId)) {
        return Array.isArray(answer) && answer.length > 0;
      }
      return typeof answer === "string" && answer.length > 0;
    }
    const hasName = contactInfo.name?.trim().length > 0;
    const hasEmailOrPhone = contactInfo.email?.trim().length > 0 || contactInfo.phone?.trim().length > 0;
    return !!hasName && !!hasEmailOrPhone;
  };

  const handleOptionSelect = (optionId: string, stepId: number) => {
    if (isStepMultiple(stepId)) {
      const current = getStepAnswers(stepId) as string[];
      const isSelected = current.includes(optionId);
      const updated = isSelected
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      setAnswers((prev) => ({ ...prev, [stepId]: updated }));
    } else {
      setAnswers((prev) => ({ ...prev, [stepId]: optionId }));
    }
  };

  const handleNext = () => {
    if (!isCurrentStepValid()) return;
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleContactChange = (field: string, value: string) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
    if (contactErrors[field]) {
      setContactErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!contactInfo.name?.trim()) {
      errors.name = "Name is required";
    }
    if (!contactInfo.email?.trim() && !contactInfo.phone?.trim()) {
      errors.email = "Email or phone is required";
    }
    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submissionData = {
        package: "custom-website",
        answers,
        existingUrl,
        designColors: colorValue,
        designExamples: exampleUrls,
        contact: contactInfo,
        locale,
        submittedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Submission failed");
      }

      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const stepStates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const stepTwoAnswer = getStepAnswers(2) as string;
  const showExistingUrl = stepTwoAnswer === "update" || stepTwoAnswer === "new";

  const colorPresets = [
    "#000000", "#ffffff", "#dc2626", "#ea580c", "#d97706",
    "#65a30d", "#16a34a", "#0891b2", "#2563eb", "#7c3aed",
    "#db2777", "#be185d",
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitted) handleClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={content.title}
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-3xl mx-4 my-8 md:my-12 outline-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative px-6 md:px-10 pt-6 md:pt-8 pb-4 border-b border-[var(--color-border-primary)]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--color-fg-primary)]">
                  {content.title}
                </h2>
                {!isSubmitted && (
                  <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
                    {content.subtitle}
                  </p>
                )}
              </div>
              {!isSubmitted && (
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-fg-tertiary)]/50 hover:text-[var(--color-fg-secondary)] hover:bg-[var(--color-overlay)] transition-colors cursor-pointer"
                  aria-label={content.controls.close}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Progress */}
            {!isSubmitted && (
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-[var(--color-border-primary)] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[var(--color-accent)]"
                      initial={false}
                      animate={{
                        width: `${((currentStep + (currentStep >= TOTAL_STEPS ? 1 : 0)) / (TOTAL_STEPS + 1)) * 100}%`,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[var(--color-fg-tertiary)] whitespace-nowrap">
                    {currentStep < TOTAL_STEPS
                      ? `${content.controls.step} ${currentStep + 1} ${content.controls.of} ${TOTAL_STEPS}`
                      : `${content.controls.step} ${TOTAL_STEPS + 1} ${content.controls.of} ${TOTAL_STEPS + 1}`}
                  </span>
                </div>

                {/* Step dots with aria-current */}
                <div className="flex gap-1.5 mt-3" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={TOTAL_STEPS + 1}>
                  {stepStates.map((step) => {
                    const answered = !!answers[step];
                    const isActive = currentStep === step - 1;
                    return (
                      <div
                        key={step}
                        role="presentation"
                        aria-current={isActive ? "step" : undefined}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors duration-300",
                          isActive
                            ? "bg-[var(--color-accent)]"
                            : answered
                              ? "bg-[var(--color-fg-tertiary)]/40"
                              : "bg-[var(--color-border-primary)]"
                        )}
                      />
                    );
                  })}
                  <div
                    role="presentation"
                    aria-current={currentStep >= TOTAL_STEPS ? "step" : undefined}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors duration-300",
                      currentStep >= TOTAL_STEPS
                        ? "bg-[var(--color-fg-tertiary)]/40"
                        : "bg-[var(--color-border-primary)]"
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="px-6 md:px-10 py-6 md:py-8 min-h-[300px]">
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-6">
                    <Check size={32} className="text-[var(--color-accent)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--color-fg-primary)]">
                    {content.success.title}
                  </h3>
                  <p className="mt-3 text-sm text-[var(--color-fg-tertiary)] max-w-md mx-auto leading-relaxed">
                    {content.success.message}
                  </p>
                  <button
                    onClick={() => {
                      resetQuiz();
                      onClose();
                      router.push("/");
                    }}
                    className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-sm font-medium hover:opacity-90 transition-all duration-300 cursor-pointer"
                  >
                    {content.success.button}
                  </button>
                </motion.div>
              ) : currentStep < TOTAL_STEPS ? (
                <StepContent
                  key={`step-${currentStep}`}
                  stepId={currentStep + 1}
                  content={content.steps[currentStep + 1]}
                  selectedAnswer={getStepAnswers(currentStep + 1)}
                  isMultiple={isStepMultiple(currentStep + 1)}
                  onSelect={(optionId) => handleOptionSelect(optionId, currentStep + 1)}
                  showExistingUrl={currentStep + 1 === 2 ? showExistingUrl : false}
                  existingUrl={existingUrl}
                  onExistingUrlChange={setExistingUrl}
                  colorValue={colorValue}
                  onColorChange={setColorValue}
                  colorPresets={colorPresets}
                  exampleUrls={exampleUrls}
                  onExampleUrlsChange={setExampleUrls}
                />
              ) : (
                <ContactStep
                  content={content}
                  contactInfo={contactInfo}
                  contactErrors={contactErrors}
                  submitError={submitError}
                  onContactChange={handleContactChange}
                  answers={answers}
                  stepStates={stepStates}
                  onEditStep={setCurrentStep}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {!isSubmitted && (
            <div className="px-6 md:px-10 py-4 md:py-5 border-t border-[var(--color-border-primary)] flex items-center justify-between">
              <div>
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-fg-tertiary)]/60 hover:text-[var(--color-fg-secondary)] hover:bg-[var(--color-overlay)] transition-all duration-200 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                    {content.controls.back}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {isStepOptional(currentStep + 1) && (
                  <button
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="text-xs text-[var(--color-fg-tertiary)]/50 hover:text-[var(--color-fg-secondary)] transition-colors cursor-pointer"
                  >
                    {content.controls.skip}
                  </button>
                )}
                {currentStep < TOTAL_STEPS ? (
                  <button
                    onClick={handleNext}
                    disabled={!isCurrentStepValid()}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                      isCurrentStepValid()
                        ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90"
                        : "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)]/40 cursor-not-allowed"
                    )}
                  >
                    {content.controls.continue}
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isCurrentStepValid()}
                    className={cn(
                      "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                      !isSubmitting && isCurrentStepValid()
                        ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90"
                        : "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)]/40 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      content.summary.submit
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Confirm close dialog */}
      <AnimatePresence>
        {showConfirmClose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setShowConfirmClose(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-6 shadow-2xl text-center"
            >
              <h3 className="text-lg font-semibold text-[var(--color-fg-primary)]">
                {content.controls.confirmCloseTitle}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-fg-tertiary)]">
                {content.controls.confirmCloseMessage}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowConfirmClose(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-overlay)] text-[var(--color-fg-primary)] hover:bg-[var(--color-border-primary)] transition-colors cursor-pointer"
                >
                  {content.controls.confirmCloseNo}
                </button>
                <button
                  onClick={() => {
                    setShowConfirmClose(false);
                    onClose();
                    resetQuiz();
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  {content.controls.confirmCloseYes}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------- Step Content ------- */

function StepContent({
  stepId,
  content,
  selectedAnswer,
  isMultiple,
  onSelect,
  showExistingUrl,
  existingUrl,
  onExistingUrlChange,
  colorValue,
  onColorChange,
  colorPresets,
  exampleUrls,
  onExampleUrlsChange,
}: {
  stepId: number;
  content: { question: string; description?: string; options: QuizOption[]; allowCustomInput?: boolean; customInputLabel?: string; customInputPlaceholder?: string };
  selectedAnswer: string | string[];
  isMultiple: boolean;
  onSelect: (id: string) => void;
  showExistingUrl: boolean;
  existingUrl: string;
  onExistingUrlChange: (v: string) => void;
  colorValue: string;
  onColorChange: (v: string) => void;
  colorPresets: string[];
  exampleUrls: string;
  onExampleUrlsChange: (v: string) => void;
}) {
  const selectedOptions: string[] = Array.isArray(selectedAnswer)
    ? selectedAnswer
    : selectedAnswer
      ? [selectedAnswer]
      : [];

  return (
    <div>
      <h3 className="text-lg md:text-xl font-semibold text-[var(--color-fg-primary)]">
        {content.question}
      </h3>
      {content.description && (
        <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
          {content.description}
        </p>
      )}

      {/* Step 1: Project Type with icons */}
      {stepId === 1 && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.options.map((option) => {
            const isSelected = selectedOptions.includes(option.id) || selectedOptions.includes(option.value);
            const Icon = projectTypeIcons[option.id] || HelpCircle;
            return (
              <button
                key={option.id}
                onClick={() => onSelect(option.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-fg-primary)]"
                    : "bg-[var(--color-overlay)] border border-transparent text-[var(--color-fg-secondary)] hover:bg-[var(--color-border-primary)] hover:text-[var(--color-fg-primary)]"
                )}
              >
                <span className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                  isSelected
                    ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                    : "bg-[var(--color-bg-surface)] text-[var(--color-fg-tertiary)]/60"
                )}>
                  <Icon size={18} />
                </span>
                <span className="flex-1">{option.label}</span>
                <span className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  isSelected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                    : "border-[var(--color-fg-tertiary)]/30"
                )}>
                  {isSelected && <Check size={10} className="text-[var(--color-accent-foreground)]" />}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2: Existing website with conditional URL */}
      {stepId === 2 && (
        <div className="mt-5 space-y-2">
          {content.options.map((option) => {
            const isSelected = selectedOptions.includes(option.id) || selectedOptions.includes(option.value);
            return (
              <button
                key={option.id}
                onClick={() => onSelect(option.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-fg-primary)]"
                    : "bg-[var(--color-overlay)] border border-transparent text-[var(--color-fg-secondary)] hover:bg-[var(--color-border-primary)] hover:text-[var(--color-fg-primary)]"
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  isSelected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                    : "border-[var(--color-fg-tertiary)]/30"
                )}>
                  {isSelected && <Check size={12} className="text-[var(--color-accent-foreground)]" />}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
          {showExistingUrl && (
            <div className="mt-4 pl-8">
              <label className="block text-xs font-medium text-[var(--color-fg-tertiary)]/70 mb-1.5">
                Current website URL (optional)
              </label>
              <input
                type="url"
                value={existingUrl}
                onChange={(e) => onExistingUrlChange(e.target.value)}
                placeholder="https://example.com"
                className="w-full h-10 px-4 rounded-xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)] text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
              />
            </div>
          )}
        </div>
      )}

      {/* Steps 3-10: Standard option lists */}
      {stepId !== 1 && stepId !== 2 && (
        <div className="mt-5 space-y-2">
          {content.options.map((option) => {
            const isSelected = selectedOptions.includes(option.id) || selectedOptions.includes(option.value);
            return (
              <button
                key={option.id}
                onClick={() => onSelect(option.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-fg-primary)]"
                    : "bg-[var(--color-overlay)] border border-transparent text-[var(--color-fg-secondary)] hover:bg-[var(--color-border-primary)] hover:text-[var(--color-fg-primary)]"
                )}
              >
                <span className={cn(
                  isMultiple ? "w-5 h-5 rounded" : "w-5 h-5 rounded-full",
                  "border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  isSelected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                    : "border-[var(--color-fg-tertiary)]/30"
                )}>
                  {isSelected && <Check size={12} className="text-[var(--color-accent-foreground)]" />}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom input */}
      {content.allowCustomInput && (
        <div className="mt-4">
          <label className="block text-xs font-medium text-[var(--color-fg-tertiary)]/70 mb-1.5">
            {content.customInputLabel}
          </label>
          <input
            type="text"
            placeholder={content.customInputPlaceholder}
            className="w-full h-10 px-4 rounded-xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)] text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
          />
        </div>
      )}

      {/* Step 5: Color picker + website examples */}
      {stepId === 5 && (
        <div className="mt-6 space-y-5">
          {/* Colors */}
          <div>
            <p className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 mb-3">
              What colors would you like on your website?
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={cn(
                    "w-8 h-8 rounded-lg border-2 transition-all cursor-pointer",
                    colorValue === color
                      ? "border-[var(--color-accent)] scale-110"
                      : "border-transparent hover:scale-110"
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
              <label className={cn(
                "w-8 h-8 rounded-lg border-2 border-dashed border-[var(--color-border-primary)] flex items-center justify-center cursor-pointer hover:border-[var(--color-fg-tertiary)]/30 transition-all",
                !colorPresets.includes(colorValue) && "border-[var(--color-accent)] scale-110"
              )}>
                <input
                  type="color"
                  value={colorValue}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-0 h-0 opacity-0 absolute"
                  aria-label="Pick a color"
                />
                <Palette size={14} className="text-[var(--color-fg-tertiary)]/50" />
              </label>
            </div>
          </div>

          {/* Example websites */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-fg-tertiary)]/70 mb-1.5">
              Provide example websites you like (optional)
            </label>
            <input
              type="text"
              value={exampleUrls}
              onChange={(e) => onExampleUrlsChange(e.target.value)}
              placeholder="https://example.com, https://another-example.com"
              className="w-full h-10 px-4 rounded-xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)] text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------- Contact Step ------- */

function ContactStep({
  content,
  contactInfo,
  contactErrors,
  submitError,
  onContactChange,
  answers,
  stepStates,
  onEditStep,
}: {
  content: typeof quizContent;
  contactInfo: Record<string, string>;
  contactErrors: Record<string, string>;
  submitError: string | null;
  onContactChange: (field: string, value: string) => void;
  answers: QuizAnswers;
  stepStates: number[];
  onEditStep: (step: number) => void;
}) {
  const CONTACT_OPTIONS = ["Phone", "Email", "Facebook", "Instagram", "WhatsApp"];

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-fg-primary)] mb-4">
          {content.summary.title}
        </h3>
        <div className="space-y-3 rounded-xl bg-[var(--color-overlay)] p-4 md:p-6">
          {stepStates.map((step) => {
            const answer = answers[step];
            if (!answer) return null;
            const display = typeof answer === "object" && !Array.isArray(answer)
              ? (answer as { value: string | string[] }).value
              : answer;
            const stepContent = content.steps[step];
            return (
              <div key={step} className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--color-fg-tertiary)]/60 uppercase tracking-wider">
                    {content.controls.step} {step}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-fg-primary)] font-medium">
                    {Array.isArray(display)
                      ? display.map((id: string) => {
                          const opt = stepContent?.options.find((o) => o.id === id || o.value === id);
                          return opt?.label || id;
                        }).join(", ")
                      : (() => {
                          const opt = stepContent?.options.find((o) => o.id === display || o.value === display);
                          return opt?.label || display;
                        })()}
                  </p>
                </div>
                <button
                  onClick={() => onEditStep(step - 1)}
                  className="flex-shrink-0 text-xs text-[var(--color-fg-tertiary)]/50 hover:text-[var(--color-fg-secondary)] transition-colors cursor-pointer"
                >
                  {content.summary.edit}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            id="contact-name"
            label="Full Name *"
            value={contactInfo.name || ""}
            onChange={(v) => onContactChange("name", v)}
            error={contactErrors.name}
            placeholder="Your name"
          />
          <InputField
            id="contact-company"
            label="Company Name"
            value={contactInfo.company || ""}
            onChange={(v) => onContactChange("company", v)}
            placeholder="Company name"
          />
          <InputField
            id="contact-phone"
            label="Phone Number"
            value={contactInfo.phone || ""}
            onChange={(v) => onContactChange("phone", v)}
            type="tel"
            placeholder="+1 (555) 000-0000"
          />
          <InputField
            id="contact-email"
            label="Email *"
            value={contactInfo.email || ""}
            onChange={(v) => onContactChange("email", v)}
            error={contactErrors.email}
            type="email"
            placeholder="your@email.com"
          />
        </div>

        <SelectField
          id="contact-preferred"
          label="Preferred Contact Method"
          value={contactInfo.preferredContact || ""}
          onChange={(v) => onContactChange("preferredContact", v)}
          options={CONTACT_OPTIONS}
          placeholder="Select"
        />

        <TextareaField
          id="contact-additional"
          label="Additional Information"
          value={contactInfo.additionalInfo || ""}
          onChange={(v) => onContactChange("additionalInfo", v)}
          placeholder="Any additional information..."
        />

        {submitError && (
          <p className="text-sm text-red-500">{submitError}</p>
        )}
      </div>
    </div>
  );
}

/* ------- Form Fields ------- */

function InputField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-[var(--color-fg-tertiary)]/70">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full h-10 px-4 rounded-xl bg-[var(--color-overlay)] border text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none transition-all",
          error ? "border-red-500/50" : "border-[var(--color-border-primary)] focus:border-[var(--color-fg-tertiary)]/30"
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-[var(--color-fg-tertiary)]/70">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-4 rounded-xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)] text-sm text-[var(--color-fg-tertiary)]/80 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all appearance-none"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-[var(--color-fg-tertiary)]/70">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-3 rounded-xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)] text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all resize-none"
      />
    </div>
  );
}
