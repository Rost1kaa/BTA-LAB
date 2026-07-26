type SecurityEvent =
  | "admin_login_failed"
  | "admin_login_rate_limited"
  | "admin_mfa_failed"
  | "admin_unauthorized"
  | "admin_mutation_blocked"
  | "captcha_failed"
  | "contact_rate_limited"
  | "quiz_rate_limited"
  | "upload_rejected";

interface SecurityLogInput {
  event: SecurityEvent;
  route?: string;
  userId?: string | null;
  email?: string | null;
  ip?: string | null;
  reason?: string;
}

const ALERT_WINDOW_MS = 5 * 60 * 1000;
const ALERT_THRESHOLD = 5;
const alertBuckets = new Map<string, { count: number; resetAt: number; notified: boolean }>();

export function maskEmail(email?: string | null) {
  if (!email) return undefined;
  const normalized = email.trim().toLowerCase();
  const [name, domain] = normalized.split("@");
  if (!name || !domain) return "invalid-email";
  return `${name.slice(0, 2)}***@${domain}`;
}

export function maskIp(ip?: string | null) {
  if (!ip) return undefined;
  const firstIp = ip.split(",")[0]?.trim();
  if (!firstIp || firstIp === "unknown") return "unknown";

  if (firstIp.includes(":")) {
    return `${firstIp.split(":").slice(0, 3).join(":")}:***`;
  }

  const parts = firstIp.split(".");
  if (parts.length !== 4) return "unknown";
  return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
}

export function logSecurityEvent(input: SecurityLogInput) {
  const payload = {
    timestamp: new Date().toISOString(),
    event: input.event,
    route: input.route,
    userId: input.userId ?? undefined,
    email: maskEmail(input.email),
    ip: maskIp(input.ip),
    reason: input.reason,
  };

  console.warn("[security]", JSON.stringify(payload));
  maybeSendSecurityAlert(payload);
}

function maybeSendSecurityAlert(payload: Record<string, string | undefined>) {
  const webhookUrl = process.env.SECURITY_ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  const now = Date.now();
  const bucketKey = [
    payload.event,
    payload.route || "unknown-route",
    payload.email || payload.ip || "unknown-actor",
  ].join(":");
  const bucket = alertBuckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    alertBuckets.set(bucketKey, {
      count: 1,
      resetAt: now + ALERT_WINDOW_MS,
      notified: false,
    });
    return;
  }

  bucket.count += 1;

  if (bucket.count < ALERT_THRESHOLD || bucket.notified) {
    return;
  }

  bucket.notified = true;

  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      alert: "security_event_threshold_exceeded",
      count: bucket.count,
      windowSeconds: ALERT_WINDOW_MS / 1000,
    }),
  }).catch(() => {
    bucket.notified = false;
  });
}
