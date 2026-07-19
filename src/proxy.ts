import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { redirectWithCookies, updateSession } from "@/lib/supabase/proxy";
import { createServiceRoleClient } from "@/lib/supabase/server";

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
    if (adminError) {
      console.error("Proxy admin verification failed:", adminError.message);
    }
    await supabase.auth.signOut();
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "unauthorized");
    return redirectWithCookies(loginUrl, response);
  }

  if (isLogin) {
    return redirectWithCookies(new URL("/admin", request.url), response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images(?:/|$)|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|woff2?|ttf|otf)$).*)",
  ],
};
