// B-060 / T-243 — the mega stones lying on the ground.
//
// This is the output the first play-test found missing: a mega-stone ball is an `object_event` in the
// map's JSON whose `trainer_sight_or_berry_tree_id` carries the item, and writer.js rewrites it per run
// (updateMegaTrainer). Nothing injected it, so the compiled-in placeholder ITEM_MEGA_nn — which
// items.h defines as ITEM_NONE — survived and the ball handed over item 0, whose name is "????????".
//
// GATE-3 could not see it: it compares the bytes the injector WROTE, and a forgotten output writes
// none. So these tests exist as much for the coverage rule as for the bytes.
const fs = require('fs');
const path = require('path');
const { buildSyntheticBase, constants } = require('../fixtures/syntheticBase');
const { buildInjectionContext } = require('../../injector/context');
const {
    injectMegaMapItems, megaAssignment, findMegaPlaceholders, OBJECT_EVENT, TAG,
} = require('../../injector/modules/megaMapItems');
const { MEGA_TRAINERS } = require('../../constants');

const ROOT = path.resolve(__dirname, '..', '..', '..');

/** A map.json with one item ball carrying a mega placeholder, plus two ordinary events. */
function miniMap({ placeholder = 'ITEM_MEGA_02', extra = [] } = {}) {
    return {
        object_events: [
            { graphics_id: 'OBJ_EVENT_GFX_HIKER', x: 8, y: 12, elevation: 3, trainer_type: '1', trainer_sight_or_berry_tree_id: '1', flag: '0' },
            { graphics_id: 'OBJ_EVENT_GFX_ITEM_BALL', x: 8, y: 18, elevation: 3, trainer_type: '0', trainer_sight_or_berry_tree_id: placeholder, flag: 'FLAG_ITEM_JAGGED_PASS_BURN_HEAL' },
            ...extra,
        ],
    };
}

/** The wild + trainer artifacts that decide which mega trainers get a stone. */
function megaData({ found = [], levels = 40 } = {}) {
    return {
        wild: { foundMegaEvos: found },
        trainers: {
            trainersData: MEGA_TRAINERS.map(m => ({ id: m.trainer, level: levels })),
        },
    };
}

function setup({ maps = { JaggedPass: miniMap() }, data = megaData() } = {}) {
    const base = buildSyntheticBase({ objectEvents: maps });
    const ctx = buildInjectionContext({ rom: base.rom, offsetMap: base.offsetMap, data });
    return { ...base, ctx, maps };
}

const eventAt = (base, map, index) =>
    base.offsetMap.offsetOf(`${map}_ObjectEvents`) + index * OBJECT_EVENT.stride;
const itemOf = (base, map, index) => base.rom.readU16(eventAt(base, map, index) + OBJECT_EVENT.sightOrBerryId);

describe('which mega trainer gets which stone', () => {
    // writer.js sorts foundMegaEvos by level and walks MEGA_TRAINERS in order, handing the next stone to
    // the first trainer whose level is high enough and HIDING the trainer when none is.
    test('mirrors writer.js: sorted by level, in MEGA_TRAINERS order', () => {
        const found = [
            { family: 'B', level: 30, item: 'ITEM_SCEPTILITE' },
            { family: 'A', level: 10, item: 'ITEM_BLAZIKENITE' },
        ];
        const assignment = megaAssignment(megaData({ found, levels: 40 }));

        expect(assignment.get('01')).toEqual({ item: 'ITEM_BLAZIKENITE' });   // lowest level first
        expect(assignment.get('02')).toEqual({ item: 'ITEM_SCEPTILITE' });
        expect(assignment.get('03')).toEqual({ hidden: true });               // nothing left to give
    });

    test('a trainer whose level is below the next stone is hidden, and the stone stays for a later one', () => {
        const found = [{ family: 'A', level: 50, item: 'ITEM_SCEPTILITE' }];
        const trainers = MEGA_TRAINERS.map((m, i) => ({ id: m.trainer, level: i === 0 ? 20 : 60 }));
        const assignment = megaAssignment({ wild: { foundMegaEvos: found }, trainers: { trainersData: trainers } });

        expect(assignment.get('01')).toEqual({ hidden: true });
        expect(assignment.get('02')).toEqual({ item: 'ITEM_SCEPTILITE' });
    });

    test('the hidden set it produces is the one gMegaTrainerHidden already uses', () => {
        // Same rule, one home: whatever this says is hidden must be what the flag table says.
        const { hiddenMegaIndices } = require('../../injector/modules/dataDrivenAndToggles');
        const data = megaData({ found: [{ family: 'A', level: 10, item: 'ITEM_SCEPTILITE' }], levels: 40 });
        const fromAssignment = [...megaAssignment(data)]
            .filter(([, v]) => v.hidden).map(([id]) => Number(id) - 1);

        expect(fromAssignment).toEqual(hiddenMegaIndices(data));
    });
});

