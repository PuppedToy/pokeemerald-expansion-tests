'use strict';

// T-064 — Meloetta-Pirouette handling:
//  (A) Pirouette is battle-only → banned from picking; base Aria stays placeable.
//  (B) Aria's tier is a weighted blend of Aria (0.55) and Pirouette (0.45) ratings.
//  (C) A trainer's Meloetta always carries Relic Song (its Aria<->Pirouette transform move).

const moves = require('../fixtures/miniMoves');
const rng = require('../../rng');
const { applyMeloettaTierBlend } = require('../../meloetta');
const { tierFromRating, chooseMoveset } = require('../../rating');
const {
    MELOETTA_ARIA_ID, MELOETTA_PIROUETTE_ID, MELOETTA_ARIA_WEIGHT, MELOETTA_PIROUETTE_WEIGHT,
} = require('../../constants');
const { BANNED_SPECIES_FOR_PICKING } = require('../../modules/wildModule');

describe('Meloetta-Pirouette exclusion (T-064)', () => {
    test('Pirouette is banned from picking (battle-only form)', () => {
        expect(BANNED_SPECIES_FOR_PICKING).toContain('SPECIES_MELOETTA_PIROUETTE');
    });
    test('base Aria stays placeable', () => {
        expect(BANNED_SPECIES_FOR_PICKING).not.toContain('SPECIES_MELOETTA_ARIA');
    });
});

describe('Meloetta tier blend (T-064)', () => {
    const mk = (id, absoluteRating, tier) => ({ id, rating: { absoluteRating, tier } });

    test('Aria rating becomes 0.55*Aria + 0.45*Pirouette and its tier is recomputed', () => {
        const aria = mk(MELOETTA_ARIA_ID, 8.3644, 'OU');
        const piro = mk(MELOETTA_PIROUETTE_ID, 9.394, 'UBERS');
        const result = applyMeloettaTierBlend([aria, piro]);
        const expected = MELOETTA_ARIA_WEIGHT * 8.3644 + MELOETTA_PIROUETTE_WEIGHT * 9.394;
        expect(aria.rating.absoluteRating).toBeCloseTo(expected, 6);
        expect(aria.rating.tier).toBe(tierFromRating(expected, { isStoneMega: false }));
        expect(result).toBe(aria);
    });

    test('Pirouette rating is left untouched', () => {
        const aria = mk(MELOETTA_ARIA_ID, 8.0, 'OU');
        const piro = mk(MELOETTA_PIROUETTE_ID, 9.4, 'UBERS');
        applyMeloettaTierBlend([aria, piro]);
        expect(piro.rating.absoluteRating).toBe(9.4);
    });

    test('no-op when Pirouette is absent from the pokedex', () => {
        const aria = mk(MELOETTA_ARIA_ID, 8.0, 'OU');
        const result = applyMeloettaTierBlend([aria]);
        expect(result).toBeNull();
        expect(aria.rating.absoluteRating).toBe(8.0);
    });
});

describe('Meloetta trainer moveset forces Relic Song (T-064)', () => {
    // A physical attacker (SpAtk 10) with 4 strong physical moves of distinct types. Relic Song is a
    // Normal SPECIAL move, so it rates near-worthless here and would never make the natural top 4 —
    // it only appears if the Meloetta-specific forcing puts it there.
    const physicalRelicSongUser = () => ({
        id: 'SPECIES_MELOETTA_ARIA', name: 'Meloetta', family: 'P_FAMILY_MELOETTA',
        parsedTypes: ['NORMAL', 'FIGHTING'], parsedAbilities: ['SERENE_GRACE'],
        baseHP: 100, baseAttack: 128, baseDefense: 90, baseSpeed: 128, baseSpAttack: 10, baseSpDefense: 77,
        learnset: [
            { level: '1', move: 'MOVE_CLOSE_COMBAT' },
            { level: '1', move: 'MOVE_EARTHQUAKE' },
            { level: '1', move: 'MOVE_KNOCK_OFF' },
            { level: '1', move: 'MOVE_FLY' },
            { level: '50', move: 'MOVE_RELIC_SONG' },
        ],
        teachables: [],
    });

    test('a Meloetta always carries Relic Song even when 4 stronger moves would fill the set', () => {
        rng.seed(1);
        const { moveset } = chooseMoveset(physicalRelicSongUser(), moves, 100, [], null, null, null, 0);
        expect(moveset).toContain('MOVE_RELIC_SONG');
    });

    test('a non-Meloetta that can learn Relic Song is NOT forced to take it', () => {
        const notMeloetta = { ...physicalRelicSongUser(), id: 'SPECIES_LOPUNNY', family: 'P_FAMILY_BUNEARY' };
        rng.seed(1);
        const { moveset } = chooseMoveset(notMeloetta, moves, 100, [], null, null, null, 0);
        expect(moveset).not.toContain('MOVE_RELIC_SONG');
    });
});
