-- ============================================================
-- BTA LAB service package bilingual CTA labels
-- Ensures service_packages has the full bilingual package schema.
-- ============================================================

alter table public.service_packages
  add column if not exists name_ka text not null default '',
  add column if not exists name_en text not null default '',
  add column if not exists billing_label_ka text not null default '',
  add column if not exists billing_label_en text not null default '',
  add column if not exists description_ka text not null default '',
  add column if not exists description_en text not null default '',
  add column if not exists ideal_for_ka text not null default '',
  add column if not exists ideal_for_en text not null default '',
  add column if not exists features_ka jsonb not null default '[]'::jsonb,
  add column if not exists features_en jsonb not null default '[]'::jsonb,
  add column if not exists delivery_time_ka text not null default '',
  add column if not exists delivery_time_en text not null default '',
  add column if not exists cta_ka text not null default '',
  add column if not exists cta_en text not null default '',
  add column if not exists cta_label_ka text not null default '',
  add column if not exists cta_label_en text not null default '',
  add column if not exists price_explanation_ka text not null default '',
  add column if not exists price_explanation_en text not null default '';

update public.service_packages
set
  name_en = case when name_en = '' then name else name_en end,
  billing_label_en = case when billing_label_en = '' then coalesce(billing_label, '') else billing_label_en end,
  description_en = case when description_en = '' then coalesce(description, '') else description_en end,
  ideal_for_en = case when ideal_for_en = '' then coalesce(ideal_for, '') else ideal_for_en end,
  features_en = case when features_en = '[]'::jsonb then features else features_en end,
  delivery_time_en = case when delivery_time_en = '' then coalesce(delivery_time, '') else delivery_time_en end,
  cta_en = case when cta_en = '' then cta else cta_en end,
  cta_label_en = case
    when cta_label_en <> '' then cta_label_en
    when cta_en <> '' then cta_en
    else cta
  end,
  cta_label_ka = case
    when cta_label_ka <> '' then cta_label_ka
    when cta_ka <> '' then cta_ka
    else ''
  end,
  price_explanation_en = case when price_explanation_en = '' then coalesce(price_explanation, '') else price_explanation_en end;
