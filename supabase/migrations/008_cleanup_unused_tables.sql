-- ══════════════════════════════════════════════════════════════════════════
-- Migration: Cleanup unused campaign tables
-- 
-- Safely removes database structures that are no longer needed:
--   • campaign_application_drafts    — draft saving removed
--   • campaign_evaluations           — evaluation system removed
--   • campaign_interviews            — interview management removed
--   • campaign_offers                — offer management removed
--   • campaign_reserved_candidates   — reserved candidates removed
-- ══════════════════════════════════════════════════════════════════════════

-- Drop triggers first (depend on tables)
drop trigger if exists campaign_evaluations_set_updated_at on public.campaign_evaluations;
drop trigger if exists campaign_interviews_set_updated_at on public.campaign_interviews;
drop trigger if exists campaign_offers_set_updated_at on public.campaign_offers;

-- Drop indexes
drop index if exists campaign_evaluations_app_idx;
drop index if exists campaign_interviews_app_idx;
drop index if exists campaign_offers_app_idx;

-- Drop RLS policies
drop policy if exists "Admins can manage campaign evaluations" on public.campaign_evaluations;
drop policy if exists "Admins can manage campaign interviews" on public.campaign_interviews;
drop policy if exists "Admins can manage campaign offers" on public.campaign_offers;

-- Disable RLS on tables (cleanup before drop)
alter table if exists public.campaign_evaluations no force row level security;
alter table if exists public.campaign_interviews no force row level security;
alter table if exists public.campaign_offers no force row level security;

-- Drop tables (order matters: no dependencies)
drop table if exists public.campaign_reserved_candidates;
drop table if exists public.campaign_offers;
drop table if exists public.campaign_interviews;
drop table if exists public.campaign_evaluations;
drop table if exists public.campaign_application_drafts;
