'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULTS = {
    seed: null,
    difficulty: 'fair',
    rebalance: true,
    balanceChance: 0.2,
    numROMs: 1,
    sharedModules: 4,
};

const VALID_DIFFICULTIES = new Set(['easy', 'fair', 'hard']);
const VALID_SHARED_MODULES = new Set([1, 2, 3, 4]);

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
        }
    }
    return result;
}

function validate(config) {
    if (!VALID_DIFFICULTIES.has(config.difficulty)) {
        throw new Error(`Invalid difficulty: "${config.difficulty}". Must be one of: ${[...VALID_DIFFICULTIES].join(', ')}`);
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
        throw new Error(`sharedModules must be 1, 2, 3, or 4, got: ${config.sharedModules}`);
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
