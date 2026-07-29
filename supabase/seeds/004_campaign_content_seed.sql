-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Campaign Content Seed
-- Entrepreneur Support Campaign — FULL CONTENT
-- ═══════════════════════════════════════════════════════════════════════════
-- Safe to run multiple times — uses INSERT ... ON CONFLICT DO UPDATE
-- Apply AFTER supabase/migrations/003_campaign_schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- Helper: deterministic UUIDs for stable upserts
-- These are SHA-256 based deterministic UUIDs matching the TS seed script pattern

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. CAMPAIGN PAGE
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
  title_ka = EXCLUDED.title_ka,
  title_en = EXCLUDED.title_en,
  subtitle_ka = EXCLUDED.subtitle_ka,
  subtitle_en = EXCLUDED.subtitle_en,
  description_ka = EXCLUDED.description_ka,
  description_en = EXCLUDED.description_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. CAMPAIGN SECTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Section 1: Hero
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
  'შეავსე განაცხადი', 'Apply Now', '/entrepreneur-support/apply',
  0, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en,
  button_text_ka = EXCLUDED.button_text_ka, button_text_en = EXCLUDED.button_text_en;

-- Section 2: Campaign Purpose / Why
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, content_ka, content_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0102-4000-8000-000000000001',
  'entrepreneur-support', 'purpose', 'content',
  'კამპანიის მიზანი', 'Campaign Purpose',
  'რატომ უნდა მიიღო მონაწილეობა?', 'Why should you participate?',
  'მიზანი', 'Goal',
  '• შექმნან პროფესიული ონლაინ წარმომადგენლობა\n• წარმოაჩინონ საკუთარი პროდუქტი ან მომსახურება\n• გააუმჯობესონ მომხმარებელთან კომუნიკაცია\n• გაზარდონ ცნობადობა\n• მიიღონ ონლაინ განაცხადები, შეკვეთები ან მოთხოვნები\n• დაიწყონ ან გააძლიერონ საკუთარი ციფრული განვითარება',
  '• Create a professional online presence\n• Showcase your product or service\n• Improve customer communication\n• Increase brand awareness\n• Receive online applications, orders, or requests\n• Start or strengthen your digital development',
  1, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 3: Funding Model
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, content_ka, content_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0103-4000-8000-000000000001',
  'entrepreneur-support', 'funding', 'content',
  'დაფინანსების მოდელი — 10 პროექტი', 'Funding Model — 10 Projects',
  'BTA LAB დაფარავს ვებგვერდის შექმნის მომსახურების ღირებულების 30%-დან 100%-მდე.',
  'BTA LAB will cover 30% to 100% of the website creation service cost.',
  'დაფინანსება', 'Funding',
  'დაფინანსება გულისხმობს ვებგვერდის შექმნის მომსახურების სრული ან შესაბამისი ნაწილის დაფარვას და არ წარმოადგენს მონაწილისთვის თანხის ჩარიცხვას. დომენის, ჰოსტინგის, ფასიანი პროგრამების, მესამე მხარის სერვისებისა და გადახდის სისტემების ხარჯები დაფინანსებაში არ შედის.',
  'Funding covers the full or partial cost of website creation services and does not constitute a cash transfer to the participant. Domain, hosting, paid software, third-party services, and payment system costs are not included in the funding.',
  2, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 4: Eligibility
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, content_ka, content_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0104-4000-8000-000000000001',
  'entrepreneur-support', 'eligibility', 'cards',
  'ვის შეუძლია მონაწილეობა', 'Who Can Participate',
  'განაცხადის შევსებისას ოფიციალური რეგისტრაცია სავალდებულო არ არის, თუმცა პროექტის დაწყებამდე და ხელშეკრულების გაფორმებისას სავალდებულოა.',
  'Official registration is not required when submitting an application, but is mandatory before project start and contract signing.',
  'მონაწილეობა', 'Eligibility',
  'რეგისტრაცია აუცილებელია მონაწილეობის მისაღებად. განაცხადის შევსებისას ოფიციალური რეგისტრაცია სავალდებულო არ არის, თუმცა პროექტის დაწყებამდე და ხელშეკრულების გაფორმებისას სავალდებულოა.',
  'Registration is required to participate. Official registration is not required when submitting an application, but is mandatory before project start and contract signing.',
  3, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 5: Project Scope
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, content_ka, content_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0105-4000-8000-000000000001',
  'entrepreneur-support', 'projects', 'cards',
  'პროექტების სფერო', 'Project Scope',
  'დასაშვები და არადასაშვები პროექტები',
  'Allowed and non-allowed projects',
  'პროექტები', 'Projects',
  'თუ პროექტი ძალიან დიდია, დაგვიკავშირდით ინდივიდუალური შეთავაზებისთვის.',
  'If the project is too large, contact us for a custom proposal.',
  4, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 6: Services
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0106-4000-8000-000000000001',
  'entrepreneur-support', 'services', 'cards',
  'ჩართული სერვისები', 'Included Services',
  'საჭიროებების ანალიზი, UI/UX სტრუქტურა, დიზაინი, მობილურ ადაპტაცია, ფრონტენდ/ბექენდ დეველოპმენტი, მონაცემთა ბაზა, CMS, საკონტაქტო ფორმები, SEO, ოპტიმიზაცია, უსაფრთხოება, ანალიტიკა, დეპლოი, ინსტრუქცია.',
  'Needs analysis, UI/UX structure, design, mobile responsiveness, frontend/backend dev, database, CMS, contact forms, SEO, optimization, security, analytics, deployment, guide.',
  'სერვისები', 'Services',
  5, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 7: Technologies
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0107-4000-8000-000000000001',
  'entrepreneur-support', 'technologies', 'cards',
  'ტექნოლოგიები', 'Technologies',
  'Next.js, Laravel, Docker, Git, CI/CD, Cloud Services, Cloudflare, გადახდის სისტემები, ოპტიმიზაციის ინსტრუმენტები',
  'Next.js, Laravel, Docker, Git, CI/CD, Cloud Services, Cloudflare, Payment Gateways, Optimization tools',
  'ტექნოლოგიები', 'Technologies',
  6, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 8: Criteria
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0108-4000-8000-000000000001',
  'entrepreneur-support', 'criteria', 'cards',
  'შეფასების კრიტერიუმები', 'Evaluation Criteria',
  'კანონიერება, ციფრული საჭიროების დასაბუთება, ზრდის სტრატეგია, რეალიზმი, მზადყოფნა (ლოგო, ტექსტი, ფოტო), თანამშრომლობის მზაობა',
  'Legality, digital need justification, growth strategy, realism, readiness (logo, text, photos), collaboration readiness',
  'კრიტერიუმები', 'Criteria',
  7, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 9: Cultural Value
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, content_ka, content_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0109-4000-8000-000000000001',
  'entrepreneur-support', 'cultural', 'content',
  'კულტურული ღირებულება', 'Cultural Value',
  'დამატებითი ქულები ენიჭება პროექტებს, რომლებიც ხელს უწყობენ ქართული იდენტობის, კულტურის, ადგილობრივი წარმოების, რეგიონული ტურიზმისა და ახალგაზრდების განვითარებას.',
  'Bonus points are given to projects that promote Georgian identity, culture, local production, regional tourism, and youth development.',
  'კულტურა', 'Culture',
  'კულტურა არ არის განვითარების მხოლოდ ნაწილი — ეს არის საფუძველი. ჩვენ განსაკუთრებით ვაფასებთ პროექტებს, რომლებიც ინარჩუნებენ და ავითარებენ ქართულ კულტურულ მემკვიდრეობას.',
  'Culture is not just a part of development — it is the foundation. We especially value projects that preserve and develop Georgian cultural heritage.',
  8, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 10: Selection Process
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0110-4000-8000-000000000001',
  'entrepreneur-support', 'selection', 'timeline',
  'შერჩევის პროცესი', 'Selection Process',
  '8 ეტაპი: განაცხადი → თავდაპირველი განხილვა → შორტლისტი → გასაუბრება → ტექ/ფინანსური შეფასება → პირობითი შეთავაზება → დადასტურება → საბოლოო შედეგები',
  '8 stages: Application → Initial Review → Shortlist → Interview → Tech/Financial Eval → Conditional Offer → Confirmation → Final Results',
  'პროცესი', 'Process',
  9, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 11: Timeline
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0111-4000-8000-000000000001',
  'entrepreneur-support', 'timeline', 'timeline',
  'კამპანიის ვადები', 'Campaign Timeline',
  '21 დღე განაცხადების მიღება, 5 დღე განხილვა, 5-7 დღე გასაუბრება, 3 დღე დადასტურება',
  '21 days application window, 5 days review, 5-7 days interviews, 3 days confirmation',
  'ვადები', 'Timeline',
  10, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 12: Delivery Time
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0112-4000-8000-000000000001',
  'entrepreneur-support', 'delivery', 'content',
  'მიწოდების ვადები', 'Delivery Times',
  'ერთგვერდიანი ვებგვერდი — 7-10 დღე, კატალოგი — 2-3 კვირა, ბიზნეს ვებგვერდი — 3-4 კვირა, ონლაინ მაღაზია — 4-8 კვირა',
  'One-page site — 7-10 days, Catalog — 2-3 weeks, Business site — 3-4 weeks, Online store — 4-8 weeks',
  'ვადები', 'Delivery',
  11, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 13: Responsibilities
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0113-4000-8000-000000000001',
  'entrepreneur-support', 'responsibilities', 'cards',
  'მონაწილის პასუხისმგებლობები', 'Participant Responsibilities',
  'აქტიური თანამშრომლობა, დროული კომუნიკაცია, უკუკავშირის მიწოდება, მასალების მომზადება',
  'Active cooperation, timely communication, feedback, material preparation',
  'პასუხისმგებლობა', 'Responsibilities',
  12, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 14: Warranty
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0114-4000-8000-000000000001',
  'entrepreneur-support', 'warranty', 'cards',
  'გარანტია', 'Warranty',
  '30-დღიანი გარანტია: ბაგების გასწორება, დეპლოის მხარდაჭერა',
  '30-day warranty: bug fixes, deployment support',
  'გარანტია', 'Warranty',
  13, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 15: Portfolio Rights
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, content_ka, content_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0115-4000-8000-000000000001',
  'entrepreneur-support', 'portfolio_rights', 'content',
  'პორტფოლიოს უფლებები', 'Portfolio Rights',
  'BTA LAB-ს უფლება აქვს გამოიყენოს შექმნილი პროექტები საკუთარ პორტფოლიოში.',
  'BTA LAB has the right to use created projects in its portfolio.',
  'პორტფოლიო', 'Portfolio',
  'BTA LAB-ს უფლება აქვს განათავსოს შექმნილი ვებგვერდი საკუთარ პორტფოლიოში, როგორც სტუდენტური პროექტი. "შექმნილია BTA LAB-ის მიერ" ფუტერის ქრედიტი სავალდებულოა.',
  'BTA LAB has the right to display the created website in its portfolio as a student project. "Created by BTA LAB" footer credit is mandatory.',
  14, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  content_ka = EXCLUDED.content_ka, content_en = EXCLUDED.content_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 16: Future Changes
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0116-4000-8000-000000000001',
  'entrepreneur-support', 'future_changes', 'content',
  'მომავალი ცვლილებები', 'Future Changes',
  'მონაწილეს შეუძლია პროექტი მომავალში შეცვალოს, თუმცა BTA LAB პასუხისმგებელია მხოლოდ მის მიერ ჩაბარებულ ვერსიაზე.',
  'The participant can change the project in the future, but BTA LAB is only responsible for the delivered version.',
  'ცვლილებები', 'Changes',
  15, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 17: Restrictions
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0117-4000-8000-000000000001',
  'entrepreneur-support', 'restrictions', 'cards',
  'შეზღუდვები', 'Restrictions',
  'აკრძალული ნიშები: აზარტული თამაშები, უკანონო ქმედებები, თაღლითობა, სიძულვილის ენა, საავტორო უფლებების დარღვევა',
  'Prohibited niches: gambling, illegal acts, fraud, hate speech, copyright infringement',
  'შეზღუდვები', 'Restrictions',
  16, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 18: FAQ
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0118-4000-8000-000000000001',
  'entrepreneur-support', 'faq', 'content',
  'ხშირად დასმული კითხვები', 'Frequently Asked Questions',
  'პასუხები ყველაზე ხშირად დასმულ კითხვებზე კამპანიის შესახებ.',
  'Answers to the most frequently asked questions about the campaign.',
  'FAQ', 'FAQ',
  17, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en;

