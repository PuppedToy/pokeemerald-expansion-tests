import { test } from 'node:test';
import assert from 'node:assert/strict';

import { openDatabase } from '../db/index.js';
import { createRequestsRepo } from '../db/requests.js';
import { createRunsRepo } from '../db/runs.js';
import { classify, selectNext, createWorker, FAST_MAX_ROMS } from '../queue/scheduler.js';

function recordingBuild() {
  const calls = [];
  let active = 0, maxActive = 0;
  return {
    calls,
    maxActive: () => maxActive,
    build: async (id, idx) => {
      active += 1; maxActive = Math.max(maxActive, active);
      calls.push(`${id}:${idx}`);
      await Promise.resolve();
      active -= 1;
    },
  };
}

function setup({ agingMs = 1e9, now = () => 100 } = {}) {
  const db = openDatabase(':memory:');
  // several users: one active request per user, so concurrent requests need distinct users
  for (const id of [1, 2, 3, 4]) {
    db.prepare(
      `INSERT INTO users (id,email,password_hash,verified,created_at,updated_at)
       VALUES (?,?,?,1,0,0)`
    ).run(id, `u${id}@x.test`, 'h');
  }
  const requests = createRequestsRepo(db);
  const runs = createRunsRepo(db);
  const rec = recordingBuild();
  const ctx = { db, requests, runs, buildRom: rec.build, agingMs, now };
  return { db, requests, runs, rec, ctx };
}

const mk = (requests, over) => requests.create({
  id: over.id, userId: over.userId, queueClass: over.queueClass, romsTotal: over.romsTotal,
  bundlePath: `/b/${over.id}`, seed: '1', params: {}, now: over.now ?? 1,
});

test('classify splits fast vs slow by ROM count', () => {
  assert.equal(classify(1), 'fast');
  assert.equal(classify(2), 'fast');
  assert.equal(classify(3), 'slow');
});

// T-172 — the fast-queue limit is exported so the frontend can mirror it (drift-guarded there) to warn
// the user before they queue a slow build. It must stay the exact cut-off classify() uses.
test('FAST_MAX_ROMS is exported and is the classify cut-off', () => {
  assert.equal(FAST_MAX_ROMS, 2);
  assert.equal(classify(FAST_MAX_ROMS), 'fast');
  assert.equal(classify(FAST_MAX_ROMS + 1), 'slow');
});

test('a request cancelled mid-build is dropped cleanly; the worker keeps going (T-035)', async () => {
  const { db, requests, runs } = setup();
  mk(requests, { id: 'c', userId: 1, queueClass: 'fast', romsTotal: 1, now: 1 });
  mk(requests, { id: 'next', userId: 2, queueClass: 'fast', romsTotal: 1, now: 2 });
  // buildRom cancels 'c' WHILE it is building (exactly what POST /api/cancel does mid-build)
  const ctx = {
    db, requests, runs, agingMs: 1e9, now: () => 100,
    buildRom: async (id) => { if (id === 'c') requests.cancel('c', () => {}, 100); },
  };
  const worker = createWorker(ctx);

  await worker.runOnce(); // builds 'c' → cancelled mid-build
  assert.equal(requests.get('c').state, 'failed', 'cancelled request stays failed (not ready)');
  assert.equal(requests.get('c').roms_done, 0, 'no progress recorded for a cancelled build');
  assert.equal(runs.listForUser(1).length, 0, 'no run recorded for a cancelled build');

  await worker.runOnce(); // worker survives and serves the next job
  assert.equal(requests.get('next').state, 'ready');
});

test('the fast queue is served before a not-yet-started slow', async () => {
  const { requests, rec, ctx } = setup();
  mk(requests, { id: 'slow', userId: 1, queueClass: 'slow', romsTotal: 3, now: 1 });
  mk(requests, { id: 'fast', userId: 2, queueClass: 'fast', romsTotal: 1, now: 2 });
  const worker = createWorker(ctx);

  await worker.runOnce(); // first unit
  assert.equal(rec.calls[0], 'fast:0', 'fast ROM is built before any slow ROM');
  assert.equal(requests.get('fast').state, 'ready');
});

