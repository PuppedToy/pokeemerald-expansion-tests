/**
 * Randomizer pipeline orchestrator.
 *
 * NOTE: This module is a transitional artifact (Phase G). Phase K moves all
 * randomization to the browser. This file will be deleted when Phase K is complete.
 *
 * Collects module artifacts into a session bundle instead of writing them to game
 * files. Progress is streamed to SSE listeners as each module completes. The
 * generation ALGORITHM itself lives in randomizer/generate.js (shared with the
 * browser worker and the determinism tests); this module is a server adapter that
 * supplies SSE progress + socket flush, node-mode base data, and the backend's
 * historical seed policy.
 *
 * CJS randomizer modules are imported via createRequire because the backend
 * package is ESM but the randomizer is CommonJS.
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Generation orchestration is shared with the browser worker and the determinism
// tests — see randomizer/generate.js (the single source of truth for the algorithm).
const { runGeneration: runGenerationCore } = require('../randomizer/generate.js');

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
        rebalance: cfg.rebalance !== false,
        balanceChance: cfg.balanceChance ?? 0.2,
        // T-052 — per-category mutation toggles
        mutateStats: cfg.mutateStats !== false,
        mutateAbilities: cfg.mutateAbilities !== false,
        mutateTypes: cfg.mutateTypes !== false,
        mutateLearnsets: cfg.mutateLearnsets !== false,
        mutationProbs: cfg.mutationProbs,
        evoLevels: cfg.evoLevels,
        extraStarters: cfg.extraStarters,
        // T-072 — quality tier for the 3 main starters (family best-evo tier; defaults to UU)
        starterQuality: cfg.starterQuality,
        allTms: false,
        // T-085/ADR-014 — battle format (singles | doubles | mixed) + mixed-only proportion / Run & Bun.
        battleFormat: cfg.battleFormat ?? 'singles',
        singlesPercent: cfg.singlesPercent ?? 60,
        leagueRunAndBun: cfg.leagueRunAndBun === true,
        mixedSequentialSplit: cfg.mixedSequentialSplit === true,   // T-146/ADR-018
        // T-052 — trainer-facing knobs (mirrors the browser worker's toModuleConfig).
        gymsTypeChanged: cfg.gymsTypeChanged ?? 2,
        e4TypeChanged: cfg.e4TypeChanged ?? 2,
        // T-076 — probability the champion (Steven) also gets a randomized type (default 0.05).
        championTypeChangeChance: cfg.championTypeChangeChance ?? 0.05,
        aquaTypes: cfg.aquaTypes,
        magmaTypes: cfg.magmaTypes,
        // T-068/T-070 — nicknames (starters + location-based). Location naming reuses this same object
        // (autoLocation / lockGenderPerRoute), so there is only one name list.
        nicknames: cfg.nicknames,
    };
}

// ── Generation entry point ────────────────────────────────────────────────────

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
    }
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

// Delegates to the shared generation algorithm (randomizer/generate.js). This
// adapter only supplies the server's policy: SSE progress + socket flush, node-mode
// base data (runPokedexModule reads game files when baseData is null), and the
// backend's historical seed choices — default and per-ROM trainers use a null base
// seed here, whereas the browser worker uses cfg.seed / romSeed.
async function orchestrate(job, cfg) {
    const baseSeed = cfg.seed ?? Math.floor(Math.random() * 0xFFFFFFFF);
    cfg = { ...cfg, seed: baseSeed };

    const moduleConfig = toModuleConfig(cfg, baseSeed);
    const sessionId = crypto.randomUUID();

    return runGenerationCore(cfg, moduleConfig, sessionId, {
        progress: (pct, step) => progress(job, pct, step),
        flush,
        defaultBaseSeed: null,
        unsharedTrainingBaseSeed: () => null,
    });
}
