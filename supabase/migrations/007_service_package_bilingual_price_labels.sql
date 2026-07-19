-- ============================================================
-- BTA LAB service package bilingual price display labels
-- Keeps one base price value and stores localized visible suffixes separately.
-- ============================================================

alter table public.service_packages
  add column if not exists price_suffix_ka text not null default '',
  add column if not exists price_suffix_en text not null default '',
  add column if not exists custom_price_label_ka text not null default '',
  add column if not exists custom_price_label_en text not null default '';

update public.service_packages
set
  price_suffix_ka = case
    when price_suffix_ka <> '' then price_suffix_ka
    when custom_price then ''
    when section in ('website', 'social-media', 'addons') and price like '%-დან' then '-დან'
    when section = 'website' and coalesce(nullif(name_en, ''), name) in (
      'Landing Starter',
      'One Page Website',
      'Business Website',
      'Online Store',
      'Website Maintenance'
    ) then '-დან'
    when section = 'social-media' and coalesce(nullif(name_en, ''), name) in (
      'Starter',
      'Business',
      'Premium'
    ) then '-დან'
    when section = 'addons' and coalesce(nullif(name_en, ''), name) = 'SEO Optimization' then '-დან'
    else price_suffix_ka
  end,
  custom_price_label_ka = case
    when custom_price_label_ka <> '' then custom_price_label_ka
    when custom_price then 'ინდივიდუალური'
    else custom_price_label_ka
  end,
  custom_price_label_en = case
    when custom_price_label_en <> '' then custom_price_label_en
    when custom_price then 'Custom'
    else custom_price_label_en
  end,
  cta_ka = case when cta_ka = '' then cta_label_ka else cta_ka end,
  cta_en = case when cta_en = '' then cta_label_en else cta_en end;
