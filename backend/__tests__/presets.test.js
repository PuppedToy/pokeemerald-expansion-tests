import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';

import { openDatabase } from '../db/index.js';
import { createUsersRepo } from '../auth/users.js';
import { createPresetsRepo, PAGE_SIZE } from '../db/presets.js';
import { createPresetLikesRepo } from '../db/presetLikes.js';
import { createPresetViewsRepo } from '../db/presetViews.js';
import { deriveTags } from '../presets/tags.js';
import { parseAdminEmails, isAdminEmail } from '../auth/admin.js';
import {
  handleList, handleGet, handleCreate, handleUpdate,
  handlePublish, handleUnpublish, handleDelete, handleLike, handleSeedBalanced, BALANCED_ID,
  handleRecommend, handleUnrecommend,
} from '../presets/handlers.js';
import { createPresetsRouter } from '../presets/routes.js';
import { createAuthRouter } from '../auth/routes.js';
import { signJwt } from '../auth/jwt.js';

function fakeRes() {
  return {
    statusCode: 200, body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

let seq = 0;
const idGen = () => `p${++seq}`;

function setup() {
  const db = openDatabase(':memory:');
  const users = createUsersRepo(db);
  const presets = createPresetsRepo(db);
  const presetLikes = createPresetLikesRepo(db);
  const presetViews = createPresetViewsRepo(db);
  const alice = users.create({ email: 'alice@x.test', passwordHash: 'h', now: 1000 });
  const bob = users.create({ email: 'bob@x.test', passwordHash: 'h', now: 1000 });
  const carol = users.create({ email: 'carol@x.test', passwordHash: 'h', now: 1000 });
  users.setVerified(alice.id); users.setVerified(bob.id); users.setVerified(carol.id);
  return { db, users, presets, presetLikes, presetViews, alice, bob, carol };
}

const cfg = (over = {}) => ({ battleFormat: 'singles', runType: 'default', wildEncounterType: 'deterministic', ...over });
const mk = (presets, userId, over = {}, now = 1000) =>
  presets.create({ id: idGen(), userId, name: 'P', description: '', config: cfg(), now, ...over });

// ── tag derivation ──────────────────────────────────────────────────────────────

test('deriveTags mirrors config fields and maps runType default→normal', () => {
  assert.deepEqual(deriveTags(cfg()), { tag_format: 'singles', tag_mode: 'normal', tag_wild: 'deterministic' });
  assert.deepEqual(
    deriveTags(cfg({ battleFormat: 'doubles', runType: 'nuzlocke', wildEncounterType: 'classic' })),
    { tag_format: 'doubles', tag_mode: 'nuzlocke', tag_wild: 'classic' },
  );
  assert.deepEqual(deriveTags(cfg({ runType: 'soullink' })).tag_mode, 'soullink');
});

test('deriveTags falls back to defaults for unknown/missing values', () => {
  assert.deepEqual(deriveTags({}), { tag_format: 'singles', tag_mode: 'normal', tag_wild: 'deterministic' });
  assert.deepEqual(deriveTags({ battleFormat: 'nope', runType: 'nope', wildEncounterType: 'nope' }),
    { tag_format: 'singles', tag_mode: 'normal', tag_wild: 'deterministic' });
});

// ── repo: create / get / update ──────────────────────────────────────────────────

test('create stores config + derived tags; get returns them', () => {
  const { presets, alice } = setup();
  const row = mk(presets, alice.id, { name: 'My run', description: 'nice', config: cfg({ battleFormat: 'mixed' }) });
  assert.equal(row.name, 'My run');
  assert.equal(row.tag_format, 'mixed');
  assert.equal(row.published, 0);
  assert.equal(row.likes, 0);
  assert.equal(row.views, 0);
  assert.equal(JSON.parse(row.config_json).battleFormat, 'mixed');
});

test('update re-derives tags when config changes and bumps updated_at', () => {
  const { presets, alice } = setup();
  const row = mk(presets, alice.id, {}, 1000);
  const upd = presets.update(row.id, { name: 'Renamed', config: cfg({ battleFormat: 'doubles' }) }, 2000);
  assert.equal(upd.name, 'Renamed');
  assert.equal(upd.tag_format, 'doubles');
  assert.equal(upd.updated_at, 2000);
});

test('update leaves omitted fields unchanged', () => {
  const { presets, alice } = setup();
  const row = mk(presets, alice.id, { name: 'Keep', config: cfg({ battleFormat: 'doubles' }) });
  const upd = presets.update(row.id, { description: 'only desc' }, 2000);
  assert.equal(upd.name, 'Keep');
  assert.equal(upd.tag_format, 'doubles', 'config untouched → tags untouched');
  assert.equal(upd.description, 'only desc');
});

// ── repo: pagination ─────────────────────────────────────────────────────────────

test('listMine paginates 5 per page, newest-updated first', () => {
  const { presets, alice } = setup();
  for (let i = 0; i < 7; i++) mk(presets, alice.id, { name: `P${i}` }, 1000 + i);
  const p1 = presets.listMine(alice.id, 1);
  assert.equal(p1.items.length, PAGE_SIZE);
  assert.equal(p1.total, 7);
  assert.equal(p1.totalPages, 2);
  assert.equal(p1.items[0].name, 'P6', 'newest updated_at first');
  const p2 = presets.listMine(alice.id, 2);
  assert.equal(p2.items.length, 2);
});

test('listMine only returns the owner’s presets', () => {
  const { presets, alice, bob } = setup();
  mk(presets, alice.id); mk(presets, bob.id);
  assert.equal(presets.listMine(alice.id, 1).total, 1);
});

// ── repo: publish + community list ───────────────────────────────────────────────

test('setPublished flips the flag and bumps updated_at', () => {
  const { presets, alice } = setup();
  const row = mk(presets, alice.id, {}, 1000);
  const pub = presets.setPublished(row.id, true, 5000);
  assert.equal(pub.published, 1);
  assert.equal(pub.updated_at, 5000);
});

test('listCommunity returns only published presets', () => {
  const { presets, alice } = setup();
  const a = mk(presets, alice.id, { name: 'pub' });
  mk(presets, alice.id, { name: 'priv' });
  presets.setPublished(a.id, true);
  const r = presets.listCommunity({});
  assert.equal(r.total, 1);
  assert.equal(r.items[0].name, 'pub');
});

test('listCommunity filters by tag and searches name/description', () => {
  const { presets, alice } = setup();
  const a = mk(presets, alice.id, { name: 'Hardcore doubles', config: cfg({ battleFormat: 'doubles' }) });
  const b = mk(presets, alice.id, { name: 'Chill singles', config: cfg({ battleFormat: 'singles' }) });
  presets.setPublished(a.id, true); presets.setPublished(b.id, true);
  assert.equal(presets.listCommunity({ format: 'doubles' }).total, 1);
  assert.equal(presets.listCommunity({ format: 'doubles' }).items[0].name, 'Hardcore doubles');
  assert.equal(presets.listCommunity({ q: 'chill' }).total, 1);
  assert.equal(presets.listCommunity({ format: 'any' }).total, 2, "'any' ignores the filter");
});

test('listCommunity date window (sinceTs) excludes older presets', () => {
  const { presets, alice } = setup();
  const old = mk(presets, alice.id, { name: 'old' }, 1000);
  const fresh = mk(presets, alice.id, { name: 'fresh' }, 9000);
  presets.setPublished(old.id, true, 1000);
  presets.setPublished(fresh.id, true, 9000);
  const r = presets.listCommunity({ sinceTs: 5000 });
  assert.equal(r.total, 1);
  assert.equal(r.items[0].name, 'fresh');
});

test('listCommunity sorts by relevance (views*likes), likes, or views', () => {
  const { presets, presetLikes, presetViews, alice, bob, carol } = setup();
  const low = mk(presets, alice.id, { name: 'low' });
  const high = mk(presets, alice.id, { name: 'high' });
  presets.setPublished(low.id, true); presets.setPublished(high.id, true);
  // high: 2 likes * 2 views = relevance 4 ; low: 1 like * 1 view = 1
  presetLikes.toggle(high.id, bob.id); presetLikes.toggle(high.id, carol.id);
  presetViews.record(high.id, bob.id); presetViews.record(high.id, carol.id);
  presetLikes.toggle(low.id, bob.id);
  presetViews.record(low.id, bob.id);
  assert.equal(presets.listCommunity({ sort: 'relevance' }).items[0].name, 'high');
  assert.equal(presets.listCommunity({ sort: 'likes' }).items[0].name, 'high');
  assert.equal(presets.listCommunity({ sort: 'views' }).items[0].name, 'high');
});

// ── likes ────────────────────────────────────────────────────────────────────────

test('like toggle increments then decrements the counter and dedupes per user', () => {
  const { presets, presetLikes, alice, bob } = setup();
  const p = mk(presets, alice.id); presets.setPublished(p.id, true);
  let r = presetLikes.toggle(p.id, bob.id);
  assert.deepEqual(r, { liked: true, likes: 1 });
  assert.equal(presetLikes.likedBy(p.id, bob.id), true);
  r = presetLikes.toggle(p.id, bob.id); // same user toggles off
  assert.deepEqual(r, { liked: false, likes: 0 });
  assert.equal(presets.get(p.id).likes, 0);
});

test('likedSet marks which of a list the user has liked', () => {
  const { presets, presetLikes, alice, bob } = setup();
  const a = mk(presets, alice.id); const b = mk(presets, alice.id);
  presets.setPublished(a.id, true); presets.setPublished(b.id, true);
  presetLikes.toggle(a.id, bob.id);
  const set = presetLikes.likedSet([a.id, b.id], bob.id);
  assert.equal(set.has(a.id), true);
  assert.equal(set.has(b.id), false);
});

// ── views ──────────────────────────────────────────────────────────────────────

test('view is counted once per user for life', () => {
  const { presets, presetViews, alice, bob } = setup();
  const p = mk(presets, alice.id); presets.setPublished(p.id, true);
  assert.equal(presetViews.record(p.id, bob.id), 1);
  assert.equal(presetViews.record(p.id, bob.id), 1, 'same user → no double count');
  assert.equal(presets.get(p.id).views, 1);
});

// ── remove + cascade ─────────────────────────────────────────────────────────────

test('remove deletes the preset and its like/view rows', () => {
  const { db, presets, presetLikes, presetViews, alice, bob } = setup();
  const p = mk(presets, alice.id); presets.setPublished(p.id, true);
  presetLikes.toggle(p.id, bob.id); presetViews.record(p.id, bob.id);
  presets.remove(p.id);
  assert.equal(presets.get(p.id), null);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM preset_likes WHERE preset_id=?').get(p.id).n, 0);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM preset_views WHERE preset_id=?').get(p.id).n, 0);
});

