'use strict';

// T-189 — two-tier seed model. `seeds.js` is the single source of truth for every
// seed derivation, shared by generate.js (bundle creation) and make.js (compile), so
// the compile side can never drift from the generation side.
//
// Model:
//   runSeed      — the existing `seed` field; drives per-ROM subsystems (wild + unshared).
//   universeSeed — seeds the shared block (Pokédex / trainers / starters); falls back to
//                  runSeed when not provided, so default + single-seed runs are unchanged.

const {
    GOLDEN,
    deriveSeed,
    resolveSeeds,
    romSeed,
    trainerBaseSeed,
} = require('../../seeds');

// The historical derivation these helpers must reproduce byte-for-byte.
const legacyDerive = (base, i) => (base ^ (i * 0x9E3779B9)) >>> 0;

describe('seeds — deriveSeed', () => {
    test('reproduces the historical `base ^ (index * GOLDEN)` derivation exactly', () => {
        expect(GOLDEN).toBe(0x9E3779B9);
        for (const base of [0, 1, 42, 2285648986, 0xFFFFFFFF]) {
            for (const i of [0, 1, 2, 3, 7, 9]) {
                expect(deriveSeed(base, i)).toBe(legacyDerive(base, i));
            }
        }
    });

    test('index 0 returns the base unchanged and results are unsigned 32-bit', () => {
        expect(deriveSeed(12345, 0)).toBe(12345);
        const v = deriveSeed(0xFFFFFFFF, 5);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(0xFFFFFFFF);
        expect(Number.isInteger(v)).toBe(true);
    });

    test('distinct indices give distinct seeds', () => {
        const seen = new Set([0, 1, 2, 3, 4, 5].map(i => deriveSeed(999, i)));
        expect(seen.size).toBe(6);
    });
});

describe('seeds — resolveSeeds (universeSeed falls back to runSeed)', () => {
    test('no universeSeed ⇒ universeSeed === runSeed === seed (back-compat)', () => {
        expect(resolveSeeds({ seed: 42 })).toEqual({ runSeed: 42, universeSeed: 42 });
        expect(resolveSeeds({ seed: 42, universeSeed: null })).toEqual({ runSeed: 42, universeSeed: 42 });
        expect(resolveSeeds({ seed: 42, universeSeed: undefined })).toEqual({ runSeed: 42, universeSeed: 42 });
    });

    test('explicit universeSeed is honoured independently of runSeed', () => {
        expect(resolveSeeds({ seed: 99, universeSeed: 42 })).toEqual({ runSeed: 99, universeSeed: 42 });
    });

    test('both seeds are coerced to unsigned 32-bit', () => {
        const { runSeed, universeSeed } = resolveSeeds({ seed: -1, universeSeed: -2 });
        expect(runSeed).toBe(0xFFFFFFFF);
        expect(universeSeed).toBe(0xFFFFFFFE);
    });
});

describe('seeds — romSeed (per-ROM, driven by runSeed only)', () => {
    test('romSeed = deriveSeed(runSeed, romIndex)', () => {
        expect(romSeed(99, 0)).toBe(99);
        expect(romSeed(99, 3)).toBe(legacyDerive(99, 3));
    });

    test('romSeed does not depend on universeSeed (pinning a universe never reshuffles wilds by itself)', () => {
        // romSeed is a pure function of (runSeed, index) — universeSeed is not an input.
        expect(romSeed(99, 2)).toBe(romSeed(99, 2));
    });
});

describe('seeds — trainerBaseSeed (per trainer-sharing level)', () => {
    const ctx = { universeSeed: 42, romSeed: 777, unshared: null };

    test('shared / global trainers key off universeSeed (invariant to runSeed)', () => {
        expect(trainerBaseSeed('shared', ctx)).toBe(42);
        expect(trainerBaseSeed('global', ctx)).toBe(42);
    });

    test('player-N trainers key off universeSeed ^ (playerIndex * GOLDEN)', () => {
        expect(trainerBaseSeed('player-0', ctx)).toBe(42);
        expect(trainerBaseSeed('player-2', ctx)).toBe(legacyDerive(42, 2));
    });

    test('per-ROM (unshared) trainers use the caller policy value', () => {
        expect(trainerBaseSeed({ trainersData: [] }, { universeSeed: 42, unshared: 777 })).toBe(777);
        expect(trainerBaseSeed({ trainersData: [] }, { universeSeed: 42, unshared: null })).toBe(null);
    });
});

describe('seeds — invariants that make the two-tier model work', () => {
    test('shared universe seeds are identical across ROMs regardless of runSeed', () => {
        // Two batches sharing a universe but with different runSeeds resolve the same
        // shared trainer base seed → identical shared teams.
        const a = trainerBaseSeed('shared', { universeSeed: 12345, romSeed: romSeed(1, 0), unshared: null });
        const b = trainerBaseSeed('shared', { universeSeed: 12345, romSeed: romSeed(2, 0), unshared: null });
        expect(a).toBe(b);
    });

    test('back-compat: universeSeed == runSeed reproduces the single-seed derivations', () => {
        const { runSeed, universeSeed } = resolveSeeds({ seed: 2285648986 });
        // shared trainer base = old cfg.seed
        expect(trainerBaseSeed('global', { universeSeed, unshared: null })).toBe(legacyDerive(2285648986, 0));
        // per-ROM seed = old cfg.seed ^ (i*GOLDEN)
        expect(romSeed(runSeed, 4)).toBe(legacyDerive(2285648986, 4));
    });
});
