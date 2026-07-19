'use strict';

// T-162 — sweep ("batidas") wild-encounter generator. Plan is keyed by TEMPLATE species:
// wildPlan[templateSpecies] = [picked ids]. TDD-first for buildWildPlan.

const rng = require('../../rng');
const { buildWildPlan } = require('../../modules/wildModule');

function mk(id, family, tier, evo) {
    const isLC = evo === 'LC';
    const isNFE = evo === 'LC' || evo === 'NFE';
    const isFinal = evo === 'FINAL' || evo === 'SOLO';
    const type = evo === 'LC' ? 'EVO_TYPE_LC'
        : evo === 'NFE' ? 'EVO_TYPE_NFE'
        : evo === 'FINAL' ? 'EVO_TYPE_LAST_OF_2'
        : 'EVO_TYPE_SOLO';
    return {
        id, family, name: id.replace('SPECIES_', '').toLowerCase(), parsedTypes: ['NORMAL'],
        evolutionData: { type, isLC, isNFE, isFinal, isMega: false, megaEvos: [] },
        rating: { bestEvoTier: tier, tier: 'PU', bestEvoRating: 6, megaEvoTier: null, megaEvoRating: null },
        evolutions: [],
    };
}
const ruLcPool = (n, p = 'RULC') => Array.from({ length: n }, (_, i) => mk(`SPECIES_${p}${i}`, `P_FAMILY_${p}${i}`, 'RU', 'LC'));

const REPL_TYPES = {
    LC_AVERAGE: { replace: ['RU'], type: ['EVO_TYPE_LC'] },
    NFE_OR_LC_STRONG: { replace: ['UU'], type: ['EVO_TYPE_LC', 'EVO_TYPE_NFE'] },
};
const allPicks = (plan) => Object.values(plan).flat();

describe('buildWildPlan — deterministic (N=1)', () => {
    test('one pick per template, no duplicate picks when supply is ample', () => {
        rng.seed(1);
        const pool = ruLcPool(30);
        const wildConfig = {
            replacementTypes: REPL_TYPES,
            replacements: Object.fromEntries(pool.map(p => [p.id, 'LC_AVERAGE'])),
            maps: [
                { id: 'MAP_A', land: 'SPECIES_RULC0', surf: 'SPECIES_RULC1', old: 'SPECIES_RULC2', good: 'SPECIES_RULC3' },
                { id: 'MAP_B', land: 'SPECIES_RULC4' },
            ],
        };
        const { wildPlan } = buildWildPlan(pool, wildConfig, { pokemonPerZone: 1 });
        for (const t of ['SPECIES_RULC0', 'SPECIES_RULC1', 'SPECIES_RULC2', 'SPECIES_RULC3', 'SPECIES_RULC4']) {
            expect(wildPlan[t]).toHaveLength(1);
        }
        const ids = allPicks(wildPlan);
        expect(new Set(ids).size).toBe(ids.length); // no duplicates with ample supply
    });
});

describe('buildWildPlan — classic caps per method', () => {
    test('land=min(N,12), surf=min(N,5), old=min(N,2), good=min(N,3); distinct within a method', () => {
        rng.seed(2);
        const pool = ruLcPool(60);
        const wildConfig = {
            replacementTypes: REPL_TYPES,
            replacements: Object.fromEntries(pool.map(p => [p.id, 'LC_AVERAGE'])),
            maps: [{ id: 'MAP_A', land: 'SPECIES_RULC0', surf: 'SPECIES_RULC1', old: 'SPECIES_RULC2', good: 'SPECIES_RULC3' }],
        };
        const { wildPlan } = buildWildPlan(pool, wildConfig, { pokemonPerZone: 5 });
        expect(wildPlan['SPECIES_RULC0']).toHaveLength(5); // land (cap 12)
        expect(wildPlan['SPECIES_RULC1']).toHaveLength(5); // surf (cap 5)
        expect(wildPlan['SPECIES_RULC2']).toHaveLength(2); // old rod (cap 2)
        expect(wildPlan['SPECIES_RULC3']).toHaveLength(3); // good rod (cap 3)
        for (const t of ['SPECIES_RULC0', 'SPECIES_RULC1', 'SPECIES_RULC2', 'SPECIES_RULC3']) {
            expect(new Set(wildPlan[t]).size).toBe(wildPlan[t].length);
        }
    });
});

