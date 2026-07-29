-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Entrepreneur Support Hero Content Update
--
-- Updates the hero section description_ka to two paragraphs with \n\n separator.
-- The frontend component (HeroDescription) renders:
--   Paragraph 1 (with "ბიზნესისა და ტექნოლოგიების აკადემია" as bold+underline+link to bta.edu.ge)
--   Paragraph 2 (with "10 პროექტი", "100%", "60%", "30%" as bold+underline)
--
-- Safe to run multiple times — idempotent via specific WHERE clause.
-- ═══════════════════════════════════════════════════════════════════════════

-- Hero section description (campaign_sections) — the actual text rendered on /entrepreneur-support
UPDATE public.campaign_sections
SET
  description_ka = 'ბიზნესისა და ტექნოლოგიების აკადემია მისი საწარმოს ბითიეი ლაბის მეშვეობით იწყებს მცირე და საშუალო მეწარმეების, დამწყები ბიზნესებისა და ორგანიზაციების ციფრული განვითარების მხარდამჭერ კამპანიას.

კამპანიის ფარგლებში შეირჩევა 10 პროექტი, რომლებიც მიიღებენ ვებგვერდის შექმნის მომსახურების 100%, 60% ან 30%-იან დაფინანსებას.',
  description_en = 'BTA LAB is launching a campaign to support the digital development of small and medium entrepreneurs, startups, and organizations. Within the campaign, 10 projects will be selected to receive 100%, 60%, or 30% funding for website creation services.',
  updated_at = now()
WHERE page_slug = 'entrepreneur-support' AND section_key = 'hero';

-- Page description (campaign_pages) — used for meta/seo
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
