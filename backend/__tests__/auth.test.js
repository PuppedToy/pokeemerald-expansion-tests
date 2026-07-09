import { test } from 'node:test';
import assert from 'node:assert/strict';

import { hashPassword, verifyPassword } from '../auth/password.js';
import { signJwt, verifyJwt } from '../auth/jwt.js';
import { openDatabase } from '../db/index.js';
import { createTokensRepo } from '../auth/tokens.js';
import { requireAuth, requireVerified, ipRateLimit } from '../auth/middleware.js';
import { createRateLimiter } from '../email/rateLimiter.js';

const SECRET = 'test-secret';

// ── password (scrypt) ──────────────────────────────────────────────────────────

test('password hash verifies and rejects wrong input', () => {
  const stored = hashPassword('correct horse');
  assert.equal(verifyPassword('correct horse', stored), true);
  assert.equal(verifyPassword('wrong', stored), false);
});

test('the same password hashes differently each time (random salt)', () => {
  assert.notEqual(hashPassword('pw'), hashPassword('pw'));
});

// ── JWT (HS256, hand-rolled) ─────────────────────────────────────────────────────

test('jwt round-trips the payload', () => {
  const token = signJwt({ sub: 42 }, SECRET, { expiresInSec: 60 });
  assert.equal(verifyJwt(token, SECRET).sub, 42);
});

test('a tampered or wrong-secret jwt is rejected', () => {
  const token = signJwt({ sub: 1 }, SECRET, { expiresInSec: 60 });
  assert.throws(() => verifyJwt(token, 'other-secret'));
  assert.throws(() => verifyJwt(token + 'x', SECRET));
});

test('an expired jwt is rejected', () => {
  const token = signJwt({ sub: 1 }, SECRET, { expiresInSec: -1 });
  assert.throws(() => verifyJwt(token, SECRET), /expired/i);
});

// ── single-use tokens (verify / reset) ───────────────────────────────────────────

function setupTokens() {
  const db = openDatabase(':memory:');
  db.prepare(
    `INSERT INTO users (id,email,password_hash,verified,created_at,updated_at)
     VALUES (1,'u@x.test','h',0,0,0)`
  ).run();
  return createTokensRepo(db);
}

test('a token is single-use', () => {
  const tokens = setupTokens();
  const raw = tokens.issue(1, 'verify', { now: 1000 });
  assert.equal(tokens.consume(raw, 'verify', { now: 1001 }), 1);
  assert.equal(tokens.consume(raw, 'verify', { now: 1002 }), null);
});

test('an expired reset token is refused', () => {
  const tokens = setupTokens();
  const raw = tokens.issue(1, 'reset', { ttlMs: 100, now: 1000 });
  assert.equal(tokens.consume(raw, 'reset', { now: 2000 }), null);
});

test('a token only consumes for its own kind', () => {
  const tokens = setupTokens();
  const raw = tokens.issue(1, 'verify', { now: 1000 });
  assert.equal(tokens.consume(raw, 'reset', { now: 1001 }), null);
});

// ── middleware ───────────────────────────────────────────────────────────────────

function fakeRes() {
  return {
    statusCode: 200, body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

test('requireAuth accepts a valid bearer token and sets req.userId', () => {
  const token = signJwt({ sub: 7 }, SECRET, { expiresInSec: 60 });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = fakeRes();
  let nexted = false;
  requireAuth(SECRET)(req, res, () => { nexted = true; });
  assert.equal(nexted, true);
  assert.equal(req.userId, 7);
});

test('requireAuth rejects a missing/invalid token with 401', () => {
  const res = fakeRes();
  let nexted = false;
  requireAuth(SECRET)({ headers: {} }, res, () => { nexted = true; });
  assert.equal(nexted, false);
  assert.equal(res.statusCode, 401);
});

test('requireVerified blocks an unverified user with 403', () => {
  const users = { get: () => ({ id: 1, verified: 0 }) };
  const res = fakeRes();
  let nexted = false;
  requireVerified(users)({ userId: 1 }, res, () => { nexted = true; });
  assert.equal(nexted, false);
  assert.equal(res.statusCode, 403);
});

test('requireVerified lets a verified user through', () => {
  const users = { get: () => ({ id: 1, verified: 1 }) };
  const res = fakeRes();
  let nexted = false;
  requireVerified(users)({ userId: 1 }, res, () => { nexted = true; });
  assert.equal(nexted, true);
});

test('ipRateLimit blocks an IP past the limit with 429', () => {
  const mw = ipRateLimit(createRateLimiter({ max: 1, windowMs: 1000, now: () => 0 }));
  const req = { ip: '1.2.3.4' };

  let first = false;
  mw(req, fakeRes(), () => { first = true; });
  assert.equal(first, true);

  const res2 = fakeRes();
  let second = false;
  mw(req, res2, () => { second = true; });
  assert.equal(second, false);
  assert.equal(res2.statusCode, 429);
});
