/**
 * T-259 — the frontend's destinations are real paths (/features, /features/docs, …), so the server has
 * to answer them with the app shell. The route list comes from the frontend's router.js — its single
 * home — so a new destination cannot be navigable in the browser and 404 on a reload.
 *
 * The guard that matters most here is the negative one: only known paths get the shell. A blanket
 * catch-all would turn every typo, missing asset and unmatched /api call into a 200 page of HTML.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';

import { createShellRouter } from '../shell/routes.js';
import { SHELL_PATHS, CANONICAL_PATHS } from '../../frontend/js/router.js';

const BASE_URL = 'https://emerald-cut-randomizer.test';
const SHELL_SRC = '<!DOCTYPE html><title>Pokémon Emerald Cut</title><nav class="topnav">source</nav>';
const SHELL_DIST = '<!DOCTYPE html><title>Pokémon Emerald Cut</title><nav class="topnav">dist</nav>';

// A throwaway frontend tree: the hand-written shell plus a minified dist/ copy and one real asset.
function makeFrontend() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ec-shell-'));
  fs.mkdirSync(path.join(dir, 'dist'));
  fs.mkdirSync(path.join(dir, 'css'));
  fs.writeFileSync(path.join(dir, 'index.html'), SHELL_SRC);
  fs.writeFileSync(path.join(dir, 'dist', 'index.html'), SHELL_DIST);
  fs.writeFileSync(path.join(dir, 'css', 'base.css'), 'body{color:red}');
  fs.writeFileSync(path.join(dir, 'privacy.html'), '<!DOCTYPE html><title>Privacy</title>');
  return dir;
}

// Assembled in the same order as server.js: real files win, then the shell routes, then Express's 404.
async function withServer({ serveDist = false } = {}, fn) {
  const frontendDir = makeFrontend();
  const app = express();
  app.get('/api/ping', (req, res) => res.json({ ok: true }));
  if (serveDist) app.use(express.static(path.join(frontendDir, 'dist')));
  app.use(express.static(frontendDir));
  app.use(createShellRouter({ frontendDir, serveDist, baseUrl: BASE_URL }));

  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const { port } = server.address();
  const get = async (p) => {
    const res = await fetch(`http://localhost:${port}${p}`, { redirect: 'manual' });
    return { status: res.status, type: res.headers.get('content-type') || '', body: await res.text() };
  };
  try {
    await fn(get);
  } finally {
    server.close();
    fs.rmSync(frontendDir, { recursive: true, force: true });
  }
}

// ── the app shell ─────────────────────────────────────────────────────────────

test('every path the router knows is answered with the app shell', async () => {
  await withServer({}, async (get) => {
    for (const p of SHELL_PATHS) {
      const res = await get(p);
      assert.equal(res.status, 200, `${p} must render the app, not ${res.status}`);
      assert.match(res.body, /class="topnav"/, `${p} must return the app shell`);
      assert.match(res.type, /text\/html/, `${p} must be served as HTML`);
    }
  });
});

test('a list inside a tab survives a reload', async () => {
  await withServer({}, async (get) => {
    for (const p of ['/features', '/features/docs', '/feedback/bugs']) {
      assert.equal((await get(p)).status, 200, `${p} must be reloadable`);
    }
  });
});

test('unknown paths still 404 — the shell is not a catch-all', async () => {
  await withServer({}, async (get) => {
    for (const p of ['/nope', '/features/nope', '/randomizer/2', '/css/missing.css', '/api/unmatched']) {
      assert.equal((await get(p)).status, 404, `${p} must 404, not silently return HTML`);
    }
  });
});

test('real files and API routes are untouched', async () => {
  await withServer({}, async (get) => {
    const css = await get('/css/base.css');
    assert.equal(css.status, 200);
    assert.match(css.body, /color:red/, 'the stylesheet itself, not the shell');

    const legal = await get('/privacy.html');
    assert.match(legal.body, /Privacy/, 'the standalone page keeps serving itself');

    const api = await get('/api/ping');
    assert.equal(api.body, '{"ok":true}', 'the API is not shadowed by the shell routes');
  });
});

test('in production the minified shell is served, as for /', async () => {
  await withServer({ serveDist: true }, async (get) => {
    assert.match((await get('/')).body, /dist/, 'sanity: / comes from dist');
    assert.match((await get('/features')).body, /dist/, 'a route must serve the same shell / does');
  });
});

test('a missing dist falls back to the source shell rather than failing', async () => {
  // serveDist on, but nothing mounted from dist/ — mirrors a box that has not run `node build.js`.
  const frontendDir = makeFrontend();
  fs.rmSync(path.join(frontendDir, 'dist'), { recursive: true, force: true });
  const app = express();
  app.use(createShellRouter({ frontendDir, serveDist: true, baseUrl: BASE_URL }));
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const { port } = server.address();
  try {
    const res = await fetch(`http://localhost:${port}/features`);
    assert.equal(res.status, 200);
    assert.match(await res.text(), /source/);
  } finally {
    server.close();
    fs.rmSync(frontendDir, { recursive: true, force: true });
  }
});

// ── discoverability ───────────────────────────────────────────────────────────

test('robots.txt points crawlers at the sitemap and keeps them out of the private paths', async () => {
  await withServer({}, async (get) => {
    const res = await get('/robots.txt');
    assert.equal(res.status, 200);
    assert.match(res.type, /text\/plain/);
    assert.match(res.body, new RegExp(`^Sitemap: ${BASE_URL}/sitemap\\.xml$`, 'm'), 'absolute sitemap URL');
    assert.match(res.body, /^User-agent: \*$/m);
    assert.match(res.body, /^Disallow: \/admin$/m, 'the admin panel is not for crawlers');
    assert.match(res.body, /^Disallow: \/api\/$/m);
  });
});

test('sitemap.xml lists every public destination once, as an absolute URL', async () => {
  await withServer({}, async (get) => {
    const res = await get('/sitemap.xml');
    assert.equal(res.status, 200);
    assert.match(res.type, /xml/);
    const locs = [...res.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.deepEqual(locs, CANONICAL_PATHS.map((p) => `${BASE_URL}${p}`));
    assert.ok(!res.body.includes('/admin'), 'the admin panel stays out of the sitemap');
    assert.ok(!res.body.includes('/features/rom'), 'no alias duplicates the canonical /features');
  });
});
