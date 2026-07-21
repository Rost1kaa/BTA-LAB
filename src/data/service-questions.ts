import type { Json } from "@/types/supabase";

// ── Types ──

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface QuestionField {
  id: string;
  type: "text" | "textarea" | "email" | "tel" | "url" | "select" | "radio" | "checkbox" | "input";
  label: string;
  description?: string;
  placeholder?: string;
  options?: QuestionOption[];
  multiple?: boolean;
  condition?: { field: string; value: string };
}

export interface ServiceQuestions {
  serviceId: string;
  serviceName: string;
  questions: QuestionField[];
}

// ── Landing Starter ($199) ──

const landingStarterQuestions: QuestionField[] = [
  {
    id: "promote_service",
    type: "textarea",
    label: "What service or product do you want to promote?",
    placeholder: "e.g. Car rental service",
  },
  {
    id: "user_actions",
    type: "checkbox",
    label: "What action should users take?",
    multiple: true,
    options: [
      { id: "contact_us", label: "Contact us", value: "contact_us" },
      { id: "fill_form", label: "Fill a form", value: "fill_form" },
      { id: "buy_product", label: "Buy a product", value: "buy_product" },
      { id: "book", label: "Book", value: "book" },
      { id: "other_action", label: "Other", value: "other" },
    ],
  },
  {
    id: "info_to_include",
    type: "checkbox",
    label: "What information should appear?",
    multiple: true,
    options: [
      { id: "business_info", label: "Business info", value: "business_info" },
      { id: "services_list", label: "Services", value: "services_list" },
      { id: "prices", label: "Prices", value: "prices" },
      { id: "photos", label: "Photos", value: "photos" },
      { id: "testimonials", label: "Testimonials", value: "testimonials" },
      { id: "faq", label: "FAQ", value: "faq" },
      { id: "contact", label: "Contact", value: "contact" },
    ],
  },
  {
    id: "design_reference",
    type: "url",
    label: "Design example URL",
    placeholder: "Share a website style you like",
  },
  {
    id: "has_logo_colors",
    type: "radio",
    label: "Logo and brand colors?",
    options: [
      { id: "yes", label: "Yes", value: "yes" },
      { id: "no", label: "No", value: "no" },
    ],
  },
];

// ── One Page Website ($300) ──

const onePageQuestions: QuestionField[] = [
  {
    id: "promote_service",
    type: "textarea",
    label: "What service or product do you want to promote?",
    placeholder: "e.g. Car rental service",
  },
  {
    id: "user_actions",
    type: "checkbox",
    label: "What action should users take?",
    multiple: true,
    options: [
      { id: "contact_us", label: "Contact us", value: "contact_us" },
      { id: "fill_form", label: "Fill a form", value: "fill_form" },
      { id: "buy_product", label: "Buy a product", value: "buy_product" },
      { id: "book", label: "Book", value: "book" },
      { id: "other_action", label: "Other", value: "other" },
    ],
  },
  {
    id: "info_to_include",
    type: "checkbox",
    label: "What information should appear?",
    multiple: true,
    options: [
      { id: "business_info", label: "Business info", value: "business_info" },
      { id: "services_list", label: "Services", value: "services_list" },
      { id: "prices", label: "Prices", value: "prices" },
      { id: "photos", label: "Photos", value: "photos" },
      { id: "testimonials", label: "Testimonials", value: "testimonials" },
      { id: "faq", label: "FAQ", value: "faq" },
      { id: "contact", label: "Contact", value: "contact" },
    ],
  },
  {
    id: "design_reference",
    type: "url",
    label: "Design example URL",
    placeholder: "Share a website style you like",
  },
  {
    id: "has_logo_colors",
    type: "radio",
    label: "Logo and brand colors?",
    options: [
      { id: "yes", label: "Yes", value: "yes" },
      { id: "no", label: "No", value: "no" },
    ],
  },
  {
    id: "sections_count",
    type: "select",
    label: "How many sections do you need?",
    options: [
      { id: "3-5", label: "3-5", value: "3-5" },
      { id: "5-8", label: "5-8", value: "5-8" },
      { id: "8+", label: "8+", value: "8+" },
    ],
  },
  {
    id: "required_sections",
    type: "checkbox",
    label: "Required Sections",
    multiple: true,
    options: [
      { id: "home", label: "Home", value: "home" },
      { id: "about", label: "About", value: "about" },
      { id: "services_section", label: "Services", value: "services_section" },
      { id: "portfolio_section", label: "Portfolio", value: "portfolio_section" },
      { id: "pricing_section", label: "Pricing", value: "pricing_section" },
      { id: "faq_section", label: "FAQ", value: "faq_section" },
      { id: "team_section", label: "Team", value: "team_section" },
      { id: "contact_section", label: "Contact", value: "contact_section" },
    ],
  },
  {
    id: "content_readiness",
    type: "select",
    label: "Do you already have content?",
    options: [
      { id: "ready", label: "Ready", value: "ready" },
      { id: "partial", label: "Partial", value: "partial" },
      { id: "needs_prep", label: "Need preparation", value: "needs_prep" },
    ],
  },
  {
    id: "required_integrations_one_page",
    type: "checkbox",
    label: "Additional",
    multiple: true,
    options: [
      { id: "google_maps", label: "Google Maps", value: "google_maps" },
      { id: "social_media", label: "Social media", value: "social_media" },
      { id: "contact_form", label: "Contact form", value: "contact_form" },
      { id: "newsletter", label: "Newsletter", value: "newsletter" },
    ],
  },
];

