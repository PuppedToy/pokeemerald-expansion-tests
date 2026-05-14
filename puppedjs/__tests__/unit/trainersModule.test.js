'use strict';

// TDD: written BEFORE modules/trainersModule.js was implemented.

// Mocking the heavy trainer-definitions and item-randomizer modules so these unit tests
// stay fast and focused on the module's orchestration logic (not on trainers.js internals).

jest.mock('../../trainers', () => ({
    getTrainersData: jest.fn((itemAssignments, tmList, difficulty) => [
        { id: 'TRAINER_ROXANNE',  level: 14, team: ['SPECIES_GEODUDE'], isBoss: true,  bag: [] },
        { id: 'TRAINER_GRUNT_1',  level: 10, team: ['SPECIES_ZUBAT'],   isBoss: false, bag: ['ITEM_POKE_BALL', 'ITEM_SUPER_POTION', 'ITEM_REPEL'] },
        { id: 'TRAINER_GRUNT_2',  level: 12, team: ['SPECIES_POOCHYENA'],isBoss: false, bag: ['ITEM_POKE_BALL', 'ITEM_POTION'] },
    ]),
    file: '/mock/trainers.party',
    partnersFile: '/mock/partners.party',
}));

jest.mock('../../itemRandomizer', () => ({
    randomizeItems: jest.fn(() => ({ pick1: 'ITEM_WATER_STONE', pick2: 'ITEM_FIRE_STONE' })),
}));

const trainers = require('../../trainers');
const { randomizeItems } = require('../../itemRandomizer');

function freshModule() {
    let mod;
    jest.isolateModules(() => { mod = require('../../modules/trainersModule'); });
    return mod;
}

const mockPokedexArtifact = {
    tmList: ['MOVE_FLAMETHROWER', 'MOVE_THUNDERBOLT', 'MOVE_ICE_BEAM'],
};

const fairConfig = { difficulty: 'fair' };
const hardConfig = { difficulty: 'hard' };
const easyConfig = { difficulty: 'easy' };

beforeEach(() => {
    jest.clearAllMocks();
});

describe('runTrainersModule — output shape', () => {
    test('returns { trainersData, itemAssignments }', () => {
        const { runTrainersModule } = freshModule();
        const result = runTrainersModule(mockPokedexArtifact, fairConfig);
        expect(result).toHaveProperty('trainersData');
        expect(result).toHaveProperty('itemAssignments');
    });

    test('trainersData is an array', () => {
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, fairConfig);
        expect(Array.isArray(trainersData)).toBe(true);
    });

    test('each trainer has id and team', () => {
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, fairConfig);
        trainersData.forEach(t => {
            expect(t).toHaveProperty('id');
            expect(t).toHaveProperty('team');
        });
    });

    test('itemAssignments is an object returned by randomizeItems', () => {
        const { runTrainersModule } = freshModule();
        const { itemAssignments } = runTrainersModule(mockPokedexArtifact, fairConfig);
        expect(typeof itemAssignments).toBe('object');
        expect(itemAssignments).toEqual({ pick1: 'ITEM_WATER_STONE', pick2: 'ITEM_FIRE_STONE' });
    });
});

describe('runTrainersModule — calls dependencies correctly', () => {
    test('calls randomizeItems()', () => {
        const { runTrainersModule } = freshModule();
        runTrainersModule(mockPokedexArtifact, fairConfig);
        expect(randomizeItems).toHaveBeenCalledTimes(1);
    });

    test('calls getTrainersData with itemAssignments, tmList, and uppercased difficulty', () => {
        const { runTrainersModule } = freshModule();
        runTrainersModule(mockPokedexArtifact, fairConfig);
        expect(trainers.getTrainersData).toHaveBeenCalledWith(
            { pick1: 'ITEM_WATER_STONE', pick2: 'ITEM_FIRE_STONE' },
            mockPokedexArtifact.tmList,
            'FAIR'
        );
    });

    test('difficulty is uppercased when passed to getTrainersData', () => {
        const { runTrainersModule } = freshModule();
        runTrainersModule(mockPokedexArtifact, hardConfig);
        expect(trainers.getTrainersData).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            'HARD'
        );
    });
});

describe('runTrainersModule — bag offset by difficulty', () => {
    // EASY: BAG_SIZE_OFFSET = -5 → non-boss bags are trimmed
    test('easy difficulty trims non-boss bags by 5', () => {
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, easyConfig);
        const grunt = trainersData.find(t => t.id === 'TRAINER_GRUNT_1');
        // Original bag had 3 items; after trim by 5: max(0, 3-5) = 0
        expect(grunt.bag.length).toBe(0);
    });

    // FAIR: BAG_SIZE_OFFSET = 0 → bags unchanged
    test('fair difficulty leaves bags unchanged', () => {
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, fairConfig);
        const grunt = trainersData.find(t => t.id === 'TRAINER_GRUNT_1');
        expect(grunt.bag.length).toBe(3);
    });

    // HARD: BAG_SIZE_OFFSET = +5 → non-boss bags grow (last +5 items duplicated)
    test('hard difficulty extends non-boss bags (slice wraps at bag length)', () => {
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, hardConfig);
        const grunt = trainersData.find(t => t.id === 'TRAINER_GRUNT_1');
        // Original 3 items; slice(-5) on a 3-item bag → all 3 items; extended = 3 + 3 = 6
        expect(grunt.bag.length).toBe(6);
    });

    test('boss trainers are never bag-modified regardless of difficulty', () => {
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, hardConfig);
        const boss = trainersData.find(t => t.id === 'TRAINER_ROXANNE');
        expect(boss.bag.length).toBe(0);
    });
});
