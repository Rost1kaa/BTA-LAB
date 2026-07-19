-- ============================================================
-- Secure administrator authorization and CMS policies
-- ============================================================

-- Creating an Auth user must never grant CMS administrator access.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_admin_user();

-- Policy helper avoids recursive RLS checks against admin_profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Admin profiles: users may only read/update their own existing row.
drop policy if exists "Admin can read admin profiles" on public.admin_profiles;
drop policy if exists "Admins can read own profile" on public.admin_profiles;
drop policy if exists "Admin can insert admin profiles" on public.admin_profiles;
drop policy if exists "Admin can update own profile" on public.admin_profiles;

create policy "Admins can read own profile"
  on public.admin_profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Admins can update own profile"
  on public.admin_profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Replace every CMS write policy with the same non-recursive admin check.
drop policy if exists "Admin can insert site content" on public.site_content;
drop policy if exists "Admin can update site content" on public.site_content;
drop policy if exists "Admin can delete site content" on public.site_content;
create policy "Admins can insert site content" on public.site_content for insert to authenticated with check ((select public.is_admin()));
create policy "Admins can update site content" on public.site_content for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete site content" on public.site_content for delete to authenticated using ((select public.is_admin()));

drop policy if exists "Admin can insert portfolio categories" on public.portfolio_categories;
drop policy if exists "Admin can update portfolio categories" on public.portfolio_categories;
drop policy if exists "Admin can delete portfolio categories" on public.portfolio_categories;
create policy "Admins can insert portfolio categories" on public.portfolio_categories for insert to authenticated with check ((select public.is_admin()));
create policy "Admins can update portfolio categories" on public.portfolio_categories for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete portfolio categories" on public.portfolio_categories for delete to authenticated using ((select public.is_admin()));

drop policy if exists "Admin can insert portfolio projects" on public.portfolio_projects;
drop policy if exists "Admin can update portfolio projects" on public.portfolio_projects;
drop policy if exists "Admin can delete portfolio projects" on public.portfolio_projects;
drop policy if exists "Admins can read all portfolio projects" on public.portfolio_projects;
create policy "Admins can read all portfolio projects" on public.portfolio_projects for select to authenticated using ((select public.is_admin()));
create policy "Admins can insert portfolio projects" on public.portfolio_projects for insert to authenticated with check ((select public.is_admin()));
create policy "Admins can update portfolio projects" on public.portfolio_projects for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete portfolio projects" on public.portfolio_projects for delete to authenticated using ((select public.is_admin()));

drop policy if exists "Admin can insert team members" on public.team_members;
drop policy if exists "Admin can update team members" on public.team_members;
drop policy if exists "Admin can delete team members" on public.team_members;
drop policy if exists "Admins can read all team members" on public.team_members;
create policy "Admins can read all team members" on public.team_members for select to authenticated using ((select public.is_admin()));
create policy "Admins can insert team members" on public.team_members for insert to authenticated with check ((select public.is_admin()));
create policy "Admins can update team members" on public.team_members for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete team members" on public.team_members for delete to authenticated using ((select public.is_admin()));

drop policy if exists "Admin can insert service packages" on public.service_packages;
drop policy if exists "Admin can update service packages" on public.service_packages;
drop policy if exists "Admin can delete service packages" on public.service_packages;
drop policy if exists "Admins can read all service packages" on public.service_packages;
create policy "Admins can read all service packages" on public.service_packages for select to authenticated using ((select public.is_admin()));
create policy "Admins can insert service packages" on public.service_packages for insert to authenticated with check ((select public.is_admin()));
create policy "Admins can update service packages" on public.service_packages for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete service packages" on public.service_packages for delete to authenticated using ((select public.is_admin()));

drop policy if exists "Admin can insert site settings" on public.site_settings;
drop policy if exists "Admin can update site settings" on public.site_settings;
drop policy if exists "Admin can delete site settings" on public.site_settings;
create policy "Admins can insert site settings" on public.site_settings for insert to authenticated with check ((select public.is_admin()));
create policy "Admins can update site settings" on public.site_settings for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete site settings" on public.site_settings for delete to authenticated using ((select public.is_admin()));

-- Storage writes are restricted to authenticated administrators.
drop policy if exists "Admin can upload portfolio images" on storage.objects;
drop policy if exists "Admin can update portfolio images" on storage.objects;
drop policy if exists "Admin can delete portfolio images" on storage.objects;
create policy "Admins can upload portfolio images" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-images' and (select public.is_admin()));
create policy "Admins can update portfolio images" on storage.objects for update to authenticated using (bucket_id = 'portfolio-images' and (select public.is_admin())) with check (bucket_id = 'portfolio-images' and (select public.is_admin()));
create policy "Admins can delete portfolio images" on storage.objects for delete to authenticated using (bucket_id = 'portfolio-images' and (select public.is_admin()));

drop policy if exists "Admin can upload team images" on storage.objects;
drop policy if exists "Admin can update team images" on storage.objects;
drop policy if exists "Admin can delete team images" on storage.objects;
create policy "Admins can upload team images" on storage.objects for insert to authenticated with check (bucket_id = 'team-images' and (select public.is_admin()));
create policy "Admins can update team images" on storage.objects for update to authenticated using (bucket_id = 'team-images' and (select public.is_admin())) with check (bucket_id = 'team-images' and (select public.is_admin()));
create policy "Admins can delete team images" on storage.objects for delete to authenticated using (bucket_id = 'team-images' and (select public.is_admin()));

-- Correct the known stale seed/database image value without touching uploads.
update public.portfolio_projects
set cover_image = '/images/qey_ge.webp'
where cover_image = '/images/projects/qey-cover.jpg';

-- The original seed referenced avatar files that were never shipped. Empty values
-- intentionally activate the initials fallback until real portraits are uploaded.
update public.team_members
set image = ''
where image ~ '^/images/team/member-[1-8]\.jpg$';
