/**
 * T-053: the BPS codec (randomizer/bps.js) must bundle for the browser main thread so account.js can
 * APPLY patches client-side. This builds the ESM bundle via the same config build.js uses (buildWorker.cjs)
 * and proves the bundled `applyBps` round-trips — the same single codec the builder uses to create them.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { bundleBps } = require('../../buildWorker.cjs');

test('T-053: the BPS codec bundles as browser ESM and applyBps round-trips', async () => {
  const out = path.join(os.tmpdir(), `ec-bps-bundle-${process.pid}.mjs`);
  await bundleBps(out);
  try {
    const mod = await import(pathToFileURL(out).href);
    const api = mod.applyBps ? mod : mod.default; // esbuild may expose named or default (CJS→ESM)
    const src = Uint8Array.from([1, 2, 3, 4, 5]);
    const tgt = Uint8Array.from([1, 9, 3, 9, 5, 6]);
    const patch = api.createBps(src, tgt);
    assert.deepEqual([...api.applyBps(patch, src)], [...tgt]);
    // wrong base ROM must be rejected client-side (the source-checksum guard)
    assert.throws(() => api.applyBps(patch, Uint8Array.from([9, 9, 9, 9, 9])), /source/i);
  } finally {
    fs.rmSync(out, { force: true });
  }
});
