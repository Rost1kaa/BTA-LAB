export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-[var(--color-bg-primary)]"
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
