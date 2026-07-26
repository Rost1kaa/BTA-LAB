import { type CSSProperties, type ReactNode } from "react";
import { REVEAL_INITIAL } from "@/lib/reveal-constants";

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
      data-reveal-armed={REVEAL_INITIAL.armed}
      data-reveal-state={REVEAL_INITIAL.state}
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
