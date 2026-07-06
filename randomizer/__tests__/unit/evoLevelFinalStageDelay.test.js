'use strict';

// T-066 — 3-stage lines into a strong FINAL (stage-2) mon evolve their stage0→1 LATER, scaled by
// the final tier (OU/UBERS/LEGEND/AG), while always keeping >=2 levels between stage0→1 and 1→2.
// Branching lines key the delay per-branch (down each stage-1's own evolutions) and the gap
// safeguard uses the smallest stage1→2 level.

const rng = require('../../rng');
const { applyEvoLevels, computeEvoLevel, resolveEvoParams, finalStageTierFor } = require('../../evoLevelWriter');

afterEach(() => rng.reset());

const poke = (id, tier, evoType, evolutions = []) => ({ id, rating: { tier }, evolutionData: { type: evoType }, evolutions });
const lvl = (target) => ({ method: 'LEVEL', param: '0', pokemon: target });
const readParam = (p) => Number(p.evolutions[0].param);

// Config: L1 base is keyed by the stage-1 target's tier; give stage-2 targets a high base so the
// gap safeguard doesn't interfere with pure delay tests. deviation 0, wide clamp → deterministic.
const baseCfg = (finalStageDelays) => ({
    baseRanges: { NU: [100, 100], RU: [100, 100], OU: [190, 190], UBERS: [190, 190], LEGEND: [190, 190], AG: [190, 190] },
    preEvoModifiers: { NU: [0, 0], RU: [0, 0], OU: [0, 0], UBERS: [0, 0], LEGEND: [0, 0], AG: [0, 0] },
    deviation: 0, min: 1, max: 300, finalStageDelays,
});
const FIXED_BANDS = { OU: [0.10, 0.10], UBERS: [0.20, 0.20], LEGEND: [0.30, 0.30], AG: [0.50, 0.50] };

// 3-stage line: S0 (LC_OF_3) -> S1 (NFE_OF_3) -> S2 (final of the given tier).
const threeStage = (finalTier) => [
    poke('S0', 'NU', 'EVO_TYPE_LC_OF_3', [lvl('S1')]),
    poke('S1', 'NU', 'EVO_TYPE_NFE_OF_3', [lvl('S2')]),
    poke('S2', finalTier, 'EVO_TYPE_FINAL', []),
];

describe('computeEvoLevel — finalDelay (T-066)', () => {
    const params = resolveEvoParams({ baseRanges: { NU: [20, 20] }, preEvoModifiers: { NU: [0, 0] }, deviation: 0, min: 1, max: 100 });
    test('finalDelay shifts the level and is monotonic', () => {
        rng.seed(1); const d0 = computeEvoLevel('NU', 'NU', 0, params, 0);
        rng.seed(1); const d3 = computeEvoLevel('NU', 'NU', 0, params, 0.3);
        rng.seed(1); const d5 = computeEvoLevel('NU', 'NU', 0, params, 0.5);
        expect(d0).toBe(20);
        expect(d3).toBe(26); // round(20 * 1.3)
        expect(d5).toBe(30); // round(20 * 1.5)
        expect(d0).toBeLessThan(d3);
        expect(d3).toBeLessThan(d5);
    });
});

describe('finalStageTierFor (T-066)', () => {
    test('returns the MAX tier among a stage-1\'s stage-2 targets', () => {
        const map = new Map([['A', poke('A', 'NU', 'EVO_TYPE_FINAL')], ['B', poke('B', 'AG', 'EVO_TYPE_FINAL')]]);
        const stage1 = poke('S1', 'RU', 'EVO_TYPE_NFE_OF_3', [lvl('A'), lvl('B')]);
        expect(finalStageTierFor(stage1, map)).toBe('AG');
    });
    test('returns null for a stage-1 with no level/stone evolutions', () => {
        expect(finalStageTierFor(poke('X', 'RU', 'EVO_TYPE_FINAL', []), new Map())).toBeNull();
    });
});

describe('applyEvoLevels — stage0→1 delay by final tier (T-066)', () => {
    test('L1 increases monotonically with the final stage-2 tier; sub-OU gets no delay', () => {
        const l1For = (finalTier) => {
            const pokes = threeStage(finalTier);
            rng.seed(1);
            applyEvoLevels(pokes, baseCfg(FIXED_BANDS));
            return readParam(pokes[0]);
        };
        const ru = l1For('RU'), ou = l1For('OU'), ubers = l1For('UBERS'), legend = l1For('LEGEND'), ag = l1For('AG');
        expect(ru).toBe(90);                       // round(100 * (1 - 0.10)), no delay below OU
        expect(ou).toBe(100);                      // + 0.10
        expect(ubers).toBe(110);
        expect(legend).toBe(120);
        expect(ag).toBe(140);
        expect([ru, ou, ubers, legend, ag]).toEqual([...[ru, ou, ubers, legend, ag]].sort((a, b) => a - b));
    });

    test('disabling the feature (finalStageDelays: {}) removes the delay for any final tier', () => {
        const l1Disabled = (finalTier) => {
            const pokes = threeStage(finalTier);
            rng.seed(1);
            applyEvoLevels(pokes, baseCfg({}));
            return readParam(pokes[0]);
        };
        // No delay → L1 identical regardless of final tier (all = the sub-OU baseline).
        expect(l1Disabled('AG')).toBe(l1Disabled('RU'));
        expect(l1Disabled('AG')).toBe(90);
    });
});

