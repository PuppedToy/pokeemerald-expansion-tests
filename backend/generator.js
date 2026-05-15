/**
 * Randomizer pipeline orchestrator.
 *
 * Mirrors randomizer/index.js but collects module artifacts into a session
 * bundle instead of writing them to game files. Progress is streamed to SSE
 * listeners as each module completes.
 *
 * CJS randomizer modules are imported via createRequire because the backend
 * package is ESM but the randomizer is CommonJS.
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { exec as _exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import crypto from 'crypto';

const exec = promisify(_exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const { runPokedexModule } = require('../randomizer/modules/pokedexModule.js');
const { runTrainersModule } = require('../randomizer/modules/trainersModule.js');
const { runStartersModule } = require('../randomizer/modules/startersModule.js');
const { runWildModule }     = require('../randomizer/modules/wildModule.js');
const wildData              = require('../randomizer/wild.js');
const rng                   = require('../randomizer/rng.js');

// ── Job store ─────────────────────────────────────────────────────────────────

const jobs = new Map();
const JOB_TTL = 60 * 60 * 1000; // 1 hour

function cleanOldJobs() {
    const cutoff = Date.now() - JOB_TTL;
    for (const [id, job] of jobs) {
        if (job.createdAt < cutoff) jobs.delete(id);
    }
}

export function createJob() {
    cleanOldJobs();
    const jobId = crypto.randomUUID();
    jobs.set(jobId, {
        status: 'pending',
        progress: 0,
        step: 'Queued...',
        result: null,
        error: null,
        createdAt: Date.now(),
        listeners: new Set(),
    });
    return jobId;
}

export function getJob(jobId) {
    return jobs.get(jobId) ?? null;
}

export function subscribe(jobId, listener) {
    const job = jobs.get(jobId);
    if (!job) return () => {};
    job.listeners.add(listener);
    return () => job.listeners.delete(listener);
}

function emit(job, event, data = {}) {
    const payload = JSON.stringify({ event, data });
    for (const fn of job.listeners) fn(payload);
}

function progress(job, pct, step) {
    job.progress = pct;
    job.step = step;
    emit(job, 'progress', { progress: pct, step });
}

// Yield the event loop so each SSE event is flushed to the socket before
// the next synchronous module call starts. Without this, all events after
// the async pokedex step arrive in one TCP burst and the browser never
// renders intermediate progress.
const flush = () => new Promise(r => setTimeout(r, 80));

// ── Config translation ────────────────────────────────────────────────────────

function toModuleConfig(cfg, seed) {
    return {
        seed: seed ?? cfg.seed,
        difficulty: cfg.difficulty ?? 'fair',
        noBalance: cfg.rebalance === false,
        balanceChance: cfg.balanceChance ?? 0.2,
        allTms: false,
    };
}

// ── Generation entry point ────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '..');

async function restoreGameFiles() {
    try {
        await exec('git checkout -- data/maps/ src/ include/', { cwd: PROJECT_ROOT });
    } catch {
        // Not fatal — files may not have changed or git may not be available
    }
}

export async function runGeneration(jobId, frontendConfig) {
    const job = jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    job.status = 'running';
    try {
        const bundle = await orchestrate(job, frontendConfig);
        job.status = 'done';
        job.progress = 100;
        job.result = bundle;
        emit(job, 'done');
    } catch (err) {
        job.status = 'error';
        job.error = err.message;
        emit(job, 'error', { message: err.message });
    } finally {
        await restoreGameFiles();
    }
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

async function orchestrate(job, cfg) {
    const baseSeed = cfg.seed ?? Math.floor(Math.random() * 0xFFFFFFFF);
    cfg = { ...cfg, seed: baseSeed };
    rng.seed(baseSeed);

    const moduleConfig = toModuleConfig(cfg, baseSeed);
    const sessionId = crypto.randomUUID();

    const { runType } = cfg;

    if (runType === 'default')   return generateDefault(job, cfg, moduleConfig, sessionId);
    if (runType === 'nuzlocke')  return generateNuzlocke(job, cfg, moduleConfig, sessionId);
    if (runType === 'soullink')  return generateSoullink(job, cfg, moduleConfig, sessionId);

    throw new Error(`Unknown runType: ${runType}`);
}

// ── Run-type handlers ─────────────────────────────────────────────────────────

async function generateDefault(job, cfg, mcfg, sessionId) {
    const totalSteps = 4;
    let done = 0;
    const tick = (step) => progress(job, Math.round((++done / totalSteps) * 100), step);

    progress(job, 0, 'Generating Pokédex...');
    const pokedex = await runPokedexModule(mcfg); tick('Generating trainer teams...'); await flush();
    const trainers = runTrainersModule(pokedex, mcfg);  tick('Generating starter choices...'); await flush();
    const starters = runStartersModule(pokedex.pokes);  tick('Generating wild encounters...'); await flush();
    const wild     = runWildModule(pokedex.pokes, starters, wildData); tick('Done'); await flush();

    return bundle(sessionId, cfg, {}, [{
        romIndex: 0,
        artifacts: { pokedex, trainers, starters, wild },
    }]);
}

async function generateNuzlocke(job, cfg, mcfg, sessionId) {
    const { numROMs, shared } = cfg;
    const sharedSteps = (shared.pokedex ? 1 : 0) + (shared.trainers ? 1 : 0) + (shared.starters ? 1 : 0);
    // per-ROM: always wild + any non-shared modules
    const perRomSteps = 1 + (shared.pokedex ? 0 : 1) + (shared.trainers ? 0 : 1) + (shared.starters ? 0 : 1);
    const totalSteps = sharedSteps + numROMs * perRomSteps;
    let done = 0;
    const tick = (step) => progress(job, Math.round((++done / totalSteps) * 100), step);

    progress(job, 0, 'Starting generation...');

    let sharedPokedex  = null;
    let sharedTrainers = null;
    let sharedStarters = null;

    if (shared.pokedex) {
        progress(job, Math.round((done / totalSteps) * 100), 'Generating shared Pokédex...');
        sharedPokedex = await runPokedexModule(mcfg); tick('Pokédex ready'); await flush();
    }
    if (shared.trainers && sharedPokedex) {
        progress(job, Math.round((done / totalSteps) * 100), 'Generating shared trainer teams...');
        sharedTrainers = runTrainersModule(sharedPokedex, mcfg); tick('Trainer teams ready'); await flush();
    }
    if (shared.starters && sharedPokedex) {
        progress(job, Math.round((done / totalSteps) * 100), 'Generating shared starters...');
        sharedStarters = runStartersModule(sharedPokedex.pokes); tick('Starters ready'); await flush();
    }

    const sharedData = {};
    if (sharedPokedex)  sharedData.pokedex  = sharedPokedex;
    if (sharedTrainers) sharedData.trainers = sharedTrainers;
    if (sharedStarters) sharedData.starters = sharedStarters;

    const roms = [];
    for (let i = 0; i < numROMs; i++) {
        const label = numROMs > 1 ? ` (ROM ${i + 1}/${numROMs})` : '';

        let pokedex = sharedPokedex;
        if (!pokedex) {
            progress(job, Math.round((done / totalSteps) * 100), `Generating Pokédex${label}...`);
            pokedex = await runPokedexModule(mcfg); tick(`Pokédex${label} ready`); await flush();
        }

        let trainers = sharedTrainers;
        if (!trainers) {
            progress(job, Math.round((done / totalSteps) * 100), `Generating trainer teams${label}...`);
            trainers = runTrainersModule(pokedex, mcfg); tick(`Trainer teams${label} ready`); await flush();
        }

        let starters = sharedStarters;
        if (!starters) {
            progress(job, Math.round((done / totalSteps) * 100), `Generating starters${label}...`);
            starters = runStartersModule(pokedex.pokes); tick(`Starters${label} ready`); await flush();
        }

        progress(job, Math.round((done / totalSteps) * 100), `Generating wild encounters${label}...`);
        const wild = runWildModule(pokedex.pokes, starters, wildData); tick(`Wild encounters${label} ready`); await flush();

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

    return bundle(sessionId, cfg, sharedData, roms);
}

async function generateSoullink(job, cfg, mcfg, sessionId) {
    const { numPlayers, romsPerPlayer, playerShared, romShared } = cfg;
    const totalROMs = numPlayers * romsPerPlayer;

    // Count total module calls
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
        + wildSteps;

    let done = 0;
    const tick = (step) => progress(job, Math.round((++done / totalSteps) * 100), step);

    progress(job, 0, 'Starting Soul-Link generation...');

    // Global shared modules
    let globalPokedex  = null;
    let globalTrainers = null;
    let globalStarters = null;

    if (playerShared.pokedex) {
        progress(job, Math.round((done / totalSteps) * 100), 'Generating shared Pokédex (all players)...');
        globalPokedex = await runPokedexModule(mcfg); tick('Shared Pokédex ready'); await flush();
    }
    if (playerShared.trainers && globalPokedex) {
        progress(job, Math.round((done / totalSteps) * 100), 'Generating shared trainer teams (all players)...');
        globalTrainers = runTrainersModule(globalPokedex, mcfg); tick('Shared trainer teams ready'); await flush();
    }
    if (playerShared.starters && globalPokedex) {
        progress(job, Math.round((done / totalSteps) * 100), 'Generating shared starters (all players)...');
        globalStarters = runStartersModule(globalPokedex.pokes); tick('Shared starters ready'); await flush();
    }

    const sharedData = {};
    if (globalPokedex)  sharedData.pokedex  = globalPokedex;
    if (globalTrainers) sharedData.trainers = globalTrainers;
    if (globalStarters) sharedData.starters = globalStarters;

    const roms = [];
    const playersSharedData = [];
    let romIndex = 0;

    for (let p = 0; p < numPlayers; p++) {
        const pl = `player ${p + 1}/${numPlayers}`;
        const playerEntry = { playerIndex: p };

        // Per-player shared modules (between a player's ROMs, not globally)
        let playerPokedex  = globalPokedex;
        let playerTrainers = globalTrainers;
        let playerStarters = globalStarters;

        if (!playerShared.pokedex && romShared.pokedex) {
            progress(job, Math.round((done / totalSteps) * 100), `Generating Pokédex for ${pl}...`);
            playerPokedex = await runPokedexModule(mcfg); tick(`Pokédex for ${pl} ready`); await flush();
            playerEntry.pokedex = playerPokedex;
        }
        if (!playerShared.trainers && romShared.trainers && playerPokedex) {
            progress(job, Math.round((done / totalSteps) * 100), `Generating trainer teams for ${pl}...`);
            playerTrainers = runTrainersModule(playerPokedex, mcfg); tick(`Trainer teams for ${pl} ready`); await flush();
            playerEntry.trainers = playerTrainers;
        }
        if (!playerShared.starters && romShared.starters && playerPokedex) {
            progress(job, Math.round((done / totalSteps) * 100), `Generating starters for ${pl}...`);
            playerStarters = runStartersModule(playerPokedex.pokes); tick(`Starters for ${pl} ready`); await flush();
            playerEntry.starters = playerStarters;
        }

        playersSharedData.push(playerEntry);

        for (let r = 0; r < romsPerPlayer; r++) {
            const rl = `ROM ${r + 1}/${romsPerPlayer}`;

            let pokedex  = playerPokedex;
            let trainers = playerTrainers;
            let starters = playerStarters;

            if (!playerShared.pokedex && !romShared.pokedex) {
                progress(job, Math.round((done / totalSteps) * 100), `Generating Pokédex for ${pl} ${rl}...`);
                pokedex = await runPokedexModule(mcfg); tick(`Pokédex ready`); await flush();
            }
            if (!playerShared.trainers && !romShared.trainers && pokedex) {
                progress(job, Math.round((done / totalSteps) * 100), `Generating trainer teams for ${pl} ${rl}...`);
                trainers = runTrainersModule(pokedex, mcfg); tick(`Trainer teams ready`); await flush();
            }
            if (!playerShared.starters && !romShared.starters && pokedex) {
                progress(job, Math.round((done / totalSteps) * 100), `Generating starters for ${pl} ${rl}...`);
                starters = runStartersModule(pokedex.pokes); tick(`Starters ready`); await flush();
            }

            progress(job, Math.round((done / totalSteps) * 100), `Generating wild encounters for ${pl} ${rl}...`);
            const wild = runWildModule(pokedex.pokes, starters, wildData); tick(`Wild encounters ready`); await flush();

            const resolveArtifact = (artifact, globalVal, playerVal, key) => {
                if (playerShared[key])            return 'global';
                if (romShared[key])               return `player-${p}`;
                return artifact;
            };

            roms.push({
                romIndex: romIndex++,
                playerIndex: p,
                artifacts: {
                    pokedex:  resolveArtifact(pokedex,  globalPokedex,  playerPokedex,  'pokedex'),
                    trainers: resolveArtifact(trainers, globalTrainers, playerTrainers, 'trainers'),
                    starters: resolveArtifact(starters, globalStarters, playerStarters, 'starters'),
                    wild,
                },
            });
        }
    }

    if (playersSharedData.some(p => Object.keys(p).length > 1)) {
        sharedData.players = playersSharedData;
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
