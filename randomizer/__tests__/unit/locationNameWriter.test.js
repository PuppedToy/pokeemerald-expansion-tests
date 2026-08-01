'use strict';

// T-070 — locationNameWriter: turns a per-ROM location→naming map into the C table rows spliced between
// the anchors in src/location_nicknames.c. Names sanitized (≤12); keys must be MAP_* tokens.
//
// T-237 (deliberate spec change): the table is fixed-capacity and exported so the injector can overwrite
// it in place, so rows now store the name INLINE with `_("…")` instead of a COMPOUND_STRING pointer, and
// the "never emit a zero-length array" sentinel row is gone — the array's size is a constant, and a
// separate writer-filled count (gLocationNicknameCount) says how many rows are real, because trailing
// zero-filled rows would otherwise read as map (0, 0).

const { buildLocationRows, applyLocationNames } = require('../../locationNameWriter');
const { LOCATION_NICKNAME_CAPACITY } = require('../../layout');

describe('buildLocationRows', () => {
    test('emits one sorted row per location with MAP_GROUP/MAP_NUM + gender + inline name', () => {
        const rows = buildLocationRows({
            MAP_ROUTE102: { nickname: 'Percy', gender: null },
            MAP_PETALBURG_WOODS: { nickname: 'Ann', gender: 'F' },
        });
        expect(rows).toContain('{ MAP_GROUP(MAP_ROUTE102), MAP_NUM(MAP_ROUTE102), MON_GENDERLESS, _("Percy") },');
        expect(rows).toContain('{ MAP_GROUP(MAP_PETALBURG_WOODS), MAP_NUM(MAP_PETALBURG_WOODS), MON_FEMALE, _("Ann") },');
        // sorted: PETALBURG before ROUTE102
        expect(rows.indexOf('MAP_PETALBURG_WOODS')).toBeLessThan(rows.indexOf('MAP_ROUTE102'));
        expect(rows).not.toContain('COMPOUND_STRING');
    });

    test('null / empty / dirty nicknames are sanitized inline; locked male → MON_MALE', () => {
        const rows = buildLocationRows({
            MAP_A: { nickname: null, gender: 'M' },
            MAP_B: { nickname: '"),evil//', gender: null },
        });
        expect(rows).toContain('{ MAP_GROUP(MAP_A), MAP_NUM(MAP_A), MON_MALE, _("") },');
        expect(rows).toContain('_("evil")'); // sanitized to letters
        expect(rows).not.toContain('//');
    });

    test('unsafe map keys are dropped', () => {
        const rows = buildLocationRows({ 'MAP_OK': { nickname: 'X', gender: null }, 'bad key;': { nickname: 'Y', gender: null } });
        expect(rows).toContain('MAP_OK');
        expect(rows).not.toContain('bad key');
    });

    test('empty naming → no rows (the array is sized by its capacity, not its contents)', () => {
        expect(buildLocationRows({})).toBe('');
    });
});

describe('applyLocationNames', () => {
    const sample = [
        'const u8 gLocationNicknameCount =',
        '    // @LOCATION_NICKNAMES_COUNT_START',
        '    0',
        '    // @LOCATION_NICKNAMES_COUNT_END',
        '    ;',
        '',
        'const struct LocationNickname gLocationNicknames[LOCATION_NICKNAME_CAPACITY] =',
        '{',
        '    // @LOCATION_NICKNAMES_START',
        '    // @LOCATION_NICKNAMES_END',
        '};',
    ].join('\n');

    test('replaces the anchored block with generated rows, keeping the anchors', () => {
        const out = applyLocationNames(sample, { MAP_ROUTE102: { nickname: 'Percy', gender: null } });
        expect(out).toContain('// @LOCATION_NICKNAMES_START');
        expect(out).toContain('// @LOCATION_NICKNAMES_END');
        expect(out).toContain('_("Percy")');
        // idempotent structure: re-applying replaces again cleanly
        const out2 = applyLocationNames(out, { MAP_ROUTE103: { nickname: 'Lee', gender: null } });
        expect(out2).toContain('_("Lee")');
        expect(out2).not.toContain('_("Percy")');
    });

    test('writes the row count alongside the rows so the two can never disagree', () => {
        const out = applyLocationNames(sample, {
            MAP_ROUTE102: { nickname: 'Percy', gender: null },
            MAP_ROUTE103: { nickname: 'Lee', gender: 'M' },
        });
        expect(out).toMatch(/@LOCATION_NICKNAMES_COUNT_START\n\s*2\n\s*\/\/ @LOCATION_NICKNAMES_COUNT_END/);
        // and back to 0 when the feature is off
        expect(applyLocationNames(out, {})).toMatch(/@LOCATION_NICKNAMES_COUNT_START\n\s*0\n/);
    });

    test('throws rather than overflowing the fixed capacity', () => {
        const naming = {};
        for (let i = 0; i <= LOCATION_NICKNAME_CAPACITY; i++) naming[`MAP_FILLER${i}`] = { nickname: 'X', gender: null };
        expect(() => applyLocationNames(sample, naming)).toThrow(/LOCATION_NICKNAME_CAPACITY/);
    });
});
