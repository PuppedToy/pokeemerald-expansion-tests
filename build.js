#!/usr/bin/env node
'use strict';
/**
 * Pre-cook script for the browser randomizer frontend.
 *
 * Steps:
 *   1. Parse all source .h files (parseBaseData) → frontend/data/base-data.json
 *      This is the deterministic game data the browser loads to run the randomizer.
 *   2. Bundle frontend/js/randomizer-worker.js → frontend/js/randomizer.bundle.js
 *      via esbuild (CJS → browser IIFE, inlines all randomizer modules).
 *
 * Run this once after any change to the base game source files (.h species/learnset/etc.)
 * or to the randomizer module logic.
 *
 * Usage:
 *   node build.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT       = path.resolve(__dirname);
const FRONT_DATA = path.join(ROOT, 'frontend', 'data');
const FRONT_JS   = path.join(ROOT, 'frontend', 'js');

async function main() {
    // ── Step 1: Parse base data ────────────────────────────────────────────────
    console.log('[build] Parsing base game data...');
    const { parseBaseData } = require('./randomizer/modules/pokedexModule.js');
    const data = await parseBaseData();

    // Strip tmPool (it's a Set — not JSON-serializable) and any other non-JSON values
    // from baseData before writing. runPokedexModule re-creates tmPool from tmList.
    const serializable = {
        abilities:        data.abilities,
        megaEvoStones:    data.megaEvoStones,
        moves:            data.moves,
        levelUpLearnsets: data.levelUpLearnsets,
        TMTeachables:     data.TMTeachables,
        evoTree:          data.evoTree,
        megaEvoTree:      data.megaEvoTree,
        allPokes:         data.allPokes,
    };

    fs.mkdirSync(FRONT_DATA, { recursive: true });
    const outPath = path.join(FRONT_DATA, 'base-data.json');
    fs.writeFileSync(outPath, JSON.stringify(serializable), 'utf-8');
    const sizeKb = Math.round(fs.statSync(outPath).size / 1024);
    console.log(`[build] Wrote base-data.json (${sizeKb} KB) → ${outPath}`);

    // ── Step 2: Bundle randomizer worker ──────────────────────────────────────
    console.log('[build] Bundling randomizer worker...');
    const esbuild = require('esbuild');
    const SHIMS = path.join(FRONT_JS, 'shims');
    await esbuild.build({
        entryPoints: [path.join(FRONT_JS, 'randomizer-worker.js')],
        bundle:      true,
        platform:    'browser',
        format:      'iife',
        outfile:     path.join(FRONT_JS, 'randomizer.bundle.js'),
        define:      { 'process.env.NODE_ENV': '"production"', '__dirname': '"."' },
        // Redirect Node built-ins to browser stubs.
        // fs/path calls in the randomizer are guarded by IS_NODE and never execute
        // in the browser — the stubs just satisfy the static require() at load time.
        alias: {
            'fs':            path.join(SHIMS, 'fs.js'),
            'path':          path.join(SHIMS, 'path.js'),
            'child_process': path.join(SHIMS, 'child_process.js'),
        },
    });
    const bundleKb = Math.round(fs.statSync(path.join(FRONT_JS, 'randomizer.bundle.js')).size / 1024);
    console.log(`[build] Wrote randomizer.bundle.js (${bundleKb} KB) → ${path.join(FRONT_JS, 'randomizer.bundle.js')}`);

    // ── Step 3: Generate sprite map (T-001) ───────────────────────────────────
    // Encodes in-repo Pokémon/trainer art into frontend/data/sprites.json (base64).
    // The frontend embeds only the referenced sprites into each generated doc, so
    // docs are fully self-contained and depend on no external CDN. Output gitignored.
    console.log('[build] Generating sprite map...');
    const { generateSprites } = require('./randomizer/generateSprites.js');
    generateSprites({ root: ROOT, log: (m) => console.log(m) });

    console.log('[build] Done.');
}

main().catch(err => {
    console.error('[build] FAILED:', err.message);
    process.exit(1);
});
