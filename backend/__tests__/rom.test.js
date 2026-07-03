import { test } from 'node:test';
import assert from 'node:assert/strict';

import { sha1hex, createRomValidator, KNOWN_EMERALD_SHA1 } from '../rom/validate.js';
import { handleValidate } from '../rom/routes.js';

function fakeRes() {
  return {
    statusCode: 200, body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

test('validator accepts a buffer whose hash is in the known set, rejects others', () => {
  const good = Buffer.from('a legitimate dump');
  const validator = createRomValidator({ knownHashes: [sha1hex(good)] });

  assert.equal(validator.validate(good).ok, true);
  assert.equal(validator.validate(Buffer.from('some other file')).ok, false);
});

test('the production set carries the confirmed (USA, Europe) Emerald hash', () => {
  assert.ok(KNOWN_EMERALD_SHA1.has('f3ae088181bf583e55daf962a92bb46f4f1d07b7'));
});

test('the production set carries all six legal Emerald revisions (No-Intro, T-037)', () => {
  const REVISIONS = {
    'USA, Europe': 'f3ae088181bf583e55daf962a92bb46f4f1d07b7',
    Japan: 'd7cf8f156ba9c455d164e1ea780a6bf1945465c2',
    Germany: '61c2eb2b380b1a75f0c94b767a2d4c26cd7ce4e3',
    France: 'ca666651374d89ca439007bed54d839eb7bd14d0',
    Italy: '1692db322400c3141c5de2db38469913ceb1f4d4',
    Spain: 'fe1558a3dcb0360ab558969e09b690888b846dd9',
  };
  for (const [region, sha1] of Object.entries(REVISIONS)) {
    assert.ok(KNOWN_EMERALD_SHA1.has(sha1), `accepts the ${region} dump`);
  }
  assert.equal(KNOWN_EMERALD_SHA1.size, 6, 'exactly the six legal revisions, nothing else');
  // an unknown / non-Emerald hash is still rejected
  assert.equal(KNOWN_EMERALD_SHA1.has('0000000000000000000000000000000000000000'), false);
});

// T-053, ADR-013: /api/rom/validate is now hash-only — the client hashes its own ROM and sends just
// { sha1 }. The ROM bytes never leave the browser. `validateHash` checks the hash against the known set.
test('validateHash accepts a hash in the known set, rejects others', () => {
  const good = Buffer.from('a legitimate dump');
  const validator = createRomValidator({ knownHashes: [sha1hex(good)] });
  assert.equal(validator.validateHash(sha1hex(good)).ok, true);
  assert.equal(validator.validateHash(sha1hex(good).toUpperCase()).ok, true, 'case-insensitive');
  assert.equal(validator.validateHash(sha1hex(Buffer.from('other'))).ok, false);
});

test('a recognized ROM hash flips owns_valid_rom (bytes never leave the client)', () => {
  const good = Buffer.from('vanilla emerald bytes');
  const validator = createRomValidator({ knownHashes: [sha1hex(good)] });
  const calls = [];
  const users = { setOwnsValidRom: (id, v) => calls.push([id, v]) };

  const res = fakeRes();
  handleValidate({ users, validator })({ userId: 7, body: { sha1: sha1hex(good) } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.deepEqual(calls, [[7, true]]);
});

test('an unrecognized hash is rejected and the flag is NOT set', () => {
  const validator = createRomValidator({ knownHashes: [sha1hex(Buffer.from('emerald'))] });
  const calls = [];
  const users = { setOwnsValidRom: (id, v) => calls.push([id, v]) };

  const res = fakeRes();
  handleValidate({ users, validator })({ userId: 7, body: { sha1: sha1hex(Buffer.from('not emerald')) } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.ok, false);
  assert.equal(calls.length, 0);
});

test('a missing or malformed sha1 is a 400', () => {
  const validator = createRomValidator({ knownHashes: ['x'] });
  const res = fakeRes();
  handleValidate({ users: {}, validator })({ userId: 1, body: {} }, res);
  assert.equal(res.statusCode, 400);

  const res2 = fakeRes();
  handleValidate({ users: {}, validator })({ userId: 1, body: { sha1: 'not-a-hash' } }, res2);
  assert.equal(res2.statusCode, 400);
});
