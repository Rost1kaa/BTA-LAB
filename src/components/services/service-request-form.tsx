"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/use-dictionary";
import { cn } from "@/lib/utils";
import { serviceQuestionsMap, type QuestionField } from "@/data/service-questions";
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Send,
  CheckCircle2,
} from "lucide-react";

// ── Field options ──

const businessTypes = ["restaurant", "store", "service", "education", "technology", "personal", "other"] as const;
const deadlines = ["asap", "1-2weeks", "1month", "specific"] as const;

const customBudgetOptions = [
  { value: "1000-3000", labelKey: "serviceRequest.general.budget.custom_1000_3000" },
  { value: "3000-7000", labelKey: "serviceRequest.general.budget.custom_3000_7000" },
  { value: "7000+", labelKey: "serviceRequest.general.budget.custom_7000plus" },
  { value: "unsure", labelKey: "serviceRequest.general.budget.custom_unsure" },
] as const;

interface GeneralFormData {
  clientName: string;
  email: string;
  phone: string;
  businessType: string;
  businessDescription: string;
  hasWebsite: "yes" | "no";
  websiteUrl: string;
  deadline: string;
  budget: string;
}

interface ServiceRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  servicePrice?: string;
  isCustomPrice?: boolean;
}

// ── Step keys (display names come from translations) ──

const ALL_STEP_KEYS = ["general", "questions", "additional", "review"] as const;

