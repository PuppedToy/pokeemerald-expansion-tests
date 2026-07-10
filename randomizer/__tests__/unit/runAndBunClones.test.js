'use strict';

// TDD (T-089): in mixed + League Run & Bun, runTrainersModule clones each Elite Four member into a
// TRAINER_<X>_DOUBLES trainer (distinct id → distinct team via the per-slot reseed), the clones are
// battleType 'doubles', and the base E4 are 'singles'. No clones otherwise.

jest.mock('../../trainers', () => ({
    getTrainersData: jest.fn(() => ([
        { id: 'TRAINER_SIDNEY', level: 46, class: 'Elite Four', isBoss: true, team: [{ contextualTier: ['OU'] }, { contextualTier: ['OU'] }], bag: [] },
        { id: 'TRAINER_PHOEBE', level: 46, class: 'Elite Four', isBoss: true, team: [{ contextualTier: ['OU'] }, { contextualTier: ['OU'] }], bag: [] },
        { id: 'TRAINER_GLACIA', level: 46, class: 'Elite Four', isBoss: true, team: [{ contextualTier: ['OU'] }, { contextualTier: ['OU'] }], bag: [] },
        { id: 'TRAINER_DRAKE',  level: 46, class: 'Elite Four', isBoss: true, team: [{ contextualTier: ['OU'] }, { contextualTier: ['OU'] }], bag: [] },
        { id: 'TRAINER_YOUNGSTER_X', level: 10, class: 'Youngster', isBoss: false, team: [{ contextualTier: ['PU'] }, { contextualTier: ['PU'] }], bag: [] },
    ])),
    file: '/mock/trainers.party',
    partnersFile: '/mock/partners.party',
}));

jest.mock('../../itemRandomizer', () => ({ randomizeItems: jest.fn(() => ({})) }));

const { runTrainersModule } = require('../../modules/trainersModule');

const CLONES = ['TRAINER_SIDNEY_DOUBLES', 'TRAINER_PHOEBE_DOUBLES', 'TRAINER_GLACIA_DOUBLES', 'TRAINER_DRAKE_DOUBLES'];
const BASES = ['TRAINER_SIDNEY', 'TRAINER_PHOEBE', 'TRAINER_GLACIA', 'TRAINER_DRAKE'];
const run = (config) => runTrainersModule({ tmList: [] }, config).trainersData;

describe('Run & Bun E4 cloning', () => {
    test('mixed + leagueRunAndBun adds 4 _DOUBLES clones (doubles); base E4 stay singles', () => {
        const td = run({ difficulty: 7, battleFormat: 'mixed', leagueRunAndBun: true, singlesPercent: 60, seed: 5 });
        const byId = Object.fromEntries(td.map(t => [t.id, t]));
        for (const id of CLONES) {
            expect(byId[id]).toBeDefined();
            expect(byId[id].battleType).toBe('doubles');
        }
        for (const id of BASES) expect(byId[id].battleType).toBe('singles');
    });

    test('no clones when Run & Bun is off (plain mixed)', () => {
        const td = run({ difficulty: 7, battleFormat: 'mixed', leagueRunAndBun: false, singlesPercent: 60, seed: 5 });
        expect(td.filter(t => t.id.endsWith('_DOUBLES'))).toHaveLength(0);
    });

    test('no clones in pure singles', () => {
        const td = run({ difficulty: 7, battleFormat: 'singles' });
        expect(td.some(t => t.id.endsWith('_DOUBLES'))).toBe(false);
    });

    test('each _DOUBLES clone sits immediately after its base E4 (adjacent in the docs order)', () => {
        const ids = run({ difficulty: 7, battleFormat: 'mixed', leagueRunAndBun: true, singlesPercent: 60, seed: 5 }).map(t => t.id);
        for (const base of BASES) {
            const i = ids.indexOf(base);
            expect(ids[i + 1]).toBe(`${base}_DOUBLES`);
        }
    });

    test('clone is a deep copy — its team array is not shared with the base', () => {
        const td = run({ difficulty: 7, battleFormat: 'mixed', leagueRunAndBun: true, singlesPercent: 60, seed: 5 });
        const base = td.find(t => t.id === 'TRAINER_SIDNEY');
        const clone = td.find(t => t.id === 'TRAINER_SIDNEY_DOUBLES');
        expect(clone.team).not.toBe(base.team);
    });
});
