'use strict';

// B-019 regression — Brawly's team must never resolve to fewer than 6 pokemon.
//
// Root cause: when the gym type is KEPT (Fighting), Brawly's 6th slot is the
// `specificIfTier: SPECIES_MAKUHITA` definition. Makuhita's base tier (NU) is stronger than
// its contextual tier (PU) at Brawly's level, so it can never satisfy the specificIfTier gate,
// and the constrained loose pool (Fighting + GUTS + weak tier + family-dedup) is empty. Without
// a `fallback`, selectWithAutoFallback returns null and the slot is silently dropped → 5 mons.
//
// This test forces the kept-type branch (gymsTypeChanged: 0 → all gyms keep their type) and
// asserts the Makuhita slot carries a non-empty fallback so it can always be filled.
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

describe('B-019 — Brawly slot 6 fallback (kept gym type)', () => {
    test('slot 6 is the Makuhita-specific definition when the gym keeps its type', () => {
        const brawly = buildKeptType();
        expect(brawly).toBeDefined();
        expect(brawly.team).toHaveLength(6);
        expect(brawly.team[5].specificIfTier).toBe('SPECIES_MAKUHITA');
    });

    test('the Makuhita slot carries a non-empty fallback so it never drops silently', () => {
        const brawly = buildKeptType();
        const slot6 = brawly.team[5];
        expect(Array.isArray(slot6.fallback)).toBe(true);
        expect(slot6.fallback.length).toBeGreaterThan(0);
        // The fallback must relax the specific constraints so a generic legal mon can fill it:
        // no fallback entry may re-impose the specificIfTier that caused the original drop.
        for (const fb of slot6.fallback) {
            expect(fb.specificIfTier).toBeUndefined();
        }
    });
});
