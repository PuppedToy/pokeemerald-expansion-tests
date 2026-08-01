'use strict';

// T-068 — pure builders that turn a bundle's per-ROM starterNaming into starter_choose.c code.
// Untrusted names are sanitized here (last line before C source): [A-Za-z0-9 ], <=12 chars.
//
// T-237 (deliberate spec change): the three extra-starter arrays are fixed at STARTER_EXTRA_CAPACITY and
// exported so the injector can overwrite them in place; the ROM's real length moved from a rewritten
// STARTER_EXTRA_COUNT #define to a `gStarterExtraCount` value, and the nicknames are stored INLINE
// (`_("…")` into `u8 [POKEMON_NAME_LENGTH + 1]`) instead of being COMPOUND_STRING pointers. B-020's
// concern (a pointer array can't take a bare `_()`) no longer applies — the array is not a pointer array
// any more — but its inverse now does, and is covered below.

const fs = require('fs');
const path = require('path');

const {
    sanitizeNickname,
    genderConst,
    buildStarterNameCode,
    applyStarterNames,
    applyStarterChoose,
    DEFAULT_EXTRA_COUNT,
    STARTER_NICKNAME_RE,
    STARTER_GENDER_RE,
    EXTRA_NICKNAMES_RE,
    EXTRA_GENDERS_RE,
    EXTRA_MON_RE,
    EXTRA_COUNT_RE,
} = require('../../starterNameWriter');
const { STARTER_EXTRA_CAPACITY } = require('../../layout');

describe('sanitizeNickname', () => {
    test('keeps letters, digits and spaces; trims', () => {
        expect(sanitizeNickname('  Yuki ')).toBe('Yuki');
        expect(sanitizeNickname('Anna Lee')).toBe('Anna Lee');
    });
    test('strips anything that could break/inject into the C string', () => {
        expect(sanitizeNickname('"),SPECIES_MEW//')).toBe('SPECIESMEW'); // quotes/parens/slashes/underscore gone
        expect(sanitizeNickname('a"b\\c')).toBe('abc');
    });
    test('truncates to 12 chars — one full POKEMON_NAME_LENGTH slot', () => {
        expect(sanitizeNickname('ABCDEFGHIJKLMNOP')).toBe('ABCDEFGHIJKL');
    });
    test('non-strings / empty → empty', () => {
        expect(sanitizeNickname(null)).toBe('');
        expect(sanitizeNickname(undefined)).toBe('');
        expect(sanitizeNickname(42)).toBe('');
    });
});

describe('genderConst', () => {
    test('maps the coin to the game constant; anything else is genderless', () => {
        expect(genderConst('M')).toBe('MON_MALE');
        expect(genderConst('F')).toBe('MON_FEMALE');
        expect(genderConst(null)).toBe('MON_GENDERLESS');
        expect(genderConst('X')).toBe('MON_GENDERLESS');
    });
});