-- Section 19: CTA
INSERT INTO public.campaign_sections (id, page_slug, section_key, section_type, title_ka, title_en, description_ka, description_en, badge_ka, badge_en, button_text_ka, button_text_en, button_url, sort_order, is_active)
VALUES (
  'a1b2c3d4-0119-4000-8000-000000000001',
  'entrepreneur-support', 'cta', 'cta',
  'მზად ხარ დასაწყებად?', 'Ready to Get Started?',
  'შეავსე განაცხადი და გახდი BTA LAB-ის მხარდაჭერილი მეწარმე',
  'Fill out the application and become a BTA LAB-supported entrepreneur',
  'დაიწყე', 'Start',
  'შეავსე განაცხადი', 'Submit Application', '/entrepreneur-support/apply',
  18, true
) ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  badge_ka = EXCLUDED.badge_ka, badge_en = EXCLUDED.badge_en,
  button_text_ka = EXCLUDED.button_text_ka, button_text_en = EXCLUDED.button_text_en,
  button_url = EXCLUDED.button_url;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. CAMPAIGN FAQ — 10 Q&A PAIRS
-- ═══════════════════════════════════════════════════════════════════════════

-- FAQ 1
INSERT INTO public.campaign_faq (id, page_slug, question_ka, question_en, answer_ka, answer_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0201-4000-8000-000000000001',
  'entrepreneur-support',
  'განაცხადის შევსება ფასიანია?',
  'Is filling out the application paid?',
  'არა. კამპანიაში განაცხადის წარმოდგენა უფასოა.',
  'No. Submitting an application to the campaign is free.',
  0, true
) ON CONFLICT (id) DO UPDATE SET
  question_ka = EXCLUDED.question_ka, question_en = EXCLUDED.question_en,
  answer_ka = EXCLUDED.answer_ka, answer_en = EXCLUDED.answer_en,
  sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;

