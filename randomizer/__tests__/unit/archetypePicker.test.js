'use strict';

// T-107 (107c) — the archetype-biased candidate picker. Falls back to plain sample() (byte-identical
// to the un-biased engine) unless a coherent identity has emerged AND sophistication is high enough;
// then it biases the pick toward archetype fit with a single RNG draw (determinism-preserving).

const rng = require('../../rng');
const { makeArchetypePicker, resolveIdentity, weightedSampleOne, BIAS_MIN_SOPH, IDENTITY_FLOOR } = require('../../modules/archetypePicker');
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
const regenPivot = (id) => mon({ id, parsedAbilities: ['REGENERATOR'], baseHP: 100, baseDefense: 90, baseSpDefense: 90 });
const wallbreaker = (id) => mon({ id, baseAttack: 130 });
const plain = (id) => mon({ id });

describe('weightedSampleOne', () => {
    test('honours extreme weights deterministically', () => {
        const a = { id: 'A' }, b = { id: 'B' };
        for (let s = 1; s <= 5; s++) {
            rng.seed(s);
            expect(weightedSampleOne([a, b], [0, 1])).toBe(b);
            rng.seed(s);
            expect(weightedSampleOne([a, b], [1, 0])).toBe(a);
        }
    });
    test('degenerate (all-zero) weights fall back to sample', () => {
        const items = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
        for (let s = 1; s <= 5; s++) {
            rng.seed(s);
            const w = weightedSampleOne(items, [0, 0, 0]);
            rng.seed(s);
            const smp = sample(items);
            expect(w).toBe(smp);
        }
    });
});

describe('makeArchetypePicker — fallbacks are byte-identical to sample()', () => {
    const identical = (picker, list) => {
        for (let s = 1; s <= 20; s++) {
            rng.seed(s);
            const smp = sample(list);
            rng.seed(s);
            const picked = picker(list);
            if (smp !== picked) return false;
        }
        return true;
    };

    test('fewer than 2 candidates → sample', () => {
        const picker = makeArchetypePicker({ model: singles, context: { team: [], sophistication: 1 }, ctx: {} });
        rng.seed(1); const only = mon({ id: 'ONLY' });
        expect(picker([only])).toBe(only);
    });
    test('sophistication below the bias threshold → sample (early-game byte-identical)', () => {
        const context = { team: [regenPivot('R1'), regenPivot('R2')], sophistication: BIAS_MIN_SOPH - 0.01 };
        const picker = makeArchetypePicker({ model: singles, context, ctx: {} });
        expect(identical(picker, [plain('A'), wallbreaker('B'), plain('C')])).toBe(true);
    });
    test('no model → sample', () => {
        const context = { team: [regenPivot('R1'), regenPivot('R2')], sophistication: 1 };
        const picker = makeArchetypePicker({ model: null, context, ctx: {} });
        expect(identical(picker, [plain('A'), wallbreaker('B')])).toBe(true);
    });
    test('no emerged identity (incoherent team) → sample', () => {
        const context = { team: [plain('X'), plain('Y')], sophistication: 1 };
        const picker = makeArchetypePicker({ model: singles, context, ctx: {} });
        expect(identical(picker, [plain('A'), wallbreaker('B')])).toBe(true);
    });
    test('emerged identity but no candidate improves fit → sample', () => {
        // Balance emerged (2 regen pivots); candidates are all non-fitting plain mons.
        const context = { team: [regenPivot('R1'), regenPivot('R2')], sophistication: 1 };
        const picker = makeArchetypePicker({ model: singles, context, ctx: {} });
        expect(identical(picker, [plain('A'), plain('B'), plain('C')])).toBe(true);
    });
});

describe('makeArchetypePicker — biases toward archetype fit at high sophistication', () => {
    test('a fitting candidate is picked more often than uniform, but not always', () => {
        // Balance identity emerged (confidence 1 >= floor). Balance structure wants a wallbreaker
        // (min 1, team has 0) → the wallbreaker candidate gets extra weight; the plain one does not.
        const context = { team: [regenPivot('R1'), regenPivot('R2')], sophistication: 1 };
        expect(context.team.length).toBeGreaterThan(0);
        const picker = makeArchetypePicker({ model: singles, context, ctx: {} });
        const cands = [plain('PLAIN'), wallbreaker('WB')];
        let wb = 0, pl = 0;
        for (let s = 1; s <= 300; s++) {
            rng.seed(s);
            const pick = picker(cands);
            if (pick.id === 'WB') wb++; else pl++;
        }
        expect(wb).toBeGreaterThan(pl);   // biased toward the fitting candidate
        expect(pl).toBeGreaterThan(0);    // ...but not deterministic (residual randomness)
    });

    test('IDENTITY_FLOOR gates biasing — a partial identity below the floor stays unbiased', () => {
        // A single Regenerator pivot → balance entry confidence 0.5, which is below the floor, so the
        // picker must NOT bias yet (byte-identical to sample).
        expect(IDENTITY_FLOOR).toBeGreaterThan(0.5);
        const context = { team: [regenPivot('R1')], sophistication: 1 }; // balance confidence 0.5
        const picker = makeArchetypePicker({ model: singles, context, ctx: {} });
        const list = [plain('A'), wallbreaker('B')];
        for (let s = 1; s <= 20; s++) {
            rng.seed(s); const smp = sample(list);
            rng.seed(s); const picked = picker(list);
            expect(picked).toBe(smp);
        }
    });
});

describe('resolveIdentity (T-107 107e) — emergent, else seed, else null', () => {
    test('emergent identity when a coherent team has crossed the floor', () => {
        const id = resolveIdentity([regenPivot('R1'), regenPivot('R2')], singles, {}, null);
        expect(id.source).toBe('emergent');
        expect(id.baseId).toBe('balance');
    });
    test('falls back to the seed when no identity has emerged', () => {
        const id = resolveIdentity([plain('X')], singles, {}, { base: 'hyper_offense', gimmicks: ['weather'] });
        expect(id.source).toBe('seed');
        expect(id.baseId).toBe('hyper_offense');
        expect(id.gimmickIds).toEqual(['weather']);
    });
    test('emergent overrides the seed', () => {
        const id = resolveIdentity([regenPivot('R1'), regenPivot('R2')], singles, {}, { base: 'full_stall' });
        expect(id.source).toBe('emergent');
        expect(id.baseId).toBe('balance');
    });
    test('no identity and no seed → null', () => {
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
            rng.seed(s); const picked = picker(list);
            expect(picked).toBe(smp);
        }
    });
});
