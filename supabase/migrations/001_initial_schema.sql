-- ============================================================
-- BTA LAB CMS Database Schema
-- ============================================================

-- 1. Extensions
create extension if not exists "uuid-ossp";

-- 2. Admin profiles (extends Supabase auth.users)
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Site content (key-value with metadata)
create table if not exists public.site_content (
  id uuid primary key default uuid_generate_v4(),
  page text not null,          -- 'home', 'about', 'services', 'team', 'contact', 'footer'
  section text not null,       -- 'hero', 'stats', 'values', 'cta', etc.
  content_key text not null,   -- 'heading', 'description', 'cta_label', etc.
  content_value text not null default '',
  content_type text not null default 'text' 
    check (content_type in ('text', 'textarea', 'number', 'url', 'image', 'rich_text', 'boolean', 'json')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_profiles(id) on delete set null,
  unique(page, section, content_key)
);

create index idx_site_content_page on public.site_content(page);
create index idx_site_content_page_section on public.site_content(page, section);

-- 4. Portfolio categories
create table if not exists public.portfolio_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 5. Portfolio projects
create table if not exists public.portfolio_projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  category_id uuid references public.portfolio_categories(id) on delete set null,
  category text not null default 'Web',
  description text not null default '',
  full_description text not null default '',
  problem text not null default '',
  solution text not null default '',
  results jsonb not null default '[]'::jsonb,
  technologies jsonb not null default '[]'::jsonb,
  cover_image text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  link text,
  featured boolean not null default false,
  published boolean not null default false,
  display_order int not null default 0,
  alt_text text not null default '',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(id) on delete set null,
  updated_by uuid references public.admin_profiles(id) on delete set null
);

create index idx_portfolio_projects_published on public.portfolio_projects(published);
create index idx_portfolio_projects_featured on public.portfolio_projects(featured, published);
create index idx_portfolio_projects_category on public.portfolio_projects(category);
create index idx_portfolio_projects_display_order on public.portfolio_projects(display_order);

-- 6. Team members
create table if not exists public.team_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null default '',
  bio text not null default '',
  skills jsonb not null default '[]'::jsonb,
  image text not null default '',
  socials jsonb not null default '{}'::jsonb,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_profiles(id) on delete set null
);

create index idx_team_members_display_order on public.team_members(display_order);

-- 7. Service packages
create table if not exists public.service_packages (
  id uuid primary key default uuid_generate_v4(),
  section text not null default 'website',  -- 'website', 'social-media', 'addons'
  name text not null,
  price text not null default '',
  billing_label text default '',
  description text default '',
  ideal_for text default '',
  features jsonb not null default '[]'::jsonb,
  delivery_time text default '',
  cta text not null default 'Choose Package',
  highlighted boolean not null default false,
  custom_price boolean not null default false,
  price_explanation text default '',
  icon_name text default '',
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_profiles(id) on delete set null
);

create index idx_service_packages_section on public.service_packages(section);
create index idx_service_packages_display_order on public.service_packages(display_order);

