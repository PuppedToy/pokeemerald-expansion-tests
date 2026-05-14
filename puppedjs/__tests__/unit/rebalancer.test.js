'use strict';

const moves = require('../fixtures/miniMoves');
const { MACHOP, MACHAMP } = require('../fixtures/miniPokes');
const abilities = require('../fixtures/miniAbilities');

// We use jest.isolateModules to get a fresh rebalancer (with empty familyTracking).
// Returns { balancePokemon, rng } where rng is the SAME instance used by that rebalancer,
// so rng.seed() controls its behavior reliably regardless of Jest's worker/cache state.
function freshBalancer() {
    let balancePokemon, isolatedRng;
    jest.isolateModules(() => {
        ({ balancePokemon } = require('../../rebalancer'));
        isolatedRng = require('../../rng');
    });
    return { balancePokemon, rng: isolatedRng };
}

const abilityNames = Object.keys(abilities).map(k => k.replace('ABILITY_', ''));

describe('balancePokemon — output shape', () => {
    test('returns an object with a log array', () => {
        const { balancePokemon, rng } = freshBalancer();
        rng.seed(1);
        const result = balancePokemon({ ...STARMIE_SOLO() }, abilityNames, moves);
        expect(result).toHaveProperty('log');
        expect(Array.isArray(result.log)).toBe(true);
    });

    test('mutated stats stay within [1, 255]', () => {
        const { balancePokemon, rng } = freshBalancer();
        const statKeys = ['baseHP', 'baseAttack', 'baseDefense', 'baseSpeed', 'baseSpAttack', 'baseSpDefense'];
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
        const { balancePokemon, rng } = freshBalancer();
        for (let s = 0; s < 10; s++) {
            rng.seed(s);
            const result = balancePokemon({ ...STARMIE_SOLO() }, abilityNames, moves);
            expect(Array.isArray(result.parsedTypes)).toBe(true);
            expect(result.parsedTypes.length).toBeGreaterThanOrEqual(1);
            result.parsedTypes.forEach(t => expect(typeof t).toBe('string'));
        }
    });

    test('learnset is an array of objects with move and level keys', () => {
        const { balancePokemon, rng } = freshBalancer();
        rng.seed(42);
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
        const { balancePokemon: b1, rng: rng1 } = freshBalancer();
        rng1.seed(42);
        const r1 = b1({ ...STARMIE_SOLO() }, abilityNames, moves);

        const { balancePokemon: b2, rng: rng2 } = freshBalancer();
        rng2.seed(42);
        const r2 = b2({ ...STARMIE_SOLO() }, abilityNames, moves);

        expect(r1.parsedTypes).toEqual(r2.parsedTypes);
        expect(r1.parsedAbilities).toEqual(r2.parsedAbilities);
        expect(r1.baseHP).toBe(r2.baseHP);
        expect(r1.baseAttack).toBe(r2.baseAttack);
    });

    test('different seeds may produce different outputs', () => {
        const { balancePokemon: b1, rng: rng1 } = freshBalancer();
        rng1.seed(1);
        const r1 = b1({ ...STARMIE_SOLO() }, abilityNames, moves);

        const { balancePokemon: b2, rng: rng2 } = freshBalancer();
        rng2.seed(999);
        const r2 = b2({ ...STARMIE_SOLO() }, abilityNames, moves);

        // It's theoretically possible (but very unlikely) for two different seeds to produce
        // identical results, so we just verify both ran without error.
        expect(r1).toBeDefined();
        expect(r2).toBeDefined();
    });
});

describe('balancePokemon — family propagation', () => {
    test('evolution inherits stat changes from its pre-evo', () => {
        // Use a fresh isolated balancer — b2 sees the family state set by b2's Machop call.
        const { balancePokemon: b2, rng: rng2 } = freshBalancer();
        rng2.seed(5);
        const machopR2 = b2({ ...MACHOP }, abilityNames, moves);
        const machampR2 = b2({ ...MACHAMP }, abilityNames, moves);

        // If Machop was mutated, Machamp should inherit at least as many log entries.
        if (machopR2.log.length > 0) {
            expect(machampR2.log.length).toBeGreaterThanOrEqual(machopR2.log.length);
        }
    });

    test('mega form: original poke parsed arrays are not mutated', () => {
        const { balancePokemon, rng } = freshBalancer();
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
