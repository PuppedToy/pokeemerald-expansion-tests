'use strict';

// T-132 / ADR-017 — gimmick success conditions (the SSOT for "did the gimmick materialise"). Weather =
// setter + >= 2 abusers, with the BROAD abuser definition from docs/research/weather.md.

const { gimmickHolds, weatherHolds } = require('../../modules/gimmickPlan');

// A resolved member: { pokemon: { parsedTypes }, ability, moves }.
const mem = (ability, moves = [], types = ['NORMAL']) => ({ pokemon: { parsedTypes: types }, ability, moves });

describe('gimmickPlan — weather success condition', () => {
    test('rain: setter + 2 abuser abilities holds', () => {
        const team = [mem('DRIZZLE'), mem('SWIFT_SWIM'), mem('SWIFT_SWIM')];
        expect(weatherHolds(team, {}, 'rain')).toBe(true);
    });

    test('setter but only ONE abuser fails', () => {
        const team = [mem('DRIZZLE'), mem('SWIFT_SWIM'), mem('GUTS')];
        expect(weatherHolds(team, {}, 'rain')).toBe(false);
    });

    test('no setter fails even with abusers', () => {
        expect(weatherHolds([mem('SWIFT_SWIM'), mem('SWIFT_SWIM')], {}, 'rain')).toBe(false);
    });

    test('the setter counts as an abuser via boosted STAB (Kyogre: Drizzle + Water)', () => {
        const team = [mem('DRIZZLE', [], ['WATER']), mem('SWIFT_SWIM')]; // setter-abuser + 1 abuser = 2
        expect(weatherHolds(team, {}, 'rain')).toBe(true);
    });

    test('a boosted-STAB attacker (via the moves DB) counts as an abuser', () => {
        // With the moves DB, a boosted-STAB abuser needs an actual boosted-type attacking move.
        const moves = { MOVE_SURF: { type: 'WATER', category: 'DAMAGE_CATEGORY_SPECIAL', power: 90 } };
        const team = [mem('DRIZZLE', ['MOVE_SURF'], ['WATER']), mem('LEVITATE', ['MOVE_SURF'], ['GHOST'])];
        expect(weatherHolds(team, { moves }, 'rain')).toBe(true);
        // a Water TYPE with no water move is NOT a boosted-STAB abuser once the DB is available
        const noMove = [mem('DRIZZLE', ['MOVE_SURF'], ['WATER']), mem('LEVITATE', ['MOVE_TACKLE'], ['WATER'])];
        const moves2 = { ...moves, MOVE_TACKLE: { type: 'NORMAL', category: 'DAMAGE_CATEGORY_PHYSICAL', power: 40 } };
        expect(weatherHolds(noMove, { moves: moves2 }, 'rain')).toBe(false); // setter-abuser only → 1
    });

    test('a weather-synergy move counts as an abuser (rain + Thunder)', () => {
        const team = [mem('DRIZZLE', [], ['WATER']), mem('STATIC', ['MOVE_THUNDER'], ['ELECTRIC'])];
        expect(weatherHolds(team, {}, 'rain')).toBe(true);
    });

    test('a move-setter (Rain Dance) satisfies the setter requirement (force path)', () => {
        const team = [mem('DROUGHT_UNRELATED', ['MOVE_RAIN_DANCE'], ['WATER']), mem('SWIFT_SWIM')];
        expect(weatherHolds(team, {}, 'rain')).toBe(true);
    });

    test('subtype is inferred from the actual setter when not given', () => {
        // A sun team: Drought setter + Chlorophyll abuser + a Fire attacker (boosted STAB).
        const team = [mem('DROUGHT', [], ['FIRE']), mem('CHLOROPHYLL'), mem('BLAZE', [], ['FIRE'])];
        expect(weatherHolds(team, {})).toBe(true); // subtype inferred = sun
    });
});

describe('gimmickPlan — other gimmicks', () => {
    test("trick_room needs a Trick Room setter move", () => {
        expect(gimmickHolds('trick_room', [mem('X', ['MOVE_TRICK_ROOM'])])).toBe(true);
        expect(gimmickHolds('trick_room', [mem('X', ['MOVE_TACKLE'])])).toBe(false);
    });
    test('an unknown gimmick holds (no condition to fail)', () => {
        expect(gimmickHolds('mystery', [mem('X')])).toBe(true);
    });
});
