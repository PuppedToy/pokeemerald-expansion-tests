// T-210 — decision-log server store: repo + submit handler + retention sweep.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { openDatabase } from '../db/index.js';
import { createUsersRepo } from '../auth/users.js';
import { createDecisionLogsRepo } from '../db/decisionLogs.js';
import { handleSubmitDecisionLog } from '../decisionLog/handlers.js';
import { sweepExpired } from '../lifecycle/sweeper.js';

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
  const decisionLogs = createDecisionLogsRepo(db);
  const u = users.create({ email: 'runner@x.test', passwordHash: 'h', now: 1000 });
  return { db, users, decisionLogs, u };
}

test('repo: create → get, bySeed returns newest first', () => {
  const { decisionLogs, u } = setup();
  decisionLogs.create({ id: 'run-a', userId: u.id, createdAt: 100, seed: '42', text: 'first' });
  decisionLogs.create({ id: 'run-b', userId: u.id, createdAt: 200, seed: '42', text: 'second' });
  assert.equal(decisionLogs.get('run-a').text, 'first');
  const bySeed = decisionLogs.bySeed('42');
  assert.deepEqual(bySeed.map((r) => r.id), ['run-b', 'run-a']); // newest first
  assert.equal(decisionLogs.get('missing'), null);
});

test('handler: persists keyed by runId, idempotent on retry, caps huge text', () => {
  const { decisionLogs } = setup();
  const handler = handleSubmitDecisionLog({ decisionLogs, now: () => 5000, maxText: 10 });
  const res1 = fakeRes();
  handler({ body: { runId: 'r1', seed: 7, runType: 'default', text: 'x'.repeat(50) }, headers: {} }, res1);
  assert.equal(res1.statusCode, 201);
  const row = decisionLogs.get('r1');
  assert.equal(row.text.length, 10);          // capped by maxText
  assert.equal(row.seed, '7');
  assert.equal(row.created_at, 5000);
  // retry with same runId replaces (no duplicate)
  const res2 = fakeRes();
  handler({ body: { runId: 'r1', text: 'shorter' }, headers: {} }, res2);
  assert.equal(res2.statusCode, 201);
  assert.equal(decisionLogs.get('r1').text, 'shorter');
  assert.equal(decisionLogs.all().length, 1);
});

test('handler: rejects missing runId or empty text', () => {
  const { decisionLogs } = setup();
  const handler = handleSubmitDecisionLog({ decisionLogs });
  const r1 = fakeRes();
  handler({ body: { text: 'hi' }, headers: {} }, r1);
  assert.equal(r1.statusCode, 400);
  const r2 = fakeRes();
  handler({ body: { runId: 'r' }, headers: {} }, r2);
  assert.equal(r2.statusCode, 400);
  assert.equal(decisionLogs.all().length, 0);
});

test('retention: the sweeper purges decision logs older than the TTL', () => {
  const { decisionLogs } = setup();
  const now = 100 * DAY;
  decisionLogs.create({ id: 'old', createdAt: now - 3 * DAY, text: 'stale' });
  decisionLogs.create({ id: 'fresh', createdAt: now - 1 * DAY, text: 'keep' });
  sweepExpired({ requests: { findByStates: () => [] }, decisionLogs, now, ttlMs: 2 * DAY });
  assert.equal(decisionLogs.get('old'), null);
  assert.ok(decisionLogs.get('fresh'));
});

test('account deletion: deleteForUser clears that user\'s logs', () => {
  const { decisionLogs, users } = setup();
  const other = users.create({ email: 'b@x.test', passwordHash: 'h', now: 2000 });
  decisionLogs.create({ id: 'mine', userId: other.id, text: 'a' });
  decisionLogs.create({ id: 'anon', userId: null, text: 'b' });
  decisionLogs.deleteForUser(other.id);
  assert.equal(decisionLogs.get('mine'), null);
  assert.ok(decisionLogs.get('anon')); // anonymous rows untouched
});
