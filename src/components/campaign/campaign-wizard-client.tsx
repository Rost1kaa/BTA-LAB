"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, Clock, Send,
  Shield, AlertTriangle, Info, X, Zap, FileText, Users, Briefcase,
  Globe, Lightbulb, Target, Heart, Share2, CheckSquare,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { useTranslation } from "@/lib/use-dictionary";
import { submitCampaignApplication } from "@/lib/actions/campaign";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface WizardFormData {
  // Stage 1: Personal Info
  firstName: string;
  lastName: string;
  personalId: string;
  phone: string;
  email: string;
  city: string;
  communicationChannel: string;
  ageConfirmed: boolean;
  responsiblePerson: string;

  // Stage 2: Legal Status
  legalStatus: string;
  businessName: string;
  identificationNumber: string;
  registrationDate: string;
  activityField: string;
  businessAddress: string;
  existingWebsite: string;
  socialFacebook: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialOther: string;
  legalStatusConfirmed: boolean;

  // Stage 3: Business Description
  shortSummary: string;
  fullDescription: string;
  productService: string;
  targetCustomer: string;
  yearsOperating: string;
  currentAcquisition: string;
  hasSales: string;
  teamSize: string;
  createsJobs: string;
  region: string;

  // Stage 4: Website Need
  whyNeed: string;
  problemSolved: string;
  goalAchieve: string;
  userUsage: string;
  userAction: string;
  expected6Months: string;
  goalsMulti: string[];

  // Stage 5: Project Type
  projectType: string;
  desiredFeatures: string[];

  // Stage 6: Development Potential (8 criteria)
  developmentPlan: string;
  developmentPlanRadio: string;
  websiteHelps: string;
  websiteHelpsRadio: string;
  jobCreationPotential: string;
  jobCreationPotentialRadio: string;
  usesLocalResources: string;
  usesLocalResourcesRadio: string;
  showcasesCulture: string;
  showcasesCultureRadio: string;
  supportsRegion: string;
  supportsRegionRadio: string;
  internationalPotential: string;
  internationalPotentialRadio: string;
  socialEconomicBenefit: string;
  socialEconomicBenefitRadio: string;

  // Stage 7: Materials & Cooperation
  readyMaterials: string[];
  materialDeliveryTime: string;
  feedbackTime: string;
  coopInterview: boolean;
  coopAssignPerson: boolean;
  coopTimelyInfo: boolean;
  coopDelayAgree: boolean;
  coopStopAgree: boolean;

  // Stage 8: Public Consent
  consentPortfolio: boolean;
  consentScreenshots: boolean;
  consentProcess: boolean;
  consentPresentation: boolean;
  consentFeedback: boolean;
  consentEvaluation: boolean;
  consentVideo: boolean;
  consentPhoto: boolean;

  // Stage 9: Declarations
  declInfoCorrect: boolean;
  declLegalActivity: boolean;
  declReadRules: boolean;
  declNotGuarantee: boolean;
  declDataProcessing: boolean;
  declAdditionalInfo: boolean;
  declMayNotSelect: boolean;
  declInterviewParticipate: boolean;
}

const DEFAULT_FORM_DATA: WizardFormData = {
  firstName: "", lastName: "", personalId: "", phone: "", email: "",
  city: "", communicationChannel: "ელფოსტა", ageConfirmed: false, responsiblePerson: "",
  legalStatus: "", businessName: "", identificationNumber: "", registrationDate: "",
  activityField: "", businessAddress: "", existingWebsite: "", socialFacebook: "",
  socialInstagram: "", socialLinkedin: "", socialOther: "", legalStatusConfirmed: false,
  shortSummary: "", fullDescription: "", productService: "", targetCustomer: "",
  yearsOperating: "", currentAcquisition: "", hasSales: "", teamSize: "",
  createsJobs: "", region: "",
  whyNeed: "", problemSolved: "", goalAchieve: "", userUsage: "", userAction: "",
  expected6Months: "", goalsMulti: [],
  projectType: "", desiredFeatures: [],
  developmentPlan: "", developmentPlanRadio: "", websiteHelps: "", websiteHelpsRadio: "",
  jobCreationPotential: "", jobCreationPotentialRadio: "", usesLocalResources: "", usesLocalResourcesRadio: "",
  showcasesCulture: "", showcasesCultureRadio: "", supportsRegion: "", supportsRegionRadio: "",
  internationalPotential: "", internationalPotentialRadio: "", socialEconomicBenefit: "", socialEconomicBenefitRadio: "",
  readyMaterials: [], materialDeliveryTime: "", feedbackTime: "",
  coopInterview: false, coopAssignPerson: false, coopTimelyInfo: false,
  coopDelayAgree: false, coopStopAgree: false,
  consentPortfolio: false, consentScreenshots: false, consentProcess: false,
  consentPresentation: false, consentFeedback: false, consentEvaluation: false,
  consentVideo: false, consentPhoto: false,
  declInfoCorrect: false, declLegalActivity: false, declReadRules: false,
  declNotGuarantee: false, declDataProcessing: false, declAdditionalInfo: false,
  declMayNotSelect: false, declInterviewParticipate: false,
};

const STAGES = [
  { key: "personal", title_ka: "განმცხადებლის ინფორმაცია", title_en: "Applicant Information", icon: Users },
  { key: "legal", title_ka: "ბიზნესის სამართლებრივი სტატუსი", title_en: "Legal Status", icon: Briefcase },
  { key: "business", title_ka: "ბიზნესის ან პროექტის აღწერა", title_en: "Business/Project Description", icon: FileText },
  { key: "website", title_ka: "ვებგვერდის საჭიროება", title_en: "Website Need", icon: Globe },
  { key: "project", title_ka: "სასურველი პროექტის ტიპი", title_en: "Project Type", icon: Target },
  { key: "development", title_ka: "განვითარების პოტენციალი", title_en: "Development Potential", icon: Lightbulb },
  { key: "materials", title_ka: "მასალები და თანამშრომლობა", title_en: "Materials & Cooperation", icon: Heart },
  { key: "consent", title_ka: "საჯარო კომუნიკაციის თანხმობა", title_en: "Public Communication Consent", icon: Share2 },
  { key: "declarations", title_ka: "დეკლარაციები და გაგზავნა", title_en: "Declarations & Submit", icon: CheckSquare },
];

