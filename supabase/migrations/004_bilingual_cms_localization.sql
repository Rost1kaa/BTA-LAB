-- ============================================================
-- BTA LAB bilingual CMS fields
-- Adds Georgian/English editable fields while preserving legacy data.
-- ============================================================

alter table public.site_content
  add column if not exists value_ka text not null default '',
  add column if not exists value_en text not null default '';

update public.site_content
set value_en = content_value
where value_en = '' and content_value <> '';

alter table public.site_settings
  add column if not exists value_ka text not null default '',
  add column if not exists value_en text not null default '';

update public.site_settings
set value_en = setting_value
where value_en = '' and setting_value <> '';

alter table public.portfolio_categories
  add column if not exists name_ka text not null default '',
  add column if not exists name_en text not null default '';

update public.portfolio_categories
set
  name_en = case when name_en = '' then name else name_en end,
  name_ka = case
    when name_ka <> '' then name_ka
    when name = 'Web' then 'ვებ'
    when name = 'E-commerce' then 'ონლაინ მაღაზია'
    when name = 'Branding' then 'ბრენდინგი'
    when name = 'Marketing' then 'მარკეტინგი'
    when name = 'UI/UX' then 'UI/UX'
    else name
  end;

alter table public.portfolio_projects
  add column if not exists title_ka text not null default '',
  add column if not exists title_en text not null default '',
  add column if not exists category_label_ka text not null default '',
  add column if not exists category_label_en text not null default '',
  add column if not exists description_ka text not null default '',
  add column if not exists description_en text not null default '',
  add column if not exists full_description_ka text not null default '',
  add column if not exists full_description_en text not null default '',
  add column if not exists problem_ka text not null default '',
  add column if not exists problem_en text not null default '',
  add column if not exists solution_ka text not null default '',
  add column if not exists solution_en text not null default '',
  add column if not exists results_ka jsonb not null default '[]'::jsonb,
  add column if not exists results_en jsonb not null default '[]'::jsonb,
  add column if not exists alt_text_ka text not null default '',
  add column if not exists alt_text_en text not null default '',
  add column if not exists seo_title_ka text,
  add column if not exists seo_title_en text,
  add column if not exists seo_description_ka text,
  add column if not exists seo_description_en text;

update public.portfolio_projects
set
  title_en = case when title_en = '' then title else title_en end,
  category_label_en = case when category_label_en = '' then category else category_label_en end,
  description_en = case when description_en = '' then description else description_en end,
  full_description_en = case when full_description_en = '' then full_description else full_description_en end,
  problem_en = case when problem_en = '' then problem else problem_en end,
  solution_en = case when solution_en = '' then solution else solution_en end,
  results_en = case when results_en = '[]'::jsonb then results else results_en end,
  alt_text_en = case when alt_text_en = '' then alt_text else alt_text_en end,
  seo_title_en = coalesce(seo_title_en, seo_title),
  seo_description_en = coalesce(seo_description_en, seo_description);

update public.portfolio_projects
set
  title_ka = case when title_ka = '' then title else title_ka end,
  category_label_ka = case
    when category_label_ka <> '' then category_label_ka
    when category = 'Web' then 'ვებ'
    when category = 'E-commerce' then 'ონლაინ მაღაზია'
    when category = 'Branding' then 'ბრენდინგი'
    when category = 'Marketing' then 'მარკეტინგი'
    when category = 'UI/UX' then 'UI/UX'
    else category
  end;

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
  price_explanation_en = case when price_explanation_en = '' then coalesce(price_explanation, '') else price_explanation_en end;

alter table public.team_members
  add column if not exists name_ka text not null default '',
  add column if not exists name_en text not null default '',
  add column if not exists role_ka text not null default '',
  add column if not exists role_en text not null default '',
  add column if not exists bio_ka text not null default '',
  add column if not exists bio_en text not null default '',
  add column if not exists skills_ka jsonb not null default '[]'::jsonb,
  add column if not exists skills_en jsonb not null default '[]'::jsonb,
  add column if not exists image_alt_ka text not null default '',
  add column if not exists image_alt_en text not null default '';

update public.team_members
set
  name_en = case when name_en = '' then name else name_en end,
  role_en = case when role_en = '' then role else role_en end,
  bio_en = case when bio_en = '' then bio else bio_en end,
  skills_en = case when skills_en = '[]'::jsonb then skills else skills_en end,
  image_alt_en = case when image_alt_en = '' then name || ' portrait' else image_alt_en end;
