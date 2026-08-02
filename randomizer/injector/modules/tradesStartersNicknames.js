'use strict';

/**
 * Inject the in-game trades, the starters and the two nickname tables — `trades-starters-nicknames`
 * (T-242). Four small outputs that share one property: they are the ones made of **text**.
 *
 * `_("Milos")` is not ASCII — the preprocessor maps every character through `charmap.txt` and
 * terminates with EOS — so every name goes through `injector/charmap.js`. Writing raw bytes would give
 * a ROM full of garbled nicknames of exactly the right length, which no size or offset check catches.
 *
 * The four sub-writers and the rules they mirror:
 *
 * | output | compile path | rule |
 * |---|---|---|
 * | starters | `writer.js` + `starterNameWriter.applyStarterChoose` | the three `gStarterMon` ids; the extra arrays always rebuilt with exactly `extraStarters.length` entries and the tail zero-filled (B-049's lock-step), with `gStarterExtraCount` written from the same number |
 * | location nicknames | `locationNameWriter` | rows for `locationKeys()` — the writer's own filter and sort — each with its gender, plus the count; an empty name still gets a row |
 * | trade nicknames | `tradeNameWriter` | `namedTrades()` — same, except a row whose sanitized name is EMPTY is dropped |
 * | in-game trades | `tradeWriter` | the whole table is regenerated, so an index the artifact does not name becomes a ZERO entry, not the base's |
 *
 * The trade table is not re-derived here: this module runs `tradeWriter.renderTradeData()` — the
 * writer's own emitter — and parses the C back into bytes. The same parser + encoder is first run over
 * the **committed** `gIngameTrades[]` block and byte-matched against the base ROM, which in one pass
 * proves the 128 B stride, every field offset in `struct InGameTrade`, and the charmap encoder (the
 * base's own entries carry text: `_("DOTS")`, `_("KOBE")`).
 */

const fs = require('fs');
const path = require('path');
const { LOCATION_NICKNAME, TRADE_NICKNAME, INGAME_TRADE } = require('../structLayout');
const { loadCharmap, encodeString } = require('../charmap');
const { buildInjectionContext } = require('../context');
const { sanitizeNickname, genderConst } = require('../../starterNameWriter');
const { locationKeys } = require('../../locationNameWriter');
const { namedTrades } = require('../../tradeNameWriter');
const tradeWriter = require('../../tradeWriter');
const {
    LOCATION_NICKNAME_CAPACITY, TRADE_NICKNAME_CAPACITY, STARTER_EXTRA_CAPACITY, TRADE_SPECIES_LIST_CAPACITY,
} = require('../../layout');

const TAG = 'tradesStartersNicknames';
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

const TRADE_H = () => path.resolve(REPO_ROOT, 'src', 'data', 'trade.h');

/**
 * The charmap, once per ROM. Every sub-writer needs it, and a test may call one of them directly.
 * The name field widths are checked against the base's own POKEMON_NAME_LENGTH / TRAINER_NAME_LENGTH
 * here rather than trusted from structLayout — they decide where the NEXT field starts.
 */
function charmapFor(ctx) {
    if (!ctx.charmap) {
        const nameWidth = ctx.constants.require('POKEMON_NAME_LENGTH') + 1;
        const otWidth = ctx.constants.require('TRAINER_NAME_LENGTH') + 1;
        if (nameWidth !== LOCATION_NICKNAME.nicknameWidth || nameWidth !== TRADE_NICKNAME.nicknameWidth
            || nameWidth !== INGAME_TRADE.nicknameWidth || otWidth !== INGAME_TRADE.otNameWidth) {
            throw new Error(
                `injector/${TAG}: the base's name fields are ${nameWidth}/${otWidth} bytes but ` +
                `structLayout declares ${LOCATION_NICKNAME.nicknameWidth}/${INGAME_TRADE.otNameWidth}. ` +
                `Every field after a name has moved — re-derive the offsets before injecting.`);
        }
        ctx.charmap = loadCharmap({ root: ctx.root });
    }
    return ctx.charmap;
}

