-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Campaign Content Seed (020)
-- ═══════════════════════════════════════════════════════════════════════════
-- Consolidated from:
--   • seeds/004_campaign_content_seed.sql
--   • seeds/005_campaign_full_content_update.sql
--   • seed-campaign.ts (email templates)
--
-- Safe to run multiple times — all statements use INSERT ... ON CONFLICT
-- DO UPDATE with stable IDs/conflict keys.
-- Apply AFTER migration 003_campaign_schema.sql (tables created there).
-- ═══════════════════════════════════════════════════════════════════════════

-- XV. SEED DATA — CAMPAIGN PAGE
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_pages (id, slug, title_ka, title_en, subtitle_ka, subtitle_en, description_ka, description_en, is_active)
VALUES (
  'a1b2c3d4-0001-4000-8000-000000000001',
  'entrepreneur-support',
  'BTA LAB — მეწარმეების ციფრული განვითარების მხარდაჭერა',
  'BTA LAB — Digital Entrepreneurship Development Support',
  'განავითარე შენი ბიზნესი თანამედროვე ვებგვერდით',
  'Develop your business with a modern website',
  'ბიზნესისა და ტექნოლოგიების აკადემია მისი საწარმოს ბითიეი ლაბის მეშვეობით იწყებს მცირე და საშუალო მეწარმეების, დამწყები ბიზნესებისა და ორგანიზაციების ციფრული განვითარების მხარდამჭერ კამპანიას.

კამპანიის ფარგლებში შეირჩევა 10 პროექტი, რომლებიც მიიღებენ ვებგვერდის შექმნის მომსახურების 100%, 60% ან 30%-იან დაფინანსებას.',
  'The enterprise BTA LAB of the Business and Technology Academy is launching a campaign to support the digital development of small and medium entrepreneurs, startups, and organizations. Within the campaign, 10 projects will be selected to receive 100%, 60%, or 30% funding for website creation services.',
  true
) ON CONFLICT (slug) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  subtitle_ka = EXCLUDED.subtitle_ka, subtitle_en = EXCLUDED.subtitle_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- XVI. SEED DATA — CAMPAIGN SECTIONS (19 sections matching frontend keys)
-- ═══════════════════════════════════════════════════════════════════════════
-- NOTE: section_key values must match what CampaignLandingClient expects:
--   hero, overview, funding, eligibility, projects, services, technologies,
--   criteria, cultural, selection, timeline, delivery, responsibilities,
--   branding, futureChanges, restrictions, faq, cta
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. hero (section_type: hero)
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, button_text_ka, button_text_en, button_url, sort_order, is_active)
VALUES (
  'a1b2c3d4-0101-4000-8000-000000000001',
  'entrepreneur-support', 'hero', 'hero',
  'განავითარე შენი ბიზნესი თანამედროვე ვებგვერდით',
  'Develop Your Business with a Modern Website',
  'ბიზნესისა და ტექნოლოგიების აკადემია მისი საწარმოს ბითიეი ლაბის მეშვეობით იწყებს მცირე და საშუალო მეწარმეების, დამწყები ბიზნესებისა და ორგანიზაციების ციფრული განვითარების მხარდამჭერ კამპანიას.

კამპანიის ფარგლებში შეირჩევა 10 პროექტი, რომლებიც მიიღებენ ვებგვერდის შექმნის მომსახურების 100%, 60% ან 30%-იან დაფინანსებას.',
  'BTA LAB is launching a campaign to support the digital development of small and medium entrepreneurs, startups, and organizations. Within the campaign, 10 projects will be selected to receive 100%, 60%, or 30% funding for website creation services.',
  'ახალი შესაძლებლობა', 'New Opportunity',
  'შეავსე განაცხადი', 'Submit Application', '/entrepreneur-support/apply',
  0, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en,
  button_text_ka = EXCLUDED.button_text_ka, button_text_en = EXCLUDED.button_text_en,
  button_url = EXCLUDED.button_url;

-- 2. overview (maps from old "purpose")
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, content_ka, content_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0102-4000-8000-000000000001',
  'entrepreneur-support', 'overview', 'content',
  'კამპანიის მოკლე აღწერა',
  'Campaign Overview',
  'თანამედროვე ბიზნესგარემოში პროფესიული ონლაინ წარმომადგენლობა მომხმარებელთან ურთიერთობის, ცნობადობისა და გაყიდვების განვითარების მნიშვნელოვანი ინსტრუმენტია. ბიზნესისა და ტექნოლოგიების აკადემიის საწარმოს კამპანიის მიზანია დაეხმაროს მეწარმეებსა და ორგანიზაციებს:

• შეექმნათ პროფესიული ონლაინ წარმომადგენლობა;
• წარმოაჩინონ საკუთარი პროდუქტი ან მომსახურება;
• გააუმჯობესონ მომხმარებელთან კომუნიკაცია;
• მიიღონ ონლაინ განაცხადები, შეკვეთები ან მოთხოვნები;
• დაიწყონ ან გააძლიერონ საკუთარი ციფრული განვითარება.',
  'In the modern business environment, a professional online presence is an important tool for customer relations, brand awareness, and sales development. BTA LAB campaign aims to help entrepreneurs and organizations:
• Create a professional online presence;
• Showcase their product or service;
• Improve customer communication;
• Increase brand awareness;
• Receive online applications, orders, or requests;
• Start or strengthen their digital development.',
  'მიზანი', 'Purpose',
  '• შეექმნათ პროფესიული ონლაინ წარმომადგენლობა
• წარმოაჩინონ საკუთარი პროდუქტი ან მომსახურება
• გააუმჯობესონ მომხმარებელთან კომუნიკაცია
• მიიღონ ონლაინ განაცხადები, შეკვეთები ან მოთხოვნები
• დაიწყონ ან გააძლიერონ საკუთარი ციფრული განვითარება',
  '• Create a professional online presence
• Showcase your product or service
• Improve customer communication
• Increase brand awareness
• Receive online applications, orders, or requests
• Start or strengthen your digital development',
  1, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 3. funding
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, content_ka, content_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0103-4000-8000-000000000001',
  'entrepreneur-support', 'funding', 'content',
  'დაფინანსების მოდელი — 10 პროექტი',
  'Funding Model — 10 Projects',
  'BTA LAB დაფარავს ვებგვერდის შექმნის მომსახურების ღირებულების 30%-დან 100%-მდე.',
  'BTA LAB will cover 30% to 100% of the website creation service cost.',
  'დაფინანსება გულისხმობს ვებგვერდის შექმნის მომსახურების სრული ან შესაბამისი ნაწილის დაფარვას და არ წარმოადგენს მონაწილისთვის თანხის ჩარიცხვას. დომენის, ჰოსტინგის, ფასიანი პროგრამების, მესამე მხარის სერვისებისა და გადახდის სისტემების ხარჯები დაფინანსებაში არ შედის.',
  'Funding covers the full or partial cost of website creation services and does not constitute a cash transfer to the participant. Domain, hosting, paid software, third-party services, and payment system costs are not included in the funding.',
  'დაფინანსება', 'Funding',
  2, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 4. eligibility
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, content_ka, content_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0104-4000-8000-000000000001',
  'entrepreneur-support', 'eligibility', 'content',
  'ვის შეუძლია მონაწილეობა?',
  'Who Can Participate?',
  'კამპანიაში მონაწილეობა შეუძლია: ინდივიდუალურ მეწარმეს, შპს-ს ან სხვა იურიდიულ პირს, მოქმედ მცირე ან საშუალო ბიზნესს, დამწყებ მეწარმეს, რეალისტური ბიზნესიდეის ავტორს, არაკომერციულ ორგანიზაციას.',
  'The following can participate: individual entrepreneurs, LLCs or other legal entities, operating small or medium businesses, startup entrepreneurs, authors of realistic business ideas, non-commercial organizations.',
  'რეგისტრაცია აუცილებელია მონაწილეობის მისაღებად. განაცხადის შევსებისას ოფიციალური რეგისტრაცია სავალდებულო არ არის, თუმცა პროექტის დაწყებამდე და ხელშეკრულების გაფორმებისას სავალდებულოა.',
  'Registration is required to participate. Official registration is not required when submitting an application, but is mandatory before project start and contract signing.',
  'მონაწილეობა', 'Eligibility',
  3, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 5. projects
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, content_ka, content_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0105-4000-8000-000000000001',
  'entrepreneur-support', 'projects', 'cards',
  'რა ტიპის პროექტები ფინანსდება?',
  'What Types of Projects Are Funded?',
  'ერთგვერდიანი ბიზნესვებგვერდი, კომპანიის საინფორმაციო ვებგვერდი, პროდუქტის კატალოგი, მცირე ონლაინ მაღაზია, ონლაინ განაცხადის ფორმა, ღონისძიების ან ტურისტული გვერდი.',
  'One-page business website, company informational website, product catalog, small online store, online application form, event or tourism page.',
  'თუ პროექტი ძალიან დიდია, დაგვიკავშირდით ინდივიდუალური შეთავაზებისთვის.',
  'If the project is too large, contact us for a custom proposal.',
  'პროექტები', 'Projects',
  4, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 6. services
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0106-4000-8000-000000000001',
  'entrepreneur-support', 'services', 'cards',
  'რას მოიცავს მომსახურება?',
  'What Does the Service Include?',
  'საჭიროებების ანალიზი, UI/UX სტრუქტურა, დიზაინი, მობილური ადაპტაცია, ფრონტენდ/ბექენდ დეველოპმენტი, მონაცემთა ბაზა, CMS, საკონტაქტო ფორმები, SEO, ოპტიმიზაცია, უსაფრთხოება, ანალიტიკა, დეპლოი, ინსტრუქცია.',
  'Needs analysis, UI/UX structure, design, mobile responsiveness, frontend/backend dev, database, CMS, contact forms, SEO, optimization, security, analytics, deployment, guide.',
  'სერვისები', 'Services',
  5, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 7. technologies
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0107-4000-8000-000000000001',
  'entrepreneur-support', 'technologies', 'cards',
  'ტექნოლოგიები',
  'Technologies',
  'Next.js, Laravel, Docker, Git, CI/CD, Cloud Services, Cloudflare, გადახდის სისტემები, ოპტიმიზაციის ინსტრუმენტები',
  'Next.js, Laravel, Docker, Git, CI/CD, Cloud Services, Cloudflare, Payment Gateways, Optimization tools',
  'ტექნოლოგიები', 'Technologies',
  6, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 8. criteria
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0108-4000-8000-000000000001',
  'entrepreneur-support', 'criteria', 'cards',
  'შეფასების კრიტერიუმები',
  'Evaluation Criteria',
  'კანონიერება, ციფრული საჭიროების დასაბუთება, ზრდის სტრატეგია, რეალიზმი, მზადყოფნა (ლოგო, ტექსტი, ფოტო), თანამშრომლობის მზაობა',
  'Legality, digital need justification, growth strategy, realism, readiness (logo, text, photos), collaboration readiness',
  'კრიტერიუმები', 'Criteria',
  7, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 9. cultural
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, content_ka, content_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0109-4000-8000-000000000001',
  'entrepreneur-support', 'cultural', 'content',
  'კულტურული, ეროვნული და ადგილობრივი ღირებულებები',
  'Cultural, National and Local Values',
  'დამატებითი უპირატესობა ენიჭება პროექტებს, რომლებიც ხელს უწყობენ ქართული კულტურის, ენისა და ტრადიციების ციფრულ განვითარებას.',
  'Bonus points are given to projects that promote Georgian culture, language, and traditions.',
  'კულტურა', 'Culture',
  'კულტურა არ არის განვითარების მხოლოდ ნაწილი — ეს არის საფუძველი. ჩვენ განსაკუთრებით ვაფასებთ პროექტებს, რომლებიც ინარჩუნებენ და ავითარებენ ქართულ კულტურულ მემკვიდრეობას.',
  'Culture is not just a part of development — it is the foundation. We especially value projects that preserve and develop Georgian cultural heritage.',
  8, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 10. selection
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0110-4000-8000-000000000001',
  'entrepreneur-support', 'selection', 'timeline',
  'შერჩევის პროცესი',
  'Selection Process',
  'განაცხადი → თავდაპირველი განხილვა → გასაუბრება → ტექნიკური შეფასება → საბოლოო გადაწყვეტილება.',
  'Application → Initial review → Interview → Technical evaluation → Final decision.',
  'პროცესი', 'Process',
  9, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 11. timeline
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0111-4000-8000-000000000001',
  'entrepreneur-support', 'timeline', 'timeline',
  'კამპანიის ვადები',
  'Campaign Timeline',
  '21 დღე განაცხადების მიღება, 5 დღე განხილვა, 5-7 დღე გასაუბრება, 3 დღე დადასტურება.',
  '21 days application window, 5 days review, 5-7 days interviews, 3 days confirmation.',
  'ვადები', 'Timeline',
  10, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 12. delivery
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0112-4000-8000-000000000001',
  'entrepreneur-support', 'delivery', 'content',
  'მიწოდების ვადები',
  'Delivery Times',
  'ერთგვერდიანი ვებგვერდი — 7-10 დღე, კატალოგი — 2-3 კვირა, ბიზნეს ვებგვერდი — 3-4 კვირა, ონლაინ მაღაზია — 4-8 კვირა.',
  'One-page site — 7-10 days, Catalog — 2-3 weeks, Business site — 3-4 weeks, Online store — 4-8 weeks.',
  'ვადები', 'Delivery',
  11, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 13. responsibilities
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0113-4000-8000-000000000001',
  'entrepreneur-support', 'responsibilities', 'cards',
  'მონაწილის პასუხისმგებლობები',
  'Participant Responsibilities',
  'აქტიური თანამშრომლობა, დროული კომუნიკაცია, უკუკავშირის მიწოდება, მასალების მომზადება.',
  'Active cooperation, timely communication, feedback, material preparation.',
  'პასუხისმგებლობა', 'Responsibilities',  12, true)
ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 14. branding
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0114-4000-8000-000000000001',
  'entrepreneur-support', 'branding', 'content',
  'ბრენდინგი',
  'Branding',
  'BTA LAB უზრუნველყოფს პროექტის ბრენდინგის მხარდაჭერას, მათ შორის ლოგოს დიზაინს, ფერების სქემას და ვიზუალურ იდენტობას.',
  'BTA LAB provides project branding support, including logo design, color scheme, and visual identity.',
  'ბრენდინგი', 'Branding',
  13, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 15. futureChanges (maps from old "future_changes")
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0116-4000-8000-000000000001',
  'entrepreneur-support', 'futureChanges', 'content',
  'მომავალი ცვლილებები',
  'Future Changes',
  'კამპანიის პირობები შესაძლოა შეიცვალოს BTA LAB-ის გადაწყვეტილებით. ცვლილებების შესახებ მონაწილეები წინასწარ გაფრთხილდებიან.',
  'Campaign terms may change at BTA LAB''s discretion. Participants will be notified in advance of any changes.',
  'ცვლილებები', 'Changes',
  14, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 16. restrictions
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0117-4000-8000-000000000001',
  'entrepreneur-support', 'restrictions', 'cards',
  'შეზღუდვები',
  'Restrictions',
  'აკრძალულია: აზარტული თამაშები, უკანონო ქმედებები, თაღლითობა, სიძულვილის ენა, საავტორო უფლებების დარღვევა.',
  'Prohibited: gambling, illegal acts, fraud, hate speech, copyright infringement.',
  'შეზღუდვები', 'Restrictions',
  17, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 17. faq
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0118-4000-8000-000000000001',
  'entrepreneur-support', 'faq', 'content',
  'ხშირად დასმული კითხვები',
  'Frequently Asked Questions',
  'პასუხები ყველაზე ხშირად დასმულ კითხვებზე კამპანიის შესახებ.',
  'Answers to the most frequently asked questions about the campaign.',
  'FAQ', 'FAQ',
  18, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- 18. cta
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, button_text_ka, button_text_en, button_url, sort_order, is_active)
VALUES (
  'a1b2c3d4-0119-4000-8000-000000000001',
  'entrepreneur-support', 'cta', 'cta',
  'მზად ხარ დასაწყებად?',
  'Ready to Get Started?',
  'შეავსე განაცხადი და გახდი BTA LAB-ის მხარდაჭერილი მეწარმე.',
  'Fill out the application and become a BTA LAB-supported entrepreneur.',
  'დაიწყე', 'Start',
  'შეავსე განაცხადი', 'Submit Application', '/entrepreneur-support/apply',
  19, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en,
  button_text_ka = EXCLUDED.button_text_ka, button_text_en = EXCLUDED.button_text_en,
  button_url = EXCLUDED.button_url;

-- ═══════════════════════════════════════════════════════════════════════════
-- XVII. SEED DATA — CAMPAIGN FAQ (10 items)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_faq (id, page_slug, question_ka, question_en, answer_ka, answer_en, sort_order, is_active) VALUES
  ('a1b2c3d4-0201-4000-8000-000000000001', 'entrepreneur-support',
    'განაცხადის შევსება ფასიანია?', 'Is filling out the application paid?',
    'არა. კამპანიაში განაცხადის წარმოდგენა უფასოა.', 'No. Submitting an application to the campaign is free.', 0, true),
  ('a1b2c3d4-0202-4000-8000-000000000001', 'entrepreneur-support',
    'მხოლოდ მოქმედ ბიზნესს შეუძლია მონაწილეობა?', 'Can only existing businesses participate?',
    'არა. მონაწილეობა შეუძლია როგორც მოქმედ ბიზნესს, ასევე რეალისტური ბიზნესიდეის ავტორს.', 'No. Both existing businesses and authors of realistic business ideas can participate.', 1, true),
  ('a1b2c3d4-0203-4000-8000-000000000001', 'entrepreneur-support',
    'ბიზნესის რეგისტრაცია აუცილებელია?', 'Is business registration required?',
    'განაცხადის შევსებისას — არა. პროექტის დაწყებამდე შესაძლოა საჭირო იყოს ინდივიდუალურ მეწარმედ რეგისტრაცია.', 'When submitting the application — no. Before starting, registration as an individual entrepreneur may be required.', 2, true),
  ('a1b2c3d4-0204-4000-8000-000000000001', 'entrepreneur-support',
    'დაფინანსების თანხას ანგარიშზე მივიღებ?', 'Will I receive the funding amount in my account?',
    'არა. დაფინანსება წარმოადგენს ვებგვერდის შექმნის მომსახურების შესაბამისი ნაწილის დაფარვას.', 'No. Funding represents covering the corresponding part of the website creation service cost.', 3, true),
  ('a1b2c3d4-0205-4000-8000-000000000001', 'entrepreneur-support',
    'როგორ გავიგებ დაფინანსების პროცენტს?', 'How will I know the funding percentage?',
    'პროცენტი განისაზღვრება განაცხადის შეფასებისა და გასაუბრების შემდეგ.', 'The percentage is determined after application evaluation and interview.', 4, true),
  ('a1b2c3d4-0206-4000-8000-000000000001', 'entrepreneur-support',
    'შემიძლია უარი ვთქვა თანამონაწილეობაზე?', 'Can I decline participation?',
    'დიახ. უარის შემთხვევაში შეთავაზება გადაეცემა სარეზერვო კანდიდატს.', 'Yes. If declined, the offer will be transferred to a reserve candidate.', 5, true),
  ('a1b2c3d4-0207-4000-8000-000000000001', 'entrepreneur-support',
    'დომენი და ჰოსტინგი შედის დაფინანსებაში?', 'Are domain and hosting included?',
    'არა, თუ ინდივიდუალურ შეთავაზებაში სხვა რამ არ იქნება მითითებული.', 'No, unless otherwise specified in the individual offer.', 6, true),
  ('a1b2c3d4-0208-4000-8000-000000000001', 'entrepreneur-support',
    'რამდენი ცვლილება შემეძლება?', 'How many changes can I request?',
    'ცვლილებების რაოდენობა განისაზღვრება ტექნიკურ დავალებასა და ხელშეკრულებაში.', 'The number of changes is defined in the technical task and contract.', 7, true),
  ('a1b2c3d4-0209-4000-8000-000000000001', 'entrepreneur-support',
    'ვის ეკუთვნის დასრულებული ვებგვერდი?', 'Who owns the completed website?',
    'საკუთრების პირობები განისაზღვრება ხელშეკრულებაში.', 'Ownership terms are defined in the contract.', 8, true),
  ('a1b2c3d4-0210-4000-8000-000000000001', 'entrepreneur-support',
    'შემიძლია პროექტი მომავალში შევცვალო?', 'Can I change the project in the future?',
    'დიახ, თუმცა BTA LAB პასუხისმგებელი იქნება მხოლოდ ჩაბარებულ ვერსიაზე.', 'Yes, but BTA LAB is only responsible for the delivered version.', 9, true)
ON CONFLICT (id) DO UPDATE SET
  question_ka = EXCLUDED.question_ka, question_en = EXCLUDED.question_en,
  answer_ka = EXCLUDED.answer_ka, answer_en = EXCLUDED.answer_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- XVIII. SEED DATA — CAMPAIGN CARDS (funding, eligibility, projects, services, etc.)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_cards (id, page_slug, section_key, title_ka, title_en, description_ka, description_en, icon, badge_ka, badge_en, sort_order, is_active) VALUES
  -- Funding cards (3)
  ('a1b2c3d4-0301-4000-8000-000000000001', 'entrepreneur-support', 'funding',
   '100% დაფინანსება (1 პროექტი)', '100% Funding (1 Project)',
   'BTA LAB სრულად დაფარავს შეთანხმებული ვებგვერდის შექმნის მომსახურების ღირებულებას.', 'BTA LAB will fully cover the cost of the agreed website creation service.',
   'Zap', 'რეკომენდებული', 'Recommended', 0, true),
  ('a1b2c3d4-0302-4000-8000-000000000001', 'entrepreneur-support', 'funding',
   '60% დაფინანსება (3 პროექტი)', '60% Funding (3 Projects)',
   'BTA LAB დაფარავს მომსახურების ღირებულების 60%-ს, მონაწილე — 40%-ს.', 'BTA LAB covers 60% of the service cost, the participant covers 40%.',
   'Star', '', '', 1, true),
  ('a1b2c3d4-0303-4000-8000-000000000001', 'entrepreneur-support', 'funding',
   '30% დაფინანსება (6 პროექტი)', '30% Funding (6 Projects)',
   'BTA LAB დაფარავს მომსახურების ღირებულების 30%-ს, მონაწილე — 70%-ს.', 'BTA LAB covers 30% of the service cost, the participant covers 70%.',
   'Heart', '', '', 2, true),
  -- Eligibility cards (3)
  ('a1b2c3d4-0304-4000-8000-000000000001', 'entrepreneur-support', 'eligibility',
   'სტუდენტები', 'Students',
   'BTA-ს და სხვა უნივერსიტეტების სტუდენტები', 'Students of BTA and other universities',
   'Users', 'ახალგაზრდები', 'Youth', 0, true),
  ('a1b2c3d4-0305-4000-8000-000000000001', 'entrepreneur-support', 'eligibility',
   'სტარტაპები', 'Startups',
   'ადრეულ ეტაპზე მყოფი სტარტაპები', 'Early-stage startups',
   'Rocket', 'სტარტაპი', 'Startup', 1, true),
  ('a1b2c3d4-0306-4000-8000-000000000001', 'entrepreneur-support', 'eligibility',
   'მცირე ბიზნესი', 'Small Business',
   'მცირე ბიზნესები, რომლებსაც სჭირდებათ ციფრული ტრანსფორმაცია', 'Small businesses needing digital transformation',
   'Building', 'ბიზნესი', 'Business', 2, true),
  -- Projects cards (3)
  ('a1b2c3d4-0307-4000-8000-000000000001', 'entrepreneur-support', 'projects',
   'ვებგვერდები', 'Websites',
   'თანამედროვე, ადაპტირებული ვებგვერდები', 'Modern, responsive websites',
   'Globe', '', '', 0, true),
  ('a1b2c3d4-0308-4000-8000-000000000001', 'entrepreneur-support', 'projects',
   'მობილური აპლიკაციები', 'Mobile Apps',
   'iOS და Android აპლიკაციები', 'iOS and Android applications',
   'Smartphone', '', '', 1, true),
  ('a1b2c3d4-0309-4000-8000-000000000001', 'entrepreneur-support', 'projects',
   'ონლაინ მაღაზიები', 'Online Stores',
   'ელექტრონული კომერციის პლატფორმები', 'E-commerce platforms',
   'ShoppingCart', '', '', 2, true),
  -- Services cards (3)
  ('a1b2c3d4-0310-4000-8000-000000000001', 'entrepreneur-support', 'services',
   'ვებ დეველოპმენტი', 'Web Development',
   'სრული ციკლის ვებ დეველოპმენტი', 'Full-cycle web development',
   'Code', '', '', 0, true),
  ('a1b2c3d4-0311-4000-8000-000000000001', 'entrepreneur-support', 'services',
   'UI/UX დიზაინი', 'UI/UX Design',
   'მომხმარებელზე ორიენტირებული დიზაინი', 'User-centered design',
   'Palette', '', '', 1, true),
  ('a1b2c3d4-0312-4000-8000-000000000001', 'entrepreneur-support', 'services',
   'ბრენდინგი', 'Branding',
   'ბრენდის იდენტობის შექმნა', 'Brand identity creation',
   'Heart', '', '', 2, true),
  -- Technologies cards (3)
  ('a1b2c3d4-0313-4000-8000-000000000001', 'entrepreneur-support', 'technologies',
   'Next.js / React', 'Next.js / React',
   'თანამედროვე ფრონტენდ ტექნოლოგიები', 'Modern frontend technologies',
   'Code', '', '', 0, true),
  ('a1b2c3d4-0314-4000-8000-000000000001', 'entrepreneur-support', 'technologies',
   'Node.js / Python', 'Node.js / Python',
   'მძლავრი ბექენდ გადაწყვეტილებები', 'Powerful backend solutions',
   'Server', '', '', 1, true),
  ('a1b2c3d4-0315-4000-8000-000000000001', 'entrepreneur-support', 'technologies',
   'PostgreSQL', 'PostgreSQL',
   'საიმედო მონაცემთა ბაზები', 'Reliable databases',
   'Database', '', '', 2, true),
  -- Criteria cards (3)
  ('a1b2c3d4-0316-4000-8000-000000000001', 'entrepreneur-support', 'criteria',
   'ინოვაციურობა', 'Innovation',
   'პროექტის სიახლე და კრეატიულობა', 'Project novelty and creativity',
   'Lightbulb', '', '', 0, true),
  ('a1b2c3d4-0317-4000-8000-000000000001', 'entrepreneur-support', 'criteria',
   'მიზანშეწონილობა', 'Feasibility',
   'პროექტის განხორციელების რეალისტურობა', 'Realistic project implementation',
   'Target', '', '', 1, true),
  ('a1b2c3d4-0318-4000-8000-000000000001', 'entrepreneur-support', 'criteria',
   'ბაზრის საჭიროება', 'Market Need',
   'პროექტის შესაბამისობა ბაზრის მოთხოვნებთან', 'Project alignment with market demands',
   'TrendingUp', '', '', 2, true),
  -- Responsibilities cards (3)
  ('a1b2c3d4-0319-4000-8000-000000000001', 'entrepreneur-support', 'responsibilities',
   'რეგულარული კომუნიკაცია', 'Regular Communication',
   'კვირეული შეხვედრები გუნდთან', 'Weekly meetings with the team',
   'MessageSquare', '', '', 0, true),
  ('a1b2c3d4-0320-4000-8000-000000000001', 'entrepreneur-support', 'responsibilities',
   'უკუკავშირი', 'Feedback',
   'დროული და კონსტრუქციული უკუკავშირი', 'Timely and constructive feedback',
   'MessageCircle', '', '', 1, true),
  ('a1b2c3d4-0321-4000-8000-000000000001', 'entrepreneur-support', 'responsibilities',
   'პროექტის მოთხოვნები', 'Project Requirements',
   'მკაფიო მოთხოვნების განსაზღვრა', 'Clear definition of requirements',
   'FileText', '', '', 2, true),
  -- Restrictions cards (3)
  ('a1b2c3d4-0322-4000-8000-000000000001', 'entrepreneur-support', 'restrictions',
   'ერთი განაცხადი', 'One Application',
   'თითო მონაწილეს შეუძლია მხოლოდ ერთი განაცხადის წარდგენა', 'Each participant may submit only one application',
   'FileText', '', '', 0, true),
  ('a1b2c3d4-0323-4000-8000-000000000001', 'entrepreneur-support', 'restrictions',
   'ორიგინალობა', 'Originality',
   'პროექტი უნდა იყოს ორიგინალური', 'The project must be original',
   'Shield', '', '', 1, true),
  ('a1b2c3d4-0324-4000-8000-000000000001', 'entrepreneur-support', 'restrictions',
   'საავტორო უფლებები', 'Copyright',
   'პროექტი არ უნდა არღვევდეს საავტორო უფლებებს', 'The project must not infringe copyright',
   'Award', '', '', 2, true),
  -- Delivery cards (4) — needed for DeliveryTimes component to render
  ('a1b2c3d4-0325-4000-8000-000000000001', 'entrepreneur-support', 'delivery',
   'ერთგვერდიანი ვებგვერდი', 'One-Page Website',
   'იდეალურია ლენდინგისთვის: 7-10 დღე', 'Perfect for landing pages: 7-10 days',
   'FileText', 'სწრაფი', 'Fast', 0, true),
  ('a1b2c3d4-0326-4000-8000-000000000001', 'entrepreneur-support', 'delivery',
   'კატალოგი', 'Catalog Website',
   'პროდუქტებისა და მომსახურების კატალოგი: 2-3 კვირა', 'Product and service catalog: 2-3 weeks',
   'BookOpen', 'სტანდარტული', 'Standard', 1, true),
  ('a1b2c3d4-0327-4000-8000-000000000001', 'entrepreneur-support', 'delivery',
   'ბიზნეს ვებგვერდი', 'Business Website',
   'სრულფუნქციონალური ბიზნეს ვებგვერდი: 3-4 კვირა', 'Full-featured business website: 3-4 weeks',
   'Building', 'ვრცელი', 'Comprehensive', 2, true),
  ('a1b2c3d4-0328-4000-8000-000000000001', 'entrepreneur-support', 'delivery',
   'ონლაინ მაღაზია', 'Online Store',
   'ელექტრონული კომერციის პლატფორმა: 4-8 კვირა', 'E-commerce platform: 4-8 weeks',
   'ShoppingCart', 'კომპლექსური', 'Complex', 3, true)
ON CONFLICT (id) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  icon = EXCLUDED.icon, badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- XIX. SEED DATA — CAMPAIGN TIMELINE
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_timeline (id, page_slug, section_key, date_ka, date_en, title_ka, title_en, description_ka, description_en, icon, sort_order, is_active) VALUES
  ('a1b2c3d4-0401-4000-8000-000000000001', 'entrepreneur-support', 'timeline',
   '00', '00',
   'განცხადებების მიღება', 'Application Submission',
   'მონაწილეები ავსებენ და აგზავნიან განაცხადებს ონლაინ ფორმის მეშვეობით.', 'Participants fill out and submit applications via the online form.',
   'FileText', 0, true),
  ('a1b2c3d4-0402-4000-8000-000000000001', 'entrepreneur-support', 'timeline',
   '00', '00',
   'განცხადებების განხილვა', 'Application Review',
   'მიღებული განაცხადები განიხილება და ხდება წინასწარი შერჩევა.', 'Received applications are reviewed and pre-selected.',
   'Search', 1, true),
  ('a1b2c3d4-0403-4000-8000-000000000001', 'entrepreneur-support', 'timeline',
   '00', '00',
   'გასაუბრება', 'Interviews',
   'შერჩეულ კანდიდატებთან ტარდება გასაუბრება პროექტის დეტალებზე.', 'Selected candidates are interviewed about project details.',
   'Users', 2, true),
  ('a1b2c3d4-0404-4000-8000-000000000001', 'entrepreneur-support', 'timeline',
   '00', '00',
   'ტექნიკური/ფინანსური შეფასება', 'Technical/Financial Evaluation',
   'ხდება პროექტების ტექნიკური და ფინანსური შეფასება.', 'Projects undergo technical and financial evaluation.',
   'Settings', 3, true),
  ('a1b2c3d4-0405-4000-8000-000000000001', 'entrepreneur-support', 'timeline',
   '00', '00',
   'საბოლოო გადაწყვეტილება', 'Final Decision',
   'გამოვლინდებიან გამარჯვებულები და კეთდება პირობითი შეთავაზებები.', 'Winners are announced and conditional offers are made.',
   'Award', 4, true),
  -- Selection process timeline items (section_key: 'selection') — needed for SelectionProcess to render
  ('a1b2c3d4-0406-4000-8000-000000000001', 'entrepreneur-support', 'selection',
   '1-21 დღე', 'Days 1-21',
   'განაცხადების მიღება', 'Application Submission',
   'მონაწილეები ავსებენ და აგზავნიან განაცხადებს ონლაინ ფორმის მეშვეობით.', 'Participants fill out and submit applications via the online form.',
   'FileText', 0, true),
  ('a1b2c3d4-0407-4000-8000-000000000001', 'entrepreneur-support', 'selection',
   '22-26 დღე', 'Days 22-26',
   'განაცხადების განხილვა', 'Initial Review',
   'მიღებული განაცხადები განიხილება და ხდება წინასწარი შერჩევა.', 'Received applications are reviewed and pre-selected.',
   'Search', 1, true),
  ('a1b2c3d4-0408-4000-8000-000000000001', 'entrepreneur-support', 'selection',
   '27-33 დღე', 'Days 27-33',
   'გასაუბრება', 'Interview',
   'შერჩეულ კანდიდატებთან ტარდება გასაუბრება პროექტის დეტალებზე.', 'Selected candidates are interviewed about project details.',
   'Users', 2, true),
  ('a1b2c3d4-0409-4000-8000-000000000001', 'entrepreneur-support', 'selection',
   '34-40 დღე', 'Days 34-40',
   'ტექნიკური/ფინანსური შეფასება', 'Technical & Financial Evaluation',
   'ხდება პროექტების ტექნიკური და ფინანსური შეფასება.', 'Technical and financial evaluation of projects is conducted.',
   'Settings', 3, true),
  ('a1b2c3d4-0410-4000-8000-000000000001', 'entrepreneur-support', 'selection',
   '41-44 დღე', 'Days 41-44',
   'საბოლოო გადაწყვეტილება', 'Final Decision',
   'გამოვლინდებიან გამარჯვებულები და კეთდება პირობითი შეთავაზებები.', 'Winners are announced and conditional offers are made.',
   'Award', 4, true)
ON CONFLICT (id) DO UPDATE SET
  date_ka = EXCLUDED.date_ka, date_en = EXCLUDED.date_en,
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  icon = EXCLUDED.icon;

-- ═══════════════════════════════════════════════════════════════════════════
-- XX. SEED DATA — CAMPAIGN STATISTICS (Hero section stats)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_statistics (id, page_slug, section_key, label_ka, label_en, value, suffix_ka, suffix_en, icon, sort_order, is_active) VALUES
  ('a1b2c3d4-0501-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'შერჩეული პროექტი', 'Selected Projects', 10, '', '', 'Award', 0, true),
  ('a1b2c3d4-0502-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'დაფინანსების კატეგორია', 'Funding Categories', 3, '', '', 'Zap', 1, true),
  ('a1b2c3d4-0503-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'განაცხადი უფასოა', 'Free Application', 1, '', '', 'Heart', 2, true),
  ('a1b2c3d4-0504-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'პროფესიული ზედამხედველობა', 'Professional Supervision', 1, '', '', 'Shield', 3, true),
  ('a1b2c3d4-0505-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'თანამედროვე ტექნოლოგიები', 'Modern Technologies', 10, '+', '+', 'Code', 4, true)
ON CONFLICT (id) DO UPDATE SET
  label_ka = EXCLUDED.label_ka, label_en = EXCLUDED.label_en,
  value = EXCLUDED.value, suffix_ka = EXCLUDED.suffix_ka, suffix_en = EXCLUDED.suffix_en,
  icon = EXCLUDED.icon;

-- ═══════════════════════════════════════════════════════════════════════════
-- XXI. SEED DATA — CAMPAIGN CTA
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_cta (id, page_slug, section_key, title_ka, title_en, description_ka, description_en, button_text_ka, button_text_en, button_url, secondary_button_text_ka, secondary_button_text_en, secondary_button_url, is_active) VALUES
  ('a1b2c3d4-0601-4000-8000-000000000001', 'entrepreneur-support', 'cta',
   'მზად ხარ დასაწყებად?', 'Ready to Get Started?',
   'შეავსე განაცხადი და გახდი BTA LAB-ის მხარდაჭერილი მეწარმე. არ გამოტოვო ეს შესაძლებლობა!',
   'Fill out the application and become a BTA LAB-supported entrepreneur. Don''t miss this opportunity!',
   'შეავსე განაცხადი', 'Submit Application', '/entrepreneur-support/apply',
   'გაიგე მეტი', 'Learn More', '#selection', true)
ON CONFLICT (id) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  button_text_ka = EXCLUDED.button_text_ka, button_text_en = EXCLUDED.button_text_en,
  button_url = EXCLUDED.button_url;

-- ═══════════════════════════════════════════════════════════════════════════
-- XXII. SEED DATA — CAMPAIGN SETTINGS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_settings (id, setting_key, setting_value_ka, setting_value_en, setting_type, is_active) VALUES
  ('a1b2c3d4-0701-4000-8000-000000000001', 'campaign_name', 'BTA LAB — მეწარმეების ციფრული განვითარების მხარდაჭერა', 'BTA LAB — Digital Entrepreneurship Development Support', 'text', true),
  ('a1b2c3d4-0702-4000-8000-000000000001', 'campaign_email', 'lab@bta.edu.ge', 'lab@bta.edu.ge', 'text', true),
  ('a1b2c3d4-0703-4000-8000-000000000001', 'campaign_phone', '+995 579 009 247', '+995 579 009 247', 'text', true),
  ('a1b2c3d4-0704-4000-8000-000000000001', 'campaign_deadline', '2026-12-31', '2026-12-31', 'text', true),
  ('a1b2c3d4-0705-4000-8000-000000000001', 'campaign_max_funding', '5000', '5000', 'number', true),
  ('a1b2c3d4-0706-4000-8000-000000000001', 'campaign_currency', '₾', '₾', 'text', true),
  ('a1b2c3d4-0707-4000-8000-000000000001', 'campaign_application_fee', '0', '0', 'number', true),
  ('a1b2c3d4-0708-4000-8000-000000000001', 'campaign_max_applications', '100', '100', 'number', true)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value_ka = EXCLUDED.setting_value_ka,
  setting_value_en = EXCLUDED.setting_value_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- XXIII. SEED DATA — CAMPAIGN SEO
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_seo (id, page_slug, title_ka, title_en, description_ka, description_en, keywords_ka, keywords_en, canonical_url, og_title_ka, og_title_en, og_description_ka, og_description_en, is_active) VALUES
  ('a1b2c3d4-0801-4000-8000-000000000001', 'entrepreneur-support',
   'BTA LAB — მეწარმეების ციფრული განვითარების მხარდაჭერის კამპანია',
   'BTA LAB — Digital Entrepreneurship Development Support Campaign',
   'BTA LAB-ის კამპანია 10 პროექტისთვის: მიიღეთ 100%, 60% ან 30% დაფინანსება ვებგვერდის შესაქმნელად. განაცხადი უფასოა!',
   'BTA LAB campaign for 10 projects: Get 100%, 60%, or 30% funding for website creation. Free application!',
   'BTA LAB, მეწარმე, დაფინანსება, ვებგვერდი, ციფრული განვითარება, კამპანია, საქართველო',
   'BTA LAB, entrepreneur, funding, website, digital development, campaign, Georgia',
   'https://lab.bta.edu.ge/entrepreneur-support',
   'BTA LAB — მეწარმეების ციფრული მხარდაჭერა', 'BTA LAB — Digital Entrepreneurship Support',
   'მიიღეთ 100%, 60% ან 30% დაფინანსება ვებგვერდის შესაქმნელად', 'Get 100%, 60%, or 30% funding for website creation',
   true)
ON CONFLICT (page_slug) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  keywords_ka = EXCLUDED.keywords_ka, keywords_en = EXCLUDED.keywords_en,
  canonical_url = EXCLUDED.canonical_url,
  og_title_ka = EXCLUDED.og_title_ka, og_title_en = EXCLUDED.og_title_en,
  og_description_ka = EXCLUDED.og_description_ka, og_description_en = EXCLUDED.og_description_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- XXIV. SEED DATA — EMAIL TEMPLATES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_email_templates (id, event, subject_ka, subject_en, body_ka, body_en, is_active) VALUES
  ('a1b2c3d4-0901-4000-8000-000000000001', 'application_received',
   'განაცხადი მიღებულია', 'Application Received',
   'თქვენი განაცხადი მიღებულია. თქვენი განაცხადის ნომერია: {{applicationNumber}}. ჩვენი გუნდი განიხილავს მას და დაგიკავშირდებით 5 სამუშაო დღის განმავლობაში.',
   'Your application has been received. Your application number is: {{applicationNumber}}. Our team will review it and contact you within 5 business days.', true),
  ('a1b2c3d4-0902-4000-8000-000000000001', 'interview_invitation',
   'გასაუბრების მოწვევა', 'Interview Invitation',
   'თქვენ მიწვეული ხართ გასაუბრებაზე. თარიღი: {{date}}, დრო: {{time}}, ბმული: {{meetingUrl}}.',
   'You are invited for an interview. Date: {{date}}, Time: {{time}}, Link: {{meetingUrl}}.', true),
  ('a1b2c3d4-0903-4000-8000-000000000001', 'need_more_information',
   'დამატებითი ინფორმაცია', 'Additional Information Needed',
   'თქვენი განაცხადის განსახილველად საჭიროა დამატებითი ინფორმაცია: {{notes}}',
   'To review your application, we need additional information: {{notes}}', true),
  ('a1b2c3d4-0904-4000-8000-000000000001', 'offer_made',
   'შეთავაზება', 'Offer',
   'გილოცავთ! თქვენ მიიღეთ შეთავაზება. დაფინანსება: {{amount}}₾ ({{percentage}}%). გთხოვთ, დაადასტუროთ {{deadline}}-მდე.',
   'Congratulations! You have received an offer. Funding: {{amount}}₾ ({{percentage}}%). Please confirm by {{deadline}}.', true),
  ('a1b2c3d4-0905-4000-8000-000000000001', 'status_changed',
   'სტატუსის ცვლილება', 'Status Change',
   'თქვენი განაცხადის სტატუსი შეიცვალა: {{status}}.',
   'Your application status has changed to: {{status}}.', true),
  ('a1b2c3d4-0906-4000-8000-000000000001', 'final_decision',
   'საბოლოო გადაწყვეტილება', 'Final Decision',
   'თქვენი განაცხადის საბოლოო შედეგი: {{result}}.',
   'The final result of your application: {{result}}.', true)
ON CONFLICT (event) DO UPDATE SET
  subject_ka = EXCLUDED.subject_ka, subject_en = EXCLUDED.subject_en,
  body_ka = EXCLUDED.body_ka, body_en = EXCLUDED.body_en;
