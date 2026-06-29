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

module.exports = { bundleWorker, WORKER_ENTRY, DEFAULT_OUTFILE };
