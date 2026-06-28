import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';

import { createAuthRouter } from '../auth/routes.js';

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