describe('buildWildPlan — overflow / regeneration', () => {
    test('demand > unique supply still fills every zone, spreads the duplicates', () => {
        rng.seed(3);
        const pool = ruLcPool(2); // only 2 RU|LC families, 3 distinct land templates each need 1
        const wildConfig = {
            replacementTypes: REPL_TYPES,
            replacements: { SPECIES_T_A: 'LC_AVERAGE', SPECIES_T_B: 'LC_AVERAGE', SPECIES_T_C: 'LC_AVERAGE' },
            maps: [
                { id: 'MAP_A', land: 'SPECIES_T_A' },
                { id: 'MAP_B', land: 'SPECIES_T_B' },
                { id: 'MAP_C', land: 'SPECIES_T_C' },
            ],
        };
        const { wildPlan } = buildWildPlan(pool, wildConfig, { pokemonPerZone: 1 });
        expect(wildPlan['SPECIES_T_A']).toHaveLength(1);
        expect(wildPlan['SPECIES_T_B']).toHaveLength(1);
        expect(wildPlan['SPECIES_T_C']).toHaveLength(1);
        const ids = allPicks(wildPlan);
        expect(ids).toHaveLength(3);
        expect(new Set(ids).size).toBe(2); // both unique species used (spread); the 3rd is a forced dup
    });
});

describe('buildWildPlan — super, statics, reserved', () => {
    test('super templates each get one pick; different templates get different families', () => {
        rng.seed(4);
        const pool = [
            ...ruLcPool(20),
            mk('SPECIES_SUPER_A', 'P_FAMILY_SUPERA', 'UU', 'NFE'),
            mk('SPECIES_SUPER_B', 'P_FAMILY_SUPERB', 'UU', 'NFE'),
        ];
        const wildConfig = {
            replacementTypes: REPL_TYPES,
            replacements: {
                SPECIES_SHELGON: 'NFE_OR_LC_STRONG',
                SPECIES_PUPITAR: 'NFE_OR_LC_STRONG',
                ...Object.fromEntries(ruLcPool(20).map(p => [p.id, 'LC_AVERAGE'])),
            },
            maps: [
                { id: 'MAP_A', land: 'SPECIES_RULC0', super: 'SPECIES_SHELGON' },
                { id: 'MAP_B', land: 'SPECIES_RULC1', super: 'SPECIES_SHELGON' },
                { id: 'MAP_C', land: 'SPECIES_RULC2', super: 'SPECIES_PUPITAR' },
            ],
        };
        const { wildPlan } = buildWildPlan(pool, wildConfig, { pokemonPerZone: 1 });
        expect(wildPlan['SPECIES_SHELGON']).toHaveLength(1); // one shared pick (broadcast at write time)
        expect(wildPlan['SPECIES_PUPITAR']).toHaveLength(1);
        expect(wildPlan['SPECIES_SHELGON'][0]).not.toBe(wildPlan['SPECIES_PUPITAR'][0]);
    });

    test('static-only maps add no plan entry; a reserved family is never picked', () => {
        rng.seed(5);
        const pool = ruLcPool(10);
        const wildConfig = {
            replacementTypes: REPL_TYPES,
            replacements: Object.fromEntries(pool.map(p => [p.id, 'LC_AVERAGE'])),
            maps: [
                { id: 'MAP_STATIC', special: 'SPECIES_REGIROCK' },
                { id: 'MAP_A', land: 'SPECIES_RULC0' },
            ],
        };
        const reserved = new Set(['P_FAMILY_RULC0']);
        const { wildPlan } = buildWildPlan(pool, wildConfig, { pokemonPerZone: 1, reservedFamilies: reserved });
        expect(wildPlan['SPECIES_REGIROCK']).toBeUndefined();
        expect(allPicks(wildPlan)).not.toContain('SPECIES_RULC0'); // reserved family excluded
    });
});

describe('buildWildPlan — deterministic RNG', () => {
    test('same seed → identical plan', () => {
        const pool = ruLcPool(40);
        const wildConfig = {
            replacementTypes: REPL_TYPES,
            replacements: Object.fromEntries(pool.map(p => [p.id, 'LC_AVERAGE'])),
            maps: [{ id: 'MAP_A', land: 'SPECIES_RULC0', surf: 'SPECIES_RULC1' }],
        };
        rng.seed(99);
        const a = buildWildPlan(pool, wildConfig, { pokemonPerZone: 5 });
        rng.seed(99);
        const b = buildWildPlan(pool, wildConfig, { pokemonPerZone: 5 });
        expect(a.wildPlan).toEqual(b.wildPlan);
    });
});
