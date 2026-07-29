-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Campaign Full Content Update
-- Updates description_ka/en and content_ka/en for ALL sections with the
-- complete unedited text from the campaign specification (sections 1-19).
-- ═══════════════════════════════════════════════════════════════════════════
-- Safe to run multiple times — uses WHERE + UPDATE with stable page_slug/section_key
-- RUN AFTER: supabase/migrations/003_campaign_schema.sql AND seeds/004_campaign_content_seed.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 1: HERO (already has title/description from seed)
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'განავითარე შენი ბიზნესი თანამედროვე ვებგვერდით',
  title_en = 'Develop Your Business with a Modern Website',
  description_ka = 'ბიზნესისა და ტექნოლოგიების აკადემიის საწარმო ბიზნესისა და ტექნოლოგიების აკადემია იწყებს მცირე და საშუალო მეწარმეების, დამწყები ბიზნესებისა და ორგანიზაციების ციფრული განვითარების მხარდამჭერ კამპანიას. კამპანიის ფარგლებში შეირჩევა 10 პროექტი, რომლებიც მიიღებენ ვებგვერდის შექმნის მომსახურების 100%, 60% ან 30%-იან დაფინანსებას.',
  description_en = 'BTA LAB is launching a campaign to support the digital development of small and medium entrepreneurs, startups, and organizations. Within the campaign, 10 projects will be selected to receive 100%, 60%, or 30% funding for website creation services.',
  badge_ka = 'ახალი შესაძლებლობა',
  badge_en = 'New Opportunity',
  button_text_ka = 'შეავსე განაცხადი',
  button_text_en = 'Submit Application',
  button_url = '/entrepreneur-support/apply'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'hero';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 2: CAMPAIGN PURPOSE
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'კამპანიის მოკლე აღწერა',
  title_en = 'Campaign Overview',
  description_ka = 'თანამედროვე ბიზნესგარემოში პროფესიული ონლაინ წარმომადგენლობა მომხმარებელთან ურთიერთობის, ცნობადობისა და გაყიდვების განვითარების მნიშვნელოვანი ინსტრუმენტია. ბიზნესისა და ტექნოლოგიების აკადემიის კამპანიის მიზანია დაეხმაროს მეწარმეებსა და ორგანიზაციებს:

• შეექმნათ პროფესიული ონლაინ წარმომადგენლობა;
• წარმოაჩინონ საკუთარი პროდუქტი ან მომსახურება;
• გააუმჯობესონ მომხმარებელთან კომუნიკაცია;
• მიიღონ ონლაინ განაცხადები, შეკვეთები ან მოთხოვნები;
• დაიწყონ ან გააძლიერონ საკუთარი ციფრული განვითარება.',
  description_en = 'In the modern business environment, a professional online presence is an important tool for customer relations, brand awareness, and sales development. BTA LAB campaign aims to help entrepreneurs and organizations:
• Create a professional online presence;
• Showcase their product or service;
• Improve customer communication;
• Increase brand awareness;
• Receive online applications, orders, or requests;
• Start or strengthen their digital development.',
  badge_ka = 'მიზანი',
  badge_en = 'Purpose'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'purpose';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 3: FUNDING MODEL
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'დაფინანსების მოდელი — 10 პროექტი',
  title_en = 'Funding Model — 10 Projects',
  description_ka = '100%-იანი დაფინანსება (1 პროექტი) — ბიზნესისა და ტექნოლოგიების აკადემია სრულად დაფარავს შეთანხმებული ვებგვერდის შექმნის მომსახურების ღირებულებას.

60%-იანი დაფინანსება (3 პროექტი) — ბიზნესისა და ტექნოლოგიების აკადემია დაფარავს მომსახურების სრული ღირებულების 60%-ს, ხოლო მონაწილე — 40%-ს.

30%-იანი დაფინანსება (6 პროექტი) — ბიზნესისა და ტექნოლოგიების აკადემია დაფარავს მომსახურების სრული ღირებულების 30%-ს, ხოლო მონაწილე — 70%-ს.',
  description_en = '100% Funding (1 Project) — BTA LAB will fully cover the cost of the agreed website creation service.

60% Funding (3 Projects) — BTA LAB covers 60% of the service cost, the participant covers 40%.

30% Funding (6 Projects) — BTA LAB covers 30% of the service cost, the participant covers 70%.',
  content_ka = 'მნიშვნელოვანი განმარტება:
დაფინანსება გულისხმობს ვებგვერდის შექმნის მომსახურების სრული ან შესაბამისი ნაწილის დაფარვას და არ წარმოადგენს მონაწილისთვის თანხის ჩარიცხვას.
დომენის, ჰოსტინგის, ფასიანი პროგრამების, მესამე მხარის სერვისებისა და გადახდის სისტემების ხარჯები დაფინანსებაში არ შედის, თუ ინდივიდუალურ შეთავაზებაში სხვა რამ არ იქნება მითითებული.',
  content_en = 'Important clarification:
Funding covers the full or partial cost of website creation services and does not constitute a cash transfer to the participant.
Domain, hosting, paid software, third-party services, and payment system costs are not included in the funding, unless otherwise specified in the individual offer.',
  badge_ka = 'დაფინანსება',
  badge_en = 'Funding',
  button_text_ka = 'გაიგე, რომელ კატეგორიას შეესაბამები',
  button_text_en = 'Find out which category you qualify for',
  button_url = '#eligibility'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'funding';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 4: ELIGIBILITY
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'ვის შეუძლია მონაწილეობა?',
  title_en = 'Who Can Participate?',
  description_ka = 'კამპანიაში მონაწილეობა შეუძლია:
