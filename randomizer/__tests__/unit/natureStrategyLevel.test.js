'use strict';

// T-057: trainers should start picking *strategic* natures (chooseNature) from Roxanne's
// level (12) onward; below that they keep getting random natures. The threshold lives in a
// single constant and is consumed through a pure predicate shared by writer.js/writerDocs.js.
const { NATURE_STRATEGY_MIN_LEVEL } = require('../../constants');
const { usesStrategicNature } = require('../../modules/utils');

describe('nature strategy level threshold (T-057)', () => {
    test('the threshold is Roxanne\'s level (12)', () => {
        expect(NATURE_STRATEGY_MIN_LEVEL).toBe(12);
    });

    test('Roxanne-level (12) mons get a strategic nature', () => {
        expect(usesStrategicNature(12)).toBe(true);
    });

    test('below the threshold (11) mons stay random', () => {
        expect(usesStrategicNature(11)).toBe(false);
    });

    test('predicate keys off the shared constant, not a hardcoded literal', () => {
        expect(usesStrategicNature(NATURE_STRATEGY_MIN_LEVEL)).toBe(true);
        expect(usesStrategicNature(NATURE_STRATEGY_MIN_LEVEL - 1)).toBe(false);
    });

    test('high-level trainers still get strategic natures', () => {
        expect(usesStrategicNature(50)).toBe(true);
    });
});
