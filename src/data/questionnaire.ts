/**
 * ვებსაიტის დაგეგმვის კითხვარი — One-Time Questionnaire (source of truth).
 *
 * This file reproduces the uploaded reference file EXACTLY 1:1:
 * same questions, same answer options, same wording, same punctuation,
 * same numbering, same order. Do not edit the content strings.
 *
 * Field values are stored as:
 *   single   → string (selected option id)
 *   multiple → string[] (selected option ids)
 *   text     → string
 *   option text input → `${fieldId}__${optionId}` → string
 */

export interface QuestionnaireOption {
  id: string;
  label: string;
  /** Parenthetical explanation shown under the option label. */
  hint?: string;
  /** When set, selecting this option reveals a text input with this label. */
  textFieldLabel?: string;
  textFieldPlaceholder?: string;
}

export type QuestionnaireItem =
  | {
      kind: "question";
      id: string;
      type: "single" | "multiple";
      label: string;
      description?: string;
      options: QuestionnaireOption[];
      /** Show this question only when another field (in the same step) has one of these option ids selected. */
      showWhen?: { fieldId: string; optionIds: string[] };
    }
  | {
      kind: "text";
      id: string;
      label: string;
      description?: string;
      placeholder?: string;
      multiline?: boolean;
      /** Show this text field only when another field has one of these option ids selected. */
      showWhen?: { fieldId: string; optionIds: string[] };
    }
  | {
      kind: "info";
      title?: string;
      paragraphs: string[];
      bullets?: string[];
    }
  | {
      kind: "note";
      text: string;
    };

export interface QuestionnaireStep {
  id: number;
  title: string;
  estimatedTime: string;
  items: QuestionnaireItem[];
}

export interface QuestionnaireCompletion {
  title: string;
  heading: string;
  paragraphs: string[];
  nextStepsTitle: string;
  nextSteps: string[];
  submit: string;
}

export interface QuestionnaireContent {
  title: string;
  subtitle: string;
  introParagraphs: string[];
  startButton: string;
  steps: QuestionnaireStep[];
  completion: QuestionnaireCompletion;
  success: {
    title: string;
    message: string;
  };
  usedLinkTitle: string;
  usedLinkMessage: string;
  invalidLinkTitle: string;
  invalidLinkMessage: string;
  controls: {
    back: string;
    continue: string;
    estimatedTimeLabel: string;
    stepLabel: string;
    ofLabel: string;
    percentCompleted: string;
    submitting: string;
    required: string;
  };
}