test('deleting a user cascades presets/likes/views and keeps counters accurate', () => {
  const { db, users, presets, presetLikes, presetViews, alice, bob } = setup();
  const aliceP = mk(presets, alice.id); presets.setPublished(aliceP.id, true);
  const bobP = mk(presets, bob.id); presets.setPublished(bobP.id, true);
  // bob likes alice's preset; alice likes bob's preset
  presetLikes.toggle(aliceP.id, bob.id);
  presetViews.record(aliceP.id, bob.id);
  presetLikes.toggle(bobP.id, alice.id);

  // Deleting bob while his rows exist must fail the FK until cleared (proves the wiring is needed).
  assert.throws(() => users.delete(bob.id), /FOREIGN KEY|constraint/i);

  presetLikes.deleteForUser(bob.id);   // bob's like on alice's preset → counter--
  presetViews.deleteForUser(bob.id);
  presets.deleteForUser(bob.id);       // bob's own preset (+ alice's like on it) gone
  assert.doesNotThrow(() => users.delete(bob.id));

  assert.equal(presets.get(bobP.id), null, "bob's preset is gone");
  assert.equal(presets.get(aliceP.id).likes, 0, "bob's like on alice's preset was decremented");
  assert.equal(presets.get(aliceP.id).views, 0, "bob's view was decremented");
});

