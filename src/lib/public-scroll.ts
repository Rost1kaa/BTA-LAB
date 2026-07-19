"use client";

function shouldReduceMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToPageTop() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  if (scrollTop <= 1) {
    return;
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: shouldReduceMotion() ? "auto" : "smooth",
  });
}
