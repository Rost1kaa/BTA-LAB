"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Script from "next/script";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { login, type LoginState } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full h-12 flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/40"
    >
      {pending ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Signing In…
        </>
      ) : (
        <>
          <LogIn size={16} aria-hidden="true" />
          Sign In
        </>
      )}
    </button>
  );
}

export function LoginForm({
  initialError,
  turnstileSiteKey,
}: {
  initialError: string | null;
  turnstileSiteKey: string | null;
}) {
  const initialState: LoginState = { error: initialError };
  const [state, formAction] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const showCaptcha = state.captchaRequired && turnstileSiteKey;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-4">
      {showCaptcha && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      )}
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">BTA</span>
            <span className="w-6 h-px bg-[var(--color-fg-tertiary)]/50" />
            <span className="text-sm font-light tracking-[0.2em] text-[var(--color-fg-tertiary)]/70 uppercase">Admin</span>
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-fg-primary)]">Sign In to Your Account</h1>
        </div>

        <form action={formAction} className="bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] rounded-2xl p-8 space-y-5">
          {state.error && (
            <p role="alert" aria-live="polite" className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
              {state.error}
            </p>
          )}

          <div className="space-y-2">
            <label htmlFor="admin-email" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Email</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              required
              defaultValue={state.email ?? ""}
              placeholder="admin@example.com"
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-password" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                className="w-full h-11 px-4 pr-10 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[var(--color-fg-tertiary)]/50 hover:text-[var(--color-fg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30 rounded-lg"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {state.mfaRequired && (
            <div className="space-y-2">
              <label htmlFor="admin-totp" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Authenticator Code</label>
              <input
                id="admin-totp"
                name="totp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                placeholder="123456"
                className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30 transition-colors"
              />
              <p className="text-xs text-[var(--color-fg-tertiary)]/60">
                Use the code from the authenticator app enrolled in Supabase MFA.
              </p>
            </div>
          )}

          {showCaptcha && (
            <div className="flex justify-center">
              <div
                className="cf-turnstile"
                data-sitekey={turnstileSiteKey}
                data-theme="auto"
              />
            </div>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
