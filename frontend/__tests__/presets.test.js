// T-192 — presets.js unit tests. Pure render/query helpers are tested directly; two controller flows
// run against the zero-dep DOM stub (ADR-009). No server, no browser.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installDomEnv, flush } from './helpers/dom-env.js';

import {
  deriveTags, escapeHtml, fmtDate, tagChipsHtml, presetCardHtml, listHtml,
  paginationHtml, communityFiltersHtml, buildListQuery, saveFormHtml, initPresets,
} from '../js/presets.js';

const cfg = (over = {}) => ({ battleFormat: 'singles', runType: 'default', wildEncounterType: 'deterministic', ...over });

// ── pure helpers ─────────────────────────────────────────────────────────────────

test('deriveTags mirrors config and maps runType default→normal, with fallbacks', () => {
  assert.deepEqual(deriveTags(cfg()), { format: 'singles', mode: 'normal', wild: 'deterministic' });
  assert.deepEqual(deriveTags(cfg({ battleFormat: 'doubles', runType: 'soullink', wildEncounterType: 'classic' })),
    { format: 'doubles', mode: 'soullink', wild: 'classic' });
  assert.deepEqual(deriveTags({}), { format: 'singles', mode: 'normal', wild: 'deterministic' });
});

test('escapeHtml neutralises HTML', () => {
  assert.equal(escapeHtml('<b>"x"</b> & \'y\''), '&lt;b&gt;&quot;x&quot;&lt;/b&gt; &amp; &#39;y&#39;');
});

test('fmtDate renders an ISO date or empty for non-finite', () => {
  assert.equal(fmtDate(0), '1970-01-01');
  assert.equal(fmtDate(null), '');
});

test('tagChipsHtml renders human labels for each dimension', () => {
  const html = tagChipsHtml({ format: 'mixed', mode: 'nuzlocke', wild: 'classic' });
  assert.match(html, /Mixed/);
  assert.match(html, /Nuzlocke/);
  assert.match(html, /Classic/);
});

test('buildListQuery sets scope+page and omits empty filters', () => {
  assert.equal(buildListQuery('mine', { page: 2 }), '/api/presets?scope=mine&page=2');
  const q = buildListQuery('community', { q: 'fire', format: 'doubles', mode: '', sort: 'likes', since: 'year', page: 1 });
  assert.match(q, /scope=community/);
  assert.match(q, /q=fire/);
  assert.match(q, /format=doubles/);
  assert.match(q, /sort=likes/);
  assert.ok(!/mode=/.test(q), 'empty filter is omitted');
  assert.match(q, /page=1/);
});

test('presetCardHtml (owner) shows Edit/Publish/Delete and escapes the name', () => {
  const html = presetCardHtml(
    { id: 'p1', name: '<script>', description: '', isOwner: true, published: false, tags: deriveTags(cfg()), updatedAt: 0 },
    { mode: 'mine' },
  );
  assert.match(html, /data-action="edit"/);
  assert.match(html, /data-action="publish"/);
  assert.match(html, /data-action="delete"/);
  assert.match(html, /&lt;script&gt;/, 'name is escaped');
  assert.ok(!/data-action="like"/.test(html), 'owner never sees a like button');
});

test('presetCardHtml (published owner) shows Unpublish and stats', () => {
  const html = presetCardHtml(
    { id: 'p1', name: 'Mine', isOwner: true, published: true, likes: 3, views: 9, tags: deriveTags(cfg()), updatedAt: 0 },
    { mode: 'mine' },
  );
  assert.match(html, /data-action="unpublish"/);
  assert.match(html, /♥ 3/);
  assert.match(html, /👁 9/);
});

test('presetCardHtml (community non-owner) shows a Like toggle reflecting likedByMe', () => {
  const base = { id: 'p1', name: 'Shared', isOwner: false, published: true, likes: 1, views: 2, tags: deriveTags(cfg()), updatedAt: 0 };
  assert.match(presetCardHtml({ ...base, likedByMe: false }, { mode: 'community' }), /♡ Like/);
  assert.match(presetCardHtml({ ...base, likedByMe: true }, { mode: 'community' }), /♥ Liked/);
});

test('presetCardHtml (community, admin) adds moderation actions on others’ presets', () => {
  const html = presetCardHtml(
    { id: 'p1', name: 'Shared', isOwner: false, published: true, tags: deriveTags(cfg()), updatedAt: 0 },
    { mode: 'community', viewerIsAdmin: true },
  );
  assert.match(html, /data-action="unpublish"/);
  assert.match(html, /data-action="delete"/);
});

