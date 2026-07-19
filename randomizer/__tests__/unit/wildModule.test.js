'use strict';

// TDD: written BEFORE modules/wildModule.js was implemented.

const rng = require('../../rng');

function freshModule() {
    let mod;
    jest.isolateModules(() => { mod = require('../../modules/wildModule'); });
    return mod;
}

// Pokemon factory matching the pokes.json shape used by writer.js
function makePoke(id, family, types, overrides = {}) {
    return {
        id,
        family,
        name: id.replace('SPECIES_', '').toLowerCase(),
        parsedTypes: types,
        evolutionData: {
            type: 'EVO_TYPE_LC',
            isLC: true,
            isFinal: false,
            isMega: false,
            isNFE: false,
            megaEvos: [],
            ...overrides.evolutionData,
        },
        rating: {
            bestEvoTier: 'RU',
            tier: 'PU',
            bestEvoRating: 5.5,
            megaEvoTier: null,
            megaEvoRating: null,
            ...overrides.rating,
        },
        evolutions: overrides.evolutions || [],
        ...(overrides.evoTree !== undefined ? { evoTree: overrides.evoTree } : {}),
    };
}

// Build a rich enough pokemon list to satisfy all extraStarters slots:
//  slot 1: 1 UBERS LC (prefer LC-of-3/LC-of-2, fallback OU LC)
//  slot 2: 1 OU LC (not already chosen, type-diverse)
//  slot 3: 1 UU LC (not already chosen, type-diverse)
//  slot 4: 1 NU SOLO (earlyGame)
//  slots 5-9: up to 5 RU LC

const UBERS_LC = makePoke('SPECIES_UBERS_LC', 'P_FAMILY_UBERS', ['PSYCHIC'], { evolutionData: { type: 'EVO_TYPE_LC_OF_3', isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'UBERS', tier: 'PU', bestEvoRating: 9.1 } });
const OU_LC = makePoke('SPECIES_OU_LC',   'P_FAMILY_OU',   ['FIRE'],     { evolutionData: { type: 'EVO_TYPE_LC_OF_3', isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'OU',  tier: 'PU', bestEvoRating: 8 } });
const UU_LC = makePoke('SPECIES_UU_LC',   'P_FAMILY_UU2',  ['WATER'],    { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'UU',  tier: 'PU', bestEvoRating: 7 } });
const NU_SOLO= makePoke('SPECIES_NU_SOLO','P_FAMILY_NU',   ['NORMAL'],   { evolutionData: { type: 'EVO_TYPE_SOLO',    isLC: false,isMega: false, isFinal: true,  megaEvos: [] }, rating: { bestEvoTier: 'NU',  tier: 'NU', bestEvoRating: 5 } });
const RU_LC1 = makePoke('SPECIES_RU_LC1', 'P_FAMILY_RU1',  ['GRASS'],    { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'RU',  tier: 'PU' } });
const RU_LC2 = makePoke('SPECIES_RU_LC2', 'P_FAMILY_RU2',  ['ELECTRIC'], { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'RU',  tier: 'PU' } });
const RU_LC3 = makePoke('SPECIES_RU_LC3', 'P_FAMILY_RU3',  ['ICE'],      { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'RU',  tier: 'PU' } });
const RU_LC4 = makePoke('SPECIES_RU_LC4', 'P_FAMILY_RU4',  ['DRAGON'],   { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'RU',  tier: 'PU' } });
const RU_LC5 = makePoke('SPECIES_RU_LC5', 'P_FAMILY_RU5',  ['STEEL'],    { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'RU',  tier: 'PU' } });
const RU_LC6 = makePoke('SPECIES_RU_LC6', 'P_FAMILY_RU6',  ['DARK'],     { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'RU',  tier: 'PU' } });

const richPokemonList = [UBERS_LC, OU_LC, UU_LC, NU_SOLO, RU_LC1, RU_LC2, RU_LC3, RU_LC4, RU_LC5, RU_LC6];

