'use strict';

// T-011: the docs show where each TM is obtained (route + trainer). The slot→location relation is
// fixed by the romhack's world layout and documented in randomizer/docs/tms.md (the SSOT). This
// parses that table's Location column into a { tmNumber: locationString } map.

const { parseTmLocations } = require('../../tmLocations');

const MD = [
    '# TM Reference',
    '',
    '| TM | Pool | Location |',
    '|----|------|----------|',
    '| TM01 | avgDmg | Gym reward — Roxanne (badge 1) |',
    '| TM02 | avgDmg | Pick — Route 106 (choose 1 of 3) |',
    '| TM72 | weather | Fixed: Rain Dance — Item — Route 109 Chandler (Damp Rock pick) |',
    '| TM91 | godlikeStatus | Gym reward — Tate & Liza (badge 7) |',
].join('\n');

describe('parseTmLocations (T-011)', () => {
    test('maps each TM number to its location string', () => {
        const m = parseTmLocations(MD);
        expect(m[1]).toBe('Gym reward — Roxanne (badge 1)');
        expect(m[2]).toBe('Pick — Route 106 (choose 1 of 3)');
        expect(m[72]).toBe('Fixed: Rain Dance — Item — Route 109 Chandler (Damp Rock pick)');
        expect(m[91]).toBe('Gym reward — Tate & Liza (badge 7)');
    });

    test('keys are integer TM numbers; header/separator rows are ignored', () => {
        const m = parseTmLocations(MD);
        expect(Object.keys(m).sort((a, b) => a - b)).toEqual(['1', '2', '72', '91']);
    });

    test('tolerates empty/garbage input', () => {
        expect(parseTmLocations('')).toEqual({});
        expect(parseTmLocations(undefined)).toEqual({});
        expect(parseTmLocations('no table here')).toEqual({});
    });
});
