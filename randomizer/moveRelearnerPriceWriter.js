'use strict';

// T-167 — configurable move-relearn price. The move relearner charges money to relearn a move the
// Pokémon has had before (free the first time). That price is a single #define in the C decomp
// (src/move_relearner.c → MOVE_RELEARNER_MOVE_COST, read by GetMoveRelearnerMoveCost). This writer
// patches that #define from the bundle config at ROM-build time (called from make.js buildOneRom),
// then make.js's restore() (git checkout -- src/) reverts the file. Modeled on moneyWriter.js.

const fs = require('fs').promises;
const path = require('path');

const MOVE_RELEARNER_FILE = path.resolve(__dirname, '..', 'src', 'move_relearner.c');

const MOVE_RELEARN_PRICE_DEFAULT = 250;

function clampPrice(v, def = MOVE_RELEARN_PRICE_DEFAULT) {
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return def;
    return Math.round(v);
}

/**
 * Patch the MOVE_RELEARNER_MOVE_COST #define in the given C source text. Pure — returns the new text.
 * @param {string} content - move_relearner.c source
 * @param {number|undefined} price
 * @returns {string}
 */
function patchMoveRelearnPriceInContent(content, price) {
    const cost = clampPrice(price);
    return content.replace(/#define MOVE_RELEARNER_MOVE_COST\s+\d+/, `#define MOVE_RELEARNER_MOVE_COST ${cost}`);
}

/**
 * Read the relearner C file, patch the price #define from config, and write it back.
 * A no-op-equivalent when price is undefined (the default reproduces the committed value).
 */
async function writeMoveRelearnerPrice(price, { file = MOVE_RELEARNER_FILE } = {}) {
    const content = await fs.readFile(file, 'utf8');
    const patched = patchMoveRelearnPriceInContent(content, price);
    await fs.writeFile(file, patched, 'utf8');
}

module.exports = {
    writeMoveRelearnerPrice,
    patchMoveRelearnPriceInContent,
    clampPrice,
    MOVE_RELEARN_PRICE_DEFAULT,
    file: MOVE_RELEARNER_FILE,
};