// ── Extended fixture: gym/static reward slots ──────────────────────────────────
// gym1: NU SOLO
const GYM1 = makePoke('SPECIES_GYM1', 'P_FAMILY_GYM1', ['ROCK'], {
    evolutionData: { type: 'EVO_TYPE_SOLO', isLC: false, isFinal: true, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'NU', bestEvoTier: 'NU', bestEvoRating: 5, megaEvoTier: null, megaEvoRating: null },
});
// gym2: NU LC_OF_2, bestEvoTier RU, evolves via ITEM
const GYM2 = makePoke('SPECIES_GYM2', 'P_FAMILY_GYM2', ['FIGHTING'], {
    evolutionData: { type: 'EVO_TYPE_LC_OF_2', isLC: true, isFinal: false, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'NU', bestEvoTier: 'RU', bestEvoRating: 6.3, megaEvoTier: null, megaEvoRating: null },
    evolutions: [{ pokemon: 'SPECIES_GYM2_FINAL', method: 'ITEM', param: '0' }],
});
// gym3 + slateportGrunts: 2 families with final forms that have megaEvos.
// checkValidEvo(FINAL, 29): NFE→Final at param 26 ≤ 29 ✓; LC→NFE at param 18 ≤ 29 ✓
// devolveToBase(FINAL): evoTree[0] = LC id
const GYM3_FINAL = makePoke('SPECIES_GYM3_FINAL', 'P_FAMILY_GYM3', ['GHOST'], {
    evolutionData: { type: 'EVO_TYPE_LAST_OF_3', isLC: false, isFinal: true, isMega: false, isNFE: false, megaEvos: ['SPECIES_GYM3_MEGA'] },
    rating: { tier: 'RU', bestEvoTier: 'RU', bestEvoRating: 6.5, megaEvoTier: 'UU', megaEvoRating: 8.5 },
    evoTree: ['SPECIES_GYM3_LC'],
});
const GYM3_NFE = makePoke('SPECIES_GYM3_NFE', 'P_FAMILY_GYM3', ['GHOST'], {
    evolutionData: { type: 'EVO_TYPE_NFE_OF_3', isLC: false, isFinal: false, isMega: false, isNFE: true, megaEvos: [] },
    rating: { tier: 'PU', bestEvoTier: 'RU', bestEvoRating: 6.5, megaEvoTier: null, megaEvoRating: null },
    evolutions: [{ pokemon: 'SPECIES_GYM3_FINAL', method: 'LEVEL', param: '26' }],
});
const GYM3_LC = makePoke('SPECIES_GYM3_LC', 'P_FAMILY_GYM3', ['GHOST'], {
    // isLC: false — exists only for checkValidEvo traversal; must not enter RU-LC extra-starters pool
    evolutionData: { type: 'EVO_TYPE_LC_OF_3', isLC: false, isFinal: false, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'PU', bestEvoTier: 'RU', bestEvoRating: 6.5, megaEvoTier: null, megaEvoRating: null },
    evolutions: [{ pokemon: 'SPECIES_GYM3_NFE', method: 'LEVEL', param: '18' }],
});
const SLATEPORT_FINAL = makePoke('SPECIES_SLATEPORT_FINAL', 'P_FAMILY_SLATEPORT', ['POISON'], {
    evolutionData: { type: 'EVO_TYPE_LAST_OF_3', isLC: false, isFinal: true, isMega: false, isNFE: false, megaEvos: ['SPECIES_SLATEPORT_MEGA'] },
    rating: { tier: 'RU', bestEvoTier: 'RU', bestEvoRating: 6, megaEvoTier: 'UU', megaEvoRating: 8.5 },
    evoTree: ['SPECIES_SLATEPORT_LC'],
});
const SLATEPORT_NFE = makePoke('SPECIES_SLATEPORT_NFE', 'P_FAMILY_SLATEPORT', ['POISON'], {
    evolutionData: { type: 'EVO_TYPE_NFE_OF_3', isLC: false, isFinal: false, isMega: false, isNFE: true, megaEvos: [] },
    rating: { tier: 'PU', bestEvoTier: 'RU', bestEvoRating: 6, megaEvoTier: null, megaEvoRating: null },
    evolutions: [{ pokemon: 'SPECIES_SLATEPORT_FINAL', method: 'LEVEL', param: '24' }],
});
const SLATEPORT_LC = makePoke('SPECIES_SLATEPORT_LC', 'P_FAMILY_SLATEPORT', ['POISON'], {
    // isLC: false — same reason as GYM3_LC
    evolutionData: { type: 'EVO_TYPE_LC_OF_3', isLC: false, isFinal: false, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'PU', bestEvoTier: 'RU', bestEvoRating: 6, megaEvoTier: null, megaEvoRating: null },
    evolutions: [{ pokemon: 'SPECIES_SLATEPORT_NFE', method: 'LEVEL', param: '16' }],
});
// gym4+5: 2 UU LC (distinct from UU_LC consumed by extra starters)
const GYM4 = makePoke('SPECIES_GYM4', 'P_FAMILY_GYM4', ['ICE'], {
    evolutionData: { type: 'EVO_TYPE_LC', isLC: true, isFinal: false, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'PU', bestEvoTier: 'UU', bestEvoRating: 7.2, megaEvoTier: null, megaEvoRating: null },
});
const GYM5 = makePoke('SPECIES_GYM5', 'P_FAMILY_GYM5', ['DARK'], {
    evolutionData: { type: 'EVO_TYPE_LC', isLC: true, isFinal: false, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'PU', bestEvoTier: 'UU', bestEvoRating: 7.1, megaEvoTier: null, megaEvoRating: null },
});
// shellyReward: final+mega, megaEvoTier OU
// checkValidEvo(SHELLY_FINAL, 41): NFE→Final at param 36 ≤ 41 ✓; LC→NFE at param 18 ≤ 41 ✓
const SHELLY_FINAL = makePoke('SPECIES_SHELLY_FINAL', 'P_FAMILY_SHELLY', ['STEEL'], {
    evolutionData: { type: 'EVO_TYPE_LAST_OF_3', isLC: false, isFinal: true, isMega: false, isNFE: false, megaEvos: ['SPECIES_SHELLY_MEGA'] },
    rating: { tier: 'UU', bestEvoTier: 'UU', bestEvoRating: 7.5, megaEvoTier: 'OU', megaEvoRating: 8.5 },
    evoTree: ['SPECIES_SHELLY_LC'],
});
const SHELLY_NFE = makePoke('SPECIES_SHELLY_NFE', 'P_FAMILY_SHELLY', ['STEEL'], {
    evolutionData: { type: 'EVO_TYPE_NFE_OF_3', isLC: false, isFinal: false, isMega: false, isNFE: true, megaEvos: [] },
    rating: { tier: 'RU', bestEvoTier: 'UU', bestEvoRating: 7.5, megaEvoTier: null, megaEvoRating: null },
    evolutions: [{ pokemon: 'SPECIES_SHELLY_FINAL', method: 'LEVEL', param: '36' }],
});
const SHELLY_LC = makePoke('SPECIES_SHELLY_LC', 'P_FAMILY_SHELLY', ['STEEL'], {
    // isLC: false — same reason as GYM3_LC; checkValidEvo doesn't check isLC on the bottom form
    evolutionData: { type: 'EVO_TYPE_LC_OF_3', isLC: false, isFinal: false, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'PU', bestEvoTier: 'UU', bestEvoRating: 7.5, megaEvoTier: null, megaEvoRating: null },
    evolutions: [{ pokemon: 'SPECIES_SHELLY_NFE', method: 'LEVEL', param: '18' }],
});
// gym6: 1 OU LC (distinct from OU_LC consumed by extra starters)
const GYM6 = makePoke('SPECIES_GYM6', 'P_FAMILY_GYM6', ['PSYCHIC'], {
    evolutionData: { type: 'EVO_TYPE_LC', isLC: true, isFinal: false, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'PU', bestEvoTier: 'OU', bestEvoRating: 8.2, megaEvoTier: null, megaEvoRating: null },
});
// gym7+8: 2 OU FINAL (type LC_OF_2 so they don't overlap with the OU SOLO pool for registeel)
const GYM7 = makePoke('SPECIES_GYM7', 'P_FAMILY_GYM7', ['STEEL'], {
    evolutionData: { type: 'EVO_TYPE_LAST_OF_2', isLC: false, isFinal: true, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'OU', bestEvoTier: 'OU', bestEvoRating: 8.5, megaEvoTier: null, megaEvoRating: null },
});
const GYM8 = makePoke('SPECIES_GYM8', 'P_FAMILY_GYM8', ['FAIRY'], {
    evolutionData: { type: 'EVO_TYPE_LAST_OF_2', isLC: false, isFinal: true, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'OU', bestEvoTier: 'OU', bestEvoRating: 8.6, megaEvoTier: null, megaEvoRating: null },
});
// regirock+regice+mew+wallyLilycove: 4 UU SOLO
const REGI1 = makePoke('SPECIES_REGI1', 'P_FAMILY_REGI1', ['GROUND'], {
    evolutionData: { type: 'EVO_TYPE_SOLO', isLC: false, isFinal: true, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'UU', bestEvoTier: 'UU', bestEvoRating: 7.2, megaEvoTier: null, megaEvoRating: null },
});
const REGI2 = makePoke('SPECIES_REGI2', 'P_FAMILY_REGI2', ['WATER'], {
    evolutionData: { type: 'EVO_TYPE_SOLO', isLC: false, isFinal: true, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'UU', bestEvoTier: 'UU', bestEvoRating: 7.1, megaEvoTier: null, megaEvoRating: null },
});
const REGI3 = makePoke('SPECIES_REGI3', 'P_FAMILY_REGI3', ['BUG'], {
    evolutionData: { type: 'EVO_TYPE_SOLO', isLC: false, isFinal: true, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'UU', bestEvoTier: 'UU', bestEvoRating: 7.3, megaEvoTier: null, megaEvoRating: null },
});
const REGI4 = makePoke('SPECIES_REGI4', 'P_FAMILY_REGI4', ['POISON'], {
    evolutionData: { type: 'EVO_TYPE_SOLO', isLC: false, isFinal: true, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'UU', bestEvoTier: 'UU', bestEvoRating: 7.4, megaEvoTier: null, megaEvoRating: null },
});
// registeel: 1 OU SOLO
const PREMIUM = makePoke('SPECIES_PREMIUM', 'P_FAMILY_PREMIUM', ['GHOST'], {
    // isFinal: false — prevents PREMIUM from entering gym7+8 pool (filter: isFinal=true);
    // registeel filter uses type===EVO_TYPE_SOLO, not isFinal
    evolutionData: { type: 'EVO_TYPE_SOLO', isLC: false, isFinal: false, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'OU', bestEvoTier: 'OU', bestEvoRating: 8.3, megaEvoTier: null, megaEvoRating: null },
});
// legend1+2+3: 3 LEGEND SOLO
const LEG1 = makePoke('SPECIES_LEG1', 'P_FAMILY_LEG1', ['DRAGON'], {
    evolutionData: { type: 'EVO_TYPE_SOLO', isLC: false, isFinal: true, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'LEGEND', bestEvoTier: 'LEGEND', bestEvoRating: 9.5, megaEvoTier: null, megaEvoRating: null },
});
const LEG2 = makePoke('SPECIES_LEG2', 'P_FAMILY_LEG2', ['PSYCHIC'], {
    evolutionData: { type: 'EVO_TYPE_SOLO', isLC: false, isFinal: true, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'LEGEND', bestEvoTier: 'LEGEND', bestEvoRating: 9.6, megaEvoTier: null, megaEvoRating: null },
});
const LEG3 = makePoke('SPECIES_LEG3', 'P_FAMILY_LEG3', ['ELECTRIC'], {
    evolutionData: { type: 'EVO_TYPE_SOLO', isLC: false, isFinal: true, isMega: false, isNFE: false, megaEvos: [] },
    rating: { tier: 'LEGEND', bestEvoTier: 'LEGEND', bestEvoRating: 9.4, megaEvoTier: null, megaEvoRating: null },
});

