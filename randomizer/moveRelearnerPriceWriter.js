'use strict';

// T-167 / T-234 — configurable move-relearn price. The move relearner charges money to relearn a move the
// Pokémon has had before (free the first time). That price now lives in the runtime settings block
// `gRandomizerSettings.moveRelearnerCost` (src/randomizer_settings.c), read by GetMoveRelearnerMoveCost,
// so a prebuilt ROM can be repatched without recompiling (ADR-022). This writer patches that struct field
// from the bundle config at ROM-build time (called from make.js buildOneRom), then make.js's restore()
// (git checkout -- src/) reverts the file. Modeled on moneyWriter.js.

const fs = require('fs').promises;
const path = require('path');

const SETTINGS_FILE = path.resolve(__dirname, '..', 'src', 'randomizer_settings.c');

const MOVE_RELEARN_PRICE_DEFAULT = 250;

function clampPrice(v, def = MOVE_RELEARN_PRICE_DEFAULT) {
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return def;
    return Math.round(v);
}

/**
 * Patch the moveRelearnerCost field of gRandomizerSettings in the given C source text. Pure — returns
 * the new text.
 * @param {string} content - src/randomizer_settings.c source
 * @param {number|undefined} price
 * @returns {string}
 */
function patchMoveRelearnPriceInContent(content, price) {
    const cost = clampPrice(price);
    return content.replace(/(\.moveRelearnerCost\s*=\s*)\d+/, `$1${cost}`);
}

/**
 * Read the settings C file, patch the price field from config, and write it back.
 * A no-op-equivalent when price is undefined (the default reproduces the committed value).
 */
async function writeMoveRelearnerPrice(price, { file = SETTINGS_FILE } = {}) {
    const content = await fs.readFile(file, 'utf8');
    const patched = patchMoveRelearnPriceInContent(content, price);
    await fs.writeFile(file, patched, 'utf8');
}

module.exports = {
    writeMoveRelearnerPrice,
    patchMoveRelearnPriceInContent,
    clampPrice,
    MOVE_RELEARN_PRICE_DEFAULT,
    file: SETTINGS_FILE,
};