-- FAQ 2
INSERT INTO public.campaign_faq (id, page_slug, question_ka, question_en, answer_ka, answer_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0202-4000-8000-000000000001',
  'entrepreneur-support',
  'მხოლოდ მოქმედ ბიზნესს შეუძლია მონაწილეობა?',
  'Can only existing businesses participate?',
  'არა. მონაწილეობა შეუძლია როგორც მოქმედ ბიზნესს, ასევე რეალისტური და განვითარებადი ბიზნესიდეის ავტორს.',
  'No. Both existing businesses and authors of realistic and developing business ideas can participate.',
  1, true
) ON CONFLICT (id) DO UPDATE SET
  question_ka = EXCLUDED.question_ka, question_en = EXCLUDED.question_en,
  answer_ka = EXCLUDED.answer_ka, answer_en = EXCLUDED.answer_en;

-- FAQ 3
INSERT INTO public.campaign_faq (id, page_slug, question_ka, question_en, answer_ka, answer_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0203-4000-8000-000000000001',
  'entrepreneur-support',
  'ბიზნესის რეგისტრაცია აუცილებელია?',
  'Is business registration required?',
  'განაცხადის შევსებისას — არა. პროექტის დაწყებამდე შესაძლოა აუცილებელი იყოს ინდივიდუალურ მეწარმედ ან იურიდიულ პირად რეგისტრაცია.',
  'When submitting the application — no. Before starting the project, registration as an individual entrepreneur or legal entity may be required.',
  2, true
) ON CONFLICT (id) DO UPDATE SET
  question_ka = EXCLUDED.question_ka, question_en = EXCLUDED.question_en,
  answer_ka = EXCLUDED.answer_ka, answer_en = EXCLUDED.answer_en;

