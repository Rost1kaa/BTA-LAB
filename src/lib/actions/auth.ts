"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/security/captcha";
import { clearRateLimit, checkRateLimit, getRateLimitStatus } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/logging";
import { getRequestContext } from "@/lib/security/request";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  totp: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit code.").optional().or(z.literal("")),
  turnstileToken: z.string().trim().optional().or(z.literal("")),
});

export interface LoginState {
  error: string | null;
  mfaRequired?: boolean;
  captchaRequired?: boolean;
  email?: string;
}

const GENERIC_LOGIN_ERROR = "Unable to sign in. Check your credentials and try again.";
const LOGIN_RATE_LIMIT = {
  limit: 6,
  windowMs: 10 * 60_000,
  blockMs: 15 * 60_000,
};

export async function login(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const { ip, route } = await getRequestContext();
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    totp: formData.get("totp"),
    turnstileToken: formData.get("cf-turnstile-response"),
  });

  if (!parsed.success) {
    return { error: GENERIC_LOGIN_ERROR };
  }

  const email = parsed.data.email.toLowerCase();
  const ipLimit = checkRateLimit("admin-login-ip", ip, LOGIN_RATE_LIMIT);
  const emailLimit = checkRateLimit("admin-login-email", email, LOGIN_RATE_LIMIT);
  const captchaRequired =
    isTurnstileConfigured() &&
    (getRateLimitStatus("admin-login-ip", ip, LOGIN_RATE_LIMIT).requiresCaptcha ||
      getRateLimitStatus("admin-login-email", email, LOGIN_RATE_LIMIT).requiresCaptcha);

  if (!ipLimit.allowed || !emailLimit.allowed) {
    logSecurityEvent({
      event: "admin_login_rate_limited",
      route,
      ip,
      email,
      reason: "login_attempt_limit",
    });
    return { error: GENERIC_LOGIN_ERROR, captchaRequired, email };
  }

  if (captchaRequired) {
    const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
    if (!captcha.ok) {
      logSecurityEvent({
        event: "captcha_failed",
        route,
        ip,
        email,
        reason: "admin_login",
      });
      return { error: GENERIC_LOGIN_ERROR, captchaRequired: true, email };
    }
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: signInError,
  } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (signInError || !user) {
    logSecurityEvent({
      event: "admin_login_failed",
      route,
      ip,
      email,
      reason: "invalid_credentials",
    });
    return {
      error: GENERIC_LOGIN_ERROR,
      captchaRequired,
      email,
    };
  }

  const adminSupabase = createServiceRoleClient();
  const { data: profile, error: profileError } = await adminSupabase
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Admin profile verification failed:", profileError.message);
    await supabase.auth.signOut();
    return { error: GENERIC_LOGIN_ERROR };
  }

  if (!profile) {
    await supabase.auth.signOut();
    logSecurityEvent({
      event: "admin_unauthorized",
      route,
      ip,
      email,
      userId: user.id,
      reason: "missing_admin_profile",
    });
    return { error: GENERIC_LOGIN_ERROR };
  }

  const mfaResult = await verifyAdminMfaIfRequired(supabase, parsed.data.totp || "");
  if (mfaResult.required && !mfaResult.verified) {
    if (mfaResult.failed) {
      logSecurityEvent({
        event: "admin_mfa_failed",
        route,
        ip,
        email,
        userId: user.id,
        reason: "invalid_totp",
      });
      return { error: GENERIC_LOGIN_ERROR, mfaRequired: true, captchaRequired, email };
    }
    return { error: null, mfaRequired: true, captchaRequired, email };
  }

  clearRateLimit("admin-login-ip", ip);
  clearRateLimit("admin-login-email", email);
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut({ scope: "global" });

  if (error) {
    console.error("Admin logout failed:", error.message);
  }

  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

async function verifyAdminMfaIfRequired(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  code: string
) {
  const [aalResult, factorsResult] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  if (aalResult.error || factorsResult.error) {
    console.error(
      "Admin MFA verification setup failed:",
      aalResult.error?.message || factorsResult.error?.message
    );
    return { required: false, verified: true, failed: false };
  }

  const factor = factorsResult.data?.totp?.[0];
  const required = Boolean(factor) && aalResult.data?.currentLevel !== "aal2";

  if (!required) {
    return { required: false, verified: true, failed: false };
  }

  if (!code) {
    return { required: true, verified: false, failed: false };
  }

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: factor.id,
    code,
  });

  return {
    required: true,
    verified: !error,
    failed: Boolean(error),
  };
}
