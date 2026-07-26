# BTA LAB Security Checklist

## Application Controls

- Public POST endpoints validate JSON payloads with Zod, check same-origin requests, and use in-memory abuse throttles.
- Admin mutations use `requireAdminMutation`, which verifies the Supabase session, checks the admin profile allowlist, validates same-origin requests, and rate limits write operations.
- Admin login uses generic error messages, IP/email throttling, optional Cloudflare Turnstile verification, and Supabase TOTP MFA enforcement for enrolled administrators.
- Uploads are limited to WebP, PNG, and JPEG by MIME type, extension, file size, and binary signature before the file is sent to Supabase Storage.
- Security logs mask email addresses and IP addresses before writing events.

## Required Infrastructure

- Enable HTTPS with automatic HTTP-to-HTTPS redirects in Coolify or the upstream reverse proxy.
- Keep the app behind WAF rules for login, contact, quiz, and upload routes.
- Keep Supabase Row Level Security enabled and apply all migrations in `supabase/migrations`.
- Enable Supabase point-in-time recovery or scheduled backups according to the project plan, and test restores.
- Protect production secrets in the hosting secret store. Never expose the Supabase service-role key to the browser.

## Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
SERVER_ACTION_ALLOWED_ORIGINS=
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=
SECURITY_ALERT_WEBHOOK_URL=
```

`TURNSTILE_SECRET_KEY` and `SECURITY_ALERT_WEBHOOK_URL` are optional. When `TURNSTILE_SECRET_KEY` is omitted, CAPTCHA validation is skipped and rate limits still apply.
