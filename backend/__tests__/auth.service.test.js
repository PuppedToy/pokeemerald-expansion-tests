import { test } from 'node:test';
import assert from 'node:assert/strict';

import { openDatabase } from '../db/index.js';
import { createUsersRepo } from '../auth/users.js';
import { createTokensRepo } from '../auth/tokens.js';
import { createAuthService } from '../auth/service.js';
import { verifyJwt } from '../auth/jwt.js';

const SECRET = 'svc-secret';

function setup() {
  const db = openDatabase(':memory:');
  const users = createUsersRepo(db);
  const tokens = createTokensRepo(db);
  const mails = [];
  const mailer = { async sendMail(kind, to, vars) { mails.push({ kind, to, vars }); return { ok: true }; } };
  const service = createAuthService({
    users, tokens, mailer, jwtSecret: SECRET,
    verifyUrl: (t) => `https://site/verify?t=${t}`,
    resetUrl: (t) => `https://site/reset?t=${t}`,
    now: () => 1000,
  });
  return { db, users, tokens, service, mails };
}

test('register creates an unverified user and emails a verification link', async () => {
  const { service, users, mails } = setup();
  const { userId } = await service.register({ email: 'a@x.test', password: 'pw123456' });

  const u = users.get(userId);
  assert.equal(u.email, 'a@x.test');
  assert.equal(u.verified, 0);
  assert.notEqual(u.password_hash, 'pw123456'); // hashed, not plaintext
  assert.equal(mails.length, 1);
  assert.equal(mails[0].kind, 'verify');
  assert.match(mails[0].vars.link, /verify\?t=/);
});

test('registering a duplicate email is rejected', async () => {
  const { service } = setup();
  await service.register({ email: 'dup@x.test', password: 'pw123456' });
  await assert.rejects(() => service.register({ email: 'dup@x.test', password: 'pw123456' }), /exists|duplicate/i);
});

test('verifyEmail flips the verified flag via the emailed token', async () => {
  const { service, users, mails } = setup();
  const { userId } = await service.register({ email: 'v@x.test', password: 'pw123456' });
  const token = new URL(mails[0].vars.link).searchParams.get('t');

  assert.equal(await service.verifyEmail(token), true);
  assert.equal(users.get(userId).verified, 1);
});

test('login returns a JWT for the right password and rejects a wrong one', async () => {
  const { service } = setup();
  await service.register({ email: 'l@x.test', password: 'pw123456' });

  const { token } = await service.login({ email: 'l@x.test', password: 'pw123456' });
  assert.ok(verifyJwt(token, SECRET).sub);

  await assert.rejects(() => service.login({ email: 'l@x.test', password: 'nope' }), /invalid/i);
});

test('forgot + reset rotates the password (old fails, new works)', async () => {
  const { service, mails } = setup();
  await service.register({ email: 'r@x.test', password: 'oldpassword' });

  await service.requestReset('r@x.test');
  const resetMail = mails.find((m) => m.kind === 'reset');
  assert.ok(resetMail, 'a reset mail was sent');
  const token = new URL(resetMail.vars.link).searchParams.get('t');

  assert.equal(await service.resetPassword(token, 'newpassword'), true);
  await assert.rejects(() => service.login({ email: 'r@x.test', password: 'oldpassword' }), /invalid/i);
  const { token: jwt } = await service.login({ email: 'r@x.test', password: 'newpassword' });
  assert.ok(jwt);
});
