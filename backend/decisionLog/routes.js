/**
 * Decision-log HTTP route (T-210). Thin express glue: `POST /api/decision-log`, behind OPTIONAL
 * auth (randomization needs no account, so logged-out runs still report — anonymously) and a
 * per-IP rate limit. A larger JSON body limit than diagnostics because the payload is a full text
 * trace. Mirrors diagnostics/routes.js. Mounted under /api by server.js. There is deliberately NO
 * GET route — the log is never served to a browser; the owner reads it via the /decision-log skill.
 */

import express from 'express';
import { optionalAuth, ipRateLimit } from '../auth/middleware.js';
import { createRateLimiter } from '../email/rateLimiter.js';
import { handleSubmitDecisionLog } from './handlers.js';

export function createDecisionLogRouter({ decisionLogs, jwtSecret }) {
  const router = express.Router();

  // Anti-spam: a client reports once per generation; 30/min/IP covers rapid re-rolls.
  const throttle = ipRateLimit(createRateLimiter({ max: 30, windowMs: 60 * 1000 }));

  router.post(
    '/decision-log',
    optionalAuth(jwtSecret),
    throttle,
    express.json({ limit: '2mb' }),
    handleSubmitDecisionLog({ decisionLogs }),
  );

  return router;
}
