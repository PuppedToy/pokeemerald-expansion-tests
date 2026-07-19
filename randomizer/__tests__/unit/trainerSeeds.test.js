'use strict';

// T-165 — the solo Space Center Tabitha (no-tag option) must carry the sandstorm seed like every other
// Tabitha, and — unlike the tag TABITHA_MOSSDEEP — she owns her weather (no partner to abuse).

const { getTrainerSeed } = require('../../modules/trainerSeeds');

describe('getTrainerSeed — TABITHA_MOSSDEEP_NO_TAG (T-165)', () => {
    test('seeds the solo no-tag Tabitha to a sandstorm weather gimmick', () => {
        const seed = getTrainerSeed('TRAINER_TABITHA_MOSSDEEP_NO_TAG');
        expect(seed).toEqual({ base: 'bulky_offense', gimmicks: ['weather'], weather: 'sand' });
    });

    test('matches the other Tabitha battles (same sand seed)', () => {
        expect(getTrainerSeed('TRAINER_TABITHA_MOSSDEEP_NO_TAG'))
            .toEqual(getTrainerSeed('TRAINER_TABITHA_MT_CHIMNEY'));
    });

    test('unseeded trainers still return null (no accidental broadening)', () => {
        expect(getTrainerSeed('TRAINER_YOUNGSTER_JOEY')).toBeNull();
    });
});