test('a fast request preempts a started slow at the ROM boundary; slow resumes with no lost ROMs', async () => {
  const { requests, rec, ctx } = setup();
  mk(requests, { id: 'slow', userId: 1, queueClass: 'slow', romsTotal: 3, now: 1 });
  const worker = createWorker(ctx);

  await worker.runOnce();                       // slow ROM0 -> paused (1/3)
  assert.equal(requests.get('slow').state, 'paused');
  assert.equal(requests.get('slow').roms_done, 1);

  mk(requests, { id: 'fast', userId: 2, queueClass: 'fast', romsTotal: 1, now: 5 });
  await worker.runOnce();                        // fast jumps the slow
  assert.equal(rec.calls[rec.calls.length - 1], 'fast:0');
  assert.equal(requests.get('slow').roms_done, 1, 'slow did not advance while fast ran');

  await worker.drain();                          // finish everything
  assert.equal(requests.get('slow').state, 'ready');
  // each slow ROM built exactly once, in order
  assert.deepEqual(rec.calls.filter((c) => c.startsWith('slow')), ['slow:0', 'slow:1', 'slow:2']);
});

test('aging lets a starved slow jump the fast queue', () => {
  const { requests } = setup();
  // a started slow, paused long ago
  mk(requests, { id: 'slow', userId: 1, queueClass: 'slow', romsTotal: 5, now: 1 });
  requests.setState('slow', 'building', 1);
  requests.setState('slow', 'paused', 1);       // updated_at = 1
  mk(requests, { id: 'fast', userId: 2, queueClass: 'fast', romsTotal: 1, now: 2 });

  // now is far past the aging bound relative to the paused slow
  const pick = selectNext(requests, { now: 1_000_000, agingMs: 1000 });
  assert.equal(pick, 'slow', 'aged slow is chosen over the waiting fast');
});

test('draining a job marks it ready and records exactly one run', async () => {
  const { requests, runs, ctx } = setup();
  mk(requests, { id: 'r1', userId: 1, queueClass: 'fast', romsTotal: 2, now: 1 });
  const worker = createWorker(ctx);

  await worker.drain();
  assert.equal(requests.get('r1').state, 'ready');
  assert.equal(runs.listForUser(1).length, 1);
});

test('builds run strictly one at a time (serial invariant)', async () => {
  const { requests, rec, ctx } = setup();
  mk(requests, { id: 'a', userId: 1, queueClass: 'slow', romsTotal: 3, now: 1 });
  mk(requests, { id: 'b', userId: 2, queueClass: 'fast', romsTotal: 2, now: 2 });
  const worker = createWorker(ctx);

  await worker.drain();
  assert.equal(rec.maxActive(), 1, 'never more than one concurrent build');
});

// B-008: a failing build (e.g. `make` errors) must never crash the worker/process. Before the fix
// the rejection propagated out of the worker loop -> unhandled rejection -> the whole backend died,
// and startup recovery re-queued the still-`building` request, crash-looping the site (502).
test('a failing build marks the request failed and does not crash the worker (B-008)', async () => {
  const { requests, ctx } = setup();
  mk(requests, { id: 'boom', userId: 1, queueClass: 'fast', romsTotal: 1, now: 1 });
  const worker = createWorker({ ...ctx, buildRom: async () => { throw new Error('make exploded'); } });

  await assert.doesNotReject(() => worker.runOnce(), 'a build failure must not reject out of the worker');
  assert.equal(requests.get('boom').state, 'failed', 'failed build -> terminal non-blocking `failed`');
  assert.equal(requests.get('boom').roms_done, 0, 'no ROM counted for a failed build');
});

test('the worker keeps serving other jobs after one build fails (B-008)', async () => {
  const { requests, ctx } = setup();
  mk(requests, { id: 'boom', userId: 1, queueClass: 'fast', romsTotal: 1, now: 1 });
  mk(requests, { id: 'ok',   userId: 2, queueClass: 'fast', romsTotal: 1, now: 2 });
  const worker = createWorker({
    ...ctx,
    buildRom: async (id) => { if (id === 'boom') throw new Error('boom'); },
  });

  await worker.drain();
  assert.equal(requests.get('boom').state, 'failed');
  assert.equal(requests.get('ok').state, 'ready', 'a healthy job still completes after a failed one');
});