export const questionnaireContent: QuestionnaireContent = {
  title: "ვებსაიტის დაგეგმვის კითხვარი",
  subtitle: "შექმენით თქვენი მომავალი ვებსაიტის იდეა რამდენიმე მარტივი ნაბიჯით",
  introParagraphs: [
    "ვებსაიტის შექმნისას მნიშვნელოვანია სწორად განვსაზღვროთ თქვენი მიზნები, მომხმარებლის საჭიროებები და ბიზნესის მიმართულება.",
    "უპასუხეთ რამდენიმე მარტივ კითხვას, რათა უკეთ გავიგოთ თქვენი საქმიანობა და შემოგთავაზოთ თქვენზე მორგებული ვებსაიტის გადაწყვეტა.",
  ],
  startButton: "დაწყება →",
  steps: [
    {
      id: 1,
      title: "ნაბიჯი 1 — თქვენი ბიზნესის მიზანი და ვებსაიტის დანიშნულება",
      estimatedTime: "დაახლოებით 1-2 წუთი",
      items: [
        {
          kind: "info",
          title: "რას ემსახურება თქვენი მომავალი ვებსაიტი?",
          paragraphs: [
            "ვებსაიტი შეიძლება იყოს თქვენი ბიზნესის ონლაინ წარმომადგენლობა, გაყიდვების ინსტრუმენტი ან მომხმარებლებთან კომუნიკაციის საშუალება.",
          ],
        },
        {
          kind: "question",
          id: "goal",
          type: "multiple",
          label: "რა არის თქვენი მთავარი მიზანი?",
          description: "(აირჩიეთ ერთი ან რამდენიმე)",
          options: [
            { id: "present-business", label: "ჩემი ბიზნესის/საქმიანობის წარდგენა" },
            { id: "attract-customers", label: "ახალი მომხმარებლების მოზიდვა" },
            { id: "promote-services", label: "მომსახურებების ან პროდუქტების პოპულარიზაცია" },
            { id: "online-sales", label: "ონლაინ გაყიდვების განხორციელება" },
            { id: "easy-communication", label: "მომხმარებლებთან მარტივი კომუნიკაცია" },
            { id: "brand-awareness", label: "ბრენდის ცნობადობის გაზრდა" },
            { id: "other-goal", label: "სხვა მიზანი" },
          ],
        },
        {
          kind: "text",
          id: "expectation",
          label: "მოგვიყევით მოკლედ, რას ელით ვებსაიტისგან:",
          multiline: true,
        },
        {
          kind: "question",
          id: "site-type",
          type: "single",
          label: "რა ტიპის ვებსაიტი გჭირდებათ?",
          description:
            "დაგვეხმარეთ გავიგოთ, რომელი მიმართულება შეესაბამება თქვენს საქმიანობას.",
          options: [
            {
              id: "company-site",
              label: "კომპანიის ოფიციალური ვებსაიტი",
              hint: "(სერვისების, გუნდისა და საქმიანობის წარდგენა)",
            },
            {
              id: "online-store",
              label: "ონლაინ მაღაზია",
              hint: "(ნაწარმის გაყიდვა და შეკვეთების მიღება)",
            },
            {
              id: "service-site",
              label: "მომსახურების ვებსაიტი",
              hint: "(მაგალითად: სამშენებლო, ტექნიკური, საკონსულტაციო მომსახურება)",
            },
            { id: "hotel", label: "სასტუმრო / ჰოსტელი / ტურისტული მიმართულება" },
            { id: "restaurant", label: "რესტორანი /  კაფე" },
            { id: "educational", label: "საგანმანათლებლო პლატფორმა" },
            {
              id: "portfolio",
              label: "ნამუშევრები (პორტფოლიო)",
              hint: "(ნამუშევრებისა და გამოცდილების ჩვენება)",
            },
            { id: "personal-blog", label: "პერსონალური ვებსაიტი / ბლოგი" },
            {
              id: "other",
              label: "სხვა",
              textFieldLabel: "[მიუთითეთ თქვენი მიმართულება]",
            },
          ],
        },
      ],
    },
    {
      id: 2,
      title: "ნაბიჯი 2 — რა შესაძლებლობები უნდა ჰქონდეს თქვენს ვებსაიტს?",
      estimatedTime: "დაახლოებით 1-2 წუთი",
      items: [
        {
          kind: "question",
          id: "capabilities",
          type: "multiple",
          label: "რისი გაკეთება უნდა შეეძლოთ მომხმარებლებს ვებსაიტზე?",
          description: "აირჩიეთ ფუნქციები, რომლებიც თქვენთვის მნიშვნელოვანია:",
          options: [
            {
              id: "contact",
              label: "მარტივად დაგიკავშირდნენ",
              hint: "(საკონტაქტო ფორმა, ტელეფონი, ელფოსტა)",
            },
            { id: "view-services", label: "ნახონ თქვენი მომსახურებები ან ნაწარმი" },
            { id: "price-estimate", label: "მიიღონ ფასის წინასწარი შეფასება", hint: "(კალკულატორი)" },
            { id: "book-visit", label: "დაჯავშნონ მომსახურება ან ვიზიტი" },
            { id: "buy-online", label: "შეიძინონ ნაწარმი ონლაინ" },
            { id: "pay-online", label: "გადაიხადონ ონლაინ" },
            { id: "personal-account", label: "შექმნან პირადი ანგარიში" },
            { id: "search-filter", label: "მოძებნონ და გაფილტრონ ინფორმაცია" },
            { id: "news-notifications", label: "მიიღონ შეტყობინებები სიახლეებზე" },
            { id: "other-feature", label: "სხვა ფუნქცია" },
          ],
        },
        {
          kind: "info",
          title: "გჭირდებათ თუ არა დამატებითი სისტემების დაკავშირება?",
          paragraphs: [
            "ზოგიერთ ბიზნესს სჭირდება დამატებითი ტექნოლოგიური გადაწყვეტილებები.",
          ],
        },
        {
          kind: "question",
          id: "integrations",
          type: "multiple",
          label: "გსურთ თუ არა შემდეგი შესაძლებლობები?",
          options: [
            {
              id: "bank-payments",
              label: "საბანკო გადახდები",
              hint: "(Visa / Mastercard / ადგილობრივი ბანკების გადახდის სისტემები)",
            },
            { id: "chat", label: "ონლაინ საუბარი (ჩატი) მომხმარებლებთან კომუნიკაციისთვის" },
            { id: "sms-email", label: "SMS ან ელფოსტით შეტყობინებები" },
            { id: "crm", label: "მომხმარებლების მართვის სისტემა (CRM)" },
            {
              id: "other-integration",
              label: "სხვა ინტეგრაცია",
              textFieldLabel: "თუ გაქვთ კონკრეტული მოთხოვნა, მოგვწერეთ:",
              textFieldPlaceholder: "",
            },
          ],
        },
        {
          kind: "info",
          paragraphs: [
            "რა არის CRM? ციფრული ბაზა, რომელიც აერთიანებს და აკონტროლებს კლიენტებთან დაკავშირებულ ყველა ინფორმაციას, შეკვეთასა და კომუნიკაციის ისტორიას ერთ სივრცეში.",
          ],
          title: "რატომ დაგჭირდებათ?",
          bullets: [
            "არცერთი კლიენტი არ იკარგება: ყველა პოტენციური მყიდველი მკაცრად კონტროლდება.",
            "დროის დაზოგვა: თანამშრომლებს აღარ უწევთ ინფორმაციის ძებნა ბლოკნოტებში, „ექსელის“ ფაილებში ან სხვადასხვა ჩატში.",
            "უკეთესი სერვისი: კლიენტი გრძნობს, რომ მას იცნობენ და მის საჭიროებებს ინდივიდუალურად უდგებიან.",
          ],
        },
      ],
    },
    {
      id: 3,
      title: "ნაბიჯი 3 — ვებსაიტის გვერდები და შინაარსი",
      estimatedTime: "დაახლოებით 1-2 წუთი",
      items: [
        {
          kind: "question",
          id: "pages",
          type: "multiple",
          label: "რა ინფორმაცია უნდა იყოს წარმოდგენილი თქვენს ვებსაიტზე?",
          description: "აირჩიეთ თქვენთვის საჭირო გვერდები:",
          options: [
            { id: "home", label: "მთავარი გვერდი", hint: "(პირველი შთაბეჭდილება მომხმარებლისთვის)" },
            { id: "about", label: "ჩვენს შესახებ", hint: "(კომპანიის ისტორია, გუნდი, გამოცდილება)" },
            { id: "services", label: "მომსახურებები (სერვისები)", hint: "(რას სთავაზობთ მომხმარებლებს)" },
            { id: "products", label: "ნაწარმი (პროდუქცია)", hint: "(ნაწარმის კატალოგი)" },
            { id: "works", label: "ნამუშევრები (პორტფოლიო)", hint: "(შესრულებული პროექტები)" },
            { id: "news", label: "სიახლეები (ბლოგი)" },
            { id: "faq", label: "ხშირად დასმული კითხვები (FAQ)" },
            { id: "contact", label: "კონტაქტი", hint: "(მისამართი, ტელეფონი, ფორმა)" },
            { id: "legal", label: "კონფიდენციალურობის პოლიტიკა და სამართლებრივი გვერდები" },
            { id: "other-page", label: "სხვა გვერდი" },
          ],
        },
        {
          kind: "text",
          id: "pages-notes",
          label: "გაქვთ კონკრეტული მოთხოვნა გვერდების ან შინაარსის შესახებ?",
          description:
            "მაგალითად:\nგანსაკუთრებული დიზაინი კონკრეტული გვერდისთვის;\nკონკრეტული ინფორმაციის განთავსება;\nმომხმარებლისთვის მნიშვნელოვანი ფუნქცია.",
          multiline: true,
        },
      ],
    },
    {
      id: 4,
      title: "ნაბიჯი 4 — ენობრივი მხარდაჭერა",
      estimatedTime: "დაახლოებით 1-2 წუთი",
      items: [
        {
          kind: "info",
          title: "რომელ ენებზე გსურთ იყოს თქვენი ვებსაიტი?",
          paragraphs: [
            "ვებსაიტის ენა მნიშვნელოვანია, რათა მომხმარებლებმა მარტივად მიიღონ ინფორმაცია და კომფორტულად გამოიყენონ თქვენი მომსახურება.",
          ],
        },
        {
          kind: "question",
          id: "languages",
          type: "multiple",
          label: "აირჩიეთ სასურველი ენები:",
          options: [
            { id: "ka", label: "ქართული" },
            { id: "en", label: "ინგლისური" },
            { id: "other", label: "სხვა", textFieldLabel: "[მიუთითეთ სხვა ენა]" },
          ],
        },
        {
          kind: "question",
          id: "audience",
          type: "single",
          label: "ვისზე არის ძირითადად გათვლილი თქვენი ვებსაიტი?",
          options: [
            { id: "local", label: "მხოლოდ ადგილობრივ მომხმარებლებზე" },
            { id: "international", label: "საერთაშორისო მომხმარებლებზე" },
            { id: "both", label: "ორივე მიმართულებაზე" },
          ],
        },
      ],
    },
    {
      id: 5,
      title: "ნაბიჯი 5 — გარეგნული მხარე (დიზაინი) და ვიზუალური სტილი",
      estimatedTime: "დაახლოებით 1-2 წუთი",
      items: [
        {
          kind: "info",
          title: "როგორი შთაბეჭდილება გსურთ დატოვოს თქვენსმა ვებსაიტმა?",
          paragraphs: [
            "დიზაინი ეხმარება მომხმარებელს სწორად აღიქვას თქვენი ბრენდი და მომსახურება.",
          ],
        },
        {
          kind: "question",
          id: "design-style",
          type: "single",
          label: "რომელი ვიზუალური მიმართულება მოგწონთ?",
          options: [
            {
              id: "modern-minimal",
              label: "თანამედროვე და მინიმალისტური",
              hint: "(სუფთა დიზაინი, მარტივი სტრუქტურა)",
            },
            {
              id: "corporate",
              label: "ოფიციალური და კორპორატიული",
              hint: "(სანდო და პროფესიონალური სტილი)",
            },
            {
              id: "creative",
              label: "კრეატიული და განსხვავებული",
              hint: "(გამორჩეული ვიზუალური ელემენტები)",
            },
            {
              id: "premium",
              label: "პრემიუმ / მაღალი ხარისხის სტილი",
              hint: "(ელეგანტური და დახვეწილი დიზაინი)",
            },
            { id: "recommendation", label: "არ მაქვს კონკრეტული მიმართულება — მჭირდება რეკომენდაცია" },
          ],
        },
        {
          kind: "question",
          id: "brand-materials",
          type: "multiple",
          label: "გაქვთ უკვე მომზადებული ბრენდის მასალები?",
          description: "თუ გაქვთ, შეგიძლიათ მოგვაწოდოთ:",
          options: [
            { id: "logo", label: "ლოგო" },
            { id: "brandbook", label: "ბრენდბუქი" },
            { id: "palette", label: "ფერთა პალიტრა" },
            { id: "fonts", label: "სასურველი შრიფტები" },
            { id: "design-examples", label: "დიზაინის მაგალითები" },
            { id: "other-material", label: "სხვა მასალა" },
          ],
        },
        {
          kind: "text",
          id: "design-example",
          label: "გაქვთ ვებსაიტის მაგალითი, რომლის სტილიც მოგწონთ?",
          description: "შეგიძლიათ მოგვაწოდოთ მსგავსი ვებსაიტის ბმული ან აღწეროთ, რა მოგწონთ მასში.",
          placeholder: "ბმული / ტექსტური ველი",
        },
        {
          kind: "text",
          id: "design-requests",
          label: "დამატებითი მოთხოვნები დიზაინთან დაკავშირებით:",
          description:
            "მაგალითად:\nკონკრეტული ფერები;\nგანსაკუთრებული ანიმაციები;\nკონკრეტული გვერდის განსხვავებული დიზაინი.",
          multiline: true,
        },
        {
          kind: "note",
          text: "შენიშვნა: თქვენი ვებსაიტი შეიქმნება ყველა მოწყობილობაზე სრულად ადაპტირებული ფორმით — მობილურ ტელეფონებზე, პლანშეტებსა და კომპიუტერებზე.",
        },
      ],
    },
    {
      id: 6,
      title: "ნაბიჯი 6 — ტექნოლოგიური გადაწყვეტა",
      estimatedTime: "დაახლოებით 1-2 წუთი",
      items: [
        {
          kind: "info",
          title: "როგორ შეირჩევა ვებსაიტის ტექნოლოგია?",
          paragraphs: [
            "თითოეული პროექტი განსხვავებულია. ჩვენ ვარჩევთ შესაბამის ტექნოლოგიურ გადაწყვეტას თქვენი ბიზნესის მიზნებისა და საჭიროებების მიხედვით.",
          ],
        },
        {
          kind: "question",
          id: "tech-type",
          type: "single",
          label: "რა ტიპის ვებსაიტის შექმნა გსურთ?",
          options: [
            {
              id: "simple-visit",
              label: "მარტივი სავიზიტო ვებსაიტი",
              hint: "(კომპანიის, მომსახურების ან ბრენდის წარდგენა)",
            },
            {
              id: "functional",
              label: "ფუნქციური ვებსაიტი დამატებითი შესაძლებლობებით",
              hint: "(რეგისტრაცია/ავტორიზაცია, მომხმარებლების დამატება/მართვა, აპლიკაციების მიერთება  და სხვა)",
            },
            { id: "ecommerce", label: "ონლაინ მაღაზია", hint: "(ნაწარმი, კალათა, გადახდები)" },
            {
              id: "complex-system",
              label: "რთული ინდივიდუალური სისტემა",
              hint: "(სპეციფიკური ბიზნეს პროცესები და ავტომატიზაცია)",
            },
            { id: "tech-recommendation", label: "არ ვიცი — მსურს ტექნიკური რეკომენდაცია" },
          ],
        },
        {
          kind: "info",
          title: "ტექნოლოგიის შერჩევა",
          paragraphs: [
            "ჩვენ ვმუშაობთ სხვადასხვა თანამედროვე ტექნოლოგიასთან, მათ შორის:",
            "Next.js — მაღალი წარმადობისა და სწრაფი ვებსაიტებისთვის, რომელიც კარგად მუშაობს საძიებო სისტემებთან (SEO). რა არის SEO? ეს არის ვებსაიტის ტექნიკური და შინაარსობრივი გამართვა ისე, რომ ის Google-ისთვის უფრო „მიმზიდველი“ და გასაგები გახდეს. მარტივად რომ ვთქვათ — ეს ზრდის შანსს, რომ პოტენციურმა კლიენტმა თქვენი პროდუქტი ან სერვისი Google-ში ძებნისას ადვილად გიპოვოთ",
            "Laravel — გამოიყენება უფრო რთული სისტემებისთვის, სადაც საჭიროა უსაფრთხოება, მონაცემების მართვა და ბიზნეს პროცესების ავტომატიზაცია.",
          ],
        },
        {
          kind: "question",
          id: "platform",
          type: "multiple",
          label: "ასევე შესაძლებელია:",
          options: [
            { id: "wordpress", label: "WordPress / WooCommerce" },
            { id: "shopify", label: "Shopify" },
            { id: "webflow", label: "Webflow" },
            { id: "other-platform", label: "სხვა" },
          ],
        },
        {
          kind: "text",
          id: "tech-requirements",
          label: "გაქვთ რაიმე კონკრეტული ტექნიკური მოთხოვნა?",
          description:
            "მაგალითად:\nუკვე არსებული პლატფორმის გაგრძელება;\nკონკრეტული სისტემის გამოყენება;\nსხვა ტექნიკური მოთხოვნა.",
          multiline: true,
        },
      ],
    },
    {
      id: 7,
      title: "ნაბიჯი 7 — ვებსაიტის მართვა და ადმინისტრირება",
      estimatedTime: "დაახლოებით 1-2 წუთი",
      items: [
        {
          kind: "info",
          title: "ვინ განაახლებს თქვენს ვებსაიტს?",
          paragraphs: [
            "ვებსაიტის დასრულების შემდეგ შესაძლოა დაგჭირდეთ ტექსტების, ფოტოების, პროდუქტების ან სხვა ინფორმაციის განახლება.",
          ],
        },
        {
          kind: "question",
          id: "management",
          type: "single",
          label: "როგორ გეგმავთ ვებსაიტის მართვას?",
          options: [
            { id: "self", label: "მინდა თავად ვმართო ვებსაიტი." },
            { id: "team", label: "მინდა, რომ თქვენი გუნდი მართავდეს და ანახლებდეს." },
            { id: "undecided", label: "ჯერ არ გადამიწყვეტია — მსურს რეკომენდაცია." },
          ],
        },
        {
          kind: "info",
          title: "რა ნიშნავს ვებსაიტის ადმინისტრირება?",
          paragraphs: [
            "ადმინისტრირება ნიშნავს ვებსაიტზე არსებული ინფორმაციისა და შიგთავსის მართვას.",
            "ადმინისტრაციული სისტემის საშუალებით შეგიძლიათ:",
          ],
          bullets: [
            "ტექსტების შეცვლა;",
            "ფოტოების დამატება ან წაშლა;",
            "პროდუქტებისა და მომსახურებების განახლება;",
            "ახალი გვერდების ან ჩანაწერების შექმნა;",
            "ვებსაიტზე არსებული ინფორმაციის მარტივად რედაქტირება.",
          ],
        },
        {
          kind: "question",
          id: "self-manage-tasks",
          type: "multiple",
          label: "თუ თავად აპირებთ ვებსაიტის მართვას, რისი გაკეთება გსურთ?",
          showWhen: { fieldId: "management", optionIds: ["self"] },
          options: [
            { id: "edit-texts", label: "ტექსტების ჩასწორება/შეცვლა" },
            { id: "edit-photos", label: "ფოტოების დამატება ან შეცვლა" },
            { id: "update-products", label: "ნაწარმის განახლება" },
            { id: "update-services", label: "მომსახურებების შეცვლა/დამატება" },
            { id: "add-blog", label: "ბლოგის ან სიახლეების დამატება" },
            { id: "create-pages", label: "ახალი გვერდების შექმნა" },
            { id: "other", label: "სხვა" },
          ],
        },
        {
          kind: "text",
          id: "admin-notes",
          label: "დამატებითი ინფორმაცია",
          description:
            "თუ გაქვთ რაიმე განსაკუთრებული მოთხოვნა ადმინისტრაციულ სისტემასთან დაკავშირებით, მოგვწერეთ:",
          multiline: true,
        },
      ],
    },
    {
      id: 8,
      title: "ნაბიჯი 8 — Google-ში გამოჩენა (SEO) და ვებსაიტის განვითარება",
      estimatedTime: "დაახლოებით 1-2 წუთი",
      items: [
        {
          kind: "info",
          title: "გსურთ, რომ თქვენი ვებსაიტი Google-ში მარტივად მოიძებნებოდეს?",
          paragraphs: [
            "SEO (Search Engine Optimization) ეხმარება ვებსაიტს, რომ Google-სა და სხვა საძიებო სისტემებში უკეთ გამოჩნდეს და პოტენციურმა მომხმარებლებმა უფრო მარტივად იპოვონ თქვენი ბიზნესი.",
          ],
        },
        {
          kind: "info",
          title: "რა მოიცავს SEO?",
          paragraphs: ["SEO შეიძლება მოიცავდეს:"],
          bullets: [
            "ვებსაიტის ტექნიკური გამართვის შემოწმებას;",
            "Google Search Console-ისა და Google Analytics-ის გამართვას;",
            "გვერდების სტრუქტურის გაუმჯობესებას;",
            "სათაურებისა და აღწერების ოპტიმიზაციას;",
            "ვებსაიტის სიჩქარისა და მუშაობის გაუმჯობესებას;",
            "რეკომენდაციებს, რომლებიც ხელს შეუწყობს Google-ში უკეთ გამოჩენას.",
          ],
        },
        {
          kind: "question",
          id: "seo-plan",
          type: "single",
          label: "როგორ გეგმავთ SEO-ზე მუშაობას?",
          options: [
            { id: "team", label: "მსურს, რომ SEO მომსახურება თქვენმა გუნდმა უზრუნველყოს." },
            { id: "self", label: "SEO-ზე თავად ვიმუშავებ." },
            { id: "not-needed", label: "ამ ეტაპზე არ მჭირდება." },
            { id: "recommendation", label: "არ ვიცი, მჭირდება თუ არა — მსურს რეკომენდაცია." },
          ],
        },
        {
          kind: "question",
          id: "future-plans",
          type: "multiple",
          label: "გეგმავთ თუ არა მომავალში ვებსაიტის განვითარებას?",
          options: [
            { id: "add-pages", label: "ახალი გვერდების დამატებას" },
            { id: "add-features", label: "ახალი ფუნქციების დამატებას" },
            { id: "add-store", label: "ონლაინ მაღაზიის დამატებას" },
            { id: "add-languages", label: "მრავალენოვანი ვერსიის დამატებას" },
            { id: "add-services", label: "ახალი სერვისების ან პროდუქტების დამატებას" },
            { id: "develop-blog", label: "ბლოგის ან სიახლეების განვითარებას" },
            { id: "other", label: "სხვა" },
            { id: "not-sure", label: "ამ ეტაპზე არ ვიცი" },
          ],
        },
        {
          kind: "question",
          id: "google-services",
          type: "multiple",
          label: "გეგმავთ თუ არა Google-ის დამატებითი სერვისების გამოყენებას?",
          options: [
            { id: "maps", label: "Google Maps-ის ინტეგრაცია" },
            { id: "analytics", label: "Google Analytics (სტატისტიკის ნახვა)" },
            { id: "search-console", label: "Google Search Console (Google-ში ვებსაიტის მუშაობის მონიტორინგი)" },
            { id: "recommendation", label: "არ ვიცი — მსურს რეკომენდაცია" },
          ],
        },
      ],
    },
    {
      id: 9,
      title: "ნაბიჯი 9 — ვებსაიტის ტექნიკური მხარდაჭერა და უსაფრთხოება",
      estimatedTime: "დაახლოებით 1-2 წუთი",
      items: [
        {
          kind: "info",
          title: "როგორ გსურთ ვებსაიტის მხარდაჭერა გაშვების შემდეგ?",
          paragraphs: [
            "ვებსაიტის შექმნის შემდეგ მნიშვნელოვანია, რომ ის უსაფრთხოდ და გამართულად მუშაობდეს. დროთა განმავლობაში შეიძლება საჭირო გახდეს განახლებები, ტექნიკური ცვლილებები ან ახალი ფუნქციების დამატება.",
          ],
        },
        {
          kind: "question",
          id: "support",
          type: "single",
          label: "როგორ გეგმავთ ვებსაიტის ტექნიკურ მხარდაჭერას?",
          options: [
            { id: "team", label: "მსურს, რომ ტექნიკურ მხარდაჭერას თქვენი გუნდი უზრუნველყოფდეს." },
            { id: "self", label: "ტექნიკურ მხარდაჭერას თავად ან ჩემი გუნდი განახორციელებს." },
            { id: "undecided", label: "ჯერ არ გადამიწყვეტია — მსურს რეკომენდაცია." },
          ],
        },
        {
          kind: "info",
          title: "რა მოიცავს ტექნიკური მხარდაჭერა?",
          paragraphs: ["ტექნიკური მხარდაჭერა შეიძლება მოიცავდეს:"],
          bullets: [
            "ვებსაიტზე წარმოშობილი ტექნიკური პრობლემების მოგვარებას;",
            "სისტემისა და გამოყენებული ტექნოლოგიების განახლებას;",
            "უსაფრთხოების მონიტორინგსა და კონტროლს;",
            "სარეზერვო ასლების (Backup) შექმნასა და აღდგენას;",
            "ტექსტების, ფოტოებისა და სხვა ინფორმაციის მცირე ცვლილებებს;",
            "საჭიროების შემთხვევაში ახალი ფუნქციებისა და გვერდების დამატებას.",
          ],
        },
        {
          kind: "question",
          id: "support-types",
          type: "multiple",
          label: "რა ტიპის მხარდაჭერა შეიძლება დაგჭირდეთ?",
          options: [
            { id: "fixing", label: "მხოლოდ ტექნიკური პრობლემების მოგვარება" },
            { id: "security", label: "უსაფრთხოების კონტროლი" },
            { id: "updates", label: "სისტემის რეგულარული განახლებები" },
            { id: "backups", label: "სარეზერვო ასლების (Backup) მართვა" },
            { id: "content-updates", label: "შიგთავსის პერიოდული განახლება" },
            { id: "new-features", label: "ახალი ფუნქციების დამატება" },
            { id: "consulting", label: "საჭიროების შემთხვევაში კონსულტაცია" },
            { id: "recommendation", label: "არ ვიცი — მსურს რეკომენდაცია" },
          ],
        },
        {
          kind: "text",
          id: "support-notes",
          label: "დამატებითი ინფორმაცია",
          description:
            "თუ გაქვთ განსაკუთრებული მოთხოვნა ტექნიკურ მხარდაჭერასთან დაკავშირებით, მოგვწერეთ:",
          multiline: true,
        },
      ],
    },
    {
      id: 10,
      title: "ნაბიჯი 10 — საწყისი მასალები",
      estimatedTime: "დაახლოებით 1-2 წუთი",
      items: [
        {
          kind: "info",
          title: "უკვე გაქვთ ვებსაიტისთვის საჭირო მასალები?",
          paragraphs: [
            "თუ უკვე გაქვთ გარკვეული მასალები, შეგიძლიათ მოგვაწოდოთ. ეს დაგვეხმარება პროექტის უფრო სწრაფად დაწყებასა და თქვენი ბრენდის უკეთ წარმოჩენაში.",
          ],
        },
        {
          kind: "question",
          id: "materials",
          type: "multiple",
          label: "აირჩიეთ, რა გაქვთ უკვე მომზადებული:",
          options: [
            { id: "logo", label: "ლოგო" },
            { id: "texts", label: "ტექსტები" },
            { id: "photos", label: "ფოტოები" },
            { id: "videos", label: "ვიდეომასალა" },
            { id: "brandbook", label: "ბრენდბუქი" },
            { id: "palette", label: "ფერთა პალიტრა" },
            { id: "fonts", label: "შრიფტები" },
            { id: "existing-site", label: "არსებული ვებსაიტის მასალები" },
            { id: "other", label: "სხვა" },
          ],
        },
        {
          kind: "info",
          title: "არ გაქვთ საჭირო მასალები?",
          paragraphs: [
            "თუ ზოგიერთი ან ყველა მასალა ჯერ არ გაქვთ, არ არის პრობლემა.",
            "ჩვენი გუნდი საჭიროების შემთხვევაში დაგეხმარებათ:",
          ],
          bullets: [
            "ლოგოს შექმნაში ან განახლებაში;",
            "ტექსტების მომზადებაში;",
            "ფოტოების ან გრაფიკული მასალების შერჩევაში;",
            "ბრენდის ვიზუალური სტილის ჩამოყალიბებაში;",
            "ვებსაიტისთვის საჭირო სხვა მასალების მომზადებაში.",
          ],
        },
        {
          kind: "question",
          id: "help",
          type: "multiple",
          label: "რაში გჭირდებათ ჩვენი დახმარება?",
          options: [
            { id: "logo-design", label: "ლოგოს დიზაინი" },
            { id: "texts-prep", label: "ტექსტების მომზადება" },
            { id: "photos-select", label: "ფოტოების შერჩევა" },
            { id: "graphic-design", label: "გრაფიკული დიზაინი" },
            { id: "branding", label: "ბრენდინგი / ბრენდბუქი" },
            { id: "video-prep", label: "ვიდეომასალის მომზადება" },
            { id: "other", label: "სხვა" },
            { id: "no-help", label: "დახმარება არ მჭირდება" },
          ],
        },
        {
          kind: "text",
          id: "materials-notes",
          label: "დამატებითი ინფორმაცია",
          description:
            "თუ უკვე გაქვთ მასალები ან გსურთ მოგვაწოდოთ დამატებითი ინფორმაცია, მოგვწერეთ:",
          multiline: true,
        },
      ],
    },
    {
      id: 11,
      title: "ნაბიჯი 11 — დომენი და ჰოსტინგი",
      estimatedTime: "დაახლოებით 1-2 წუთი",
      items: [
        {
          kind: "info",
          title: "ვებსაიტის გასაშვებად საჭიროა დომენი და ჰოსტინგი",
          paragraphs: [
            "თქვენი ვებსაიტის ინტერნეტში გასაშვებად აუცილებელია ორი ძირითადი კომპონენტი — დომენი და ჰოსტინგი.",
            "რა არის დომენი?",
            "დომენი არის თქვენი ვებსაიტის მისამართი ინტერნეტში, რომლის საშუალებითაც მომხმარებლები პოულობენ თქვენს ვებსაიტს.",
            "მაგალითი:",
            "www.misamarti.ge",
            "დომენის შერჩევისას სასურველია, რომ ის იყოს:",
          ],
          bullets: [
            "მარტივად დასამახსოვრებელი;",
            "თქვენი ბრენდის ან საქმიანობის შესაბამისი;",
            "ადვილად დასაწერი.",
          ],
        },
        {
          kind: "info",
          paragraphs: [
            "რა არის ჰოსტინგი?",
            "ჰოსტინგი არის სერვისი, სადაც ინახება თქვენი ვებსაიტის ფაილები, მონაცემები და სხვა საჭირო ინფორმაცია, რათა ვებსაიტი მუდმივად ხელმისაწვდომი იყოს ინტერნეტში.",
            "ჰოსტინგის არჩევა დამოკიდებულია ვებსაიტის ტიპზე, მნახველების რაოდენობასა და საჭირო ფუნქციებზე.",
          ],
        },
        {
          kind: "question",
          id: "has-domain",
          type: "single",
          label: "უკვე გაქვთ დომენი?",
          options: [
            { id: "yes", label: "დიახ" },
            { id: "no", label: "არა" },
            { id: "dont-know", label: "არ ვიცი" },
          ],
        },
        {
          kind: "text",
          id: "domain-name",
          label: "თუ დიახ, მიუთითეთ დომენის მისამართი:",
          placeholder: "ტექსტური ველი",
          showWhen: { fieldId: "has-domain", optionIds: ["yes"] },
        },
        {
          kind: "question",
          id: "has-hosting",
          type: "single",
          label: "უკვე გაქვთ ჰოსტინგი?",
          options: [
            { id: "yes", label: "დიახ" },
            { id: "no", label: "არა" },
            { id: "dont-know", label: "არ ვიცი" },
          ],
        },
        {
          kind: "text",
          id: "hosting-company",
          label: "თუ დიახ, შეგიძლიათ მიუთითოთ ჰოსტინგის კომპანია:",
          placeholder: "ტექსტური ველი",
          showWhen: { fieldId: "has-hosting", optionIds: ["yes"] },
        },
        {
          kind: "question",
          id: "domain-help",
          type: "multiple",
          label: "გსურთ თუ არა ჩვენი დახმარება?",
          options: [
            { id: "domain-select", label: "დომენის შერჩევაში" },
            { id: "domain-register", label: "დომენის რეგისტრაციაში" },
            { id: "hosting-select", label: "ჰოსტინგის შერჩევაში" },
            { id: "hosting-buy", label: "ჰოსტინგის შეძენაში" },
            { id: "full-setup", label: "დომენისა და ჰოსტინგის სრულად გამართვაში" },
            { id: "no-help", label: "დახმარება არ მჭირდება" },
          ],
        },
        {
          kind: "question",
          id: "domain-owner",
          type: "single",
          label: "ვის სახელზე უნდა დარეგისტრირდეს დომენი?",
          options: [
            { id: "me", label: "ჩემს სახელზე" },
            { id: "company", label: "ჩემი კომპანიის სახელზე" },
            { id: "undecided", label: "ჯერ არ გადამიწყვეტია" },
          ],
        },
        {
          kind: "info",
          title: "რატომ არის ეს მნიშვნელოვანი?",
          paragraphs: [
            "დომენი წარმოადგენს თქვენი ვებსაიტის საკუთრებას, ამიტომ მნიშვნელოვანია თავიდანვე განისაზღვროს, ვის სახელზე დარეგისტრირდება ის. ეს მომავალში თავიდან აგარიდებთ არასასურველ გაუგებრობებს და უზრუნველყოფს, რომ დომენის მფლობელი სწორედ თქვენ ან თქვენი კომპანია იყოთ.",
          ],
        },
        {
          kind: "question",
          id: "renewals",
          type: "single",
          label: "ვინ იქნება პასუხისმგებელი ყოველწლიურ განახლებებზე?",
          options: [
            { id: "me", label: "მე" },
            { id: "company", label: "ჩემი კომპანია" },
            { id: "team", label: "მსურს, რომ თქვენი გუნდი მართავდეს" },
            { id: "dont-know", label: "ჯერ არ ვიცი" },
          ],
        },
        {
          kind: "text",
          id: "domain-notes",
          label: "დამატებითი ინფორმაცია",
          description:
            "თუ გაქვთ განსაკუთრებული მოთხოვნა დომენთან, ჰოსტინგთან ან სერვერის განთავსებასთან დაკავშირებით, მოგვწერეთ:",
          multiline: true,
        },
      ],
    },
  ],
  completion: {
    title: "კითხვარის დასრულება",
    heading: "მადლობა!",
    paragraphs: [
      "თქვენი პასუხები დაგვეხმარება, უკეთ გავიგოთ თქვენი ბიზნესის მიზნები, საჭიროებები და მოლოდინები.",
      "მიღებული ინფორმაციის საფუძველზე შევაფასებთ პროექტს და შემოგთავაზებთ თქვენს მოთხოვნებზე მორგებულ ტექნიკურ და დიზაინერულ გადაწყვეტას.",
    ],
    nextStepsTitle: "შემდეგი ნაბიჯები:",
    nextSteps: [
      "ჩვენი გუნდი გაეცნობა თქვენს პასუხებს.",
      "საჭიროების შემთხვევაში დაგიკავშირდებით დამატებითი დეტალების დასაზუსტებლად.",
      "მოგაწვდით პროექტის წინადადებას, სამუშაო გეგმასა და შესაბამის კომერციულ შეთავაზებას.",
    ],
    submit: "კითხვარის გაგზავნა",
  },
  success: {
    title: "კითხვარი გაგზავნილია",
    message:
      "თქვენი პასუხები მიღებულია. მადლობა! ჩვენი გუნდი გაეცნობა თქვენს პასუხებს და მალე დაგიკავშირდებათ.",
  },
  usedLinkTitle: "ეს ბმული უკვე გამოყენებულია.",
  usedLinkMessage:
    "კითხვარი უკვე შევსებულია ამ ბმულით. თუ გსურთ მისი ხელახლა გაგზავნა, გთხოვთ, დაგვიკავშირდეთ.",
  invalidLinkTitle: "ბმული არასწორია.",
  invalidLinkMessage:
    "ეს ბმული არ არსებობს ან აღარ მოქმედებს. გთხოვთ, დაგვიკავშირდეთ და მოგაწვდით ახალ ბმულს.",
  controls: {
    back: "უკან",
    continue: "შემდეგი",
    estimatedTimeLabel: "დაახლოებით 1-2 წუთი",
    stepLabel: "ნაბიჯი",
    ofLabel: "/",
    percentCompleted: "დასრულებულია",
    submitting: "იგზავნება...",
    required: "აუცილებელია",
  },
};

