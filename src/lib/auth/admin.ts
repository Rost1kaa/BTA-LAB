import "server-only";

import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";
import type { AdminProfile } from "@/types/supabase";

export async function getAdminContext() {
  const authSupabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await authSupabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  // Admin membership is trusted server data. Use the server-only client here so
  // authentication does not depend on the deployed admin_profiles RLS policy.
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("id, email, display_name, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Admin profile verification failed:", error.message);
    return null;
  }

  return {
    user,
    profile: data as AdminProfile,
    supabase,
  };
}

type AdminContext = NonNullable<Awaited<ReturnType<typeof getAdminContext>>>;

export function requireAdmin(): Promise<AdminContext>;
export function requireAdmin(options: { redirectToLogin: false }): Promise<AdminContext | null>;
export async function requireAdmin(options?: { redirectToLogin?: boolean }) {
  const admin = await getAdminContext();

  if (!admin && options?.redirectToLogin !== false) {
    redirect("/admin/login");
  }

  return admin;
}
