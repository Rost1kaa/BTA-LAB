"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/security/captcha";
import { clearRateLimit, checkRateLimit, getRateLimitStatus } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/logging";
import { getRequestContext } from "@/lib/security/request";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";

export interface LoginState {
  error: string | null;
  mfaRequired?: boolean;
  captchaRequired?: boolean;
  email?: string;
}

const LOGIN_ERRORS = {
  invalidInput: "Email and password are required.",
  invalidCredentials: "Invalid admin email or password.",
  missingAdminProfile: "This Supabase user is not linked to an admin profile. Run npm run admin:sync.",
  databaseError: "Admin profile verification failed. Check the Supabase schema and server logs.",
  mfaInvalid: "Invalid authenticator code.",
} as const;

const LOGIN_RATE_LIMIT = {
  limit: 6,
  windowMs: 10 * 60_000,
  blockMs: 15 * 60_000,
};

function logAuthLogin(details: {
  email: string;
  stage?: string;
  authError?: string | null;
  userId?: string | null;
  profileFound?: boolean | null;
  profileError?: string | null;
}) {
  console.info("AUTH LOGIN:", {
    email: details.email,
    stage: details.stage ?? null,
    supabaseAuthError: details.authError ?? null,
    userId: details.userId ?? null,
    adminProfileFound: details.profileFound ?? null,
    adminProfileError: details.profileError ?? null,
  });
}

function getFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function login(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const { ip, route } = await getRequestContext();
  const email = getFormString(formData, "email").trim().toLowerCase();
  const password = getFormString(formData, "password");
  const totp = getFormString(formData, "totp").trim();
  const turnstileToken = getFormString(formData, "cf-turnstile-response").trim();

  logAuthLogin({
    email,
    stage: "received",
  });

  if (!email || !password) {
    return { error: LOGIN_ERRORS.invalidInput, email };
  }

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
    return { error: LOGIN_ERRORS.invalidCredentials, captchaRequired, email };
  }

  if (captchaRequired) {
    const captcha = await verifyTurnstileToken(turnstileToken, ip);
    if (!captcha.ok) {
      logSecurityEvent({
        event: "captcha_failed",
        route,
        ip,
        email,
        reason: "admin_login",
      });
      return { error: LOGIN_ERRORS.invalidCredentials, captchaRequired: true, email };
    }
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: signInError,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !user) {
    logAuthLogin({
      email,
      stage: "supabase-auth",
      authError: signInError?.message ?? "No user returned from Supabase Auth.",
      userId: user?.id ?? null,
      profileFound: null,
    });
    if (signInError) console.error("Supabase admin login failed:", signInError.message);
    logSecurityEvent({
      event: "admin_login_failed",
      route,
      ip,
      email,
      reason: "invalid_credentials",
    });
    return {
      error: LOGIN_ERRORS.invalidCredentials,
      captchaRequired,
      email,
    };
  }

  const adminSupabase = createServiceRoleClient();
  const { data: profile, error: profileError } = await adminSupabase
    .from("admin_profiles")
    .select("id, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    logAuthLogin({
      email,
      stage: "admin-profile",
      authError: null,
      userId: user.id,
      profileFound: false,
      profileError: profileError.message,
    });
    console.error("Admin profile verification failed:", profileError.message);
    await supabase.auth.signOut();
    return { error: LOGIN_ERRORS.databaseError, email };
  }

  logAuthLogin({
    email,
    stage: "admin-profile",
    authError: null,
    userId: user.id,
    profileFound: Boolean(profile),
    profileError: null,
  });

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
    return { error: LOGIN_ERRORS.missingAdminProfile, email };
  }

  const mfaResult = await verifyAdminMfaIfRequired(supabase, totp);
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
      return { error: LOGIN_ERRORS.mfaInvalid, mfaRequired: true, captchaRequired, email };
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
