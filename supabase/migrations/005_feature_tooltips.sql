-- BTA Lab feature tooltips for service packages
-- Allows the admin to add bilingual explanations for technical terms
-- that appear in service package feature lists.

create table public.service_feature_tooltips (
  id uuid primary key default gen_random_uuid(),
  name_ka text not null default '',
  name_en text not null default '',
  description_ka text not null default '',
  description_en text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index service_feature_tooltips_name_ka_idx on public.service_feature_tooltips (name_ka);
create index service_feature_tooltips_name_en_idx on public.service_feature_tooltips (name_en);

alter table public.service_feature_tooltips enable row level security;

create policy "Public can read feature tooltips"
  on public.service_feature_tooltips
  for select
  to anon, authenticated
  using (true);

create policy "Admins can manage feature tooltips"
  on public.service_feature_tooltips
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create trigger service_feature_tooltips_set_updated_at
  before update on public.service_feature_tooltips
  for each row execute function public.set_updated_at();
