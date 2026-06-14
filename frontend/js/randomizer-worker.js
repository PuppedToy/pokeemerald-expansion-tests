'use strict';
// Web Worker entry point — all randomization runs in the browser.
// No DOM access; no API calls to /api/generate/*. Bundled by build.js via esbuild.

const rng          = require('../../randomizer/rng.js');
const { runPokedexModule } = require('../../randomizer/modules/pokedexModule.js');
const { runTrainersModule } = require('../../randomizer/modules/trainersModule.js');
const { runStartersModule } = require('../../randomizer/modules/startersModule.js');
const { runWildModule }     = require('../../randomizer/modules/wildModule.js');
const wildData              = require('../../randomizer/wild.js');
const { writerDocs }        = require('../../randomizer/writerDocs.js');

// Pre-cooked base data loaded once from /data/base-data.json
let baseData = null;

self.onmessage = async ({ data: { type, config } }) => {
    if (type !== 'generate') return;
    try {
        if (!baseData) {
            post('progress', 2, 'Loading base data...');
            baseData = await fetch('/data/base-data.json').then(r => {
                if (!r.ok) throw new Error(`Failed to load base data: ${r.status}`);
                return r.json();
            });
        }

        if (config.seed == null) {
            config = { ...config, seed: (Math.random() * 0xFFFFFFFF) >>> 0 };
        }

        const bundle = await runGeneration(config);
        self.postMessage({ type: 'done', bundle });
    } catch (err) {
        self.postMessage({ type: 'error', message: err.message });
    }
};

function post(type, pct, step) {
    self.postMessage({ type, pct, step });
}

function uuid() {
    return self.crypto.randomUUID();
}

function toModuleConfig(cfg) {
    return {
        seed: cfg.seed,
        difficulty: cfg.difficulty ?? 7,
        rebalance: cfg.rebalance !== false,
        balanceChance: cfg.balanceChance ?? 0.2,
        allTms: false,
        showExactPositions: cfg.showExactPositions === true,
    };
}

async function runGeneration(cfg) {
    rng.seed(cfg.seed);
    const mcfg = toModuleConfig(cfg);
    const sessionId = uuid();

    if (cfg.runType === 'default')  return generateDefault(cfg, mcfg, sessionId);
    if (cfg.runType === 'nuzlocke') return generateNuzlocke(cfg, mcfg, sessionId);
    if (cfg.runType === 'soullink') return generateSoullink(cfg, mcfg, sessionId);
    throw new Error(`Unknown runType: ${cfg.runType}`);
}

// ── Run-type handlers ─────────────────────────────────────────────────────────

async function generateDefault(cfg, mcfg, sessionId) {
    const totalSteps = 5; // 4 modules + 1 docs
    let done = 0;
    const tick = (step) => post('progress', Math.round((++done / totalSteps) * 100), step);

    post('progress', 0, 'Generating Pokédex...');
    const pokedex  = await runPokedexModule(mcfg, baseData); tick('Generating trainer teams...');
    const trainers = runTrainersModule(pokedex, mcfg);       tick('Generating starters...');
    const starters = runStartersModule(pokedex.pokes);       tick('Generating wild encounters...');
    const wild     = runWildModule(pokedex.pokes, starters, wildData); tick('Building docs...');

    rng.seed(cfg.seed);
    // Base seed must be non-null so the in-game ordering layer (shuffle + lead logic)
    // runs deterministically; the bundle is the single source of truth for the ROM.
    const docs = await writerDocs(pokedex, trainers, starters, wild, cfg.seed, { showExactPositions: mcfg.showExactPositions });
    tick('Done');

    return bundle(sessionId, cfg, {}, [{ romIndex: 0, artifacts: { pokedex, trainers, starters, wild }, docs }]);
}