describe('buildStarterNameCode', () => {
    test('produces starter scalar + extra arrays of exactly extraCount entries', () => {
        const naming = {
            starter: { gender: 'M', nickname: 'Kai' },
            extras: [{ gender: 'F', nickname: 'Aada' }, { gender: 'M', nickname: null }],
        };
        const c = buildStarterNameCode(naming, 2);
        expect(c.starterNickname).toBe('const u8 gStarterNickname[POKEMON_NAME_LENGTH + 1] = _("Kai");');
        expect(c.starterGender).toBe('const u8 gStarterGender = MON_MALE;');
        expect(c.extraNicknames).toBe(
            'const u8 gStarterExtraNicknames[STARTER_EXTRA_CAPACITY][POKEMON_NAME_LENGTH + 1] =\n{\n    _("Aada"),\n    _(""),\n};'
        );
        expect(c.extraGenders).toBe(
            'const u8 gStarterExtraGenders[STARTER_EXTRA_CAPACITY] =\n{\n    MON_FEMALE,\n    MON_MALE,\n};'
        );
    });

    // T-237 mirror of B-020: the extras are now an array OF ARRAYS, so each row must be a `_()` string
    // literal. A COMPOUND_STRING there is a pointer and would not compile as a row initialiser.
    test('extras rows are inline _() literals, never COMPOUND_STRING pointers', () => {
        const c = buildStarterNameCode({ starter: null, extras: [{ gender: 'M', nickname: 'Kai' }, { gender: 'F', nickname: null }] }, 2);
        expect(c.extraNicknames).toMatch(/const u8 gStarterExtraNicknames\[STARTER_EXTRA_CAPACITY\]\[POKEMON_NAME_LENGTH \+ 1\]/);
        expect(c.extraNicknames).toContain('_("Kai")');
        expect(c.extraNicknames).toContain('_("")');
        expect(c.extraNicknames).not.toContain('COMPOUND_STRING');
    });

    test('null starter → empty name + genderless scalar', () => {
        const c = buildStarterNameCode({ starter: null, extras: [] }, 0);
        expect(c.starterNickname).toBe('const u8 gStarterNickname[POKEMON_NAME_LENGTH + 1] = _("");');
        expect(c.starterGender).toBe('const u8 gStarterGender = MON_GENDERLESS;');
    });

    test('pads with defaults when fewer extras than extraCount', () => {
        const c = buildStarterNameCode({ starter: null, extras: [{ gender: 'F', nickname: 'Mei' }] }, 3);
        expect(c.extraNicknames).toContain('    _("Mei"),\n    _(""),\n    _(""),');
        expect(c.extraGenders).toContain('    MON_FEMALE,\n    MON_GENDERLESS,\n    MON_GENDERLESS,');
    });
});

// The writer matches its blocks by shape, so the committed source must keep matching those shapes —
// otherwise every replacement silently no-ops and the ROM ships vanilla names (the B-049 failure mode).
describe('the committed src/starter_choose.c still matches every block matcher', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'src', 'starter_choose.c'), 'utf8');
    test.each([
        ['starter nickname', STARTER_NICKNAME_RE],
        ['starter gender', STARTER_GENDER_RE],
        ['extra nicknames', EXTRA_NICKNAMES_RE],
        ['extra genders', EXTRA_GENDERS_RE],
        ['extra species', EXTRA_MON_RE],
        ['extra count', EXTRA_COUNT_RE],
    ])('%s', (_name, re) => {
        expect(source).toMatch(re);
    });

    test('the resizing STARTER_EXTRA_COUNT #define is gone (it moved the ROM per run)', () => {
        expect(source).not.toMatch(/#define STARTER_EXTRA_COUNT/);
    });
});

describe('applyStarterNames', () => {
    const sample = [
        'some prefix',
        'const u8 gStarterNickname[POKEMON_NAME_LENGTH + 1] = _("");',
        'const u8 gStarterGender = MON_GENDERLESS;',
        `const u8 gStarterExtraNicknames[STARTER_EXTRA_CAPACITY][POKEMON_NAME_LENGTH + 1] =\n{\n${'    _(""),\n'.repeat(DEFAULT_EXTRA_COUNT)}};`,
        `const u8 gStarterExtraGenders[STARTER_EXTRA_CAPACITY] =\n{\n${'    MON_GENDERLESS,\n'.repeat(DEFAULT_EXTRA_COUNT)}};`,
        'some suffix',
    ].join('\n');

    test('replaces all four naming blocks', () => {
        const naming = { starter: { gender: 'F', nickname: 'Lucia' }, extras: [{ gender: 'M', nickname: 'Ivan' }] };
        const out = applyStarterNames(sample, naming, 1);
        expect(out).toContain('gStarterNickname[POKEMON_NAME_LENGTH + 1] = _("Lucia");');
        expect(out).toContain('gStarterGender = MON_FEMALE;');
        expect(out).toContain('_("Ivan"),');
        expect(out).toContain('MON_MALE,');
        // The default placeholders are gone.
        expect(out).not.toContain('gStarterNickname[POKEMON_NAME_LENGTH + 1] = _("");');
        // prefix/suffix preserved
        expect(out.startsWith('some prefix')).toBe(true);
        expect(out.endsWith('some suffix')).toBe(true);
    });

    test('injection attempt in a nickname is neutralized in the emitted C', () => {
        const naming = { starter: null, extras: [{ gender: 'M', nickname: '"),(void)SPECIES_MEW,_("' }] };
        const out = applyStarterNames(sample, naming, 1);
        // Only [A-Za-z0-9 ] survive → "voidSPECIESMEW", truncated to 12 → "voidSPECIESM".
        expect(out).toContain('_("voidSPECIESM"),');
        expect(out).not.toContain('(void)');
        expect(out).not.toContain('SPECIES_MEW');
    });
});

