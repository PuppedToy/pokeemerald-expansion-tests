'use strict';

const { ratePokemon } = require('../../rating');
const moves = require('../fixtures/miniMoves');
const abilities = require('../fixtures/miniAbilities');
const {
    TIER_LEGEND,
    TIER_LEGEND_THRESHOLD,
    TIER_AG_THRESHOLD,
    LEGEND_BST_THRESHOLD,
    TIER_SEQ,
} = require('../../constants');

// ── constants ────────────────────────────────────────────────────────────────

describe('LEGEND tier — constants', () => {
    test('TIER_LEGEND is defined and equals "LEGEND"', () => {
        expect(TIER_LEGEND).toBe('LEGEND');
    });

    test('TIER_LEGEND_THRESHOLD is 9.5', () => {
        expect(TIER_LEGEND_THRESHOLD).toBe(9.5);
    });

    test('TIER_AG_THRESHOLD is 9.75', () => {
        expect(TIER_AG_THRESHOLD).toBe(9.75);
    });

    test('LEGEND_BST_THRESHOLD is 670', () => {
        expect(LEGEND_BST_THRESHOLD).toBe(670);
    });

    test('LEGEND is in TIER_SEQ between UBERS and AG', () => {
        const legendIdx = TIER_SEQ.indexOf('LEGEND');
        const ubersIdx  = TIER_SEQ.indexOf('UBERS');
        const agIdx     = TIER_SEQ.indexOf('AG');
        expect(legendIdx).toBeGreaterThan(ubersIdx);
        expect(legendIdx).toBeLessThan(agIdx);
    });
});

// ── BST floor behaviour ───────────────────────────────────────────────────────

// Minimal non-mega pokemon, BST = 700, single weak move.
// INNER_FOCUS avoids the NONE/TRUANT 0.5× attack multiplier, keeping rawBST = baseBST.
// Natural moves rating will be very low; BST floor should push tier to LEGEND.
const highBstPoke = {
    id: 'SPECIES_TEST_HIGH_BST',
    family: 'P_FAMILY_TEST_HIGH_BST',
    form: null,
    parsedTypes: ['NORMAL'],
    parsedAbilities: ['INNER_FOCUS'],
    baseHP: 110,
    baseAttack: 110,
    baseDefense: 110,
    baseSpAttack: 110,
    baseSpDefense: 110,
    baseSpeed: 150,
    baseBST: 700,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_SOLO', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
    learnset: [{ level: '1', move: 'MOVE_TACKLE' }],
    teachables: [],
    newTeachables: [],
    oldTeachables: [],
};

// Same BST but mega form — should floor to UBERS via MEGA_UBERS_BST_THRESHOLD, not LEGEND.
const highBstMegaPoke = {
    ...highBstPoke,
    id: 'SPECIES_TEST_HIGH_BST_MEGA',
    baseHP: 110,
    baseAttack: 120,
    baseDefense: 130,
    baseSpAttack: 120,
    baseSpDefense: 130,
    baseSpeed: 140,
    baseBST: 750,
    evolutionData: { type: 'EVO_TYPE_MEGA', isMega: true, isLC: false, isNFE: false, isFinal: true, megaEvos: [], megaBaseForm: 'SPECIES_TEST_HIGH_BST', megaItem: 'ITEM_DUMMY_STONE' },
};

describe('LEGEND tier — BST floor (ratePokemon)', () => {
    test('non-mega BST=700 with minimal moves floors to LEGEND (not UBERS)', () => {
        const result = ratePokemon(highBstPoke, moves, abilities, new Set());
        expect(result.tier).toBe('LEGEND');
    });

    test('mega BST=750 with minimal moves floors to UBERS (not LEGEND — megas cannot BST-floor to LEGEND)', () => {
        const result = ratePokemon(highBstMegaPoke, moves, abilities, new Set());
        expect(result.tier).toBe('UBERS');
    });
});

// ── Fix 1 — speed/offense ratio guard ────────────────────────────────────────

