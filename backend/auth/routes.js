/**
 * Auth HTTP routes (T-021, ADR-004). Thin express glue over the auth service.
 * Mounted under /api by server.js. Verified gate + per-IP rate limits applied here.
 */

import express from 'express';
import { requireAuth, ipRateLimit } from './middleware.js';
import { createRateLimiter } from '../email/rateLimiter.js';

export function createAuthRouter({ service, users, requests, jwtSecret }) {
  const router = express.Router();

  // Parse JSON per-route (NOT router.use): this router is mounted at /api, so a
  // router-level body parser would also run for /api/produce (32 MB) and reject it
  // with its small limit before the produce router's 50 MB parser — see B-006.
  const json = express.json({ limit: '1mb' }); // auth bodies are small JSON

  // Per-IP throttle on the abuse-prone routes (ADR-004 anti-abuse).
  const limiter = createRateLimiter({ max: 20, windowMs: 60 * 1000 });
  const throttle = ipRateLimit(limiter);

  router.post('/register', throttle, json, async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    try {
      await service.register({ email, password });
      res.status(201).json({ ok: true });
    } catch (err) {
      res.status(409).json({ error: err.message });
    }
  });

  router.post('/login', throttle, json, async (req, res) => {
    const { email, password } = req.body ?? {};
    try {
      res.json(await service.login({ email, password }));
    } catch {
      res.status(401).json({ error: 'invalid credentials' });
    }
  });

  router.post('/verify', json, async (req, res) => {
    const ok = await service.verifyEmail(req.body?.token);
    res.status(ok ? 200 : 400).json({ ok });
  });

  router.post('/forgot', throttle, json, async (req, res) => {
    await service.requestReset(req.body?.email);
    res.json({ ok: true });
  });

  router.post('/reset', json, async (req, res) => {
    const ok = await service.resetPassword(req.body?.token, req.body?.password);
    res.status(ok ? 200 : 400).json({ ok });
  });

  router.get('/me', requireAuth(jwtSecret), (req, res) => {
    const user = users.get(req.userId);
    if (!user) return res.status(404).json({ error: 'not found' });
    const active = requests?.getActiveForUser ? requests.getActiveForUser(user.id) : null;
    res.json({
      email: user.email,
      verified: !!user.verified,
      ownsValidRom: !!user.owns_valid_rom,
      activeRequest: active
        ? { id: active.id, state: active.state, romsDone: active.roms_done, romsTotal: active.roms_total }
        : null,
    });
  });

  return router;
}
