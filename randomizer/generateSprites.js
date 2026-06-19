'use strict';

/**
 * generateSprites — build-time generator that turns the in-repo Pokémon and
 * trainer art into a single base64 sprite map, `frontend/data/sprites.json`
 * (gitignored), so the docs can be 100% self-contained (T-001).
 *
 * The frontend embeds only the sprites a given ROM references into each
 * generated doc; nothing is served at runtime and the backend is untouched.
 *
 *   Pokémon: graphics/pokemon/<species>/anim_front.png (64x128 sheet) -> top
 *            64x64 frame, background keyed out, re-encoded as an 8-bit indexed
 *            PNG with tRNS (≈3x smaller than RGBA). Keyed by SPECIES name.
 *   Trainers: graphics/trainers/front_pics/<name>.png are already 64x64 indexed
 *            PNGs with tRNS, so they are base64-embedded verbatim. Keyed by the
 *            filename stem (= class lowercased, spaces -> underscores).
 *
 * Pure parsing/mapping/encoding logic lives in spriteMapper.js / spriteImage.js
 * (unit-tested). This file is the thin I/O orchestrator.
 */

const fs = require('fs');
const path = require('path');
const { buildSpeciesSpriteMap, speciesKey, trainerClassToFile, parseTrainerClasses } = require('./spriteMapper');
const { spriteToIndexedPng } = require('./spriteImage');

const FRAME = 64;

function readGenFamilies(root) {
    const dir = path.join(root, 'src', 'data', 'pokemon', 'species_info');
    return fs.readdirSync(dir)
        .filter((f) => /^gen_\d+_families\.h$/.test(f))
        .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'));
}

function pngDataUri(buffer) {
    return `data:image/png;base64,${buffer.toString('base64')}`;
}

function generateSprites(opts = {}) {
    const root = opts.root || path.resolve(__dirname, '..');
    const log = opts.log || console.log;

    // ── Pokémon ──────────────────────────────────────────────────────────────
    const genTexts = readGenFamilies(root);
    const pokemonH = fs.readFileSync(path.join(root, 'src', 'data', 'graphics', 'pokemon.h'), 'utf8');
    const { map, unresolved } = buildSpeciesSpriteMap(genTexts, pokemonH);

    const pokemon = {};
    const missingFiles = [];
    const failed = [];
    for (const [species, srcRel] of map) {
        const srcAbs = path.join(root, srcRel);
        if (!fs.existsSync(srcAbs)) { missingFiles.push(`${species} -> ${srcRel}`); continue; }
        try {
            pokemon[speciesKey(species)] = pngDataUri(spriteToIndexedPng(fs.readFileSync(srcAbs), FRAME));
        } catch (err) {
            failed.push(`${species}: ${err.message}`);
        }
    }

    // ── Trainers (already 64x64 indexed PNGs with tRNS — embed verbatim) ───────
    const trainerSrcDir = path.join(root, 'graphics', 'trainers', 'front_pics');
    const trainerFiles = fs.readdirSync(trainerSrcDir).filter((f) => f.endsWith('.png'));
    const trainers = {};
    for (const f of trainerFiles) {
        trainers[f.replace(/\.png$/, '')] = pngDataUri(fs.readFileSync(path.join(trainerSrcDir, f)));
    }

    // Report which docs trainer classes have no local sprite (no silent drops).
    const templateHtml = fs.readFileSync(path.join(root, 'frontend', 'template.html'), 'utf8');
    const trainerClassesUnresolved = parseTrainerClasses(templateHtml).filter(
        (c) => c !== 'Unknown' && !(trainerClassToFile(c) in trainers)
    );

    // ── Write ──────────────────────────────────────────────────────────────────
    const outDir = path.join(root, 'frontend', 'data');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'sprites.json');
    fs.writeFileSync(outPath, JSON.stringify({ pokemon, trainers }));
    const sizeMb = (fs.statSync(outPath).size / 1048576).toFixed(2);

    // ── Report ───────────────────────────────────────────────────────────────
    log(`[sprites] Pokémon: ${Object.keys(pokemon).length} encoded, ${unresolved.length} without an inline frontPic (macro forms).`);
    if (missingFiles.length) log(`[sprites] WARNING: ${missingFiles.length} mapped source PNG(s) missing on disk:\n  ${missingFiles.join('\n  ')}`);
    if (failed.length) log(`[sprites] WARNING: ${failed.length} sprite(s) failed to encode:\n  ${failed.join('\n  ')}`);
    log(`[sprites] Trainers: ${trainerFiles.length} embedded.`);
    if (trainerClassesUnresolved.length) {
        log(`[sprites] WARNING: ${trainerClassesUnresolved.length} docs trainer class(es) have no local sprite: ${trainerClassesUnresolved.join(', ')}`);
    }
    log(`[sprites] Wrote sprites.json (${sizeMb} MB) → ${outPath}`);

    return {
        pokemonCount: Object.keys(pokemon).length,
        trainersCount: trainerFiles.length,
        speciesUnresolved: unresolved,
        missingFiles,
        failed,
        trainerClassesUnresolved,
        outPath,
    };
}

module.exports = { generateSprites };

if (require.main === module) {
    generateSprites();
}
