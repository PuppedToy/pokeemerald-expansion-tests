'use strict';

// TDD (T-096 / ADR-015): abilities whose value jumps in doubles — redirection draws (Lightning Rod /
// Storm Drain, whose "draw" is worthless in singles), Intimidate (lowers BOTH foes' Attack), and
// doubles-only ally support (Friend Guard, Telepathy). The doubles value is a floor: it never rates
// an ability below its singles (`aiRating`) value.

const { rateAbilityDoubles } = require('../../rating');

describe('rateAbilityDoubles', () => {
    test('Intimidate rates higher in doubles than in singles', () => {
        expect(rateAbilityDoubles('ABILITY_INTIMIDATE', { rating: 7 })).toBeGreaterThan(7);
    });

    test('redirection abilities are highly valued in doubles', () => {
        expect(rateAbilityDoubles('ABILITY_LIGHTNING_ROD', { rating: 3 })).toBeGreaterThanOrEqual(8);
        expect(rateAbilityDoubles('ABILITY_STORM_DRAIN', { rating: 3 })).toBeGreaterThanOrEqual(8);
    });

    test('doubles-only support abilities gain value (Friend Guard, Telepathy)', () => {
        expect(rateAbilityDoubles('ABILITY_FRIEND_GUARD', { rating: 1 })).toBeGreaterThanOrEqual(6);
        expect(rateAbilityDoubles('ABILITY_TELEPATHY', { rating: 1 })).toBeGreaterThanOrEqual(5);
    });

    test('an ability with no doubles relevance keeps its singles rating', () => {
        expect(rateAbilityDoubles('ABILITY_OVERGROW', { rating: 3 })).toBe(3);
    });

    test('the doubles value is a floor — never below the singles rating', () => {
        expect(rateAbilityDoubles('ABILITY_INTIMIDATE', { rating: 10 })).toBe(10);
    });
});
