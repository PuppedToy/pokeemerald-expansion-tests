'use strict';

// TDD (T-095 / ADR-015): moves that are near-worthless in singles but pivotal in doubles — redirection
// (Follow Me/Rage Powder), ally buffs (Helping Hand, Decorate), team protection (Wide/Quick Guard),
// speed control (Trick Room, Tailwind) and self-Protect — get a doubles-specific floor. Plain
// attacks are untouched by this override.

const { rateMove, rateMoveDoubles } = require('../../rating');
const moves = require('../fixtures/miniMoves');

describe('rateMoveDoubles — doubles support/gimmick re-valuation', () => {
    test('Wide Guard (~0 in singles) becomes a positive doubles support move', () => {
        expect(rateMove(moves.MOVE_WIDE_GUARD)).toBeLessThan(rateMoveDoubles(moves.MOVE_WIDE_GUARD));
        expect(rateMoveDoubles(moves.MOVE_WIDE_GUARD)).toBeGreaterThanOrEqual(5);
    });

    test('Protect is worth more in doubles than in singles', () => {
        expect(rateMoveDoubles(moves.MOVE_PROTECT)).toBeGreaterThanOrEqual(rateMove(moves.MOVE_PROTECT));
        expect(rateMoveDoubles(moves.MOVE_PROTECT)).toBeGreaterThanOrEqual(5.5);
    });

    test('a redirection move (Follow Me) is highly valued in doubles', () => {
        const followMe = { id: 'MOVE_FOLLOW_ME', power: 0, target: 'MOVE_TARGET_USER' };
        expect(rateMoveDoubles(followMe)).toBeGreaterThanOrEqual(7);
        expect(rateMoveDoubles(followMe)).toBeGreaterThan(rateMove(followMe));
    });

    test('speed control (Trick Room) is a strong doubles gimmick', () => {
        const trickRoom = { id: 'MOVE_TRICK_ROOM', power: 0, target: 'MOVE_TARGET_ALL_BATTLERS' };
        expect(rateMoveDoubles(trickRoom)).toBeGreaterThanOrEqual(7);
        expect(rateMoveDoubles(trickRoom)).toBeGreaterThan(rateMove(trickRoom));
    });

    test('a plain single-target attack is not affected by the support override', () => {
        expect(rateMoveDoubles(moves.MOVE_TACKLE)).toBe(rateMove(moves.MOVE_TACKLE));
    });
});
