/**
 * Minimal admin layout.
 *
 * This layout wraps ALL /admin/* routes including /admin/login and /admin/logout.
 * It does NOT perform any auth check — that is the responsibility of
 * admin/(dashboard)/layout.tsx for protected dashboard pages only.
 *
 * This separation prevents the redirect loop where the layout would
 * redirect /admin/login back to itself for unauthenticated users.
 */

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
