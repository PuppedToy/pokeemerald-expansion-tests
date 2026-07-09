import { test } from 'node:test';
import assert from 'node:assert/strict';

import { openDatabase } from '../db/index.js';
import { createRequestsRepo } from '../db/requests.js';
import { createRunsRepo } from '../db/runs.js';
import { finishBuild } from '../lifecycle/complete.js';
import { handleNotifyOnReady } from '../produce/handlers.js';

function setup() {
  const db = openDatabase(':memory:');
  db.prepare(
    `INSERT INTO users (id,email,password_hash,verified,created_at,updated_at)
     VALUES (1,'u@x.test','h',1,0,0)`
  ).run();
  const requests = createRequestsRepo(db);
  const runs = createRunsRepo(db);
  const mails = [];
  const mailer = { async sendMail(kind, to, vars) { mails.push({ kind, to, vars }); return { ok: true }; } };
  const users = { get: (id) => db.prepare('SELECT * FROM users WHERE id=?').get(id) };
  return { db, requests, runs, mailer, users, mails };
}

const mk = (requests, over = {}) => requests.create({
  id: 'r1', userId: 1, queueClass: 'fast', romsTotal: 1, bundlePath: '/b/r1', seed: '1', params: {}, ...over,
});

function fakeRes() {
  return { statusCode: 200, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
}

test('setEmailOnReady toggles the flag', () => {
  const { requests } = setup();
  mk(requests);                                   // defaults emailOnReady=false
  assert.equal(requests.get('r1').email_on_ready, 0);
  requests.setEmailOnReady('r1', true);
  assert.equal(requests.get('r1').email_on_ready, 1);
});

test('finishBuild emails the "ready" template when email_on_ready is set', () => {
  const { db, requests, runs, mailer, users, mails } = setup();
  mk(requests, { emailOnReady: true });
  requests.setState('r1', 'building', 2);

  finishBuild({ db, requests, runs, mailer, users, baseUrl: 'https://pokemon-emerald-cut.com' }, 'r1', 3);

  assert.equal(requests.get('r1').state, 'ready');
  assert.equal(mails.length, 1);
  assert.equal(mails[0].kind, 'ready');
  assert.equal(mails[0].to, 'u@x.test');
  assert.match(mails[0].vars.link, /pokemon-emerald-cut\.com/);
});

test('finishBuild does NOT email when email_on_ready is off', () => {
  const { db, requests, runs, mailer, users, mails } = setup();
  mk(requests, { emailOnReady: false });
  requests.setState('r1', 'building', 2);
  finishBuild({ db, requests, runs, mailer, users, baseUrl: 'https://x' }, 'r1', 3);
  assert.equal(mails.length, 0);
});

test('handleNotifyOnReady sets the flag on the user\'s active request', () => {
  const { requests } = setup();
  mk(requests);
  const res = fakeRes();
  handleNotifyOnReady({ requests })({ userId: 1 }, res);
  assert.equal(res.body.ok, true);
  assert.equal(requests.get('r1').email_on_ready, 1);
});

test('handleNotifyOnReady 404s when there is no active request', () => {
  const { requests } = setup();
  const res = fakeRes();
  handleNotifyOnReady({ requests })({ userId: 1 }, res);
  assert.equal(res.statusCode, 404);
});
