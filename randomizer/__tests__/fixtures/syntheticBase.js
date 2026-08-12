'use strict';

// T-239 — a synthetic stand-in for the base ROM, shared by every Group-A injector module test.
//
// It is laid out like the real thing (same structs, same anchor values, symbols in a `.map`-shaped
// offset map) but is a few hundred KB instead of 25 MB, so a test can assert on exact bytes. The real
// base is only reachable on the build box, where the same modules are re-validated (T-233 / GATE-3).
//
// Anchors matter: the tables below hold the canonical values `structLayout.verifyLayout` checks, so a
// module test also proves the module's own layout guard passes on well-formed data.

const { Rom } = require('../../injector/rom');
const { OffsetMap } = require('../../injector/symbolMap');
const { loadGameConstants } = require('../../injector/gameConstants');
const {
    SPECIES_INFO, MOVE_INFO, ITEM_INFO, EVOLUTION, EVOLUTION_PARAM, WILD_POKEMON, LEVEL_UP_MOVE, TEACHABLE_MOVE,
    TRAINER, TRAINER_MON, LOCATION_NICKNAME, TRADE_NICKNAME, INGAME_TRADE,
} = require('../../injector/structLayout');
const { OBJECT_EVENT } = require('../../injector/modules/megaMapItems');
const { encodeParty } = require('../../injector/partyFile');
const {
    LEVEL_UP_LEARNSET_CAPACITY, TEACHABLE_LEARNSET_CAPACITY, TRAINER_PARTY_CAPACITY,
    LOCATION_NICKNAME_CAPACITY, TRADE_NICKNAME_CAPACITY, STARTER_EXTRA_CAPACITY,
} = require('../../layout');

const ROOT = require('path').resolve(__dirname, '..', '..', '..');
const constants = loadGameConstants({ root: ROOT });
const varConstants = require('../../injector/scriptPatch').loadVarConstants();

// Strides the real base has no reason to share — deliberately different, so a module that assumes one
// stride for another table fails here.
const SPECIES_STRIDE = 0x104;       // the real base's sizeof(struct SpeciesInfo) — see structLayout
const MOVE_STRIDE = 60;
const ITEM_STRIDE = 40;
const MOVE_WORD = 0x0c;             // where this fixture puts MoveInfo's packed window (the real base: 0x0A)
const EVOLUTIONS_FIELD = 0xd0;      // where this fixture puts SpeciesInfo.evolutions (past the anchors)

// Table bases, spaced so no table can reach into the next one (gSpeciesInfo alone is ~390 KB).
const SPECIES_BASE = 0x1000;
const MOVE_BASE = 0x70000;
const ITEM_BASE = 0x80000;
const TMHM_BASE = 0x90000;
const EVO_BASE = 0xa0000;           // evolution arrays, bump-allocated
const WILD_BASE = 0xb0000;          // wild slot arrays, bump-allocated
const LEARNSET_BASE = 0xc0000;      // level-up + teachable learnset slots, bump-allocated (T-240)
const TRAINER_BASE = 0xe0000;       // gTrainers[DIFFICULTY_COUNT][TRAINERS_COUNT] (T-241)
const PARTNER_BASE = 0x120000;      // gBattlePartners[DIFFICULTY_COUNT][PARTNER_COUNT]
const PARTY_BASE = 0x121000;        // the anonymous party blobs the .party pointers point at
const NAMING_BASE = 0x130000;       // the T-242 text tables: starters, nicknames, trades
const DATA_DRIVEN_BASE = 0x135000;  // the T-234/235/236 tables + the two toggle scripts (T-243)
const OBJECT_EVENT_BASE = 0x138000; // per-map object-event tables — the mega-stone balls (B-060)
const ROM_SIZE = 0x140000;

