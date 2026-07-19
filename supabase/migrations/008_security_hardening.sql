-- ============================================================
-- Security hardening for storage and protected CMS surfaces
-- ============================================================

alter table public.admin_profiles enable row level security;
alter table public.site_content enable row level security;
alter table public.portfolio_categories enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.team_members enable row level security;
alter table public.service_packages enable row level security;
alter table public.site_settings enable row level security;

update storage.buckets
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/webp', 'image/png', 'image/jpeg']
where id in ('portfolio-images', 'team-images');

drop policy if exists "Admins can upload portfolio images" on storage.objects;
drop policy if exists "Admins can update portfolio images" on storage.objects;
drop policy if exists "Admins can delete portfolio images" on storage.objects;
drop policy if exists "Admins can upload team images" on storage.objects;
drop policy if exists "Admins can update team images" on storage.objects;
drop policy if exists "Admins can delete team images" on storage.objects;

create policy "Admins can upload portfolio images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-images'
    and (select public.is_admin())
    and lower(storage.extension(name)) in ('webp', 'png', 'jpg', 'jpeg')
  );

create policy "Admins can update portfolio images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'portfolio-images'
    and (select public.is_admin())
  )
  with check (
    bucket_id = 'portfolio-images'
    and (select public.is_admin())
    and lower(storage.extension(name)) in ('webp', 'png', 'jpg', 'jpeg')
  );

create policy "Admins can delete portfolio images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'portfolio-images'
    and (select public.is_admin())
  );

create policy "Admins can upload team images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'team-images'
    and (select public.is_admin())
    and lower(storage.extension(name)) in ('webp', 'png', 'jpg', 'jpeg')
  );

create policy "Admins can update team images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'team-images'
    and (select public.is_admin())
  )
  with check (
    bucket_id = 'team-images'
    and (select public.is_admin())
    and lower(storage.extension(name)) in ('webp', 'png', 'jpg', 'jpeg')
  );

create policy "Admins can delete team images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'team-images'
    and (select public.is_admin())
  );

comment on function public.is_admin() is
  'Used by RLS policies to allow CMS writes only for users listed in public.admin_profiles. MFA and CSRF checks are enforced by the Next.js server layer.';