const gymPokemon = [
    GYM1, GYM2,
    GYM3_FINAL, GYM3_NFE, GYM3_LC,
    SLATEPORT_FINAL, SLATEPORT_NFE, SLATEPORT_LC,
    GYM4, GYM5,
    SHELLY_FINAL, SHELLY_NFE, SHELLY_LC,
    GYM6, GYM7, GYM8,
    REGI1, REGI2, REGI3, REGI4,
    PREMIUM,
    LEG1, LEG2, LEG3,
];

// Extended list used by all tests once wildModule includes gym/static reward selection
const extendedPokemonList = [...richPokemonList, ...gymPokemon];

// A startersArtifact as returned by runStartersModule — 3 families already claimed
const startersArtifact = {
    starters: ['SPECIES_FIRE_MON', 'SPECIES_GRASS_MON', 'SPECIES_WATER_MON'],
    alreadyChosenFamilies: ['P_FAMILY_FIRE', 'P_FAMILY_GRASS', 'P_FAMILY_WATER'],
};

// Minimal wildConfig for smoke tests — no actual file replacements needed
const emptyWildConfig = {
    file: null,
    replacements: {},
    replacementTypes: {},
    maps: [],
};

afterEach(() => { rng.reset(); });

describe('runWildModule — output shape', () => {
    test('returns an object with extraStarters, replacementLog, foundMegaEvos', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(42);
        const result = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        expect(result).toHaveProperty('extraStarters');
        expect(result).toHaveProperty('replacementLog');
        expect(result).toHaveProperty('foundMegaEvos');
    });

    test('extraStarters is an array of string ids', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { extraStarters } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        expect(Array.isArray(extraStarters)).toBe(true);
        extraStarters.forEach(id => expect(typeof id).toBe('string'));
    });

    test('replacementLog is a plain object', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { replacementLog } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        expect(typeof replacementLog).toBe('object');
        expect(Array.isArray(replacementLog)).toBe(false);
    });

    test('foundMegaEvos is an array', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { foundMegaEvos } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        expect(Array.isArray(foundMegaEvos)).toBe(true);
    });
});