• ინდივიდუალურ მეწარმეს;
• შპს-ს ან სხვა იურიდიულ პირს;
• მოქმედ მცირე ან საშუალო ბიზნესს;
• დამწყებ მეწარმეს;
• რეალისტური ბიზნესიდეის ავტორს;
• არაკომერციულ ორგანიზაციას, თუ ვებგვერდი ემსახურება მის კანონიერ საქმიანობას.',
  description_en = 'The following can participate in the campaign:
• Individual entrepreneur;
• LLC or other legal entity;
• Operating small or medium business;
• Startup entrepreneur;
• Author of a realistic business idea;
• Non-commercial organization, if the website serves its lawful activities.',
  content_ka = 'რეგისტრაციის პირობა:
განაცხადის შევსების მომენტში ბიზნესის ოფიციალური რეგისტრაცია სავალდებულო არ არის.
თუმცა პროექტის დაწყებამდე და ხელშეკრულების გაფორმებისას მონაწილე უნდა წარმოადგენდეს რეგისტრირებულ მეწარმე სუბიექტს, ინდივიდუალურ მეწარმეს ან იურიდიულ პირს, თუ პროექტის სამართლებრივი ან ფინანსური პირობები ამას მოითხოვს.
ეს პირობა განაცხადის ფორმაშივე უნდა იყოს ნათლად მითითებული.',
  content_en = 'Registration condition:
Official business registration is not required at the time of application submission.
However, before project start and contract signing, the participant must represent a registered business entity, individual entrepreneur, or legal entity, if the legal or financial conditions of the project require it.
This condition must be clearly stated in the application form itself.',
  badge_ka = 'მონაწილეობა',
  badge_en = 'Eligibility'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'eligibility';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 5: PROJECT SCOPE
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'რა ტიპის პროექტები ფინანსდება?',
  title_en = 'What Types of Projects Are Funded?',
  description_ka = 'კამპანიის ფარგლებში შესაძლოა შეიქმნას:
• ერთგვერდიანი ბიზნესვებგვერდი;
• კომპანიის ან ორგანიზაციის საინფორმაციო ვებგვერდი;
• პროდუქტის ან მომსახურების კატალოგი;
• მცირე ონლაინ მაღაზია;
• ონლაინ განაცხადის ან შეკვეთის ფორმა;
• დაჯავშნის ან მოთხოვნის მარტივი სისტემა;
• ღონისძიების, ტურისტული ან საგანმანათლებლო გვერდი;
• არსებული ვებგვერდის განახლებული ვერსია;
• ინდივიდუალური მცირე ბიზნესგადაწყვეტილება, თუ ის კამპანიის ტექნიკურ შესაძლებლობებს შეესაბამება.',
  description_en = 'The campaign may fund the creation of:
• One-page business website;
• Company or organization informational website;
• Product or service catalog;
• Small online store;
• Online application or order form;
• Simple booking or request system;
• Event, tourism, or educational page;
• Redesigned version of an existing website;
• Custom small business solution, if it matches the campaign''s technical capabilities.',
  content_ka = 'კამპანიის ფარგლებში, როგორც წესი, არ შეიქმნება:
• დიდი მარკეტპლეისი;
• რთული სოციალური ქსელი;
• კომპლექსური ERP ან CRM სისტემა;
• საბანკო ან ფინანსური კრიტიკული სისტემა;
• სამედიცინო კრიტიკული სისტემა;
• რთული მრავალმომხმარებლიანი პლატფორმა;
• დიდი მოცულობის მობილური აპლიკაცია;
• პროექტი, რომელიც ათეულობით რთულ ინტეგრაციას მოითხოვს.

თუ მოთხოვნები აღემატება კამპანიის შესაძლებლობებს, ბიზნესისა და ტექნოლოგიების აკადემიას შეუძლია:
• შესთავაზოს პროექტის პირველი, გამარტივებული ვერსია;
• შეამციროს ფუნქციური მოცულობა;
• დამატებითი სამუშაო ცალკე შეაფასოს;
• უარი თქვას პროექტის განხორციელებაზე.',
  content_en = 'The campaign will generally NOT create:
• Large marketplace;
• Complex social network;
• Complex ERP or CRM system;
• Banking or financial critical system;
• Medical critical system;
• Complex multi-user platform;
• Large-scale mobile application;
• Project requiring dozens of complex integrations.

If requirements exceed campaign capabilities, BTA LAB may:
• Offer a first, simplified version of the project;
• Reduce functional scope;
• Evaluate additional work separately;
• Decline project implementation.',
  badge_ka = 'პროექტები',
  badge_en = 'Projects'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'projects';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 6: SERVICES
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'რას მოიცავს მომსახურება?',
  title_en = 'What Does the Service Include?',
  description_ka = 'კონკრეტული პროექტის მიხედვით მომსახურება შეიძლება მოიცავდეს:
