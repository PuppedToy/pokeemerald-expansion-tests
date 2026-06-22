/**
 * Per-recipient send rate limiter (T-027, ADR-007). In-memory rolling window.
 * Route/IP-level limits are auth-route middleware (T-021), not here.
 */

export function createRateLimiter({ max, windowMs, now = () => Date.now() }) {
  const hits = new Map(); // key -> timestamps within the window

  return {
    /** Returns true if a send is allowed for `key` (and records it), false if over the limit. */
    allow(key) {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((ts) => ts > t - windowMs);
      if (recent.length >= max) {
        hits.set(key, recent);
        return false;
      }
      recent.push(t);
      hits.set(key, recent);
      return true;
    },
  };
}
