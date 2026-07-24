/**
 * T-198 — the ROM build must be cancelable from where the user is looking. While building or queued,
 * the status row itself carries a "Cancel build" button (the tiny bottom Start-over/Cancel control is
 * hidden in those states to avoid a duplicate). Clicking it POSTs /api/cancel and resets the run —
 * the same server-side flow the bottom button already used (T-035).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installDomEnv, flush } from './helpers/dom-env.js';

let caseId = 0;
const freshAccount = () => import(`../js/account.js?cancelcase=${caseId++}`);

const ME = (over = {}) => ({
  ok: true, status: 200,
  json: async () => ({ email: 'u@x.test', verified: true, activeRequest: null, ...over }),
});

test('T-198: the building row exposes a Cancel button that cancels the run and hides the bottom Start-over', async () => {
  const env = installDomEnv();
  try {
    global.localStorage.setItem('ec_jwt', 'tok');
    let cancelHits = 0;
    env.setFetch(async (path) => {
      if (path === '/api/me') return ME({ activeRequest: { id: 'r1', state: 'building', romsDone: 0, romsTotal: 1 } });
      if (path === '/api/status') return { ok: true, status: 200, json: async () => ({ state: 'building', romsDone: 0, romsTotal: 1, eta: 30, progress: 40, romsAhead: 0 }) };
      if (path === '/api/cancel') { cancelHits++; return { ok: true, status: 200, json: async () => ({ ok: true }) }; }
      throw new Error(`unexpected fetch ${path}`);
    });

    const account = await freshAccount();
    let startedOver = false;
    await account.initAccount({ onStartOver: () => { startedOver = true; } });
    await flush(); await flush();

    const row = env.getEl('rom-status');
    assert.match(row.innerHTML, /Building your ROM/, 'the building row is shown');
    assert.match(row.innerHTML, /id="rom-cancel"/, 'the building row carries a Cancel button');
    assert.equal(env.getEl('btn-start-over').hidden, true, 'the bottom Start-over/Cancel is hidden while building');

    env.getEl('rom-cancel').click(); // confirm() defaults to true in the stub
    await flush(); await flush();

    assert.equal(cancelHits, 1, 'clicking Cancel POSTs /api/cancel exactly once');
    assert.ok(startedOver, 'and resets the wizard via onStartOver');
  } finally { env.restore(); }
});

test('T-198: the queued row exposes a Cancel button too, and hides the bottom Start-over', async () => {
  const env = installDomEnv();
  try {
    global.localStorage.setItem('ec_jwt', 'tok');
    let cancelHits = 0;
    env.setFetch(async (path) => {
      if (path === '/api/me') return ME({ activeRequest: { id: 'r1', state: 'queued_slow', romsDone: 0, romsTotal: 3 } });
      // eta/romsAhead null so the initial render and the first poll produce an identical queued line —
      // otherwise the re-render re-attaches a listener on the stub's cached element (a real DOM drops it
      // on innerHTML replace), which would double-count the click. Behaviour under test is unaffected.
      if (path === '/api/status') return { ok: true, status: 200, json: async () => ({ state: 'queued_slow', romsDone: 0, romsTotal: 3, eta: null, progress: 0, romsAhead: null }) };
      if (path === '/api/cancel') { cancelHits++; return { ok: true, status: 200, json: async () => ({ ok: true }) }; }
      throw new Error(`unexpected fetch ${path}`);
    });

    const account = await freshAccount();
    await account.initAccount({ onStartOver: () => {} });
    await flush(); await flush();

    const row = env.getEl('rom-status');
    assert.match(row.innerHTML, /ROM queued/, 'the queued row is shown');
    assert.match(row.innerHTML, /id="rom-cancel"/, 'the queued row carries a Cancel button');
    assert.equal(env.getEl('btn-start-over').hidden, true, 'the bottom Start-over/Cancel is hidden while queued');

    env.getEl('rom-cancel').click();
    await flush(); await flush();
    assert.equal(cancelHits, 1, 'clicking Cancel POSTs /api/cancel');
  } finally { env.restore(); }
});

test('T-198: a canceled build asks for confirmation first — declining leaves the run untouched', async () => {
  const env = installDomEnv();
  try {
    global.localStorage.setItem('ec_jwt', 'tok');
    env.setConfirm(false); // user clicks "Cancel" on the confirm dialog
    let cancelHits = 0;
    env.setFetch(async (path) => {
      if (path === '/api/me') return ME({ activeRequest: { id: 'r1', state: 'building', romsDone: 0, romsTotal: 1 } });
      if (path === '/api/status') return { ok: true, status: 200, json: async () => ({ state: 'building', romsDone: 0, romsTotal: 1, eta: 30, progress: 40, romsAhead: 0 }) };
      if (path === '/api/cancel') { cancelHits++; return { ok: true, status: 200, json: async () => ({ ok: true }) }; }
      throw new Error(`unexpected fetch ${path}`);
    });

    const account = await freshAccount();
    let startedOver = false;
    await account.initAccount({ onStartOver: () => { startedOver = true; } });
    await flush(); await flush();

    env.getEl('rom-cancel').click();
    await flush(); await flush();

    assert.equal(cancelHits, 0, 'declining the confirm does not hit /api/cancel');
    assert.equal(startedOver, false, 'and does not reset the wizard');
  } finally { env.restore(); }
});

test('T-198: the ready row keeps the bottom Start-over visible (only building/queued hide it)', async () => {
  const env = installDomEnv();
  try {
    global.localStorage.setItem('ec_jwt', 'tok');
    env.setFetch(async (path) => {
      if (path === '/api/me') return ME({ activeRequest: { id: 'r1', state: 'ready', romsDone: 1, romsTotal: 1 } });
      if (path === '/api/status') return { ok: true, status: 200, json: async () => ({ state: 'ready', romsDone: 1, romsTotal: 1, eta: 0, progress: 100, romsAhead: 0 }) };
      throw new Error(`unexpected fetch ${path}`);
    });
    const account = await freshAccount();
    await account.initAccount({});
    await flush(); await flush();
    assert.equal(env.getEl('btn-start-over').hidden, false, 'Start over stays visible on the ready screen');
    assert.doesNotMatch(env.getEl('rom-status').innerHTML, /id="rom-cancel"/, 'no build-cancel button once ready');
  } finally { env.restore(); }
});
