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
        // Verify the config initialises with the correct default when not explicitly loaded.
        // Statistical sampling is unreliable here because familyTracking (module-level state)
        // accumulates across calls — once any mutation fires, all subsequent calls inherit it,
        // making result.log.length > 0 for the rest of the run regardless of balanceChance.
        let getConfig;
        jest.isolateModules(() => {
            ({ getConfig } = require('../../config'));
        });
        expect(getConfig().balanceChance).toBe(0.2);

        // Smoke-test: balancePokemon doesn't throw when config was never explicitly loaded.
        const { balancePokemon } = freshModules();
        expect(() => balancePokemon(cloneStarmie(), abilityNames, moves)).not.toThrow();
    });
});
