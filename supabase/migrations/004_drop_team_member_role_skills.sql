-- Drop role and skills columns from team_members table
-- These fields are no longer used in the application.

alter table public.team_members
  drop column if exists role,
  drop column if exists role_ka,
  drop column if exists role_en,
  drop column if exists skills,
  drop column if exists skills_ka,
  drop column if exists skills_en;
