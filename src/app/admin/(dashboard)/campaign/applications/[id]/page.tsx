import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

// ── Form field labels and option lists (mirrors campaign-wizard-client.tsx) ──


const FEATURES_LIST = [
  "ქართული ენა", "ინგლისური ენა", "სხვა ენა", "ადმინისტრირების პანელი",
  "პროდუქტის მართვა", "შეკვეთების მიღება", "ონლაინ გადახდა", "რუკა",
  "WhatsApp/Messenger", "ელფოსტის შეტყობინებები", "მომხმარებლის რეგისტრაცია",
  "ბლოგი", "ფოტოგალერეა", "ვიდეო", "სხვა",
];
const GOALS_LIST = [
  "ბიზნესის ცნობადობის გაზრდა", "პროდუქტის ან მომსახურების წარმოდგენა",
  "ონლაინ შეკვეთების მიღება", "განაცხადების ან მოთხოვნების მიღება",
  "დაჯავშნა", "პროდუქტის კატალოგი", "ინფორმაციის გავრცელება",
  "საერთაშორისო აუდიტორიაზე გასვლა", "სხვა",
];
const READY_MATERIALS = [
  "ლოგო", "ბრენდის ფერები", "კომპანიის აღწერა", "პროდუქტების აღწერები",
  "მომსახურების აღწერები", "ფასები", "ფოტოები", "ვიდეო",
  "იურიდიული ტექსტები", "კონფიდენციალურობის პოლიტიკა", "ჯერ არაფერი მაქვს მზად",
];

const RADIO_OPTIONS = ["დიახ", "არა", "ნაწილობრივ", "არ შეესაბამება"];
const COOP_LABELS = [
  { key: "coopInterview", label_ka: "მზად ვარ მივიღო მონაწილეობა ონლაინ ან პირისპირ გასაუბრებაში" },
  { key: "coopAssignPerson", label_ka: "მზად ვარ გამოვყო პროექტზე პასუხისმგებელი პირი" },
  { key: "coopTimelyInfo", label_ka: "მზად ვარ დროულად მივაწოდო ინფორმაცია" },
  { key: "coopDelayAgree", label_ka: "ვეთანხმები, რომ დაგვიანებამ შეიძლება ვადა გადაწიოს" },
  { key: "coopStopAgree", label_ka: "ვეთანხმები, რომ ხანგრძლივი თანამშრომლობის არქონისას პროექტი შეიძლება შეჩერდეს" },
];
const CONSENT_LABELS = [
  { key: "consentPortfolio", label_ka: "პროექტი განთავსდეს BTA LAB-ის პორტფოლიოში", required: true },
  { key: "consentScreenshots", label_ka: "გამოქვეყნდეს პროექტის სქრინშოტები", required: true },
  { key: "consentProcess", label_ka: "აღწერილი იყოს პროექტის შექმნის პროცესი", required: true },
  { key: "consentPresentation", label_ka: "პროექტი წარმოდგენილ იქნეს აკადემიის პრეზენტაციაზე", required: true },
  { key: "consentFeedback", label_ka: "გამოქვეყნდეს წერილობითი შეფასება", required: true },
  { key: "consentEvaluation", label_ka: "მონაწილეობა მივიღო პროექტის შედეგების მოკლე შეფასებაში", required: true },
  { key: "consentVideo", label_ka: "ვიდეოგადაღებაზე თანხმობა", required: false },
  { key: "consentPhoto", label_ka: "ფოტოს გამოყენებაზე თანხმობა", required: false },
];
const DECLARATION_LABELS = [
  { key: "declInfoCorrect", label_ka: "მოწოდებული ინფორმაცია სწორია" },
  { key: "declLegalActivity", label_ka: "საქმიანობა კანონიერია" },
  { key: "declReadRules", label_ka: "გავეცანი კამპანიის წესებს" },
  { key: "declNotGuarantee", label_ka: "მესმის, რომ განაცხადის შევსება დაფინანსების მიღებას არ ნიშნავს" },
  { key: "declDataProcessing", label_ka: "ვეთანხმები პერსონალური მონაცემების დამუშავებას" },
  { key: "declAdditionalInfo", label_ka: "მესმის, რომ BTA LAB-ს შეუძლია დამატებითი ინფორმაციის მოთხოვნა" },
  { key: "declMayNotSelect", label_ka: "მესმის, რომ პროექტი შეიძლება არ შეირჩეს" },
  { key: "declInterviewParticipate", label_ka: "ვეთანხმები გასაუბრების ეტაპზე მონაწილეობას" },
];

