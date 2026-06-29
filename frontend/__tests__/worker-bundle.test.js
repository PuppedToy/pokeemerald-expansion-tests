/**
 * B-014 regression: the randomizer Web Worker must bundle as CommonJS and load with no
 * "ReferenceError: module is not defined".
 *
 * frontend/package.json is `type: module` (for the ESM app/account modules + this node:test suite).
 * The worker and its Node-builtin shims are CommonJS; if they aren't `.cjs`, esbuild treats them as
 * ESM and leaves `module`/`require` undefined, so the bundle crashes the worker on load. This builds
 * the worker via the same config build.js uses (buildWorker.cjs) and proves it loads cleanly.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { bundleWorker } = require('../../buildWorker.cjs');

test('B-014: the worker bundles to CommonJS and loads without "module is not defined"', async () => {
  const out = path.join(os.tmpdir(), `ec-worker-bundle-${process.pid}.cjs`);
  await bundleWorker(out);
  const code = fs.readFileSync(out, 'utf8');

  // An __esm() wrapper means a CommonJS file was mistaken for ESM (the type:module trap) — the exact
  // shape that left bare `module`/`require` in production.
  assert.ok(!code.includes('__esm({'), 'no bundled module should be wrapped as ESM');

  // Smoke-load the IIFE with worker globals stubbed; the buggy bundle throws here.
  const saved = { self: global.self, postMessage: global.postMessage };
  global.self = { onmessage: null, postMessage() {}, addEventListener() {} };
  global.postMessage = () => {};
  try {
    require(out); // executes the bundle; init of the fs/path shims runs module.exports here
  } finally {
    global.self = saved.self;
    global.postMessage = saved.postMessage;
    fs.rmSync(out, { force: true });
  }
});
