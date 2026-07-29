-- ═══════════════════════════════════════════════════════════════════════════
-- Add current_step column to campaign_details
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.campaign_details
  ADD COLUMN IF NOT EXISTS current_step INT DEFAULT 1;

-- Set a sensible default (step 2 = Review stage active)
UPDATE public.campaign_details
SET current_step = 2
WHERE id = 1 AND current_step = 1;
