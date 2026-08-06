-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Update Entrepreneur Support Hero Description Text
-- ═══════════════════════════════════════════════════════════════════════════
-- Consolidated from:
--   • migrations/update_entrepreneur_support_hero.sql
--
-- Updates the hero section description text on the entrepreneur-support page
-- to include the full Georgian brand name mention.
--
-- Safe to run multiple times — idempotent via specific WHERE clause.
-- ═══════════════════════════════════════════════════════════════════════════

-- Campaign sections: hero description (text rendered on /entrepreneur-support)
UPDATE public.campaign_sections
SET
  description_ka = 'ბიზნესისა და ტექნოლოგიების აკადემია მისი საწარმოს ბითიეი ლაბის მეშვეობით იწყებს მცირე და საშუალო მეწარმეების, დამწყები ბიზნესებისა და ორგანიზაციების ციფრული განვითარების მხარდამჭერ კამპანიას.

კამპანიის ფარგლებში შეირჩევა 10 პროექტი, რომლებიც მიიღებენ ვებგვერდის შექმნის მომსახურების 100%, 60% ან 30%-იან დაფინანსებას.',
  description_en = 'BTA LAB is launching a campaign to support the digital development of small and medium entrepreneurs, startups, and organizations. Within the campaign, 10 projects will be selected to receive 100%, 60%, or 30% funding for website creation services.',
  updated_at = now()
WHERE page_slug = 'entrepreneur-support' AND section_key = 'hero';

-- Campaign pages: hero description (used for meta/seo)
UPDATE public.campaign_pages
SET
  description_ka = 'ბიზნესისა და ტექნოლოგიების აკადემია მისი საწარმოს ბითიეი ლაბის მეშვეობით იწყებს მცირე და საშუალო მეწარმეების, დამწყები ბიზნესებისა და ორგანიზაციების ციფრული განვითარების მხარდამჭერ კამპანიას.

კამპანიის ფარგლებში შეირჩევა 10 პროექტი, რომლებიც მიიღებენ ვებგვერდის შექმნის მომსახურების 100%, 60% ან 30%-იან დაფინანსებას.',
  description_en = 'The enterprise BTA LAB of the Business and Technology Academy is launching a campaign to support the digital development of small and medium entrepreneurs, startups, and organizations. Within the campaign, 10 projects will be selected to receive 100%, 60%, or 30% funding for website creation services.',
  updated_at = now()
WHERE slug = 'entrepreneur-support';

-- ═══════════════════════════════════════════════════════════════════════════
-- NOTES ON FRONTEND FORMATTING
-- ═══════════════════════════════════════════════════════════════════════════
-- The HeroDescription component in campaign-landing-client.tsx handles:
--
--   "ბიზნესისა და ტექნოლოგიების აკადემია"
--     → Bold + underline + link to https://bta.edu.ge (opens in new tab)
--
--   "10 პროექტი"
--     → Bold + underline
--
--   "100%", "60%", "30%"
--     → Bold + underline
--
-- The text is split on \n\n into two separate <p> elements.
-- ═══════════════════════════════════════════════════════════════════════════