/** Total number of steps in the questionnaire. */
export const QUESTIONNAIRE_TOTAL_STEPS = questionnaireContent.steps.length;

/** Collect all fields (questions + text inputs) for validation/summary purposes. */
export function getQuestionnaireFields() {
  const fields: Array<{ id: string; type: "single" | "multiple" | "text"; options?: QuestionnaireOption[] }> = [];
  for (const step of questionnaireContent.steps) {
    for (const item of step.items) {
      if (item.kind === "question") {
        fields.push({ id: item.id, type: item.type, options: item.options });
      } else if (item.kind === "text") {
        fields.push({ id: item.id, type: "text" });
      }
    }
  }
  return fields;
}

/** Resolve the option label for a given field id + option id (admin answer viewer). */
export function getOptionLabel(fieldId: string, optionId: string): string | null {
  for (const step of questionnaireContent.steps) {
    for (const item of step.items) {
      if (item.kind === "question" && item.id === fieldId) {
        const option = item.options.find((o) => o.id === optionId);
        return option ? option.label : null;
      }
    }
  }
  return null;
}

/** Resolve the question/text label for a field id (admin answer viewer). */
export function getFieldLabel(fieldId: string): string | null {
  for (const step of questionnaireContent.steps) {
    for (const item of step.items) {
      if ((item.kind === "question" || item.kind === "text") && item.id === fieldId) {
        return item.label;
      }
    }
  }
  return null;
}
