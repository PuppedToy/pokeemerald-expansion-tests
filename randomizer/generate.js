'use strict';

// Single source of truth for bundle generation orchestration.
//
// The browser Web Worker (frontend/js/randomizer-worker.cjs) and the server-side
// generator (backend/generator.js) both delegate here so the generation algorithm
// exists exactly once. Anything that must differ per caller (progress transport,
// base-data source, and a couple of historical seed policies) is injected via the
// `hooks` argument — the algorithm itself is identical for every caller and for the
// determinism tests, which import this module directly.
//
// Callers pass a fully-formed module config (`mcfg`) and `sessionId`, so per-caller
// config policy (difficulty default, showExactPositions, …) stays in the adapter.

const rng = require('./rng');
const { runPokedexModule } = require('./modules/pokedexModule');
const { runTrainersModule } = require('./modules/trainersModule');
const { runStartersModule } = require('./modules/startersModule');
const { runWildModule } = require('./modules/wildModule');
const wildData = require('./wild');
const { writerDocs } = require('./writerDocs');
const { applyEvoLevels } = require('./evoLevelWriter');
const { buildStarterNaming } = require('./modules/starterNames');
const { buildLocationNaming } = require('./modules/locationNames');
const { ENCOUNTER_LOCATIONS } = require('./data/encounterLocations');
const { noopDiagnostics, setActiveDiagnostics, clearActiveDiagnostics } = require('./diagnostics');

// Create a pokedex and roll its dynamic evolution levels EXACTLY ONCE, here, when the
// pokedex is born. applyEvoLevels mutates each evo.param in place, so the levels become a
// fixed property of this pokedex — used by every ROM's trainer resolution (writerDocs) and
// serialized verbatim into the bundle, so the ROM build writes those same levels. Rolling
// them per ROM inside writerDocs (under the per-ROM rng.seed) was B-017: a shared pokedex got
// re-rolled every ROM but serialized only once (last roll), so teams were validated against
// levels the bundle didn't keep — yielding illegal evolved mons and divergent shared teams.
async function makePokedex(mcfg, baseData) {
    const pokedex = await runPokedexModule(mcfg, baseData);
    // T-052 — evolution-level adjustment is now optional + tunable. When disabled, base-game
    // evolution levels are left untouched; when enabled (default) the config tunes the algorithm.
    const evoConfig = mcfg.evoLevels || {};
    if (evoConfig.enabled !== false) applyEvoLevels(pokedex.pokes, evoConfig);
    return pokedex;
}

// T-068 — when the starter-nickname feature is on, decide per-ROM nicknames + coin genders and
// attach them as the per-ROM `starterNaming` artifact (always per-ROM, never shared). `romDescriptors`
// carries the {player, run} used to compute sharing groups. No-op when the feature is off, so a
// feature-off bundle is byte-identical to before.
function attachStarterNaming(cfg, mcfg, roms, romDescriptors) {
    const nicknames = mcfg.nicknames;
    if (!nicknames || !nicknames.enabled) return;
    const extraCount = roms.reduce((max, r) => {
        const list = r.artifacts.wild && r.artifacts.wild.extraStarters;
        return Math.max(max, Array.isArray(list) ? list.length : 0);
    }, 0);
    if (extraCount === 0 && !nicknames.includeStarter) return;
    const naming = buildStarterNaming({ nicknames, roms: romDescriptors, extraCount, seed: cfg.seed });
    roms.forEach((rom, i) => { rom.artifacts.starterNaming = naming[i]; });
}

// T-070 — location-based nicknames are part of the shared `nicknames` feature (same pools/settings as
// starters), gated by its master toggle + the `autoLocation` switch. Decides a per-location nickname
// (+ optional locked gender) for every encounter map and attaches it as the per-ROM `locationNaming`
// artifact (always per-ROM, never shared). No-op when off, so a feature-off bundle is byte-identical.
function attachLocationNaming(cfg, mcfg, roms, romDescriptors) {
    const nicknames = mcfg.nicknames;
    if (!nicknames || !nicknames.enabled || !nicknames.autoLocation) return;
    const naming = buildLocationNaming({ nicknames, locations: ENCOUNTER_LOCATIONS, roms: romDescriptors, seed: cfg.seed });
    roms.forEach((rom, i) => { rom.artifacts.locationNaming = naming[i]; });
}

function bundle(sessionId, cfg, sharedData, roms, generatedAt) {
    return {
        formatVersion: 2,
        generatedAt,
        sessionId,
        config: { ...cfg },
        sharedData,
        roms,
    };
}

