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
  validation: {
    nameRequired: string;
    contactRequired: string;
    submitFailed: string;
    unknownError: string;
  };
  submitting: string;
  stepDetails: {
    currentWebsiteLabel: string;
    currentWebsitePlaceholder: string;
    colorsLabel: string;
    pickColor: string;
    examplesLabel: string;
    examplesPlaceholder: string;
  };
  contactFields: {
    name: string;
    namePlaceholder: string;
    company: string;
    companyPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    preferredContact: string;
    preferredContactPlaceholder: string;
    additionalInfo: string;
    additionalInfoPlaceholder: string;
  };
  contactOptions: string[];
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
  validation: {
    nameRequired: "Name is required",
    contactRequired: "Email or phone is required",
    submitFailed: "Submission failed",
    unknownError: "An error occurred",
  },
  submitting: "Submitting...",
  stepDetails: {
    currentWebsiteLabel: "Current website URL (optional)",
    currentWebsitePlaceholder: "https://example.com",
    colorsLabel: "What colors would you like on your website?",
    pickColor: "Pick a color",
    examplesLabel: "Provide example websites you like (optional)",
    examplesPlaceholder: "https://example.com, https://another-example.com",
  },
  contactFields: {
    name: "Full Name *",
    namePlaceholder: "Your name",
    company: "Company Name",
    companyPlaceholder: "Company name",
    phone: "Phone Number",
    phonePlaceholder: "+1 (555) 000-0000",
    email: "Email *",
    emailPlaceholder: "your@email.com",
    preferredContact: "Preferred Contact Method",
    preferredContactPlaceholder: "Select",
    additionalInfo: "Additional Information",
    additionalInfoPlaceholder: "Any additional information...",
  },
  contactOptions: ["Phone", "Email", "Facebook", "Instagram", "WhatsApp"],
};

