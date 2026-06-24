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

test('a recognized ROM flips owns_valid_rom and the bytes are never persisted', () => {
  const good = Buffer.from('vanilla emerald bytes');
  const validator = createRomValidator({ knownHashes: [sha1hex(good)] });
  const calls = [];
  const users = { setOwnsValidRom: (id, v) => calls.push([id, v]) };

  const res = fakeRes();
  handleValidate({ users, validator })({ userId: 7, body: good }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.deepEqual(calls, [[7, true]]);
});

test('an unrecognized upload is rejected and the flag is NOT set', () => {
  const validator = createRomValidator({ knownHashes: ['deadbeef'] });
  const calls = [];
  const users = { setOwnsValidRom: (id, v) => calls.push([id, v]) };

  const res = fakeRes();
  handleValidate({ users, validator })({ userId: 7, body: Buffer.from('not emerald') }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.ok, false);
  assert.equal(calls.length, 0);
});

test('an empty upload is a 400', () => {
  const validator = createRomValidator({ knownHashes: ['x'] });
  const res = fakeRes();
  handleValidate({ users: {}, validator })({ userId: 1, body: Buffer.alloc(0) }, res);
  assert.equal(res.statusCode, 400);
});