describe('finding the placeholders', () => {
    test('reads every ITEM_MEGA_nn site out of the committed maps', () => {
        const sites = findMegaPlaceholders({ root: ROOT });
        // The base ships one ball per mega trainer that has one; every site must name a known trainer.
        expect(sites.length).toBeGreaterThan(0);
        for (const site of sites) {
            expect(MEGA_TRAINERS.some(m => m.id === site.megaId)).toBe(true);
            expect(site.map).toBe(MEGA_TRAINERS.find(m => m.id === site.megaId).map);
            expect(Number.isInteger(site.index)).toBe(true);
        }
        // Jagged Pass is the one the owner reported.
        expect(sites.some(s => s.map === 'JaggedPass' && s.megaId === '02')).toBe(true);
    });

    test('the committed maps really do carry ITEM_NONE there — the bug, in the source', () => {
        const sites = findMegaPlaceholders({ root: ROOT });
        const items = fs.readFileSync(path.resolve(ROOT, 'include', 'constants', 'items.h'), 'utf8');
        for (const site of sites) {
            expect(items).toMatch(new RegExp(`#define ITEM_MEGA_${site.megaId}\\s+ITEM_NONE`));
        }
    });
});

describe('writing the stone into the map', () => {
    // Jagged Pass is mega trainer 02, so it takes the SECOND stone — 01 (Route 111) takes the first.
    const found = [
        { family: 'A', level: 10, item: 'ITEM_BLAZIKENITE' },
        { family: 'B', level: 12, item: 'ITEM_SCEPTILITE' },
    ];

    test('writes the assigned stone over the placeholder', () => {
        const base = setup({ data: megaData({ found, levels: 40 }) });
        injectMegaMapItems(base.ctx, { maps: base.maps });

        expect(itemOf(base, 'JaggedPass', 1)).toBe(constants.require('ITEM_SCEPTILITE'));
    });

    test('touches nothing else in the event — the ball keeps its graphics, position and flag', () => {
        const base = setup({ data: megaData({ found, levels: 40 }) });
        const before = base.rom.readBytes(eventAt(base, 'JaggedPass', 1), OBJECT_EVENT.stride);
        injectMegaMapItems(base.ctx, { maps: base.maps });
        const after = base.rom.readBytes(eventAt(base, 'JaggedPass', 1), OBJECT_EVENT.stride);

        for (let i = 0; i < OBJECT_EVENT.stride; i++) {
            const isItemField = i === OBJECT_EVENT.sightOrBerryId || i === OBJECT_EVENT.sightOrBerryId + 1;
            if (!isItemField) expect(after[i]).toBe(before[i]);
        }
        // …and no other event moved.
        expect(itemOf(base, 'JaggedPass', 0)).toBe(1);
    });

    test('a HIDDEN mega trainer keeps ITEM_NONE — its ball never spawns, and writer.js leaves it alone', () => {
        const base = setup({ data: megaData({ found: [], levels: 40 }) });   // no stones at all
        const result = injectMegaMapItems(base.ctx, { maps: base.maps });

        expect(itemOf(base, 'JaggedPass', 1)).toBe(constants.require('ITEM_NONE'));
        expect(result.writes).toBe(0);
        expect(base.rom.journal).toHaveLength(0);
    });

    test('every write is tagged and lands on the item field of an object event', () => {
        const base = setup({ data: megaData({ found, levels: 40 }) });
        injectMegaMapItems(base.ctx, { maps: base.maps });

        const tableAt = base.offsetMap.offsetOf('JaggedPass_ObjectEvents');
        expect(base.rom.journal).toHaveLength(1);
        for (const entry of base.rom.journal) {
            expect(entry.tag).toContain(TAG);
            expect((entry.offset - tableAt) % OBJECT_EVENT.stride).toBe(OBJECT_EVENT.sightOrBerryId);
            expect(entry.length).toBe(2);
        }
    });

    test('an item the base does not define throws, naming the map', () => {
        const base = setup({ data: megaData({ found: [found[0], { family: 'B', level: 12, item: 'ITEM_NOT_A_STONE' }], levels: 40 }) });
        expect(() => injectMegaMapItems(base.ctx, { maps: base.maps })).toThrow(/JaggedPass[\s\S]*ITEM_NOT_A_STONE/);
    });
});

describe('the base has to be the build these maps came from', () => {
    test('an event whose graphics/position disagree with the map JSON is refused, and nothing is written', () => {
        const base = setup({ data: megaData({ found: [
            { family: 'A', level: 10, item: 'ITEM_BLAZIKENITE' },
            { family: 'B', level: 12, item: 'ITEM_SCEPTILITE' },
        ], levels: 40 }) });
        // Same map, but the JSON now claims the ball sits somewhere else.
        const moved = miniMap();
        moved.object_events[1].x = 99;

        expect(() => injectMegaMapItems(base.ctx, { maps: { JaggedPass: moved } }))
            .toThrow(/JaggedPass[\s\S]*(does not match|same build)/i);
        expect(base.rom.journal).toHaveLength(0);
    });

    test('a map the base does not export is refused rather than skipped', () => {
        const base = setup({});
        expect(() => injectMegaMapItems(base.ctx, { maps: { NotAMap: miniMap() } }))
            .toThrow(/NotAMap_ObjectEvents/);
    });
});
