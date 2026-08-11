'use strict';

/**
 * structLayout — where a field sits inside the base's data structures (T-239).
 *
 * The `.map`/`.sym` locate an *array*; nothing in them describes the struct inside it, and the base is
 * built without debug info (`DINFO=1` also changes -O, so it is not the golden base). So the offsets the
 * Group-A modules write are declared here, straight from `include/pokemon.h` / `include/move.h` /
 * `include/item.h`, and then **verified against the base's own data** before a single byte is written:
 *
 *   Bulbasaur must read back 45/49/49/45/65/65, GRASS/POISON, OVERGROW/-/CHLOROPHYLL;
 *   Miraidon (species ~1500) must read back too — that is what proves the stride, not just the offsets;
 *   Pound must be 40 power / 100 accuracy / NORMAL / PHYSICAL, Growl 0 power / STATUS;
 *   a Poké Ball must cost 200 and a Master Ball 1000.
 *
 * Those are 25-year-old constants, so an anchor failure means the *layout* moved (upstream sync, a
 * flipped config flag) — or, rarely, that the base's data genuinely changed. Either way it is a human
 * decision, not something to paper over: `verifyLayout` throws and no module writes anything.
 *
 * Strides are never assumed: they are derived from the symbol's exact size divided by its entry count
 * (`arrayStride`), which needs the `.sym` — a linker map only *bounds* a symbol (T-238).
 */

const { toGbaPointer, toRomOffset } = require('./symbolMap');

// ── include/pokemon.h: struct SpeciesInfo ─────────────────────────────────────
// Everything up to `.safariZoneFleeRate` is unconditional, which is why these offsets can be declared
// at all; the pointers at the end of the struct sit behind #if config blocks (see resolveEvolutionsOffset).
//
// There is deliberately NO stride here. The header still says `struct SpeciesInfo /*0xC4*/`, but that
// comment is upstream's and stale: on this base the struct compiles to 260 B (0x104) — the
// config-dependent tail (P_GENDER_DIFFERENCES / P_FOOTPRINTS / OW_POKEMON_OBJECT_EVENTS) adds 64 B.
// Validating against the real base caught it (T-239); trusting the comment would have written each
// species' stats 64 B into the previous one. `speciesLayout()` derives the stride from the symbol size.
const SPECIES_INFO = {
    baseHP: 0x00,
    baseAttack: 0x01,
    baseDefense: 0x02,
    baseSpeed: 0x03,        // NB: Speed comes before the special stats, as in the source
    baseSpAttack: 0x04,
    baseSpDefense: 0x05,
    types: 0x06,            // u8 types[2]
    typeCount: 2,
    catchRate: 0x08,
    expYield: 0x0a,         // u16
    itemCommon: 0x0e,       // u16 — wild held items, zeroed for every species by T-077
    itemRare: 0x10,         // u16
    abilities: 0x18,        // u16 abilities[NUM_ABILITY_SLOTS]
    abilityCount: 3,
    safariZoneFleeRate: 0x1e,
    // The six base stats in struct order, so a module can loop them by bundle field name.
    STAT_FIELDS: [
        ['baseHP', 0x00], ['baseAttack', 0x01], ['baseDefense', 0x02],
        ['baseSpeed', 0x03], ['baseSpAttack', 0x04], ['baseSpDefense', 0x05],
    ],
};

// ── include/move.h: struct MoveInfo ───────────────────────────────────────────
// `u16 type:5; enum DamageCategory category:2; u16 power:9;` fill one u16 and `u16 accuracy:7;
// u16 target:9;` the next — together one 32-bit window, packed LSB-first as GCC does for ARM.
//
// WHERE that window starts is NOT declared: it depends on what precedes it (`const u8 *name`,
// `const u8 *description`, `enum BattleMoveEffects effect`), and `effect` is
// `__attribute__((packed))`, i.e. one byte — so on this base the window is at 0x0A, not the 0x0C a
// reading of the header suggests. `moveLayout()` finds it by decoding the anchor moves instead
// (T-239: declaring 0x0C read Pound's power as 0, caught by the anchors before any write).
const MOVE_INFO = {
    type:     { shift: 0,  width: 5 },
    category: { shift: 5,  width: 2 },
    power:    { shift: 7,  width: 9 },
    accuracy: { shift: 16, width: 7 },
    target:   { shift: 23, width: 9 },
};

// ── include/item.h: struct Item ───────────────────────────────────────────────
const ITEM_INFO = { price: 0x00 };   // u32 price, the first field

