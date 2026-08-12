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
const { resolveSeeds, deriveSeed, romSeed: deriveRomSeed, trainerBaseSeed } = require('./seeds');
const { runPokedexModule } = require('./modules/pokedexModule');
const { runTrainersModule } = require('./modules/trainersModule');
const { runStartersModule } = require('./modules/startersModule');
const { runWildModule, addTradeMegaEvos } = require('./modules/wildModule');
const wildData = require('./wild');
const { selectTrades, TRADERS } = require('./trades');
const { writerDocs } = require('./writerDocs');
const { applyEvoLevels } = require('./evoLevelWriter');
const { stoneUnlockLevel } = require('./bossCaps');   // B-067 — stone availability, from the caps SSOT
const { buildStarterNaming } = require('./modules/starterNames');
const { buildLocationNaming, buildTradeNaming } = require('./modules/locationNames');
const { WILD_ROUTE_LOCATIONS, STATIC_LOCATIONS, GIFT_LOCATIONS } = require('./data/encounterLocations');
const { noopDiagnostics, setActiveDiagnostics, clearActiveDiagnostics } = require('./diagnostics');
const { noopTeamAudit } = require('./teamAudit');
const { createProgressTracker } = require('./progress');   // T-276 — the weighted progress model

// Create a pokedex and roll its dynamic evolution levels EXACTLY ONCE, here, when the
// pokedex is born. applyEvoLevels mutates each evo.param in place, so the levels become a
// fixed property of this pokedex — used by every ROM's trainer resolution (writerDocs) and
// serialized verbatim into the bundle, so the ROM build writes those same levels. Rolling
// them per ROM inside writerDocs (under the per-ROM rng.seed) was B-017: a shared pokedex got
// re-rolled every ROM but serialized only once (last roll), so teams were validated against
// levels the bundle didn't keep — yielding illegal evolved mons and divergent shared teams.
async function makePokedex(mcfg, baseData, hooks = {}) {
    // T-276 — `onProgress` (optional) reports the pokédex's own long passes, which are ~68% of a run.
    const pokedex = await runPokedexModule(mcfg, baseData, { onProgress: hooks.onProgress });
    // T-052 — the adjustment is tunable through `evoLevels`; T-275 — it is NOT optional: every run
    // rebalances the levels, so a legacy config still carrying `enabled: false` is simply ignored.
    const evoConfig = mcfg.evoLevels || {};
    // B-067 — clamp every stone gate to the level the player first holds a stone at, derived from the
    // caps SSOT (src/caps.c → pokedex.capLevels) rather than hardcoded here.
    applyEvoLevels(pokedex.pokes, evoConfig, { stoneUnlockLevel: stoneUnlockLevel(pokedex.capLevels) });
    return pokedex;
}

// T-068 — when the starter-nickname feature is on, decide per-ROM nicknames + coin genders and
// attach them as the per-ROM `starterNaming` artifact (always per-ROM, never shared). `romDescriptors`
// carries the {player, run} used to compute sharing groups. No-op when the feature is off, so a
// feature-off bundle is byte-identical to before. `usedByGroup` (T-200) threads the shared without-
// replacement pool so starter names never collide with location/gift/trade names.
function attachStarterNaming(cfg, mcfg, roms, romDescriptors, usedByGroup) {
    const nicknames = mcfg.nicknames;
    if (!nicknames || !nicknames.enabled) return;
    const extraCount = roms.reduce((max, r) => {
        const list = r.artifacts.wild && r.artifacts.wild.extraStarters;
        return Math.max(max, Array.isArray(list) ? list.length : 0);
    }, 0);
    if (extraCount === 0 && !nicknames.includeStarter) return;
    const naming = buildStarterNaming({ nicknames, roms: romDescriptors, extraCount, seed: cfg.seed, usedByGroup });
    roms.forEach((rom, i) => { rom.artifacts.starterNaming = naming[i]; });
}

