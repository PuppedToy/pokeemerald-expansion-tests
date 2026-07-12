'use strict';

// B-019 regression — Brawly's team must never resolve to fewer than 6 pokemon.
//
// Root cause: Brawly's Makuhita ace could drop silently. Makuhita's base tier (NU) is stronger than
// its contextual tier (PU) at Brawly's level, so it can never satisfy its own specificIfTier gate, and
// the constrained loose pool (Fighting + GUTS + weak tier + family-dedup) is empty; without a fallback,
// selectWithAutoFallback returns null and the slot is silently dropped → 5 mons.
//
// T-128 — Makuhita is now Brawly's FAVOURITE (same mechanism as every favourite): a priority chain
// resolved first. The B-019 guarantee is preserved by the chain TERMINATING in a generic typed rung
// (no species gate) so the favourite is always fillable. This test forces the kept-type branch
// (gymsTypeChanged: 0) and asserts that structure.
//
// itemRandomizer is mocked to stub item assignments (its real randomizeItems() writes game
// files — see [[project_itemrandomizer_writes_files]]); the trainers module itself is pure.

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

// tmItem(n) reads tmList[n-1]; getTrainersData reaches high slot numbers. Give it enough.
const TM_LIST = Array.from({ length: 120 }, (_, i) => `MOVE_SLOT_${i + 1}`);

function buildKeptType() {
    rng.seed(1234567);
    // gymsTypeChanged: 0 → all gym leaders keep their original type → Brawly stays FIGHTING,
    // taking the specificIfTier: SPECIES_MAKUHITA branch of slot 6.
    const { trainersData } = runTrainersModule(
        { tmList: TM_LIST },
        { difficulty: 7, gymsTypeChanged: 0 },
    );
    return trainersData.find(t => t.id === 'TRAINER_BRAWLY_1');
}

describe('B-019 — Brawly Makuhita favourite never drops silently (kept gym type)', () => {
    test('the favourite leads with the Makuhita-specific rung', () => {
        const brawly = buildKeptType();
        expect(brawly).toBeDefined();
        expect(Array.isArray(brawly.favourite)).toBe(true);
        expect(brawly.favourite[0].oneOf).toEqual(['SPECIES_MAKUHITA']);
    });

    test('the favourite chain terminates in a generic typed rung so it is always fillable', () => {
        const brawly = buildKeptType();
        const chain = brawly.favourite;
        expect(chain.length).toBeGreaterThan(1);
        // The terminal rung must NOT re-impose a specific-species gate (the original B-019 drop cause):
        // it is a plain mon of Brawly's type, which always exists.
        const last = chain[chain.length - 1];
        expect(last.oneOf).toBeUndefined();
        expect(last.specificIfTier).toBeUndefined();
        expect(last.type).toBeDefined();
    });
});
