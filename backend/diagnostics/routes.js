/**
 * Diagnostics HTTP routes (T-075). Thin express glue: `POST /api/diagnostics`, behind OPTIONAL
 * auth (randomization needs no account, so logged-out runs still report — anonymously) and a
 * per-IP rate limit. A larger JSON limit than feedback because a run's event list, while capped,
 * can carry rich context. Mounted under /api by server.js.
 */

import express from 'express';
import { optionalAuth, ipRateLimit } from '../auth/middleware.js';
import { createRateLimiter } from '../email/rateLimiter.js';
import { handleSubmitDiagnostics } from './handlers.js';

export function createDiagnosticsRouter({ diagnostics, jwtSecret }) {
  const router = express.Router();

  // Anti-spam: a client reports once per generation; 30/min/IP covers rapid re-rolls.
  const throttle = ipRateLimit(createRateLimiter({ max: 30, windowMs: 60 * 1000 }));

  router.post(
    '/diagnostics',
    optionalAuth(jwtSecret),
    throttle,
    express.json({ limit: '2mb' }),
    handleSubmitDiagnostics({ diagnostics }),
  );

  return router;
}
