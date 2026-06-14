'use strict';

const rng = require('../../rng');
const {
    applyEvoLevels,
    buildEvoLevelMapFromParams,
    patchEvoLevelInContent,
    patchStoneMinLevelInContent,
} = require('../../evoLevelWriter');

afterEach(() => rng.reset());

// Minimal pokemon shape used by evoLevelWriter (evolutions[].method/param/pokemon + rating.tier)
function makePoke(id, evolutions = [], tier = 'NU') {
    return { id, evolutions, rating: { tier }, evolutionData: { type: 'EVO_TYPE_LC' } };
}

describe('buildEvoLevelMapFromParams — levelMap', () => {
    test('reads the evolution levels already stored on each pokemon (no recompute)', () => {
        const pokes = [
            makePoke('SPECIES_BULBASAUR', [{ method: 'LEVEL', param: '20', pokemon: 'SPECIES_IVYSAUR' }]),
            makePoke('SPECIES_IVYSAUR', [{ method: 'LEVEL', param: '32', pokemon: 'SPECIES_VENUSAUR' }]),
        ];
        const { levelMap } = buildEvoLevelMapFromParams(pokes);
        expect(levelMap.get('SPECIES_IVYSAUR')).toBe(20);
        expect(levelMap.get('SPECIES_VENUSAUR')).toBe(32);
    });

    test('LEVEL map ignores stone (ITEM) evolutions', () => {
        const pokes = [
            makePoke('SPECIES_EEVEE', [
                { method: 'ITEM', param: 'ITEM_WATER_STONE', pokemon: 'SPECIES_VAPOREON', minLevel: '30' },
                { method: 'LEVEL', param: '25', pokemon: 'SPECIES_ESPEON' },
            ]),
        ];
        const { levelMap } = buildEvoLevelMapFromParams(pokes);
        expect(levelMap.has('SPECIES_VAPOREON')).toBe(false);
        expect(levelMap.get('SPECIES_ESPEON')).toBe(25);
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
        const { levelMap: applied } = applyEvoLevels(pokes);   // mutates evo.param
        const { levelMap: fromParams } = buildEvoLevelMapFromParams(pokes);
        expect(fromParams.get('SPECIES_B')).toBe(applied.get('SPECIES_B'));
    });
});

describe('stone (IF_MIN_LEVEL) balancing', () => {
    test('applyEvoLevels assigns a numeric minLevel to stone evos and records them in stoneMap', () => {
        const pokes = [
            makePoke('SPECIES_VULPIX', [{ method: 'ITEM', param: 'ITEM_FIRE_STONE', pokemon: 'SPECIES_NINETALES' }], 'NU'),
            makePoke('SPECIES_NINETALES', [], 'UU'),
        ];
        rng.seed(11);
        const { levelMap, stoneMap } = applyEvoLevels(pokes);
        // Stone target lands in the stone map, not the level map
        expect(stoneMap.has('SPECIES_NINETALES')).toBe(true);
        expect(levelMap.has('SPECIES_NINETALES')).toBe(false);
        // A real level was computed and stored on evo.minLevel; the item param is untouched
        const evo = pokes[0].evolutions[0];
        expect(evo.param).toBe('ITEM_FIRE_STONE');
        expect(Number(evo.minLevel)).toBe(stoneMap.get('SPECIES_NINETALES'));
        expect(Number.isInteger(stoneMap.get('SPECIES_NINETALES'))).toBe(true);
    });

    test('buildEvoLevelMapFromParams reads minLevel for stone evos into stoneMap (no recompute)', () => {
        const pokes = [
            makePoke('SPECIES_EEVEE', [
                { method: 'ITEM', param: 'ITEM_WATER_STONE', pokemon: 'SPECIES_VAPOREON', minLevel: '30' },
                { method: 'ITEM', param: 'ITEM_THUNDER_STONE', pokemon: 'SPECIES_JOLTEON', minLevel: '41' },
            ]),
        ];
        const { stoneMap } = buildEvoLevelMapFromParams(pokes);
        expect(stoneMap.get('SPECIES_VAPOREON')).toBe(30);
        expect(stoneMap.get('SPECIES_JOLTEON')).toBe(41);
    });

    test('each branch is balanced independently (per-target levels can differ)', () => {
        const pokes = [
            makePoke('SPECIES_EEVEE', [
                { method: 'ITEM', param: 'ITEM_WATER_STONE', pokemon: 'SPECIES_VAPOREON' },
                { method: 'ITEM', param: 'ITEM_FIRE_STONE', pokemon: 'SPECIES_FLAREON' },
            ], 'NU'),
            makePoke('SPECIES_VAPOREON', [], 'MAGIKARP'),  // weakest target → earliest level
            makePoke('SPECIES_FLAREON', [], 'AG'),          // strongest target → latest level
        ];
        rng.seed(3);
        const { stoneMap } = applyEvoLevels(pokes);
        expect(stoneMap.get('SPECIES_VAPOREON')).toBeLessThan(stoneMap.get('SPECIES_FLAREON'));
    });
});

describe('content patch helpers', () => {
    test('patchEvoLevelInContent rewrites a plain {EVO_LEVEL, N, SPECIES}', () => {
        const content = '.evolutions = EVOLUTION({EVO_LEVEL, 16, SPECIES_IVYSAUR}),';
        expect(patchEvoLevelInContent(content, 'SPECIES_IVYSAUR', 22))
            .toBe('.evolutions = EVOLUTION({EVO_LEVEL, 22, SPECIES_IVYSAUR}),');
    });

    test('patchEvoLevelInContent leaves conditional (param 0) level evos untouched', () => {
        const content = '{EVO_LEVEL, 0, SPECIES_CROBAT, CONDITIONS({IF_MIN_FRIENDSHIP, 220})}';
        expect(patchEvoLevelInContent(content, 'SPECIES_CROBAT', 30)).toBe(content);
    });

    test('patchStoneMinLevelInContent rewrites only the IF_MIN_LEVEL number, keeping item + species', () => {
        const content = '{EVO_ITEM, ITEM_FIRE_STONE, SPECIES_NINETALES, CONDITIONS({IF_MIN_LEVEL, 25})}';
        expect(patchStoneMinLevelInContent(content, 'SPECIES_NINETALES', 34))
            .toBe('{EVO_ITEM, ITEM_FIRE_STONE, SPECIES_NINETALES, CONDITIONS({IF_MIN_LEVEL, 34})}');
    });

    test('patchStoneMinLevelInContent does not touch a different species', () => {
        const content = '{EVO_ITEM, ITEM_FIRE_STONE, SPECIES_NINETALES, CONDITIONS({IF_MIN_LEVEL, 25})}';
        expect(patchStoneMinLevelInContent(content, 'SPECIES_VAPOREON', 34)).toBe(content);
    });
});
