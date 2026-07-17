'use strict';

// T-129 — items respect roles. A Choice item (Band/Specs/Scarf) locks the holder into the first move it
// uses, so it must NEVER be scored for a mon whose set carries a move it can't be locked into: any STATUS
// move (hazards / setup / status / recovery) or a REACTIVE damaging move (Counter / Mirror Coat / Metal
// Burst). Regression for Champion Steven's Solgaleo = Choice Specs + Stealth Rock (and + Metal Burst).

const { rateItemForAPokemon, rateMove } = require('../../rating');
const moves = require('../fixtures/miniMoves');
const { STARMIE, MACHAMP } = require('../fixtures/miniPokes');

const rated = mv => ({ ...mv, rating: rateMove(mv) });
const set = (...ids) => ids.map(id => rated(moves[id]));
// deviation=0 → the rater's random deviation term collapses to 1, so results are deterministic.
const rate = (item, poke, moveset) => rateItemForAPokemon(item, poke, null, moveset, 50, 5, 0);

describe('rateItemForAPokemon — Choice items respect roles (T-129)', () => {
    test('Choice Specs rates > 0 for a pure special-attacking set', () => {
        const clean = set('MOVE_SURF', 'MOVE_THUNDERBOLT', 'MOVE_FLAMETHROWER', 'MOVE_BLIZZARD');
        expect(rate('Choice Specs', STARMIE, clean)).toBeGreaterThan(0);
    });

    test('Choice Specs = 0 when the set carries a hazard/status move (Solgaleo + Stealth Rock)', () => {
        const withRocks = set('MOVE_SURF', 'MOVE_THUNDERBOLT', 'MOVE_FLAMETHROWER', 'MOVE_STEALTH_ROCK');
        expect(rate('Choice Specs', STARMIE, withRocks)).toBe(0);
    });

    test('Choice Scarf = 0 with a status move (Toxic)', () => {
        const withToxic = set('MOVE_SURF', 'MOVE_THUNDERBOLT', 'MOVE_FLAMETHROWER', 'MOVE_TOXIC');
        expect(rate('Choice Scarf', STARMIE, withToxic)).toBe(0);
    });

    test('Choice Band = 0 with a reactive damaging move (Counter / Mirror Coat / Metal Burst)', () => {
        const withCounter = set('MOVE_CLOSE_COMBAT', 'MOVE_EARTHQUAKE', 'MOVE_KNOCK_OFF', 'MOVE_COUNTER');
        expect(rate('Choice Band', MACHAMP, withCounter)).toBe(0);
    });

    test('Choice Band rates > 0 for a pure physical-attacking set', () => {
        const clean = set('MOVE_CLOSE_COMBAT', 'MOVE_EARTHQUAKE', 'MOVE_KNOCK_OFF', 'MOVE_MEGA_PUNCH');
        expect(rate('Choice Band', MACHAMP, clean)).toBeGreaterThan(0);
    });

    test('a damaging pivot move (U-turn) does NOT block a Choice item', () => {
        const pivot = set('MOVE_CLOSE_COMBAT', 'MOVE_EARTHQUAKE', 'MOVE_KNOCK_OFF', 'MOVE_U_TURN');
        expect(rate('Choice Band', MACHAMP, pivot)).toBeGreaterThan(0);
    });
});

// T-147 — anti-support tech (Safety Goggles vs Rage Powder/Spore; Covert Cloak vs Fake Out/secondaries) is
// worth much more on an OFFENSIVE doubles mon; a dedicated support does not get the bump.
describe('rateItemForAPokemon — anti-support items scale up on offensive doubles mons (T-147)', () => {
    const dbl = (item, poke, moveset, doubles) => rateItemForAPokemon(item, poke, null, moveset, 50, 5, 0, doubles);
    const atkSet = set('MOVE_SURF', 'MOVE_THUNDERBOLT', 'MOVE_FLAMETHROWER', 'MOVE_BLIZZARD');

    test('Safety Goggles: worth more on an offensive doubles mon than in singles', () => {
        expect(dbl('Safety Goggles', STARMIE, atkSet, true)).toBeGreaterThan(dbl('Safety Goggles', STARMIE, atkSet, false));
        expect(dbl('Safety Goggles', STARMIE, atkSet, false)).toBeGreaterThan(0);
    });

    test('Covert Cloak: marginal in singles, a real pick on an offensive doubles mon', () => {
        expect(dbl('Covert Cloak', STARMIE, atkSet, true)).toBeGreaterThan(dbl('Covert Cloak', STARMIE, atkSet, false));
        expect(dbl('Covert Cloak', STARMIE, atkSet, true)).toBeGreaterThan(0);
    });

    test('a dedicated support does NOT get the offensive-doubles bump', () => {
        const support = { ...STARMIE, isSupportDoubles: true };
        expect(dbl('Safety Goggles', support, atkSet, true)).toBe(dbl('Safety Goggles', STARMIE, atkSet, false));
    });
});
