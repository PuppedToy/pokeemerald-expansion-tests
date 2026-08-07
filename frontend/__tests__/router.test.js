/**
 * T-259 — the route table is the single home for "which URLs this site has". It is a pure module
 * (no DOM), consumed by app.js in the browser AND by backend/server.js to decide which paths get the
 * app shell, so it is unit-tested directly rather than through the DOM stub (ADR-009).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  SITE_TITLE, ROUTES, SHELL_PATHS, CANONICAL_PATHS,
  parsePath, pathFor, titleFor,
} from '../js/router.js';

// ── parsePath ─────────────────────────────────────────────────────────────────

test('the site root is Home', () => {
  assert.deepEqual(parsePath('/'), { tab: 'home', subtab: null });
});

test('each top-level destination has its own path', () => {
  assert.deepEqual(parsePath('/randomizer'), { tab: 'randomizer', subtab: null });
  assert.deepEqual(parsePath('/settings'), { tab: 'settings', subtab: null });
  assert.deepEqual(parsePath('/admin'), { tab: 'admin', subtab: null });
});

test('a tab with lists lands on its first list', () => {
  assert.deepEqual(parsePath('/features'), { tab: 'features', subtab: 'rom' });
  assert.deepEqual(parsePath('/feedback'), { tab: 'feedback', subtab: 'features' });
});

test('every list inside a tab is addressable', () => {
  assert.deepEqual(parsePath('/features/rom'), { tab: 'features', subtab: 'rom' });
  assert.deepEqual(parsePath('/features/randomizer'), { tab: 'features', subtab: 'randomizer' });
  assert.deepEqual(parsePath('/features/docs'), { tab: 'features', subtab: 'docs' });
  assert.deepEqual(parsePath('/feedback/bugs'), { tab: 'feedback', subtab: 'bugs' });
});

test('/features/randomizer is the Features list, not the Randomizer page', () => {
  assert.deepEqual(parsePath('/features/randomizer'), { tab: 'features', subtab: 'randomizer' });
  assert.deepEqual(parsePath('/randomizer'), { tab: 'randomizer', subtab: null });
});

test('unknown paths do not resolve (the server must 404 them, not serve the shell)', () => {
  for (const p of ['/nope', '/features/nope', '/randomizer/1', '/settings/x', '/api/me', '/js/app.js']) {
    assert.equal(parsePath(p), null, `${p} must not resolve to a destination`);
  }
});

test('parsePath tolerates what a browser or Express will actually hand it', () => {
  // Express matches paths case-insensitively by default, so the shell IS served for /Features.
  assert.deepEqual(parsePath('/Features/DOCS'), { tab: 'features', subtab: 'docs' });
  // A trailing slash is the same destination, not a second URL.
  assert.deepEqual(parsePath('/features/'), { tab: 'features', subtab: 'rom' });
  assert.deepEqual(parsePath('/features/docs/'), { tab: 'features', subtab: 'docs' });
  // Defensive: no pathname at all is Home.
  assert.deepEqual(parsePath(''), { tab: 'home', subtab: null });
  assert.deepEqual(parsePath(undefined), { tab: 'home', subtab: null });
});

test('/home is an accepted alias of the root', () => {
  assert.deepEqual(parsePath('/home'), { tab: 'home', subtab: null });
});

// ── pathFor ───────────────────────────────────────────────────────────────────

test('pathFor gives the canonical path of a destination', () => {
  assert.equal(pathFor('home'), '/');
  assert.equal(pathFor('features'), '/features');
  assert.equal(pathFor('randomizer'), '/randomizer');
  assert.equal(pathFor('features', 'docs'), '/features/docs');
  assert.equal(pathFor('feedback', 'bugs'), '/feedback/bugs');
});

test('the first list is canonically the bare tab path, so it is not a duplicate URL', () => {
  assert.equal(pathFor('features', 'rom'), '/features');
  assert.equal(pathFor('feedback', 'features'), '/feedback');
});

test('pathFor returns the deepest path it can honour', () => {
  assert.equal(pathFor('features', 'nope'), '/features', 'an unknown list falls back to its tab');
  assert.equal(pathFor('randomizer', 'anything'), '/randomizer', 'a tab with no lists ignores one');
  assert.equal(pathFor('nope'), null, 'an unknown tab has no path');
});

test('every canonical path round-trips through parsePath', () => {
  for (const p of CANONICAL_PATHS) {
    const r = parsePath(p);
    assert.notEqual(r, null, `${p} must resolve`);
    assert.equal(pathFor(r.tab, r.subtab), p, `${p} must be its own canonical form`);
  }
});

// ── titles ────────────────────────────────────────────────────────────────────

test('each route carries its own title, so the URLs are distinguishable when indexed', () => {
  assert.equal(titleFor('home'), SITE_TITLE);
  assert.equal(titleFor('features'), `Features · ${SITE_TITLE}`);
  assert.equal(titleFor('features', 'rom'), `Features · ${SITE_TITLE}`, 'the default list IS the page');
  assert.equal(titleFor('features', 'docs'), `Generated docs · Features · ${SITE_TITLE}`);
  assert.equal(titleFor('feedback', 'bugs'), `Known bugs · Feedback · ${SITE_TITLE}`);
});

test('an unknown destination still yields a usable title', () => {
  assert.equal(titleFor('nope'), SITE_TITLE);
});

// ── the lists the server and the sitemap consume ───────────────────────────────

test('SHELL_PATHS covers every path that must render the app', () => {
  for (const p of ['/', '/home', '/features', '/features/rom', '/features/randomizer', '/features/docs',
    '/randomizer', '/feedback', '/feedback/features', '/feedback/bugs', '/settings', '/admin']) {
    assert.ok(SHELL_PATHS.includes(p), `${p} must be served the app shell`);
  }
});

test('SHELL_PATHS holds nothing that parsePath would reject', () => {
  for (const p of SHELL_PATHS) {
    assert.notEqual(parsePath(p), null, `${p} is served the shell but resolves to no destination`);
  }
  assert.equal(new Set(SHELL_PATHS).size, SHELL_PATHS.length, 'no duplicate paths');
});

test('the sitemap lists each public destination exactly once — no aliases, no private pages', () => {
  assert.deepEqual(CANONICAL_PATHS, [
    '/', '/features', '/features/randomizer', '/features/docs',
    '/randomizer', '/feedback', '/feedback/bugs', '/settings',
  ]);
  assert.ok(!CANONICAL_PATHS.includes('/admin'), 'the admin panel is not for crawlers');
  assert.ok(!CANONICAL_PATHS.includes('/home'), '/home is an alias of /');
  assert.ok(!CANONICAL_PATHS.includes('/features/rom'), '/features/rom is an alias of /features');
});

test('the route table stays in sync with itself', () => {
  const tabs = ROUTES.map((r) => r.tab);
  assert.equal(new Set(tabs).size, tabs.length, 'one entry per tab');
  for (const r of ROUTES) {
    assert.equal(pathFor(r.tab), r.path, `${r.tab}'s declared path is its canonical path`);
    for (const l of r.lists || []) {
      assert.deepEqual(parsePath(`${r.path}/${l.key}`), { tab: r.tab, subtab: l.key });
    }
  }
});
