'use strict';

// T-184 — the rater must understand Wonder Guard: HP/Def/SpD are irrelevant (the bearer has 1 HP and
// takes 0 or dies), so its defensive value is entirely its typing (few weaknesses + immunity to the
// common residual/DoT sources), and it is game-changing enough to warrant a hard UU tier floor.

const { ratePokemon, ratePokemonDoubles, wonderGuardDefensiveRating } = require('../../rating');
const moves = require('../fixtures/miniMoves');
const abilities = require('../fixtures/miniAbilities');
const { TIER_SEQ } = require('../../constants');

const tierIdx = t => TIER_SEQ.indexOf(t);

function wgPoke(overrides = {}) {
    return {
        id: 'SPECIES_WG_TEST',
        family: 'P_FAMILY_WG_TEST',
        form: null,
        parsedTypes: ['NORMAL'],
        parsedAbilities: ['WONDER_GUARD'],
        baseHP: 1, baseAttack: 60, baseDefense: 45,
        baseSpAttack: 40, baseSpDefense: 30, baseSpeed: 60,
        baseBST: 236,
        evolutions: [],
        evolutionData: { type: 'EVO_TYPE_SOLO', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
        learnset: [{ level: '1', move: 'MOVE_TACKLE' }],
        teachables: [], newTeachables: [], oldTeachables: [],
        ...overrides,
    };
}

describe('T-184 — wonderGuardDefensiveRating (typing-based)', () => {
    test('fewer type weaknesses rate higher than many weaknesses', () => {
        // Ghost/Dark: 1 weakness (Fairy). Ice/Rock: 6 weaknesses incl. two 4× (Steel).
        expect(wonderGuardDefensiveRating({ parsedTypes: ['GHOST', 'DARK'] }))
            .toBeGreaterThan(wonderGuardDefensiveRating({ parsedTypes: ['ICE', 'ROCK'] }));
    });

    test('DoT/residual immunity beats an equal-weakness-count type without it (Poison vs Water)', () => {
        // Both have 2 weaknesses; Poison is immune to poison/toxic residual → should rate strictly higher.
        expect(wonderGuardDefensiveRating({ parsedTypes: ['POISON'] }))
            .toBeGreaterThan(wonderGuardDefensiveRating({ parsedTypes: ['WATER'] }));
    });

    test('result is clamped to [0, 10]', () => {
        for (const types of [['ICE', 'ROCK'], ['NORMAL'], ['STEEL'], ['GHOST', 'DARK'], ['GRASS', 'ICE']]) {
            const r = wonderGuardDefensiveRating({ parsedTypes: types });
            expect(r).toBeGreaterThanOrEqual(0);
            expect(r).toBeLessThanOrEqual(10);
        }
    });
});

describe('T-184 — Wonder Guard hard UU floor', () => {
    test('a weak Wonder Guard mon is floored to at least UU purely for having the ability', () => {
        const result = ratePokemon(wgPoke({ parsedTypes: ['ICE', 'ROCK'] }), moves, abilities, new Set());
        expect(tierIdx(result.tier)).toBeGreaterThanOrEqual(tierIdx('UU'));
    });

    test('the floor is Wonder-Guard-driven: the same mon with a normal ability rates below UU', () => {
        const withWG = ratePokemon(wgPoke({ parsedTypes: ['ICE', 'ROCK'] }), moves, abilities, new Set());
        const withoutWG = ratePokemon(
            wgPoke({ parsedTypes: ['ICE', 'ROCK'], parsedAbilities: ['INNER_FOCUS'] }),
            moves, abilities, new Set(),
        );
        expect(tierIdx(withWG.tier)).toBeGreaterThanOrEqual(tierIdx('UU'));
        expect(tierIdx(withoutWG.tier)).toBeLessThan(tierIdx('UU'));
    });
});

describe('T-184 — Wonder Guard hard UU floor (doubles parity)', () => {
    test('a weak Wonder Guard mon is floored to at least UU in the doubles rater too', () => {
        const result = ratePokemonDoubles(wgPoke({ parsedTypes: ['ICE', 'ROCK'] }), moves, abilities, new Set());
        expect(tierIdx(result.tierDoubles)).toBeGreaterThanOrEqual(tierIdx('UU'));
    });
});

describe('T-184 — Wonder Guard ignores bulk (HP/Def/SpD do not matter)', () => {
    test('two WG mons with identical typing/offense but wildly different bulk rate the same tier', () => {
        // A huge-BST bulky build (baseHP 221 → raw BST > 600) must NOT out-tier the frail build:
        // for a Wonder Guard mon the bulk (and thus the raw-BST floor) is fake and must be ignored.
        const frail = ratePokemon(wgPoke({ baseHP: 1, baseDefense: 20, baseSpDefense: 20 }), moves, abilities, new Set());
        const bulky = ratePokemon(wgPoke({ baseHP: 221, baseDefense: 120, baseSpDefense: 120 }), moves, abilities, new Set());
        expect(frail.tier).toBe(bulky.tier);
    });
});
