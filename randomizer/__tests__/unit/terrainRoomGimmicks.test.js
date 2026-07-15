'use strict';

// T-137 — electric terrain + Trick Room as full gimmicks (setter + 2 abusers), corpus-grounded
// (docs/research/electric-terrain.md, docs/research/trick-room.md). Scores mirror weatherAbuseScore.

const {
    isElectricTerrainSetter, electricTerrainAbuseScore, electricTerrainHolds, ensureElectricTerrainSetter,
    isTrickRoomSetter, trickRoomAbuseScore, trickRoomHolds, ensureTrickRoomSetter,
    trickRoomBreakdown, electricTerrainBreakdown, weatherAbuseBreakdown,
    isTrapSetter, perishTrapAbuseScore, trappingHolds, ensureTrapCore, gimmickHolds, emergentGimmick, GIMMICK_SPEC,
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

    // T-138 — a FULL room needs 2 setters + 4 slow abusers.
    test('roomStyle full requires 2 setters + 4 abusers; ensureTrickRoomSetter injects 2 setters', () => {
        const learnerSlow = () => mem('X', [], ['PSYCHIC'], { baseSpeed: 25, baseAttack: 110, baseSpAttack: 60, ...learns('MOVE_TRICK_ROOM') });
        // 4 slow abusers, 2 of which can learn TR → after injecting 2 setters, full room holds.
        const team = [learnerSlow(), learnerSlow(), slowStrong(), slowStrong()];
        expect(trickRoomHolds(team, { roomStyle: 'full' })).toBe(false); // no setters yet
        expect(ensureTrickRoomSetter(team, 2)).toBe(true);
        expect(team.filter(m => (m.moves || []).includes('MOVE_TRICK_ROOM')).length).toBe(2);
        expect(trickRoomHolds(team, { roomStyle: 'full' })).toBe(true);
        // one setter + 3 abusers is NOT a full room
        const half = [learnerSlow(), slowStrong(), slowStrong()];
        ensureTrickRoomSetter(half, 1);
        expect(trickRoomHolds(half, { roomStyle: 'full' })).toBe(false); // only 1 setter, 3 abusers
        expect(trickRoomHolds(half)).toBe(true);                          // but a normal/half room holds
    });
});

// T-109 — for a DOUBLES trainer, the abuser RANKING scores each mon's base quality off its doubles
// rating (ratingDoubles), not its singles rating; the doubles flag defaults false → singles unchanged.
describe('T-109 — gimmick abuser ranking uses the doubles rating for doubles trainers', () => {
    const withRatings = (extra) => ({ parsedTypes: ['PSYCHIC'], baseAttack: 60, baseSpAttack: 130, baseSpeed: 30, learnset: [], teachables: [], parsedAbilities: [], rating: { absoluteRating: 5.0 }, ratingDoubles: 8.0, ...extra });
    test('trickRoomBreakdown: doubles=true ranks off ratingDoubles (higher here), false off singles', () => {
        const mon = withRatings();
        expect(trickRoomBreakdown(mon, true).total).toBeGreaterThan(trickRoomBreakdown(mon, false).total);
    });
    test('electricTerrainBreakdown routes the base to ratingDoubles for doubles', () => {
        const mon = withRatings({ parsedTypes: ['ELECTRIC'], baseAttack: 120, baseSpeed: 100, parsedAbilities: ['SURGE_SURFER'] });
        expect(electricTerrainBreakdown(mon, true).total).toBeGreaterThan(electricTerrainBreakdown(mon, false).total);
    });
    test('weatherAbuseBreakdown routes the base to ratingDoubles for doubles', () => {
        const mon = withRatings({ parsedTypes: ['FIRE'], baseAttack: 120, baseSpeed: 100 });
        expect(weatherAbuseBreakdown(mon, 'sun', true).total).toBeGreaterThan(weatherAbuseBreakdown(mon, 'sun', false).total);
    });
});

