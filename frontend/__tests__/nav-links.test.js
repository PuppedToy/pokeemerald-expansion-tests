/**
 * T-259 — the navigation must be made of real links. Not "buttons that look like links": crawlable
 * `<a href="/…">` anchors with the route's own path, so the link graph exists, ctrl/cmd-click opens a
 * new tab, and right-click → copy link address yields something that works when pasted.
 *
 * Source-inspection (ADR-009), and cross-checked against router.js so a nav entry can never point at a
 * path the router does not resolve — or a route quietly lose its way in.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ROUTES, pathFor, parsePath } from '../js/router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// Every element carrying `cls` in its class list, as { tag, attrs }.
function elements(cls) {
  const out = [];
  for (const m of html.matchAll(/<(\w+)\s([^>]*)>/g)) {
    const [, tag, raw] = m;
    const attrs = {};
    for (const a of raw.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] ?? '';
    if ((attrs.class || '').split(/\s+/).includes(cls)) out.push({ tag, attrs });
  }
  return out;
}

// ── top nav ───────────────────────────────────────────────────────────────────

test('every top-nav destination is an anchor pointing at its own path', () => {
  const tabs = elements('topnav-tab');
  assert.equal(tabs.length, ROUTES.length, 'one nav entry per route');
  for (const { tag, attrs } of tabs) {
    assert.equal(tag, 'a', `the "${attrs['data-tab']}" nav entry must be an <a>, not a <${tag}>`);
    assert.equal(attrs.href, pathFor(attrs['data-tab']), `"${attrs['data-tab']}" must link to its own path`);
  }
});

test('the nav covers every route, and nothing else', () => {
  const linked = elements('topnav-tab').map((e) => e.attrs['data-tab']).sort();
  assert.deepEqual(linked, ROUTES.map((r) => r.tab).sort());
});

test('the brand links home', () => {
  const [brand] = elements('topnav-brand');
  assert.equal(brand.tag, 'a');
  assert.equal(brand.attrs.href, pathFor('home'));
});

// ── the lists inside a tab ────────────────────────────────────────────────────

const LIST_CLASS = { features: 'subtab', feedback: 'fb-tab' };
const LIST_ATTR = { features: 'data-subtab', feedback: 'data-fb-tab' };

test('every list inside a tab is its own link', () => {
  for (const route of ROUTES.filter((r) => r.lists)) {
    const links = elements(LIST_CLASS[route.tab]);
    assert.equal(links.length, route.lists.length, `${route.tab} shows one link per list`);
    for (const { tag, attrs } of links) {
      const key = attrs[LIST_ATTR[route.tab]];
      assert.equal(tag, 'a', `the ${route.tab} "${key}" list must be an <a>, not a <${tag}>`);
      assert.equal(attrs.href, pathFor(route.tab, key), `${route.tab}/${key} must link to its own path`);
    }
    assert.deepEqual(
      links.map((e) => e.attrs[LIST_ATTR[route.tab]]).sort(),
      route.lists.map((l) => l.key).sort(),
      `${route.tab} links every list the router declares`,
    );
  }
});

// ── in-page links to a destination ────────────────────────────────────────────

test('in-page calls-to-action are links too, not scripted buttons', () => {
  const ctas = elements('goto-tab');
  assert.ok(ctas.length > 0, 'the landing CTA still exists');
  for (const { tag, attrs } of ctas) {
    assert.equal(tag, 'a', `a [data-goto-tab] CTA must be an <a>, not a <${tag}>`);
    assert.equal(attrs.href, pathFor(attrs['data-goto-tab']));
  }
});

// ── the whole-file guarantee ──────────────────────────────────────────────────

test('no navigation is left as a scripted button', () => {
  for (const cls of ['topnav-tab', 'topnav-brand', 'subtab', 'fb-tab', 'goto-tab']) {
    assert.doesNotMatch(
      html, new RegExp(`<button[^>]*class="[^"]*\\b${cls}\\b`),
      `${cls} must not be a <button> — it is a destination, so it is a link`,
    );
  }
});

test('every internal href in the shell resolves to a real destination or a real file', () => {
  const files = new Set(['/privacy.html', '/terms.html']); // standalone pages, served as themselves
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = m[1];
    if (files.has(href) || href.startsWith('/assets/') || href.startsWith('/css/')) continue;
    assert.notEqual(parsePath(href), null, `${href} is linked but resolves to nothing`);
  }
});
