"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/use-dictionary";

interface ProjectPreviewProps {
  /** Path to the full-page website screenshot */
  imageSrc: string;
  /** Accessible alt text */
  altText: string;
  /** Tailwind height classes. Default: "h-[310px] md:h-[340px]" */
  previewHeight?: string;
  /** Mark the preview as an above-the-fold image. */
  eager?: boolean;
  /**
   * Override the default sizes attribute for the Next.js Image component.
   * The default is optimised for card layouts (~390 px rendered width).
   * Pass larger sizes for full-width hero/detail images.
   */
  sizes?: string;
  /**
   * Override the default quality (1–100). Default is 70 for card thumbnails.
   * Pass a higher value (e.g. 85) for hero images that need more detail.
   */
  quality?: number;
}

export function ProjectPreview({
  imageSrc,
  altText,
  previewHeight = "h-[310px] md:h-[340px]",
  eager = false,
  sizes,
  quality,
}: ProjectPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const isResettingRef = useRef(false);
  const touchStartY = useRef(0);
  const isTouching = useRef(false);

  const [showIndicator, setShowIndicator] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { t } = useTranslation();

  // ── Scroll the container by delta ──
  const scrollBy = useCallback((delta: number): boolean => {
    const el = previewRef.current;
    if (!el) return false;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;

    const atTop = scrollTop <= 0 && delta < 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && delta > 0;

    if (!atTop && !atBottom) {
      el.scrollTop = Math.max(0, Math.min(maxScroll, scrollTop + delta));
      return true;
    }
    return false;
  }, []);

  // ── Dismiss indicator helper ──
  const dismissIndicator = useCallback(() => {
    setShowIndicator(false);
    setHasScrolled(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // ── Wheel handler ──
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (scrollBy(e.deltaY)) {
        e.preventDefault();
      }
      if (!hasScrolled) dismissIndicator();
    },
    [scrollBy, hasScrolled, dismissIndicator]
  );

  // ── Touch handlers ──
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isTouching.current = true;
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isTouching.current) return;
      const delta = touchStartY.current - e.touches[0].clientY;
      touchStartY.current = e.touches[0].clientY;

      if (scrollBy(delta)) {
        e.preventDefault();
      }
      if (!hasScrolled) dismissIndicator();
    },
    [scrollBy, hasScrolled, dismissIndicator]
  );

  const handleTouchEnd = useCallback(() => {
    isTouching.current = false;
  }, []);

  // ── Keyboard handler ──
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        if (scrollBy(60)) e.preventDefault();
      } else if (e.key === "ArrowUp") {
        if (scrollBy(-60)) e.preventDefault();
      } else if (e.key === "PageDown") {
        const el = previewRef.current;
        if (scrollBy(el?.clientHeight ?? 200)) e.preventDefault();
      } else if (e.key === "PageUp") {
        const el = previewRef.current;
        if (scrollBy(-(el?.clientHeight ?? 200))) e.preventDefault();
      }
    },
    [scrollBy]
  );

  // Attach / detach events
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("keydown", handleKeyDown);

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, handleKeyDown]);

  // ── Smooth scroll to top (cancellable) ──
  const resetPreview = useCallback(() => {
    const el = previewRef.current;
    if (!el || el.scrollTop <= 0) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const startScroll = el.scrollTop;
    const startTime = performance.now();
    const duration = 400;

    isResettingRef.current = true;
    setHasScrolled(false);
    setShowIndicator(false);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    function step(time: number) {
      const target = previewRef.current;
      if (!target || !isResettingRef.current) return;

      const p = Math.min((time - startTime) / duration, 1);
      const t = 1 - Math.pow(1 - p, 3);
      target.scrollTop = startScroll * (1 - t);

      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        target.scrollTop = 0;
        isResettingRef.current = false;
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(step);
  }, []);

  const handleMouseEnter = useCallback(() => {
    // Cancel any ongoing reset animation
    isResettingRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (!hasScrolled) {
      setShowIndicator(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setShowIndicator(false), 2500);
    }
  }, [hasScrolled]);

  const handleMouseLeave = useCallback(() => {
    resetPreview();
  }, [resetPreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={previewRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`preview-scrollbar-hidden relative w-full overflow-y-auto overflow-x-hidden rounded-t-2xl bg-[var(--color-bg-surface)] ${previewHeight}`}
        tabIndex={0}
        role="region"
        aria-label={t("portfolio.previewLabel").replace("%alt%", altText)}
      >
        {/* Full-page website screenshot */}
        <Image
          src={imageSrc}
          alt={altText}
          width={1920}
          height={6000}
          sizes={sizes ?? "(max-width: 480px) 372px, (max-width: 768px) calc(100vw - 48px), (max-width: 1024px) calc((100vw - 72px) / 2), 390px"}
          className="h-auto w-full"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          quality={quality ?? 70}
        />

        {/* ── Scroll indicator ── */}
        <div
          className={`pointer-events-none absolute left-1/2 top-1/2 z-20 size-14 -translate-x-1/2 -translate-y-1/2 preview-indicator ${showIndicator ? "is-visible" : ""}`}
          aria-hidden="true"
        >
          <div className="flex size-full items-center justify-center rounded-full bg-black text-white shadow-xl">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="7" />
              <line x1="12" y1="6" x2="12" y2="10" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
