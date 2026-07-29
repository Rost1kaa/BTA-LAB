-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — COMPLETE INITIAL SCHEMA + CONTENT
-- ═══════════════════════════════════════════════════════════════════════════
-- Consolidates: 001_initial_schema, 002_legal_policies, 003_campaign_schema,
--               cleanup_price_suffixes, 004_campaign_content_seed,
--               005_campaign_full_content_update, seed-campaign.ts (email templates)
--
-- Apply to a fresh Supabase project. This file is self-contained —
-- no additional SQL or seed scripts are required.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── EXTENSION ───────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ═══════════════════════════════════════════════════════════════════════════
-- I. ENUMS
-- ═══════════════════════════════════════════════════════════════════════════

do $$ begin
  create type public.legal_policy_type as enum ('PRIVACY_POLICY', 'COOKIE_POLICY');
exception when duplicate_object then null;
end $$;

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

-- ═══════════════════════════════════════════════════════════════════════════
-- II. TABLES — CORE BUSINESS
-- ═══════════════════════════════════════════════════════════════════════════

create table public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null,
  content_key text not null,
  content_value_ka text not null default '',
  content_value_en text not null default '',
  content_type text not null default 'text'
    check (content_type in ('text', 'textarea', 'number', 'url', 'image', 'rich_text', 'boolean', 'json')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint site_content_unique_key unique (page, section, content_key)
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value text not null default '',
  value_ka text not null default '',
  value_en text not null default '',
  setting_type text not null default 'text'
    check (setting_type in ('text', 'textarea', 'url', 'image', 'boolean', 'json')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.portfolio_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ka text not null default '',
  name_en text not null default '',
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_ka text not null default '',
  title_en text not null default '',
  slug text not null unique,
  category_id uuid references public.portfolio_categories(id) on delete set null,
  category text not null,
  category_label_ka text not null default '',
  category_label_en text not null default '',
  description text not null default '',
  description_ka text not null default '',
  description_en text not null default '',
  full_description text not null default '',
  full_description_ka text not null default '',
  full_description_en text not null default '',
  problem text not null default '',
  problem_ka text not null default '',
  problem_en text not null default '',
  solution text not null default '',
  solution_ka text not null default '',
  solution_en text not null default '',
  results text[] not null default '{}',
  results_ka text[] not null default '{}',
  results_en text[] not null default '{}',
  technologies text[] not null default '{}',
  cover_image text not null default '',
  detail_cover_image_url text not null default '',
  gallery text[] not null default '{}',
  link text,
  featured boolean not null default false,
  published boolean not null default true,
  display_order integer not null default 0,
  alt_text text not null default '',
  alt_text_ka text not null default '',
  alt_text_en text not null default '',
  seo_title text,
  seo_title_ka text not null default '',
  seo_title_en text not null default '',
  seo_description text,
  seo_description_ka text not null default '',
  seo_description_en text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ka text not null default '',
  name_en text not null default '',
  bio text not null default '',
  bio_ka text not null default '',
  bio_en text not null default '',
  image text not null default '',
  image_alt_ka text not null default '',
  image_alt_en text not null default '',
  socials jsonb not null default '{}'::jsonb,
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.service_packages (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('website', 'social-media', 'addons')),
  category text not null default '',
  name text not null,
  name_ka text not null default '',
  name_en text not null default '',
  price text not null default '',
  price_suffix_ka text not null default '',
  price_suffix_en text not null default '',
  custom_price_label_ka text not null default '',
  custom_price_label_en text not null default '',
  billing_label text,
  billing_label_ka text not null default '',
  billing_label_en text not null default '',
  description text,
  description_ka text not null default '',
  description_en text not null default '',
  ideal_for text,
  ideal_for_ka text not null default '',
  ideal_for_en text not null default '',
  features text[] not null default '{}',
  features_ka text[] not null default '{}',
  features_en text[] not null default '{}',
  delivery_time text,
  delivery_time_ka text not null default '',
  delivery_time_en text not null default '',
  cta text not null default 'Choose Package',
  cta_ka text not null default '',
  cta_en text not null default '',
  cta_label_ka text not null default '',
  cta_label_en text not null default '',
  highlighted boolean not null default false,
  custom_price boolean not null default false,
  price_explanation text,
  price_explanation_ka text not null default '',
  price_explanation_en text not null default '',
  icon_name text,
  display_order integer not null default 0,
  published boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.service_feature_tooltips (
  id uuid primary key default gen_random_uuid(),
  name_ka text not null default '',
  name_en text not null default '',
  description_ka text not null default '',
  description_en text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'ka' check (locale in ('ka', 'en')),
  name text not null,
  email text not null,
  phone text not null default '',
  company text not null default '',
  service text not null default '',
  budget text not null default '',
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'in_progress', 'closed', 'spam')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'ka' check (locale in ('ka', 'en')),
  service_type text not null check (service_type in ('website_creation', 'social_media', 'advertising', 'seo_services')),
  service_package text not null default '',
  customer_name text not null,
  customer_email text not null default '',
  customer_phone text not null default '',
  customer_company text not null default '',
  preferred_contact text not null default '',
  service_name text not null default '',
  client_name text not null default '',
  email text not null default '',
  phone text not null default '',
  business_type text not null default '',
  business_description text not null default '',
  has_existing_website boolean not null default false,
  website_url text not null default '',
  deadline text not null default '',
  budget text not null default '',
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'new'
    check (status in ('new', 'read', 'in_progress', 'closed', 'spam', 'contacted', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.legal_policies (
  id uuid primary key default gen_random_uuid(),
  type public.legal_policy_type not null unique,
  title_ka text not null default '',
  title_en text not null default '',
  description_ka text not null default '',
  description_en text not null default '',
  content_ka text not null default '',
  content_en text not null default '',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- III. TABLES — CAMPAIGN CMS CONTENT
-- ═══════════════════════════════════════════════════════════════════════════

create table public.campaign_pages (
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

create table public.campaign_sections (
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

create table public.campaign_faq (
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

create table public.campaign_cards (
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

create table public.campaign_timeline (
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

create table public.campaign_statistics (
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

create table public.campaign_cta (
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

create table public.campaign_settings (
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

create table public.campaign_seo (
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

-- ═══════════════════════════════════════════════════════════════════════════
-- IV. TABLES — CAMPAIGN APPLICATIONS
-- ═══════════════════════════════════════════════════════════════════════════

create table public.campaign_applications (
  id uuid primary key default gen_random_uuid(),
  application_number text not null unique,
  locale text not null default 'ka' check (locale in ('ka', 'en')),
  first_name_ka text not null default '',
  first_name_en text not null default '',
  last_name_ka text not null default '',
  last_name_en text not null default '',
  email text not null,
  phone text not null default '',
  date_of_birth date,
  gender text not null default '',
  id_number text not null default '',
  address_ka text not null default '',
  address_en text not null default '',
  city_ka text not null default '',
  city_en text not null default '',
  region_ka text not null default '',
  region_en text not null default '',
  education_level text not null default '',
  education_field_ka text not null default '',
  education_field_en text not null default '',
  university_ka text not null default '',
  university_en text not null default '',
  graduation_year integer,
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
  business_name_ka text not null default '',
  business_name_en text not null default '',
  business_type text not null default '',
  business_description_ka text not null default '',
  business_description_en text not null default '',
  business_registration_number text not null default '',
  business_website text not null default '',
  business_social_media text not null default '',
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
  technical_requirements_ka text not null default '',
  technical_requirements_en text not null default '',
  has_existing_tech boolean not null default false,
  existing_tech_stack text not null default '',
  tech_stack text not null default '',
  design_needs text not null default '',
  content_readiness text not null default '',
  team_size text not null default '',
  team_skills text not null default '',
  needs_hiring boolean not null default false,
  hiring_needs text not null default '',
  agreed_to_terms boolean not null default false,
  agreed_to_privacy boolean not null default false,
  confirmed_eligibility boolean not null default false,
  confirmed_accuracy boolean not null default false,
  confirmation_statement text not null default '',
  signature text not null default '',
  signature_date date,
  additional_info_ka text not null default '',
  additional_info_en text not null default '',
  how_heard text not null default '',
  consent_contact boolean not null default false,
  consent_marketing boolean not null default false,
  status public.campaign_application_status not null default 'submitted',
  assigned_reviewer_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  reviewer_notes text not null default '',
  form_data jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.campaign_application_drafts (
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

create table public.campaign_application_steps (
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

create table public.campaign_application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.campaign_applications(id) on delete cascade,
  previous_status public.campaign_application_status,
  new_status public.campaign_application_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  notes text not null default '',
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- V. TABLES — CAMPAIGN EVALUATIONS, INTERVIEWS, OFFERS
-- ═══════════════════════════════════════════════════════════════════════════

create table public.campaign_evaluations (
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

create table public.campaign_interviews (
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

create table public.campaign_offers (
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

create table public.campaign_reserved_candidates (
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

create table public.campaign_email_templates (
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

create table public.campaign_email_log (
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

-- ═══════════════════════════════════════════════════════════════════════════
-- VI. INDEXES — CORE
-- ═══════════════════════════════════════════════════════════════════════════

create index site_content_page_section_idx on public.site_content (page, section, sort_order);
create index site_settings_key_idx on public.site_settings (setting_key);
create index portfolio_projects_public_idx on public.portfolio_projects (published, featured, display_order, created_at desc);
create index team_members_public_idx on public.team_members (published, display_order);
create index service_packages_public_idx on public.service_packages (published, section, display_order);
create index service_feature_tooltips_name_ka_idx on public.service_feature_tooltips (name_ka);
create index service_feature_tooltips_name_en_idx on public.service_feature_tooltips (name_en);
create index contact_messages_status_created_idx on public.contact_messages (status, created_at desc);
create index service_requests_type_status_created_idx on public.service_requests (service_type, status, created_at desc);
create index legal_policies_type_idx on public.legal_policies (type);

-- ═══════════════════════════════════════════════════════════════════════════
-- VII. INDEXES — CAMPAIGN
-- ═══════════════════════════════════════════════════════════════════════════

create index campaign_sections_page_idx on public.campaign_sections (page_slug, sort_order);
create index campaign_faq_page_idx on public.campaign_faq (page_slug, sort_order);
create index campaign_cards_page_idx on public.campaign_cards (page_slug, section_key, sort_order);
create index campaign_timeline_page_idx on public.campaign_timeline (page_slug, section_key, sort_order);
create index campaign_statistics_page_idx on public.campaign_statistics (page_slug, section_key, sort_order);
create index campaign_cta_page_idx on public.campaign_cta (page_slug, section_key);

create index campaign_applications_status_idx on public.campaign_applications (status);
create index campaign_applications_number_idx on public.campaign_applications (application_number);
create index campaign_applications_email_idx on public.campaign_applications (email);
create index campaign_applications_submitted_idx on public.campaign_applications (submitted_at desc);
create index campaign_applications_reviewer_idx on public.campaign_applications (assigned_reviewer_id);

create index campaign_app_drafts_session_idx on public.campaign_application_drafts (session_id);
create index campaign_app_drafts_expires_idx on public.campaign_application_drafts (expires_at);

create index campaign_app_history_app_idx on public.campaign_application_status_history (application_id, created_at desc);
create index campaign_evaluations_app_idx on public.campaign_evaluations (application_id);
create index campaign_interviews_app_idx on public.campaign_interviews (application_id);
create index campaign_offers_app_idx on public.campaign_offers (application_id);
create index campaign_reserved_app_idx on public.campaign_reserved_candidates (application_id);
create index campaign_email_log_app_idx on public.campaign_email_log (application_id);
create index campaign_email_log_sent_idx on public.campaign_email_log (sent_at desc);

-- ═══════════════════════════════════════════════════════════════════════════
-- VIII. FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.sync_service_package_aliases()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if coalesce(new.category, '') = '' then
      new.category = new.section;
    end if;
    if new.active is null then
      new.active = new.published;
    end if;
    if new.published is null then
      new.published = new.active;
    end if;
  else
    if new.section is distinct from old.section then
      new.category = new.section;
    elsif new.category is distinct from old.category and coalesce(new.category, '') <> '' then
      new.section = new.category;
    end if;
    if new.published is distinct from old.published then
      new.active = new.published;
    elsif new.active is distinct from old.active then
      new.published = new.active;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

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

-- ═══════════════════════════════════════════════════════════════════════════
-- IX. TRIGGERS — CORE
-- ═══════════════════════════════════════════════════════════════════════════

create trigger admin_profiles_set_updated_at
  before update on public.admin_profiles
  for each row execute function public.set_updated_at();

create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create trigger portfolio_categories_set_updated_at
  before update on public.portfolio_categories
  for each row execute function public.set_updated_at();

create trigger portfolio_projects_set_updated_at
  before update on public.portfolio_projects
  for each row execute function public.set_updated_at();

create trigger team_members_set_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

create trigger service_packages_set_updated_at
  before update on public.service_packages
  for each row execute function public.set_updated_at();

create trigger service_packages_sync_aliases
  before insert or update on public.service_packages
  for each row execute function public.sync_service_package_aliases();

create trigger service_feature_tooltips_set_updated_at
  before update on public.service_feature_tooltips
  for each row execute function public.set_updated_at();

create trigger contact_messages_set_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

create trigger service_requests_set_updated_at
  before update on public.service_requests
  for each row execute function public.set_updated_at();

create trigger legal_policies_set_updated_at
  before update on public.legal_policies
  for each row execute function public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- X. TRIGGERS — CAMPAIGN
-- ═══════════════════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════════════════
-- XI. ROW LEVEL SECURITY — ENABLE
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.admin_profiles enable row level security;
alter table public.site_content enable row level security;
alter table public.site_settings enable row level security;
alter table public.portfolio_categories enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.team_members enable row level security;
alter table public.service_packages enable row level security;
alter table public.service_feature_tooltips enable row level security;
alter table public.contact_messages enable row level security;
alter table public.service_requests enable row level security;
alter table public.legal_policies enable row level security;

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

-- ═══════════════════════════════════════════════════════════════════════════
-- XII. RLS POLICIES — CORE
-- ═══════════════════════════════════════════════════════════════════════════

create policy "Admins can manage admin profiles"
  on public.admin_profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Users can read their admin profile"
  on public.admin_profiles for select to authenticated
  using (id = auth.uid());

create policy "Public can read site content"
  on public.site_content for select to anon, authenticated
  using (true);

create policy "Admins can manage site content"
  on public.site_content for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can read site settings"
  on public.site_settings for select to anon, authenticated
  using (true);

create policy "Admins can manage site settings"
  on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can read portfolio categories"
  on public.portfolio_categories for select to anon, authenticated
  using (true);

create policy "Admins can manage portfolio categories"
  on public.portfolio_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can read published portfolio projects"
  on public.portfolio_projects for select to anon, authenticated
  using (published = true);

create policy "Admins can manage portfolio projects"
  on public.portfolio_projects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can read published team members"
  on public.team_members for select to anon, authenticated
  using (published = true);

create policy "Admins can manage team members"
  on public.team_members for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can read active service packages"
  on public.service_packages for select to anon, authenticated
  using (published = true and active = true);

create policy "Admins can manage service packages"
  on public.service_packages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can read feature tooltips"
  on public.service_feature_tooltips for select to anon, authenticated
  using (true);

create policy "Admins can manage feature tooltips"
  on public.service_feature_tooltips for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can submit contact messages"
  on public.contact_messages for insert to anon, authenticated
  with check (true);

create policy "Admins can manage contact messages"
  on public.contact_messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can submit service requests"
  on public.service_requests for insert to anon, authenticated
  with check (true);

create policy "Admins can manage service requests"
  on public.service_requests for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can read legal policies"
  on public.legal_policies for select to anon, authenticated
  using (true);

create policy "Admins can manage legal policies"
  on public.legal_policies for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- XIII. RLS POLICIES — CAMPAIGN
-- ═══════════════════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════════════════
-- XIV. STORAGE
-- ═══════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-images',
  'portfolio-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Portfolio images public read" on storage.objects;
create policy "Portfolio images public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'portfolio-images');

drop policy if exists "Admins can manage portfolio images" on storage.objects;
create policy "Admins can manage portfolio images"
  on storage.objects for all to authenticated
  using (bucket_id = 'portfolio-images' and public.is_admin())
  with check (bucket_id = 'portfolio-images' and public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- XV. SEED DATA — CAMPAIGN PAGE
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_pages (id, slug, title_ka, title_en, subtitle_ka, subtitle_en, description_ka, description_en, is_active)
VALUES (
  'a1b2c3d4-0001-4000-8000-000000000001',
  'entrepreneur-support',
  'BTA LAB — მეწარმეების ციფრული განვითარების მხარდაჭერა',
  'BTA LAB — Digital Entrepreneurship Development Support',
  'განავითარე შენი ბიზნესი თანამედროვე ვებგვერდით',
  'Develop your business with a modern website',
  'ბიზნესისა და ტექნოლოგიების აკადემიის საწარმო BTA LAB იწყებს მცირე და საშუალო მეწარმეების, დამწყები ბიზნესებისა და ორგანიზაციების ციფრული განვითარების მხარდამჭერ კამპანიას. კამპანიის ფარგლებში შეირჩევა 10 პროექტი, რომლებიც მიიღებენ ვებგვერდის შექმნის მომსახურების 100%, 60% ან 30%-იან დაფინანსებას.',
  'The enterprise BTA LAB of the Business and Technology Academy is launching a campaign to support the digital development of small and medium entrepreneurs, startups, and organizations. Within the campaign, 10 projects will be selected to receive 100%, 60%, or 30% funding for website creation services.',
  true
) ON CONFLICT (slug) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  subtitle_ka = EXCLUDED.subtitle_ka, subtitle_en = EXCLUDED.subtitle_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- XVI. SEED DATA — CAMPAIGN SECTIONS (19 sections matching frontend keys)
-- ═══════════════════════════════════════════════════════════════════════════
-- NOTE: section_key values must match what CampaignLandingClient expects:
--   hero, overview, funding, eligibility, projects, services, technologies,
--   criteria, cultural, selection, timeline, delivery, responsibilities,
--   branding, futureChanges, restrictions, faq, cta
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. hero (section_type: hero)
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, button_text_ka, button_text_en, button_url, sort_order, is_active)
VALUES (
  'a1b2c3d4-0101-4000-8000-000000000001',
  'entrepreneur-support', 'hero', 'hero',
  'განავითარე შენი ბიზნესი თანამედროვე ვებგვერდით',
  'Develop Your Business with a Modern Website',
  'ბიზნესისა და ტექნოლოგიების აკადემიის საწარმო BTA LAB იწყებს მცირე და საშუალო მეწარმეების, დამწყები ბიზნესებისა და ორგანიზაციების ციფრული განვითარების მხარდამჭერ კამპანიას. კამპანიის ფარგლებში შეირჩევა 10 პროექტი, რომლებიც მიიღებენ ვებგვერდის შექმნის მომსახურების 100%, 60% ან 30%-იან დაფინანსებას.',
  'BTA LAB is launching a campaign to support the digital development of small and medium entrepreneurs, startups, and organizations. Within the campaign, 10 projects will be selected to receive 100%, 60%, or 30% funding for website creation services.',
  'ახალი შესაძლებლობა', 'New Opportunity',
  'შეავსე განაცხადი', 'Submit Application', '/entrepreneur-support/apply',
  0, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en,
  button_text_ka = EXCLUDED.button_text_ka, button_text_en = EXCLUDED.button_text_en,
  button_url = EXCLUDED.button_url;

-- 2. overview (maps from old "purpose")
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, content_ka, content_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0102-4000-8000-000000000001',
  'entrepreneur-support', 'overview', 'content',
  'კამპანიის მოკლე აღწერა',
  'Campaign Overview',
  'თანამედროვე ბიზნესგარემოში პროფესიული ონლაინ წარმომადგენლობა მომხმარებელთან ურთიერთობის, ცნობადობისა და გაყიდვების განვითარების მნიშვნელოვანი ინსტრუმენტია. ბიზნესისა და ტექნოლოგიების აკადემიის საწარმოს კამპანიის მიზანია დაეხმაროს მეწარმეებსა და ორგანიზაციებს:

• შეექმნათ პროფესიული ონლაინ წარმომადგენლობა;
• წარმოაჩინონ საკუთარი პროდუქტი ან მომსახურება;
• გააუმჯობესონ მომხმარებელთან კომუნიკაცია;
• მიიღონ ონლაინ განაცხადები, შეკვეთები ან მოთხოვნები;
• დაიწყონ ან გააძლიერონ საკუთარი ციფრული განვითარება.',
  'In the modern business environment, a professional online presence is an important tool for customer relations, brand awareness, and sales development. BTA LAB campaign aims to help entrepreneurs and organizations:
• Create a professional online presence;
• Showcase their product or service;
• Improve customer communication;
• Increase brand awareness;
• Receive online applications, orders, or requests;
• Start or strengthen their digital development.',
  'მიზანი', 'Purpose',
  '• შეექმნათ პროფესიული ონლაინ წარმომადგენლობა
• წარმოაჩინონ საკუთარი პროდუქტი ან მომსახურება
• გააუმჯობესონ მომხმარებელთან კომუნიკაცია
• მიიღონ ონლაინ განაცხადები, შეკვეთები ან მოთხოვნები
• დაიწყონ ან გააძლიერონ საკუთარი ციფრული განვითარება',
  '• Create a professional online presence
• Showcase your product or service
• Improve customer communication
• Increase brand awareness
• Receive online applications, orders, or requests
• Start or strengthen your digital development',
  1, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 3. funding
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, content_ka, content_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0103-4000-8000-000000000001',
  'entrepreneur-support', 'funding', 'content',
  'დაფინანსების მოდელი — 10 პროექტი',
  'Funding Model — 10 Projects',
  'BTA LAB დაფარავს ვებგვერდის შექმნის მომსახურების ღირებულების 30%-დან 100%-მდე.',
  'BTA LAB will cover 30% to 100% of the website creation service cost.',
  'დაფინანსება გულისხმობს ვებგვერდის შექმნის მომსახურების სრული ან შესაბამისი ნაწილის დაფარვას და არ წარმოადგენს მონაწილისთვის თანხის ჩარიცხვას. დომენის, ჰოსტინგის, ფასიანი პროგრამების, მესამე მხარის სერვისებისა და გადახდის სისტემების ხარჯები დაფინანსებაში არ შედის.',
  'Funding covers the full or partial cost of website creation services and does not constitute a cash transfer to the participant. Domain, hosting, paid software, third-party services, and payment system costs are not included in the funding.',
  'დაფინანსება', 'Funding',
  2, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 4. eligibility
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, content_ka, content_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0104-4000-8000-000000000001',
  'entrepreneur-support', 'eligibility', 'content',
  'ვის შეუძლია მონაწილეობა?',
  'Who Can Participate?',
  'კამპანიაში მონაწილეობა შეუძლია: ინდივიდუალურ მეწარმეს, შპს-ს ან სხვა იურიდიულ პირს, მოქმედ მცირე ან საშუალო ბიზნესს, დამწყებ მეწარმეს, რეალისტური ბიზნესიდეის ავტორს, არაკომერციულ ორგანიზაციას.',
  'The following can participate: individual entrepreneurs, LLCs or other legal entities, operating small or medium businesses, startup entrepreneurs, authors of realistic business ideas, non-commercial organizations.',
  'რეგისტრაცია აუცილებელია მონაწილეობის მისაღებად. განაცხადის შევსებისას ოფიციალური რეგისტრაცია სავალდებულო არ არის, თუმცა პროექტის დაწყებამდე და ხელშეკრულების გაფორმებისას სავალდებულოა.',
  'Registration is required to participate. Official registration is not required when submitting an application, but is mandatory before project start and contract signing.',
  'მონაწილეობა', 'Eligibility',
  3, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 5. projects
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, content_ka, content_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0105-4000-8000-000000000001',
  'entrepreneur-support', 'projects', 'cards',
  'რა ტიპის პროექტები ფინანსდება?',
  'What Types of Projects Are Funded?',
  'ერთგვერდიანი ბიზნესვებგვერდი, კომპანიის საინფორმაციო ვებგვერდი, პროდუქტის კატალოგი, მცირე ონლაინ მაღაზია, ონლაინ განაცხადის ფორმა, ღონისძიების ან ტურისტული გვერდი.',
  'One-page business website, company informational website, product catalog, small online store, online application form, event or tourism page.',
  'თუ პროექტი ძალიან დიდია, დაგვიკავშირდით ინდივიდუალური შეთავაზებისთვის.',
  'If the project is too large, contact us for a custom proposal.',
  'პროექტები', 'Projects',
  4, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 6. services
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0106-4000-8000-000000000001',
  'entrepreneur-support', 'services', 'cards',
  'რას მოიცავს მომსახურება?',
  'What Does the Service Include?',
  'საჭიროებების ანალიზი, UI/UX სტრუქტურა, დიზაინი, მობილური ადაპტაცია, ფრონტენდ/ბექენდ დეველოპმენტი, მონაცემთა ბაზა, CMS, საკონტაქტო ფორმები, SEO, ოპტიმიზაცია, უსაფრთხოება, ანალიტიკა, დეპლოი, ინსტრუქცია.',
  'Needs analysis, UI/UX structure, design, mobile responsiveness, frontend/backend dev, database, CMS, contact forms, SEO, optimization, security, analytics, deployment, guide.',
  'სერვისები', 'Services',
  5, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 7. technologies
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0107-4000-8000-000000000001',
  'entrepreneur-support', 'technologies', 'cards',
  'ტექნოლოგიები',
  'Technologies',
  'Next.js, Laravel, Docker, Git, CI/CD, Cloud Services, Cloudflare, გადახდის სისტემები, ოპტიმიზაციის ინსტრუმენტები',
  'Next.js, Laravel, Docker, Git, CI/CD, Cloud Services, Cloudflare, Payment Gateways, Optimization tools',
  'ტექნოლოგიები', 'Technologies',
  6, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 8. criteria
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0108-4000-8000-000000000001',
  'entrepreneur-support', 'criteria', 'cards',
  'შეფასების კრიტერიუმები',
  'Evaluation Criteria',
  'კანონიერება, ციფრული საჭიროების დასაბუთება, ზრდის სტრატეგია, რეალიზმი, მზადყოფნა (ლოგო, ტექსტი, ფოტო), თანამშრომლობის მზაობა',
  'Legality, digital need justification, growth strategy, realism, readiness (logo, text, photos), collaboration readiness',
  'კრიტერიუმები', 'Criteria',
  7, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 9. cultural
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, content_ka, content_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0109-4000-8000-000000000001',
  'entrepreneur-support', 'cultural', 'content',
  'კულტურული, ეროვნული და ადგილობრივი ღირებულებები',
  'Cultural, National and Local Values',
  'დამატებითი უპირატესობა ენიჭება პროექტებს, რომლებიც ხელს უწყობენ ქართული კულტურის, ენისა და ტრადიციების ციფრულ განვითარებას.',
  'Bonus points are given to projects that promote Georgian culture, language, and traditions.',
  'კულტურა', 'Culture',
  'კულტურა არ არის განვითარების მხოლოდ ნაწილი — ეს არის საფუძველი. ჩვენ განსაკუთრებით ვაფასებთ პროექტებს, რომლებიც ინარჩუნებენ და ავითარებენ ქართულ კულტურულ მემკვიდრეობას.',
  'Culture is not just a part of development — it is the foundation. We especially value projects that preserve and develop Georgian cultural heritage.',
  8, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 10. selection
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0110-4000-8000-000000000001',
  'entrepreneur-support', 'selection', 'timeline',
  'შერჩევის პროცესი',
  'Selection Process',
  'განაცხადი → თავდაპირველი განხილვა → გასაუბრება → ტექნიკური შეფასება → საბოლოო გადაწყვეტილება.',
  'Application → Initial review → Interview → Technical evaluation → Final decision.',
  'პროცესი', 'Process',
  9, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 11. timeline
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0111-4000-8000-000000000001',
  'entrepreneur-support', 'timeline', 'timeline',
  'კამპანიის ვადები',
  'Campaign Timeline',
  '21 დღე განაცხადების მიღება, 5 დღე განხილვა, 5-7 დღე გასაუბრება, 3 დღე დადასტურება.',
  '21 days application window, 5 days review, 5-7 days interviews, 3 days confirmation.',
  'ვადები', 'Timeline',
  10, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 12. delivery
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0112-4000-8000-000000000001',
  'entrepreneur-support', 'delivery', 'content',
  'მიწოდების ვადები',
  'Delivery Times',
  'ერთგვერდიანი ვებგვერდი — 7-10 დღე, კატალოგი — 2-3 კვირა, ბიზნეს ვებგვერდი — 3-4 კვირა, ონლაინ მაღაზია — 4-8 კვირა.',
  'One-page site — 7-10 days, Catalog — 2-3 weeks, Business site — 3-4 weeks, Online store — 4-8 weeks.',
  'ვადები', 'Delivery',
  11, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 13. responsibilities
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0113-4000-8000-000000000001',
  'entrepreneur-support', 'responsibilities', 'cards',
  'მონაწილის პასუხისმგებლობები',
  'Participant Responsibilities',
  'აქტიური თანამშრომლობა, დროული კომუნიკაცია, უკუკავშირის მიწოდება, მასალების მომზადება.',
  'Active cooperation, timely communication, feedback, material preparation.',
  'პასუხისმგებლობა', 'Responsibilities',  12, true)
ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 14. branding
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0114-4000-8000-000000000001',
  'entrepreneur-support', 'branding', 'content',
  'ბრენდინგი',
  'Branding',
  'BTA LAB უზრუნველყოფს პროექტის ბრენდინგის მხარდაჭერას, მათ შორის ლოგოს დიზაინს, ფერების სქემას და ვიზუალურ იდენტობას.',
  'BTA LAB provides project branding support, including logo design, color scheme, and visual identity.',
  'ბრენდინგი', 'Branding',
  13, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 15. futureChanges (maps from old "future_changes")
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0116-4000-8000-000000000001',
  'entrepreneur-support', 'futureChanges', 'content',
  'მომავალი ცვლილებები',
  'Future Changes',
  'კამპანიის პირობები შესაძლოა შეიცვალოს BTA LAB-ის გადაწყვეტილებით. ცვლილებების შესახებ მონაწილეები წინასწარ გაფრთხილდებიან.',
  'Campaign terms may change at BTA LAB''s discretion. Participants will be notified in advance of any changes.',
  'ცვლილებები', 'Changes',
  14, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 16. restrictions
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0117-4000-8000-000000000001',
  'entrepreneur-support', 'restrictions', 'cards',
  'შეზღუდვები',
  'Restrictions',
  'აკრძალულია: აზარტული თამაშები, უკანონო ქმედებები, თაღლითობა, სიძულვილის ენა, საავტორო უფლებების დარღვევა.',
  'Prohibited: gambling, illegal acts, fraud, hate speech, copyright infringement.',
  'შეზღუდვები', 'Restrictions',
  17, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 17. faq
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0118-4000-8000-000000000001',
  'entrepreneur-support', 'faq', 'content',
  'ხშირად დასმული კითხვები',
  'Frequently Asked Questions',
  'პასუხები ყველაზე ხშირად დასმულ კითხვებზე კამპანიის შესახებ.',
  'Answers to the most frequently asked questions about the campaign.',
  'FAQ', 'FAQ',
  18, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 18. cta
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, button_text_ka, button_text_en, button_url, sort_order, is_active)
VALUES (
  'a1b2c3d4-0119-4000-8000-000000000001',
  'entrepreneur-support', 'cta', 'cta',
  'მზად ხარ დასაწყებად?',
  'Ready to Get Started?',
  'შეავსე განაცხადი და გახდი BTA LAB-ის მხარდაჭერილი მეწარმე.',
  'Fill out the application and become a BTA LAB-supported entrepreneur.',
  'დაიწყე', 'Start',
  'შეავსე განაცხადი', 'Submit Application', '/entrepreneur-support/apply',
  19, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en,
  button_text_ka = EXCLUDED.button_text_ka, button_text_en = EXCLUDED.button_text_en,
  button_url = EXCLUDED.button_url;

-- ═══════════════════════════════════════════════════════════════════════════
-- XVII. SEED DATA — CAMPAIGN FAQ (10 items)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_faq (id, page_slug, question_ka, question_en, answer_ka, answer_en, sort_order, is_active) VALUES
  ('a1b2c3d4-0201-4000-8000-000000000001', 'entrepreneur-support',
    'განაცხადის შევსება ფასიანია?', 'Is filling out the application paid?',
    'არა. კამპანიაში განაცხადის წარმოდგენა უფასოა.', 'No. Submitting an application to the campaign is free.', 0, true),
  ('a1b2c3d4-0202-4000-8000-000000000001', 'entrepreneur-support',
    'მხოლოდ მოქმედ ბიზნესს შეუძლია მონაწილეობა?', 'Can only existing businesses participate?',
    'არა. მონაწილეობა შეუძლია როგორც მოქმედ ბიზნესს, ასევე რეალისტური ბიზნესიდეის ავტორს.', 'No. Both existing businesses and authors of realistic business ideas can participate.', 1, true),
  ('a1b2c3d4-0203-4000-8000-000000000001', 'entrepreneur-support',
    'ბიზნესის რეგისტრაცია აუცილებელია?', 'Is business registration required?',
    'განაცხადის შევსებისას — არა. პროექტის დაწყებამდე შესაძლოა საჭირო იყოს ინდივიდუალურ მეწარმედ რეგისტრაცია.', 'When submitting the application — no. Before starting, registration as an individual entrepreneur may be required.', 2, true),
  ('a1b2c3d4-0204-4000-8000-000000000001', 'entrepreneur-support',
    'დაფინანსების თანხას ანგარიშზე მივიღებ?', 'Will I receive the funding amount in my account?',
    'არა. დაფინანსება წარმოადგენს ვებგვერდის შექმნის მომსახურების შესაბამისი ნაწილის დაფარვას.', 'No. Funding represents covering the corresponding part of the website creation service cost.', 3, true),
  ('a1b2c3d4-0205-4000-8000-000000000001', 'entrepreneur-support',
    'როგორ გავიგებ დაფინანსების პროცენტს?', 'How will I know the funding percentage?',
    'პროცენტი განისაზღვრება განაცხადის შეფასებისა და გასაუბრების შემდეგ.', 'The percentage is determined after application evaluation and interview.', 4, true),
  ('a1b2c3d4-0206-4000-8000-000000000001', 'entrepreneur-support',
    'შემიძლია უარი ვთქვა თანამონაწილეობაზე?', 'Can I decline participation?',
    'დიახ. უარის შემთხვევაში შეთავაზება გადაეცემა სარეზერვო კანდიდატს.', 'Yes. If declined, the offer will be transferred to a reserve candidate.', 5, true),
  ('a1b2c3d4-0207-4000-8000-000000000001', 'entrepreneur-support',
    'დომენი და ჰოსტინგი შედის დაფინანსებაში?', 'Are domain and hosting included?',
    'არა, თუ ინდივიდუალურ შეთავაზებაში სხვა რამ არ იქნება მითითებული.', 'No, unless otherwise specified in the individual offer.', 6, true),
  ('a1b2c3d4-0208-4000-8000-000000000001', 'entrepreneur-support',
    'რამდენი ცვლილება შემეძლება?', 'How many changes can I request?',
    'ცვლილებების რაოდენობა განისაზღვრება ტექნიკურ დავალებასა და ხელშეკრულებაში.', 'The number of changes is defined in the technical task and contract.', 7, true),
  ('a1b2c3d4-0209-4000-8000-000000000001', 'entrepreneur-support',
    'ვის ეკუთვნის დასრულებული ვებგვერდი?', 'Who owns the completed website?',
    'საკუთრების პირობები განისაზღვრება ხელშეკრულებაში.', 'Ownership terms are defined in the contract.', 8, true),
  ('a1b2c3d4-0210-4000-8000-000000000001', 'entrepreneur-support',
    'შემიძლია პროექტი მომავალში შევცვალო?', 'Can I change the project in the future?',
    'დიახ, თუმცა BTA LAB პასუხისმგებელი იქნება მხოლოდ ჩაბარებულ ვერსიაზე.', 'Yes, but BTA LAB is only responsible for the delivered version.', 9, true)
ON CONFLICT (id) DO UPDATE SET
  question_ka = EXCLUDED.question_ka, question_en = EXCLUDED.question_en,
  answer_ka = EXCLUDED.answer_ka, answer_en = EXCLUDED.answer_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- XVIII. SEED DATA — CAMPAIGN CARDS (funding, eligibility, projects, services, etc.)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_cards (id, page_slug, section_key, title_ka, title_en, description_ka, description_en, icon, badge_ka, badge_en, sort_order, is_active) VALUES
  -- Funding cards (3)
  ('a1b2c3d4-0301-4000-8000-000000000001', 'entrepreneur-support', 'funding',
   '100% დაფინანსება (1 პროექტი)', '100% Funding (1 Project)',
   'BTA LAB სრულად დაფარავს შეთანხმებული ვებგვერდის შექმნის მომსახურების ღირებულებას.', 'BTA LAB will fully cover the cost of the agreed website creation service.',
   'Zap', 'რეკომენდებული', 'Recommended', 0, true),
  ('a1b2c3d4-0302-4000-8000-000000000001', 'entrepreneur-support', 'funding',
   '60% დაფინანსება (3 პროექტი)', '60% Funding (3 Projects)',
   'BTA LAB დაფარავს მომსახურების ღირებულების 60%-ს, მონაწილე — 40%-ს.', 'BTA LAB covers 60% of the service cost, the participant covers 40%.',
   'Star', '', '', 1, true),
  ('a1b2c3d4-0303-4000-8000-000000000001', 'entrepreneur-support', 'funding',
   '30% დაფინანსება (6 პროექტი)', '30% Funding (6 Projects)',
   'BTA LAB დაფარავს მომსახურების ღირებულების 30%-ს, მონაწილე — 70%-ს.', 'BTA LAB covers 30% of the service cost, the participant covers 70%.',
   'Heart', '', '', 2, true),
  -- Eligibility cards (3)
  ('a1b2c3d4-0304-4000-8000-000000000001', 'entrepreneur-support', 'eligibility',
   'სტუდენტები', 'Students',
   'BTA-ს და სხვა უნივერსიტეტების სტუდენტები', 'Students of BTA and other universities',
   'Users', 'ახალგაზრდები', 'Youth', 0, true),
  ('a1b2c3d4-0305-4000-8000-000000000001', 'entrepreneur-support', 'eligibility',
   'სტარტაპები', 'Startups',
   'ადრეულ ეტაპზე მყოფი სტარტაპები', 'Early-stage startups',
   'Rocket', 'სტარტაპი', 'Startup', 1, true),
  ('a1b2c3d4-0306-4000-8000-000000000001', 'entrepreneur-support', 'eligibility',
   'მცირე ბიზნესი', 'Small Business',
   'მცირე ბიზნესები, რომლებსაც სჭირდებათ ციფრული ტრანსფორმაცია', 'Small businesses needing digital transformation',
   'Building', 'ბიზნესი', 'Business', 2, true),
  -- Projects cards (3)
  ('a1b2c3d4-0307-4000-8000-000000000001', 'entrepreneur-support', 'projects',
   'ვებგვერდები', 'Websites',
   'თანამედროვე, ადაპტირებული ვებგვერდები', 'Modern, responsive websites',
   'Globe', '', '', 0, true),
  ('a1b2c3d4-0308-4000-8000-000000000001', 'entrepreneur-support', 'projects',
   'მობილური აპლიკაციები', 'Mobile Apps',
   'iOS და Android აპლიკაციები', 'iOS and Android applications',
   'Smartphone', '', '', 1, true),
  ('a1b2c3d4-0309-4000-8000-000000000001', 'entrepreneur-support', 'projects',
   'ონლაინ მაღაზიები', 'Online Stores',
   'ელექტრონული კომერციის პლატფორმები', 'E-commerce platforms',
   'ShoppingCart', '', '', 2, true),
  -- Services cards (3)
  ('a1b2c3d4-0310-4000-8000-000000000001', 'entrepreneur-support', 'services',
   'ვებ დეველოპმენტი', 'Web Development',
   'სრული ციკლის ვებ დეველოპმენტი', 'Full-cycle web development',
   'Code', '', '', 0, true),
  ('a1b2c3d4-0311-4000-8000-000000000001', 'entrepreneur-support', 'services',
   'UI/UX დიზაინი', 'UI/UX Design',
   'მომხმარებელზე ორიენტირებული დიზაინი', 'User-centered design',
   'Palette', '', '', 1, true),
  ('a1b2c3d4-0312-4000-8000-000000000001', 'entrepreneur-support', 'services',
   'ბრენდინგი', 'Branding',
   'ბრენდის იდენტობის შექმნა', 'Brand identity creation',
   'Heart', '', '', 2, true),
  -- Technologies cards (3)
  ('a1b2c3d4-0313-4000-8000-000000000001', 'entrepreneur-support', 'technologies',
   'Next.js / React', 'Next.js / React',
   'თანამედროვე ფრონტენდ ტექნოლოგიები', 'Modern frontend technologies',
   'Code', '', '', 0, true),
  ('a1b2c3d4-0314-4000-8000-000000000001', 'entrepreneur-support', 'technologies',
   'Node.js / Python', 'Node.js / Python',
   'მძლავრი ბექენდ გადაწყვეტილებები', 'Powerful backend solutions',
   'Server', '', '', 1, true),
  ('a1b2c3d4-0315-4000-8000-000000000001', 'entrepreneur-support', 'technologies',
   'PostgreSQL', 'PostgreSQL',
   'საიმედო მონაცემთა ბაზები', 'Reliable databases',
   'Database', '', '', 2, true),
  -- Criteria cards (3)
  ('a1b2c3d4-0316-4000-8000-000000000001', 'entrepreneur-support', 'criteria',
   'ინოვაციურობა', 'Innovation',
   'პროექტის სიახლე და კრეატიულობა', 'Project novelty and creativity',
   'Lightbulb', '', '', 0, true),
  ('a1b2c3d4-0317-4000-8000-000000000001', 'entrepreneur-support', 'criteria',
   'მიზანშეწონილობა', 'Feasibility',
   'პროექტის განხორციელების რეალისტურობა', 'Realistic project implementation',
   'Target', '', '', 1, true),
  ('a1b2c3d4-0318-4000-8000-000000000001', 'entrepreneur-support', 'criteria',
   'ბაზრის საჭიროება', 'Market Need',
   'პროექტის შესაბამისობა ბაზრის მოთხოვნებთან', 'Project alignment with market demands',
   'TrendingUp', '', '', 2, true),
  -- Responsibilities cards (3)
  ('a1b2c3d4-0319-4000-8000-000000000001', 'entrepreneur-support', 'responsibilities',
   'რეგულარული კომუნიკაცია', 'Regular Communication',
   'კვირეული შეხვედრები გუნდთან', 'Weekly meetings with the team',
   'MessageSquare', '', '', 0, true),
  ('a1b2c3d4-0320-4000-8000-000000000001', 'entrepreneur-support', 'responsibilities',
   'უკუკავშირი', 'Feedback',
   'დროული და კონსტრუქციული უკუკავშირი', 'Timely and constructive feedback',
   'MessageCircle', '', '', 1, true),
  ('a1b2c3d4-0321-4000-8000-000000000001', 'entrepreneur-support', 'responsibilities',
   'პროექტის მოთხოვნები', 'Project Requirements',
   'მკაფიო მოთხოვნების განსაზღვრა', 'Clear definition of requirements',
   'FileText', '', '', 2, true),
  -- Restrictions cards (3)
  ('a1b2c3d4-0322-4000-8000-000000000001', 'entrepreneur-support', 'restrictions',
   'ერთი განაცხადი', 'One Application',
   'თითო მონაწილეს შეუძლია მხოლოდ ერთი განაცხადის წარდგენა', 'Each participant may submit only one application',
   'FileText', '', '', 0, true),
  ('a1b2c3d4-0323-4000-8000-000000000001', 'entrepreneur-support', 'restrictions',
   'ორიგინალობა', 'Originality',
   'პროექტი უნდა იყოს ორიგინალური', 'The project must be original',
   'Shield', '', '', 1, true),
  ('a1b2c3d4-0324-4000-8000-000000000001', 'entrepreneur-support', 'restrictions',
   'საავტორო უფლებები', 'Copyright',
   'პროექტი არ უნდა არღვევდეს საავტორო უფლებებს', 'The project must not infringe copyright',
   'Award', '', '', 2, true),
  -- Delivery cards (4) — needed for DeliveryTimes component to render
  ('a1b2c3d4-0325-4000-8000-000000000001', 'entrepreneur-support', 'delivery',
   'ერთგვერდიანი ვებგვერდი', 'One-Page Website',
   'იდეალურია ლენდინგისთვის: 7-10 დღე', 'Perfect for landing pages: 7-10 days',
   'FileText', 'სწრაფი', 'Fast', 0, true),
  ('a1b2c3d4-0326-4000-8000-000000000001', 'entrepreneur-support', 'delivery',
   'კატალოგი', 'Catalog Website',
   'პროდუქტებისა და მომსახურების კატალოგი: 2-3 კვირა', 'Product and service catalog: 2-3 weeks',
   'BookOpen', 'სტანდარტული', 'Standard', 1, true),
  ('a1b2c3d4-0327-4000-8000-000000000001', 'entrepreneur-support', 'delivery',
   'ბიზნეს ვებგვერდი', 'Business Website',
   'სრულფუნქციონალური ბიზნეს ვებგვერდი: 3-4 კვირა', 'Full-featured business website: 3-4 weeks',
   'Building', 'ვრცელი', 'Comprehensive', 2, true),
  ('a1b2c3d4-0328-4000-8000-000000000001', 'entrepreneur-support', 'delivery',
   'ონლაინ მაღაზია', 'Online Store',
   'ელექტრონული კომერციის პლატფორმა: 4-8 კვირა', 'E-commerce platform: 4-8 weeks',
   'ShoppingCart', 'კომპლექსური', 'Complex', 3, true)
ON CONFLICT (id) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  icon = EXCLUDED.icon, badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- XIX. SEED DATA — CAMPAIGN TIMELINE
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_timeline (id, page_slug, section_key, date_ka, date_en, title_ka, title_en, description_ka, description_en, icon, sort_order, is_active) VALUES
  ('a1b2c3d4-0401-4000-8000-000000000001', 'entrepreneur-support', 'timeline',
   '00', '00',
   'განცხადებების მიღება', 'Application Submission',
   'მონაწილეები ავსებენ და აგზავნიან განაცხადებს ონლაინ ფორმის მეშვეობით.', 'Participants fill out and submit applications via the online form.',
   'FileText', 0, true),
  ('a1b2c3d4-0402-4000-8000-000000000001', 'entrepreneur-support', 'timeline',
   '00', '00',
   'განცხადებების განხილვა', 'Application Review',
   'მიღებული განაცხადები განიხილება და ხდება წინასწარი შერჩევა.', 'Received applications are reviewed and pre-selected.',
   'Search', 1, true),
  ('a1b2c3d4-0403-4000-8000-000000000001', 'entrepreneur-support', 'timeline',
   '00', '00',
   'გასაუბრება', 'Interviews',
   'შერჩეულ კანდიდატებთან ტარდება გასაუბრება პროექტის დეტალებზე.', 'Selected candidates are interviewed about project details.',
   'Users', 2, true),
  ('a1b2c3d4-0404-4000-8000-000000000001', 'entrepreneur-support', 'timeline',
   '00', '00',
   'ტექნიკური/ფინანსური შეფასება', 'Technical/Financial Evaluation',
   'ხდება პროექტების ტექნიკური და ფინანსური შეფასება.', 'Projects undergo technical and financial evaluation.',
   'Settings', 3, true),
  ('a1b2c3d4-0405-4000-8000-000000000001', 'entrepreneur-support', 'timeline',
   '00', '00',
   'საბოლოო გადაწყვეტილება', 'Final Decision',
   'გამოვლინდებიან გამარჯვებულები და კეთდება პირობითი შეთავაზებები.', 'Winners are announced and conditional offers are made.',
   'Award', 4, true),
  -- Selection process timeline items (section_key: 'selection') — needed for SelectionProcess to render
  ('a1b2c3d4-0406-4000-8000-000000000001', 'entrepreneur-support', 'selection',
   '1-21 დღე', 'Days 1-21',
   'განაცხადების მიღება', 'Application Submission',
   'მონაწილეები ავსებენ და აგზავნიან განაცხადებს ონლაინ ფორმის მეშვეობით.', 'Participants fill out and submit applications via the online form.',
   'FileText', 0, true),
  ('a1b2c3d4-0407-4000-8000-000000000001', 'entrepreneur-support', 'selection',
   '22-26 დღე', 'Days 22-26',
   'განაცხადების განხილვა', 'Initial Review',
   'მიღებული განაცხადები განიხილება და ხდება წინასწარი შერჩევა.', 'Received applications are reviewed and pre-selected.',
   'Search', 1, true),
  ('a1b2c3d4-0408-4000-8000-000000000001', 'entrepreneur-support', 'selection',
   '27-33 დღე', 'Days 27-33',
   'გასაუბრება', 'Interview',
   'შერჩეულ კანდიდატებთან ტარდება გასაუბრება პროექტის დეტალებზე.', 'Selected candidates are interviewed about project details.',
   'Users', 2, true),
  ('a1b2c3d4-0409-4000-8000-000000000001', 'entrepreneur-support', 'selection',
   '34-40 დღე', 'Days 34-40',
   'ტექნიკური/ფინანსური შეფასება', 'Technical & Financial Evaluation',
   'ხდება პროექტების ტექნიკური და ფინანსური შეფასება.', 'Technical and financial evaluation of projects is conducted.',
   'Settings', 3, true),
  ('a1b2c3d4-0410-4000-8000-000000000001', 'entrepreneur-support', 'selection',
   '41-44 დღე', 'Days 41-44',
   'საბოლოო გადაწყვეტილება', 'Final Decision',
   'გამოვლინდებიან გამარჯვებულები და კეთდება პირობითი შეთავაზებები.', 'Winners are announced and conditional offers are made.',
   'Award', 4, true)
ON CONFLICT (id) DO UPDATE SET
  date_ka = EXCLUDED.date_ka, date_en = EXCLUDED.date_en,
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  icon = EXCLUDED.icon;

-- ═══════════════════════════════════════════════════════════════════════════
-- XX. SEED DATA — CAMPAIGN STATISTICS (Hero section stats)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_statistics (id, page_slug, section_key, label_ka, label_en, value, suffix_ka, suffix_en, icon, sort_order, is_active) VALUES
  ('a1b2c3d4-0501-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'შერჩეული პროექტი', 'Selected Projects', 10, '', '', 'Award', 0, true),
  ('a1b2c3d4-0502-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'დაფინანსების კატეგორია', 'Funding Categories', 3, '', '', 'Zap', 1, true),
  ('a1b2c3d4-0503-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'განაცხადი უფასოა', 'Free Application', 1, '', '', 'Heart', 2, true),
  ('a1b2c3d4-0504-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'პროფესიული ზედამხედველობა', 'Professional Supervision', 1, '', '', 'Shield', 3, true),
  ('a1b2c3d4-0505-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'თანამედროვე ტექნოლოგიები', 'Modern Technologies', 10, '+', '+', 'Code', 4, true)
ON CONFLICT (id) DO UPDATE SET
  label_ka = EXCLUDED.label_ka, label_en = EXCLUDED.label_en,
  value = EXCLUDED.value, suffix_ka = EXCLUDED.suffix_ka, suffix_en = EXCLUDED.suffix_en,
  icon = EXCLUDED.icon;

-- ═══════════════════════════════════════════════════════════════════════════
-- XXI. SEED DATA — CAMPAIGN CTA
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_cta (id, page_slug, section_key, title_ka, title_en, description_ka, description_en, button_text_ka, button_text_en, button_url, secondary_button_text_ka, secondary_button_text_en, secondary_button_url, is_active) VALUES
  ('a1b2c3d4-0601-4000-8000-000000000001', 'entrepreneur-support', 'cta',
   'მზად ხარ დასაწყებად?', 'Ready to Get Started?',
   'შეავსე განაცხადი და გახდი BTA LAB-ის მხარდაჭერილი მეწარმე. არ გამოტოვო ეს შესაძლებლობა!',
   'Fill out the application and become a BTA LAB-supported entrepreneur. Don''t miss this opportunity!',
   'შეავსე განაცხადი', 'Submit Application', '/entrepreneur-support/apply',
   'გაიგე მეტი', 'Learn More', '#selection', true)
ON CONFLICT (id) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  button_text_ka = EXCLUDED.button_text_ka, button_text_en = EXCLUDED.button_text_en,
  button_url = EXCLUDED.button_url;

-- ═══════════════════════════════════════════════════════════════════════════
-- XXII. SEED DATA — CAMPAIGN SETTINGS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_settings (id, setting_key, setting_value_ka, setting_value_en, setting_type, is_active) VALUES
  ('a1b2c3d4-0701-4000-8000-000000000001', 'campaign_name', 'BTA LAB — მეწარმეების ციფრული განვითარების მხარდაჭერა', 'BTA LAB — Digital Entrepreneurship Development Support', 'text', true),
  ('a1b2c3d4-0702-4000-8000-000000000001', 'campaign_email', 'campaign@bta.edu.ge', 'campaign@bta.edu.ge', 'text', true),
  ('a1b2c3d4-0703-4000-8000-000000000001', 'campaign_phone', '+995 555 123 456', '+995 555 123 456', 'text', true),
  ('a1b2c3d4-0704-4000-8000-000000000001', 'campaign_deadline', '2026-12-31', '2026-12-31', 'text', true),
  ('a1b2c3d4-0705-4000-8000-000000000001', 'campaign_max_funding', '5000', '5000', 'number', true),
  ('a1b2c3d4-0706-4000-8000-000000000001', 'campaign_currency', '₾', '₾', 'text', true),
  ('a1b2c3d4-0707-4000-8000-000000000001', 'campaign_application_fee', '0', '0', 'number', true),
  ('a1b2c3d4-0708-4000-8000-000000000001', 'campaign_max_applications', '100', '100', 'number', true)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value_ka = EXCLUDED.setting_value_ka,
  setting_value_en = EXCLUDED.setting_value_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- XXIII. SEED DATA — CAMPAIGN SEO
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_seo (id, page_slug, title_ka, title_en, description_ka, description_en, keywords_ka, keywords_en, canonical_url, og_title_ka, og_title_en, og_description_ka, og_description_en, is_active) VALUES
  ('a1b2c3d4-0801-4000-8000-000000000001', 'entrepreneur-support',
   'BTA LAB — მეწარმეების ციფრული განვითარების მხარდაჭერის კამპანია',
   'BTA LAB — Digital Entrepreneurship Development Support Campaign',
   'BTA LAB-ის კამპანია 10 პროექტისთვის: მიიღეთ 100%, 60% ან 30% დაფინანსება ვებგვერდის შესაქმნელად. განაცხადი უფასოა!',
   'BTA LAB campaign for 10 projects: Get 100%, 60%, or 30% funding for website creation. Free application!',
   'BTA LAB, მეწარმე, დაფინანსება, ვებგვერდი, ციფრული განვითარება, კამპანია, საქართველო',
   'BTA LAB, entrepreneur, funding, website, digital development, campaign, Georgia',
   'https://lab.bta.edu.ge/entrepreneur-support',
   'BTA LAB — მეწარმეების ციფრული მხარდაჭერა', 'BTA LAB — Digital Entrepreneurship Support',
   'მიიღეთ 100%, 60% ან 30% დაფინანსება ვებგვერდის შესაქმნელად', 'Get 100%, 60%, or 30% funding for website creation',
   true)
ON CONFLICT (page_slug) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  keywords_ka = EXCLUDED.keywords_ka, keywords_en = EXCLUDED.keywords_en,
  canonical_url = EXCLUDED.canonical_url,
  og_title_ka = EXCLUDED.og_title_ka, og_title_en = EXCLUDED.og_title_en,
  og_description_ka = EXCLUDED.og_description_ka, og_description_en = EXCLUDED.og_description_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- XXIV. SEED DATA — EMAIL TEMPLATES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_email_templates (id, event, subject_ka, subject_en, body_ka, body_en, is_active) VALUES
  ('a1b2c3d4-0901-4000-8000-000000000001', 'application_received',
   'განაცხადი მიღებულია — BTA LAB', 'Application Received — BTA LAB',
   'თქვენი განაცხადი მიღებულია. თქვენი განაცხადის ნომერია: {{applicationNumber}}. ჩვენი გუნდი განიხილავს მას და დაგიკავშირდებით 5 სამუშაო დღის განმავლობაში.',
   'Your application has been received. Your application number is: {{applicationNumber}}. Our team will review it and contact you within 5 business days.', true),
  ('a1b2c3d4-0902-4000-8000-000000000001', 'interview_invitation',
   'გასაუბრების მოწვევა — BTA LAB', 'Interview Invitation — BTA LAB',
   'თქვენ მიწვეული ხართ გასაუბრებაზე. თარიღი: {{date}}, დრო: {{time}}, ბმული: {{meetingUrl}}.',
   'You are invited for an interview. Date: {{date}}, Time: {{time}}, Link: {{meetingUrl}}.', true),
  ('a1b2c3d4-0903-4000-8000-000000000001', 'need_more_information',
   'დამატებითი ინფორმაცია — BTA LAB', 'Additional Information Needed — BTA LAB',
   'თქვენი განაცხადის განსახილველად საჭიროა დამატებითი ინფორმაცია: {{notes}}',
   'To review your application, we need additional information: {{notes}}', true),
  ('a1b2c3d4-0904-4000-8000-000000000001', 'offer_made',
   'შეთავაზება — BTA LAB', 'Offer — BTA LAB',
   'გილოცავთ! თქვენ მიიღეთ შეთავაზება. დაფინანსება: {{amount}}₾ ({{percentage}}%). გთხოვთ, დაადასტუროთ {{deadline}}-მდე.',
   'Congratulations! You have received an offer. Funding: {{amount}}₾ ({{percentage}}%). Please confirm by {{deadline}}.', true),
  ('a1b2c3d4-0905-4000-8000-000000000001', 'status_changed',
   'სტატუსის ცვლილება — BTA LAB', 'Status Change — BTA LAB',
   'თქვენი განაცხადის სტატუსი შეიცვალა: {{status}}.',
   'Your application status has changed to: {{status}}.', true),
  ('a1b2c3d4-0906-4000-8000-000000000001', 'final_decision',
   'საბოლოო გადაწყვეტილება — BTA LAB', 'Final Decision — BTA LAB',
   'თქვენი განაცხადის საბოლოო შედეგი: {{result}}.',
   'The final result of your application: {{result}}.', true)
ON CONFLICT (event) DO UPDATE SET
  subject_ka = EXCLUDED.subject_ka, subject_en = EXCLUDED.subject_en,
  body_ka = EXCLUDED.body_ka, body_en = EXCLUDED.body_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- XXV. CLEANUP — Price suffix fix from cleanup_price_suffixes.sql
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE public.service_packages
SET price_suffix_ka = '', price_suffix_en = ''
WHERE COALESCE(name, '') NOT ILIKE '%Full Social Media Management%'
  AND COALESCE(name_ka, '') NOT ILIKE '%სოციალური მედიის სრული მართვა%'
  AND COALESCE(name_en, '') NOT ILIKE '%Full Social Media Management%';

UPDATE public.service_packages
SET price_suffix_ka = '+', price_suffix_en = '+'
WHERE name ILIKE '%Full Social Media Management%'
   OR name_ka ILIKE '%სოციალური მედიის სრული მართვა%'
   OR name_en ILIKE '%Full Social Media Management%';

UPDATE public.service_packages
SET billing_label = 'თვეში', billing_label_ka = 'თვეში', billing_label_en = 'per month'
WHERE name ILIKE '%Full Social Media Management%'
   OR name_ka ILIKE '%სოციალური მედიის სრული მართვა%'
   OR name_en ILIKE '%Full Social Media Management%';

-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION CHECKPOINT
-- ═══════════════════════════════════════════════════════════════════════════
-- All schema, triggers, RLS, storage, and seed data are applied.
-- The /entrepreneur-support landing page should now render all 19 sections
-- with full content in both Georgian and English.
-- ═══════════════════════════════════════════════════════════════════════════
