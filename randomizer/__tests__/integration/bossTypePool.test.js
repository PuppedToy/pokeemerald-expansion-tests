'use strict';

// T-076 — Unified fixed/changed type pool across the 13 typed bosses (8 gyms + 4 E4 + champion).
//
// Fixed bosses keep their canonical type; the pool is every POKEMON_TYPE not claimed by a fixed
// boss. Changed bosses draw (without replacement) from that shared pool, excluding their own
// canonical. Consequences this file pins down:
//   - all 13 typed bosses always get distinct types (shared pool, no reuse across groups);
//   - a type freed by a changed boss in one group is claimable by a changed boss in another
//     (gym ↔ E4 ↔ champion) — the old walled-off per-group pools forbade this;
//   - the champion flips "changed" with probability championTypeChangeChance (default 0.05); when
//     it stays fixed its Steel is unavailable to gyms/E4, when it changes Steel joins the pool;
//   - all three Steven battles run the resolved champion type instead of hard-coded Steel.
//
// itemRandomizer is mocked (its real randomizeItems writes files) — same pattern as
// trainerTypeThemeCounts.test.js.

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

const GYM_CANON = {
    'Leader Roxanne': 'ROCK', 'Leader Brawly': 'FIGHTING', 'Leader Wattson': 'ELECTRIC',
    'Leader Flannery': 'FIRE', 'Leader Norman': 'NORMAL', 'Leader Winona': 'FLYING',
    'Leader Tate And Liza': 'PSYCHIC', 'Leader Juan': 'WATER',
};
const E4_CANON = {
    'Elite Four Sidney': 'DARK', 'Elite Four Phoebe': 'GHOST',
    'Elite Four Glacia': 'ICE', 'Elite Four Drake': 'DRAGON',
};
const CHAMPION_CANON = 'STEEL';

// Resolve one themeType per typed-boss class for a given seed + config.
function themeByClass(seed, config) {
    rng.seed(seed);
    const { trainersData } = runTrainersModule({ tmList: TM_LIST }, { difficulty: 7, ...config });
    const byClass = new Map();
    for (const t of trainersData) {
        if (t.themeType && (GYM_CANON[t.class] || E4_CANON[t.class] || t.class === 'Steven')) {
            byClass.set(t.class, t.themeType);
        }
    }
    return byClass;
}

function thirteenTypes(byClass) {
    return [
        ...Object.keys(GYM_CANON).map(c => byClass.get(c)),
        ...Object.keys(E4_CANON).map(c => byClass.get(c)),
        byClass.get('Steven'),
    ];
}

