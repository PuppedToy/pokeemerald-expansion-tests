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
    // T-149 — the pokédex artifact carries the caps SSOT level map; trainersModule forwards it to
    // getTrainersData as the 4th arg so trainer levels resolve from caps.c.
    capLevels: { FLAG_DEFEATED_RIVAL_ROUTE103: 8, FLAG_BADGE01_GET: 13 },
};

const fairConfig = { difficulty: 7 };
const hardConfig = { difficulty: 10 };
const easyConfig = { difficulty: 4 };

beforeEach(() => {
    jest.clearAllMocks();
});

describe('runTrainersModule — gauntlet tag (T-145)', () => {
    test('stamps gauntletTag on gauntlet members (any format), leaves other trainers untagged', () => {
        trainers.getTrainersData.mockReturnValueOnce([
            { id: 'TRAINER_GRUNT_MUSEUM_1', level: 24, isBoss: true, bag: [], team: [{ contextualTier: ['NU'], checkValidEvo: true }, { contextualTier: ['NU'], checkValidEvo: true }] },
            { id: 'TRAINER_GRUNT_SPACE_CENTER_5', level: 59, isBoss: true, bag: [], team: [{ contextualTier: ['NU'], checkValidEvo: true }] },
            { id: 'TRAINER_ROXANNE', level: 14, isBoss: true, bag: [], team: [{ contextualTier: ['NU'], checkValidEvo: true }] },
        ]);
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7, battleFormat: 'singles' });
        const byId = Object.fromEntries(trainersData.map(t => [t.id, t]));
        expect(byId['TRAINER_GRUNT_MUSEUM_1'].gauntletTag).toBe('Gauntlet Battle 1');
        expect(byId['TRAINER_GRUNT_SPACE_CENTER_5'].gauntletTag).toBe('Gauntlet Battle 1');
        expect(byId['TRAINER_ROXANNE'].gauntletTag).toBeUndefined();
    });
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

    // T-052: getTrainersData receives the module config as a 3rd arg (trainer-facing knobs).
    // T-149: and the caps SSOT level map as a 4th arg (pokedexArtifact.capLevels) so trainer levels resolve.
    test('calls getTrainersData with itemAssignments, tmList, config and capLevels', () => {
        const { runTrainersModule } = freshModule();
        runTrainersModule(mockPokedexArtifact, fairConfig);
        expect(trainers.getTrainersData).toHaveBeenCalledWith(
            { pick1: 'ITEM_WATER_STONE', pick2: 'ITEM_FIRE_STONE' },
            mockPokedexArtifact.tmList,
            fairConfig,
            mockPokedexArtifact.capLevels
        );
    });

    test('getTrainersData receives the config (3rd) and capLevels (4th) arguments', () => {
        const { runTrainersModule } = freshModule();
        runTrainersModule(mockPokedexArtifact, hardConfig);
        expect(trainers.getTrainersData.mock.calls[0].length).toBe(4);
        expect(trainers.getTrainersData.mock.calls[0][2]).toBe(hardConfig);
        expect(trainers.getTrainersData.mock.calls[0][3]).toBe(mockPokedexArtifact.capLevels);
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

// ─── T-186 — difficulty settings: level / team-size / non-boss-quality modifiers ─────────
// Owner spec: level & team-size modifiers apply to EVERYONE including the story trainers exempt
// from the difficulty transform (rival/Wally/Granite Steven); Champion Steven is a normal boss.
// Battle partners/allies (isPartner) and copy trainers are never touched. Defaults are no-ops.
const RU = { contextualTier: ['RU'], checkValidEvo: true };
const NU = { contextualTier: ['NU'], checkValidEvo: true };
const PU = { contextualTier: ['PU'], checkValidEvo: true };
const MEGA = { isMega: true };

function mockRoster() {
    trainers.getTrainersData.mockReturnValueOnce([
        { id: 'TRAINER_ROXANNE', level: 14, isBoss: true,  bag: [], team: [RU, NU, PU, PU, PU, MEGA] },
        { id: 'TRAINER_GRUNT_1', level: 10, isBoss: false, bag: [], team: [RU, NU, PU, PU] },
        // exempt story boss (MAY_ prefix) — must still receive level & size modifiers
        { id: 'TRAINER_MAY_ROUTE_103_TREECKO', level: 12, isBoss: true, bag: [], team: [{ evolutionTier: 1 }, { evolutionTier: 2 }, { evolutionTier: 3 }] },
        // ally — never touched
        { id: 'PARTNER_STEVEN', level: 40, isPartner: true, isBoss: true, bag: [], team: [NU, PU, RU] },
    ]);
}

describe('runTrainersModule — level modifiers (T-186)', () => {
    test('boss modifier adds to bosses, non-boss modifier to non-bosses', () => {
        mockRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7, bossLevelModifier: 3, nonBossLevelModifier: -2 });
        const byId = Object.fromEntries(trainersData.map(t => [t.id, t]));
        expect(byId['TRAINER_ROXANNE'].level).toBe(17); // 14 + 3
        expect(byId['TRAINER_GRUNT_1'].level).toBe(8);  // 10 - 2
    });

    test('applies to exempt story trainers (rival/Wally/Granite Steven)', () => {
        mockRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7, bossLevelModifier: 5 });
        expect(trainersData.find(t => t.id === 'TRAINER_MAY_ROUTE_103_TREECKO').level).toBe(17); // 12 + 5
    });

    test('never modifies partner/ally levels', () => {
        mockRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7, bossLevelModifier: 5, nonBossLevelModifier: 5 });
        expect(trainersData.find(t => t.id === 'PARTNER_STEVEN').level).toBe(40);
    });

    test('default 0 leaves every level unchanged', () => {
        mockRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7 });
        const byId = Object.fromEntries(trainersData.map(t => [t.id, t]));
        expect(byId['TRAINER_ROXANNE'].level).toBe(14);
        expect(byId['TRAINER_GRUNT_1'].level).toBe(10);
    });

    test('clamps final level into [1, 100]', () => {
        trainers.getTrainersData.mockReturnValueOnce([
            { id: 'TRAINER_GRUNT_1', level: 3,  isBoss: false, bag: [], team: [PU] },
            { id: 'TRAINER_ROXANNE', level: 98, isBoss: true,  bag: [], team: [NU] },
        ]);
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7, bossLevelModifier: 10, nonBossLevelModifier: -50 });
        const byId = Object.fromEntries(trainersData.map(t => [t.id, t]));
        expect(byId['TRAINER_GRUNT_1'].level).toBe(1);   // 3 - 50 → clamp 1
        expect(byId['TRAINER_ROXANNE'].level).toBe(100); // 98 + 10 → clamp 100
    });
});

