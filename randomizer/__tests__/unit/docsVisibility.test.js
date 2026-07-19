'use strict';

// T-163 — pipeline-side docs-visibility defaults, normalization and the wildPokes redactor.

const { DOCS_VISIBILITY_DEFAULT, normalizeDocsVisibility, redactWildPokes } = require('../../docsVisibility');

const on = () => ({ ...DOCS_VISIBILITY_DEFAULT });   // everything visible (defaults, showIVs off)

describe('normalizeDocsVisibility', () => {
    test('fills defaults for a missing object', () => {
        const dv = normalizeDocsVisibility(undefined);
        expect(dv.showTrainers).toBe(true);
        expect(dv.showIVs).toBe(false);
        expect(dv.showExactPositions).toBe(false);
        expect(dv.hidePokemonCount).toBe(1);
    });

    test('merges provided values over the defaults', () => {
        const dv = normalizeDocsVisibility({ showBosses: false, showIVs: true, hidePokemonCount: 3 });
        expect(dv.showBosses).toBe(false);
        expect(dv.showIVs).toBe(true);
        expect(dv.showNatures).toBe(true);      // untouched default
        expect(dv.hidePokemonCount).toBe(3);
    });

    test('honours the legacy bare showExactPositions option when the nested key is absent', () => {
        expect(normalizeDocsVisibility(undefined, true).showExactPositions).toBe(true);
        expect(normalizeDocsVisibility({}, true).showExactPositions).toBe(true);
        // the nested value wins over the legacy one
        expect(normalizeDocsVisibility({ showExactPositions: false }, true).showExactPositions).toBe(false);
    });

    test('clamps hidePokemonCount to 1..5', () => {
        expect(normalizeDocsVisibility({ hidePokemonCount: 0 }).hidePokemonCount).toBe(1);
        expect(normalizeDocsVisibility({ hidePokemonCount: 99 }).hidePokemonCount).toBe(5);
        expect(normalizeDocsVisibility({ hidePokemonCount: 'x' }).hidePokemonCount).toBe(1);
    });
});

// Synthetic wildPokes maps mirroring writerDocs.js assembly output.
function makeMaps() {
    return [
        { id: 'STARTERS', special1: 'SPECIES_A', special2: 'SPECIES_B', special3: 'SPECIES_C' },
        { id: 'STARTER_EXTRA', special1: 'SPECIES_D' },
        { id: 'MAP_ROUTE101', land: 'SPECIES_L', surf: 'SPECIES_S', old: 'SPECIES_O', good: 'SPECIES_G', super: 'SPECIES_SU',
          __methodTemplates: { land: 'T_LAND', surf: 'T_SURF', old: 'T_OLD', good: 'T_GOOD', super: 'T_SUPER' } },
        { id: 'BOSS_ROXANNE_REWARD', label: 'Roxanne Reward', boss: true, special1: 'SPECIES_R' },
        { id: 'MAP_DESERT_RUINS', label: 'Desert Ruins', staticEncounter: true, special1: 'SPECIES_REGIROCK' },
        { id: 'MAP_SKY_PILLAR_TOP', label: 'Sky Pillar Top', legendaryEncounter: true, special1: 'SPECIES_RAYQUAZA' },
    ];
}
const byId = (maps) => new Set(maps.map(m => m.id));

describe('redactWildPokes', () => {
    test('all-visible defaults keep every entry and strip the internal template map', () => {
        const out = redactWildPokes(makeMaps(), on(), { wildPlan: {} });
        expect(byId(out)).toEqual(byId(makeMaps()));
        expect(out.every(m => m.__methodTemplates === undefined)).toBe(true);
        expect(out.find(m => m.id === 'MAP_ROUTE101').land).toBe('SPECIES_L');
    });

    test('starters are always kept', () => {
        const dv = { ...on(), showWildEncounters: false, showTrainers: false };
        const out = redactWildPokes(makeMaps(), dv, { wildPlan: {} });
        expect(byId(out).has('STARTERS')).toBe(true);
        expect(byId(out).has('STARTER_EXTRA')).toBe(true);
    });

    test('reward cards are gated by showTrainers && showBosses && showRewards', () => {
        const keep = redactWildPokes(makeMaps(), on(), { wildPlan: {} });
        expect(byId(keep).has('BOSS_ROXANNE_REWARD')).toBe(true);
        for (const off of [{ showRewards: false }, { showBosses: false }, { showTrainers: false }]) {
            const out = redactWildPokes(makeMaps(), { ...on(), ...off }, { wildPlan: {} });
            expect(byId(out).has('BOSS_ROXANNE_REWARD')).toBe(false);
        }
    });

    test('static toggles omit the matching entry entirely', () => {
        const noLegend = redactWildPokes(makeMaps(), { ...on(), showLegendaryStatic: false }, { wildPlan: {} });
        expect(byId(noLegend).has('MAP_SKY_PILLAR_TOP')).toBe(false);
        expect(byId(noLegend).has('MAP_DESERT_RUINS')).toBe(true);
        const noStatic = redactWildPokes(makeMaps(), { ...on(), showNonLegendaryStatic: false }, { wildPlan: {} });
        expect(byId(noStatic).has('MAP_DESERT_RUINS')).toBe(false);
        expect(byId(noStatic).has('MAP_SKY_PILLAR_TOP')).toBe(true);
    });

    test('showWildEncounters=false keeps only starters + gated rewards (zones and statics dropped)', () => {
        const out = redactWildPokes(makeMaps(), { ...on(), showWildEncounters: false }, { wildPlan: {} });
        expect(byId(out)).toEqual(new Set(['STARTERS', 'STARTER_EXTRA', 'BOSS_ROXANNE_REWARD']));
    });

    test('a per-method toggle drops the species and records a placeholder; super rod is numbered', () => {
        const wildPlan = { T_LAND: ['x', 'y', 'y', 'z'], T_SUPER: ['a', 'b'] };   // land distinct=3, super distinct=2
        const dv = { ...on(), showGrass: false, showSuperRod: false };
        const route = redactWildPokes(makeMaps(), dv, { wildPlan }).find(m => m.id === 'MAP_ROUTE101');
        expect(route.land).toBeUndefined();
        expect(route.super).toBeUndefined();
        expect(route.hiddenMethods.land).toEqual({ kind: 'count', count: 3 });
        expect(route.hiddenMethods.super).toEqual({ kind: 'superNumbered', count: 2 });
        expect(route.surf).toBe('SPECIES_S');   // still visible, no hiddenMethods entry
        expect(route.hiddenMethods.surf).toBeUndefined();
    });

    test('a hidden method with no plan entry falls back to a count of 1 (deterministic)', () => {
        const route = redactWildPokes(makeMaps(), { ...on(), showSurf: false }, { wildPlan: {} }).find(m => m.id === 'MAP_ROUTE101');
        expect(route.surf).toBeUndefined();
        expect(route.hiddenMethods.surf).toEqual({ kind: 'count', count: 1 });
    });

    test('is pure — never mutates the input maps', () => {
        const maps = makeMaps();
        redactWildPokes(maps, { ...on(), showGrass: false }, { wildPlan: {} });
        expect(maps.find(m => m.id === 'MAP_ROUTE101').land).toBe('SPECIES_L');
    });
});
