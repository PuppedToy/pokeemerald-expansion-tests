// T-239 — where a field sits inside gSpeciesInfo / gMovesInfo / gItemsInfo. A linker map bounds a
// symbol but says nothing about the struct inside it, and the base is built without debug info, so the
// offsets are declared here from the base's own headers and then VERIFIED against the base's own data:
// Bulbasaur must read back 45/49/49/45/65/65 GRASS/POISON, Pound 40/100/NORMAL/PHYSICAL. A layout the
// anchors don't confirm is refused — writing a stat onto the wrong byte is silent ROM corruption.
const path = require('path');
const { Rom } = require('../../injector/rom');
const { OffsetMap } = require('../../injector/symbolMap');
const { loadGameConstants } = require('../../injector/gameConstants');
const {
    SPECIES_INFO,
    MOVE_INFO,
    ITEM_INFO,
    EVOLUTION,
    EVOLUTION_PARAM,
    WILD_POKEMON,
    arrayStride,
    verifyLayout,
    resolveEvolutionsOffset,
} = require('../../injector/structLayout');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const constants = loadGameConstants({ root: ROOT });

const SPECIES_STRIDE = 0xc4;
const MOVE_STRIDE = 60;
const ITEM_STRIDE = 40;

// Offsets are typed out literally here, straight off include/pokemon.h — NOT taken from the module
// under test, so a silent change to its table fails this suite.
const SPECIES_BASE = 0x1000;
const MOVE_BASE = 0x60000;
const ITEM_BASE = 0x90000;
const EVO_BASE = 0xf0000;

const SPECIES_ANCHORS = {
    SPECIES_BULBASAUR: {
        stats: [45, 49, 49, 45, 65, 65],
        types: ['TYPE_GRASS', 'TYPE_POISON'],
        abilities: ['ABILITY_OVERGROW', 'ABILITY_NONE', 'ABILITY_CHLOROPHYLL'],
    },
    SPECIES_MIRAIDON: {
        stats: [100, 85, 100, 135, 135, 115],
        types: ['TYPE_ELECTRIC', 'TYPE_DRAGON'],
        abilities: ['ABILITY_HADRON_ENGINE', 'ABILITY_NONE', 'ABILITY_NONE'],
    },
};

const MOVE_ANCHORS = {
    MOVE_POUND:  { power: 40, accuracy: 100, type: 'TYPE_NORMAL',  category: 'DAMAGE_CATEGORY_PHYSICAL' },
    MOVE_EMBER:  { power: 40, accuracy: 100, type: 'TYPE_FIRE',    category: 'DAMAGE_CATEGORY_SPECIAL' },
    MOVE_GROWL:  { power: 0,  accuracy: 100, type: 'TYPE_NORMAL',  category: 'DAMAGE_CATEGORY_STATUS' },
    MOVE_PSYCHIC:{ power: 90, accuracy: 100, type: 'TYPE_PSYCHIC', category: 'DAMAGE_CATEGORY_SPECIAL' },
};

const ITEM_ANCHORS = { ITEM_POKE_BALL: 200, ITEM_MASTER_BALL: 1000 };

/** A base image holding exactly the anchor data the layout claims, laid out by hand. */
function buildBase() {
    const buffer = Buffer.alloc(0x100000, 0);

    for (const [name, a] of Object.entries(SPECIES_ANCHORS)) {
        const at = SPECIES_BASE + constants.require(name) * SPECIES_STRIDE;
        a.stats.forEach((v, i) => buffer.writeUInt8(v, at + i));           // HP Atk Def Spe SpA SpD
        a.types.forEach((t, i) => buffer.writeUInt8(constants.require(t), at + 6 + i));
        a.abilities.forEach((ab, i) => buffer.writeUInt16LE(constants.require(ab), at + 0x18 + i * 2));
        buffer.writeUInt16LE(constants.require('ITEM_ORAN_BERRY'), at + 0x0e);   // itemCommon
        buffer.writeUInt16LE(constants.require('ITEM_LUM_BERRY'), at + 0x10);    // itemRare
    }

    for (const [name, m] of Object.entries(MOVE_ANCHORS)) {
        const at = MOVE_BASE + constants.require(name) * MOVE_STRIDE;
        const packed = (constants.require(m.type) & 0x1f)
            | ((constants.require(m.category) & 0x3) << 5)
            | ((m.power & 0x1ff) << 7)
            | ((m.accuracy & 0x7f) << 16);
        buffer.writeUInt32LE(packed >>> 0, at + 0x0c);
    }

    for (const [name, price] of Object.entries(ITEM_ANCHORS)) {
        buffer.writeUInt32LE(price, ITEM_BASE + constants.require(name) * ITEM_STRIDE);
    }

    // Bulbasaur's evolution array, reached through the `evolutions` pointer inside its struct.
    buffer.writeUInt32LE(0x08000000 + EVO_BASE, SPECIES_BASE + constants.require('SPECIES_BULBASAUR') * SPECIES_STRIDE + 0x90);
    buffer.writeUInt16LE(constants.require('EVO_LEVEL'), EVO_BASE + 0);
    buffer.writeUInt16LE(16, EVO_BASE + 2);
    buffer.writeUInt16LE(constants.require('SPECIES_IVYSAUR'), EVO_BASE + 4);
    buffer.writeUInt32LE(0, EVO_BASE + 8);                                   // params = NULL
    buffer.writeUInt16LE(constants.require('EVOLUTIONS_END'), EVO_BASE + 12); // sentinel entry

    return Rom.fromBuffer(buffer);
}

