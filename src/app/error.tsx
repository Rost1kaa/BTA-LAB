"use client";

import { useTranslation } from "@/lib/use-dictionary";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6" role="alert">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-fg-primary)]">
          {t("notFound.title")}
        </h1>
        <p className="mt-3 text-sm text-[var(--color-fg-tertiary)]">
          {t("notFound.description")}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 h-11 px-5 rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30"
        >
          {t("notFound.button")}
        </button>
      </div>
    </main>
  );
}
