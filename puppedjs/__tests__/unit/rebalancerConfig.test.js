'use strict';

// TDD: written BEFORE rebalancer.js reads from config.
// These tests verify that balanceChance from config controls the rebalance probability.

const rng = require('../../rng');
const moves = require('../fixtures/miniMoves');
const { STARMIE } = require('../fixtures/miniPokes');
const abilities = require('../fixtures/miniAbilities');
const abilityNames = Object.keys(abilities).map(k => k.replace('ABILITY_', ''));

function cloneStarmie() {
    return {
        ...STARMIE,
        parsedTypes: [...STARMIE.parsedTypes],
        parsedAbilities: [...STARMIE.parsedAbilities],
        learnset: STARMIE.learnset.map(l => ({ ...l })),
        teachables: [...STARMIE.teachables],
    };
}

function freshModules() {
    let balancePokemon, loadConfig, resetConfig;
    jest.isolateModules(() => {
        ({ balancePokemon } = require('../../rebalancer'));
        ({ loadConfig, resetConfig } = require('../../config'));
    });
    return { balancePokemon, loadConfig, resetConfig };
}

beforeEach(() => {
    rng.reset();
});

describe('rebalancer respects balanceChance from config', () => {
    test('balanceChance: 0 means no pokemon is ever mutated (log always empty)', () => {
        const { balancePokemon, loadConfig } = freshModules();
        loadConfig({ seed: 1, balanceChance: 0 }, { argv: [] });

        let anyMutated = false;
        for (let s = 0; s < 30; s++) {
            rng.seed(s);
            const result = balancePokemon(cloneStarmie(), abilityNames, moves);
            if (result.log.length > 0) { anyMutated = true; break; }
        }
        expect(anyMutated).toBe(false);
    });

    test('balanceChance: 1 means every pokemon is mutated (log always non-empty)', () => {
        const { balancePokemon, loadConfig } = freshModules();
        loadConfig({ seed: 1, balanceChance: 1 }, { argv: [] });

        let allMutated = true;
        for (let s = 0; s < 10; s++) {
            rng.seed(s);
            const result = balancePokemon(cloneStarmie(), abilityNames, moves);
            if (result.log.length === 0) { allMutated = false; break; }
        }
        expect(allMutated).toBe(true);
    });

    test('default balanceChance (0.2) — config not loaded still uses 0.2', () => {
        // When config is not explicitly loaded, getConfig() should initialise with defaults.
        const { balancePokemon } = freshModules();
        // Run 100 seeds: with balanceChance=0.2, roughly 20% should be mutated.
        // We just verify the function doesn't throw and behaves in a plausible range.
        let mutated = 0;
        for (let s = 0; s < 100; s++) {
            rng.seed(s);
            const result = balancePokemon(cloneStarmie(), abilityNames, moves);
            if (result.log.length > 0) mutated++;
        }
        // With 0.2 chance, expect roughly 20 ± wide margin (not 0 and not 100).
        expect(mutated).toBeGreaterThan(0);
        expect(mutated).toBeLessThan(100);
    });
});
