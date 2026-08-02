// T-242 — the `trades-starters-nicknames` registry entry: the outputs made of TEXT.
//
// Every name here compiles through charmap.txt, so the module encodes rather than copies. The rest is
// the usual Phase-3 discipline: mirror each writer's decision (which rows exist, in which order, and
// what happens to an empty name), rewrite whole fixed-capacity tables so nothing of the base survives
// behind the new data, and prove the struct against the base before writing.
const fs = require('fs');
const path = require('path');
const { buildSyntheticBase, constants } = require('../fixtures/syntheticBase');
const { buildInjectionContext } = require('../../injector/context');
const {
    applyTradesStartersNicknames, injectStarters, injectLocationNicknames, injectTradeNicknames,
    injectIngameTrades, parseTradeBlock, encodeTradeTable, TAG,
} = require('../../injector/modules/tradesStartersNicknames');
const { LOCATION_NICKNAME, TRADE_NICKNAME, INGAME_TRADE } = require('../../injector/structLayout');
const { loadCharmap, encodeString } = require('../../injector/charmap');
const { STARTER_EXTRA_CAPACITY, LOCATION_NICKNAME_CAPACITY, TRADE_NICKNAME_CAPACITY } = require('../../layout');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const charmap = loadCharmap({ root: ROOT });

/** A `gIngameTrades[]` block in the committed style, for the base side of the fixture. */
const BASE_TRADES = [
    'const struct InGameTrade gIngameTrades[INGAME_TRADES_COUNT] =',
    '{',
    '    [INGAME_TRADE_SEEDOT] =',
    '    {',
    '        .nickname = _("DOTS"),',
    '        .species = SPECIES_SEEDOT,',
    '        .ivs = {5, 4, 5, 4, 4, 4},',
    '        .abilityNum = 1,',
    '        .otId = 38726,',
    '        .conditions = {30, 5, 5, 5, 5},',
    '        .personality = 0x84,',
    '        .heldItem = ITEM_CHESTO_BERRY,',
    '        .mailNum = -1,',
    '        .otName = _("KOBE"),',
    '        .otGender = MALE,',
    '        .sheen = 10,',
    '        .requestedSpecies = SPECIES_RALTS',
    '    },',
    '};',
].join('\n');

function setup({ data = {}, tradesBlock = BASE_TRADES } = {}) {
    const base = buildSyntheticBase({ naming: tradesBlock });
    const ctx = buildInjectionContext({ rom: base.rom, offsetMap: base.offsetMap, data });
    return { ...base, ctx, tradesBlock };
}

const bytesAt = (base, symbol, length) =>
    base.rom.readBytes(base.offsetMap.offsetOf(symbol), length ?? base.offsetMap.require(symbol).size);
const u8 = (base, symbol) => base.rom.readU8(base.offsetMap.offsetOf(symbol));

