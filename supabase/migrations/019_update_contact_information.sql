-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Update Contact Information (019)
-- ═══════════════════════════════════════════════════════════════════════════
-- Consolidated from:
--   • sql/update_address_to_official.sql
--   • sql/update_phone_number_to_international_format.sql
--
-- Changes applied:
--   1. Address: "თბილისი, საქართველო" → "თბილისი, წერონისის 208"
--      (EN: "Tbilisi, Georgia" → "Tbilisi, Tseronisi 208")
--   2. Phone: "579009247" → "+995 579 009 247"
--      tel: "tel:579009247" → "tel:+995579009247"
--
-- Safety / Idempotency:
--   • Every table reference is guarded by an existence check via
--     information_schema.tables — no error if a table was dropped.
--   • WHERE clauses use exact string match or LIKE on the old literal.
--   • Safe to run any number of times. UPDATE statements only — no schema changes.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 1 — ADDRESS UPDATE
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
  END IF;
END $$;

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
  END IF;
END $$;

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
  END IF;
END $$;

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
  END IF;
END $$;

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
  END IF;
END $$;

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
  END IF;
END $$;

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
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 2 — PHONE NUMBER FORMAT UPDATE
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_settings') THEN
    UPDATE public.site_settings
    SET
      setting_value = REPLACE(setting_value, '579009247', '+995 579 009 247'),
      value_ka      = REPLACE(value_ka,      '579009247', '+995 579 009 247'),
      value_en      = REPLACE(value_en,      '579009247', '+995 579 009 247')
    WHERE
      setting_key IN ('contact_phone')
      AND (   setting_value LIKE '%579009247%'
           OR value_ka      LIKE '%579009247%'
           OR value_en      LIKE '%579009247%');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_content') THEN
    UPDATE public.site_content
    SET
      content_value_ka = REPLACE(content_value_ka, '579009247', '+995 579 009 247'),
      content_value_en = REPLACE(content_value_en, '579009247', '+995 579 009 247')
    WHERE
         content_value_ka LIKE '%579009247%'
      OR content_value_en LIKE '%579009247%';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_settings') THEN
    UPDATE public.campaign_settings
    SET
      setting_value_ka = REPLACE(setting_value_ka, '579009247', '+995 579 009 247'),
      setting_value_en = REPLACE(setting_value_en, '579009247', '+995 579 009 247')
    WHERE
      setting_key IN ('campaign_phone')
      AND (   setting_value_ka LIKE '%579009247%'
           OR setting_value_en LIKE '%579009247%');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_messages') THEN
    UPDATE public.contact_messages
    SET phone = REPLACE(phone, '579009247', '+995 579 009 247')
    WHERE phone LIKE '%579009247%'
      AND phone NOT LIKE '+995%';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'service_requests') THEN
    UPDATE public.service_requests
    SET
      phone          = REPLACE(phone,          '579009247', '+995 579 009 247'),
      customer_phone = REPLACE(customer_phone, '579009247', '+995 579 009 247')
    WHERE
         (phone          LIKE '%579009247%' AND phone          NOT LIKE '+995%')
      OR (customer_phone LIKE '%579009247%' AND customer_phone NOT LIKE '+995%');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_applications') THEN
    UPDATE public.campaign_applications
    SET phone = REPLACE(phone, '579009247', '+995 579 009 247')
    WHERE phone LIKE '%579009247%'
      AND phone NOT LIKE '+995%';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_application_drafts') THEN
    UPDATE public.campaign_application_drafts
    SET form_data = REPLACE(form_data::text, '579009247', '+995 579 009 247')::jsonb
    WHERE form_data::text LIKE '%579009247%'
      AND form_data::text NOT LIKE '%+995%';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_email_templates') THEN
    UPDATE public.campaign_email_templates
    SET
      body_ka = REPLACE(body_ka, '579009247', '+995 579 009 247'),
      body_en = REPLACE(body_en, '579009247', '+995 579 009 247')
    WHERE
         body_ka LIKE '%579009247%'
      OR body_en LIKE '%579009247%';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_email_log') THEN
    UPDATE public.campaign_email_log
    SET body = REPLACE(body, '579009247', '+995 579 009 247')
    WHERE body LIKE '%579009247%'
      AND body NOT LIKE '%+995 579 009 247%';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'legal_policies') THEN
    UPDATE public.legal_policies
    SET
      content_ka = REPLACE(content_ka, '579009247', '+995 579 009 247'),
      content_en = REPLACE(content_en, '579009247', '+995 579 009 247')
    WHERE
         content_ka LIKE '%579009247%'
      OR content_en LIKE '%579009247%';
  END IF;
