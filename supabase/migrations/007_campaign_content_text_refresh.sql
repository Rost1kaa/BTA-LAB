-- ═══════════════════════════════════════════════════════════════════════════
-- Campaign Content Text Refresh
-- Fixes: name references, removes duplicate bullets, updates Georgian text
-- ═══════════════════════════════════════════════════════════════════════════
-- Safe to run multiple times — uses WHERE + UPDATE on stable section keys.
--
-- Major changes:
--  1. Replace "BTA LAB" with "ბიზნესისა და ტექნოლოგიების აკადემიის საწარმო"
--     (enterprise name) or "ბიზნესისა და ტექნოლოგიების აკადემია" (funder).
--  2. Remove the duplicate bulleted list from the overview grey box (content_ka).
--  3. Update hero, overview, funding, funding cards, and CTA with the
--     exact Georgian text provided by the campaign specification.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. HERO ─────────────────────────────────────────────────────────────
UPDATE public.campaign_sections SET
  title_ka       = 'განავითარე შენი ბიზნესი თანამედროვე ვებგვერდით',
  title_en       = 'Develop Your Business with a Modern Website',
  description_ka = 'ბიზნესისა და ტექნოლოგიების აკადემია მისი საწარმოს ბითიეი ლაბის მეშვეობით იწყებს მცირე და საშუალო მეწარმეების, დამწყები ბიზნესებისა და ორგანიზაციების ციფრული განვითარების მხარდამჭერ კამპანიას.

კამპანიის ფარგლებში შეირჩევა 10 პროექტი, რომლებიც მიიღებენ ვებგვერდის შექმნის მომსახურების 100%, 60% ან 30%-იან დაფინანსებას.',
  description_en = 'The Enterprise of the Business and Technology Academy is launching a campaign to support the digital development of small and medium entrepreneurs, startups, and organizations. Within the campaign, 10 projects will be selected to receive 100%, 60%, or 30% funding for website creation services.',
  badge_ka       = 'ახალი შესაძლებლობა',
  badge_en       = 'New Opportunity',
  button_text_ka = 'შეავსე განაცხადი',
  button_text_en = 'Apply Now',
  button_url     = '/entrepreneur-support/apply'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'hero';

-- ── 2. OVERVIEW (section rendered on the landing page) ──────────────────
-- Removes the duplicate bulleted list from content_ka (the grey box)
-- and updates title/badge/description with the correct Georgian text.
UPDATE public.campaign_sections SET
  title_ka       = 'კამპანიის მოკლე აღწერა',
  title_en       = 'Campaign Overview',
  description_ka = 'თანამედროვე ბიზნესგარემოში პროფესიული ონლაინ წარმომადგენლობა მომხმარებელთან ურთიერთობის, ცნობადობისა და გაყიდვების განვითარების მნიშვნელოვანი ინსტრუმენტია. ბიზნესისა და ტექნოლოგიების აკადემიის საწარმოს კამპანიის მიზანია დაეხმაროს მეწარმეებსა და ორგანიზაციებს:'||E'\n'||E'\n'||
    '• შეექმნათ პროფესიული ონლაინ წარმომადგენლობა;'||E'\n'||
    '• წარმოაჩინონ საკუთარი პროდუქტი ან მომსახურება;'||E'\n'||
    '• გააუმჯობესონ მომხმარებელთან კომუნიკაცია;'||E'\n'||
    '• მიიღონ ონლაინ განაცხადები, შეკვეთები ან მოთხოვნები;'||E'\n'||
    '• დაიწყონ ან გააძლიერონ საკუთარი ციფრული განვითარება.',
  description_en = 'In the modern business environment, a professional online presence is an important tool for customer relations, brand awareness, and sales development. The Enterprise of the Business and Technology Academy campaign aims to help entrepreneurs and organizations:'||E'\n'||
    '• Create a professional online presence;'||E'\n'||
    '• Showcase their products or services;'||E'\n'||
    '• Improve customer communication;'||E'\n'||
    '• Increase brand awareness;'||E'\n'||
    '• Receive online applications, orders, or requests;'||E'\n'||
    '• Start or enhance their digital transformation.',
  badge_ka       = 'მიზანი',
  badge_en       = 'Goal',
  content_ka     = '',   -- Remove duplicate bulleted list from grey box
  content_en     = ''    -- Remove duplicate bulleted list from grey box
WHERE page_slug = 'entrepreneur-support' AND section_key = 'overview';

