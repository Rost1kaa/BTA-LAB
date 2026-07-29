import "server-only";
import { createHash, randomBytes, randomInt } from "node:crypto";

const OTP_SIGNING_SECRET = () => process.env.OTP_SIGNING_SECRET || "otp-dev-secret-change-in-production";

/**
 * Generate a signed verification token tied to an email.
 * The token expires in 30 minutes by default.
 */
export function generateVerificationToken(email: string): string {
  const secret = OTP_SIGNING_SECRET();
  const randomPart = randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
  const payload = `${email}:${randomPart}:${expiresAt}`;
  const signature = createHash("sha256")
    .update(`${payload}:${secret}`)
    .digest("hex")
    .substring(0, 24);
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

/**
 * Verify a signed verification token and extract the email and expiry.
 * Returns null if the token is invalid or expired.
 */
export function verifyTokenIntegrity(token: string): { email: string; expiresAt: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 4) return null;

    const email = parts[0];
    const expiresAt = parseInt(parts[parts.length - 2], 10);
    const signature = parts[parts.length - 1];
    const payload = parts.slice(0, -1).join(":");

    const secret = OTP_SIGNING_SECRET();
    const expectedSig = createHash("sha256")
      .update(`${payload}:${secret}`)
      .digest("hex")
      .substring(0, 24);

    if (signature !== expectedSig) return null;
    if (Date.now() > expiresAt) return null;

    return { email, expiresAt };
  } catch {
    return null;
  }
}

/**
 * Generate a 6-digit OTP code.
 */
export function generateOtpCode(): string {
  return String(randomInt(100000, 999999));
}
