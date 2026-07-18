'use strict';

// T-156 — Arceus / Multitype / Plate / Judgment rater logic (no new Plate distribution):
//  (A) A Multitype mon (Arceus) always carries Judgment (it becomes the held Plate's type in battle).
//  (B) Any Plate is valuable for a Multitype mon (STAB via Judgment), with a bonus for NEW coverage.
//  (C) A type-restricted trainer counts a Multitype candidate when its bag holds a Plate of an
//      allowed type.

const rng = require('../../rng');
const baseMoves = require('../fixtures/miniMoves');
const { chooseMoveset, rateItemForAPokemon } = require('../../rating');
const { trainerBagPlateTypes, multitypeSatisfiesTypes } = require('../../modules/trainerSelector');
const { MULTITYPE_ABILITY, JUDGMENT_MOVE_ID } = require('../../constants');

// Add a synthetic Judgment (Normal special, like the real move) to the fixture move map.
const moves = {
    ...baseMoves,
    MOVE_JUDGMENT: {
        ...baseMoves.MOVE_TACKLE, id: 'MOVE_JUDGMENT', name: 'Judgment',
        category: 'DAMAGE_CATEGORY_SPECIAL', type: 'NORMAL', power: 100, accuracy: 100, effect: 'EFFECT_HIT',
    },
};

// A PHYSICAL attacker (SpAtk 10): Judgment is a Normal SPECIAL move, so it rates near-worthless here and
// would never make the natural top 4 — it only appears if the Multitype-specific forcing puts it there
// (mirrors the Meloetta Relic Song test). Four strong physical moves fill the natural set.
const arceus = (over = {}) => ({
    id: 'SPECIES_ARCEUS_NORMAL', name: 'Arceus', family: 'P_FAMILY_ARCEUS',
    parsedTypes: ['NORMAL'], parsedAbilities: [MULTITYPE_ABILITY],
    baseHP: 120, baseAttack: 128, baseDefense: 120, baseSpeed: 120, baseSpAttack: 10, baseSpDefense: 120,
    learnset: [
        { level: '1', move: 'MOVE_EARTHQUAKE' },
        { level: '1', move: 'MOVE_CLOSE_COMBAT' },
        { level: '1', move: 'MOVE_KNOCK_OFF' },
        { level: '1', move: 'MOVE_METAL_CLAW' },
        { level: '1', move: 'MOVE_JUDGMENT' },
    ],
    teachables: [],
    ...over,
});

describe('Arceus always carries Judgment (T-156 A)', () => {
    test('a Multitype mon is forced to take Judgment even when 4 stronger moves exist', () => {
        rng.seed(1);
        const { moveset } = chooseMoveset(arceus(), moves, 100, [], MULTITYPE_ABILITY, null, null, 0);
        expect(moveset).toContain(JUDGMENT_MOVE_ID);
    });

    test('the forcing also fires in the rating pass, where no ability is passed', () => {
        rng.seed(1);
        const { moveset } = chooseMoveset(arceus(), moves, 100, [], null, null, null, 0);
        expect(moveset).toContain(JUDGMENT_MOVE_ID);
    });

    test('a non-Multitype mon that can learn Judgment is NOT forced to take it', () => {
        const notArceus = arceus({ id: 'SPECIES_SNORLAX', family: 'P_FAMILY_SNORLAX', parsedAbilities: ['IMMUNITY'] });
        rng.seed(1);
        const { moveset } = chooseMoveset(notArceus, moves, 100, [], 'IMMUNITY', null, null, 0);
        expect(moveset).not.toContain(JUDGMENT_MOVE_ID);
    });
});

describe('Plates are valuable for Multitype (T-156 B)', () => {
    const set = ['MOVE_JUDGMENT', 'MOVE_EARTHQUAKE'].map(m => moves[m]); // Normal (Judgment) + Ground

    test('a Plate rates > 0 for a Multitype mon even with no real move of that type', () => {
        rng.seed(1);
        const v = rateItemForAPokemon('Dread Plate', arceus(), MULTITYPE_ABILITY, set, 100, 6, 0);
        expect(v).toBeGreaterThan(0);
    });

    test('a Plate whose type is NEW coverage beats one the mon already has', () => {
        rng.seed(1);
        const dark = rateItemForAPokemon('Dread Plate', arceus(), MULTITYPE_ABILITY, set, 100, 6, 0); // DARK — new
        rng.seed(1);
        const normal = rateItemForAPokemon('Draco Plate', arceus(), MULTITYPE_ABILITY,
            [moves.MOVE_JUDGMENT, { ...moves.MOVE_EARTHQUAKE, type: 'DRAGON' }], 100, 6, 0); // DRAGON already covered
        expect(dark).toBeGreaterThan(normal);
    });

    test('a Plate still rates 0 for a NON-Multitype mon lacking a move of that type', () => {
        rng.seed(1);
        const notArceus = arceus({ id: 'SPECIES_SNORLAX', parsedAbilities: ['IMMUNITY'], parsedTypes: ['NORMAL'] });
        const v = rateItemForAPokemon('Dread Plate', notArceus, 'IMMUNITY', [moves.MOVE_EARTHQUAKE], 100, 6, 0);
        expect(v).toBe(0);
    });
});

describe('Multitype counts toward a trainer type theme via a bagged Plate (T-156 C)', () => {
    test('trainerBagPlateTypes reads the plate types out of a bag', () => {
        expect(trainerBagPlateTypes({ bag: ['Dread Plate', 'Oran Berry', 'Splash Plate'] }).sort())
            .toEqual(['DARK', 'WATER']);
        expect(trainerBagPlateTypes({ bag: [] })).toEqual([]);
        expect(trainerBagPlateTypes({})).toEqual([]);
    });

    test('a Multitype mon satisfies an allowed type when the bag has a matching Plate', () => {
        expect(multitypeSatisfiesTypes(arceus(), ['DARK'], ['DARK'])).toBe(true);
        // bag plate type not in the allowed set → no
        expect(multitypeSatisfiesTypes(arceus(), ['DARK'], ['FIRE'])).toBe(false);
        // non-Multitype never qualifies this way
        expect(multitypeSatisfiesTypes(arceus({ parsedAbilities: ['IMMUNITY'] }), ['DARK'], ['DARK'])).toBe(false);
    });
});
