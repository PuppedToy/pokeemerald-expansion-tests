'use strict';

// T-073 — the item-price writer patches the .price field of shop items in src/data/items.h from the
// bundle config at ROM-build time (mirrors moneyWriter). Written BEFORE randomizer/itemPriceWriter.js
// exists: this suite fails until the module lands. The real ROM compile is CI/builder-only.

const fs = require('fs');
const {
    patchPricesInContent, clampPrice, ITEM_PRICE_DEFAULTS, tmPoolForNumber, TM_POOL_RANGES, file,
} = require('../../itemPriceWriter');
const { TM_RANGES, FIXED_TMS } = require('../../tmRandomizer');

// A miniature items.h carrying one block per item shape the writer must handle, in the exact
// committed format (4-space header, 8-space `.price = N,`).
function block(item, priceLine) {
    return [
        `    [${item}] =`,
        '    {',
        `        .name = ITEM_NAME("x"),`,
        `        ${priceLine}`,
        `        .pocket = POCKET_ITEMS,`,
        '    },',
    ].join('\n');
}
const SAMPLE = [
    block('ITEM_POTION', '.price = 200,'),            // non-target — must stay
    block('ITEM_ULTRA_BALL', '.price = 10,'),
    block('ITEM_QUICK_BALL', '.price = 10,'),
    block('ITEM_TIMER_BALL', '.price = 10,'),
    block('ITEM_LONELY_MINT', '.price = 250,'),
    block('ITEM_BOLD_MINT', '.price = 2000,'),
    block('ITEM_ADAMANT_MINT', '.price = 3000,'),
    block('ITEM_SERIOUS_MINT', '.price = (I_PRICE >= GEN_9) ? 20000 : 20,'), // ternary — never touched
    block('ITEM_ABILITY_CAPSULE', '.price = 3000,'),
    block('ITEM_ABILITY_PATCH', '.price = 5000,'),
    block('ITEM_TM01', '.price = 3000,'),   // avgDmg
    block('ITEM_TM31', '.price = 3000,'),   // strongDmg
    block('ITEM_TM72', '.price = 3000,'),   // weather (fixed)
    block('ITEM_TM91', '.price = 3000,'),   // godlikeStatus
    block('ITEM_HM01', '.price = 0,'),      // HM — never touched
].join('\n\n');

const priceOf = (content, item) => {
    const re = new RegExp(`\\[${item}\\][\\s\\S]*?\\.price = ([^,]+),`);
    const m = content.match(re);
    return m ? m[1] : null;
};

describe('tmPoolForNumber — TM number → pool name', () => {
    test('maps representative TMs to the documented pools', () => {
        expect(tmPoolForNumber(1)).toBe('avgDmg');
        expect(tmPoolForNumber(10)).toBe('avgDmg');
        expect(tmPoolForNumber(11)).toBe('goodDmg');
        expect(tmPoolForNumber(31)).toBe('strongDmg');
        expect(tmPoolForNumber(51)).toBe('godlikeDmg');
        expect(tmPoolForNumber(57)).toBe('niche');
        expect(tmPoolForNumber(61)).toBe('avgStatus');
        expect(tmPoolForNumber(72)).toBe('weather');
        expect(tmPoolForNumber(76)).toBe('barriers');
        expect(tmPoolForNumber(78)).toBe('goodStatus');
        expect(tmPoolForNumber(95)).toBe('godlikeStatus');
    });
    test('numbers outside 1..95 have no pool (untouched)', () => {
        expect(tmPoolForNumber(0)).toBeNull();
        expect(tmPoolForNumber(96)).toBeNull();
        expect(tmPoolForNumber(100)).toBeNull();
    });
    test('every managed TM 1..95 resolves to a pool that exists in the defaults', () => {
        for (let n = 1; n <= 95; n++) {
            const pool = tmPoolForNumber(n);
            expect(pool).toBeTruthy();
            expect(ITEM_PRICE_DEFAULTS.tms).toHaveProperty(pool);
        }
    });
});

describe('TM_POOL_RANGES stays in sync with tmRandomizer (SSOT guard)', () => {
    test('non-weather ranges equal tmRandomizer TM_RANGES boundaries', () => {
        const mine = TM_POOL_RANGES.filter(r => r.name !== 'weather').map(r => [r.start, r.end]);
        const theirs = TM_RANGES.map(r => [r.start, r.end]);
        expect(mine).toEqual(theirs);
    });
    test('the weather range matches the fixed-weather TM slots', () => {
        const weather = TM_POOL_RANGES.find(r => r.name === 'weather');
        const fixed = Object.keys(FIXED_TMS).map(Number).sort((a, b) => a - b);
        expect([weather.start, weather.end]).toEqual([fixed[0], fixed[fixed.length - 1]]);
    });
});

