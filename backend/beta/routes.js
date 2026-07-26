/**
 * Beta admin router (T-217). All routes are admin-only (env ADMIN_EMAILS, same gate as preset
 * moderation) and mounted under /api by server.js → /api/admin/beta/*. Non-admins get 403; the
 * frontend hides the whole panel unless /api/me.isAdmin.
 */

import express from 'express';
import { requireAuth } from '../auth/middleware.js';
import { isAdminEmail } from '../auth/admin.js';
import { handleOverview, handleInvite, handleAccept, handleSearch } from './handlers.js';

// requireAuth sets req.userId; this then requires that user to be an admin and stamps req.adminEmail
// (used to attribute audit rows).
function requireAdmin(users, adminEmails) {
  return (req, res, next) => {
    const u = req.userId ? users.get(req.userId) : null;
    if (!isAdminEmail(u?.email, adminEmails)) return res.status(403).json({ error: 'admin only' });
    req.adminEmail = u.email;
    next();
  };
}

export function createBetaAdminRouter({ users, requests, betaInvites, mailer, adminEmails = [], jwtSecret, baseUrl, avgRomSecs, db }) {
  const router = express.Router();
  const gate = [requireAuth(jwtSecret), requireAdmin(users, adminEmails)];
  const json = express.json({ limit: '256kb' });

  router.get('/admin/beta/overview', ...gate, handleOverview({ users, requests, betaInvites, avgRomSecs }));
  router.get('/admin/beta/search', ...gate, handleSearch({ users, requests }));
  router.post('/admin/beta/invite', ...gate, json, handleInvite({ users, requests, betaInvites, mailer, baseUrl, avgRomSecs, db }));
  router.post('/admin/beta/accept', ...gate, json, handleAccept({ users, requests, betaInvites, mailer, baseUrl, avgRomSecs, db }));

  return router;
}
