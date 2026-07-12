'use strict';

// T-107 (107c) + T-118 — the archetype-biased candidate picker over crystallise-by-fit.

const rng = require('../../rng');
const { makeArchetypePicker, resolveIdentity, weightedSampleOne, BIAS_MIN_SOPH, IDENTITY_FIT } = require('../../modules/archetypePicker');
const { sample } = require('../../modules/utils');
const { getArchetypeModel } = require('../../archetypes');

const singles = getArchetypeModel('singles');

function mon(overrides = {}) {
    return {
        id: 'SPECIES_TEST', parsedTypes: ['NORMAL'], parsedAbilities: [],
        baseHP: 70, baseAttack: 70, baseDefense: 70, baseSpeed: 70, baseSpAttack: 70, baseSpDefense: 70,
        learnset: [], teachables: [], evolutionData: { isMega: false }, ...overrides,
    };
}
const learn = (...mv) => ({ learnset: mv.map(m => ({ level: '1', move: m })) });
const regenPivot = (id) => mon({ id, parsedAbilities: ['REGENERATOR'], baseHP: 100, baseDefense: 90, baseSpDefense: 90 });
const wallbreaker = (id) => mon({ id, baseAttack: 130 });
const sweeper = (id) => mon({ id, baseAttack: 120, ...learn('MOVE_DRAGON_DANCE') });
const rocker = (id) => mon({ id, ...learn('MOVE_STEALTH_ROCK') });
const defogger = (id) => mon({ id, ...learn('MOVE_DEFOG') });
const plain = (id) => mon({ id });
// A team that fits Balance (regen backbone + hazard game + win condition), WITHOUT a wallbreaker —
// so Balance has emerged (fit ~0.78) and still wants a wallbreaker (biasable).
const balanceTeam = () => [regenPivot('R1'), sweeper('SW'), rocker('RK'), defogger('DF')];

describe('weightedSampleOne', () => {
    test('honours extreme weights deterministically', () => {
        const a = { id: 'A' }, b = { id: 'B' };
        for (let s = 1; s <= 5; s++) {
            rng.seed(s); expect(weightedSampleOne([a, b], [0, 1])).toBe(b);
            rng.seed(s); expect(weightedSampleOne([a, b], [1, 0])).toBe(a);
        }
    });
    test('degenerate (all-zero) weights fall back to sample', () => {
        const items = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
        for (let s = 1; s <= 5; s++) {
            rng.seed(s); const w = weightedSampleOne(items, [0, 0, 0]);
            rng.seed(s); expect(w).toBe(sample(items));
        }
    });
});

describe('makeArchetypePicker — fallbacks are byte-identical to sample()', () => {
    const identical = (picker, list) => {
        for (let s = 1; s <= 20; s++) {
            rng.seed(s); const smp = sample(list);
            rng.seed(s); if (smp !== picker(list)) return false;
        }
        return true;
    };
    test('fewer than 2 candidates → sample', () => {
        const picker = makeArchetypePicker({ model: singles, context: { team: balanceTeam(), sophistication: 1 }, ctx: {} });
        const only = mon({ id: 'ONLY' });
        rng.seed(1); expect(picker([only])).toBe(only);
    });
    test('sophistication below the bias threshold → sample (early-game byte-identical)', () => {
        const context = { team: balanceTeam(), sophistication: BIAS_MIN_SOPH - 0.01 };
        expect(identical(makeArchetypePicker({ model: singles, context, ctx: {} }), [plain('A'), wallbreaker('B'), plain('C')])).toBe(true);
    });
    test('no model → sample', () => {
        const context = { team: balanceTeam(), sophistication: 1 };
        expect(identical(makeArchetypePicker({ model: null, context, ctx: {} }), [plain('A'), wallbreaker('B')])).toBe(true);
    });
    test('no emerged identity (incoherent team) → sample', () => {
        const context = { team: [plain('X'), plain('Y')], sophistication: 1 };
        expect(identical(makeArchetypePicker({ model: singles, context, ctx: {} }), [plain('A'), wallbreaker('B')])).toBe(true);
    });
    test('emerged identity but no candidate improves fit → sample', () => {
        const context = { team: balanceTeam(), sophistication: 1 };
        expect(identical(makeArchetypePicker({ model: singles, context, ctx: {} }), [plain('A'), plain('B'), plain('C')])).toBe(true);
    });
});

