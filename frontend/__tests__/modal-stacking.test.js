/**
 * B-074 regression: the auth modal can be summoned from *inside* another modal — the presets modal's
 * "Log in / Register" CTA — and must then behave as the topmost layer while the modal underneath stays
 * open, so it re-renders with the user's data once logged in.
 *
 * Three guards, one per way the flow broke:
 *   1. stacking — both overlays share `.modal-overlay` (z-index:1000) and `#presets-modal` is declared
 *      after `#auth-modal` in index.html, so equal z-index left the login form behind an overlay that
 *      also swallowed every click. Structural CSS guard (the honest browser reproduction, a real click
 *      on the login form, lives in visual-tests/interaction.spec.mjs).
 *   2. Escape — both modules bind their own document-level handler, so one Escape closed both modals.
 *   3. reload — logging in must re-render the open presets modal with the user's own presets.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installDomEnv, flush } from './helpers/dom-env.js';
import { initPresets } from '../js/presets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'components.css'), 'utf8');

const cfg = () => ({ battleFormat: 'singles', runType: 'default', wildEncounterType: 'deterministic' });

// Pull the z-index out of the first rule whose selector list contains `sel`.
function zIndexOf(sel) {
  const re = new RegExp(`(^|[},])\\s*[^{}]*${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^{}]*\\{([^}]*)\\}`, 'm');
  const rule = css.match(re);
  const z = rule && rule[2].match(/z-index\s*:\s*(-?\d+)/);
  return z ? Number(z[1]) : null;
}

test('B-074: the auth modal outranks the shared modal overlay so it can stack on another modal', () => {
  const base = zIndexOf('.modal-overlay');
  const auth = zIndexOf('#auth-modal');
  assert.ok(Number.isFinite(base), '.modal-overlay must declare a z-index');
  assert.ok(
    Number.isFinite(auth) && auth > base,
    `#auth-modal must declare a z-index above .modal-overlay's ${base} (got ${auth}); otherwise the login `
    + 'form summoned from the presets modal paints behind it and cannot be clicked',
  );
});

const deps = (over = {}) => ({
  api: async () => ({ ok: true, data: { items: [], page: 1, totalPages: 1 } }),
  getAuthState: () => null,
  onAuthChange: () => {},
  getCurrentConfig: () => cfg(),
  applyConfig: () => {},
  onRequestLogin: () => {},
  defaults: cfg(),
  renderConfigDetail: () => '',
  ...over,
});

test('B-074: Escape closes the topmost modal only — the presets modal survives the login form', () => {
  const env = installDomEnv();
  try {
    initPresets(deps());
    env.getEl('presets-modal').hidden = false; // browsing presets…
    env.getEl('auth-modal').hidden = false;    // …and the login form was summoned on top of it

    env.emitDocument('keydown', { key: 'Escape' });
    assert.equal(
      env.getEl('presets-modal').hidden, false,
      'the auth modal owns Escape while it is on top; the presets modal must stay open',
    );

    env.getEl('auth-modal').hidden = true; // login dismissed → the presets modal is topmost again
    env.emitDocument('keydown', { key: 'Escape' });
    assert.equal(env.getEl('presets-modal').hidden, true, 'Escape closes the presets modal once it is topmost');
  } finally { env.restore(); }
});

test('B-074: logging in re-renders the open presets modal with the user’s own presets', async () => {
  const env = installDomEnv();
  try {
    let auth = null;                  // auth state, flipped by the "login"
    let notify = () => {};            // account.js's onAuthChange subscription
    const calls = [];
    const ctl = initPresets(deps({
      api: async (p, opts) => {
        calls.push({ path: p, auth: !!opts?.auth });
        return { ok: true, data: { items: [{ id: 'p1', name: 'My run', isOwner: true, published: false, tags: {}, updatedAt: 0 }], page: 1, totalPages: 1 } };
      },
      getAuthState: () => auth,
      onAuthChange: (fn) => { notify = fn; },
    }));

    ctl.openBrowse();
    await flush();
    assert.match(env.getEl('presets-body').innerHTML, /preset-login-link/, 'logged out: the login CTA');
    assert.equal(calls.length, 0, 'logged out: no request for someone else’s presets');

    auth = { email: 'a@x.test', verified: true, isAdmin: false }; // the login lands…
    notify(auth);                                                // …and account.js announces it
    await flush(); await flush();

    assert.equal(env.getEl('presets-modal').hidden, false, 'the presets modal stayed open through the login');
    assert.ok(calls.some((c) => c.path.includes('scope=mine') && c.auth), 'fetched the user’s presets');
    assert.match(env.getEl('presets-body').innerHTML, /My run/, 'rendered them in place of the login CTA');
  } finally { env.restore(); }
});
