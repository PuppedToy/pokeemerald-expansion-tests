'use strict';

// B-033 — Wally's Victory Road endgame roster must field its LEGEND + UBERS aces, and his ID continuity
// must flow VR (4 IDs + 2 aces) → Lilycove (4 VR IDs + 2 new UU) → Mauville (4 VR IDs + 2 Lilycove IDs).
// The T-106 inversion regressed this: it replaced VR's two Juan-preset aces (legend + ubers) with WALLY_5-6
// UU IDs, so VR carried six propagating IDs and no aces. These tests reproduce that (they FAIL before the
// fix) and lock the intended structure.

const rng = require('../../rng');
const { TIER_UBERS, TIER_LEGEND } = require('../../constants');
const { getTrainersData, CONTINUITY_GROUPS, hoistAuthoritativeAppearances } = require('../../trainers.js');

// Build the (hoisted) trainer definitions. getTrainersData only needs itemAssignments to fill trainer BAGS;
// the Wally rosters we assert on use static bags, so a stub that returns an item list for every key is enough.
rng.seed(1);
const stubItems = new Proxy({}, { get: () => Array(12).fill('ITEM_POTION') });
const _trainersData = getTrainersData(stubItems, [], {});

const byId = id => _trainersData.find(t => t.id === id);
const idxOf = id => _trainersData.findIndex(t => t.id === id);
// A slot's declared id (favouriteId lives on the trainer, the rest on the slots).
const teamIds = t => (t.team || []).map(s => s.id).filter(Boolean);
const hasAbsoluteTier = (t, tier) => (t.team || []).some(s => (s.absoluteTier || []).includes(tier));

describe('B-033 — Wally Victory Road fields its legend + ubers aces', () => {
    const vr = byId('TRAINER_WALLY_VR_1');

    test('VR carries a LEGEND ace and an UBERS ace', () => {
        expect(hasAbsoluteTier(vr, TIER_LEGEND)).toBe(true);
        expect(hasAbsoluteTier(vr, TIER_UBERS)).toBe(true);
    });

    test('VR is the source of exactly 4 continuity IDs (WALLY_1-4), not 6', () => {
        const ids = new Set([vr.favouriteId, ...teamIds(vr)].filter(Boolean));
        expect(ids.has('WALLY_1')).toBe(true); // the favourite Mega Gardevoir anchor
        expect(ids.has('WALLY_2')).toBe(true);
        expect(ids.has('WALLY_3')).toBe(true);
        expect(ids.has('WALLY_4')).toBe(true);
        // WALLY_5-6 are born at Lilycove, NOT at Victory Road.
        expect(ids.has('WALLY_5')).toBe(false);
        expect(ids.has('WALLY_6')).toBe(false);
    });
});

describe('B-033 — the UU IDs (WALLY_5-6) are born at Lilycove and echoed at Mauville', () => {
    const lily = byId('TRAINER_WALLY_LILYCOVE');
    const mau = byId('TRAINER_WALLY_MAUVILLE');
    const REPEAT = s => s.special != null && s.special !== undefined && !!s.special;

    test('Lilycove DEFINES WALLY_5-6 (non-repeat) and REPEATS the 4 VR IDs', () => {
        const defined = (lily.team || []).filter(s => !s.special).map(s => s.id);
        expect(defined).toEqual(expect.arrayContaining(['WALLY_5', 'WALLY_6']));
        for (const id of ['WALLY_1', 'WALLY_2', 'WALLY_3', 'WALLY_4']) {
            const slot = (lily.team || []).find(s => s.id === id);
            expect(slot && !!slot.special).toBe(true); // a REPEAT of the VR id
        }
    });

    test('Mauville echoes all six IDs (WALLY_1-6) as repeats', () => {
        for (const id of ['WALLY_1', 'WALLY_2', 'WALLY_3', 'WALLY_4', 'WALLY_5', 'WALLY_6']) {
            const slot = (mau.team || []).find(s => s.id === id);
            expect(slot && !!slot.special).toBe(true);
        }
    });
});

describe('B-033 — build order lets each ID be stored before it is echoed', () => {
    test('the hoisted build order is Victory Road → Lilycove → Mauville', () => {
        // VR (defines WALLY_1-4) before Lilycove (defines WALLY_5-6, echoes 1-4) before Mauville (echoes 1-6).
        expect(idxOf('TRAINER_WALLY_VR_1')).toBeLessThan(idxOf('TRAINER_WALLY_LILYCOVE'));
        expect(idxOf('TRAINER_WALLY_LILYCOVE')).toBeLessThan(idxOf('TRAINER_WALLY_MAUVILLE'));
    });

    test('a continuity group makes Lilycove authoritative over Mauville (so WALLY_5-6 store first)', () => {
        // Simulate the groups on a canonical-order fixture; the Wally groups must yield VR → Lilycove → Mauville.
        const wallyGroups = CONTINUITY_GROUPS.filter(g =>
            /WALLY/.test(g.auth) || (g.members || []).some(m => /WALLY/.test(m)));
        const data = [
            { id: 'TRAINER_WALLY_MAUVILLE' }, { id: 'X' }, { id: 'TRAINER_WALLY_LILYCOVE' }, { id: 'Y' }, { id: 'TRAINER_WALLY_VR_1' },
        ];
        hoistAuthoritativeAppearances(data, wallyGroups);
        const order = data.map(t => t.id).filter(id => id.startsWith('TRAINER_WALLY'));
        expect(order).toEqual(['TRAINER_WALLY_VR_1', 'TRAINER_WALLY_LILYCOVE', 'TRAINER_WALLY_MAUVILLE']);
    });
});
