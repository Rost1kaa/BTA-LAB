-- ============================================================================
-- BTA LAB — Update Website Package Pricing & Support Days (023)
-- ============================================================================
-- Updates ONLY pricing values and the 7-day technical support text for the
-- website packages in the `service_packages` table:
--
--   Landing Starter    ₾199  →  ₾300
--   One Page Website   ₾300  →  ₾500
--   Business Website   ₾799  →  ₾999
--   Online Store       ₾999  →  ₾1199
--
--   "7-დღიანი ტექნიკური მხარდაჭერა" → "30-დღიანი ტექნიკური მხარდაჭერა"
--   "7-day technical support"       → "30-day technical support"
--
-- Safe to run multiple times (idempotent):
--   * Wrapped in a DO block guarded by a table existence check
--   * `array_replace` is a no-op when the value is not present
--   * Re-setting an already-updated price is a no-op
-- No other services, names, descriptions, features, or numbers are touched.
-- ============================================================================

do $$
begin
  -- Do not reference missing tables — skip entirely if the table does not exist.
  if to_regclass('public.service_packages') is not null then

    -- ── 1. Prices (website section only, matched by exact name) ──────────
    update public.service_packages
    set price = '300'
    where section = 'website'
      and (name = 'Landing Starter' or name_en = 'Landing Starter' or name_ka = 'ლენდინგ სტარტერი');

    update public.service_packages
    set price = '500'
    where section = 'website'
      and (name = 'One Page Website' or name_en = 'One Page Website' or name_ka = 'ერთგვერდიანი ვებგვერდი');

    update public.service_packages
    set price = '999'
    where section = 'website'
      and (name = 'Business Website' or name_en = 'Business Website' or name_ka = 'ბიზნეს ვებგვერდი');

    update public.service_packages
    set price = '1199'
    where section = 'website'
      and (name = 'Online Store' or name_en = 'Online Store' or name_ka = 'ონლაინ მაღაზია');

    -- ── 2. Technical support days: 7 → 30 (website section only) ─────────
    -- `features` and `features_en` store the English feature list; `features_ka`
    -- stores the Georgian feature list. `array_replace` is idempotent.
    update public.service_packages
    set features    = array_replace(features, '7-day technical support', '30-day technical support'),
        features_en = array_replace(features_en, '7-day technical support', '30-day technical support'),
        features_ka = array_replace(features_ka, '7-დღიანი ტექნიკური მხარდაჭერა', '30-დღიანი ტექნიკური მხარდაჭერა')
    where section = 'website';

  end if;
end $$;
