'use strict';

// T-052 Steps 7–8 — evolution-level adjustment is configurable: scalars (min, max, deviation, the
// three stage spacings) and the whole per-tier base-range / pre-evo-modifier tables. Every knob
// falls back to its constant, so a no-config call is byte-identical.

const rng = require('../../rng');
const {
    applyEvoLevels,
    resolveEvoParams,
    computeEvoLevel,
} = require('../../evoLevelWriter');
const {
    EVO_LEVEL_MIN, EVO_LEVEL_MAX, EVO_LEVEL_DEVIATION, EVO_LEVEL_STAGE_ADJUSTMENTS,
} = require('../../constants');

afterEach(() => rng.reset());

function makePoke(id, evolutions = [], tier = 'NU', evoType = 'EVO_TYPE_LC') {
    return { id, evolutions, rating: { tier }, evolutionData: { type: evoType } };
}

describe('resolveEvoParams', () => {
    test('no config → historical constants', () => {
        const p = resolveEvoParams();
        expect(p.min).toBe(EVO_LEVEL_MIN);
        expect(p.max).toBe(EVO_LEVEL_MAX);
        expect(p.deviation).toBe(EVO_LEVEL_DEVIATION);
        expect(p.stageAdjustments.EVO_TYPE_LC_OF_3).toBe(EVO_LEVEL_STAGE_ADJUSTMENTS.EVO_TYPE_LC_OF_3);
    });

    test('scalar + stage overrides are applied (frontend key names)', () => {
        const p = resolveEvoParams({ min: 3, max: 80, deviation: 0, stageAdjustments: { lcOf3: -0.5, nfeOf3: 0.5, lcOf2: 0.1 } });
        expect(p.min).toBe(3);
        expect(p.max).toBe(80);
        expect(p.deviation).toBe(0);
        expect(p.stageAdjustments.EVO_TYPE_LC_OF_3).toBe(-0.5);
        expect(p.stageAdjustments.EVO_TYPE_NFE_OF_3).toBe(0.5);
        expect(p.stageAdjustments.EVO_TYPE_LC_OF_2).toBe(0.1);
    });

    test('per-tier table overrides (Step 8)', () => {
        const p = resolveEvoParams({ baseRanges: { NU: [40, 40] }, preEvoModifiers: { NU: [0, 0] } });
        expect(p.baseRanges.NU).toEqual([40, 40]);
        expect(p.preEvoModifiers.NU).toEqual([0, 0]);
    });
});

describe('computeEvoLevel with degenerate (min==max) ranges → deterministic', () => {
    // baseRange [20,20], modifier [0,0], deviation 0 → level = round(20 * (1 + stageAdj)).
    const params = resolveEvoParams({
        baseRanges: { NU: [20, 20] }, preEvoModifiers: { NU: [0, 0] }, deviation: 0, min: 1, max: 100,
    });

    test('stage adjustment shifts the level', () => {
        rng.seed(1);
        expect(computeEvoLevel('NU', 'NU', 0, params)).toBe(20);
        rng.seed(1);
        expect(computeEvoLevel('NU', 'NU', 0.5, params)).toBe(30);
        rng.seed(1);
        expect(computeEvoLevel('NU', 'NU', -0.5, params)).toBe(10);
    });

    test('min / max clamps bound the result', () => {
        const clampHigh = resolveEvoParams({ baseRanges: { NU: [200, 200] }, preEvoModifiers: { NU: [0, 0] }, deviation: 0, max: 50 });
        rng.seed(1);
        expect(computeEvoLevel('NU', 'NU', 0, clampHigh)).toBe(50);
        const clampLow = resolveEvoParams({ baseRanges: { NU: [1, 1] }, preEvoModifiers: { NU: [0, 0] }, deviation: 0, min: 7 });
        rng.seed(1);
        expect(computeEvoLevel('NU', 'NU', 0, clampLow)).toBe(7);
    });
});

describe('applyEvoLevels', () => {
    test('default config is byte-identical to no config (per seed)', () => {
        const a = [makePoke('A', [{ method: 'LEVEL', param: '0', pokemon: 'B' }], 'NU'), makePoke('B', [], 'OU')];
        const b = [makePoke('A', [{ method: 'LEVEL', param: '0', pokemon: 'B' }], 'NU'), makePoke('B', [], 'OU')];
        rng.seed(99); applyEvoLevels(a);
        rng.seed(99); applyEvoLevels(b, {});
        expect(a[0].evolutions[0].param).toBe(b[0].evolutions[0].param);
    });

    test('min config raises every computed evolution level', () => {
        const pokes = [makePoke('A', [{ method: 'LEVEL', param: '0', pokemon: 'B' }], 'MAGIKARP'), makePoke('B', [], 'MAGIKARP')];
        rng.seed(3);
        applyEvoLevels(pokes, { min: 40 });
        expect(Number(pokes[0].evolutions[0].param)).toBeGreaterThanOrEqual(40);
    });
});
