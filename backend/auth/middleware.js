/**
 * Express auth middleware (T-021, ADR-004): bearer-JWT gate, verified-email gate,
 * and a per-IP rate limiter for auth routes. Written as plain (req,res,next)
 * functions so they are testable with fake req/res, no server needed.
 */

import { verifyJwt } from './jwt.js';

export function requireAuth(jwtSecret) {
  return (req, res, next) => {
    const m = /^Bearer (.+)$/.exec(req.headers?.authorization || '');
    if (!m) return res.status(401).json({ error: 'missing token' });
    try {
      req.userId = verifyJwt(m[1], jwtSecret).sub;
      next();
    } catch {
      res.status(401).json({ error: 'invalid token' });
    }
  };
}

/**
 * Optional bearer-JWT gate (T-075): sets req.userId when a valid token is present, otherwise
 * continues anonymously (req.userId stays undefined). Used by endpoints that logged-out users
 * may still hit — e.g. diagnostics reporting (randomization does not require an account).
 */
export function optionalAuth(jwtSecret) {
  return (req, _res, next) => {
    const m = /^Bearer (.+)$/.exec(req.headers?.authorization || '');
    if (m) {
      try { req.userId = verifyJwt(m[1], jwtSecret).sub; } catch { /* ignore: stay anonymous */ }
    }
    next();
  };
}

export function requireVerified(users) {
  return (req, res, next) => {
    const user = users.get(req.userId);
    if (!user || !user.verified) return res.status(403).json({ error: 'email not verified' });
    next();
  };
}

export function requireOwnsRom(users) {
  return (req, res, next) => {
    const user = users.get(req.userId);
    if (!user || !user.owns_valid_rom) return res.status(403).json({ error: 'ROM ownership not verified' });
    next();
  };
}

/** Per-IP throttle backed by the shared rolling-window limiter. */
export function ipRateLimit(limiter) {
  return (req, res, next) => {
    const key = req.ip || req.headers?.['x-forwarded-for'] || 'unknown';
    if (!limiter.allow(key)) return res.status(429).json({ error: 'too many requests' });
    next();
  };
}