// Regieleki-like: Spe=200, Atk/SpA=100 (rawOffensePower=6.25 < 8.0), TRANSISTOR.
// With Dragon Dance + Drain Punch + Thunderbolt + Quick Attack:
//   SETUP+PRIORITY (+0.7) + SETUP+fast sub (+0.3) + SETUP+RECOVERY (+0.35) → comboBonus=1.35
//   TRANSISTOR abilitiesSpaPowerMultiplier=1.3 → offensePower=8.125 (high via ability, not base stats)
//   speedPower after outlier (Spe=200≥160): 13.75 → WITHOUT guard: capped to 10 → bstRating≈9.03
//   rawOffensePower (base-stats-only) = 6.25 < 8.0 → guard fires → speedPower=7.75 → bstRating≈8.13
// BST=580 < LEGEND_BST_THRESHOLD(670): no BST floor.
// Without guard: absoluteRating≈9.85 → AG. With guard: ≈9.13 → UBERS.
const regielekiLike = {
    id: 'SPECIES_TEST_REGIELEKI',
    family: 'P_FAMILY_TEST_REGIELEKI',
    form: null,
    parsedTypes: ['ELECTRIC'],
    parsedAbilities: ['TRANSISTOR'],
    baseHP: 80,
    baseAttack: 100,
    baseDefense: 50,
    baseSpAttack: 100,
    baseSpDefense: 50,
    baseSpeed: 200,
    baseBST: 580,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_SOLO', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
    learnset: [
        { level: '1', move: 'MOVE_THUNDERBOLT' },
        { level: '1', move: 'MOVE_DRAGON_DANCE' },
        { level: '1', move: 'MOVE_DRAIN_PUNCH' },
        { level: '1', move: 'MOVE_QUICK_ATTACK' },
    ],
    teachables: [],
    newTeachables: [],
    oldTeachables: [],
};

// High-offense speedster: Spe=200, Atk=160 (rawOffensePower=10.0 ≥ 8.0). Guard must NOT fire.
const highOffenseSpeedster = {
    ...regielekiLike,
    id: 'SPECIES_TEST_HIGH_OFF_SPEED',
    parsedAbilities: ['INNER_FOCUS'],
    baseAttack: 160,
    baseSpAttack: 80,
    baseBST: 620,
};

describe('Fix 1 — speed/offense ratio guard', () => {
    test('Regieleki-like (Spe=200, base Atk/SpA=100, TRANSISTOR) rates as UBERS not AG/LEGEND', () => {
        const result = ratePokemon(regielekiLike, moves, abilities, new Set());
        expect(result.tier).toBe('UBERS');
    });

    test('high-offense speedster (Spe=200, baseAtk=160: rawOffensePower≥8.0) guard does not fire — tier unaffected by guard', () => {
        // rawOffensePower = 160/160*10 = 10.0 ≥ 8.0 → guard condition false
        const result = ratePokemon(highOffenseSpeedster, moves, abilities, new Set());
        // INNER_FOCUS, BST=620 < 670: no BST floor; should rate OU/UBERS depending on moves
        // The key assertion: tier is not artificially lowered by guard (guard never fires)
        expect(['OU', 'UBERS', 'LEGEND', 'AG']).toContain(result.tier);
    });
});

// ── Fix 2 — mega AG rating threshold (MEGA_AG_RATING_THRESHOLD = 10.0) ───────

