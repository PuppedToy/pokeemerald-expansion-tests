'use strict';

// T-187 — Move mutation core.
// moveMutator uses the shared ./rng singleton; requiring it here yields the SAME instance,
// so rng.seed() controls the mutator deterministically.
const rng = require('../../rng');
const baseMoves = require('../fixtures/miniMoves');
const { POKEMON_TYPES } = require('../../constants');
const { mutateMove, mutateAllMoves } = require('../../moveMutator');

const clone = (o) => JSON.parse(JSON.stringify(o));
const m = (id) => clone(baseMoves[id]);

// Field-probability presets (gate always open unless stated).
const ALWAYS = { moveMutationChance: 1, movePowerChance: 1, moveAccuracyChance: 1, moveTypeChance: 1, moveCategoryChance: 1 };
const ONLY_POWER = { moveMutationChance: 1, movePowerChance: 1, moveAccuracyChance: 0, moveTypeChance: 0, moveCategoryChance: 0 };
const ONLY_ACC = { moveMutationChance: 1, movePowerChance: 0, moveAccuracyChance: 1, moveTypeChance: 0, moveCategoryChance: 0 };
const ONLY_TYPE = { moveMutationChance: 1, movePowerChance: 0, moveAccuracyChance: 0, moveTypeChance: 1, moveCategoryChance: 0 };
const ONLY_CAT = { moveMutationChance: 1, movePowerChance: 0, moveAccuracyChance: 0, moveTypeChance: 0, moveCategoryChance: 1 };

const STATUS = 'DAMAGE_CATEGORY_STATUS';
const PHYS = 'DAMAGE_CATEGORY_PHYSICAL';
const SPEC = 'DAMAGE_CATEGORY_SPECIAL';

describe('mutateMove — gate', () => {
    test('a move whose gate fails (0%) is untouched and returns an empty log', () => {
        for (let s = 0; s < 50; s++) {
            rng.seed(s);
            const move = m('MOVE_TACKLE');
            const original = clone(move);
            const log = mutateMove(move, { moveMutationChance: 0 });
            expect(log).toEqual([]);
            expect(move).toEqual(original);
        }
    });
});

describe('mutateMove — status moves', () => {
    test('never mutate power or category (only type / accuracy are eligible)', () => {
        for (let s = 0; s < 40; s++) {
            rng.seed(s);
            const move = m('MOVE_THUNDER_WAVE'); // status, power 0, acc 90, ELECTRIC
            const log = mutateMove(move, ALWAYS);
            expect(move.category).toBe(STATUS);
            expect(move.power).toBe(0);
            expect(log.find(e => e.target === 'power')).toBeUndefined();
            expect(log.find(e => e.target === 'category')).toBeUndefined();
        }
    });
});

describe('mutateMove — accuracy 0 (never-miss)', () => {
    test('never mutate accuracy when it is 0', () => {
        for (let s = 0; s < 40; s++) {
            rng.seed(s);
            const move = m('MOVE_AURA_SPHERE'); // special, non-status, acc 0
            const log = mutateMove(move, ONLY_ACC);
            expect(move.accuracy).toBe(0);
            expect(log.find(e => e.target === 'accuracy')).toBeUndefined();
        }
    });
});

describe('mutateMove — clamps', () => {
    test('power stays within [5, 250]', () => {
        for (let s = 0; s < 200; s++) {
            rng.seed(s);
            const move = m('MOVE_TACKLE');
            mutateMove(move, ONLY_POWER);
            expect(move.power).toBeGreaterThanOrEqual(5);
            expect(move.power).toBeLessThanOrEqual(250);
        }
    });

    test('accuracy stays within [10, 100] and NEVER reaches 0', () => {
        for (let s = 0; s < 200; s++) {
            rng.seed(s);
            const move = m('MOVE_HYDRO_PUMP'); // acc 80
            mutateMove(move, ONLY_ACC);
            expect(move.accuracy).toBeGreaterThanOrEqual(10);
            expect(move.accuracy).toBeLessThanOrEqual(100);
            expect(move.accuracy).not.toBe(0);
        }
    });
});

describe('mutateMove — type change', () => {
    test('changes to a valid battle type different from the original, logged as ADJUSTMENT', () => {
        let sawChange = false;
        for (let s = 0; s < 40; s++) {
            rng.seed(s);
            const move = m('MOVE_TACKLE'); // NORMAL
            const log = mutateMove(move, ONLY_TYPE);
            const entry = log.find(e => e.target === 'type');
            if (entry) {
                sawChange = true;
                expect(entry.type).toBe('ADJUSTMENT');
                expect(entry.oldValue).toBe('NORMAL');
                expect(POKEMON_TYPES).toContain(entry.value);
                expect(entry.value).not.toBe('NORMAL');
                expect(move.type).toBe(entry.value);
            }
        }
        expect(sawChange).toBe(true);
    });
});

