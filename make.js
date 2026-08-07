#!/usr/bin/env node
'use strict';

/**
 * make.js — ROM production pipeline.
 *
 * Reads a pre-generated session bundle JSON and produces one artifact per entry by **injecting** the
 * bundle's data into the prebuilt base ROM (seconds, no `make`, no source mutation). Injection reads its
 * base from `base/pokeemerald.{gba,map,sym}` (override with INJECT_BASE_ROM / INJECT_BASE_MAP /
 * INJECT_BASE_SYM) and refuses to emit a ROM while any injector module is still pending, since those
 * outputs would silently keep their base values.
 *
 *   node make.js --bundle=./path/to/bundle.json
 *   node make.js --bundle=… --rom=2 --out=./dir   (one ROM of the bundle — the backend's per-ROM unit)
 *   node make.js --bundle=… --full-rom            (full .gba instead of the default BPS patch — ADR-013)
 *   node make.js --bundle=… --debug
 *
 * The old compile-per-user path (write game files → `make` → restore) was decommissioned in **T-244**:
 * `compileOneRom` survives ONLY as the reference GATE-3 measures injection against
 * (`backend/build/golden-corpus/parity.mjs --compile-each`, the `verify-corpus` skill), and it refuses to
 * run unless `--compile` / `ROM_BUILD_MODE=compile` asks for it by name. Nothing in the delivery path can
 * reach it. See randomizer/docs/injection.md, docs/base-plus-injection-strategy.md and
 * docs/adr/ADR-023-injection-verified-by-data-equivalence.md.
 */

const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const root    = __dirname;
const ROM_SRC = path.join(root, 'pokeemerald.gba');

// ── Guards ───────────────────────────────────────────────────────────────────

const { BUILD_MODES, resolveBuildMode, isCompileExplicitlyRequested } = require('./randomizer/injector/mode');

// The compile path mutates data/maps/ — a dirty data/ would be silently lost by its restore().
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