• საჭიროებების ანალიზს;
• ვებგვერდის სტრუქტურის დაგეგმვას;
• დიზაინის შექმნას;
• მობილურ მოწყობილობებზე მორგებას;
• Frontend და Backend განვითარებას;
• მონაცემთა ბაზის შექმნას;
• კონტენტის მართვის სისტემას;
• საკონტაქტო და განაცხადის ფორმებს;
• პროდუქტის ან მომსახურების კატალოგს;
• საბაზისო საძიებო ოპტიმიზაციას;
• სიჩქარისა და წარმადობის ოპტიმიზაციას;
• უსაფრთხოების საბაზისო გამართვას;
• ანალიტიკის ინტეგრაციას;
• Deployment-ს;
• პროექტის ჩაბარებასა და გამოყენების ინსტრუქციას.',
  description_en = 'Depending on the specific project, services may include:
• Needs analysis;
• Website structure planning;
• Design creation;
• Mobile responsiveness;
• Frontend and Backend development;
• Database creation;
• Content management system;
• Contact and application forms;
• Product or service catalog;
• Basic search engine optimization;
• Speed and performance optimization;
• Basic security setup;
• Analytics integration;
• Deployment;
• Project handover and usage instructions.',
  content_ka = 'ტექნოლოგიები:
პროექტის საჭიროებიდან გამომდინარე შეიძლება გამოყენებულ იქნეს:
• Next.js;
• Laravel;
• მონაცემთა ბაზები;
• Docker;
• Git;
• CI/CD;
• Cloud სერვისები;
• Cloudflare;
• ონლაინ გადახდის ინტეგრაციები;
• მონიტორინგისა და ოპტიმიზაციის ინსტრუმენტები.

*ტექნოლოგია შეირჩევა პროექტის საჭიროების მიხედვით და არა მხოლოდ მონაწილის სურვილით.*',
  content_en = 'Technologies:
Depending on project needs, the following may be used:
• Next.js;
• Laravel;
• Databases;
• Docker;
• Git;
• CI/CD;
• Cloud Services;
• Cloudflare;
• Online payment integrations;
• Monitoring and optimization tools.

*Technology is selected based on project needs, not solely on participant preference.*',
  badge_ka = 'სერვისები',
  badge_en = 'Services'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'services';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 7: EVALUATION CRITERIA
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'შეფასების კრიტერიუმები',
  title_en = 'Evaluation Criteria',
  description_ka = 'ყველა განაცხადი შეფასდება თანაბარ პირობებში, წინასწარ განსაზღვრული კრიტერიუმების საფუძველზე.

1. საქმიანობის კანონიერება:
საქმიანობა უნდა შეესაბამებოდეს საქართველოს მოქმედ კანონმდებლობას.

2. ციფრული საჭიროების დასაბუთება:
განმცხადებელმა უნდა ახსნას:
• რატომ სჭირდება ვებგვერდი;
• რას შეცვლის ვებგვერდი მის საქმიანობაში;
• ვინ იქნება მისი მომხმარებელი;
• როგორ გამოიყენებს ვებგვერდს;
• რა შედეგის მიღება სურს.

3. განვითარების სტრატეგია:
შეფასდება:
• ბიზნესის განვითარების ხედვა;
• მომდევნო 6–12 თვის გეგმები;
• გაყიდვების ან მომხმარებელთა ზრდის შესაძლებლობა;
• ახალი ბაზრების ათვისების პოტენციალი;
• ვებგვერდის როლი განვითარების პროცესში.

4. პროექტის რეალისტურობა:
შეფასდება:
• ბიზნესის ან იდეის მზადყოფნა;
• პროდუქტის ან მომსახურების არსებობა;
• პროექტის პრაქტიკული განხორციელებადობა;
• მიზნების სიცხადე;
• საჭირო რესურსების ხელმისაწვდომობა.

5. ინფორმაციული მასალის მზადყოფნა:
განმცხადებელს სასურველია ჰქონდეს:
• ლოგო;
• კომპანიის ან საქმიანობის აღწერა;
• პროდუქტის ან მომსახურების აღწერები;
• ფასები;
• ფოტოები;
• საკონტაქტო ინფორმაცია;
• სოციალური ქსელის გვერდები;
• პასუხისმგებელი საკონტაქტო პირი.
(ყველა მასალის მზადყოფნა განაცხადის მომენტში სავალდებულო არ არის, თუმცა მონაწილემ უნდა შეძლოს მათი შეთანხმებულ ვადაში მოწოდება).

6. თანამშრომლობის მზადყოფნა:
მონაწილემ უნდა დაადასტუროს:
• შეხვედრებში მონაწილეობის მზადყოფნა;
• ინფორმაციის დროულად მოწოდება;
• უკუკავშირის შეთანხმებულ ვადაში მიწოდება;
• პროექტზე პასუხისმგებელი პირის გამოყოფა;
• ტექნიკური დავალების შეთანხმება;
• სამუშაო პროცესში აქტიური თანამშრომლობა.',
  description_en = 'All applications will be evaluated under equal conditions, based on predefined criteria.

1. Legality of Activity:
The activity must comply with the current legislation of Georgia.

2. Digital Need Justification:
The applicant must explain:
• Why they need a website;
• What the website will change in their activities;
• Who their users will be;
• How they will use the website;
• What results they want to achieve.

3. Development Strategy:
Evaluated on:
• Business development vision;
• Plans for the next 6–12 months;
• Sales or customer growth potential;
• New market expansion potential;
• The website''s role in the development process.

4. Project Realism:
Evaluated on:
• Business or idea readiness;
• Product or service existence;
• Practical project feasibility;
• Clarity of goals;
• Availability of necessary resources.

