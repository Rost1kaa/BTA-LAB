-- ============================================================
-- Fix admin_profiles Row Level Security
-- ============================================================
-- The previous "Admin can read admin profiles" policy used:
--   using (auth.uid() in (select id from public.admin_profiles))
--
-- This caused a circular dependency: to read admin_profiles, the user
-- must already be listed in admin_profiles. The subquery also triggered
-- RLS on the same table, leading to potential recursive evaluation.
--
-- The fix replaces it with a direct "own profile" comparison:
--   using (id = auth.uid())
--
-- This allows any authenticated user to read their OWN admin_profiles
-- row (if one exists). Users without a row simply get empty results.

-- Drop the old circular policy
drop policy if exists "Admin can read admin profiles" on public.admin_profiles;

-- Create a simpler, non-recursive policy that reads by direct ID match
create policy "Admins can read own profile"
  on public.admin_profiles for select
  to authenticated
  using (id = auth.uid());
