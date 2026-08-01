// T-239 — inject gItemsInfo[].price (T-073 configurable shop prices).
//
// The compile path patches `src/data/items.h` with itemPriceWriter.patchPricesInContent, which only
// touches a block whose `.price` line is a plain number — Serious Mint's config ternary
// `(I_PRICE >= GEN_9) ? 20000 : 20` never matches, and unmanaged items are left alone. Rather than
// re-deriving that rule, this module runs the writer's own function over the base's items.h and injects
// exactly the prices it changed: whatever the compile path would have produced, byte for byte.
const path = require('path');
const { buildSyntheticBase, constants } = require('../fixtures/syntheticBase');
const { buildInjectionContext } = require('../../injector/context');
const { injectItemPrices } = require('../../injector/modules/itemPrices');
const { ITEM_INFO } = require('../../injector/structLayout');
const itemPriceWriter = require('../../itemPriceWriter');

function setup(config = {}) {
    const base = buildSyntheticBase({
        items: {
            ITEM_ULTRA_BALL: 10, ITEM_QUICK_BALL: 10, ITEM_TIMER_BALL: 10,
            ITEM_ABILITY_CAPSULE: 3000, ITEM_ABILITY_PATCH: 5000,
            ITEM_ADAMANT_MINT: 3000, ITEM_LONELY_MINT: 250,
            ITEM_TM01: 3000, ITEM_TM51: 3000,
            ITEM_SERIOUS_MINT: 20, ITEM_POTION: 200,
        },
    });
    const ctx = buildInjectionContext({ rom: base.rom, offsetMap: base.offsetMap, data: { config } });
    return { ...base, ctx };
}

const price = (base, item) => base.rom.readU32(base.itemAt(item) + ITEM_INFO.price);

describe('prices from the bundle config', () => {
    test('writes a configured price to the right item', () => {
        const base = setup({ prices: { balls: { ultra: 1234 }, abilityPatch: 9999 } });
        injectItemPrices(base.ctx);

        expect(price(base, 'ITEM_ULTRA_BALL')).toBe(1234);
        expect(price(base, 'ITEM_ABILITY_PATCH')).toBe(9999);
    });

    test('prices every TM of a pool from that pool’s value', () => {
        const base = setup({ prices: { tms: { avgDmg: 111, godlikeDmg: 222 } } });
        injectItemPrices(base.ctx);

        expect(price(base, 'ITEM_TM01')).toBe(111);    // avgDmg  = TM01–10
        expect(price(base, 'ITEM_TM51')).toBe(222);    // godlike = TM51–56
    });

    test('a mint is priced by name', () => {
        const base = setup({ prices: { mints: { ADAMANT: 4242 } } });
        injectItemPrices(base.ctx);

        expect(price(base, 'ITEM_ADAMANT_MINT')).toBe(4242);
        expect(price(base, 'ITEM_LONELY_MINT')).toBe(itemPriceWriter.ITEM_PRICE_DEFAULTS.mints.LONELY);
    });

    test('an out-of-range or missing value falls back to the default, as clampPrice does', () => {
        const base = setup({ prices: { balls: { ultra: -5 } } });
        injectItemPrices(base.ctx);

        expect(price(base, 'ITEM_ULTRA_BALL')).toBe(itemPriceWriter.ITEM_PRICE_DEFAULTS.balls.ultra);
    });
});

describe('what the writer would not touch, the injector does not touch', () => {
    test('an unmanaged item keeps its base price', () => {
        const base = setup({ prices: { balls: { ultra: 50 } } });
        injectItemPrices(base.ctx);

        expect(price(base, 'ITEM_POTION')).toBe(200);
        expect(price(base, 'ITEM_MASTER_BALL')).toBe(1000);
    });

    test('a price written as a config ternary is skipped — Serious Mint stays as compiled', () => {
        const base = setup({ prices: { mints: { SERIOUS: 1 } } });
        injectItemPrices(base.ctx);

        expect(price(base, 'ITEM_SERIOUS_MINT')).toBe(20);
        expect(base.rom.journal.some(e => e.offset === base.itemAt('ITEM_SERIOUS_MINT'))).toBe(false);
    });

    test('with the defaults, balls and ability items are already the committed values → no write', () => {
        // ITEM_PRICE_DEFAULTS mirrors items.h for balls/mints/ability items (the TM ladder does not).
        const base = setup({});
        injectItemPrices(base.ctx);

        const untouched = ['ITEM_ULTRA_BALL', 'ITEM_QUICK_BALL', 'ITEM_TIMER_BALL', 'ITEM_ABILITY_CAPSULE', 'ITEM_ABILITY_PATCH', 'ITEM_LONELY_MINT'];
        for (const item of untouched) {
            expect(base.rom.journal.some(e => e.offset === base.itemAt(item))).toBe(false);
        }
        expect(price(base, 'ITEM_TM01')).toBe(itemPriceWriter.ITEM_PRICE_DEFAULTS.tms.avgDmg);
    });
});

describe('failure modes and bookkeeping', () => {
    test('reports how many prices it wrote and tags them', () => {
        const base = setup({ prices: { balls: { ultra: 77 } } });
        const { writes } = injectItemPrices(base.ctx);

        expect(writes).toBeGreaterThan(0);
        expect(base.rom.journal.every(e => /price/i.test(e.tag))).toBe(true);
    });

    test('an item the base’s constants do not define throws naming it', () => {
        // Drift between src/data/items.h and include/constants/items.h: a price to write for an item
        // with no id would otherwise land at a guessed offset.
        const base = setup({});
        const before = ['    [ITEM_NOT_A_REAL_ITEM] =', '    {', '        .price = 200,', '    },'].join('\n');
        const after = before.replace('200', '250');
        expect(() => injectItemPrices(base.ctx, { itemsSource: before, patchedSource: after }))
            .toThrow(/ITEM_NOT_A_REAL_ITEM/);
    });

    test('the harness can supply the sources instead of reading the tree', () => {
        const base = setup({});
        const before = ['    [ITEM_ULTRA_BALL] =', '    {', '        .price = 10,', '    },'].join('\n');
        const after = before.replace('= 10', '= 4000');
        const { writes } = injectItemPrices(base.ctx, { itemsSource: before, patchedSource: after });

        expect(writes).toBe(1);
        expect(price(base, 'ITEM_ULTRA_BALL')).toBe(4000);
    });

    test('reads the base’s own items.h by default', () => {
        expect(itemPriceWriter.file).toBe(path.resolve(__dirname, '..', '..', '..', 'src', 'data', 'items.h'));
    });
});