// ── Business Website ($799) ──

const businessQuestions: QuestionField[] = [
  {
    id: "pages_count",
    type: "select",
    label: "How many pages do you need?",
    options: [
      { id: "2-4", label: "2-4", value: "2-4" },
      { id: "5-10", label: "5-10", value: "5-10" },
      { id: "more", label: "More", value: "more" },
    ],
  },
  {
    id: "required_pages",
    type: "checkbox",
    label: "Pages needed",
    multiple: true,
    options: [
      { id: "homepage_page", label: "Home", value: "homepage_page" },
      { id: "about_page", label: "About", value: "about_page" },
      { id: "services_page", label: "Services", value: "services_page" },
      { id: "blog_page", label: "Blog", value: "blog_page" },
      { id: "portfolio_page", label: "Portfolio", value: "portfolio_page" },
      { id: "team_page", label: "Team", value: "team_page" },
      { id: "career_page", label: "Career", value: "career_page" },
      { id: "contact_page", label: "Contact", value: "contact_page" },
    ],
  },
  {
    id: "needs_cms",
    type: "radio",
    label: "CMS needed?",
    description: "Do you want to manage website content yourself?",
    options: [
      { id: "cms_yes", label: "Yes", value: "yes" },
      { id: "cms_no", label: "No", value: "no" },
    ],
  },
  {
    id: "content_to_manage",
    type: "checkbox",
    label: "Content management",
    multiple: true,
    options: [
      { id: "manage_text", label: "Text", value: "manage_text" },
      { id: "manage_images", label: "Images", value: "manage_images" },
      { id: "manage_products", label: "Products", value: "manage_products" },
      { id: "manage_news", label: "News", value: "manage_news" },
      { id: "manage_users", label: "Users", value: "manage_users" },
    ],
  },
  {
    id: "required_integrations_business",
    type: "checkbox",
    label: "Integrations",
    multiple: true,
    options: [
      { id: "crm_int", label: "CRM", value: "crm_int" },
      { id: "telegram_bot", label: "Telegram Bot", value: "telegram_bot" },
      { id: "email_system", label: "Email system", value: "email_system" },
      { id: "other_api", label: "Other API", value: "other_api" },
    ],
  },
  {
    id: "tech_spec",
    type: "textarea",
    label: "Technical brief",
    placeholder: "Describe your technical requirements...",
  },
];

// ── Online Store ($999) ──

