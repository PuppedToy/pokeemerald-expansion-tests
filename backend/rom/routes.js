/**
 * ROM-ownership endpoint (T-022, ADR-008). POST /api/rom/validate accepts the raw
 * ROM as an octet-stream body (zero-dep, no multer), hashes it, and on a match flips
 * the user's `owns_valid_rom` flag. The bytes live only in memory for the request and
 * are never written to disk — validate-and-delete.
 */

import express from 'express';
import { requireAuth, ipRateLimit } from '../auth/middleware.js';
import { createRateLimiter } from '../email/rateLimiter.js';
import { createRomValidator, EMERALD_SIZE } from './validate.js';

/** Testable handler: assumes req.userId (auth) and req.body (Buffer). */
export function handleValidate({ users, validator }) {
  return (req, res) => {
    const buf = req.body;
    if (!Buffer.isBuffer(buf) || buf.length === 0) {
      return res.status(400).json({ error: 'no ROM uploaded' });
    }
    const { ok } = validator.validate(buf);
    if (!ok) {
      return res.status(400).json({ ok: false, error: 'not a recognized Pokémon Emerald ROM' });
    }
    users.setOwnsValidRom(req.userId, true);
    res.json({ ok: true });
  };
}

export function createRomRouter({ users, jwtSecret, validator = createRomValidator() }) {
  const router = express.Router();
  const throttle = ipRateLimit(createRateLimiter({ max: 10, windowMs: 60 * 1000 }));

  router.post(
    '/validate',
    requireAuth(jwtSecret),
    throttle,
    // size-bound the upload to just over the vanilla size before reading it
    express.raw({ type: '*/*', limit: EMERALD_SIZE + 64 * 1024 }),
    handleValidate({ users, validator }),
  );

  return router;
}
