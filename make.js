#!/usr/bin/env node
'use strict';

/**
 * make.js — ROM production pipeline.
 *
 * Two modes:
 *   Bundle    — reads a pre-generated session bundle JSON and produces one ROM
 *               per entry: write game files → make → save ROM → restore files.
 *   Randomize — runs the randomizer fresh (like analyze.js), then compiles one ROM.
 *
 * Non-interactive flags:
 *   node make.js --bundle=./path/to/bundle.json
 *   node make.js --randomize [--seed=42] [--difficulty=hard] [--no-balance]
 *   node make.js --full-rom     (emit the full .gba instead of a BPS patch; default is .bps — ADR-013)
 *   node make.js --debug
 *   node make.js --clean        (runs 'make clean' before the first make)
 */

const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const readline = require('readline');

const root    = __dirname;
const ROM_SRC = path.join(root, 'pokeemerald.gba');

// ── Guards ───────────────────────────────────────────────────────────────────

function checkDataClean() {
    const result = spawnSync('git', ['status', '--porcelain', 'data/'], {
        cwd: root, shell: process.platform === 'win32', encoding: 'utf8',
    });
    const dirty = (result.stdout || '').trim();
    if (dirty) {
        console.error('\nERROR: Uncommitted changes in data/ detected. Commit or stash them first:\n' + dirty);
        process.exit(1);
    }
}

// ── Shell helpers ────────────────────────────────────────────────────────────

function run(cmd, args) {
    console.log(`\n> ${cmd} ${args.join(' ')}`);
    const result = spawnSync(cmd, args, {
        cwd: root, stdio: 'inherit', shell: process.platform === 'win32',
    });
    if (result.error) throw new Error(`Failed to spawn ${cmd}: ${result.error.message}`);
    if (result.status !== 0) throw new Error(`${cmd} exited with code ${result.status}`);
}

function restore() {
    console.log('\n> Restoring mutated source files...');
    spawnSync('git', ['checkout', '--', 'src/', 'include/', 'data/maps/'], {
        cwd: root, stdio: 'inherit', shell: process.platform === 'win32',
    });
}

// `make -j` bounded to the box core count (BUILD_JOBS overrides) — unbounded -j
// over-spawns on a small box (T-024/T-030).
function resolveJobs() {
    const env = parseInt(process.env.BUILD_JOBS, 10);
    if (Number.isInteger(env) && env > 0) return env;
    const cores = (typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length) || 1;
    return Math.max(1, cores);
}

// ── Interactive prompt ───────────────────────────────────────────────────────

function ask(rl, question) {
    return new Promise(resolve => rl.question(question, resolve));
}

// ── Bundle sentinel resolution ───────────────────────────────────────────────

function resolveArtifact(value, sharedData, key) {
    if (value === 'shared' || value === 'global') return sharedData[key];
    if (typeof value === 'string' && value.startsWith('player-')) {
        const playerIndex = parseInt(value.split('-')[1], 10);
        return sharedData.players[playerIndex][key];
    }
    return value;
}

// Derive the RNG seed for a ROM based on its trainer-sharing level.
// Shared trainers use the same base seed so tier-based slots are identical
// across ROMs. Per-ROM trainers use a unique derived seed.
function resolveRomSeed(rom, seed) {
    const t = rom.artifacts.trainers;
    if (t === 'shared' || t === 'global') return seed;
    if (typeof t === 'string' && t.startsWith('player-')) {
        const p = parseInt(t.split('-')[1], 10);
        return (seed ^ (p * 0x9E3779B9)) >>> 0;
    }
    return (seed ^ (rom.romIndex * 0x9E3779B9)) >>> 0;
}

// Returns the baseRngSeed to pass to writer() for per-slot trainer reseeding.
// Must match the trainingBaseSeed logic in randomizer-worker.js so docs == ROM.
function resolveTrainingBaseSeed(rom, seed) {
    const t = rom.artifacts.trainers;
    if (t === 'shared' || t === 'global') return seed;
    if (typeof t === 'string' && t.startsWith('player-')) {
        const p = parseInt(t.split('-')[1], 10);
        return (seed ^ (p * 0x9E3779B9)) >>> 0;
    }
    return null; // per-ROM trainers: sequential RNG, no reseeding
}

