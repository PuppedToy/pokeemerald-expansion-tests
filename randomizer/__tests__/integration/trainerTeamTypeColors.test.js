'use strict';

// T-052 Steps 3–4 — configuring Team Aqua / Team Magma types flows end-to-end: the resolved theme
// drives both the evil-team card colours (docs) and, via the same arrays, the mon-type filters used
// to build their teams. Default (no config) reproduces today's Water+Dark / Fire+Ground look.
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
const { TYPE_PALETTES } = require('../../trainerColors');

const TM_LIST = Array.from({ length: 120 }, (_, i) => `MOVE_SLOT_${i + 1}`);

function build(config) {
    rng.seed(555);
    const { trainersData } = runTrainersModule({ tmList: TM_LIST }, { difficulty: 7, ...config });
    return new Map(trainersData.map(t => [t.id, t]));
}

describe('Team Aqua / Magma configurable types', () => {
    test('default: Aqua card colours are Water+Dark, Magma Fire+Ground (regression)', () => {
        const byId = build({});
        const archie = byId.get('TRAINER_ARCHIE');
        expect(archie.colors.kind).toBe('evil');
        expect(archie.colors.railBg).toBe(TYPE_PALETTES.WATER.mainBg);
        expect(archie.colors.cardBg).toBe(TYPE_PALETTES.DARK.mainBg);
        const maxie = byId.get('TRAINER_MAXIE_MOSSDEEP');
        expect(maxie.colors.railBg).toBe(TYPE_PALETTES.FIRE.mainBg);
        expect(maxie.colors.cardBg).toBe(TYPE_PALETTES.GROUND.mainBg);
    });

    test('configured Aqua main/secondary drive the card colours', () => {
        const byId = build({ aquaTypes: ['GRASS', 'FIRE', 'WATER', 'ICE', 'ELECTRIC'] });
        const archie = byId.get('TRAINER_ARCHIE');
        expect(archie.colors.railBg).toBe(TYPE_PALETTES.GRASS.mainBg);
        expect(archie.colors.cardBg).toBe(TYPE_PALETTES.FIRE.mainBg);
    });

    test('configured Magma types drive the card colours', () => {
        const byId = build({ magmaTypes: ['STEEL', 'DRAGON', 'FIRE', 'ROCK', 'GROUND'] });
        const maxie = byId.get('TRAINER_MAXIE_MOSSDEEP');
        expect(maxie.colors.railBg).toBe(TYPE_PALETTES.STEEL.mainBg);
        expect(maxie.colors.cardBg).toBe(TYPE_PALETTES.DRAGON.mainBg);
    });

    test('a RANDOM main resolves to a valid, non-default palette pairing (deterministic)', () => {
        const a = build({ aquaTypes: ['RANDOM', 'RANDOM', 'RANDOM', 'RANDOM', 'RANDOM'] }).get('TRAINER_ARCHIE');
        const b = build({ aquaTypes: ['RANDOM', 'RANDOM', 'RANDOM', 'RANDOM', 'RANDOM'] }).get('TRAINER_ARCHIE');
        expect(a.colors.railBg).toBe(b.colors.railBg); // same seed → same result
        expect(a.colors.cardBg).toBe(b.colors.cardBg);
        expect(a.colors.railBg).not.toBe(a.colors.cardBg);
    });
});