// T-070/T-200 — map-keyed location nicknames (same pools/settings as starters). Two independent toggles
// feed the single `locationNaming` artifact (a MAP_*-keyed C table): `autoLocation` covers wild routes +
// statics; `autoTradesGifts` (default ON) covers the gift maps. No-op when both are off, so a feature-off
// bundle is byte-identical. `usedByGroup` (T-200) shares the without-replacement pool for global uniqueness.
function attachLocationNaming(cfg, mcfg, roms, romDescriptors, usedByGroup) {
    const nicknames = mcfg.nicknames;
    if (!nicknames || !nicknames.enabled) return;
    const keys = [];
    if (nicknames.autoLocation === true) keys.push(...WILD_ROUTE_LOCATIONS, ...STATIC_LOCATIONS);
    if (nicknames.autoTradesGifts !== false) keys.push(...GIFT_LOCATIONS);
    if (keys.length === 0) return;
    const naming = buildLocationNaming({ nicknames, locations: keys, roms: romDescriptors, seed: cfg.seed, usedByGroup });
    roms.forEach((rom, i) => { rom.artifacts.locationNaming = naming[i]; });
}

// T-200 — town-trade nicknames (not map-keyed; keyed by ingameTradeId). Gated by `autoTradesGifts`
// (default ON). Attached as the per-ROM `tradeNaming` artifact. `usedByGroup` shares the global pool.
function attachTradeNaming(cfg, mcfg, roms, romDescriptors, usedByGroup) {
    const nicknames = mcfg.nicknames;
    if (!nicknames || !nicknames.enabled || nicknames.autoTradesGifts === false) return;
    const tradeIds = TRADERS.map((t) => t.ingameTradeId);
    const naming = buildTradeNaming({ nicknames, trades: tradeIds, roms: romDescriptors, seed: cfg.seed, usedByGroup });
    roms.forEach((rom, i) => { rom.artifacts.tradeNaming = naming[i]; });
}

// T-200 — one orchestrator so starters, locations/gifts and trades all draw from a SINGLE shared
// without-replacement pool per sharing group (no auto-nickname repeats anywhere in a ROM). Draw order is
// fixed (starters → locations → trades) for determinism.
function attachAutoNaming(cfg, mcfg, roms, romDescriptors) {
    const nicknames = mcfg.nicknames;
    if (!nicknames || !nicknames.enabled) return;
    const usedByGroup = new Map();
    attachStarterNaming(cfg, mcfg, roms, romDescriptors, usedByGroup);
    attachLocationNaming(cfg, mcfg, roms, romDescriptors, usedByGroup);
    attachTradeNaming(cfg, mcfg, roms, romDescriptors, usedByGroup);
}

function bundle(sessionId, cfg, sharedData, roms, generatedAt) {
    // T-190 — appVersion is provenance (derived from CHANGELOG upstream), not a user config
    // option; lift it out of the stored config into a top-level field.
    const { appVersion = null, ...config } = cfg;
    return {
        formatVersion: 2,
        appVersion,
        generatedAt,
        sessionId,
        config,
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
        // T-117 — team-decision audit collector; same sibling pattern as diagnostics. Defaults to no-op.
        audit: hooks.audit || noopTeamAudit(),
        // T-276 — percentage already spent before generation began (the browser's base-data download);
        // the run's own scale starts there instead of rewinding the bar to 0.
        progressFloor: hooks.progressFloor || 0,
    };
}

// T-276 — one tracker per run: the weights live in progress.js, the per-kind counts come from the
// run type's own shape (which is exactly what used to feed the equal-weight `totalSteps`).
function trackerFor(ctx, counts) {
    return createProgressTracker({ emit: ctx.progress, flush: ctx.flush, counts, floor: ctx.progressFloor });
}