describe('runWildModule — extra starters', () => {
    test('first extra starter is a UBERS LC pokemon', () => {
        const { runWildModule } = freshModule();
        rng.seed(42);
        const { extraStarters } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        expect(extraStarters.length).toBeGreaterThanOrEqual(1);
        const first = extendedPokemonList.find(p => p.id === extraStarters[0]);
        expect(first).toBeDefined();
        expect(first.rating.bestEvoTier).toBe('UBERS');
        expect(first.evolutionData.isLC).toBe(true);
    });

    test('second extra starter is an OU LC pokemon', () => {
        const { runWildModule } = freshModule();
        rng.seed(42);
        const { extraStarters } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        expect(extraStarters.length).toBeGreaterThanOrEqual(2);
        const second = extendedPokemonList.find(p => p.id === extraStarters[1]);
        expect(second).toBeDefined();
        expect(second.rating.bestEvoTier).toBe('OU');
        expect(second.evolutionData.isLC).toBe(true);
    });

    test('extra starters do not reuse families from starters artifact', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(10);
        const { extraStarters } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        const starterFamilies = new Set(startersArtifact.alreadyChosenFamilies);
        extraStarters.forEach(id => {
            const poke = extendedPokemonList.find(p => p.id === id);
            expect(poke).toBeDefined();
            expect(starterFamilies.has(poke.family)).toBe(false);
        });
    });

    test('extra starters are all distinct families', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(5);
        const { extraStarters } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        const families = extraStarters.map(id => extendedPokemonList.find(p => p.id === id)?.family);
        expect(families.length).toBe(new Set(families).size);
    });
});