// Resolve the hooks object into a concrete context, with defaults matching the
// canonical (browser worker) behavior. Callers override only what they need.
function resolveContext(hooks) {
    return {
        // Progress transport. (pct:number, step:string) => void
        progress: hooks.progress || (() => {}),
        // Between-step yield (server streams progress over the socket here). () => Promise
        flush: hooks.flush || (async () => {}),
        // Pre-parsed base data (browser). null → runPokedexModule reads game files (node mode).
        baseData: hooks.baseData || null,
        // baseRngSeed for the single-ROM `default` run: worker uses cfg.seed, backend uses null.
        defaultBaseSeed: 'defaultBaseSeed' in hooks ? hooks.defaultBaseSeed : undefined,
        // baseRngSeed for per-ROM (non-shared) trainers: worker uses romSeed, backend uses null.
        unsharedTrainingBaseSeed: hooks.unsharedTrainingBaseSeed || ((romSeed) => romSeed),
        generatedAt: hooks.generatedAt || new Date().toISOString(),
        // T-075 — structured diagnostics sink; the worker injects a real one and reads it back
        // AFTER the run (as a bundle sibling, never inside the bundle). Defaults to no-op.
        diagnostics: hooks.diagnostics || noopDiagnostics(),
    };
}

// Resolve one ROM's docs. Seeds the RNG to romSeed (wild placeholders + evo levels),
// then defers to writerDocs. showExactPositions flows from the module config.
async function computeRomDocs(mcfg, pokedex, trainers, starters, wild, romSeed, trainingBaseSeed, diag) {
    rng.seed(romSeed);
    return writerDocs(pokedex, trainers, starters, wild, trainingBaseSeed, {
        showExactPositions: mcfg.showExactPositions,
        diag,
    });
}

async function generateDefault(cfg, mcfg, sessionId, ctx) {
    const { progress, flush, baseData } = ctx;
    const totalSteps = 5; // 4 modules + 1 docs
    let done = 0;
    const tick = (step) => progress(Math.round((++done / totalSteps) * 100), step);

    progress(0, 'Generating Pokédex...');
    const pokedex  = await makePokedex(mcfg, baseData); tick('Generating trainer teams...'); await flush();
    const trainers = runTrainersModule(pokedex, mcfg);       tick('Generating starters...'); await flush();
    const starters = runStartersModule(pokedex.pokes, { quality: mcfg.starterQuality });       tick('Generating wild encounters...'); await flush();
    const wild     = runWildModule(pokedex.pokes, starters, wildData, mcfg); tick('Building docs...'); await flush();

    // Base seed policy differs per caller (worker: cfg.seed; backend: null). romSeed is
    // cfg.seed for the single ROM; computeRomDocs reseeds it before writerDocs.
    const baseSeed = ctx.defaultBaseSeed !== undefined ? ctx.defaultBaseSeed : cfg.seed;
    const docs = await computeRomDocs(mcfg, pokedex, trainers, starters, wild, cfg.seed, baseSeed, ctx.diagnostics);
    tick('Done'); await flush();

    const roms = [{
        romIndex: 0,
        artifacts: { pokedex, trainers, starters, wild },
        docs,
    }];
    attachStarterNaming(cfg, mcfg, roms, [{ player: 0, run: 0 }]);
    attachLocationNaming(cfg, mcfg, roms, [{ player: 0, run: 0 }]);
    return bundle(sessionId, cfg, {}, roms, ctx.generatedAt);
}

