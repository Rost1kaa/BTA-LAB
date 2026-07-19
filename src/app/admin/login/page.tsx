import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth/admin";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [admin, params] = await Promise.all([getAdminContext(), searchParams]);

  if (admin) {
    redirect("/admin");
  }

  const initialError =
    params.error === "unauthorized"
      ? "Unable to sign in. Check your credentials and try again."
      : null;

  return (
    <LoginForm
      initialError={initialError}
      turnstileSiteKey={process.env.TURNSTILE_SITE_KEY || null}
    />
  );
}
