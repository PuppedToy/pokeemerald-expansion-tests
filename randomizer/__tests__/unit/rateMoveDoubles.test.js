'use strict';

// TDD (T-094 / ADR-015): doubles move rating — spread damage moves gain value (they hit both foes),
// single-target damage is unchanged, and status moves get no damage spread bonus. move.target is
// normalised, including the gen-conditional Surf/Earthquake ternary strings.

const { rateMove, rateMoveDoubles, isSpreadMove } = require('../../rating');
const moves = require('../fixtures/miniMoves');

describe('isSpreadMove (target normalisation)', () => {
    test('true for BOTH / FOES_AND_ALLY / ALL_BATTLERS, incl. gen-conditional strings', () => {
        expect(isSpreadMove({ target: 'MOVE_TARGET_BOTH' })).toBe(true);
        expect(isSpreadMove({ target: 'MOVE_TARGET_FOES_AND_ALLY' })).toBe(true);
        expect(isSpreadMove({ target: 'MOVE_TARGET_ALL_BATTLERS' })).toBe(true);
        expect(isSpreadMove({ target: 'B_UPDATED_MOVE_DATA >= GEN_4 ? MOVE_TARGET_FOES_AND_ALLY : MOVE_TARGET_BOTH' })).toBe(true);
    });
    test('false for single-target / self / none', () => {
        expect(isSpreadMove({ target: 'MOVE_TARGET_SELECTED' })).toBe(false);
        expect(isSpreadMove({ target: 'MOVE_TARGET_USER' })).toBe(false);
        expect(isSpreadMove({})).toBe(false);
    });
});

describe('rateMoveDoubles — spread damage bonus', () => {
    const single = moves.MOVE_STRENGTH;                                            // 80 BP, SELECTED
    const spreadFoes = { ...moves.MOVE_STRENGTH, target: 'MOVE_TARGET_BOTH' };
    const spreadAlly = { ...moves.MOVE_STRENGTH, target: 'MOVE_TARGET_FOES_AND_ALLY' };
    const statusSpread = { ...moves.MOVE_TAIL_WHIP, target: 'MOVE_TARGET_BOTH' };   // 0 BP

    test('a spread damage move rates higher in doubles than its single-target equivalent', () => {
        expect(rateMoveDoubles(spreadFoes)).toBeGreaterThan(rateMoveDoubles(single));
    });
    test('single-target damage move is unchanged vs the singles rating', () => {
        expect(rateMoveDoubles(single)).toBe(rateMove(single));
    });
    test('ally-hitting spread (FOES_AND_ALLY) gets a smaller bonus than foes-only (BOTH)', () => {
        expect(rateMoveDoubles(spreadAlly)).toBeLessThan(rateMoveDoubles(spreadFoes));
        expect(rateMoveDoubles(spreadAlly)).toBeGreaterThan(rateMoveDoubles(single));
    });
    test('a status (0 BP) spread move gets no damage bonus', () => {
        expect(rateMoveDoubles(statusSpread)).toBe(rateMove(statusSpread));
    });
});
