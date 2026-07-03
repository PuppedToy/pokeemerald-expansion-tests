'use strict';

// TDD: written BEFORE modules/trainersModule.js was implemented.

// Mocking the heavy trainer-definitions and item-randomizer modules so these unit tests
// stay fast and focused on the module's orchestration logic (not on trainers.js internals).

jest.mock('../../trainers', () => ({
    getTrainersData: jest.fn((itemAssignments, tmList) => [
        { id: 'TRAINER_ROXANNE',  level: 14, team: [{ contextualTier: ['NU'], checkValidEvo: true }], isBoss: true,  bag: [] },
        { id: 'TRAINER_GRUNT_1',  level: 10, team: [{ contextualTier: ['PU'], checkValidEvo: true }], isBoss: false, bag: ['ITEM_POKE_BALL', 'ITEM_SUPER_POTION', 'ITEM_REPEL'] },
        { id: 'TRAINER_GRUNT_2',  level: 12, team: [{ contextualTier: ['PU'], checkValidEvo: true }], isBoss: false, bag: ['ITEM_POKE_BALL', 'ITEM_POTION'] },
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

const fairConfig = { difficulty: 7 };
const hardConfig = { difficulty: 10 };
const easyConfig = { difficulty: 4 };

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

    // T-052 spec change: getTrainersData now also receives the module config as a 3rd arg so the
    // trainer-facing knobs (gym/E4 type-change counts, Aqua/Magma types) can reach it.
    test('calls getTrainersData with itemAssignments, tmList and the config', () => {
        const { runTrainersModule } = freshModule();
        runTrainersModule(mockPokedexArtifact, fairConfig);
        expect(trainers.getTrainersData).toHaveBeenCalledWith(
            { pick1: 'ITEM_WATER_STONE', pick2: 'ITEM_FIRE_STONE' },
            mockPokedexArtifact.tmList,
            fairConfig
        );
    });

    test('getTrainersData receives the config object as its 3rd argument', () => {
        const { runTrainersModule } = freshModule();
        runTrainersModule(mockPokedexArtifact, hardConfig);
        expect(trainers.getTrainersData.mock.calls[0].length).toBe(3);
        expect(trainers.getTrainersData.mock.calls[0][2]).toBe(hardConfig);
    });
});

describe('runTrainersModule — bag offset by difficulty', () => {
    // Level 4 (easy): getBagSizeOffset(4) = round((4-7)*7/3) = round(-7) = -7 → non-boss bags trimmed
    test('level 4 trims non-boss bags (offset -7)', () => {
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, easyConfig);
        const grunt = trainersData.find(t => t.id === 'TRAINER_GRUNT_1');
        // Original bag had 3 items; after trim by 7: max(0, 3-7) = 0
        expect(grunt.bag.length).toBe(0);
    });

    // Level 7 (fair): getBagSizeOffset(7) = 0 → bags unchanged
    test('level 7 (fair) leaves bags unchanged', () => {
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, fairConfig);
        const grunt = trainersData.find(t => t.id === 'TRAINER_GRUNT_1');
        expect(grunt.bag.length).toBe(3);
    });

    // Level 10 (hard): getBagSizeOffset(10) = round((10-7)*7/3) = round(7) = +7 → non-boss bags grow
    test('level 10 extends non-boss bags (offset +7)', () => {
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, hardConfig);
        const grunt = trainersData.find(t => t.id === 'TRAINER_GRUNT_1');
        // Original 3 items; slice(-7) on a 3-item bag → all 3 items; extended = 3 + 3 = 6
        expect(grunt.bag.length).toBe(6);
    });

    test('boss trainers are never bag-modified regardless of difficulty', () => {
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, hardConfig);
        const boss = trainersData.find(t => t.id === 'TRAINER_ROXANNE');
        expect(boss.bag.length).toBe(0);
    });
});
