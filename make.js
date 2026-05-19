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
 *   node make.js --debug
 *   node make.js --clean        (runs 'make clean' before the first make)
 */

const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
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

// ── Bundle mode ──────────────────────────────────────────────────────────────

async function bundleMode(bundlePath, isDebug, doClean) {
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
    const outDir    = path.join(root, 'roms', sessionId);
    fs.mkdirSync(outDir, { recursive: true });

    const rng    = require('./randomizer/rng');
    const writer = require('./randomizer/writer');

    console.log(`Session:   ${sessionId}`);
    console.log(`ROMs:      ${bundle.roms.length}`);
    console.log(`Seed:      ${seed}`);
    console.log(`Output:    ${outDir}`);

    if (doClean) run('make', ['clean']);

    for (const rom of bundle.roms) {
        const label = romFileName(rom);
        console.log(`\n${'─'.repeat(64)}`);
        console.log(`ROM ${rom.romIndex + 1} / ${bundle.roms.length}  →  ${label}`);
        console.log('─'.repeat(64));

        const pokedex  = resolveArtifact(rom.artifacts.pokedex,  bundle.sharedData, 'pokedex');
        const trainers = resolveArtifact(rom.artifacts.trainers, bundle.sharedData, 'trainers');
        const starters = resolveArtifact(rom.artifacts.starters, bundle.sharedData, 'starters');
        const wild     = rom.artifacts.wild;

        const missing = ['pokedex','trainers','starters','wild'].filter(k => !({ pokedex, trainers, starters, wild }[k]));
        if (missing.length) throw new Error(`ROM ${rom.romIndex}: missing artifacts after resolution: ${missing.join(', ')}`);

        // Seed RNG: shared-trainer ROMs use baseSeed so tier-based slots are identical;
        // per-ROM trainer ROMs use a unique derived seed.
        rng.seed(resolveRomSeed(rom, seed));

        try {
            await writer(pokedex, trainers, starters, wild, isDebug, resolveTrainingBaseSeed(rom, seed));
            run('make', ['-j']);

            const dest = path.join(outDir, label);
            fs.copyFileSync(ROM_SRC, dest);
            console.log(`\n  ✓  Saved: ${dest}`);
        } finally {
            restore();
        }
    }

    console.log(`\n${'='.repeat(64)}`);
    console.log(`Done! ${bundle.roms.length} ROM(s) in:`);
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

    try {
        const pokedex  = await runPokedexModule(config);
        const trainers = runTrainersModule(pokedex, config);
        const starters = runStartersModule(pokedex.pokes);
        const wild     = runWildModule(pokedex.pokes, starters, wildData);

        await writer(pokedex, trainers, starters, wild, opts.debug);
        run('make', ['-j']);

        const dest = path.join(outDir, `rom-${config.seed}.gba`);
        fs.copyFileSync(ROM_SRC, dest);
        console.log(`\n  ✓  Saved: ${dest}`);
    } finally {
        restore();
    }

    console.log(`\n  Done! ROM saved to: ${path.join(outDir, `rom-${config.seed}.gba`)}`);
}

// ── Argument parsing + interactive prompts ───────────────────────────────────

async function parseOpts() {
    const argv = process.argv.slice(2);

    const bundleFlag  = argv.find(a => a.startsWith('--bundle='));
    const doRandomize = argv.includes('--randomize');
    const isDebug     = argv.includes('--debug');
    const doClean     = argv.includes('--clean');

    if (bundleFlag || doRandomize) {
        return {
            mode:       bundleFlag ? 'bundle' : 'randomize',
            bundlePath: bundleFlag ? path.resolve(bundleFlag.replace('--bundle=', '')) : null,
            isDebug,
            doClean,
            randOpts: {
                debug:      isDebug,
                rebalance:  !argv.includes('--no-balance'),
                difficulty: (argv.find(a => a.startsWith('--difficulty=')) || '').replace('--difficulty=', '') || null,
                seed:       (argv.find(a => a.startsWith('--seed='))       || '').replace('--seed=',       '') || null,
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
        };
    }

    rl.close();
    return { mode, bundlePath, isDebug: debug, doClean: clean, randOpts };
}

// ── Entry point ──────────────────────────────────────────────────────────────

async function main() {
    checkDataClean();
    const opts = await parseOpts();

    process.on('SIGINT', () => process.exit(130));

    if (opts.mode === 'bundle') {
        await bundleMode(opts.bundlePath, opts.isDebug, opts.doClean);
    } else {
        await randomizeMode(opts.randOpts, opts.doClean);
    }
}

main().catch(err => {
    console.error(`\nPipeline failed: ${err.message}`);
    process.exit(1);
});
