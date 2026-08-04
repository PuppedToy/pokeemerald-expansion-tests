import { test } from 'node:test';
import assert from 'node:assert/strict';

import { openDatabase } from '../db/index.js';
import { createRequestsRepo } from '../db/requests.js';
import { createRunsRepo } from '../db/runs.js';
import { selectNext, createWorker, LEGACY_QUEUED_STATES } from '../queue/scheduler.js';

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

function setup({ now = () => 100 } = {}) {
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
  const ctx = { db, requests, runs, buildRom: rec.build, now };
  return { db, requests, runs, rec, ctx };
}

const mk = (requests, over) => requests.create({
  id: over.id, userId: over.userId, romsTotal: over.romsTotal,
  bundlePath: `/b/${over.id}`, seed: '1', params: {}, now: over.now ?? 1,
});

// T-245 — one FIFO lane. `classify`/`FAST_MAX_ROMS` are gone with the tiers: at ~16.5 s/ROM the longest
// a small run can wait behind the biggest one is ~100 s, which is not worth a preemption policy.
test('every request enters the single queued lane, whatever its ROM count', () => {
  const { requests } = setup();
  mk(requests, { id: 'one', userId: 1, romsTotal: 1, now: 1 });
  mk(requests, { id: 'six', userId: 2, romsTotal: 6, now: 2 });
  assert.equal(requests.get('one').state, 'queued');
  assert.equal(requests.get('six').state, 'queued', 'a 6-ROM run is not sorted into a slower lane');
});

test('selectNext is oldest-first, regardless of size (FIFO)', () => {
  const { requests } = setup();
  mk(requests, { id: 'big-first', userId: 1, romsTotal: 6, now: 1 });
  mk(requests, { id: 'small-later', userId: 2, romsTotal: 1, now: 2 });
  assert.equal(selectNext(requests, { now: 100 }), 'big-first', 'no preemption: arrival order wins');
});

// The deploy transition: rows queued by the two-tier version must still be selectable, or a request in
// `queued_fast`/`queued_slow`/`paused` at deploy time would sit in the DB forever, invisible to the worker.
test('legacy tier states are still selectable so a deploy strands nothing', () => {
  const { db, requests } = setup();
  assert.deepEqual(LEGACY_QUEUED_STATES, ['queued_fast', 'queued_slow', 'paused']);
  for (const [i, state] of LEGACY_QUEUED_STATES.entries()) {
    mk(requests, { id: `legacy-${i}`, userId: i + 1, romsTotal: 3, now: i + 1 });
    // Written straight to the row: these states can no longer be *reached* through a legal transition,
    // which is the point — this is what a request queued by the previous version looks like after a deploy.
    db.prepare('UPDATE requests SET state = ? WHERE id = ?').run(state, `legacy-${i}`);
  }
  assert.equal(selectNext(requests, { now: 100 }), 'legacy-0', 'oldest legacy row is picked up');
});

test('a request cancelled mid-build is dropped cleanly; the worker keeps going (T-035)', async () => {
  const { db, requests, runs } = setup();
  mk(requests, { id: 'c', userId: 1, romsTotal: 1, now: 1 });
  mk(requests, { id: 'next', userId: 2, romsTotal: 1, now: 2 });
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

test('a multi-ROM run keeps the head of the queue until it is done (no preemption)', async () => {
  const { requests, rec, ctx } = setup();
  mk(requests, { id: 'big', userId: 1, romsTotal: 3, now: 1 });
  const worker = createWorker(ctx);

  await worker.runOnce();                              // big ROM0 -> back to `queued`
  assert.equal(requests.get('big').state, 'queued');
  assert.equal(requests.get('big').roms_done, 1);

  mk(requests, { id: 'small', userId: 2, romsTotal: 1, now: 5 });   // arrives later
  await worker.runOnce();
  assert.equal(rec.calls[rec.calls.length - 1], 'big:1', 'the earlier request is not preempted');

  await worker.drain();
  assert.equal(requests.get('big').state, 'ready');
  assert.equal(requests.get('small').state, 'ready');
  // every ROM built exactly once, in order, and the later arrival ran after the earlier run finished
  assert.deepEqual(rec.calls, ['big:0', 'big:1', 'big:2', 'small:0']);
});

// Retiring aging is only safe because nothing can jump the queue any more: FIFO cannot starve a request.
test('a request cannot be overtaken, so nothing needs aging to escape starvation', async () => {
  const { requests, rec, ctx } = setup();
  mk(requests, { id: 'first', userId: 1, romsTotal: 2, now: 1 });
  for (const [id, user] of [['later1', 2], ['later2', 3], ['later3', 4]]) {
    mk(requests, { id, userId: user, romsTotal: 1, now: 10 });
  }
  const worker = createWorker(ctx);
  await worker.drain();
  assert.equal(rec.calls[0], 'first:0');
  assert.equal(rec.calls[1], 'first:1', 'the oldest request finishes before any newcomer starts');
});

test('draining a job marks it ready and records exactly one run', async () => {
  const { requests, runs, ctx } = setup();
  mk(requests, { id: 'r1', userId: 1, romsTotal: 2, now: 1 });
  const worker = createWorker(ctx);

  await worker.drain();
  assert.equal(requests.get('r1').state, 'ready');
  assert.equal(runs.listForUser(1).length, 1);
});

test('builds run strictly one at a time (serial invariant)', async () => {
  const { requests, rec, ctx } = setup();
  mk(requests, { id: 'a', userId: 1, romsTotal: 3, now: 1 });
  mk(requests, { id: 'b', userId: 2, romsTotal: 2, now: 2 });
  const worker = createWorker(ctx);

  await worker.drain();
  assert.equal(rec.maxActive(), 1, 'never more than one concurrent build');
});

// B-008: a failing build (e.g. `make` errors) must never crash the worker/process. Before the fix
// the rejection propagated out of the worker loop -> unhandled rejection -> the whole backend died,
// and startup recovery re-queued the still-`building` request, crash-looping the site (502).
test('a failing build marks the request failed and does not crash the worker (B-008)', async () => {
  const { requests, ctx } = setup();
  mk(requests, { id: 'boom', userId: 1, romsTotal: 1, now: 1 });
  const worker = createWorker({ ...ctx, buildRom: async () => { throw new Error('make exploded'); } });

  await assert.doesNotReject(() => worker.runOnce(), 'a build failure must not reject out of the worker');
  assert.equal(requests.get('boom').state, 'failed', 'failed build -> terminal non-blocking `failed`');
  assert.equal(requests.get('boom').roms_done, 0, 'no ROM counted for a failed build');
});

test('the worker keeps serving other jobs after one build fails (B-008)', async () => {
  const { requests, ctx } = setup();
  mk(requests, { id: 'boom', userId: 1, romsTotal: 1, now: 1 });
  mk(requests, { id: 'ok',   userId: 2, romsTotal: 1, now: 2 });
  const worker = createWorker({
    ...ctx,
    buildRom: async (id) => { if (id === 'boom') throw new Error('boom'); },
  });

  await worker.drain();
  assert.equal(requests.get('boom').state, 'failed');
  assert.equal(requests.get('ok').state, 'ready', 'a healthy job still completes after a failed one');
});
