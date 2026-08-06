-- ============================================================
-- BTA LAB — Fix Duplicate Team Members (022)
-- ============================================================
-- Removes duplicated team_members records that appear on the team
-- page after seeding.
--
-- Root cause: team members were inserted by different sources that
-- use different id schemes:
--   • migration 016 inserts rows with fixed UUIDs
--     (11111111-...-000000000001 .. 000000000007)
--   • scripts/seed.ts upserts rows with deterministic hash UUIDs
-- Both rows carry the same name/position, so the frontend shows each
-- member multiple times.
--
-- This migration keeps the earliest-inserted row (smallest ctid) per
-- duplicate group and deletes the rest. A row is only removed when it
-- is an exact duplicate of an earlier row matched by:
--   • (name, position)  — the primary key, or
--   • (name_ka, position_ka) — for rows created through the admin
--     panel that store the English name in the `name` column.
-- Rows that have no duplicate are never touched, so the correct name,
-- position, description, and image reference are preserved.
--
-- Idempotent — safe to run multiple times. Uses table/column existence
-- checks; does not reference missing objects.
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'team_members'
  ) THEN

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'team_members'
        AND column_name = 'position'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'team_members'
        AND column_name = 'position_ka'
    ) THEN
      -- Dedupe by (name, position) and by (name_ka, position_ka).
      DELETE FROM public.team_members a
      USING public.team_members b
      WHERE a.ctid > b.ctid
        AND (
          (a.name = b.name AND a.position = b.position AND a.name <> '')
          OR (a.name_ka = b.name_ka AND a.position_ka = b.position_ka AND a.name_ka <> '')
        );
    ELSE
      -- Fallback: dedupe by name / name_ka on legacy schemas without the
      -- position columns.
      DELETE FROM public.team_members a
      USING public.team_members b
      WHERE a.ctid > b.ctid
        AND (
          (a.name = b.name AND a.name <> '')
          OR (a.name_ka = b.name_ka AND a.name_ka <> '')
        );
    END IF;

    RAISE NOTICE 'Duplicate team members removed — one row kept per member.';
  ELSE
    RAISE NOTICE 'Table team_members does not exist — skipped.';
  END IF;
END $$;