describe('starters', () => {
    const STARTER_DATA = {
        starters: { starters: ['SPECIES_KARTANA', 'SPECIES_ZIGZAGOON', 'SPECIES_LINOONE'] },
        wild: { extraStarters: ['SPECIES_BAGON', 'SPECIES_RALTS'] },
        artifacts: {
            starterNaming: {
                starter: { nickname: 'Milos', gender: 'F' },
                extras: [{ nickname: 'Rocky', gender: 'M' }, { nickname: '', gender: null }],
            },
        },
    };

    test('writes the trio', () => {
        const base = setup({ data: STARTER_DATA });
        injectStarters(base.ctx);

        const trio = bytesAt(base, 'gStarterMon');
        expect([trio.readUInt16LE(0), trio.readUInt16LE(2), trio.readUInt16LE(4)])
            .toEqual(['SPECIES_KARTANA', 'SPECIES_ZIGZAGOON', 'SPECIES_LINOONE'].map(s => constants.require(s)));
    });

    test('writes the extra starters and their count, zero-filling the unused slots (B-049)', () => {
        const base = setup({ data: STARTER_DATA });
        injectStarters(base.ctx);

        expect(u8(base, 'gStarterExtraCount')).toBe(2);
        const mons = bytesAt(base, 'gStarterExtraMon');
        expect(mons.readUInt16LE(0)).toBe(constants.require('SPECIES_BAGON'));
        expect(mons.readUInt16LE(2)).toBe(constants.require('SPECIES_RALTS'));
        expect(mons.subarray(4).every(byte => byte === 0)).toBe(true);
        expect(mons).toHaveLength(STARTER_EXTRA_CAPACITY * 2);
    });

    test('names are encoded through the charmap, not copied as ASCII', () => {
        const base = setup({ data: STARTER_DATA });
        injectStarters(base.ctx);

        expect(bytesAt(base, 'gStarterNickname')).toEqual(encodeString(charmap, 'Milos', INGAME_TRADE.nicknameWidth));
        expect(u8(base, 'gStarterGender')).toBe(constants.require('MON_FEMALE'));
        const extraNames = bytesAt(base, 'gStarterExtraNicknames');
        expect(extraNames.subarray(0, INGAME_TRADE.nicknameWidth))
            .toEqual(encodeString(charmap, 'Rocky', INGAME_TRADE.nicknameWidth));
        expect(bytesAt(base, 'gStarterExtraGenders')[0]).toBe(constants.require('MON_MALE'));
    });

    test('an unnamed run still rewrites every array — empty name, MON_GENDERLESS', () => {
        const base = setup({ data: { starters: STARTER_DATA.starters, wild: STARTER_DATA.wild, artifacts: {} } });
        injectStarters(base.ctx);

        expect(bytesAt(base, 'gStarterNickname')[0]).toBe(charmap.eos);
        expect(u8(base, 'gStarterGender')).toBe(constants.require('MON_GENDERLESS'));
        expect(bytesAt(base, 'gStarterExtraGenders')[0]).toBe(constants.require('MON_GENDERLESS'));
        expect(u8(base, 'gStarterExtraCount')).toBe(2);
    });

    test('a name the sanitizer would strip is stripped here too', () => {
        const base = setup({
            data: {
                ...STARTER_DATA,
                artifacts: { starterNaming: { starter: { nickname: 'Mi<>los!', gender: 'M' }, extras: [] } },
            },
        });
        injectStarters(base.ctx);

        expect(bytesAt(base, 'gStarterNickname')).toEqual(encodeString(charmap, 'Milos', INGAME_TRADE.nicknameWidth));
    });

    test('more extra starters than the capacity throws', () => {
        const base = setup({
            data: {
                starters: STARTER_DATA.starters,
                wild: { extraStarters: Array(STARTER_EXTRA_CAPACITY + 1).fill('SPECIES_BAGON') },
                artifacts: {},
            },
        });
        expect(() => injectStarters(base.ctx)).toThrow(new RegExp(`STARTER_EXTRA_CAPACITY[\\s\\S]*${STARTER_EXTRA_CAPACITY}`));
    });
});

describe('the location nickname table', () => {
    const naming = {
        MAP_ROUTE102: { nickname: 'Bravo', gender: 'M' },
        MAP_ROUTE101: { nickname: 'Alpha', gender: null },
        'not a map key': { nickname: 'Nope' },
    };

    test('writes one row per named map, sorted by key, with the count in lock-step', () => {
        const base = setup({ data: { artifacts: { locationNaming: naming } } });
        injectLocationNicknames(base.ctx);

        expect(u8(base, 'gLocationNicknameCount')).toBe(2);
        const table = bytesAt(base, 'gLocationNicknames');
        const route101 = constants.require('MAP_ROUTE101');
        expect(table[LOCATION_NICKNAME.mapGroup]).toBe((route101 >> 8) & 0xff);
        expect(table[LOCATION_NICKNAME.mapNum]).toBe(route101 & 0xff);
        expect(table[LOCATION_NICKNAME.gender]).toBe(constants.require('MON_GENDERLESS'));
        expect(table.subarray(LOCATION_NICKNAME.nickname, LOCATION_NICKNAME.nickname + LOCATION_NICKNAME.nicknameWidth))
            .toEqual(encodeString(charmap, 'Alpha', LOCATION_NICKNAME.nicknameWidth));
        // Row 1 is Route 102 — sorted, not insertion order.
        expect(table[LOCATION_NICKNAME.stride + LOCATION_NICKNAME.gender]).toBe(constants.require('MON_MALE'));
    });

    test('the rows past the count are zero, so a shorter run leaves nothing readable behind', () => {
        const base = setup({ data: { artifacts: { locationNaming: naming } } });
        injectLocationNicknames(base.ctx);

        const table = bytesAt(base, 'gLocationNicknames');
        expect(table.subarray(2 * LOCATION_NICKNAME.stride).every(byte => byte === 0)).toBe(true);
    });

    test('no locationNaming at all writes nothing — the writer returns early', () => {
        const base = setup({ data: { artifacts: {} } });
        const result = injectLocationNicknames(base.ctx);

        expect(result.rows).toBe(0);
        expect(base.rom.journal).toHaveLength(0);
    });

    test('more named maps than the capacity throws', () => {
        const many = {};
        for (let i = 0; i < LOCATION_NICKNAME_CAPACITY + 1; i++) many[`MAP_ROUTE1${String(i).padStart(3, '0')}`] = { nickname: 'X' };
        const base = setup({ data: { artifacts: { locationNaming: many } } });
        expect(() => injectLocationNicknames(base.ctx)).toThrow(/LOCATION_NICKNAME_CAPACITY/);
    });
});

