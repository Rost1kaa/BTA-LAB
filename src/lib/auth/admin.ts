import "server-only";

import { redirect } from "next/navigation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/logging";
import { getRequestContext, verifySameOriginRequest } from "@/lib/security/request";
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

  const { requiresMfa, verified } = await getAdminMfaStatus(authSupabase);
  if (requiresMfa && !verified) {
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

export async function requireAdminMutation(action: string) {
  const { ip, route } = await getRequestContext();
  const sameOrigin = await verifySameOriginRequest();

  if (!sameOrigin) {
    logSecurityEvent({
      event: "admin_mutation_blocked",
      route,
      ip,
      reason: "origin_mismatch",
    });
    return null;
  }

  const admin = await requireAdmin({ redirectToLogin: false });
  if (!admin) {
    logSecurityEvent({
      event: "admin_unauthorized",
      route,
      ip,
      reason: action,
    });
    return null;
  }

  const rateLimit = checkRateLimit(`admin:${action}`, `${admin.user.id}:${ip}`, {
    limit: 60,
    windowMs: 60_000,
    blockMs: 5 * 60_000,
  });

  if (!rateLimit.allowed) {
    logSecurityEvent({
      event: "admin_mutation_blocked",
      route,
      userId: admin.user.id,
      ip,
      reason: `${action}:rate_limited`,
    });
    return null;
  }

  return admin;
}

async function getAdminMfaStatus(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const [aalResult, factorResult] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  if (aalResult.error || factorResult.error) {
    console.error(
      "Admin MFA status check failed:",
      aalResult.error?.message || factorResult.error?.message
    );
    return { requiresMfa: false, verified: true };
  }

  const hasVerifiedTotp = (factorResult.data?.totp ?? []).length > 0;
  return {
    requiresMfa: hasVerifiedTotp || aalResult.data?.nextLevel === "aal2",
    verified: !hasVerifiedTotp || aalResult.data?.currentLevel === "aal2",
  };
}
