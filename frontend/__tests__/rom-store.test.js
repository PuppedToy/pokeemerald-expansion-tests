/**
 * T-053, ADR-013: the user's ROM lives only in the browser's IndexedDB and is hashed client-side.
 * Runs under the zero-dep DOM/env stub (ADR-009); crypto.subtle is native to Node.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installDomEnv, flush } from './helpers/dom-env.js';

let caseId = 0;
const freshStore = () => import(`../js/rom-store.js?case=${caseId++}`);

test('sha1Hex matches the known SHA-1 of "abc"', async () => {
  const env = installDomEnv();
  try {
    const { sha1Hex } = await freshStore();
    const abc = Uint8Array.from([0x61, 0x62, 0x63]);
    assert.equal(await sha1Hex(abc), 'a9993e364706816aba3e25717850c26c9cd0d89d');
  } finally { env.restore(); }
});

test('putRom stores the ROM (returns its hash), getRom reads it back, clearRom removes it', async () => {
  const env = installDomEnv();
  try {
    const { putRom, getRom, hasRom, clearRom, sha1Hex } = await freshStore();
    const rom = Uint8Array.from([1, 2, 3, 4, 5]);

    const hash = await putRom(rom);
    assert.equal(hash, await sha1Hex(rom), 'putRom returns the SHA-1 of the stored bytes');
    assert.equal(await hasRom(), true);
    assert.deepEqual([...(await getRom())], [1, 2, 3, 4, 5]);

    await clearRom();
    await flush();
    assert.equal(await hasRom(), false, 'clearRom removes it');
    assert.equal(await getRom(), null);
  } finally { env.restore(); }
});