function buildMap({ speciesEntries = constants.require('NUM_SPECIES') } = {}) {
    const sym = (romOffset, size) => ({ addr: 0x08000000 + romOffset, romOffset, size, sizeExact: true });
    return new OffsetMap({
        symbols: {
            gSpeciesInfo: sym(SPECIES_BASE, speciesEntries * SPECIES_STRIDE),
            gMovesInfo:   sym(MOVE_BASE, constants.require('MOVES_COUNT_ALL') * MOVE_STRIDE),
            gItemsInfo:   sym(ITEM_BASE, constants.require('ITEMS_COUNT') * ITEM_STRIDE),
        },
        romEndOffset: 0x100000,
    });
}

describe('the declared struct layout', () => {
    test('SpeciesInfo field offsets match include/pokemon.h', () => {
        expect(SPECIES_INFO.stride).toBe(0xc4);      // struct SpeciesInfo /*0xC4*/
        expect(SPECIES_INFO.baseHP).toBe(0x00);
        expect(SPECIES_INFO.baseAttack).toBe(0x01);
        expect(SPECIES_INFO.baseDefense).toBe(0x02);
        expect(SPECIES_INFO.baseSpeed).toBe(0x03);
        expect(SPECIES_INFO.baseSpAttack).toBe(0x04);
        expect(SPECIES_INFO.baseSpDefense).toBe(0x05);
        expect(SPECIES_INFO.types).toBe(0x06);
        expect(SPECIES_INFO.itemCommon).toBe(0x0e);
        expect(SPECIES_INFO.itemRare).toBe(0x10);
        expect(SPECIES_INFO.abilities).toBe(0x18);
        expect(SPECIES_INFO.abilityCount).toBe(3);
    });

    test('MoveInfo bit fields share one 32-bit word, LSB-first as GCC packs them', () => {
        // u16 type:5, category:2, power:9 | u16 accuracy:7, target:9 — one word at the same offset.
        expect(MOVE_INFO.word).toBe(0x0c);
        expect(MOVE_INFO.type).toEqual({ shift: 0, width: 5 });
        expect(MOVE_INFO.category).toEqual({ shift: 5, width: 2 });
        expect(MOVE_INFO.power).toEqual({ shift: 7, width: 9 });
        expect(MOVE_INFO.accuracy).toEqual({ shift: 16, width: 7 });
    });

    test('the small structs the modules walk', () => {
        expect(ITEM_INFO.price).toBe(0);                                        // u32 price, first field
        expect(EVOLUTION).toMatchObject({ stride: 12, method: 0, param: 2, targetSpecies: 4, params: 8 });
        expect(EVOLUTION_PARAM).toMatchObject({ stride: 8, condition: 0, arg1: 2 });
        expect(WILD_POKEMON).toMatchObject({ stride: 4, minLevel: 0, maxLevel: 1, species: 2 });
    });
});

describe('arrayStride — derived from the base, never assumed', () => {
    const offsetMap = buildMap();

    test('divides the symbol size by its entry count', () => {
        expect(arrayStride(offsetMap, 'gMovesInfo', constants.require('MOVES_COUNT_ALL'))).toBe(MOVE_STRIDE);
        expect(arrayStride(offsetMap, 'gItemsInfo', constants.require('ITEMS_COUNT'))).toBe(ITEM_STRIDE);
    });

    test('refuses a size that is not a whole number of entries', () => {
        expect(() => arrayStride(offsetMap, 'gMovesInfo', 7)).toThrow(/gMovesInfo/);
        expect(() => arrayStride(offsetMap, 'gMovesInfo', 7)).toThrow(/not a whole|does not divide/i);
    });

    test('refuses a symbol with no exact size — a linker map only bounds it (T-238)', () => {
        const inexact = new OffsetMap({
            symbols: { gMovesInfo: { addr: 0x08060000, romOffset: MOVE_BASE, size: 0x400, sizeExact: false } },
        });
        expect(() => arrayStride(inexact, 'gMovesInfo', 4)).toThrow(/exact size|\.sym/i);
    });
});