// ── T-124 — PERISH-TRAP gimmick (Shadow Tag trapper + Perish Song core; docs/research/trapping.md) ──────
describe('perish-trap — setter, core score, holds, retrofit, emergence', () => {
    test('the SETTER is a Shadow Tag trapper (ability); nothing else counts', () => {
        expect(isTrapSetter(mem('SHADOW_TAG'))).toBe(true);
        expect(isTrapSetter(mem('ARENA_TRAP'))).toBe(false);  // singles trapper, not the doubles perish-trap setter
        expect(isTrapSetter(mem('LEVITATE'))).toBe(false);
    });
    test('the CORE score is the Perish Song user: 0 without it, +3 with, +1 each for Protect/Detect and Substitute', () => {
        expect(perishTrapAbuseScore(mem('PRESSURE', [], ['GHOST']))).toBe(0);                                  // can't learn Perish Song
        expect(perishTrapAbuseScore(mem('PRESSURE', [], ['GHOST'], learns('MOVE_PERISH_SONG')))).toBe(3);
        expect(perishTrapAbuseScore(mem('PRESSURE', [], ['GHOST'], learns('MOVE_PERISH_SONG', 'MOVE_PROTECT', 'MOVE_SUBSTITUTE')))).toBe(5);
    });
    test('HOLDS needs a Shadow Tag trapper AND an actually-equipped Perish Song (not just the potential)', () => {
        const gothi = mem('SHADOW_TAG', ['MOVE_PERISH_SONG'], ['PSYCHIC'], learns('MOVE_PERISH_SONG', 'MOVE_PROTECT'));
        const plain = mem('LEVITATE', ['MOVE_SHADOW_BALL'], ['GHOST']);
        const perisherNoTag = mem('LEVITATE', ['MOVE_PERISH_SONG'], ['GHOST'], learns('MOVE_PERISH_SONG'));
        const tagCanLearnButUnequipped = mem('SHADOW_TAG', ['MOVE_FAKE_OUT'], ['PSYCHIC'], learns('MOVE_PERISH_SONG'));
        expect(trappingHolds([gothi, plain])).toBe(true);
        expect(trappingHolds([perisherNoTag, plain])).toBe(false);            // no trapper
        expect(trappingHolds([tagCanLearnButUnequipped, plain])).toBe(false); // trapper, but Perish Song not equipped
        expect(gimmickHolds('trapping', [gothi, plain])).toBe(true);          // routed through the generic entry
    });
    test('ensureTrapCore retrofits Perish Song onto the trapper when it is missing (makes it hold)', () => {
        const team = [mem('SHADOW_TAG', ['MOVE_FAKE_OUT'], ['PSYCHIC'], learns('MOVE_PERISH_SONG')), mem('LEVITATE', ['MOVE_SHADOW_BALL'], ['GHOST'])];
        expect(trappingHolds(team)).toBe(false);
        expect(ensureTrapCore(team)).toBe(true);
        expect(team[0].moves).toContain('MOVE_PERISH_SONG');
        expect(trappingHolds(team)).toBe(true);
        expect(ensureTrapCore(team)).toBe(false); // idempotent — already holds
    });
    test('ensureTrapCore does nothing without a trapper (Shadow Tag is an ability, cannot be injected)', () => {
        const team = [mem('LEVITATE', [], ['GHOST'], learns('MOVE_PERISH_SONG'))];
        expect(ensureTrapCore(team)).toBe(false);
    });
    test('emergent perish-trap fires in DOUBLES only (never contaminates singles)', () => {
        const team = [mem('SHADOW_TAG', ['MOVE_PERISH_SONG'], ['PSYCHIC'], learns('MOVE_PERISH_SONG')), mem('LEVITATE', ['MOVE_SHADOW_BALL'], ['GHOST'])];
        expect(emergentGimmick({ soph: 1, team, doubles: true })).toEqual({ gimmick: 'trapping' });
        expect(emergentGimmick({ soph: 1, team, doubles: false })).toBeNull();
    });
    test('GIMMICK_SPEC.trapping targets a single core (abuserTarget 1), unlike weather/room', () => {
        expect(GIMMICK_SPEC.trapping.abuserTarget).toBe(1);
        expect(GIMMICK_SPEC.trapping.setterAbilities).toEqual(['SHADOW_TAG']);
    });
});
