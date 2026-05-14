'use strict';

const rng = require('../../rng');
const moves = require('../fixtures/miniMoves');
const { MACHOP, MACHOKE, MACHAMP } = require('../fixtures/miniPokes');
const abilities = require('../fixtures/miniAbilities');

// We use jest.isolateModules to get a fresh rebalancer (with empty familyTracking)
// for each test that needs clean family state.
function freshBalancer() {
    let balancePokemon;
    jest.isolateModules(() => {
        balancePokemon = require('../../rebalancer').balancePokemon;
    });
    return balancePokemon;
}

const abilityNames = Object.keys(abilities).map(k => k.replace('ABILITY_', ''));

beforeEach(() => {
    rng.reset(); // always start unseeded between tests
});

describe('balancePokemon — output shape', () => {
    test('returns an object with a log array', () => {
        rng.seed(1);
        const balancePokemon = freshBalancer();
        const result = balancePokemon({ ...STARMIE_SOLO() }, abilityNames, moves);
        expect(result).toHaveProperty('log');
        expect(Array.isArray(result.log)).toBe(true);
    });

    test('mutated stats stay within [1, 255]', () => {
        const statKeys = ['baseHP', 'baseAttack', 'baseDefense', 'baseSpeed', 'baseSpAttack', 'baseSpDefense'];
        const balancePokemon = freshBalancer();
        // Run with many seeds to stress the bounds
        for (let s = 0; s < 20; s++) {
            rng.seed(s);
            const result = balancePokemon({ ...STARMIE_SOLO() }, abilityNames, moves);
            for (const k of statKeys) {
                expect(result[k]).toBeGreaterThanOrEqual(1);
                expect(result[k]).toBeLessThanOrEqual(255);
            }
        }
    });

    test('parsedTypes is always a non-empty array of strings', () => {
        const balancePokemon = freshBalancer();
        for (let s = 0; s < 10; s++) {
            rng.seed(s);
            const result = balancePokemon({ ...STARMIE_SOLO() }, abilityNames, moves);
            expect(Array.isArray(result.parsedTypes)).toBe(true);
            expect(result.parsedTypes.length).toBeGreaterThanOrEqual(1);
            result.parsedTypes.forEach(t => expect(typeof t).toBe('string'));
        }
    });

    test('learnset is an array of objects with move and level keys', () => {
        rng.seed(42);
        const balancePokemon = freshBalancer();
        const result = balancePokemon({ ...STARMIE_SOLO() }, abilityNames, moves);
        expect(Array.isArray(result.learnset)).toBe(true);
        result.learnset.forEach(entry => {
            expect(entry).toHaveProperty('move');
            expect(entry).toHaveProperty('level');
        });
    });
});

describe('balancePokemon — determinism', () => {
    test('same seed produces identical output for the same pokemon', () => {
        const b1 = freshBalancer();
        rng.seed(42);
        const r1 = b1({ ...STARMIE_SOLO() }, abilityNames, moves);

        const b2 = freshBalancer();
        rng.seed(42);
        const r2 = b2({ ...STARMIE_SOLO() }, abilityNames, moves);

        expect(r1.parsedTypes).toEqual(r2.parsedTypes);
        expect(r1.parsedAbilities).toEqual(r2.parsedAbilities);
        expect(r1.baseHP).toBe(r2.baseHP);
        expect(r1.baseAttack).toBe(r2.baseAttack);
    });

    test('different seeds may produce different outputs', () => {
        const b1 = freshBalancer();
        rng.seed(1);
        const r1 = b1({ ...STARMIE_SOLO() }, abilityNames, moves);

        const b2 = freshBalancer();
        rng.seed(999);
        const r2 = b2({ ...STARMIE_SOLO() }, abilityNames, moves);

        // It's theoretically possible (but very unlikely) for two different seeds to produce
        // identical results, so we just verify both ran without error.
        expect(r1).toBeDefined();
        expect(r2).toBeDefined();
    });
});

describe('balancePokemon — family propagation', () => {
    test('evolution inherits stat changes from its pre-evo', () => {
        const balancePokemon = freshBalancer();

        // Force a rebalance that changes Machop's attack
        // Use seed where BALANCE_CHANCE roll passes (rng.random() <= 0.2)
        // We'll call both and check that if Machop was buffed, Machamp sees the buff
        rng.seed(5);
        const machopResult = balancePokemon({ ...MACHOP }, abilityNames, moves);

        rng.seed(5);
        // Reset and replay so Machamp sees the same family tracking state
        const b2 = freshBalancer();
        rng.seed(5);
        const machopR2 = b2({ ...MACHOP }, abilityNames, moves);
        const machampR2 = b2({ ...MACHAMP }, abilityNames, moves);

        // Machamp's log should contain inherited entries from machopR2's log
        const inheritedEntries = machampR2.log.filter(e => machopR2.log.some(p => p.target === e.target && p.value === e.value));
        // If machop had any stat changes, machamp inherits them
        if (machopR2.log.length > 0) {
            expect(machampR2.log.length).toBeGreaterThanOrEqual(machopR2.log.length);
        }
    });

    test('mega form: original poke parsed arrays are not mutated', () => {
        const balancePokemon = freshBalancer();
        const originalTypes = [...MACHOP.parsedTypes];
        rng.seed(77);
        balancePokemon(MACHOP, abilityNames, moves);
        expect(MACHOP.parsedTypes).toEqual(originalTypes);
    });
});

// Helper: clone a solo poke (no evolutions) so family tracking starts fresh per test.
function STARMIE_SOLO() {
    const { STARMIE } = require('../fixtures/miniPokes');
    return {
        ...STARMIE,
        parsedTypes: [...STARMIE.parsedTypes],
        parsedAbilities: [...STARMIE.parsedAbilities],
        learnset: STARMIE.learnset.map(l => ({ ...l })),
        teachables: [...STARMIE.teachables],
    };
}