describe('makeArchetypePicker — biases toward archetype fit at high sophistication', () => {
    test('a fitting candidate is picked more often than uniform, but not always', () => {
        // Balance emerged; it still wants a wallbreaker → the wallbreaker candidate gets extra weight.
        const context = { team: balanceTeam(), sophistication: 1 };
        const picker = makeArchetypePicker({ model: singles, context, ctx: {} });
        const cands = [plain('PLAIN'), wallbreaker('WB')];
        let wb = 0, pl = 0;
        for (let s = 1; s <= 300; s++) { rng.seed(s); (picker(cands).id === 'WB' ? wb++ : pl++); }
        expect(wb).toBeGreaterThan(pl);
        expect(pl).toBeGreaterThan(0);
    });
    test('T-124 (Wattson) — an electricTerrain seed HARD-prefers Electric-type candidates', () => {
        const context = { team: [], sophistication: 0.6, archetypeSeed: { base: 'bulky_offense', electricTerrain: true } };
        const picker = makeArchetypePicker({ model: singles, context, ctx: {} });
        const electricMon = mon({ id: 'ELEC', parsedTypes: ['ELECTRIC'] });
        // one Electric among non-Electric → always chosen (it can actually run the terrain)
        for (let s = 1; s <= 10; s++) { rng.seed(s); expect(picker([plain('A'), electricMon, plain('B')]).id).toBe('ELEC'); }
        // no Electric available (Wattson rolled another type) → falls back gracefully, no crash
        rng.seed(1); expect(['A', 'B']).toContain(picker([plain('A'), plain('B')]).id);
    });

    test('IDENTITY_FIT gates biasing — a partial team below the fit stays unbiased', () => {
        expect(IDENTITY_FIT).toBeGreaterThan(0.3);
        const context = { team: [regenPivot('R1')], sophistication: 1 }; // lone regen pivot → balance fit ~0.24 < 0.5
        const picker = makeArchetypePicker({ model: singles, context, ctx: {} });
        const list = [plain('A'), wallbreaker('B')];
        for (let s = 1; s <= 20; s++) {
            rng.seed(s); const smp = sample(list);
            rng.seed(s); expect(picker(list)).toBe(smp);
        }
    });
});

describe('resolveIdentity (T-107 107e / T-118) — emergent, else seed, else null', () => {
    test('emergent identity when a coherent team fits a recipe', () => {
        const id = resolveIdentity(balanceTeam(), singles, {}, null);
        expect(id.source).toBe('emergent');
        expect(id.baseId).toBe('balance');
    });
    test('falls back to the seed when no recipe fits', () => {
        const id = resolveIdentity([plain('X')], singles, {}, { base: 'hyper_offense', gimmicks: ['weather'] });
        expect(id.source).toBe('seed');
        expect(id.baseId).toBe('hyper_offense');
        expect(id.gimmickIds).toEqual(['weather']);
    });
    test('emergent overrides the seed', () => {
        const id = resolveIdentity(balanceTeam(), singles, {}, { base: 'full_stall' });
        expect(id.source).toBe('emergent');
        expect(id.baseId).toBe('balance');
    });
    test('T-123 — hyper_offense is last-resort: a team that also fits another base takes the other', () => {
        // 2 setup sweepers + a hazard lead → hyper fits; regen + wallbreaker also make Balance fit.
        const team = [sweeper('S1'), sweeper('S2'), regenPivot('R'), wallbreaker('W'), rocker('K')];
        expect(resolveIdentity(team, singles, {}, null).baseId).toBe('balance');
    });
    test('T-123 — hyper_offense still emerges when nothing else fits', () => {
        expect(resolveIdentity([sweeper('S1'), sweeper('S2'), rocker('K')], singles, {}, null).baseId).toBe('hyper_offense');
    });

    test('no recipe fit and no seed → null', () => {
        expect(resolveIdentity([plain('X')], singles, {}, null)).toBeNull();
    });
});

describe('makeArchetypePicker — a seed primes biasing before any identity emerges', () => {
    test('a Balance-seeded trainer biases the first pick toward Balance roles (empty team)', () => {
        const context = { team: [], sophistication: 1, archetypeSeed: { base: 'balance' } };
        const picker = makeArchetypePicker({ model: singles, context, ctx: {} });
        const cands = [plain('PLAIN'), wallbreaker('WB')]; // Balance wants a wallbreaker
        let wb = 0, pl = 0;
        for (let s = 1; s <= 300; s++) { rng.seed(s); (picker(cands).id === 'WB' ? wb++ : pl++); }
        expect(wb).toBeGreaterThan(pl);
        expect(pl).toBeGreaterThan(0);
    });
    test('with no seed and an empty team, the first pick is unbiased (byte-identical)', () => {
        const context = { team: [], sophistication: 1, archetypeSeed: null };
        const picker = makeArchetypePicker({ model: singles, context, ctx: {} });
        const list = [plain('PLAIN'), wallbreaker('WB')];
        for (let s = 1; s <= 20; s++) {
            rng.seed(s); const smp = sample(list);
            rng.seed(s); expect(picker(list)).toBe(smp);
        }
    });
});
