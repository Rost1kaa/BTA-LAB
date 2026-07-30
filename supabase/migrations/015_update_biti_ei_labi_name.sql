-- 015_update_biti_ei_labi_name.sql
-- BTA LAB — Update Georgian organization display name to "ბითიეი ლაბი"
--
-- Replaces "BTA LAB" with "ბითიეი ლაბი" in all visible Georgian text fields
-- across the database.
--
-- IMPORTANT: Does NOT modify homepage slogan:
--   "BTA LAB — ციფრული ინოვაციების ლაბორატორია"
--
-- Safe to run multiple times (idempotent).

-- ── Helper function to safely replace in text fields ──────────────────────
-- Replaces 'BTA LAB' with 'ბითიეი ლაბი' in a text value,
-- BUT preserves the protected homepage slogan.
CREATE OR REPLACE FUNCTION replace_org_name(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  protected_slogan CONSTANT text := 'BTA LAB — ციფრული ინოვაციების ლაბორატორია';
BEGIN
  -- If the entire text is exactly the protected slogan, return unchanged
  IF input_text = protected_slogan THEN
    RETURN input_text;
  END IF;

  -- Replace 'BTA LAB' with 'ბითიეი ლაბი' in the text
  -- Use regex to avoid matching within words
  RETURN regexp_replace(
    input_text,
    'BTA LAB(?! — ციფრული ინოვაციების ლაბორატორია)',
    'ბითიეი ლაბი',
    'g'
  );
END;
$$;

-- ── 1. site_settings (setting_value — used as English fallback) ──────────
-- Only update settings that contain Georgian text (site_name)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'site_settings'
  ) THEN
    UPDATE public.site_settings
    SET setting_value = replace_org_name(setting_value)
    WHERE setting_value LIKE '%BTA LAB%'
      AND setting_value != 'BTA LAB — ციფრული ინოვაციების ლაბორატორია';

    RAISE NOTICE '✓ site_settings updated';
  ELSE
    RAISE NOTICE '→ table site_settings does not exist, skipped';
  END IF;
END $$;

-- ── 2. site_content (Georgian text in CMS content blocks) ──────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'site_content'
  ) THEN
    UPDATE public.site_content
    SET content_value_ka = replace_org_name(content_value_ka)
    WHERE content_value_ka LIKE '%BTA LAB%'
      AND content_value_ka != 'BTA LAB — ციფრული ინოვაციების ლაბორატორია';

    RAISE NOTICE '✓ site_content.content_value_ka updated';
  ELSE
    RAISE NOTICE '→ table site_content does not exist, skipped';
  END IF;
END $$;

-- ── 3. campaign_settings (Georgian text values) ─────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'campaign_settings'
  ) THEN
    -- Update Georgian values (setting_value_ka)
    UPDATE public.campaign_settings
    SET setting_value_ka = replace_org_name(setting_value_ka)
    WHERE setting_value_ka LIKE '%BTA LAB%';

    -- Update English values that may contain "BTA LAB" in context
    UPDATE public.campaign_settings
    SET setting_value_en = replace_org_name(setting_value_en)
    WHERE setting_value_en LIKE '%BTA LAB%';

    RAISE NOTICE '✓ campaign_settings updated';
  ELSE
    RAISE NOTICE '→ table campaign_settings does not exist, skipped';
  END IF;
END $$;

-- ── 4. campaign_sections (Georgian title, subtitle, description, content) ─

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'campaign_sections'
  ) THEN
    UPDATE public.campaign_sections
    SET
      title_ka = replace_org_name(title_ka),
      subtitle_ka = replace_org_name(subtitle_ka),
      description_ka = replace_org_name(description_ka),
      content_ka = replace_org_name(content_ka)
    WHERE
      title_ka LIKE '%BTA LAB%'
      OR subtitle_ka LIKE '%BTA LAB%'
      OR description_ka LIKE '%BTA LAB%';

    RAISE NOTICE '✓ campaign_sections updated';
  ELSE
    RAISE NOTICE '→ table campaign_sections does not exist, skipped';
  END IF;
