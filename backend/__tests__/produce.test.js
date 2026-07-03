import { test } from 'node:test';
import assert from 'node:assert/strict';

import { openDatabase } from '../db/index.js';
import { createRequestsRepo } from '../db/requests.js';
import { classify } from '../queue/scheduler.js';
import { validateBundle } from '../build/bundleSchema.js';
import { estimateEta, buildProgress } from '../produce/eta.js';
import { handleProduce, handleStatus, handleDownload, handleCancel } from '../produce/handlers.js';

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
    removeFile: () => {},
    killActiveBuild: () => {},
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

test('a second produce REPLACES the previous active request (one per user, T-053)', () => {
  const { requests } = setup();
  const removed = [];
  const killed = [];
  handleProduce(produceDeps(requests))({ userId: 1, body: validBundle(1) }, fakeRes());
  assert.equal(requests.get('req1').state, 'queued_fast');

  const res2 = fakeRes();
  handleProduce(produceDeps(requests, {
    idGen: () => 'req2', removeFile: (p) => removed.push(p), killActiveBuild: (id) => killed.push(id),
  }))({ userId: 1, body: validBundle(1) }, res2);

  assert.equal(res2.statusCode, 201, 'the new randomization is accepted, not blocked');
  assert.equal(requests.get('req1'), null, 'the previous request is purged');
  assert.equal(requests.getActiveForUser(1).id, 'req2', 'req2 is now the active one');
  assert.ok(removed.includes('/bundles/req1.json'), "the replaced request's files are deleted");
  assert.deepEqual(killed, ['req1'], 'any in-flight build for the replaced request is killed');
});

test('an invalid new bundle does NOT destroy the existing request', () => {
  const { requests } = setup();
  handleProduce(produceDeps(requests))({ userId: 1, body: validBundle(1) }, fakeRes());
  const res2 = fakeRes();
  handleProduce(produceDeps(requests, { idGen: () => 'req2' }))({ userId: 1, body: { roms: [] } }, res2);
  assert.equal(res2.statusCode, 400);
  assert.equal(requests.get('req1').state, 'queued_fast', 'the good run survives an invalid replace attempt');
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

test('download streams the ready patch and leaves it re-downloadable (T-053)', () => {
  const { requests } = setup();
  requests.create({ id: 'r1', userId: 1, queueClass: 'fast', romsTotal: 1, bundlePath: '/b/r1', outputPath: null, seed: '1', params: {}, now: 1 });
  requests.setState('r1', 'building', 2);
  requests.markReady('r1', 3);

  const res = fakeRes();
  handleDownload({ requests, readOutput: () => Buffer.from('ZIPDATA') })({ userId: 1 }, res);
  assert.equal(res.sent.toString(), 'ZIPDATA');
  assert.equal(requests.get('r1').state, 'ready', 'stays ready — re-downloadable, not purged on download');

  // a second download still works (the 48h sweeper / a replacing produce clean it up, not the download)
  const res2 = fakeRes();
  handleDownload({ requests, readOutput: () => Buffer.from('ZIPDATA') })({ userId: 1 }, res2);
  assert.equal(res2.sent.toString(), 'ZIPDATA');
});

test('cancel marks the active request failed, frees the slot and deletes its files (T-035)', () => {
  const { requests } = setup();
  requests.create({ id: 'c1', userId: 1, queueClass: 'fast', romsTotal: 1, bundlePath: '/b/c1.json', seed: '1', params: {}, now: 1 });

  const removed = [];
  const res = fakeRes();
  handleCancel({ requests, removeFile: (p) => removed.push(p), now: () => 9 })({ userId: 1 }, res);

  assert.equal(res.body.ok, true);
  assert.equal(requests.get('c1').state, 'failed', 'cancelled request is terminal/failed');
  assert.equal(requests.getActiveForUser(1), null, 'failed is non-blocking → slot freed');
  assert.ok(removed.includes('/b/c1.json'), 'the bundle file is deleted');
});

test('buildProgress derives progress + eta from server state, not a client clock (B-013)', () => {
  const { requests } = setup();
  requests.create({ id: 'b1', userId: 1, queueClass: 'fast', romsTotal: 1, bundlePath: '/b', seed: '1', params: {}, now: 1000 });
  requests.setState('b1', 'building', 1000); // the ROM started building at t=1000 ms
  // 135 s into a 270 s/ROM build → halfway, regardless of any client/page state
  const p = buildProgress(requests, 'b1', { avgRomSecs: 270, now: 1000 + 135_000 });
  assert.equal(p.progress, 50);
  assert.equal(p.etaSecs, 135);

  // a queued (not-yet-started) request reports 0 %
  requests.create({ id: 'b2', userId: 2, queueClass: 'slow', romsTotal: 3, bundlePath: '/b2', seed: '1', params: {}, now: 2000 });
  assert.equal(buildProgress(requests, 'b2', { avgRomSecs: 270, now: 9_000_000 }).progress, 0);
});

test('cancel with no active request is a no-op (ok:false)', () => {
  const { requests } = setup();
  const res = fakeRes();
  handleCancel({ requests, removeFile: () => {} })({ userId: 2 }, res);
  assert.equal(res.body.ok, false);
});

test('download refuses when the request is not ready (409)', () => {
  const { requests } = setup();
  requests.create({ id: 'r1', userId: 1, queueClass: 'fast', romsTotal: 1, bundlePath: '/b/r1', seed: '1', params: {}, now: 1 });
  const res = fakeRes();
  handleDownload({ requests, readOutput: () => Buffer.from('x'), removeFile: () => {} })({ userId: 1 }, res);
  assert.equal(res.statusCode, 409);
});
