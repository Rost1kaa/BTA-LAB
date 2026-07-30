"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, FileText, Users, Gift, Bell, Mail, Phone, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import { useTranslation } from "@/lib/use-dictionary";

const NEXT_STEPS = [
  {
    icon: FileText,
    title_ka: "განაცხადის პირველადი შეფასება",
    title_en: "Initial Application Review",
    desc_ka: "ბითიეი ლაბის შეფასების ჯგუფი განიხილავს თქვენს განაცხადს.",
    desc_en: "BTA LAB's evaluation team will review your application.",
  },
  {
    icon: Mail,
    title_ka: "დამატებითი ინფორმაციის მოთხოვნა",
    title_en: "Additional Information Request",
    desc_ka: "საჭიროების შემთხვევაში, დაგიკავშირდებით დამატებითი ინფორმაციისთვის.",
    desc_en: "If needed, we will contact you for additional information.",
  },
  {
    icon: Users,
    title_ka: "გასაუბრებაზე მოწვევა",
    title_en: "Interview Invitation",
    desc_ka: "შერჩეულ კანდიდატებს დავუნიშნავთ 25–30 წუთიან გასაუბრებას.",
    desc_en: "Selected candidates will be invited to a 25–30 minute interview.",
  },
  {
    icon: Gift,
    title_ka: "ტექნიკური და ფინანსური შეთავაზება",
    title_en: "Technical & Financial Offer",
    desc_ka: "წარმოგიდგენთ პროექტის სრულ შეფასებასა და დაფინანსების შეთავაზებას.",
    desc_en: "We will present a full project evaluation and funding offer.",
  },
  {
    icon: Bell,
    title_ka: "საბოლოო შედეგის შეტყობინება",
    title_en: "Final Result Notification",
    desc_ka: "მიგიღებთ შეტყობინებას საბოლოო გადაწყვეტილების შესახებ.",
    desc_en: "You will be notified of the final decision.",
  },
];

export default function ThankYouContent() {
  const searchParams = useSearchParams();
  const appId = searchParams.get("appId") || "";
  const { locale } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} className="text-green-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-fg-primary)] mb-4">
                {locale === "ka"
                  ? "განაცხადი წარმატებით გაიგზავნა"
                  : "Application Submitted Successfully"}
              </h1>
              <p className="text-lg text-[var(--color-fg-tertiary)] max-w-xl mx-auto">
                {locale === "ka"
                  ? "თქვენი განაცხადი მიღებულია და გადაეცა შეფასების ჯგუფს."
                  : "Your application has been received and forwarded to the evaluation team."}
              </p>
            </div>

            {/* Application Number Card */}
            {appId && (
              <div className="p-8 rounded-3xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] text-center mb-10">
                <p className="text-sm text-[var(--color-fg-tertiary)] mb-2">
                  {locale === "ka" ? "განაცხადის ნომერი" : "Application Number"}
                </p>
                <p className="text-3xl font-bold font-mono text-[var(--color-accent)] tracking-wider">
                  {appId}
                </p>
                <p className="text-xs text-[var(--color-fg-tertiary)] mt-2">
                  {locale === "ka"
                    ? "შეინახეთ ეს ნომერი თქვენი განაცხადის სტატუსის თვალყურის დევნებისთვის."
                    : "Keep this number to track your application status."}
                </p>
              </div>
            )}

            {/* Next Steps */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-[var(--color-fg-primary)] mb-6">
                {locale === "ka" ? "შემდეგი ნაბიჯები" : "Next Steps"}
              </h2>
              <div className="space-y-4">
                {NEXT_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-5 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)]"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                      <step.icon size={18} className="text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-[var(--color-overlay)] flex items-center justify-center text-xs font-bold text-[var(--color-fg-secondary)]">
                          {i + 1}
                        </span>
                        <h3 className="font-semibold text-[var(--color-fg-primary)]">
                          {locale === "ka" ? step.title_ka : step.title_en}
                        </h3>
                      </div>
                      <p className="text-sm text-[var(--color-fg-tertiary)] ml-8">
                        {locale === "ka" ? step.desc_ka : step.desc_en}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Track Status & Contact */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              {appId && (
                <Link href={`/entrepreneur-support/status/${appId}`}>
                  <Button variant="primary" className="gap-2 w-full sm:w-auto">
                    <ExternalLink size={16} />
                    {locale === "ka" ? "განაცხადის სტატუსის ნახვა" : "View Application Status"}
                  </Button>
                </Link>
              )}
              <Link href="/entrepreneur-support">
                <Button variant="secondary" className="gap-2 w-full sm:w-auto">
                  <ArrowRight size={16} />
                  {locale === "ka" ? "კამპანიის გვერდზე დაბრუნება" : "Back to Campaign"}
                </Button>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="p-6 rounded-2xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)]">
              <h3 className="font-semibold text-[var(--color-fg-primary)] mb-3">
                {locale === "ka" ? "გაქვთ შეკითხვა?" : "Have a question?"}
              </h3>
              <p className="text-sm text-[var(--color-fg-tertiary)] mb-4">
                {locale === "ka"
                  ? "თუ გაქვთ დამატებითი შეკითხვები, გთხოვთ, დაგვიკავშირდეთ:"
                  : "If you have additional questions, please contact us:"}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <a href="mailto:lab@bta.edu.ge" className="flex items-center gap-2 text-[var(--color-accent)] hover:underline">
                  <Mail size={14} /> lab@bta.edu.ge
                </a>
                <a href="tel:+995579009247" className="flex items-center gap-2 text-[var(--color-accent)] hover:underline">
                  <Phone size={14} /> +995 32 299 99 99
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </div>
  );
}
