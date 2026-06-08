'use strict';

const rng = require('../../rng');
const { applyEvoLevels, buildEvoLevelMapFromParams } = require('../../evoLevelWriter');

afterEach(() => rng.reset());

// Minimal pokemon shape used by evoLevelWriter (evolutions[].method/param/pokemon + rating.tier)
function makePoke(id, evolutions = [], tier = 'NU') {
    return { id, evolutions, rating: { tier }, evolutionData: { type: 'EVO_TYPE_LC' } };
}

describe('buildEvoLevelMapFromParams', () => {
    test('reads the evolution levels already stored on each pokemon (no recompute)', () => {
        const pokes = [
            makePoke('SPECIES_BULBASAUR', [{ method: 'LEVEL', param: '20', pokemon: 'SPECIES_IVYSAUR' }]),
            makePoke('SPECIES_IVYSAUR', [{ method: 'LEVEL', param: '32', pokemon: 'SPECIES_VENUSAUR' }]),
        ];
        const map = buildEvoLevelMapFromParams(pokes);
        expect(map.get('SPECIES_IVYSAUR')).toBe(20);
        expect(map.get('SPECIES_VENUSAUR')).toBe(32);
    });

    test('ignores non-LEVEL evolutions', () => {
        const pokes = [
            makePoke('SPECIES_EEVEE', [
                { method: 'ITEM', param: 'ITEM_WATER_STONE', pokemon: 'SPECIES_VAPOREON' },
                { method: 'LEVEL', param: '25', pokemon: 'SPECIES_ESPEON' },
            ]),
        ];
        const map = buildEvoLevelMapFromParams(pokes);
        expect(map.has('SPECIES_VAPOREON')).toBe(false);
        expect(map.get('SPECIES_ESPEON')).toBe(25);
    });

    test('does not consume any RNG calls', () => {
        const pokes = [makePoke('SPECIES_BULBASAUR', [{ method: 'LEVEL', param: '20', pokemon: 'SPECIES_IVYSAUR' }])];
        rng.seed(42);
        const baseline = rng.random();
        rng.seed(42);
        buildEvoLevelMapFromParams(pokes);
        const after = rng.random();
        expect(after).toBe(baseline);
    });

    test('returns the same levels that applyEvoLevels wrote into evo.param (round-trip)', () => {
        const pokes = [
            makePoke('SPECIES_A', [{ method: 'LEVEL', param: '0', pokemon: 'SPECIES_B' }], 'NU'),
            makePoke('SPECIES_B', [], 'NU'),
        ];
        rng.seed(7);
        const applied = applyEvoLevels(pokes);          // mutates evo.param
        const fromParams = buildEvoLevelMapFromParams(pokes);
        expect(fromParams.get('SPECIES_B')).toBe(applied.get('SPECIES_B'));
    });
});