// B-049 — the extra-starter arrays (species/nicknames/genders) and the ROM's extra-starter count must
// stay in lock-step. The old writer rewrote the #define + species array to the ROM's count but only
// rewrote the nickname/gender arrays when starterNaming was present, so a ROM with ≠9 extra starters and
// no naming left 9-element arrays under an [8] #define → C "excess elements". T-237 removed the resizing
// #define entirely; what must now agree is the arrays' contents and gStarterExtraCount.
function committedStarterChoose() {
    const monDefault = Array.from({ length: DEFAULT_EXTRA_COUNT }, (_, i) => `    SPECIES_DEFAULT_${i}`).join(',\n');
    return [
        `const u8 gStarterExtraCount = ${DEFAULT_EXTRA_COUNT};`,
        '',
        'const u8 gStarterNickname[POKEMON_NAME_LENGTH + 1] = _("");',
        'const u8 gStarterGender = MON_GENDERLESS;',
        '',
        `const u16 gStarterExtraMon[STARTER_EXTRA_CAPACITY] =\n{\n${monDefault},\n};`,
        '',
        `const u8 gStarterExtraNicknames[STARTER_EXTRA_CAPACITY][POKEMON_NAME_LENGTH + 1] =\n{\n${'    _(""),\n'.repeat(DEFAULT_EXTRA_COUNT)}};`,
        '',
        `const u8 gStarterExtraGenders[STARTER_EXTRA_CAPACITY] =\n{\n${'    MON_GENDERLESS,\n'.repeat(DEFAULT_EXTRA_COUNT)}};`,
        '',
    ].join('\n');
}

function arrayLen(content, name, itemToken) {
    const m = content.match(new RegExp(name + '\\[[^\\]]*\\](?:\\[[^\\]]*\\])? =\\s*\\{([\\s\\S]*?)\\n\\};'));
    return m ? (m[1].match(new RegExp(itemToken, 'g')) || []).length : -1;
}

describe('applyStarterChoose (B-049)', () => {
    const EIGHT = ['SPECIES_A', 'SPECIES_B', 'SPECIES_C', 'SPECIES_E', 'SPECIES_F', 'SPECIES_G', 'SPECIES_H', 'SPECIES_I'];

    test('null naming + count ≠ 9 resizes EVERY array to the count and writes the count', () => {
        const out = applyStarterChoose(committedStarterChoose(), EIGHT, null);
        expect(out).toContain('const u8 gStarterExtraCount = 8;');
        expect(arrayLen(out, 'gStarterExtraMon', 'SPECIES_')).toBe(8);
        expect(arrayLen(out, 'gStarterExtraNicknames', '_\\(')).toBe(8);
        expect(arrayLen(out, 'gStarterExtraGenders', 'MON_')).toBe(8);
    });

    test('naming present still fills nicknames from the bundle, count in lock-step', () => {
        const naming = { starter: { nickname: 'Yuki', gender: 'F' }, extras: [{ nickname: 'Rex', gender: 'M' }] };
        const out = applyStarterChoose(committedStarterChoose(), EIGHT, naming);
        expect(out).toContain('const u8 gStarterExtraCount = 8;');
        expect(arrayLen(out, 'gStarterExtraNicknames', '_\\(')).toBe(8);
        expect(out).toContain('_("Rex")');
    });

    test('throws rather than overflowing the fixed capacity', () => {
        const tooMany = Array.from({ length: STARTER_EXTRA_CAPACITY + 1 }, (_, i) => `SPECIES_X${i}`);
        expect(() => applyStarterChoose(committedStarterChoose(), tooMany, null))
            .toThrow(/STARTER_EXTRA_CAPACITY/);
    });
});
