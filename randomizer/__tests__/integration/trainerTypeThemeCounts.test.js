'use strict';

// T-052 Step 2 — the number of gyms / Elite Four whose type theme is CHANGED is configurable
// (config.gymsTypeChanged 0..8, config.e4TypeChanged 0..4; default 2/2). Internally this maps to
// the existing "keep" constants (keep = total − changed).
//
// T-076 — a changed boss now draws from the shared 13-boss pool but still excludes its OWN canonical
// type, so "themeType !== that boss's canonical" remains an exact count of changed bosses (it may
// coincide with ANOTHER group's canonical — that cross-group sharing is covered in bossTypePool.test.js).
//
// itemRandomizer is mocked (its real randomizeItems writes files) — same pattern as
// trainerColorsPipeline.test.js.

jest.mock('../../itemRandomizer', () => ({
    randomizeItems: jest.fn(() => {
        const out = {};
        for (const k of [
            'petalburgPlates', 'route102Ball', 'route104Berries', 'route104Gems', 'route106Ball',
            'route106GoodItem', 'route109GoodItem', 'route110ExtenderBall', 'route110GoodItem',
            'route110LumGoodItem', 'route111BallA', 'route111BallC', 'route111Berries',
            'route111HpUpGoodItem', 'route111Items', 'route114WyattGoodItem', 'route116Ball',
            'route116Berries', 'route116Gems', 'route116XSpecial', 'route117Berries', 'route117Gems',
            'route117GoodItem', 'route117Plates', 'route118BarnyGoodItem', 'route118Items',
            'route120AngelicaGoodItem', 'route121Berries',
        ]) out[k] = ['ITEM_STUB_A', 'ITEM_STUB_B', 'ITEM_STUB_C'];
        return out;
    }),
    displayNameToItemConst: jest.fn((n) => n),
}));

const rng = require('../../rng');
const { runTrainersModule } = require('../../modules/trainersModule');

const TM_LIST = Array.from({ length: 120 }, (_, i) => `MOVE_SLOT_${i + 1}`);

// Canonical types by boss class (mirrors trainers.js originalGymTypes / originalE4Types).
const GYM_CANON = {
    'Leader Roxanne': 'ROCK', 'Leader Brawly': 'FIGHTING', 'Leader Wattson': 'ELECTRIC',
    'Leader Flannery': 'FIRE', 'Leader Norman': 'NORMAL', 'Leader Winona': 'FLYING',
    'Leader Tate And Liza': 'PSYCHIC', 'Leader Juan': 'WATER',
};
const E4_CANON = {
    'Elite Four Sidney': 'DARK', 'Elite Four Phoebe': 'GHOST',
    'Elite Four Glacia': 'ICE', 'Elite Four Drake': 'DRAGON',
};

function counts(config) {
    rng.seed(20520303);
    const { trainersData } = runTrainersModule({ tmList: TM_LIST }, { difficulty: 7, ...config });
    // One battle instance per class is enough; dedupe by class.
    const themeByClass = new Map();
    for (const t of trainersData) {
        if (t.themeType && (GYM_CANON[t.class] || E4_CANON[t.class])) themeByClass.set(t.class, t.themeType);
    }
    let gymsChanged = 0, e4Changed = 0;
    for (const [cls, canon] of Object.entries(GYM_CANON)) {
        if (themeByClass.get(cls) !== canon) gymsChanged++;
    }
    for (const [cls, canon] of Object.entries(E4_CANON)) {
        if (themeByClass.get(cls) !== canon) e4Changed++;
    }
    return { gymsChanged, e4Changed };
}

describe('configurable gym / E4 type-change counts', () => {
    test('default (no config) changes 2 gyms and 2 E4', () => {
        expect(counts({})).toEqual({ gymsChanged: 2, e4Changed: 2 });
    });

    test('0 keeps every canonical type', () => {
        expect(counts({ gymsTypeChanged: 0, e4TypeChanged: 0 })).toEqual({ gymsChanged: 0, e4Changed: 0 });
    });

    test('max changes every gym and every E4', () => {
        expect(counts({ gymsTypeChanged: 8, e4TypeChanged: 4 })).toEqual({ gymsChanged: 8, e4Changed: 4 });
    });

    test('arbitrary counts are honoured exactly', () => {
        expect(counts({ gymsTypeChanged: 5, e4TypeChanged: 1 })).toEqual({ gymsChanged: 5, e4Changed: 1 });
        expect(counts({ gymsTypeChanged: 3, e4TypeChanged: 3 })).toEqual({ gymsChanged: 3, e4Changed: 3 });
    });

    test('out-of-range values are clamped', () => {
        expect(counts({ gymsTypeChanged: 99, e4TypeChanged: -4 })).toEqual({ gymsChanged: 8, e4Changed: 0 });
    });
});
