import "server-only";

interface RateLimitOptions {
  limit: number;
  windowMs: number;
  blockMs?: number;
}

interface Bucket {
  count: number;
  resetAt: number;
  blockedUntil: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  namespace: string,
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const bucketKey = `${namespace}:${key}`;
  const current = buckets.get(bucketKey);

  if (current?.blockedUntil && current.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((current.blockedUntil - now) / 1000),
    };
  }

  const bucket =
    current && current.resetAt > now
      ? current
      : { count: 0, resetAt: now + options.windowMs, blockedUntil: 0 };

  bucket.count += 1;

  if (bucket.count > options.limit) {
    bucket.blockedUntil = now + (options.blockMs ?? options.windowMs);
    buckets.set(bucketKey, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.blockedUntil - now) / 1000),
    };
  }

  buckets.set(bucketKey, bucket);
  return {
    allowed: true,
    remaining: Math.max(options.limit - bucket.count, 0),
    retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

export function clearRateLimit(namespace: string, key: string) {
  buckets.delete(`${namespace}:${key}`);
}

export function getRateLimitStatus(
  namespace: string,
  key: string,
  options: RateLimitOptions
) {
  const now = Date.now();
  const bucket = buckets.get(`${namespace}:${key}`);
  if (!bucket || bucket.resetAt <= now) {
    return { requiresCaptcha: false, blocked: false, retryAfterSeconds: 0 };
  }

  return {
    requiresCaptcha: bucket.count >= Math.max(2, options.limit - 1),
    blocked: bucket.blockedUntil > now,
    retryAfterSeconds:
      bucket.blockedUntil > now ? Math.ceil((bucket.blockedUntil - now) / 1000) : 0,
  };
}
