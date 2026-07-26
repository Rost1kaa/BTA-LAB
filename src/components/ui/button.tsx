import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, ...props }, ref) => {
    const baseStyles =
      "group relative inline-flex items-center justify-center font-medium tracking-tight overflow-hidden select-none whitespace-nowrap " +
      "transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] " +
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-subtle)] disabled:opacity-50 disabled:pointer-events-none";

    const variants: Record<string, string> = {
      primary:
        "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]",
      secondary:
        "bg-transparent text-[var(--color-fg-primary)] border border-[var(--color-border-primary)]",
      ghost:
        "bg-transparent text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)]",
      outline:
        "bg-transparent text-[var(--color-fg-primary)] border-2 border-[var(--color-border-primary)]",
    };

    const sizes: Record<string, string> = {
      sm: "h-10 px-5 text-sm rounded-xl min-h-[44px]",
      md: "h-12 px-7 text-base rounded-xl min-h-[48px]",
      lg: "h-13 px-9 text-lg rounded-xl min-h-[50px]",
      xl: "h-14 px-10 text-lg rounded-xl min-h-[52px]",
    };

    const showLiquidFill = variant !== "ghost";
    const fillBg = "bg-[var(--color-button-fill)]";
    const fillFgColor = "group-hover:text-[var(--color-button-fill-foreground)] group-focus-visible:text-[var(--color-button-fill-foreground)]";

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={loading || Boolean(props.disabled)}
        {...props}
      >
        {/* Liquid-fill layer — all variants except ghost */}
        {showLiquidFill && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] rounded-[inherit]",
              fillBg
            )}
          />
        )}

        {/* Loading spinner */}
        {loading && (
          <svg
            className="pointer-events-none animate-spin -ml-1 h-4 w-4 shrink-0 relative z-10"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}

        {/* Content wrapper — above the fill layer, pointer-events-none so the button owns hover */}
        <span
          className={cn(
            "pointer-events-none relative z-10 inline-flex items-center gap-2 leading-none transition-colors duration-500",
            showLiquidFill && fillFgColor
          )}
        >
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
