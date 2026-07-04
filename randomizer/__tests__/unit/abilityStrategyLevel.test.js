'use strict';

// T-057: trainers should start picking their ability *strategically* (best-rated, hidden slot
// allowed) from Roxanne's level (12) onward; below that abilities stay random and are limited to
// the first two (non-hidden) slots. Separate knob from nature but same default level, consumed
// through a pure predicate shared by writer.js/writerDocs.js.
const { ABILITY_STRATEGY_MIN_LEVEL } = require('../../constants');
const { usesStrategicAbility } = require('../../modules/utils');

describe('ability strategy level threshold (T-057)', () => {
    test('the threshold is Roxanne\'s level (12)', () => {
        expect(ABILITY_STRATEGY_MIN_LEVEL).toBe(12);
    });

    test('Roxanne-level (12) mons get a strategic ability', () => {
        expect(usesStrategicAbility(12)).toBe(true);
    });

    test('below the threshold (11) mons stay random', () => {
        expect(usesStrategicAbility(11)).toBe(false);
    });

    test('predicate keys off the shared constant, not a hardcoded literal', () => {
        expect(usesStrategicAbility(ABILITY_STRATEGY_MIN_LEVEL)).toBe(true);
        expect(usesStrategicAbility(ABILITY_STRATEGY_MIN_LEVEL - 1)).toBe(false);
    });

    test('high-level trainers still get strategic abilities', () => {
        expect(usesStrategicAbility(50)).toBe(true);
    });
});