// Resolve one ROM's docs. Seeds the RNG to romSeed (wild placeholders + evo levels),
// then defers to writerDocs. showExactPositions flows from the module config.
async function computeRomDocs(mcfg, pokedex, trainers, starters, wild, romSeed, trainingBaseSeed, diag, audit, trades, onProgress) {
    rng.seed(romSeed);
    return writerDocs(pokedex, trainers, starters, wild, trainingBaseSeed, {
        // T-163 — full docs-visibility object (writerDocs normalizes + derives showExactPositions).
        docsVisibility: mcfg.docsVisibility,
        showExactPositions: mcfg.showExactPositions,   // back-compat shim for callers that still set it
        diag,
        audit,
        trades,   // T-194 — town trades, attached to the route encounter cards.
        onProgress,   // T-276 — per-trainer progress; resolving the teams is ~32% of a run.
    });
}

// T-194/T-269 — decide the 15 town trades for one ROM. Deterministic per ROM (its own local RNG seeded
// from romSeed), stored in the bundle artifact and fed to the docs, so docs and the built ROM always
// agree. The gifts then join the run's mega pool, so a traded family generates its stone like a wild
// one (owner's note with the rework) — done here, before the docs read the pool.
function computeTrades(pokedex, wild, romSeed, diag) {
    const trades = selectTrades({
        pokemonList: pokedex.pokes,
        wildArtifact: wild,
        wildMaps: wildData.maps,
        capLevels: pokedex.capLevels,
        moves: pokedex.moves,
        seed: (romSeed >>> 0),
        diagnostics: diag,
    });
    addTradeMegaEvos(wild, trades, pokedex.pokes);
    return trades;
}

async function generateDefault(cfg, mcfg, sessionId, ctx) {
    const { baseData } = ctx;
    const prog = trackerFor(ctx, { pokedex: 1, trainers: 1, starters: 1, wild: 1, docs: 1 });

    const pokedex  = await prog.run('pokedex',  'Generating Pokédex...',         (onProgress) => makePokedex(mcfg, baseData, { onProgress }));
    const trainers = await prog.run('trainers', 'Generating trainer teams...',   async () => runTrainersModule(pokedex, mcfg));
    const starters = await prog.run('starters', 'Generating starters...',        async () => runStartersModule(pokedex.pokes, { quality: mcfg.starterQuality }));
    const wild     = await prog.run('wild',     'Generating wild encounters...', async () => runWildModule(pokedex.pokes, starters, wildData, mcfg));

    // Base seed policy differs per caller (worker: cfg.seed; backend: null). romSeed is
    // cfg.seed for the single ROM; computeRomDocs reseeds it before writerDocs.
    const baseSeed = ctx.defaultBaseSeed !== undefined ? ctx.defaultBaseSeed : cfg.seed;
    // The trades belong to this unit of work: they are decided from the wild plan and then read by
    // the docs, so they share the docs slice of the bar.
    const { trades, docs } = await prog.run('docs', 'Building docs...', async (onProgress) => {
        const trades = computeTrades(pokedex, wild, cfg.seed, ctx.diagnostics);
        const docs = await computeRomDocs(mcfg, pokedex, trainers, starters, wild, cfg.seed, baseSeed, ctx.diagnostics, ctx.audit, trades, onProgress);
        return { trades, docs };
    });

    const roms = [{
        romIndex: 0,
        artifacts: { pokedex, trainers, starters, wild, trades },
        docs,
    }];
    attachAutoNaming(cfg, mcfg, roms, [{ player: 0, run: 0 }]);
    prog.finish('Done');
    return bundle(sessionId, cfg, {}, roms, ctx.generatedAt);
}