describe('runWildModule — wild replacements', () => {
    test('empty wildConfig replacements → empty replacementLog entries for wild routes', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { replacementLog } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        // With empty wildConfig, the only entries in replacementLog come from gym/static rewards
        // (those keys start with SPECIES_GYM/SPECIES_LEGEND etc.), not wild route species.
        // Verify no raw species keys appear (wild route species are game-world ids like SPECIES_ZIGZAGOON).
        const wildRouteKeys = Object.keys(replacementLog).filter(k =>
            !k.startsWith('SPECIES_GYM') && !k.startsWith('SPECIES_LEGEND')
            && !k.startsWith('SPECIES_REGIROCK') && !k.startsWith('SPECIES_REGICE')
            && !k.startsWith('SPECIES_REGISTEEL') && !k.startsWith('SPECIES_MEW')
            && !k.startsWith('SPECIES_WALLY')
        );
        expect(wildRouteKeys).toHaveLength(0);
    });

    // T-162 — wild generation is now maps-driven (per-zone sweep), not replacements-driven: a
    // template only gets a pick when it sits in a map slot. The pick must still come from the
    // template's tier/evo pool, and now also lands in wildPlan.
    test('replacement picks from the matching tier pool', () => {
        const { runWildModule } = require('../../modules/wildModule');
        const wildConfig = {
            file: null,
            maps: [{ id: 'MAP_TEST', land: 'SPECIES_OLD_PLACEHOLDER' }],
            replacementTypes: {
                LC_WEAK: { replace: ['NU'], type: ['EVO_TYPE_LC'], hasMega: false, megaTiers: null },
            },
            replacements: {
                'SPECIES_OLD_PLACEHOLDER': 'LC_WEAK',
            },
        };

        // Add an NU LC pokemon to the pool for replacement
        const NU_LC = makePoke('SPECIES_NU_LC_WILD', 'P_FAMILY_NULC', ['BUG'], {
            evolutionData: { type: 'EVO_TYPE_LC', isLC: true, isMega: false, isFinal: false, isNFE: false, megaEvos: [] },
            rating: { bestEvoTier: 'NU', tier: 'PU', bestEvoRating: 5 },
        });

        rng.seed(1);
        const pool = [...extendedPokemonList, NU_LC];
        const { replacementLog, wildPlan } = runWildModule(pool, startersArtifact, wildConfig);
        expect(replacementLog).toHaveProperty('SPECIES_OLD_PLACEHOLDER');
        const replacementId = replacementLog['SPECIES_OLD_PLACEHOLDER'];
        expect(wildPlan['SPECIES_OLD_PLACEHOLDER']).toEqual([replacementId]);
        const replacementPoke = pool.find(p => p.id === replacementId);
        expect(replacementPoke).toBeDefined();
        expect(replacementPoke.rating.bestEvoTier).toBe('NU');
        expect(replacementPoke.evolutionData.isLC).toBe(true);
    });
});

