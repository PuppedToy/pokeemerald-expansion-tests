/**
 * T-225 — registering logs you straight in (no separate login step), and the raw patch download is named
 * run-<seed>-patch.zip (T-211 scheme). Functional test for the auto-login via the zero-dep DOM stub;
 * source-inspection for the download name + that the "then log in" message is gone.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installDomEnv, flush } from './helpers/dom-env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (...p) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');

let caseId = 0;
const freshAccount = () => import(`../js/account.js?reg=${caseId++}`);

test('registering logs you straight in — no separate login step', async () => {
  const env = installDomEnv();
  try {
    const calls = [];
    env.setFetch(async (p) => {
      calls.push(p);
      if (p === '/api/config') return { ok: true, status: 200, json: async () => ({ beta: false }) };
      if (p === '/api/register') return { ok: true, status: 201, json: async () => ({ ok: true }) };
      if (p === '/api/login') return { ok: true, status: 200, json: async () => ({ token: 'tok' }) };
      if (p === '/api/me') return { ok: true, status: 200, json: async () => ({ email: 'n@x.test', verified: false, inviteState: 'pending', activeRequest: null }) };
      throw new Error(`unexpected fetch ${p}`);
    });

    const account = await freshAccount();
    await account.initAccount({});
    await flush();

    env.getEl('reg-email').value = 'n@x.test';
    env.getEl('reg-password').value = 'password123';
    env.getEl('reg-consent').checked = true;
    env.getEl('auth-form-register')._emit('submit', { preventDefault() {} });
    await flush(); await flush();

    assert.ok(calls.includes('/api/register'), 'registered');
    assert.ok(calls.includes('/api/login'), 'and auto-logged-in in the same flow');
    assert.equal(global.localStorage.getItem('ec_jwt'), 'tok', 'session token stored → logged in, no 2nd step');
  } finally { env.restore(); }
});

test('source: auto-login wired + patch download uses the run-<seed>-patch.zip name', () => {
  const src = read('js', 'account.js');
  assert.doesNotMatch(src, /then log in/, 'no "…then log in" message after register');
  assert.match(src, /await doLogin\(email, password\)/, 'doRegister auto-logs-in');
  assert.match(src, /run-\$\{seed\}-patch\.zip/, 'raw patch download named like the other archives');
  assert.doesNotMatch(src, /emerald-cut-patch\.zip/, 'the old generic patch name is gone');
});