// ── include/pokemon.h: struct Evolution / struct EvolutionParam ───────────────
// { u16 method; u16 param; u16 targetSpecies; const struct EvolutionParam *params; } — the pointer
// forces 4-byte alignment, so `params` lands at 8 and the struct is 12 bytes. An array is terminated
// by a `{ EVOLUTIONS_END }` entry (src/data/pokemon/species_info.h's EVOLUTION macro).
const EVOLUTION = { stride: 12, method: 0, param: 2, targetSpecies: 4, params: 8 };
// { u16 condition; u16 arg1; u16 arg2; u16 arg3; }, terminated by `{ CONDITIONS_END }`.
const EVOLUTION_PARAM = { stride: 8, condition: 0, arg1: 2, arg2: 4, arg3: 6 };

// ── include/wild_encounter.h: struct WildPokemon ──────────────────────────────
const WILD_POKEMON = { stride: 4, minLevel: 0, maxLevel: 1, species: 2 };

// ── include/pokemon.h: struct LevelUpMove ─────────────────────────────────────
// { u16 move; u16 level; } — MOVE FIRST, which is the opposite order to the LEVEL_UP_MOVE(lvl, move)
// macro the source reads in. Terminated by LEVEL_UP_END = { LEVEL_UP_MOVE_END, 0 }. T-240 verifies the
// order against the base's own arrays rather than trusting this comment (see modules/learnsets.js).
const LEVEL_UP_MOVE = { stride: 4, move: 0, level: 2 };

// A teachable learnset is a bare `u16 []` of move ids, terminated by MOVE_UNAVAILABLE.
const TEACHABLE_MOVE = { stride: 2 };

// ── include/data.h: struct Trainer / struct TrainerMon ────────────────────────
// The header's comments are STALE the way struct SpeciesInfo's were: it marks `.party` as /*0x04*/,
// but `u64 aiFlags` is eight bytes, so the pointer is at +8 and everything after it moves with it.
// These offsets are the compiler's real layout (4-byte pointer, u64 forcing 8-byte alignment of the
// struct, so sizeof == 0x30) — and, as everywhere else in Phase 3, they are not trusted: T-241's module
// re-encodes all 860 base parties and byte-matches them against the base ROM before writing anything.
const TRAINER = {
    stride: 0x30,
    aiFlags: 0x00,          // u64
    party: 0x08,            // const struct TrainerMon *
    items: 0x0c,            // u16[MAX_TRAINER_ITEMS]
    trainerClass: 0x14,
    battleType: 0x22,       // battleType:2 | startingStatus:6
    mugshotColor: 0x23,
    partySize: 0x24,
    poolSize: 0x25,         // trainerproc emits it from the same team count as partySize
};

// { const u8 *nickname; const u8 *ev; u32 iv; u16 moves[4]; u16 species; u16 heldItem; u16 ability;
//   u8 lvl; u8 ball; u8 friendship; <nature:5 gender:2 isShiny:1>;
//   <teraType:5 gigantamaxFactor:1 shouldUseDynamax:1 padding:1>; <dynamaxLevel:4 padding:4>; u32 tags; }
const TRAINER_MON = {
    stride: 0x24,
    nickname: 0x00,
    ev: 0x04,
    iv: 0x08,
    moves: 0x0c,
    moveCount: 4,
    species: 0x14,
    heldItem: 0x16,
    ability: 0x18,
    lvl: 0x1a,
    ball: 0x1b,
    friendship: 0x1c,
    natureGenderShiny: 0x1d,
    teraDynamax: 0x1e,
    dynamaxLevel: 0x1f,
    tags: 0x20,
};

// ── The T-237 fixed-width naming tables and the trade table (T-242) ───────────
// All three are plain, all-u8-or-aligned structs, so the offsets below are just the field order. Each
// module derives the STRIDE from its symbol's exact size divided by the capacity in
// include/constants/randomizer_layout.h, and refuses a base whose table is a different size.

// include/location_nicknames.h — { u8 mapGroup; u8 mapNum; u8 gender; u8 nickname[POKEMON_NAME_LENGTH+1]; }
const LOCATION_NICKNAME = { stride: 16, mapGroup: 0, mapNum: 1, gender: 2, nickname: 3, nicknameWidth: 13 };

