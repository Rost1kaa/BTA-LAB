-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Questionnaire & Campaign Admin Fixes
-- ═══════════════════════════════════════════════════════════════════════════
-- Standalone, idempotent, Supabase PostgreSQL compatible script.
-- Safe to run manually in the Supabase SQL Editor (or supabase db push).
--
-- What it supports:
--   1. Questionnaire admin DELETE — answers live on the invitation row, so a
--      plain row delete cannot leave orphaned records. This file re-creates the
--      questionnaire_invitations table/indexes/policy idempotently for projects
--      that have not yet applied migration 025.
--   2. Campaign applications DELETE + drag & drop — child tables must cascade
--      when a campaign application is deleted. This file verifies every child
--      FK to campaign_applications(id) and re-creates it with ON DELETE CASCADE
--      when needed. campaign_email_log intentionally keeps ON DELETE SET NULL
--      so email history survives application deletion.
--
-- Requires: public.set_updated_at() and public.is_admin() from migration
-- 001_initial_schema.sql (already present in this project).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. QUESTIONNAIRE INVITATIONS (idempotent schema + policy)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.questionnaire_invitations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  token text not null unique,
  answers jsonb not null default '{}'::jsonb,
  draft_answers jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'submitted')),
  submitted_at timestamptz,
  is_viewed boolean not null default false,
  viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint questionnaire_invitations_token_not_blank
    check (length(trim(token)) >= 32)
);

create index if not exists questionnaire_invitations_status_viewed_idx
  on public.questionnaire_invitations (status, is_viewed, created_at desc);
create index if not exists questionnaire_invitations_created_idx
  on public.questionnaire_invitations (created_at desc);

drop trigger if exists questionnaire_invitations_set_updated_at on public.questionnaire_invitations;
create trigger questionnaire_invitations_set_updated_at
  before update on public.questionnaire_invitations
  for each row execute function public.set_updated_at();

alter table public.questionnaire_invitations enable row level security;

-- Admins can manage (read/update/delete) questionnaire invitations.
-- The app deletes with the service-role client (bypasses RLS); this policy is
-- defense-in-depth for authenticated admin clients.
drop policy if exists "Admins can manage questionnaire invitations" on public.questionnaire_invitations;
create policy "Admins can manage questionnaire invitations"
  on public.questionnaire_invitations
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CAMPAIGN APPLICATIONS — ENSURE CASCADING DELETES
-- ─────────────────────────────────────────────────────────────────────────────
-- Admin deletion of a campaign application must cascade to all child records
-- so no orphaned rows remain:
--   campaign_application_steps, campaign_application_status_history,
--   campaign_evaluations, campaign_interviews, campaign_offers,
--   campaign_reserved_candidates
--
-- campaign_email_log keeps ON DELETE SET NULL (history is retained).

do $$
declare
  child_table text;
  con_name text;
begin
  foreach child_table in array array[
    'campaign_application_steps',
    'campaign_application_status_history',
    'campaign_evaluations',
    'campaign_interviews',
    'campaign_offers',
    'campaign_reserved_candidates'
  ] loop
    -- Only touch tables that actually exist.
    if exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = child_table
    ) then
      select conname into con_name
      from pg_constraint
      where conrelid = ('public.' || child_table)::regclass
        and contype = 'f'
        and confrelid = 'public.campaign_applications'::regclass
      limit 1;

      if con_name is not null then
        -- Re-create the FK with ON DELETE CASCADE when it is missing.
        if not exists (
          select 1 from pg_constraint where conname = con_name and confdeltype = 'c'
        ) then
          execute format('alter table public.%I drop constraint %I', child_table, con_name);
          execute format(
            'alter table public.%I add constraint %I foreign key (application_id) references public.campaign_applications(id) on delete cascade',
            child_table, con_name
          );
        end if;
      else
        -- No FK yet — add one when the expected column exists.
        if exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = child_table
            and column_name = 'application_id'
        ) then
          execute format(
            'alter table public.%I add constraint %I foreign key (application_id) references public.campaign_applications(id) on delete cascade',
            child_table, child_table || '_application_id_fkey'
          );
        end if;
      end if;
    end if;
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. VERIFY campaign_applications ROW LEVEL SECURITY admin policy
-- ─────────────────────────────────────────────────────────────────────────────

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'campaign_applications'
  ) and not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'campaign_applications'
      and policyname = 'Admins can manage campaign applications'
  ) then
    create policy "Admins can manage campaign applications"
      on public.campaign_applications
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;

-- Done. The questionnaire delete and campaign application delete / drag & drop
-- features are fully backed by the database schema above.
