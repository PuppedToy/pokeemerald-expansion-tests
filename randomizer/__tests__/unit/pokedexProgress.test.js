'use strict';

// T-276 — the Pokédex module is ~68% of a run's wall clock and used to emit nothing while it ran,
// which is why the bar sat at 0-20% for ~19 s. It now reports its own progress through the two
// passes that carry that time: the absolute rating pass and the per-level contextual pass.
//
// Everything expensive is mocked (the same seams pokedexModule.test.js mocks), so the assertions are
// about WHEN progress is reported over N species, not about what the ratings say.

jest.mock('../../rating', () => ({
    ratePokemon: jest.fn(() => ({ absoluteRating: 5, tier: 'NU', bestMoveset: [] })),
    ratePokemonDoubles: jest.fn(() => ({ ratingDoubles: 5 })),
    rateContextual: jest.fn(() => ({ absoluteRating: 4, tier: 'PU', bestMoveset: [] })),
    rateContextualDoubles: jest.fn(() => ({ absoluteRating: 4, tier: 'PU' })),
    rateMove: jest.fn(() => 3),
    rateMoveDoubles: jest.fn(() => 3.5),
    rateAbilityDoubles: jest.fn(() => 1),
    rateAbilitySingles: jest.fn(() => 1),
    assignSupportTiersDoubles: jest.fn(),
    wishiwashiEffectivePoke: jest.fn((p) => p),
    palafinEffectivePoke: jest.fn((p) => p),
}));
jest.mock('../../rebalancer', () => ({ balancePokemon: jest.fn((p) => p), resetFamilyTracking: jest.fn() }));
jest.mock('../../teachableExpander', () => ({ expandAllTeachables: jest.fn(), buildTmPoolFromFile: jest.fn(async () => new Set()) }));
jest.mock('../../tmRandomizer', () => ({
    randomizeTMs: jest.fn(async () => []),
    buildTMList: jest.fn(() => []),
    annotateTmNumbers: jest.fn((moves) => moves),
}));

const { runPokedexModule } = require('../../modules/pokedexModule');
const { POKEDEX_PASSES } = require('../../progress');

// Browser-mode base data (non-null ⇒ no file I/O), with `count` throwaway species.
function baseData(count) {
    const allPokes = Array.from({ length: count }, (_, i) => ({
        id: `SPECIES_M${i}`, family: `FAMILY_M${i}`, evolutionData: { isMega: false }, evoTree: [],
    }));
    return {
        abilities: {}, items: {}, megaEvoStones: {}, moves: {}, levelUpLearnsets: {},
        TMTeachables: {}, universalMoves: [], evoTree: {}, megaEvoTree: {}, allPokes,
        tmLocations: {}, capLevels: {},
    };
}

const CFG = { seed: 1, difficulty: 7, rebalance: true, balanceChance: 0.2 };

// Run the module with a recording onProgress; returns the fractions it reported.
async function fractions(count, cfg = CFG) {
    const seen = [];
    await runPokedexModule(cfg, baseData(count), { onProgress: (f) => seen.push(f) });
    return seen;
}

describe('runPokedexModule reports its own progress', () => {
    test('it reports while rating species and while rating them per level cap', async () => {
        const seen = await fractions(120);
        expect(seen.length).toBeGreaterThan(10);
        // Both passes are represented: the rating pass lives below the contextual pass's share.
        expect(seen.some(f => f > 0 && f <= POKEDEX_PASSES.rate)).toBe(true);
        expect(seen.some(f => f > POKEDEX_PASSES.rate)).toBe(true);
    });

    test('fractions are monotonic and stay within 0..1', async () => {
        const seen = await fractions(120);
        expect(seen).toEqual([...seen].sort((a, b) => a - b));
        expect(Math.min(...seen)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...seen)).toBeLessThanOrEqual(1);
    });

    test('the last report accounts for both passes — nothing large is left unreported', async () => {
        const seen = await fractions(120);
        expect(seen.at(-1)).toBeGreaterThanOrEqual(POKEDEX_PASSES.rate + POKEDEX_PASSES.contextual - 0.01);
    });

    test('reporting is throttled: a bigger dex does not mean a report per species', async () => {
        const small = await fractions(60);
        const big = await fractions(600);
        expect(big.length).toBeLessThan(300);
        expect(big.length).toBeLessThanOrEqual(small.length * 2);
    });

    test('no onProgress hook (analyze.js, tests) still produces a pokédex', async () => {
        const result = await runPokedexModule(CFG, baseData(10));
        expect(result.pokes).toHaveLength(10);
        expect(result.schemaVersion).toBe(1);
    });

    test('an empty dex reports the passes it completed instead of throwing', async () => {
        const seen = await fractions(0);
        expect(seen.every(f => f >= 0 && f <= 1)).toBe(true);
    });
});