// include/trade_nicknames.h — { u8 tradeId; u8 nickname[POKEMON_NAME_LENGTH + 1]; }
// The fields add up to 14 bytes but the base's rows are **16** apart: ARM rounds a struct's size up to
// a multiple of 4. `stride` here is only the floor the fields need — the module derives the real one
// from the symbol (T-242 found this on the real base, where LocationNickname's 3 + 13 = 16 needed no
// padding and this one did).
const TRADE_NICKNAME = { stride: 14, tradeId: 0, nickname: 1, nicknameWidth: 13 };

// src/trade.c — struct InGameTrade. The u32s (otId, personality) force 4-byte alignment, which is what
// puts otId at 24 rather than 23 and makes the struct 128 B rather than 127. Verified the T-241 way:
// the committed gIngameTrades[] block is re-encoded and byte-matched against the base ROM, so a wrong
// offset here fails before anything is written — and that same pass proves the charmap encoder, since
// the base's own nicknames ("DOTS", "KOBE") are text.
// T-269 appended `u16 moves[TRADE_MOVE_LIST_CAPACITY]` + `u8 moveCount`. requestedBaseFormCount ends at
// 127, the u16 array realigns to 128 (8 B), moveCount lands at 136, and the struct's 4-byte alignment
// (its u32s) rounds 137 up to a 140 B stride.
const INGAME_TRADE = {
    stride: 140,
    nickname: 0, nicknameWidth: 13,
    species: 14,
    ivs: 16, ivCount: 6,
    abilityNum: 22,
    otId: 24,
    conditions: 28, conditionCount: 5,
    personality: 36,
    heldItem: 40,
    mailNum: 42,
    otName: 43, otNameWidth: 11,
    otGender: 54,
    sheen: 55,
    requestedSpecies: 56,
    level: 58,
    requestedSpeciesList: 60,
    requestedSpeciesCount: 92,
    requestedBaseForms: 94,
    requestedBaseFormCount: 126,
    moves: 128,
    moveCount: 136,
};

// ── The Phase-2 data-driven tables (T-234/T-235/T-236, injected by T-243) ─────
// These were designed for injection: plain structs of fixed-width fields, read through runtime indices
// so LTO cannot fold them. Each module still derives the stride from its symbol.
// T-257 added the three bool8 league/heal house rules after the four u32s, so sizeof() is 20 (byte 19 is
// the tail padding the compiler zeroes and the injector leaves alone).
const RANDOMIZER_SETTINGS = {
    stride: 20, trainerMoneyNormal: 0, trainerMoneyBoss: 4, trainerMoneyGym: 8, moveRelearnerCost: 12,
    healFaintedAfterBattle: 16, healFaintedAfterBattleLeague: 17, leagueMoveRelearnAllowed: 18,
};
const GYM_REWARD = { stride: 4, species: 0, item: 2 };
const STATIC_ENCOUNTER = { stride: 4, species: 0, level: 2 };
const ITEM_PICK = { stride: 8, items: 0, itemCount: 4 };   // u16 items[MAX_PICK_ITEMS]

// ── include/item.h: struct TmHmIndexKey ───────────────────────────────────────
// { enum TMHMItemId itemId:16; u16 moveId; } — gTMHMItemMoveIds[NUM_ALL_MACHINES + 1], entry 0 the
// { ITEM_NONE, MOVE_NONE } failsafe, then one entry per TM in FOREACH_TM order, then the HMs.
const TMHM_INDEX_KEY = { stride: 4, itemId: 0, moveId: 2 };

// ── The anchors ───────────────────────────────────────────────────────────────

const SPECIES_ANCHORS = [
    {
        species: 'SPECIES_BULBASAUR',
        stats: { baseHP: 45, baseAttack: 49, baseDefense: 49, baseSpeed: 45, baseSpAttack: 65, baseSpDefense: 65 },
        types: ['TYPE_GRASS', 'TYPE_POISON'],
        abilities: ['ABILITY_OVERGROW', 'ABILITY_NONE', 'ABILITY_CHLOROPHYLL'],
    },
    {
        // A high species id: this is the anchor that proves the STRIDE, not just the field offsets.
        species: 'SPECIES_MIRAIDON',
        stats: { baseHP: 100, baseAttack: 85, baseDefense: 100, baseSpeed: 135, baseSpAttack: 135, baseSpDefense: 115 },
        types: ['TYPE_ELECTRIC', 'TYPE_DRAGON'],
        abilities: ['ABILITY_HADRON_ENGINE', 'ABILITY_NONE', 'ABILITY_NONE'],
    },
];