/**
 * The stride of a fixed-capacity table — DERIVED from its own symbol, never the sum of its fields.
 *
 * GATE-3 (2026-08-02) caught the difference: `struct TradeNickname` is 1 + 13 bytes of data, but the
 * base's `gTradeNicknames[8]` is 128 B, i.e. 16 per row — ARM rounds a struct's size up to a multiple
 * of 4, so the row carries two padding bytes. `struct LocationNickname` (3 + 13) needs none, which is
 * exactly why adding up the fields looked right for one table and not the other.
 *
 * The declared size is kept as a floor: the fields must still fit inside the row.
 */
function tableStride(ctx, symbol, capacity, declared, what) {
    const sym = ctx.offsetMap.require(symbol);
    if (!sym.sizeExact || sym.size % capacity !== 0) return declared;   // a map only BOUNDS a symbol (T-238)
    const stride = sym.size / capacity;
    if (stride < declared) {
        throw new Error(
            `injector/${TAG}: ${symbol} is ${sym.size} B for ${capacity} entries — ${stride} B per ` +
            `${what}, less than the ${declared} B its fields need. The struct or the capacity changed; ` +
            `re-derive the offsets in structLayout before injecting.`);
    }
    return stride;
}

// ── Starters ──────────────────────────────────────────────────────────────────

function injectStarters(ctx) {
    const { rom, constants, data, log } = ctx;
    const starters = (data.starters && data.starters.starters) || null;
    const extraStarters = (data.wild && data.wild.extraStarters) || [];
    const naming = (data.artifacts && data.artifacts.starterNaming) || null;
    const charmap = charmapFor(ctx);
    if (!starters) return { writes: 0 };

    const speciesId = (name, what) => {
        const id = constants.get(name);
        if (id === undefined) throw new Error(`injector/${TAG}: ${what} '${name}' is not a species the base defines`);
        return id;
    };
    const genderId = (gender) => constants.require(genderConst(gender));

    // The trio. writer.js replaces the committed three-line block, so all three always move together.
    const trioAt = ctx.offsetMap.offsetOf('gStarterMon');
    starters.slice(0, 3).forEach((species, i) => {
        rom.writeU16(trioAt + i * 2, speciesId(species, 'starter'), `${TAG}:starters`);
    });

    if (extraStarters.length > STARTER_EXTRA_CAPACITY) {
        throw new Error(
            `injector/${TAG}: ${extraStarters.length} extra starters exceed STARTER_EXTRA_CAPACITY ` +
            `(${STARTER_EXTRA_CAPACITY}). Raise it in include/constants/randomizer_layout.h — the same ` +
            `guard starterNameWriter applies.`);
    }

    // Every extra-starter array is rewritten WHOLE: the writer emits exactly `count` initializers and C
    // zero-fills the rest, so a run with fewer extras than the base must clear the tail (B-049).
    const monBuffer = Buffer.alloc(STARTER_EXTRA_CAPACITY * 2, 0);
    const genderBuffer = Buffer.alloc(STARTER_EXTRA_CAPACITY, 0);
    const nicknameWidth = INGAME_TRADE.nicknameWidth;   // POKEMON_NAME_LENGTH + 1, checked in charmapFor
    const nicknameBuffer = Buffer.alloc(STARTER_EXTRA_CAPACITY * nicknameWidth, 0);
    const extras = (naming && naming.extras) || [];
    extraStarters.forEach((species, i) => {
        monBuffer.writeUInt16LE(speciesId(species, 'extra starter'), i * 2);
        genderBuffer.writeUInt8(genderId(extras[i] && extras[i].gender), i);
        encodeString(charmap, sanitizeNickname(extras[i] && extras[i].nickname), nicknameWidth)
            .copy(nicknameBuffer, i * nicknameWidth);
    });

    rom.writeBytes(ctx.offsetMap.offsetOf('gStarterExtraMon'), monBuffer, `${TAG}:extraStarters`);
    rom.writeU8(ctx.offsetMap.offsetOf('gStarterExtraCount'), extraStarters.length, `${TAG}:extraStarterCount`);
    rom.writeBytes(ctx.offsetMap.offsetOf('gStarterExtraGenders'), genderBuffer, `${TAG}:extraStarterGenders`);
    rom.writeBytes(ctx.offsetMap.offsetOf('gStarterExtraNicknames'), nicknameBuffer, `${TAG}:extraStarterNicknames`);

    const starter = (naming && naming.starter) || null;
    rom.writeBytes(ctx.offsetMap.offsetOf('gStarterNickname'),
        encodeString(charmap, sanitizeNickname(starter && starter.nickname), nicknameWidth), `${TAG}:starterNickname`);
    rom.writeU8(ctx.offsetMap.offsetOf('gStarterGender'), genderId(starter && starter.gender), `${TAG}:starterGender`);

    log(`starters: trio + ${extraStarters.length} extra (capacity ${STARTER_EXTRA_CAPACITY})`);
    return { writes: 3 + extraStarters.length };
}

