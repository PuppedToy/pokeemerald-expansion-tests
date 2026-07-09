import { test } from 'node:test';
import assert from 'node:assert/strict';

import { openDatabase } from '../db/index.js';
import { createRequestsRepo } from '../db/requests.js';
import { runOnStartup } from '../lifecycle/recovery.js';

function setup() {
  const db = openDatabase(':memory:');
  db.prepare(
    `INSERT INTO users (id,email,password_hash,verified,created_at,updated_at)
     VALUES (1,'u1@x.test','h',1,1000,1000)`
  ).run();
  return { db, requests: createRequestsRepo(db) };
}

test('startup restores the tree and re-queues in-flight builds, keeping roms_done', () => {
  const { requests } = setup();
  // a slow request that was mid-build (2 of 5 ROMs done) when the process died
  requests.create({ id: 'r1', userId: 1, queueClass: 'slow', romsTotal: 5,
    bundlePath: '/tmp/r1.json', seed: '7', params: {}, now: 1000 });
  requests.setState('r1', 'building', 1100);
  requests.incRomDone('r1', 1110);
  requests.incRomDone('r1', 1120);

  let restored = 0;
  const recovered = runOnStartup({ requests, restoreTree: () => { restored++; }, now: 2000 });

  assert.equal(restored, 1, 'tree restore is invoked exactly once');
  assert.equal(recovered, 1);
  const row = requests.get('r1');
  assert.equal(row.state, 'queued_slow', 'building -> back to its queue');
  assert.equal(row.roms_done, 2, 'completed ROMs are not redone');
});

test('a paused (preempted) request is also re-queued', () => {
  const { requests } = setup();
  requests.create({ id: 'r1', userId: 1, queueClass: 'fast', romsTotal: 2,
    bundlePath: '/tmp/r1.json', seed: '7', params: {}, now: 1000 });
  requests.setState('r1', 'building', 1100);
  requests.setState('r1', 'paused', 1150);

  runOnStartup({ requests, restoreTree: () => {}, now: 2000 });
  assert.equal(requests.get('r1').state, 'queued_fast');
});