export function ServiceRequestForm({ isOpen, onClose, serviceId, serviceName, servicePrice = "", isCustomPrice = false }: ServiceRequestFormProps) {
  const { t, locale } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [serviceAnswers, setServiceAnswers] = useState<Record<string, string | string[]>>({});
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const serviceQuestions = serviceQuestionsMap[serviceId]?.questions || [];

  // ── Dynamic visible steps ──
  // If the service has no additional questions, skip the questions step entirely.
  const hasQuestions = serviceQuestions.length > 0;
  const visibleStepKeys = useMemo(() => {
    if (hasQuestions) return ALL_STEP_KEYS; // ["general", "questions", "additional", "review"]
    return ["general", "additional", "review"] as const;
  }, [hasQuestions]);
  const totalSteps = visibleStepKeys.length;

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
    reset,
  } = useForm<GeneralFormData>({
    defaultValues: {
      clientName: "",
      email: "",
      phone: "",
      businessType: "",
      businessDescription: "",
      hasWebsite: "no",
      websiteUrl: "",
      deadline: "asap",
      budget: "",
    },
  });

  const hasWebsite = watch("hasWebsite");
  const deadline = watch("deadline");
  const [specificDate, setSpecificDate] = useState("");

  // ── Pre-fill budget from service price on mount ──

  useEffect(() => {
    if (isOpen && !isCustomPrice && servicePrice) {
      setValue("budget", servicePrice);
    }
  }, [isOpen, isCustomPrice, servicePrice, setValue]);

  // ── Focus management ──

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => modalRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Handle service-specific answer changes ──

  const handleServiceAnswer = (questionId: string, value: string | string[]) => {
    setServiceAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxGroup = (questionId: string, optionValue: string, checked: boolean) => {
    setServiceAnswers((prev) => {
      const current = (Array.isArray(prev[questionId]) ? prev[questionId] : []) as string[];
      const updated = checked
        ? [...current, optionValue]
        : current.filter((v) => v !== optionValue);
      return { ...prev, [questionId]: updated };
    });
  };

  // ── Navigation ──

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const handleClose = useCallback(() => {
    if (currentStep > 0 && !isSubmitted) {
      setShowConfirmClose(true);
    } else {
      onClose();
      resetForm();
    }
  }, [currentStep, isSubmitted, onClose]);

  const resetForm = () => {
    setCurrentStep(0);
    setAdditionalInfo("");
    setServiceAnswers({});
    setIsSubmitted(false);
    setSubmitError(null);
    setSpecificDate("");
    reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (isSubmitted) return;
      if (currentStep > 0) setShowConfirmClose(true);
      else onClose();
    }
  };

  // ── Navigation helpers ──

  const onGeneralSubmit = (data: GeneralFormData) => {
    goToStep(1);
  };

  const handleQuestionsSubmit = () => {
    goToStep(hasQuestions ? 2 : 1);
  };

  const handleAdditionalSubmit = () => {
    goToStep(hasQuestions ? 3 : 2);
  };

  // ── Final Submit ──

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const data = getValues();
      const payload = {
        serviceId,
        serviceName,
        locale,
        clientName: data.clientName,
        email: data.email,
        phone: data.phone,
        businessType: data.businessType,
        businessDescription: data.businessDescription,
        hasExistingWebsite: data.hasWebsite === "yes",
        websiteUrl: data.hasWebsite === "yes" ? data.websiteUrl || "" : "",
        deadline: deadline === "specific" ? specificDate : data.deadline,
        budget: data.budget,
        additionalInfo,
        answers: serviceAnswers,
      };

      const res = await fetch("/api/service-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || t("serviceRequest.validation.submitError"));
      }

      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("serviceRequest.validation.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render helpers ──

  const renderServiceQuestion = (q: QuestionField) => {
    const currentValue = serviceAnswers[q.id];
    const isArray = q.multiple || q.type === "checkbox";

    // Check if conditional question should be shown
    if (q.condition) {
      const parentValue = serviceAnswers[q.condition.field];
      if (Array.isArray(parentValue)) {
        if (!parentValue.includes(q.condition.value)) return null;
      } else if (parentValue !== q.condition.value) {
        return null;
      }
    }

    switch (q.type) {
      case "textarea":
        return (
          <div key={q.id} className="space-y-2">
            <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
              {q.label}
            </label>
            <textarea
              value={typeof currentValue === "string" ? currentValue : ""}
              onChange={(e) => handleServiceAnswer(q.id, e.target.value)}
              placeholder={q.placeholder}
              rows={4}
              className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all resize-none"
            />
          </div>
        );

      case "select":
        return (
          <div key={q.id} className="space-y-2">
            <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
              {q.label}
            </label>
            <select
              value={typeof currentValue === "string" ? currentValue : ""}
              onChange={(e) => handleServiceAnswer(q.id, e.target.value)}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all appearance-none"
            >
              <option value="">{t("serviceRequest.selectService")}</option>
              {q.options?.map((opt) => (
                <option key={opt.id} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        );

      case "radio":
        return (
          <div key={q.id} className="space-y-3">
            <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
              {q.label}
            </label>
            <div className="flex flex-wrap gap-3">
              {q.options?.map((opt) => {
                const isSelected = currentValue === opt.value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleServiceAnswer(q.id, opt.value)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer",
                      isSelected
                        ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] border-[var(--color-accent)]"
                        : "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)] border-[var(--color-border-primary)] hover:border-[var(--color-fg-tertiary)]/30"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "checkbox":
      case "input":
      case "url":
      case "text":
        if (q.multiple || q.type === "checkbox") {
          return (
            <div key={q.id} className="space-y-3">
              <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                {q.label}
              </label>
              <div className="flex flex-wrap gap-2">
                {q.options?.map((opt) => {
                  const currentArr = Array.isArray(currentValue) ? currentValue : [];
                  const isSelected = currentArr.includes(opt.value);
                  return (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border cursor-pointer transition-all select-none",
                        isSelected
                          ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] border-[var(--color-accent)]"
                          : "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)] border-[var(--color-border-primary)] hover:border-[var(--color-fg-tertiary)]/30"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleCheckboxGroup(q.id, opt.value, e.target.checked)}
                        className="sr-only"
                      />
                      {isSelected && <Check size={14} className="shrink-0" />}
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        }

        return (
          <div key={q.id} className="space-y-2">
            <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
              {q.label}
            </label>
            <input
              type={q.type === "url" ? "url" : "text"}
              value={typeof currentValue === "string" ? currentValue : ""}
              onChange={(e) => handleServiceAnswer(q.id, e.target.value)}
              placeholder={q.placeholder}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
            />
          </div>
        );

      default:
        return null;
    }
  };

  // ── Label helpers ──

  const getBusinessTypeLabel = (value: string) => {
    const key = `serviceRequest.general.businessType.${value}`;
    const translated = t(key);
    return translated !== key ? translated : value;
  };

  const getDeadlineLabel = (value: string) => {
    const key = `serviceRequest.general.deadline.${value}`;
    const translated = t(key);
    return translated !== key ? translated : value;
  };

  const getBudgetLabel = (value: string) => {
    if (!value) return "-";
    // Show the raw price string for fixed-price services
    if (!isCustomPrice) return value;
    // Custom budget - look up translation
    const opt = customBudgetOptions.find((o) => o.value === value);
    return opt ? t(opt.labelKey) : value;
  };

  const getAnswerDisplay = (questionId: string, value: string | string[] | undefined): string => {
    if (!value) return "-";
    const question = serviceQuestions.find((q) => q.id === questionId);
    if (!question) return Array.isArray(value) ? value.join(", ") : String(value);

    if (Array.isArray(value)) {
      return value
        .map((v) => {
          const opt = question.options?.find((o) => o.value === v);
          return opt?.label || v;
        })
        .join(", ");
    }

    const opt = question.options?.find((o) => o.value === value);
    return opt?.label || value;
  };

  // ── Step title ──

  const getStepTitle = (index: number) => {
    const key = visibleStepKeys[index];
    return t(`serviceRequest.step.${key}`);
  };

  // ── Which step index are we in for render? ──

  const renderGeneral = () => (
    <form onSubmit={handleSubmit(onGeneralSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
            {t("serviceRequest.general.clientName")}
          </label>
          <input
            {...register("clientName", { required: t("serviceRequest.validation.nameRequired") })}
            placeholder={t("serviceRequest.general.clientNamePlaceholder")}
            className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
          />
          {errors.clientName && (
            <p className="text-xs text-red-500">{errors.clientName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
            {t("serviceRequest.general.email")}
          </label>
          <input
            {...register("email", { required: t("serviceRequest.validation.emailRequired"), pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t("serviceRequest.validation.emailInvalid") } })}
            type="email"
            placeholder={t("serviceRequest.general.emailPlaceholder")}
            className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
            {t("serviceRequest.general.phone")}
          </label>
          <input
            {...register("phone", { required: t("serviceRequest.validation.phoneRequired") })}
            type="tel"
            placeholder={t("serviceRequest.general.phonePlaceholder")}
            className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
            {t("serviceRequest.general.businessType")}
          </label>
          <select
            {...register("businessType", { required: t("serviceRequest.validation.businessTypeRequired") })}
            className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all appearance-none"
          >
            <option value="">{t("serviceRequest.general.businessTypePlaceholder")}</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>{t(`serviceRequest.general.businessType.${type}`)}</option>
            ))}
          </select>
          {errors.businessType && (
            <p className="text-xs text-red-500">{errors.businessType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
            {t("serviceRequest.general.deadline")}
          </label>
          <select
            {...register("deadline")}
            className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all appearance-none"
          >
            {deadlines.map((d) => (
              <option key={d} value={d}>{t(`serviceRequest.general.deadline.${d}`)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
          {t("serviceRequest.general.businessDescription")}
        </label>
        <textarea
          {...register("businessDescription", { required: t("serviceRequest.validation.businessDescriptionRequired") })}
          placeholder={t("serviceRequest.general.businessDescriptionPlaceholder")}
          rows={3}
          className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all resize-none"
        />                        {errors.businessDescription && (
          <p className="text-xs text-red-500">{errors.businessDescription.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
          {t("serviceRequest.general.hasWebsite")}
        </label>
        <div className="flex gap-3">
          {["yes", "no"].map((opt) => (
            <label
              key={opt}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border cursor-pointer transition-all",
                hasWebsite === opt
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] border-[var(--color-accent)]"
                  : "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)] border-[var(--color-border-primary)]"
              )}
            >
              <input
                type="radio"
                value={opt}
                {...register("hasWebsite")}
                className="sr-only"
              />
              {hasWebsite === opt && <Check size={14} />}
              {t(`serviceRequest.general.hasWebsite.${opt}`)}
            </label>
          ))}
        </div>
      </div>

      {hasWebsite === "yes" && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
            {t("serviceRequest.general.websiteUrl")}
          </label>
          <input
            {...register("websiteUrl")}
            type="url"
            placeholder={t("serviceRequest.general.websiteUrlPlaceholder")}
            className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
          />
        </div>
      )}

      {deadline === "specific" && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
            {t("serviceRequest.general.deadline.specific")}
          </label>
          <input
            type="date"
            value={specificDate}
            onChange={(e) => setSpecificDate(e.target.value)}
            className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
          />
        </div>
      )}

      {/* Budget: Read-only for fixed-price services, selectable for custom */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
          {t("serviceRequest.general.budget")}
        </label>
        {isCustomPrice ? (
          <select
            {...register("budget", { required: t("serviceRequest.validation.businessTypeRequired") })}
            className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all appearance-none"
          >
            <option value="">{t("serviceRequest.general.budgetPlaceholder")}</option>
            {customBudgetOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
            ))}
          </select>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={servicePrice}
              readOnly
              disabled
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] opacity-70 cursor-not-allowed"
            />
            <p className="mt-1 text-[10px] text-[var(--color-fg-tertiary)]/60">
              {t("serviceRequest.general.budgetFixed")}
            </p>
          </div>
        )}
      </div>
    </form>
  );

  const renderQuestions = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-fg-primary)]">
          {serviceName}
        </h3>
        <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">
          {t("serviceRequest.step.questions")}
        </p>
      </div>
      <div className="space-y-5">
        {serviceQuestions.map(renderServiceQuestion)}
      </div>
    </div>
  );

  const renderAdditional = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-fg-primary)]">
          {t("serviceRequest.additional.info")}
        </h3>
        <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">
          {t("serviceRequest.subtitle")}
        </p>
      </div>
      <textarea
        value={additionalInfo}
        onChange={(e) => setAdditionalInfo(e.target.value)}
        placeholder={t("serviceRequest.additional.infoPlaceholder")}
        rows={6}
        className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all resize-none"
      />
    </div>
  );

  const renderReview = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-fg-primary)]">
          {t("serviceRequest.step.review")}
        </h3>
      </div>

      {submitError && (
        <p className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
          {submitError}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReviewField label={t("serviceRequest.review.service")} value={serviceName} />
        <ReviewField label={t("serviceRequest.review.client")} value={getValues("clientName")} />
        <ReviewField label={t("serviceRequest.review.contact")} value={`${getValues("email")} · ${getValues("phone")}`} />
        <ReviewField
          label={t("serviceRequest.review.business")}
          value={getBusinessTypeLabel(getValues("businessType"))}
        />
        <ReviewField
          label={t("serviceRequest.review.deadline")}
          value={getDeadlineLabel(getValues("deadline"))}
        />
        <ReviewField
          label={t("serviceRequest.review.budgetValue")}
          value={getBudgetLabel(getValues("budget"))}
        />
      </div>

      <div>
        <p className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider mb-2">
          {t("serviceRequest.review.website")}
        </p>
        <p className="text-sm text-[var(--color-fg-primary)]">
          {getValues("hasWebsite") === "yes"
            ? getValues("websiteUrl") || "Yes"
            : t("serviceRequest.general.hasWebsite.no")}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider mb-2">
          {t("serviceRequest.review.business")}
        </p>
        <p className="text-sm text-[var(--color-fg-tertiary)] leading-relaxed">
          {getValues("businessDescription")}
        </p>
      </div>

      {Object.keys(serviceAnswers).length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider mb-3">
            {t("serviceRequest.review.answers")}
          </p>
          <div className="space-y-2">
            {serviceQuestions.map((q) => {
              const val = serviceAnswers[q.id];
              if (!val || (Array.isArray(val) && val.length === 0)) return null;
              return (
                <div key={q.id} className="rounded-xl bg-[var(--color-overlay)] p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-fg-tertiary)]/60">
                    {q.label}
                  </p>
                  <p className="text-sm text-[var(--color-fg-primary)] mt-1">
                    {getAnswerDisplay(q.id, val)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {additionalInfo && (
        <div>
          <p className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider mb-2">
            {t("serviceRequest.review.additional")}
          </p>
          <p className="text-sm text-[var(--color-fg-tertiary)]">{additionalInfo}</p>
        </div>
      )}

      <div className="pt-4 border-t border-[var(--color-border-primary)]">
        <p className="text-xs text-[var(--color-fg-tertiary)]/70">
          {t("serviceRequest.legal")}
        </p>
      </div>
    </div>
  );

  // Determine which content to render based on current step
  const renderStepContent = () => {
    if (!hasQuestions) {
      // Steps: [general=0, additional=1, review=2]
      switch (currentStep) {
        case 0: return renderGeneral();
        case 1: return renderAdditional();
        case 2: return renderReview();
        default: return null;
      }
    }
    // Steps: [general=0, questions=1, additional=2, review=3]
    switch (currentStep) {
      case 0: return renderGeneral();
      case 1: return renderQuestions();
      case 2: return renderAdditional();
      case 3: return renderReview();
      default: return null;
    }
  };

  const showQuestionsSubmit = hasQuestions && currentStep === 1;
  const showAdditionalSubmit = hasQuestions ? currentStep === 2 : currentStep === 1;
  const showReviewSubmit = hasQuestions ? currentStep === 3 : currentStep === 2;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
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
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-2xl mx-4 my-8 md:my-12 outline-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] w-full"
        >
          {!isSubmitted ? (
            <>
              {/* Header — sticky top */}
              <div className="flex-shrink-0 px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-[var(--color-border-primary)]">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-[var(--color-fg-primary)]">
                      {t("serviceRequest.title")}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-fg-tertiary)] line-clamp-1">
                      {serviceName}{servicePrice ? ` · ${servicePrice}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-fg-tertiary)]/50 hover:text-[var(--color-fg-secondary)] hover:bg-[var(--color-overlay)] transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--color-border-primary)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-[var(--color-accent)]"
                        initial={false}
                        animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      />
                    </div>
                    <span className="text-xs font-medium text-[var(--color-fg-tertiary)] whitespace-nowrap">
                      {t("serviceRequest.step_of")
                        .replace("%current%", String(currentStep + 1))
                        .replace("%total%", String(totalSteps))}
                    </span>
                  </div>
                  {/* Step indicators */}
                  <div className="flex items-center gap-2 mt-3">
                    {visibleStepKeys.map((key, i) => (
                      <div key={key} className="flex items-center gap-1">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors duration-300",
                            i <= currentStep
                              ? "bg-[var(--color-accent)]"
                              : "bg-[var(--color-border-primary)]"
                          )}
                        />
                        <span
                          className={cn(
                            "text-[10px] font-medium hidden sm:inline",
                            i <= currentStep
                              ? "text-[var(--color-fg-secondary)]"
                              : "text-[var(--color-fg-tertiary)]/50"
                          )}
                        >
                          {getStepTitle(i)}
                        </span>
                        {i < totalSteps - 1 && (
                          <ChevronRight size={10} className="text-[var(--color-fg-tertiary)]/30 mx-0.5" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Body — scrollable middle */}
              <div className="flex-1 overflow-y-auto min-h-0 scroll-smooth">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 md:px-8 py-6"
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer / Navigation — sticky bottom */}
              <div className="flex-shrink-0 px-6 md:px-8 py-4 border-t border-[var(--color-border-primary)] flex items-center justify-between">
                <button
                  onClick={() => currentStep === 0 ? handleClose() : goToStep(currentStep - 1)}
                  className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  {t("serviceRequest.back")}
                </button>

                <div className="flex items-center gap-3">
                  {currentStep === 0 && (
                    <button
                      type="button"
                      onClick={handleSubmit(onGeneralSubmit) as unknown as React.MouseEventHandler}
                      className="inline-flex items-center gap-2 px-6 h-11 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] rounded-xl text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {t("serviceRequest.continue")}
                      <ChevronRight size={16} />
                    </button>
                  )}
                  {showQuestionsSubmit && (
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="inline-flex items-center gap-2 px-6 h-11 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] rounded-xl text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {t("serviceRequest.continue")}
                      <ChevronRight size={16} />
                    </button>
                  )}
                  {showAdditionalSubmit && (
                    <button
                      type="button"
                      onClick={handleAdditionalSubmit}
                      className="inline-flex items-center gap-2 px-6 h-11 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] rounded-xl text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {t("serviceRequest.step.review")}
                      <ChevronRight size={16} />
                    </button>
                  )}
                  {showReviewSubmit && (
                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 h-11 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] rounded-xl text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {t("serviceRequest.submitting")}
                        </>
                      ) : (
                        <>
                          {t("serviceRequest.submit")}
                          <Send size={16} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Success Screen — centered in flex */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex items-center justify-center px-6 md:px-8 py-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-fg-primary)]">
                {t("serviceRequest.success.title")}
              </h2>
              <p className="mt-3 text-sm text-[var(--color-fg-tertiary)] max-w-md mx-auto leading-relaxed">
                {t("serviceRequest.success.message")}
              </p>
              <button
                onClick={onClose}
                className="mt-8 inline-flex items-center gap-2 px-6 h-11 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] rounded-xl text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                {t("serviceRequest.success.back")}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Confirm Close Modal */}
      {showConfirmClose && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-6 max-w-sm mx-4 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-[var(--color-fg-primary)]">
              {t("serviceRequest.confirmClose.title")}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-fg-tertiary)]">
              {t("serviceRequest.confirmClose.message")}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="px-4 h-10 rounded-xl text-sm font-medium text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] border border-[var(--color-border-primary)] hover:bg-[var(--color-overlay)] transition-all cursor-pointer"
              >
                {t("serviceRequest.confirmClose.continue")}
              </button>
              <button
                onClick={() => { setShowConfirmClose(false); onClose(); resetForm(); }}
                className="px-4 h-10 rounded-xl text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                {t("serviceRequest.confirmClose.leave")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ── Review Field Component ──

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--color-overlay)] p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-fg-tertiary)]/60">
        {label}
      </p>
      <p className="text-sm text-[var(--color-fg-primary)] mt-1 truncate">
        {value || "-"}
      </p>
    </div>
  );
}