describe('T-076 unified boss type pool', () => {
    test('all 13 typed bosses get distinct types (shared pool, no reuse across groups)', () => {
        for (let seed = 0; seed < 50; seed++) {
            const byClass = themeByClass(seed, { gymsTypeChanged: 4, e4TypeChanged: 3, championTypeChangeChance: 0.5 });
            const types = thirteenTypes(byClass);
            expect(types).toHaveLength(13);
            expect(types.every(Boolean)).toBe(true);
            expect(new Set(types).size).toBe(13); // all distinct
        }
    });

    test('a changed boss never keeps its own canonical type', () => {
        for (let seed = 0; seed < 50; seed++) {
            const byClass = themeByClass(seed, { gymsTypeChanged: 8, e4TypeChanged: 4, championTypeChangeChance: 1 });
            for (const [cls, canon] of Object.entries({ ...GYM_CANON, ...E4_CANON })) {
                expect(byClass.get(cls)).not.toBe(canon); // every boss changed → must differ
            }
            expect(byClass.get('Steven')).not.toBe(CHAMPION_CANON);
        }
    });

    test('a changed gym can take an Elite-Four canonical type (pools are shared)', () => {
        const e4CanonSet = new Set(Object.values(E4_CANON));
        let seen = false;
        for (let seed = 0; seed < 50 && !seen; seed++) {
            const byClass = themeByClass(seed, { gymsTypeChanged: 8, e4TypeChanged: 4, championTypeChangeChance: 1 });
            seen = Object.keys(GYM_CANON).some(c => e4CanonSet.has(byClass.get(c)));
        }
        expect(seen).toBe(true);
    });

    test('a changed Elite-Four member can take a gym canonical type (pools are shared)', () => {
        const gymCanonSet = new Set(Object.values(GYM_CANON));
        let seen = false;
        for (let seed = 0; seed < 50 && !seen; seed++) {
            const byClass = themeByClass(seed, { gymsTypeChanged: 8, e4TypeChanged: 4, championTypeChangeChance: 1 });
            seen = Object.keys(E4_CANON).some(c => gymCanonSet.has(byClass.get(c)));
        }
        expect(seen).toBe(true);
    });

    describe('champion type-change probability', () => {
        test('championTypeChangeChance 0 → champion always keeps Steel', () => {
            for (let seed = 0; seed < 40; seed++) {
                expect(themeByClass(seed, { championTypeChangeChance: 0 }).get('Steven')).toBe(CHAMPION_CANON);
            }
        });

        test('championTypeChangeChance 1 → champion always changes away from Steel', () => {
            for (let seed = 0; seed < 40; seed++) {
                expect(themeByClass(seed, { championTypeChangeChance: 1 }).get('Steven')).not.toBe(CHAMPION_CANON);
            }
        });

        test('default (no config) keeps Steel on most seeds (≈5% change)', () => {
            let changed = 0;
            const N = 200;
            for (let seed = 0; seed < N; seed++) {
                if (themeByClass(seed, {}).get('Steven') !== CHAMPION_CANON) changed++;
            }
            expect(changed / N).toBeLessThan(0.2); // clearly rare, not the old "always Steel", not 50/50
        });
    });

    describe('Steel reservation follows the champion', () => {
        test('champion fixed → Steel never leaks onto a gym / E4', () => {
            for (let seed = 0; seed < 50; seed++) {
                const byClass = themeByClass(seed, { gymsTypeChanged: 8, e4TypeChanged: 4, championTypeChangeChance: 0 });
                for (const cls of [...Object.keys(GYM_CANON), ...Object.keys(E4_CANON)]) {
                    expect(byClass.get(cls)).not.toBe('STEEL');
                }
            }
        });

        test('champion changed → Steel becomes available to a gym / E4 on some seed', () => {
            let seen = false;
            for (let seed = 0; seed < 60 && !seen; seed++) {
                const byClass = themeByClass(seed, { gymsTypeChanged: 8, e4TypeChanged: 4, championTypeChangeChance: 1 });
                seen = [...Object.keys(GYM_CANON), ...Object.keys(E4_CANON)].some(c => byClass.get(c) === 'STEEL');
            }
            expect(seen).toBe(true);
        });
    });

    describe('all Steven battles use the resolved champion type', () => {
        const STEVEN_IDS = ['TRAINER_STEVEN', 'PARTNER_STEVEN', 'TRAINER_CHAMPION_STEVEN'];

        function stevenTrainers(seed, config) {
            rng.seed(seed);
            const { trainersData } = runTrainersModule({ tmList: TM_LIST }, { difficulty: 7, ...config });
            const byId = new Map(trainersData.map(t => [t.id, t]));
            return STEVEN_IDS.map(id => byId.get(id));
        }

        test('champion fixed → every Steven battle themeType is Steel', () => {
            for (const t of stevenTrainers(1, { championTypeChangeChance: 0 })) {
                expect(t.themeType).toBe(CHAMPION_CANON);
            }
        });

        test('champion changed → every Steven battle shares one non-Steel champion type', () => {
            const stevens = stevenTrainers(1, { championTypeChangeChance: 1 });
            const champType = stevens.find(t => t.id === 'TRAINER_CHAMPION_STEVEN').themeType;
            expect(champType).not.toBe(CHAMPION_CANON);
            for (const t of stevens) expect(t.themeType).toBe(champType);
        });

        test('champion changed → Granite Cave Steven team slots run the champion type, not Steel', () => {
            const stevens = stevenTrainers(1, { championTypeChangeChance: 1 });
            const champType = stevens.find(t => t.id === 'TRAINER_CHAMPION_STEVEN').themeType;
            const graniteCave = stevens.find(t => t.id === 'TRAINER_STEVEN');
            const typedSlots = graniteCave.team.filter(s => Array.isArray(s.type));
            expect(typedSlots.length).toBeGreaterThan(0);
            for (const slot of typedSlots) expect(slot.type).toEqual([champType]);
        });
    });
});
