'use strict';

// T-276 — resolving the trainer teams is the other end of the bar: ~32% of a run (8.5 s in 190
// resolveTrainerTeam calls on the measured run), and it used to emit nothing, so the bar sat at 80%
// until the run finished. writerDocs now reports progress as trainers are resolved.
//
// Drives the REAL writerDocs loop, with the same fault injection the degraded-team test uses
// (selectWithAutoFallback → null keeps every team empty and the loop fast; MEGA_TRAINERS emptied so
// the mega gauntlet doesn't demand the full roster).

jest.mock('../../modules/trainerFallback', () => ({ selectWithAutoFallback: jest.fn(() => null) }));
jest.mock('../../constants', () => ({ ...jest.requireActual('../../constants'), MEGA_TRAINERS: [] }));

const { writerDocs } = require('../../writerDocs');

const gymRewards = () => {
    const one = (n) => ({ id: `SPECIES_R${n}`, name: `R${n}` });
    return {
        gym1: one(1), gym2: one(2), gym3: one(3), gym4: one(4), gym5: one(5),
        gym6: one(6), gym7: one(7), gym8: one(8),
        slateportGrunts: one(9), shellyReward: one(10), wallyLilycove: one(11),
    };
};

const trainer = (i) => ({
    id: `TRAINER_${i}`, label: `T${i}`, class: 'Test Class', level: 20,
    team: [{}, {}], reward: [], bag: [], colors: {},
});

function artifacts(count) {
    return {
        pokedex: { pokes: [], moves: {}, abilities: {} },
        trainers: { trainersData: Array.from({ length: count }, (_, i) => trainer(i)), itemAssignments: {} },
        starters: { starters: ['SPECIES_A', 'SPECIES_B', 'SPECIES_C'] },
        wild: {
            extraStarters: [], gymRewards: gymRewards(), staticRewards: {},
            replacementLog: {}, foundMegaEvos: [],
        },
    };
}

// Run writerDocs over `count` trainers with a recording onProgress; returns the fractions reported.
async function fractions(count) {
    const seen = [];
    const { pokedex, trainers, starters, wild } = artifacts(count);
    await writerDocs(pokedex, trainers, starters, wild, null, { onProgress: (f) => seen.push(f) });
    return seen;
}

describe('writerDocs reports trainer-resolution progress (T-276)', () => {
    test('it reports as trainers are resolved, not once at the end', async () => {
        const seen = await fractions(60);
        expect(seen.length).toBeGreaterThan(10);
        expect(seen.filter(f => f < 0.9).length).toBeGreaterThan(5);
    });

    test('fractions are monotonic, inside 0..1, and reach the end of the unit', async () => {
        const seen = await fractions(60);
        expect(seen).toEqual([...seen].sort((a, b) => a - b));
        expect(Math.min(...seen)).toBeGreaterThanOrEqual(0);
        expect(seen.at(-1)).toBeLessThanOrEqual(1);
        expect(seen.at(-1)).toBeGreaterThan(0.9);
    });

    test('progress scales with the roster: 4x the trainers, the same shape of report', async () => {
        const few = await fractions(25);
        const many = await fractions(100);
        expect(many.at(-1)).toBeGreaterThan(0.9);
        expect(few.at(-1)).toBeGreaterThan(0.9);
        expect(many.length).toBeLessThan(200);   // throttled, not one event per trainer
    });

    test('the docs are unchanged when nobody is listening', async () => {
        const { pokedex, trainers, starters, wild } = artifacts(5);
        const withHook = await writerDocs(pokedex, trainers, starters, wild, null, { onProgress: () => {} });
        const without = await writerDocs(pokedex, trainers, starters, wild, null, {});
        expect(Object.keys(without.trainersResultsSimplified)).toHaveLength(5);
        expect(JSON.stringify(without)).toBe(JSON.stringify(withHook));
    });
});
