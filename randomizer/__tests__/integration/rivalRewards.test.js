'use strict';

// T-056 — rival reward + Lum-Berry bag-entry tweaks:
//   - Rustboro rival now rewards Evolution Stones (moved earlier); Route 110 rival rewards a Lum Berry.
//   - Opponents only start carrying Lum Berry from the Route 110 rival's bag onward (not from Rustboro).
// itemRandomizer is mocked (its real randomizeItems() writes game files); the trainers module is pure.

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

let byId;
beforeAll(() => {
    rng.seed(1234567);
    const { trainersData } = runTrainersModule({ tmList: TM_LIST }, { difficulty: 7 });
    byId = new Map(trainersData.map((t) => [t.id, t]));
});

describe('rival rewards are swapped (T-056)', () => {
    test.each(['TREECKO', 'TORCHIC', 'MUDKIP'])('Rustboro rival (%s) rewards Evolution Stones', (s) => {
        expect(byId.get(`TRAINER_MAY_RUSTBORO_${s}`).reward).toContain('Evolution Stones');
    });
    test.each(['TREECKO', 'TORCHIC', 'MUDKIP'])('Route 110 rival (%s) rewards a Lum Berry', (s) => {
        expect(byId.get(`TRAINER_MAY_ROUTE_110_${s}`).reward).toContain('Lum Berry');
    });
});

describe('Lum Berry enters opponent bags at the Route 110 rival, not Rustboro (T-056)', () => {
    test('the Rustboro rival bag carries no Lum Berry', () => {
        expect(byId.get('TRAINER_MAY_RUSTBORO_TREECKO').bag).not.toContain('Lum Berry');
    });
    test('the Route 110 rival bag carries a Lum Berry', () => {
        expect(byId.get('TRAINER_MAY_ROUTE_110_TREECKO').bag).toContain('Lum Berry');
    });
});
