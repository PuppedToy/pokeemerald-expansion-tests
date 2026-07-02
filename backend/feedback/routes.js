/**
 * Feedback HTTP routes (T-048). Thin express glue: `POST /api/feedback`, behind the bearer-JWT gate
 * (logged-in users only) and a modest per-IP rate limit (anti-spam). Mounted under /api by server.js.
 */

import express from 'express';
import { requireAuth, ipRateLimit } from '../auth/middleware.js';
import { createRateLimiter } from '../email/rateLimiter.js';
import { handleSubmitFeedback } from './handlers.js';

export function createFeedbackRouter({ feedback, jwtSecret }) {
  const router = express.Router();

  // Anti-spam: a handful of submissions per minute per IP is plenty for genuine feedback.
  const throttle = ipRateLimit(createRateLimiter({ max: 10, windowMs: 60 * 1000 }));

  router.post(
    '/feedback',
    requireAuth(jwtSecret),
    throttle,
    express.json({ limit: '64kb' }), // feedback bodies are tiny
    handleSubmitFeedback({ feedback }),
  );

  return router;
}