-- FAQ 4
INSERT INTO public.campaign_faq (id, page_slug, question_ka, question_en, answer_ka, answer_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0204-4000-8000-000000000001',
  'entrepreneur-support',
  'დაფინანსების თანხას ანგარიშზე მივიღებ?',
  'Will I receive the funding amount in my account?',
  'არა. დაფინანსება წარმოადგენს ვებგვერდის შექმნის მომსახურების შესაბამისი ნაწილის დაფარვას.',
  'No. Funding represents covering the corresponding part of the website creation service cost.',
  3, true
) ON CONFLICT (id) DO UPDATE SET
  question_ka = EXCLUDED.question_ka, question_en = EXCLUDED.question_en,
  answer_ka = EXCLUDED.answer_ka, answer_en = EXCLUDED.answer_en;

-- FAQ 5
INSERT INTO public.campaign_faq (id, page_slug, question_ka, question_en, answer_ka, answer_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0205-4000-8000-000000000001',
  'entrepreneur-support',
  'როგორ გავიგებ დაფინანსების პროცენტს?',
  'How will I know the funding percentage?',
  'პროცენტი განისაზღვრება განაცხადის შეფასებისა და გასაუბრების შემდეგ. კანდიდატი საბოლოო შედეგების გამოცხადებამდე მიიღებს პირობით შეთავაზებას.',
  'The percentage is determined after application evaluation and interview. The candidate will receive a conditional offer before final results are announced.',
  4, true
) ON CONFLICT (id) DO UPDATE SET
  question_ka = EXCLUDED.question_ka, question_en = EXCLUDED.question_en,
  answer_ka = EXCLUDED.answer_ka, answer_en = EXCLUDED.answer_en;

