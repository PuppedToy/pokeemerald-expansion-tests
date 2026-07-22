'use strict';

// T-189 — two-tier seed model. Single source of truth for every seed derivation,
// shared by generate.js (bundle creation) and make.js (compile) so the compile side
// can never drift from the generation side (this drift risk is why the derivations
// used to be duplicated — see randomizer/docs/trainer-determinism.md).
//
// Two authored seeds:
//   runSeed      — the existing `seed` field. Drives per-ROM subsystems (wild
//                  encounters + gym/static rewards + any unchecked shareable subsystem).
//   universeSeed — seeds the shared block (Pokédex / trainer teams + item bags /
//                  starters, whichever the nuzlocke/soul-link checkboxes mark shared).
//                  Falls back to runSeed when not provided, so `default` runs and
//                  single-seed nuzlocke/soul-link behave exactly as before.

// Golden-ratio mixing constant used everywhere seeds are derived from a base + index.
const GOLDEN = 0x9E3779B9;

// Derive a per-index seed from a base seed. Reproduces the historical
// `base ^ (index * GOLDEN)` derivation byte-for-byte (index 0 ⇒ base unchanged), so a
// bundle with no universeSeed (universeSeed === runSeed === seed) rebuilds identically.
function deriveSeed(base, index) {
    return (base ^ (index * GOLDEN)) >>> 0;
}

// Resolve the two authored seeds from a run config. `universeSeed` falls back to the
// run seed when absent/null so nothing changes for callers that only set `seed`.
function resolveSeeds(cfg) {
    const runSeed = cfg.seed >>> 0;
    const universeSeed = (cfg.universeSeed == null ? cfg.seed : cfg.universeSeed) >>> 0;
    return { runSeed, universeSeed };
}

// Per-ROM seed — drives the per-ROM subsystems (wild plan, unshared templates, docs
// wild placeholders / evo reads). A pure function of (runSeed, romIndex); universeSeed
// is deliberately NOT an input, so reusing a universe with a fresh runSeed rerolls the
// per-ROM content without touching the shared world.
function romSeed(runSeed, romIndex) {
    return deriveSeed(runSeed, romIndex);
}

// Base seed for per-slot trainer reseeding, by the ROM's trainer-sharing level:
//   'shared' | 'global'  → universeSeed              (identical across all ROMs/players)
//   'player-N'           → deriveSeed(universeSeed, N) (identical within a player's ROMs)
//   anything else        → the caller's unshared policy value (worker: romSeed; make/backend: null)
// The marker matches the value stored in rom.artifacts.trainers.
function trainerBaseSeed(trainersMarker, { universeSeed, unshared = null }) {
    if (trainersMarker === 'shared' || trainersMarker === 'global') return universeSeed;
    if (typeof trainersMarker === 'string' && trainersMarker.startsWith('player-')) {
        const p = parseInt(trainersMarker.split('-')[1], 10);
        return deriveSeed(universeSeed, p);
    }
    return unshared;
}

module.exports = { GOLDEN, deriveSeed, resolveSeeds, romSeed, trainerBaseSeed };
