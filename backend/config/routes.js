/**
 * Public app-config endpoint (T-216). Exposes the non-secret flags the frontend needs at boot —
 * currently just the BETA gate — to ANONYMOUS visitors too (the BETA badge + the randomizer warning
 * must render before login, and `/api/me` is login-only). No auth; no secrets.
 */

import express from 'express';

export function createConfigRouter({ beta = false } = {}) {
  const router = express.Router();
  router.get('/config', (_req, res) => res.json({ beta: !!beta }));
  return router;
}
