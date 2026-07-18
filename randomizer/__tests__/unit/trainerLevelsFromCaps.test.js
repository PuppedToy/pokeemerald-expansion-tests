'use strict';

// T-149 — trainer levels are DERIVED from the caps SSOT (src/caps.c), not hard-coded, and the caps
// rival→Tabitha were shifted +1. These assert both the shift (in caps.c) and the end-to-end derivation
// through getTrainersData.

const fs = require('fs');
const path = require('path');
const { capLevelMap, parseLevelCaps } = require('../../bossCaps');
const { getTrainersData } = require('../../trainers');

const capsC = fs.readFileSync(path.resolve(__dirname, '../../../src/caps.c'), 'utf8');
const caps = capLevelMap(capsC);

const stubItems = new Proxy({}, { get: () => [] });
const tmList = Array.from({ length: 120 }, (_, i) => ({ moveId: 'MOVE_X', number: i + 1 }));

describe('T-149 — caps.c +1 shift (rival → Tabitha); Flannery+ untouched', () => {
    test.each([
        ['FLAG_DEFEATED_RIVAL_ROUTE103', 8],
        ['FLAG_DEFEATED_AQUA_WOODS', 11],
        ['FLAG_BADGE01_GET', 13],
        ['FLAG_RECOVERED_DEVON_GOODS', 16],
        ['FLAG_DEFEATED_RIVAL_RUSTBORO', 18],
        ['FLAG_BADGE02_GET', 20],
        ['FLAG_DELIVERED_STEVEN_LETTER', 23],
        ['FLAG_DELIVERED_DEVON_GOODS', 25],
        ['FLAG_ROUTE110_RIVAL_DEFEATED', 27],
        ['FLAG_DEFEATED_WALLY_MAUVILLE', 29],
        ['FLAG_BADGE03_GET', 30],
        ['FLAG_DEFEATED_TABITHA_MT_CHIMNEY', 33],
    ])('%s cap = %i', (flag, level) => {
        expect(caps[flag]).toBe(level);
    });

    test('Flannery (Badge 4) and everything after are unchanged', () => {
        expect(caps.FLAG_BADGE04_GET).toBe(36);
        expect(caps.FLAG_BADGE05_GET).toBe(39);
        expect(caps.FLAG_IS_CHAMPION).toBe(78);
    });

    test('the cap sequence is strictly increasing', () => {
        const levels = parseLevelCaps(capsC).map((c) => c.level);
        for (let i = 1; i < levels.length; i++) expect(levels[i]).toBeGreaterThan(levels[i - 1]);
    });
});

describe('T-149 — trainer levels resolve from the caps SSOT', () => {
    const td = getTrainersData(stubItems, tmList, {}, caps);
    const byId = Object.fromEntries(td.filter((t) => t.id).map((t) => [t.id, t]));

    test('every non-copy trainer has a resolved NUMERIC level (no CAP-flag strings leak out)', () => {
        const bad = td.filter((t) => t.id && !t.copy && typeof t.level !== 'number');
        expect(bad.map((t) => t.id)).toEqual([]);
    });

    test('each trainer tracks its segment cap (post-shift)', () => {
        expect(byId.TRAINER_ROXANNE_1.level).toBe(13);           // Badge 1: 12 → 13
        expect(byId.TRAINER_WATTSON_1.level).toBe(30);           // Badge 3: 29 → 30
        expect(byId.TRAINER_TABITHA_MT_CHIMNEY.level).toBe(33);  // Tabitha: 32 → 33
        expect(byId.TRAINER_FLANNERY_1.level).toBe(36);          // Badge 4: unchanged
        expect(byId.TRAINER_CHAMPION_STEVEN.level).toBe(78);     // Champion: unchanged
    });

    test('TRAINER_MAXIE_MT_CHIMNEY is gone (removed in T-149)', () => {
        expect(byId.TRAINER_MAXIE_MT_CHIMNEY).toBeUndefined();
    });

    test('levels are DERIVED, not hard-coded — a different cap map flows through', () => {
        jest.resetModules(); // fresh, unmutated trainersData
        const { getTrainersData: fresh } = require('../../trainers');
        const bumped = { ...caps, FLAG_BADGE01_GET: 99 };
        const td2 = fresh(stubItems, tmList, {}, bumped);
        expect(td2.find((t) => t.id === 'TRAINER_ROXANNE_1').level).toBe(99);
    });
});
