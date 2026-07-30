-- update_mariam_photo.sql
-- BTA LAB — Update Mariam Kakiashvili photo path
--
-- Ensures Mariam Kakiashvili's photo uses the correct path /team/mariami.webp.
--
-- Safe to run multiple times (idempotent).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'team_members'
  ) THEN
    UPDATE public.team_members
    SET image = '/team/mariami.webp'
    WHERE name = 'მარიამ კაკიაშვილი'
      AND (image IS NULL OR image != '/team/mariami.webp');

    IF FOUND THEN
      RAISE NOTICE '✓ მარიამ კაკიაშვილი photo path updated to /team/mariami.webp';
    ELSE
      RAISE NOTICE '→ მარიამ კაკიაშვილი photo path already correct or member not found';
    END IF;
  ELSE
    RAISE NOTICE '→ table team_members does not exist, skipped';
  END IF;
END $$;
