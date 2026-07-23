/**
 * Presets HTTP routes (T-192, ADR-021). Thin express glue mounted under /api by server.js. Reads are
 * optionalAuth (logged-out users can browse Official/Community; 'mine' 401s inside the handler);
 * writes require a bearer JWT, publishing also a verified email, and are per-IP throttled (anti-abuse).
 * Body JSON is parsed per-route (NOT router.use) with a small limit — a router-level parser would also
 * run for the 50 MB /api/produce route and reject it (B-006).
 */

import express from 'express';
import { requireAuth, optionalAuth, requireVerified, ipRateLimit } from '../auth/middleware.js';
import { createRateLimiter } from '../email/rateLimiter.js';
import {
  handleList, handleGet, handleCreate, handleUpdate,
  handlePublish, handleUnpublish, handleDelete, handleLike, handleSeedBalanced,
} from './handlers.js';

export function createPresetsRouter({ presets, presetLikes, presetViews, users, jwtSecret, adminEmails = [], idGen }) {
  const router = express.Router();
  const json = express.json({ limit: '256kb' }); // a config object is small; cap it anyway
  const throttle = ipRateLimit(createRateLimiter({ max: 30, windowMs: 60 * 1000 }));
  const deps = { presets, presetLikes, presetViews, users, adminEmails, idGen };

  // Reads
  router.get('/presets', optionalAuth(jwtSecret), handleList(deps));
  router.get('/presets/:id', optionalAuth(jwtSecret), handleGet(deps));

  // Writes
  // Admin seed of the built-in "Balanced" recommended preset — a fixed literal path, registered
  // before the ':id' write routes (its 3rd segment 'balanced' never matches publish/unpublish/like).
  router.post('/presets/official/balanced', requireAuth(jwtSecret), throttle, json, handleSeedBalanced(deps));
  router.post('/presets', requireAuth(jwtSecret), throttle, json, handleCreate(deps));
  router.put('/presets/:id', requireAuth(jwtSecret), throttle, json, handleUpdate(deps));
  router.post('/presets/:id/publish', requireAuth(jwtSecret), requireVerified(users), throttle, handlePublish(deps));
  router.post('/presets/:id/unpublish', requireAuth(jwtSecret), throttle, handleUnpublish(deps));
  router.delete('/presets/:id', requireAuth(jwtSecret), throttle, handleDelete(deps));
  router.post('/presets/:id/like', requireAuth(jwtSecret), throttle, handleLike(deps));

  return router;
}
