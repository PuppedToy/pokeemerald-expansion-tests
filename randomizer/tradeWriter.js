'use strict';

// T-194 — randomized town trades: write the per-ROM trade data into src/data/trade.h.
//
// Data-driven design (owner decision): the 4 town-trader map scripts are static & committed; ALL
// per-ROM variation lives in the `gIngameTrades[]` array (offered species, gym-cap level, the accepted
// species set, and the base forms the message lists). The engine (src/trade.c) reads these via the
// `CreateInGameTradePokemon` / `BufferInGameTradeOffer` / `IsRequestedTradeMon` specials.
//
// This writer REPLACES the `gIngameTrades[]` block and leaves the rest of trade.h untouched
// (`sIngameTradeMail[]` stays — the randomized gifts carry no held item, so the mail path is never
// taken). Called from writer.js at ROM-build time; the maker's restore (git checkout -- src/) reverts
// the file afterward, so trade.h is never committed dirty.
//
// T-237 — the table is exported and every entry is fixed-width: the accepted-species set and the base
// forms used to be separate per-run `static const u16 sTradeAccepted_*/sTradeBase_*[]` arrays behind
// pointers (invisible to the injector and variable in length); they are inline
// `u16 [TRADE_SPECIES_LIST_CAPACITY]` fields now, so gIngameTrades is one flat block at a fixed offset.

const fs = require('fs').promises;
const path = require('path');

const { TRADE_SPECIES_LIST_CAPACITY } = require('./layout');

const TRADE_H_FILE = path.resolve(__dirname, '..', 'src', 'data', 'trade.h');

// Matches the whole `const struct InGameTrade gIngameTrades[INGAME_TRADES_COUNT] = { … };` block. The
// array is the only `\n};` at column 0 in this region (entries close with an indented `},`).
const SINGAME_TRADES_RE = /const struct InGameTrade gIngameTrades\[[^\]]*\] =\n\{[\s\S]*?\n\};/;

const IVS = '{ 15, 15, 15, 15, 15, 15 }';
const CONDITIONS = '{ 0, 0, 0, 0, 0 }';

// An inline `{ SPECIES_A, SPECIES_B }` initializer for one of the two fixed-capacity species lists.
function renderSpeciesList(field, species, tradeId) {
    if (species.length > TRADE_SPECIES_LIST_CAPACITY) {
        throw new Error(`tradeWriter: ${tradeId}.${field} has ${species.length} species; `
            + `TRADE_SPECIES_LIST_CAPACITY is ${TRADE_SPECIES_LIST_CAPACITY}. `
            + `Raise it in include/constants/randomizer_layout.h.`);
    }
    return `{ ${species.join(', ')} }`;
}

// One designated `[INGAME_TRADE_X] = { … }` entry. Empty nickname + ITEM_NONE → the gift keeps its
// species name and carries no mail; `.level` forces the gym-cap level; the lists drive accept + message.
function renderEntry(trade) {
    const accepted = renderSpeciesList('requestedSpeciesList', trade.acceptedSpecies, trade.ingameTradeId);
    const base = renderSpeciesList('requestedBaseForms', trade.acceptedBaseForms, trade.ingameTradeId);
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

// The full replacement text: the regenerated gIngameTrades[] block (T-237 — no side arrays any more,
// the species lists live inside the entries).
function renderTradeData(trades) {
    const entries = trades.map(renderEntry).join('\n');
    return `const struct InGameTrade gIngameTrades[INGAME_TRADES_COUNT] =\n{\n${entries}\n};`;
}

// Pure: replace the gIngameTrades[] block in trade.h source text. Throws if the block is absent.
function applyTradesToContent(content, trades) {
    if (!Array.isArray(trades) || trades.length === 0) return content;
    if (!SINGAME_TRADES_RE.test(content)) {
        throw new Error('tradeWriter: gIngameTrades[] block not found in trade.h');
    }
    return content.replace(SINGAME_TRADES_RE, renderTradeData(trades));
}

// Read trade.h, patch the gIngameTrades[] block from the trades artifact, write it back.
async function writeTrades(trades) {
    if (!Array.isArray(trades) || trades.length === 0) return;
    const content = await fs.readFile(TRADE_H_FILE, 'utf8');
    await fs.writeFile(TRADE_H_FILE, applyTradesToContent(content, trades), 'utf8');
}

module.exports = { writeTrades, applyTradesToContent, renderTradeData, renderEntry, renderSpeciesList };