const COMMUNICATION_CHANNELS = ["ელფოსტა", "ტელეფონი", "WhatsApp"];
const LEGAL_STATUSES = [
  "ინდივიდუალური მეწარმე",
  "შპს (შეზღუდული პასუხისმგებლობის საზოგადოება)",
  "სს (სააქციო საზოგადოება)",
  "კოოპერატივი",
  "ა(ა)იპ (არასამეწარმეო (არაკომერციული) იურიდიული პირი)",
  "სხვა იურიდიული პირი",
  "ჯერ არ ვარ რეგისტრირებული",
];
const PROJECT_TYPES = [
  "ერთგვერდიანი საიტი", "ბიზნესვებგვერდი", "პროდუქტის კატალოგი",
  "მომსახურების კატალოგი", "ონლაინ მაღაზია", "დაჯავშნის სისტემა",
  "განაცხადის ფორმა", "არსებული საიტის განახლება",
  "ზუსტად არ ვიცი და მჭირდება კონსულტაცია",
];
const FEATURES_LIST = [
  "ქართული ენა", "ინგლისური ენა", "სხვა ენა", "ადმინისტრირების პანელი",
  "პროდუქტის მართვა", "შეკვეთების მიღება", "ონლაინ გადახდა", "რუკა",
  "WhatsApp/Messenger", "ელფოსტის შეტყობინებები", "მომხმარებლის რეგისტრაცია",
  "ბლოგი", "ფოტოგალერეა", "ვიდეო", "სხვა",
];
const MUNICIPALITIES = [
  "თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი", "ფოთი", "გორი", "ზუგდიდი",
  "თელავი", "ახალციხე", "ოზურგეთი", "სენაკი", "ხაშური", "სამტრედია",
  "ჭიათურა", "საჩხერე", "ზესტაფონი", "ტყიბული", "წყალტუბო", "ბორჯომი",
  "მცხეთა", "ყვარელი", "ლაგოდეხი", "საგარეჯო", "დედოფლისწყარო",
  "გურჯაანი", "მარნეული", "ბოლნისი", "დმანისი", "წალკა", "ახალქალაქი",
  "ნინოწმინდა", "ამბროლაური", "ცაგერი", "ონი", "ლენტეხი", "მესტია",
  "ხობი", "აბაშა", "მარტვილი", "ჩხოროწყუ", "წალენჯიხა", "ქობულეთი",
  "ხელვაჩაური", "ქედა", "შუახევი", "ხულო", "ადიგენი", "ასპინძა",
  "თეთრიწყარო", "გარდაბანი", "კასპი", "ქარელი",
];

const READY_MATERIALS = [
  "ლოგო", "ბრენდის ფერები", "კომპანიის აღწერა", "პროდუქტების აღწერები",
  "მომსახურების აღწერები", "ფასები", "ფოტოები", "ვიდეო",
  "იურიდიული ტექსტები", "კონფიდენციალურობის პოლიტიკა", "ჯერ არაფერი მაქვს მზად",
];
const MATERIAL_TIMES = ["დაუყოვნებლივ", "3 სამუშაო დღეში", "7 დღეში", "14 დღეში", "მეტი დრო მჭირდება"];
const FEEDBACK_TIMES = [
  "1 სამუშაო დღეში", "2–3 სამუშაო დღეში", "4–5 სამუშაო დღეში", "წინასწარ ვერ განვსაზღვრავ",
];
const DEVELOPMENT_CRITERIA = [
  { key: "developmentPlan", q_ka: "როგორ გეგმავთ ბიზნესის განვითარებას მომდევნო 6–12 თვეში?" },
  { key: "websiteHelps", q_ka: "როგორ შეუწყობს ხელს ვებგვერდი ამ გეგმას?" },
  { key: "jobCreationPotential", q_ka: "გაქვთ თუ არა ახალი სამუშაო ადგილების შექმნის პოტენციალი?" },
  { key: "usesLocalResources", q_ka: "იყენებთ თუ არა ადგილობრივ ნედლეულს, ცოდნას ან წარმოებას?" },
  { key: "showcasesCulture", q_ka: "წარმოაჩენს თუ არა პროექტი ქართულ კულტურას, ტრადიციებს ან უნიკალურ პროდუქტს?" },
  { key: "supportsRegion", q_ka: "უწყობს თუ არა ხელს რეგიონის განვითარებას?" },
  { key: "internationalPotential", q_ka: "გაქვთ თუ არა საერთაშორისო ბაზარზე გასვლის პოტენციალი?" },
  { key: "socialEconomicBenefit", q_ka: "ქმნის თუ არა საქმიანობა საზოგადოებრივ ან ეკონომიკურ სარგებელს?" },
];

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════