// ── The two nickname tables ───────────────────────────────────────────────────

function injectLocationNicknames(ctx) {
    const { rom, constants, data, log } = ctx;
    const naming = (data.artifacts && data.artifacts.locationNaming) || null;
    if (!naming) return { rows: 0 };                  // writeLocationNames() returns early

    const keys = locationKeys(naming);                // the writer's own filter + sort
    if (keys.length > LOCATION_NICKNAME_CAPACITY) {
        throw new Error(
            `injector/${TAG}: ${keys.length} named locations exceed LOCATION_NICKNAME_CAPACITY ` +
            `(${LOCATION_NICKNAME_CAPACITY}). Raise it in include/constants/randomizer_layout.h.`);
    }
    const stride = tableStride(ctx, 'gLocationNicknames', LOCATION_NICKNAME_CAPACITY, LOCATION_NICKNAME.stride, 'row');
    const table = Buffer.alloc(LOCATION_NICKNAME_CAPACITY * stride, 0);

    keys.forEach((key, i) => {
        const slot = naming[key] || {};
        const map = constants.get(key);
        if (map === undefined) throw new Error(`injector/${TAG}: '${key}' is not a map the base defines`);
        const at = i * stride;
        // MAP_GROUP(map) / MAP_NUM(map) — the macros the writer emits, on the resolved constant.
        table.writeUInt8((map >> 8) & 0xff, at + LOCATION_NICKNAME.mapGroup);
        table.writeUInt8(map & 0xff, at + LOCATION_NICKNAME.mapNum);
        table.writeUInt8(constants.require(genderConst(slot.gender)), at + LOCATION_NICKNAME.gender);
        encodeString(charmapFor(ctx), sanitizeNickname(slot.nickname), LOCATION_NICKNAME.nicknameWidth)
            .copy(table, at + LOCATION_NICKNAME.nickname);
    });

    rom.writeBytes(ctx.offsetMap.offsetOf('gLocationNicknames'), table, `${TAG}:locationNicknames`);
    rom.writeU8(ctx.offsetMap.offsetOf('gLocationNicknameCount'), keys.length, `${TAG}:locationNicknameCount`);
    log(`location nicknames: ${keys.length} row(s)`);
    return { rows: keys.length };
}

