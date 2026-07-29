-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Entrepreneur Support Campaign Schema (v3)
-- ═══════════════════════════════════════════════════════════════════════════
-- Complete campaign module with pages, sections, FAQ, applications,
-- evaluations, interviews, offers, emails, and SEO.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── ENUMS ────────────────────────────────────────────────────────────────

do $$ begin
  create type public.campaign_application_status as enum (
    'draft', 'submitted', 'received', 'initial_review', 'need_more_information',
    'shortlisted', 'interview_scheduled', 'technical_review', 'conditional_offer',
    'offer_accepted', 'offer_declined', 'reserve_list', 'winner', 'rejected',
    'contract', 'in_progress', 'completed', 'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.campaign_interview_result as enum ('pending', 'passed', 'failed', 'no_show');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.campaign_offer_status as enum ('pending', 'accepted', 'declined', 'expired');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.campaign_email_event as enum (
    'application_received', 'interview_invitation', 'need_more_information',
    'offer_made', 'status_changed', 'final_decision', 'application_draft_saved'
  );
exception when duplicate_object then null;
end $$;

-- ── CMS CONTENT TABLES ──────────────────────────────────────────────────

create table if not exists public.campaign_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ka text not null default '',
  title_en text not null default '',
  subtitle_ka text not null default '',
  subtitle_en text not null default '',
  description_ka text not null default '',
  description_en text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_sections (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  section_key text not null,
  section_type text not null default 'content',
  title_ka text not null default '',
  title_en text not null default '',
  subtitle_ka text not null default '',
  subtitle_en text not null default '',
  description_ka text not null default '',
  description_en text not null default '',
  content_ka text not null default '',
  content_en text not null default '',
  image text not null default '',
  icon text not null default '',
  badge_ka text not null default '',
  badge_en text not null default '',
  button_text_ka text not null default '',
  button_text_en text not null default '',
  button_url text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_sections_page_key_unique unique (page_slug, section_key)
);

