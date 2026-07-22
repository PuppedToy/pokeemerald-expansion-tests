'use strict';

// T-187 — move mutation pipeline wiring. Verifies that runPokedexModule applies move mutation
// (before rating/rebalance, re-rating changed moves) when config.mutateMoves is on, and does nothing
// — drawing no move RNG — when it is off. Mirrors the heavy-mock harness of pokedexModule.test.js so
// the test stays fast and focuses on the orchestration seam, not real file I/O.

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(async () => ''),
        writeFile: jest.fn(async () => {}),
    },
}));

jest.mock('../../parser', () => ({
    parseAbilitiesFile: jest.fn(() => ({ ABILITY_OVERGROW: { name: 'Overgrow', rating: 3 } })),
    parseItemsFile: jest.fn(() => ({})),
    parseMegaEvoStonesFile: jest.fn(() => ({})),
    // Three moves covering every branch: a physical, a special, and a status move.
    parseMovesFile: jest.fn(() => ({
        MOVE_TACKLE:       { id: 'MOVE_TACKLE',       name: 'Tackle',       power: '40', accuracy: '100', pp: '35', priority: '0', type: 'TYPE_NORMAL',   category: 'DAMAGE_CATEGORY_PHYSICAL', additionalEffects: [] },
        MOVE_SURF:         { id: 'MOVE_SURF',         name: 'Surf',         power: '90', accuracy: '100', pp: '15', priority: '0', type: 'TYPE_WATER',    category: 'DAMAGE_CATEGORY_SPECIAL',  additionalEffects: [] },
        MOVE_THUNDER_WAVE: { id: 'MOVE_THUNDER_WAVE', name: 'Thunder Wave', power: '0',  accuracy: '90',  pp: '20', priority: '0', type: 'TYPE_ELECTRIC', category: 'DAMAGE_CATEGORY_STATUS',   additionalEffects: [] },
    })),
    parseLearnsetsFile: jest.fn(() => ({})),
    parseTeachableFile: jest.fn(() => ({})),
    parseSpeciesFile: jest.fn(() => []),
    parseStat: jest.fn((v) => parseInt(v, 10) || 0),
    parseMoveStat: jest.fn((v) => parseInt(v, 10) || 0),
    parseMonTypes: jest.fn(() => []),
    nameizyPokemonId: jest.fn((id) => id),
    getEvolutionType: jest.fn(() => 'EVO_TYPE_SOLO'),
    evoIsLC: jest.fn(() => false),
    evoIsNFE: jest.fn(() => false),
    evoIsFinal: jest.fn(() => true),
    FIXED_PROPERTIES: { catchRate: '255', expYield: '0' },
    processLineForDefinitions: jest.fn(),
}));

jest.mock('../../tmRandomizer', () => ({
    randomizeTMs: jest.fn(async () => []),
    buildTMList: jest.fn(() => []),
    annotateTmNumbers: jest.fn((moves) => moves),
}));

jest.mock('../../teachableExpander', () => ({
    expandAllTeachables: jest.fn(),
    buildTmPoolFromFile: jest.fn(async () => new Set()),
}));

jest.mock('../../rating', () => ({
    ratePokemon: jest.fn(() => ({ absoluteRating: 5, tier: 'NU', bestMoveset: [] })),
    ratePokemonDoubles: jest.fn(() => ({ ratingDoubles: 5 })),
    rateContextual: jest.fn(() => ({ absoluteRating: 4, tier: 'PU', bestMoveset: [] })),
    rateContextualDoubles: jest.fn(() => ({ absoluteRating: 4, tier: 'PU' })),
    rateMove: jest.fn(() => 3.0),
    rateMoveDoubles: jest.fn(() => 3.5),
    rateAbilityDoubles: jest.fn((k, a) => (a && a.rating) || 0),
    rateAbilitySingles: jest.fn((k, a) => (a && a.rating) || 0),
    assignSupportTiersDoubles: jest.fn(() => ({ OU: 0, UU: 0, RU: 0 })),
}));

