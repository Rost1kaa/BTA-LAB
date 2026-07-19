import { type CSSProperties } from "react";

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  staggerChildren?: number;
}

export function TextReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
  as: Tag = "p",
  staggerChildren = 0.02,
}: TextRevealProps) {
  return (
    <Tag
      className={`text-reveal-root overflow-visible pb-[0.08em] ${className}`}
      style={{
        "--text-reveal-delay": `${delay}s`,
        "--text-reveal-duration": `${duration}s`,
        "--text-reveal-stagger": `${staggerChildren}s`,
      } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

interface CharRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export function CharReveal({ children, className = "", delay = 0 }: CharRevealProps) {
  const chars = children.split("");

  return (
    <span
      className={className}
      style={{
        "--text-reveal-delay": `${delay}s`,
        "--text-reveal-duration": "0.4s",
        "--text-reveal-stagger": "0.03s",
      } as CSSProperties}
    >
      {chars.map((char, index) => (
        <span
          key={index}
          className="text-reveal-word inline-block"
          style={{ "--text-reveal-index": index } as CSSProperties}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
