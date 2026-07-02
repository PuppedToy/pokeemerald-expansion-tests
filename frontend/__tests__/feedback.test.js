/**
 * Feedback section frontend tests (T-048). Runs under `node --test` against the zero-dep DOM/env
 * stub (ADR-009). feedback.js is dependency-injected (getAuthState / onAuthChange / api /
 * onRequestLogin), so the auth state and network are faked here — no server, no real DOM.
 *
 * feedback.js holds module-level state, so each test imports a FRESH instance via a cache-busting
 * query string to stay isolated.
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
const freshFeedback = () => import(`../js/feedback.js?case=${caseId++}`);

// A controllable deps object: `authState` is mutated + `fireAuthChange()` re-notifies listeners,
// modelling account.js's onAuthChange firing on login/logout.
function makeDeps(initialState = null) {
  const listeners = [];
  const apiCalls = [];
  return {
    authState: initialState,
    fireAuthChange() { listeners.forEach((fn) => fn(this.authState)); },
    apiCalls,
    loginRequests: 0,
    deps: {
      getAuthState() { return this.authState; },
      onAuthChange: (fn) => listeners.push(fn),
      api: async (path, opts) => { apiCalls.push({ path, opts }); return { ok: true, status: 201, data: { ok: true } }; },
      onRequestLogin() {},
    },
  };
}

test('logged-out: the form is non-interactive and shows the "must be logged in" notice', async () => {
  const env = installDomEnv();
  try {
    const ctx = makeDeps(null);
    const fb = await freshFeedback();
    fb.initFeedback({ ...ctx.deps, getAuthState: () => ctx.authState });
    await flush();

    const mount = env.getEl('feedback-form-mount');
    assert.match(mount.innerHTML, /must be logged in to send feedback/i);
    assert.match(mount.innerHTML, /disabled/, 'inputs are rendered disabled (non-interactive)');
    assert.equal(ctx.apiCalls.length, 0, 'nothing is submitted while logged out');
  } finally { env.restore(); }
});

test('logged-in: submitting posts to /api/feedback and shows the thank-you message', async () => {
  const env = installDomEnv();
  try {
    const ctx = makeDeps({ email: 'u@x.test' });
    const fb = await freshFeedback();
    fb.initFeedback({ ...ctx.deps, getAuthState: () => ctx.authState });
    await flush();

    env.getEl('feedback-message').value = 'Please add more starters';
    env.getEl('feedback-form')._emit('submit', { preventDefault() {} });
    await flush();

    assert.equal(ctx.apiCalls.length, 1, 'one POST is made');
    const call = ctx.apiCalls[0];
    assert.equal(call.path, '/api/feedback');
    assert.equal(call.opts.method, 'POST');
    assert.equal(call.opts.auth, true);
    assert.equal(call.opts.body.message, 'Please add more starters');
    assert.equal(call.opts.body.category, 'feature', 'defaults to Feature request');

    assert.match(env.getEl('feedback-form-mount').innerHTML, /Thanks for the feedback/i);
  } finally { env.restore(); }
});

test('logged-in: choosing "Bug report" is reflected in the posted category', async () => {
  const env = installDomEnv();
  try {
    const ctx = makeDeps({ email: 'u@x.test' });
    const fb = await freshFeedback();
    fb.initFeedback({ ...ctx.deps, getAuthState: () => ctx.authState });
    await flush();

    env.getEl('fb-cat-bug')._emit('change', {});     // pick "Bug report"
    env.getEl('feedback-message').value = 'It crashes';
    env.getEl('feedback-form')._emit('submit', { preventDefault() {} });
    await flush();

    assert.equal(ctx.apiCalls[0].opts.body.category, 'bug');
  } finally { env.restore(); }
});

test('logged-in: an empty message is not submitted and shows a validation note', async () => {
  const env = installDomEnv();
  try {
    const ctx = makeDeps({ email: 'u@x.test' });
    const fb = await freshFeedback();
    fb.initFeedback({ ...ctx.deps, getAuthState: () => ctx.authState });
    await flush();

    env.getEl('feedback-message').value = '   ';
    env.getEl('feedback-form')._emit('submit', { preventDefault() {} });
    await flush();

    assert.equal(ctx.apiCalls.length, 0, 'blank message never hits the API');
    assert.notEqual(env.getEl('feedback-msg').textContent, '', 'a validation note is shown');
  } finally { env.restore(); }
});

// ── structural guards (index.html ships the tab, section and empty placeholder lists) ──
test('index.html ships the Feedback tab, section, form mount and placeholder lists', () => {
  const html = read('index.html');
  assert.match(html, /data-tab="feedback"/, 'top-nav has a Feedback tab');
  assert.match(html, /id="tab-feedback"/, 'a #tab-feedback section exists');
  assert.match(html, /id="feedback-form-mount"/, 'the form mount point exists');
  assert.match(html, /data-fb-tab="features"[\s\S]*Most requested features/, 'features list tab');
  assert.match(html, /data-fb-tab="bugs"[\s\S]*Known bugs/, 'known-bugs list tab');
  assert.match(html, /Coming soon!/, 'the empty lists show a "coming soon" placeholder');
});

test('app.js wires initFeedback with the account auth deps', () => {
  const appJs = read('js', 'app.js');
  assert.match(appJs, /import \{ initFeedback \} from '\.\/feedback\.js'/);
  assert.match(appJs, /initFeedback\(/);
});

test('logging in re-renders the form as interactive (auth-change subscription)', async () => {
  const env = installDomEnv();
  try {
    const ctx = makeDeps(null);
    const fb = await freshFeedback();
    fb.initFeedback({ ...ctx.deps, getAuthState: () => ctx.authState });
    await flush();
    assert.match(env.getEl('feedback-form-mount').innerHTML, /must be logged in/i);

    ctx.authState = { email: 'u@x.test' };
    ctx.fireAuthChange();
    await flush();

    const html = env.getEl('feedback-form-mount').innerHTML;
    assert.doesNotMatch(html, /must be logged in/i, 'the lock notice is gone once logged in');
    assert.match(html, /feedback-message|textarea/i, 'the interactive form is now present');
  } finally { env.restore(); }
});
