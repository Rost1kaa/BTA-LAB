-- ============================================================================
-- Script: Clean up price suffixes & set billing labels
-- Date:   2024-07-26
--
-- 1. Clears price_suffix_ka = '' AND price_suffix_en = '' (empty strings)
--    for ALL services EXCEPT "სოციალური მედიის სრული მართვა".
-- 2. For that exception service only:
--      price_suffix_ka = '-დან'
--      price_suffix_en  = 'from'
--      price           = '1500'
--      billing_label_ka = 'თვეში'
--      billing_label_en = 'per month'
-- ============================================================================

-- ── Step 1: Clear suffixes to empty strings for all services
--            EXCEPT the one we want to keep.
UPDATE service_packages
SET
  price_suffix_ka = '',
  price_suffix_en = ''
WHERE
  COALESCE(name, '')    NOT ILIKE '%Full Social Media Management%'
  AND COALESCE(name_ka, '') NOT ILIKE '%სოციალური მედიის სრული მართვა%'
  AND COALESCE(name_en, '') NOT ILIKE '%Full Social Media Management%';

-- ── Step 2: Set the target service's suffixes, price, and billing labels.
UPDATE service_packages
SET
  price_suffix_ka  = '-დან',
  price_suffix_en   = 'from',
  price             = '1500',
  billing_label_ka  = 'თვეში',
  billing_label_en  = 'per month'
WHERE
  name    ILIKE '%Full Social Media Management%'
  OR name_ka ILIKE '%სოციალური მედიის სრული მართვა%'
  OR name_en ILIKE '%Full Social Media Management%';
