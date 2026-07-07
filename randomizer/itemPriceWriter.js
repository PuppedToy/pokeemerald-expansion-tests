'use strict';

// T-073 — configurable shop item prices. Every town/city Mart sells 3 balls (Ultra/Quick/Timer),
// the 20 non-neutral mints, Ability Capsule and Ability Patch, and — in larger marts — TMs. Prices
// come natively from the `.price` field of each item in src/data/items.h, so wiring is data-only:
// this writer patches those `.price` values from the bundle config at ROM-build time (called from
// make.js buildOneRom), then make.js's restore() (git checkout -- src/) reverts the file. No C logic
// change is needed — the game already reads `.price`.
//
// TMs are not categorised in items.h; the categories that exist are the randomizer's TM POOLS
// (see randomizer/docs/tms.md + tmRandomizer.js). Per owner decision TMs are priced by pool (10
// categories); several pools may share a default price. Serious Mint (config-gated ternary price,
// not shop-stocked) and HMs (price 0) are intentionally left untouched.

const fs = require('fs').promises;
const path = require('path');

const ITEMS_FILE = path.resolve(__dirname, '..', 'src', 'data', 'items.h');

// The 20 non-neutral mints shops stock (Serious excluded). Keys match ITEM_<NAME>_MINT.
const MINT_NAMES = [
    'LONELY', 'NAUGHTY', 'BRAVE', 'LAX', 'MILD', 'RASH', 'QUIET', 'GENTLE', 'HASTY', 'NAIVE', // 250
    'BOLD', 'IMPISH', 'CALM', 'CAREFUL', 'RELAXED', 'SASSY',                                   // 2000
    'ADAMANT', 'MODEST', 'TIMID', 'JOLLY',                                                     // 3000
];

// TM number → pool. Ranges mirror tmRandomizer.js TM_RANGES (+ the fixed weather slots 72–75); a
// cross-check test in itemPriceWriter.test.js guards drift against that SSOT.
const TM_POOL_RANGES = [
    { name: 'avgDmg',        start: 1,  end: 10 },
    { name: 'goodDmg',       start: 11, end: 30 },
    { name: 'strongDmg',     start: 31, end: 50 },
    { name: 'godlikeDmg',    start: 51, end: 56 },
    { name: 'niche',         start: 57, end: 60 },
    { name: 'avgStatus',     start: 61, end: 71 },
    { name: 'weather',       start: 72, end: 75 },
    { name: 'barriers',      start: 76, end: 77 },
    { name: 'goodStatus',    start: 78, end: 90 },
    { name: 'godlikeStatus', start: 91, end: 95 },
];

// Defaults: mints / ability items / balls are the EXACT committed items.h prices. TM-pool defaults are
// a coherent power ladder (current per-TM prices don't map to pools) — all are tunable in the UI.
const ITEM_PRICE_DEFAULTS = {
    balls: { ultra: 10, quick: 10, timer: 10 },
    mints: {
        LONELY: 250, NAUGHTY: 250, BRAVE: 250, LAX: 250, MILD: 250,
        RASH: 250, QUIET: 250, GENTLE: 250, HASTY: 250, NAIVE: 250,
        BOLD: 2000, IMPISH: 2000, CALM: 2000, CAREFUL: 2000, RELAXED: 2000, SASSY: 2000,
        ADAMANT: 3000, MODEST: 3000, TIMID: 3000, JOLLY: 3000,
    },
    abilityCapsule: 3000,
    abilityPatch: 5000,
    tms: {
        avgDmg: 2500, avgStatus: 2500,
        goodDmg: 5000, goodStatus: 5000,
        niche: 3000, weather: 3000, barriers: 3000,
        strongDmg: 10000, godlikeDmg: 15000, godlikeStatus: 15000,
    },
};

function clampPrice(v, def) {
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return def;
    return Math.round(v);
}

function tmPoolForNumber(n) {
    for (const r of TM_POOL_RANGES) if (n >= r.start && n <= r.end) return r.name;
    return null;
}