const onlineStoreQuestions: QuestionField[] = [
  {
    id: "product_count",
    type: "select",
    label: "Approximately how many products?",
    options: [
      { id: "1-20", label: "1-20", value: "1-20" },
      { id: "20-100", label: "20-100", value: "20-100" },
      { id: "100-500", label: "100-500", value: "100-500" },
      { id: "500+", label: "500+", value: "500+" },
    ],
  },
  {
    id: "category_count",
    type: "input",
    label: "Number of categories",
    placeholder: "e.g. 5",
  },
  {
    id: "product_info_ready",
    type: "radio",
    label: "Product information",
    options: [
      { id: "prod_ready", label: "Ready", value: "ready" },
      { id: "prod_partial", label: "Partial", value: "partial" },
      { id: "prod_no", label: "No", value: "no" },
    ],
  },
  {
    id: "order_receiving",
    type: "checkbox",
    label: "How should orders be received?",
    multiple: true,
    options: [
      { id: "online_checkout", label: "Online order", value: "online_checkout" },
      { id: "phone_order", label: "Phone", value: "phone_order" },
      { id: "whatsapp_order", label: "WhatsApp", value: "whatsapp_order" },
      { id: "messenger_order", label: "Messenger", value: "messenger_order" },
    ],
  },
  {
    id: "needs_online_payments",
    type: "radio",
    label: "Do you need online payments?",
    options: [
      { id: "pay_yes", label: "Yes", value: "yes" },
      { id: "pay_no", label: "No", value: "no" },
    ],
  },
  {
    id: "payment_methods",
    type: "checkbox",
    label: "Payment methods",
    multiple: true,
    options: [
      { id: "bank_card", label: "Bank card", value: "bank_card" },
      { id: "paypal", label: "PayPal", value: "paypal" },
      { id: "other_payment", label: "Other", value: "other_payment" },
    ],
    condition: { field: "needs_online_payments", value: "yes" },
  },
  {
    id: "delivery_method",
    type: "checkbox",
    label: "Delivery",
    multiple: true,
    options: [
      { id: "courier_delivery", label: "Courier", value: "courier_delivery" },
      { id: "postal_delivery", label: "Post", value: "postal_delivery" },
      { id: "pickup_delivery", label: "Pickup", value: "pickup_delivery" },
      { id: "other_delivery", label: "Other", value: "other_delivery" },
    ],
  },
  {
    id: "additional_features",
    type: "checkbox",
    label: "Additional Features",
    multiple: true,
    options: [
      { id: "feat_user_accounts", label: "User accounts", value: "feat_user_accounts" },
      { id: "feat_wishlist", label: "Wishlist", value: "feat_wishlist" },
      { id: "feat_reviews", label: "Reviews", value: "feat_reviews" },
      { id: "feat_coupons", label: "Coupons", value: "feat_coupons" },
      { id: "feat_inventory", label: "Inventory management", value: "feat_inventory" },
    ],
  },
];

// ── Custom Website ──

const customWebsiteQuestions: QuestionField[] = [
  {
    id: "project_description",
    type: "textarea",
    label: "What type of project do you want to build?",
    placeholder: "Describe your project idea...",
  },
  {
    id: "required_features",
    type: "checkbox",
    label: "Needed features",
    multiple: true,
    options: [
      { id: "feat_auth", label: "Authentication", value: "feat_auth" },
      { id: "feat_ai", label: "AI features", value: "feat_ai" },
      { id: "feat_crm", label: "CRM", value: "feat_crm" },
      { id: "feat_booking", label: "Booking", value: "feat_booking" },
      { id: "feat_subscriptions", label: "Subscriptions", value: "feat_subscriptions" },
      { id: "feat_payments", label: "Payments", value: "feat_payments" },
      { id: "feat_api", label: "API integrations", value: "feat_api" },
      { id: "feat_other", label: "Other", value: "feat_other" },
    ],
  },
  {
    id: "expected_users",
    type: "input",
    label: "Expected users",
    placeholder: "e.g. 1000",
  },
  {
    id: "has_tech_docs",
    type: "radio",
    label: "Technical specification",
    options: [
      { id: "tech_yes", label: "Yes", value: "yes" },
      { id: "tech_no", label: "No", value: "no" },
    ],
  },
  {
    id: "estimated_budget",
    type: "select",
    label: "Estimated Budget",
    options: [
      { id: "budget_1000_3000", label: "1000-3000 GEL", value: "1000-3000" },
      { id: "budget_3000_7000", label: "3000-7000 GEL", value: "3000-7000" },
      { id: "budget_7000plus", label: "7000+ GEL", value: "7000+" },
      { id: "budget_unsure", label: "Not sure", value: "unsure" },
    ],
  },
];

