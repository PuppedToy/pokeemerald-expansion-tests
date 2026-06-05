'use strict';

const rng = require('../../rng');
const { buildWildPlaceholderMap } = require('../../writer');

afterEach(() => rng.reset());

describe('buildWildPlaceholderMap', () => {
    test('does not consume any RNG calls', () => {
        rng.seed(42);
        const baseline = rng.random();

        rng.seed(42);
        buildWildPlaceholderMap([['SPECIES_PIKACHU', 'SPECIES_RAICHU']]);
        const after = rng.random();

        expect(after).toBe(baseline);
    });

    test('generates same placeholders regardless of RNG seed', () => {
        const entries = [['SPECIES_BULBASAUR', 'SPECIES_CHIKORITA'], ['SPECIES_PIKACHU', 'SPECIES_RAICHU']];

        rng.seed(1);
        const result1 = buildWildPlaceholderMap(entries);

        rng.seed(99999);
        const result2 = buildWildPlaceholderMap(entries);

        expect(result1).toEqual(result2);
    });

    test('generates unique placeholder for each species', () => {
        const entries = [['SPECIES_A', 'X'], ['SPECIES_B', 'Y'], ['SPECIES_C', 'Z']];
        const result = buildWildPlaceholderMap(entries);
        const placeholders = Object.values(result);
        expect(new Set(placeholders).size).toBe(placeholders.length);
    });
});