async function generateNuzlocke(cfg, mcfg, sessionId, ctx) {
    const { baseData, unsharedTrainingBaseSeed, runSeed, universeSeed } = ctx;
    const { numROMs, shared } = cfg;
    // T-276 — how many units of each kind this run will really do. A shared subsystem runs once and
    // is amortized over every ROM; an unshared one runs per ROM. `shared.trainers`/`shared.starters`
    // only take effect when the pokédex is shared too (that is what the loops below branch on).
    const prog = trackerFor(ctx, {
        pokedex:  shared.pokedex ? 1 : numROMs,
        trainers: shared.trainers && shared.pokedex ? 1 : numROMs,
        starters: shared.starters && shared.pokedex ? 1 : numROMs,
        wild: numROMs,
        docs: numROMs,
    });

    let sharedPokedex  = null;
    let sharedTrainers = null;
    let sharedStarters = null;

    // T-189 — the shared block is a pure function of universeSeed.
    rng.seed(universeSeed);
    if (shared.pokedex) {
        sharedPokedex = await prog.run('pokedex', 'Generating shared Pokédex...', (onProgress) => makePokedex(mcfg, baseData, { onProgress }));
    }
    if (shared.trainers && sharedPokedex) {
        sharedTrainers = await prog.run('trainers', 'Generating shared trainer teams...', async () => runTrainersModule(sharedPokedex, mcfg));
    }
    if (shared.starters && sharedPokedex) {
        sharedStarters = await prog.run('starters', 'Generating shared starters...', async () => runStartersModule(sharedPokedex.pokes, { quality: mcfg.starterQuality }));
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

        // T-189 — per-ROM subsystems (any unshared template + wild) are a pure function of
        // runSeed, so reusing a universe with a fresh runSeed rerolls them without touching
        // the shared world.
        rng.seed(deriveRomSeed(runSeed, i));

        let pokedex = sharedPokedex;
        if (!pokedex) {
            pokedex = await prog.run('pokedex', `Generating Pokédex${label}...`, (onProgress) => makePokedex(mcfg, baseData, { onProgress }));
        }

        let trainers = sharedTrainers;
        if (!trainers) {
            trainers = await prog.run('trainers', `Generating trainer teams${label}...`, async () => runTrainersModule(pokedex, mcfg));
        }

        let starters = sharedStarters;
        if (!starters) {
            starters = await prog.run('starters', `Generating starters${label}...`, async () => runStartersModule(pokedex.pokes, { quality: mcfg.starterQuality }));
        }

        const wild = await prog.run('wild', `Generating wild encounters${label}...`, async () => runWildModule(pokedex.pokes, starters, wildData, mcfg));

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
        const { pokedex, trainers, starters, wild } = romArtifacts[i];
        const romSeed = deriveRomSeed(runSeed, i);
        const trainingBaseSeed = shared.trainers ? universeSeed : unsharedTrainingBaseSeed(romSeed);
        await prog.run('docs', `Building viewer${label}...`, async (onProgress) => {
            const trades = computeTrades(pokedex, wild, romSeed, ctx.diagnostics);
            roms[i].artifacts.trades = trades;
            roms[i].docs = await computeRomDocs(mcfg, pokedex, trainers, starters, wild, romSeed, trainingBaseSeed, ctx.diagnostics, ctx.audit, trades, onProgress);
        });
    }

    attachAutoNaming(cfg, mcfg, roms, romDescriptors);
    prog.finish('Done');
    return bundle(sessionId, cfg, sharedData, roms, ctx.generatedAt);
}