5. Information Material Readiness:
It is desirable for the applicant to have:
• Logo;
• Company or activity description;
• Product or service descriptions;
• Prices;
• Photos;
• Contact information;
• Social media pages;
• Responsible contact person.
(Readiness of all materials at the time of application is not mandatory, but the participant must be able to provide them within the agreed timeframe).

6. Cooperation Readiness:
The participant must confirm:
• Readiness to participate in meetings;
• Timely provision of information;
• Providing feedback within agreed deadlines;
• Designating a person responsible for the project;
• Agreeing to the technical task;
• Active cooperation during the work process.',
  badge_ka = 'კრიტერიუმები',
  badge_en = 'Criteria'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'criteria';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 8: CULTURAL VALUE
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'კულტურული, ეროვნული და ადგილობრივი ღირებულებები',
  title_en = 'Cultural, National and Local Values',
  description_ka = 'დამატებითი უპირატესობა შეიძლება მიენიჭოს პროექტებს, რომლებიც ხელს უწყობს:
• ქართული კულტურისა და ეროვნული იდენტობის წარმოჩენას;
• ქართული ტრადიციებისა და კულტურული მემკვიდრეობის პოპულარიზაციას;
• ქართული ხელოვნების, ხელობისა და შემოქმედებითი საქმიანობის განვითარებას;
• ქართული წარმოებისა და ადგილობრივი პროდუქტის პოპულარიზაციას;
• რეგიონული და საოჯახო ბიზნესების განვითარებას;
• ადგილობრივი მეწარმეების, ფერმერებისა და ხელოსნების მხარდაჭერას;
• სამუშაო ადგილების შექმნას ან შენარჩუნებას;
• ახალგაზრდების პროფესიულ განვითარებას;
• რეგიონული ტურიზმისა და სტუმარმასპინძლობის განვითარებას;
• ქართული პროდუქტის საერთაშორისო ბაზარზე წარდგენას;
• ტრადიციული ცოდნისა და თანამედროვე ტექნოლოგიების დაკავშირებას;
• საზოგადოებისთვის სასარგებლო ან საგანმანათლებლო საქმიანობას.',
  description_en = 'Additional advantage may be given to projects that promote:
• Representation of Georgian culture and national identity;
• Popularization of Georgian traditions and cultural heritage;
• Development of Georgian art, crafts, and creative activities;
• Promotion of Georgian production and local products;
• Development of regional and family businesses;
• Support for local entrepreneurs, farmers, and artisans;
• Creation or preservation of jobs;
• Professional development of youth;
• Development of regional tourism and hospitality;
• Presentation of Georgian products on international markets;
• Connecting traditional knowledge with modern technology;
• Socially beneficial or educational activities.',
  content_ka = '*აღნიშნული კრიტერიუმი სავალდებულო არ არის და გამოიყენება დამატებითი უპირატესობის მისანიჭებლად. მხოლოდ ქართული სახელის, სიმბოლოს ან ვიზუალური ელემენტის გამოყენება საკმარისი არ არის. განმცხადებელმა უნდა დაასაბუთოს პროექტის რეალური გავლენა.*',
  content_en = '*This criterion is not mandatory and is used to provide additional advantage. Using only a Georgian name, symbol, or visual element is not sufficient. The applicant must justify the real impact of the project.*',
  badge_ka = 'კულტურა',
  badge_en = 'Culture'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'cultural';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 9: SELECTION PROCESS
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'შერჩევის პროცესი',
  title_en = 'Selection Process',
  description_ka = 'ეტაპი 1 — განაცხადის შევსება: განმცხადებელი ავსებს ონლაინ სარეგისტრაციო ფორმას და ადასტურებს კამპანიის პირობებზე თანხმობას.

ეტაპი 2 — პირველადი შეფასება: ბიზნესისა და ტექნოლოგიების აკადემიის შეფასების ჯგუფი ამოწმებს: განაცხადის სისრულეს; პროექტის შესაბამისობას; ბიზნესის საჭიროებას; ტექნიკურ განხორციელებადობას; თანამშრომლობის მზაობას.

ეტაპი 3 — მოკლე სია: მაღალი შეფასების მქონე კანდიდატები გადადიან გასაუბრების ეტაპზე.

ეტაპი 4 — გასაუბრება: გასაუბრება გაგრძელდება დაახლოებით 25–30 წუთი. შეხვედრაზე დაზუსტდება: პროექტის მიზანი; აუცილებელი ფუნქციები; მასალების მზადყოფნა; ბიზნესის განვითარების გეგმა; სავარაუდო სამუშაო მოცულობა; თანამონაწილეობის შესაძლებლობა.

ეტაპი 5 — ტექნიკური და ფინანსური შეფასება: გასაუბრების შემდეგ განისაზღვრება: პროექტის სამუშაო მოცულობა; სრული ღირებულება; შესრულების სავარაუდო ვადა; დაფინანსების კატეგორია; მონაწილის გადასახდელი ნაწილი.

ეტაპი 6 — პირობითი შეთავაზება: შერჩეულ კანდიდატს გაეგზავნება წერილობითი შეთავაზება, რომელშიც მითითებული იქნება: დაფინანსების პროცენტი; პროექტის სრული ღირებულება; ბიზნესისა და ტექნოლოგიების აკადემიის დაფინანსება; მონაწილის თანამონაწილეობა; პროექტის სამუშაო მოცულობა; შესრულების ვადა; დასადასტურებელი ბოლო თარიღი.