test('presetCardHtml (save mode, owner) shows Overwrite instead of Apply', () => {
  const html = presetCardHtml(
    { id: 'p1', name: 'Mine', isOwner: true, published: false, tags: deriveTags(cfg()), updatedAt: 0 },
    { mode: 'save' },
  );
  assert.match(html, /data-action="overwrite"/);
  assert.ok(!/data-action="apply"/.test(html));
});

test('T-196: save-mode Overwrite reads as a caution action (orange), not the safe green', () => {
  const html = presetCardHtml(
    { id: 'p1', name: 'Mine', isOwner: true, published: false, tags: deriveTags(cfg()), updatedAt: 0 },
    { mode: 'save' },
  );
  const overwriteBtn = html.match(/<button[^>]*data-action="overwrite"[^>]*>/)[0];
  assert.match(overwriteBtn, /\bbtn-warn\b/, 'Overwrite uses the caution/orange style');
  assert.ok(!/\bbtn-emerald\b/.test(overwriteBtn), 'Overwrite is no longer the safe/green emerald button');
});

test('presetCardHtml (Recommended/official, non-owner) shows stats + Like + a Recommended badge', () => {
  const html = presetCardHtml(
    { id: 'official-balanced', name: 'Balanced', kind: 'official', isOwner: false, published: false, likes: 4, views: 7, likedByMe: false, tags: deriveTags(cfg()), updatedAt: 0 },
    { mode: 'official' },
  );
  assert.match(html, /Recommended/, 'shows the Recommended badge (not "Official")');
  assert.ok(!/>Official</.test(html), 'the old "Official" label is gone');
  assert.match(html, /👁 7/);
  assert.match(html, /♥ 4/);
  assert.match(html, /data-action="like"/, 'a non-owner can like a recommended preset');
  assert.match(html, /data-action="apply"/);
});

test('presetCardHtml (Recommended/official, owner) shows CRUD and no Like button', () => {
  const html = presetCardHtml(
    { id: 'official-balanced', name: 'Balanced', kind: 'official', isOwner: true, published: false, likes: 4, views: 7, tags: deriveTags(cfg()), updatedAt: 0 },
    { mode: 'official', viewerIsAdmin: true },
  );
  assert.match(html, /data-action="edit"/);
  assert.match(html, /data-action="delete"/);
  assert.ok(!/data-action="like"/.test(html), 'owner never likes their own preset');
  assert.match(html, /👁 7/, 'owner still sees stats on a recommended preset');
});

test('presetCardHtml shows the admin Recommend toggle only to admins, reflecting current kind', () => {
  const userPreset = { id: 'p1', name: 'Mine', kind: 'user', isOwner: true, published: false, tags: deriveTags(cfg()), updatedAt: 0 };
  const official = { ...userPreset, kind: 'official' };
  // Non-admin never sees it.
  assert.ok(!/data-action="recommend"/.test(presetCardHtml(userPreset, { mode: 'mine' })));
  // Admin on a user preset → "Make Recommended".
  const asAdmin = presetCardHtml(userPreset, { mode: 'mine', viewerIsAdmin: true });
  assert.match(asAdmin, /data-action="recommend"/);
  assert.match(asAdmin, /Make Recommended/);
  // Admin on an official preset → "Remove from Recommended".
  const officialAsAdmin = presetCardHtml(official, { mode: 'official', viewerIsAdmin: true });
  assert.match(officialAsAdmin, /data-action="unrecommend"/);
  assert.match(officialAsAdmin, /Remove from Recommended/);
  // Never in save mode.
  assert.ok(!/data-action="(un)?recommend"/.test(presetCardHtml(userPreset, { mode: 'save', viewerIsAdmin: true })));
});

test('paginationHtml hides for a single page and disables Prev on page 1', () => {
  assert.equal(paginationHtml(1, 1), '');
  const html = paginationHtml(1, 3);
  assert.match(html, /Page 1 of 3/);
  assert.match(html, /← Prev<\/button>/);
  assert.match(html, /data-page="2"/);
});

test('communityFiltersHtml renders the search box + five selects with current values', () => {
  const html = communityFiltersHtml({ q: 'abc', format: 'doubles', sort: 'likes', since: 'week' });
  assert.match(html, /value="abc"/);
  assert.match(html, /data-filter="format"/);
  assert.match(html, /data-filter="since"/);
  assert.match(html, /<option value="doubles" selected>/);
});

