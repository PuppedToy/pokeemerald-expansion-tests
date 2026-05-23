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

    test('TIER_LEGEND_THRESHOLD is 9.3', () => {
        expect(TIER_LEGEND_THRESHOLD).toBe(9.3);
    });

    test('TIER_AG_THRESHOLD is 9.6 (raised from 9.5)', () => {
        expect(TIER_AG_THRESHOLD).toBe(9.6);
    });

    test('LEGEND_BST_THRESHOLD is 660', () => {
        expect(LEGEND_BST_THRESHOLD).toBe(660);
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
    evolutionData: { type: 'EVO_TYPE_MEGA', isMega: true, isLC: false, isNFE: false, isFinal: true, megaEvos: [], megaBaseForm: 'SPECIES_TEST_HIGH_BST' },
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
