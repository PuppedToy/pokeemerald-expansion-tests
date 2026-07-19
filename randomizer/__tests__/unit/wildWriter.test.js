'use strict';

// T-162 — structural wild_encounters.json writer. The plan is keyed by TEMPLATE species; the writer
// re-fills every JSON slot currently holding a template with that template's picks (distributed to
// equalise probability), preserving levels/rates. Mirrors the legacy substitution but writes N species.

const { applyWildPlanToEncounters } = require('../../writer');

function slot(species, lvl = 10) { return { min_level: lvl, max_level: lvl, species }; }
function slots(species, n, lvl) { return Array.from({ length: n }, () => slot(species, lvl)); }

function makeGroup() {
    return {
        label: 'gWildMonHeaders',
        fields: [
            { type: 'land_mons', encounter_rates: [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1] },
            { type: 'water_mons', encounter_rates: [60, 30, 5, 4, 1] },
            { type: 'rock_smash_mons', encounter_rates: [60, 30, 5, 4, 1] },
            { type: 'fishing_mons', encounter_rates: [70, 30, 60, 20, 20, 40, 40, 15, 4, 1],
              groups: { old_rod: [0, 1], good_rod: [2, 3, 4], super_rod: [5, 6, 7, 8, 9] } },
        ],
        encounters: [
            {
                map: 'MAP_A', base_label: 'A',
                land_mons: { encounter_rate: 20, mons: slots('SPECIES_T_LAND', 12, 15) },
                water_mons: { encounter_rate: 4, mons: slots('SPECIES_T_SURF', 5, 39) },
                fishing_mons: { encounter_rate: 30, mons: [
                    slot('SPECIES_T_OLD', 7), slot('SPECIES_T_OLD', 7),
                    slot('SPECIES_T_GOOD', 33), slot('SPECIES_T_GOOD', 33), slot('SPECIES_T_GOOD', 33),
                    slot('SPECIES_T_SUPER', 48), slot('SPECIES_T_SUPER', 48), slot('SPECIES_T_SUPER', 48),
                    slot('SPECIES_T_SUPER', 48), slot('SPECIES_T_SUPER', 48),
                ] },
            },
            // Second map sharing the SAME super template → both must end up with the same species.
            { map: 'MAP_B', base_label: 'B', fishing_mons: { encounter_rate: 30, mons: [
                slot('SPECIES_KEEP_OLD', 7), slot('SPECIES_KEEP_OLD', 7),
                slot('SPECIES_KEEP_GOOD', 33), slot('SPECIES_KEEP_GOOD', 33), slot('SPECIES_KEEP_GOOD', 33),
                slot('SPECIES_T_SUPER', 48), slot('SPECIES_T_SUPER', 48), slot('SPECIES_T_SUPER', 48),
                slot('SPECIES_T_SUPER', 48), slot('SPECIES_T_SUPER', 48),
            ] } },
            { map: 'MAP_UNTOUCHED', base_label: 'U', land_mons: { encounter_rate: 20, mons: slots('SPECIES_KEEP', 12, 5) } },
        ],
    };
}

function summedRates(mons, rates) {
    const bySpecies = {};
    mons.forEach((m, i) => { bySpecies[m.species] = (bySpecies[m.species] || 0) + rates[i]; });
    return bySpecies;
}

describe('applyWildPlanToEncounters', () => {
    test('fills each template\'s slots from its picks, preserves levels, broadcasts a shared super', () => {
        const group = makeGroup();
        const plan = {
            SPECIES_T_LAND: ['SPECIES_A', 'SPECIES_B', 'SPECIES_C', 'SPECIES_D', 'SPECIES_E'],
            SPECIES_T_SURF: ['SPECIES_P', 'SPECIES_Q'],
            SPECIES_T_OLD: ['SPECIES_O1', 'SPECIES_O2'],
            SPECIES_T_GOOD: ['SPECIES_G1', 'SPECIES_G2', 'SPECIES_G3'],
            SPECIES_T_SUPER: ['SPECIES_S'],
        };
        applyWildPlanToEncounters(group, plan);
        const a = group.encounters.find(e => e.map === 'MAP_A');

        expect(new Set(a.land_mons.mons.map(m => m.species))).toEqual(new Set(['SPECIES_A', 'SPECIES_B', 'SPECIES_C', 'SPECIES_D', 'SPECIES_E']));
        expect(a.land_mons.mons.every(m => m.min_level === 15)).toBe(true);
        expect(new Set(a.water_mons.mons.map(m => m.species))).toEqual(new Set(['SPECIES_P', 'SPECIES_Q']));
        expect(a.water_mons.mons.every(m => m.min_level === 39)).toBe(true);

        const fish = a.fishing_mons.mons;
        expect([fish[0].species, fish[1].species].sort()).toEqual(['SPECIES_O1', 'SPECIES_O2']);
        expect(fish[0].min_level).toBe(7);
        expect(new Set([fish[2].species, fish[3].species, fish[4].species])).toEqual(new Set(['SPECIES_G1', 'SPECIES_G2', 'SPECIES_G3']));
        expect(fish.slice(5).every(m => m.species === 'SPECIES_S' && m.min_level === 48)).toBe(true);

        // The shared super template on MAP_B gets the SAME species (broadcast by location).
        const b = group.encounters.find(e => e.map === 'MAP_B');
        expect(b.fishing_mons.mons.slice(5).every(m => m.species === 'SPECIES_S')).toBe(true);
        // MAP_B's own old/good rods (not in the plan) are untouched.
        expect(b.fishing_mons.mons[0].species).toBe('SPECIES_KEEP_OLD');
        expect(b.fishing_mons.mons[2].species).toBe('SPECIES_KEEP_GOOD');
    });

    test('distributes species to equalise summed encounter probability (equiprobable)', () => {
        const group = makeGroup();
        applyWildPlanToEncounters(group, { SPECIES_T_LAND: ['SPECIES_A', 'SPECIES_B', 'SPECIES_C', 'SPECIES_D', 'SPECIES_E'] });
        const a = group.encounters.find(e => e.map === 'MAP_A');
        const rates = group.fields.find(f => f.type === 'land_mons').encounter_rates;
        const vals = Object.values(summedRates(a.land_mons.mons, rates));
        expect(vals).toHaveLength(5);
        expect(Math.max(...vals) - Math.min(...vals)).toBeLessThanOrEqual(4); // ≈ 20% each
    });

    test('species not in the plan are untouched', () => {
        const group = makeGroup();
        applyWildPlanToEncounters(group, { SPECIES_T_LAND: ['SPECIES_A'] });
        const untouched = group.encounters.find(e => e.map === 'MAP_UNTOUCHED');
        expect(untouched.land_mons.mons.every(m => m.species === 'SPECIES_KEEP')).toBe(true);
    });
});