function romFileName(rom) {
    if (rom.playerIndex !== undefined) {
        return `player-${rom.playerIndex}-rom-${rom.romIndex}.gba`;
    }
    return `rom-${rom.romIndex}.gba`;
}

// ── Single-ROM build — the unit the backend queue drives (T-030) ──────────────

async function buildOneRom({ rom, bundle, seed, outDir, isDebug = false, jobs = resolveJobs(), fullRom = false }) {
    const rng                          = require('./randomizer/rng');
    const writer                       = require('./randomizer/writer');
    const { writeTMsFromList }          = require('./randomizer/tmRandomizer');
    const { writeItemFilesFromBundle }  = require('./randomizer/itemRandomizer');
    const { writeMoney }                = require('./randomizer/moneyWriter');
    const { writeItemPrices }           = require('./randomizer/itemPriceWriter');
    const { writeRunAndBunVars }        = require('./randomizer/runAndBunWriter');
    const { writeStevenTagVar }         = require('./randomizer/stevenTagWriter');
    const { writeLocationNames }        = require('./randomizer/locationNameWriter');
    const { emitArtifact, resolveVanillaPath } = require('./randomizer/romArtifact');

    const label    = romFileName(rom);
    const pokedex  = resolveArtifact(rom.artifacts.pokedex,  bundle.sharedData, 'pokedex');
    const trainers = resolveArtifact(rom.artifacts.trainers, bundle.sharedData, 'trainers');
    const starters = resolveArtifact(rom.artifacts.starters, bundle.sharedData, 'starters');
    const wild     = rom.artifacts.wild;

    const missing = ['pokedex','trainers','starters','wild'].filter(k => !({ pokedex, trainers, starters, wild }[k]));
    if (missing.length) throw new Error(`ROM ${rom.romIndex}: missing artifacts after resolution: ${missing.join(', ')}`);

    fs.mkdirSync(outDir, { recursive: true });

    // Seed RNG: shared-trainer ROMs use baseSeed so tier-based slots are identical
    // across ROMs; per-ROM trainer ROMs use a unique derived seed.
    rng.seed(resolveRomSeed(rom, seed));

    try {
        const runNs = writer.docRunNamespace({ seed, playerIndex: rom.playerIndex, romIndex: rom.romIndex });
        // starterNaming is per-ROM (never shared) — read it straight off the rom, no resolveArtifact (T-068).
        await writer(pokedex, trainers, starters, wild, isDebug, resolveTrainingBaseSeed(rom, seed), rom.docs, runNs, rom.artifacts.starterNaming || null);
        await writeTMsFromList(pokedex.tmList);
        writeItemFilesFromBundle(trainers.itemAssignments);
        // T-052 — patch configurable prize money into the C source (restored by restore() after build).
        await writeMoney(bundle.config?.money);
        // T-073 — patch configurable shop item prices into src/data/items.h (restored by restore()).
        await writeItemPrices(bundle.config?.prices);
        // T-091/ADR-014 — preset the League Run & Bun mode gate + E4 quotas from the run config
        // into Sidney's room init script (restored by restore() after build).
        await writeRunAndBunVars(bundle.config);
        // T-165 — flip the Mossdeep Space Center tag-battle gate (solo Tabitha boss when the option is on;
        // restored by restore() after build).
        await writeStevenTagVar(bundle.config);
        // T-070 — per-ROM location→nickname table (per-ROM, never shared; restored by restore()).
        await writeLocationNames(rom.artifacts.locationNaming || null);
        run('make', ['-j', String(jobs)]);

        // Default delivery is a BPS delta (vanilla→built); --full-rom copies the .gba verbatim (ADR-013).
        const vanillaPath = fullRom ? null : resolveVanillaPath(root);
        const dest = emitArtifact({ builtRomPath: ROM_SRC, outDir, label, fullRom, vanillaPath });
        console.log(`\n  ✓  Saved: ${dest}`);
        return dest;
    } finally {
        restore();
    }
}

// ── Bundle mode ──────────────────────────────────────────────────────────────

