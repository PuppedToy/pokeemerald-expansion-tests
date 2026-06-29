import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';

import { openDatabase } from '../db/index.js';
import { createUsersRepo } from '../auth/users.js';
import { createTokensRepo } from '../auth/tokens.js';
import { createRequestsRepo } from '../db/requests.js';
import { createRunsRepo } from '../db/runs.js';
import { createAuthRouter } from '../auth/routes.js';
import { signJwt } from '../auth/jwt.js';

// T-035: DELETE /api/account removes the user AND all its children (FKs are not ON DELETE CASCADE),
// and deletes the request files. Exercised through the real router with a signed JWT.
test('DELETE /api/account cascades user data + files, then deletes the user', async () => {
  const SECRET = 'test-secret';
  const db = openDatabase(':memory:');
  const users = createUsersRepo(db);
  const tokens = createTokensRepo(db);
  const requests = createRequestsRepo(db);
  const runs = createRunsRepo(db);

  const u = users.create({ email: 'gone@x.test', passwordHash: 'h' });
  requests.create({ id: 'r1', userId: u.id, queueClass: 'fast', romsTotal: 1, bundlePath: '/b/r1.json', seed: '1', params: {}, now: 1 });
  runs.record({ userId: u.id, seed: '1', params: {}, now: 1 });
  tokens.issue(u.id, 'verify');

  const removed = [];
  const app = express();
  app.use('/api', createAuthRouter({
    service: {}, users, requests, runs, tokens, jwtSecret: SECRET,
    removeFile: (p) => removed.push(p), db,
  }));
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const { port } = server.address();
  try {
    const token = signJwt({ sub: u.id }, SECRET, { expiresInSec: 60 });
    const res = await fetch(`http://localhost:${port}/api/account`, {
      method: 'DELETE', headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).ok, true);

    assert.equal(users.get(u.id), null, 'user deleted');
    assert.equal(requests.get('r1'), null, 'request purged');
    assert.equal(runs.listForUser(u.id).length, 0, 'runs deleted');
    assert.ok(removed.includes('/b/r1.json'), 'request bundle file deleted');
    // a token row referencing the user must be gone too (else the FK would have blocked the delete)
    assert.equal(db.prepare('SELECT COUNT(*) n FROM auth_tokens WHERE user_id = ?').get(u.id).n, 0);
  } finally {
    server.close();
  }
});

test('DELETE /api/account without a token is rejected', async () => {
  const SECRET = 'test-secret';
  const db = openDatabase(':memory:');
  const app = express();
  app.use('/api', createAuthRouter({
    service: {}, users: createUsersRepo(db), requests: createRequestsRepo(db),
    runs: createRunsRepo(db), tokens: createTokensRepo(db), jwtSecret: SECRET, removeFile: () => {}, db,
  }));
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const { port } = server.address();
  try {
    const res = await fetch(`http://localhost:${port}/api/account`, { method: 'DELETE' });
    assert.equal(res.status, 401);
  } finally {
    server.close();
  }
});
