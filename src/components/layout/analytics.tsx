"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

const GTM_ID = "GTM-MC8K7NTJ";
const GA4_ID = "G-RYDZJ0GXZ8";

/**
 * Analytics component that injects Google Tag Manager and Google Analytics 4
 * using next/script with the afterInteractive strategy so it does not block
 * critical page rendering or impact Lighthouse performance scores.
 *
 * Handles client-side route transition pageviews via usePathname so that
 * gtag pageviews are consistent across App Router navigation events.
 *
 * GTM:  GTM-MC8K7NTJ
 * GA4:  G-RYDZJ0GXZ8
 *
 * The <noscript> iframe fallback for GTM is placed directly in the root
 * layout's <body> to avoid duplication from SSR of this client component.
 */
export function Analytics() {
  const pathname = usePathname();
  const gaInitializedRef = useRef(false);

  // Fire a gtag pageview on every route change.
  // The initial pageview is handled by the inline GA4 init Script below;
  // this effect only sends additional pageviews for client-side
  // route transitions (which the inline script cannot catch).
  useEffect(() => {
    // Skip the initial render — the inline GA4 Script handles it.
    if (!gaInitializedRef.current) {
      gaInitializedRef.current = true;
      return;
    }

    // Cast via bracket access to avoid TS error on gtag's dataLayer.
    const dl = (window as unknown as Record<string, unknown>)["dataLayer"] as
      | unknown[]
      | undefined;
    if (dl && typeof dl.push === "function") {
      dl.push(["config", GA4_ID, { page_path: pathname }]);
    }
  }, [pathname]);

  return (
    <>
      {/* ── Google Tag Manager (script) ────────────────────────────── */}
      <Script
        id="gtm"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
        }}
      />

      {/* ── Google Analytics 4 (gtag.js) ───────────────────────────── */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_ID}');
        `}
      </Script>
    </>
  );
}
