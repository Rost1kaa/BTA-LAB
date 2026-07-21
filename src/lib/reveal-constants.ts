/**
 * Shared initial values for reveal-on-scroll data attributes.
 *
 * Every element that uses data-reveal-* attributes MUST start with these
 * exact values during SSR AND the first client render to prevent React
 * hydration mismatches. Post-mount, `PublicSiteEffects` upgrades these
 * via IntersectionObserver as elements scroll into view.
 *
 * IMPORTANT: Keep these as const string literals so they inline correctly
 * in both server and client components. Do NOT derive them from state,
 * props, or any runtime condition.
 */
export const REVEAL_INITIAL = {
  armed: "false" as const,
  state: "pending" as const,
} as const;