const MOVE_ANCHORS = [
    { move: 'MOVE_POUND',   power: 40, accuracy: 100, type: 'TYPE_NORMAL',  category: 'DAMAGE_CATEGORY_PHYSICAL' },
    { move: 'MOVE_EMBER',   power: 40, accuracy: 100, type: 'TYPE_FIRE',    category: 'DAMAGE_CATEGORY_SPECIAL' },
    { move: 'MOVE_GROWL',   power: 0,  accuracy: 100, type: 'TYPE_NORMAL',  category: 'DAMAGE_CATEGORY_STATUS' },
    { move: 'MOVE_PSYCHIC', power: 90, accuracy: 100, type: 'TYPE_PSYCHIC', category: 'DAMAGE_CATEGORY_SPECIAL' },
];

// Prices the randomizer never manages (the price writer only touches balls, mints, ability items, TMs).
const ITEM_ANCHORS = [
    { item: 'ITEM_POKE_BALL', price: 200 },
    { item: 'ITEM_MASTER_BALL', price: 1000 },
];

// The base's own first evolution — used to find the `.evolutions` field, not just to check it.
const EVOLUTION_ANCHOR = { species: 'SPECIES_BULBASAUR', method: 'EVO_LEVEL', param: 16, target: 'SPECIES_IVYSAUR' };

// ── Derivation helpers ────────────────────────────────────────────────────────

/**
 * The stride of an array symbol: its exact size divided by how many entries it holds.
 *
 * @param {import('./symbolMap').OffsetMap} offsetMap
 * @param {string} name         array symbol (e.g. 'gMovesInfo')
 * @param {number} entryCount   entries the base declares (e.g. MOVES_COUNT_ALL)
 */
function arrayStride(offsetMap, name, entryCount) {
    const sym = offsetMap.require(name);
    if (!sym.sizeExact) {
        throw new Error(
            `structLayout: '${name}' has no exact size — a linker map only bounds a symbol by its ` +
            `section (T-238). Merge the build's .sym (make syms) before deriving a stride.`);
    }
    if (!Number.isInteger(entryCount) || entryCount <= 0) {
        throw new Error(`structLayout: '${name}' needs a positive entry count, got ${entryCount}`);
    }
    if (sym.size % entryCount !== 0) {
        throw new Error(
            `structLayout: '${name}' is ${sym.size} B, which is not a whole number of ${entryCount} ` +
            `entries — the struct or the entry count changed in the base`);
    }
    return sym.size / entryCount;
}

/** Where species `id`'s struct starts in the ROM. */
function speciesOffset(base, stride, id) {
    return base + id * stride;
}

/**
 * gSpeciesInfo's placement: base offset, **derived** stride, and entry count.
 *
 * The array is declared unsized (`const struct SpeciesInfo gSpeciesInfo[]`), so neither the count nor the
 * struct size is written down anywhere the injector can read — only their product, the symbol size. It
 * is resolved by trying the two counts the source can produce (`NUM_SPECIES + 1` when the array has an
 * entry for SPECIES_EGG, else `NUM_SPECIES`) and keeping the one that divides the size exactly. If both
 * did, the anchors in `verifyLayout` are what settle it: a wrong stride cannot read Miraidon's stats back.
 */
function speciesLayout({ offsetMap, constants }) {
    const sym = offsetMap.require('gSpeciesInfo');
    if (!sym.sizeExact) {
        throw new Error(
            `structLayout: gSpeciesInfo has no exact size — a linker map only bounds a symbol by its ` +
            `section (T-238), and the stride cannot be derived without one. Merge the build's .sym (make syms).`);
    }
    const numSpecies = constants.require('NUM_SPECIES');
    const count = [numSpecies + 1, numSpecies].find(c => sym.size % c === 0);
    if (!count) {
        throw new Error(
            `structLayout: gSpeciesInfo is ${sym.size} B, which is a whole number of neither ` +
            `${numSpecies + 1} nor ${numSpecies} entries — no stride can be derived (struct SpeciesInfo or ` +
            `NUM_SPECIES changed in the base)`);
    }
    return { base: offsetMap.offsetOf('gSpeciesInfo'), stride: sym.size / count, count };
}

/**
 * gMovesInfo's placement, including **where the packed bit-field window starts**.
 *
 * With `rom` given, the window offset is derived: the only 2-byte-aligned offset at which every anchor
 * move decodes to its canonical power/accuracy/type/category. Without one (a caller that only needs the
 * base and stride) the window is left null.
 */
function moveLayout({ offsetMap, constants, rom = null }) {
    const count = constants.require('MOVES_COUNT_ALL');
    const base = offsetMap.offsetOf('gMovesInfo');
    const stride = arrayStride(offsetMap, 'gMovesInfo', count);
    return { base, stride, count, word: rom ? resolveMoveWord({ rom, base, stride, constants }) : null };
}

