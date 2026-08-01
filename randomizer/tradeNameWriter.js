'use strict';

const fs = require('fs').promises;
const path = require('path');

// T-202 — emit the per-ROM in-game-trade -> nickname C table into src/trade_nicknames.c, between the
// // @TRADE_NICKNAMES_START / _END anchors. Keyed by the INGAME_TRADE_* index constants. Reuses the T-068
// sanitizer (last line of defence before untrusted names reach C: [A-Za-z0-9 ], ≤12) and COMPOUND_STRING
// for the inline string pointers (B-020). Feature-off (or every trade unnamed) = writer not invoked / empty
// map = committed sentinel table stays = every lookup NULL = the traded mon keeps its vanilla nickname.

const { sanitizeNickname } = require('./starterNameWriter');
const { TRADE_NICKNAME_CAPACITY } = require('./layout');

const START = '// @TRADE_NICKNAMES_START';
const END = '// @TRADE_NICKNAMES_END';
const COUNT_START = '// @TRADE_NICKNAMES_COUNT_START';
const COUNT_END = '// @TRADE_NICKNAMES_COUNT_END';
const SAFE_TRADE_KEY = /^INGAME_TRADE_[A-Z0-9_]+$/;

// The named trades, sorted, minus the ones whose sanitized name is empty (they keep the vanilla nickname).
function namedTrades(tradeNaming) {
    return Object.keys(tradeNaming || {})
        .filter((k) => SAFE_TRADE_KEY.test(k))
        .sort()
        .map((k) => ({ k, name: sanitizeNickname((tradeNaming[k] || {}).nickname) }))
        .filter((e) => e.name.length > 0);
}

// Build the C rows (a string) for one ROM's trade->naming map. T-237: the table is fixed-capacity and the
// name is an inline `u8 [POKEMON_NAME_LENGTH + 1]`, so rows use `_("…")` rather than COMPOUND_STRING, and
// an empty table is legal (the array is sized by TRADE_NICKNAME_CAPACITY, not by its contents).
function buildTradeRows(tradeNaming) {
    return namedTrades(tradeNaming).map((e) => `    { ${e.k}, _("${e.name}") },`).join('\n');
}

// Replace the whole anchored region (markers + body) with rebuilt markers + rows, and the row count with
// it — the two must always agree, so they are written together. Idempotent.
function applyTradeNames(fileContent, tradeNaming) {
    const entries = namedTrades(tradeNaming);
    if (entries.length > TRADE_NICKNAME_CAPACITY) {
        throw new Error(`tradeNameWriter: ${entries.length} named trades exceed TRADE_NICKNAME_CAPACITY `
            + `(${TRADE_NICKNAME_CAPACITY}). Raise it in include/constants/randomizer_layout.h.`);
    }
    const rows = buildTradeRows(tradeNaming);
    const region = new RegExp(`[ \\t]*${START}[\\s\\S]*?${END}`);
    const countRegion = new RegExp(`[ \\t]*${COUNT_START}[\\s\\S]*?${COUNT_END}`);
    return fileContent
        .replace(region, `    ${START}\n${rows}\n    ${END}`)
        .replace(countRegion, `    ${COUNT_START}\n    ${entries.length}\n    ${COUNT_END}`);
}

const TRADE_FILE = path.resolve(__dirname, '..', 'src', 'trade_nicknames.c');

// Splice the per-ROM trade table into src/trade_nicknames.c (restored by make.js's restore()).
async function writeTradeNames(tradeNaming) {
    if (!tradeNaming) return;
    const content = await fs.readFile(TRADE_FILE, 'utf8');
    await fs.writeFile(TRADE_FILE, applyTradeNames(content, tradeNaming), 'utf8');
}

module.exports = { buildTradeRows, applyTradeNames, writeTradeNames, START, END, COUNT_START, COUNT_END };