-- 8. Site settings (key-value for global settings)
create table if not exists public.site_settings (
  id uuid primary key default uuid_generate_v4(),
  setting_key text not null unique,
  setting_value text not null default '',
  setting_type text not null default 'text'
    check (setting_type in ('text', 'textarea', 'url', 'image', 'boolean', 'json')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_profiles(id) on delete set null
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.admin_profiles enable row level security;
alter table public.site_content enable row level security;
alter table public.portfolio_categories enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.team_members enable row level security;
alter table public.service_packages enable row level security;
alter table public.site_settings enable row level security;

-- Public read policies
create policy "Public can read site content"
  on public.site_content for select
  using (true);

create policy "Public can read portfolio categories"
  on public.portfolio_categories for select
  using (true);

create policy "Public can read published portfolio projects"
  on public.portfolio_projects for select
  using (published = true);

create policy "Public can read team members"
  on public.team_members for select
  using (published = true);

create policy "Public can read service packages"
  on public.service_packages for select
  using (published = true);

create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

-- Admin write policies (authenticated users with admin role)
create policy "Admin can insert site content"
  on public.site_content for insert
  with check (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can update site content"
  on public.site_content for update
  using (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can delete site content"
  on public.site_content for delete
  using (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can insert portfolio categories"
  on public.portfolio_categories for insert
  with check (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can update portfolio categories"
  on public.portfolio_categories for update
  using (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can delete portfolio categories"
  on public.portfolio_categories for delete
  using (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can insert portfolio projects"
  on public.portfolio_projects for insert
  with check (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can update portfolio projects"
  on public.portfolio_projects for update
  using (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can delete portfolio projects"
  on public.portfolio_projects for delete
  using (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can insert team members"
  on public.team_members for insert
  with check (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can update team members"
  on public.team_members for update
  using (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can delete team members"
  on public.team_members for delete
  using (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can insert service packages"
  on public.service_packages for insert
  with check (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can update service packages"
  on public.service_packages for update
  using (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can delete service packages"
  on public.service_packages for delete
  using (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can insert site settings"
  on public.site_settings for insert
  with check (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can update site settings"
  on public.site_settings for update
  using (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can delete site settings"
  on public.site_settings for delete
  using (auth.uid() in (select id from public.admin_profiles));

-- Admin profiles: only admins can read/write
create policy "Admin can read admin profiles"
  on public.admin_profiles for select
  using (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can insert admin profiles"
  on public.admin_profiles for insert
  with check (auth.uid() in (select id from public.admin_profiles));

create policy "Admin can update own profile"
  on public.admin_profiles for update
  using (auth.uid() = id);

-- ============================================================
-- Storage Buckets
-- ============================================================

-- Portfolio images bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-images',
  'portfolio-images',
  true,
  5242880, -- 5MB
  array['image/webp', 'image/png', 'image/jpeg']
)
on conflict (id) do nothing;

-- Team images bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'team-images',
  'team-images',
  true,
  2097152, -- 2MB
  array['image/webp', 'image/png', 'image/jpeg']
)
on conflict (id) do nothing;

-- Storage policies
create policy "Public can read portfolio images"
  on storage.objects for select
  using (bucket_id = 'portfolio-images');

create policy "Admin can upload portfolio images"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolio-images'
    and auth.uid() in (select id from public.admin_profiles)
  );

create policy "Admin can update portfolio images"
  on storage.objects for update
  using (
    bucket_id = 'portfolio-images'
    and auth.uid() in (select id from public.admin_profiles)
  );

create policy "Admin can delete portfolio images"
  on storage.objects for delete
  using (
    bucket_id = 'portfolio-images'
    and auth.uid() in (select id from public.admin_profiles)
  );

create policy "Public can read team images"
  on storage.objects for select
  using (bucket_id = 'team-images');

create policy "Admin can upload team images"
  on storage.objects for insert
  with check (
    bucket_id = 'team-images'
    and auth.uid() in (select id from public.admin_profiles)
  );

create policy "Admin can update team images"
  on storage.objects for update
  using (
    bucket_id = 'team-images'
    and auth.uid() in (select id from public.admin_profiles)
  );

create policy "Admin can delete team images"
  on storage.objects for delete
  using (
    bucket_id = 'team-images'
    and auth.uid() in (select id from public.admin_profiles)
  );

-- ============================================================
-- Functions & Triggers
-- ============================================================

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_admin_profiles_updated_at
  before update on public.admin_profiles
  for each row execute function public.update_updated_at();

create trigger trg_site_content_updated_at
  before update on public.site_content
  for each row execute function public.update_updated_at();

create trigger trg_portfolio_projects_updated_at
  before update on public.portfolio_projects
  for each row execute function public.update_updated_at();

create trigger trg_team_members_updated_at
  before update on public.team_members
  for each row execute function public.update_updated_at();

create trigger trg_service_packages_updated_at
  before update on public.service_packages
  for each row execute function public.update_updated_at();

create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.update_updated_at();

-- Auto-create admin profile when user is created via trigger
create or replace function public.handle_new_admin_user()
returns trigger as $$
begin
  insert into public.admin_profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_admin_user();
