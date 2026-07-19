"use client";

import { useEffect, useState } from "react";
import { Cookie, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/use-dictionary";

const CONSENT_KEY = "bta_cookie_consent_v1";
const CONSENT_VERSION = 1;

type ConsentChoice = {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

const copy = {
  en: {
    title: "Cookie preferences",
    description:
      "We use necessary cookies for language and secure admin sessions. Analytics or marketing cookies stay off unless you allow them.",
    necessary: "Necessary",
    analytics: "Analytics",
    marketing: "Marketing",
    essentialOnly: "Essential only",
    acceptAll: "Accept all",
    settings: "Settings",
    save: "Save",
    close: "Close cookie preferences",
    reopen: "Cookies",
    privacy: "Privacy Policy",
    cookiePolicy: "Cookie Policy",
  },
  ka: {
    title: "ქუქიების პარამეტრები",
    description:
      "ვიყენებთ აუცილებელ ქუქიებს ენის არჩევისა და უსაფრთხო ადმინისტრირების სესიებისთვის. ანალიტიკური ან მარკეტინგული ქუქიები არ ჩაირთვება თქვენი თანხმობის გარეშე.",
    necessary: "აუცილებელი",
    analytics: "ანალიტიკა",
    marketing: "მარკეტინგი",
    essentialOnly: "მხოლოდ აუცილებელი",
    acceptAll: "ყველას მიღება",
    settings: "პარამეტრები",
    save: "შენახვა",
    close: "ქუქიების პარამეტრების დახურვა",
    reopen: "ქუქიები",
    privacy: "კონფიდენციალურობის პოლიტიკა",
    cookiePolicy: "ქუქიების პოლიტიკა",
  },
} as const;

function isValidConsent(value: unknown): value is ConsentChoice {
  if (!value || typeof value !== "object") return false;
  const consent = value as Partial<ConsentChoice>;
  return consent.version === CONSENT_VERSION && consent.necessary === true;
}

function createConsent(analytics: boolean, marketing: boolean): ConsentChoice {
  return {
    version: CONSENT_VERSION,
    necessary: true,
    analytics,
    marketing,
    timestamp: new Date().toISOString(),
  };
}

export function CookieConsent() {
  const pathname = usePathname();
  const { locale } = useTranslation();
  const text = copy[locale] ?? copy.ka;
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (isAdmin) return;

    const frame = window.requestAnimationFrame(() => {
      setMounted(true);

      try {
        const stored = window.localStorage.getItem(CONSENT_KEY);
        const parsed = stored ? JSON.parse(stored) : null;

        if (isValidConsent(parsed)) {
          setAnalytics(parsed.analytics);
          setMarketing(parsed.marketing);
          setSaved(true);
          setOpen(false);
          return;
        }
      } catch {
        window.localStorage.removeItem(CONSENT_KEY);
      }

      setOpen(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isAdmin]);

  const saveChoice = (nextAnalytics: boolean, nextMarketing: boolean) => {
    const consent = createConsent(nextAnalytics, nextMarketing);
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch {
      // Preference storage can be unavailable in hardened browsers.
    }
    window.dispatchEvent(new CustomEvent("bta:cookie-consent", { detail: consent }));
    setAnalytics(nextAnalytics);
    setMarketing(nextMarketing);
    setSaved(true);
    setOpen(false);
    setShowPreferences(false);
  };

  if (isAdmin || !mounted) {
    return null;
  }

  return (
    <>
      {open && (
        <section
          aria-label={text.title}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] p-4 shadow-2xl shadow-black/20 md:bottom-6 md:left-6 md:right-auto md:p-5"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-overlay)] text-[var(--color-fg-secondary)]">
              <Cookie size={18} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
                  {text.title}
                </h2>
                {saved && (
                  <button
                    type="button"
                    aria-label={text.close}
                    onClick={() => setOpen(false)}
                    className="rounded-md p-1 text-[var(--color-fg-tertiary)] transition-colors hover:text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-primary)]/25"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-fg-tertiary)]">
                {text.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--color-fg-tertiary)]">
                <Link
                  href="/privacy"
                  className="underline-offset-4 transition-colors hover:text-[var(--color-fg-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-primary)]/25"
                >
                  {text.privacy}
                </Link>
                <Link
                  href="/cookies"
                  className="underline-offset-4 transition-colors hover:text-[var(--color-fg-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-primary)]/25"
                >
                  {text.cookiePolicy}
                </Link>
              </div>

              {showPreferences && (
                <div className="mt-4 space-y-3 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-overlay)] p-3">
                  <label className="flex items-center justify-between gap-3 text-sm text-[var(--color-fg-secondary)]">
                    <span>{text.necessary}</span>
                    <input type="checkbox" checked disabled className="h-4 w-4 accent-[#22c55e]" />
                  </label>
                  <label className="flex items-center justify-between gap-3 text-sm text-[var(--color-fg-secondary)]">
                    <span>{text.analytics}</span>
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(event) => setAnalytics(event.target.checked)}
                      className="h-4 w-4 accent-[#22c55e]"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 text-sm text-[var(--color-fg-secondary)]">
                    <span>{text.marketing}</span>
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(event) => setMarketing(event.target.checked)}
                      className="h-4 w-4 accent-[#22c55e]"
                    />
                  </label>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => saveChoice(true, true)}
                >
                  {text.acceptAll}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => saveChoice(false, false)}
                >
                  {text.essentialOnly}
                </Button>
                {showPreferences ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => saveChoice(analytics, marketing)}
                  >
                    {text.save}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowPreferences(true)}
                  >
                    <SlidersHorizontal size={15} aria-hidden="true" />
                    {text.settings}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {saved && !open && (
        <button
          type="button"
          onClick={() => {
            setShowPreferences(true);
            setOpen(true);
          }}
          className="fixed bottom-5 left-5 z-40 rounded-full border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs font-medium text-[var(--color-fg-tertiary)] shadow-lg transition-colors hover:text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-primary)]/25 md:bottom-8 md:left-8"
        >
          {text.reopen}
        </button>
      )}
    </>
  );
}