END $$;

-- ── 5. campaign_seo (Georgian SEO fields) ──────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'campaign_seo'
  ) THEN
    UPDATE public.campaign_seo
    SET
      title_ka = replace_org_name(title_ka),
      description_ka = replace_org_name(description_ka),
      keywords_ka = replace_org_name(keywords_ka),
      og_title_ka = replace_org_name(og_title_ka),
      og_description_ka = replace_org_name(og_description_ka),
      twitter_title_ka = replace_org_name(twitter_title_ka),
      twitter_description_ka = replace_org_name(twitter_description_ka)
    WHERE
      title_ka LIKE '%BTA LAB%';

    RAISE NOTICE '✓ campaign_seo updated';
  ELSE
    RAISE NOTICE '→ table campaign_seo does not exist, skipped';
  END IF;
END $$;

-- ── 6. campaign_faq (Georgian questions and answers) ────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'campaign_faq'
  ) THEN
    UPDATE public.campaign_faq
    SET
      question_ka = replace_org_name(question_ka),
      answer_ka = replace_org_name(answer_ka)
    WHERE
      question_ka LIKE '%BTA LAB%'
      OR answer_ka LIKE '%BTA LAB%';

    RAISE NOTICE '✓ campaign_faq updated';
  ELSE
    RAISE NOTICE '→ table campaign_faq does not exist, skipped';
  END IF;
END $$;

-- ── 7. campaign_cards (Georgian title, description) ────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'campaign_cards'
  ) THEN
    UPDATE public.campaign_cards
    SET
      title_ka = replace_org_name(title_ka),
      description_ka = replace_org_name(description_ka)
    WHERE
      title_ka LIKE '%BTA LAB%'
      OR description_ka LIKE '%BTA LAB%';

    RAISE NOTICE '✓ campaign_cards updated';
  ELSE
    RAISE NOTICE '→ table campaign_cards does not exist, skipped';
  END IF;
END $$;

-- ── 8. campaign_cta (Georgian title, description, button text) ────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'campaign_cta'
  ) THEN
    UPDATE public.campaign_cta
    SET
      title_ka = replace_org_name(title_ka),
      description_ka = replace_org_name(description_ka),
      button_text_ka = replace_org_name(button_text_ka),
      secondary_button_text_ka = replace_org_name(secondary_button_text_ka)
    WHERE
      title_ka LIKE '%BTA LAB%'
      OR description_ka LIKE '%BTA LAB%';

    RAISE NOTICE '✓ campaign_cta updated';
  ELSE
    RAISE NOTICE '→ table campaign_cta does not exist, skipped';
  END IF;
END $$;

-- ── 9. legal_policies (Georgian content) ───────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'legal_policies'
  ) THEN
    UPDATE public.legal_policies
    SET content_ka = replace_org_name(content_ka)
    WHERE content_ka LIKE '%BTA LAB%';

    RAISE NOTICE '✓ legal_policies updated';
  ELSE
    RAISE NOTICE '→ table legal_policies does not exist, skipped';
  END IF;
END $$;

-- ── Cleanup helper function ─────────────────────────────────────────────

DROP FUNCTION IF EXISTS replace_org_name;

-- ── Summary ──────────────────────────────────────────────────────────────

DO $$
BEGIN
  RAISE NOTICE '──────────────────────────────────────────────────';
  RAISE NOTICE 'Organization name update complete.';
  RAISE NOTICE '  OLD: BTA LAB → NEW: ბითიეი ლაბი (Georgian text only)';
  RAISE NOTICE '  Protected: "BTA LAB — ციფრული ინოვაციების ლაბორატორია"';
  RAISE NOTICE '──────────────────────────────────────────────────';
END $$;