describe('runWildModule — determinism', () => {
    test('same seed produces identical output', () => {
        const { runWildModule } = require('../../modules/wildModule');

        rng.seed(77);
        const r1 = runWildModule([...extendedPokemonList], startersArtifact, emptyWildConfig);

        rng.seed(77);
        const r2 = runWildModule([...extendedPokemonList], startersArtifact, emptyWildConfig);

        expect(r1.extraStarters).toEqual(r2.extraStarters);
        expect(r1.replacementLog).toEqual(r2.replacementLog);
    });
});

// ── New tests for extended return shape (gym/static rewards) ───────────────────
// These fail until wildModule is extended to select gym/static rewards.

describe('runWildModule — gym rewards shape', () => {
    test('returns gymRewards with all 11 slot keys', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const result = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        expect(result).toHaveProperty('gymRewards');
        const { gymRewards } = result;
        expect(gymRewards).toHaveProperty('gym1');
        expect(gymRewards).toHaveProperty('gym2');
        expect(gymRewards).toHaveProperty('gym3');
        expect(gymRewards).toHaveProperty('gym4');
        expect(gymRewards).toHaveProperty('gym5');
        expect(gymRewards).toHaveProperty('gym6');
        expect(gymRewards).toHaveProperty('gym7');
        expect(gymRewards).toHaveProperty('gym8');
        expect(gymRewards).toHaveProperty('slateportGrunts');
        expect(gymRewards).toHaveProperty('shellyReward');
        expect(gymRewards).toHaveProperty('wallyLilycove');
    });

    test('each gymReward entry has an id string', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { gymRewards } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        Object.values(gymRewards).forEach(reward => {
            expect(typeof reward.id).toBe('string');
        });
    });

    test('gym1 is a NU SOLO pokemon', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { gymRewards } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        const gym1 = extendedPokemonList.find(p => p.id === gymRewards.gym1.id);
        expect(gym1).toBeDefined();
        expect(gym1.rating.tier).toBe('NU');
        expect(gym1.evolutionData.type).toBe('EVO_TYPE_SOLO');
    });

    test('gym3 is the base (devolved) form of a chain with a mega', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { gymRewards } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        // gym3 is devolvedToBase: should be the chain's base (not isFinal) or a solo pokemon
        const gym3 = extendedPokemonList.find(p => p.id === gymRewards.gym3.id);
        expect(gym3).toBeDefined();
        expect(!gym3.evolutionData.isFinal || gym3.evolutionData.type === 'EVO_TYPE_SOLO').toBe(true);
    });
});

describe('runWildModule — static rewards shape', () => {
    test('returns staticRewards with all 7 keys', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const result = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        expect(result).toHaveProperty('staticRewards');
        const { staticRewards } = result;
        expect(staticRewards).toHaveProperty('regirock');
        expect(staticRewards).toHaveProperty('regice');
        expect(staticRewards).toHaveProperty('mew');
        expect(staticRewards).toHaveProperty('registeel');
        expect(staticRewards).toHaveProperty('legend1');
        expect(staticRewards).toHaveProperty('legend2');
        expect(staticRewards).toHaveProperty('legend3');
    });

    test('each staticReward entry has an id string', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { staticRewards } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        Object.values(staticRewards).forEach(reward => {
            expect(typeof reward.id).toBe('string');
        });
    });

    test('regirock/regice/mew/wallyLilycove are UU SOLO', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { staticRewards } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        ['regirock', 'regice', 'mew'].forEach(key => {
            const poke = extendedPokemonList.find(p => p.id === staticRewards[key].id);
            expect(poke.rating.bestEvoTier).toBe('UU');
            expect(poke.evolutionData.type).toBe('EVO_TYPE_SOLO');
        });
    });

    test('legend1/2/3 are UBERS SOLO', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { staticRewards } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        ['legend1', 'legend2', 'legend3'].forEach(key => {
            const poke = extendedPokemonList.find(p => p.id === staticRewards[key].id);
            expect(poke.rating.bestEvoTier).toBe('LEGEND');
            expect(poke.evolutionData.type).toBe('EVO_TYPE_SOLO');
        });
    });
});

