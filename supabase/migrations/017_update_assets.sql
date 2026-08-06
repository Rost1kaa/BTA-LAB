-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Campaign Asset Update (017)
-- ═══════════════════════════════════════════════════════════════════════════
-- Normalizes campaign image references in the database to the new webp asset.
--
--   Old (removed file):  /images/campain.png
--   Old (never shipped): /images/og-campaign.png
--   New:                 /images/campain.webp
--
-- Safe to run multiple times (idempotent) — every update is guarded by an
-- existence check and a precise WHERE clause on the old literal.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. campaign_seo (og_image / twitter_image) ──────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'campaign_seo'
  ) THEN
    UPDATE public.campaign_seo
    SET
      og_image      = CASE
                        WHEN og_image      LIKE '%campain.png%'  THEN REPLACE(og_image,      'campain.png',  'campain.webp')
                        WHEN og_image      LIKE '%og-campaign.png%' THEN REPLACE(og_image, 'og-campaign.png', 'campain.webp')
                        ELSE og_image
                      END,
      twitter_image = CASE
                        WHEN twitter_image LIKE '%campain.png%'  THEN REPLACE(twitter_image, 'campain.png',  'campain.webp')
                        WHEN twitter_image LIKE '%og-campaign.png%' THEN REPLACE(twitter_image, 'og-campaign.png', 'campain.webp')
                        ELSE twitter_image
                      END
    WHERE og_image LIKE '%campain.png%'
       OR og_image LIKE '%og-campaign.png%'
       OR twitter_image LIKE '%campain.png%'
       OR twitter_image LIKE '%og-campaign.png%';
  END IF;
END $$;

-- ── 2. campaign_sections (image column) ──────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'campaign_sections'
  ) THEN
    UPDATE public.campaign_sections
    SET image = REPLACE(image, 'campain.png', 'campain.webp')
    WHERE image LIKE '%campain.png%';
  END IF;
END $$;

-- ── 3. campaign_cards (image column) ────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'campaign_cards'
  ) THEN
    UPDATE public.campaign_cards
    SET image = REPLACE(image, 'campain.png', 'campain.webp')
    WHERE image LIKE '%campain.png%';
  END IF;
END $$;

-- ── 4. site_settings (image-type settings, e.g. campaign/social images) ──
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'site_settings'
  ) THEN
    UPDATE public.site_settings
    SET
      setting_value = REPLACE(setting_value, 'campain.png', 'campain.webp'),
      value_ka      = REPLACE(value_ka,      'campain.png', 'campain.webp'),
      value_en      = REPLACE(value_en,      'campain.png', 'campain.webp')
    WHERE setting_value LIKE '%campain.png%'
       OR value_ka      LIKE '%campain.png%'
       OR value_en      LIKE '%campain.png%';
  END IF;
END $$;

-- ── 5. site_content (image-type CMS values) ─────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'site_content'
  ) THEN
    UPDATE public.site_content
    SET
      content_value_ka = REPLACE(content_value_ka, 'campain.png', 'campain.webp'),
      content_value_en = REPLACE(content_value_en, 'campain.png', 'campain.webp')
    WHERE content_value_ka LIKE '%campain.png%'
       OR content_value_en LIKE '%campain.png%';
  END IF;
END $$;

-- ── 6. campaign_settings (image-type campaign settings) ─────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'campaign_settings'
  ) THEN
    UPDATE public.campaign_settings
    SET
      setting_value_ka = REPLACE(setting_value_ka, 'campain.png', 'campain.webp'),
      setting_value_en = REPLACE(setting_value_en, 'campain.png', 'campain.webp')
    WHERE setting_value_ka LIKE '%campain.png%'
       OR setting_value_en LIKE '%campain.png%';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════
-- Replaces every stored 'campain.png' / 'og-campaign.png' reference with
-- '/images/campain.webp' across campaign and CMS tables. No-op on fresh DBs.
-- ═══════════════════════════════════════════════════════════════════════════
