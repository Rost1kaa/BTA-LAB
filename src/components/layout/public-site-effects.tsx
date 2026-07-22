"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollToPageTop } from "@/lib/public-scroll";

function isAdminPath(pathname: string | null): boolean {
  return pathname?.startsWith("/admin") ?? false;
}

const LOADER_MIN_DURATION = 350; // ms — guarantees the loading animation is visible

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
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathnameRef = useRef(pathname);
  const loaderStartRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scrollTopVisible, setScrollTopVisible] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const initializedRef = useRef(false);
  const revealInitializedRef = useRef(false);
  const isAdmin = isAdminPath(pathname);

  // Clean up hide timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  // ── Route loading: show immediately, hide after minimum duration ────

  useEffect(() => {
    pathnameRef.current = pathname;

    // When the route changes while the loader is active, ensure the
    // loading animation stays visible for at least LOADER_MIN_DURATION ms
    // so fast Vercel Edge CDN responses don't cause instant/janky transitions.
    if (!isAdmin && routeLoading) {
      const elapsed = Date.now() - loaderStartRef.current;
      const remaining = LOADER_MIN_DURATION - elapsed;

      if (remaining > 0) {
        hideTimerRef.current = setTimeout(() => {
          hideTimerRef.current = null;
          setRouteLoading(false);
        }, remaining);
      } else {
        setRouteLoading(false);
      }
    }

    return () => {
      if (hideTimerRef.current !== null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [isAdmin, pathname, routeLoading]);

  useEffect(() => {
    if (isAdmin) return;

    const stopLoader = () => {
      if (hideTimerRef.current !== null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setRouteLoading(false);
    };

    const startLoader = () => {
      scrollToPageTop();
      // Show loading immediately — no rAF delay — so it always appears
      // even when the route transition completes instantly on Vercel.
      loaderStartRef.current = Date.now();
      setRouteLoading(true);
    };

    const handleNavigationIntent = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = (event.target as Element | null)?.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;

      let nextUrl: URL;
      try {
        nextUrl = new URL(link.href, window.location.href);
      } catch {
        return;
      }

      if (nextUrl.origin !== window.location.origin) return;
      if (isAdminPath(nextUrl.pathname)) return;

      const currentPath = pathnameRef.current || window.location.pathname;
      const isSameRoute = nextUrl.pathname === currentPath;

      if (!isSameRoute) {
        event.preventDefault();
        startLoader();
        router.push(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`, { scroll: false });
      }
    };

    const handlePopState = () => {
      if (
        window.location.pathname !== pathnameRef.current &&
        !isAdminPath(window.location.pathname)
      ) {
        startLoader();
      }
    };

    const handlePageShow = () => {
      stopLoader();
    };

    document.addEventListener("click", handleNavigationIntent, true);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("click", handleNavigationIntent, true);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
      if (hideTimerRef.current !== null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [isAdmin, router]);

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
      window.history.scrollRestoration = "manual";
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
    let registerFrame = 0;
    let activateFrame = 0;
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

      const elementsInView: HTMLElement[] = [];

      revealElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const alreadyInView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

        element.dataset.revealArmed = "true";
        element.dataset.revealState = "pending";
        observer?.observe(element);

        if (alreadyInView) {
          elementsInView.push(element);
        }
      });

      activateFrame = window.requestAnimationFrame(() => {
        elementsInView.forEach((element) => {
          element.dataset.revealState = "visible";

          if (element.dataset.revealOnce !== "false") {
            observer?.unobserve(element);
          }
        });
      });
    };

    const scheduleRegister = () => {
      timeout = window.setTimeout(() => {
        registerFrame = window.requestAnimationFrame(registerRevealElements);
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
      if (registerFrame) window.cancelAnimationFrame(registerFrame);
      if (activateFrame) window.cancelAnimationFrame(activateFrame);
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
        setScrollTopVisible(nextVisible);
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
    <>
    <button
      ref={buttonRef}
      type="button"
      aria-label="Scroll to top"
      aria-hidden={!scrollTopVisible}
      tabIndex={scrollTopVisible ? 0 : -1}
      onClick={scrollToPageTop}
      style={{ "--scroll-progress": "0" } as CSSProperties}
      className={cn(
        "scroll-top-button fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40",
        "flex h-12 w-12 items-center justify-center rounded-full",
        "text-[var(--color-fg-primary)] shadow-lg transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]/60",
        scrollTopVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-3 opacity-0 pointer-events-none"
      )}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
    <PublicRouteLoader active={routeLoading} />
    </>
  );
}

function PublicRouteLoader({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div
      className="bta-route-loader"
      role="status"
      aria-live="polite"
      aria-label="BTA LAB is loading"
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-5 px-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-semibold tracking-tight text-[var(--color-fg-primary)]">
            BTA
          </span>
          <span className="h-px w-10 bg-[var(--color-fg-tertiary)]/50" />
          <span className="text-sm font-light tracking-[0.3em] text-[var(--color-fg-tertiary)] uppercase">
            LAB
          </span>
        </div>
        <div className="relative h-px w-full overflow-hidden bg-[var(--color-border-primary)]">
          <span className="absolute inset-y-0 left-0 w-2/3 origin-center bg-[var(--color-fg-primary)] animate-bta-loading-scan" />
        </div>
      </div>
    </div>
  );
}
