-- ═══════════════════════════════════════════════════════════════════════════
-- Add position field to team_members table
-- ═══════════════════════════════════════════════════════════════════════════
-- Adds bilingual position (role/title) columns for team members.
-- The position is displayed between the member's name and bio on the Team page.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.team_members
  add column if not exists position text not null default '',
  add column if not exists position_ka text not null default '',
  add column if not exists position_en text not null default '';