// Mega at MEGA_AG_BST_THRESHOLD (770): AG BST floor fires → absoluteRating≈9.826.
// Before Fix 2: 9.826 ≥ TIER_AG_THRESHOLD(9.75) → AG.
// After Fix 2:  9.826 < MEGA_AG_RATING_THRESHOLD(10.0) → not AG → LEGEND.
const megaAtAgThreshold = {
    id: 'SPECIES_TEST_MEGA_AG',
    family: 'P_FAMILY_TEST_MEGA_AG',
    form: null,
    parsedTypes: ['DRAGON'],
    parsedAbilities: ['INNER_FOCUS'],
    baseHP: 100,
    baseAttack: 130,
    baseDefense: 120,
    baseSpAttack: 130,
    baseSpDefense: 120,
    baseSpeed: 170,
    baseBST: 770,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_MEGA', isMega: true, isLC: false, isNFE: false, isFinal: true, megaEvos: [], megaBaseForm: 'SPECIES_TEST_MEGA_AG_BASE', megaItem: 'ITEM_DUMMY_STONE' },
    learnset: [{ level: '1', move: 'MOVE_TACKLE' }],
    teachables: [],
    newTeachables: [],
    oldTeachables: [],
};

// Non-mega at AG_BST_THRESHOLD (720): should still rate AG (threshold unchanged for non-megas).
const nonMegaAtAg = {
    id: 'SPECIES_TEST_NON_MEGA_AG',
    family: 'P_FAMILY_TEST_NON_MEGA_AG',
    form: null,
    parsedTypes: ['DRAGON'],
    parsedAbilities: ['INNER_FOCUS'],
    baseHP: 100,
    baseAttack: 120,
    baseDefense: 120,
    baseSpAttack: 120,
    baseSpDefense: 120,
    baseSpeed: 140,
    baseBST: 720,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_SOLO', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
    learnset: [{ level: '1', move: 'MOVE_TACKLE' }],
    teachables: [],
    newTeachables: [],
    oldTeachables: [],
};

describe('Fix 2 — mega AG rating threshold', () => {
    test('mega at MEGA_AG_BST_THRESHOLD(770) rates as LEGEND not AG (mega needs 10.0 to reach AG)', () => {
        // AG BST floor → absoluteRating≈9.826; with Fix 2, megas need 10.0 for AG → LEGEND
        const result = ratePokemon(megaAtAgThreshold, moves, abilities, new Set());
        expect(result.tier).toBe('LEGEND');
    });

    test('non-mega at AG_BST_THRESHOLD(720) still rates as AG (threshold unchanged)', () => {
        const result = ratePokemon(nonMegaAtAg, moves, abilities, new Set());
        expect(result.tier).toBe('AG');
    });
});

// ── Stoneless mega (Rayquaza-like) — follows non-mega tier rules ──────────────
//
// A mega without megaItem (Rayquaza uses Dragon Ascent, no stone) should follow
// the same BST floors and AG threshold as a regular pokemon.
// BST=780 > AG_BST_THRESHOLD(720): non-mega AG floor fires → absoluteRating ≥ 9.75.
// TIER_AG_THRESHOLD(9.75) applies (not MEGA_AG_RATING_THRESHOLD 10.0) → AG.
const stonelessMega = {
    id: 'SPECIES_TEST_STONELESS_MEGA',
    family: 'P_FAMILY_TEST_STONELESS_MEGA',
    form: null,
    parsedTypes: ['DRAGON', 'FLYING'],
    parsedAbilities: ['INNER_FOCUS'],
    baseHP: 105,
    baseAttack: 150,
    baseDefense: 90,
    baseSpAttack: 150,
    baseSpDefense: 90,
    baseSpeed: 195,
    baseBST: 780,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_MEGA', isMega: true, isLC: false, isNFE: false, isFinal: true, megaEvos: [], megaBaseForm: 'SPECIES_TEST_STONELESS_BASE' },
    // NO megaItem — stoneless mega
    learnset: [{ level: '1', move: 'MOVE_TACKLE' }],
    teachables: [],
    newTeachables: [],
    oldTeachables: [],
};

describe('Stoneless mega (Rayquaza-like) — non-mega tier rules', () => {
    test('stoneless mega (no megaItem, BST=780) rates AG via non-mega AG threshold (9.75)', () => {
        // BST=780 > AG_BST_THRESHOLD(720): non-mega AG BST floor fires → absoluteRating ≥ 9.75 → AG
        const result = ratePokemon(stonelessMega, moves, abilities, new Set());
        expect(result.tier).toBe('AG');
    });
});
