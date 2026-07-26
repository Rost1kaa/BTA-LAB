"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // Hydration-safe mount detection — no effects needed
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-full" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden",
        "border border-[var(--color-border-primary)]",
        "text-[var(--color-fg-tertiary)] hover:text-[var(--color-button-fill-foreground)]",
        "transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-subtle)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]"
      )}
    >
      {/* Liquid-fill layer */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0 group-hover:h-full transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] bg-[var(--color-button-fill)] rounded-full"
      />

      {/* Icon — flex centered inside the circular button */}
      <span className="relative z-10 flex items-center justify-center leading-none transition-colors duration-500">
        <span
          key={isDark ? "moon" : "sun"}
          className="flex items-center justify-center theme-icon-pop"
        >
          {isDark ? <Moon size={16} className="shrink-0" /> : <Sun size={16} className="shrink-0" />}
        </span>
      </span>
    </button>
  );
}