const DEVELOPMENT_CRITERIA = [
  { key: "developmentPlan", q_ka: "როგორ გეგმავთ ბიზნესის განვითარებას მომდევნო 6–12 თვეში?" },
  { key: "websiteHelps", q_ka: "როგორ შეუწყობს ხელს ვებგვერდი ამ გეგმას?" },
  { key: "jobCreationPotential", q_ka: "გაქვთ თუ არა ახალი სამუშაო ადგილების შექმნის პოტენციალი?" },
  { key: "usesLocalResources", q_ka: "იყენებთ თუ არა ადგილობრივ ნედლეულს, ცოდნას ან წარმოებას?" },
  { key: "showcasesCulture", q_ka: "წარმოაჩენს თუ არა პროექტი ქართულ კულტურას?" },
  { key: "supportsRegion", q_ka: "უწყობს თუ არა ხელს რეგიონის განვითარებას?" },
  { key: "internationalPotential", q_ka: "გაქვთ თუ არა საერთაშორისო ბაზარზე გასვლის პოტენციალი?" },
  { key: "socialEconomicBenefit", q_ka: "ქმნის თუ არა საქმიანობა საზოგადოებრივ ან ეკონომიკურ სარგებელს?" },
];

// ── Types ──

interface ApplicationRecord {
  id: string;
  application_number: string;
  status: string;
  submitted_at: string;
  first_name_ka: string | null;
  first_name_en: string | null;
  last_name_ka: string | null;
  last_name_en: string | null;
  email: string | null;
  phone: string | null;
  business_name_ka: string | null;
  business_name_en: string | null;
  form_data: Record<string, unknown> | null;
}

// ── UI Components ──

function Field({ label, value }: { label: string; value: unknown }) {
  const display = () => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "✅" : "—";
    if (typeof value === "string" && value.trim() === "") return "—";
    if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—";
    return String(value);
  };
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-[var(--color-fg-tertiary)] uppercase tracking-wider">{label}</p>
      <p className="text-sm text-[var(--color-fg-primary)] whitespace-pre-wrap">{display()}</p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--color-border-primary)] bg-[var(--color-overlay)]">
        <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">{title}</h2>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
        {children}
      </div>
    </div>
  );
}

function CheckboxField({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {checked ? (
        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
      ) : (
        <XCircle size={16} className="text-red-300 shrink-0" />
      )}
      <span className={`text-sm ${checked ? "text-[var(--color-fg-primary)]" : "text-[var(--color-fg-tertiary)]/50"}`}>
        {label}
      </span>
    </div>
  );
}

function OptionList({ title, options, selected }: { title: string; options: string[]; selected: string[] | unknown }) {
  const sel = Array.isArray(selected) ? selected : [];
  const hasSelection = sel.length > 0;
  return (
    <div className="sm:col-span-2 lg:col-span-3 space-y-2">
      <p className="text-xs font-medium text-[var(--color-fg-tertiary)] uppercase tracking-wider">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {options.map((opt) => (
          <CheckboxField key={opt} checked={sel.includes(opt)} label={opt} />
        ))}
      </div>
      {!hasSelection && (
        <p className="text-xs text-[var(--color-fg-tertiary)] italic">No options selected</p>
      )}
    </div>
  );
}

