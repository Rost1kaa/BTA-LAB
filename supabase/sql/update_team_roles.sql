-- update_team_roles.sql
-- BTA LAB — Update team member positions
--
-- Updates the position of team members from "მასწავლებელი" (Teacher) to
-- "ლექტორი" (Lecturer) for the following members:
--   - გაიოზ კუპრაშვილი
--   - ცოტნე ჩადუნელი
--
-- Safe to run multiple times (idempotent).

DO $$
BEGIN
  -- ── team_members ────────────────────────────────────────────────────
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'team_members'
  ) THEN
    -- Update გაიოზ კუპრაშვილი
    UPDATE public.team_members
    SET
      position = 'ლექტორი',
      position_ka = 'ლექტორი',
      position_en = 'ლექტორი'
    WHERE name = 'გაიოზ კუპრაშვილი'
      AND position = 'მასწავლებელი';

    IF FOUND THEN
      RAISE NOTICE '✓ გაიოზ კუპრაშვილი position updated to ლექტორი';
    ELSE
      RAISE NOTICE '→ გაიოზ კუპრაშვილი already updated or not found';
    END IF;

    -- Update ცოტნე ჩადუნელი
    UPDATE public.team_members
    SET
      position = 'ლექტორი',
      position_ka = 'ლექტორი',
      position_en = 'ლექტორი'
    WHERE name = 'ცოტნე ჩადუნელი'
      AND position = 'მასწავლებელი';

    IF FOUND THEN
      RAISE NOTICE '✓ ცოტნე ჩადუნელი position updated to ლექტორი';
    ELSE
      RAISE NOTICE '→ ცოტნე ჩადუნელი already updated or not found';
    END IF;
  ELSE
    RAISE NOTICE '→ table team_members does not exist, skipped';
  END IF;
END $$;