describe('patchPricesInContent — targeted items', () => {
    const prices = {
        balls: { ultra: 111, quick: 222, timer: 333 },
        mints: { LONELY: 444, BOLD: 555, ADAMANT: 666 },
        abilityCapsule: 777,
        abilityPatch: 888,
        tms: { avgDmg: 1001, strongDmg: 3003, weather: 7007, godlikeStatus: 9009 },
    };
    let out;
    beforeAll(() => { out = patchPricesInContent(SAMPLE, prices); });

    test('balls take their configured prices', () => {
        expect(priceOf(out, 'ITEM_ULTRA_BALL')).toBe('111');
        expect(priceOf(out, 'ITEM_QUICK_BALL')).toBe('222');
        expect(priceOf(out, 'ITEM_TIMER_BALL')).toBe('333');
    });
    test('mints take their configured prices', () => {
        expect(priceOf(out, 'ITEM_LONELY_MINT')).toBe('444');
        expect(priceOf(out, 'ITEM_BOLD_MINT')).toBe('555');
        expect(priceOf(out, 'ITEM_ADAMANT_MINT')).toBe('666');
    });
    test('ability items take their configured prices', () => {
        expect(priceOf(out, 'ITEM_ABILITY_CAPSULE')).toBe('777');
        expect(priceOf(out, 'ITEM_ABILITY_PATCH')).toBe('888');
    });
    test('TMs take their POOL price', () => {
        expect(priceOf(out, 'ITEM_TM01')).toBe('1001'); // avgDmg
        expect(priceOf(out, 'ITEM_TM31')).toBe('3003'); // strongDmg
        expect(priceOf(out, 'ITEM_TM72')).toBe('7007'); // weather
        expect(priceOf(out, 'ITEM_TM91')).toBe('9009'); // godlikeStatus
    });
    test('HMs, Serious Mint and non-target items are untouched', () => {
        expect(priceOf(out, 'ITEM_HM01')).toBe('0');
        expect(priceOf(out, 'ITEM_SERIOUS_MINT')).toBe('(I_PRICE >= GEN_9) ? 20000 : 20');
        expect(priceOf(out, 'ITEM_POTION')).toBe('200');
    });
});

describe('patchPricesInContent — defaults & clamping', () => {
    test('no config → committed defaults reproduced (no diff for defaulted items)', () => {
        const out = patchPricesInContent(SAMPLE); // undefined prices
        expect(priceOf(out, 'ITEM_LONELY_MINT')).toBe(String(ITEM_PRICE_DEFAULTS.mints.LONELY));
        expect(priceOf(out, 'ITEM_ABILITY_CAPSULE')).toBe(String(ITEM_PRICE_DEFAULTS.abilityCapsule));
        expect(priceOf(out, 'ITEM_ABILITY_PATCH')).toBe(String(ITEM_PRICE_DEFAULTS.abilityPatch));
        expect(priceOf(out, 'ITEM_ULTRA_BALL')).toBe(String(ITEM_PRICE_DEFAULTS.balls.ultra));
    });
    test('partial config falls back to defaults per-item', () => {
        const out = patchPricesInContent(SAMPLE, { mints: { LONELY: 999 } });
        expect(priceOf(out, 'ITEM_LONELY_MINT')).toBe('999');
        expect(priceOf(out, 'ITEM_BOLD_MINT')).toBe(String(ITEM_PRICE_DEFAULTS.mints.BOLD));
    });
    test('clampPrice rejects negatives / NaN, rounds & floors floats at 0', () => {
        expect(clampPrice(-5, 250)).toBe(250);
        expect(clampPrice(NaN, 250)).toBe(250);
        expect(clampPrice(undefined, 250)).toBe(250);
        expect(clampPrice(2999.6, 250)).toBe(3000);
        expect(clampPrice(0, 250)).toBe(0);
    });
});

describe('committed items.h matches the writer', () => {
    test('the real items.h carries the target blocks and the writer changes exactly their prices', () => {
        const content = fs.readFileSync(file, 'utf8');
        for (const item of ['ITEM_ULTRA_BALL', 'ITEM_LONELY_MINT', 'ITEM_ABILITY_CAPSULE',
            'ITEM_ABILITY_PATCH', 'ITEM_TM01', 'ITEM_HM01', 'ITEM_SERIOUS_MINT']) {
            expect(content).toMatch(new RegExp(`\\[${item}\\]\\s*=`));
        }
        const patched = patchPricesInContent(content, {
            balls: { ultra: 12345 }, mints: { LONELY: 54321 }, tms: { avgDmg: 42424 },
        });
        expect(priceOf(patched, 'ITEM_ULTRA_BALL')).toBe('12345');
        expect(priceOf(patched, 'ITEM_LONELY_MINT')).toBe('54321');
        expect(priceOf(patched, 'ITEM_TM01')).toBe('42424');
        // Serious Mint's config-gated price and HM zero prices survive the real-file pass.
        expect(priceOf(patched, 'ITEM_SERIOUS_MINT')).toBe('(I_PRICE >= GEN_9) ? 20000 : 20');
        expect(priceOf(patched, 'ITEM_HM01')).toBe('0');
    });
});
