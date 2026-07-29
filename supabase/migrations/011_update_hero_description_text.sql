-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Update Entrepreneur Support Hero Description Text
-- 
-- Updates the hero section description text on the entrepreneur-support page
-- to include the full Georgian brand name mention.
--
-- Safe to run multiple times — idempotent via specific WHERE clause.
-- ═══════════════════════════════════════════════════════════════════════════

-- Campaign pages: hero description
UPDATE public.campaign_pages
SET
  description_ka = 'ბიზნესისა და ტექნოლოგიების აკადემია მისი საწარმოს ბითიეი ლაბის მეშვეობით იწყებს მცირე და საშუალო მეწარმეების, დამწყები ბიზნესებისა და ორგანიზაციების ციფრული განვითარების მხარდამჭერ კამპანიას.

კამპანიის ფარგლებში შეირჩევა 10 პროექტი, რომლებიც მიიღებენ ვებგვერდის შექმნის მომსახურების 100%, 60% ან 30%-იან დაფინანსებას.',
  description_en = 'The Enterprise of the Business and Technology Academy, through its enterprise BTA LAB, is launching a campaign to support the digital development of small and medium entrepreneurs, startups, and organizations. Within the campaign, 10 projects will be selected to receive 100%, 60%, or 30% funding for website creation services.',
  updated_at = now()
WHERE slug = 'entrepreneur-support';

-- Campaign sections: hero description
UPDATE public.campaign_sections
SET
  description_ka = 'ბიზნესისა და ტექნოლოგიების აკადემია მისი საწარმოს ბითიეი ლაბის მეშვეობით იწყებს მცირე და საშუალო მეწარმეების, დამწყები ბიზნესებისა და ორგანიზაციების ციფრული განვითარების მხარდამჭერ კამპანიას.',
  description_en = 'Through its enterprise BTA LAB, the Business and Technology Academy is launching a campaign to support the digital development of small and medium entrepreneurs, startups, and organizations.',
  updated_at = now()
WHERE page_slug = 'entrepreneur-support' AND section_key = 'hero';
