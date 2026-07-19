import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { redirectWithCookies, updateSession } from "@/lib/supabase/proxy";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { logSecurityEvent } from "@/lib/security/logging";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next({ request });
  }

  const { response, user, supabase } = await updateSession(request);
  const isLogin = pathname === "/admin/login";

  if (!user || !supabase) {
    if (isLogin) {
      return response;
    }

    return redirectWithCookies(new URL("/admin/login", request.url), response);
  }

  const adminSupabase = createServiceRoleClient();
  const { data: adminProfile, error: adminError } = await adminSupabase
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !adminProfile) {
    if (adminError) console.error("Proxy admin verification failed:", adminError.message);
    logSecurityEvent({
      event: "admin_unauthorized",
      route: pathname,
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      userId: user.id,
      reason: "missing_admin_profile",
    });
    await supabase.auth.signOut({ scope: "global" });
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "unauthorized");
    return redirectWithCookies(loginUrl, response);
  }

  const mfaStatus = await getProxyMfaStatus(supabase);
  if (mfaStatus.requiresMfa && !mfaStatus.verified) {
    if (isLogin) return response;
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("mfa", "required");
    return redirectWithCookies(loginUrl, response);
  }

  if (isLogin) {
    return redirectWithCookies(new URL("/admin", request.url), response);
  }

  return response;
}

async function getProxyMfaStatus(supabase: NonNullable<Awaited<ReturnType<typeof updateSession>>["supabase"]>) {
  const [aalResult, factorResult] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  if (aalResult.error || factorResult.error) {
    console.error(
      "Proxy MFA status check failed:",
      aalResult.error?.message || factorResult.error?.message
    );
    return { requiresMfa: false, verified: true };
  }

  const hasVerifiedTotp = (factorResult.data?.totp ?? []).length > 0;
  return {
    requiresMfa: hasVerifiedTotp,
    verified: !hasVerifiedTotp || aalResult.data?.currentLevel === "aal2",
  };
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images(?:/|$)|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|woff2?|ttf|otf)$).*)",
  ],
};
