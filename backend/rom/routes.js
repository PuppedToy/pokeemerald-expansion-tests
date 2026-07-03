/**
 * ROM-ownership endpoint (T-022; ADR-008 → superseded by ADR-013). POST /api/rom/validate now accepts
 * a JSON body `{ sha1 }` — the SHA-1 the CLIENT computed over the ROM it holds in IndexedDB. The server
 * only checks that hash against the known-good Emerald dumps and flips `owns_valid_rom`. The ROM bytes
 * never leave the user's machine, so there is nothing to upload or delete (T-053).
 */

import express from 'express';
import { requireAuth, ipRateLimit } from '../auth/middleware.js';
import { createRateLimiter } from '../email/rateLimiter.js';
import { createRomValidator } from './validate.js';

const SHA1_RE = /^[0-9a-f]{40}$/i;

/** Testable handler: assumes req.userId (auth) and req.body === { sha1 }. */
export function handleValidate({ users, validator }) {
  return (req, res) => {
    const sha1 = req.body?.sha1;
    if (typeof sha1 !== 'string' || !SHA1_RE.test(sha1)) {
      return res.status(400).json({ error: 'missing or malformed sha1' });
    }
    if (!validator.validateHash(sha1).ok) {
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
    express.json({ limit: '4kb' }), // just a hash now — not a 16 MB ROM upload
    handleValidate({ users, validator }),
  );

  return router;
}