describe('the trade nickname table', () => {
    test('drops the trades whose name sanitizes to empty — unlike the location table', () => {
        const base = setup({
            data: {
                artifacts: {
                    tradeNaming: {
                        INGAME_TRADE_SEEDOT: { nickname: 'Dotty' },
                        INGAME_TRADE_PLUSLE: { nickname: '   ' },
                    },
                },
            },
        });
        injectTradeNicknames(base.ctx);

        expect(u8(base, 'gTradeNicknameCount')).toBe(1);
        const table = bytesAt(base, 'gTradeNicknames');
        expect(table[TRADE_NICKNAME.tradeId]).toBe(constants.require('INGAME_TRADE_SEEDOT'));
        expect(table.subarray(TRADE_NICKNAME.nickname, TRADE_NICKNAME.nickname + TRADE_NICKNAME.nicknameWidth))
            .toEqual(encodeString(charmap, 'Dotty', TRADE_NICKNAME.nicknameWidth));
        expect(table.subarray(TRADE_NICKNAME.stride).every(byte => byte === 0)).toBe(true);
    });

    test('the row stride comes from the BASE, not from adding up the struct fields', () => {
        // GATE-3 found this: the fields are 1 + 13 = 14 bytes, but ARM rounds the struct up to 16, so
        // the base's 8-row table is 128 B. Writing rows 14 apart would have put every row but the first
        // in the wrong place — silently, since the table is zero in the base.
        const base = setup({ data: { artifacts: { tradeNaming: {
            INGAME_TRADE_SEEDOT: { nickname: 'Aa' },
            INGAME_TRADE_PLUSLE: { nickname: 'Bb' },   // sorts FIRST by key
        } } } });
        const stride = base.offsetMap.require('gTradeNicknames').size / TRADE_NICKNAME_CAPACITY;
        injectTradeNicknames(base.ctx);

        // Rows are sorted by KEY, so PLUSLE comes before SEEDOT — the writer's order, not the id's.
        const table = bytesAt(base, 'gTradeNicknames');
        expect(table[0]).toBe(constants.require('INGAME_TRADE_PLUSLE'));
        expect(table[stride]).toBe(constants.require('INGAME_TRADE_SEEDOT'));
        expect(table.subarray(stride + TRADE_NICKNAME.nickname, stride + TRADE_NICKNAME.nickname + 3))
            .toEqual(encodeString(charmap, 'Aa', 3));
    });

    test('no tradeNaming writes nothing', () => {
        const base = setup({ data: { artifacts: {} } });
        expect(injectTradeNicknames(base.ctx).rows).toBe(0);
        expect(base.rom.journal).toHaveLength(0);
    });
});

describe('in-game trades', () => {
    const TRADES = [{
        ingameTradeId: 'INGAME_TRADE_SEEDOT',
        offeredSpecies: 'SPECIES_KARTANA',
        level: 33,
        acceptedSpecies: ['SPECIES_RALTS', 'SPECIES_KIRLIA'],
        acceptedBaseForms: ['SPECIES_RALTS'],
    }];

    test('writes the whole table from the writer’s own emitter', () => {
        const base = setup({ data: { artifacts: { trades: TRADES } } });
        injectIngameTrades(base.ctx, { tradeSource: base.tradesBlock });

        const at = base.offsetMap.offsetOf('gIngameTrades')
            + constants.require('INGAME_TRADE_SEEDOT') * INGAME_TRADE.stride;
        expect(base.rom.readU16(at + INGAME_TRADE.species)).toBe(constants.require('SPECIES_KARTANA'));
        expect(base.rom.readU8(at + INGAME_TRADE.level)).toBe(33);
        expect(base.rom.readU16(at + INGAME_TRADE.requestedSpeciesList)).toBe(constants.require('SPECIES_RALTS'));
        expect(base.rom.readU16(at + INGAME_TRADE.requestedSpeciesList + 2)).toBe(constants.require('SPECIES_KIRLIA'));
        expect(base.rom.readU8(at + INGAME_TRADE.requestedSpeciesCount)).toBe(2);
        expect(base.rom.readU8(at + INGAME_TRADE.requestedBaseFormCount)).toBe(1);
        // The writer's fixed fields come from the writer, not from a second copy of them here.
        expect(base.rom.readU32(at + INGAME_TRADE.otId)).toBe(51436);
        expect(base.rom.readBytes(at + INGAME_TRADE.otName, INGAME_TRADE.otNameWidth))
            .toEqual(encodeString(charmap, 'TRADER', INGAME_TRADE.otNameWidth));
    });

    test('an index the artifact does not name becomes a ZERO entry, not the base’s trade', () => {
        const base = setup({ data: { artifacts: { trades: TRADES } } });
        injectIngameTrades(base.ctx, { tradeSource: base.tradesBlock });

        const table = bytesAt(base, 'gIngameTrades');
        const other = table.subarray(INGAME_TRADE.stride, 2 * INGAME_TRADE.stride);
        expect(other.every(byte => byte === 0)).toBe(true);
    });

    test('an empty trades artifact leaves the base table alone', () => {
        const base = setup({ data: { artifacts: { trades: [] } } });
        const before = bytesAt(base, 'gIngameTrades');
        expect(injectIngameTrades(base.ctx, { tradeSource: base.tradesBlock }).trades).toBe(0);
        expect(bytesAt(base, 'gIngameTrades')).toEqual(before);
    });

    test('the base table is verified against src/data/trade.h first, and a mismatch writes nothing', () => {
        const base = setup({ data: { artifacts: { trades: TRADES } } });
        const wrong = base.tradesBlock.replace('_("DOTS")', '_("SPOTS")');

        expect(() => injectIngameTrades(base.ctx, { tradeSource: wrong }))
            .toThrow(/gIngameTrades does not match/);
        expect(base.rom.journal).toHaveLength(0);
    });

    test('a struct field this module cannot encode is refused rather than skipped', () => {
        const base = setup({ data: {} });
        const grown = base.tradesBlock.replace('        .sheen = 10,', '        .sheen = 10,\n        .newField = 3,');

        expect(() => injectIngameTrades(base.ctx, { tradeSource: grown })).toThrow(/newField/);
    });
});

