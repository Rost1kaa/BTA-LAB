-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Legal Policies Schema (v2)
-- ═══════════════════════════════════════════════════════════════════════════
-- Adds a dedicated table for privacy policy and cookie policy content
-- that the admin panel can manage dynamically via the "იურიდიული" section.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── ENUM ────────────────────────────────────────────────────────────────

do $$ begin
  create type public.legal_policy_type as enum ('PRIVACY_POLICY', 'COOKIE_POLICY');
exception
  when duplicate_object then null;
end $$;

-- ── TABLE ───────────────────────────────────────────────────────────────

create table if not exists public.legal_policies (
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

-- ── INDEX ──────────────────────────────────────────────────────────────

create index if not exists legal_policies_type_idx on public.legal_policies (type);

-- ── TRIGGERS ───────────────────────────────────────────────────────────

create trigger legal_policies_set_updated_at
  before update on public.legal_policies
  for each row execute function public.set_updated_at();

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────────────

alter table public.legal_policies enable row level security;

-- ── RLS POLICIES ───────────────────────────────────────────────────────

create policy "Public can read legal policies"
  on public.legal_policies
  for select
  to anon, authenticated
  using (true);

create policy "Admins can manage legal policies"
  on public.legal_policies
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
