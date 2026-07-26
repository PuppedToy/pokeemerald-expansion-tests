/**
 * T-217 — beta admin invite panel. Covers the pure lottery (25/75 split, budget cap on the with-ROM
 * pool, seeded reproducibility, shortfall), the invite/accept/overview/search handlers (accept +
 * promote held ROMs with welcome:true, immediate "you're in" mail for no-ROM invitees, audit rows),
 * and the admin-only HTTP gate (403 for non-admins).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';

import { openDatabase } from '../db/index.js';
import { createRequestsRepo } from '../db/requests.js';
import { createBetaInvitesRepo } from '../db/betaInvites.js';
import { createUsersRepo } from '../auth/users.js';
import { signJwt } from '../auth/jwt.js';
import { mulberry32, lotteryPick, selectBatch } from '../beta/lottery.js';
import { handleOverview, handleInvite, handleAccept, handleSearch } from '../beta/handlers.js';
import { createBetaAdminRouter } from '../beta/routes.js';

function fakeRes() {
  return {
    statusCode: 200, body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

// ── lottery (pure) ─────────────────────────────────────────────────────────────────
const pool = (n, base = 0) => Array.from({ length: n }, (_, i) => ({ userId: i + 1 + base, email: `u${i + 1 + base}@x`, createdAt: (i + 1 + base) * 10, romsTotal: 1 }));

test('lotteryPick returns exactly k and always includes the 25% earliest sign-ups', () => {
  const picks = lotteryPick(pool(8), 4, mulberry32(1)); // 25% of 4 = 1 earliest
  assert.equal(picks.length, 4);
  assert.ok(picks.some((p) => p.userId === 1), 'the single earliest sign-up is guaranteed a slot');
  const ids = new Set(picks.map((p) => p.userId));
  assert.equal(ids.size, 4, 'no duplicates');
});

test('lotteryPick is reproducible under a seeded rng and clamps k to the pool', () => {
  const a = lotteryPick(pool(6), 3, mulberry32(7)).map((p) => p.userId);
  const b = lotteryPick(pool(6), 3, mulberry32(7)).map((p) => p.userId);
  assert.deepEqual(a, b, 'same seed → same picks');
  assert.equal(lotteryPick(pool(2), 5, mulberry32(1)).length, 2, 'k clamped to pool size');
});

test('selectBatch caps the with-ROM pool by the build-time budget and fills the rest from Pool B', () => {
  // avgRomSecs 1800, romsTotal 1 → 1800 s per A-user → budget 3600 admits 2 from A.
  const out = selectBatch({ poolA: pool(4), poolB: pool(4, 100), count: 4, avgRomSecs: 1800, budgetSecs: 3600, rng: mulberry32(3) });
  assert.equal(out.withRom.length, 2, 'budget capped Pool A to 2');
  assert.equal(out.withoutRom.length, 2, 'Pool B filled the remaining 2');
  assert.equal(out.granted, 4);
  assert.equal(out.cappedByBudget, true);
  assert.equal(out.addedBuildSecs, 3600, '2 × 1800 s');
});

test('selectBatch reports a shortfall when both pools are exhausted before N', () => {
  const out = selectBatch({ poolA: pool(1), poolB: pool(1, 50), count: 5, avgRomSecs: 10, rng: mulberry32(1) });
  assert.equal(out.granted, 2);
  assert.equal(out.shortfall, 3, 'wanted 5, only 2 eligible');
});

// ── handlers (real :memory: repos) ───────────────────────────────────────────────────
function setup() {
  const db = openDatabase(':memory:');
  const users = createUsersRepo(db);
  const requests = createRequestsRepo(db);
  const betaInvites = createBetaInvitesRepo(db);
  const mails = [];
  const mailer = { async sendMail(kind, to, vars) { mails.push({ kind, to, vars }); return { ok: true }; } };
  return { db, users, requests, betaInvites, mailer, mails };
}
// verified pending user at a chosen created_at; optional held `pending` ROM.
function addUser(users, requests, email, { at, held = 0 } = {}) {
  const u = users.create({ email, passwordHash: 'h', now: at });
  users.setVerified(u.id, at);
  if (held) requests.create({ id: `req-${u.id}`, userId: u.id, queueClass: 'fast', romsTotal: held, bundlePath: `/b/${u.id}`, seed: '1', params: {}, state: 'pending', now: at });
  return u;
}

test('overview lists verified-pending users with their held-ROM flag, the accepted list, and queue ETA', async () => {
  const { users, requests, betaInvites } = setup();
  addUser(users, requests, 'a@x', { at: 10, held: 2 });
  addUser(users, requests, 'b@x', { at: 20, held: 0 });
  const accepted = addUser(users, requests, 'c@x', { at: 5 });
  users.setInviteState(accepted.id, 'accepted', 30);

  const res = fakeRes();
  handleOverview({ users, requests, betaInvites, avgRomSecs: 100 })({}, res);

  assert.equal(res.body.counts.pendingVerified, 2);
  assert.equal(res.body.counts.accepted, 1);
  assert.equal(res.body.counts.heldRoms, 1);
  const a = res.body.pending.find((p) => p.email === 'a@x');
  assert.equal(a.hasRom, true); assert.equal(a.romsTotal, 2);
  assert.equal(res.body.pending.find((p) => p.email === 'b@x').hasRom, false);
  assert.ok(res.body.accepted.some((u) => u.email === 'c@x'), 'accepted users are listed');
});

test('invite accepts a balanced batch: held ROMs promote (welcome:true), no-ROM invitees get the "welcome" mail, audit is written', async () => {
  const { db, users, requests, betaInvites, mailer, mails } = setup();
  const withRom = addUser(users, requests, 'rom@x', { at: 10, held: 1 });
  const noRom = addUser(users, requests, 'norom@x', { at: 20, held: 0 });

  const res = fakeRes();
  handleInvite({ users, requests, betaInvites, mailer, baseUrl: 'https://x', avgRomSecs: 100, db, now: () => 999, rng: mulberry32(1) })(
    { adminEmail: 'admin@x', body: { count: 2 } }, res);

  assert.equal(res.body.invited, 2);
  assert.equal(users.get(withRom.id).invite_state, 'accepted');
  assert.equal(users.get(noRom.id).invite_state, 'accepted');
  // held ROM promoted to its queue class + flagged for the combined mail
  const promoted = requests.get(`req-${withRom.id}`);
  assert.equal(promoted.state, 'queued_fast');
  assert.equal(promoted.welcome_on_ready, 1, 'invite promotion sets the combined-mail flag');
  // only the no-ROM invitee is emailed now (the ROM user is mailed on build completion)
  assert.deepEqual(mails.map((m) => [m.kind, m.to]), [['welcome', 'norom@x']]);
  // audit row persisted
  const audit = betaInvites.list();
  assert.equal(audit[0].kind, 'batch');
  assert.equal(audit[0].granted, 2);
  assert.equal(audit[0].with_rom, 1);
});

test('invite rejects a non-positive count', async () => {
  const { users, requests, betaInvites } = setup();
  const res = fakeRes();
  handleInvite({ users, requests, betaInvites })({ adminEmail: 'a@x', body: { count: 0 } }, res);
  assert.equal(res.statusCode, 400);
});

test('accept admits one user, promotes a held ROM, is idempotent, and 404s an unknown user', async () => {
  const { db, users, requests, betaInvites, mailer, mails } = setup();
  const u = addUser(users, requests, 'solo@x', { at: 10, held: 1 });

  const res1 = fakeRes();
  handleAccept({ users, requests, betaInvites, mailer, baseUrl: 'https://x', db, now: () => 5 })(
    { adminEmail: 'admin@x', body: { userId: u.id } }, res1);
  assert.equal(res1.body.ok, true);
  assert.equal(res1.body.hasRom, true);
  assert.equal(requests.get(`req-${u.id}`).state, 'queued_fast');
  assert.equal(mails.length, 0, 'a ROM-holding accept sends no mail now (combined mail on build)');

  const res2 = fakeRes();
  handleAccept({ users, requests, betaInvites, db })({ adminEmail: 'admin@x', body: { userId: u.id } }, res2);
  assert.equal(res2.body.already, true, 'accepting an already-accepted user is a no-op');

  const res404 = fakeRes();
  handleAccept({ users, requests, betaInvites, db })({ adminEmail: 'admin@x', body: { userId: 9999 } }, res404);
  assert.equal(res404.statusCode, 404);
});

test('accept of a no-ROM user sends the immediate "you\'re in" welcome mail', async () => {
  const { db, users, requests, betaInvites, mailer, mails } = setup();
  const u = addUser(users, requests, 'noromsolo@x', { at: 10, held: 0 });
  const res = fakeRes();
  handleAccept({ users, requests, betaInvites, mailer, baseUrl: 'https://x', db, now: () => 5 })(
    { adminEmail: 'admin@x', body: { email: 'noromsolo@x' } }, res);
  assert.equal(users.get(u.id).invite_state, 'accepted');
  assert.deepEqual(mails.map((m) => m.kind), ['welcome']);
});

test('search matches users by email and flags held ROMs', async () => {
  const { users, requests } = setup();
  addUser(users, requests, 'findme@x', { at: 10, held: 3 });
  addUser(users, requests, 'other@y', { at: 20, held: 0 });
  const res = fakeRes();
  handleSearch({ users, requests })({ query: { q: 'findme' } }, res);
  assert.equal(res.body.results.length, 1);
  assert.equal(res.body.results[0].email, 'findme@x');
  assert.equal(res.body.results[0].hasRom, true);
  assert.equal(res.body.results[0].romsTotal, 3);
});

// ── admin HTTP gate ───────────────────────────────────────────────────────────────
async function mountAndGet(path, { adminEmails, tokenSub }) {
  const { db, users, requests, betaInvites, mailer } = setup();
  // seed the caller
  const caller = users.create({ email: 'caller@x', passwordHash: 'h', now: 1 });
  const app = express();
  app.use('/api', createBetaAdminRouter({ users, requests, betaInvites, mailer, adminEmails, jwtSecret: 'x', baseUrl: 'https://x', db }));
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const { port } = server.address();
  try {
    const token = signJwt({ sub: tokenSub ?? caller.id }, 'x');
    const res = await fetch(`http://localhost:${port}${path}`, { headers: { authorization: `Bearer ${token}` } });
    return { status: res.status, body: await res.json().catch(() => null), caller };
  } finally { server.close(); }
}

test('admin routes are 403 for a non-admin caller', async () => {
  const r = await mountAndGet('/api/admin/beta/overview', { adminEmails: [] }); // caller@x is not an admin
  assert.equal(r.status, 403);
});

test('admin routes serve an admin caller', async () => {
  const r = await mountAndGet('/api/admin/beta/overview', { adminEmails: ['caller@x'] });
  assert.equal(r.status, 200);
  assert.ok(r.body.counts, 'overview payload is returned to an admin');
});