async function generateNuzlocke(cfg, mcfg, sessionId, ctx) {
    const { progress, flush, baseData, unsharedTrainingBaseSeed } = ctx;
    const { numROMs, shared } = cfg;
    const sharedSteps = (shared.pokedex ? 1 : 0) + (shared.trainers ? 1 : 0) + (shared.starters ? 1 : 0);
    const perRomSteps = 1 + (shared.pokedex ? 0 : 1) + (shared.trainers ? 0 : 1) + (shared.starters ? 0 : 1);
    const totalSteps = sharedSteps + numROMs * perRomSteps + numROMs; // +numROMs for docs
    let done = 0;
    const tick = (step) => progress(Math.round((++done / totalSteps) * 100), step);

    progress(0, 'Starting generation...');

    let sharedPokedex  = null;
    let sharedTrainers = null;
    let sharedStarters = null;

    if (shared.pokedex) {
        progress(Math.round((done / totalSteps) * 100), 'Generating shared Pokédex...');
        sharedPokedex = await makePokedex(mcfg, baseData); tick('Pokédex ready'); await flush();
    }
    if (shared.trainers && sharedPokedex) {
        progress(Math.round((done / totalSteps) * 100), 'Generating shared trainer teams...');
        sharedTrainers = runTrainersModule(sharedPokedex, mcfg); tick('Trainer teams ready'); await flush();
    }
    if (shared.starters && sharedPokedex) {
        progress(Math.round((done / totalSteps) * 100), 'Generating shared starters...');
        sharedStarters = runStartersModule(sharedPokedex.pokes, { quality: mcfg.starterQuality }); tick('Starters ready'); await flush();
    }

    const sharedData = {};
    if (sharedPokedex)  sharedData.pokedex  = sharedPokedex;
    if (sharedTrainers) sharedData.trainers = sharedTrainers;
    if (sharedStarters) sharedData.starters = sharedStarters;

    const roms = [];
    const romArtifacts = []; // resolved objects needed for docs (not stored in bundle)
    const romDescriptors = []; // {player, run} for starter-name sharing groups (T-068)

    for (let i = 0; i < numROMs; i++) {
        const label = numROMs > 1 ? ` (ROM ${i + 1}/${numROMs})` : '';
        romDescriptors.push({ player: 0, run: i });

        let pokedex = sharedPokedex;
        if (!pokedex) {
            progress(Math.round((done / totalSteps) * 100), `Generating Pokédex${label}...`);
            pokedex = await makePokedex(mcfg, baseData); tick(`Pokédex${label} ready`); await flush();
        }

        let trainers = sharedTrainers;
        if (!trainers) {
            progress(Math.round((done / totalSteps) * 100), `Generating trainer teams${label}...`);
            trainers = runTrainersModule(pokedex, mcfg); tick(`Trainer teams${label} ready`); await flush();
        }

        let starters = sharedStarters;
        if (!starters) {
            progress(Math.round((done / totalSteps) * 100), `Generating starters${label}...`);
            starters = runStartersModule(pokedex.pokes, { quality: mcfg.starterQuality }); tick(`Starters${label} ready`); await flush();
        }

        progress(Math.round((done / totalSteps) * 100), `Generating wild encounters${label}...`);
        const wild = runWildModule(pokedex.pokes, starters, wildData, mcfg); tick(`Wild encounters${label} ready`); await flush();

        romArtifacts.push({ pokedex, trainers, starters, wild });
        roms.push({
            romIndex: i,
            artifacts: {
                pokedex:  sharedPokedex  ? 'shared' : pokedex,
                trainers: sharedTrainers ? 'shared' : trainers,
                starters: sharedStarters ? 'shared' : starters,
                wild,
            },
        });
    }

    for (let i = 0; i < numROMs; i++) {
        const label = numROMs > 1 ? ` (ROM ${i + 1}/${numROMs})` : '';
        progress(Math.round((done / totalSteps) * 100), `Building viewer${label}...`);
        const { pokedex, trainers, starters, wild } = romArtifacts[i];
        const romSeed = (cfg.seed ^ (i * 0x9E3779B9)) >>> 0;
        const trainingBaseSeed = shared.trainers ? cfg.seed : unsharedTrainingBaseSeed(romSeed);
        roms[i].docs = await computeRomDocs(mcfg, pokedex, trainers, starters, wild, romSeed, trainingBaseSeed, ctx.diagnostics);
        tick(`Viewer ready${label}`); await flush();
    }

    attachStarterNaming(cfg, mcfg, roms, romDescriptors);
    attachLocationNaming(cfg, mcfg, roms, romDescriptors);
    return bundle(sessionId, cfg, sharedData, roms, ctx.generatedAt);
}

