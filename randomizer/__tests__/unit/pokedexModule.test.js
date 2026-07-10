'use strict';

// TDD: written BEFORE modules/pokedexModule.js was implemented.
// Run `npm test` — all tests in this file should fail until the module exists.

// Mock all heavy I/O and compute dependencies so the unit test stays fast
// and focuses on orchestration logic only.

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(async (filePath) => {
            // Return minimal valid content depending on the file path
            const p = String(filePath);
            if (p.includes('abilities.h')) return '[ABILITY_OVERGROW]\n    .aiRating = 3,\n    .name = _("Overgrow"),\n    .description = COMPOUND_STRING("Boosts Grass moves."),\n';
            if (p.includes('form_change_tables.h')) return '';
            if (p.includes('moves_info.h')) return '    [MOVE_TACKLE]\n        .power = 40,\n        .accuracy = 100,\n        .pp = 35,\n        .priority = 0,\n        .type = TYPE_NORMAL,\n';
            if (p.includes('gen_') && p.includes('.h') && p.includes('level_up_learnsets')) return '';
            if (p.includes('teachable_learnsets.h')) return '';
            if (p.includes('gen_1_families.h')) {
                return '#if P_FAMILY_BULBASAUR\n    [SPECIES_BULBASAUR] =\n    {\n        .baseHP = 45,\n        .baseAttack = 49,\n        .baseDefense = 49,\n        .baseSpeed = 45,\n        .baseSpAttack = 65,\n        .baseSpDefense = 65,\n        .types = MON_TYPES(TYPE_GRASS, TYPE_POISON),\n        .abilities = { ABILITY_OVERGROW, ABILITY_NONE, ABILITY_CHLOROPHYLL },\n        .speciesName = COMPOUND_STRING("Bulbasaur"),\n        .natDexNum = NATIONAL_DEX_BULBASAUR,\n    },\n    },\n#endif\n';
            }
            if (p.includes('_families.h')) return '';
            if (p.includes('tms_hms.h')) return '';
            return '';
        }),
        writeFile: jest.fn(async () => {}),
    },
}));

jest.mock('../../parser', () => ({
    parseAbilitiesFile: jest.fn(() => ({ ABILITY_OVERGROW: { name: 'Overgrow', rating: 3 } })),
    parseItemsFile: jest.fn(() => ({ 'Leftovers': 'A hold item that gradually restores HP in battle.' })),
    parseMegaEvoStonesFile: jest.fn(() => ({})),
    parseMovesFile: jest.fn(() => ({
        MOVE_TACKLE: { id: 'MOVE_TACKLE', power: '40', accuracy: '100', pp: '35', priority: '0', type: 'TYPE_NORMAL', additionalEffects: [] },
    })),
    parseLearnsetsFile: jest.fn(() => ({})),
    parseTeachableFile: jest.fn(() => ({})),
    parseSpeciesFile: jest.fn(() => []),
    parseStat: jest.fn((v) => parseInt(v, 10) || 0),
    parseMoveStat: jest.fn((v) => parseInt(v, 10) || 0),
    parseMonTypes: jest.fn((raw) => String(raw).replace(/\/\/.*$/, '').trim()
        .replace(/MON_TYPES\(/, '').replace(/\)/, '')
        .split(',').map((s) => s.trim()).filter(Boolean).map((t) => t.replace('TYPE_', ''))),
    nameizyPokemonId: jest.fn((id) => id),
    getEvolutionType: jest.fn(() => 'EVO_TYPE_SOLO'),
    evoIsLC: jest.fn(() => false),
    evoIsNFE: jest.fn(() => false),
    evoIsFinal: jest.fn(() => true),
    FIXED_PROPERTIES: { catchRate: '255', expYield: '0' },
    processLineForDefinitions: jest.fn(),
}));

jest.mock('../../tmRandomizer', () => ({
    randomizeTMs: jest.fn(async () => ['MOVE_FLAMETHROWER', 'MOVE_THUNDERBOLT']),
    buildTMList: jest.fn(() => ['MOVE_FLAMETHROWER', 'MOVE_THUNDERBOLT']),
    // 1-based TM stamp from a tmList; mirrors the real signature (mutates & returns moves).
    annotateTmNumbers: jest.fn((moves, tmList) => {
        (tmList || []).forEach((mv, idx) => { if (mv && moves['MOVE_' + mv]) moves['MOVE_' + mv].tm = idx + 1; });
        return moves;
    }),
}));

