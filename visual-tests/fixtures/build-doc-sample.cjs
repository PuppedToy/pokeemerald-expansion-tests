'use strict';
/**
 * Deterministic, browser-free builder for a *current* generated-docs-viewer sample (T-040).
 *
 * The viewer HTML is normally produced in the browser: the Web Worker
 * (`frontend/js/randomizer-worker.cjs`) runs the randomizer to a bundle, then
 * `frontend/js/app.js:buildDocHtml()` injects that bundle's data into
 * `frontend/template.html`. `randomizer/output/out.html` and `debug/**` are the OLD
 * viewer (pre T-038/T-039), so they can't be used for responsive screenshots.
 *
 * This script reproduces a `default`-run generation in plain Node (same module calls
 * as the worker's `generateDefault`) with a FIXED seed, then applies the exact same
 * string-injection as `buildDocHtml`. Output is a fully self-contained HTML file
 * (fonts/sprites inlined as data URIs) that opens over `file://` with no server.
 *
 *   node visual-tests/fixtures/build-doc-sample.cjs [seed] [outPath]
 *
 * Default seed 42 → reproducible fixture for visual-regression baselines.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const R = (...p) => path.join(ROOT, ...p);

const rng = require(R('randomizer/rng.js'));
const { runPokedexModule } = require(R('randomizer/modules/pokedexModule.js'));
const { runTrainersModule } = require(R('randomizer/modules/trainersModule.js'));
const { runStartersModule } = require(R('randomizer/modules/startersModule.js'));
const { runWildModule } = require(R('randomizer/modules/wildModule.js'));
const wildData = require(R('randomizer/wild.js'));
const { writerDocs } = require(R('randomizer/writerDocs.js'));

// ── buildDocHtml + helpers: kept in lock-step with frontend/js/app.js ───────────
const DOC_OMIT_POKE_FIELDS = new Set([
    'contextualRatings', 'contextualRatingsDoubles', 'teachableLearnset', 'levelUpLearnset',
    'natDexNum', 'speciesName', 'catchRate', 'expYield',
]);
function slimPokes(pokes) {
    return pokes.map((p) => {
        const out = {};
        for (const k in p) if (!DOC_OMIT_POKE_FIELDS.has(k)) out[k] = p[k];
        return out;
    });
}
function docRunNamespace(seed, playerIndex, romIndex) {
    const parts = [];
    if (seed !== undefined && seed !== null && String(seed) !== '') parts.push(`s${seed}`);
    if (playerIndex !== undefined && playerIndex !== null) parts.push(`p${playerIndex}`);
    if (romIndex !== undefined && romIndex !== null) parts.push(`r${romIndex}`);
    return parts.join('-').replace(/[^A-Za-z0-9_-]/g, '');
}
function buildDocHtml(template, rom, pokedex, spritesText, assetsText, seed, bossCapsText) {
    const assets = JSON.parse(assetsText);
    const runNs = docRunNamespace(seed, rom.playerIndex, rom.romIndex);
    return template
        .split('%%DOC_RUN_NS%%').join(runNs)

        .replace('<script src="sprites.js"></script>',
            `<script>const EMBEDDED_SPRITES = ${spritesText};</script>`)
        .replace('<script src="assets.js"></script>',
            `<script>const EMBEDDED_ASSETS = ${assetsText};</script>`)
        .replace('<script src="bosscaps.js"></script>',
            `<script>const bossCaps = ${bossCapsText || '[]'};</script>`)
        .split('__FONT_PRESS_START_2P__').join(assets['fonts/PressStart2P.woff2'] || '')
        .split('__FONT_VT323__').join(assets['fonts/VT323.woff2'] || '')
        // T-163 — inject the docs-visibility-redacted viewer copy (lock-step with app.js buildDocHtml).
        .replace('<script src="trainers.js"></script>',
            `<script>const trainersData = ${JSON.stringify(rom.docs.viewerTrainers || rom.docs.trainersResultsSimplified)};</script>`)
        .replace('<script src="pokes.js"></script>',
            `<script>const pokes = ${JSON.stringify(slimPokes(pokedex.pokes))};</script>`)
        .replace('<script src="moves.js"></script>',
            `<script>const movesData = ${JSON.stringify(pokedex.moves)};</script>`)
        .replace('<script src="abilities.js"></script>',
            `<script>const abilitiesData = ${JSON.stringify(pokedex.abilities)};</script>`)
        // T-078 — item descriptions (name-keyed) for held-item / reward hover tooltips.
        .replace('<script src="items.js"></script>',
            `<script>const itemsData = ${JSON.stringify(pokedex.items || {})};</script>`)
        .replace('<script src="wildpokes.js"></script>',
            `<script>const wildPokes = ${JSON.stringify(rom.docs.wildPokes)};</script>`)
        // T-044 — move-chip type colours (SSOT: randomizer/trainerColors.js) via rom.docs.typeColors.
        .replace('<script src="colors.js"></script>',
            `<script>const typeColors = ${JSON.stringify(rom.docs.typeColors)};</script>`);
}

async function main() {
    const seed = Number(process.argv[2] || 42) >>> 0;
    const outPath = process.argv[3] || path.join(__dirname, 'docs-sample.html');

    const baseData = JSON.parse(fs.readFileSync(R('frontend/data/base-data.json'), 'utf8'));
    const spritesText = fs.readFileSync(R('frontend/data/sprites.json'), 'utf8');
    const assetsText = fs.readFileSync(R('frontend/data/assets.json'), 'utf8');
    const bossCapsText = fs.readFileSync(R('frontend/data/bosscaps.json'), 'utf8');
    const template = fs.readFileSync(R('frontend/template.html'), 'utf8');

    // T-163 — optional docs-visibility config via env (JSON) so a redacted fixture can be built to
    // verify the viewer redaction, e.g. DV_JSON='{"showBosses":false,"showIVs":true}'. Default: none.
    const dv = process.env.DV_JSON ? JSON.parse(process.env.DV_JSON) : null;
    const mcfg = { seed, difficulty: 7, rebalance: true, balanceChance: 0.2, allTms: false, showExactPositions: false, docsVisibility: dv || undefined };

    const t0 = Date.now();
    try {
        rng.seed(seed);
        const pokedex = await runPokedexModule(mcfg, baseData);
        const trainers = runTrainersModule(pokedex, mcfg);
        const starters = runStartersModule(pokedex.pokes);
        const wild = runWildModule(pokedex.pokes, starters, wildData);
        rng.seed(seed);
        const docs = await writerDocs(pokedex, trainers, starters, wild, seed, { showExactPositions: dv?.showExactPositions === true, docsVisibility: dv || undefined });
        const rom = { romIndex: 0, artifacts: { pokedex, trainers, starters, wild }, docs };

        const html = buildDocHtml(template, rom, pokedex, spritesText, assetsText, seed, bossCapsText);
        fs.writeFileSync(outPath, html);
        console.log(`[fixture] seed=${seed} → ${outPath} (${(html.length / 1e6).toFixed(1)} MB, ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    } finally {
        // The randomizer modules mutate generated source files as a side effect (starters →
        // src/data/script_menu.h, wild → data/maps/**/scripts.inc, …) — exactly what analyze.js
        // guards against. Restore them so building a fixture never dirties the working tree.
        try { execFileSync('git', ['checkout', '--', 'src', 'include', 'data/maps'], { cwd: ROOT, stdio: 'ignore' }); } catch { /* not a git tree / nothing to restore */ }
    }
}

main().catch((e) => { console.error(e); process.exit(1); });