describe('verifyLayout — the anchors are what make the declared offsets safe', () => {
    test('passes on a base that holds the canonical values, and reports the derived strides', () => {
        const result = verifyLayout({ rom: buildBase(), offsetMap: buildMap(), constants });
        expect(result.speciesStride).toBe(SPECIES_STRIDE);
        expect(result.moveStride).toBe(MOVE_STRIDE);
        expect(result.itemStride).toBe(ITEM_STRIDE);
        expect(result.checked).toBeGreaterThan(0);
    });

    test('a stat at the wrong offset fails naming the species and the field', () => {
        const rom = buildBase();
        const at = SPECIES_BASE + constants.require('SPECIES_BULBASAUR') * SPECIES_STRIDE;
        rom.buffer.writeUInt8(50, at + SPECIES_INFO.baseAttack);
        expect(() => verifyLayout({ rom, offsetMap: buildMap(), constants })).toThrow(/SPECIES_BULBASAUR/);
        expect(() => verifyLayout({ rom, offsetMap: buildMap(), constants })).toThrow(/baseAttack/);
    });

    test('a late species catches a wrong stride, not just a wrong field offset', () => {
        const rom = buildBase();
        const at = SPECIES_BASE + constants.require('SPECIES_MIRAIDON') * SPECIES_STRIDE;
        rom.buffer.fill(0, at, at + 8);
        expect(() => verifyLayout({ rom, offsetMap: buildMap(), constants })).toThrow(/SPECIES_MIRAIDON/);
    });

    test('a packed move field read out of the wrong bits fails naming the move', () => {
        const rom = buildBase();
        const at = MOVE_BASE + constants.require('MOVE_PSYCHIC') * MOVE_STRIDE;
        rom.buffer.writeUInt32LE(0, at + MOVE_INFO.word);
        expect(() => verifyLayout({ rom, offsetMap: buildMap(), constants })).toThrow(/MOVE_PSYCHIC/);
    });

    test('an item price at the wrong offset fails naming the item', () => {
        const rom = buildBase();
        rom.buffer.writeUInt32LE(7, ITEM_BASE + constants.require('ITEM_MASTER_BALL') * ITEM_STRIDE);
        expect(() => verifyLayout({ rom, offsetMap: buildMap(), constants })).toThrow(/ITEM_MASTER_BALL/);
    });

    test('a gSpeciesInfo size that is not a whole number of 0xC4 entries fails', () => {
        const offsetMap = buildMap();
        offsetMap.symbols.gSpeciesInfo.size += 3;
        expect(() => verifyLayout({ rom: buildBase(), offsetMap, constants })).toThrow(/gSpeciesInfo/);
    });

    test('verifying does not write to the ROM — it is a read-only check', () => {
        const rom = buildBase();
        verifyLayout({ rom, offsetMap: buildMap(), constants });
        expect(rom.journal).toHaveLength(0);
        expect(rom.bytesWritten).toBe(0);
    });
});

describe('resolveEvolutionsOffset — the one field too deep in the struct to declare', () => {
    // Everything before `.abilities` is unconditional, but `.evolutions` sits past a run of
    // #if P_GENDER_DIFFERENCES / P_FOOTPRINTS / OW_POKEMON_OBJECT_EVENTS fields, so its offset depends
    // on the base's config. It is found by looking for the pointer whose target decodes as the base's
    // own Bulbasaur evolution ({EVO_LEVEL, 16, SPECIES_IVYSAUR}).
    test('finds the field by decoding the evolution it points at', () => {
        const offset = resolveEvolutionsOffset({ rom: buildBase(), offsetMap: buildMap(), constants });
        expect(offset).toBe(0x90);
    });

    test('throws when no candidate decodes as that evolution (the base changed)', () => {
        const rom = buildBase();
        rom.buffer.writeUInt16LE(17, EVO_BASE + 2);   // level 17, not the base's 16
        expect(() => resolveEvolutionsOffset({ rom, offsetMap: buildMap(), constants })).toThrow(/evolution/i);
    });

    test('throws when two candidate offsets are indistinguishable — never guesses', () => {
        const rom = buildBase();
        const at = SPECIES_BASE + constants.require('SPECIES_BULBASAUR') * SPECIES_STRIDE;
        rom.buffer.writeUInt32LE(0x08000000 + EVO_BASE, at + 0xa0);
        expect(() => resolveEvolutionsOffset({ rom, offsetMap: buildMap(), constants })).toThrow(/0x90.*0xa0|two|ambiguous/i);
    });
});
