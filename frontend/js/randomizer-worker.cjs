'use strict';
// Web Worker entry point — all randomization runs in the browser.
// No DOM access; no API calls to /api/generate/*. Bundled by build.js via esbuild.
//
// The generation ALGORITHM lives in randomizer/generate.js (the single source of
// truth, shared with backend/generator.js and the determinism tests). This file is
// a thin browser adapter: it loads base data, forwards progress via postMessage,
// mints a session id, and applies the browser's config policy.

const { runGeneration } = require('../../randomizer/generate.js');

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

        const bundle = await runGeneration(config, toModuleConfig(config), uuid(), {
            progress: (pct, step) => post('progress', pct, step),
            baseData,
            // Browser policy (unchanged): the in-game ordering layer must always run,
            // so single-ROM `default` uses cfg.seed and per-ROM trainers use romSeed.
            defaultBaseSeed: config.seed,
            unsharedTrainingBaseSeed: (romSeed) => romSeed,
        });
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
