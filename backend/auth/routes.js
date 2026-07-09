/**
 * Auth HTTP routes (T-021, ADR-004). Thin express glue over the auth service.
 * Mounted under /api by server.js. Verified gate + per-IP rate limits applied here.
 */

import express from 'express';
import { requireAuth, ipRateLimit } from './middleware.js';
import { createRateLimiter } from '../email/rateLimiter.js';

export function createAuthRouter({ service, users, requests, runs, tokens, feedback, diagnostics, jwtSecret, removeFile, db, killActiveBuild }) {
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

  // Delete the account + all its data (T-035). FKs aren't ON DELETE CASCADE, so children go first:
  // purge requests (and their files), then runs, tokens, finally the user — atomically.
  router.delete('/account', requireAuth(jwtSecret), (req, res) => {
    const uid = req.userId;
    if (!users.get(uid)) return res.status(404).json({ error: 'not found' });
    // a build for this user may be running (serial worker → at most one); note it to kill after purge
    const active = requests?.getActiveForUser?.(uid);
    const run = () => {
      requests?.purgeAllForUser?.(uid, removeFile);
      runs?.deleteForUser?.(uid);
      tokens?.deleteForUser?.(uid);
      feedback?.deleteForUser?.(uid); // FK is not ON DELETE CASCADE — clear feedback before the user (T-048)
      diagnostics?.deleteForUser?.(uid); // same FK guard for diagnostics (T-075)
      users.delete(uid);
    };
    if (db) {
      db.exec('BEGIN');
      try { run(); db.exec('COMMIT'); }
      catch (err) { db.exec('ROLLBACK'); return res.status(500).json({ error: 'could not delete account' }); }
    } else { run(); }
    if (active) killActiveBuild?.(active.id); // stop the in-flight make now that its row is gone (T-035)
    res.json({ ok: true });
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