// Merge config over defaults, clamping every value. Missing keys fall back per-item.
function resolvePrices(prices) {
    const p = prices || {};
    const D = ITEM_PRICE_DEFAULTS;
    const balls = {
        ultra: clampPrice(p.balls && p.balls.ultra, D.balls.ultra),
        quick: clampPrice(p.balls && p.balls.quick, D.balls.quick),
        timer: clampPrice(p.balls && p.balls.timer, D.balls.timer),
    };
    const mints = {};
    for (const name of MINT_NAMES) mints[name] = clampPrice(p.mints && p.mints[name], D.mints[name]);
    const tms = {};
    for (const pool of Object.keys(D.tms)) tms[pool] = clampPrice(p.tms && p.tms[pool], D.tms[pool]);
    return {
        balls, mints, tms,
        abilityCapsule: clampPrice(p.abilityCapsule, D.abilityCapsule),
        abilityPatch: clampPrice(p.abilityPatch, D.abilityPatch),
    };
}

// The target price for an ITEM_* id, or null if the item is not price-managed (→ left untouched).
function targetPriceFor(itemId, cfg) {
    switch (itemId) {
        case 'ITEM_ULTRA_BALL':      return cfg.balls.ultra;
        case 'ITEM_QUICK_BALL':      return cfg.balls.quick;
        case 'ITEM_TIMER_BALL':      return cfg.balls.timer;
        case 'ITEM_ABILITY_CAPSULE': return cfg.abilityCapsule;
        case 'ITEM_ABILITY_PATCH':   return cfg.abilityPatch;
        default: break;
    }
    const mint = itemId.match(/^ITEM_([A-Z]+)_MINT$/);
    if (mint && MINT_NAMES.includes(mint[1])) return cfg.mints[mint[1]];
    const tm = itemId.match(/^ITEM_TM(\d+)$/);
    if (tm) {
        const pool = tmPoolForNumber(parseInt(tm[1], 10));
        if (pool) return cfg.tms[pool];
    }
    return null;
}

/**
 * Patch the `.price` of every price-managed item in items.h source text. Pure — returns new text.
 * Line-scan: track the current `[ITEM_X] =` block header, then rewrite that block's numeric
 * `.price = N,` line when the item is a target. Non-numeric prices (Serious Mint's ternary) never
 * match; HMs and unlisted items are left alone.
 * @param {string} content - src/data/items.h source
 * @param {object} [prices] - { balls, mints, abilityCapsule, abilityPatch, tms }
 * @returns {string}
 */
function patchPricesInContent(content, prices) {
    const cfg = resolvePrices(prices);
    const lines = content.split('\n');
    let currentItem = null;
    for (let i = 0; i < lines.length; i++) {
        const header = lines[i].match(/^\s*\[(ITEM_[A-Z0-9_]+)\]\s*=/);
        if (header) { currentItem = header[1]; continue; }
        if (!currentItem) continue;
        const pm = lines[i].match(/^(\s*\.price = )(\d+)(,.*)$/);
        if (pm) {
            const price = targetPriceFor(currentItem, cfg);
            if (price != null) lines[i] = `${pm[1]}${price}${pm[3]}`;
            currentItem = null; // exactly one `.price` per block — stop scanning it
        }
    }
    return lines.join('\n');
}

/**
 * Read items.h, patch item prices from config, write it back. Defaults reproduce the committed
 * values, so this is a no-op-equivalent when `prices` is undefined.
 */
async function writeItemPrices(prices, { file = ITEMS_FILE } = {}) {
    const content = await fs.readFile(file, 'utf8');
    await fs.writeFile(file, patchPricesInContent(content, prices), 'utf8');
}

module.exports = {
    writeItemPrices, patchPricesInContent, clampPrice, tmPoolForNumber,
    resolvePrices, ITEM_PRICE_DEFAULTS, MINT_NAMES, TM_POOL_RANGES, file: ITEMS_FILE,
};
