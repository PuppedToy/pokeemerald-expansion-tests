import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createZip } from '../build/zip.js';

test('createZip builds a STORE zip with the given entries', () => {
  const zip = createZip([
    { name: 'rom-0.gba', data: Buffer.from('AAA') },
    { name: 'readme.txt', data: Buffer.from('hello') },
  ]);

  assert.ok(Buffer.isBuffer(zip));
  assert.equal(zip.subarray(0, 4).toString('hex'), '504b0304', 'starts with a local file header (PK\\x03\\x04)');
  assert.ok(zip.includes(Buffer.from('504b0506', 'hex')), 'has an end-of-central-directory record');
  assert.match(zip.toString('latin1'), /rom-0\.gba/);
  assert.match(zip.toString('latin1'), /readme\.txt/);
  // stored (uncompressed) payloads are present verbatim
  assert.ok(zip.includes(Buffer.from('AAA')));
  assert.ok(zip.includes(Buffer.from('hello')));
});