ეტაპი 7 — მონაწილეობის დადასტურება: კანდიდატმა შეთავაზება უნდა დაადასტუროს 3 სამუშაო დღის განმავლობაში. უარის ან უპასუხოდ დატოვების შემთხვევაში ადგილი გადაეცემა სარეზერვო კანდიდატს.

ეტაპი 8 — საბოლოო შედეგები: საჯაროდ გამოცხადდება მხოლოდ ის პროექტები, რომლებმაც: დაადასტურეს შეთავაზება; წარმოადგინეს საჭირო ინფორმაცია; გამოხატეს ხელშეკრულების გაფორმების მზადყოფნა.',
  description_en = 'Stage 1 — Application Submission: The applicant fills out the online registration form and confirms acceptance of the campaign terms.

Stage 2 — Initial Assessment: BTA LAB evaluation team checks: application completeness; project compliance; business need; technical feasibility; cooperation readiness.

Stage 3 — Shortlist: High-scoring candidates proceed to the interview stage.

Stage 4 — Interview: The interview will last approximately 25–30 minutes. The meeting will clarify: project goal; necessary features; material readiness; business development plan; estimated scope of work; possibility of co-participation.

Stage 5 — Technical and Financial Assessment: After the interview, the following will be determined: project scope of work; total cost; estimated completion time; funding category; participant''s payable portion.

Stage 6 — Conditional Offer: The selected candidate will receive a written offer specifying: funding percentage; total project cost; BTA LAB funding; participant co-participation; project scope of work; completion deadline; confirmation deadline.

Stage 7 — Participation Confirmation: The candidate must confirm the offer within 3 business days. In case of rejection or non-response, the spot will be transferred to a reserve candidate.

Stage 8 — Final Results: Only those projects will be publicly announced that have: confirmed the offer; submitted necessary information; expressed readiness to sign a contract.',
  badge_ka = 'პროცესი',
  badge_en = 'Process'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'selection';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 10: CAMPAIGN TIMELINE
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'კამპანიის ვადები',
  title_en = 'Campaign Timeline',
  description_ka = 'განაცხადების დაწყება — [თარიღი]
განაცხადების დასრულება — [თარიღი]
პირველადი შეფასება — [თარიღები]
გასაუბრებები — [თარიღები]
პირობითი შეთავაზებები — [თარიღი]
მონაწილეთა დადასტურება — [თარიღი]
საბოლოო შედეგების გამოქვეყნება — [თარიღი]
პროექტების დაწყება — [თარიღი]

რეკომენდებული საერთო პერიოდი:
• განაცხადების მიღება — 21 დღე;
• შეფასება — 5 სამუშაო დღე;
• გასაუბრებები — 5–7 სამუშაო დღე;
• შეთავაზების დადასტურება — 3 სამუშაო დღე.',
  description_en = 'Application Start — [Date]
Application End — [Date]
Initial Assessment — [Dates]
Interviews — [Dates]
Conditional Offers — [Date]
Participant Confirmation — [Date]
Final Results Publication — [Date]
Project Start — [Date]

Recommended Overall Period:
• Application period — 21 days;
• Assessment — 5 business days;
• Interviews — 5–7 business days;
• Offer confirmation — 3 business days.',
  badge_ka = 'ვადები',
  badge_en = 'Timeline'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'timeline';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 11: DELIVERY TIME
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'პროექტის შესრულების ვადები',
  title_en = 'Project Delivery Times',
  description_ka = 'ვადა განისაზღვრება პროექტის ტიპისა და სირთულის მიხედვით.

საშუალო ვადები:
• ერთგვერდიანი საიტი — 2–3 კვირა;
• მცირე ბიზნესვებგვერდი — 3–5 კვირა;
• კატალოგი ან CMS — 4–6 კვირა;
• მცირე ონლაინ მაღაზია — 6–8 კვირა.

ვადის ათვლა იწყება მხოლოდ მას შემდეგ, რაც:
• გაფორმდება ხელშეკრულება;
• შეთანხმდება ტექნიკური დავალება;
• გადაიხდება თანამონაწილეობის შეთანხმებული ნაწილი;
• მონაწილე წარმოადგენს საჭირო მასალებს.',
  description_en = 'The deadline is determined based on the type and complexity of the project.

Average Timeframes:
• One-page site — 2–3 weeks;
• Small business website — 3–5 weeks;
• Catalog or CMS — 4–6 weeks;
• Small online store — 6–8 weeks.

The countdown begins only after:
• The contract is signed;
• The technical task is agreed upon;
• The agreed co-participation portion is paid;
• The participant provides the necessary materials.',
  badge_ka = 'ვადები',
  badge_en = 'Delivery'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'delivery';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 12: PARTICIPANT RESPONSIBILITIES
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'მონაწილის პასუხისმგებლობა',
  title_en = 'Participant Responsibilities',
  description_ka = 'შერჩეული მონაწილე ვალდებულია:
• გამოყოს პროექტზე პასუხისმგებელი პირი;
• დროულად წარმოადგინოს ინფორმაცია და მასალები;
• უკუკავშირი მიაწოდოს მაქსიმუმ 3 სამუშაო დღეში;
• შეამოწმოს და დაადასტუროს ტექსტები;
• დაიცვას შეთანხმებული ვადები;
• მონაწილეობა მიიღოს საჭირო შეხვედრებში;
• არ მოითხოვოს შეთანხმებული მოცულობის მიღმა დამატებითი ფუნქციები უფასოდ.

