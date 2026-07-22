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
        // T-186 — difficulty settings. nonBossQuality: quality steps a non-boss sits below its split boss
        // (default −2). boss/nonBossTeamSize: trim teams to 1–6 (default 6, no trim). boss/nonBossLevelModifier:
        // add to boss / non-boss trainer levels (default 0). All defaults reproduce the previous ROM.
        nonBossQuality: cfg.nonBossQuality ?? -2,
        bossTeamSize: cfg.bossTeamSize ?? 6,
        nonBossTeamSize: cfg.nonBossTeamSize ?? 6,
        bossLevelModifier: cfg.bossLevelModifier ?? 0,
        nonBossLevelModifier: cfg.nonBossLevelModifier ?? 0,
        rebalance: cfg.rebalance !== false,
        balanceChance: cfg.balanceChance ?? 0.2,
        // T-052 — per-category mutation toggles
        mutateStats: cfg.mutateStats !== false,
        mutateAbilities: cfg.mutateAbilities !== false,
        mutateTypes: cfg.mutateTypes !== false,
        mutateLearnsets: cfg.mutateLearnsets !== false,
        mutationProbs: cfg.mutationProbs,
        // T-187 — move mutation. Off by default (opt-in). The five per-field probabilities are
        // forwarded raw; moveMutator.js supplies its defaults when a value is undefined.
        mutateMoves: cfg.mutateMoves === true,
        moveMutationChance: cfg.moveMutationChance,
        movePowerChance: cfg.movePowerChance,
        moveAccuracyChance: cfg.moveAccuracyChance,
        moveTypeChance: cfg.moveTypeChance,
        moveCategoryChance: cfg.moveCategoryChance,
        // T-052 — evolution-level tuning
        evoLevels: cfg.evoLevels,
        // T-052 — extra-starter category list
        extraStarters: cfg.extraStarters,
        // T-072 — quality tier for the 3 main starters (defaults to UU)
        starterQuality: cfg.starterQuality,
        allTms: false,
        // T-163 — docs-visibility toggles (per-element redaction of the generated docs). Forwarded raw;
        // writerDocs normalizes + fills defaults. showExactPositions now lives inside this object.
        docsVisibility: cfg.docsVisibility,
        // T-085/ADR-014 — battle format (singles | doubles | mixed) + mixed-only proportion / Run & Bun.
        battleFormat: cfg.battleFormat ?? 'singles',
        singlesPercent: cfg.singlesPercent ?? 60,
        // T-162 — wild encounters: 'deterministic' (1 predictable species/zone) | 'classic' (several).
        wildEncounterType: cfg.wildEncounterType ?? 'deterministic',
        pokemonPerZone: cfg.pokemonPerZone ?? 5,
        leagueRunAndBun: cfg.leagueRunAndBun === true,
        mixedSequentialSplit: cfg.mixedSequentialSplit === true,   // T-146/ADR-018
        // T-052 — Trainers & bosses
        gymsTypeChanged: cfg.gymsTypeChanged ?? 2,
        e4TypeChanged: cfg.e4TypeChanged ?? 2,
        // T-076 — probability the champion (Steven) also gets a randomized type (default 0.05).
        championTypeChangeChance: cfg.championTypeChangeChance ?? 0.05,
        aquaTypes: cfg.aquaTypes,
        magmaTypes: cfg.magmaTypes,
        disableStevenTagBattle: cfg.disableStevenTagBattle === true, // T-165 — Mossdeep tag → solo Tabitha
        // T-068/T-070 — nicknames (starters + location-based). Location naming reuses this same object
        // (autoLocation / lockGenderPerRoute), so there is only one name list.
        nicknames: cfg.nicknames,
    };
}