function injectTradeNicknames(ctx) {
    const { rom, constants, data, log } = ctx;
    const naming = (data.artifacts && data.artifacts.tradeNaming) || null;
    if (!naming) return { rows: 0 };                  // writeTradeNames() returns early

    const entries = namedTrades(naming);              // sorted, empty names already dropped
    if (entries.length > TRADE_NICKNAME_CAPACITY) {
        throw new Error(
            `injector/${TAG}: ${entries.length} named trades exceed TRADE_NICKNAME_CAPACITY ` +
            `(${TRADE_NICKNAME_CAPACITY}). Raise it in include/constants/randomizer_layout.h.`);
    }
    const stride = tableStride(ctx, 'gTradeNicknames', TRADE_NICKNAME_CAPACITY, TRADE_NICKNAME.stride, 'row');
    const table = Buffer.alloc(TRADE_NICKNAME_CAPACITY * stride, 0);

    entries.forEach((entry, i) => {
        const id = constants.get(entry.k);
        if (id === undefined) throw new Error(`injector/${TAG}: '${entry.k}' is not a trade the base defines`);
        const at = i * stride;
        table.writeUInt8(id, at + TRADE_NICKNAME.tradeId);
        encodeString(charmapFor(ctx), entry.name, TRADE_NICKNAME.nicknameWidth).copy(table, at + TRADE_NICKNAME.nickname);
    });

    rom.writeBytes(ctx.offsetMap.offsetOf('gTradeNicknames'), table, `${TAG}:tradeNicknames`);
    rom.writeU8(ctx.offsetMap.offsetOf('gTradeNicknameCount'), entries.length, `${TAG}:tradeNicknameCount`);
    log(`trade nicknames: ${entries.length} row(s)`);
    return { rows: entries.length };
}

// ── In-game trades ────────────────────────────────────────────────────────────

const TRADE_BLOCK_RE = /const struct InGameTrade gIngameTrades\[[^\]]*\] =\s*\n\{([\s\S]*?)\n\};/;
// The last entry of a hand-written block has no trailing comma after its `}`.
const TRADE_ENTRY_RE = /\[([A-Za-z_]\w*)\]\s*=\s*\{([\s\S]*?)\n\s*\},?\n/g;
const TRADE_FIELD_RE = /\.(\w+)\s*=\s*([^\n]*?),?\s*$/;

/**
 * Parse a `gIngameTrades[]` block (the committed one, or the one `tradeWriter` emits) into
 * `Map(INGAME_TRADE_x → { field: rawValue })`. Deliberately dumb: it reads the designated initializers
 * this one array uses and nothing else, so an unfamiliar shape fails rather than being half-read.
 */
function parseTradeBlock(text) {
    const block = text.match(TRADE_BLOCK_RE);
    if (!block) throw new Error(`injector/${TAG}: no gIngameTrades[] block found`);
    const trades = new Map();
    TRADE_ENTRY_RE.lastIndex = 0;
    let entry;
    while ((entry = TRADE_ENTRY_RE.exec(`${block[1]}\n`)) !== null) {
        const fields = {};
        for (const line of entry[2].split('\n')) {
            const field = line.trim().match(TRADE_FIELD_RE);
            if (field) fields[field[1]] = field[2].trim();
        }
        trades.set(entry[1], fields);
    }
    if (trades.size === 0) throw new Error(`injector/${TAG}: the gIngameTrades[] block held no entries`);
    return trades;
}

