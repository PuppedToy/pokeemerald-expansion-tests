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
    };
}

// Build a rich enough pokemon list to satisfy all extraStarters slots:
//  slot 1: 1 OU LC-of-3 (strict) or OU LC (fallback)
//  slot 2: 1 UU LC (not already chosen)
//  slot 3: 1 NU SOLO (earlyGame)
//  slots 4-9: up to 6 RU LC

const OU_LC = makePoke('SPECIES_OU_LC',   'P_FAMILY_OU',   ['FIRE'],     { evolutionData: { type: 'EVO_TYPE_LC_OF_3', isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'OU',  tier: 'PU', bestEvoRating: 8 } });
const UU_LC = makePoke('SPECIES_UU_LC',   'P_FAMILY_UU2',  ['WATER'],    { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'UU',  tier: 'PU', bestEvoRating: 7 } });
const NU_SOLO= makePoke('SPECIES_NU_SOLO','P_FAMILY_NU',   ['NORMAL'],   { evolutionData: { type: 'EVO_TYPE_SOLO',    isLC: false,isMega: false, isFinal: true,  megaEvos: [] }, rating: { bestEvoTier: 'NU',  tier: 'NU', bestEvoRating: 5 } });
const RU_LC1 = makePoke('SPECIES_RU_LC1', 'P_FAMILY_RU1',  ['GRASS'],    { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'RU',  tier: 'PU' } });
const RU_LC2 = makePoke('SPECIES_RU_LC2', 'P_FAMILY_RU2',  ['ELECTRIC'], { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'RU',  tier: 'PU' } });
const RU_LC3 = makePoke('SPECIES_RU_LC3', 'P_FAMILY_RU3',  ['ICE'],      { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'RU',  tier: 'PU' } });
const RU_LC4 = makePoke('SPECIES_RU_LC4', 'P_FAMILY_RU4',  ['DRAGON'],   { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'RU',  tier: 'PU' } });
const RU_LC5 = makePoke('SPECIES_RU_LC5', 'P_FAMILY_RU5',  ['STEEL'],    { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'RU',  tier: 'PU' } });
const RU_LC6 = makePoke('SPECIES_RU_LC6', 'P_FAMILY_RU6',  ['DARK'],     { evolutionData: { type: 'EVO_TYPE_LC',      isLC: true, isMega: false, isFinal: false, megaEvos: [] }, rating: { bestEvoTier: 'RU',  tier: 'PU' } });

const richPokemonList = [OU_LC, UU_LC, NU_SOLO, RU_LC1, RU_LC2, RU_LC3, RU_LC4, RU_LC5, RU_LC6];

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
        const result = runWildModule(richPokemonList, startersArtifact, emptyWildConfig);
        expect(result).toHaveProperty('extraStarters');
        expect(result).toHaveProperty('replacementLog');
        expect(result).toHaveProperty('foundMegaEvos');
    });

    test('extraStarters is an array of string ids', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { extraStarters } = runWildModule(richPokemonList, startersArtifact, emptyWildConfig);
        expect(Array.isArray(extraStarters)).toBe(true);
        extraStarters.forEach(id => expect(typeof id).toBe('string'));
    });

    test('replacementLog is a plain object', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { replacementLog } = runWildModule(richPokemonList, startersArtifact, emptyWildConfig);
        expect(typeof replacementLog).toBe('object');
        expect(Array.isArray(replacementLog)).toBe(false);
    });

    test('foundMegaEvos is an array', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { foundMegaEvos } = runWildModule(richPokemonList, startersArtifact, emptyWildConfig);
        expect(Array.isArray(foundMegaEvos)).toBe(true);
    });
});

describe('runWildModule — extra starters', () => {
    test('first extra starter is an OU LC pokemon', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(42);
        const { extraStarters } = runWildModule(richPokemonList, startersArtifact, emptyWildConfig);
        expect(extraStarters.length).toBeGreaterThanOrEqual(1);
        const first = richPokemonList.find(p => p.id === extraStarters[0]);
        expect(first).toBeDefined();
        expect(first.rating.bestEvoTier).toBe('OU');
        expect(first.evolutionData.isLC).toBe(true);
    });

    test('extra starters do not reuse families from starters artifact', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(10);
        const { extraStarters } = runWildModule(richPokemonList, startersArtifact, emptyWildConfig);
        const starterFamilies = new Set(startersArtifact.alreadyChosenFamilies);
        extraStarters.forEach(id => {
            const poke = richPokemonList.find(p => p.id === id);
            expect(poke).toBeDefined();
            expect(starterFamilies.has(poke.family)).toBe(false);
        });
    });

    test('extra starters are all distinct families', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(5);
        const { extraStarters } = runWildModule(richPokemonList, startersArtifact, emptyWildConfig);
        const families = extraStarters.map(id => richPokemonList.find(p => p.id === id)?.family);
        expect(families.length).toBe(new Set(families).size);
    });
});

describe('runWildModule — wild replacements', () => {
    test('empty wildConfig replacements → empty replacementLog', () => {
        const { runWildModule } = require('../../modules/wildModule');
        rng.seed(1);
        const { replacementLog } = runWildModule(richPokemonList, startersArtifact, emptyWildConfig);
        expect(Object.keys(replacementLog)).toHaveLength(0);
    });

    test('replacement picks from the matching tier pool', () => {
        const { runWildModule } = require('../../modules/wildModule');
        const wildConfig = {
            file: null,
            maps: [],
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
        const { replacementLog } = runWildModule([...richPokemonList, NU_LC], startersArtifact, wildConfig);
        expect(replacementLog).toHaveProperty('SPECIES_OLD_PLACEHOLDER');
        const replacementId = replacementLog['SPECIES_OLD_PLACEHOLDER'];
        const replacementPoke = [...richPokemonList, NU_LC].find(p => p.id === replacementId);
        expect(replacementPoke).toBeDefined();
        expect(replacementPoke.rating.bestEvoTier).toBe('NU');
        expect(replacementPoke.evolutionData.isLC).toBe(true);
    });
});

describe('runWildModule — determinism', () => {
    test('same seed produces identical output', () => {
        const { runWildModule } = require('../../modules/wildModule');

        rng.seed(77);
        const r1 = runWildModule([...richPokemonList], startersArtifact, emptyWildConfig);

        rng.seed(77);
        const r2 = runWildModule([...richPokemonList], startersArtifact, emptyWildConfig);

        expect(r1.extraStarters).toEqual(r2.extraStarters);
        expect(r1.replacementLog).toEqual(r2.replacementLog);
    });
});