async function bundleMode(bundlePath, isDebug, doClean, opts = {}) {
    const { romIndex = null, outDir: outDirOverride = null, jobs = resolveJobs(), fullRom = false } = opts;
    console.log(`\nLoading bundle: ${bundlePath}`);

    let bundle;
    try {
        bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
    } catch (err) {
        throw new Error(`Cannot read bundle file: ${err.message}`);
    }

    if (!bundle.roms || !Array.isArray(bundle.roms) || bundle.roms.length === 0) {
        throw new Error('Invalid bundle: missing or empty roms array');
    }

    const seed      = bundle.config?.seed ?? 0;
    const sessionId = bundle.sessionId ?? `session-${Date.now()}`;
    const outDir    = outDirOverride || path.join(root, 'roms', sessionId);
    fs.mkdirSync(outDir, { recursive: true });

    if (romIndex != null && !bundle.roms[romIndex]) {
        throw new Error(`ROM index ${romIndex} out of range (bundle has ${bundle.roms.length})`);
    }
    const roms = romIndex != null ? [bundle.roms[romIndex]] : bundle.roms;

    console.log(`Session:   ${sessionId}`);
    console.log(`ROMs:      ${roms.length}${romIndex != null ? ` (index ${romIndex})` : ''}`);
    console.log(`Seed:      ${seed}`);
    console.log(`Output:    ${outDir}`);
    console.log(`Jobs:      make -j${jobs}`);
    console.log(`Artifact:  ${fullRom ? 'full ROM (.gba)' : 'BPS patch (.bps, vanilla→built)'}`);

    if (doClean) run('make', ['clean']);

    for (const rom of roms) {
        console.log(`\n${'─'.repeat(64)}`);
        console.log(`ROM ${rom.romIndex + 1} / ${bundle.roms.length}  →  ${romFileName(rom)}`);
        console.log('─'.repeat(64));
        await buildOneRom({ rom, bundle, seed, outDir, isDebug, jobs, fullRom });
    }

    console.log(`\n${'='.repeat(64)}`);
    console.log(`Done! ${roms.length} ROM(s) in:`);
    console.log(`  ${outDir}`);
    console.log('='.repeat(64));
}

// ── Randomize mode ───────────────────────────────────────────────────────────

async function randomizeMode(opts, doClean) {
    const { loadConfig }     = require('./randomizer/config');
    const { runPokedexModule }  = require('./randomizer/modules/pokedexModule');
    const { runTrainersModule } = require('./randomizer/modules/trainersModule');
    const { runStartersModule } = require('./randomizer/modules/startersModule');
    const { runWildModule }     = require('./randomizer/modules/wildModule');
    const wildData = require('./randomizer/wild');
    const rng      = require('./randomizer/rng');
    const writer   = require('./randomizer/writer');
    const { emitArtifact, resolveVanillaPath } = require('./randomizer/romArtifact');

    const config = loadConfig({
        seed:         opts.seed ? parseInt(opts.seed, 10) : null,
        difficulty:   opts.difficulty || null,
        rebalance:    opts.rebalance,
        allTms:       false,
    }, { argv: [] });

    rng.seed(config.seed);
    console.log(`\nSeed: ${config.seed}`);

    const outDir = path.join(root, 'roms');
    fs.mkdirSync(outDir, { recursive: true });

    if (doClean) run('make', ['clean']);

    let dest;
    try {
        const pokedex  = await runPokedexModule(config);
        const trainers = runTrainersModule(pokedex, config);
        const starters = runStartersModule(pokedex.pokes, { quality: config.starterQuality });
        const wild     = runWildModule(pokedex.pokes, starters, wildData);

        await writer(pokedex, trainers, starters, wild, opts.debug, null, null,
            writer.docRunNamespace({ seed: config.seed }));
        run('make', ['-j', String(resolveJobs())]);

        // Default delivery is a BPS delta; --full-rom copies the .gba verbatim (ADR-013).
        const vanillaPath = opts.fullRom ? null : resolveVanillaPath(root);
        dest = emitArtifact({
            builtRomPath: ROM_SRC, outDir, label: `rom-${config.seed}.gba`, fullRom: opts.fullRom, vanillaPath,
        });
        console.log(`\n  ✓  Saved: ${dest}`);
    } finally {
        restore();
    }

    console.log(`\n  Done! Saved to: ${dest}`);
}

// ── Argument parsing + interactive prompts ───────────────────────────────────