/** One `struct InGameTrade` (128 B) from the parsed initializer; an absent field is zero, as in C. */
function encodeTrade(ctx, fields, id) {
    const { constants } = ctx;
    const charmap = charmapFor(ctx);
    const buffer = Buffer.alloc(INGAME_TRADE.stride, 0);

    const number = (raw) => {
        const text = String(raw).trim();
        if (/^-?\d+$/.test(text)) return Number(text);
        if (/^0[xX][0-9a-fA-F]+$/.test(text)) return parseInt(text, 16);
        const value = constants.get(text);
        if (value === undefined) throw new Error(`injector/${TAG}: ${id}: '${text}' is neither a number nor a constant the base defines`);
        return value;
    };
    const list = (raw) => String(raw).replace(/^\{|\}$/g, '').split(',').map(t => t.trim()).filter(Boolean);
    const text = (raw) => {
        const match = String(raw).match(/^_\("(.*)"\)$/);
        if (!match) throw new Error(`injector/${TAG}: ${id}: '${raw}' is not a _("…") string`);
        return match[1];
    };

    const put = {
        nickname: (raw) => encodeString(charmap, text(raw), INGAME_TRADE.nicknameWidth).copy(buffer, INGAME_TRADE.nickname),
        otName: (raw) => encodeString(charmap, text(raw), INGAME_TRADE.otNameWidth).copy(buffer, INGAME_TRADE.otName),
        species: (raw) => buffer.writeUInt16LE(number(raw), INGAME_TRADE.species),
        heldItem: (raw) => buffer.writeUInt16LE(number(raw), INGAME_TRADE.heldItem),
        requestedSpecies: (raw) => buffer.writeUInt16LE(number(raw), INGAME_TRADE.requestedSpecies),
        otId: (raw) => buffer.writeUInt32LE(number(raw) >>> 0, INGAME_TRADE.otId),
        personality: (raw) => buffer.writeUInt32LE(number(raw) >>> 0, INGAME_TRADE.personality),
        abilityNum: (raw) => buffer.writeUInt8(number(raw) & 0xff, INGAME_TRADE.abilityNum),
        mailNum: (raw) => buffer.writeUInt8(number(raw) & 0xff, INGAME_TRADE.mailNum),
        otGender: (raw) => buffer.writeUInt8(number(raw) & 0xff, INGAME_TRADE.otGender),
        sheen: (raw) => buffer.writeUInt8(number(raw) & 0xff, INGAME_TRADE.sheen),
        level: (raw) => buffer.writeUInt8(number(raw) & 0xff, INGAME_TRADE.level),
        requestedSpeciesCount: (raw) => buffer.writeUInt8(number(raw) & 0xff, INGAME_TRADE.requestedSpeciesCount),
        requestedBaseFormCount: (raw) => buffer.writeUInt8(number(raw) & 0xff, INGAME_TRADE.requestedBaseFormCount),
        ivs: (raw) => list(raw).forEach((v, i) => buffer.writeUInt8(number(v) & 0xff, INGAME_TRADE.ivs + i)),
        conditions: (raw) => list(raw).forEach((v, i) => buffer.writeUInt8(number(v) & 0xff, INGAME_TRADE.conditions + i)),
        requestedSpeciesList: (raw) => writeSpeciesList(raw, INGAME_TRADE.requestedSpeciesList),
        requestedBaseForms: (raw) => writeSpeciesList(raw, INGAME_TRADE.requestedBaseForms),
    };

    function writeSpeciesList(raw, at) {
        const species = list(raw);
        if (species.length > TRADE_SPECIES_LIST_CAPACITY) {
            throw new Error(
                `injector/${TAG}: ${id} lists ${species.length} species; TRADE_SPECIES_LIST_CAPACITY is ` +
                `${TRADE_SPECIES_LIST_CAPACITY}. Raise it in include/constants/randomizer_layout.h.`);
        }
        species.forEach((name, i) => buffer.writeUInt16LE(number(name), at + i * 2));
    }

    for (const [field, raw] of Object.entries(fields)) {
        if (!put[field]) {
            throw new Error(
                `injector/${TAG}: ${id} sets '.${field}', which this module does not encode. struct ` +
                `InGameTrade grew a field — add it to structLayout and here, or the injected trade will ` +
                `differ from the compiled one.`);
        }
        put[field](raw);
    }
    return buffer;
}

/** The whole `gIngameTrades[]` table from a block of C: every index, zero where the block has none. */
function encodeTradeTable(ctx, blockText) {
    const count = ctx.constants.require('INGAME_TRADES_COUNT');
    const table = Buffer.alloc(count * INGAME_TRADE.stride, 0);
    for (const [id, fields] of parseTradeBlock(blockText)) {
        const index = ctx.constants.get(id);
        if (index === undefined) throw new Error(`injector/${TAG}: '${id}' is not a trade the base defines`);
        if (index >= count) throw new Error(`injector/${TAG}: '${id}' (${index}) is outside gIngameTrades[${count}]`);
        encodeTrade(ctx, fields, id).copy(table, index * INGAME_TRADE.stride);
    }
    return table;
}

/**
 * Prove the struct against the base before writing: the committed `gIngameTrades[]` block, re-encoded,
 * must be exactly what the base ROM holds. This is what pins the 128 B stride, every field offset and
 * the charmap encoder — the base's own entries carry text and hand-written IVs, otIds and personalities.
 */