function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const pct = ((currentStep + 1) / totalSteps) * 100;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[var(--color-fg-tertiary)]">
          ეტაპი {currentStep + 1} / {totalSteps}
        </span>
        <span className="text-xs font-medium text-[var(--color-fg-tertiary)]">
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-overlay)] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[var(--color-accent)]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {STAGES.map((stage, i) => (
          <div key={stage.key} className={`w-2 h-2 rounded-full ${
            i <= currentStep ? "bg-[var(--color-accent)]" : "bg-[var(--color-overlay)]"
          }`} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP NAVIGATOR (top bar)
// ═══════════════════════════════════════════════════════════════════════════

function StepNavigator({
  currentStep, locale,
}: {
  currentStep: number; locale: string;
}) {
  const stage = STAGES[currentStep];
  return (
    <div className="sticky top-[64px] md:top-[80px] z-40 bg-[var(--color-bg-primary)]/95 backdrop-blur-xl border-b border-[var(--color-border-primary)]">
      <Container>
        <div className="py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {stage && <stage.icon size={18} className="text-[var(--color-fg-primary)]" />}
              <span className="text-sm font-semibold text-[var(--color-fg-primary)]">
                {locale === "ka" ? stage.title_ka : stage.title_en}
              </span>
            </div>
            <span className="text-xs text-[var(--color-fg-tertiary)] hidden sm:inline">
              {locale === "ka" ? "შევსების სავარაუდო ხანგრძლივობა: 10–15 წუთი" : "Est. completion time: 10–15 min"}
            </span>
          </div>
          <ProgressBar currentStep={currentStep} totalSteps={STAGES.length} />
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs text-amber-600 flex items-center gap-2">
              <Info size={14} className="shrink-0" />
              {locale === "ka"
                ? "განაცხადის გაგზავნა დაფინანსების ავტომატურ მიღებას არ ნიშნავს."
                : "Submitting an application does not guarantee automatic funding."}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FIELD HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function Input({ label, value, onChange, required, type = "text", placeholder, maxLength, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string; placeholder?: string; maxLength?: number; disabled?: boolean;
}) {
  const charCount = value.length;
  const isOverLimit = maxLength !== undefined && charCount > maxLength;
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[var(--color-fg-primary)]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "textarea" ? (
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border bg-[var(--color-bg-surface)] text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]/50 transition-all resize-vertical ${
              isOverLimit ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" : "border-[var(--color-border-primary)]"
            }`}
          />
          {maxLength !== undefined && (
            <div className="flex justify-end mt-1">
              <span className={`text-xs font-medium ${isOverLimit ? "text-red-500" : "text-[var(--color-fg-tertiary)]"}`}>
                {charCount} / {maxLength}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-xl border bg-[var(--color-bg-surface)] text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]/50 transition-all ${
              isOverLimit ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" : "border-[var(--color-border-primary)]"
            }`}
          />
          {maxLength !== undefined && (
            <div className="flex justify-end mt-1">
              <span className={`text-xs font-medium ${isOverLimit ? "text-red-500" : "text-[var(--color-fg-tertiary)]"}`}>
                {charCount} / {maxLength}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[var(--color-fg-primary)]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] text-sm text-[var(--color-fg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]/50 transition-all appearance-none"
      >
        <option value="">{label === "კომუნიკაციის არხი" ? "აირჩიეთ არხი" : "აირჩიეთ"}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function Checkbox({ label, checked, onChange, required, description }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
  required?: boolean; description?: string;
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--color-overlay)]/50 transition-colors cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-[var(--color-border-primary)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]/30"
      />
      <div>
        <span className="text-sm text-[var(--color-fg-primary)] group-hover:text-[var(--color-fg-primary)] transition-colors">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
        {description && (
          <p className="text-xs text-[var(--color-fg-tertiary)] mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

function MultiCheckbox({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[var(--color-fg-primary)]">{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => (
          <label key={opt} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
            selected.includes(opt)
              ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5"
              : "border-[var(--color-border-primary)] hover:bg-[var(--color-overlay)]/50"
          }`}>
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="w-4 h-4 rounded border-[var(--color-border-primary)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]/30"
            />
            <span className="text-sm text-[var(--color-fg-primary)]">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[var(--color-fg-primary)]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              value === opt
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "border-[var(--color-border-primary)] text-[var(--color-fg-secondary)] hover:bg-[var(--color-overlay)]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 1: PERSONAL INFO
// ═══════════════════════════════════════════════════════════════════════════

function Stage1PersonalInfo({ data, onChange, locale }: {
  data: WizardFormData; onChange: (d: Partial<WizardFormData>) => void; locale: string;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--color-fg-primary)]">
        {locale === "ka" ? "განმცხადებლის ინფორმაცია" : "Applicant Information"}
      </h2>
      <p className="text-sm text-[var(--color-fg-tertiary)]">
        {locale === "ka"
          ? "გთხოვთ, შეავსოთ თქვენი ძირითადი საკონტაქტო ინფორმაცია. პირადი მონაცემები დაცულია კონფიდენციალურობის პოლიტიკის შესაბამისად."
          : "Please fill in your basic contact information. Personal data is protected in accordance with our privacy policy."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label={locale === "ka" ? "სახელი" : "First Name"} value={data.firstName} onChange={(v) => onChange({ firstName: v })} required />
        <Input label={locale === "ka" ? "გვარი" : "Last Name"} value={data.lastName} onChange={(v) => onChange({ lastName: v })} required />
      </div>

      <Input label={locale === "ka" ? "პირადი ნომერი (11 ციფრი)" : "Personal ID Number (11 digits)"} value={data.personalId} onChange={(v) => { const digitsOnly = v.replace(/\D/g, ""); onChange({ personalId: digitsOnly }); }} placeholder={locale === "ka" ? "შეიყვანეთ 11 ციფრი" : "Enter 11 digits"} maxLength={11} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label={locale === "ka" ? "ტელეფონის ნომერი" : "Phone Number"} value={data.phone} onChange={(v) => onChange({ phone: v })} type="tel" required />
        <Input label={locale === "ka" ? "ელფოსტა" : "Email"} value={data.email} onChange={(v) => onChange({ email: v })} type="email" required disabled />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label={locale === "ka" ? "ქალაქი/მუნიციპალიტეტი" : "City/Municipality"} value={data.city} onChange={(v) => onChange({ city: v })} options={MUNICIPALITIES} required />
        <Select label={locale === "ka" ? "სასურველი კომუნიკაციის არხი" : "Preferred Communication Channel"} value={data.communicationChannel} onChange={(v) => onChange({ communicationChannel: v })} options={COMMUNICATION_CHANNELS} required />
      </div>

      <Checkbox
        label={locale === "ka" ? "ვადასტურებ, რომ ვარ 18 წლის ან უფროსი" : "I confirm that I am 18 years or older"}
        checked={data.ageConfirmed}
        onChange={(v) => onChange({ ageConfirmed: v })}
        required
      />

      <Input label={locale === "ka" ? "პროექტზე პასუხისმგებელი პირის სახელი - ივსება თუ განმცხადებელი არ არის პროექტის ხელმძღვანელი" : "Responsible Person Name - fill if applicant is not the project lead"} value={data.responsiblePerson} onChange={(v) => onChange({ responsiblePerson: v })} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 2: LEGAL STATUS
// ═══════════════════════════════════════════════════════════════════════════

function Stage2LegalStatus({ data, onChange, locale }: {
  data: WizardFormData; onChange: (d: Partial<WizardFormData>) => void; locale: string;
}) {
  const needsBusinessFields = !["ჯერ არ ვარ რეგისტრირებული", ""].includes(data.legalStatus);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--color-fg-primary)]">
        {locale === "ka" ? "ბიზნესის სამართლებრივი სტატუსი" : "Business Legal Status"}
      </h2>
      <p className="text-sm text-[var(--color-fg-tertiary)]">
        {locale === "ka"
          ? "მიუთითეთ თქვენი ბიზნესის სამართლებრივი ფორმა. თუ ჯერ არ ხართ რეგისტრირებული, მიუთითეთ შესაბამისი ვარიანტი."
          : "Indicate your business legal form. If you are not yet registered, select the appropriate option."}
      </p>

      <Select
        label={locale === "ka" ? "რა სტატუსით მონაწილეობთ?" : "What is your participation status?"}
        value={data.legalStatus}
        onChange={(v) => onChange({ legalStatus: v })}
        options={LEGAL_STATUSES}
        required
      />

      {needsBusinessFields && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 overflow-hidden">
          <div className="p-4 rounded-xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)] space-y-4">
            <Input label={locale === "ka" ? "ბიზნესის დასახელება" : "Business Name"} value={data.businessName} onChange={(v) => onChange({ businessName: v })} />
            <Input label={locale === "ka" ? "საიდენტიფიკაციო ნომერი" : "Identification Number"} value={data.identificationNumber} onChange={(v) => onChange({ identificationNumber: v })} />
            <Input label={locale === "ka" ? "რეგისტრაციის თარიღი" : "Registration Date"} value={data.registrationDate} onChange={(v) => onChange({ registrationDate: v })} type="date" />
            <Input label={locale === "ka" ? "საქმიანობის სფერო" : "Field of Activity"} value={data.activityField} onChange={(v) => onChange({ activityField: v })} />
            <Input label={locale === "ka" ? "ბიზნესის მისამართი" : "Business Address"} value={data.businessAddress} onChange={(v) => onChange({ businessAddress: v })} />
            <Input label={locale === "ka" ? "ვებგვერდი (თუ უკვე არსებობს)" : "Website (if exists)"} value={data.existingWebsite} onChange={(v) => onChange({ existingWebsite: v })} type="url" placeholder="https://" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Facebook" value={data.socialFacebook} onChange={(v) => onChange({ socialFacebook: v })} />
              <Input label="Instagram" value={data.socialInstagram} onChange={(v) => onChange({ socialInstagram: v })} />
              <Input label="LinkedIn" value={data.socialLinkedin} onChange={(v) => onChange({ socialLinkedin: v })} />
              <Input label={locale === "ka" ? "სხვა სოციალური არხი" : "Other Social Channel"} value={data.socialOther} onChange={(v) => onChange({ socialOther: v })} />
            </div>
          </div>
        </motion.div>
      )}

      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <Checkbox
          label={locale === "ka"
            ? "ვადასტურებ, რომ ინფორმირებული ვარ: პროექტის დაწყებამდე შესაძლოა აუცილებელი გახდეს რეგისტრირებული სამეწარმეო სტატუსის წარმოდგენა."
            : "I confirm that I am informed: before starting the project, it may be necessary to present a registered business status."}
          checked={data.legalStatusConfirmed}
          onChange={(v) => onChange({ legalStatusConfirmed: v })}
          required
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 3: BUSINESS DESCRIPTION
// ═══════════════════════════════════════════════════════════════════════════

function Stage3BusinessDesc({ data, onChange, locale }: {
  data: WizardFormData; onChange: (d: Partial<WizardFormData>) => void; locale: string;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--color-fg-primary)]">
        {locale === "ka" ? "ბიზნესის ან პროექტის აღწერა" : "Business or Project Description"}
      </h2>
      <p className="text-sm text-[var(--color-fg-tertiary)]">
        {locale === "ka"
          ? "აღწერეთ თქვენი ბიზნესი ან იდეა რაც შეიძლება დეტალურად."
          : "Describe your business or idea in as much detail as possible."}
      </p>

      <Input label={locale === "ka" ? "მოკლე აღწერა (მაქს. 500 სიმბოლო)" : "Short Summary (max 500 chars)"} value={data.shortSummary} onChange={(v) => onChange({ shortSummary: v })} type="textarea" maxLength={500} required />
      <Input label={locale === "ka" ? "სრული აღწერა (მაქს. 1000 სიმბოლო)" : "Full Description (max 1000 chars)"} value={data.fullDescription} onChange={(v) => onChange({ fullDescription: v })} type="textarea" maxLength={1000} required />
      <Input label={locale === "ka" ? "რა პროდუქტს ან მომსახურებას სთავაზობთ?" : "What product or service do you offer?"} value={data.productService} onChange={(v) => onChange({ productService: v })} type="textarea" required />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label={locale === "ka" ? "ვინ არის თქვენი სამიზნე მომხმარებელი?" : "Who is your target customer?"} value={data.targetCustomer} onChange={(v) => onChange({ targetCustomer: v })} type="textarea" required />
        <Input label={locale === "ka" ? "რამდენი ხანია საქმიანობთ?" : "How long have you been operating?"} value={data.yearsOperating} onChange={(v) => onChange({ yearsOperating: v })} required />
      </div>

      <Input label={locale === "ka" ? "როგორ იღებთ მომხმარებლებს ამჟამად?" : "How do you currently acquire customers?"} value={data.currentAcquisition} onChange={(v) => onChange({ currentAcquisition: v })} type="textarea" required />

      <RadioGroup
        label={locale === "ka" ? "გყავთ უკვე მომხმარებლები ან გაქვთ მიმდინარე გაყიდვები?" : "Do you already have customers or ongoing sales?"}
        options={["დიახ", "არა", "ეტაპობრივად"]}
        value={data.hasSales}
        onChange={(v) => onChange({ hasSales: v })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label={locale === "ka" ? "რამდენი ადამიანი მუშაობს საქმიანობაში?" : "How many people work in the business?"} value={data.teamSize} onChange={(v) => onChange({ teamSize: v })} type="number" required />
        <Input label={locale === "ka" ? "ქმნის თუ არა პროექტი სამუშაო ადგილებს?" : "Does the project create jobs?"} value={data.createsJobs} onChange={(v) => onChange({ createsJobs: v })} required />
      </div>

      <Input label={locale === "ka" ? "რა რეგიონში ან ბაზარზე საქმიანობთ?" : "In what region or market do you operate?"} value={data.region} onChange={(v) => onChange({ region: v })} required />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 4: WEBSITE NEED
// ═══════════════════════════════════════════════════════════════════════════

function Stage4WebsiteNeed({ data, onChange, locale }: {
  data: WizardFormData; onChange: (d: Partial<WizardFormData>) => void; locale: string;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--color-fg-primary)]">
        {locale === "ka" ? "ვებგვერდის საჭიროება" : "Website Need"}
      </h2>
      <p className="text-sm text-[var(--color-fg-tertiary)]">
        {locale === "ka"
          ? "აღწერეთ, რატომ გჭირდებათ ვებგვერდი და რა მიზნებს უნდა მიაღწიოთ მისი საშუალებით."
          : "Describe why you need a website and what goals you want to achieve with it."}
      </p>

      <Input label={locale === "ka" ? "რატომ გჭირდებათ ვებგვერდი?" : "Why do you need a website?"} value={data.whyNeed} onChange={(v) => onChange({ whyNeed: v })} type="textarea" required />
      <Input label={locale === "ka" ? "რა პრობლემას გადაჭრის?" : "What problem will it solve?"} value={data.problemSolved} onChange={(v) => onChange({ problemSolved: v })} type="textarea" required />
      <Input label={locale === "ka" ? "რა მიზანს უნდა მიაღწიოთ ვებგვერდით?" : "What goal should the website achieve?"} value={data.goalAchieve} onChange={(v) => onChange({ goalAchieve: v })} type="textarea" required />
      <Input label={locale === "ka" ? "როგორ გამოიყენებენ მას მომხმარებლები?" : "How will users use it?"} value={data.userUsage} onChange={(v) => onChange({ userUsage: v })} type="textarea" required />
      <Input label={locale === "ka" ? "რომელ მოქმედებას უნდა ასრულებდეს მომხმარებელი?" : "What action should the user perform?"} value={data.userAction} onChange={(v) => onChange({ userAction: v })} type="textarea" required />
      <Input label={locale === "ka" ? "რა შედეგს ელით პირველი 6 თვის განმავლობაში?" : "What results do you expect in the first 6 months?"} value={data.expected6Months} onChange={(v) => onChange({ expected6Months: v })} type="textarea" required />

      <MultiCheckbox
        label={locale === "ka" ? "მონიშნეთ თქვენი მიზნები" : "Select your goals"}
        options={[
          "ბიზნესის ცნობადობის გაზრდა", "პროდუქტის ან მომსახურების წარმოდგენა",
          "ონლაინ შეკვეთების მიღება", "განაცხადების ან მოთხოვნების მიღება",
          "დაჯავშნა", "პროდუქტის კატალოგი", "ინფორმაციის გავრცელება",
          "საერთაშორისო აუდიტორიაზე გასვლა", "სხვა",
        ]}
        selected={data.goalsMulti}
        onChange={(v) => onChange({ goalsMulti: v })}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 5: PROJECT TYPE
// ═══════════════════════════════════════════════════════════════════════════

function Stage5ProjectType({ data, onChange, locale }: {
  data: WizardFormData; onChange: (d: Partial<WizardFormData>) => void; locale: string;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--color-fg-primary)]">
        {locale === "ka" ? "სასურველი პროექტის ტიპი" : "Desired Project Type"}
      </h2>

      <Select
        label={locale === "ka" ? "პროექტის ტიპი" : "Project Type"}
        value={data.projectType}
        onChange={(v) => onChange({ projectType: v })}
        options={PROJECT_TYPES}
        required
      />

      <MultiCheckbox
        label={locale === "ka" ? "სასურველი ფუნქციები" : "Desired Features"}
        options={FEATURES_LIST}
        selected={data.desiredFeatures}
        onChange={(v) => onChange({ desiredFeatures: v })}
      />

      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
        <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-600">
          {locale === "ka"
            ? "მონიშნული ფუნქციები არ ნიშნავს მათ ავტომატურად დაფინანსებას. საბოლოო მოცულობა განისაზღვრება ტექნიკური შეფასების საფუძველზე."
            : "Marked features do not guarantee automatic funding. The final scope is determined based on technical evaluation."}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 6: DEVELOPMENT POTENTIAL
// ═══════════════════════════════════════════════════════════════════════════

function Stage6Development({ data, onChange, locale }: {
  data: WizardFormData; onChange: (d: Partial<WizardFormData>) => void; locale: string;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--color-fg-primary)]">
        {locale === "ka" ? "განვითარების პოტენციალი" : "Development Potential"}
      </h2>
      <p className="text-sm text-[var(--color-fg-tertiary)]">
        {locale === "ka"
          ? "გთხოვთ, დაწვრილებით უპასუხეთ თითოეულ კითხვას."
          : "Please answer each question in detail."}
      </p>

      {DEVELOPMENT_CRITERIA.map((crit) => (
        <div key={crit.key} className="p-5 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] space-y-3">
          <p className="text-sm font-medium text-[var(--color-fg-primary)]">{crit.q_ka}</p>
          <Input label={locale === "ka" ? "პასუხი" : "Answer"} value={(data as any)[crit.key] || ""} onChange={(v) => onChange({ [crit.key]: v } as any)} type="textarea" required />
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 7: MATERIALS & COOPERATION
// ═══════════════════════════════════════════════════════════════════════════

function Stage7Materials({ data, onChange, locale }: {
  data: WizardFormData; onChange: (d: Partial<WizardFormData>) => void; locale: string;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--color-fg-primary)]">
        {locale === "ka" ? "მასალები და თანამშრომლობა" : "Materials & Cooperation"}
      </h2>

      <MultiCheckbox
        label={locale === "ka" ? "რომელი მასალები გაქვთ მზად?" : "Which materials do you have ready?"}
        options={READY_MATERIALS}
        selected={data.readyMaterials}
        onChange={(v) => onChange({ readyMaterials: v })}
      />

      <Select
        label={locale === "ka" ? "რამდენ ხანში შეძლებთ საჭირო მასალების მოწოდებას?" : "How soon can you provide the necessary materials?"}
        value={data.materialDeliveryTime}
        onChange={(v) => onChange({ materialDeliveryTime: v })}
        options={MATERIAL_TIMES}
      />

      <Select
        label={locale === "ka" ? "რამდენად სწრაფად შეძლებთ უკუკავშირის მიწოდებას?" : "How quickly can you provide feedback?"}
        value={data.feedbackTime}
        onChange={(v) => onChange({ feedbackTime: v })}
        options={FEEDBACK_TIMES}
      />

      <div className="p-5 rounded-2xl border border-[var(--color-border-primary)] space-y-3">
        <p className="text-sm font-medium text-[var(--color-fg-primary)]">
          {locale === "ka" ? "თანამშრომლობის პირობები" : "Cooperation Conditions"}
        </p>
        <div className="space-y-2 text-sm text-[var(--color-fg-secondary)]">
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "მზად ვარ მივიღო მონაწილეობა ონლაინ ან პირისპირ გასაუბრებაში" : "Ready to participate in online or in-person interview"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "მზად ვარ გამოვყო პროექტზე პასუხისმგებელი პირი" : "Ready to assign a person responsible for the project"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "მზად ვარ დროულად მივაწოდო BTA LAB-ს ინფორმაცია" : "Ready to provide information to BTA LAB in a timely manner"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "ვეთანხმები, რომ დაგვიანებამ შეიძლება პროექტის ვადა გადაწიოს" : "I agree that delays may extend the project deadline"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "ვეთანხმები, რომ ხანგრძლივი თანამშრომლობის არქონის შემთხვევაში პროექტი შეიძლება შეჩერდეს" : "I agree that prolonged lack of cooperation may result in project suspension"}</span>
          </div>
        </div>
        <div className="pt-2 border-t border-[var(--color-border-primary)]">
          <Checkbox
            label={locale === "ka" ? "ვეთანხმები ყველა თანამშრომლობის პირობას" : "I agree to all cooperation conditions"}
            checked={data.coopInterview && data.coopAssignPerson && data.coopTimelyInfo && data.coopDelayAgree && data.coopStopAgree}
            onChange={(v) => {
              onChange({ coopInterview: v, coopAssignPerson: v, coopTimelyInfo: v, coopDelayAgree: v, coopStopAgree: v });
            }}
            required
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 8: PUBLIC CONSENT
// ═══════════════════════════════════════════════════════════════════════════

function Stage8Consent({ data, onChange, locale }: {
  data: WizardFormData; onChange: (d: Partial<WizardFormData>) => void; locale: string;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--color-fg-primary)]">
        {locale === "ka" ? "საჯარო კომუნიკაციის თანხმობა" : "Public Communication Consent"}
      </h2>
      <p className="text-sm text-[var(--color-fg-tertiary)]">
        {locale === "ka"
          ? "გთხოვთ, მიუთითოთ, რომელ საკომუნიკაციო აქტივობებზე გაქვთ თანხმობა. ვარსკვლავით მონიშნული თანხმობები სავალდებულოა."
          : "Please indicate which communication activities you consent to. Marked items are required."}
      </p>

      <div className="p-5 rounded-2xl border border-[var(--color-border-primary)] space-y-3">
        <p className="text-sm font-semibold text-[var(--color-fg-primary)]">
          {locale === "ka" ? "სავალდებულო თანხმობები" : "Required Consents"}
        </p>
        <div className="space-y-2 text-sm text-[var(--color-fg-secondary)]">
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "პროექტი განთავსდება BTA LAB-ის პორტფოლიოში" : "Project will be displayed in BTA LAB's portfolio"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "გამოქვეყნდება პროექტის სქრინშოტები" : "Project screenshots will be published"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "აღწერილი იქნება პროექტის შექმნის პროცესი" : "Project creation process will be described"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "პროექტი წარმოდგენილი იქნება აკადემიის პრეზენტაციაზე" : "Project will be presented at academy presentations"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "გამოქვეყნდება ჩემი წერილობითი შეფასება" : "Written feedback will be published"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "მონაწილეობა მივიღო პროექტის შედეგების მოკლე შეფასებაში" : "Participate in brief project results evaluation"}</span>
          </div>
        </div>
        <div className="pt-2 border-t border-[var(--color-border-primary)]">
          <Checkbox
            label={locale === "ka" ? "ვეთანხმები საჯარო კომუნიკაციის პირობებს" : "I consent to public communication conditions"}
            checked={data.consentPortfolio && data.consentScreenshots && data.consentProcess && data.consentPresentation && data.consentFeedback && data.consentEvaluation}
            onChange={(v) => {
              onChange({ consentPortfolio: v, consentScreenshots: v, consentProcess: v, consentPresentation: v, consentFeedback: v, consentEvaluation: v });
            }}
            required
          />
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-[var(--color-border-primary)] space-y-1">
        <p className="text-sm font-semibold text-[var(--color-fg-primary)] mb-2">
          {locale === "ka" ? "არასავალდებულო თანხმობები" : "Optional Consents"}
        </p>
        <Checkbox label={locale === "ka" ? "თანახმა ვარ ვიდეოგადაღებაზე" : "I consent to video recording"} checked={data.consentVideo} onChange={(v) => onChange({ consentVideo: v })} />
        <Checkbox label={locale === "ka" ? "თანახმა ვარ ფოტოს გამოყენებაზე" : "I consent to photo use"} checked={data.consentPhoto} onChange={(v) => onChange({ consentPhoto: v })} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 9: DECLARATIONS & SUBMIT
// ═══════════════════════════════════════════════════════════════════════════

function Stage9Declarations({ data, onChange, locale, isSubmitting }: {
  data: WizardFormData; onChange: (d: Partial<WizardFormData>) => void;
  locale: string; isSubmitting: boolean;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--color-fg-primary)]">
        {locale === "ka" ? "დეკლარაციები და გაგზავნა" : "Declarations & Submit"}
      </h2>
      <p className="text-sm text-[var(--color-fg-tertiary)]">
        {locale === "ka"
          ? "გთხოვთ, დამადასტურებელი ჩექბოქსების მონიშვნით დაადასტუროთ თქვენი თანხმობა კამპანიის წესებზე."
          : "Please confirm your agreement to the campaign rules by checking the confirmation boxes."}
      </p>

      <div className="p-5 rounded-2xl border border-[var(--color-border-primary)] space-y-3">
        <p className="text-sm font-semibold text-[var(--color-fg-primary)]">
          {locale === "ka" ? "დეკლარაციები" : "Declarations"}
        </p>
        <div className="space-y-2 text-sm text-[var(--color-fg-secondary)]">
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "მოწოდებული ინფორმაცია სწორია" : "Provided information is correct"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "საქმიანობა კანონიერია" : "Activity is legal"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "გავეცანი კამპანიის წესებს" : "I have read the campaign rules"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "მესმის, რომ განაცხადის შევსება დაფინანსების მიღებას არ ნიშნავს" : "Submitting does not guarantee funding"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "ვეთანხმები პერსონალური მონაცემების დამუშავებას" : "I consent to data processing"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "BTA LAB-ს შეუძლია დამატებითი ინფორმაციის მოთხოვნა" : "BTA LAB may request additional information"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "პროექტი შეიძლება არ შეირჩეს" : "The project may not be selected"}</span>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{locale === "ka" ? "ვეთანხმები გასაუბრების ეტაპზე მონაწილეობას" : "I consent to participate in the interview stage"}</span>
          </div>
        </div>
        <div className="pt-2 border-t border-[var(--color-border-primary)]">
          <Checkbox
            label={locale === "ka" ? "ვეთანხმები კამპანიის წესებს და პირობებს" : "I agree to the campaign rules and conditions"}
            checked={data.declInfoCorrect && data.declLegalActivity && data.declReadRules && data.declNotGuarantee && data.declDataProcessing && data.declAdditionalInfo && data.declMayNotSelect && data.declInterviewParticipate}
            onChange={(v) => {
              onChange({ declInfoCorrect: v, declLegalActivity: v, declReadRules: v, declNotGuarantee: v, declDataProcessing: v, declAdditionalInfo: v, declMayNotSelect: v, declInterviewParticipate: v });
            }}
            required
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CAMPAIGN WIZARD CLIENT
// ═══════════════════════════════════════════════════════════════════════════

export function CampaignWizardClient({ verificationToken, verifiedEmail }: { verificationToken?: string; verifiedEmail?: string }) {
  const { locale } = useTranslation();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>(DEFAULT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Use a ref to avoid stale closures inside the popstate event handler
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  // Pre-populate email with the verified email from OTP gate
  useEffect(() => {
    if (verifiedEmail) {
      setFormData((prev) => ({ ...prev, email: verifiedEmail }));
    }
  }, [verifiedEmail]);

  // Intercept browser back button to navigate steps instead of leaving the form
  useEffect(() => {
    // Push an initial history entry so the popstate event fires correctly
    window.history.pushState(null, "");

    const handlePopState = () => {
      const step = currentStepRef.current;
      if (step > 0) {
        // Go to previous step by updating state, keep user on this page
        setCurrentStep(step - 1);
        setError("");
        // Push a new state to prevent the browser from navigating away
        window.history.pushState(null, "");
      }
      // On step 0: do nothing — let the browser navigate back naturally
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFormData = useCallback((partial: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  // Update history state when step changes
  useEffect(() => {
    window.history.replaceState({ step: currentStep }, "");
  }, [currentStep]);

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 0: // Personal Info
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.city) {
          setError(locale === "ka" ? "გთხოვთ, შეავსოთ ყველა სავალდებულო ველი" : "Please fill in all required fields");
          return false;
        }
        if (formData.personalId && formData.personalId.length !== 11) {
          setError(locale === "ka" ? "პირადი ნომერი უნდა შეიცავდეს ზუსტად 11 ციფრს" : "Personal ID must contain exactly 11 digits");
          return false;
        }
        if (!formData.ageConfirmed) {
          setError(locale === "ka" ? "ასაკის დადასტურება სავალდებულოა" : "Age confirmation is required");
          return false;
        }
        break;
      case 1: // Legal Status
        if (!formData.legalStatus) {
          setError(locale === "ka" ? "გთხოვთ, აირჩიოთ სამართლებრივი სტატუსი" : "Please select a legal status");
          return false;
        }
        if (!formData.legalStatusConfirmed) {
          setError(locale === "ka" ? "რეგისტრაციის პირობის დადასტურება სავალდებულოა" : "Registration condition confirmation is required");
          return false;
        }
        break;
      case 2: // Business Description
        if (!formData.shortSummary) {
          setError(locale === "ka" ? "გთხოვთ, შეიყვანოთ მოკლე აღწერა" : "Please enter a short summary");
          return false;
        }
        if (formData.shortSummary.length > 500) {
          setError(locale === "ka" ? "მოკლე აღწერა არ უნდა აღემატებოდეს 500 სიმბოლოს" : "Short summary must not exceed 500 characters");
          return false;
        }
        if (!formData.fullDescription) {
          setError(locale === "ka" ? "გთხოვთ, შეიყვანოთ სრული აღწერა" : "Please enter a full description");
          return false;
        }
        if (formData.fullDescription.length > 1000) {
          setError(locale === "ka" ? "სრული აღწერა არ უნდა აღემატებოდეს 1000 სიმბოლოს" : "Full description must not exceed 1000 characters");
          return false;
        }
        if (!formData.productService) {
          setError(locale === "ka" ? "გთხოვთ, მიუთითოთ რა პროდუქტს ან მომსახურებას სთავაზობთ" : "Please indicate what product or service you offer");
          return false;
        }
        if (!formData.targetCustomer) {
          setError(locale === "ka" ? "გთხოვთ, მიუთითოთ თქვენი სამიზნე მომხმარებელი" : "Please indicate your target customer");
          return false;
        }
        if (!formData.yearsOperating) {
          setError(locale === "ka" ? "გთხოვთ, მიუთითოთ რამდენი ხანია საქმიანობთ" : "Please indicate how long you have been operating");
          return false;
        }
        if (!formData.currentAcquisition) {
          setError(locale === "ka" ? "გთხოვთ, მიუთითოთ როგორ იღებთ მომხმარებლებს" : "Please indicate how you acquire customers");
          return false;
        }
        if (!formData.hasSales) {
          setError(locale === "ka" ? "გთხოვთ, მიუთითოთ გყავთ თუ არა მომხმარებლები ან გაქვთ გაყიდვები" : "Please indicate if you have customers or sales");
          return false;
        }
        if (!formData.teamSize) {
          setError(locale === "ka" ? "გთხოვთ, მიუთითოთ რამდენი ადამიანი მუშაობს საქმიანობაში" : "Please indicate how many people work in the business");
          return false;
        }
        if (!formData.createsJobs) {
          setError(locale === "ka" ? "გთხოვთ, მიუთითოთ ქმნის თუ არა პროექტი სამუშაო ადგილებს" : "Please indicate if the project creates jobs");
          return false;
        }
        if (!formData.region) {
          setError(locale === "ka" ? "გთხოვთ, მიუთითოთ რა რეგიონში საქმიანობთ" : "Please indicate your region or market");
          return false;
        }
        break;
      case 3: // Website Need
        if (!formData.whyNeed) {
          setError(locale === "ka" ? "გთხოვთ, აღწეროთ ვებგვერდის საჭიროება" : "Please describe why you need a website");
          return false;
        }
        if (!formData.problemSolved) {
          setError(locale === "ka" ? "გთხოვთ, აღწეროთ რა პრობლემას გადაჭრის ვებგვერდი" : "Please describe what problem the website will solve");
          return false;
        }
        if (!formData.goalAchieve) {
          setError(locale === "ka" ? "გთხოვთ, მიუთითოთ რა მიზანს უნდა მიაღწიოთ ვებგვერდით" : "Please indicate what goal the website should achieve");
          return false;
        }
        if (!formData.userUsage) {
          setError(locale === "ka" ? "გთხოვთ, აღწეროთ როგორ გამოიყენებენ ვებგვერდს მომხმარებლები" : "Please describe how users will use the website");
          return false;
        }
        if (!formData.userAction) {
          setError(locale === "ka" ? "გთხოვთ, მიუთითოთ რომელ მოქმედებას უნდა ასრულებდეს მომხმარებელი" : "Please indicate what action the user should perform");
          return false;
        }
        if (!formData.expected6Months) {
          setError(locale === "ka" ? "გთხოვთ, მიუთითოთ რა შედეგს ელით პირველი 6 თვის განმავლობაში" : "Please indicate what results you expect in the first 6 months");
          return false;
        }
        if (!formData.goalsMulti || formData.goalsMulti.length === 0) {
          setError(locale === "ka" ? "გთხოვთ აირჩიოთ მინიმუმ ერთი მიზანი" : "Please select at least one goal");
          return false;
        }
        break;
      case 4: // Project Type
        if (!formData.projectType) {
          setError(locale === "ka" ? "გთხოვთ, აირჩიოთ პროექტის ტიპი" : "Please select a project type");
          return false;
        }
        if (!formData.desiredFeatures || formData.desiredFeatures.length === 0) {
          setError(locale === "ka" ? "გთხოვთ აირჩიოთ მინიმუმ ერთი სასურველი ფუნქცია" : "Please select at least one desired feature");
          return false;
        }
        break;
      case 5: // Development Potential
        if (!formData.developmentPlan || !formData.websiteHelps || !formData.jobCreationPotential || !formData.usesLocalResources || !formData.showcasesCulture || !formData.supportsRegion || !formData.internationalPotential || !formData.socialEconomicBenefit) {
          setError(locale === "ka" ? "გთხოვთ შეავსოთ ყველა სავალდებულო პასუხი" : "Please fill in all required answers");
          return false;
        }
        break;
      case 6: // Materials & Cooperation
        if (!formData.coopInterview || !formData.coopAssignPerson || !formData.coopTimelyInfo || !formData.coopDelayAgree || !formData.coopStopAgree) {
          setError(locale === "ka" ? "გთხოვთ დაეთანხმოთ ყველა თანამშრომლობის პირობას" : "Please agree to all cooperation conditions");
          return false;
        }
        break;
      case 7: // Consent
        if (!formData.consentPortfolio || !formData.consentScreenshots || !formData.consentProcess || !formData.consentPresentation || !formData.consentFeedback || !formData.consentEvaluation) {
          setError(locale === "ka" ? "ყველა სავალდებულო თანხმობა მონიშნეთ" : "Please check all required consents");
          return false;
        }
        break;
      case 8: // Declarations
        if (!formData.declInfoCorrect || !formData.declLegalActivity || !formData.declReadRules || !formData.declNotGuarantee || !formData.declDataProcessing || !formData.declAdditionalInfo || !formData.declMayNotSelect || !formData.declInterviewParticipate) {
          setError(locale === "ka" ? "ყველა სავალდებულო დეკლარაცია მონიშნეთ" : "Please check all required declarations");
          return false;
        }
        break;
    }
    setError("");
    return true;
  }, [formData, locale]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STAGES.length - 1));
      // Automatically scroll to top of the new step
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, validateStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError("");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    setError("");

    try {
      const result = await submitCampaignApplication({
        ...formData,
        verificationToken: verificationToken || sessionStorage.getItem("campaign_verification_token") || "",
      } as unknown as Record<string, unknown>);
      // Invalidate the verification token (prevent reuse)
      sessionStorage.removeItem("campaign_verification_token");
      sessionStorage.removeItem("campaign_verified_email");
      // Redirect to thank-you page
      router.push(`/entrepreneur-support/thank-you?appId=${result.application_number}`);
    } catch (err) {
      console.error("[campaign-wizard] submit error:", err);
      const message = err instanceof Error ? err.message : (locale === "ka" ? "განაცხადის გაგზავნა ვერ მოხერხდა" : "Failed to submit application");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, currentStep, validateStep, router, locale, verificationToken]);

  const allDeclarationsChecked = formData.declInfoCorrect;

  const renderStage = () => {
    switch (currentStep) {
      case 0: return <Stage1PersonalInfo data={formData} onChange={updateFormData} locale={locale} />;
      case 1: return <Stage2LegalStatus data={formData} onChange={updateFormData} locale={locale} />;
      case 2: return <Stage3BusinessDesc data={formData} onChange={updateFormData} locale={locale} />;
      case 3: return <Stage4WebsiteNeed data={formData} onChange={updateFormData} locale={locale} />;
      case 4: return <Stage5ProjectType data={formData} onChange={updateFormData} locale={locale} />;
      case 5: return <Stage6Development data={formData} onChange={updateFormData} locale={locale} />;
      case 6: return <Stage7Materials data={formData} onChange={updateFormData} locale={locale} />;
      case 7: return <Stage8Consent data={formData} onChange={updateFormData} locale={locale} />;
      case 8: return <Stage9Declarations data={formData} onChange={updateFormData} locale={locale} isSubmitting={isSubmitting} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-[64px] md:pt-[80px]">
      {/* Top Navigation Bar */}
      <StepNavigator currentStep={currentStep} locale={locale} />

      <Container>
        <div className="max-w-3xl mx-auto mt-8">
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Stage Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 md:p-8 rounded-3xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)]">
                {renderStage()}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <div>
              {currentStep > 0 && (
                <Button variant="secondary" onClick={handlePrev} className="gap-2">
                  <ArrowLeft size={16} />
                  {locale === "ka" ? "წინა ეტაპი" : "Back"}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep < STAGES.length - 1 ? (
                <Button variant="primary" onClick={handleNext} className="gap-2">
                  {locale === "ka" ? "შემდეგი" : "Next"}
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !allDeclarationsChecked}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {locale === "ka" ? "იგზავნება..." : "Submitting..."}
                    </span>
                  ) : (
                    <>
                      <Send size={16} />
                      {locale === "ka" ? "განაცხადის გაგზავნა" : "Submit Application"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
