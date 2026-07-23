'use strict';

// T-194 — randomized town trades: write the per-ROM trade data into src/data/trade.h.
//
// Data-driven design (owner decision): the 4 town-trader map scripts are static & committed; ALL
// per-ROM variation lives in the `sIngameTrades[]` array (offered species, gym-cap level, the accepted
// species set, and the base forms the message lists). The engine (src/trade.c) reads these via the
// `CreateInGameTradePokemon` / `BufferInGameTradeOffer` / `IsRequestedTradeMon` specials.
//
// This writer REPLACES the `sIngameTrades[]` block (emitting the accepted/base-form lookup arrays just
// above it) and leaves the rest of trade.h untouched (`sIngameTradeMail[]` stays — the randomized gifts
// carry no held item, so the mail path is never taken). Called from writer.js at ROM-build time; the
// maker's restore (git checkout -- src/) reverts the file afterward, so trade.h is never committed dirty.

const fs = require('fs').promises;
const path = require('path');

const TRADE_H_FILE = path.resolve(__dirname, '..', 'src', 'data', 'trade.h');

// Matches the whole `static const struct InGameTrade sIngameTrades[] = { … };` block. The array is the
// only `\n};` at column 0 in this region (entries close with an indented `},`).
const SINGAME_TRADES_RE = /static const struct InGameTrade sIngameTrades\[\] =\n\{[\s\S]*?\n\};/;

const IVS = '{ 15, 15, 15, 15, 15, 15 }';
const CONDITIONS = '{ 0, 0, 0, 0, 0 }';

function arrName(prefix, ingameTradeId) {
    return `${prefix}${ingameTradeId}`;
}

// The lookup arrays (accepted set + base forms) for one trade, declared before sIngameTrades[].
function renderLists(trade) {
    const accepted = arrName('sTradeAccepted_', trade.ingameTradeId);
    const base = arrName('sTradeBase_', trade.ingameTradeId);
    return `static const u16 ${accepted}[] = { ${trade.acceptedSpecies.join(', ')} };\n`
        + `static const u16 ${base}[] = { ${trade.acceptedBaseForms.join(', ')} };\n`;
}

// One designated `[INGAME_TRADE_X] = { … }` entry. Empty nickname + ITEM_NONE → the gift keeps its
// species name and carries no mail; `.level` forces the gym-cap level; the lists drive accept + message.
function renderEntry(trade) {
    const accepted = arrName('sTradeAccepted_', trade.ingameTradeId);
    const base = arrName('sTradeBase_', trade.ingameTradeId);
    const requestedSpecies = trade.acceptedBaseForms[0] || trade.acceptedSpecies[0] || 'SPECIES_NONE';
    return `    [${trade.ingameTradeId}] =\n`
        + `    {\n`
        + `        .nickname = _(""),\n`
        + `        .species = ${trade.offeredSpecies || 'SPECIES_NONE'},\n`
        + `        .ivs = ${IVS},\n`
        + `        .abilityNum = 0,\n`
        + `        .otId = 51436,\n`
        + `        .conditions = ${CONDITIONS},\n`
        + `        .personality = 0,\n`
        + `        .heldItem = ITEM_NONE,\n`
        + `        .mailNum = -1,\n`
        + `        .otName = _("TRADER"),\n`
        + `        .otGender = MALE,\n`
        + `        .sheen = 0,\n`
        + `        .requestedSpecies = ${requestedSpecies},\n`
        + `        .level = ${trade.level | 0},\n`
        + `        .requestedSpeciesList = ${accepted},\n`
        + `        .requestedSpeciesCount = ${trade.acceptedSpecies.length},\n`
        + `        .requestedBaseForms = ${base},\n`
        + `        .requestedBaseFormCount = ${trade.acceptedBaseForms.length},\n`
        + `    },`;
}

// The full replacement text: all lookup arrays, then the regenerated sIngameTrades[] block.
function renderTradeData(trades) {
    const lists = trades.map(renderLists).join('');
    const entries = trades.map(renderEntry).join('\n');
    return `${lists}static const struct InGameTrade sIngameTrades[] =\n{\n${entries}\n};`;
}

// Pure: replace the sIngameTrades[] block in trade.h source text. Throws if the block is absent.
function applyTradesToContent(content, trades) {
    if (!Array.isArray(trades) || trades.length === 0) return content;
    if (!SINGAME_TRADES_RE.test(content)) {
        throw new Error('tradeWriter: sIngameTrades[] block not found in trade.h');
    }
    return content.replace(SINGAME_TRADES_RE, renderTradeData(trades));
}

// Read trade.h, patch the sIngameTrades[] block from the trades artifact, write it back.
async function writeTrades(trades) {
    if (!Array.isArray(trades) || trades.length === 0) return;
    const content = await fs.readFile(TRADE_H_FILE, 'utf8');
    await fs.writeFile(TRADE_H_FILE, applyTradesToContent(content, trades), 'utf8');
}

module.exports = { writeTrades, applyTradesToContent, renderTradeData, renderEntry, renderLists };