describe('mutateMove — category flip', () => {
    test('physical flips to special (never status), logged as ADJUSTMENT', () => {
        let sawChange = false;
        for (let s = 0; s < 40; s++) {
            rng.seed(s);
            const move = m('MOVE_TACKLE'); // physical
            const log = mutateMove(move, ONLY_CAT);
            const entry = log.find(e => e.target === 'category');
            if (entry) {
                sawChange = true;
                expect(entry.type).toBe('ADJUSTMENT');
                expect(entry.oldValue).toBe(PHYS);
                expect(entry.value).toBe(SPEC);
                expect(move.category).toBe(SPEC);
            }
        }
        expect(sawChange).toBe(true);
    });

    test('special flips to physical', () => {
        let sawChange = false;
        for (let s = 0; s < 40; s++) {
            rng.seed(s);
            const move = m('MOVE_SURF'); // special
            const log = mutateMove(move, ONLY_CAT);
            const entry = log.find(e => e.target === 'category');
            if (entry) { sawChange = true; expect(entry.value).toBe(PHYS); expect(move.category).toBe(PHYS); }
        }
        expect(sawChange).toBe(true);
    });
});

describe('mutateMove — power/accuracy classification & delta', () => {
    test('power entry: BUFF iff increased, NERF iff decreased; value is the signed delta; new = old + value', () => {
        let sawBuff = false, sawNerf = false;
        for (let s = 0; s < 200; s++) {
            rng.seed(s);
            const move = m('MOVE_TACKLE'); // power 40
            const log = mutateMove(move, ONLY_POWER);
            const entry = log.find(e => e.target === 'power');
            if (!entry) continue;
            expect(entry.value).not.toBe(0);          // no no-op logs
            expect(entry.oldValue + entry.value).toBe(move.power);
            if (entry.value > 0) { expect(entry.type).toBe('BUFF'); sawBuff = true; }
            else { expect(entry.type).toBe('NERF'); sawNerf = true; }
        }
        expect(sawBuff).toBe(true);
        expect(sawNerf).toBe(true);
    });

    test('jumps are multiples of 5 (±5 stacking)', () => {
        for (let s = 0; s < 200; s++) {
            rng.seed(s);
            const move = m('MOVE_EARTHQUAKE'); // power 100 — far from clamps
            const log = mutateMove(move, ONLY_POWER);
            const entry = log.find(e => e.target === 'power');
            if (entry) expect(Math.abs(entry.value) % 5).toBe(0);
        }
    });
});

describe('mutateMove — no no-op log entries at the clamp boundary', () => {
    test('a power already at the max never yields a positive (no-op) power entry', () => {
        for (let s = 0; s < 200; s++) {
            rng.seed(s);
            const move = m('MOVE_TACKLE');
            move.power = 250; // at max
            const log = mutateMove(move, ONLY_POWER);
            const entry = log.find(e => e.target === 'power');
            if (entry) {
                expect(entry.value).toBeLessThan(0); // only a decrease can be a real change
                expect(move.power).toBeLessThan(250);
            } else {
                expect(move.power).toBe(250);
            }
        }
    });
});

describe('mutateMove — combining fields', () => {
    test('a non-status move can accumulate several field changes at once', () => {
        // With every field forced, MOVE_TACKLE (power 40, acc 100, NORMAL, physical) should get
        // at least power + type + category changes (acc may be a no-op when it rolls a buff at 100).
        rng.seed(7);
        const move = m('MOVE_TACKLE');
        const log = mutateMove(move, ALWAYS);
        const targets = new Set(log.map(e => e.target));
        expect(targets.has('power')).toBe(true);
        expect(targets.has('type')).toBe(true);
        expect(targets.has('category')).toBe(true);
        expect(log.length).toBeGreaterThanOrEqual(3);
    });
});

describe('mutateAllMoves', () => {
    test('mutates in place, returns the same object, attaches a log only to changed moves', () => {
        rng.seed(3);
        const moves = clone(baseMoves);
        const ret = mutateAllMoves(moves, ALWAYS);
        expect(ret).toBe(moves);
        // With ALWAYS + open gate, essentially every move changes and carries a log.
        const withLog = Object.values(moves).filter(mv => Array.isArray(mv.log) && mv.log.length);
        expect(withLog.length).toBeGreaterThan(0);
        withLog.forEach(mv => mv.log.forEach(e => {
            expect(['BUFF', 'NERF', 'ADJUSTMENT']).toContain(e.type);
            expect(['power', 'accuracy', 'type', 'category']).toContain(e.target);
        }));
    });

    test('gate 0% leaves every move unchanged and log-free', () => {
        rng.seed(11);
        const moves = clone(baseMoves);
        const before = clone(baseMoves);
        mutateAllMoves(moves, { moveMutationChance: 0 });
        expect(moves).toEqual(before);
        Object.values(moves).forEach(mv => expect(mv.log).toBeUndefined());
    });

    test('determinism: same seed → identical output', () => {
        rng.seed(99);
        const a = mutateAllMoves(clone(baseMoves), ALWAYS);
        rng.seed(99);
        const b = mutateAllMoves(clone(baseMoves), ALWAYS);
        expect(a).toEqual(b);
    });
});
