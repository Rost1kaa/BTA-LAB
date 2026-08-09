-- ============================================================================
-- BTA LAB — Update Technical Support Period 14 → 30 Days (024)
-- ============================================================================
-- Updates ONLY the technical support day-count text for the website packages
-- in the `service_packages` table:
--
--   "14-დღიანი ტექნიკური მხარდაჭერა" → "30-დღიანი ტექნიკური მხარდაჭერა"
--   "14-day technical support"       → "30-day technical support"
--
-- Safe to run multiple times (idempotent):
--   * Wrapped in a DO block guarded by a table existence check
--   * `array_replace` is a no-op when the value is not present
--   * NULL feature arrays are left untouched (array_replace(NULL, ...) → NULL)
-- No prices, package names, descriptions, other features, or numbers are touched.
-- ============================================================================

do $$
begin
  -- Do not reference missing tables — skip entirely if the table does not exist.
  if to_regclass('public.service_packages') is not null then

    -- `features` and `features_en` store the English feature list; `features_ka`
    -- stores the Georgian feature list. `array_replace` is idempotent.
    update public.service_packages
    set features    = array_replace(features, '14-day technical support', '30-day technical support'),
        features_en = array_replace(features_en, '14-day technical support', '30-day technical support'),
        features_ka = array_replace(features_ka, '14-დღიანი ტექნიკური მხარდაჭერა', '30-დღიანი ტექნიკური მხარდაჭერა')
    where section = 'website';

  end if;
end $$;
