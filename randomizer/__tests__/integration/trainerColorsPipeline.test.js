'use strict';

// T-044 — integration: the REAL trainers module (getTrainersData → runTrainersModule)
// must tag typed bosses with a themeType and attach resolved card colours to every
// trainer, so both writer.js and writerDocs.js render per-boss colours.
//
// itemRandomizer is mocked ONLY to stub its item assignments — its real randomizeItems()
// writes to src/data/script_menu.h and data/maps/**, which tests must never do. The
// trainers module itself is pure (no file I/O) and runs for real here.

// Every itemAssignments.* key getTrainersData reads is populated (as an array) so the
// real bag-building code runs unchanged.
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
const { POKEMON_TYPES } = require('../../constants');

// tmItem(n) reads tmList[n-1]; getTrainersData reaches ~slot 95. Give it enough slots.
const TM_LIST = Array.from({ length: 120 }, (_, i) => `MOVE_SLOT_${i + 1}`);

function build() {
    rng.seed(1234567);
    // T-076 — pin championTypeChangeChance:0 so the champion (Steven) deterministically keeps Steel;
    // the champion Bernoulli draw is consumed either way, so gym/E4 themeTypes are unchanged vs default.
    const { trainersData } = runTrainersModule({ tmList: TM_LIST }, { difficulty: 7, championTypeChangeChance: 0 });
    return new Map(trainersData.map(t => [t.id, t]));
}

let byId;
beforeAll(() => { byId = build(); });

const hasColorShape = (c) => c
    && (c.bar === null || (Array.isArray(c.bar) && c.bar.length === 2))
    && typeof c.title === 'string'
    && typeof c.railBg === 'string'
    && typeof c.cardBg === 'string';

describe('themeType attachment (getTrainersData)', () => {
    const leaders = {
        'TRAINER_ROXANNE_1': 'Leader Roxanne',
        'TRAINER_FLANNERY_1': 'Leader Flannery',
        'TRAINER_JUAN_1': 'Leader Juan',
        'TRAINER_SIDNEY': 'Elite Four Sidney',
        'TRAINER_DRAKE': 'Elite Four Drake',
    };

    test('every gym leader / E4 boss carries a valid themeType', () => {
        for (const [id, cls] of Object.entries(leaders)) {
            const t = byId.get(id);
            expect(t).toBeDefined();
            expect(t.class).toBe(cls);
            expect(POKEMON_TYPES).toContain(t.themeType);
        }
    });

    // T-076 — Steven follows the resolved champion type; with championTypeChangeChance:0 (see build())
    // it deterministically stays Steel across every Steven battle. Full coverage of the change path
    // lives in bossTypePool.test.js.
    test('Steven battles carry the champion type (Steel when it does not change)', () => {
        for (const id of ['TRAINER_STEVEN', 'TRAINER_CHAMPION_STEVEN']) {
            expect(byId.get(id).themeType).toBe('STEEL');
        }
    });

    test('common trainers get no themeType', () => {
        const jose = byId.get('TRAINER_JOSE'); // Bug Catcher, not a boss
        expect(jose).toBeDefined();
        expect(jose.themeType).toBeUndefined();
    });
});

describe('colour attachment (runTrainersModule)', () => {
    test('every trainer carries a well-formed colors object', () => {
        for (const t of byId.values()) {
            expect(hasColorShape(t.colors)).toBe(true);
        }
    });

    test('typed boss colours match its themeType palette', () => {
        const flannery = byId.get('TRAINER_FLANNERY_1');
        const pal = TYPE_PALETTES[flannery.themeType];
        expect(flannery.colors.kind).toBe('typed');
        expect(flannery.colors.railBg).toBe(pal.mainBg);
        expect(flannery.colors.cardBg).toBe(pal.secondaryBg);
        expect(flannery.colors.bar).toEqual([pal.main, pal.secondary]);
    });

    test('Aqua boss → Water+Dark evil mix', () => {
        const archie = byId.get('TRAINER_ARCHIE');
        expect(archie.colors.kind).toBe('evil');
        expect(archie.colors.railBg).toBe(TYPE_PALETTES.WATER.mainBg);
        expect(archie.colors.cardBg).toBe(TYPE_PALETTES.DARK.mainBg);
    });

    test('Magma boss → Fire+Ground evil mix', () => {
        const maxie = byId.get('TRAINER_MAXIE_MOSSDEEP');
        expect(maxie.colors.kind).toBe('evil');
        expect(maxie.colors.railBg).toBe(TYPE_PALETTES.FIRE.mainBg);
        expect(maxie.colors.cardBg).toBe(TYPE_PALETTES.GROUND.mainBg);
    });

    test('rival (May) → rival palette', () => {
        const may = byId.get('TRAINER_MAY_ROUTE_103_TREECKO');
        expect(may.colors.kind).toBe('rival');
        expect(Array.isArray(may.colors.bar)).toBe(true);
    });

    test('Wally → wally palette', () => {
        const wally = byId.get('TRAINER_WALLY_VR_1');
        expect(wally.colors.kind).toBe('wally');
    });

    test('partner Steven → ally palette, not its Steel theme (still carries themeType STEEL)', () => {
        const partner = byId.get('PARTNER_STEVEN');
        expect(partner).toBeDefined();
        expect(partner.isPartner).toBe(true);
        expect(partner.themeType).toBe('STEEL');    // getTrainersData still tags it
        expect(partner.colors.kind).toBe('ally');   // but the ally look wins
    });

    test('common trainer → generic palette, no bar', () => {
        const jose = byId.get('TRAINER_JOSE');
        expect(jose.colors.kind).toBe('common');
        expect(jose.colors.bar).toBeNull();
    });
});
