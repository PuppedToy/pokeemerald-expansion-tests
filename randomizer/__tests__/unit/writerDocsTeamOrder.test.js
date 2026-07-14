'use strict';

const { buildTrainersResultsSimplified } = require('../../writerDocs');

// Build a trainersResults-shaped map: each member's pokemon is an object with an id,
// mirroring what writerDocs assembles before simplification.
function makeMember(speciesId, extra = {}) {
    return { pokemon: { id: speciesId }, moves: [], ...extra };
}

function makeTrainers(overrides = {}) {
    return {
        TRAINER_A: {
            level: 20,
            class: 'Cooltrainer',
            reward: [],
            isBoss: false,
            isPartner: false,
            location: null,
            preventShuffle: false,
            team: [
                makeMember('SPECIES_ONE'),
                makeMember('SPECIES_TWO'),
                makeMember('SPECIES_THREE'),
                makeMember('SPECIES_FOUR'),
                makeMember('SPECIES_FIVE'),
                makeMember('SPECIES_SIX'),
            ],
            ...overrides,
        },
    };
}

const ids = (team) => team.map(m => m.pokemon);

describe('buildTrainersResultsSimplified', () => {
    test('simplifies pokemon objects to their id', () => {
        const res = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: true, baseRngSeed: 1 });
        expect(res.TRAINER_A.team.every(m => typeof m.pokemon === 'string')).toBe(true);
    });

    test('in-game team is a permutation of the default team (no members lost)', () => {
        const trainers = makeTrainers();
        const defaultIds = ids(trainers.TRAINER_A.team.map(m => ({ pokemon: m.pokemon.id })));
        const res = buildTrainersResultsSimplified(trainers, { showExactPositions: false, baseRngSeed: 7 });
        expect(ids(res.TRAINER_A.team).slice().sort()).toEqual(defaultIds.slice().sort());
    });

    test('T-044 — preserves the trainer.colors object into the viewer data', () => {
        const colors = { kind: 'typed', bar: ['#EE8130', '#F7C94B'], title: '#EE8130', railBg: '#3A1206', cardBg: '#1E0C05' };
        const res = buildTrainersResultsSimplified(makeTrainers({ colors }), { showExactPositions: true, baseRngSeed: 1 });
        expect(res.TRAINER_A.colors).toEqual(colors);
    });

    test('the ordering layer ALWAYS runs — team differs from default order for some seed', () => {
        const trainers = makeTrainers();
        const defaultIds = trainers.TRAINER_A.team.map(m => m.pokemon.id);
        const anyShuffled = [1, 2, 3, 4, 5, 6, 7, 8].some(seed => {
            const res = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: false, baseRngSeed: seed });
            return JSON.stringify(ids(res.TRAINER_A.team)) !== JSON.stringify(defaultIds);
        });
        expect(anyShuffled).toBe(true);
    });

    test('in-game team is INDEPENDENT of showExactPositions (same seed → same team)', () => {
        const on  = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: true,  baseRngSeed: 42 });
        const off = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: false, baseRngSeed: 42 });
        expect(ids(off.TRAINER_A.team)).toEqual(ids(on.TRAINER_A.team));
    });

    test('reproducible — same seed produces the same in-game team', () => {
        const a = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: true, baseRngSeed: 99 });
        const b = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: true, baseRngSeed: 99 });
        expect(ids(a.TRAINER_A.team)).toEqual(ids(b.TRAINER_A.team));
    });

    test('showExactPositions OFF → displayTeam present and equals pre-shuffle (default) order', () => {
        const trainers = makeTrainers();
        const defaultIds = trainers.TRAINER_A.team.map(m => m.pokemon.id);
        const res = buildTrainersResultsSimplified(trainers, { showExactPositions: false, baseRngSeed: 7 });
        expect(res.TRAINER_A.displayTeam).toBeDefined();
        expect(ids(res.TRAINER_A.displayTeam)).toEqual(defaultIds);
    });

    test('showExactPositions ON → no displayTeam (docs fall back to in-game team)', () => {
        const res = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: true, baseRngSeed: 7 });
        expect(res.TRAINER_A.displayTeam).toBeUndefined();
    });

    // T-132 — preventShuffle was REMOVED (its purpose, keeping a designed order, is now served by
    // applyLeadLogic). The flag is ignored: every trainer shuffles + gets a displayTeam when OFF.
    test('preventShuffle is IGNORED (removed) — the team still shuffles + gets a displayTeam when OFF', () => {
        const trainers = makeTrainers({ preventShuffle: true }); // flag no longer has any effect
        const res = buildTrainersResultsSimplified(trainers, { showExactPositions: false, baseRngSeed: 7 });
        expect(res.TRAINER_A.displayTeam).toBeDefined();
    });
});
