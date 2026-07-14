'use strict';

// T-137 — electric terrain + Trick Room as full gimmicks (setter + 2 abusers), corpus-grounded
// (docs/research/electric-terrain.md, docs/research/trick-room.md). Scores mirror weatherAbuseScore.

const {
    isElectricTerrainSetter, electricTerrainAbuseScore, electricTerrainHolds, ensureElectricTerrainSetter,
    isTrickRoomSetter, trickRoomAbuseScore, trickRoomHolds, ensureTrickRoomSetter,
} = require('../../modules/gimmickPlan');

// A resolved member: { pokemon: { parsedTypes, baseAttack, baseSpAttack, baseSpeed, learnset, teachables }, ability, moves, item }.
const mem = (ability, moves = [], types = ['NORMAL'], extra = {}) =>
    ({ pokemon: { parsedTypes: types, baseAttack: 100, baseSpAttack: 100, baseSpeed: 80, learnset: [], teachables: [], ...extra }, ability, moves });
const learns = (...mv) => ({ learnset: mv.map(m => ({ level: 1, move: m })) });

describe('electric terrain — setter + score', () => {
    test('setters: Electric Surge / Hadron Engine ability, or the Electric Terrain move', () => {
        expect(isElectricTerrainSetter(mem('ELECTRIC_SURGE'))).toBe(true);
        expect(isElectricTerrainSetter(mem('HADRON_ENGINE'))).toBe(true);
        expect(isElectricTerrainSetter(mem('GUTS', ['MOVE_ELECTRIC_TERRAIN']))).toBe(true);
        expect(isElectricTerrainSetter(mem('GUTS'))).toBe(false);
    });
    test('abuser abilities score +3', () => {
        expect(electricTerrainAbuseScore(mem('SURGE_SURFER'))).toBeGreaterThanOrEqual(3);
        expect(electricTerrainAbuseScore(mem('QUARK_DRIVE'))).toBeGreaterThanOrEqual(3);
        expect(electricTerrainAbuseScore(mem('UNBURDEN'))).toBeGreaterThanOrEqual(3);
    });
    test('an Electric-type with a decent attacking stat scores +2 (abuser); a weak one does not', () => {
        expect(electricTerrainAbuseScore(mem('STATIC', [], ['ELECTRIC'], { baseAttack: 120 }))).toBe(2);
        expect(electricTerrainAbuseScore(mem('STATIC', [], ['ELECTRIC'], { baseAttack: 60, baseSpAttack: 60 }))).toBe(0);
    });
    test('a synergy move alone (+1) is not enough; a non-electric plain mon scores 0', () => {
        expect(electricTerrainAbuseScore(mem('GUTS', [], ['NORMAL'], learns('MOVE_RISING_VOLTAGE')))).toBe(1);
        expect(electricTerrainAbuseScore(mem('GUTS', [], ['NORMAL']))).toBe(0);
    });
});

describe('electric terrain — holds', () => {
    test('setter + 2 abusers holds', () => {
        const team = [mem('ELECTRIC_SURGE', [], ['ELECTRIC'], { baseAttack: 120 }), mem('SURGE_SURFER'), mem('QUARK_DRIVE')];
        expect(electricTerrainHolds(team)).toBe(true);
    });
    test('setter + only 1 abuser fails', () => {
        const team = [mem('ELECTRIC_SURGE', [], ['ELECTRIC'], { baseAttack: 60, baseSpAttack: 60 }), mem('SURGE_SURFER'), mem('GUTS')];
        expect(electricTerrainHolds(team)).toBe(false);
    });
    test('no setter fails even with abusers', () => {
        expect(electricTerrainHolds([mem('SURGE_SURFER'), mem('QUARK_DRIVE')])).toBe(false);
    });
    test('ensureElectricTerrainSetter injects the move when no ability-setter exists', () => {
        const team = [mem('GUTS', [], ['NORMAL'], learns('MOVE_ELECTRIC_TERRAIN')), mem('SURGE_SURFER'), mem('QUARK_DRIVE')];
        expect(electricTerrainHolds(team)).toBe(false);
        expect(ensureElectricTerrainSetter(team)).toBe(true);
        expect(electricTerrainHolds(team)).toBe(true);
    });
});

