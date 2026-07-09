import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';

import { openDatabase } from '../db/index.js';
import { createUsersRepo } from '../auth/users.js';
import { createRequestsRepo } from '../db/requests.js';
import { createDiagnosticsRepo } from '../db/diagnostics.js';
import { handleSubmitDiagnostics } from '../diagnostics/handlers.js';
import { createDiagnosticsRouter } from '../diagnostics/routes.js';
import { sweepExpired } from '../lifecycle/sweeper.js';
import { signJwt } from '../auth/jwt.js';

const DAY = 24 * 60 * 60 * 1000;

function fakeRes() {
  return {
    statusCode: 200, body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

function setup() {
  const db = openDatabase(':memory:');
  const users = createUsersRepo(db);
  const diagnostics = createDiagnosticsRepo(db);
  const u = users.create({ email: 'runner@x.test', passwordHash: 'h', now: 1000 });
  return { db, users, diagnostics, u };
}

const payload = (over = {}) => ({
  runId: 'run-1',
  generatedAt: 111,
  seed: '42',
  runType: 'default',
  formatVersion: 2,
  counts: { fatal: 0, error: 1, warning: 1 },
  diagnostics: [
    { seq: 0, severity: 'error', code: 'TRAINER_SLOT_DROPPED', message: 'x', context: { trainerId: 'A', slotIndex: 5 } },
    { seq: 1, severity: 'warning', code: 'TRAINER_TEAM_SHORT', message: 'y', context: { trainerId: 'A', expected: 6, actual: 5 } },
  ],
  ...over,
});

// ── repository ────────────────────────────────────────────────────────────────

test('create stores a run with counts + events as JSON and the receive timestamp', () => {
  const { diagnostics, u } = setup();
  const row = diagnostics.create({
    id: 'run-1', userId: u.id, createdAt: 5000, generatedAt: 111,
    seed: '42', runType: 'default', appVersion: 'x', userAgent: 'UA',
    counts: { fatal: 0, error: 1, warning: 1 },
    events: payload().diagnostics,
  });
  assert.equal(row.id, 'run-1');
  assert.equal(row.user_id, u.id);
  assert.equal(row.created_at, 5000);
  assert.deepEqual(JSON.parse(row.counts_json), { fatal: 0, error: 1, warning: 1 });
  assert.equal(JSON.parse(row.events_json).length, 2);
});

test('create accepts an anonymous run (userId null)', () => {
  const { diagnostics } = setup();
  const row = diagnostics.create({
    id: 'anon-1', userId: null, createdAt: 1, counts: { fatal: 0, error: 0, warning: 0 }, events: [],
  });
  assert.equal(row.user_id, null);
});

test('all() returns rows newest-first, joining author email when present (null for anon)', () => {
  const { diagnostics, u } = setup();
  diagnostics.create({ id: 'a', userId: u.id, createdAt: 1000, counts: {}, events: [] });
  diagnostics.create({ id: 'b', userId: null, createdAt: 2000, counts: {}, events: [] });
  const rows = diagnostics.all();
  assert.equal(rows.length, 2);
  assert.equal(rows[0].id, 'b', 'newest first');
  assert.equal(rows[0].email, null, 'anonymous has no email');
  assert.equal(rows[1].email, 'runner@x.test');
});

test('purgeExpired deletes rows at/older than the cutoff and returns the count', () => {
  const { diagnostics } = setup();
  diagnostics.create({ id: 'old', userId: null, createdAt: 1000, counts: {}, events: [] });
  diagnostics.create({ id: 'new', userId: null, createdAt: 9000, counts: {}, events: [] });
  const n = diagnostics.purgeExpired(5000);
  assert.equal(n, 1);
  assert.equal(diagnostics.all().length, 1);
  assert.equal(diagnostics.all()[0].id, 'new');
});

test('deleteForUser lets a user with diagnostics be deleted (FK stays satisfied)', () => {
  const { db, users, diagnostics, u } = setup();
  diagnostics.create({ id: 'r', userId: u.id, createdAt: 1, counts: {}, events: [] });
  assert.throws(() => users.delete(u.id), /FOREIGN KEY|constraint/i);
  diagnostics.deleteForUser(u.id);
  assert.doesNotThrow(() => users.delete(u.id));
  assert.equal(db.prepare('SELECT COUNT(*) n FROM diagnostics WHERE user_id = ?').get(u.id).n, 0);
});

// ── handler ───────────────────────────────────────────────────────────────────

test('handler stores a valid submission and returns 201', () => {
  const { diagnostics, u } = setup();
  const res = fakeRes();
  handleSubmitDiagnostics({ diagnostics, now: () => 7000 })(
    { userId: u.id, headers: { 'user-agent': 'Jest' }, body: payload() }, res,
  );
  assert.equal(res.statusCode, 201);
  const rows = diagnostics.all();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].created_at, 7000);
  assert.equal(rows[0].user_agent, 'Jest');
  assert.equal(JSON.parse(rows[0].events_json).length, 2);
});