export const quizContentByLocale: Record<"ka" | "en", QuizTranslations> = {
  en: quizContent,
  ka: {
    title: "დაგეგმეთ თქვენი პროექტი",
    subtitle: "უპასუხეთ რამდენიმე კითხვას და მოვამზადებთ თქვენს პროექტზე მორგებულ შეთავაზებას.",
    steps: {
      1: {
        question: "რა ტიპის ვებსაიტი გჭირდებათ?",
        options: [
          { id: "landing", label: "ლენდინგ გვერდი", value: "landing" },
          { id: "one-page", label: "ერთგვერდიანი ვებსაიტი", value: "one-page" },
          { id: "business", label: "ბიზნეს ვებსაიტი", value: "business" },
          { id: "ecommerce", label: "ონლაინ მაღაზია", value: "ecommerce" },
          { id: "portfolio", label: "პორტფოლიო", value: "portfolio" },
          { id: "blog", label: "ბლოგი ან საინფორმაციო საიტი", value: "blog" },
          { id: "booking", label: "ჯავშნის სისტემა", value: "booking" },
          { id: "learning", label: "სასწავლო პლატფორმა", value: "learning" },
          { id: "custom-web", label: "ინდივიდუალური ვებ პლატფორმა", value: "custom-web" },
          { id: "unsure", label: "ჯერ არ ვარ დარწმუნებული", value: "unsure" },
        ],
      },
      2: {
        question: "უკვე გაქვთ ვებსაიტი?",
        options: [
          { id: "update", label: "დიახ, არსებული საიტის განახლება მინდა", value: "update" },
          { id: "new", label: "დიახ, მაგრამ ახლის შექმნა მინდა", value: "new" },
          { id: "none", label: "არა, ჯერ ვებსაიტი არ მაქვს", value: "none" },
        ],
      },
      3: {
        question: "დაახლოებით რამდენი გვერდი გჭირდებათ?",
        description: "აირჩიეთ გვერდების სავარაუდო რაოდენობა",
        multiple: true,
        options: [
          { id: "1", label: "1 გვერდი", value: "1" },
          { id: "2-4", label: "2-4 გვერდი", value: "2-4" },
          { id: "5-10", label: "5-10 გვერდი", value: "5-10" },
          { id: "10+", label: "10-ზე მეტი", value: "10+" },
          { id: "unknown", label: "ჯერ არ ვიცი", value: "unknown" },
        ],
        allowCustomInput: true,
        customInputLabel: "საჭირო გვერდები",
        customInputPlaceholder: "მიუთითეთ საჭირო გვერდები...",
      },
      4: {
        question: "რა ფუნქციები გჭირდებათ?",
        multiple: true,
        options: [
          { id: "cms", label: "ადმინ პანელი (CMS)", value: "cms" },
          { id: "auth", label: "მომხმარებლის ავტორიზაცია", value: "auth" },
          { id: "payments", label: "ონლაინ გადახდები", value: "payments" },
          { id: "catalog", label: "პროდუქტების კატალოგი", value: "catalog" },
          { id: "cart", label: "კალათა და შეკვეთები", value: "cart" },
          { id: "booking", label: "ონლაინ ჯავშანი", value: "booking" },
          { id: "multilingual", label: "მრავალენოვანი სისტემა", value: "multilingual" },
          { id: "search", label: "ძიება და ფილტრები", value: "search" },
          { id: "contact-form", label: "საკონტაქტო ფორმა", value: "contact-form" },
          { id: "maps", label: "Google Maps", value: "maps" },
          { id: "analytics", label: "Google Analytics", value: "analytics" },
          { id: "email", label: "ბიზნეს ელფოსტა", value: "email" },
          { id: "crm", label: "CRM ინტეგრაცია", value: "crm" },
          { id: "api", label: "API ინტეგრაცია", value: "api" },
          { id: "ai", label: "AI ინტეგრაცია", value: "ai" },
          { id: "subscription", label: "გამოწერის სისტემა", value: "subscription" },
          { id: "chat", label: "ცოცხალი ჩატი", value: "chat" },
          { id: "blog", label: "ბლოგი", value: "blog" },
        ],
        allowCustomInput: true,
        customInputLabel: "სხვა ფუნქციები",
        customInputPlaceholder: "მიუთითეთ სხვა საჭირო ფუნქციები...",
      },
      5: {
        question: "რა დიზაინის სტილს ანიჭებთ უპირატესობას?",
        multiple: true,
        options: [
          { id: "minimal", label: "მინიმალისტური", value: "minimal" },
          { id: "modern", label: "თანამედროვე", value: "modern" },
          { id: "elegant", label: "ელეგანტური", value: "elegant" },
          { id: "corporate", label: "კორპორატიული", value: "corporate" },
          { id: "creative", label: "კრეატიული", value: "creative" },
          { id: "premium", label: "პრემიუმ", value: "premium" },
          { id: "dark", label: "მუქი დიზაინი", value: "dark" },
          { id: "light", label: "ღია დიზაინი", value: "light" },
          { id: "colorful", label: "ფერადი დიზაინი", value: "colorful" },
          { id: "advise", label: "არ ვარ დარწმუნებული - მირჩიეთ", value: "advise" },
        ],
      },
      6: {
        question: "გაქვთ ბრენდის მასალები?",
        multiple: true,
        optional: true,
        options: [
          { id: "logo", label: "ლოგო", value: "logo" },
          { id: "colors", label: "ბრენდის ფერები", value: "colors" },
          { id: "fonts", label: "ფონტები", value: "fonts" },
          { id: "guidelines", label: "ბრენდის სახელმძღვანელო", value: "guidelines" },
          { id: "photos", label: "ფოტოები", value: "photos" },
          { id: "videos", label: "ვიდეოები", value: "videos" },
          { id: "texts", label: "ტექსტური კონტენტი", value: "texts" },
          { id: "none", label: "ჯერ არაფერი", value: "none" },
        ],
      },
      7: {
        question: "ვებსაიტის კონტენტი მზად გაქვთ?",
        options: [
          { id: "ready", label: "ყველაფერი მზად არის", value: "ready" },
          { id: "partial", label: "მასალების ნაწილი მზად მაქვს", value: "partial" },
          { id: "text-help", label: "ტექსტურ კონტენტში დახმარება მჭირდება", value: "text-help" },
          { id: "visual-help", label: "ფოტოებსა და ვიზუალებში დახმარება მჭირდება", value: "visual-help" },
          { id: "full", label: "BTA LAB-მა ყველაფერი უნდა მოამზადოს", value: "full" },
        ],
      },
      8: {
        question: "რამდენ ენას უნდა უჭერდეს მხარს ვებსაიტი?",
        options: [
          { id: "en-only", label: "მხოლოდ ინგლისური", value: "en-only" },
          { id: "en-ge", label: "ქართული და ინგლისური", value: "en-ge" },
          { id: "3plus", label: "სამი ან მეტი ენა", value: "3plus" },
          { id: "unknown", label: "ჯერ არ ვიცი", value: "unknown" },
        ],
        allowCustomInput: true,
        customInputLabel: "სასურველი ენები",
        customInputPlaceholder: "მიუთითეთ ენები...",
      },
      9: {
        question: "რა ბიუჯეტი გაქვთ პროექტისთვის?",
        options: [
          { id: "500", label: "500$-მდე", value: "500" },
          { id: "1000", label: "500$ - 1,000$", value: "1000" },
          { id: "2000", label: "1,000$ - 2,000$", value: "2000" },
          { id: "5000", label: "2,000$ - 5,000$", value: "5000" },
          { id: "5000+", label: "5,000$-ზე მეტი", value: "5000+" },
          { id: "unsure", label: "ჯერ არ არის განსაზღვრული", value: "unsure" },
        ],
      },
      10: {
        question: "როდის გსურთ პროექტის დასრულება?",
        options: [
          { id: "urgent", label: "რაც შეიძლება მალე", value: "urgent" },
          { id: "1-2w", label: "1-2 კვირაში", value: "1-2w" },
          { id: "2-4w", label: "2-4 კვირაში", value: "2-4w" },
          { id: "1-2m", label: "1-2 თვეში", value: "1-2m" },
          { id: "specific", label: "კონკრეტული ვადა მაქვს", value: "specific", hasInput: true, inputLabel: "სამიზნე თარიღი", inputPlaceholder: "აირჩიეთ თარიღი", inputType: "date" },
          { id: "undecided", label: "ვადა ჯერ არ მაქვს", value: "undecided" },
        ],
      },
    },
    summary: {
      title: "გადაამოწმეთ პროექტის ინფორმაცია",
      edit: "რედაქტირება",
      submit: "მოთხოვნის გაგზავნა",
    },
    success: {
      title: "თქვენი მოთხოვნა მიღებულია",
      message: "გმადლობთ ინტერესისთვის. BTA LAB-ის გუნდი განიხილავს თქვენს მოთხოვნებს და 24 საათის განმავლობაში დაგიკავშირდებათ.",
      button: "მთავარზე დაბრუნება",
    },
    controls: {
      back: "უკან",
      continue: "გაგრძელება",
      skip: "გამოტოვება",
      step: "ნაბიჯი",
      of: "დან",
      required: "სავალდებულო",
      close: "დახურვა",
      confirmCloseTitle: "ნამდვილად გსურთ გასვლა?",
      confirmCloseMessage: "თქვენი პასუხები დაიკარგება.",
      confirmCloseYes: "დიახ, გასვლა",
      confirmCloseNo: "გაგრძელება",
    },
    validation: {
      nameRequired: "სახელი აუცილებელია",
      contactRequired: "ელ-ფოსტა ან ტელეფონი აუცილებელია",
      submitFailed: "გაგზავნა ვერ მოხერხდა",
      unknownError: "დაფიქსირდა შეცდომა",
    },
    submitting: "იგზავნება...",
    stepDetails: {
      currentWebsiteLabel: "არსებული ვებსაიტის მისამართი (არასავალდებულო)",
      currentWebsitePlaceholder: "https://example.com",
      colorsLabel: "რა ფერები გსურთ თქვენს ვებსაიტზე?",
      pickColor: "ფერის არჩევა",
      examplesLabel: "მიუთითეთ თქვენთვის მოსაწონი ვებსაიტების მაგალითები (არასავალდებულო)",
      examplesPlaceholder: "https://example.com, https://another-example.com",
    },
    contactFields: {
      name: "სრული სახელი *",
      namePlaceholder: "თქვენი სახელი",
      company: "კომპანიის სახელი",
      companyPlaceholder: "კომპანიის სახელი",
      phone: "ტელეფონის ნომერი",
      phonePlaceholder: "+995 555 00 00 00",
      email: "ელ-ფოსტა *",
      emailPlaceholder: "თქვენი ელ-ფოსტა",
      preferredContact: "სასურველი საკონტაქტო არხი",
      preferredContactPlaceholder: "აირჩიეთ",
      additionalInfo: "დამატებითი ინფორმაცია",
      additionalInfoPlaceholder: "ნებისმიერი დამატებითი ინფორმაცია...",
    },
    contactOptions: ["ტელეფონი", "ელ-ფოსტა", "Facebook", "Instagram", "WhatsApp"],
  },
};
