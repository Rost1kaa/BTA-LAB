export interface QuizOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
  hasInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputType?: "text" | "url" | "date" | "color";
}

export interface QuizStep {
  id: number;
  optional?: boolean;
  multiple?: boolean;
  allowCustomInput?: boolean;
  customInputLabel?: string;
  customInputPlaceholder?: string;
}

export interface QuizTranslations {
  title: string;
  subtitle: string;
  steps: Record<number, {
    question: string;
    description?: string;
    options: QuizOption[];
    optional?: boolean;
    multiple?: boolean;
    allowCustomInput?: boolean;
    customInputLabel?: string;
    customInputPlaceholder?: string;
  }>;
  summary: {
    title: string;
    edit: string;
    submit: string;
  };
  success: {
    title: string;
    message: string;
    button: string;
  };
  controls: {
    back: string;
    continue: string;
    skip: string;
    step: string;
    of: string;
    required: string;
    close: string;
    confirmCloseTitle: string;
    confirmCloseMessage: string;
    confirmCloseYes: string;
    confirmCloseNo: string;
  };
}

export const quizContent: QuizTranslations = {
  title: "Plan Your Project",
  subtitle: "Answer a few questions and we'll prepare a tailored proposal for your project.",
  steps: {
    1: {
      question: "What type of website do you need?",
      options: [
        { id: "landing", label: "Landing Page", value: "landing" },
        { id: "one-page", label: "One Page Website", value: "one-page" },
        { id: "business", label: "Business Website", value: "business" },
        { id: "ecommerce", label: "Online Store", value: "ecommerce" },
        { id: "portfolio", label: "Portfolio", value: "portfolio" },
        { id: "blog", label: "Blog or News Site", value: "blog" },
        { id: "booking", label: "Booking System", value: "booking" },
        { id: "learning", label: "Learning Platform", value: "learning" },
        { id: "custom-web", label: "Custom Web Platform", value: "custom-web" },
        { id: "unsure", label: "I'm Not Sure Yet", value: "unsure" },
      ],
    },
    2: {
      question: "Do you already have a website?",
      options: [
        { id: "update", label: "Yes, I want to update my existing site", value: "update" },
        { id: "new", label: "Yes, but I want to create a new one", value: "new" },
        { id: "none", label: "No, I don't have a website yet", value: "none" },
      ],
    },
    3: {
      question: "Approximately how many pages do you need?",
      description: "Select the approximate number of pages",
      multiple: true,
      options: [
        { id: "1", label: "1 page", value: "1" },
        { id: "2-4", label: "2–4 pages", value: "2-4" },
        { id: "5-10", label: "5–10 pages", value: "5-10" },
        { id: "10+", label: "More than 10", value: "10+" },
        { id: "unknown", label: "Not sure yet", value: "unknown" },
      ],
      allowCustomInput: true,
      customInputLabel: "Required pages",
      customInputPlaceholder: "Specify required pages...",
    },
    4: {
      question: "What features do you need?",
      multiple: true,
      options: [
        { id: "cms", label: "Admin Panel (CMS)", value: "cms" },
        { id: "auth", label: "User Authentication", value: "auth" },
        { id: "payments", label: "Online Payments", value: "payments" },
        { id: "catalog", label: "Product Catalog", value: "catalog" },
        { id: "cart", label: "Cart & Orders", value: "cart" },
        { id: "booking", label: "Online Booking", value: "booking" },
        { id: "multilingual", label: "Multilingual System", value: "multilingual" },
        { id: "search", label: "Search & Filters", value: "search" },
        { id: "contact-form", label: "Contact Form", value: "contact-form" },
        { id: "maps", label: "Google Maps", value: "maps" },
        { id: "analytics", label: "Google Analytics", value: "analytics" },
        { id: "email", label: "Business Email", value: "email" },
        { id: "crm", label: "CRM Integration", value: "crm" },
        { id: "api", label: "API Integration", value: "api" },
        { id: "ai", label: "AI Integration", value: "ai" },
        { id: "subscription", label: "Subscription System", value: "subscription" },
        { id: "chat", label: "Live Chat", value: "chat" },
        { id: "blog", label: "Blog", value: "blog" },
      ],
      allowCustomInput: true,
      customInputLabel: "Other features",
      customInputPlaceholder: "Specify other required features...",
    },
    5: {
      question: "What design style do you prefer?",
      multiple: true,
      options: [
        { id: "minimal", label: "Minimalist", value: "minimal" },
        { id: "modern", label: "Modern", value: "modern" },
        { id: "elegant", label: "Elegant", value: "elegant" },
        { id: "corporate", label: "Corporate", value: "corporate" },
        { id: "creative", label: "Creative", value: "creative" },
        { id: "premium", label: "Premium", value: "premium" },
        { id: "dark", label: "Dark Design", value: "dark" },
        { id: "light", label: "Light Design", value: "light" },
        { id: "colorful", label: "Colorful Design", value: "colorful" },
        { id: "advise", label: "Not Sure — Advise Me", value: "advise" },
      ],
    },
    6: {
      question: "Do you have brand materials?",
      multiple: true,
      optional: true,
      options: [
        { id: "logo", label: "Logo", value: "logo" },
        { id: "colors", label: "Brand Colors", value: "colors" },
        { id: "fonts", label: "Fonts", value: "fonts" },
        { id: "guidelines", label: "Brand Guidelines", value: "guidelines" },
        { id: "photos", label: "Photos", value: "photos" },
        { id: "videos", label: "Videos", value: "videos" },
        { id: "texts", label: "Text Content", value: "texts" },
        { id: "none", label: "Nothing Yet", value: "none" },
      ],
    },
    7: {
      question: "Is your website content ready?",
      options: [
        { id: "ready", label: "Everything is ready", value: "ready" },
        { id: "partial", label: "I have some materials ready", value: "partial" },
        { id: "text-help", label: "I need help with text content", value: "text-help" },
        { id: "visual-help", label: "I need help with photos and visuals", value: "visual-help" },
        { id: "full", label: "BTA LAB should prepare everything", value: "full" },
      ],
    },
    8: {
      question: "How many languages should the website support?",
      options: [
        { id: "en-only", label: "English only", value: "en-only" },
        { id: "en-ge", label: "English and Georgian", value: "en-ge" },
        { id: "3plus", label: "Three or more languages", value: "3plus" },
        { id: "unknown", label: "Not sure yet", value: "unknown" },
      ],
      allowCustomInput: true,
      customInputLabel: "Desired languages",
      customInputPlaceholder: "Specify languages...",
    },
    9: {
      question: "What is your budget for the project?",
      options: [
        { id: "500", label: "Under $500", value: "500" },
        { id: "1000", label: "$500 – $1,000", value: "1000" },
        { id: "2000", label: "$1,000 – $2,000", value: "2000" },
        { id: "5000", label: "$2,000 – $5,000", value: "5000" },
        { id: "5000+", label: "Over $5,000", value: "5000+" },
        { id: "unsure", label: "Not determined yet", value: "unsure" },
      ],
    },
    10: {
      question: "When would you like the project completed?",
      options: [
        { id: "urgent", label: "As soon as possible", value: "urgent" },
        { id: "1-2w", label: "In 1–2 weeks", value: "1-2w" },
        { id: "2-4w", label: "In 2–4 weeks", value: "2-4w" },
        { id: "1-2m", label: "In 1–2 months", value: "1-2m" },
        { id: "specific", label: "I have a specific deadline", value: "specific", hasInput: true, inputLabel: "Target date", inputPlaceholder: "Select date", inputType: "date" },
        { id: "undecided", label: "No deadline set", value: "undecided" },
      ],
    },
  },
  summary: {
    title: "Review Your Project Information",
    edit: "Edit",
    submit: "Submit Request",
  },
  success: {
    title: "Your Request Has Been Received",
    message: "Thank you for your interest. The BTA LAB team will review your requirements and contact you within 24 hours.",
    button: "Back to Home",
  },
  controls: {
    back: "Back",
    continue: "Continue",
    skip: "Skip",
    step: "Step",
    of: "of",
    required: "Required",
    close: "Close",
    confirmCloseTitle: "Are you sure you want to leave?",
    confirmCloseMessage: "Your answers will be lost.",
    confirmCloseYes: "Yes, Leave",
    confirmCloseNo: "Continue",
  },
};
