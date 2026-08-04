'use strict';

/**
 * Inject gItemsInfo[].price — the T-073 configurable shop prices (T-239, Group A).
 *
 * The compile path patches `src/data/items.h` with `itemPriceWriter.patchPricesInContent`, whose rule is
 * narrower than "price every managed item": it only rewrites a block whose `.price` line is a plain
 * number, so Serious Mint's `(I_PRICE >= GEN_9) ? 20000 : 20` is never touched, and it leaves every
 * unmanaged item alone.
 *
 * Rather than re-deriving that rule (and drifting from it), this module runs the writer's own function
 * over the base's items.h and injects exactly the prices it changed — the compile path's output is the
 * specification. Reading the base's source is safe here: inject mode never mutates the tree, and these
 * are the same base sources the constant ids come from.
 */

const { ITEM_INFO } = require('../structLayout');
const { BASE_SOURCE_FILES } = require('../sources');
const itemPriceWriter = require('../../itemPriceWriter');

const TAG = 'itemPrices';

const BLOCK_RE = /^\s*\[(ITEM_[A-Z0-9_]+)\]\s*=/;
// Numeric prices only — exactly the line shape patchPricesInContent rewrites.
const PRICE_RE = /^\s*\.price = (\d+),/;

/** item id → numeric price, for every block whose price is a plain number (the writer's own view). */
function scanPrices(source) {
    const prices = new Map();
    let item = null;
    for (const line of source.split('\n')) {
        const block = line.match(BLOCK_RE);
        if (block) { item = block[1]; continue; }
        if (!item) continue;
        const price = line.match(PRICE_RE);
        if (!price) continue;
        prices.set(item, Number(price[1]));
        item = null;                       // one `.price` per block, as the writer assumes
    }
    return prices;
}

/** The prices the compile path would have changed: `[{ item, from, to }]`. */
function collectPriceChanges(baseSource, patchedSource) {
    const before = scanPrices(baseSource);
    const after = scanPrices(patchedSource);
    const changes = [];
    for (const [item, to] of after) {
        const from = before.get(item);
        if (from !== undefined && from !== to) changes.push({ item, from, to });
    }
    return changes;
}

/**
 * @param {object} ctx  see injector/context.js
 * @param {object} [opts]
 * @param {string} [opts.itemsSource]    base items.h text (defaults to reading the tree)
 * @param {string} [opts.patchedSource]  its patched form (defaults to running the writer)
 * @param {object} [opts.prices]         price config (defaults to `ctx.data.config.prices`)
 * @returns {{ writes: number, changes: Array }}
 */
function injectItemPrices(ctx, { itemsSource = null, patchedSource = null, prices = undefined } = {}) {
    const { rom, constants, data, log } = ctx;
    const source = itemsSource !== null ? itemsSource : ctx.baseSources.read(BASE_SOURCE_FILES.items);
    const config = prices !== undefined ? prices : (data.config || {}).prices;
    const patched = patchedSource !== null ? patchedSource : itemPriceWriter.patchPricesInContent(source, config);

    const changes = collectPriceChanges(source, patched);
    for (const change of changes) {
        const id = constants.get(change.item);
        if (id === undefined) {
            throw new Error(
                `injector/itemPrices: '${change.item}' has a price to write but is not an item id the base ` +
                `defines — src/data/items.h and include/constants/items.h disagree`);
        }
        rom.writeU32(ctx.itemOffset(id) + ITEM_INFO.price, change.to, TAG);
    }

    if (changes.length) log(`itemPrices: ${changes.length} price(s) written`);
    return { writes: changes.length, changes };
}

module.exports = { injectItemPrices, collectPriceChanges, scanPrices, TAG };
