import { type CSSProperties, type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  distance?: number;
}

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className = "",
  once = true,
  distance = 40,
}: FadeInProps) {
  return (
    <div
      data-reveal-direction={direction}
      data-reveal-once={once ? "true" : "false"}
      data-reveal-state="visible"
      style={{
        "--reveal-delay": `${delay}s`,
        "--reveal-duration": `${duration}s`,
        "--reveal-distance": `${distance}px`,
      } as CSSProperties}
      className={className}
    >
      {children}
    </div>
  );
}
