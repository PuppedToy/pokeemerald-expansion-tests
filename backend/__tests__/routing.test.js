import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';

import { createAuthRouter } from '../auth/routes.js';
import { signJwt } from '../auth/jwt.js';

// B-006: the auth router is mounted at /api. A router-level body parser there would
// also run for OTHER /api routes (e.g. /api/produce, ~32 MB) and reject them with its
// small limit before the produce router's 50 MB parser. Guard: a large body to a
// non-auth /api route must NOT be rejected by the auth router.
test('auth router does not body-parse other /api routes (B-006)', async () => {
  const app = express();
  app.use('/api', createAuthRouter({ service: {}, users: { get: () => null }, requests: {}, jwtSecret: 'x' }));
  app.post('/api/produce', express.json({ limit: '50mb' }), (req, res) => res.json({ ok: true, n: req.body?.data?.length ?? 0 }));

  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const { port } = server.address();
  try {
    const body = JSON.stringify({ data: 'x'.repeat(2 * 1024 * 1024) }); // ~2 MB > auth's 1 MB limit
    const res = await fetch(`http://localhost:${port}/api/produce`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body,
    });
    assert.notEqual(res.status, 413, 'auth router must not reject large bodies meant for other /api routes');
    assert.equal(res.status, 200);
  } finally {
    server.close();
  }
});

// T-216 — /api/me exposes the beta invite_state so the frontend can render the gate (badge/settings/held).
test('/api/me returns the beta invite_state (T-216)', async () => {
  const app = express();
  const user = { id: 1, email: 'u@x.test', verified: 1, invite_state: 'pending' };
  app.use('/api', createAuthRouter({
    service: {}, users: { get: (id) => (id === 1 ? user : null) }, requests: {}, adminEmails: [], jwtSecret: 'x',
  }));
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const { port } = server.address();
  try {
    const token = signJwt({ sub: 1 }, 'x');
    const res = await fetch(`http://localhost:${port}/api/me`, { headers: { authorization: `Bearer ${token}` } });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.inviteState, 'pending');
    assert.equal(body.verified, true);
  } finally {
    server.close();
  }
});
