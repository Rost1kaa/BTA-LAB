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
      <main className="lg:ml-64 min-h-screen">
        <div className="px-6 py-6 lg:px-10 lg:py-8 max-w-6xl">
          {children}
        </div>
      </main>
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