create table if not exists public.campaign_faq (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  question_ka text not null default '',
  question_en text not null default '',
  answer_ka text not null default '',
  answer_en text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_cards (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  section_key text not null,
  title_ka text not null default '',
  title_en text not null default '',
  description_ka text not null default '',
  description_en text not null default '',
  image text not null default '',
  icon text not null default '',
  badge_ka text not null default '',
  badge_en text not null default '',
  button_text_ka text not null default '',
  button_text_en text not null default '',
  button_url text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_timeline (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  section_key text not null,
  date_ka text not null default '',
  date_en text not null default '',
  title_ka text not null default '',
  title_en text not null default '',
  description_ka text not null default '',
  description_en text not null default '',
  icon text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_statistics (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  section_key text not null,
  label_ka text not null default '',
  label_en text not null default '',
  value numeric not null default 0,
  suffix_ka text not null default '',
  suffix_en text not null default '',
  icon text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_cta (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  section_key text not null,
  title_ka text not null default '',
  title_en text not null default '',
  description_ka text not null default '',
  description_en text not null default '',
  button_text_ka text not null default '',
  button_text_en text not null default '',
  button_url text not null default '',
  secondary_button_text_ka text not null default '',
  secondary_button_text_en text not null default '',
  secondary_button_url text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value_ka text not null default '',
  setting_value_en text not null default '',
  setting_type text not null default 'text'
    check (setting_type in ('text', 'textarea', 'url', 'image', 'boolean', 'json', 'number')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_seo (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null unique,
  title_ka text not null default '',
  title_en text not null default '',
  description_ka text not null default '',
  description_en text not null default '',
  keywords_ka text not null default '',
  keywords_en text not null default '',
  canonical_url text not null default '',
  og_title_ka text not null default '',
  og_title_en text not null default '',
  og_description_ka text not null default '',
  og_description_en text not null default '',
  og_image text not null default '',
  twitter_title_ka text not null default '',
  twitter_title_en text not null default '',
  twitter_description_ka text not null default '',
  twitter_description_en text not null default '',
  twitter_image text not null default '',
  schema_markup jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── APPLICATION TABLES ──────────────────────────────────────────────────

create table if not exists public.campaign_applications (
  id uuid primary key default gen_random_uuid(),
  application_number text not null unique,
  locale text not null default 'ka' check (locale in ('ka', 'en')),

  -- Personal Information
  first_name_ka text not null default '',
  first_name_en text not null default '',
  last_name_ka text not null default '',
  last_name_en text not null default '',
  email text not null,
  phone text not null default '',
  date_of_birth date,
  gender text not null default '',
  id_number text not null default '',

  -- Contact
  address_ka text not null default '',
  address_en text not null default '',
  city_ka text not null default '',
  city_en text not null default '',
  region_ka text not null default '',
  region_en text not null default '',

  -- Education
  education_level text not null default '',
  education_field_ka text not null default '',
  education_field_en text not null default '',
  university_ka text not null default '',
  university_en text not null default '',
  graduation_year integer,

  -- Professional
  employment_status text not null default '',
  current_position_ka text not null default '',
  current_position_en text not null default '',
  current_employer_ka text not null default '',
  current_employer_en text not null default '',
  years_of_experience integer default 0,
  portfolio_url text not null default '',
  linkedin_url text not null default '',
  github_url text not null default '',
  website_url text not null default '',

  -- Business / Project
  business_name_ka text not null default '',
  business_name_en text not null default '',
  business_type text not null default '',
  business_description_ka text not null default '',
  business_description_en text not null default '',
  business_registration_number text not null default '',
  business_website text not null default '',
  business_social_media text not null default '',

  -- Project Details
  project_title_ka text not null default '',
  project_title_en text not null default '',
  project_description_ka text not null default '',
  project_description_en text not null default '',
  project_category text not null default '',
  project_goals_ka text not null default '',
  project_goals_en text not null default '',
  target_audience_ka text not null default '',
  target_audience_en text not null default '',
  expected_outcomes_ka text not null default '',
  expected_outcomes_en text not null default '',
  project_timeline text not null default '',
  project_budget_estimate text not null default '',

  -- Technical
  technical_requirements_ka text not null default '',
  technical_requirements_en text not null default '',
  has_existing_tech boolean not null default false,
  existing_tech_stack text not null default '',
  tech_stack text not null default '',
  design_needs text not null default '',
  content_readiness text not null default '',

  -- Team
  team_size text not null default '',
  team_skills text not null default '',
  needs_hiring boolean not null default false,
  hiring_needs text not null default '',

  -- Legal & Compliance
  agreed_to_terms boolean not null default false,
  agreed_to_privacy boolean not null default false,
  confirmed_eligibility boolean not null default false,
  confirmed_accuracy boolean not null default false,
  confirmation_statement text not null default '',
  signature text not null default '',
  signature_date date,

  -- Additional
  additional_info_ka text not null default '',
  additional_info_en text not null default '',
  how_heard text not null default '',
  consent_contact boolean not null default false,
  consent_marketing boolean not null default false,

  -- Status
  status public.campaign_application_status not null default 'submitted',
  assigned_reviewer_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  reviewer_notes text not null default '',

  -- Metadata
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_application_drafts (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  locale text not null default 'ka' check (locale in ('ka', 'en')),
  current_step integer not null default 0,
  total_steps integer not null default 15,
  form_data jsonb not null default '{}'::jsonb,
  completed_steps integer[] not null default '{}',
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_application_steps (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.campaign_applications(id) on delete cascade,
  step_number integer not null,
  step_key text not null,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_app_steps_unique unique (application_id, step_number)
);

create table if not exists public.campaign_application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.campaign_applications(id) on delete cascade,
  previous_status public.campaign_application_status,
  new_status public.campaign_application_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  notes text not null default '',
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── EVALUATION ──────────────────────────────────────────────────────────

create table if not exists public.campaign_evaluations (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.campaign_applications(id) on delete cascade,
  evaluator_id uuid not null references auth.users(id) on delete set null,
  score_legality integer not null default 0 check (score_legality between 0 and 10),
  score_digital_need integer not null default 0 check (score_digital_need between 0 and 10),
  score_business_strategy integer not null default 0 check (score_business_strategy between 0 and 10),
  score_realism integer not null default 0 check (score_realism between 0 and 10),
  score_readiness integer not null default 0 check (score_readiness between 0 and 10),
  score_cooperation integer not null default 0 check (score_cooperation between 0 and 10),
  score_cultural_value integer not null default 0 check (score_cultural_value between 0 and 10),
  score_portfolio_value integer not null default 0 check (score_portfolio_value between 0 and 10),
  score_technical_risk integer not null default 0 check (score_technical_risk between 0 and 10),
  estimated_hours numeric not null default 0,
  recommended_funding_amount numeric not null default 0,
  recommended_funding_percentage numeric not null default 0 check (recommended_funding_percentage between 0 and 100),
  comments_ka text not null default '',
  comments_en text not null default '',
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_eval_unique unique (application_id, evaluator_id)
);

-- ── INTERVIEWS ──────────────────────────────────────────────────────────

create table if not exists public.campaign_interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.campaign_applications(id) on delete cascade,
  scheduled_date date not null,
  scheduled_time time not null,
  duration_minutes integer not null default 30,
  meeting_url text not null default '',
  interviewers text[] not null default '{}',
  notes_ka text not null default '',
  notes_en text not null default '',
  result public.campaign_interview_result not null default 'pending',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── OFFERS ──────────────────────────────────────────────────────────────

create table if not exists public.campaign_offers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.campaign_applications(id) on delete cascade,
  funding_percentage numeric not null default 0 check (funding_percentage between 0 and 100),
  funding_amount numeric not null default 0,
  client_amount numeric not null default 0,
  deadline date not null,
  status public.campaign_offer_status not null default 'pending',
  notes_ka text not null default '',
  notes_en text not null default '',
  responded_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── RESERVED CANDIDATES ─────────────────────────────────────────────────

create table if not exists public.campaign_reserved_candidates (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.campaign_applications(id) on delete cascade,
  reserved_by uuid references auth.users(id) on delete set null,
  notes_ka text not null default '',
  notes_en text not null default '',
  expires_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── EMAIL TEMPLATES ─────────────────────────────────────────────────────

create table if not exists public.campaign_email_templates (
  id uuid primary key default gen_random_uuid(),
  event public.campaign_email_event not null unique,
  subject_ka text not null default '',
  subject_en text not null default '',
  body_ka text not null default '',
  body_en text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── EMAIL LOG ───────────────────────────────────────────────────────────

create table if not exists public.campaign_email_log (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.campaign_applications(id) on delete set null,
  template_id uuid references public.campaign_email_templates(id) on delete set null,
  event public.campaign_email_event not null,
  recipient_email text not null,
  subject text not null,
  body text not null,
  sent_at timestamptz not null default now(),
  delivered boolean not null default true,
  error text not null default ''
);

-- ── INDEXES ─────────────────────────────────────────────────────────────

create index if not exists campaign_sections_page_idx on public.campaign_sections (page_slug, sort_order);
create index if not exists campaign_faq_page_idx on public.campaign_faq (page_slug, sort_order);
create index if not exists campaign_cards_page_idx on public.campaign_cards (page_slug, section_key, sort_order);
create index if not exists campaign_timeline_page_idx on public.campaign_timeline (page_slug, section_key, sort_order);
create index if not exists campaign_statistics_page_idx on public.campaign_statistics (page_slug, section_key, sort_order);
create index if not exists campaign_cta_page_idx on public.campaign_cta (page_slug, section_key);

create index if not exists campaign_applications_status_idx on public.campaign_applications (status);
create index if not exists campaign_applications_number_idx on public.campaign_applications (application_number);
create index if not exists campaign_applications_email_idx on public.campaign_applications (email);
create index if not exists campaign_applications_submitted_idx on public.campaign_applications (submitted_at desc);
create index if not exists campaign_applications_reviewer_idx on public.campaign_applications (assigned_reviewer_id);

create index if not exists campaign_app_drafts_session_idx on public.campaign_application_drafts (session_id);
create index if not exists campaign_app_drafts_expires_idx on public.campaign_application_drafts (expires_at);

create index if not exists campaign_app_history_app_idx on public.campaign_application_status_history (application_id, created_at desc);
create index if not exists campaign_evaluations_app_idx on public.campaign_evaluations (application_id);
create index if not exists campaign_interviews_app_idx on public.campaign_interviews (application_id);
create index if not exists campaign_offers_app_idx on public.campaign_offers (application_id);
create index if not exists campaign_reserved_app_idx on public.campaign_reserved_candidates (application_id);
create index if not exists campaign_email_log_app_idx on public.campaign_email_log (application_id);
create index if not exists campaign_email_log_sent_idx on public.campaign_email_log (sent_at desc);

-- ── TRIGGERS ────────────────────────────────────────────────────────────

create trigger campaign_pages_set_updated_at
  before update on public.campaign_pages
  for each row execute function public.set_updated_at();

create trigger campaign_sections_set_updated_at
  before update on public.campaign_sections
  for each row execute function public.set_updated_at();

create trigger campaign_faq_set_updated_at
  before update on public.campaign_faq
  for each row execute function public.set_updated_at();

create trigger campaign_cards_set_updated_at
  before update on public.campaign_cards
  for each row execute function public.set_updated_at();

create trigger campaign_timeline_set_updated_at
  before update on public.campaign_timeline
  for each row execute function public.set_updated_at();

create trigger campaign_statistics_set_updated_at
  before update on public.campaign_statistics
  for each row execute function public.set_updated_at();

create trigger campaign_cta_set_updated_at
  before update on public.campaign_cta
  for each row execute function public.set_updated_at();

create trigger campaign_settings_set_updated_at
  before update on public.campaign_settings
  for each row execute function public.set_updated_at();

create trigger campaign_seo_set_updated_at
  before update on public.campaign_seo
  for each row execute function public.set_updated_at();

create trigger campaign_applications_set_updated_at
  before update on public.campaign_applications
  for each row execute function public.set_updated_at();

create trigger campaign_application_drafts_set_updated_at
  before update on public.campaign_application_drafts
  for each row execute function public.set_updated_at();

create trigger campaign_application_steps_set_updated_at
  before update on public.campaign_application_steps
  for each row execute function public.set_updated_at();

create trigger campaign_evaluations_set_updated_at
  before update on public.campaign_evaluations
  for each row execute function public.set_updated_at();

create trigger campaign_interviews_set_updated_at
  before update on public.campaign_interviews
  for each row execute function public.set_updated_at();

create trigger campaign_offers_set_updated_at
  before update on public.campaign_offers
  for each row execute function public.set_updated_at();

create trigger campaign_reserved_candidates_set_updated_at
  before update on public.campaign_reserved_candidates
  for each row execute function public.set_updated_at();

create trigger campaign_email_templates_set_updated_at
  before update on public.campaign_email_templates
  for each row execute function public.set_updated_at();

-- ── APPLICATION NUMBER AUTO-GENERATION ──────────────────────────────────

create sequence if not exists public.campaign_application_number_seq start 1 increment 1;

create or replace function public.generate_campaign_application_number()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select 'BTA-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.campaign_application_number_seq')::text, 6, '0');
$$;

grant execute on function public.generate_campaign_application_number() to anon, authenticated;
grant usage on sequence public.campaign_application_number_seq to anon, authenticated;

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────────────

alter table public.campaign_pages enable row level security;
alter table public.campaign_sections enable row level security;
alter table public.campaign_faq enable row level security;
alter table public.campaign_cards enable row level security;
alter table public.campaign_timeline enable row level security;
alter table public.campaign_statistics enable row level security;
alter table public.campaign_cta enable row level security;
alter table public.campaign_settings enable row level security;
alter table public.campaign_seo enable row level security;
alter table public.campaign_applications enable row level security;
alter table public.campaign_application_drafts enable row level security;
alter table public.campaign_application_steps enable row level security;
alter table public.campaign_application_status_history enable row level security;
alter table public.campaign_evaluations enable row level security;
alter table public.campaign_interviews enable row level security;
alter table public.campaign_offers enable row level security;
alter table public.campaign_reserved_candidates enable row level security;
alter table public.campaign_email_templates enable row level security;
alter table public.campaign_email_log enable row level security;

-- ── RLS POLICIES: PUBLIC READ ───────────────────────────────────────────

create policy "Public can read campaign pages"
  on public.campaign_pages for select to anon, authenticated
  using (is_active = true);

create policy "Public can read campaign sections"
  on public.campaign_sections for select to anon, authenticated
  using (is_active = true);

create policy "Public can read campaign faq"
  on public.campaign_faq for select to anon, authenticated
  using (is_active = true);

create policy "Public can read campaign cards"
  on public.campaign_cards for select to anon, authenticated
  using (is_active = true);

create policy "Public can read campaign timeline"
  on public.campaign_timeline for select to anon, authenticated
  using (is_active = true);

create policy "Public can read campaign statistics"
  on public.campaign_statistics for select to anon, authenticated
  using (is_active = true);

create policy "Public can read campaign cta"
  on public.campaign_cta for select to anon, authenticated
  using (is_active = true);

create policy "Public can read campaign settings"
  on public.campaign_settings for select to anon, authenticated
  using (is_active = true);

create policy "Public can read campaign seo"
  on public.campaign_seo for select to anon, authenticated
  using (is_active = true);

-- ── RLS POLICIES: PUBLIC INSERT (applications) ──────────────────────────

create policy "Public can submit applications"
  on public.campaign_applications for insert to anon, authenticated
  with check (true);

create policy "Applicant can read own application by number"
  on public.campaign_applications for select to anon, authenticated
  using (true);

create policy "Public can create drafts"
  on public.campaign_application_drafts for insert to anon, authenticated
  with check (true);

create policy "Public can read own drafts"
  on public.campaign_application_drafts for select to anon, authenticated
  using (true);

create policy "Public can update own drafts"
  on public.campaign_application_drafts for update to anon, authenticated
  using (true);

-- ── RLS POLICIES: ADMIN ─────────────────────────────────────────────────

create policy "Admins can manage campaign pages"
  on public.campaign_pages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign sections"
  on public.campaign_sections for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign faq"
  on public.campaign_faq for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign cards"
  on public.campaign_cards for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign timeline"
  on public.campaign_timeline for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign statistics"
  on public.campaign_statistics for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign cta"
  on public.campaign_cta for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign settings"
  on public.campaign_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign seo"
  on public.campaign_seo for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign applications"
  on public.campaign_applications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign drafts"
  on public.campaign_application_drafts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign steps"
  on public.campaign_application_steps for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign status history"
  on public.campaign_application_status_history for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign evaluations"
  on public.campaign_evaluations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign interviews"
  on public.campaign_interviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign offers"
  on public.campaign_offers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign reserved candidates"
  on public.campaign_reserved_candidates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign email templates"
  on public.campaign_email_templates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage campaign email log"
  on public.campaign_email_log for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
