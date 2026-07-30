-- 014_update_social_links.sql
-- BTA LAB official social media link update
-- 
-- Updates all social media URLs to the new official BTA LAB accounts.
-- Safe to run multiple times (idempotent) — uses DO blocks to check table existence.
--
-- New official accounts:
--   Facebook:  https://www.facebook.com/bta.lab.official
--   Instagram: https://www.instagram.com/bta.lab.official
--   TikTok:    https://www.tiktok.com/@bta.lab.official

-- ── 1. Update site_settings (bilingual CMS settings) ──────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'site_settings'
  ) THEN
    UPDATE public.site_settings
    SET setting_value = 'https://www.facebook.com/bta.lab.official'
    WHERE setting_key = 'social_facebook';

    UPDATE public.site_settings
    SET setting_value = 'https://www.instagram.com/bta.lab.official'
    WHERE setting_key = 'social_instagram';

    -- Insert or update TikTok (may not exist yet)
    IF EXISTS (SELECT 1 FROM public.site_settings WHERE setting_key = 'social_tiktok') THEN
      UPDATE public.site_settings
      SET setting_value = 'https://www.tiktok.com/@bta.lab.official'
      WHERE setting_key = 'social_tiktok';
    ELSE
      INSERT INTO public.site_settings (setting_key, setting_value, setting_type)
      VALUES ('social_tiktok', 'https://www.tiktok.com/@bta.lab.official', 'url');
    END IF;

    RAISE NOTICE '✓ site_settings updated';
  ELSE
    RAISE NOTICE '→ table site_settings does not exist, skipped';
  END IF;
END $$;

-- ── 2. Update campaign_settings (bilingual campaign social URLs & labels) ──

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'campaign_settings'
  ) THEN

    -- Facebook
    UPDATE public.campaign_settings
    SET
      setting_value_ka = 'https://www.facebook.com/bta.lab.official',
      setting_value_en = 'https://www.facebook.com/bta.lab.official'
    WHERE setting_key = 'campaign_facebook_url';

    UPDATE public.campaign_settings
    SET
      setting_value_ka = '@bta.lab.official',
      setting_value_en = '@bta.lab.official'
    WHERE setting_key = 'campaign_facebook_label';

    -- Instagram
    UPDATE public.campaign_settings
    SET
      setting_value_ka = 'https://www.instagram.com/bta.lab.official',
      setting_value_en = 'https://www.instagram.com/bta.lab.official'
    WHERE setting_key = 'campaign_instagram_url';

    UPDATE public.campaign_settings
    SET
      setting_value_ka = '@bta.lab.official',
      setting_value_en = '@bta.lab.official'
    WHERE setting_key = 'campaign_instagram_label';

    -- TikTok
    UPDATE public.campaign_settings
    SET
      setting_value_ka = 'https://www.tiktok.com/@bta.lab.official',
      setting_value_en = 'https://www.tiktok.com/@bta.lab.official'
    WHERE setting_key = 'campaign_tiktok_url';

    UPDATE public.campaign_settings
    SET
      setting_value_ka = '@bta.lab.official',
      setting_value_en = '@bta.lab.official'
    WHERE setting_key = 'campaign_tiktok_label';

    RAISE NOTICE '✓ campaign_settings updated';
  ELSE
    RAISE NOTICE '→ table campaign_settings does not exist, skipped';
  END IF;
END $$;

-- ── Summary ──────────────────────────────────────────────────────────────

DO $$
BEGIN
  RAISE NOTICE '──────────────────────────────────────────────────';
  RAISE NOTICE 'Social links migration complete.';
  RAISE NOTICE '  Facebook:  https://www.facebook.com/bta.lab.official';
  RAISE NOTICE '  Instagram: https://www.instagram.com/bta.lab.official';
  RAISE NOTICE '  TikTok:    https://www.tiktok.com/@bta.lab.official';
  RAISE NOTICE '──────────────────────────────────────────────────';
END $$;
