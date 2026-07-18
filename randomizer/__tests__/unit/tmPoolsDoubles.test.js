'use strict';

// T-152 — owner-classified TM moves added to the pools, plus "doubles-only" status TMs that join their
// pool ONLY when the battle format is doubles or mixed.

const tms = require('../../tms');
const { tmRanges, buildTMList } = require('../../tmRandomizer');

const rangePool = (includeDoubles, start) => tmRanges(includeDoubles).find((r) => r.start === start).pool;

describe('T-152 — new TM classifications in the base pools', () => {
    test.each([
        ['averageDamagePool', ['MOVE_FIRE_SPIN', 'MOVE_INCINERATE', 'MOVE_SAND_TOMB', 'MOVE_SNORE', 'MOVE_WHIRLPOOL', 'MOVE_FURY_CUTTER', 'MOVE_DRAGON_BREATH', 'MOVE_SILVER_WIND', 'MOVE_BUBBLE_BEAM', 'MOVE_SUBMISSION']],
        ['goodDamagePool', ['MOVE_POWER_UP_PUNCH', 'MOVE_ROCK_CLIMB', 'MOVE_EGG_BOMB', 'MOVE_SKY_ATTACK']],
        ['strongDamagePool', ['MOVE_DYNAMIC_PUNCH', 'MOVE_ZAP_CANNON']],
        ['averageStatusMoves', ['MOVE_CONFUSE_RAY', 'MOVE_CAPTIVATE', 'MOVE_DEFENSE_CURL', 'MOVE_GRAVITY', 'MOVE_IMPRISON', 'MOVE_METAL_SOUND', 'MOVE_MIMIC', 'MOVE_QUASH', 'MOVE_SNATCH', 'MOVE_TELEKINESIS', 'MOVE_TELEPORT', 'MOVE_WHIRLWIND']],
        ['goodStatusMoves', ['MOVE_HONE_CLAWS']],
        ['godlikeStatusMoves', ['MOVE_SOFT_BOILED']],
        ['nichePool', ['MOVE_BIDE', 'MOVE_COUNTER', 'MOVE_NATURAL_GIFT', 'MOVE_NATURE_POWER']],
    ])('%s contains its new moves', (poolName, moves) => {
        expect(tms[poolName]).toEqual(expect.arrayContaining(moves));
    });
});

describe('T-152 — doubles-only status TMs', () => {
    test('the doubles-only arrays hold exactly the owner-classified moves', () => {
        expect(tms.goodStatusMovesDoubles).toEqual(['MOVE_ALLY_SWITCH', 'MOVE_COACHING', 'MOVE_DETECT', 'MOVE_DRAGON_CHEER']);
        expect(tms.godlikeStatusMovesDoubles).toEqual(['MOVE_HELPING_HAND']);
    });

    test('doubles-only moves are NOT in the base status pools', () => {
        for (const m of [...tms.goodStatusMovesDoubles, ...tms.godlikeStatusMovesDoubles]) {
            expect(tms.goodStatusMoves).not.toContain(m);
            expect(tms.godlikeStatusMoves).not.toContain(m);
        }
    });

    test('doubles-only moves join goodStatus/godlikeStatus ranges only when includeDoubles', () => {
        // singles (includeDoubles=false): excluded
        expect(rangePool(false, 78)).not.toEqual(expect.arrayContaining(['MOVE_ALLY_SWITCH']));
        expect(rangePool(false, 91)).not.toContain('MOVE_HELPING_HAND');
        // doubles/mixed (includeDoubles=true): included in the right tier
        expect(rangePool(true, 78)).toEqual(expect.arrayContaining(['MOVE_ALLY_SWITCH', 'MOVE_COACHING', 'MOVE_DETECT', 'MOVE_DRAGON_CHEER']));
        expect(rangePool(true, 91)).toContain('MOVE_HELPING_HAND');
    });
});

describe('T-152 — buildTMList honours the battle format', () => {
    const DOUBLES_ONLY = ['ALLY_SWITCH', 'COACHING', 'DETECT', 'DRAGON_CHEER', 'HELPING_HAND'];

    test('a singles run never assigns a doubles-only move to any TM slot', () => {
        const list = buildTMList('singles');
        expect(list.filter(Boolean).some((m) => DOUBLES_ONLY.includes(m))).toBe(false);
    });

    test('buildTMList defaults to singles when no format is given (back-compat)', () => {
        const list = buildTMList();
        expect(list.filter(Boolean).some((m) => DOUBLES_ONLY.includes(m))).toBe(false);
        expect(list).toHaveLength(95);
    });
});
