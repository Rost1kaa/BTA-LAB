// ═══════════════════════════════════════════════════════════════════════════
// BTA LAB — Entrepreneur Support Campaign Types
// ═══════════════════════════════════════════════════════════════════════════

export type CampaignApplicationStatus = 'UNOPENED' | 'CHECKED';

export type CampaignInterviewResult = 'pending' | 'passed' | 'failed' | 'no_show';

export type CampaignOfferStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export type CampaignEmailEvent =
  | 'application_received' | 'interview_invitation' | 'need_more_information'
  | 'offer_made' | 'status_changed' | 'final_decision' | 'application_draft_saved';

// ── CMS Content Types ───────────────────────────────────────────────────

export interface CampaignPage {
  id: string;
  slug: string;
  title_ka: string;
  title_en: string;
  subtitle_ka: string;
  subtitle_en: string;
  description_ka: string;
  description_en: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignSection {
  id: string;
  page_slug: string;
  section_key: string;
  section_type: string;
  title_ka: string;
  title_en: string;
  subtitle_ka: string;
  subtitle_en: string;
  description_ka: string;
  description_en: string;
  content_ka: string;
  content_en: string;
  image: string;
  icon: string;
  badge_ka: string;
  badge_en: string;
  button_text_ka: string;
  button_text_en: string;
  button_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface CampaignFAQ {
  id: string;
  page_slug: string;
  question_ka: string;
  question_en: string;
  answer_ka: string;
  answer_en: string;
  sort_order: number;
  is_active: boolean;
}

export interface CampaignCard {
  id: string;
  page_slug: string;
  section_key: string;
  title_ka: string;
  title_en: string;
  description_ka: string;
  description_en: string;
  image: string;
  icon: string;
  badge_ka: string;
  badge_en: string;
  button_text_ka: string;
  button_text_en: string;
  button_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface CampaignTimelineItem {
  id: string;
  page_slug: string;
  section_key: string;
  date_ka: string;
  date_en: string;
  title_ka: string;
  title_en: string;
  description_ka: string;
  description_en: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface CampaignStatistic {
  id: string;
  page_slug: string;
  section_key: string;
  label_ka: string;
  label_en: string;
  value: number;
  suffix_ka: string;
  suffix_en: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface CampaignCTA {
  id: string;
  page_slug: string;
  section_key: string;
  title_ka: string;
  title_en: string;
  description_ka: string;
  description_en: string;
  button_text_ka: string;
  button_text_en: string;
  button_url: string;
  secondary_button_text_ka: string;
  secondary_button_text_en: string;
  secondary_button_url: string;
  is_active: boolean;
}

export interface CampaignSetting {
  id: string;
  setting_key: string;
  setting_value_ka: string;
  setting_value_en: string;
  setting_type: string;
  is_active: boolean;
}

export interface CampaignSEO {
  id: string;
  page_slug: string;
  title_ka: string;
  title_en: string;
  description_ka: string;
  description_en: string;
  keywords_ka: string;
  keywords_en: string;
  canonical_url: string;
  og_title_ka: string;
  og_title_en: string;
  og_description_ka: string;
  og_description_en: string;
  og_image: string;
  twitter_title_ka: string;
  twitter_title_en: string;
  twitter_description_ka: string;
  twitter_description_en: string;
  twitter_image: string;
  schema_markup: Record<string, unknown>;
  is_active: boolean;
}

// ── Application Types ───────────────────────────────────────────────────

export interface CampaignApplication {
  id: string;
  application_number: string;
  locale: 'ka' | 'en';

  // Personal Information
  first_name_ka: string;
  first_name_en: string;
  last_name_ka: string;
  last_name_en: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: string;
  id_number: string;

  // Contact
  address_ka: string;
  address_en: string;
  city_ka: string;
  city_en: string;
  region_ka: string;
  region_en: string;

  // Education
  education_level: string;
  education_field_ka: string;
  education_field_en: string;
  university_ka: string;
  university_en: string;
  graduation_year: number | null;

  // Professional
  employment_status: string;
  current_position_ka: string;
  current_position_en: string;
  current_employer_ka: string;
  current_employer_en: string;
  years_of_experience: number;
  portfolio_url: string;
  linkedin_url: string;
  github_url: string;
  website_url: string;

  // Business / Project
  business_name_ka: string;
  business_name_en: string;
  business_type: string;
  business_description_ka: string;
  business_description_en: string;
  business_registration_number: string;
  business_website: string;
  business_social_media: string;

  // Project Details
  project_title_ka: string;
  project_title_en: string;
  project_description_ka: string;
  project_description_en: string;
  project_category: string;
  project_goals_ka: string;
  project_goals_en: string;
  target_audience_ka: string;
  target_audience_en: string;
  expected_outcomes_ka: string;
  expected_outcomes_en: string;
  project_timeline: string;
  project_budget_estimate: string;

  // Technical
  technical_requirements_ka: string;
  technical_requirements_en: string;
  has_existing_tech: boolean;
  existing_tech_stack: string;
  tech_stack: string;
  design_needs: string;
  content_readiness: string;

  // Team
  team_size: string;
  team_skills: string;
  needs_hiring: boolean;
  hiring_needs: string;

  // Legal & Compliance
  agreed_to_terms: boolean;
  agreed_to_privacy: boolean;
  confirmed_eligibility: boolean;
  confirmed_accuracy: boolean;
  confirmation_statement: string;
  signature: string;
  signature_date: string | null;

  // Additional
  additional_info_ka: string;
  additional_info_en: string;
  how_heard: string;
  consent_contact: boolean;
  consent_marketing: boolean;

  // Status
  status: CampaignApplicationStatus;
  assigned_reviewer_id: string | null;
  reviewed_at: string | null;
  reviewer_notes: string;

  // Metadata
  submitted_at: string;
  updated_at: string;
  created_at: string;
}

export interface CampaignApplicationDraft {
  id: string;
  session_id: string;
  locale: 'ka' | 'en';
  current_step: number;
  total_steps: number;
  form_data: Record<string, unknown>;
  completed_steps: number[];
  expires_at: string;
}

export interface CampaignApplicationStep {
  id: string;
  application_id: string;
  step_number: number;
  step_key: string;
  is_completed: boolean;
  completed_at: string | null;
}

export interface CampaignStatusHistory {
  id: string;
  application_id: string;
  previous_status: CampaignApplicationStatus | null;
  new_status: CampaignApplicationStatus;
  changed_by: string | null;
  notes: string;
  is_public: boolean;
  created_at: string;
}

// ── Evaluation Types ────────────────────────────────────────────────────

export interface CampaignEvaluation {
  id: string;
  application_id: string;
  evaluator_id: string;
  score_legality: number;
  score_digital_need: number;
  score_business_strategy: number;
  score_realism: number;
  score_readiness: number;
  score_cooperation: number;
  score_cultural_value: number;
  score_portfolio_value: number;
  score_technical_risk: number;
  estimated_hours: number;
  recommended_funding_amount: number;
  recommended_funding_percentage: number;
  comments_ka: string;
  comments_en: string;
  is_final: boolean;
  created_at: string;
  updated_at: string;
}

// ── Interview Types ─────────────────────────────────────────────────────

export interface CampaignInterview {
  id: string;
  application_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  meeting_url: string;
  interviewers: string[];
  notes_ka: string;
  notes_en: string;
  result: CampaignInterviewResult;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Offer Types ─────────────────────────────────────────────────────────

export interface CampaignOffer {
  id: string;
  application_id: string;
  funding_percentage: number;
  funding_amount: number;
  client_amount: number;
  deadline: string;
  status: CampaignOfferStatus;
  notes_ka: string;
  notes_en: string;
  responded_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Reserved Candidate ──────────────────────────────────────────────────

export interface CampaignReservedCandidate {
  id: string;
  application_id: string;
  reserved_by: string | null;
  notes_ka: string;
  notes_en: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Email Types ─────────────────────────────────────────────────────────

export interface CampaignEmailTemplate {
  id: string;
  event: CampaignEmailEvent;
  subject_ka: string;
  subject_en: string;
  body_ka: string;
  body_en: string;
  is_active: boolean;
}

export interface CampaignEmailLog {
  id: string;
  application_id: string | null;
  template_id: string | null;
  event: CampaignEmailEvent;
  recipient_email: string;
  subject: string;
  body: string;
  sent_at: string;
  delivered: boolean;
  error: string;
}

// ── Campaign Localized Helpers ──────────────────────────────────────────

export interface CampaignLocalizedContent {
  sections: Record<string, CampaignSection>;
  faq: CampaignFAQ[];
  cards: Record<string, CampaignCard[]>;
  timeline: Record<string, CampaignTimelineItem[]>;
  statistics: Record<string, CampaignStatistic[]>;
  cta: Record<string, CampaignCTA>;
  settings: Record<string, string>;
  seo: CampaignSEO | null;
  pages: CampaignPage[];
}

export function localizeCampaignText(
  record: Record<string, unknown>,
  field: string,
  locale: string
): string {
  const val = record[`${field}_${locale}`];
  return typeof val === 'string' ? val : '';
}

export function localizeCampaignSection(
  section: CampaignSection,
  locale: string
): CampaignSection {
  const record = section as unknown as Record<string, unknown>;
  return {
    ...section,
    title_ka: String(record.title_ka || ''),
    title_en: String(record.title_en || ''),
    subtitle_ka: String(record.subtitle_ka || ''),
    subtitle_en: String(record.subtitle_en || ''),
    description_ka: String(record.description_ka || ''),
    description_en: String(record.description_en || ''),
    content_ka: String(record.content_ka || ''),
    content_en: String(record.content_en || ''),
    badge_ka: String(record.badge_ka || ''),
    badge_en: String(record.badge_en || ''),
    button_text_ka: String(record.button_text_ka || ''),
    button_text_en: String(record.button_text_en || ''),
  };
}

// ── Application Form Types ──────────────────────────────────────────────

export const APPLICATION_STEPS = [
  { key: 'personal', title_ka: 'პირადი ინფორმაცია', title_en: 'Personal Information' },
  { key: 'contact', title_ka: 'საკონტაქტო ინფორმაცია', title_en: 'Contact Information' },
  { key: 'education', title_ka: 'განათლება', title_en: 'Education' },
  { key: 'professional', title_ka: 'პროფესიული გამოცდილება', title_en: 'Professional Experience' },
  { key: 'business', title_ka: 'ბიზნეს ინფორმაცია', title_en: 'Business Information' },
  { key: 'project', title_ka: 'პროექტის დეტალები', title_en: 'Project Details' },
  { key: 'goals', title_ka: 'მიზნები და შედეგები', title_en: 'Goals & Outcomes' },
  { key: 'technical', title_ka: 'ტექნიკური მოთხოვნები', title_en: 'Technical Requirements' },
  { key: 'team', title_ka: 'გუნდი', title_en: 'Team' },
  { key: 'budget', title_ka: 'ბიუჯეტი', title_en: 'Budget' },
  { key: 'timeline', title_ka: 'ვადები', title_en: 'Timeline' },
  { key: 'references', title_ka: 'რეფერენციები', title_en: 'References' },
  { key: 'legal', title_ka: 'იურიდიული პირობები', title_en: 'Legal & Compliance' },
  { key: 'additional', title_ka: 'დამატებითი ინფორმაცია', title_en: 'Additional Information' },
  { key: 'review', title_ka: 'განხილვა და დადასტურება', title_en: 'Review & Confirm' },
] as const;

export const CAMPAIGN_STATUS_LABELS: Record<CampaignApplicationStatus, { ka: string; en: string }> = {
  UNOPENED: { ka: 'გაუხსნელი', en: 'Unopened' },
  CHECKED: { ka: 'შემოწმებული', en: 'Checked' },
};

export const APPLICATION_STEP_KEYS = APPLICATION_STEPS.map(s => s.key);
export type ApplicationStepKey = (typeof APPLICATION_STEP_KEYS)[number];