// ── handlers: validation ─────────────────────────────────────────────────────────

function deps(over = {}) {
  const s = setup();
  return { s, d: { presets: s.presets, presetLikes: s.presetLikes, presetViews: s.presetViews, users: s.users, adminEmails: [], idGen, now: () => 1000, ...over } };
}

test('create handler rejects a missing name and an over-long description', () => {
  const { s, d } = deps();
  let res = fakeRes();
  handleCreate(d)({ userId: s.alice.id, body: { config: cfg() } }, res);
  assert.equal(res.statusCode, 400);
  res = fakeRes();
  handleCreate(d)({ userId: s.alice.id, body: { name: 'ok', description: 'x'.repeat(501), config: cfg() } }, res);
  assert.equal(res.statusCode, 400);
});

test('create handler rejects a non-object config', () => {
  const { s, d } = deps();
  const res = fakeRes();
  handleCreate(d)({ userId: s.alice.id, body: { name: 'ok', config: 'not-an-object' } }, res);
  assert.equal(res.statusCode, 400);
});

test('create handler stores a preset and returns 201 with derived tags', () => {
  const { s, d } = deps();
  const res = fakeRes();
  handleCreate(d)({ userId: s.alice.id, body: { name: '  Trim me  ', config: cfg({ battleFormat: 'doubles' }) } }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.item.name, 'Trim me');
  assert.equal(res.body.item.tags.format, 'doubles');
  assert.equal(res.body.item.isOwner, true);
});

