// @ts-nocheck — Campaign tables not in generated supabase types; runs via tsx, not tsc

/**
 * BTA LAB Campaign Seed Script
 * Seeds ALL campaign content for the Entrepreneur Support Campaign.
 * Safe to run multiple times — uses upserts with stable conflict keys.
 *
 * Usage: tsx scripts/seed-campaign.ts
 */

import { config } from "dotenv";
import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "./admin-bootstrap";

config({ path: ".env" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createSupabaseAdminClient();

function deterministicId(seed: string): string {
  const hash = createHash("sha256").update(seed).digest("hex");
  return [
    hash.substring(0, 8), hash.substring(8, 12),
    "4" + hash.substring(13, 16),
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.substring(18, 20),
    hash.substring(20, 32),
  ].join("-");
}

const PAGE_SLUG = "entrepreneur-support";
const PAGE_SLUG_RULES = "entrepreneur-support-rules";

async function seedCampaign() {
  console.log("\n  ╔══════════════════════════════════════╗");
  console.log("  ║   🎯  Campaign Seed Script           ║");
  console.log("  ╚══════════════════════════════════════╝\n");

  let count = 0;

  // ── 1. Campaign Pages ──────────────────────────────────────────────
  console.log("  ── Campaign Pages ─────────────────────────");
  const pageId = deterministicId("campaign-page-main");
  const { error: pageErr } = await supabase.from("campaign_pages").upsert({
    id: pageId,
    slug: PAGE_SLUG,
    title_ka: "მეწარმის მხარდაჭერის კამპანია",
    title_en: "Entrepreneur Support Campaign",
    subtitle_ka: "BTA LAB — შენი იდეის პარტნიორი",
    subtitle_en: "BTA LAB — Your Idea Partner",
    description_ka: "BTA LAB-ის მეწარმის მხარდაჭერის კამპანია გთავაზობთ დაფინანსებას, ტექნიკურ მხარდაჭერას და პროფესიონალურ გარემოს ციფრული პროექტების განსავითარებლად.",
    description_en: "BTA LAB's Entrepreneur Support Campaign offers funding, technical support, and a professional environment to develop digital projects.",
    is_active: true,
  }, { onConflict: "slug" });
  if (pageErr) console.error(`  ✗ ${pageErr.message}`);
  else { count++; console.log(`  ✓ Campaign page seeded`); }

  // ── 2. Campaign SEO ────────────────────────────────────────────────
  console.log("\n  ── Campaign SEO ────────────────────────────");
  const seoId = deterministicId("campaign-seo-main");
  const { error: seoErr } = await supabase.from("campaign_seo").upsert({
    id: seoId,
    page_slug: PAGE_SLUG,
    title_ka: "მეწარმის მხარდაჭერის კამპანია | BTA LAB",
    title_en: "Entrepreneur Support Campaign | BTA LAB",
    description_ka: "BTA LAB-ის მეწარმის მხარდაჭერის კამპანია — მიიღეთ დაფინანსება და პროფესიონალური მხარდაჭერა თქვენი ციფრული პროექტის განსავითარებლად.",
    description_en: "BTA LAB's Entrepreneur Support Campaign — Get funding and professional support to develop your digital project.",
    keywords_ka: "მეწარმე, მხარდაჭერა, დაფინანსება, ციფრული პროექტი, BTA LAB, სტარტაპი",
    keywords_en: "entrepreneur, support, funding, digital project, BTA LAB, startup",
    canonical_url: "https://lab.bta.edu.ge/entrepreneur-support",
    og_title_ka: "მეწარმის მხარდაჭერის კამპანია | BTA LAB",
    og_title_en: "Entrepreneur Support Campaign | BTA LAB",
    og_description_ka: "მიიღეთ დაფინანსება და პროფესიონალური მხარდაჭერა თქვენი ციფრული პროექტის განსავითარებლად.",
    og_description_en: "Get funding and professional support to develop your digital project.",
    og_image: "/images/og-campaign.png",
    twitter_title_ka: "მეწარმის მხარდაჭერის კამპანია | BTA LAB",
    twitter_title_en: "Entrepreneur Support Campaign | BTA LAB",
    twitter_description_ka: "დაფინანსება და მხარდაჭერა ციფრული პროექტებისთვის",
    twitter_description_en: "Funding and support for digital projects",
    is_active: true,
  }, { onConflict: "page_slug" });
  if (seoErr) console.error(`  ✗ ${seoErr.message}`);
  else console.log(`  ✓ Campaign SEO seeded`);

  // ── 3. Campaign Settings ────────────────────────────────────────────
  console.log("\n  ── Campaign Settings ────────────────────────");
  const settings = [
    { key: "campaign_name", v_ka: "მეწარმის მხარდაჭერის კამპანია", v_en: "Entrepreneur Support Campaign", type: "text" },
    { key: "campaign_email", v_ka: "lab@bta.edu.ge", v_en: "lab@bta.edu.ge", type: "text" },
    { key: "campaign_phone", v_ka: "+995 579 009 247", v_en: "+995 579 009 247", type: "text" },
    { key: "campaign_deadline", v_ka: "2026-12-31", v_en: "2026-12-31", type: "text" },
    { key: "campaign_max_funding", v_ka: "5000", v_en: "5000", type: "number" },
    { key: "campaign_currency", v_ka: "₾", v_en: "₾", type: "text" },
    { key: "campaign_application_fee", v_ka: "0", v_en: "0", type: "number" },
    { key: "campaign_max_applications", v_ka: "100", v_en: "100", type: "number" },
    { key: "campaign_facebook_url", v_ka: "https://facebook.com/bta-lab", v_en: "https://facebook.com/bta-lab", type: "url" },
    { key: "campaign_facebook_label", v_ka: "@btalab", v_en: "@btalab", type: "text" },
    { key: "campaign_instagram_url", v_ka: "https://instagram.com/bta_lab", v_en: "https://instagram.com/bta_lab", type: "url" },
    { key: "campaign_instagram_label", v_ka: "@bta_lab", v_en: "@bta_lab", type: "text" },
    { key: "campaign_tiktok_url", v_ka: "https://tiktok.com/@bta_lab", v_en: "https://tiktok.com/@bta_lab", type: "url" },
    { key: "campaign_tiktok_label", v_ka: "@bta_lab", v_en: "@bta_lab", type: "text" },
  ];
  for (const s of settings) {
    const sid = deterministicId("campaign-setting-" + s.key);
    const { error } = await supabase.from("campaign_settings").upsert({
      id: sid,
      setting_key: s.key,
      setting_value_ka: s.v_ka, setting_value_en: s.v_en,
      setting_type: s.type, is_active: true,
    }, { onConflict: "setting_key" });
    if (error) console.error(`  ✗ ${s.key}: ${error.message}`);
  }
  console.log(`  ✓ ${settings.length} settings seeded`);

  // ── 4. Campaign Sections (all landing page sections) ───────────────
  console.log("\n  ── Campaign Sections ────────────────────────");

  const sections = [
    // Hero
    {
      sk: "hero", st: "hero", order: 0,
      title_ka: "განავითარე შენი ბიზნესი თანამედროვე ვებგვერდით",
      title_en: "Develop Your Business with a Modern Website",
      desc_ka: `ბიზნესისა და ტექნოლოგიების აკადემია მისი საწარმოს ბითიეი ლაბის მეშვეობით იწყებს მცირე და საშუალო მეწარმეების, დამწყები ბიზნესებისა და ორგანიზაციების ციფრული განვითარების მხარდამჭერ კამპანიას.\n\nკამპანიის ფარგლებში შეირჩევა 10 პროექტი, რომლებიც მიიღებენ ვებგვერდის შექმნის მომსახურების 100%, 60% ან 30%-იან დაფინანსებას.`,
      desc_en: `The Enterprise of the Business and Technology Academy is launching a campaign to support the digital development of small and medium entrepreneurs, startups, and organizations. Within the campaign, 10 projects will be selected to receive 100%, 60%, or 30% funding for website creation services.`,
      badge_ka: "ახალი შესაძლებლობა",
      badge_en: "New Opportunity",
      btn_ka: "შეავსე განაცხადი",
      btn_en: "Apply Now",
      btn_url: "/entrepreneur-support/apply",
    },
    // Overview
    { sk: "overview", st: "content", order: 1,
      title_ka: "კამპანიის მოკლე აღწერა", title_en: "Campaign Overview",
      desc_ka: `თანამედროვე ბიზნესგარემოში პროფესიული ონლაინ წარმომადგენლობა მომხმარებელთან ურთიერთობის, ცნობადობისა და გაყიდვების განვითარების მნიშვნელოვანი ინსტრუმენტია. ბიზნესისა და ტექნოლოგიების აკადემიის საწარმოს კამპანიის მიზანია დაეხმაროს მეწარმეებსა და ორგანიზაციებს:
• შექმნან პროფესიული ონლაინ წარმომადგენლობა;
• წარმოაჩინონ საკუთარი პროდუქტი ან მომსახურება;
• გააუმჯობესონ მომხმარებელთან კომუნიკაცია;
• გაზარდონ ცნობადობა;
• მიიღონ ონლაინ განაცხადები, შეკვეთები ან მოთხოვნები;
• დაიწყონ ან გააძლიერონ საკუთარი ციფრული განვითარება.`,
      desc_en: `In the modern business environment, a professional online presence is an important tool for customer relations, brand awareness, and sales development. The Enterprise of the Business and Technology Academy campaign aims to help entrepreneurs and organizations:
• Create a professional online presence;
• Showcase their products or services;
• Improve customer communication;
• Increase brand awareness;
• Receive online applications, orders, or requests;
• Start or enhance their digital transformation.`,
      badge_ka: "მიზანი", badge_en: "Goal",
      content_ka: "", content_en: "", // Empty to remove duplicate bullet list from grey box
    },
    // Funding Model
    { sk: "funding", st: "content", order: 2,
      title_ka: "დაფინანსება", title_en: "Funding",
      desc_ka: "100% დაფინანსება (1 პროექტი)\nბიზნესისა და ტექნოლოგიების აკადემია სრულად დაფარავს შეთანხმებული ვებგვერდის შექმნის მომსახურების ღირებულებას.\n\n60% დაფინანსება (3 პროექტი)\nბიზნესისა და ტექნოლოგიების აკადემია დაფარავს მომსახურების ღირებულების 60%-ს, მონაწილე — 40%-ს.\n\n30% დაფინანსება (6 პროექტი)\nბიზნესისა და ტექნოლოგიების აკადემია დაფარავს მომსახურების ღირებულების 30%-ს, მონაწილე — 70%-ს.\n\n* დაფინანსების პროცენტი და ოდენობა განისაზღვრება პროექტის შეფასების შედეგების მიხედვით.",
      desc_en: "100% Funding (1 Project)\nThe Business and Technology Academy will fully cover the cost of the agreed website creation service.\n\n60% Funding (3 Projects)\nThe Business and Technology Academy covers 60% of the service cost, the participant covers 40%.\n\n30% Funding (6 Projects)\nThe Business and Technology Academy covers 30% of the service cost, the participant covers 70%.\n\n* Funding percentage and amount are determined based on project evaluation results.",
      badge_ka: "დაფინანსება", badge_en: "Funding",
    },
    // Who Can Apply
    { sk: "eligibility", st: "content", order: 3,
      title_ka: "ვის შეუძლია მონაწილეობა", title_en: "Who Can Participate",
      desc_ka: "კამპანიაში მონაწილეობა შეუძლია:\n• ინდივიდუალურ მეწარმეს;\n• შპს-ს ან სხვა იურიდიულ პირს;\n• მოქმედ მცირე ან საშუალო ბიზნესს;\n• დამწყებ მეწარმეს;\n• რეალისტური ბიზნესიდეის ავტორს;\n• არაკომერციულ ორგანიზაციას, თუ ვებგვერდი ემსახურება მის კანონიერ საქმიანობას.",
      desc_en: "The following can participate in the campaign:\n• Individual entrepreneur;\n• LLC or other legal entity;\n• Operating small or medium business;\n• Startup entrepreneur;\n• Author of a realistic business idea;\n• Non-commercial organization, if the website serves its lawful activities.",
      content_ka: "რეგისტრაციის პირობა: განაცხადის შევსების მომენტში ბიზნესის ოფიციალური რეგისტრაცია სავალდებულო არ არის. თუმცა პროექტის დაწყებამდე და ხელშეკრულების გაფორმებისას მონაწილე უნდა წარმოადგენდეს რეგისტრირებულ მეწარმე სუბიექტს, ინდივიდუალურ მეწარმეს ან იურიდიულ პირს, თუ პროექტის სამართლებრივი ან ფინანსური პირობები ამას მოითხოვს.",
      content_en: "Registration condition: Official business registration is not required at the time of application submission. However, before project start and contract signing, the participant must represent a registered business entity, individual entrepreneur, or legal entity, if the legal or financial conditions of the project require it.",
      badge_ka: "მონაწილეობა", badge_en: "Eligibility",
    },
    // Eligible Projects
    { sk: "projects", st: "cards", order: 4,
      title_ka: "დასაფინანსებელი პროექტები", title_en: "Eligible Projects",
      desc_ka: "ვებგვერდები, მობილური აპლიკაციები, ელექტრონული კომერციის პლატფორმები, ციფრული მარკეტინგის ინსტრუმენტები, UI/UX დიზაინი და სხვა ციფრული პროდუქტები.",
      desc_en: "Websites, mobile applications, e-commerce platforms, digital marketing tools, UI/UX design, and other digital products.",
      badge_ka: "პროექტები", badge_en: "Projects",
    },
    // Included Services
    { sk: "services", st: "cards", order: 5,
      title_ka: "ჩართული სერვისები", title_en: "Included Services",
      desc_ka: "ვებ დეველოპმენტი, UI/UX დიზაინი, ბრენდინგი, SEO ოპტიმიზაცია, ტექნიკური მხარდაჭერა, მენტორინგი, დაფინანსება.",
      desc_en: "Web development, UI/UX design, branding, SEO optimization, technical support, mentoring, funding.",
      badge_ka: "სერვისები", badge_en: "Services",
    },
    // Technologies
    { sk: "technologies", st: "cards", order: 6,
      title_ka: "ტექნოლოგიები", title_en: "Technologies",
      desc_ka: "თანამედროვე ტექნოლოგიები: Next.js, React, Node.js, Python, PostgreSQL, Tailwind CSS, Framer Motion და სხვა.",
      desc_en: "Modern technologies: Next.js, React, Node.js, Python, PostgreSQL, Tailwind CSS, Framer Motion, and more.",
      badge_ka: "ტექნოლოგიები", badge_en: "Technologies",
    },
    // Evaluation Criteria
    { sk: "criteria", st: "cards", order: 7,
      title_ka: "შეფასების კრიტერიუმები", title_en: "Evaluation Criteria",
      desc_ka: "პროექტები ფასდება შემდეგი კრიტერიუმებით: ინოვაციურობა, მიზანშეწონილობა, ბაზრის საჭიროება, გუნდის კომპეტენცია, მდგრადობა.",
      desc_en: "Projects are evaluated based on: innovation, feasibility, market need, team competence, sustainability.",
      badge_ka: "კრიტერიუმები", badge_en: "Criteria",
    },
    // Cultural Value
    { sk: "cultural", st: "content", order: 8,
      title_ka: "კულტურული, ეროვნული და ადგილობრივი ღირებულებები", title_en: "Cultural, National and Local Values",
      desc_ka: "დამატებითი უპირატესობა შეიძლება მიენიჭოს პროექტებს, რომლებიც ხელს უწყობს:\n1. ქართული კულტურისა და ეროვნული იდენტობის წარმოჩენას;\n2. ქართული ტრადიციებისა და კულტურული მემკვიდრეობის პოპულარიზაციას;\n3. ქართული ხელოვნების, ხელობისა და შემოქმედებითი საქმიანობის განვითარებას;\n4. ქართული წარმოებისა და ადგილობრივი პროდუქტის პოპულარიზაციას;\n5. რეგიონული და საოჯახო ბიზნესების განვითარებას;\n6. ადგილობრივი მეწარმეების, ფერმერებისა და ხელოსნების მხარდაჭერას;\n7. სამუშაო ადგილების შექმნას ან შენარჩუნებას;\n8. ახალგაზრდების პროფესიულ განვითარებას;\n9. რეგიონული ტურიზმისა და სტუმარმასპინძლობის განვითარებას;\n10. ქართული პროდუქტის საერთაშორისო ბაზარზე წარდგენას;\n11. ტრადიციული ცოდნისა და თანამედროვე ტექნოლოგიების დაკავშირებას;\n12. საზოგადოებისთვის სასარგებლო ან საგანმანათლებლო საქმიანობას.",
      desc_en: "Bonus points may be given to projects that promote:\n1. Georgian culture and national identity;\n2. Georgian traditions and cultural heritage;\n3. Georgian arts, crafts and creative activities;\n4. Georgian production and local products;\n5. Regional and family business development;\n6. Local entrepreneurs, farmers and artisans;\n7. Job creation or retention;\n8. Youth professional development;\n9. Regional tourism and hospitality;\n10. Georgian products on international markets;\n11. Connection of traditional knowledge with modern technology;\n12. Socially beneficial or educational activities.",
      content_ka: "აღნიშნული კრიტერიუმი სავალდებულო არ არის და გამოიყენება დამატებითი უპირატესობის მისანიჭებლად. მხოლოდ ქართული სახელის, სიმბოლოს ან ვიზუალური ელემენტის გამოყენება საკმარისი არ არის. განმცხადებელმა უნდა დაასაბუთოს პროექტის რეალური გავლენა.",
      content_en: "This criterion is not mandatory and is used to grant additional advantage. Using only a Georgian name, symbol or visual element is not sufficient. The applicant must substantiate the project's real impact.",
      badge_ka: "კულტურა", badge_en: "Culture",
    },
    // Selection Process
    { sk: "selection", st: "timeline", order: 9,
      title_ka: "შერჩევის პროცესი", title_en: "Selection Process",
      desc_ka: "განცხადებების მიღება → თავდაპირველი განხილვა → გასაუბრება → ტექნიკური შეფასება → საბოლოო გადაწყვეტილება.",
      desc_en: "Application submission → Initial review → Interview → Technical evaluation → Final decision.",
      badge_ka: "პროცესი", badge_en: "Process",
    },
    // Timeline
    { sk: "timeline", st: "timeline", order: 10,
      title_ka: "ვადები", title_en: "Timeline",
      desc_ka: "კამპანიის ძირითადი ეტაპები და ვადები.",
      desc_en: "Campaign main stages and deadlines.",
      badge_ka: "ვადები", badge_en: "Timeline",
    },
    // Delivery Time
    { sk: "delivery", st: "content", order: 11,
      title_ka: "მიწოდების ვადები", title_en: "Delivery Time",
      desc_ka: "პროექტის მიხედვით, მიწოდების ვადები 2 კვირიდან 3 თვემდე მერყეობს. ზუსტი ვადები განისაზღვრება ინდივიდუალურად.",
      desc_en: "Depending on the project, delivery times range from 2 weeks to 3 months. Exact deadlines are determined individually.",
      badge_ka: "ვადები", badge_en: "Delivery",
    },
    // Participant Responsibilities
    { sk: "responsibilities", st: "cards", order: 12,
      title_ka: "მონაწილის პასუხისმგებლობები", title_en: "Participant Responsibilities",
      desc_ka: "აქტიური თანამშრომლობა, დროული კომუნიკაცია, პროექტის მოთხოვნების მკაფიოდ განსაზღვრა, უკუკავშირის მიწოდება.",
      desc_en: "Active collaboration, timely communication, clear definition of project requirements, providing feedback.",
      badge_ka: "პასუხისმგებლობა", badge_en: "Responsibilities",
    },
    // Support
    { sk: "support", st: "cards", order: 13,
      title_ka: "მხარდაჭერა", title_en: "Support",
      desc_ka: "ტექნიკური მხარდაჭერა, მენტორინგი, კონსულტაციები, ტრენინგები და ვორქშოფები.",
      desc_en: "Technical support, mentoring, consultations, training and workshops.",
      badge_ka: "მხარდაჭერა", badge_en: "Support",
    },
    // Portfolio
    { sk: "portfolio", st: "cards", order: 14,
      title_ka: "პორტფოლიო", title_en: "Portfolio",
      desc_ka: "წარმატებული პროექტების მაგალითები, რომლებიც შეიქმნა BTA LAB-ის მხარდაჭერით.",
      desc_en: "Examples of successful projects created with BTA LAB support.",
      badge_ka: "პორტფოლიო", badge_en: "Portfolio",
    },
    // Branding
    { sk: "branding", st: "content", order: 15,
      title_ka: "ბრენდინგი", title_en: "Branding",
      desc_ka: "BTA LAB უზრუნველყოფს პროექტის ბრენდინგის მხარდაჭერას, მათ შორის ლოგოს დიზაინს, ფერების სქემას და ვიზუალურ იდენტობას.",
      desc_en: "BTA LAB provides project branding support, including logo design, color scheme, and visual identity.",
      badge_ka: "ბრენდინგი", badge_en: "Branding",
    },
    // Future Changes
    { sk: "futureChanges", st: "content", order: 16,
      title_ka: "მომავალი ცვლილებები", title_en: "Future Changes",
      desc_ka: "კამპანიის პირობები შესაძლოა შეიცვალოს BTA LAB-ის გადაწყვეტილებით. ცვლილებების შესახებ მონაწილეები წინასწარ გაფრთხილდებიან.",
      desc_en: "Campaign terms may change at BTA LAB's discretion. Participants will be notified in advance of any changes.",
      badge_ka: "ცვლილებები", badge_en: "Changes",
    },
    // Restrictions
    { sk: "restrictions", st: "cards", order: 17,
      title_ka: "შეზღუდვები", title_en: "Restrictions",
      desc_ka: "თითოეულ მონაწილეს შეუძლია მხოლოდ ერთი განაცხადის წარდგენა. პროექტი უნდა იყოს ორიგინალური და არ დაარღვევდეს საავტორო უფლებებს.",
      desc_en: "Each participant may submit only one application. The project must be original and not infringe copyright.",
      badge_ka: "შეზღუდვები", badge_en: "Restrictions",
    },
    // FAQ
    { sk: "faq", st: "content", order: 18,
      title_ka: "ხშირად დასმული კითხვები", title_en: "Frequently Asked Questions",
      desc_ka: "პასუხები ყველაზე ხშირად დასმულ კითხვებზე კამპანიის შესახებ.",
      desc_en: "Answers to the most frequently asked questions about the campaign.",
      badge_ka: "FAQ", badge_en: "FAQ",
    },
    // CTA
    { sk: "cta", st: "cta", order: 19,
      title_ka: "მზად ხარ დასაწყებად?", title_en: "Ready to Get Started?",
      desc_ka: "შეავსე განაცხადი და გახდი ბიზნესისა და ტექნოლოგიების აკადემიის საწარმოს მხარდაჭერილი მეწარმე. არ გამოტოვო ეს შესაძლებლობა!",
      desc_en: "Fill out the application and become an entrepreneur supported by the Enterprise of the Business and Technology Academy. Don't miss this opportunity!",
      badge_ka: "დაიწყე", badge_en: "Start",
      btn_ka: "განაცხადის გაკეთება", btn_en: "Submit Application",
      btn_url: "/entrepreneur-support/apply",
    },
  ];

  for (const s of sections) {
    const sid = deterministicId("campaign-section-" + s.sk);
    const { error } = await supabase.from("campaign_sections").upsert({
      id: sid, page_slug: PAGE_SLUG, section_key: s.sk, section_type: s.st,
      title_ka: s.title_ka, title_en: s.title_en,
      subtitle_ka: s.subtitle_ka || "", subtitle_en: s.subtitle_en || "",
      description_ka: s.desc_ka || "", description_en: s.desc_en || "",
      content_ka: s.content_ka || "", content_en: s.content_en || "",
      badge_ka: s.badge_ka || "", badge_en: s.badge_en || "",
      button_text_ka: s.btn_ka || "", button_text_en: s.btn_en || "",
      button_url: s.btn_url || "",
      sort_order: s.order, is_active: true,
    }, { onConflict: "page_slug, section_key" });
    if (error) console.error(`  ✗ [${s.sk}] ${error.message}`);
  }
  console.log(`  ✓ ${sections.length} sections seeded`);

  // ── 5. Campaign FAQ ──────────────────────────────────────────────────
  console.log("\n  ── Campaign FAQ ─────────────────────────────");
  const faqItems = [
    { q_ka: "რა არის მეწარმის მხარდაჭერის კამპანია?", q_en: "What is the Entrepreneur Support Campaign?",
      a_ka: "ეს არის BTA LAB-ის ინიციატივა, რომელიც მიზნად ისახავს დაეხმაროს მეწარმეებსა და სტარტაპებს ციფრული პროდუქტების შექმნაში. ჩვენ გთავაზობთ დაფინანსებას, ტექნიკურ მხარდაჭერას და მენტორინგს.",
      a_en: "This is a BTA LAB initiative aimed at helping entrepreneurs and startups create digital products. We offer funding, technical support, and mentoring." },
    { q_ka: "ვის შეუძლია მონაწილეობა?", q_en: "Who can participate?",
      a_ka: "კამპანიაში მონაწილეობა შეუძლიათ ფიზიკურ და იურიდიულ პირებს, მათ შორის სტუდენტებს, მეწარმეებს, სტარტაპებს და მცირე ბიზნესებს.",
      a_en: "Individuals and legal entities can participate, including students, entrepreneurs, startups, and small businesses." },
    { q_ka: "როგორ ხდება დაფინანსების ოდენობის განსაზღვრა?", q_en: "How is the funding amount determined?",
      a_ka: "დაფინანსების ოდენობა განისაზღვრება პროექტის სირთულის, მოცულობის და მოსალოდნელი გავლენის მიხედვით. მაქსიმალური დაფინანსება შეადგენს 5000₾-მდე.",
      a_en: "The funding amount is determined based on project complexity, scope, and expected impact. Maximum funding is up to 5000₾." },
    { q_ka: "რა ვადებია მოცემული პროექტის განსახორციელებლად?", q_en: "What are the deadlines for project implementation?",
      a_ka: "პროექტის განხორციელების ვადები განისაზღვრება ინდივიდუალურად, პროექტის სირთულის მიხედვით, და მერყეობს 2 კვირიდან 3 თვემდე.",
      a_en: "Project implementation deadlines are determined individually based on project complexity, ranging from 2 weeks to 3 months." },
    { q_ka: "მჭირდება თუ არა ტექნიკური ცოდნა?", q_en: "Do I need technical knowledge?",
      a_ka: "არა, თქვენ არ გჭირდებათ ტექნიკური ცოდნა. BTA LAB-ის გუნდი უზრუნველყოფს სრულ ტექნიკურ მხარდაჭერას.",
      a_en: "No, you don't need technical knowledge. The BTA LAB team provides full technical support." },
    { q_ka: "როგორ ხდება განაცხადების შეფასება?", q_en: "How are applications evaluated?",
      a_ka: "განაცხადები ფასდება 9 კრიტერიუმით: კანონიერება, ციფრული საჭიროება, ბიზნეს სტრატეგია, რეალიზმი, მზადყოფნა, თანამშრომლობა, კულტურული ღირებულება, პორტფოლიოს ღირებულება, ტექნიკური რისკი.",
      a_en: "Applications are evaluated on 9 criteria: legality, digital need, business strategy, realism, readiness, cooperation, cultural value, portfolio value, technical risk." },
    { q_ka: "შემიძლია თუ არა განაცხადის წარდგენა, თუ უკვე მაქვს მოქმედი ბიზნესი?", q_en: "Can I apply if I already have an existing business?",
      a_ka: "დიახ, არსებული ბიზნესის მქონე პირებსაც შეუძლიათ მონაწილეობა, თუ პროექტი მიმართულია ახალი ციფრული პროდუქტის შექმნაზე.",
      a_en: "Yes, existing business owners can also participate if the project is aimed at creating a new digital product." },
    { q_ka: "რა ხდება განაცხადის დამტკიცების შემდეგ?", q_en: "What happens after application approval?",
      a_ka: "დამტკიცების შემდეგ იდება ხელშეკრულება, განისაზღვრება პროექტის გეგმა და ვადები, და იწყება პროექტზე მუშაობა BTA LAB-ის გუნდთან ერთად.",
      a_en: "After approval, a contract is signed, the project plan and deadlines are defined, and work begins with the BTA LAB team." },
    { q_ka: "რა ღირს მონაწილეობა?", q_en: "How much does participation cost?",
      a_ka: "მონაწილეობა სრულიად უფასოა. კამპანია არ იხდის განაცხადის ან მონაწილეობის საფასურს.",
      a_en: "Participation is completely free. The campaign does not charge application or participation fees." },
    { q_ka: "შემიძლია თუ არა რამდენიმე განაცხადის წარდგენა?", q_en: "Can I submit multiple applications?",
      a_ka: "არა, თითოეულ მონაწილეს შეუძლია მხოლოდ ერთი განაცხადის წარდგენა ერთი პროექტისთვის.",
      a_en: "No, each participant may submit only one application for one project." },
  ];

  for (const [i, faq] of faqItems.entries()) {
    const fid = deterministicId("campaign-faq-" + i);
    const { error } = await supabase.from("campaign_faq").upsert({
      id: fid, page_slug: PAGE_SLUG,
      question_ka: faq.q_ka, question_en: faq.q_en,
      answer_ka: faq.a_ka, answer_en: faq.a_en,
      sort_order: i, is_active: true,
    }, { onConflict: "id" });
    if (error) console.error(`  ✗ FAQ ${i}: ${error.message}`);
  }
  console.log(`  ✓ ${faqItems.length} FAQ items seeded`);

  // ── 6. Campaign Cards ─────────────────────────────────────────────────
  console.log("\n  ── Campaign Cards ───────────────────────────");
  const cardSections: Record<string, Array<{ t_ka: string; t_en: string; d_ka: string; d_en: string; icon: string; badge_ka?: string; badge_en?: string }>> = {
    funding: [
      { t_ka: "100% დაფინანსება (1 პროექტი)", t_en: "100% Funding (1 Project)", d_ka: "ბიზნესისა და ტექნოლოგიების აკადემია სრულად დაფარავს შეთანხმებული ვებგვერდის შექმნის მომსახურების ღირებულებას.", d_en: "The Business and Technology Academy will fully cover the cost of the agreed website creation service.", icon: "Zap", badge_ka: "რეკომენდებული", badge_en: "Recommended" },
      { t_ka: "60% დაფინანსება (3 პროექტი)", t_en: "60% Funding (3 Projects)", d_ka: "ბიზნესისა და ტექნოლოგიების აკადემია დაფარავს მომსახურების ღირებულების 60%-ს, მონაწილე — 40%-ს.", d_en: "The Business and Technology Academy covers 60% of the service cost, the participant covers 40%.", icon: "Award" },
      { t_ka: "30% დაფინანსება (6 პროექტი)", t_en: "30% Funding (6 Projects)", d_ka: "ბიზნესისა და ტექნოლოგიების აკადემია დაფარავს მომსახურების ღირებულების 30%-ს, მონაწილე — 70%-ს.", d_en: "The Business and Technology Academy covers 30% of the service cost, the participant covers 70%.", icon: "Heart" },
    ],
    eligibility: [
      { t_ka: "სტუდენტები", t_en: "Students", d_ka: "BTA-ს და სხვა უნივერსიტეტების სტუდენტები", d_en: "Students of BTA and other universities", icon: "Users", badge_ka: "ახალგაზრდები", badge_en: "Youth" },
      { t_ka: "სტარტაპები", t_en: "Startups", d_ka: "ადრეულ ეტაპზე მყოფი სტარტაპები", d_en: "Early-stage startups", icon: "Rocket", badge_ka: "სტარტაპი", badge_en: "Startup" },
      { t_ka: "მცირე ბიზნესი", t_en: "Small Business", d_ka: "მცირე ბიზნესები, რომლებსაც სჭირდებათ ციფრული ტრანსფორმაცია", d_en: "Small businesses needing digital transformation", icon: "Building", badge_ka: "ბიზნესი", badge_en: "Business" },
    ],
    projects: [
      { t_ka: "ვებგვერდები", t_en: "Websites", d_ka: "თანამედროვე, ადაპტირებული ვებგვერდები", d_en: "Modern, responsive websites", icon: "Globe" },
      { t_ka: "მობილური აპლიკაციები", t_en: "Mobile Apps", d_ka: "iOS და Android აპლიკაციები", d_en: "iOS and Android applications", icon: "Smartphone" },
      { t_ka: "ონლაინ მაღაზიები", t_en: "Online Stores", d_ka: "ელექტრონული კომერციის პლატფორმები", d_en: "E-commerce platforms", icon: "ShoppingCart" },
    ],
    services: [
      { t_ka: "ვებ დეველოპმენტი", t_en: "Web Development", d_ka: "სრული ციკლის ვებ დეველოპმენტი", d_en: "Full-cycle web development", icon: "Code" },
      { t_ka: "UI/UX დიზაინი", t_en: "UI/UX Design", d_ka: "მომხმარებელზე ორიენტირებული დიზაინი", d_en: "User-centered design", icon: "Palette" },
      { t_ka: "ბრენდინგი", t_en: "Branding", d_ka: "ბრენდის იდენტობის შექმნა", d_en: "Brand identity creation", icon: "Heart" },
    ],
    technologies: [
      { t_ka: "Next.js / React", t_en: "Next.js / React", d_ka: "თანამედროვე ფრონტენდ ტექნოლოგიები", d_en: "Modern frontend technologies", icon: "Code" },
      { t_ka: "Node.js / Python", t_en: "Node.js / Python", d_ka: "მძლავრი ბექენდ გადაწყვეტილებები", d_en: "Powerful backend solutions", icon: "Server" },
      { t_ka: "PostgreSQL", t_en: "PostgreSQL", d_ka: "საიმედო მონაცემთა ბაზები", d_en: "Reliable databases", icon: "Database" },
    ],
    criteria: [
      { t_ka: "ინოვაციურობა", t_en: "Innovation", d_ka: "პროექტის სიახლე და კრეატიულობა", d_en: "Project novelty and creativity", icon: "Lightbulb" },
      { t_ka: "მიზანშეწონილობა", t_en: "Feasibility", d_ka: "პროექტის განხორციელების რეალისტურობა", d_en: "Realistic project implementation", icon: "Target" },
      { t_ka: "ბაზრის საჭიროება", t_en: "Market Need", d_ka: "პროექტის შესაბამისობა ბაზრის მოთხოვნებთან", d_en: "Project alignment with market demands", icon: "TrendingUp" },
    ],
    responsibilities: [
      { t_ka: "რეგულარული კომუნიკაცია", t_en: "Regular Communication", d_ka: "კვირეული შეხვედრები გუნდთან", d_en: "Weekly meetings with the team", icon: "MessageSquare" },
      { t_ka: "უკუკავშირი", t_en: "Feedback", d_ka: "დროული და კონსტრუქციული უკუკავშირი", d_en: "Timely and constructive feedback", icon: "CheckCircle" },
      { t_ka: "პროექტის მოთხოვნები", t_en: "Project Requirements", d_ka: "მკაფიო მოთხოვნების განსაზღვრა", d_en: "Clear definition of requirements", icon: "FileText" },
    ],
    support: [
      { t_ka: "ტექნიკური მხარდაჭერა", t_en: "Technical Support", d_ka: "24/7 ტექნიკური მხარდაჭერა", d_en: "24/7 technical support", icon: "Headphones" },
      { t_ka: "ტრენინგები", t_en: "Training", d_ka: "რეგულარული ტრენინგები და ვორქშოფები", d_en: "Regular training and workshops", icon: "BookOpen" },
      { t_ka: "მენტორინგი", t_en: "Mentoring", d_ka: "პერსონალური მენტორის მხარდაჭერა", d_en: "Personal mentor support", icon: "Star" },
    ],
    portfolio: [
      { t_ka: "qey.ge", t_en: "qey.ge", d_ka: "ონლაინ მაღაზიის პლატფორმა", d_en: "E-commerce platform", icon: "ShoppingCart" },
    ],
    restrictions: [
      { t_ka: "ერთი განაცხადი", t_en: "One Application", d_ka: "თითო მონაწილეს შეუძლია მხოლოდ ერთი განაცხადის წარდგენა", d_en: "Each participant may submit only one application", icon: "FileText" },
      { t_ka: "ორიგინალობა", t_en: "Originality", d_ka: "პროექტი უნდა იყოს ორიგინალური", d_en: "The project must be original", icon: "Shield" },
      { t_ka: "საავტორო უფლებები", t_en: "Copyright", d_ka: "პროექტი არ უნდა არღვევდეს საავტორო უფლებებს", d_en: "The project must not infringe copyright", icon: "Scale" },
    ],
  };

  let cardCount = 0;
  for (const [sectionKey, cards] of Object.entries(cardSections)) {
    for (const [ci, card] of cards.entries()) {
      const cid = deterministicId(`campaign-card-${sectionKey}-${ci}`);
      const { error } = await supabase.from("campaign_cards").upsert({
        id: cid, page_slug: PAGE_SLUG, section_key: sectionKey,
        title_ka: card.t_ka, title_en: card.t_en,
        description_ka: card.d_ka, description_en: card.d_en,
        icon: card.icon,
        badge_ka: card.badge_ka || "", badge_en: card.badge_en || "",
        sort_order: ci, is_active: true,
      }, { onConflict: "id" });
      if (error) console.error(`  ✗ Card ${sectionKey}[${ci}]: ${error.message}`);
      else cardCount++;
    }
  }
  console.log(`  ✓ ${cardCount} cards seeded`);

  // ── 7. Campaign Timeline ──────────────────────────────────────────────
  console.log("\n  ── Campaign Timeline ─────────────────────────");
  const timelineItems = [
    { section: "timeline", date_ka: "00", date_en: "00", t_ka: "განცხადებების მიღება", t_en: "Application Submission", d_ka: "მონაწილეები ავსებენ და აგზავნიან განაცხადებს ონლაინ ფორმის მეშვეობით.", d_en: "Participants fill out and submit applications via the online form.", icon: "FileText" },
    { section: "timeline", date_ka: "00", date_en: "00", t_ka: "განცხადებების განხილვა", t_en: "Application Review", d_ka: "მიღებული განაცხადები განიხილება და ხდება წინასწარი შერჩევა.", d_en: "Received applications are reviewed and pre-selected.", icon: "Search" },
    { section: "timeline", date_ka: "00", date_en: "00", t_ka: "გასაუბრება", t_en: "Interviews", d_ka: "შერჩეულ კანდიდატებთან ტარდება გასაუბრება პროექტის დეტალებზე.", d_en: "Selected candidates are interviewed about project details.", icon: "Users" },
    { section: "timeline", date_ka: "00", date_en: "00", t_ka: "ტექნიკური/ფინანსური შეფასება", t_en: "Technical/Financial Evaluation", d_ka: "ხდება პროექტების ტექნიკური და ფინანსური შეფასება.", d_en: "Projects undergo technical and financial evaluation.", icon: "Settings" },
    { section: "timeline", date_ka: "00", date_en: "00", t_ka: "საბოლოო გადაწყვეტილება", t_en: "Final Decision", d_ka: "გამოვლინდებიან გამარჯვებულები და კეთდება პირობითი შეთავაზებები.", d_en: "Winners are announced and conditional offers are made.", icon: "Award" },
  ];

  for (const [ti, item] of timelineItems.entries()) {
    const tid = deterministicId("campaign-timeline-" + ti);
    const { error } = await supabase.from("campaign_timeline").upsert({
      id: tid, page_slug: PAGE_SLUG, section_key: "timeline",
      date_ka: item.date_ka, date_en: item.date_en,
      title_ka: item.t_ka, title_en: item.t_en,
      description_ka: item.d_ka, description_en: item.d_en,
      icon: item.icon, sort_order: ti, is_active: true,
    }, { onConflict: "id" });
    if (error) console.error(`  ✗ Timeline ${ti}: ${error.message}`);
  }
  console.log(`  ✓ ${timelineItems.length} timeline items seeded`);

  // ── 8. Campaign Statistics ────────────────────────────────────────────
  console.log("\n  ── Campaign Statistics ───────────────────────");
  const stats = [
    { section: "hero", l_ka: "დაფინანსების ლიმიტი", l_en: "Funding Limit", val: 5000, suffix_ka: "₾", suffix_en: "₾", icon: "Zap" },
    { section: "hero", l_ka: "ადგილები", l_en: "Spots", val: 10, suffix_ka: "", suffix_en: "", icon: "Users" },
    { section: "hero", l_ka: "ხანგრძლივობა", l_en: "Duration", val: 8, suffix_ka: " კვირა", suffix_en: " weeks", icon: "Clock" },
    { section: "hero", l_ka: "უფასო მონაწილეობა", l_en: "Free Participation", val: 1, suffix_ka: "", suffix_en: "", icon: "Heart" },
  ];

  for (const [si, stat] of stats.entries()) {
    const sid = deterministicId("campaign-stat-" + si);
    const { error } = await supabase.from("campaign_statistics").upsert({
      id: sid, page_slug: PAGE_SLUG, section_key: stat.section,
      label_ka: stat.l_ka, label_en: stat.l_en,
      value: stat.val, suffix_ka: stat.suffix_ka, suffix_en: stat.suffix_en,
      icon: stat.icon, sort_order: si, is_active: true,
    }, { onConflict: "id" });
    if (error) console.error(`  ✗ Stat ${si}: ${error.message}`);
  }
  console.log(`  ✓ ${stats.length} statistics seeded`);

  // ── 9. Campaign CTA ───────────────────────────────────────────────────
  console.log("\n  ── Campaign CTA ──────────────────────────────");
  const ctaItems = [
    {
      section: "cta",
      t_ka: "მზად ხარ დასაწყებად?", t_en: "Ready to Get Started?",
      d_ka: "შეავსე განაცხადი და გახდი ბიზნესისა და ტექნოლოგიების აკადემიის საწარმოს მხარდაჭერილი მეწარმე. არ გამოტოვო ეს შესაძლებლობა!", d_en: "Fill out the application and become an entrepreneur supported by the Enterprise of the Business and Technology Academy. Don't miss this opportunity!",
      btn_ka: "განაცხადის გაკეთება", btn_en: "Submit Application", btn_url: "/entrepreneur-support/apply",
      sbtn_ka: "გაიგე მეტი", sbtn_en: "Learn More", sbtn_url: "#criteria",
    },
    {
      section: "footer",
      t_ka: "გაქვს შეკითხვები?", t_en: "Have Questions?",
      d_ka: "დაგვიკავშირდი და ჩვენი გუნდი სიამოვნებით გიპასუხებს ყველა შეკითხვაზე.", d_en: "Contact us and our team will be happy to answer all your questions.",
      btn_ka: "დაგვიკავშირდი", btn_en: "Contact Us", btn_url: "/contact",
    },
  ];

  for (const [ci, cta] of ctaItems.entries()) {
    const cid = deterministicId("campaign-cta-" + ci);
    const { error } = await supabase.from("campaign_cta").upsert({
      id: cid, page_slug: PAGE_SLUG, section_key: cta.section,
      title_ka: cta.t_ka, title_en: cta.t_en,
      description_ka: cta.d_ka, description_en: cta.d_en,
      button_text_ka: cta.btn_ka, button_text_en: cta.btn_en,
      button_url: cta.btn_url,
      secondary_button_text_ka: cta.sbtn_ka || "", secondary_button_text_en: cta.sbtn_en || "",
      secondary_button_url: cta.sbtn_url || "",
      is_active: true,
    }, { onConflict: "id" });
    if (error) console.error(`  ✗ CTA ${ci}: ${error.message}`);
  }
  console.log(`  ✓ ${ctaItems.length} CTAs seeded`);

  // ── 10. Email Templates ───────────────────────────────────────────────
  console.log("\n  ── Email Templates ─────────────────────────");
  const emailTemplates = [
    { event: "application_received",
      sub_ka: "განაცხადი მიღებულია", sub_en: "Application Received",
      body_ka: "თქვენი განაცხადი მიღებულია. თქვენი განაცხადის ნომერია: {{applicationNumber}}. ჩვენი გუნდი განიხილავს მას და დაგიკავშირდებით 5 სამუშაო დღის განმავლობაში.",
      body_en: "Your application has been received. Your application number is: {{applicationNumber}}. Our team will review it and contact you within 5 business days." },
    { event: "interview_invitation",
      sub_ka: "გასაუბრების მოწვევა", sub_en: "Interview Invitation",
      body_ka: "თქვენ მიწვეული ხართ გასაუბრებაზე. თარიღი: {{date}}, დრო: {{time}}, ბმული: {{meetingUrl}}.",
      body_en: "You are invited for an interview. Date: {{date}}, Time: {{time}}, Link: {{meetingUrl}}." },
    { event: "need_more_information",
      sub_ka: "დამატებითი ინფორმაცია", sub_en: "Additional Information Needed",
      body_ka: "თქვენი განაცხადის განსახილველად საჭიროა დამატებითი ინფორმაცია: {{notes}}",
      body_en: "To review your application, we need additional information: {{notes}}" },
    { event: "offer_made",
      sub_ka: "შეთავაზება", sub_en: "Offer",
      body_ka: "გილოცავთ! თქვენ მიიღეთ შეთავაზება. დაფინანსება: {{amount}}₾ ({{percentage}}%). გთხოვთ, დაადასტუროთ {{deadline}}-მდე.",
      body_en: "Congratulations! You have received an offer. Funding: {{amount}}₾ ({{percentage}}%). Please confirm by {{deadline}}." },
    { event: "status_changed",
      sub_ka: "სტატუსის ცვლილება", sub_en: "Status Change",
      body_ka: "თქვენი განაცხადის სტატუსი შეიცვალა: {{status}}.",
      body_en: "Your application status has changed to: {{status}}." },
    { event: "final_decision",
      sub_ka: "საბოლოო გადაწყვეტილება", sub_en: "Final Decision",
      body_ka: "თქვენი განაცხადის საბოლოო შედეგი: {{result}}.",
      body_en: "The final result of your application: {{result}}." },
  ];

  for (const et of emailTemplates) {
    const eid = deterministicId("campaign-email-" + et.event);
    const { error } = await supabase.from("campaign_email_templates").upsert({
      id: eid, event: et.event,
      subject_ka: et.sub_ka, subject_en: et.sub_en,
      body_ka: et.body_ka, body_en: et.body_en,
      is_active: true,
    }, { onConflict: "event" });
    if (error) console.error(`  ✗ Email ${et.event}: ${error.message}`);
  }
  console.log(`  ✓ ${emailTemplates.length} email templates seeded`);

  // ── Summary ──────────────────────────────────────────────────────────
  console.log("\n  ╔══════════════════════════════════════╗");
  console.log("  ║   ✅ Campaign Seed Complete!          ║");
  console.log("  ╚══════════════════════════════════════╝\n");
}

seedCampaign().catch(console.error);