-- FAQ 6
INSERT INTO public.campaign_faq (id, page_slug, question_ka, question_en, answer_ka, answer_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0206-4000-8000-000000000001',
  'entrepreneur-support',
  'შემიძლია უარი ვთქვა თანამონაწილეობაზე?',
  'Can I decline participation?',
  'დიახ. უარის შემთხვევაში შეთავაზება გადაეცემა სარეზერვო კანდიდატს.',
  'Yes. If declined, the offer will be transferred to a reserve candidate.',
  5, true
) ON CONFLICT (id) DO UPDATE SET
  question_ka = EXCLUDED.question_ka, question_en = EXCLUDED.question_en,
  answer_ka = EXCLUDED.answer_ka, answer_en = EXCLUDED.answer_en;

-- FAQ 7
INSERT INTO public.campaign_faq (id, page_slug, question_ka, question_en, answer_ka, answer_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0207-4000-8000-000000000001',
  'entrepreneur-support',
  'დომენი და ჰოსტინგი შედის დაფინანსებაში?',
  'Are domain and hosting included in the funding?',
  'არა, თუ ინდივიდუალურ შეთავაზებაში სხვა რამ არ იქნება მითითებული.',
  'No, unless otherwise specified in the individual offer.',
  6, true
) ON CONFLICT (id) DO UPDATE SET
  question_ka = EXCLUDED.question_ka, question_en = EXCLUDED.question_en,
  answer_ka = EXCLUDED.answer_ka, answer_en = EXCLUDED.answer_en;

-- FAQ 8
INSERT INTO public.campaign_faq (id, page_slug, question_ka, question_en, answer_ka, answer_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0208-4000-8000-000000000001',
  'entrepreneur-support',
  'რამდენი ცვლილება შემეძლება?',
  'How many changes can I request?',
  'ცვლილებების დასაშვები რაოდენობა და სამუშაო მოცულობა განისაზღვრება ტექნიკურ დავალებასა და ხელშეკრულებაში.',
  'The allowable number of changes and scope of work is defined in the technical task and contract.',
  7, true
) ON CONFLICT (id) DO UPDATE SET
  question_ka = EXCLUDED.question_ka, question_en = EXCLUDED.question_en,
  answer_ka = EXCLUDED.answer_ka, answer_en = EXCLUDED.answer_en;

-- FAQ 9
INSERT INTO public.campaign_faq (id, page_slug, question_ka, question_en, answer_ka, answer_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0209-4000-8000-000000000001',
  'entrepreneur-support',
  'ვის ეკუთვნის დასრულებული ვებგვერდი?',
  'Who owns the completed website?',
  'საკუთრებისა და კოდის გადაცემის პირობები განისაზღვრება ხელშეკრულებაში.',
  'Ownership and code transfer terms are defined in the contract.',
  8, true
) ON CONFLICT (id) DO UPDATE SET
  question_ka = EXCLUDED.question_ka, question_en = EXCLUDED.question_en,
  answer_ka = EXCLUDED.answer_ka, answer_en = EXCLUDED.answer_en;

