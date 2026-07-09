import { test } from 'node:test';
import assert from 'node:assert/strict';

import { openDatabase } from '../db/index.js';
import { createRequestsRepo } from '../db/requests.js';
import { createRunsRepo } from '../db/runs.js';
import { finishBuild } from '../lifecycle/complete.js';

function setup() {
  const db = openDatabase(':memory:');
  db.prepare(
    `INSERT INTO users (id,email,password_hash,verified,created_at,updated_at)
     VALUES (1,'u1@x.test','h',1,0,0)`
  ).run();
  return { db, requests: createRequestsRepo(db), runs: createRunsRepo(db) };
}

test('runs store only seed + params, never ROM bytes', () => {
  const { db, runs } = setup();
  runs.record({ userId: 1, seed: '12345', params: { difficulty: 'hard' }, now: 5 });

  const row = runs.listForUser(1)[0];
  assert.equal(row.seed, '12345');
  assert.deepEqual(JSON.parse(row.params_json), { difficulty: 'hard' });

  // schema must not carry any blob/rom column
  const cols = db.prepare(`PRAGMA table_info(runs)`).all().map((c) => c.name);
  assert.deepEqual(cols.sort(), ['created_at', 'id', 'params_json', 'seed', 'user_id']);
});

test('finishBuild marks the request ready and records exactly one run', () => {
  const { db, requests, runs } = setup();
  requests.create({ id: 'r1', userId: 1, queueClass: 'fast', romsTotal: 1,
    bundlePath: '/tmp/r1.json', seed: '99', params: { difficulty: 'fair' }, now: 10 });
  requests.setState('r1', 'building', 11);

  finishBuild({ db, requests, runs }, 'r1', 12);

  assert.equal(requests.get('r1').state, 'ready');
  const history = runs.listForUser(1);
  assert.equal(history.length, 1);
  assert.equal(history[0].seed, '99');
});
