'use strict';

// T-158 — Silvally unified onto Multitype + Plates (drop Memories). After the C data changes Silvally
// has ABILITY_MULTITYPE and keeps Multi-Attack (flipped to Plates in the engine), so the randomizer
// treats it exactly like Arceus. JS side, verified here:
//  (A) The Multitype signature-move forcing is generalized to Multi-Attack (Silvally learns it, not Judgment).
//  (B) Type: Null / Silvally join COSMETIC_FAMILIES: Type: Null + Silvally-Normal survive; 17 forms drop.

const rng = require('../../rng');
const baseMoves = require('../fixtures/miniMoves');
const { chooseMoveset: choose } = require('../../rating');
const { parseSpeciesFile: parseSpecies, COSMETIC_FAMILIES: COSMO } = require('../../parser');
const { MULTITYPE_ABILITY, MULTI_ATTACK_MOVE_ID } = require('../../constants');

const moves = {
    ...baseMoves,
    MOVE_MULTI_ATTACK: {
        ...baseMoves.MOVE_TACKLE, id: 'MOVE_MULTI_ATTACK', name: 'Multi-Attack',
        category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'NORMAL', power: 120, accuracy: 100, effect: 'EFFECT_HIT',
    },
};

// A SPECIAL attacker (Atk 10): Multi-Attack is PHYSICAL, so it rates near-worthless here and would never
// make the natural top 4 — it only appears if the Multitype signature-move forcing puts it there.
const silvally = (over = {}) => ({
    id: 'SPECIES_SILVALLY_NORMAL', name: 'Silvally', family: 'P_FAMILY_TYPE_NULL',
    parsedTypes: ['NORMAL'], parsedAbilities: [MULTITYPE_ABILITY],
    baseHP: 95, baseAttack: 10, baseDefense: 95, baseSpeed: 95, baseSpAttack: 128, baseSpDefense: 95,
    learnset: [
        { level: '1', move: 'MOVE_SURF' },
        { level: '1', move: 'MOVE_THUNDERBOLT' },
        { level: '1', move: 'MOVE_FLAMETHROWER' },
        { level: '1', move: 'MOVE_BLIZZARD' },
        { level: '1', move: 'MOVE_MULTI_ATTACK' },
    ],
    teachables: [],
    ...over,
});

describe('Silvally forces Multi-Attack via the Multitype signature-move rule (T-158)', () => {
    test('a Multitype mon that learns Multi-Attack (not Judgment) is forced to take it', () => {
        rng.seed(1);
        const { moveset } = choose(silvally(), moves, 100, [], MULTITYPE_ABILITY, null, null, 0);
        expect(moveset).toContain(MULTI_ATTACK_MOVE_ID);
    });

    test('the forcing also fires in the rating pass (no ability arg)', () => {
        rng.seed(1);
        const { moveset } = choose(silvally(), moves, 100, [], null, null, null, 0);
        expect(moveset).toContain(MULTI_ATTACK_MOVE_ID);
    });

    test('a non-Multitype special mon is NOT forced to take Multi-Attack', () => {
        const notSilvally = silvally({ id: 'SPECIES_STARMIE', family: 'P_FAMILY_STARYU', parsedAbilities: ['ILLUMINATE'] });
        rng.seed(1);
        const { moveset } = choose(notSilvally, moves, 100, [], 'ILLUMINATE', null, null, 0);
        expect(moveset).not.toContain(MULTI_ATTACK_MOVE_ID);
    });
});

describe('Type: Null / Silvally cosmetic strip (T-158)', () => {
    test('P_FAMILY_TYPE_NULL is a cosmetic (single-form) family', () => {
        expect(COSMO).toContain('P_FAMILY_TYPE_NULL');
    });

    test('keeps Type: Null + the first Silvally form, drops the other Silvally forms', () => {
        const FIX = `
#if P_FAMILY_TYPE_NULL
    [SPECIES_TYPE_NULL] =
    {
        .baseHP = 95, .baseAttack = 95, .baseDefense = 95,
        .baseSpeed = 59, .baseSpAttack = 95, .baseSpDefense = 95,
        .types = MON_TYPES(TYPE_NORMAL),
        .abilities = { ABILITY_BATTLE_ARMOR, ABILITY_NONE },
        .speciesName = _("Type: Null"),
        .natDexNum = NATIONAL_DEX_TYPE_NULL,
        .evolutions = EVOLUTION({EVO_LEVEL, 40, SPECIES_SILVALLY_NORMAL}),
    },
    [SPECIES_SILVALLY_NORMAL] =
    {
        .baseHP = 95, .baseAttack = 95, .baseDefense = 95,
        .baseSpeed = 95, .baseSpAttack = 95, .baseSpDefense = 95,
        .types = MON_TYPES(TYPE_NORMAL),
        .abilities = { ABILITY_MULTITYPE, ABILITY_NONE },
        .speciesName = _("Silvally"),
        .natDexNum = NATIONAL_DEX_SILVALLY,
    },
    [SPECIES_SILVALLY_FIRE] =
    {
        .baseHP = 95, .baseAttack = 95, .baseDefense = 95,
        .baseSpeed = 95, .baseSpAttack = 95, .baseSpDefense = 95,
        .types = MON_TYPES(TYPE_FIRE),
        .abilities = { ABILITY_MULTITYPE, ABILITY_NONE },
        .speciesName = _("Silvally"),
        .natDexNum = NATIONAL_DEX_SILVALLY,
    },
#endif //P_FAMILY_TYPE_NULL
`;
        const list = parseSpecies(FIX, {}, {});
        expect(list.map(p => p.id).sort()).toEqual(['SPECIES_SILVALLY_NORMAL', 'SPECIES_TYPE_NULL']);
    });
});
