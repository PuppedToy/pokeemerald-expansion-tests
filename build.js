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
    const { readAppVersion } = require('./randomizer/appVersion');
    const data = await parseBaseData();

    // Strip tmPool (it's a Set — not JSON-serializable) and any other non-JSON values
    // from baseData before writing. runPokedexModule re-creates tmPool from tmList.
    const serializable = {
        abilities:        data.abilities,
        items:            data.items,
        megaEvoStones:    data.megaEvoStones,
        moves:            data.moves,
        levelUpLearnsets: data.levelUpLearnsets,
        TMTeachables:     data.TMTeachables,
        evoTree:          data.evoTree,
        megaEvoTree:      data.megaEvoTree,
        allPokes:         data.allPokes,
        tmLocations:      data.tmLocations,
        capLevels:        data.capLevels,   // T-149 — caps SSOT levels for browser-safe trainer-level derivation
        appVersion:       readAppVersion(),  // T-190 — provenance stamp; the worker copies it onto the bundle
    };

    fs.mkdirSync(FRONT_DATA, { recursive: true });
    const outPath = path.join(FRONT_DATA, 'base-data.json');
    fs.writeFileSync(outPath, JSON.stringify(serializable), 'utf-8');
    const sizeKb = Math.round(fs.statSync(outPath).size / 1024);
    console.log(`[build] Wrote base-data.json (${sizeKb} KB) → ${outPath}`);

    // ── Step 2: Bundle randomizer worker ──────────────────────────────────────
    // esbuild config lives in buildWorker.cjs (shared with the B-014 regression test).
    console.log('[build] Bundling randomizer worker...');
    const { bundleWorker, bundleBps } = require('./buildWorker.cjs');
    const bundlePath = await bundleWorker();
    const bundleKb = Math.round(fs.statSync(bundlePath).size / 1024);
    console.log(`[build] Wrote randomizer.bundle.js (${bundleKb} KB) → ${bundlePath}`);

    // BPS codec for client-side patching (T-053, ADR-013).
    const bpsPath = await bundleBps();
    console.log(`[build] Wrote bps.bundle.js (${Math.round(fs.statSync(bpsPath).size / 1024)} KB) → ${bpsPath}`);

    // ── Step 3: Generate sprite map (T-001) ───────────────────────────────────
    // Encodes in-repo Pokémon/trainer art into frontend/data/sprites.json (base64).
    // The frontend embeds only the referenced sprites into each generated doc, so
    // docs are fully self-contained and depend on no external CDN. Output gitignored.
    console.log('[build] Generating sprite map...');
    const { generateSprites } = require('./randomizer/generateSprites.js');
    generateSprites({ root: ROOT, log: (m) => console.log(m) });

    // ── Step 4: Embed static assets (T-004) ───────────────────────────────────
    // Fonts/logo/icons in frontend/assets/ → frontend/data/assets.json (base64),
    // inlined into each doc so the output depends on no external host. Gitignored.
    console.log('[build] Embedding static assets...');
    const { generateAssets } = require('./randomizer/generateAssets.js');
    generateAssets({ root: ROOT, log: (m) => console.log(m) });

    // ── Step 5: Level-cap boss data (T-007) ───────────────────────────────────
    // Join src/caps.c (sLevelCapFlagMap → levels/order, SSOT) with the boss↔flag
    // trainer map; the 1-to-1 assertion throws here if caps.c drifts. Injected into
    // each doc as `bossCaps` to drive the Mail feature. Output gitignored.
    console.log('[build] Building level-cap boss data...');
    const { buildBossCaps } = require('./randomizer/bossCaps.js');
    const capsC = fs.readFileSync(path.join(ROOT, 'src', 'caps.c'), 'utf-8');
    const bossCaps = buildBossCaps(capsC);
    fs.writeFileSync(path.join(FRONT_DATA, 'bosscaps.json'), JSON.stringify(bossCaps));
    console.log(`[build] Wrote bosscaps.json (${bossCaps.length} bosses) → ${path.join(FRONT_DATA, 'bosscaps.json')}`);

    console.log('[build] Done.');
}

main().catch(err => {
    console.error('[build] FAILED:', err.message);
    process.exit(1);
});