// ── Website Maintenance ($99/month) ──

const maintenanceQuestions: QuestionField[] = [
  {
    id: "existing_website_url",
    type: "url",
    label: "Current website URL",
    placeholder: "https://yourwebsite.com",
  },
  {
    id: "current_platform",
    type: "select",
    label: "Platform",
    options: [
      { id: "wp", label: "WordPress", value: "wordpress" },
      { id: "nextjs", label: "Next.js", value: "nextjs" },
      { id: "shopify", label: "Shopify", value: "shopify" },
      { id: "other_platform", label: "Other", value: "other" },
    ],
  },
  {
    id: "required_support",
    type: "checkbox",
    label: "Needed support",
    multiple: true,
    options: [
      { id: "support_updates", label: "Updates", value: "support_updates" },
      { id: "support_security", label: "Security", value: "support_security" },
      { id: "support_changes", label: "Changes", value: "support_changes" },
      { id: "support_performance", label: "Performance", value: "support_performance" },
      { id: "support_seo", label: "SEO", value: "support_seo" },
    ],
  },
];

// ── Social Media Management ──

const socialMediaQuestions: QuestionField[] = [
  {
    id: "platforms",
    type: "checkbox",
    label: "Platforms",
    multiple: true,
    options: [
      { id: "sm_facebook", label: "Facebook", value: "sm_facebook" },
      { id: "sm_instagram", label: "Instagram", value: "sm_instagram" },
      { id: "sm_tiktok", label: "TikTok", value: "sm_tiktok" },
      { id: "sm_linkedin", label: "LinkedIn", value: "sm_linkedin" },
    ],
  },
  {
    id: "existing_pages",
    type: "textarea",
    label: "Existing social media pages (URLs)",
    placeholder: "Paste links to your existing pages...",
  },
  {
    id: "target_audience",
    type: "textarea",
    label: "Target audience",
    placeholder: "e.g. Women 18-35 from Tbilisi",
  },
  {
    id: "main_goal",
    type: "checkbox",
    label: "Main goal",
    multiple: true,
    options: [
      { id: "goal_sales", label: "Increase sales", value: "goal_sales" },
      { id: "goal_awareness", label: "Brand awareness", value: "goal_awareness" },
      { id: "goal_customers", label: "New customers", value: "goal_customers" },
      { id: "goal_brand", label: "Brand building", value: "goal_brand" },
    ],
  },
];

// ── Service questions map ──
// NOTE: These keys are the canonical service IDs used by the questionnaire system.
// Pricing package IDs are mapped to these keys via PACKAGE_TO_QUESTIONNAIRE in services-client.tsx.

export const serviceQuestionsMap: Record<string, ServiceQuestions> = {
  "website-landing": {
    serviceId: "website-landing",
    serviceName: "Landing Starter",
    questions: landingStarterQuestions,
  },
  "website-one-page": {
    serviceId: "website-one-page",
    serviceName: "One Page Website",
    questions: onePageQuestions,
  },
  "website-business": {
    serviceId: "website-business",
    serviceName: "Business Website",
    questions: businessQuestions,
  },
  "online-store": {
    serviceId: "online-store",
    serviceName: "Online Store",
    questions: onlineStoreQuestions,
  },
  "custom-website": {
    serviceId: "custom-website",
    serviceName: "Custom Website",
    questions: customWebsiteQuestions,
  },
  "website-maintenance": {
    serviceId: "website-maintenance",
    serviceName: "Website Maintenance",
    questions: maintenanceQuestions,
  },
  "social-media": {
    serviceId: "social-media",
    serviceName: "Social Media Management",
    questions: socialMediaQuestions,
  },
};