// Injection mutates nothing, so it needs no restore — but it READS the base's own sources (item prices,
// learnsets, wild slots, the .party files: randomizer/docs/injection.md "Deriving writes from the compile
// path"). If a crashed run left those files randomized, injection would write a *previous* run's values
// into the base and call it a fresh ROM. So the inputs must match the build the base came from.
// Tracked modifications only: an untracked file under src/ is not an input the injector reads (T-244).
function checkInjectInputsClean() {
    const result = spawnSync('git', ['status', '--porcelain', '--untracked-files=no', 'src/', 'include/', 'data/maps/'], {
        cwd: root, shell: process.platform === 'win32', encoding: 'utf8',
    });
    const dirty = (result.stdout || '').trim();
    if (dirty) {
        console.error('\nERROR: injection reads the base\'s own sources and they are modified — the base ROM and\n'
            + 'these files would disagree. Restore them first (git checkout -- src/ include/ data/maps/):\n' + dirty);
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

// ── Bundle sentinel resolution ───────────────────────────────────────────────

// T-249 — which artifacts a ROM gets and which seed it is built under live in
// randomizer/injector/romData.js: the browser injector needs the same answers, and the seed
// decides values the writers re-derive, so there is exactly one copy. The seed derivations
// themselves are randomizer/seeds.js, shared with generate.js (T-189).
const {
    injectionDataFor, resolveArtifact, resolveRomSeed, resolveTrainingBaseSeed,
} = require('./randomizer/injector/romData');

function romFileName(rom) {
    if (rom.playerIndex !== undefined) {
        return `player-${rom.playerIndex}-rom-${rom.romIndex}.gba`;
    }
    return `rom-${rom.romIndex}.gba`;
}

// ── Injection path (T-238) ───────────────────────────────────────────────────

/** Where the prebuilt base and its symbol files live. The `.map`/`.sym` MUST be from that exact build. */
function resolveBasePaths({ env = process.env, root: repoRoot = root } = {}) {
    return {
        romPath: env.INJECT_BASE_ROM || path.join(repoRoot, 'base', 'pokeemerald.gba'),
        mapPath: env.INJECT_BASE_MAP || path.join(repoRoot, 'base', 'pokeemerald.map'),
        symPath: env.INJECT_BASE_SYM || path.join(repoRoot, 'base', 'pokeemerald.sym'),
    };
}

/**
 * Produce one ROM by writing the bundle's data into the prebuilt base — no source mutation, no `make`,
 * so no `restore()` either. Same artifact contract as the compile path (BPS by default, ADR-013).
 */
async function injectOneRom({
    rom, bundle, seed, universeSeed = seed, outDir, fullRom = false,
    allowPending = false, basePaths = resolveBasePaths(), modules = undefined, baseSources = null,
}) {
    const rng = require('./randomizer/rng');
    const { loadBase, injectRom, loadOffsetMap } = require('./randomizer/injector');
    const { emitArtifact, resolveVanillaPath } = require('./randomizer/romArtifact');

    const label = romFileName(rom);
    const { data, romSeed } = injectionDataFor({ rom, bundle, seed, universeSeed });

    fs.mkdirSync(outDir, { recursive: true });

    // Same seeding as the compile path: injection changes the OUTPUT SINK, never the values.
    rng.seed(romSeed);

    const { rom: baseRom, offsetMap: mapOnly } = loadBase({ romPath: basePaths.romPath, mapPath: basePaths.mapPath });
    // Local script labels (the Group-D setvar sites) only exist in the .sym — merge it when present.
    const offsetMap = basePaths.symPath && fs.existsSync(basePaths.symPath)
        ? mapOnly.merge(loadOffsetMap(basePaths.symPath))
        : mapOnly;

    const { applied, pending, journal } = injectRom({
        rom: baseRom, offsetMap, data, allowPending, log: (msg) => console.log(`  · ${msg}`),
        // null → the modules read the base's sources off the tree (T-249). A caller with no tree (a
        // browser, an offline box) passes the baked artifact instead; the bytes are the same either way.
        baseSources,
        // Defaults to the real registry; a harness can drive the wiring with its own module set.
        ...(modules ? { modules } : {}),
    });

    const vanillaPath = fullRom ? null : resolveVanillaPath(root);
    const dest = emitArtifact({ builtRomBuffer: baseRom.toBuffer(), outDir, label, fullRom, vanillaPath });
    console.log(`\n  ✓  Injected ${applied.length} module(s), ${baseRom.bytesWritten} bytes → ${dest}`);
    if (pending.length) console.log(`  ⚠  ${pending.length} module(s) still pending: ${pending.map(m => m.task).join(', ')}`);
    return { dest, applied, pending, journal, sha256: baseRom.sha256() };
}

// ── Single-ROM build — the unit the backend queue drives (T-030) ──────────────

/**
 * Produce one ROM. Injection unless the compile path was asked for **by name** (`--compile` /
 * ROM_BUILD_MODE=compile), which only the GATE-3 harness does — T-244. Callers that know the mode pass it
 * in; the default resolution is there so a bare `require('make.js').buildOneRom(...)` still injects.
 */
async function buildOneRom({ rom, bundle, seed, universeSeed = seed, outDir, isDebug = false, jobs = resolveJobs(), fullRom = false, mode = resolveBuildMode() }) {
    if (mode === BUILD_MODES.COMPILE) {
        return compileOneRom({ rom, bundle, seed, universeSeed, outDir, isDebug, jobs, fullRom });
    }
    const result = await injectOneRom({ rom, bundle, seed, universeSeed, outDir, fullRom });
    return result.dest;
}

/**
 * The decommissioned compile path (T-244) — **verification only**.
 *
 * It is not a fallback and not a delivery option: it is the reference GATE-3 measures injection against
 * (ADR-023 — data equivalence, since a compiled ROM's layout drifts with its own data, B-057). Keeping it
 * is what lets a future upstream sync or a new writer still be proven against `compile()`; what T-244
 * removed is every way of reaching it *by omission*. Hence the guard: an explicit `--compile` /
 * `ROM_BUILD_MODE=compile` (or `allowCompile: true` from an in-process harness) or it refuses.
 */
async function compileOneRom({ rom, bundle, seed, universeSeed = seed, outDir, isDebug = false, jobs = resolveJobs(), fullRom = false, allowCompile = isCompileExplicitlyRequested() }) {
    if (!allowCompile) {
        throw new Error(
            'compileOneRom is the GATE-3 reference path, not a way to deliver a ROM (T-244). '
            + 'Ask for it by name — `--compile` / ROM_BUILD_MODE=compile — or use injection.',
        );
    }
    const rng                          = require('./randomizer/rng');
    const writer                       = require('./randomizer/writer');
    const { writeTMsFromList }          = require('./randomizer/tmRandomizer');
    const { writeItemFilesFromBundle }  = require('./randomizer/itemRandomizer');
    const { writeMoney }                = require('./randomizer/moneyWriter');
    const { writeItemPrices }           = require('./randomizer/itemPriceWriter');
    const { writeMoveRelearnerPrice }   = require('./randomizer/moveRelearnerPriceWriter');
    const { writeLeagueRules }          = require('./randomizer/leagueRulesWriter');
    const { writeRunAndBunVars }        = require('./randomizer/runAndBunWriter');
    const { writeStevenTagVar }         = require('./randomizer/stevenTagWriter');
    const { writeLocationNames }        = require('./randomizer/locationNameWriter');
    const { writeTradeNames }           = require('./randomizer/tradeNameWriter');
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
    rng.seed(resolveRomSeed(rom, seed, universeSeed));

    try {
        const runNs = writer.docRunNamespace({ seed, playerIndex: rom.playerIndex, romIndex: rom.romIndex });
        // starterNaming is per-ROM (never shared) — read it straight off the rom, no resolveArtifact (T-068).
        await writer(pokedex, trainers, starters, wild, isDebug, resolveTrainingBaseSeed(rom, seed, universeSeed), rom.docs, runNs, rom.artifacts.starterNaming || null, rom.artifacts.trades || null, rom.artifacts.locationNaming || null, rom.artifacts.tradeNaming || null);
        await writeTMsFromList(pokedex.tmList);
        writeItemFilesFromBundle(trainers.itemAssignments);
        // T-052 — patch configurable prize money into the C source (restored by restore() after build).
        await writeMoney(bundle.config?.money);
        // T-073 — patch configurable shop item prices into src/data/items.h (restored by restore()).
        await writeItemPrices(bundle.config?.prices);
        // T-167 — patch the configurable move-relearn price #define in src/move_relearner.c (restored by restore()).
        await writeMoveRelearnerPrice(bundle.config?.moveRelearnPrice);
        // T-257/T-258 — the three Pokémon League house rules (post-battle healing in the world / in the
        // gauntlet, relearner allowed in the gauntlet) into gRandomizerSettings (restored by restore()).
        await writeLeagueRules(bundle.config);
        // T-091/ADR-014 — preset the League Run & Bun mode gate + E4 quotas from the run config
        // into Sidney's room init script (restored by restore() after build).
        await writeRunAndBunVars(bundle.config);
        // T-165 — flip the Mossdeep Space Center tag-battle gate (solo Tabitha boss when the option is on;
        // restored by restore() after build).
        await writeStevenTagVar(bundle.config);
        // T-070 — per-ROM location→nickname table (per-ROM, never shared; restored by restore()).
        await writeLocationNames(rom.artifacts.locationNaming || null);
        // T-202 — per-ROM town-trade→nickname table (per-ROM, never shared; restored by restore()).
        await writeTradeNames(rom.artifacts.tradeNaming || null);
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
    const { romIndex = null, outDir: outDirOverride = null, jobs = resolveJobs(), fullRom = false, mode = resolveBuildMode() } = opts;
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

    const seed        = bundle.config?.seed ?? 0;
    const universeSeed = bundle.config?.universeSeed ?? seed;   // T-189 — pre-two-tier bundles have none
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
    if (universeSeed !== seed) console.log(`Universe:  ${universeSeed}`);
    console.log(`Output:    ${outDir}`);
    console.log(`Artifact:  ${fullRom ? 'full ROM (.gba)' : 'BPS patch (.bps, vanilla→built)'}`);
    if (mode === BUILD_MODES.COMPILE) {
        console.log(`Jobs:      make -j${jobs}`);
        console.log('Mode:      compile — GATE-3 REFERENCE PATH, not delivery (T-244)');
        if (doClean) run('make', ['clean']);
    } else {
        console.log('Mode:      inject (T-244)');
    }

    for (const rom of roms) {
        console.log(`\n${'─'.repeat(64)}`);
        console.log(`ROM ${rom.romIndex + 1} / ${bundle.roms.length}  →  ${romFileName(rom)}`);
        console.log('─'.repeat(64));
        await buildOneRom({ rom, bundle, seed, universeSeed, outDir, isDebug, jobs, fullRom, mode });
    }

    console.log(`\n${'='.repeat(64)}`);
    console.log(`Done! ${roms.length} ROM(s) in:`);
    console.log(`  ${outDir}`);
    console.log('='.repeat(64));
}

// ── Argument parsing ─────────────────────────────────────────────────────────

function parseOpts() {
    const argv = process.argv.slice(2);
    const bundleFlag = argv.find(a => a.startsWith('--bundle='));
    if (!bundleFlag) {
        throw new Error(
            'nothing to build: pass --bundle=./path/to/bundle.json.\n'
            + '(The interactive "randomize fresh, then compile" maker was decommissioned in T-244 — ROMs come\n'
            + ' from a bundle now. `node analyze.js` for analysis; backend/build/golden-corpus/generate.mjs\n'
            + ' mints a bundle from a config spec.)',
        );
    }
    return {
        bundlePath: path.resolve(bundleFlag.replace('--bundle=', '')),
        isDebug:    argv.includes('--debug'),
        doClean:    argv.includes('--clean'),
        bundleOpts: {
            romIndex: (argv.find(a => a.startsWith('--rom='))  || '').replace('--rom=',  '') || null,
            outDir:   (argv.find(a => a.startsWith('--out='))  || '').replace('--out=',  '') || null,
            jobs:     (argv.find(a => a.startsWith('--jobs=')) || '').replace('--jobs=', '') || null,
            fullRom:  argv.includes('--full-rom'),
        },
    };
}

// ── Entry point ──────────────────────────────────────────────────────────────

async function main() {
    const opts = parseOpts();
    const mode = resolveBuildMode();
    // Each path guards a different hazard: compile mutates data/maps/, injection reads src/ (see above).
    if (mode === BUILD_MODES.COMPILE) checkDataClean(); else checkInjectInputsClean();

    process.on('SIGINT', () => process.exit(130));

    const bo = opts.bundleOpts;
    await bundleMode(opts.bundlePath, opts.isDebug, opts.doClean, {
        romIndex: bo.romIndex != null ? parseInt(bo.romIndex, 10) : null,
        outDir:   bo.outDir ? path.resolve(bo.outDir) : null,
        jobs:     bo.jobs ? parseInt(bo.jobs, 10) : resolveJobs(),
        fullRom:  !!bo.fullRom,
        mode,
    });
}

// Run only when invoked directly, so the backend/tests can `require` the builders.
if (require.main === module) {
    main().catch(err => {
        console.error(`\nPipeline failed: ${err.message}`);
        process.exit(1);
    });
}

module.exports = {
    buildOneRom, compileOneRom, injectOneRom, resolveBasePaths,
    bundleMode, resolveJobs, romFileName, resolveArtifact, resolveRomSeed, resolveTrainingBaseSeed,
};