function verifyTradeTable(ctx, sourceText) {
    const expected = encodeTradeTable(ctx, sourceText);
    const at = ctx.offsetMap.offsetOf('gIngameTrades');
    const actual = ctx.rom.readBytes(at, expected.length);
    if (!actual.equals(expected)) {
        let first = 0;
        while (first < expected.length && expected[first] === actual[first]) first += 1;
        throw new Error(
            `injector/${TAG}: gIngameTrades does not match src/data/trade.h — first difference at ` +
            `+0x${first.toString(16)} (entry ${Math.floor(first / INGAME_TRADE.stride)}, field byte ` +
            `${first % INGAME_TRADE.stride}). The base ROM and this source are not the same build, or ` +
            `struct InGameTrade's layout is not what structLayout says.`);
    }
}

function injectIngameTrades(ctx, { tradeSource = null } = {}) {
    const { rom, data, log } = ctx;
    const source = tradeSource ?? fs.readFileSync(TRADE_H(), 'utf8');
    verifyTradeTable(ctx, source);                    // always, even when this run writes no trades

    const trades = (data.artifacts && data.artifacts.trades) || null;
    if (!Array.isArray(trades) || trades.length === 0) return { trades: 0 };   // writeTrades() no-ops

    // The writer's own emitter produces the C; parsing it back is what keeps the field values
    // (otId 51436, IVs 15, `_("TRADER")`) in one home instead of two.
    const table = encodeTradeTable(ctx, tradeWriter.renderTradeData(trades));
    rom.writeBytes(ctx.offsetMap.offsetOf('gIngameTrades'), table, `${TAG}:ingameTrades`);
    log(`in-game trades: ${trades.length} of ${ctx.constants.require('INGAME_TRADES_COUNT')} entries`);
    return { trades: trades.length };
}

// ── The registry entry ────────────────────────────────────────────────────────

const SYMBOLS = [
    'gStarterMon', 'gStarterExtraMon', 'gStarterExtraCount', 'gStarterExtraNicknames', 'gStarterExtraGenders',
    'gStarterNickname', 'gStarterGender',
    'gLocationNicknames', 'gLocationNicknameCount', 'gTradeNicknames', 'gTradeNicknameCount',
    'gIngameTrades',
];

/**
 * @param {object} args  `{ rom, offsetMap, data, log }` as the registry calls it (injector/index.js)
 * @param {object} [args.sources]  `{ tradeSource }` instead of reading the tree
 */
function applyTradesStartersNicknames({ rom, offsetMap, data = {}, log = () => {}, sources = {} }) {
    const missing = SYMBOLS.filter(symbol => !offsetMap.has(symbol));
    if (missing.length) {
        // Nothing claimed → a harness base without these tables; anything claimed → the T-234/T-237 trap.
        const claims = (data.starters && data.starters.starters)
            || (data.artifacts && (data.artifacts.locationNaming || data.artifacts.tradeNaming || data.artifacts.trades));
        if (!claims) return { starters: { writes: 0 }, locationNicknames: { rows: 0 }, tradeNicknames: { rows: 0 }, ingameTrades: { trades: 0 } };
        throw new Error(
            `injector/${TAG}: this run writes starters/nicknames/trades but the base exports no ` +
            `${missing.join(', ')}. The base does not carry the table(s) (cf. T-234/T-237) or the offset ` +
            `map is from another build.`);
    }

    const ctx = buildInjectionContext({ rom, offsetMap, data, log });
    return {
        starters: injectStarters(ctx),
        locationNicknames: injectLocationNicknames(ctx),
        tradeNicknames: injectTradeNicknames(ctx),
        ingameTrades: injectIngameTrades(ctx, { tradeSource: sources.tradeSource || null }),
    };
}

module.exports = {
    applyTradesStartersNicknames,
    injectStarters,
    injectLocationNicknames,
    injectTradeNicknames,
    injectIngameTrades,
    parseTradeBlock,
    encodeTrade,
    encodeTradeTable,
    verifyTradeTable,
    SYMBOLS,
    TAG,
};