async function generateNuzlocke(cfg, mcfg, sessionId) {
    const { numROMs, shared } = cfg;
    const sharedSteps = (shared.pokedex ? 1 : 0) + (shared.trainers ? 1 : 0) + (shared.starters ? 1 : 0);
    const perRomSteps = 1 + (shared.pokedex ? 0 : 1) + (shared.trainers ? 0 : 1) + (shared.starters ? 0 : 1);
    const totalSteps = sharedSteps + numROMs * perRomSteps + numROMs;
    let done = 0;
    const tick = (step) => post('progress', Math.round((++done / totalSteps) * 100), step);

    post('progress', 0, 'Starting generation...');

    let sharedPokedex  = null;
    let sharedTrainers = null;
    let sharedStarters = null;

    if (shared.pokedex) {
        post('progress', Math.round((done / totalSteps) * 100), 'Generating shared Pokédex...');
        sharedPokedex = await runPokedexModule(mcfg, baseData); tick('Shared Pokédex ready');
    }
    if (shared.trainers && sharedPokedex) {
        post('progress', Math.round((done / totalSteps) * 100), 'Generating shared trainer teams...');
        sharedTrainers = runTrainersModule(sharedPokedex, mcfg); tick('Shared trainer teams ready');
    }
    if (shared.starters && sharedPokedex) {
        post('progress', Math.round((done / totalSteps) * 100), 'Generating shared starters...');
        sharedStarters = runStartersModule(sharedPokedex.pokes); tick('Shared starters ready');
    }

    const sharedData = {};
    if (sharedPokedex)  sharedData.pokedex  = sharedPokedex;
    if (sharedTrainers) sharedData.trainers = sharedTrainers;
    if (sharedStarters) sharedData.starters = sharedStarters;

    const roms = [];
    const romArtifacts = [];

    for (let i = 0; i < numROMs; i++) {
        const label = numROMs > 1 ? ` (ROM ${i + 1}/${numROMs})` : '';
        let pokedex = sharedPokedex;
        if (!pokedex) {
            post('progress', Math.round((done / totalSteps) * 100), `Generating Pokédex${label}...`);
            pokedex = await runPokedexModule(mcfg, baseData); tick(`Pokédex${label} ready`);
        }
        let trainers = sharedTrainers;
        if (!trainers) {
            post('progress', Math.round((done / totalSteps) * 100), `Generating trainer teams${label}...`);
            trainers = runTrainersModule(pokedex, mcfg); tick(`Trainer teams${label} ready`);
        }
        let starters = sharedStarters;
        if (!starters) {
            post('progress', Math.round((done / totalSteps) * 100), `Generating starters${label}...`);
            starters = runStartersModule(pokedex.pokes); tick(`Starters${label} ready`);
        }
        post('progress', Math.round((done / totalSteps) * 100), `Generating wild encounters${label}...`);
        const wild = runWildModule(pokedex.pokes, starters, wildData); tick(`Wild${label} ready`);

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

    // Compute docs per ROM
    for (let i = 0; i < numROMs; i++) {
        const label = numROMs > 1 ? ` (ROM ${i + 1}/${numROMs})` : '';
        post('progress', Math.round((done / totalSteps) * 100), `Building docs${label}...`);
        const { pokedex, trainers, starters, wild } = romArtifacts[i];
        const romSeed = (cfg.seed ^ (i * 0x9E3779B9)) >>> 0;
        // Shared trainers reuse cfg.seed so the same trainer orders identically across ROMs;
        // non-shared trainers get a deterministic per-ROM seed (never null — the ordering
        // layer must always run).
        const trainingBaseSeed = shared.trainers ? cfg.seed : romSeed;
        rng.seed(romSeed);
        roms[i].docs = await writerDocs(pokedex, trainers, starters, wild, trainingBaseSeed, { showExactPositions: mcfg.showExactPositions });
        tick(`Docs${label} ready`);
    }

    return bundle(sessionId, cfg, sharedData, roms);
}

async function generateSoullink(cfg, mcfg, sessionId) {
    const { numPlayers, romsPerPlayer, playerShared, romShared } = cfg;
    const totalROMs = numPlayers * romsPerPlayer;

    const globalPdxSteps  = playerShared.pokedex  ? 1 : 0;
    const globalTrSteps   = playerShared.trainers  ? 1 : 0;
    const globalStSteps   = playerShared.starters  ? 1 : 0;
    const perPlayerPdxSteps = !playerShared.pokedex  && romShared.pokedex  ? numPlayers : 0;
    const perPlayerTrSteps  = !playerShared.trainers && romShared.trainers ? numPlayers : 0;
    const perPlayerStSteps  = !playerShared.starters && romShared.starters ? numPlayers : 0;
    const perRomPdxSteps  = !playerShared.pokedex  && !romShared.pokedex  ? totalROMs : 0;
    const perRomTrSteps   = !playerShared.trainers && !romShared.trainers ? totalROMs : 0;
    const perRomStSteps   = !playerShared.starters && !romShared.starters ? totalROMs : 0;
    const totalSteps = globalPdxSteps + globalTrSteps + globalStSteps
        + perPlayerPdxSteps + perPlayerTrSteps + perPlayerStSteps
        + perRomPdxSteps + perRomTrSteps + perRomStSteps
        + (totalROMs * 2); // wild + docs per ROM

    let done = 0;
    const tick = (step) => post('progress', Math.round((++done / totalSteps) * 100), step);

    post('progress', 0, 'Starting Soul-Link generation...');

    let globalPokedex  = null;
    let globalTrainers = null;
    let globalStarters = null;

    if (playerShared.pokedex) {
        post('progress', Math.round((done / totalSteps) * 100), 'Generating shared Pokédex (all players)...');
        globalPokedex = await runPokedexModule(mcfg, baseData); tick('Shared Pokédex ready');
    }
    if (playerShared.trainers && globalPokedex) {
        post('progress', Math.round((done / totalSteps) * 100), 'Generating shared trainer teams...');
        globalTrainers = runTrainersModule(globalPokedex, mcfg); tick('Shared trainer teams ready');
    }
    if (playerShared.starters && globalPokedex) {
        post('progress', Math.round((done / totalSteps) * 100), 'Generating shared starters...');
        globalStarters = runStartersModule(globalPokedex.pokes); tick('Shared starters ready');
    }

    const sharedData = {};
    if (globalPokedex)  sharedData.pokedex  = globalPokedex;
    if (globalTrainers) sharedData.trainers = globalTrainers;
    if (globalStarters) sharedData.starters = globalStarters;

    const roms = [];
    const romArtifacts = [];
    const playersSharedData = [];
    let romIndex = 0;

    for (let p = 0; p < numPlayers; p++) {
        const pl = `player ${p + 1}/${numPlayers}`;
        const playerEntry = { playerIndex: p };
        let playerPokedex  = globalPokedex;
        let playerTrainers = globalTrainers;
        let playerStarters = globalStarters;

        if (!playerShared.pokedex && romShared.pokedex) {
            post('progress', Math.round((done / totalSteps) * 100), `Generating Pokédex for ${pl}...`);
            playerPokedex = await runPokedexModule(mcfg, baseData); tick(`Pokédex for ${pl} ready`);
            playerEntry.pokedex = playerPokedex;
        }
        if (!playerShared.trainers && romShared.trainers && playerPokedex) {
            post('progress', Math.round((done / totalSteps) * 100), `Generating trainer teams for ${pl}...`);
            playerTrainers = runTrainersModule(playerPokedex, mcfg); tick(`Trainer teams for ${pl} ready`);
            playerEntry.trainers = playerTrainers;
        }
        if (!playerShared.starters && romShared.starters && playerPokedex) {
            post('progress', Math.round((done / totalSteps) * 100), `Generating starters for ${pl}...`);
            playerStarters = runStartersModule(playerPokedex.pokes); tick(`Starters for ${pl} ready`);
            playerEntry.starters = playerStarters;
        }
        playersSharedData.push(playerEntry);

        for (let r = 0; r < romsPerPlayer; r++) {
            const rl = `ROM ${r + 1}/${romsPerPlayer}`;
            let pokedex  = playerPokedex;
            let trainers = playerTrainers;
            let starters = playerStarters;

            if (!playerShared.pokedex && !romShared.pokedex) {
                post('progress', Math.round((done / totalSteps) * 100), `Generating Pokédex for ${pl} ${rl}...`);
                pokedex = await runPokedexModule(mcfg, baseData); tick('Pokédex ready');
            }
            if (!playerShared.trainers && !romShared.trainers && pokedex) {
                post('progress', Math.round((done / totalSteps) * 100), `Generating trainer teams for ${pl} ${rl}...`);
                trainers = runTrainersModule(pokedex, mcfg); tick('Trainer teams ready');
            }
            if (!playerShared.starters && !romShared.starters && pokedex) {
                post('progress', Math.round((done / totalSteps) * 100), `Generating starters for ${pl} ${rl}...`);
                starters = runStartersModule(pokedex.pokes); tick('Starters ready');
            }

            post('progress', Math.round((done / totalSteps) * 100), `Generating wild encounters for ${pl} ${rl}...`);
            const wild = runWildModule(pokedex.pokes, starters, wildData); tick('Wild ready');

            const resolveArtifact = (artifact, key) => {
                if (playerShared[key]) return 'global';
                if (romShared[key])    return `player-${p}`;
                return artifact;
            };
            romArtifacts.push({ pokedex, trainers, starters, wild });
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

    if (playersSharedData.some(p => Object.keys(p).length > 1)) {
        sharedData.players = playersSharedData;
    }

    // Compute docs per ROM
    for (let i = 0; i < roms.length; i++) {
        const rom = roms[i];
        const label = `player ${(rom.playerIndex ?? 0) + 1} ROM ${rom.romIndex + 1}`;
        post('progress', Math.round((done / totalSteps) * 100), `Building docs for ${label}...`);
        const { pokedex, trainers, starters, wild } = romArtifacts[i];
        const romSeed = (cfg.seed ^ (i * 0x9E3779B9)) >>> 0;
        const t = rom.artifacts.trainers;
        let trainingBaseSeed;
        if (t === 'global') {
            trainingBaseSeed = cfg.seed;
        } else if (typeof t === 'string' && t.startsWith('player-')) {
            trainingBaseSeed = (cfg.seed ^ (parseInt(t.split('-')[1], 10) * 0x9E3779B9)) >>> 0;
        } else {
            // Per-ROM (non-shared) trainers: deterministic per-ROM seed, never null —
            // the in-game ordering layer must always run.
            trainingBaseSeed = romSeed;
        }
        rng.seed(romSeed);
        roms[i].docs = await writerDocs(pokedex, trainers, starters, wild, trainingBaseSeed, { showExactPositions: mcfg.showExactPositions });
        tick(`Docs ready (${label})`);
    }

    return bundle(sessionId, cfg, sharedData, roms);
}

// ── Bundle builder ────────────────────────────────────────────────────────────

function bundle(sessionId, cfg, sharedData, roms) {
    return {
        formatVersion: 2,
        generatedAt: new Date().toISOString(),
        sessionId,
        config: { ...cfg },
        sharedData,
        roms,
    };
}
