'use strict';

// T-075 — the accepted "team of 5" degradation must now be OBSERVABLE. When a slot's
// selection exhausts every fallback, writerDocs drops the slot; the finished team is
// shorter than its definition. This test drives the REAL writerDocs team-building loop
// and asserts it records rich diagnostics via the injected sink.
//
// Fault injection at the real seam: selectWithAutoFallback returning null is exactly
// "all fallbacks exhausted" in production. MEGA_TRAINERS is emptied so writerDocs' mega
// gauntlet (which throws for absent mega-trainer ids) doesn't require the full roster —
// keeping the test in the fast (<2s) suite instead of the ~1min full-pipeline path.

jest.mock('../../modules/trainerFallback', () => ({
    selectWithAutoFallback: jest.fn(() => null), // every slot: nothing found
}));

jest.mock('../../constants', () => ({
    ...jest.requireActual('../../constants'),
    MEGA_TRAINERS: [], // skip the mega-trainer gauntlet
}));

const { writerDocs } = require('../../writerDocs');
const { createDiagnostics, DIAGNOSTIC_CODES } = require('../../diagnostics');

function gymRewards() {
    const one = (n) => ({ id: `SPECIES_R${n}`, name: `R${n}` });
    return {
        gym1: one(1), gym2: one(2), gym3: one(3), gym4: one(4), gym5: one(5),
        gym6: one(6), gym7: one(7), gym8: one(8),
        slateportGrunts: one(9), shellyReward: one(10), wallyLilycove: one(11),
    };
}

function artifacts(trainer) {
    return {
        pokedex: { pokes: [], moves: {}, abilities: {} },
        trainers: { trainersData: [trainer], itemAssignments: {} },
        starters: { starters: ['SPECIES_A', 'SPECIES_B', 'SPECIES_C'] },
        wild: {
            extraStarters: [],
            gymRewards: gymRewards(),
            staticRewards: {},
            replacementLog: {},
            foundMegaEvos: [],
        },
    };
}

describe('degraded-team diagnostics (T-075)', () => {
    test('a trainer whose slots all fail records one TRAINER_SLOT_DROPPED per slot + one TRAINER_TEAM_SHORT', async () => {
        const trainer = {
            id: 'TRAINER_TEST', label: 'Testy', class: 'Test Class', level: 20,
            team: [{}, {}, {}, {}, {}, {}], reward: [], bag: [], colors: {},
        };
        const diag = createDiagnostics({ mirror: false });
        const { pokedex, trainers, starters, wild } = artifacts(trainer);

        await writerDocs(pokedex, trainers, starters, wild, null, { diag });

        const events = diag.all();
        const dropped = events.filter(e => e.code === DIAGNOSTIC_CODES.TRAINER_SLOT_DROPPED);
        const short = events.filter(e => e.code === DIAGNOSTIC_CODES.TRAINER_TEAM_SHORT);

        expect(dropped).toHaveLength(6);
        expect(dropped[0]).toMatchObject({
            severity: 'error',
            context: { trainerId: 'TRAINER_TEST', slotIndex: 0 },
        });
        expect(dropped[0].context).toHaveProperty('definition');

        expect(short).toHaveLength(1);
        expect(short[0]).toMatchObject({
            severity: 'warning',
            context: { trainerId: 'TRAINER_TEST', expected: 6, actual: 0, dropped: 6 },
        });
    });

    test('a fully-resolved team records nothing (no false positives)', async () => {
        // Restore the real fallback for this case so slots resolve normally would need a
        // real pool; instead assert the guard does not fire when the team is complete by
        // using a trainer with an empty definition (0 expected, 0 actual → not short).
        const trainer = {
            id: 'TRAINER_EMPTY', label: null, class: 'X', level: 5,
            team: [], reward: [], bag: [], colors: {},
        };
        const diag = createDiagnostics({ mirror: false });
        const { pokedex, trainers, starters, wild } = artifacts(trainer);

        await writerDocs(pokedex, trainers, starters, wild, null, { diag });

        expect(diag.counts()).toEqual({ fatal: 0, error: 0, warning: 0 });
    });

    test('writerDocs output does not leak a diagnostics field (bundle shape stays clean)', async () => {
        const trainer = {
            id: 'TRAINER_TEST', label: 'Testy', class: 'C', level: 10,
            team: [{}, {}], reward: [], bag: [], colors: {},
        };
        const diag = createDiagnostics({ mirror: false });
        const { pokedex, trainers, starters, wild } = artifacts(trainer);

        const docs = await writerDocs(pokedex, trainers, starters, wild, null, { diag });

        expect(Object.keys(docs).sort()).toEqual(['trainersResultsSimplified', 'typeColors', 'wildPokes']);
        expect(docs).not.toHaveProperty('diag');
        expect(docs).not.toHaveProperty('diagnostics');
    });
});
