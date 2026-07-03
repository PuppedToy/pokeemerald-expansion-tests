/**
 * Frontend delivery-flow regression tests (T-036). Runs under `node --test` against the zero-dep
 * DOM/env stub. account.js holds module-level state, so each test imports a FRESH instance via a
 * cache-busting query string to stay isolated.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installDomEnv, flush } from './helpers/dom-env.js';

let caseId = 0;
const freshAccount = () => import(`../js/account.js?case=${caseId++}`);

const ME = (over = {}) => ({
  ok: true, status: 200,
  json: async () => ({ email: 'u@x.test', verified: true, ownsValidRom: true, activeRequest: null, ...over }),
});

// B-012 — the optimistic state shown the instant you hit Generate must be neutral ("Submitting…"),
// never a "Building" claim (which previously made the panel flash Building → Queued).
test('B-012: optimistic submit state is neutral, not a false "Building" flash', async () => {
  const env = installDomEnv();
  try {
    global.localStorage.setItem('ec_jwt', 'tok');
    let releaseProduce;
    env.setFetch(async (path) => {
      if (path === '/api/me') return ME();                       // eligible: verified + owns ROM
      if (path === '/api/produce') return new Promise((res) => { // hangs so we can inspect the optimistic row
        releaseProduce = () => res({ ok: true, status: 201, json: async () => ({ requestId: 'r1', eta: 120, romsAhead: 3 }) });
      });
      if (path === '/api/status') return { ok: true, status: 200, json: async () => ({ state: 'queued_fast', romsDone: 0, romsTotal: 1, eta: 120, progress: 0, romsAhead: 3 }) };
      throw new Error(`unexpected fetch ${path}`);
    });

    const account = await freshAccount();
    const done = account.onBundleReady({ config: { seed: 1 }, roms: [{ romIndex: 0 }] });
    await flush(); // refreshMe + the synchronous optimistic render, before /api/produce resolves

    const row = env.getEl('rom-status');
    assert.equal(row.className, 'status-item queued', 'optimistic row is the neutral "queued" style, not "building"');
    assert.match(row.innerHTML, /Submitting your run/);
    assert.doesNotMatch(row.innerHTML, /Building your ROM/, 'must NOT claim it is building yet');
    assert.doesNotMatch(row.innerHTML, /generating\.png/, 'no spinning build gear in the optimistic state');

    releaseProduce?.();
    await done; await flush();
  } finally { env.restore(); }
});

// B-011 — a previously generated run (its bundle saved in IndexedDB) must be restored on load even
// when there is NO active build, e.g. after the email-verification round-trip. The old code only
// restored when an active request existed, so the run looked lost.
test('B-011: a stored run is restored on init with no active build', async () => {
  const env = installDomEnv();
  try {
    global.localStorage.setItem('ec_jwt', 'tok');
    env.idb.set('bundle', { config: { seed: 9 }, roms: [{ romIndex: 0 }] }); // a run generated earlier
    // T-053, ADR-013: generation is now DECOUPLED from ROM ownership. A restored run with no ROM yet no
    // longer stops at an "Upload your ROM" gate — it proceeds to build the BPS patch (produce).
    env.setFetch(async (path) => {
      if (path === '/api/me') return ME({ ownsValidRom: false });
      if (path === '/api/produce') return { ok: true, status: 201, json: async () => ({ requestId: 'r1', eta: 60, romsAhead: 0 }) };
      if (path === '/api/status') return { ok: true, status: 200, json: async () => ({ state: 'queued_fast', romsDone: 0, romsTotal: 1, eta: 60, progress: 0, romsAhead: 0 }) };
      throw new Error(`unexpected fetch ${path}`);
    });

    const account = await freshAccount();
    let recovered = false;
    await account.initAccount({ onRecover: async () => { recovered = true; } });
    await flush();

    assert.ok(recovered, 'onRecover fires for a stored run even with no active build (the B-011 fix)');
    const row = env.getEl('rom-status');
    assert.notEqual(row.innerHTML, '', 'the ROM status row is populated after restore (not left blank)');
    assert.doesNotMatch(row.innerHTML, /Upload your Emerald ROM/, 'no ownership gate — generation is decoupled (T-053)');
    assert.match(row.innerHTML, /Submitting your run|queued/i, 'the restored run proceeds to build the patch');
  } finally { env.restore(); }
});

// Guard the inverse so the harness itself is trustworthy: with neither an active build NOR a stored
// bundle, onRecover must NOT fire (nothing to restore).
test('init does not restore when there is no stored run and no active build', async () => {
  const env = installDomEnv();
  try {
    global.localStorage.setItem('ec_jwt', 'tok');
    env.setFetch(async (path) => {
      if (path === '/api/me') return ME({ ownsValidRom: false });
      throw new Error(`unexpected fetch ${path}`);
    });
    const account = await freshAccount();
    let recovered = false;
    await account.initAccount({ onRecover: async () => { recovered = true; } });
    await flush();
    assert.equal(recovered, false, 'nothing to restore → onRecover stays uncalled');
  } finally { env.restore(); }
});
