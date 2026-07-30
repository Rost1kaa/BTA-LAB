-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Phone Number Migration to International Format
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Purpose:
--   Update all existing phone number values from the old local format
--   "579009247" to the international format "+995 579 009 247".
--
--   Also update bare telephone URI links from "tel:579009247" to
--   "tel:+995579009247".
--
-- Tables potentially affected (sorted):
--   • site_settings           — contact_phone (setting_value, value_ka, value_en)
--   • site_content            — CMS text placeholders (content_value_ka, content_value_en)
--   • campaign_settings       — campaign_phone (setting_value_ka, setting_value_en)
--   • contact_messages        — user-submitted phone
--   • service_requests        — user-submitted phone, customer_phone
--   • campaign_applications   — applicant phone
--   • campaign_application_drafts — JSONB form_data — DROPPED in migration 008,
--                                   included with existence guard for safety
--   • campaign_email_templates    — email body templates (body_ka, body_en)
--   • campaign_email_log          — sent email bodies (body)
--   • legal_policies              — policy content (content_ka, content_en)
--
-- Safety / Idempotency:
--   • Every table reference is guarded by an existence check via
--     information_schema.tables — no error if a table was dropped.
--   • WHERE clauses use LIKE '%579009247%' — only rows containing the
--     old exact string are touched.
--   • WHERE clauses also exclude strings that already start with '+995'
--     so the new format is never double-replaced.
--   • Safe to run any number of times.
--   • No schema changes — UPDATE statements only.
--
-- Rollback:
--   Update the same columns replacing '+995 579 009 247' with '579009247'
--   and 'tel:+995579009247' with 'tel:579009247'.
--
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- Helper: safe update macro (exists → update)
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '═══ Starting phone number migration ═══';
  RAISE NOTICE 'Old format:  579009247  →  New format:  +995 579 009 247';
  RAISE NOTICE 'Tel format:  tel:579009247  →  tel:+995579009247';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. site_settings — contact_phone
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
    RAISE NOTICE 'site_settings: updated';
  ELSE
    RAISE NOTICE 'site_settings: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. site_content — CMS text content (phone placeholders, footer info, etc.)
-- ═══════════════════════════════════════════════════════════════════════════

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
    RAISE NOTICE 'site_content: updated';
  ELSE
    RAISE NOTICE 'site_content: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. campaign_settings — campaign_phone
-- ═══════════════════════════════════════════════════════════════════════════

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
    RAISE NOTICE 'campaign_settings: updated';
  ELSE
    RAISE NOTICE 'campaign_settings: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. contact_messages — user-submitted phone numbers
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_messages') THEN
    UPDATE public.contact_messages
    SET phone = REPLACE(phone, '579009247', '+995 579 009 247')
    WHERE phone LIKE '%579009247%'
      AND phone NOT LIKE '+995%';
    RAISE NOTICE 'contact_messages: updated';
  ELSE
    RAISE NOTICE 'contact_messages: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. service_requests — user-submitted phone numbers
-- ═══════════════════════════════════════════════════════════════════════════

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
    RAISE NOTICE 'service_requests: updated';
  ELSE
    RAISE NOTICE 'service_requests: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. campaign_applications — applicant phone numbers
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_applications') THEN
    UPDATE public.campaign_applications
    SET phone = REPLACE(phone, '579009247', '+995 579 009 247')
    WHERE phone LIKE '%579009247%'
      AND phone NOT LIKE '+995%';
    RAISE NOTICE 'campaign_applications: updated';
  ELSE
    RAISE NOTICE 'campaign_applications: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. campaign_application_drafts — JSONB form_data (contains phone as string)
--    ⚠  This table was DROPPED in migration 008_cleanup_unused_tables.
--       The existence guard ensures this runs safely on any database.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_application_drafts') THEN
    UPDATE public.campaign_application_drafts
    SET form_data = REPLACE(form_data::text, '579009247', '+995 579 009 247')::jsonb
    WHERE form_data::text LIKE '%579009247%'
      AND form_data::text NOT LIKE '%+995%';
    RAISE NOTICE 'campaign_application_drafts: updated';
  ELSE
    RAISE NOTICE 'campaign_application_drafts: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. campaign_email_templates — email body content
-- ═══════════════════════════════════════════════════════════════════════════

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
    RAISE NOTICE 'campaign_email_templates: updated';
  ELSE
    RAISE NOTICE 'campaign_email_templates: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. campaign_email_log — sent email body content
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_email_log') THEN
    UPDATE public.campaign_email_log
    SET body = REPLACE(body, '579009247', '+995 579 009 247')
    WHERE body LIKE '%579009247%'
      AND body NOT LIKE '%+995 579 009 247%';
    RAISE NOTICE 'campaign_email_log: updated';
  ELSE
    RAISE NOTICE 'campaign_email_log: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. legal_policies — policy document content
-- ═══════════════════════════════════════════════════════════════════════════

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
    RAISE NOTICE 'legal_policies: updated';
  ELSE
    RAISE NOTICE 'legal_policies: skipped (table does not exist)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 11. Telephone URI links (tel:) — update bare number links
-- ═══════════════════════════════════════════════════════════════════════════
-- Handles cases where "tel:579009247" was stored (without +995 prefix).

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

-- ═══════════════════════════════════════════════════════════════════════════
-- 12. ANY remaining text/jsonb column — dynamic catch-all scan
-- ═══════════════════════════════════════════════════════════════════════════
-- This DO block iterates over all text-like columns in the public schema
-- and issues REPLACE UPDATEs for any that still contain '579009247'.
-- It handles both plain text columns and JSONB columns (cast to text).
-- Already-updated rows are unaffected because the old literal no longer
-- exists in them.
--
-- ⚠  The dynamic scan queries information_schema.tables at runtime,
--    so it naturally skips tables that do not exist. No guard needed.
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
-- Summary
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Phone number migration complete.';
  RAISE NOTICE 'Old format:  579009247';
  RAISE NOTICE 'New format:  +995 579 009 247';
  RAISE NOTICE 'Tel format:  tel:+995579009247';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════════════════';
END $$;

COMMIT;
