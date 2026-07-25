'use strict';

const fs = require('fs').promises;
const path = require('path');

// T-202 — emit the per-ROM in-game-trade -> nickname C table into src/trade_nicknames.c, between the
// // @TRADE_NICKNAMES_START / _END anchors. Keyed by the INGAME_TRADE_* index constants. Reuses the T-068
// sanitizer (last line of defence before untrusted names reach C: [A-Za-z0-9 ], ≤12) and COMPOUND_STRING
// for the inline string pointers (B-020). Feature-off (or every trade unnamed) = writer not invoked / empty
// map = committed sentinel table stays = every lookup NULL = the traded mon keeps its vanilla nickname.

const { sanitizeNickname } = require('./starterNameWriter');

const START = '// @TRADE_NICKNAMES_START';
const END = '// @TRADE_NICKNAMES_END';
const SENTINEL = '    { 0xFF, COMPOUND_STRING("") },';
const SAFE_TRADE_KEY = /^INGAME_TRADE_[A-Z0-9_]+$/;

// Build the C rows (a string) for one ROM's trade->naming map. Skips entries whose sanitized name is empty
// (they keep the vanilla nickname). Always non-empty (sentinel fallback) so the array is never a -Werror
// zero-length array.
function buildTradeRows(tradeNaming) {
    const rows = Object.keys(tradeNaming || {})
        .filter((k) => SAFE_TRADE_KEY.test(k))
        .sort()
        .map((k) => ({ k, name: sanitizeNickname((tradeNaming[k] || {}).nickname) }))
        .filter((e) => e.name.length > 0)
        .map((e) => `    { ${e.k}, COMPOUND_STRING("${e.name}") },`);
    if (rows.length === 0) rows.push(SENTINEL);
    return rows.join('\n');
}

// Replace the whole anchored region (markers + body) with rebuilt markers + rows. Idempotent.
function applyTradeNames(fileContent, tradeNaming) {
    const rows = buildTradeRows(tradeNaming);
    const region = new RegExp(`[ \\t]*${START}[\\s\\S]*?${END}`);
    return fileContent.replace(region, `    ${START}\n${rows}\n    ${END}`);
}

const TRADE_FILE = path.resolve(__dirname, '..', 'src', 'trade_nicknames.c');

// Splice the per-ROM trade table into src/trade_nicknames.c (restored by make.js's restore()).
async function writeTradeNames(tradeNaming) {
    if (!tradeNaming) return;
    const content = await fs.readFile(TRADE_FILE, 'utf8');
    await fs.writeFile(TRADE_FILE, applyTradeNames(content, tradeNaming), 'utf8');
}

module.exports = { buildTradeRows, applyTradeNames, writeTradeNames, START, END };
