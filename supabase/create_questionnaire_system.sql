-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — One-Time Questionnaire / Invitation System
-- ═══════════════════════════════════════════════════════════════════════════
-- Standalone script — safe to run manually in the Supabase SQL Editor.
-- Identical to supabase/migrations/025_questionnaire_system.sql.
--
-- Requires: public.set_updated_at() and public.is_admin() from migration
-- 001_initial_schema.sql (already present in this project).
-- ═══════════════════════════════════════════════════════════════════════════

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

drop policy if exists "Admins can manage questionnaire invitations" on public.questionnaire_invitations;
create policy "Admins can manage questionnaire invitations"
  on public.questionnaire_invitations
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
