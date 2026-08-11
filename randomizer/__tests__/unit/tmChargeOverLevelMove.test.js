'use strict';

// B-071 — chooseMoveset builds its move pool WITH a level filter (`ls.level <= level`), so a learnset
// move the mon cannot reach yet can only enter the set through the TM branch. But the tmsUsed accounting
// asked `!poke.learnset.some(ls => ls.move === id)` with NO level filter, so such a teach was never
// reported → resolveTrainerTeam never called consumeLinkedUnit → the TM was neither spent nor did it
// activate its pick-pack link. One bag unit could then teach the same move to a whole team.

const rng = require('../../rng');
const { rateMove, chooseMoveset } = require('../../rating');

const M = o => ({ additionalEffects: [], pp: 10, priority: 0, makesContact: 'FALSE', strikeCount: '1', accuracy: 100, ...o });
const defs = {
    MOVE_WATER_PULSE: M({ id: 'MOVE_WATER_PULSE', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'WATER',  power: 60, effect: 'EFFECT_HIT' }),
    MOVE_MUD_SLAP:    M({ id: 'MOVE_MUD_SLAP',    category: 'DAMAGE_CATEGORY_SPECIAL', type: 'GROUND', power: 20, effect: 'EFFECT_HIT' }),
    MOVE_HARDEN:      M({ id: 'MOVE_HARDEN',      category: 'DAMAGE_CATEGORY_STATUS',  type: 'NORMAL', power: 0, accuracy: 0, effect: 'EFFECT_DEFENSE_UP' }),
    MOVE_RECOVER:     M({ id: 'MOVE_RECOVER',     category: 'DAMAGE_CATEGORY_STATUS',  type: 'NORMAL', power: 0, accuracy: 0, effect: 'EFFECT_RESTORE_HP' }),
};
const moves = Object.fromEntries(Object.entries(defs).map(([k, v]) => [k, { ...v, rating: rateMove(v) }]));

// A Shellos-shaped mon: Water Pulse sits at learnset level 15 AND in its teachables — exactly the
// bundle case (Roxanne, level 13, taught Water Pulse to three mons from a single TM05 unit).
const POKE = {
    id: 'SPECIES_TESTMON',
    name: 'Testmon',
    parsedTypes: ['WATER'],
    parsedAbilities: ['STORM_DRAIN'],
    baseHP: 76, baseAttack: 48, baseDefense: 48, baseSpeed: 34, baseSpAttack: 57, baseSpDefense: 62,
    learnset: [
        { level: '1',  move: 'MOVE_MUD_SLAP' },
        { level: '5',  move: 'MOVE_HARDEN' },
        { level: '10', move: 'MOVE_RECOVER' },
        { level: '15', move: 'MOVE_WATER_PULSE' },
    ],
    teachables: ['MOVE_WATER_PULSE'],
    rating: { tier: 'NU' },
};

const pick = (level, tmsInBag) => {
    rng.seed(1);
    return chooseMoveset(POKE, moves, level, [], 'STORM_DRAIN', null, tmsInBag, 0, {});
};

describe('B-071 — a TM teach is charged even when the move also sits higher in the learnset', () => {
    test('the level gate holds: without the TM in the bag, an over-level learnset move is unreachable', () => {
        const { moveset, tmsUsed } = pick(13, []);
        expect(moveset).not.toContain('MOVE_WATER_PULSE');
        expect(tmsUsed).toEqual([]);
    });

    test('with the TM in the bag the mon learns it below its learnset level (TMs are level-agnostic)', () => {
        const { moveset } = pick(13, ['MOVE_WATER_PULSE']);
        expect(moveset).toContain('MOVE_WATER_PULSE');
    });

    test('and that teach is REPORTED in tmsUsed, so the caller can spend the TM', () => {
        const { tmsUsed } = pick(13, ['MOVE_WATER_PULSE']);
        expect(tmsUsed).toContain('MOVE_WATER_PULSE');
    });

    test('a move the mon can reach by level-up is NOT charged, even with the TM in the bag', () => {
        const { moveset, tmsUsed } = pick(15, ['MOVE_WATER_PULSE']);
        expect(moveset).toContain('MOVE_WATER_PULSE');
        expect(tmsUsed).not.toContain('MOVE_WATER_PULSE');
    });
});
