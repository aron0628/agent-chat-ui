export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_ATTEMPTS = 5;

const attempts = new Map<string, number[]>();

export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterMs?: number;
} {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Get and prune old entries
  const timestamps = (attempts.get(ip) ?? []).filter((t) => t > windowStart);
  attempts.set(ip, timestamps);

  if (timestamps.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    const oldestInWindow = timestamps[0];
    const retryAfterMs = oldestInWindow + RATE_LIMIT_WINDOW_MS - now;
    return { allowed: false, retryAfterMs };
  }

  timestamps.push(now);
  return { allowed: true };
}

// Periodic cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  for (const [ip, timestamps] of attempts.entries()) {
    const valid = timestamps.filter((t) => t > windowStart);
    if (valid.length === 0) {
      attempts.delete(ip);
    } else {
      attempts.set(ip, valid);
    }
  }
}, RATE_LIMIT_WINDOW_MS * 2);