-- FAQ 10
INSERT INTO public.campaign_faq (id, page_slug, question_ka, question_en, answer_ka, answer_en, sort_order, is_active)
VALUES (
  'a1b2c3d4-0210-4000-8000-000000000001',
  'entrepreneur-support',
  'შემიძლია პროექტი მომავალში შევცვალო?',
  'Can I change the project in the future?',
  'დიახ, თუმცა BTA LAB პასუხისმგებელი იქნება მხოლოდ მის მიერ ჩაბარებულ ვერსიაზე.',
  'Yes, however BTA LAB will only be responsible for the version it delivered.',
  9, true
) ON CONFLICT (id) DO UPDATE SET
  question_ka = EXCLUDED.question_ka, question_en = EXCLUDED.question_en,
  answer_ka = EXCLUDED.answer_ka, answer_en = EXCLUDED.answer_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. CAMPAIGN FUNDING CARDS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_cards (id, page_slug, section_key, title_ka, title_en, description_ka, description_en, icon, badge_ka, badge_en, sort_order, is_active) VALUES
  ('a1b2c3d4-0301-4000-8000-000000000001', 'entrepreneur-support', 'funding', '100% დაფინანსება (1 პროექტი)', '100% Funding (1 Project)', 'BTA LAB სრულად დაფარავს შეთანხმებული ვებგვერდის შექმნის მომსახურების ღირებულებას.', 'BTA LAB will fully cover the cost of the agreed website creation service.', 'Zap', 'რეკომენდებული', 'Recommended', 0, true),
  ('a1b2c3d4-0302-4000-8000-000000000001', 'entrepreneur-support', 'funding', '60% დაფინანსება (3 პროექტი)', '60% Funding (3 Projects)', 'BTA LAB დაფარავს მომსახურების სრული ღირებულების 60%-ს, ხოლო მონაწილე — 40%-ს.', 'BTA LAB covers 60% of the service cost, the participant covers 40%.', 'Star', '', '', 1, true),
  ('a1b2c3d4-0303-4000-8000-000000000001', 'entrepreneur-support', 'funding', '30% დაფინანსება (6 პროექტი)', '30% Funding (6 Projects)', 'BTA LAB დაფარავს მომსახურების სრული ღირებულების 30%-ს, ხოლო მონაწილე — 70%-ს.', 'BTA LAB covers 30% of the service cost, the participant covers 70%.', 'Heart', '', '', 2, true)
