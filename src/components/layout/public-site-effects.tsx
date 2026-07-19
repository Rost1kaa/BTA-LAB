"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

function isAdminPath(pathname: string | null): boolean {
  return pathname?.startsWith("/admin") ?? false;
}

export function PublicPageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isAdminPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <div key={pathname} className="public-page-transition">
      {children}
    </div>
  );
}

export function PublicSiteEffects() {
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const initializedRef = useRef(false);
  const revealInitializedRef = useRef(false);
  const isAdmin = isAdminPath(pathname);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js");

    if (isAdmin) {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
      return;
    }

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "auto";
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      const navigationEntry = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      const forceTopOnReload = sessionStorage.getItem("bta:force-top-on-reload") === "true";

      if (navigationEntry?.type === "reload" || forceTopOnReload) {
        sessionStorage.removeItem("bta:force-top-on-reload");
        window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
      }
    }

    const handleBeforeUnload = () => {
      sessionStorage.setItem("bta:force-top-on-reload", "true");
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) return;

    let timeout = 0;
    let frame = 0;
    let observer: IntersectionObserver | null = null;
    let revealElements: HTMLElement[] = [];

    const showAll = () => {
      revealElements.forEach((element) => {
        element.dataset.revealArmed = "false";
        element.dataset.revealState = "visible";
      });
    };

    const registerRevealElements = () => {
      const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      revealElements = Array.from(
        document.querySelectorAll<HTMLElement>("[data-reveal-direction]")
      );

      if (reducedMotionQuery.matches || !("IntersectionObserver" in window)) {
        showAll();
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const element = entry.target as HTMLElement;

            if (entry.isIntersecting) {
              element.dataset.revealState = "visible";
              if (element.dataset.revealOnce !== "false") {
                observer?.unobserve(element);
              }
            } else if (element.dataset.revealOnce === "false") {
              element.dataset.revealState = "pending";
            }
          });
        },
        {
          rootMargin: "0px 0px -8% 0px",
          threshold: 0.12,
        }
      );

      revealElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const alreadyInView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

        element.dataset.revealArmed = "true";
        element.dataset.revealState = alreadyInView ? "visible" : "pending";
        observer?.observe(element);
      });
    };

    const scheduleRegister = () => {
      timeout = window.setTimeout(() => {
        frame = window.requestAnimationFrame(registerRevealElements);
      }, revealInitializedRef.current ? 0 : 120);
      revealInitializedRef.current = true;
    };

    if (document.readyState === "complete") {
      scheduleRegister();
    } else {
      window.addEventListener("load", scheduleRegister, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleRegister);
      window.clearTimeout(timeout);
      if (frame) window.cancelAnimationFrame(frame);
      observer?.disconnect();
      showAll();
    };
  }, [isAdmin, pathname]);

  useEffect(() => {
    if (isAdmin) {
      return;
    }

    const button = buttonRef.current;
    if (!button) return;

    let frame = 0;
    let lastVisible = false;

    const update = () => {
      frame = 0;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollable = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const progress = Math.min(Math.max(scrollTop / scrollable, 0), 1);
      const nextVisible = scrollTop > 320;

      button.style.setProperty("--scroll-progress", progress.toFixed(4));

      if (nextVisible !== lastVisible) {
        lastVisible = nextVisible;
        setVisible(nextVisible);
      }
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [isAdmin, pathname]);

  if (isAdmin) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}
      style={{ "--scroll-progress": "0" } as CSSProperties}
      className={cn(
        "scroll-top-button fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40",
        "flex h-12 w-12 items-center justify-center rounded-full",
        "text-[var(--color-fg-primary)] shadow-lg transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]/60",
        visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-3 opacity-0 pointer-events-none"
      )}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}