test('handler rejects a payload with no runId', () => {
  const { diagnostics } = setup();
  const res = fakeRes();
  handleSubmitDiagnostics({ diagnostics })({ headers: {}, body: payload({ runId: undefined }) }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(diagnostics.all().length, 0);
});

test('handler rejects when diagnostics is not an array', () => {
  const { diagnostics } = setup();
  const res = fakeRes();
  handleSubmitDiagnostics({ diagnostics })({ headers: {}, body: payload({ diagnostics: 'nope' }) }, res);
  assert.equal(res.statusCode, 400);
});

test('handler caps the number of stored events', () => {
  const { diagnostics } = setup();
  const many = Array.from({ length: 999 }, (_, i) => ({ seq: i, severity: 'warning', code: 'X', message: 'm' }));
  const res = fakeRes();
  handleSubmitDiagnostics({ diagnostics, maxEvents: 500 })(
    { headers: {}, body: payload({ diagnostics: many }) }, res,
  );
  assert.equal(res.statusCode, 201);
  assert.equal(JSON.parse(diagnostics.all()[0].events_json).length, 500);
});

test('handler derives counts from events when the client omits them', () => {
  const { diagnostics } = setup();
  const res = fakeRes();
  handleSubmitDiagnostics({ diagnostics })({ headers: {}, body: payload({ counts: undefined }) }, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(JSON.parse(diagnostics.all()[0].counts_json), { fatal: 0, error: 1, warning: 1 });
});

// ── route wiring (optional auth) ─────────────────────────────────────────────────

async function withServer(fn) {
  const SECRET = 'test-secret';
  const db = openDatabase(':memory:');
  const users = createUsersRepo(db);
  const diagnostics = createDiagnosticsRepo(db);
  const u = users.create({ email: 'poster@x.test', passwordHash: 'h' });

  const app = express();
  app.use('/api', createDiagnosticsRouter({ diagnostics, jwtSecret: SECRET }));
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const { port } = server.address();
  const url = `http://localhost:${port}/api/diagnostics`;
  const token = signJwt({ sub: u.id }, SECRET, { expiresInSec: 60 });
  try { await fn({ url, token, diagnostics, u }); } finally { server.close(); }
}

test('POST /api/diagnostics with a token records the user_id', async () => {
  await withServer(async ({ url, token, diagnostics, u }) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(payload()),
    });
    assert.equal(res.status, 201);
    assert.equal(diagnostics.all()[0].user_id, u.id);
  });
});

test('POST /api/diagnostics WITHOUT a token is accepted and stored anonymously (optional auth)', async () => {
  await withServer(async ({ url, diagnostics }) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload({ runId: 'anon-run' })),
    });
    assert.equal(res.status, 201);
    assert.equal(diagnostics.all()[0].user_id, null);
  });
});

// ── sweeper integration (48h retention) ─────────────────────────────────────────

test('sweepExpired purges diagnostics rows older than the TTL', () => {
  const db = openDatabase(':memory:');
  const requests = createRequestsRepo(db);
  const diagnostics = createDiagnosticsRepo(db);
  const now = 100 * DAY;
  diagnostics.create({ id: 'stale', userId: null, createdAt: now - 3 * DAY, counts: {}, events: [] });
  diagnostics.create({ id: 'recent', userId: null, createdAt: now - 1 * DAY, counts: {}, events: [] });

  sweepExpired({ requests, diagnostics, removeFile: () => {}, now, ttlMs: 2 * DAY });

  assert.equal(diagnostics.all().length, 1);
  assert.equal(diagnostics.all()[0].id, 'recent');
});
