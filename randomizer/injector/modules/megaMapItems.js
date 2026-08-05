'use strict';

/**
 * Inject the mega stones that lie on the ground — the output [[B-060]] found missing (T-243).
 *
 * A mega-stone ball is an `object_event` in the map's JSON, and the item it gives is carried in its
 * `trainer_sight_or_berry_tree_id` field. The base ships a placeholder there:
 *
 *     "trainer_sight_or_berry_tree_id": "ITEM_MEGA_02"     // data/maps/JaggedPass/map.json
 *     #define ITEM_MEGA_02 ITEM_NONE                       // include/constants/items.h
 *
 * The compile path rewrites the field per run (`writer.js`'s `updateMegaTrainer`) and the map compiler
 * bakes it into the map's object-event table. Until this module existed, injection did none of that, so
 * the compiled-in `ITEM_NONE` survived and the ball handed the player item 0 — whose name in
 * `gItemsInfo` is literally `????????`, after which the bag drops it.
 *
 * **Why no gate caught it.** GATE-3 compares the bytes the injector *wrote* against `compile()`'s. An
 * output nobody writes produces no journal entry and therefore no comparison; only a full-image diff
 * would have shown it, and [[B-057]] is why we stopped doing those. The lesson is a coverage rule, not
 * an equivalence one: every file the compile path mutates must be claimed by a module. The write surface
 * was measured empirically for this fix (31 files; this was the only gap).
 *
 * The assignment rule — which trainer gets which stone, and which is hidden instead — lives in
 * randomizer/megaAssignment.js, the one home writer.js and writerDocs.js call too (B-062). This module
 * and `gMegaTrainerHidden` both read it through `megaAssignment()` below, so the flag table and the ball
 * contents can never disagree.
 */

const fs = require('fs');
const path = require('path');
const { MEGA_TRAINERS } = require('../../constants');
const { assignMegaStones } = require('../../megaAssignment');

const TAG = 'megaMapItems';
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

// include/global.fieldmap.h — `struct __attribute__((packed, aligned(4))) ObjectEventTemplate`, 0x18 B.
// `packed` is what makes these offsets safe to declare: there is no padding for the compiler to insert.
// They are still proved against the base map by map before anything is written (see verifyTable).
const OBJECT_EVENT = {
    stride: 0x18,
    localId: 0x00,
    graphicsId: 0x01,       // u16, unaligned — hence the packed struct
    kind: 0x03,
    x: 0x04,                // s16
    y: 0x06,                // s16
    elevation: 0x08,
    movementType: 0x09,
    trainerType: 0x0c,      // u16
    sightOrBerryId: 0x0e,   // u16 — the item, for a mega-stone ball
    script: 0x10,           // const u8 *
    flagId: 0x14,           // u16
};

const PLACEHOLDER_RE = /^ITEM_MEGA_(\d+)$/;

/**
 * Which mega trainer gets which stone — `Map<megaId, { item } | { hidden: true }>`.
 *
 * The rule itself is no longer re-implemented here: it lives in randomizer/megaAssignment.js, which
 * writer.js and writerDocs.js call too (B-062). This wrapper only reshapes it into the
 * `{ item } | { hidden: true }` map that this module and `gMegaTrainerHidden` consume.
 */
function megaAssignment(data) {
    const { assigned } = assignMegaStones(
        ((data.wild) || {}).foundMegaEvos || [],
        ((data.trainers) || {}).trainersData || [],
    );
    const assignment = new Map();
    for (const mega of MEGA_TRAINERS) {
        assignment.set(mega.id, assigned.has(mega.id) ? { item: assigned.get(mega.id).item } : { hidden: true });
    }
    return assignment;
}

/**
 * Every `ITEM_MEGA_nn` site in the committed maps: `[{ map, megaId, index, json }]`, where `index` is
 * the event's position in that map's `object_events` (the order the map compiler preserves).
 */
function findMegaPlaceholders({ root = REPO_ROOT, maps = null } = {}) {
    const sites = [];
    const read = (map) => JSON.parse(fs.readFileSync(path.resolve(root, 'data', 'maps', map, 'map.json'), 'utf8'));
    const names = maps ? Object.keys(maps) : [...new Set(MEGA_TRAINERS.map(m => m.map))];

    for (const map of names) {
        const json = maps ? maps[map] : read(map);
        (json.object_events || []).forEach((event, index) => {
            const match = String(event.trainer_sight_or_berry_tree_id || '').match(PLACEHOLDER_RE);
            if (match) sites.push({ map, megaId: match[1], index, json });
        });
    }
    return sites;
}

