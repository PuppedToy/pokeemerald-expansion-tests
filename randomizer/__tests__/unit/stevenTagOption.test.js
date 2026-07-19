'use strict';

// T-165 — the "Disable Steven tag battle" option (config.disableStevenTagBattle) swaps the Mossdeep
// Space Center multi_2_vs_2 (player + Steven vs Maxie + Tabitha) for a SOLO boss vs
// TRAINER_TABITHA_MOSSDEEP_NO_TAG. Gating lives in getTrainersData:
//   OFF (default) → the no-tag boss is dropped (byte-identical: it never resolves, consumes no rng).
//   ON            → the tag trio (both enemies + the Steven ally) is dropped instead.

const fs = require('fs');
const path = require('path');
const rng = require('../../rng');
const { capLevelMap } = require('../../bossCaps');
const { getTrainersData } = require('../../trainers');

const caps = capLevelMap(fs.readFileSync(path.resolve(__dirname, '../../../src/caps.c'), 'utf8'));
const stubItems = new Proxy({}, { get: () => [] });
const tmList = Array.from({ length: 120 }, (_, i) => ({ moveId: 'MOVE_X', number: i + 1 }));

const idSet = (cfg) => { rng.seed(1); return new Set(getTrainersData(stubItems, tmList, cfg, caps).map(t => t.id)); };

const TAG_TRIO = ['TRAINER_MAXIE_MOSSDEEP', 'TRAINER_TABITHA_MOSSDEEP', 'PARTNER_STEVEN'];
const NO_TAG = 'TRAINER_TABITHA_MOSSDEEP_NO_TAG';

describe('disableStevenTagBattle gating (T-165)', () => {
    test('OFF (default): the tag trio is present and the no-tag Tabitha is absent', () => {
        const s = idSet({});
        for (const id of TAG_TRIO) expect(s.has(id)).toBe(true);
        expect(s.has(NO_TAG)).toBe(false);
    });

    test('ON: the no-tag Tabitha is present and the whole tag trio is dropped', () => {
        const s = idSet({ disableStevenTagBattle: true });
        expect(s.has(NO_TAG)).toBe(true);
        for (const id of TAG_TRIO) expect(s.has(id)).toBe(false);
    });

    test('ON: the no-tag Tabitha is a normal Magma-Admin boss with a full 6-mon team and no partner weather', () => {
        rng.seed(1);
        const td = getTrainersData(stubItems, tmList, { disableStevenTagBattle: true }, caps);
        const t = td.find(x => x.id === NO_TAG);
        expect(t).toBeDefined();
        expect(t.isBoss).toBe(true);
        expect(t.class).toBe('Magma Admin');
        expect(t.abusePartnerWeather).toBeUndefined();
        expect(typeof t.level).toBe('number');
        expect(t.team).toHaveLength(6);
        // it sits at the Space Center story position (right after the space-center grunts)
        expect(typeof t.displayOrder).toBe('number');
    });
});