test('saveFormHtml exposes the official toggle only to admins', () => {
  assert.ok(!/preset-save-official/.test(saveFormHtml({ isAdmin: false })));
  assert.match(saveFormHtml({ isAdmin: true }), /preset-save-official/);
});

test('listHtml renders an empty state when there are no items', () => {
  assert.match(listHtml([], { mode: 'mine' }), /No presets found/);
});

// ── controller flows (DOM stub) ──────────────────────────────────────────────────

test('openSave without a session asks for login and keeps the modal closed', () => {
  const env = installDomEnv();
  try {
    let asked = 0;
    const ctl = initPresets({
      api: async () => ({ ok: true, data: { items: [], page: 1, totalPages: 1 } }),
      getAuthState: () => null,
      onAuthChange: () => {},
      getCurrentConfig: () => cfg(),
      applyConfig: () => {},
      onRequestLogin: () => { asked++; },
      defaults: cfg(),
      renderConfigDetail: () => '',
    });
    env.getEl('presets-modal').hidden = true; // stub defaults hidden=false; start "closed"
    ctl.openSave(cfg());
    assert.equal(asked, 1, 'login was requested');
    assert.equal(env.getEl('presets-modal').hidden, true, 'modal stayed closed (open() never ran)');
  } finally { env.restore(); }
});

test('openBrowse opens the modal and renders My presets from the API', async () => {
  const env = installDomEnv();
  try {
    const calls = [];
    const ctl = initPresets({
      api: async (path) => {
        calls.push(path);
        return { ok: true, data: { items: [{ id: 'p1', name: 'Solo run', isOwner: true, published: false, tags: deriveTags(cfg()), updatedAt: 0 }], page: 1, totalPages: 1 } };
      },
      getAuthState: () => ({ email: 'a@x.test', verified: true, isAdmin: false }),
      onAuthChange: () => {},
      getCurrentConfig: () => cfg(),
      applyConfig: () => {},
      onRequestLogin: () => {},
      defaults: cfg(),
      renderConfigDetail: () => '',
    });
    ctl.openBrowse();
    await flush(); await flush();
    assert.equal(env.getEl('presets-modal').hidden, false, 'modal opened');
    assert.ok(calls.some((p) => p.includes('scope=mine')), 'fetched My presets');
    assert.match(env.getEl('presets-body').innerHTML, /Solo run/, 'rendered the preset card');
  } finally { env.restore(); }
});

test('T-196: overwrite asks to confirm — cancel makes no PUT, confirm saves', async () => {
  const env = installDomEnv();
  try {
    const calls = [];
    const ctl = initPresets({
      api: async (path, opts) => {
        calls.push({ path, method: opts?.method || 'GET' });
        return { ok: true, data: { items: [{ id: 'p1', name: 'Mine', isOwner: true, published: false, tags: deriveTags(cfg()), updatedAt: 0 }], page: 1, totalPages: 1 } };
      },
      getAuthState: () => ({ email: 'a@x.test', verified: true, isAdmin: false }),
      onAuthChange: () => {},
      getCurrentConfig: () => cfg(),
      applyConfig: () => {},
      onRequestLogin: () => {},
      defaults: cfg(),
      renderConfigDetail: () => '',
    });
    ctl.openSave(cfg());
    await flush(); await flush();

    const clickOverwrite = () => {
      const btn = { dataset: { action: 'overwrite', id: 'p1' } };
      env.getEl('presets-body')._emit('click', { target: { closest: () => btn }, preventDefault() {} });
    };

    // Cancel → confirmation requested, nothing written.
    env.setConfirm(false);
    clickOverwrite();
    await flush(); await flush();
    assert.equal(env.confirms.length, 1, 'a confirmation was requested before overwriting');
    assert.ok(!calls.some((c) => c.method === 'PUT'), 'cancelling the confirm overwrites nothing');

    // Confirm → PUT to the preset.
    env.setConfirm(true);
    clickOverwrite();
    await flush(); await flush();
    assert.equal(env.confirms.length, 2, 'a second overwrite prompts again');
    assert.ok(calls.some((c) => c.method === 'PUT' && c.path.includes('/api/presets/p1')), 'confirming saves via PUT');
  } finally { env.restore(); }
});
