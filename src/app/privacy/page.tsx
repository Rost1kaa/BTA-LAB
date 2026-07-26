import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { FadeIn } from "@/components/animations/fade-in";
import { TextReveal } from "@/components/animations/text-reveal";
import { getServerLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: {
    index: true,
    follow: true,
  },
};

const content = {
  en: {
    title: "Privacy Policy",
    intro:
      "BTA LAB collects only the information needed to respond to inquiries, operate the website, and protect the Admin Panel.",
    sections: [
      {
        title: "Information We Collect",
        body: "Contact form submissions may include your name, email, phone, company, project preferences, and message. Admin authentication is handled by Supabase Auth.",
      },
      {
        title: "How We Use Information",
        body: "We use submitted information to reply to requests, plan services, keep records of legitimate business communication, and prevent abuse.",
      },
      {
        title: "Security",
        body: "The site uses server-side validation, protected admin routes, Row Level Security, upload validation, security headers, and limited logging with masked personal data.",
      },
      {
        title: "Cookies",
        body: "Necessary cookies support language preference and secure sessions. Optional analytics or marketing cookies are used only after consent.",
      },
      {
        title: "Contact",
        body: "To request access, correction, or deletion of personal information, contact BTA LAB using the details on the Contact page.",
      },
    ],
  },
  ka: {
    title: "კონფიდენციალურობის პოლიტიკა",
    intro:
      "BTA LAB აგროვებს მხოლოდ იმ ინფორმაციას, რომელიც საჭიროა მოთხოვნებზე პასუხისთვის, ვებსაიტის მუშაობისთვის და ადმინისტრირების პანელის დასაცავად.",
    sections: [
      {
        title: "რა ინფორმაციას ვაგროვებთ",
        body: "საკონტაქტო ფორმა შეიძლება მოიცავდეს თქვენს სახელს, ელფოსტას, ტელეფონს, კომპანიას, პროექტის პრეფერენციებს და შეტყობინებას. ადმინისტრატორის ავტორიზაცია მუშავდება Supabase Auth-ის მეშვეობით.",
      },
      {
        title: "როგორ ვიყენებთ ინფორმაციას",
        body: "მონაცემებს ვიყენებთ მოთხოვნებზე პასუხისთვის, სერვისების დაგეგმვისთვის, საქმიანი კომუნიკაციის ჩანაწერებისთვის და ბოროტად გამოყენების თავიდან ასაცილებლად.",
      },
      {
        title: "უსაფრთხოება",
        body: "საიტს აქვს სერვერის მხარეს ვალიდაცია, დაცული ადმინისტრირების მარშრუტები, Row Level Security, ატვირთვების შემოწმება, უსაფრთხოების სათაურები და შეზღუდული ლოგირება შენიღბული პერსონალური მონაცემებით.",
      },
      {
        title: "ქუქიები",
        body: "აუცილებელი ქუქიები გამოიყენება ენის არჩევისა და უსაფრთხო სესიებისთვის. არჩევითი ანალიტიკური ან მარკეტინგული ქუქიები გამოიყენება მხოლოდ თანხმობის შემდეგ.",
      },
      {
        title: "კონტაქტი",
        body: "პერსონალურ ინფორმაციაზე წვდომის, გასწორების ან წაშლის მოთხოვნისთვის დაგვიკავშირდით კონტაქტის გვერდზე მითითებული მონაცემებით.",
      },
    ],
  },
} as const;

export default async function PrivacyPage() {
  const locale = await getServerLocale();
  const text = content[locale];

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
              {text.title}
            </TextReveal>
          </FadeIn>
          <FadeIn direction="up" delay={0.12}>
            <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-[var(--color-fg-tertiary)]">
              {text.intro}
            </p>
          </FadeIn>
        </Container>
      </Section>

      <Section className="pt-0 pb-20 md:pb-28">
        <Container size="md">
          <div className="space-y-8">
            {text.sections.map((section, index) => (
              <FadeIn key={section.title} direction="up" delay={index * 0.05}>
                <section className="border-t border-[var(--color-border-primary)] pt-6">
                  <h2 className="text-2xl font-semibold text-[var(--color-fg-primary)]">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-[var(--color-fg-tertiary)]">
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
