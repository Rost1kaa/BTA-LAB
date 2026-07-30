import type { Metadata } from "next";
import { Suspense } from "react";
import ThankYouContent from "./thank-you-content";

export const metadata: Metadata = {
  title: "მადლობა",
};

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center text-[var(--color-fg-tertiary)]">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
