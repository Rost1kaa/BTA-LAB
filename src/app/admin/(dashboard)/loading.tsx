export default function AdminLoading() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <span className="sr-only">Loading Admin Panel…</span>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--color-overlay)]" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)]" />
        ))}
      </div>
    </div>
  );
}
