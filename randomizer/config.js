'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULTS = {
    seed: null,
    difficulty: 7,
    rebalance: true,
    balanceChance: 0.2,
    // T-187 — move mutation. Off by default; when off no move RNG is drawn (output unchanged). The
    // per-field probabilities are left undefined here so moveMutator.js supplies its own defaults.
    mutateMoves: false,
    allTms: false,
    numROMs: 1,
    sharedModules: 4,
};

// String aliases accepted for backward compatibility (CLI and config files).
const DIFFICULTY_ALIASES = { easy: 4, fair: 7, hard: 10 };
const VALID_SHARED_MODULES = new Set([1, 2, 3, 4, 5]);

function resolveDifficulty(value) {
    if (typeof value === 'string') {
        const alias = DIFFICULTY_ALIASES[value.toLowerCase()];
        if (alias !== undefined) return alias;
        const n = Number(value);
        if (!isNaN(n)) return n;
        return value; // let validate() catch it
    }
    return value;
}

function parseCLIArgs(argv) {
    const result = {};
    for (const arg of argv) {
        if (arg.startsWith('--difficulty=')) {
            result.difficulty = arg.slice('--difficulty='.length).toLowerCase();
        } else if (arg === '--no-balance') {
            result.rebalance = false;
        } else if (arg.startsWith('--seed=')) {
            result.seed = parseInt(arg.slice('--seed='.length), 10);
        } else if (arg.startsWith('--balance-chance=')) {
            result.balanceChance = parseFloat(arg.slice('--balance-chance='.length));
        } else if (arg.startsWith('--mode=')) {
            result.mode = arg.slice('--mode='.length).toLowerCase();
        } else if (arg === '--all-tms') {
            result.allTms = true;
        } else if (arg === '--mutate-moves') {
            result.mutateMoves = true;   // T-187 — enable move mutation for an analyze.js run
        }
    }
    return result;
}

function validate(config) {
    const d = config.difficulty;
    if (!Number.isInteger(d) || d < 1 || d > 13) {
        throw new Error(`Invalid difficulty: "${d}". Must be an integer 1–13 (or alias: easy=4, fair=7, hard=10)`);
    }
    if (typeof config.balanceChance !== 'number' || config.balanceChance < 0 || config.balanceChance > 1) {
        throw new Error(`balanceChance must be a number between 0 and 1, got: ${config.balanceChance}`);
    }
    if (config.seed !== null && !Number.isInteger(config.seed)) {
        throw new Error(`seed must be null or an integer, got: ${config.seed}`);
    }
    if (!Number.isInteger(config.numROMs) || config.numROMs < 1) {
        throw new Error(`numROMs must be an integer >= 1, got: ${config.numROMs}`);
    }
    if (!VALID_SHARED_MODULES.has(config.sharedModules)) {
        throw new Error(`sharedModules must be 1–5, got: ${config.sharedModules}`);
    }
}

let _cachedConfig = null;

function loadConfig(overrides = {}, { argv = process.argv, configPath = path.resolve(__dirname, 'config.json') } = {}) {
    let fileConfig = {};
    try {
        fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (_) {
        // Missing file or invalid JSON — use defaults.
    }

    const cliConfig = parseCLIArgs(argv);

    // Merge order: defaults → file → CLI → explicit overrides
    const merged = { ...DEFAULTS, ...fileConfig, ...cliConfig, ...overrides };

    // Resolve string difficulty aliases to integers.
    merged.difficulty = resolveDifficulty(merged.difficulty);

    // Auto-generate seed when not provided.
    if (merged.seed === null) {
        merged.seed = Math.floor(Math.random() * 0xFFFFFFFF);
    }

    validate(merged);

    _cachedConfig = merged;
    return merged;
}

function getConfig() {
    if (!_cachedConfig) {
        loadConfig();
    }
    return _cachedConfig;
}

function resetConfig() {
    _cachedConfig = null;
}

module.exports = { loadConfig, getConfig, resetConfig, parseCLIArgs, DEFAULTS };
