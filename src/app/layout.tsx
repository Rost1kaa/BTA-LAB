import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TranslationProvider } from "@/components/providers/locale-provider";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { Analytics } from "@/components/layout/analytics";
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
import "./globals.css";

const SITE_URL = "https://lab.bta.edu.ge";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BTA LAB | ბიზნესისა და ტექნოლოგიების აკადემიის საწარმო",
    template: "%s | BTA LAB",
  },
  description:
    "ბიზნესისა და ტექნოლოგიების აკადემიის ლაბორატორია — ინოვაციური ციფრული გადაწყვეტილებები, ვებ დეველოპმენტი და ტექნოლოგიური პროექტები.",
  keywords: [
    "BTA LAB",
    "digital innovation",
    "web development",
    "UI/UX design",
    "branding",
    "student agency",
    "ციფრული ინოვაცია",
  ],
  authors: [{ name: "BTA LAB", url: SITE_URL }],
  creator: "BTA LAB",
  publisher: "BTA LAB",
  icons: {
    icon: "/bta.ico",
    shortcut: "/bta.ico",
    apple: "/bta.ico",
  },
  openGraph: {
    title: "BTA LAB | ბიზნესისა და ტექნოლოგიების აკადემიის საწარმო",
    description:
      "ბიზნესისა და ტექნოლოგიების აკადემიის ლაბორატორია — ინოვაციური ციფრული გადაწყვეტილებები, ვებ დეველოპმენტი და ტექნოლოგიური პროექტები.",
    url: SITE_URL,
    siteName: "BTA LAB",
    locale: "ka_GE",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "BTA LAB — ბიზნესისა და ტექნოლოგიების აკადემიის ლაბორატორია",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BTA LAB | ბიზნესისა და ტექნოლოგიების აკადემიის საწარმო",
    description:
      "ბიზნესისა და ტექნოლოგიების აკადემიის ლაბორატორია — ინოვაციური ციფრული გადაწყვეტილებები, ვებ დეველოპმენტი და ტექნოლოგიური პროექტები.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
        {/* JSON-LD structured data for Organization schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BTA LAB",
              url: SITE_URL,
              description:
                "ბიზნესისა და ტექნოლოგიების აკადემიის ლაბორატორია — ვებგვერდების დამზადება, ციფრული ინოვაციები და ტექნოლოგიური გადაწყვეტილებები მცირე და საშუალო ბიზნესისთვის.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Tbilisi",
                addressCountry: "GE",
              },
            }),
          }}
        />

        {/* Google Tag Manager noscript fallback — right inside <body> */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MC8K7NTJ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>

        <Analytics />

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