async function generateSoullink(cfg, mcfg, sessionId, ctx) {
    const { progress, flush, baseData, unsharedTrainingBaseSeed } = ctx;
    const { numPlayers, romsPerPlayer, playerShared, romShared } = cfg;
    const totalROMs = numPlayers * romsPerPlayer;

    // Count total module calls for the progress denominator.
    const globalPdxSteps  = playerShared.pokedex  ? 1 : 0;
    const globalTrSteps   = playerShared.trainers  ? 1 : 0;
    const globalStSteps   = playerShared.starters  ? 1 : 0;
    const perPlayerPdxSteps = !playerShared.pokedex  && romShared.pokedex  ? numPlayers : 0;
    const perPlayerTrSteps  = !playerShared.trainers && romShared.trainers ? numPlayers : 0;
    const perPlayerStSteps  = !playerShared.starters && romShared.starters ? numPlayers : 0;
    const perRomPdxSteps  = !playerShared.pokedex  && !romShared.pokedex  ? totalROMs : 0;
    const perRomTrSteps   = !playerShared.trainers && !romShared.trainers ? totalROMs : 0;
    const perRomStSteps   = !playerShared.starters && !romShared.starters ? totalROMs : 0;
    const wildSteps = totalROMs; // always per-ROM

    const totalSteps = globalPdxSteps + globalTrSteps + globalStSteps
        + perPlayerPdxSteps + perPlayerTrSteps + perPlayerStSteps
        + perRomPdxSteps + perRomTrSteps + perRomStSteps
        + wildSteps
        + totalROMs; // +totalROMs for docs

    let done = 0;
    const tick = (step) => progress(Math.round((++done / totalSteps) * 100), step);

    progress(0, 'Starting Soul-Link generation...');

    // Global shared modules (across all players).
    let globalPokedex  = null;
    let globalTrainers = null;
    let globalStarters = null;

    if (playerShared.pokedex) {
        progress(Math.round((done / totalSteps) * 100), 'Generating shared Pokédex (all players)...');
        globalPokedex = await makePokedex(mcfg, baseData); tick('Shared Pokédex ready'); await flush();
    }
    if (playerShared.trainers && globalPokedex) {
        progress(Math.round((done / totalSteps) * 100), 'Generating shared trainer teams (all players)...');
        globalTrainers = runTrainersModule(globalPokedex, mcfg); tick('Shared trainer teams ready'); await flush();
    }
    if (playerShared.starters && globalPokedex) {
        progress(Math.round((done / totalSteps) * 100), 'Generating shared starters (all players)...');
        globalStarters = runStartersModule(globalPokedex.pokes, { quality: mcfg.starterQuality }); tick('Shared starters ready'); await flush();
    }

    const sharedData = {};
    if (globalPokedex)  sharedData.pokedex  = globalPokedex;
    if (globalTrainers) sharedData.trainers = globalTrainers;
    if (globalStarters) sharedData.starters = globalStarters;

    const roms = [];
    const romArtifacts = []; // resolved objects needed for docs
    const romDescriptors = []; // {player, run} for starter-name sharing groups (T-068)
    const playersSharedData = [];
    let romIndex = 0;

    for (let p = 0; p < numPlayers; p++) {
        const pl = `player ${p + 1}/${numPlayers}`;
        const playerEntry = { playerIndex: p };

        // Per-player shared modules (between a player's ROMs, not globally).
        let playerPokedex  = globalPokedex;
        let playerTrainers = globalTrainers;
        let playerStarters = globalStarters;

        if (!playerShared.pokedex && romShared.pokedex) {
            progress(Math.round((done / totalSteps) * 100), `Generating Pokédex for ${pl}...`);
            playerPokedex = await makePokedex(mcfg, baseData); tick(`Pokédex for ${pl} ready`); await flush();
            playerEntry.pokedex = playerPokedex;
        }
        if (!playerShared.trainers && romShared.trainers && playerPokedex) {
            progress(Math.round((done / totalSteps) * 100), `Generating trainer teams for ${pl}...`);
            playerTrainers = runTrainersModule(playerPokedex, mcfg); tick(`Trainer teams for ${pl} ready`); await flush();
            playerEntry.trainers = playerTrainers;
        }
        if (!playerShared.starters && romShared.starters && playerPokedex) {
            progress(Math.round((done / totalSteps) * 100), `Generating starters for ${pl}...`);
            playerStarters = runStartersModule(playerPokedex.pokes, { quality: mcfg.starterQuality }); tick(`Starters for ${pl} ready`); await flush();
            playerEntry.starters = playerStarters;
        }

        playersSharedData.push(playerEntry);

        for (let r = 0; r < romsPerPlayer; r++) {
            const rl = `ROM ${r + 1}/${romsPerPlayer}`;

            let pokedex  = playerPokedex;
            let trainers = playerTrainers;
            let starters = playerStarters;

            if (!playerShared.pokedex && !romShared.pokedex) {
                progress(Math.round((done / totalSteps) * 100), `Generating Pokédex for ${pl} ${rl}...`);
                pokedex = await makePokedex(mcfg, baseData); tick(`Pokédex ready`); await flush();
            }
            if (!playerShared.trainers && !romShared.trainers && pokedex) {
                progress(Math.round((done / totalSteps) * 100), `Generating trainer teams for ${pl} ${rl}...`);
                trainers = runTrainersModule(pokedex, mcfg); tick(`Trainer teams ready`); await flush();
            }
            if (!playerShared.starters && !romShared.starters && pokedex) {
                progress(Math.round((done / totalSteps) * 100), `Generating starters for ${pl} ${rl}...`);
                starters = runStartersModule(pokedex.pokes, { quality: mcfg.starterQuality }); tick(`Starters ready`); await flush();
            }

            progress(Math.round((done / totalSteps) * 100), `Generating wild encounters for ${pl} ${rl}...`);
            const wild = runWildModule(pokedex.pokes, starters, wildData, mcfg); tick(`Wild encounters ready`); await flush();

            const resolveArtifact = (artifact, key) => {
                if (playerShared[key]) return 'global';
                if (romShared[key])    return `player-${p}`;
                return artifact;
            };

            romArtifacts.push({ pokedex, trainers, starters, wild });
            romDescriptors.push({ player: p, run: r });
            roms.push({
                romIndex: romIndex++,
                playerIndex: p,
                artifacts: {
                    pokedex:  resolveArtifact(pokedex,  'pokedex'),
                    trainers: resolveArtifact(trainers, 'trainers'),
                    starters: resolveArtifact(starters, 'starters'),
                    wild,
                },
            });
        }
    }

    if (playersSharedData.some(pe => Object.keys(pe).length > 1)) {
        sharedData.players = playersSharedData;
    }

    // Phase 2: compute docs for each ROM.
    //   romSeed is always unique per ROM (wild placeholder RNG must differ).
    //   trainingBaseSeed drives per-slot trainer reseeding:
    //     global trainers  → cfg.seed  (same for all ROMs/players)
    //     player trainers  → player-derived seed (same within a player's ROMs)
    //     per-ROM trainers → caller policy (worker: romSeed; backend: null)
    for (let i = 0; i < roms.length; i++) {
        const rom = roms[i];
        const label = `player ${(rom.playerIndex ?? 0) + 1} ROM ${rom.romIndex + 1}`;
        progress(Math.round((done / totalSteps) * 100), `Building viewer for ${label}...`);
        const { pokedex, trainers, starters, wild } = romArtifacts[i];
        const romSeed = (cfg.seed ^ (i * 0x9E3779B9)) >>> 0;
        const t = rom.artifacts.trainers;
        let trainingBaseSeed;
        if (t === 'global') {
            trainingBaseSeed = cfg.seed;
        } else if (typeof t === 'string' && t.startsWith('player-')) {
            const pi = parseInt(t.split('-')[1], 10);
            trainingBaseSeed = (cfg.seed ^ (pi * 0x9E3779B9)) >>> 0;
        } else {
            trainingBaseSeed = unsharedTrainingBaseSeed(romSeed);
        }
        roms[i].docs = await computeRomDocs(mcfg, pokedex, trainers, starters, wild, romSeed, trainingBaseSeed, ctx.diagnostics);
        tick(`Viewer ready (${label})`); await flush();
    }

    attachStarterNaming(cfg, mcfg, roms, romDescriptors);
    attachLocationNaming(cfg, mcfg, roms, romDescriptors);
    return bundle(sessionId, cfg, sharedData, roms, ctx.generatedAt);
}

