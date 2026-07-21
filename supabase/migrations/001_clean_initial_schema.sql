-- BTA Lab clean Supabase schema
-- Apply this to a fresh Supabase project, then run `npm run seed`.

create extension if not exists pgcrypto;

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
  role text not null default '',
  role_ka text not null default '',
  role_en text not null default '',
  bio text not null default '',
  bio_ka text not null default '',
  bio_en text not null default '',
  skills text[] not null default '{}',
  skills_ka text[] not null default '{}',
  skills_en text[] not null default '{}',
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
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'read', 'in_progress', 'closed', 'spam')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index site_content_page_section_idx on public.site_content (page, section, sort_order);
create index site_settings_key_idx on public.site_settings (setting_key);
create index portfolio_projects_public_idx on public.portfolio_projects (published, featured, display_order, created_at desc);
create index team_members_public_idx on public.team_members (published, display_order);
create index service_packages_public_idx on public.service_packages (published, section, display_order);
create index contact_messages_status_created_idx on public.contact_messages (status, created_at desc);
create index service_requests_type_status_created_idx on public.service_requests (service_type, status, created_at desc);

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

create trigger contact_messages_set_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

create trigger service_requests_set_updated_at
  before update on public.service_requests
  for each row execute function public.set_updated_at();

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

alter table public.admin_profiles enable row level security;
alter table public.site_content enable row level security;
alter table public.site_settings enable row level security;
alter table public.portfolio_categories enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.team_members enable row level security;
alter table public.service_packages enable row level security;
alter table public.contact_messages enable row level security;
alter table public.service_requests enable row level security;

create policy "Admins can manage admin profiles"
  on public.admin_profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can read their admin profile"
  on public.admin_profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "Public can read site content"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

create policy "Admins can manage site content"
  on public.site_content
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public can read site settings"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

create policy "Admins can manage site settings"
  on public.site_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public can read portfolio categories"
  on public.portfolio_categories
  for select
  to anon, authenticated
  using (true);

create policy "Admins can manage portfolio categories"
  on public.portfolio_categories
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public can read published portfolio projects"
  on public.portfolio_projects
  for select
  to anon, authenticated
  using (published = true);

create policy "Admins can manage portfolio projects"
  on public.portfolio_projects
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public can read published team members"
  on public.team_members
  for select
  to anon, authenticated
  using (published = true);

create policy "Admins can manage team members"
  on public.team_members
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public can read active service packages"
  on public.service_packages
  for select
  to anon, authenticated
  using (published = true and active = true);

create policy "Admins can manage service packages"
  on public.service_packages
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public can submit contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

create policy "Admins can manage contact messages"
  on public.contact_messages
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public can submit service requests"
  on public.service_requests
  for insert
  to anon, authenticated
  with check (true);

create policy "Admins can manage service requests"
  on public.service_requests
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

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
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'portfolio-images');

drop policy if exists "Admins can manage portfolio images" on storage.objects;
create policy "Admins can manage portfolio images"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'portfolio-images' and public.is_admin())
  with check (bucket_id = 'portfolio-images' and public.is_admin());