/** The offset of the packed word inside struct MoveInfo, found by decoding the anchor moves. */
function resolveMoveWord({ rom, base, stride, constants }) {
    const anchors = MOVE_ANCHORS.map(a => ({
        at: base + constants.require(a.move) * stride,
        power: a.power,
        accuracy: a.accuracy,
        type: constants.require(a.type),
        category: constants.require(a.category),
    }));
    const candidates = [];
    for (let word = 0; word + 4 <= stride; word += 2) {
        const all = anchors.every(anchor => {
            const value = rom.readU32(anchor.at + word);
            const read = (field) => (value >>> field.shift) & ((1 << field.width) - 1);
            return read(MOVE_INFO.type) === anchor.type
                && read(MOVE_INFO.category) === anchor.category
                && read(MOVE_INFO.power) === anchor.power
                && read(MOVE_INFO.accuracy) === anchor.accuracy;
        });
        if (all) candidates.push(word);
    }
    if (candidates.length === 1) return candidates[0];
    if (candidates.length === 0) {
        throw new Error(
            `structLayout: could not find MoveInfo's packed word — no offset in gMovesInfo decodes ` +
            `${MOVE_ANCHORS.map(a => a.move).join(', ')} to their canonical power/accuracy/type/category. ` +
            `struct MoveInfo changed shape, or this is not a clean base.`);
    }
    throw new Error(
        `structLayout: MoveInfo's packed word is ambiguous — ${candidates.length} offsets ` +
        `(${candidates.map(o => `0x${o.toString(16)}`).join(', ')}) decode every anchor. Refusing to guess.`);
}

function itemLayout({ offsetMap, constants }) {
    const count = constants.require('ITEMS_COUNT');
    return { base: offsetMap.offsetOf('gItemsInfo'), stride: arrayStride(offsetMap, 'gItemsInfo', count), count };
}

/** Read one packed MoveInfo field (see MOVE_INFO); `word` comes from moveLayout(). */
function readMoveField(rom, moveBase, field, word) {
    return rom.readBits(moveBase + word, field.shift, field.width);
}

// ── Verification ──────────────────────────────────────────────────────────────

function fail(what, expected, actual, extra = '') {
    throw new Error(
        `structLayout: base anchor mismatch — ${what} should be ${expected} but the base reads ${actual}. ` +
        `The struct layout moved (upstream sync or a flipped config #if) or the base's data changed; ` +
        `re-check include/pokemon.h against injector/structLayout.js before injecting anything.${extra}`);
}

/**
 * Read the anchors out of the base and refuse the layout if any of them disagrees.
 * Read-only: nothing here touches the write journal.
 *
 * @returns {{ speciesStride: number, moveStride: number, itemStride: number, checked: number }}
 */
function verifyLayout({ rom, offsetMap, constants }) {
    const species = speciesLayout({ offsetMap, constants });
    const moves = moveLayout({ offsetMap, constants, rom });
    const items = itemLayout({ offsetMap, constants });
    let checked = 0;

    for (const anchor of SPECIES_ANCHORS) {
        const id = constants.require(anchor.species);
        const at = speciesOffset(species.base, species.stride, id);
        for (const [field, value] of Object.entries(anchor.stats)) {
            const actual = rom.readU8(at + SPECIES_INFO[field]);
            if (actual !== value) fail(`${anchor.species}.${field}`, value, actual);
            checked += 1;
        }
        anchor.types.forEach((type, i) => {
            const expected = constants.require(type);
            const actual = rom.readU8(at + SPECIES_INFO.types + i);
            if (actual !== expected) fail(`${anchor.species}.types[${i}] (${type})`, expected, actual);
            checked += 1;
        });
        anchor.abilities.forEach((ability, i) => {
            const expected = constants.require(ability);
            const actual = rom.readU16(at + SPECIES_INFO.abilities + i * 2);
            if (actual !== expected) fail(`${anchor.species}.abilities[${i}] (${ability})`, expected, actual);
            checked += 1;
        });
    }

    for (const anchor of MOVE_ANCHORS) {
        const at = moves.base + constants.require(anchor.move) * moves.stride;
        const fields = {
            power: anchor.power,
            accuracy: anchor.accuracy,
            type: constants.require(anchor.type),
            category: constants.require(anchor.category),
        };
        for (const [field, expected] of Object.entries(fields)) {
            const actual = readMoveField(rom, at, MOVE_INFO[field], moves.word);
            if (actual !== expected) fail(`${anchor.move}.${field}`, expected, actual);
            checked += 1;
        }
    }

    for (const anchor of ITEM_ANCHORS) {
        const at = items.base + constants.require(anchor.item) * items.stride;
        const actual = rom.readU32(at + ITEM_INFO.price);
        if (actual !== anchor.price) fail(`${anchor.item}.price`, anchor.price, actual);
        checked += 1;
    }

    return {
        speciesStride: species.stride, moveStride: moves.stride, itemStride: items.stride,
        moveWord: moves.word, checked,
    };
}