async function generateSoullink(cfg, mcfg, sessionId, ctx) {
    const { baseData, unsharedTrainingBaseSeed, runSeed, universeSeed } = ctx;
    const { numPlayers, romsPerPlayer, playerShared, romShared } = cfg;
    const totalROMs = numPlayers * romsPerPlayer;

    // How many times each subsystem will run: once globally, once per player, or once per ROM,
    // exactly as the three levels of sharing below decide. T-276 weights each of those counts by
    // what the subsystem costs (progress.js), so the bar tracks the run's real shape.
    const globalPdxSteps  = playerShared.pokedex  ? 1 : 0;
    const globalTrSteps   = playerShared.trainers  ? 1 : 0;
    const globalStSteps   = playerShared.starters  ? 1 : 0;
    const perPlayerPdxSteps = !playerShared.pokedex  && romShared.pokedex  ? numPlayers : 0;
    const perPlayerTrSteps  = !playerShared.trainers && romShared.trainers ? numPlayers : 0;
    const perPlayerStSteps  = !playerShared.starters && romShared.starters ? numPlayers : 0;
    const perRomPdxSteps  = !playerShared.pokedex  && !romShared.pokedex  ? totalROMs : 0;
    const perRomTrSteps   = !playerShared.trainers && !romShared.trainers ? totalROMs : 0;
    const perRomStSteps   = !playerShared.starters && !romShared.starters ? totalROMs : 0;

    const prog = trackerFor(ctx, {
        pokedex:  globalPdxSteps + perPlayerPdxSteps + perRomPdxSteps,
        trainers: globalTrSteps  + perPlayerTrSteps  + perRomTrSteps,
        starters: globalStSteps  + perPlayerStSteps  + perRomStSteps,
        wild: totalROMs,   // always per-ROM
        docs: totalROMs,
    });

    // Global shared modules (across all players).
    let globalPokedex  = null;
    let globalTrainers = null;
    let globalStarters = null;

    // T-189 — the global shared block (across all players) is a pure function of universeSeed.
    rng.seed(universeSeed);
    if (playerShared.pokedex) {
        globalPokedex = await prog.run('pokedex', 'Generating shared Pokédex (all players)...', (onProgress) => makePokedex(mcfg, baseData, { onProgress }));
    }
    if (playerShared.trainers && globalPokedex) {
        globalTrainers = await prog.run('trainers', 'Generating shared trainer teams (all players)...', async () => runTrainersModule(globalPokedex, mcfg));
    }
    if (playerShared.starters && globalPokedex) {
        globalStarters = await prog.run('starters', 'Generating shared starters (all players)...', async () => runStartersModule(globalPokedex.pokes, { quality: mcfg.starterQuality }));
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

        // T-189 — a player's shared block is part of the universe (reproducible with it),
        // scoped per player.
        rng.seed(deriveSeed(universeSeed, p));
        if (!playerShared.pokedex && romShared.pokedex) {
            playerPokedex = await prog.run('pokedex', `Generating Pokédex for ${pl}...`, (onProgress) => makePokedex(mcfg, baseData, { onProgress }));
            playerEntry.pokedex = playerPokedex;
        }
        if (!playerShared.trainers && romShared.trainers && playerPokedex) {
            playerTrainers = await prog.run('trainers', `Generating trainer teams for ${pl}...`, async () => runTrainersModule(playerPokedex, mcfg));
            playerEntry.trainers = playerTrainers;
        }
        if (!playerShared.starters && romShared.starters && playerPokedex) {
            playerStarters = await prog.run('starters', `Generating starters for ${pl}...`, async () => runStartersModule(playerPokedex.pokes, { quality: mcfg.starterQuality }));
            playerEntry.starters = playerStarters;
        }

        playersSharedData.push(playerEntry);

        for (let r = 0; r < romsPerPlayer; r++) {
            const rl = `ROM ${r + 1}/${romsPerPlayer}`;

            // T-189 — per-ROM subsystems (unshared templates + wild) are a pure function of
            // runSeed and the global ROM index.
            rng.seed(deriveRomSeed(runSeed, romIndex));

            let pokedex  = playerPokedex;
            let trainers = playerTrainers;
            let starters = playerStarters;

            if (!playerShared.pokedex && !romShared.pokedex) {
                pokedex = await prog.run('pokedex', `Generating Pokédex for ${pl} ${rl}...`, (onProgress) => makePokedex(mcfg, baseData, { onProgress }));
            }
            if (!playerShared.trainers && !romShared.trainers && pokedex) {
                trainers = await prog.run('trainers', `Generating trainer teams for ${pl} ${rl}...`, async () => runTrainersModule(pokedex, mcfg));
            }
            if (!playerShared.starters && !romShared.starters && pokedex) {
                starters = await prog.run('starters', `Generating starters for ${pl} ${rl}...`, async () => runStartersModule(pokedex.pokes, { quality: mcfg.starterQuality }));
            }

            const wild = await prog.run('wild', `Generating wild encounters for ${pl} ${rl}...`, async () => runWildModule(pokedex.pokes, starters, wildData, mcfg));

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
    //   romSeed = deriveRomSeed(runSeed, i) — per-ROM (wild placeholder RNG + evo reads).
    //   trainingBaseSeed (per-slot trainer reseeding) via seeds.trainerBaseSeed:
    //     global trainers  → universeSeed               (same for all ROMs/players)
    //     player trainers  → deriveSeed(universeSeed, p) (same within a player's ROMs)
    //     per-ROM trainers → caller policy (worker: romSeed; backend: null)
    for (let i = 0; i < roms.length; i++) {
        const rom = roms[i];
        const label = `player ${(rom.playerIndex ?? 0) + 1} ROM ${rom.romIndex + 1}`;
        const { pokedex, trainers, starters, wild } = romArtifacts[i];
        const romSeed = deriveRomSeed(runSeed, i);
        const trainingBaseSeed = trainerBaseSeed(rom.artifacts.trainers, {
            universeSeed,
            unshared: unsharedTrainingBaseSeed(romSeed),
        });
        await prog.run('docs', `Building viewer for ${label}...`, async (onProgress) => {
            const trades = computeTrades(pokedex, wild, romSeed, ctx.diagnostics);
            roms[i].artifacts.trades = trades;
            roms[i].docs = await computeRomDocs(mcfg, pokedex, trainers, starters, wild, romSeed, trainingBaseSeed, ctx.diagnostics, ctx.audit, trades, onProgress);
        });
    }

    attachAutoNaming(cfg, mcfg, roms, romDescriptors);
    prog.finish('Done');
    return bundle(sessionId, cfg, sharedData, roms, ctx.generatedAt);
}

// Entry point. Seeds the RNG from cfg.seed, then dispatches by run type.
// cfg:       frontend config (already carries a resolved numeric seed)
// mcfg:      module config (difficulty, rebalance, showExactPositions, …)
// sessionId: bundle session id (caller-generated)
// hooks:     { progress, flush, baseData, defaultBaseSeed, unsharedTrainingBaseSeed, generatedAt }
async function runGeneration(cfg, mcfg, sessionId, hooks = {}) {
    const ctx = resolveContext(hooks);
    // T-189 — resolve the two-tier seeds. runSeed is the existing `seed` field (drives
    // per-ROM content); universeSeed seeds the shared block and falls back to runSeed when
    // the user did not pin a universe. Seed the RNG from universeSeed so the shared block
    // (built first) is a pure function of universeSeed.
    const { runSeed, universeSeed } = resolveSeeds(cfg);
    ctx.runSeed = runSeed;
    ctx.universeSeed = universeSeed;
    rng.seed(universeSeed);

    // Persist the resolved universe seed in the bundle config so it can be reused to extend
    // the same world; `default` runs have no shared universe.
    const cfgOut = { ...cfg, universeSeed: cfg.runType === 'default' ? null : universeSeed };

    // T-075 — make the sink ambient for the whole run so deep helpers (utils.js, rating.js)
    // can record without threading it through every signature. Cleared in finally.
    setActiveDiagnostics(ctx.diagnostics);
    try {
        if (cfg.runType === 'default')  return await generateDefault(cfgOut, mcfg, sessionId, ctx);
        if (cfg.runType === 'nuzlocke') return await generateNuzlocke(cfgOut, mcfg, sessionId, ctx);
        if (cfg.runType === 'soullink') return await generateSoullink(cfgOut, mcfg, sessionId, ctx);
        throw new Error(`Unknown runType: ${cfg.runType}`);
    } finally {
        clearActiveDiagnostics();
    }
}

// `computeTrades` is exported so any caller that assembles a ROM's artifacts outside runGeneration
// (the visual-test docs fixture) decides the trades — and grows the mega pool — the SAME way,
// instead of re-deriving the call and drifting (T-269: its copy forgot the move database, so the
// fixture's gifts arrived with no TMs).
// `makePokedex` is exported as the seam that pins the one thing every run must do to a fresh pokédex:
// roll its evolution levels (T-275 — no longer optional, so the wiring itself is what needs a test).
module.exports = { runGeneration, generateDefault, generateNuzlocke, generateSoullink, bundle, computeTrades, makePokedex, attachStarterNaming, attachLocationNaming, attachTradeNaming, attachAutoNaming };
