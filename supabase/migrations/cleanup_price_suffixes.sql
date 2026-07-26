-- ============================================================================
-- Script: Clean up price_suffix fields across all service packages
-- Fix: Using empty string '' instead of NULL to satisfy NOT NULL constraints
-- ============================================================================

-- ── Step 1: Clear suffixes (set to empty string) for all services except the target ──
UPDATE service_packages
SET
  price_suffix_ka = '',
  price_suffix_en = ''
WHERE
  COALESCE(name, '')    NOT ILIKE '%Full Social Media Management%'
  AND COALESCE(name_ka, '') NOT ILIKE '%სოციალური მედიის სრული მართვა%'
  AND COALESCE(name_en, '') NOT ILIKE '%Full Social Media Management%';

-- ── Step 2: Ensure the target service keeps its price suffix ──────────────
UPDATE service_packages
SET
  price_suffix_ka = '+',
  price_suffix_en = '+'
WHERE
  name    ILIKE '%Full Social Media Management%'
  OR name_ka ILIKE '%სოციალური მედიის სრული მართვა%'
  OR name_en ILIKE '%Full Social Media Management%';

-- ── Step 3: Ensure billing_label is set for the target service ───────────
UPDATE service_packages
SET
  billing_label    = 'თვეში',
  billing_label_ka = 'თვეში',
  billing_label_en = 'per month'
WHERE
  name    ILIKE '%Full Social Media Management%'
  OR name_ka ILIKE '%სოციალური მედიის სრული მართვა%'
  OR name_en ILIKE '%Full Social Media Management%';