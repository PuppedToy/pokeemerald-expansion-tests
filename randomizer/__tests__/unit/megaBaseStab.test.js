'use strict';

// T-062 — Mega base-form STAB. When a mega's type is MUTATED this run to a type its base lacks,
// the base form must learn at least one damaging move of that type (extras, decaying odds).

const moves = require('../fixtures/miniMoves');

// Fresh, isolated module + rng (mirrors the freshBalancer pattern in rebalancer.test.js) so
// rng.seed() controls behavior deterministically regardless of Jest worker/cache state.
function fresh() {
    let applyMegaBaseStab, rng;
    jest.isolateModules(() => {
        ({ applyMegaBaseStab } = require('../../megaBaseStab'));
        rng = require('../../rng');
    });
    return { applyMegaBaseStab, rng };
}

const STATUS = 'DAMAGE_CATEGORY_STATUS';
const typeMovesOf = (learnset, type) =>
    learnset.filter(l => moves[l.move] && moves[l.move].type === type);
const damagingTypeMovesOf = (learnset, type) =>
    typeMovesOf(learnset, type).filter(l => moves[l.move].category !== STATUS);

// Base Aggron (Steel/Rock) with NO Fighting move; Mega Aggron mutated to add FIGHTING.
function makeAggronBase() {
    return {
        id: 'SPECIES_AGGRON', family: 'P_FAMILY_ARON', form: null,
        parsedTypes: ['STEEL', 'ROCK'],
        evolutionData: { type: 'EVO_TYPE_FINAL', isMega: false, megaEvos: ['SPECIES_AGGRON_MEGA'] },
        learnset: [
            { level: '1', move: 'MOVE_TACKLE' },
            { level: '10', move: 'MOVE_METAL_CLAW' },
            { level: '20', move: 'MOVE_ROLLOUT' },
        ],
        log: [],
    };
}
function makeAggronMega(overrides = {}) {
    return {
        id: 'SPECIES_AGGRON_MEGA', family: 'P_FAMILY_ARON', form: 'Mega',
        parsedTypes: ['STEEL', 'FIGHTING'],
        evolutionData: { type: 'EVO_TYPE_MEGA', isMega: true, megaBaseForm: 'SPECIES_AGGRON' },
        learnset: [],
        log: [{ target: 'type', oldValue: null, value: 'FIGHTING' }],
        ...overrides,
    };
}

describe('applyMegaBaseStab (T-062)', () => {
    test('base gains at least one damaging move of the mega\'s mutated type', () => {
        const { applyMegaBaseStab, rng } = fresh();
        rng.seed(1);
        const base = makeAggronBase();
        const affected = applyMegaBaseStab([base, makeAggronMega()], moves);
        expect(damagingTypeMovesOf(base.learnset, 'FIGHTING').length).toBeGreaterThanOrEqual(1);
        expect(affected).toContain(base);
    });

    test('added moves are damaging, never status (Grass: Solar Beam, not Stun Spore)', () => {
        const { applyMegaBaseStab, rng } = fresh();
        rng.seed(7);
        const base = {
            id: 'SPECIES_X', family: 'F', form: null, parsedTypes: ['WATER'],
            evolutionData: { type: 'EVO_TYPE_FINAL', isMega: false },
            learnset: [{ level: '1', move: 'MOVE_SURF' }], log: [],
        };
        const mega = {
            id: 'SPECIES_X_MEGA', family: 'F', form: 'Mega', parsedTypes: ['WATER', 'GRASS'],
            evolutionData: { type: 'EVO_TYPE_MEGA', isMega: true, megaBaseForm: 'SPECIES_X' },
            learnset: [], log: [{ target: 'type', oldValue: null, value: 'GRASS' }],
        };
        applyMegaBaseStab([base, mega], moves);
        const grass = typeMovesOf(base.learnset, 'GRASS');
        expect(grass.length).toBeGreaterThanOrEqual(1);
        grass.forEach(l => expect(moves[l.move].category).not.toBe(STATUS));
    });

    test('adds moves — never removes existing learnset entries', () => {
        const { applyMegaBaseStab, rng } = fresh();
        rng.seed(3);
        const base = makeAggronBase();
        const before = base.learnset.map(l => l.move);
        applyMegaBaseStab([base, makeAggronMega()], moves);
        const after = base.learnset.map(l => l.move);
        before.forEach(mv => expect(after).toContain(mv));
        expect(after.length).toBeGreaterThan(before.length);
    });

    test('skips when the base already has a damaging move of the new type', () => {
        const { applyMegaBaseStab, rng } = fresh();
        rng.seed(5);
        const base = makeAggronBase();
        base.learnset.push({ level: '30', move: 'MOVE_CLOSE_COMBAT' }); // already Fighting-damaging
        const lenBefore = base.learnset.length;
        const affected = applyMegaBaseStab([base, makeAggronMega()], moves);
        expect(base.learnset.length).toBe(lenBefore);
        expect(affected).not.toContain(base);
    });

    test('ignores canonical-typed megas (no type-change log)', () => {
        const { applyMegaBaseStab, rng } = fresh();
        rng.seed(9);
        const base = makeAggronBase();
        const lenBefore = base.learnset.length;
        const affected = applyMegaBaseStab([base, makeAggronMega({ log: [] })], moves);
        expect(base.learnset.length).toBe(lenBefore);
        expect(affected).toEqual([]);
    });

    test('deterministic for a given seed', () => {
        const run = () => {
            const { applyMegaBaseStab, rng } = fresh();
            rng.seed(42);
            const base = makeAggronBase();
            applyMegaBaseStab([base, makeAggronMega()], moves);
            return base.learnset.map(l => `${l.move}@${l.level}`);
        };
        expect(run()).toEqual(run());
    });

    test('extra-move count decays (always >=1, never 3+ at moveInsertChance 0.5)', () => {
        const counts = {};
        for (let s = 0; s < 60; s++) {
            const { applyMegaBaseStab, rng } = fresh();
            rng.seed(s);
            const base = makeAggronBase();
            applyMegaBaseStab([base, makeAggronMega()], moves);
            const added = typeMovesOf(base.learnset, 'FIGHTING').length;
            counts[added] = (counts[added] || 0) + 1;
        }
        expect(counts[0]).toBeUndefined();                                   // always at least one
        expect(counts[1]).toBeGreaterThan(0);                                // usually exactly one
        expect(Object.keys(counts).every(k => Number(k) <= 2)).toBe(true);   // never 3+
    });
});
