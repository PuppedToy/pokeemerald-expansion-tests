import { test } from 'node:test';
import assert from 'node:assert/strict';

import { openDatabase, LEGACY_QUEUE_STATES } from '../db/index.js';
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
  // a request that was mid-build (2 of 5 ROMs done) when the process died
  requests.create({ id: 'r1', userId: 1, romsTotal: 5,
    bundlePath: '/tmp/r1.json', seed: '7', params: {}, now: 1000 });
  requests.setState('r1', 'building', 1100);
  requests.incRomDone('r1', 1110);
  requests.incRomDone('r1', 1120);

  let restored = 0;
  const recovered = runOnStartup({ requests, restoreTree: () => { restored++; }, now: 2000 });

  assert.equal(restored, 1, 'tree restore is invoked exactly once');
  assert.equal(recovered, 1);
  const row = requests.get('r1');
  assert.equal(row.state, 'queued', 'building -> back to the queue');
  assert.equal(row.roms_done, 2, 'completed ROMs are not redone');
});

// T-245 — the tier states are gone, but rows carrying them exist in the production DB at deploy time. The
// first boot after the deploy is what erases them: without this, a request left in `paused` (or either
// `queued_*`) would keep its old state forever and only the legacy branch of `selectNext` would serve it.
test('startup rewrites every legacy tier state into the single queued lane', () => {
  const { db, requests } = setup();
  for (const [i, state] of LEGACY_QUEUE_STATES.entries()) {
    db.prepare(
      `INSERT INTO users (id,email,password_hash,verified,created_at,updated_at)
       VALUES (?,?,'h',1,1000,1000)`
    ).run(10 + i, `legacy${i}@x.test`);
    requests.create({ id: `r-${i}`, userId: 10 + i, romsTotal: 3,
      bundlePath: '/tmp/x.json', seed: '7', params: {}, now: 1000 + i });
    // Straight to the row: these states are no longer reachable through a legal transition, which is
    // exactly what makes them legacy.
    db.prepare('UPDATE requests SET state = ? WHERE id = ?').run(state, `r-${i}`);
  }

  const recovered = runOnStartup({ requests, restoreTree: () => {}, now: 2000 });

  assert.equal(recovered, LEGACY_QUEUE_STATES.length);
  for (const i of LEGACY_QUEUE_STATES.keys()) {
    assert.equal(requests.get(`r-${i}`).state, 'queued', `${LEGACY_QUEUE_STATES[i]} -> queued`);
  }
});