/**
 * The offset of `SpeciesInfo.evolutions`, found by decoding what each candidate pointer points at.
 *
 * Unlike the stats, this field sits past a run of `#if P_GENDER_DIFFERENCES` / `P_FOOTPRINTS` /
 * `OW_POKEMON_OBJECT_EVENTS` members, so its offset depends on how the base was configured — declaring
 * a number here would be a guess. Instead: walk the 4-byte-aligned slots of the anchor species' struct,
 * follow every ROM pointer, and keep the one whose first entry decodes as the base's own evolution
 * ({EVO_LEVEL, 16, SPECIES_IVYSAUR} followed by the EVOLUTIONS_END sentinel). Exactly one must match.
 */
function resolveEvolutionsOffset({ rom, offsetMap, constants }) {
    const species = speciesLayout({ offsetMap, constants });
    const at = speciesOffset(species.base, species.stride, constants.require(EVOLUTION_ANCHOR.species));
    const wanted = {
        method: constants.require(EVOLUTION_ANCHOR.method),
        param: EVOLUTION_ANCHOR.param,
        target: constants.require(EVOLUTION_ANCHOR.target),
    };
    const end = constants.require('EVOLUTIONS_END');
    const candidates = [];

    for (let field = 0; field + 4 <= species.stride; field += 4) {
        const pointer = rom.readU32(at + field);
        let target;
        try {
            target = toRomOffset(pointer);
        } catch {
            continue;   // not a ROM pointer
        }
        if (target + EVOLUTION.stride * 2 > rom.size) continue;
        const method = rom.readU16(target + EVOLUTION.method);
        const param = rom.readU16(target + EVOLUTION.param);
        const species1 = rom.readU16(target + EVOLUTION.targetSpecies);
        const sentinel = rom.readU16(target + EVOLUTION.stride + EVOLUTION.method);
        if (method === wanted.method && param === wanted.param && species1 === wanted.target && sentinel === end) {
            candidates.push(field);
        }
    }

    if (candidates.length === 1) return candidates[0];
    if (candidates.length === 0) {
        throw new Error(
            `structLayout: could not find SpeciesInfo.evolutions — no pointer in ${EVOLUTION_ANCHOR.species}'s ` +
            `struct leads to its base evolution ({${EVOLUTION_ANCHOR.method}, ${EVOLUTION_ANCHOR.param}, ` +
            `${EVOLUTION_ANCHOR.target}}). Either the struct moved or the base's evolution data changed ` +
            `(a randomized tree is NOT a valid base — inject only into the fixed base).`);
    }
    throw new Error(
        `structLayout: SpeciesInfo.evolutions is ambiguous — ${candidates.length} candidate offsets ` +
        `(${candidates.map(o => `0x${o.toString(16)}`).join(', ')}) decode as the same evolution. Refusing to guess.`);
}

module.exports = {
    SPECIES_INFO,
    MOVE_INFO,
    ITEM_INFO,
    EVOLUTION,
    EVOLUTION_PARAM,
    WILD_POKEMON,
    LEVEL_UP_MOVE,
    TEACHABLE_MOVE,
    TRAINER,
    TRAINER_MON,
    LOCATION_NICKNAME,
    TRADE_NICKNAME,
    INGAME_TRADE,
    RANDOMIZER_SETTINGS,
    GYM_REWARD,
    STATIC_ENCOUNTER,
    ITEM_PICK,
    TMHM_INDEX_KEY,
    SPECIES_ANCHORS,
    MOVE_ANCHORS,
    ITEM_ANCHORS,
    EVOLUTION_ANCHOR,
    arrayStride,
    speciesLayout,
    speciesOffset,
    moveLayout,
    resolveMoveWord,
    itemLayout,
    readMoveField,
    verifyLayout,
    resolveEvolutionsOffset,
    toGbaPointer,
};
