import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { FadeIn } from "@/components/animations/fade-in";
import { TextReveal } from "@/components/animations/text-reveal";
import { getServerLocale } from "@/lib/locale";
import { parseLegalSections } from "@/lib/parse-legal-sections";

export const metadata: Metadata = {
  title: "ქუქიების პოლიტიკა",
  robots: {
    index: true,
    follow: true,
  },
};

// Static fallback content in case DB is unavailable
const fallbackContent = {
  ka: {
    title: "ქუქიების პოლიტიკა",
    intro:
      "ეს გვერდი განმარტავს, როგორ იყენებს ბითიეი ლაბი ქუქიებს და ბრაუზერის მსგავს საცავებს საჯარო ვებსაიტზე.",
    sections: [
      {
        title: "აუცილებელი ქუქიები",
        body: "აუცილებელი ქუქიები ინახავს არჩეულ ენას, იცავს ადმინისტრირების სესიებს და უზრუნველყოფს საიტის ძირითად მუშაობას. მათი გამორთვა ბანერიდან შეუძლებელია.",
      },
      {
        title: "არჩევითი ქუქიები",
        body: "ანალიტიკური და მარკეტინგული ქუქიები გამორთულია, სანამ მათ მიღებას ან პარამეტრებიდან ჩართვას არ აირჩევთ.",
      },
      {
        title: "პარამეტრების შეცვლა",
        body: "საჯარო ვებსაიტის ქვედა ნაწილში გამოიყენეთ ქუქიების ღილაკი, რათა ნებისმიერ დროს გახსნათ პარამეტრები და შეცვალოთ არჩევანი.",
      },
      {
        title: "მესამე მხარეები",
        body: "ჩაშენებულმა რუკებმა და CAPTCHA პროვაიდერებმა შეიძლება დაამუშაონ ტექნიკური მონაცემები მათი ვიჯეტების ჩატვირთვისას. Production გარემოში უნდა დარჩეს მხოლოდ უსაფრთხოების კონფიგურაციაში მითითებული პროვაიდერები.",
      },
    ],
  },
  en: {
    title: "Cookie Policy",
    intro:
      "This page explains how BTA LAB uses cookies and similar browser storage on the public website.",
    sections: [
      {
        title: "Necessary Cookies",
        body: "Necessary cookies keep the selected language, protect admin sessions, and support basic site operation. They cannot be turned off from the banner.",
      },
      {
        title: "Optional Cookies",
        body: "Analytics and marketing cookies stay disabled unless you accept them or enable them in cookie preferences.",
      },
      {
        title: "Changing Preferences",
        body: "Use the Cookies button at the bottom of the public website to reopen preferences and update your choice at any time.",
      },
      {
        title: "Third Parties",
        body: "Embedded maps and CAPTCHA providers may process technical data when their widgets are loaded. Production deployment should keep only the providers listed in the security configuration.",
      },
    ],
  },
};

const getCachedCookiePolicy = unstable_cache(
  async () => {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("legal_policies")
      .select("*")
      .eq("type", "COOKIE_POLICY")
      .maybeSingle();

    return data as {
      title_ka: string;
      title_en: string;
      description_ka: string;
      description_en: string;
      content_ka: string;
      content_en: string;
    } | null;
  },
  ["legal-policy-cookie"],
  { revalidate: 30, tags: ["cms-legal"] }
);

export default async function CookiesPage() {
  const locale = await getServerLocale();
  const fallback = fallbackContent[locale];
  let dbContent;

  try {
    dbContent = await getCachedCookiePolicy();
  } catch {
    dbContent = null;
  }

  const title = dbContent
    ? (locale === "ka" ? dbContent.title_ka : dbContent.title_en) || fallback.title
    : fallback.title;

  const intro = dbContent
    ? (locale === "ka" ? dbContent.description_ka : dbContent.description_en) || fallback.intro
    : fallback.intro;

  const rawContent = dbContent
    ? (locale === "ka" ? dbContent.content_ka : dbContent.content_en)
    : "";

  const sections = rawContent
    ? parseLegalSections(rawContent, fallback.sections)
    : fallback.sections;

  return (
    <>
      <Section className="pt-32 pb-12 md:pt-40 md:pb-16">
        <Container size="md">
          <FadeIn direction="up">
            <TextReveal
              as="h1"
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-gradient"
              staggerChildren={0.02}
            >
              {title}
            </TextReveal>
          </FadeIn>
          <FadeIn direction="up" delay={0.12}>
            <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-[var(--color-fg-tertiary)]">
              {intro}
            </p>
          </FadeIn>
        </Container>
      </Section>

      <Section className="pt-0 pb-20 md:pb-28">
        <Container size="md">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <FadeIn key={section.title} direction="up" delay={index * 0.05}>
                <section className="border-t border-[var(--color-border-primary)] pt-6">
                  <h2 className="text-2xl font-semibold text-[var(--color-fg-primary)]">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-[var(--color-fg-tertiary)] whitespace-pre-wrap">
                    {section.body}
                  </p>
                </section>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