თუ მონაწილე არ თანამშრომლობს:
• პროექტის ვადა გადაიწევს;
• სამუშაო შეიძლება დროებით შეჩერდეს;
• ხანგრძლივი უპასუხობის შემთხვევაში ხელშეკრულება შეიძლება შეწყდეს;
• ადგილი შეიძლება გადაეცეს სარეზერვო პროექტს.',
  description_en = 'The selected participant is obliged to:
• Designate a person responsible for the project;
• Provide information and materials in a timely manner;
• Provide feedback within a maximum of 3 business days;
• Review and confirm texts;
• Adhere to agreed deadlines;
• Participate in required meetings;
• Not request additional functions beyond the agreed scope for free.

If the participant fails to cooperate:
• The project deadline will be extended;
• Work may be temporarily suspended;
• In case of prolonged non-response, the contract may be terminated;
• The spot may be transferred to a reserve project.',
  badge_ka = 'პასუხისმგებლობა',
  badge_en = 'Responsibilities'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'responsibilities';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 13: WARRANTY / TECHNICAL SUPPORT
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'ტექნიკური მხარდაჭერა',
  title_en = 'Technical Support',
  description_ka = 'პროექტის ჩაბარების შემდეგ მოქმედებს 30-დღიანი საგარანტიო პერიოდი.

საგარანტიო მხარდაჭერა მოიცავს:
• ბიზნესისა და ტექნოლოგიების აკადემიის მიერ დაშვებული ტექნიკური შეცდომების გამოსწორებას;
• შეთანხმებული ფუნქციების გამართულობის აღდგენას;
• ფორმებისა და ინტეგრაციების გადამოწმებას;
• Deployment-თან დაკავშირებული პრობლემების გამოსწორებას.

საგარანტიო მხარდაჭერა არ მოიცავს:
• ახალი ფუნქციის შექმნას;
• დიზაინის შეცვლას;
• ახალი გვერდების დამატებას;
• მასშტაბურ კონტენტურ ცვლილებებს;
• მესამე პირის მიერ შეცვლილი კოდის აღდგენას;
• ფასიანი სერვისებისა და პლატფორმების ხარჯებს.

*30 დღის შემდეგ მონაწილეს შეიძლება შეეთავაზოს ფასიანი ტექნიკური მხარდაჭერის პაკეტი.*',
  description_en = 'A 30-day warranty period applies after project handover.

Warranty support includes:
• Correction of technical errors made by BTA LAB;
• Restoration of agreed function functionality;
• Verification of forms and integrations;
• Correction of deployment-related issues.

Warranty support does NOT include:
• Creation of new features;
• Design changes;
• Adding new pages;
• Large-scale content changes;
• Restoration of code modified by third parties;
• Costs of paid services and platforms.

*After 30 days, the participant may be offered a paid technical support package.*',
  badge_ka = 'გარანტია',
  badge_en = 'Warranty'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'warranty';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 14: PORTFOLIO RIGHTS
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'პორტფოლიო და საჯარო კომუნიკაცია',
  title_en = 'Portfolio and Public Communication',
  description_ka = 'კამპანიაში მონაწილეობით კანდიდატი წინასწარ უნდა ადასტურებდეს, რომ შერჩევის შემთხვევაში ბიზნესისა და ტექნოლოგიების აკადემიას ექნება უფლება:
• განათავსოს პროექტი საკუთარ პორტფოლიოში;
• გამოიყენოს პროექტის სქრინშოტები;
• აღწეროს სამუშაო პროცესი და გამოყენებული ტექნოლოგიები;
• გამოაქვეყნოს პროექტის შედეგები;
• გამოიყენოს მონაწილის წერილობითი შეფასება;
• წარმოადგინოს პროექტი აკადემიის ღონისძიებებსა და პრეზენტაციებში;
• გაავრცელოს პროექტთან დაკავშირებული ინფორმაცია სოციალურ ქსელებში.

*პერსონალური ფოტოებისა და ვიდეომასალის გამოყენება საჭიროებს ცალკე თანხმობას.*',
  description_en = 'By participating in the campaign, the candidate must confirm in advance that, if selected, BTA LAB will have the right to:
• Display the project in its portfolio;
• Use project screenshots;
• Describe the work process and technologies used;
• Publish project results;
• Use the participant''s written feedback;
• Present the project at academy events and presentations;
• Share project-related information on social networks.

*Use of personal photos and video material requires separate consent.*',
  badge_ka = 'პორტფოლიო',
  badge_en = 'Portfolio'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'portfolio_rights';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 15: BTA LAB CREDIT
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'ბიზნესისა და ტექნოლოგიების აკადემიის სახელის ასახვა ვებგვერდზე',
  title_en = 'BTA LAB Credit on Website',
  description_ka = 'კამპანიის ფარგლებში შექმნილ ვებგვერდზე შეიძლება განთავსდეს მცირე ჩანაწერი: „შექმნილია ბიზნესისა და ტექნოლოგიების აკადემიის მიერ"

სასურველია ჩანაწერი დარჩეს მინიმუმ 12 თვის განმავლობაში.
თუ პროექტი მოგვიანებით მნიშვნელოვნად შეიცვლება მესამე პირის მიერ, ბიზნესისა და ტექნოლოგიების აკადემიას ექნება უფლება მოითხოვოს საკუთარი სახელის ან ბმულის მოხსნა.',
  description_en = 'A small credit may be placed on websites created within the campaign: "Created by BTA LAB"