// The canonical base values `verifyLayout` insists on (see structLayout.js for why these ones).
const ANCHOR_SPECIES = {
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

const ANCHOR_MOVES = {
    MOVE_POUND:   { power: 40, accuracy: 100, type: 'TYPE_NORMAL',  category: 'DAMAGE_CATEGORY_PHYSICAL' },
    MOVE_EMBER:   { power: 40, accuracy: 100, type: 'TYPE_FIRE',    category: 'DAMAGE_CATEGORY_SPECIAL' },
    MOVE_GROWL:   { power: 0,  accuracy: 100, type: 'TYPE_NORMAL',  category: 'DAMAGE_CATEGORY_STATUS' },
    MOVE_PSYCHIC: { power: 90, accuracy: 100, type: 'TYPE_PSYCHIC', category: 'DAMAGE_CATEGORY_SPECIAL' },
};

const ANCHOR_ITEMS = { ITEM_POKE_BALL: 200, ITEM_MASTER_BALL: 1000 };

// Bulbasaur's evolution is how structLayout finds the `.evolutions` field, so every fixture has it.
const ANCHOR_EVOLUTIONS = {
    SPECIES_BULBASAUR: [{ method: 'EVO_LEVEL', param: 16, target: 'SPECIES_IVYSAUR' }],
};

/**
 * Build a synthetic base.
 *
 * @param {object} [opts]
 * @param {object} [opts.species]     extra base species data: { SPECIES_X: { stats, types, abilities, itemCommon, itemRare } }
 * @param {object} [opts.moves]       extra base move data: { MOVE_X: { power, accuracy, type, category } }
 * @param {object} [opts.items]       extra base prices: { ITEM_X: price }
 * @param {object} [opts.evolutions]  { SPECIES_X: [{ method, param, target, conditions: [{ condition, arg1 }] }] }
 * @param {object} [opts.wild]        { '<symbol>': ['SPECIES_A', …] } — one WildPokemon array per symbol
 * @param {string[]} [opts.tmMoves]   TM slot n → move name (index 0 = TM01)
 * @param {object} [opts.learnsets]   { '<symbol>': [{ level, move }] | { entries, size } } — level-up slots
 * @param {object} [opts.teachables]  { '<symbol>': ['MOVE_A', …] | { entries, size } } — teachable slots
 * @param {object} [opts.trainers]    { 'TRAINER_X': { doubleBattle, mons } } — gTrainers + its party blobs
 * @param {object} [opts.partners]    { 'PARTNER_X': { doubleBattle, mons } } — gBattlePartners
 * @param {boolean|string} [opts.naming]  T-242's tables (starters, nickname tables, gIngameTrades). Pass
 *        a `gIngameTrades[]` block of C to lay the trade table out from it, or `true` for an empty one.
 * @param {object} [opts.objectEvents]  { MapName: parsedMapJson } — lays out `<Map>_ObjectEvents` from
 *        the JSON's own events, the way the map compiler does (B-060's mega-stone balls).
 * @param {boolean} [opts.dataDriven]  T-243's Phase-2 tables at their committed defaults, plus the two
 *        Group-D toggle scripts as real `setvar` bytecode behind their (local) labels.
 */
function buildSyntheticBase({
    species = {}, moves = {}, items = {}, evolutions = {}, wild = {}, tmMoves = null,
    learnsets = {}, teachables = {}, trainers = null, partners = null, naming = null, dataDriven = false,
    objectEvents = null,
} = {}) {
    const buffer = Buffer.alloc(ROM_SIZE, 0);
    const speciesCount = constants.require('NUM_SPECIES');
    const moveCount = constants.require('MOVES_COUNT_ALL');
    const itemCount = constants.require('ITEMS_COUNT');

    const speciesAt = (name) => SPECIES_BASE + constants.require(name) * SPECIES_STRIDE;
    const moveAt = (name) => MOVE_BASE + constants.require(name) * MOVE_STRIDE;
    const itemAt = (name) => ITEM_BASE + constants.require(name) * ITEM_STRIDE;

    for (const [name, s] of Object.entries({ ...ANCHOR_SPECIES, ...species })) {
        const at = speciesAt(name);
        (s.stats || []).forEach((v, i) => buffer.writeUInt8(v, at + i));
        (s.types || []).forEach((t, i) => buffer.writeUInt8(constants.require(t), at + SPECIES_INFO.types + i));
        (s.abilities || []).forEach((a, i) => buffer.writeUInt16LE(constants.require(a), at + SPECIES_INFO.abilities + i * 2));
        if (s.itemCommon) buffer.writeUInt16LE(constants.require(s.itemCommon), at + SPECIES_INFO.itemCommon);
        if (s.itemRare) buffer.writeUInt16LE(constants.require(s.itemRare), at + SPECIES_INFO.itemRare);
    }

    for (const [name, m] of Object.entries({ ...ANCHOR_MOVES, ...moves })) {
        const packed = (constants.require(m.type) & 0x1f)
            | ((constants.require(m.category) & 0x3) << MOVE_INFO.category.shift)
            | ((m.power & 0x1ff) << MOVE_INFO.power.shift)
            | ((m.accuracy & 0x7f) << MOVE_INFO.accuracy.shift);
        buffer.writeUInt32LE(packed >>> 0, moveAt(name) + MOVE_WORD);
    }

    for (const [name, price] of Object.entries({ ...ANCHOR_ITEMS, ...items })) {
        buffer.writeUInt32LE(price, itemAt(name) + ITEM_INFO.price);
    }

    // Evolution arrays + their condition arrays, bump-allocated after the tables.
    let evoCursor = EVO_BASE;
    const allEvolutions = { ...ANCHOR_EVOLUTIONS, ...evolutions };
    for (const [name, list] of Object.entries(allEvolutions)) {
        const arrayAt = evoCursor;
        evoCursor += (list.length + 1) * EVOLUTION.stride;
        list.forEach((evo, i) => {
            const at = arrayAt + i * EVOLUTION.stride;
            buffer.writeUInt16LE(constants.require(evo.method), at + EVOLUTION.method);
            const param = typeof evo.param === 'string' ? constants.require(evo.param) : evo.param;
            buffer.writeUInt16LE(param, at + EVOLUTION.param);
            buffer.writeUInt16LE(constants.require(evo.target), at + EVOLUTION.targetSpecies);
            if (evo.conditions && evo.conditions.length) {
                const conditionsAt = evoCursor;
                evoCursor += (evo.conditions.length + 1) * EVOLUTION_PARAM.stride;
                evo.conditions.forEach((cond, j) => {
                    const cAt = conditionsAt + j * EVOLUTION_PARAM.stride;
                    buffer.writeUInt16LE(constants.require(cond.condition), cAt + EVOLUTION_PARAM.condition);
                    buffer.writeUInt16LE(cond.arg1 || 0, cAt + EVOLUTION_PARAM.arg1);
                });
                buffer.writeUInt16LE(constants.require('CONDITIONS_END'), conditionsAt + evo.conditions.length * EVOLUTION_PARAM.stride);
                buffer.writeUInt32LE(0x08000000 + conditionsAt, at + EVOLUTION.params);
            }
        });
        buffer.writeUInt16LE(constants.require('EVOLUTIONS_END'), arrayAt + list.length * EVOLUTION.stride);
        buffer.writeUInt32LE(0x08000000 + arrayAt, speciesAt(name) + EVOLUTIONS_FIELD);
    }

    // Wild slot arrays, each its own symbol (the generated `<base_label>_<Type>Mons` tables). A slot is
    // either a species name or `{ species, min_level, max_level }` — the latter lets a test mirror the
    // real wild_encounters.json, which the injector validates its slots against.
    let wildCursor = WILD_BASE;
    const wildSymbols = {};
    for (const [symbol, slots] of Object.entries(wild)) {
        const at = wildCursor;
        wildCursor += slots.length * WILD_POKEMON.stride;
        slots.forEach((slot, i) => {
            const { species, min_level: min = 5, max_level: max = 7 } = typeof slot === 'string' ? { species: slot } : slot;
            const slotAt = at + i * WILD_POKEMON.stride;
            buffer.writeUInt8(min, slotAt + WILD_POKEMON.minLevel);
            buffer.writeUInt8(max, slotAt + WILD_POKEMON.maxLevel);
            buffer.writeUInt16LE(constants.require(species), slotAt + WILD_POKEMON.species);
        });
        wildSymbols[symbol] = { romOffset: at, size: slots.length * WILD_POKEMON.stride };
    }
    if (wildCursor > ROM_SIZE) throw new Error('syntheticBase: wild tables outgrew the fixture ROM');

    // gTMHMItemMoveIds — { u16 itemId, u16 moveId } per machine, index 0 the ITEM_NONE failsafe.
    let tmhmSize = 0;
    if (tmMoves) {
        const hmCount = 8;
        tmhmSize = (1 + tmMoves.length + hmCount) * 4;
        buffer.writeUInt16LE(constants.require('ITEM_NONE'), TMHM_BASE);
        buffer.writeUInt16LE(constants.require('MOVE_NONE'), TMHM_BASE + 2);
        tmMoves.forEach((move, i) => {
            const at = TMHM_BASE + (i + 1) * 4;
            buffer.writeUInt16LE(constants.require('ITEM_TM01') + i, at);
            buffer.writeUInt16LE(constants.require(`MOVE_${move}`), at + 2);
        });
        ['CUT', 'FLY', 'SURF', 'STRENGTH', 'FLASH', 'ROCK_SMASH', 'WATERFALL', 'DIVE'].forEach((hm, i) => {
            const at = TMHM_BASE + (1 + tmMoves.length + i) * 4;
            buffer.writeUInt16LE(constants.require('ITEM_HM01') + i, at);
            buffer.writeUInt16LE(constants.require(`MOVE_${hm}`), at + 2);
        });
    }

    // Learnset slots — T-237 made each array a FIXED-capacity export, so the fixture allocates the
    // whole capacity (176 B / 160 B), writes the payload + terminator and leaves the tail zeroed,
    // exactly as C initializes a `[CAPACITY]` array with fewer initializers.
    let learnsetCursor = LEARNSET_BASE;
    const learnsetSymbols = {};
    const allocSlot = (size) => { const at = learnsetCursor; learnsetCursor += size; return at; };
    const slotSpec = (value, defaultSize) => (Array.isArray(value)
        ? { entries: value, size: defaultSize }
        : { entries: value.entries || [], size: value.size ?? defaultSize });

    for (const [symbol, value] of Object.entries(learnsets)) {
        const { entries, size } = slotSpec(value, LEVEL_UP_LEARNSET_CAPACITY * LEVEL_UP_MOVE.stride);
        const at = allocSlot(size);
        entries.forEach((entry, i) => {
            const entryAt = at + i * LEVEL_UP_MOVE.stride;
            buffer.writeUInt16LE(constants.require(entry.move), entryAt + LEVEL_UP_MOVE.move);
            buffer.writeUInt16LE(Number(entry.level), entryAt + LEVEL_UP_MOVE.level);
        });
        buffer.writeUInt16LE(constants.require('LEVEL_UP_MOVE_END'), at + entries.length * LEVEL_UP_MOVE.stride);
        learnsetSymbols[symbol] = { romOffset: at, size };
    }

    for (const [symbol, value] of Object.entries(teachables)) {
        const { entries, size } = slotSpec(value, TEACHABLE_LEARNSET_CAPACITY * TEACHABLE_MOVE.stride);
        const at = allocSlot(size);
        entries.forEach((move, i) => buffer.writeUInt16LE(constants.require(move), at + i * TEACHABLE_MOVE.stride));
        buffer.writeUInt16LE(constants.require('MOVE_UNAVAILABLE'), at + entries.length * TEACHABLE_MOVE.stride);
        learnsetSymbols[symbol] = { romOffset: at, size };
    }
    if (learnsetCursor > ROM_SIZE) throw new Error('syntheticBase: learnset slots outgrew the fixture ROM');

    // gTrainers / gBattlePartners — the struct rows plus the anonymous 216 B party blob each `.party`
    // pointer points at (T-237 gave every party the same fixed capacity, which is why they are a
    // constant stride apart in the real base too).
    let partyCursor = PARTY_BASE;
    const trainerTables = [];
    const buildTrainerTable = (tableBase, entries, count, symbol) => {
        for (const [id, spec] of Object.entries(entries)) {
            const index = constants.require(id);
            const at = tableBase + (constants.require('DIFFICULTY_NORMAL') * count + index) * TRAINER.stride;
            const mons = spec.mons || [];
            const partyAt = partyCursor;
            partyCursor += TRAINER_PARTY_CAPACITY * TRAINER_MON.stride;
            encodeParty(constants, mons, id, TRAINER_PARTY_CAPACITY).copy(buffer, partyAt);
            buffer.writeUInt32LE(0x08000000 + partyAt, at + TRAINER.party);
            buffer.writeUInt8(mons.length, at + TRAINER.partySize);
            // poolSize stays 0: trainerproc emits it only for a `Party Size:` block, and no trainer in
            // this base has one (GATE-3 caught the injector writing the team size here — T-241).
            buffer.writeUInt8(spec.doubleBattle ? constants.require('TRAINER_BATTLE_TYPE_DOUBLES') : 0,
                at + TRAINER.battleType);
        }
        trainerTables.push([symbol, tableBase, constants.require('DIFFICULTY_COUNT') * count * TRAINER.stride]);
    };
    // Both tables come as a pair, as they do in a real base: a trainer test that names no partner
    // still gets an (empty) gBattlePartners, so the module's "the base must export these" guard is
    // exercised against a realistic base rather than a half-populated one.
    if (trainers || partners) {
        buildTrainerTable(TRAINER_BASE, trainers || {}, constants.require('TRAINERS_COUNT'), 'gTrainers');
        buildTrainerTable(PARTNER_BASE, partners || {}, constants.require('PARTNER_COUNT'), 'gBattlePartners');
    }
    if (partyCursor > ROM_SIZE) throw new Error('syntheticBase: party blobs outgrew the fixture ROM');

    // T-242's text tables. The committed base has vanilla starters, empty nickname tables (count 0) and
    // the four hand-written trades — a fixture reproduces that shape so the module's base check has
    // something real to verify against.
    const namingSymbols = {};
    if (naming) {
        let cursor = NAMING_BASE;
        const alloc = (size) => { const at = cursor; cursor += size + (size % 2); return at; };
        const add = (name, size) => { const at = alloc(size); namingSymbols[name] = { romOffset: at, size }; return at; };

        const trio = add('gStarterMon', 3 * 2);
        ['SPECIES_TREECKO', 'SPECIES_TORCHIC', 'SPECIES_MUDKIP']
            .forEach((s, i) => buffer.writeUInt16LE(constants.require(s), trio + i * 2));
        add('gStarterExtraMon', STARTER_EXTRA_CAPACITY * 2);
        add('gStarterExtraCount', 1);
        add('gStarterExtraNicknames', STARTER_EXTRA_CAPACITY * INGAME_TRADE.nicknameWidth);
        add('gStarterExtraGenders', STARTER_EXTRA_CAPACITY);
        add('gStarterNickname', INGAME_TRADE.nicknameWidth);
        add('gStarterGender', 1);
        add('gLocationNicknames', LOCATION_NICKNAME_CAPACITY * LOCATION_NICKNAME.stride);
        add('gLocationNicknameCount', 1);
        // 16 B per row, not the 14 its fields add up to — ARM rounds the struct up to a multiple of 4,
        // which is what the real base does (T-242 / GATE-3).
        add('gTradeNicknames', TRADE_NICKNAME_CAPACITY * (TRADE_NICKNAME.stride + 2));
        add('gTradeNicknameCount', 1);

        const tradesAt = add('gIngameTrades', constants.require('INGAME_TRADES_COUNT') * INGAME_TRADE.stride);
        if (typeof naming === 'string') {
            // Lay the table out from the same C the injector will verify against, using the module's own
            // encoder — the fixture cannot prove the encoding, only the real base can (see the module).
            const { encodeTradeTable } = require('../../injector/modules/tradesStartersNicknames');
            const table = encodeTradeTable({ constants, root: ROOT, charmap: null }, naming);
            table.copy(buffer, tradesAt);
        }
        if (cursor > ROM_SIZE) throw new Error('syntheticBase: the naming tables outgrew the fixture ROM');
    }

    // T-243 — the Phase-2 tables at their COMMITTED values (the module verifies the base against the
    // committed C before writing) and the two toggle scripts as real setvar bytecode.
    const dataDrivenSymbols = {};
    if (dataDriven) {
        let cursor = DATA_DRIVEN_BASE;
        const add = (name, size) => { const at = cursor; cursor += size + (size % 2); dataDrivenSymbols[name] = { romOffset: at, size }; return at; };

        // T-257 — four u32s then three bool8 league/heal rules; T-274 appended the shiny rule (bool8 +
        // u32 + u16) and the starter's two IV-floor u8s: sizeof() == 28, no padding left. The league rules
        // stay zero here, matching the committed FALSE/FALSE/FALSE; the T-274 fields carry the committed
        // defaults (quality mode, gen 3's 8/65536 unused behind it, 150, and a 3×31 / 150-total starter).
        const settings = add('gRandomizerSettings', 28);
        [250, 3000, 5000, 250].forEach((v, i) => buffer.writeUInt32LE(v, settings + i * 4));
        buffer.writeUInt8(1, settings + 19);        // shinyByQuality = TRUE
        buffer.writeUInt32LE(8, settings + 20);     // shinyOdds
        buffer.writeUInt16LE(150, settings + 24);   // shinyIvThreshold
        buffer.writeUInt8(3, settings + 26);        // starterPerfectIvs
        buffer.writeUInt8(150, settings + 27);      // starterMinIvTotal
        add('gGymRewards', 11 * 4);                       // all SPECIES_NONE / ITEM_NONE = zeros
        const statics = add('gStaticEncounters', 7 * 4);
        [['SPECIES_REGIROCK', 36], ['SPECIES_REGICE', 39], ['SPECIES_REGISTEEL', 46], ['SPECIES_MEW', 39],
            ['SPECIES_NONE', 61], ['SPECIES_NONE', 61], ['SPECIES_NONE', 61]].forEach(([species, level], i) => {
            buffer.writeUInt16LE(constants.require(species), statics + i * 4);
            buffer.writeUInt16LE(level, statics + i * 4 + 2);
        });
        // The randomizer's 29 locations start at ITEM_NONE; the 24 STATIC TM picks that follow them
        // carry real items in the base and must survive injection (T-243 / GATE-3).
        const picksAt = add('gItemPicks', constants.require('PICK_COUNT') * 8);
        {
            const { parseArrayRows } = require('../../injector/modules/dataDrivenAndToggles');
            const source = require('fs').readFileSync(require('path').resolve(ROOT, 'src', 'randomizer_picks.c'), 'utf8');
            for (const row of parseArrayRows(source, 'gItemPicks', 'item pick')) {
                const index = constants.require(row.name);
                row.value.replace(/^\{+|\}+$/g, '').split(',').map(t => t.trim()).filter(Boolean)
                    .forEach((item, slot) => buffer.writeUInt16LE(constants.require(item), picksAt + index * 8 + slot * 2));
            }
        }
        add('gMegaTrainerHidden', 21);                             // FALSE everywhere

        // `setvar <var>, <value>` = 0x16 <u16 var> <u16 value>, the shape scriptPatch.js scans for.
        const script = (name, setvars) => {
            const at = add(name, setvars.length * 5 + 1);
            setvars.forEach(([varName, value], i) => {
                buffer.writeUInt8(0x16, at + i * 5);
                buffer.writeUInt16LE(varConstants[varName], at + i * 5 + 1);
                buffer.writeUInt16LE(value, at + i * 5 + 3);
            });
            buffer.writeUInt8(0x02, at + setvars.length * 5);      // `end`
        };
        script('EverGrandeCity_SidneysRoom_EventScript_InitRunAndBun', [
            ['VAR_RUNANDBUN_MODE', 0], ['VAR_RUNANDBUN_SINGLES_LEFT', 4], ['VAR_RUNANDBUN_DOUBLES_LEFT', 0],
        ]);
        script('MossdeepCity_SpaceCenter_2F_OnTransition', [['VAR_DISABLE_STEVEN_TAG_BATTLE', 0]]);
        if (cursor > ROM_SIZE) throw new Error('syntheticBase: the data-driven tables outgrew the fixture ROM');
    }

    // Per-map object-event tables, laid out from the map JSON exactly as the map compiler would.
    //
    // `dataDriven` implies them: T-243's module also places the mega stones (B-060), and the real base
    // exports one table per map — so a fixture that omitted them would make the module's "the base must
    // export this" guard fire in every T-243 test. The maps come from the committed JSONs, like the
    // constants come from the committed headers.
    let objectEventMaps = objectEvents;
    if (!objectEventMaps && dataDriven) {
        const { findMegaPlaceholders } = require('../../injector/modules/megaMapItems');
        objectEventMaps = {};
        for (const site of findMegaPlaceholders({ root: ROOT })) {
            if (!objectEventMaps[site.map]) objectEventMaps[site.map] = site.json;
        }
    }
    const objectEventSymbols = {};
    if (objectEventMaps) {
        const objectEvents = objectEventMaps;   // the layout loop below reads this name
        let cursor = OBJECT_EVENT_BASE;
        for (const [map, json] of Object.entries(objectEvents)) {
            const events = json.object_events || [];
            const at = cursor;
            cursor += events.length * OBJECT_EVENT.stride;
            events.forEach((event, i) => {
                const eventAt = at + i * OBJECT_EVENT.stride;
                buffer.writeUInt8(i + 1, eventAt + OBJECT_EVENT.localId);
                buffer.writeUInt16LE(constants.require(event.graphics_id), eventAt + OBJECT_EVENT.graphicsId);
                buffer.writeUInt16LE(Number(event.x), eventAt + OBJECT_EVENT.x);
                buffer.writeUInt16LE(Number(event.y), eventAt + OBJECT_EVENT.y);
                buffer.writeUInt8(Number(event.elevation) || 0, eventAt + OBJECT_EVENT.elevation);
                buffer.writeUInt16LE(Number(event.trainer_type) || 0, eventAt + OBJECT_EVENT.trainerType);
                // The item/sight field: a placeholder compiles to its constant, i.e. ITEM_NONE.
                const raw = String(event.trainer_sight_or_berry_tree_id ?? '0');
                const value = /^\d+$/.test(raw) ? Number(raw) : (constants.get(raw) ?? 0);
                buffer.writeUInt16LE(value, eventAt + OBJECT_EVENT.sightOrBerryId);
                if (event.flag && event.flag !== '0') {
                    buffer.writeUInt16LE(constants.get(event.flag) ?? 0, eventAt + OBJECT_EVENT.flagId);
                }
            });
            objectEventSymbols[`${map}_ObjectEvents`] = { romOffset: at, size: events.length * OBJECT_EVENT.stride };
        }
        if (cursor > ROM_SIZE) throw new Error('syntheticBase: the object-event tables outgrew the fixture ROM');
    }

    const sym = (name, romOffset, size) => ({ name, addr: 0x08000000 + romOffset, romOffset, size, sizeExact: true });
    const symbols = {
        gSpeciesInfo: sym('gSpeciesInfo', SPECIES_BASE, speciesCount * SPECIES_STRIDE),
        gMovesInfo:   sym('gMovesInfo', MOVE_BASE, moveCount * MOVE_STRIDE),
        gItemsInfo:   sym('gItemsInfo', ITEM_BASE, itemCount * ITEM_STRIDE),
    };
    if (tmhmSize) symbols.gTMHMItemMoveIds = sym('gTMHMItemMoveIds', TMHM_BASE, tmhmSize);
    for (const [name, s] of Object.entries(wildSymbols)) symbols[name] = sym(name, s.romOffset, s.size);
    for (const [name, s] of Object.entries(learnsetSymbols)) symbols[name] = sym(name, s.romOffset, s.size);
    for (const [name, at, size] of trainerTables) symbols[name] = sym(name, at, size);
    for (const [name, s] of Object.entries(namingSymbols)) symbols[name] = sym(name, s.romOffset, s.size);
    for (const [name, s] of Object.entries(objectEventSymbols)) symbols[name] = sym(name, s.romOffset, s.size);
    for (const [name, s] of Object.entries(dataDrivenSymbols)) symbols[name] = sym(name, s.romOffset, s.size);

    return {
        rom: Rom.fromBuffer(buffer),
        offsetMap: new OffsetMap({ symbols, romEndOffset: ROM_SIZE }),
        constants,
        strides: { species: SPECIES_STRIDE, move: MOVE_STRIDE, item: ITEM_STRIDE },
        bases: { species: SPECIES_BASE, move: MOVE_BASE, item: ITEM_BASE, tmhm: TMHM_BASE },
        moveWord: MOVE_WORD,
        evolutionsField: EVOLUTIONS_FIELD,
        speciesAt,
        moveAt,
        itemAt,
    };
}

module.exports = { buildSyntheticBase, constants, ANCHOR_SPECIES, ANCHOR_MOVES, ANCHOR_ITEMS };