describe('parsing the committed trade.h', () => {
    test('reads the real block — four trades with their fields', () => {
        const source = fs.readFileSync(path.resolve(ROOT, 'src', 'data', 'trade.h'), 'utf8');
        const trades = parseTradeBlock(source);

        expect(trades.size).toBe(constants.require('INGAME_TRADES_COUNT'));
        expect(trades.get('INGAME_TRADE_SEEDOT')).toMatchObject({
            nickname: '_("DOTS")', species: 'SPECIES_SEEDOT', otName: '_("KOBE")', sheen: '10',
        });
    });

    test('every committed trade encodes to a full 128 B entry', () => {
        const source = fs.readFileSync(path.resolve(ROOT, 'src', 'data', 'trade.h'), 'utf8');
        const table = encodeTradeTable({ constants, root: ROOT, charmap: null }, source);

        expect(table).toHaveLength(constants.require('INGAME_TRADES_COUNT') * INGAME_TRADE.stride);
        // The first entry's nickname is text, which is the encoder's real test.
        expect(table.subarray(0, INGAME_TRADE.nicknameWidth))
            .toEqual(encodeString(charmap, 'DOTS', INGAME_TRADE.nicknameWidth));
    });
});

describe('the module as the registry calls it', () => {
    test('runs all four sub-writers in one pass', () => {
        const base = buildSyntheticBase({ naming: BASE_TRADES });
        const result = applyTradesStartersNicknames({
            rom: base.rom,
            offsetMap: base.offsetMap,
            data: {
                starters: { starters: ['SPECIES_KARTANA', 'SPECIES_ZIGZAGOON', 'SPECIES_LINOONE'] },
                wild: { extraStarters: ['SPECIES_BAGON'] },
                artifacts: {
                    starterNaming: { starter: { nickname: 'Milos', gender: 'F' }, extras: [] },
                    locationNaming: { MAP_ROUTE101: { nickname: 'Alpha', gender: 'M' } },
                    tradeNaming: { INGAME_TRADE_SEEDOT: { nickname: 'Dotty' } },
                    trades: [{
                        ingameTradeId: 'INGAME_TRADE_SEEDOT', offeredSpecies: 'SPECIES_KARTANA', level: 20,
                        acceptedSpecies: ['SPECIES_RALTS'], acceptedBaseForms: ['SPECIES_RALTS'],
                    }],
                },
            },
            sources: { tradeSource: BASE_TRADES },
        });

        expect(result.starters.writes).toBe(4);
        expect(result.locationNicknames.rows).toBe(1);
        expect(result.tradeNicknames.rows).toBe(1);
        expect(result.ingameTrades.trades).toBe(1);
        expect(base.rom.journal.every(entry => entry.tag.startsWith(TAG))).toBe(true);
    });

    test('a base without these tables and a bundle with nothing to write is a no-op', () => {
        const base = buildSyntheticBase({});
        const result = applyTradesStartersNicknames({ rom: base.rom, offsetMap: base.offsetMap, data: {} });

        expect(result.starters.writes).toBe(0);
        expect(base.rom.journal).toHaveLength(0);
    });

    test('but a bundle WITH starters and no tables is refused, naming the missing symbol', () => {
        const base = buildSyntheticBase({});
        expect(() => applyTradesStartersNicknames({
            rom: base.rom,
            offsetMap: base.offsetMap,
            data: { starters: { starters: ['SPECIES_KARTANA'] } },
        })).toThrow(/gStarterMon/);
    });
});