jest.mock('../../rebalancer', () => ({
    balancePokemon: jest.fn((poke) => poke),
}));

const { rateMove } = require('../../rating');

// Fresh module + the SAME rng instance it uses (isolateModules gives moveMutator a fresh rng).
function freshModule() {
    let mod, isolatedRng;
    jest.isolateModules(() => {
        mod = require('../../modules/pokedexModule');
        isolatedRng = require('../../rng');
    });
    return { runPokedexModule: mod.runPokedexModule, rng: isolatedRng };
}

const baseConfig = { seed: 42, difficulty: 'fair', rebalance: false, balanceChance: 0.2, numROMs: 1, sharedModules: 0 };
const ALL_ON = {
    mutateMoves: true,
    moveMutationChance: 1, movePowerChance: 1, moveAccuracyChance: 1, moveTypeChance: 1, moveCategoryChance: 1,
};

beforeEach(() => jest.clearAllMocks());

describe('runPokedexModule — move mutation OFF (default)', () => {
    test('no move gets a log and move stats are untouched', async () => {
        const { runPokedexModule } = freshModule();
        const result = await runPokedexModule({ ...baseConfig, mutateMoves: false });
        Object.values(result.moves).forEach(mv => expect(mv.log).toBeUndefined());
        expect(result.moves.MOVE_TACKLE.power).toBe(40);
        expect(result.moves.MOVE_TACKLE.type).toBe('NORMAL');
        expect(result.moves.MOVE_SURF.category).toBe('DAMAGE_CATEGORY_SPECIAL');
    });

    test('rateMove runs once per move (enrichment only, no re-rate)', async () => {
        const { runPokedexModule } = freshModule();
        await runPokedexModule({ ...baseConfig, mutateMoves: false });
        expect(rateMove).toHaveBeenCalledTimes(3);
    });
});

describe('runPokedexModule — move mutation ON', () => {
    test('changed moves get a log and their fields are mutated', async () => {
        const { runPokedexModule, rng } = freshModule();
        rng.seed(1);
        const result = await runPokedexModule({ ...baseConfig, ...ALL_ON });

        const tackle = result.moves.MOVE_TACKLE;
        expect(Array.isArray(tackle.log)).toBe(true);
        const typeEntry = tackle.log.find(e => e.target === 'type');
        expect(typeEntry).toBeDefined();
        expect(tackle.type).not.toBe('NORMAL');
        expect(tackle.type).toBe(typeEntry.value);
    });

    test('status moves never gain power or category changes and stay status', async () => {
        const { runPokedexModule, rng } = freshModule();
        rng.seed(1);
        const result = await runPokedexModule({ ...baseConfig, ...ALL_ON });

        const tw = result.moves.MOVE_THUNDER_WAVE;
        expect(Array.isArray(tw.log)).toBe(true);
        expect(tw.log.find(e => e.target === 'power')).toBeUndefined();
        expect(tw.log.find(e => e.target === 'category')).toBeUndefined();
        expect(tw.category).toBe('DAMAGE_CATEGORY_STATUS');
        expect(tw.power).toBe(0);
    });

    test('re-rates the mutated moves (rateMove called more than the 3 enrichment passes)', async () => {
        const { runPokedexModule, rng } = freshModule();
        rng.seed(1);
        await runPokedexModule({ ...baseConfig, ...ALL_ON });
        expect(rateMove.mock.calls.length).toBeGreaterThan(3);
    });

    test('deterministic: same seed → identical mutated moves', async () => {
        const a = freshModule(); a.rng.seed(7);
        const ra = await a.runPokedexModule({ ...baseConfig, ...ALL_ON });
        const b = freshModule(); b.rng.seed(7);
        const rb = await b.runPokedexModule({ ...baseConfig, ...ALL_ON });
        expect(ra.moves).toEqual(rb.moves);
    });
});