-- ── 3. FUNDING MODEL (campaign_sections) ────────────────────────────────
UPDATE public.campaign_sections SET
  title_ka       = 'დაფინანსება',
  title_en       = 'Funding',
  description_ka = '100% დაფინანსება (1 პროექტი)'||E'\n'||
    'ბიზნესისა და ტექნოლოგიების აკადემია სრულად დაფარავს შეთანხმებული ვებგვერდის შექმნის მომსახურების ღირებულებას.'||E'\n'||E'\n'||
    '60% დაფინანსება (3 პროექტი)'||E'\n'||
    'ბიზნესისა და ტექნოლოგიების აკადემია დაფარავს მომსახურების ღირებულების 60%-ს, მონაწილე — 40%-ს.'||E'\n'||E'\n'||
    '30% დაფინანსება (6 პროექტი)'||E'\n'||
    'ბიზნესისა და ტექნოლოგიების აკადემია დაფარავს მომსახურების ღირებულების 30%-ს, მონაწილე — 70%-ს.'||E'\n'||E'\n'||
    '* დაფინანსების პროცენტი და ოდენობა განისაზღვრება პროექტის შეფასების შედეგების მიხედვით.',
  description_en = '100% Funding (1 Project)'||E'\n'||
    'The Business and Technology Academy will fully cover the cost of the agreed website creation service.'||E'\n'||E'\n'||
    '60% Funding (3 Projects)'||E'\n'||
    'The Business and Technology Academy covers 60% of the service cost, the participant covers 40%.'||E'\n'||E'\n'||
    '30% Funding (6 Projects)'||E'\n'||
    'The Business and Technology Academy covers 30% of the service cost, the participant covers 70%.'||E'\n'||E'\n'||
    '* Funding percentage and amount are determined based on project evaluation results.',
  badge_ka       = 'დაფინანსება',
  badge_en       = 'Funding'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'funding';

-- ── 4. FUNDING CARDS (100%, 60%, 30%) ──────────────────────────────────
UPDATE public.campaign_cards SET
  description_ka = 'ბიზნესისა და ტექნოლოგიების აკადემია სრულად დაფარავს შეთანხმებული ვებგვერდის შექმნის მომსახურების ღირებულებას.',
  description_en = 'The Business and Technology Academy will fully cover the cost of the agreed website creation service.'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'funding' AND sort_order = 0;

UPDATE public.campaign_cards SET
  description_ka = 'ბიზნესისა და ტექნოლოგიების აკადემია დაფარავს მომსახურების ღირებულების 60%-ს, მონაწილე — 40%-ს.',
  description_en = 'The Business and Technology Academy covers 60% of the service cost, the participant covers 40%.'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'funding' AND sort_order = 1;

UPDATE public.campaign_cards SET
  description_ka = 'ბიზნესისა და ტექნოლოგიების აკადემია დაფარავს მომსახურების ღირებულების 30%-ს, მონაწილე — 70%-ს.',
  description_en = 'The Business and Technology Academy covers 30% of the service cost, the participant covers 70%.'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'funding' AND sort_order = 2;

-- ── 5. CTA SECTION ─────────────────────────────────────────────────────
UPDATE public.campaign_sections SET
  title_ka       = 'მზად ხარ დასაწყებად?',
  title_en       = 'Ready to Get Started?',
  description_ka = 'შეავსე განაცხადი და გახდი ბიზნესისა და ტექნოლოგიების აკადემიის საწარმოს მხარდაჭერილი მეწარმე. არ გამოტოვო ეს შესაძლებლობა!',
  description_en = 'Fill out the application and become an entrepreneur supported by the Enterprise of the Business and Technology Academy. Don''t miss this opportunity!'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'cta';

-- ── 5b. CTA TABLE ──────────────────────────────────────────────────────
UPDATE public.campaign_cta SET
  description_ka = 'შეავსე განაცხადი და გახდი ბიზნესისა და ტექნოლოგიების აკადემიის საწარმოს მხარდაჭერილი მეწარმე. არ გამოტოვო ეს შესაძლებლობა!',
  description_en = 'Fill out the application and become an entrepreneur supported by the Enterprise of the Business and Technology Academy. Don''t miss this opportunity!',
  button_text_ka = 'განაცხადის გაკეთება',
  button_text_en = 'Submit Application',
  button_url     = '/entrepreneur-support/apply'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'cta';

-- ═══════════════════════════════════════════════════════════════════════════
-- SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════
-- Updated: hero, overview, funding, campaign_cards (3), cta sections, cta table
-- 
-- Name convention applied:
--   "BTA LAB" as enterprise → "ბიზნესისა და ტექნოლოგიების აკადემიის საწარმო"
--   "BTA LAB" as funder    → "ბიზნესისა და ტექნოლოგიების აკადემია"
-- 
-- Duplicate bullets in overview content_ka: REMOVED
-- ═══════════════════════════════════════════════════════════════════════════
