"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-red-500/20 p-8" role="alert">
      <h1 className="text-xl font-semibold text-[var(--color-fg-primary)]">The Admin Panel Could Not Load</h1>
      <p className="mt-2 text-sm text-[var(--color-fg-tertiary)]">Check the database connection and try again.</p>
      <button type="button" onClick={reset} className="mt-6 h-10 px-4 rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30">Try Again</button>
    </div>
  );
}