async function parseOpts() {
    const argv = process.argv.slice(2);

    const bundleFlag  = argv.find(a => a.startsWith('--bundle='));
    const doRandomize = argv.includes('--randomize');
    const isDebug     = argv.includes('--debug');
    const doClean     = argv.includes('--clean');
    const doFullRom   = argv.includes('--full-rom');

    if (bundleFlag || doRandomize) {
        return {
            mode:       bundleFlag ? 'bundle' : 'randomize',
            bundlePath: bundleFlag ? path.resolve(bundleFlag.replace('--bundle=', '')) : null,
            isDebug,
            doClean,
            bundleOpts: {
                romIndex: (argv.find(a => a.startsWith('--rom='))  || '').replace('--rom=',  '') || null,
                outDir:   (argv.find(a => a.startsWith('--out='))  || '').replace('--out=',  '') || null,
                jobs:     (argv.find(a => a.startsWith('--jobs=')) || '').replace('--jobs=', '') || null,
                fullRom:  doFullRom,
            },
            randOpts: {
                debug:      isDebug,
                rebalance:  !argv.includes('--no-balance'),
                difficulty: (argv.find(a => a.startsWith('--difficulty=')) || '').replace('--difficulty=', '') || null,
                seed:       (argv.find(a => a.startsWith('--seed='))       || '').replace('--seed=',       '') || null,
                fullRom:    doFullRom,
            },
        };
    }

    // Interactive
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('\nPokémon Emerald ROM Maker');
    console.log('=========================');

    const debugStr = await ask(rl, 'Debug mode? (y/n) [n]: ');
    const debug    = debugStr.trim().toLowerCase() === 'y';

    const cleanStr = await ask(rl, 'Run \'make clean\' first? (y/n) [n]: ');
    const clean    = cleanStr.trim().toLowerCase() === 'y';

    const fullRomStr = await ask(rl, 'Emit full ROM (.gba) instead of a BPS patch? (y/n) [n]: ');
    const fullRom    = fullRomStr.trim().toLowerCase() === 'y';

    console.log('\nSource:');
    console.log('  1  Bundle JSON  — apply pre-generated randomizer data, then compile');
    console.log('  2  Randomize    — randomize fresh, then compile');
    const srcStr = await ask(rl, 'Choose [1]: ');
    const srcChoice = srcStr.trim() || '1';

    let mode, bundlePath, randOpts;

    if (srcChoice !== '2') {
        mode = 'bundle';
        const bpStr = await ask(rl, 'Path to bundle JSON: ');
        bundlePath = path.resolve(bpStr.trim());
    } else {
        mode = 'randomize';
        const rebalanceStr  = await ask(rl, 'Rebalance stats? (y/n) [y]: ');
        const difficultyStr = await ask(rl, 'Difficulty (1-13, or easy/fair/hard) [7]: ');
        const seedStr       = await ask(rl, 'Seed (blank = random): ');
        randOpts = {
            debug,
            rebalance:  rebalanceStr.trim().toLowerCase() !== 'n',
            difficulty: difficultyStr.trim() || null,
            seed:       seedStr.trim() || null,
            fullRom,
        };
    }

    rl.close();
    return { mode, bundlePath, isDebug: debug, doClean: clean, bundleOpts: { fullRom }, randOpts };
}

// ── Entry point ──────────────────────────────────────────────────────────────

async function main() {
    checkDataClean();
    const opts = await parseOpts();

    process.on('SIGINT', () => process.exit(130));

    if (opts.mode === 'bundle') {
        const bo = opts.bundleOpts || {};
        await bundleMode(opts.bundlePath, opts.isDebug, opts.doClean, {
            romIndex: bo.romIndex != null ? parseInt(bo.romIndex, 10) : null,
            outDir:   bo.outDir ? path.resolve(bo.outDir) : null,
            jobs:     bo.jobs ? parseInt(bo.jobs, 10) : resolveJobs(),
            fullRom:  !!bo.fullRom,
        });
    } else {
        await randomizeMode(opts.randOpts, opts.doClean);
    }
}

// Run only when invoked directly, so the backend/tests can `require` the builders.
if (require.main === module) {
    main().catch(err => {
        console.error(`\nPipeline failed: ${err.message}`);
        process.exit(1);
    });
}

module.exports = { buildOneRom, bundleMode, resolveJobs, romFileName, resolveArtifact, resolveRomSeed, resolveTrainingBaseSeed };
