'use strict';

// B-019 regression — Brawly's team must never resolve to fewer than 6 pokemon.
//
// Root cause: Brawly's Makuhita ace could drop silently. Makuhita's base tier (NU) is stronger than
// its contextual tier (PU) at Brawly's level, so it can never satisfy its own specificIfTier gate, and
// the constrained loose pool (Fighting + GUTS + weak tier + family-dedup) is empty; without a fallback,
// selectWithAutoFallback returns null and the slot is silently dropped → 5 mons.
//
// T-128 (redesign) — Hariyama is now Brawly's FAVOURITE, expressed as a SPECIES chain only
// (`gymFavourite('SPECIES_HARIYAMA')`). The B-019 guarantee is preserved by the new resolver: a favourite
// CLAIMS a slot from the full 6-slot pool, and its implicit final fallback is "any mon within the
// trainer's type restriction" (Fighting always exists) — so it can never silently drop the team to 5.
// This test forces the kept-type branch (gymsTypeChanged: 0 → Brawly stays FIGHTING) and asserts the
// structure that encodes that guarantee (species-only favourite + type restriction + full pool).
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
const { TRAINER_RESTRICTION_ALLOW_ONLY_TYPES } = require('../../constants');

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

describe('B-019 — Brawly Hariyama favourite never drops silently (kept gym type)', () => {
    test('the favourite is a species-only chain (the signature ace, no tier/item/ability spec)', () => {
        const brawly = buildKeptType();
        expect(brawly).toBeDefined();
        expect(Array.isArray(brawly.favourite)).toBe(true);
        // T-128 — Brawly's signature ace Hariyama, with its pre-evo Makuhita as the in-budget fallback.
        expect(brawly.favourite).toEqual(['SPECIES_HARIYAMA', 'SPECIES_MAKUHITA']);
        brawly.favourite.forEach(c => expect(typeof c === 'string' || (c && c.mega)).toBe(true));
    });

    test('the type restriction + full pool guarantee the favourite is always fillable (B-019 stays fixed)', () => {
        const brawly = buildKeptType();
        // The B-019 guarantee now comes from resolveFavourites' implicit final fallback: any mon within the
        // trainer's type restriction. So Brawly must carry the ALLOW_ONLY_TYPES restriction + a type (a
        // Fighting mon always exists), and the favourite CLAIMS a slot from a full 6-slot pool (never adds),
        // so the resolved team can never fall below 6.
        expect(brawly.restrictions).toContain(TRAINER_RESTRICTION_ALLOW_ONLY_TYPES);
        expect(Array.isArray(brawly.types)).toBe(true);
        expect(brawly.types.length).toBeGreaterThan(0);
        expect(brawly.team.length).toBe(6);
    });
});
