import { test } from 'node:test';
import assert from 'node:assert/strict';

import { openDatabase, ACTIVE_STATES } from '../db/index.js';
import { createRequestsRepo } from '../db/requests.js';

function setup() {
  const db = openDatabase(':memory:');
  const now = 1000;
  for (const id of [1, 2]) {
    db.prepare(
      `INSERT INTO users (id,email,password_hash,verified,created_at,updated_at)
       VALUES (?,?,?,1,?,?)`
    ).run(id, `u${id}@x.test`, 'hash', now, now);
  }
  return { db, requests: createRequestsRepo(db) };
}

const req = (over = {}) => ({
  id: 'r1', userId: 1, queueClass: 'fast', romsTotal: 1,
  bundlePath: '/tmp/r1.json', seed: '42', params: { difficulty: 'fair' }, now: 1000, ...over,
});

test('a user may have only one active request', () => {
  const { requests } = setup();
  requests.create(req());
  assert.throws(() => requests.create(req({ id: 'r2' })), /active/i);
});

test('a new request is allowed once the previous row is gone', () => {
  const { requests } = setup();
  requests.create(req());
  requests.deleteRow('r1');
  assert.doesNotThrow(() => requests.create(req({ id: 'r2' })));
});

test('a ready (undownloaded) request still counts as active', () => {
  const { requests } = setup();
  requests.create(req());
  requests.setState('r1', 'building', 1100);
  requests.markReady('r1', 1200);
  assert.equal(requests.get('r1').state, 'ready');
  assert.throws(() => requests.create(req({ id: 'r2' })), /active/i);
});

test('the partial unique index is the atomic backstop', () => {
  const { db } = setup();
  const cols = `(id,user_id,state,queue_class,roms_total,roms_done,bundle_path,output_path,email_on_ready,seed,params_json,created_at,started_at,ready_at,updated_at)`;
  const ins = db.prepare(`INSERT INTO requests ${cols} VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  ins.run('x1', 1, 'queued_fast', 'fast', 1, 0, '/b', null, 0, '1', '{}', 1, null, null, 1);
  assert.throws(
    () => ins.run('x2', 1, 'building', 'fast', 1, 0, '/b', null, 0, '1', '{}', 1, null, null, 1),
    /UNIQUE|constraint/i
  );
});

test('legal transitions pass and illegal ones throw', () => {
  const { requests } = setup();
  requests.create(req());
  requests.setState('r1', 'building', 1100);          // queued_fast -> building (legal)
  requests.setState('r1', 'ready', 1200);             // building -> ready (legal)
  requests.setState('r1', 'downloaded', 1300);        // ready -> downloaded (legal)

  const { requests: r2 } = setup();
  r2.create(req());
  assert.throws(() => r2.setState('r1', 'ready', 1100), /illegal transition/i); // queued -> ready
});

test('incRomDone advances the per-ROM checkpoint', () => {
  const { requests } = setup();
  requests.create(req({ romsTotal: 3 }));
  requests.setState('r1', 'building', 1100);
  requests.incRomDone('r1', 1110);
  requests.incRomDone('r1', 1120);
  assert.equal(requests.get('r1').roms_done, 2);
});

test('ACTIVE_STATES includes ready', () => {
  assert.ok(ACTIVE_STATES.includes('ready'));
});