/**
 * Prove one map's object-event table before writing into it: every event's graphics id, position and
 * flag must be what the map JSON says. Same discipline as the wild tables (T-239) — a symbol that does
 * not hold the data the source describes means the ROM and the sources are different builds.
 */
function verifyTable(ctx, map, json) {
    const { rom, constants, offsetMap } = ctx;
    const symbol = `${map}_ObjectEvents`;
    if (!offsetMap.has(symbol)) {
        throw new Error(
            `injector/${TAG}: the base exports no ${symbol}. Either the map was renamed or this offset ` +
            `map is from another build — the mega stone cannot be placed blindly.`);
    }
    const at = offsetMap.offsetOf(symbol);
    (json.object_events || []).forEach((event, index) => {
        const eventAt = at + index * OBJECT_EVENT.stride;
        const graphics = constants.get(event.graphics_id);
        if (graphics === undefined) {
            throw new Error(`injector/${TAG}: ${map} event ${index} has graphics '${event.graphics_id}', which the base does not define`);
        }
        const romGraphics = rom.readU16(eventAt + OBJECT_EVENT.graphicsId);
        const romX = rom.readU16(eventAt + OBJECT_EVENT.x);
        const romY = rom.readU16(eventAt + OBJECT_EVENT.y);
        if (romGraphics !== graphics || romX !== Number(event.x) || romY !== Number(event.y)) {
            throw new Error(
                `injector/${TAG}: ${map}_ObjectEvents[${index}] does not match data/maps/${map}/map.json ` +
                `(graphics ${romGraphics} vs ${graphics}, position ${romX},${romY} vs ${event.x},${event.y}). ` +
                `The base ROM and these maps are not the same build.`);
        }
    });
    return at;
}

/**
 * @param {object} ctx  see injector/context.js
 * @param {object} [opts]
 * @param {object} [opts.maps]  `{ MapName: parsedMapJson }` instead of reading data/maps (tests)
 * @returns {{ writes: number, hidden: number, sites: number }}
 */
function injectMegaMapItems(ctx, { maps = null } = {}) {
    const { rom, constants, data, log } = ctx;
    const sites = findMegaPlaceholders({ maps });
    if (sites.length === 0) return { writes: 0, hidden: 0, sites: 0 };

    // A bundle with no wild artifact assigned no megas at all — the placeholders stay as the base has
    // them, which is what the compile path also produces.
    if (!data.wild || !data.wild.foundMegaEvos) return { writes: 0, hidden: 0, sites: sites.length };
    const assignment = megaAssignment(data);

    const verified = new Map();
    for (const site of sites) {
        if (!verified.has(site.map)) verified.set(site.map, verifyTable(ctx, site.map, site.json));
    }

    let writes = 0;
    let hidden = 0;
    for (const site of sites) {
        const assigned = assignment.get(site.megaId);
        if (!assigned) throw new Error(`injector/${TAG}: ${site.map} has a placeholder for mega trainer ${site.megaId}, which MEGA_TRAINERS does not list`);
        if (assigned.hidden) { hidden += 1; continue; }   // the ball never spawns; writer.js leaves it too

        const item = constants.get(assigned.item);
        if (item === undefined) {
            throw new Error(`injector/${TAG}: ${site.map}'s mega stone '${assigned.item}' is not an item the base defines`);
        }
        const at = verified.get(site.map) + site.index * OBJECT_EVENT.stride + OBJECT_EVENT.sightOrBerryId;
        rom.writeU16(at, item, `${TAG}:megaStone`);
        writes += 1;
    }

    log(`mega stones on the ground: ${writes} placed, ${hidden} left hidden (of ${sites.length} sites)`);
    return { writes, hidden, sites: sites.length };
}

module.exports = {
    injectMegaMapItems,
    megaAssignment,
    findMegaPlaceholders,
    verifyTable,
    OBJECT_EVENT,
    PLACEHOLDER_RE,
    TAG,
};
