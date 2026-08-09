-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — One-Time Questionnaire / Invitation System (v25)
-- ═══════════════════════════════════════════════════════════════════════════
-- Secure invitation-based one-time questionnaire.
--
--   * Each invitation carries a cryptographically secure UNIQUE token.
--   * A link is usable only once: the final submit is an atomic conditional
--     UPDATE guarded by status = 'pending', so two simultaneous requests can
--     never create two submissions.
--   * is_viewed (უნახავი / ნანახი) is independent from the completion state.
--   * Draft answers (შუალედური შენახვა) allow continuing the questionnaire
--     later without consuming the one-time link.
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

-- ── INDEXES ─────────────────────────────────────────────────────────────

create index if not exists questionnaire_invitations_status_viewed_idx
  on public.questionnaire_invitations (status, is_viewed, created_at desc);
create index if not exists questionnaire_invitations_created_idx
  on public.questionnaire_invitations (created_at desc);

-- ── TRIGGERS ────────────────────────────────────────────────────────────

drop trigger if exists questionnaire_invitations_set_updated_at on public.questionnaire_invitations;
create trigger questionnaire_invitations_set_updated_at
  before update on public.questionnaire_invitations
  for each row execute function public.set_updated_at();

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────────────

alter table public.questionnaire_invitations enable row level security;

-- Admins can manage invitations (server actions run with the service-role
-- client which bypasses RLS anyway; this policy is defense-in-depth).
drop policy if exists "Admins can manage questionnaire invitations" on public.questionnaire_invitations;
create policy "Admins can manage questionnaire invitations"
  on public.questionnaire_invitations
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- No public anon policies: token validation and submission are performed
-- server-side with the service-role client. The one-time guarantee is
-- enforced by the atomic conditional UPDATE in the submit handler.
