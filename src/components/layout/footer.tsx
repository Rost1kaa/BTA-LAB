"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/use-dictionary";

interface FooterProps {
  siteConfig: {
    phone: string;
    location: string;
    socials: {
      facebook: string;
      instagram: string;
    };
    [key: string]: unknown;
  };
}

export function Footer({ siteConfig }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const { t, dict } = useTranslation();
  const copyrightText = (
    dict["footer.copyright"] || "© %year% BTA LAB. All rights reserved."
  ).replace("%year%", String(currentYear));
  const footerLinks = [
    { href: "/about", label: t("footer.company.about") },
    { href: "/terms", label: t("footer.info.terms") },
    { href: "/privacy", label: t("footer.info.privacy") },
  ];

  const socialLinks = [
    {
      href: siteConfig.socials.facebook,
      label: "Facebook",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      href: siteConfig.socials.instagram,
      label: "Instagram",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="public-copy-scope relative border-t border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]">
      <div className="footer-container mx-auto flex w-[90%] max-w-[1440px] flex-col items-start justify-between gap-10 py-12 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-10 md:py-14 lg:flex lg:flex-row lg:gap-16">
        <div className="footer-brand flex w-full max-w-xl flex-col gap-5 md:col-span-2 lg:col-span-1 lg:max-w-[38%]">
          {/* Logo */}
          <Image
            src="/images/logo.png"
            alt="BTA LAB Logo"
            width={64}
            height={64}
            className="object-contain"
            priority={false}
          />

          <p className="max-w-[34rem] text-base leading-7 text-[var(--color-fg-secondary)]">
            {t("footer.brandDescription")}
          </p>

          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-surface)] text-[var(--color-fg-tertiary)] transition-colors duration-200 hover:border-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-primary)]/25"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        <nav
          className="footer-links w-full min-w-0 md:max-w-sm lg:max-w-[22%]"
          aria-label={t("footer.info.title")}
        >
          <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-secondary)]">
            {t("footer.info.title")}
          </h4>
          <ul className="flex flex-col gap-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-7 items-center text-base leading-6 text-[var(--color-fg-tertiary)] transition-colors duration-200 hover:text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-primary)]/25"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-contact w-full min-w-0 md:max-w-md lg:max-w-[28%]">
          <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-secondary)]">
            {t("footer.contact.title")}
          </h4>
          <address className="not-italic">
            <ul className="flex flex-col gap-3 text-base leading-6 text-[var(--color-fg-secondary)]">
              <li>
                <span className="block text-[var(--color-fg-tertiary)]">
                  {siteConfig.location}
                </span>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`}
                  className="inline-flex min-h-7 items-center text-[var(--color-fg-secondary)] transition-colors duration-200 hover:text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-primary)]/25"
                >
                  {siteConfig.phone}
                </a>
              </li>
            </ul>
          </address>
        </div>
      </div>

      <div className="footer-bottom border-t border-[var(--color-border-primary)]">
        <div className="mx-auto w-[90%] max-w-[1440px] py-6">
          <p className="text-center text-xs leading-6 text-[var(--color-fg-tertiary)]">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
