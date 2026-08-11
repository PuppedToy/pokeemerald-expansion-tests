'use strict';

// T-268 — the docs' encounter list follows the player's progression. Route 116 only opens once
// Roxanne is beaten, so it must be listed AFTER her reward, not between Route 115 and it.

const { applyDocMapOrder } = require('../../docsMapOrder');

// The wild.js data order, trimmed to the entries these assertions walk over.
const WILD_ORDER = [
    'MAP_ROUTE104', 'MAP_PETALBURG_WOODS', 'MAP_ROUTE115', 'MAP_ROUTE116', 'MAP_ROUTE106',
    'MAP_GRANITE_CAVE', 'MAP_ROUTE109', 'MAP_ROUTE110', 'MAP_ROUTE117', 'MAP_ROUTE118',
    'MAP_NEW_MAUVILLE', 'MAP_ROUTE111', 'MAP_ROUTE112', 'MAP_ROUTE114', 'MAP_DESERT_RUINS',
    'MAP_ISLAND_CAVE', 'MAP_ROUTE119', 'MAP_ROUTE120', 'MAP_ANCIENT_TOMB', 'MAP_ROUTE121',
    'MAP_ROUTE123', 'MAP_ROUTE124', 'MAP_ROUTE125', 'MAP_ROUTE127', 'MAP_ROUTE129',
    'MAP_SKY_PILLAR_TOP',
];

// pokeRewardReplacements is indexed by boss; only `.id` is read.
const REWARDS = Array.from({ length: 11 }, (_, i) => ({ id: `SPECIES_REWARD_${i}` }));

const order = () => applyDocMapOrder(WILD_ORDER.map(id => ({ id })), REWARDS).map(m => m.id);

const after = (ids, id) => ids[ids.indexOf(id) + 1];

describe('applyDocMapOrder', () => {
    test('Roxanne Reward follows Route 115, and Route 116 follows Roxanne', () => {
        const ids = order();
        expect(after(ids, 'MAP_ROUTE115')).toBe('BOSS_ROXANNE_REWARD');
        expect(after(ids, 'BOSS_ROXANNE_REWARD')).toBe('MAP_ROUTE116');
        expect(after(ids, 'MAP_ROUTE116')).toBe('MAP_ROUTE106');
    });

    test('Route 116 appears exactly once', () => {
        const ids = order();
        expect(ids.filter(id => id === 'MAP_ROUTE116')).toHaveLength(1);
    });

    test('every other boss reward keeps its anchor', () => {
        const ids = order();
        expect(after(ids, 'MAP_ROUTE106')).toBe('BOSS_BRAWLY_REWARD');
        expect(after(ids, 'MAP_ROUTE109')).toBe('BOSS_SLATEPORT_GRUNTS_REWARD');
        expect(after(ids, 'MAP_ROUTE118')).toBe('BOSS_WATTSON_REWARD');
        expect(after(ids, 'MAP_ROUTE119')).toBe('BOSS_SHELLY_REWARD');
        expect(after(ids, 'MAP_ROUTE121')).toBe('BOSS_WALLY_LILYCOVE');
        expect(after(ids, 'MAP_ROUTE124')).toBe('BOSS_TATE_LIZA_REWARD');
    });

    test('the Route 114 group ends up Flannery, Desert Ruins, Norman, Island Cave, New Mauville', () => {
        const ids = order();
        expect(ids.slice(ids.indexOf('MAP_ROUTE114'), ids.indexOf('MAP_ROUTE114') + 6)).toEqual([
            'MAP_ROUTE114', 'BOSS_FLANNERY_REWARD', 'MAP_DESERT_RUINS', 'BOSS_NORMAN_REWARD',
            'MAP_ISLAND_CAVE', 'MAP_NEW_MAUVILLE',
        ]);
    });

    test('the Route 129 group ends up Sky Pillar, Juan, Route 123', () => {
        const ids = order();
        expect(ids.slice(ids.indexOf('MAP_ROUTE129'))).toEqual([
            'MAP_ROUTE129', 'MAP_SKY_PILLAR_TOP', 'BOSS_JUAN_REWARD', 'MAP_ROUTE123',
        ]);
    });

    test('the Route 120 group ends up Winona, Ancient Tomb', () => {
        const ids = order();
        expect(ids.slice(ids.indexOf('MAP_ROUTE120'), ids.indexOf('MAP_ROUTE120') + 3)).toEqual([
            'MAP_ROUTE120', 'BOSS_WINONA_REWARD', 'MAP_ANCIENT_TOMB',
        ]);
    });
});