jest.mock('../../teachableExpander', () => ({
    expandAllTeachables: jest.fn(),
    buildTmPoolFromFile: jest.fn(async () => new Set(['MOVE_FLAMETHROWER', 'MOVE_THUNDERBOLT'])),
}));

jest.mock('../../rating', () => ({
    ratePokemon: jest.fn(() => ({
        absoluteRating: 5.0,
        tier: 'NU',
        bestEvo: 'SPECIES_BULBASAUR',
        bestEvoRating: 5.0,
        bestEvoTier: 'NU',
        bestMoveset: [],
    })),
    rateContextual: jest.fn(() => ({ absoluteRating: 4.0, tier: 'PU' })),
    rateMove: jest.fn(() => 3.0),
    rateMoveDoubles: jest.fn(() => 3.5),   // T-094/ADR-015
}));

jest.mock('../../rebalancer', () => ({
    balancePokemon: jest.fn((poke) => poke),
}));

const parser = require('../../parser');
const { randomizeTMs } = require('../../tmRandomizer');
const { expandAllTeachables, buildTmPoolFromFile } = require('../../teachableExpander');
const { ratePokemon, rateContextual, rateMove } = require('../../rating');
const { balancePokemon } = require('../../rebalancer');

function freshModule() {
    let mod;
    jest.isolateModules(() => { mod = require('../../modules/pokedexModule'); });
    return mod;
}