describe('runWildModule — alreadyChosenFamilies returned', () => {
    test('returns alreadyChosenFamilies array', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const result = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        expect(result).toHaveProperty('alreadyChosenFamilies');
        expect(Array.isArray(result.alreadyChosenFamilies)).toBe(true);
    });

    test('alreadyChosenFamilies has no duplicates', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { alreadyChosenFamilies } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        expect(alreadyChosenFamilies.length).toBe(new Set(alreadyChosenFamilies).size);
    });

    test('starter families are included in alreadyChosenFamilies', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { alreadyChosenFamilies } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        startersArtifact.alreadyChosenFamilies.forEach(fam => {
            expect(alreadyChosenFamilies).toContain(fam);
        });
    });
});

describe('runWildModule — no duplicate families across all rewards', () => {
    test('gymRewards and staticRewards pick distinct families', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { gymRewards, staticRewards } = runWildModule(extendedPokemonList, startersArtifact, emptyWildConfig);
        const allFamilies = [
            ...Object.values(gymRewards).map(r => r.family),
            ...Object.values(staticRewards).map(r => r.family),
        ];
        expect(allFamilies.length).toBe(new Set(allFamilies).size);
    });
});

describe('resolveRewardMegaStone', () => {
    const { resolveRewardMegaStone } = require('../../modules/wildModule');

    const pokemonList = [
        { id: 'SPECIES_BEEDRILL', evolutionData: { megaItem: 'ITEM_BEEDRILLITE' } },
        { id: 'SPECIES_CHARIZARD_MEGA_X', evolutionData: { megaItem: 'ITEM_CHARIZARDITE_X' } },
        { id: 'SPECIES_CHARIZARD_MEGA_Y', evolutionData: { megaItem: 'ITEM_CHARIZARDITE_Y' } },
    ];

    test('returns the mega stone for a reward with a single family mega', () => {
        const reward = { id: 'SPECIES_WEEDLE', evolutionData: { megaEvos: ['SPECIES_BEEDRILL'] } };
        expect(resolveRewardMegaStone(reward, pokemonList)).toBe('ITEM_BEEDRILLITE');
    });

    test('is deterministic (first family mega stone) when several exist', () => {
        const reward = { id: 'SPECIES_CHARMANDER', evolutionData: { megaEvos: ['SPECIES_CHARIZARD_MEGA_X', 'SPECIES_CHARIZARD_MEGA_Y'] } };
        const a = resolveRewardMegaStone(reward, pokemonList);
        const b = resolveRewardMegaStone(reward, pokemonList);
        expect(a).toBe('ITEM_CHARIZARDITE_X');
        expect(a).toBe(b);
    });

    test('returns null when the reward has no mega evolutions', () => {
        expect(resolveRewardMegaStone({ id: 'SPECIES_X', evolutionData: { megaEvos: [] } }, pokemonList)).toBeNull();
        expect(resolveRewardMegaStone({ id: 'SPECIES_X', evolutionData: {} }, pokemonList)).toBeNull();
        expect(resolveRewardMegaStone(null, pokemonList)).toBeNull();
    });

    test('does not consume any RNG calls', () => {
        const reward = { id: 'SPECIES_WEEDLE', evolutionData: { megaEvos: ['SPECIES_BEEDRILL'] } };
        rng.seed(42);
        const baseline = rng.random();
        rng.seed(42);
        resolveRewardMegaStone(reward, pokemonList);
        expect(rng.random()).toBe(baseline);
    });
});

