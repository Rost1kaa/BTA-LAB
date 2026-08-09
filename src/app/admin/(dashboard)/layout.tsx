import { requireAdmin } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/admin-script";
import { Toaster } from "react-hot-toast";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <AdminSidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/**
         * Admin top header — same height as the sidebar logo row (h-16) so the
         * page content starts at a consistent vertical position across every
         * admin page. On mobile its left padding (pl-16) clears the fixed menu
         * button instead of letting it overlap page titles.
         */}
        <header className="sticky top-0 z-20 h-16 flex items-center px-6 pl-16 lg:pl-10 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]/85 backdrop-blur-sm">
          <p className="hidden sm:block text-xs font-medium tracking-wide text-[var(--color-fg-tertiary)]/70">
            BTA LAB — ადმინისტრაცია
          </p>
        </header>
        <main className="flex-1">
          <div className="px-6 py-6 lg:px-10 lg:py-8 max-w-6xl">
            {children}
          </div>
        </main>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--color-bg-surface)",
            color: "var(--color-fg-primary)",
            border: "1px solid var(--color-border-primary)",
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />
    </div>
  );
}
