-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Address Update to Official Location
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Purpose:
--   Update the BTA LAB address in the database from the old generic location
--   to the new official street address.
--
--   Old:  თბილისი, საქართველო
--   New:  თბილისი, წერონისის 208
--
-- Tables affected:
--   • site_settings       — contact_address, contact_location
--   • site_content        — any CMS content containing the old address
--   • campaign_settings   — campaign-related address content
--   • campaign_sections   — campaign page content sections
--   • campaign_pages      — campaign page descriptions
--   • legal_policies      — policy documents
--   • campaign_email_templates — email body text
--
-- Safety / Idempotency:
--   • Every table reference is guarded by an existence check via
--     information_schema.tables — no error if a table was dropped.
--   • WHERE clauses use exact string match or LIKE on the old address.
--   • Rows already updated are untouched.
--   • Safe to run any number of times.
--   • UPDATE statements only — no schema changes.
--
-- Rollback:
--   Run the same UPDATEs with old ↔ new values swapped.
--
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

DO $$
BEGIN
  RAISE NOTICE '═══ Starting address update ═══';
  RAISE NOTICE 'Old:  თბილისი, საქართველო';
  RAISE NOTICE 'New:  თბილისი, წერონისის 208';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. site_settings — contact_address & contact_location
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_settings') THEN
    UPDATE public.site_settings
    SET
      setting_value = 'თბილისი, წერონისის 208',
      value_ka      = 'თბილისი, წერონისის 208',
      value_en      = 'Tbilisi, Tseronisi 208'
    WHERE
      setting_key IN ('contact_address', 'contact_location')
      AND setting_value = 'თბილისი, საქართველო';
    RAISE NOTICE 'site_settings: updated';
  ELSE
    RAISE NOTICE 'site_settings: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. site_content — any CMS text entries that may contain the old address
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_content') THEN
    UPDATE public.site_content
    SET
      content_value_ka = REPLACE(content_value_ka, 'თბილისი, საქართველო', 'თბილისი, წერონისის 208'),
      content_value_en = REPLACE(content_value_en, 'Tbilisi, Georgia', 'Tbilisi, Tseronisi 208')
    WHERE
         content_value_ka LIKE '%თბილისი, საქართველო%'
      OR content_value_en LIKE '%Tbilisi, Georgia%';
    RAISE NOTICE 'site_content: updated';
  ELSE
    RAISE NOTICE 'site_content: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. campaign_settings — campaign-related content that may reference the address
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_settings') THEN
    UPDATE public.campaign_settings
    SET
      setting_value_ka = REPLACE(setting_value_ka, 'თბილისი, საქართველო', 'თბილისი, წერონისის 208'),
      setting_value_en = REPLACE(setting_value_en, 'Tbilisi, Georgia', 'Tbilisi, Tseronisi 208')
    WHERE
         setting_value_ka LIKE '%თბილისი, საქართველო%'
      OR setting_value_en LIKE '%Tbilisi, Georgia%';
    RAISE NOTICE 'campaign_settings: updated';
  ELSE
    RAISE NOTICE 'campaign_settings: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. campaign_sections — campaign page content sections
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_sections') THEN
    UPDATE public.campaign_sections
    SET
      description_ka = REPLACE(description_ka, 'თბილისი, საქართველო', 'თბილისი, წერონისის 208'),
      description_en = REPLACE(description_en, 'Tbilisi, Georgia', 'Tbilisi, Tseronisi 208'),
      content_ka     = REPLACE(content_ka,     'თბილისი, საქართველო', 'თბილისი, წერონისის 208'),
      content_en     = REPLACE(content_en,     'Tbilisi, Georgia', 'Tbilisi, Tseronisi 208'),
      title_ka       = REPLACE(title_ka,       'თბილისი, საქართველო', 'თბილისი, წერონისის 208'),
      title_en       = REPLACE(title_en,       'Tbilisi, Georgia', 'Tbilisi, Tseronisi 208')
    WHERE
         description_ka LIKE '%თბილისი, საქართველო%'
      OR description_en LIKE '%Tbilisi, Georgia%'
      OR content_ka     LIKE '%თბილისი, საქართველო%'
      OR content_en     LIKE '%Tbilisi, Georgia%'
      OR title_ka       LIKE '%თბილისი, საქართველო%'
      OR title_en       LIKE '%Tbilisi, Georgia%';
    RAISE NOTICE 'campaign_sections: updated';
  ELSE
    RAISE NOTICE 'campaign_sections: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. campaign_pages — campaign page descriptions
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_pages') THEN
    UPDATE public.campaign_pages
    SET
      description_ka = REPLACE(description_ka, 'თბილისი, საქართველო', 'თბილისი, წერონისის 208'),
      description_en = REPLACE(description_en, 'Tbilisi, Georgia', 'Tbilisi, Tseronisi 208')
    WHERE
         description_ka LIKE '%თბილისი, საქართველო%'
      OR description_en LIKE '%Tbilisi, Georgia%';
    RAISE NOTICE 'campaign_pages: updated';
  ELSE
    RAISE NOTICE 'campaign_pages: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. legal_policies — policy documents (privacy, cookies)
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'legal_policies') THEN
    UPDATE public.legal_policies
    SET
      content_ka = REPLACE(content_ka, 'თბილისი, საქართველო', 'თბილისი, წერონისის 208'),
      content_en = REPLACE(content_en, 'Tbilisi, Georgia', 'Tbilisi, Tseronisi 208')
    WHERE
         content_ka LIKE '%თბილისი, საქართველო%'
      OR content_en LIKE '%Tbilisi, Georgia%';
    RAISE NOTICE 'legal_policies: updated';
  ELSE
    RAISE NOTICE 'legal_policies: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. campaign_email_templates — email body text
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_email_templates') THEN
    UPDATE public.campaign_email_templates
    SET
      body_ka = REPLACE(body_ka, 'თბილისი, საქართველო', 'თბილისი, წერონისის 208'),
      body_en = REPLACE(body_en, 'Tbilisi, Georgia', 'Tbilisi, Tseronisi 208')
    WHERE
         body_ka LIKE '%თბილისი, საქართველო%'
      OR body_en LIKE '%Tbilisi, Georgia%';
    RAISE NOTICE 'campaign_email_templates: updated';
  ELSE
    RAISE NOTICE 'campaign_email_templates: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Summary
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Address update complete.';
  RAISE NOTICE 'Old:  თბილისი, საქართველო';
  RAISE NOTICE 'New:  თბილისი, წერონისის 208';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════════════════';
END $$;

COMMIT;