ON CONFLICT (id) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  icon = EXCLUDED.icon;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. CAMPAIGN STATISTICS (Hero badges)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_statistics (id, page_slug, section_key, label_ka, label_en, value, suffix_ka, suffix_en, icon, sort_order, is_active) VALUES
  ('a1b2c3d4-0401-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'შერჩეული პროექტი', 'Selected Projects', 10, '', '', 'Award', 0, true),
  ('a1b2c3d4-0402-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'დაფინანსების კატეგორია', 'Funding Categories', 3, '', '', 'Zap', 1, true),
  ('a1b2c3d4-0403-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'განაცხადი უფასოა', 'Free Application', 1, '', '', 'Heart', 2, true),
  ('a1b2c3d4-0404-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'პროფესიული ზედამხედველობა', 'Professional Supervision', 1, '', '', 'Shield', 3, true),
  ('a1b2c3d4-0405-4000-8000-000000000001', 'entrepreneur-support', 'hero', 'თანამედროვე ტექნოლოგიები', 'Modern Technologies', 10, '+', '+', 'Code', 4, true)
ON CONFLICT (id) DO UPDATE SET
  label_ka = EXCLUDED.label_ka, label_en = EXCLUDED.label_en,
  value = EXCLUDED.value, icon = EXCLUDED.icon;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. CAMPAIGN CTA
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_cta (id, page_slug, section_key, title_ka, title_en, description_ka, description_en, button_text_ka, button_text_en, button_url, secondary_button_text_ka, secondary_button_text_en, secondary_button_url, is_active) VALUES
  (
    'a1b2c3d4-0501-4000-8000-000000000001',
    'entrepreneur-support', 'cta',
    'მზად ხარ დასაწყებად?', 'Ready to Get Started?',
    'შეავსე განაცხადი და გახდი BTA LAB-ის მხარდაჭერილი მეწარმე. არ გამოტოვო ეს შესაძლებლობა!',
    'Fill out the application and become a BTA LAB-supported entrepreneur. Don''t miss this opportunity!',
    'შეავსე განაცხადი', 'Submit Application', '/entrepreneur-support/apply',
    'გაიგე მეტი', 'Learn More', '#selection',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en,
  button_text_ka = EXCLUDED.button_text_ka, button_text_en = EXCLUDED.button_text_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. CAMPAIGN SETTINGS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_settings (id, setting_key, setting_value_ka, setting_value_en, setting_type, is_active) VALUES
  ('a1b2c3d4-0601-4000-8000-000000000001', 'campaign_name', 'BTA LAB — მეწარმეების ციფრული განვითარების მხარდაჭერა', 'BTA LAB — Digital Entrepreneurship Development Support', 'text', true),
  ('a1b2c3d4-0602-4000-8000-000000000001', 'campaign_email', 'lab@bta.edu.ge', 'lab@bta.edu.ge', 'text', true),
  ('a1b2c3d4-0603-4000-8000-000000000001', 'campaign_phone', '579009247', '579009247', 'text', true),
  ('a1b2c3d4-0604-4000-8000-000000000001', 'campaign_deadline', '2026-12-31', '2026-12-31', 'text', true),
  ('a1b2c3d4-0605-4000-8000-000000000001', 'campaign_max_funding', '5000', '5000', 'number', true),
  ('a1b2c3d4-0606-4000-8000-000000000001', 'campaign_currency', '₾', '₾', 'text', true),
  ('a1b2c3d4-0607-4000-8000-000000000001', 'campaign_application_fee', '0', '0', 'number', true),
  ('a1b2c3d4-0608-4000-8000-000000000001', 'campaign_max_applications', '100', '100', 'number', true)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value_ka = EXCLUDED.setting_value_ka,
  setting_value_en = EXCLUDED.setting_value_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. CAMPAIGN SEO
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.campaign_seo (id, page_slug, title_ka, title_en, description_ka, description_en, keywords_ka, keywords_en, canonical_url, og_title_ka, og_title_en, og_description_ka, og_description_en, is_active) VALUES
  (
    'a1b2c3d4-0701-4000-8000-000000000001',
    'entrepreneur-support',
    'BTA LAB — მეწარმეების ციფრული განვითარების მხარდაჭერის კამპანია',
    'BTA LAB — Digital Entrepreneurship Development Support Campaign',
    'BTA LAB-ის კამპანია 10 პროექტისთვის: მიიღეთ 100%, 60% ან 30% დაფინანსება ვებგვერდის შესაქმნელად. განაცხადი უფასოა!',
    'BTA LAB campaign for 10 projects: Get 100%, 60%, or 30% funding for website creation. Free application!',
    'BTA LAB, მეწარმე, დაფინანსება, ვებგვერდი, ციფრული განვითარება, კამპანია, საქართველო',
    'BTA LAB, entrepreneur, funding, website, digital development, campaign, Georgia',
    'https://lab.bta.edu.ge/entrepreneur-support',
    'BTA LAB — მეწარმეების ციფრული მხარდაჭერა', 'BTA LAB — Digital Entrepreneurship Support',
    'მიიღეთ 100%, 60% ან 30% დაფინანსება ვებგვერდის შესაქმნელად', 'Get 100%, 60%, or 30% funding for website creation',
    true
  )
ON CONFLICT (page_slug) DO UPDATE SET
  title_ka = EXCLUDED.title_ka, title_en = EXCLUDED.title_en,
  description_ka = EXCLUDED.description_ka, description_en = EXCLUDED.description_en;

-- ═══════════════════════════════════════════════════════════════════════════
-- SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════

-- This seed file seeds:
--   • 1 campaign page  (campaign_pages)
--   • 19 sections       (campaign_sections) — Hero, Purpose, Funding, Eligibility,
--                          Projects, Services, Technologies, Criteria, Cultural,
--                          Selection, Timeline, Delivery, Responsibilities, Warranty,
--                          Portfolio Rights, Future Changes, Restrictions, FAQ, CTA
--   • 10 FAQ items      (campaign_faq)      — All 10 Q&A pairs in KA/EN
--   • 3 funding cards   (campaign_cards)    — 100%, 60%, 30%
--   • 5 statistics      (campaign_statistics) — Hero badges
--   • 1 CTA             (campaign_cta)      — Main call-to-action
--   • 8 settings        (campaign_settings) — Campaign config
--   • 1 SEO entry       (campaign_seo)      — SEO metadata
--
-- All entries use INSERT ... ON CONFLICT DO UPDATE for idempotent re-runs.
-- Run after supabase/migrations/003_campaign_schema.sql
-- ═══════════════════════════════════════════════════════════════════════════
