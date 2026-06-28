import { test } from 'node:test';
import assert from 'node:assert/strict';

import { openDatabase } from '../db/index.js';
import { createRequestsRepo } from '../db/requests.js';
import { classify } from '../queue/scheduler.js';
import { validateBundle } from '../build/bundleSchema.js';
import { estimateEta } from '../produce/eta.js';
import { handleProduce, handleStatus, handleDownload } from '../produce/handlers.js';

function fakeRes() {
  return {
    statusCode: 200, body: null, sent: null, headers: {},
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
    send(b) { this.sent = b; return this; },
    set(k, v) { this.headers[k] = v; return this; },
  };
}

function setup() {
  const db = openDatabase(':memory:');
  for (const id of [1, 2]) {
    db.prepare(
      `INSERT INTO users (id,email,password_hash,verified,owns_valid_rom,created_at,updated_at)
       VALUES (?,?,?,1,1,0,0)`
    ).run(id, `u${id}@x.test`, 'h');
  }
  return { db, requests: createRequestsRepo(db) };
}

const validRom = () => ({ romIndex: 0, artifacts: { pokedex: 'p', trainers: 't', starters: 's', wild: { file: 'data/w.json' } } });
const validBundle = (n = 1) => ({ config: { seed: 7 }, roms: Array.from({ length: n }, (_, i) => ({ ...validRom(), romIndex: i })) });

function produceDeps(requests, over = {}) {
  return {
    requests, classify, validateBundle,
    persistBundle: (id) => `/bundles/${id}.json`,
    idGen: () => 'req1',
    now: () => 1000,
    avgRomSecs: 10,
    ...over,
  };
}

test('eta grows with the ROMs queued ahead', () => {
  const { requests } = setup();
  requests.create({ id: 'A', userId: 1, queueClass: 'fast', romsTotal: 2, bundlePath: '/A', seed: '1', params: {}, now: 1 });
  requests.create({ id: 'B', userId: 2, queueClass: 'fast', romsTotal: 1, bundlePath: '/B', seed: '1', params: {}, now: 2 });

  assert.equal(estimateEta(requests, 'A', { avgRomSecs: 10 }), 20); // 2 own ROMs
  assert.equal(estimateEta(requests, 'B', { avgRomSecs: 10 }), 30); // A's 2 ahead + 1 own
});

test('produce validates, enqueues and returns a request id + eta', () => {
  const { requests } = setup();
  const res = fakeRes();
  handleProduce(produceDeps(requests))({ userId: 1, body: validBundle(1) }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.requestId, 'req1');
  assert.ok(res.body.eta >= 0);
  assert.equal(requests.get('req1').state, 'queued_fast'); // 1 ROM => fast
});

test('produce rejects an invalid bundle with 400 and enqueues nothing', () => {
  const { requests } = setup();
  const res = fakeRes();
  handleProduce(produceDeps(requests))({ userId: 2, body: { roms: [] } }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(requests.getActiveForUser(2), null);
});

test('produce refuses a second active request (409)', () => {
  const { requests } = setup();
  handleProduce(produceDeps(requests))({ userId: 1, body: validBundle(1) }, fakeRes());
  const res2 = fakeRes();
  handleProduce(produceDeps(requests, { idGen: () => 'req2' }))({ userId: 1, body: validBundle(1) }, res2);
  assert.equal(res2.statusCode, 409);
});

test('status reports the active request state + eta, or 404', () => {
  const { requests } = setup();
  handleProduce(produceDeps(requests))({ userId: 1, body: validBundle(3) }, fakeRes()); // 3 ROMs => slow
  const res = fakeRes();
  handleStatus({ requests, avgRomSecs: 10 })({ userId: 1 }, res);
  assert.equal(res.body.state, 'queued_slow');
  assert.equal(res.body.romsTotal, 3);

  const res404 = fakeRes();
  handleStatus({ requests, avgRomSecs: 10 })({ userId: 2 }, res404);
  assert.equal(res404.statusCode, 404);
});

// T-031: the queue view shows "N ROMs before yours", so produce + status expose romsAhead.
test('produce and status expose romsAhead (ROMs queued before this one)', () => {
  const { requests } = setup();
  // user 1 has 2 ROMs queued ahead of user 2's request (distinct created_at: 1000 then 2000)
  handleProduce(produceDeps(requests))({ userId: 1, body: validBundle(2) }, fakeRes());
  const prod = fakeRes();
  handleProduce(produceDeps(requests, { idGen: () => 'req2', now: () => 2000 }))({ userId: 2, body: validBundle(1) }, prod);
  assert.equal(prod.body.romsAhead, 2, 'req2 sees user 1\'s 2 ROMs ahead');

  const stat = fakeRes();
  handleStatus({ requests, avgRomSecs: 10 })({ userId: 2 }, stat);
  assert.equal(stat.body.romsAhead, 2);

  const first = fakeRes();
  handleStatus({ requests, avgRomSecs: 10 })({ userId: 1 }, first);
  assert.equal(first.body.romsAhead, 0, 'the first request has nothing ahead');
});

test('download streams a ready ROM, then marks downloaded and purges', () => {
  const { requests } = setup();
  requests.create({ id: 'r1', userId: 1, queueClass: 'fast', romsTotal: 1, bundlePath: '/b/r1', outputPath: null, seed: '1', params: {}, now: 1 });
  requests.setState('r1', 'building', 2);
  requests.markReady('r1', 3);

  const removed = [];
  const res = fakeRes();
  handleDownload({ requests, readOutput: () => Buffer.from('ZIPDATA'), removeFile: (p) => removed.push(p), now: () => 9 })({ userId: 1 }, res);

  assert.equal(res.sent.toString(), 'ZIPDATA');
  assert.equal(requests.get('r1'), null, 'row purged after a successful download');
});

test('download refuses when the request is not ready (409)', () => {
  const { requests } = setup();
  requests.create({ id: 'r1', userId: 1, queueClass: 'fast', romsTotal: 1, bundlePath: '/b/r1', seed: '1', params: {}, now: 1 });
  const res = fakeRes();
  handleDownload({ requests, readOutput: () => Buffer.from('x'), removeFile: () => {} })({ userId: 1 }, res);
  assert.equal(res.statusCode, 409);
});