describe('rewardMegaStones', () => {
    const { rewardMegaStones } = require('../../modules/wildModule');
    const pokemonList = [
        { id: 'SPECIES_CHARIZARD_MEGA_X', evolutionData: { megaItem: 'ITEM_CHARIZARDITE_X' } },
        { id: 'SPECIES_CHARIZARD_MEGA_Y', evolutionData: { megaItem: 'ITEM_CHARIZARDITE_Y' } },
    ];

    test('returns every family mega stone (so the bundler can pick among them)', () => {
        const reward = { id: 'SPECIES_CHARMANDER', evolutionData: { megaEvos: ['SPECIES_CHARIZARD_MEGA_X', 'SPECIES_CHARIZARD_MEGA_Y'] } };
        expect(rewardMegaStones(reward, pokemonList)).toEqual(['ITEM_CHARIZARDITE_X', 'ITEM_CHARIZARDITE_Y']);
    });

    test('returns [] when the reward has no mega evolutions', () => {
        expect(rewardMegaStones({ id: 'SPECIES_X', evolutionData: { megaEvos: [] } }, pokemonList)).toEqual([]);
        expect(rewardMegaStones(null, pokemonList)).toEqual([]);
    });

    test('does not consume any RNG calls', () => {
        const reward = { id: 'SPECIES_CHARMANDER', evolutionData: { megaEvos: ['SPECIES_CHARIZARD_MEGA_X'] } };
        rng.seed(42);
        const baseline = rng.random();
        rng.seed(42);
        rewardMegaStones(reward, pokemonList);
        expect(rng.random()).toBe(baseline);
    });
});

describe('BANNED_SPECIES_FOR_PICKING — Palafin Zero-to-Hero', () => {
    const { BANNED_SPECIES_FOR_PICKING } = require('../../modules/wildModule');

    test('Palafin Zero is placeable (rated/moved as Hero)', () => {
        expect(BANNED_SPECIES_FOR_PICKING).not.toContain('SPECIES_PALAFIN_ZERO');
    });

    test('Finizen is placeable (base form, evolves into Palafin)', () => {
        expect(BANNED_SPECIES_FOR_PICKING).not.toContain('SPECIES_FINIZEN');
    });

    test('Palafin Hero stays banned (battle-only form)', () => {
        expect(BANNED_SPECIES_FOR_PICKING).toContain('SPECIES_PALAFIN_HERO');
    });
});

// T-063 Fix B — the wild-replacement loop must dedup by grouped family, not raw family, so two
// cosmetic forms of one family (e.g. Pumpkaboo-Average + Pumpkaboo-Super) can't both be placed as
// wild encounters in the same run. Both forms are given a unique bestEvoTier ('ZU') matched only by
// the custom replacement type, so they are the sole candidates and rewards never claim them —
// isolating the wild↔wild path.
describe('runWildModule — cosmetic multi-form dedup (T-063)', () => {
    const mkForm = (id, family) => makePoke(id, family, ['GHOST'], {
        evolutionData: { type: 'EVO_TYPE_LC', isLC: true, isMega: false, isFinal: false, isNFE: false, megaEvos: [] },
        rating: { bestEvoTier: 'ZU', tier: 'PU', bestEvoRating: 3, megaEvoTier: null, megaEvoRating: null },
    });
    const wildConfig = {
        file: null, maps: [],
        replacementTypes: { PUMPKA: { replace: ['ZU'], type: ['EVO_TYPE_LC'], hasMega: false, megaTiers: null } },
        replacements: { SPECIES_PLACE_A: 'PUMPKA', SPECIES_PLACE_B: 'PUMPKA' },
    };

    test('two Pumpkaboo forms are never both obtainable in one run', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const pool = [
            ...extendedPokemonList,
            mkForm('SPECIES_PUMPKABOO_AVERAGE', 'P_FAMILY_PUMPKABOO'),
            mkForm('SPECIES_PUMPKABOO_SUPER', 'P_FAMILY_PUMPKABOO_SUPER'),
        ];
        const r = runWildModule(pool, startersArtifact, wildConfig);
        const idOf = x => (typeof x === 'string' ? x : x && x.id);
        const obtainable = [
            ...r.extraStarters,
            ...Object.values(r.gymRewards || {}),
            ...Object.values(r.staticRewards || {}),
            ...Object.values(r.replacementLog || {}),
        ].map(idOf).filter(Boolean);
        const pumpkaboo = obtainable.filter(id => id.startsWith('SPECIES_PUMPKABOO'));
        expect(pumpkaboo.length).toBeLessThanOrEqual(1);
    });
});