END $$;

-- ── Telephone URI links (tel:) ───────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_settings') THEN
    UPDATE public.site_settings
    SET
      setting_value = REPLACE(setting_value, 'tel:579009247', 'tel:+995579009247'),
      value_ka      = REPLACE(value_ka,      'tel:579009247', 'tel:+995579009247'),
      value_en      = REPLACE(value_en,      'tel:579009247', 'tel:+995579009247')
    WHERE
         setting_value LIKE '%tel:579009247%'
      OR value_ka      LIKE '%tel:579009247%'
      OR value_en      LIKE '%tel:579009247%';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_content') THEN
    UPDATE public.site_content
    SET
      content_value_ka = REPLACE(content_value_ka, 'tel:579009247', 'tel:+995579009247'),
      content_value_en = REPLACE(content_value_en, 'tel:579009247', 'tel:+995579009247')
    WHERE
         content_value_ka LIKE '%tel:579009247%'
      OR content_value_en LIKE '%tel:579009247%';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_settings') THEN
    UPDATE public.campaign_settings
    SET
      setting_value_ka = REPLACE(setting_value_ka, 'tel:579009247', 'tel:+995579009247'),
      setting_value_en = REPLACE(setting_value_en, 'tel:579009247', 'tel:+995579009247')
    WHERE
         setting_value_ka LIKE '%tel:579009247%'
      OR setting_value_en LIKE '%tel:579009247%';
  END IF;
END $$;

-- ── Any remaining text/jsonb column — dynamic catch-all scan ────────────
-- Iterates over all text-like columns in the public schema and replaces the
-- old phone literal. Already-updated rows are unaffected. Tables that no
-- longer exist are naturally skipped via information_schema at runtime.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  rec RECORD;
  sql TEXT;
  rows_affected INTEGER := 0;
BEGIN
  FOR rec IN
    SELECT
      t.table_name,
      c.column_name,
      c.data_type
    FROM information_schema.tables t
    JOIN information_schema.columns c
      ON c.table_name = t.table_name
      AND c.table_schema = t.table_schema
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND c.data_type IN ('text', 'character varying', 'jsonb')
      -- Skip columns already handled above to avoid redundant updates
      AND NOT (
        (t.table_name = 'site_settings'            AND c.column_name IN ('setting_value','value_ka','value_en'))
        OR (t.table_name = 'site_content'            AND c.column_name IN ('content_value_ka','content_value_en'))
        OR (t.table_name = 'campaign_settings'       AND c.column_name IN ('setting_value_ka','setting_value_en'))
        OR (t.table_name = 'contact_messages'        AND c.column_name = 'phone')
        OR (t.table_name = 'service_requests'        AND c.column_name IN ('phone','customer_phone'))
        OR (t.table_name = 'campaign_applications'   AND c.column_name = 'phone')
        OR (t.table_name = 'campaign_application_drafts' AND c.column_name = 'form_data')
        OR (t.table_name = 'campaign_email_templates'    AND c.column_name IN ('body_ka','body_en'))
        OR (t.table_name = 'campaign_email_log'          AND c.column_name = 'body')
        OR (t.table_name = 'legal_policies'               AND c.column_name IN ('content_ka','content_en'))
      )
  LOOP
    IF rec.data_type = 'jsonb' THEN
      sql := format(
        'UPDATE public.%I SET %I = REPLACE(%I::text, ''579009247'', ''+995 579 009 247'')::jsonb WHERE %I::text LIKE ''%%579009247%%'' AND %I::text NOT LIKE ''%%+995%%''',
        rec.table_name, rec.column_name, rec.column_name, rec.column_name, rec.column_name
      );
    ELSE
      sql := format(
        'UPDATE public.%I SET %I = REPLACE(%I, ''579009247'', ''+995 579 009 247'') WHERE %I LIKE ''%%579009247%%'' AND %I NOT LIKE ''%%+995%%''',
        rec.table_name, rec.column_name, rec.column_name, rec.column_name, rec.column_name
      );
    END IF;

    EXECUTE sql;
    GET DIAGNOSTICS rows_affected = ROW_COUNT;

    IF rows_affected > 0 THEN
      RAISE NOTICE 'Catch-all: updated % rows in public.%.%', rows_affected, rec.table_name, rec.column_name;
    END IF;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════
-- Address:  თბილისი, საქართველო  →  თბილისი, წერონისის 208
-- Phone:    579009247  →  +995 579 009 247
-- Tel:      tel:579009247  →  tel:+995579009247
-- ═══════════════════════════════════════════════════════════════════════════
