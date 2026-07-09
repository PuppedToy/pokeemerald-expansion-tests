import { test } from 'node:test';
import assert from 'node:assert/strict';

import { openDatabase } from '../db/index.js';
import { createRequestsRepo } from '../db/requests.js';
import { createRunsRepo } from '../db/runs.js';
import { sweepExpired } from '../lifecycle/sweeper.js';

const DAY = 24 * 60 * 60 * 1000;

function setup() {
  const db = openDatabase(':memory:');
  for (const id of [1, 2]) {
    db.prepare(
      `INSERT INTO users (id,email,password_hash,verified,created_at,updated_at)
       VALUES (?,?,?,1,0,0)`
    ).run(id, `u${id}@x.test`, 'h');
  }
  return { db, requests: createRequestsRepo(db), runs: createRunsRepo(db) };
}

function makeReady(requests, { id, userId, t }) {
  requests.create({ id, userId, queueClass: 'fast', romsTotal: 1,
    bundlePath: `/tmp/${id}.json`, seed: '1', params: {}, now: t });
  requests.setState(id, 'building', t);
  requests.markReady(id, t);
}

test('rows older than the TTL are expired and purged; fresh ones survive', () => {
  const { requests, runs } = setup();
  const now = 100 * DAY;
  makeReady(requests, { id: 'old', userId: 1, t: now - 3 * DAY });   // stale
  makeReady(requests, { id: 'fresh', userId: 2, t: now - 1 * DAY }); // within 48h
  runs.record({ userId: 1, seed: '1', params: {}, now: now - 3 * DAY });

  const removed = [];
  const n = sweepExpired({ requests, removeFile: (p) => removed.push(p), now, ttlMs: 2 * DAY });

  assert.equal(n, 1);
  assert.equal(requests.get('old'), null, 'stale row purged');
  assert.ok(requests.get('fresh'), 'fresh row kept');
  assert.ok(removed.includes('/tmp/old.json'), 'bundle file deleted');
  assert.equal(runs.listForUser(1).length, 1, 'run history survives the purge');
});
