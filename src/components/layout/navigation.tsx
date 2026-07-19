"use client";

import { type CSSProperties, useState, useEffect, useRef, useCallback, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "@/components/providers/theme-toggle";
import { Menu, X, ChevronDown } from "lucide-react";
import { useTranslation } from "@/lib/use-dictionary";

interface NavigationProps {
  siteConfig: {
    email: string;
    socials: {
      facebook: string;
      instagram: string;
    };
    [key: string]: unknown;
  };
}

function GeorgianFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 400" aria-hidden="true">
      <rect width="640" height="400" fill="#fff" />
      <rect x="280" width="80" height="400" fill="#ff0000" />
      <rect y="160" width="640" height="80" fill="#ff0000" />
      {[
        [160, 100],
        [480, 100],
        [160, 300],
        [480, 300],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} fill="#ff0000">
          <rect x={x - 12} y={y - 38} width="24" height="76" />
          <rect x={x - 38} y={y - 12} width="76" height="24" />
        </g>
      ))}
    </svg>
  );
}

function EnglishFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 30" aria-hidden="true">
      <path d="M0 0v30h60V0z" fill="#012169" />
      <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" strokeWidth="4" />
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

function LanguageSwitcher() {
  const { locale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const switchLocale = useCallback((newLocale: string) => {
    if (newLocale === locale) {
      setOpen(false);
      return;
    }
    setOpen(false);
    startTransition(() => {
      void fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      }).finally(() => router.refresh());
    });
  }, [locale, router]);

  // Click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[15px] font-medium",
          "text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)]",
          "hover:bg-[var(--color-overlay)] transition-all duration-300",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-subtle)]"
        )}
        aria-label={`${t("language.current")}: ${locale === "ka" ? t("language.ka") : t("language.en")}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {/* Active flag */}
        <span className="flex items-center gap-1.5">
          {locale === "ka" ? (
            <GeorgianFlag className="w-5 h-5 rounded-sm shrink-0" />
          ) : (
            <EnglishFlag className="w-5 h-5 rounded-sm shrink-0" />
          )}
          <span className="text-[13px] font-medium leading-none">{locale === "ka" ? "KA" : "EN"}</span>
        </span>
        <ChevronDown
          size={12}
          className={cn(
            "transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
          <div
            role="listbox"
            aria-label={t("language.select")}
            className={cn(
              "absolute right-0 top-full mt-1 w-40 z-50",
              "rounded-xl border border-[var(--color-border-primary)]",
              "bg-[var(--color-bg-surface)] shadow-lg overflow-hidden",
              "dropdown-pop"
            )}
          >
            <button
              role="option"
              aria-selected={locale === "ka"}
              disabled={isPending}
              onClick={() => switchLocale("ka")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-[15px] text-left transition-colors",
                locale === "ka"
                  ? "bg-[var(--color-overlay)] text-[var(--color-fg-primary)]"
                  : "text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)]"
              )}
            >
              <GeorgianFlag className="w-5 h-5 rounded-sm shrink-0" />
              <span>{t("language.ka")}</span>
            </button>
            <button
              role="option"
              aria-selected={locale === "en"}
              disabled={isPending}
              onClick={() => switchLocale("en")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-[15px] text-left transition-colors",
                locale === "en"
                  ? "bg-[var(--color-overlay)] text-[var(--color-fg-primary)]"
                  : "text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)]"
              )}
            >
              <EnglishFlag className="w-5 h-5 rounded-sm shrink-0" />
              <span>{t("language.en")}</span>
            </button>
          </div>
        )}
    </div>
  );
}

const navLinkKeys = [
  { key: "nav.home", href: "/" },
  { key: "nav.about", href: "/about" },
  { key: "nav.services", href: "/services" },
  { key: "nav.portfolio", href: "/portfolio" },
  { key: "nav.team", href: "/team" },
  { key: "nav.contact", href: "/contact" },
];

export function Navigation({ siteConfig }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-[var(--color-bg-primary)]/80 backdrop-blur-xl border-b border-[var(--color-border-primary)]"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="relative z-10 flex items-center gap-2 group"
            >
              <span className="text-lg font-semibold tracking-tight text-[var(--color-fg-primary)]">
                BTA
              </span>
              <span className="w-6 h-[1px] bg-[var(--color-fg-tertiary)]/50 group-hover:bg-[var(--color-fg-secondary)] transition-colors duration-300" />
              <span className="text-sm font-light tracking-[0.2em] text-[var(--color-fg-tertiary)]/70 group-hover:text-[var(--color-fg-secondary)] transition-colors duration-300 uppercase">
                LAB
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinkKeys.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative px-4 py-2 text-[15px] font-medium transition-colors duration-300 rounded-lg",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-subtle)]",
                      isActive
                        ? "text-[var(--color-fg-primary)]"
                        : "text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-secondary)]"
                    )}
                  >
                    {t(link.key)}
                    {isActive && (
                      <span className="absolute inset-0 bg-[var(--color-overlay)] rounded-lg -z-10" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <ThemeToggle />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="relative z-10 flex md:hidden items-center justify-center w-10 h-10 rounded-xl text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-subtle)]"
                aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-[var(--color-bg-primary)]/95 backdrop-blur-2xl md:hidden mobile-menu-fade">
            <nav className="flex flex-col items-center justify-center h-full gap-6">
              {navLinkKeys.map((link, index) => {
                const isActive = pathname === link.href;
                return (
                  <div
                    key={link.href}
                    className="mobile-menu-item"
                    style={{ "--menu-index": index } as CSSProperties}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMobile}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "text-3xl font-light tracking-tight transition-colors duration-300",
                        isActive
                          ? "text-[var(--color-fg-primary)]"
                          : "text-[var(--color-fg-tertiary)]/50 hover:text-[var(--color-fg-tertiary)]/80"
                      )}
                    >
                      {t(link.key)}
                    </Link>
                  </div>
                );
              })}
              {/* Mobile theme toggle + language */}
              <div
                className="flex items-center gap-4 mt-4"
              >
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              <div
                className="absolute bottom-16 flex flex-col items-center gap-4 text-sm text-[var(--color-fg-tertiary)]"
              >
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-[var(--color-fg-secondary)] transition-colors"
                >
                  {siteConfig.email}
                </a>
              </div>
            </nav>
          </div>
        )}
    </>
  );
}
