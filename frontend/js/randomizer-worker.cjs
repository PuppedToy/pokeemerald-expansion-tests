'use strict';
// Web Worker entry point — all randomization runs in the browser.
// No DOM access; no API calls to /api/generate/*. Bundled by build.js via esbuild.
//
// The generation ALGORITHM lives in randomizer/generate.js (the single source of
// truth, shared with backend/generator.js and the determinism tests). This file is
// a thin browser adapter: it loads base data, forwards progress via postMessage,
// mints a session id, and applies the browser's config policy.

const { runGeneration } = require('../../randomizer/generate.js');
const { createDiagnostics } = require('../../randomizer/diagnostics.js');
const { createTeamAudit, renderTeamAuditText } = require('../../randomizer/teamAudit.js');

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

        // T-075 — collect this run's warnings/errors (still mirrored to devtools). Returned
        // as a SIBLING of the bundle (never inside it), so the bundle shape is unchanged.
        const diag = createDiagnostics();
        // T-117 — collect the per-team decision trace; returned as siblings of the bundle (never in it).
        const audit = createTeamAudit();

        const bundle = await runGeneration(config, toModuleConfig(config), uuid(), {
            progress: (pct, step) => post('progress', pct, step),
            baseData,
            diagnostics: diag,
            audit,
            // Browser policy (unchanged): the in-game ordering layer must always run,
            // so single-ROM `default` uses cfg.seed and per-ROM trainers use romSeed.
            defaultBaseSeed: config.seed,
            unsharedTrainingBaseSeed: (romSeed) => romSeed,
        });
        self.postMessage({
            type: 'done', bundle,
            diagnostics: diag.all(),
            diagnosticsCounts: diag.counts(),
            teamAudit: audit.all(),                          // structured (for the 48h server store)
            teamAuditText: renderTeamAuditText(audit.all()), // readable (for local download)
        });
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
        // T-052 — per-category mutation toggles
        mutateStats: cfg.mutateStats !== false,
        mutateAbilities: cfg.mutateAbilities !== false,
        mutateTypes: cfg.mutateTypes !== false,
        mutateLearnsets: cfg.mutateLearnsets !== false,
        mutationProbs: cfg.mutationProbs,
        // T-052 — evolution-level tuning
        evoLevels: cfg.evoLevels,
        // T-052 — extra-starter category list
        extraStarters: cfg.extraStarters,
        // T-072 — quality tier for the 3 main starters (defaults to UU)
        starterQuality: cfg.starterQuality,
        allTms: false,
        showExactPositions: cfg.showExactPositions === true,
        // T-085/ADR-014 — battle format (singles | doubles | mixed) + mixed-only proportion / Run & Bun.
        battleFormat: cfg.battleFormat ?? 'singles',
        singlesPercent: cfg.singlesPercent ?? 60,
        leagueRunAndBun: cfg.leagueRunAndBun === true,
        // T-052 — Trainers & bosses
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
