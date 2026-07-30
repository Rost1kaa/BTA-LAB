-- update_team_join_text.sql
-- BTA LAB — Update team joining section text
--
-- Replaces the old team joining text with the updated Georgian version
-- that uses "ბითიეი ლაბში" instead of "BTA LAB-ში".
--
-- Safe to run multiple times (idempotent).

DO $$
DECLARE
  old_text CONSTANT text := 'ჩვენ მუდმივად ვეძებთ მოტივირებულ სტუდენტებს BTA LAB-ში გასაწევრიანებლად. თუ გსურთ სწავლა და რეალურ პროექტებზე მუშაობა, მოგესალმებით.';
  new_text CONSTANT text := 'ჩვენ მუდმივად ვეძებთ მოტივირებულ სტუდენტებს ბითიეი ლაბში გასაწევრიანებლად. თუ გსურთ სწავლა და რეალურ პროექტებზე მუშაობა, მოგესალმებით.';
BEGIN

  -- ── site_content (team section) ──────────────────────────────────────
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'site_content'
  ) THEN
    UPDATE public.site_content
    SET content_value_ka = new_text
    WHERE content_value_ka = old_text;

    IF FOUND THEN
      RAISE NOTICE '✓ site_content updated: team join description';
    ELSE
      RAISE NOTICE '→ site_content: no matching rows found (already updated or not present)';
    END IF;
  ELSE
    RAISE NOTICE '→ table site_content does not exist, skipped';
  END IF;

END $$;