describe('applyEvoLevels — 2-level gap safeguard (T-066)', () => {
    test('guarantees >=2 levels between stage0→1 and stage1→2 even against a low stage1→2', () => {
        // L1 base high (stage-1 tier OU → [60,60]) + a big AG delay would push L1 way past a low L2.
        const pokes = [
            poke('S0', 'NU', 'EVO_TYPE_LC_OF_3', [lvl('S1')]),
            poke('S1', 'OU', 'EVO_TYPE_NFE_OF_3', [lvl('S2')]),
            poke('S2', 'AG', 'EVO_TYPE_FINAL', []),
        ];
        const cfg = {
            baseRanges: { OU: [60, 60], AG: [50, 50] }, // L1 base 60 (target S1=OU); L2 base 50 (target S2=AG)
            preEvoModifiers: { NU: [0, 0], OU: [0, 0] },
            deviation: 0, min: 1, max: 100, finalStageDelays: { AG: [0.50, 0.50] },
        };
        rng.seed(1);
        applyEvoLevels(pokes, cfg);
        const l1 = Number(pokes[0].evolutions[0].param);
        const l2 = Number(pokes[1].evolutions[0].param);
        expect(l2 - l1).toBeGreaterThanOrEqual(2);
    });
});

describe('applyEvoLevels — 2-stage lines untouched (T-066)', () => {
    test('an LC_OF_2 line gets no final-stage delay and is byte-identical with/without the feature', () => {
        const make = () => [poke('S0', 'NU', 'EVO_TYPE_LC_OF_2', [lvl('S1')]), poke('S1', 'AG', 'EVO_TYPE_FINAL', [])];
        const withFeat = make(); rng.seed(5); applyEvoLevels(withFeat, baseCfg(FIXED_BANDS));
        const without = make();  rng.seed(5); applyEvoLevels(without, baseCfg({}));
        expect(readParam(withFeat[0])).toBe(readParam(without[0]));
    });
});

describe('applyEvoLevels — branching (T-066)', () => {
    test('a branching stage-0 delays each branch by ITS OWN final tier', () => {
        // Wurmple-like: S0 -> {S1A -> S2A(NU), S1B -> S2B(AG)}.
        const pokes = [
            poke('S0', 'NU', 'EVO_TYPE_LC_OF_3', [lvl('S1A'), lvl('S1B')]),
            poke('S1A', 'NU', 'EVO_TYPE_NFE_OF_3', [lvl('S2A')]),
            poke('S1B', 'NU', 'EVO_TYPE_NFE_OF_3', [lvl('S2B')]),
            poke('S2A', 'NU', 'EVO_TYPE_FINAL', []),
            poke('S2B', 'AG', 'EVO_TYPE_FINAL', []),
        ];
        rng.seed(1);
        applyEvoLevels(pokes, baseCfg({ AG: [0.50, 0.50] }));
        const l1a = Number(pokes[0].evolutions[0].param); // → S1A, final NU → no delay
        const l1b = Number(pokes[0].evolutions[1].param); // → S1B, final AG → big delay
        expect(l1a).toBe(90);
        expect(l1b).toBeGreaterThan(l1a);
    });

    test('a branching stage-2 uses the SMALLEST stage1→2 level for the gap safeguard', () => {
        // S1 branches to S2A@lowLevel and S2B@higherLevel; the cap must respect the smaller (S2A).
        const pokes = [
            poke('S0', 'NU', 'EVO_TYPE_LC_OF_3', [lvl('S1')]),
            poke('S1', 'OU', 'EVO_TYPE_NFE_OF_3', [lvl('S2A'), lvl('S2B')]),
            poke('S2A', 'NU', 'EVO_TYPE_FINAL', []), // target NU → base [50,50] → L2A = 55
            poke('S2B', 'RU', 'EVO_TYPE_FINAL', []), // target RU → base [80,80] → L2B = 88
        ];
        const cfg = {
            baseRanges: { OU: [60, 60], NU: [50, 50], RU: [80, 80] },
            preEvoModifiers: { NU: [0, 0], OU: [0, 0] },
            deviation: 0, min: 1, max: 100, finalStageDelays: FIXED_BANDS,
        };
        rng.seed(1);
        applyEvoLevels(pokes, cfg);
        const l1 = Number(pokes[0].evolutions[0].param);
        const l2a = Number(pokes[1].evolutions[0].param); // 55 (the minimum)
        expect(l2a - l1).toBeGreaterThanOrEqual(2); // gap respected against the SMALLER stage1→2
    });
});
