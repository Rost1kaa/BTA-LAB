"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  type Placement,
} from "@floating-ui/react";
import { cn } from "@/lib/utils";

// ── Tooltip Context ────────────────────────────────────────────────────
// Ensures only one tooltip is open at a time across all instances.

interface TooltipContextValue {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

const TooltipContext = createContext<TooltipContextValue>({
  activeId: null,
  setActiveId: () => {},
});

export function FeatureTooltipProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  return (
    <TooltipContext.Provider value={{ activeId, setActiveId }}>
      {children}
    </TooltipContext.Provider>
  );
}

// ── Tooltip Data Type ──────────────────────────────────────────────────

export interface FeatureTooltipData {
  nameKa: string;
  nameEn: string;
  descriptionKa: string;
  descriptionEn: string;
}

// ── Props ──────────────────────────────────────────────────────────────

interface FeatureTooltipProps {
  tooltip: FeatureTooltipData;
  locale?: "ka" | "en";
}

// ── Component ──────────────────────────────────────────────────────────

export function FeatureTooltip({ tooltip, locale = "ka" }: FeatureTooltipProps) {
  const { activeId, setActiveId } = useContext(TooltipContext);

  // Stable identity for this instance
  const idRef = useRef(
    `tooltip-${tooltip.nameKa}-${Math.random().toString(36).slice(2, 8)}`,
  );
  const tooltipId = idRef.current;

  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const name = locale === "ka" ? tooltip.nameKa : tooltip.nameEn;
  const description =
    locale === "ka" ? tooltip.descriptionKa : tooltip.descriptionEn;

  // ── Floating UI ─────────────────────────────────────────────────────
  const { x, y, refs, strategy } = useFloating({
    placement: "top" as Placement,
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    strategy: "fixed",
  });

  const positioned = x !== null && y !== null;

  // ── Coordinate freeze ───────────────────────────────────────────────
  // Store the last valid Floating UI coordinates so the exit animation
  // always renders at the correct position, even if Floating UI resets
  // x/y to null when the element unmounts from the tree.
  //
  // The ref is updated at render time (not in an effect) so it's always
  // fresh before the browser paints.

  const lastPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  if (x !== null && y !== null) {
    lastPositionRef.current = { x, y };
  }

  const currentX = x ?? lastPositionRef.current.x;
  const currentY = y ?? lastPositionRef.current.y;

  // ── Timer helpers ───────────────────────────────────────────────────

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setActiveId(null);
    }, 150);
  }, [cancelClose, setActiveId]);

  const openTooltip = useCallback(() => {
    cancelClose();
    setActiveId(tooltipId);
    setOpen(true);
  }, [cancelClose, setActiveId, tooltipId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => cancelClose();
  }, [cancelClose]);

  // Close if another tooltip becomes active
  useEffect(() => {
    if (open && activeId !== null && activeId !== tooltipId) {
      cancelClose();
      setOpen(false);
      setActiveId(null);
    }
  }, [activeId, tooltipId, open, cancelClose, setActiveId]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        refs.reference.current &&
        !(refs.reference.current as Node).contains(e.target as Node) &&
        refs.floating.current &&
        !refs.floating.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setActiveId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setActiveId, refs.reference, refs.floating]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setActiveId(null);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, setActiveId]);

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <span className="relative inline-flex items-center shrink-0">
      <button
        ref={refs.setReference}
        type="button"
        onClick={() => {
          if (open) {
            cancelClose();
            setOpen(false);
            setActiveId(null);
          } else {
            openTooltip();
          }
        }}
        onMouseEnter={openTooltip}
        onMouseLeave={scheduleClose}
        className={cn(
          "inline-flex items-center justify-center w-6 h-6 rounded-full",
          "text-[13px] font-bold leading-none",
          "text-[var(--color-fg-tertiary)]/70 hover:text-[var(--color-accent)]",
          "bg-[var(--color-overlay)] hover:bg-[var(--color-accent)]/12",
          "border border-[var(--color-border-primary)] hover:border-[var(--color-accent)]/30",
          "transition-all duration-200 cursor-pointer select-none",
          "hover:scale-110 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/40",
          open &&
            "text-[var(--color-accent)] bg-[var(--color-accent)]/12 border-[var(--color-accent)]/30 scale-110",
        )}
        aria-label={`Learn more about ${name}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="relative mt-[-0.5px]">?</span>
      </button>

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && positioned && (
              <motion.div
                ref={refs.setFloating}
                key={tooltipId}
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                role="dialog"
                aria-label={name}
                style={{
                  position: strategy,
                  top: `${currentY}px`,
                  left: `${currentX}px`,
                }}
                className={cn(
                  "w-64 md:w-72 z-[100]",
                  "rounded-xl border border-[var(--color-border-secondary)]",
                  "bg-[var(--color-bg-surface)] shadow-xl shadow-black/12",
                  "p-4 pointer-events-auto",
                )}
              >
                {/* Title */}
                <p className="text-sm font-bold text-[var(--color-fg-primary)] leading-snug">
                  {name}
                </p>

                {/* Separator */}
                <div className="mt-2 mb-2.5 border-t border-[var(--color-border-primary)]" />

                {/* Description */}
                <p className="text-xs md:text-[13px] text-[var(--color-fg-secondary)] leading-relaxed">
                  {description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </span>
  );
}