const baseConfig = {
    seed: 42,
    difficulty: 'fair',
    rebalance: false,
    balanceChance: 0.5,
    numROMs: 1,
    sharedModules: 0,
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('runPokedexModule — output shape', () => {
    test('returns an object with schemaVersion === 1', async () => {
        const { runPokedexModule } = freshModule();
        const result = await runPokedexModule(baseConfig);
        expect(result).toHaveProperty('schemaVersion', 1);
    });

    test('returns pokes array', async () => {
        const { runPokedexModule } = freshModule();
        const result = await runPokedexModule(baseConfig);
        expect(result).toHaveProperty('pokes');
        expect(Array.isArray(result.pokes)).toBe(true);
    });

    test('returns moves object', async () => {
        const { runPokedexModule } = freshModule();
        const result = await runPokedexModule(baseConfig);
        expect(result).toHaveProperty('moves');
        expect(typeof result.moves).toBe('object');
    });

    test('returns abilities object', async () => {
        const { runPokedexModule } = freshModule();
        const result = await runPokedexModule(baseConfig);
        expect(result).toHaveProperty('abilities');
        expect(typeof result.abilities).toBe('object');
    });

    test('returns evoTree object', async () => {
        const { runPokedexModule } = freshModule();
        const result = await runPokedexModule(baseConfig);
        expect(result).toHaveProperty('evoTree');
        expect(typeof result.evoTree).toBe('object');
    });

    test('returns tmList array', async () => {
        const { runPokedexModule } = freshModule();
        const result = await runPokedexModule(baseConfig);
        expect(result).toHaveProperty('tmList');
        expect(Array.isArray(result.tmList)).toBe(true);
    });

    test('returns seed from config', async () => {
        const { runPokedexModule } = freshModule();
        const result = await runPokedexModule(baseConfig);
        expect(result.seed).toBe(42);
    });

    test('returns difficulty from config', async () => {
        const { runPokedexModule } = freshModule();
        const result = await runPokedexModule(baseConfig);
        expect(result.difficulty).toBe('fair');
    });

    test('returns generatedAt ISO string', async () => {
        const { runPokedexModule } = freshModule();
        const result = await runPokedexModule(baseConfig);
        expect(typeof result.generatedAt).toBe('string');
        expect(() => new Date(result.generatedAt)).not.toThrow();
    });
});

describe('runPokedexModule — orchestration calls', () => {
    test('calls randomizeTMs once', async () => {
        const { runPokedexModule } = freshModule();
        await runPokedexModule(baseConfig);
        expect(randomizeTMs).toHaveBeenCalledTimes(1);
    });

    test('calls buildTmPoolFromFile when not --all-tms', async () => {
        const { runPokedexModule } = freshModule();
        await runPokedexModule(baseConfig);
        expect(buildTmPoolFromFile).toHaveBeenCalledTimes(1);
    });

    test('calls parser.parseAbilitiesFile', async () => {
        const { runPokedexModule } = freshModule();
        await runPokedexModule(baseConfig);
        expect(parser.parseAbilitiesFile).toHaveBeenCalledTimes(1);
    });

    test('calls parser.parseMovesFile', async () => {
        const { runPokedexModule } = freshModule();
        await runPokedexModule(baseConfig);
        expect(parser.parseMovesFile).toHaveBeenCalledTimes(1);
    });

    test('T-078: surfaces the parsed item descriptions on the pokedex artifact', async () => {
        const { runPokedexModule } = freshModule();
        const pokedex = await runPokedexModule(baseConfig);
        expect(parser.parseItemsFile).toHaveBeenCalledTimes(1);
        expect(pokedex.items).toEqual({ 'Leftovers': 'A hold item that gradually restores HP in battle.' });
    });

    test('calls expandAllTeachables once', async () => {
        const { runPokedexModule } = freshModule();
        await runPokedexModule(baseConfig);
        expect(expandAllTeachables).toHaveBeenCalledTimes(1);
    });

    test('does not call balancePokemon when rebalance is false', async () => {
        const { runPokedexModule } = freshModule();
        await runPokedexModule({ ...baseConfig, rebalance: false });
        expect(balancePokemon).not.toHaveBeenCalled();
    });

    test('calls balancePokemon for each poke when rebalance is true', async () => {
        // Inject a poke so there is something to balance
        parser.parseSpeciesFile.mockReturnValueOnce([
            {
                id: 'SPECIES_BULBASAUR',
                family: 'P_FAMILY_BULBASAUR',
                types: 'MON_TYPES(TYPE_GRASS, TYPE_POISON)',
                abilities: '{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_CHLOROPHYLL }',
                baseHP: '45', baseAttack: '49', baseDefense: '49',
                baseSpeed: '45', baseSpAttack: '65', baseSpDefense: '65',
                natDexNum: 'NATIONAL_DEX_BULBASAUR',
                levelUpLearnset: null, teachableLearnset: null,
            },
        ]);
        // Only the first gen returns a poke; remaining gens return []
        parser.parseSpeciesFile.mockReturnValue([]);

        const { runPokedexModule } = freshModule();
        await runPokedexModule({ ...baseConfig, rebalance: true });
        expect(balancePokemon).toHaveBeenCalled();
    });

    test('calls rateMove for each parsed move', async () => {
        const { runPokedexModule } = freshModule();
        await runPokedexModule(baseConfig);
        // rateMove should be called once per move key returned by parseMovesFile
        expect(rateMove).toHaveBeenCalledTimes(
            Object.keys(parser.parseMovesFile()).length
        );
    });

    test('writes abilities.json, items.json, moves.json, pokes.json, evoTree.json', async () => {
        const fs = require('fs');
        const { runPokedexModule } = freshModule();
        await runPokedexModule(baseConfig);
        const writtenPaths = fs.promises.writeFile.mock.calls.map(c => String(c[0]));
        const check = (suffix) => writtenPaths.some(p => p.endsWith(suffix));
        expect(check('abilities.json')).toBe(true);
        expect(check('items.json')).toBe(true);
        expect(check('moves.json')).toBe(true);
        expect(check('pokes.json')).toBe(true);
        expect(check('evoTree.json')).toBe(true);
    });
});

describe('runPokedexModule — rateMove enrichment', () => {
    test('moves have numeric power after enrichment', async () => {
        const { runPokedexModule } = freshModule();
        const result = await runPokedexModule(baseConfig);
        Object.values(result.moves).forEach(move => {
            expect(typeof move.power).toBe('number');
        });
    });
});
