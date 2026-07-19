import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TranslationProvider } from "@/components/providers/locale-provider";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import {
  PublicPageTransition,
  PublicSiteEffects,
} from "@/components/layout/public-site-effects";
import {
  inter,
  spaceGrotesk,
  bpgNinoMtavruli,
  bpgGlaho,
} from "@/lib/fonts";
import { getServerLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/get-dictionary";
import { getSiteConfigServer } from "@/lib/cms-server";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const siteUrl = getSiteUrl();
  const title =
    locale === "ka"
      ? "BTA LAB | ციფრული ინოვაციების ლაბორატორია"
      : "BTA LAB | Digital Innovation Lab";
  const description =
    locale === "ka"
      ? "ციფრული ინოვაციების ლაბორატორია, სადაც სტუდენტები ქმნიან რეალურ ვებგვერდებს, ბრენდინგს, მარკეტინგულ კამპანიებსა და პროგრამულ გადაწყვეტილებებს."
      : "A digital innovation lab where students collaborate to build real-world digital products, websites, branding, and software solutions.";

  return {
    title: {
      default: title,
      template: "%s | BTA LAB",
    },
    description,
    keywords: [
      "BTA LAB",
      "digital innovation",
      "web development",
      "UI/UX design",
      "branding",
      "student agency",
      "ციფრული ინოვაცია",
    ],
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: "BTA LAB",
      locale: locale === "ka" ? "ka_GE" : "en_US",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read locale on the server from cookie
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  const siteConfig = await getSiteConfigServer(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${bpgNinoMtavruli.variable} ${bpgGlaho.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <TranslationProvider locale={locale} dict={dict}>
            <Navigation siteConfig={siteConfig} />
            <main className="relative min-h-screen">
              <PublicPageTransition>{children}</PublicPageTransition>
            </main>
            <Footer siteConfig={siteConfig} />
            <PublicSiteEffects />
            <CookieConsent />
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
