'use strict';

// B-031 regression — Wattson's favourite must DEVOLVE, not skip straight to any-eligible.
//
// Mega Manectric → Manectric → Electrike → (implicit) any eligible. The old
// `gymFavourite('SPECIES_MANECTRIC_MEGA')` produced a single-entry chain `['SPECIES_MANECTRIC_MEGA']`, so
// when the mega couldn't claim its pool slot the chain had no middle rungs and resolveFavourites fell to a
// random Electric mon — skipping Manectric and Electrike. This asserts the full devolution chain.
//
// itemRandomizer is mocked (its real randomizeItems() writes game files — see
// [[project_itemrandomizer_writes_files]]); the trainers module itself is pure.

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

function wattson() {
    rng.seed(1234567);
    const { trainersData } = runTrainersModule({ tmList: TM_LIST }, { difficulty: 7 });
    return trainersData.find(t => t.id === 'TRAINER_WATTSON_1');
}

describe('B-031 — Wattson Mega Manectric favourite devolves', () => {
    test('the favourite chain is Mega Manectric → Manectric → Electrike', () => {
        const w = wattson();
        expect(w).toBeDefined();
        expect(w.favourite).toEqual(['SPECIES_MANECTRIC_MEGA', 'SPECIES_MANECTRIC', 'SPECIES_ELECTRIKE']);
    });
});
