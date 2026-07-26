/**
 * T-216 — beta gating. A registered-but-not-yet-invited user can prepare a bundle, but it is HELD in
 * the `pending` state (stored, never built, never swept) until an invite promotes it. Covers: the
 * additive column migration + grandfathering, the produce hold, promotion (invite vs BETA-off flush),
 * the combined welcome+ready mail, and the public /api/config flag.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import { openDatabase, migrate } from '../db/index.js';
import { createRequestsRepo } from '../db/requests.js';
import { createRunsRepo } from '../db/runs.js';
import { createUsersRepo } from '../auth/users.js';
import { createConfigRouter } from '../config/routes.js';
import { classify } from '../queue/scheduler.js';
import { validateBundle } from '../build/bundleSchema.js';
import { handleProduce } from '../produce/handlers.js';
import { finishBuild } from '../lifecycle/complete.js';

// ── helpers ─────────────────────────────────────────────────────────────────────
function fakeRes() {
  return {
    statusCode: 200, body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}
const validRom = () => ({ romIndex: 0, artifacts: { pokedex: 'p', trainers: 't', starters: 's', wild: { file: 'data/w.json' } } });
const validBundle = (n = 1) => ({ config: { seed: 7 }, roms: Array.from({ length: n }, (_, i) => ({ ...validRom(), romIndex: i })) });

function produceDeps(requests, over = {}) {
  return {
    requests, classify, validateBundle,
    persistBundle: (id) => `/bundles/${id}.json`,
    idGen: () => 'req1', now: () => 1000, avgRomSecs: 10,
    removeFile: () => {}, killActiveBuild: () => {}, ...over,
  };
}
// a users stand-in whose invite_state we control per test
const usersWith = (state) => ({ get: () => ({ id: 1, email: 'u@x.test', invite_state: state }) });

// ── migration + grandfathering (owner decision D2) ────────────────────────────────
test('new accounts default to invite_state=pending', () => {
  const db = openDatabase(':memory:');
  const users = createUsersRepo(db);
  const u = users.create({ email: 'new@x.test', passwordHash: 'h', now: 1 });
  assert.equal(u.invite_state, 'pending');
});

test('migrate grandfathers pre-beta accounts to accepted', () => {
  // Build the OLD schema (no invite_state column) with a user already in it, then migrate.
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(`CREATE TABLE users (
    id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
  db.prepare('INSERT INTO users (id,email,password_hash,verified,created_at,updated_at) VALUES (1,?,?,1,0,0)')
    .run('old@x.test', 'h');

  migrate(db); // adds invite_state + grandfathers existing rows

  const row = db.prepare('SELECT invite_state FROM users WHERE id = 1').get();
  assert.equal(row.invite_state, 'accepted', 'the pre-existing account is let straight in');
});

test('setInviteState flips a user pending -> accepted', () => {
  const db = openDatabase(':memory:');
  const users = createUsersRepo(db);
  const u = users.create({ email: 'a@x.test', passwordHash: 'h', now: 1 });
  users.setInviteState(u.id, 'accepted', 2);
  assert.equal(users.get(u.id).invite_state, 'accepted');
});

// ── produce hold ──────────────────────────────────────────────────────────────────
function seedUser(db, id = 1, invite = 'pending') {
  db.prepare(`INSERT INTO users (id,email,password_hash,verified,invite_state,created_at,updated_at)
              VALUES (?,?,?,1,?,0,0)`).run(id, `u${id}@x.test`, 'h', invite);
}

test('BETA on + user not accepted → run is HELD in pending, email-on-ready forced, no eta', () => {
  const db = openDatabase(':memory:');
  seedUser(db, 1, 'pending');
  const requests = createRequestsRepo(db);
  const res = fakeRes();

  handleProduce(produceDeps(requests, { users: usersWith('pending'), beta: true }))(
    { userId: 1, body: validBundle(1) }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.held, true, 'the response tells the client the run is held');
  assert.equal(res.body.eta, null);
  const row = requests.get('req1');
  assert.equal(row.state, 'pending', 'stored, not queued');
  assert.equal(row.email_on_ready, 1, 'email-on-ready is forced so the invite mail can fire on build');
});

test('BETA on + accepted user → builds normally (queued, not held)', () => {
  const db = openDatabase(':memory:');
  seedUser(db, 1, 'accepted');
  const requests = createRequestsRepo(db);
  const res = fakeRes();

  handleProduce(produceDeps(requests, { users: usersWith('accepted'), beta: true }))(
    { userId: 1, body: validBundle(1) }, res);

  assert.equal(res.body.held, false);
  assert.equal(requests.get('req1').state, 'queued_fast');
});

test('BETA off → everyone builds normally even if not accepted', () => {
  const db = openDatabase(':memory:');
  seedUser(db, 1, 'pending');
  const requests = createRequestsRepo(db);
  const res = fakeRes();

  handleProduce(produceDeps(requests, { users: usersWith('pending'), beta: false }))(
    { userId: 1, body: validBundle(1) }, res);

  assert.equal(res.body.held, false);
  assert.equal(requests.get('req1').state, 'queued_fast');
});

test('a held pending request counts as the user\'s one active request', () => {
  const db = openDatabase(':memory:');
  seedUser(db, 1, 'pending');
  const requests = createRequestsRepo(db);
  handleProduce(produceDeps(requests, { users: usersWith('pending'), beta: true }))(
    { userId: 1, body: validBundle(1) }, fakeRes());
  assert.equal(requests.getActiveForUser(1)?.state, 'pending');
});

// ── promotion: invite vs BETA-off flush ───────────────────────────────────────────
test('promotePending moves a held run into its queue class', () => {
  const db = openDatabase(':memory:');
  seedUser(db, 1, 'pending');
  const requests = createRequestsRepo(db);
  requests.create({ id: 'p1', userId: 1, queueClass: 'slow', romsTotal: 3, bundlePath: '/b', seed: '1', params: {}, state: 'pending', now: 1 });

  const out = requests.promotePending('p1');
  assert.equal(out.state, 'queued_slow');
});

test('promotePending is a no-op on a non-pending row', () => {
  const db = openDatabase(':memory:');
  seedUser(db, 1, 'accepted');
  const requests = createRequestsRepo(db);
  requests.create({ id: 'q1', userId: 1, queueClass: 'fast', romsTotal: 1, bundlePath: '/b', seed: '1', params: {}, now: 1 });
  assert.equal(requests.promotePending('q1'), null, 'already queued → nothing to promote');
  assert.equal(requests.get('q1').state, 'queued_fast');
});

test('an INVITE (welcome:true) marks the run for the combined mail; the flush (default) does not', () => {
  const db = openDatabase(':memory:');
  seedUser(db, 1, 'pending'); seedUser(db, 2, 'pending');
  const requests = createRequestsRepo(db);
  requests.create({ id: 'inv', userId: 1, queueClass: 'fast', romsTotal: 1, bundlePath: '/b', seed: '1', params: {}, state: 'pending', now: 1 });
  requests.create({ id: 'flu', userId: 2, queueClass: 'fast', romsTotal: 1, bundlePath: '/b', seed: '1', params: {}, state: 'pending', now: 2 });

  requests.promotePending('inv', { welcome: true }); // admin invite
  requests.promotePending('flu');                    // BETA-off flush

  assert.equal(requests.get('inv').welcome_on_ready, 1);
  assert.equal(requests.get('flu').welcome_on_ready, 0);
});

test('the BETA-off flush promotes every held run (mechanism used at startup)', () => {
  const db = openDatabase(':memory:');
  seedUser(db, 1, 'pending'); seedUser(db, 2, 'pending');
  const requests = createRequestsRepo(db);
  requests.create({ id: 'h1', userId: 1, queueClass: 'fast', romsTotal: 1, bundlePath: '/b', seed: '1', params: {}, state: 'pending', now: 1 });
  requests.create({ id: 'h2', userId: 2, queueClass: 'slow', romsTotal: 3, bundlePath: '/b', seed: '1', params: {}, state: 'pending', now: 2 });

  for (const r of requests.findByStates(['pending'])) requests.promotePending(r.id);

  assert.equal(requests.get('h1').state, 'queued_fast');
  assert.equal(requests.get('h2').state, 'queued_slow');
  assert.equal(requests.findByStates(['pending']).length, 0, 'nothing left held');
});

// ── combined welcome+ready mail on completion ─────────────────────────────────────
test('finishBuild sends welcomeReady (not ready) when the run was invited from pending', () => {
  const db = openDatabase(':memory:');
  seedUser(db, 1, 'accepted'); // accepted by the time the build finishes
  const requests = createRequestsRepo(db);
  const runs = createRunsRepo(db);
  const mails = [];
  const mailer = { async sendMail(kind, to, vars) { mails.push({ kind, to, vars }); return { ok: true }; } };
  const users = { get: (id) => db.prepare('SELECT * FROM users WHERE id=?').get(id) };

  requests.create({ id: 'w1', userId: 1, queueClass: 'fast', romsTotal: 1, bundlePath: '/b', seed: '1', params: {}, state: 'pending', emailOnReady: true, now: 1 });
  requests.promotePending('w1', { welcome: true });
  requests.setState('w1', 'building', 2);

  finishBuild({ db, requests, runs, mailer, users, baseUrl: 'https://x' }, 'w1', 3);

  assert.equal(mails.length, 1);
  assert.equal(mails[0].kind, 'welcomeReady', 'one combined mail, not the plain ready');
});

// ── public config flag ────────────────────────────────────────────────────────────
test('GET /api/config reports the beta flag', () => {
  for (const beta of [true, false]) {
    const router = createConfigRouter({ beta });
    // pull the handler the router registered for GET /config
    const layer = router.stack.find((l) => l.route?.path === '/config');
    const handler = layer.route.stack[0].handle;
    const res = fakeRes();
    handler({}, res);
    assert.equal(res.body.beta, beta);
  }
});