// ── Page Component ──

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: raw } = await supabase
    .from("campaign_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (!raw) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--color-fg-tertiary)]">Application not found.</p>
        <Link href="/admin/campaign/applications" className="text-sm text-[var(--color-accent)] hover:underline mt-4 inline-block">
          ← Back to Applications
        </Link>
      </div>
    );
  }

  const app = raw as unknown as ApplicationRecord;
  const f = app.form_data || {};

  const statusLabels: Record<string, string> = {
    UNOPENED: "გაუხსნელი",
    CHECKED: "შემოწმებული",
  };

  const statusColors: Record<string, string> = {
    UNOPENED: "bg-blue-500/10 text-blue-500",
    CHECKED: "bg-green-500/10 text-green-500",
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <Link href="/admin/campaign/applications" className="p-2 rounded-lg hover:bg-[var(--color-overlay)] transition-colors mt-1">
          <ArrowLeft size={18} className="text-[var(--color-fg-tertiary)]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-fg-primary)]">
              Application #{app.application_number || id.slice(0, 8)}
            </h1>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[app.status] || "bg-gray-500/10 text-gray-500"}`}>
              {statusLabels[app.status] || app.status}
            </span>
          </div>
          <p className="text-sm text-[var(--color-fg-tertiary)]">
            Submitted {new Date(app.submitted_at).toLocaleDateString("ka-GE", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* ── Applicant Information (Stage 1) ── */}
      <SectionCard title="განმცხადებლის ინფორმაცია — Applicant Information">
        <Field label="Application Number" value={app.application_number} />
        <Field label="First Name / სახელი" value={app.first_name_ka || f.firstName} />
        <Field label="Last Name / გვარი" value={app.last_name_ka || f.lastName} />
        <Field label="Email / ელფოსტა" value={app.email || f.email} />
        <Field label="Phone / ტელეფონი" value={app.phone || f.phone} />
        <Field label="Personal ID / პირადი ნომერი" value={f.personalId} />
        <Field label="City / ქალაქი" value={f.city} />
        <Field label="Communication Channel" value={f.communicationChannel} />
        <Field label="Responsible Person" value={f.responsiblePerson} />
        <Field label="Age Confirmed (18+)" value={f.ageConfirmed} />
      </SectionCard>

      {/* ── Business / Legal Status (Stage 2) ── */}
      <SectionCard title="სამართლებრივი სტატუსი — Legal Status">
        <Field label="Legal Status / სტატუსი" value={f.legalStatus} />
        <Field label="Business Name / დასახელება" value={app.business_name_ka || f.businessName} />
        <Field label="Identification Number" value={f.identificationNumber} />
        <Field label="Registration Date" value={f.registrationDate} />
        <Field label="Activity Field / სფერო" value={f.activityField} />
        <Field label="Business Address / მისამართი" value={f.businessAddress} />
        <Field label="Existing Website" value={f.existingWebsite} />
        <Field label="Facebook" value={f.socialFacebook} />
        <Field label="Instagram" value={f.socialInstagram} />
        <Field label="LinkedIn" value={f.socialLinkedin} />
        <Field label="Other Social Channel" value={f.socialOther} />
        <Field label="Legal Status Confirmed" value={f.legalStatusConfirmed} />
      </SectionCard>

      {/* ── Business Description (Stage 3) ── */}
      <SectionCard title="ბიზნესის აღწერა — Business Description">
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Short Summary / მოკლე აღწერა" value={f.shortSummary} />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Full Description / სრული აღწერა" value={f.fullDescription} />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Product / Service" value={f.productService} />
        </div>
        <Field label="Target Customer" value={f.targetCustomer} />
        <Field label="Years Operating" value={f.yearsOperating} />
        <Field label="Customer Acquisition" value={f.currentAcquisition} />
        <Field label="Has Sales / გაყიდვები" value={f.hasSales} />
        <Field label="Team Size" value={f.teamSize} />
        <Field label="Creates Jobs" value={f.createsJobs} />
        <Field label="Region / Market" value={f.region} />
      </SectionCard>

      {/* ── Website Need & Goals (Stage 4) ── */}
      <SectionCard title="ვებგვერდის საჭიროება — Website Need">
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Why Need Website?" value={f.whyNeed} />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Problem Solved" value={f.problemSolved} />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Goal to Achieve" value={f.goalAchieve} />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="How Users Will Use It" value={f.userUsage} />
        </div>
        <Field label="User Action" value={f.userAction} />
        <Field label="Expected 6 Months" value={f.expected6Months} />
        <OptionList title="Selected Goals / არჩეული მიზნები" options={GOALS_LIST} selected={f.goalsMulti} />
      </SectionCard>

      {/* ── Project Type & Features (Stage 5) ── */}
      <SectionCard title="პროექტის ტიპი — Project Type">
        <Field label="Project Type / ტიპი" value={f.projectType} />
        <OptionList title="Desired Features / სასურველი ფუნქციები" options={FEATURES_LIST} selected={f.desiredFeatures} />
      </SectionCard>

      {/* ── Development Potential (Stage 6) ── */}
      <SectionCard title="განვითარების პოტენციალი — Development Potential">
        {DEVELOPMENT_CRITERIA.map((crit) => {
          const radioKey = crit.key + "Radio";
          const radioVal = f[radioKey];
          const textVal = f[crit.key];
          return (
            <div key={crit.key} className="sm:col-span-2 lg:col-span-3 p-4 rounded-xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)] space-y-2">
              <p className="text-sm font-medium text-[var(--color-fg-primary)]">{crit.q_ka}</p>
              <div className="flex flex-wrap gap-2">
                {RADIO_OPTIONS.map((opt) => (
                  <span
                    key={opt}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                      radioVal === opt
                        ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30"
                        : "bg-[var(--color-bg-surface)] text-[var(--color-fg-tertiary)] border border-[var(--color-border-primary)]"
                    }`}
                  >
                    {opt}
                  </span>
                ))}
              </div>
              {String(textVal || "").trim() && (
                <p className="text-xs text-[var(--color-fg-secondary)] italic mt-1">Justification: {String(textVal)}</p>
              )}
            </div>
          );
        })}
      </SectionCard>

      {/* ── Materials & Cooperation (Stage 7) ── */}
      <SectionCard title="მასალები და თანამშრომლობა — Materials & Cooperation">
        <OptionList title="Ready Materials / მზა მასალები" options={READY_MATERIALS} selected={f.readyMaterials} />
        <Field label="Material Delivery Time" value={f.materialDeliveryTime} />
        <Field label="Feedback Time" value={f.feedbackTime} />
        <div className="sm:col-span-2 lg:col-span-3 space-y-1">
          <p className="text-xs font-medium text-[var(--color-fg-tertiary)] uppercase tracking-wider">Cooperation Conditions</p>
          {COOP_LABELS.map((c) => (
            <CheckboxField key={c.key} checked={!!f[c.key]} label={c.label_ka} />
          ))}
        </div>
      </SectionCard>

      {/* ── Public Consents (Stage 8) ── */}
      <SectionCard title="საჯარო კომუნიკაციის თანხმობა — Public Consents">
        <div className="sm:col-span-2 lg:col-span-3 space-y-1">
          <p className="text-xs font-medium text-[var(--color-fg-tertiary)] uppercase tracking-wider mb-1">
            Required Consents / სავალდებულო თანხმობები
          </p>
          {CONSENT_LABELS.filter((c) => c.required).map((c) => (
            <CheckboxField key={c.key} checked={!!f[c.key]} label={c.label_ka} />
          ))}
        </div>
        <div className="sm:col-span-2 lg:col-span-3 space-y-1">
          <p className="text-xs font-medium text-[var(--color-fg-tertiary)] uppercase tracking-wider mb-1">
            Optional Consents / არასავალდებულო თანხმობები
          </p>
          {CONSENT_LABELS.filter((c) => !c.required).map((c) => (
            <CheckboxField key={c.key} checked={!!f[c.key]} label={c.label_ka} />
          ))}
        </div>
      </SectionCard>

      {/* ── Declarations (Stage 9) ── */}
      <SectionCard title="დეკლარაციები — Declarations">
        <div className="sm:col-span-2 lg:col-span-3 space-y-1">
          {DECLARATION_LABELS.map((d) => (
            <CheckboxField key={d.key} checked={!!f[d.key]} label={d.label_ka} />
          ))}
        </div>
      </SectionCard>

      {/* ── Submission Meta ── */}
      <SectionCard title="გაგზავნის ინფორმაცია — Submission Info">
        <Field label="Application Number" value={app.application_number} />
        <Field label="Application ID" value={app.id} />
        <Field label="Submitted At" value={app.submitted_at ? new Date(app.submitted_at).toLocaleString("ka-GE") : "—"} />
        <Field label="Status / სტატუსი" value={statusLabels[app.status] || app.status} />
      </SectionCard>
    </div>
  );
}