It is recommended that the credit remain for at least 12 months.
If the project is later significantly modified by a third party, BTA LAB has the right to request the removal of its name or link.',
  badge_ka = 'ბრენდინგი',
  badge_en = 'Branding'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'branding';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 16: FUTURE CHANGES
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'პროექტის შემდგომი ცვლილება',
  title_en = 'Future Project Changes',
  description_ka = 'პროექტის მფლობელს შეუძლია ვებგვერდის შეცვლა ან განვითარება პროექტის ჩაბარების შემდეგ.
თუმცა:
• ბიზნესისა და ტექნოლოგიების აკადემია პასუხს აგებს მხოლოდ ჩაბარების მომენტის ვერსიაზე;
• მესამე პირის მიერ შეტანილ ცვლილებებზე პასუხისმგებლობა ბიზნესისა და ტექნოლოგიების აკადემიას არ ეკისრება;
• მნიშვნელოვნად შეცვლილი ვერსია არ უნდა იქნეს წარმოდგენილი როგორც სრულად ბიზნესისა და ტექნოლოგიების აკადემიის მიერ შესრულებული;
• ბიზნესისა და ტექნოლოგიების აკადემიის პორტფოლიოში შეიძლება დარჩეს პროექტის ჩაბარების მომენტის ასლი ან სქრინშოტები.',
  description_en = 'The project owner can change or develop the website after project delivery.
However:
• BTA LAB is only responsible for the version at the time of delivery;
• BTA LAB is not liable for changes made by third parties;
• A significantly modified version should not be presented as fully executed by BTA LAB;
• A copy or screenshots of the project at the time of delivery may remain in BTA LAB''s portfolio.',
  badge_ka = 'ცვლილებები',
  badge_en = 'Changes'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'future_changes';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 17: RESTRICTIONS
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'შეზღუდვები',
  title_en = 'Restrictions',
  description_ka = 'კამპანიაში არ მიიღება პროექტები, რომლებიც დაკავშირებულია:
• უკანონო საქმიანობასთან;
• აზარტულ თამაშებთან;
• თაღლითურ საქმიანობასთან;
• მომხმარებლის შეცდომაში შეყვანასთან;
• ძალადობის ან სიძულვილის წახალისებასთან;
• დისკრიმინაციულ საქმიანობასთან;
• საავტორო უფლებების დარღვევასთან;
• საქართველოს კანონმდებლობით აკრძალულ საქმიანობასთან.

*ბიზნესისა და ტექნოლოგიების აკადემია იტოვებს უფლებას უარი თქვას განაცხადზე, რომელიც არ შეესაბამება კამპანიის მიზნებს, ღირებულებებს ან ტექნიკურ შესაძლებლობებს.*',
  description_en = 'Projects related to the following will not be accepted in the campaign:
• Illegal activities;
• Gambling;
• Fraudulent activities;
• Misleading consumers;
• Encouraging violence or hatred;
• Discriminatory activities;
• Copyright infringement;
• Activities prohibited by Georgian legislation.

*BTA LAB reserves the right to reject applications that do not align with the campaign''s goals, values, or technical capabilities.*',
  badge_ka = 'შეზღუდვები',
  badge_en = 'Restrictions'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'restrictions';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 18: FAQ (already seeded with 10 Q&As in 004_campaign_content_seed.sql)
-- ═══════════════════════════════════════════════════════════════════════════
-- No update needed — the FAQ items are already fully seeded with the exact text.

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 19: FINAL CTA
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_sections SET
  title_ka = 'მზად ხარ შენი ბიზნესის ციფრული განვითარებისთვის?',
  title_en = 'Ready for Your Business Digital Development?',
  description_ka = 'შეავსე განაცხადი, მოგვიყევი შენი საქმიანობის შესახებ და წარმოადგინე, როგორ დაგეხმარება თანამედროვე ვებგვერდი განვითარებაში.',
  description_en = 'Fill out the application, tell us about your business, and demonstrate how a modern website can help you grow.',
  badge_ka = 'დაიწყე',
  badge_en = 'Start',
  button_text_ka = 'შეავსე განაცხადი',
  button_text_en = 'Submit Application',
  button_url = '/entrepreneur-support/apply'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'cta';

-- ═══════════════════════════════════════════════════════════════════════════
-- CAMPAIGN CTA TABLE
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.campaign_cta SET
  title_ka = 'მზად ხარ შენი ბიზნესის ციფრული განვითარებისთვის?',
  title_en = 'Ready for Your Business Digital Development?',
  description_ka = 'შეავსე განაცხადი, მოგვიყევი შენი საქმიანობის შესახებ და წარმოადგინე, როგორ დაგეხმარება თანამედროვე ვებგვერდი განვითარებაში.',
  description_en = 'Fill out the application, tell us about your business, and demonstrate how a modern website can help you grow.',
  button_text_ka = 'შეავსე განაცხადი',
  button_text_en = 'Submit Application',
  button_url = '/entrepreneur-support/apply'
WHERE page_slug = 'entrepreneur-support' AND section_key = 'cta';

