'use strict';

/**
 * Bundles the randomizer Web Worker (frontend/js/randomizer-worker.cjs) into a self-contained browser
 * IIFE via esbuild. Extracted from build.js so the bundling config is the single source of truth shared
 * by the real build AND the B-014 regression test.
 *
 * The worker + its shims are intentionally `.cjs`: frontend/package.json is `type: module` (the app /
 * account modules and the node:test frontend suite are ESM), and without the explicit .cjs extension
 * esbuild would treat these CommonJS files as ESM and leave `module`/`require` undefined — the bundle
 * then threw "module is not defined" at worker load (B-014).
 */

const path = require('path');

const FRONT_JS = path.join(__dirname, 'frontend', 'js');
const SHIMS = path.join(FRONT_JS, 'shims');
const WORKER_ENTRY = path.join(FRONT_JS, 'randomizer-worker.cjs');
const DEFAULT_OUTFILE = path.join(FRONT_JS, 'randomizer.bundle.js');

// The BPS codec (T-053, ADR-013). Bundled as an ESM module so the browser main thread can APPLY the
// patches the builder CREATES with the very same randomizer/bps.js — one codec, no duplication.
const BPS_ENTRY = path.join(__dirname, 'randomizer', 'bps.js');
const BPS_OUTFILE = path.join(FRONT_JS, 'bps.bundle.js');

async function bundleWorker(outfile = DEFAULT_OUTFILE) {
  const esbuild = require('esbuild');
  await esbuild.build({
    entryPoints: [WORKER_ENTRY],
    bundle: true,
    platform: 'browser',
    format: 'iife',
    outfile,
    define: { 'process.env.NODE_ENV': '"production"', '__dirname': '"."' },
    // Redirect Node built-ins to browser stubs (.cjs → always CommonJS regardless of type:module).
    alias: {
      fs: path.join(SHIMS, 'fs.cjs'),
      path: path.join(SHIMS, 'path.cjs'),
      child_process: path.join(SHIMS, 'child_process.cjs'),
    },
  });
  return outfile;
}

async function bundleBps(outfile = BPS_OUTFILE) {
  const esbuild = require('esbuild');
  await esbuild.build({
    entryPoints: [BPS_ENTRY],
    bundle: true,
    platform: 'browser',
    format: 'esm', // ESM so the main-thread modules (account.js) can `import` applyBps
    outfile,
  });
  return outfile;
}

module.exports = { bundleWorker, bundleBps, WORKER_ENTRY, DEFAULT_OUTFILE, BPS_ENTRY, BPS_OUTFILE };
