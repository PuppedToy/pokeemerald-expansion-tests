'use strict';

// T-070 — locationNameWriter: turns a per-ROM location→naming map into the C table rows spliced between
// the anchors in src/location_nicknames.c. Names sanitized (COMPOUND_STRING, ≤12); keys must be MAP_* tokens.

const { buildLocationRows, applyLocationNames } = require('../../locationNameWriter');

describe('buildLocationRows', () => {
    test('emits one sorted row per location with MAP_GROUP/MAP_NUM + gender + COMPOUND_STRING', () => {
        const rows = buildLocationRows({
            MAP_ROUTE102: { nickname: 'Percy', gender: null },
            MAP_PETALBURG_WOODS: { nickname: 'Ann', gender: 'F' },
        });
        expect(rows).toContain('{ MAP_GROUP(MAP_ROUTE102), MAP_NUM(MAP_ROUTE102), MON_GENDERLESS, COMPOUND_STRING("Percy") },');
        expect(rows).toContain('{ MAP_GROUP(MAP_PETALBURG_WOODS), MAP_NUM(MAP_PETALBURG_WOODS), MON_FEMALE, COMPOUND_STRING("Ann") },');
        // sorted: PETALBURG before ROUTE102
        expect(rows.indexOf('MAP_PETALBURG_WOODS')).toBeLessThan(rows.indexOf('MAP_ROUTE102'));
    });

    test('null / empty / dirty nicknames become COMPOUND_STRING("...") sanitized; locked male → MON_MALE', () => {
        const rows = buildLocationRows({
            MAP_A: { nickname: null, gender: 'M' },
            MAP_B: { nickname: '"),evil//', gender: null },
        });
        expect(rows).toContain('{ MAP_GROUP(MAP_A), MAP_NUM(MAP_A), MON_MALE, COMPOUND_STRING("") },');
        expect(rows).toContain('COMPOUND_STRING("evil")'); // sanitized to letters
        expect(rows).not.toContain('//');
    });

    test('unsafe map keys are dropped', () => {
        const rows = buildLocationRows({ 'MAP_OK': { nickname: 'X', gender: null }, 'bad key;': { nickname: 'Y', gender: null } });
        expect(rows).toContain('MAP_OK');
        expect(rows).not.toContain('bad key');
    });

    test('empty naming → a single non-matching sentinel row (never a zero-length array)', () => {
        const rows = buildLocationRows({});
        expect(rows).toContain('{ 0xFF, 0xFF, MON_GENDERLESS, COMPOUND_STRING("") },');
    });
});

describe('applyLocationNames', () => {
    const sample = [
        'static const struct LocationNickname sLocationNicknames[] =',
        '{',
        '    // @LOCATION_NICKNAMES_START',
        '    { 0xFF, 0xFF, MON_GENDERLESS, COMPOUND_STRING("") },',
        '    // @LOCATION_NICKNAMES_END',
        '};',
    ].join('\n');

    test('replaces the anchored block with generated rows, keeping the anchors', () => {
        const out = applyLocationNames(sample, { MAP_ROUTE102: { nickname: 'Percy', gender: null } });
        expect(out).toContain('// @LOCATION_NICKNAMES_START');
        expect(out).toContain('// @LOCATION_NICKNAMES_END');
        expect(out).toContain('COMPOUND_STRING("Percy")');
        expect(out).not.toContain('0xFF, 0xFF'); // sentinel replaced
        // idempotent structure: re-applying replaces again cleanly
        const out2 = applyLocationNames(out, { MAP_ROUTE103: { nickname: 'Lee', gender: null } });
        expect(out2).toContain('COMPOUND_STRING("Lee")');
        expect(out2).not.toContain('COMPOUND_STRING("Percy")');
    });
});