test('create handler honours official only for an admin', () => {
  const { s, d } = deps({ adminEmails: ['alice@x.test'] });
  let res = fakeRes();
  handleCreate(d)({ userId: s.alice.id, body: { name: 'Balanced-ish', config: cfg(), official: true } }, res);
  assert.equal(res.body.item.kind, 'official', 'admin can create official');
  res = fakeRes();
  handleCreate(d)({ userId: s.bob.id, body: { name: 'nope', config: cfg(), official: true } }, res);
  assert.equal(res.body.item.kind, 'user', 'non-admin cannot');
});

// ── handlers: authorization ──────────────────────────────────────────────────────

test('update/publish/delete by a non-owner is forbidden', () => {
  const { s, d } = deps();
  const p = mk(s.presets, s.alice.id);
  for (const h of [handleUpdate(d), handlePublish(d), handleDelete(d)]) {
    const res = fakeRes();
    h({ userId: s.bob.id, params: { id: p.id }, body: { name: 'x' } }, res);
    assert.equal(res.statusCode, 403);
  }
  assert.equal(s.presets.get(p.id).name, 'P', 'unchanged');
});

test('admin can unpublish and delete someone else’s preset (moderation)', () => {
  const { s, d } = deps({ adminEmails: ['carol@x.test'] });
  const p = mk(s.presets, s.alice.id); s.presets.setPublished(p.id, true);
  let res = fakeRes();
  handleUnpublish(d)({ userId: s.carol.id, params: { id: p.id } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(s.presets.get(p.id).published, 0);
  res = fakeRes();
  handleDelete(d)({ userId: s.carol.id, params: { id: p.id } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(s.presets.get(p.id), null);
});

test('like handler rejects self-like and unpublished, toggles otherwise', () => {
  const { s, d } = deps();
  const p = mk(s.presets, s.alice.id);
  let res = fakeRes();
  handleLike(d)({ userId: s.bob.id, params: { id: p.id } }, res);
  assert.equal(res.statusCode, 400, 'not published');
  s.presets.setPublished(p.id, true);
  res = fakeRes();
  handleLike(d)({ userId: s.alice.id, params: { id: p.id } }, res);
  assert.equal(res.statusCode, 400, 'self-like rejected');
  res = fakeRes();
  handleLike(d)({ userId: s.bob.id, params: { id: p.id } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { liked: true, likes: 1 });
});

test('like handler allows liking a recommended/official preset even when unpublished', () => {
  const { s, d } = deps();
  const official = s.presets.create({ id: idGen(), userId: s.alice.id, name: 'Balanced', config: cfg(), kind: 'official' });
  assert.equal(official.published, 0, 'official row is not published');
  const res = fakeRes();
  handleLike(d)({ userId: s.bob.id, params: { id: official.id } }, res);
  assert.equal(res.statusCode, 200, 'official presets are likeable without being published');
  assert.deepEqual(res.body, { liked: true, likes: 1 });
});

test('seed-balanced creates the official Balanced row for an admin and is idempotent', () => {
  const { s, d } = deps({ adminEmails: ['alice@x.test'] });
  let res = fakeRes();
  handleSeedBalanced(d)({ userId: s.alice.id, body: { config: cfg({ battleFormat: 'doubles' }) } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.item.id, BALANCED_ID);
  assert.equal(res.body.item.kind, 'official');
  assert.equal(res.body.item.tags.format, 'doubles');
  const updatedAt1 = s.presets.get(BALANCED_ID).updated_at;

  // Second call with the SAME config is a no-op (no needless updated_at churn).
  res = fakeRes();
  handleSeedBalanced(d)({ userId: s.alice.id, body: { config: cfg({ battleFormat: 'doubles' }) } }, res);
  assert.equal(s.presets.get(BALANCED_ID).updated_at, updatedAt1, 'unchanged config → no update');
  assert.equal(s.presets.listOfficial(1).total, 1, 'still exactly one official row');
});

test('seed-balanced refreshes the config when DEFAULTS change, and is admin-only', () => {
  const { s, d } = deps({ adminEmails: ['alice@x.test'], now: () => 5000 });
  handleSeedBalanced(d)({ userId: s.alice.id, body: { config: cfg() } }, fakeRes());
  const before = s.presets.get(BALANCED_ID);
  assert.equal(before.tag_format, 'singles');
  // Same admin, changed config → tags/config refresh.
  const d2 = { ...d, now: () => 9000 };
  handleSeedBalanced(d2)({ userId: s.alice.id, body: { config: cfg({ battleFormat: 'mixed' }) } }, fakeRes());
  assert.equal(s.presets.get(BALANCED_ID).tag_format, 'mixed');
  // Non-admin is rejected and cannot seed.
  const res = fakeRes();
  handleSeedBalanced(d)({ userId: s.bob.id, body: { config: cfg() } }, res);
  assert.equal(res.statusCode, 403);
});

test('recommend/unrecommend promote and demote a preset (admin only)', () => {
  const { s, d } = deps({ adminEmails: ['alice@x.test'] });
  const p = mk(s.presets, s.bob.id); // bob's ordinary preset
  assert.equal(s.presets.get(p.id).kind, 'user');

  // Non-admin cannot promote.
  let res = fakeRes();
  handleRecommend(d)({ userId: s.bob.id, params: { id: p.id } }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(s.presets.get(p.id).kind, 'user');

  // Admin promotes it → appears in the official (Recommended) list, ownership unchanged.
  res = fakeRes();
  handleRecommend(d)({ userId: s.alice.id, params: { id: p.id } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.item.kind, 'official');
  assert.equal(s.presets.get(p.id).user_id, s.bob.id, 'ownership unchanged');
  assert.equal(s.presets.listOfficial(1).total, 1);

  // Admin demotes it back.
  res = fakeRes();
  handleUnrecommend(d)({ userId: s.alice.id, params: { id: p.id } }, res);
  assert.equal(res.body.item.kind, 'user');
  assert.equal(s.presets.listOfficial(1).total, 0);
});

test('recommend returns 404 for a missing preset', () => {
  const { s, d } = deps({ adminEmails: ['alice@x.test'] });
  const res = fakeRes();
  handleRecommend(d)({ userId: s.alice.id, params: { id: 'nope' } }, res);
  assert.equal(res.statusCode, 404);
});

test('list handler requires auth for scope=mine but not for community', () => {
  const { s, d } = deps();
  let res = fakeRes();
  handleList(d)({ query: { scope: 'mine' } }, res);
  assert.equal(res.statusCode, 401);
  res = fakeRes();
  handleList(d)({ query: { scope: 'community' } }, res);
  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.body.items));
});

test('get handler records a view for a non-owner and hides private presets', () => {
  const { s, d } = deps();
  const p = mk(s.presets, s.alice.id);
  // private + non-owner → 404
  let res = fakeRes();
  handleGet(d)({ userId: s.bob.id, params: { id: p.id } }, res);
  assert.equal(res.statusCode, 404);
  // published + non-owner → 200 and a view is counted
  s.presets.setPublished(p.id, true);
  res = fakeRes();
  handleGet(d)({ userId: s.bob.id, params: { id: p.id } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.item.views, 1);
  assert.ok(res.body.item.config, 'detail includes the config');
  // owner viewing does not self-count
  res = fakeRes();
  handleGet(d)({ userId: s.alice.id, params: { id: p.id } }, res);
  assert.equal(res.body.item.views, 1);
});

// ── admin helper ─────────────────────────────────────────────────────────────────

test('parseAdminEmails / isAdminEmail are case-insensitive and trim', () => {
  const admins = parseAdminEmails(' Alice@X.test , bob@x.test ');
  assert.deepEqual(admins, ['alice@x.test', 'bob@x.test']);
  assert.equal(isAdminEmail('ALICE@x.test', admins), true);
  assert.equal(isAdminEmail('carol@x.test', admins), false);
  assert.equal(isAdminEmail(undefined, admins), false);
});

// ── HTTP wiring (real express + signed JWT) ──────────────────────────────────────

async function withServer(fn, { adminEmails = [] } = {}) {
  const SECRET = 'test-secret';
  const s = setup();
  const app = express();
  app.use('/api', createPresetsRouter({
    presets: s.presets, presetLikes: s.presetLikes, presetViews: s.presetViews,
    users: s.users, jwtSecret: SECRET, adminEmails, idGen,
  }));
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const { port } = server.address();
  const base = `http://localhost:${port}/api`;
  const tok = (uid) => signJwt({ sub: uid }, SECRET, { expiresInSec: 60 });
  try { await fn({ base, tok, s }); } finally { server.close(); }
}

test('HTTP: POST /api/presets requires a token, then creates and lists', async () => {
  await withServer(async ({ base, tok, s }) => {
    let res = await fetch(`${base}/presets`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'x', config: cfg() }),
    });
    assert.equal(res.status, 401, 'no token');

    res = await fetch(`${base}/presets`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${tok(s.alice.id)}` },
      body: JSON.stringify({ name: 'My preset', config: cfg() }),
    });
    assert.equal(res.status, 201);

    res = await fetch(`${base}/presets?scope=mine`, { headers: { authorization: `Bearer ${tok(s.alice.id)}` } });
    const body = await res.json();
    assert.equal(body.total, 1);
    assert.equal(body.items[0].name, 'My preset');
    assert.equal(body.totalPages, 1);
  });
});

test('HTTP: publish then like from another user, and community browse is public', async () => {
  await withServer(async ({ base, tok, s }) => {
    const created = await (await fetch(`${base}/presets`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${tok(s.alice.id)}` },
      body: JSON.stringify({ name: 'Sharable', config: cfg({ battleFormat: 'doubles' }) }),
    })).json();
    const id = created.item.id;

    let res = await fetch(`${base}/presets/${id}/publish`, {
      method: 'POST', headers: { authorization: `Bearer ${tok(s.alice.id)}` },
    });
    assert.equal(res.status, 200);

    res = await fetch(`${base}/presets/${id}/like`, {
      method: 'POST', headers: { authorization: `Bearer ${tok(s.bob.id)}` },
    });
    assert.deepEqual(await res.json(), { liked: true, likes: 1 });

    // logged-out community browse works and shows the published preset
    res = await fetch(`${base}/presets?scope=community&format=doubles`);
    const body = await res.json();
    assert.equal(body.total, 1);
    assert.equal(body.items[0].name, 'Sharable');
    assert.equal(body.items[0].likes, 1);
  });
});

test('HTTP: admin seeds Balanced; it appears in the official list and a user can like it', async () => {
  await withServer(async ({ base, tok, s }) => {
    // Non-admin cannot seed.
    let res = await fetch(`${base}/presets/official/balanced`, {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${tok(s.bob.id)}` },
      body: JSON.stringify({ config: cfg() }),
    });
    assert.equal(res.status, 403);

    // Admin (alice) seeds it.
    res = await fetch(`${base}/presets/official/balanced`, {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${tok(s.alice.id)}` },
      body: JSON.stringify({ config: cfg({ battleFormat: 'doubles' }) }),
    });
    assert.equal(res.status, 200);
    const { item } = await res.json();
    assert.equal(item.kind, 'official');
    assert.equal(item.name, 'Balanced');

    // Shows in the Recommended (official) list…
    res = await fetch(`${base}/presets?scope=official`);
    assert.equal((await res.json()).total, 1);

    // …and another user can like it even though it isn't published.
    res = await fetch(`${base}/presets/${item.id}/like`, {
      method: 'POST', headers: { authorization: `Bearer ${tok(s.bob.id)}` },
    });
    assert.deepEqual(await res.json(), { liked: true, likes: 1 });
  }, { adminEmails: ['alice@x.test'] });
});

test('HTTP: /api/me exposes isAdmin from ADMIN_EMAILS', async () => {
  const SECRET = 'test-secret';
  const s = setup();
  const app = express();
  app.use('/api', createAuthRouter({
    service: {}, users: s.users, requests: null, runs: null, tokens: null,
    feedback: null, diagnostics: null, presets: s.presets, presetLikes: s.presetLikes,
    presetViews: s.presetViews, adminEmails: ['alice@x.test'], jwtSecret: SECRET,
  }));
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const { port } = server.address();
  try {
    const me = async (uid) => (await fetch(`http://localhost:${port}/api/me`, {
      headers: { authorization: `Bearer ${signJwt({ sub: uid }, SECRET, { expiresInSec: 60 })}` },
    })).json();
    assert.equal((await me(s.alice.id)).isAdmin, true);
    assert.equal((await me(s.bob.id)).isAdmin, false);
  } finally { server.close(); }
});
