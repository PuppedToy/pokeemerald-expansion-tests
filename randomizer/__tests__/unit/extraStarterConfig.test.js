'use strict';

// T-052 Step 10 — extra starters are a config-driven list. The DEFAULT preset routes to the legacy
// selection (kept byte-identical; covered by wildModule.test.js); custom lists use the pure
// per-spec selector: unlimited slots, expanded tier/line vocabulary, type/family dedup, graceful
// skips for unsatisfiable categories.

const rng = require('../../rng');
const {
    pickExtraStartersFromSpecs,
    isDefaultStarterPreset,
    DEFAULT_EXTRA_STARTER_PRESET,
    EXTRA_STARTER_TIERS,
} = require('../../modules/wildModule');

function makePoke(id, family, types, evoType, isLC, bestEvoTier, tier, bestEvoRating = 5) {
    return {
        id, family, parsedTypes: types,
        evolutionData: { type: evoType, isLC },
        rating: { bestEvoTier, tier, bestEvoRating },
    };
}

const LIST = [
    makePoke('UBERS3', 'F_UBERS', ['PSYCHIC'], 'EVO_TYPE_LC_OF_3', true, 'UBERS', 'PU', 9.1),
    makePoke('OU3', 'F_OU', ['FIRE'], 'EVO_TYPE_LC_OF_3', true, 'OU', 'PU', 8),
    makePoke('UU', 'F_UU', ['WATER'], 'EVO_TYPE_LC', true, 'UU', 'PU', 7),
    makePoke('NU_SOLO', 'F_NU', ['NORMAL'], 'EVO_TYPE_SOLO', false, 'NU', 'NU', 5),
    makePoke('RU1', 'F_RU1', ['GRASS'], 'EVO_TYPE_LC', true, 'RU', 'PU'),
    makePoke('RU2', 'F_RU2', ['ELECTRIC'], 'EVO_TYPE_LC_OF_2', true, 'RU', 'PU'),
    makePoke('RU3', 'F_RU3', ['ICE'], 'EVO_TYPE_LC', true, 'RU', 'PU'),
];

function pick(specs, seed = 5) {
    rng.seed(seed);
    const chosen = pickExtraStartersFromSpecs(specs, {
        pokemonList: LIST,
        alreadyChosenFamilySet: new Set(),
        alreadyChosenTypes: new Set(),
    });
    return chosen.map(p => p.id);
}

describe('pickExtraStartersFromSpecs', () => {
    test('slot count follows the list length', () => {
        expect(pick([{ tier: 'RU', kind: 'line' }])).toHaveLength(1);
        expect(pick([{ tier: 'RU', kind: 'line' }, { tier: 'UU', kind: 'line' }])).toHaveLength(2);
    });

    test('a solo category picks a non-evolving mon of that tier', () => {
        expect(pick([{ tier: 'NU', kind: 'solo' }])).toEqual(['NU_SOLO']);
    });

    test('lineLength "3" prefers a 3-stage line', () => {
        expect(pick([{ tier: 'UBERS', kind: 'line', lineLength: '3' }])).toEqual(['UBERS3']);
    });

    test('lineLength "2" prefers a 2-stage line when present', () => {
        // Among RU, only RU2 is LC_OF_2.
        expect(pick([{ tier: 'RU', kind: 'line', lineLength: '2' }])).toEqual(['RU2']);
    });

    test('unsatisfiable categories are skipped (no throw)', () => {
        expect(pick([{ tier: 'LEGEND', kind: 'line' }, { tier: 'UU', kind: 'line' }])).toEqual(['UU']);
        expect(pick([{ tier: 'NOPE', kind: 'line' }])).toEqual([]);
    });

    test('family + type dedup: no repeats across slots', () => {
        const out = pick([{ tier: 'RU', kind: 'line' }, { tier: 'RU', kind: 'line' }, { tier: 'RU', kind: 'line' }]);
        expect(new Set(out).size).toBe(out.length);
    });

    test('deterministic per seed', () => {
        expect(pick([{ tier: 'RU', kind: 'line' }], 42)).toEqual(pick([{ tier: 'RU', kind: 'line' }], 42));
    });
});

describe('preset helpers', () => {
    test('isDefaultStarterPreset recognises the canonical 9 and rejects others', () => {
        expect(isDefaultStarterPreset(DEFAULT_EXTRA_STARTER_PRESET)).toBe(true);
        expect(DEFAULT_EXTRA_STARTER_PRESET).toHaveLength(9);
        expect(isDefaultStarterPreset([{ tier: 'RU', kind: 'line' }])).toBe(false);
        expect(isDefaultStarterPreset(undefined)).toBe(false);
    });

    test('the vocabulary covers the seven tiers', () => {
        expect(Object.keys(EXTRA_STARTER_TIERS).sort()).toEqual(['LEGEND', 'NU', 'OU', 'PU', 'RU', 'UBERS', 'UU'].sort());
    });
});