-- ═══════════════════════════════════════════════════════════════════════════
-- UPDATE campaign FAQ with exact text from specification
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE public.campaign_faq SET
  question_ka = 'განაცხადის შევსება ფასიანია?',
  question_en = 'Is filling out the application paid?',
  answer_ka = 'არა. კამპანიაში განაცხადის წარმოდგენა უფასოა.',
  answer_en = 'No. Submitting an application to the campaign is free.'
WHERE page_slug = 'entrepreneur-support' AND sort_order = 0;

UPDATE public.campaign_faq SET
  question_ka = 'მხოლოდ მოქმედ ბიზნესს შეუძლია მონაწილეობა?',
  question_en = 'Can only existing businesses participate?',
  answer_ka = 'არა. მონაწილეობა შეუძლია როგორც მოქმედ ბიზნესს, ასევე რეალისტური და განვითარებადი ბიზნესიდეის ავტორს.',
  answer_en = 'No. Both existing businesses and authors of realistic and developing business ideas can participate.'
WHERE page_slug = 'entrepreneur-support' AND sort_order = 1;

UPDATE public.campaign_faq SET
  question_ka = 'ბიზნესის რეგისტრაცია აუცილებელია?',
  question_en = 'Is business registration required?',
  answer_ka = 'განაცხადის შევსებისას — არა. პროექტის დაწყებამდე შესაძლოა აუცილებელი იყოს ინდივიდუალურ მეწარმედ ან იურიდიულ პირად რეგისტრაცია.',
  answer_en = 'When submitting the application — no. Before starting the project, registration as an individual entrepreneur or legal entity may be required.'
WHERE page_slug = 'entrepreneur-support' AND sort_order = 2;

UPDATE public.campaign_faq SET
  question_ka = 'დაფინანსების თანხას ანგარიშზე მივიღებ?',
  question_en = 'Will I receive the funding amount in my account?',
  answer_ka = 'არა. დაფინანსება წარმოადგენს ვებგვერდის შექმნის მომსახურების შესაბამისი ნაწილის დაფარვას.',
  answer_en = 'No. Funding represents covering the corresponding part of the website creation service cost.'
WHERE page_slug = 'entrepreneur-support' AND sort_order = 3;

UPDATE public.campaign_faq SET
  question_ka = 'როგორ გავიგებ დაფინანსების პროცენტს?',
  question_en = 'How will I know the funding percentage?',
  answer_ka = 'პროცენტი განისაზღვრება განაცხადის შეფასებისა და გასაუბრების შემდეგ. კანდიდატი საბოლოო შედეგების გამოცხადებამდე მიიღებს პირობით შეთავაზებას.',
  answer_en = 'The percentage is determined after application evaluation and interview. The candidate will receive a conditional offer before final results are announced.'
WHERE page_slug = 'entrepreneur-support' AND sort_order = 4;

UPDATE public.campaign_faq SET
  question_ka = 'შემიძლია უარი ვთქვა თანამონაწილეობაზე?',
  question_en = 'Can I decline participation?',
  answer_ka = 'დიახ. უარის შემთხვევაში შეთავაზება გადაეცემა სარეზერვო კანდიდატს.',
  answer_en = 'Yes. If declined, the offer will be transferred to a reserve candidate.'
WHERE page_slug = 'entrepreneur-support' AND sort_order = 5;

UPDATE public.campaign_faq SET
  question_ka = 'დომენი და ჰოსტინგი შედის დაფინანსებაში?',
  question_en = 'Are domain and hosting included in the funding?',
  answer_ka = 'არა, თუ ინდივიდუალურ შეთავაზებაში სხვა რამ არ იქნება მითითებული.',
  answer_en = 'No, unless otherwise specified in the individual offer.'
WHERE page_slug = 'entrepreneur-support' AND sort_order = 6;

UPDATE public.campaign_faq SET
  question_ka = 'რამდენი ცვლილება შემეძლება?',
  question_en = 'How many changes can I request?',
  answer_ka = 'ცვლილებების დასაშვები რაოდენობა და სამუშაო მოცულობა განისაზღვრება ტექნიკურ დავალებასა და ხელშეკრულებაში.',
  answer_en = 'The allowable number of changes and scope of work is defined in the technical task and contract.'
WHERE page_slug = 'entrepreneur-support' AND sort_order = 7;

UPDATE public.campaign_faq SET
  question_ka = 'ვის ეკუთვნის დასრულებული ვებგვერდი?',
  question_en = 'Who owns the completed website?',
  answer_ka = 'საკუთრებისა და კოდის გადაცემის პირობები განისაზღვრება ხელშეკრულებაში.',
  answer_en = 'Ownership and code transfer terms are defined in the contract.'
WHERE page_slug = 'entrepreneur-support' AND sort_order = 8;

UPDATE public.campaign_faq SET
  question_ka = 'შემიძლია პროექტი მომავალში შევცვალო?',
  question_en = 'Can I change the project in the future?',
  answer_ka = 'დიახ, თუმცა ბიზნესისა და ტექნოლოგიების აკადემია პასუხისმგებელი იქნება მხოლოდ მის მიერ ჩაბარებულ ვერსიაზე.',
  answer_en = 'Yes, however BTA LAB will only be responsible for the version it delivered.'
WHERE page_slug = 'entrepreneur-support' AND sort_order = 9;

-- ═══════════════════════════════════════════════════════════════════════════
-- SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════
-- This migration updates ALL campaign content with the complete unedited text.
-- Applied after 004_campaign_content_seed.sql.
-- ═══════════════════════════════════════════════════════════════════════════