// Entry point. Seeds the RNG from cfg.seed, then dispatches by run type.
// cfg:       frontend config (already carries a resolved numeric seed)
// mcfg:      module config (difficulty, rebalance, showExactPositions, …)
// sessionId: bundle session id (caller-generated)
// hooks:     { progress, flush, baseData, defaultBaseSeed, unsharedTrainingBaseSeed, generatedAt }
async function runGeneration(cfg, mcfg, sessionId, hooks = {}) {
    const ctx = resolveContext(hooks);
    rng.seed(cfg.seed);

    // T-075 — make the sink ambient for the whole run so deep helpers (utils.js, rating.js)
    // can record without threading it through every signature. Cleared in finally.
    setActiveDiagnostics(ctx.diagnostics);
    try {
        if (cfg.runType === 'default')  return await generateDefault(cfg, mcfg, sessionId, ctx);
        if (cfg.runType === 'nuzlocke') return await generateNuzlocke(cfg, mcfg, sessionId, ctx);
        if (cfg.runType === 'soullink') return await generateSoullink(cfg, mcfg, sessionId, ctx);
        throw new Error(`Unknown runType: ${cfg.runType}`);
    } finally {
        clearActiveDiagnostics();
    }
}

module.exports = { runGeneration, generateDefault, generateNuzlocke, generateSoullink, bundle, attachStarterNaming, attachLocationNaming };