describe('trick room — setter + score', () => {
    test('setter = the Trick Room move', () => {
        expect(isTrickRoomSetter(mem('X', ['MOVE_TRICK_ROOM']))).toBe(true);
        expect(isTrickRoomSetter(mem('X', ['MOVE_TACKLE']))).toBe(false);
    });
    // Owner-validated (T-137): a TR abuser = any SLOW mon (offence is a ranking factor, not a gate) so a
    // Psychic room can assemble from slow-bulky mons.
    test('any SLOW mon scores +3 (abuser); a fast mon does not', () => {
        expect(trickRoomAbuseScore(mem('X', [], ['NORMAL'], { baseSpeed: 30, baseAttack: 130, baseSpAttack: 60 }))).toBeGreaterThanOrEqual(3); // slow + strong
        expect(trickRoomAbuseScore(mem('X', [], ['NORMAL'], { baseSpeed: 30, baseAttack: 70, baseSpAttack: 70 }))).toBeGreaterThanOrEqual(3); // slow + weak still counts
        expect(trickRoomAbuseScore(mem('X', [], ['NORMAL'], { baseSpeed: 110, baseAttack: 130 }))).toBe(0); // fast
    });
    test('a slow WALLBREAKER out-ranks a slow WALL (offence scales the rating, not eligibility)', () => {
        const { trickRoomBreakdown } = require('../../modules/gimmickPlan');
        const breaker = trickRoomBreakdown(mem('X', [], ['NORMAL'], { baseSpeed: 20, baseAttack: 140, baseSpAttack: 60 })).total;
        const wall = trickRoomBreakdown(mem('X', [], ['NORMAL'], { baseSpeed: 20, baseAttack: 60, baseSpAttack: 60 })).total;
        expect(breaker).toBeGreaterThan(wall);
    });
    test('Gyro Ball (+1) and Room Service (+1) stack on a slow mon', () => {
        const base = { baseSpeed: 20, baseAttack: 120, baseSpAttack: 60 };
        expect(trickRoomAbuseScore(mem('X', [], ['STEEL'], { ...base, ...learns('MOVE_GYRO_BALL') }))).toBe(4);
        expect(trickRoomAbuseScore({ ...mem('X', [], ['NORMAL'], base), item: 'Room Service' })).toBe(4);
    });
});

describe('trick room — holds', () => {
    const slowStrong = () => mem('X', [], ['NORMAL'], { baseSpeed: 25, baseAttack: 130, baseSpAttack: 60 });
    test('TR setter + 2 slow-strong abusers holds', () => {
        const team = [mem('X', ['MOVE_TRICK_ROOM'], ['PSYCHIC'], { baseSpeed: 20 }), slowStrong(), slowStrong()];
        expect(trickRoomHolds(team)).toBe(true);
    });
    test('setter + 1 abuser fails; no setter fails', () => {
        // a FAST setter (not itself a TR abuser) + 1 slow abuser + 1 fast filler = only 1 abuser
        const fastSetter = mem('X', ['MOVE_TRICK_ROOM'], ['PSYCHIC'], { baseSpeed: 120 });
        const fastFiller = mem('Y', [], ['NORMAL'], { baseSpeed: 100 });
        expect(trickRoomHolds([fastSetter, slowStrong(), fastFiller])).toBe(false);
        expect(trickRoomHolds([slowStrong(), slowStrong()])).toBe(false); // no setter
    });
    test('ensureTrickRoomSetter injects the move on a non-abuser learner', () => {
        const team = [mem('LEVITATE', [], ['STEEL'], { baseSpeed: 30, baseAttack: 60, baseSpAttack: 60, ...learns('MOVE_TRICK_ROOM') }), slowStrong(), slowStrong()];
        expect(trickRoomHolds(team)).toBe(false);
        expect(ensureTrickRoomSetter(team)).toBe(true);
        expect(trickRoomHolds(team)).toBe(true);
    });
});
