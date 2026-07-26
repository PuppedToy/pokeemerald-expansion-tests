/**
 * T-216 — beta gating surfaces (frontend). Runs under `node --test` against the zero-dep DOM stub.
 * account.js reads /api/config at boot into a module `betaMode`, which drives: the top-bar BETA badge,
 * the randomizer "invite-only" notice, the Settings "Beta access" row, and the held ("prepared, waiting
 * for invite") ROM state. A held run must NOT poll /api/status (it never transitions on its own).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installDomEnv, flush } from './helpers/dom-env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (...p) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');
const indexHtml = read('index.html');

let caseId = 0;
const freshAccount = () => import(`../js/account.js?beta=${caseId++}`);

const CFG = (beta) => ({ ok: true, status: 200, json: async () => ({ beta }) });
const ME = (over = {}) => ({ ok: true, status: 200, json: async () => ({
  email: 'u@x.test', verified: true, inviteState: 'pending', activeRequest: null, ...over }) });

// records every fetched path so tests can assert what was / wasn't hit (e.g. no status poll when held)
function recordingFetch(beta, meOver = {}, extra = {}) {
  const paths = [];
  const fn = async (p) => {
    paths.push(p);
    if (p === '/api/config') return CFG(beta);
    if (p === '/api/me') return ME(meOver);
    if (extra[p]) return extra[p];
    throw new Error(`unexpected fetch ${p}`);
  };
  return { fn, paths };
}

// The badge + notice must exist in the static markup (hidden), so JS only has to reveal them.
test('the BETA badge and randomizer notice ship hidden in the markup', () => {
  assert.match(indexHtml, /id="beta-badge"[^>]*hidden/, 'badge present + hidden by default');
  assert.match(indexHtml, /id="beta-notice"[^>]*hidden/, 'notice present + hidden by default');
});

test('BETA on reveals the badge + notice and shows "Pending invite" in Settings', async () => {
  const env = installDomEnv();
  try {
    global.localStorage.setItem('ec_jwt', 'tok');
    const { fn } = recordingFetch(true, { inviteState: 'pending' });
    env.setFetch(fn);
    const account = await freshAccount();
    await account.initAccount({});
    await flush(); await flush();

    assert.equal(account.getBetaMode(), true);
    assert.equal(env.getEl('beta-badge').hidden, false, 'BETA badge revealed');
    assert.equal(env.getEl('beta-notice').hidden, false, 'randomizer notice revealed');
    const settings = env.getEl('settings-content').innerHTML;
    assert.match(settings, /Beta access/, 'the Settings beta-access row is present');
    assert.match(settings, /Pending invite/, 'a verified, non-accepted user is pending');
  } finally { env.restore(); }
});

test('BETA on + accepted user shows "Accepted" in Settings', async () => {
  const env = installDomEnv();
  try {
    global.localStorage.setItem('ec_jwt', 'tok');
    const { fn } = recordingFetch(true, { inviteState: 'accepted' });
    env.setFetch(fn);
    const account = await freshAccount();
    await account.initAccount({});
    await flush(); await flush();
    assert.match(env.getEl('settings-content').innerHTML, /Accepted/, 'accepted users can build');
  } finally { env.restore(); }
});

test('BETA on + unverified email shows "Verify your email first" (invite needs a verified address)', async () => {
  const env = installDomEnv();
  try {
    global.localStorage.setItem('ec_jwt', 'tok');
    const { fn } = recordingFetch(true, { verified: false, inviteState: 'pending' });
    env.setFetch(fn);
    const account = await freshAccount();
    await account.initAccount({});
    await flush(); await flush();
    const settings = env.getEl('settings-content').innerHTML;
    assert.match(settings, /Beta access/);
    assert.match(settings, /Verify your email first/);
  } finally { env.restore(); }
});

test('BETA off keeps the badge + notice hidden and omits the beta-access row', async () => {
  const env = installDomEnv();
  try {
    global.localStorage.setItem('ec_jwt', 'tok');
    const { fn } = recordingFetch(false, { inviteState: 'pending' });
    env.setFetch(fn);
    const account = await freshAccount();
    await account.initAccount({});
    await flush(); await flush();

    assert.equal(account.getBetaMode(), false);
    assert.equal(env.getEl('beta-badge').hidden, true, 'no badge when beta is off');
    assert.equal(env.getEl('beta-notice').hidden, true, 'no notice when beta is off');
    assert.doesNotMatch(env.getEl('settings-content').innerHTML, /Beta access/, 'no beta-access row when off');
  } finally { env.restore(); }
});

test('a held (pending) run renders the "waiting for beta invite" state and never polls /api/status', async () => {
  const env = installDomEnv();
  try {
    global.localStorage.setItem('ec_jwt', 'tok');
    const { fn, paths } = recordingFetch(true, {
      inviteState: 'pending',
      activeRequest: { id: 'p1', state: 'pending', romsDone: 0, romsTotal: 1 },
    });
    env.setFetch(fn);
    const account = await freshAccount();
    await account.initAccount({});
    await flush(); await flush();

    const row = env.getEl('rom-status').innerHTML;
    assert.match(row, /waiting for your beta invite/i, 'the held state is surfaced');
    assert.match(row, /never expires/i, 'and states the prepared run does not expire');
    assert.ok(!paths.includes('/api/status'), 'a held run does not poll — nothing transitions until an invite');
  } finally { env.restore(); }
});
