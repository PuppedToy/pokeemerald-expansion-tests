import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';

import { openDatabase } from '../db/index.js';
import { createUsersRepo } from '../auth/users.js';
import { createFeedbackRepo, FEEDBACK_CATEGORIES } from '../db/feedback.js';
import { createFeedbackRouter } from '../feedback/routes.js';
import { handleSubmitFeedback } from '../feedback/handlers.js';
import { signJwt } from '../auth/jwt.js';

function fakeRes() {
  return {
    statusCode: 200, body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

function setup() {
  const db = openDatabase(':memory:');
  const users = createUsersRepo(db);
  const feedback = createFeedbackRepo(db);
  const u = users.create({ email: 'sender@x.test', passwordHash: 'h', now: 1000 });
  return { db, users, feedback, u };
}

// ── repository ────────────────────────────────────────────────────────────────

test('create stores the row with author, category, message and timestamp', () => {
  const { feedback, u } = setup();
  const row = feedback.create({ userId: u.id, category: 'feature', message: 'more starters', now: 1234 });
  assert.equal(row.user_id, u.id);
  assert.equal(row.category, 'feature');
  assert.equal(row.message, 'more starters');
  assert.equal(row.created_at, 1234);
});

test('all() returns rows joined with the author email, newest first', () => {
  const { feedback, u } = setup();
  feedback.create({ userId: u.id, category: 'feature', message: 'first', now: 1000 });
  feedback.create({ userId: u.id, category: 'bug', message: 'second', now: 2000 });
  const rows = feedback.all();
  assert.equal(rows.length, 2);
  assert.equal(rows[0].message, 'second', 'newest first');
  assert.equal(rows[0].email, 'sender@x.test', 'author email is joined in for analysis');
});

test('FEEDBACK_CATEGORIES is the closed set of allowed categories', () => {
  assert.deepEqual([...FEEDBACK_CATEGORIES].sort(), ['bug', 'feature', 'other']);
});

// ── handler ───────────────────────────────────────────────────────────────────

test('handler stores a valid submission and returns 201', () => {
  const { feedback, u } = setup();
  const res = fakeRes();
  handleSubmitFeedback({ feedback, now: () => 5000 })(
    { userId: u.id, body: { category: 'bug', message: '  crashes on submit  ' } }, res,
  );
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.ok, true);
  const rows = feedback.all();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].message, 'crashes on submit', 'message is trimmed');
  assert.equal(rows[0].category, 'bug');
  assert.equal(rows[0].created_at, 5000);
});

test('handler defaults the category to "feature" when omitted', () => {
  const { feedback, u } = setup();
  const res = fakeRes();
  handleSubmitFeedback({ feedback })({ userId: u.id, body: { message: 'idea' } }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(feedback.all()[0].category, 'feature');
});

test('handler rejects an unknown category with 400 and stores nothing', () => {
  const { feedback, u } = setup();
  const res = fakeRes();
  handleSubmitFeedback({ feedback })({ userId: u.id, body: { category: 'spam', message: 'x' } }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(feedback.all().length, 0);
});

test('handler rejects an empty / whitespace-only message with 400', () => {
  const { feedback, u } = setup();
  for (const message of ['', '   ', undefined, 42]) {
    const res = fakeRes();
    handleSubmitFeedback({ feedback })({ userId: u.id, body: { message } }, res);
    assert.equal(res.statusCode, 400, `message=${JSON.stringify(message)} must be rejected`);
  }
  assert.equal(feedback.all().length, 0);
});

test('handler rejects an over-long message with 400', () => {
  const { feedback, u } = setup();
  const res = fakeRes();
  handleSubmitFeedback({ feedback })({ userId: u.id, body: { message: 'x'.repeat(5001) } }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(feedback.all().length, 0);
});

// ── account deletion cascade (FK guard) ─────────────────────────────────────────

// ── route wiring (real express + signed JWT) ────────────────────────────────────

async function withServer(fn) {
  const SECRET = 'test-secret';
  const db = openDatabase(':memory:');
  const users = createUsersRepo(db);
  const feedback = createFeedbackRepo(db);
  const u = users.create({ email: 'poster@x.test', passwordHash: 'h' });

  const app = express();
  app.use('/api', createFeedbackRouter({ feedback, jwtSecret: SECRET }));
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const { port } = server.address();
  const url = `http://localhost:${port}/api/feedback`;
  const token = signJwt({ sub: u.id }, SECRET, { expiresInSec: 60 });
  try { await fn({ url, token, feedback }); } finally { server.close(); }
}

test('POST /api/feedback with a valid token stores the row and returns 201', async () => {
  await withServer(async ({ url, token, feedback }) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ category: 'other', message: 'nice work' }),
    });
    assert.equal(res.status, 201);
    assert.equal((await res.json()).ok, true);
    assert.equal(feedback.all()[0].message, 'nice work');
  });
});

test('POST /api/feedback without a token is rejected with 401', async () => {
  await withServer(async ({ url, feedback }) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'anon' }),
    });
    assert.equal(res.status, 401);
    assert.equal(feedback.all().length, 0);
  });
});

test('POST /api/feedback with an invalid category is rejected with 400', async () => {
  await withServer(async ({ url, token, feedback }) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ category: 'nope', message: 'x' }),
    });
    assert.equal(res.status, 400);
    assert.equal(feedback.all().length, 0);
  });
});

test('feedback.deleteForUser lets a user with feedback be deleted (FK stays satisfied)', () => {
  const { db, users, feedback, u } = setup();
  feedback.create({ userId: u.id, category: 'feature', message: 'keep me valid', now: 1 });

  // Deleting the user while feedback still references it must fail (proves the wiring is needed).
  assert.throws(() => users.delete(u.id), /FOREIGN KEY|constraint/i);

  // Clearing the user's feedback first makes the delete succeed.
  feedback.deleteForUser(u.id);
  assert.doesNotThrow(() => users.delete(u.id));
  assert.equal(users.get(u.id), null);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM feedback WHERE user_id = ?').get(u.id).n, 0);
});