describe('runTrainersModule — team-size trim (T-186)', () => {
    test('boss team trimmed to bossTeamSize dropping the weakest, keeping the mega ace', () => {
        mockRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7, bossTeamSize: 3 });
        const roxanne = trainersData.find(t => t.id === 'TRAINER_ROXANNE');
        // strongest 3 of [RU,NU,PU,PU,PU,MEGA] = MEGA,RU,NU → original order [RU, NU, MEGA]
        expect(roxanne.team).toEqual([RU, NU, MEGA]);
    });

    test('non-boss team trimmed to nonBossTeamSize (strongest kept, original order)', () => {
        mockRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7, nonBossTeamSize: 2 });
        expect(trainersData.find(t => t.id === 'TRAINER_GRUNT_1').team).toEqual([RU, NU]);
    });

    test('default size 6 leaves teams unchanged', () => {
        mockRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7 });
        expect(trainersData.find(t => t.id === 'TRAINER_ROXANNE').team.length).toBe(6);
        expect(trainersData.find(t => t.id === 'TRAINER_GRUNT_1').team.length).toBe(4);
    });

    test('applies to exempt story trainers', () => {
        mockRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7, bossTeamSize: 1 });
        expect(trainersData.find(t => t.id === 'TRAINER_MAY_ROUTE_103_TREECKO').team.length).toBe(1);
    });

    test('never trims partner/ally teams', () => {
        mockRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7, bossTeamSize: 1, nonBossTeamSize: 1 });
        expect(trainersData.find(t => t.id === 'PARTNER_STEVEN').team.length).toBe(3);
    });
});

// The non-boss quality modifier reuses the SAME mechanism as the difficulty slider: `numShifts` slots
// (top for down-shifts, bottom for up-shifts) each move ONE tier. extraShift = modifier − (−2), so −2 is
// a no-op, and e.g. modifier −3 shifts the single highest non-boss slot one tier down (an extra jump).
describe('runTrainersModule — non-boss quality modifier (T-186)', () => {
    function mockQualityRoster() {
        trainers.getTrainersData.mockReturnValueOnce([
            { id: 'TRAINER_ROXANNE', level: 14, isBoss: true,  bag: [], team: [{ contextualTier: ['NU'] }, { contextualTier: ['NU'] }] },
            { id: 'TRAINER_GRUNT_1', level: 10, isBoss: false, bag: [], team: [{ contextualTier: ['RU'] }, { contextualTier: ['PU'] }] },
        ]);
    }
    const tiers = t => t.team.map(s => s.contextualTier[0]);

    test('default −2 leaves non-boss tiers unchanged (byte-identical)', () => {
        mockQualityRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7 });
        expect(tiers(trainersData.find(t => t.id === 'TRAINER_GRUNT_1'))).toEqual(['RU', 'PU']);
    });

    test('nonBossQuality −3 shifts the single highest non-boss slot one tier DOWN (extra jump)', () => {
        mockQualityRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7, nonBossQuality: -3 });
        // extraShift −1 → 1 slot, 'top' (highest first): RU → NU; PU untouched
        expect(tiers(trainersData.find(t => t.id === 'TRAINER_GRUNT_1'))).toEqual(['NU', 'PU']);
    });

    test('nonBossQuality −1 shifts the single lowest non-boss slot one tier UP (one jump stronger)', () => {
        mockQualityRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7, nonBossQuality: -1 });
        // extraShift +1 → 1 slot, 'bottom' (lowest first): PU → NU; RU untouched
        expect(tiers(trainersData.find(t => t.id === 'TRAINER_GRUNT_1'))).toEqual(['RU', 'NU']);
    });

    test('nonBossQuality 0 shifts both non-boss slots one tier UP (two jumps stronger)', () => {
        mockQualityRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7, nonBossQuality: 0 });
        // extraShift +2 → 2 slots up one each: RU → UU, PU → NU
        expect(tiers(trainersData.find(t => t.id === 'TRAINER_GRUNT_1'))).toEqual(['UU', 'NU']);
    });

    test('never shifts boss teams', () => {
        mockQualityRoster();
        const { runTrainersModule } = freshModule();
        const { trainersData } = runTrainersModule(mockPokedexArtifact, { difficulty: 7, nonBossQuality: 0 });
        expect(tiers(trainersData.find(t => t.id === 'TRAINER_ROXANNE'))).toEqual(['NU', 'NU']);
    });
});
