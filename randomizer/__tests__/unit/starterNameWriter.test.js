'use strict';

// T-068 — pure builders that turn a bundle's per-ROM starterNaming into starter_choose.c code.
// Untrusted names are sanitized here (last line before C source): [A-Za-z0-9 ], <=12 chars.

const {
    sanitizeNickname,
    genderConst,
    buildStarterNameCode,
    applyStarterNames,
    DEFAULT_EXTRA_COUNT,
} = require('../../starterNameWriter');

describe('sanitizeNickname', () => {
    test('keeps letters, digits and spaces; trims', () => {
        expect(sanitizeNickname('  Yuki ')).toBe('Yuki');
        expect(sanitizeNickname('Anna Lee')).toBe('Anna Lee');
    });
    test('strips anything that could break/inject into the C string', () => {
        expect(sanitizeNickname('"),SPECIES_MEW//')).toBe('SPECIESMEW'); // quotes/parens/slashes/underscore gone
        expect(sanitizeNickname('a"b\\c')).toBe('abc');
    });
    test('truncates to 12 chars', () => {
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
        expect(c.starterNickname).toBe('static const u8 sStarterNickname[] = _("Kai");');
        expect(c.starterGender).toBe('static const u8 sStarterGender = MON_MALE;');
        expect(c.extraNicknames).toBe(
            'static const u8 *const sStarterExtraNicknames[STARTER_EXTRA_COUNT] =\n{\n    COMPOUND_STRING("Aada"),\n    COMPOUND_STRING(""),\n};'
        );
        expect(c.extraGenders).toBe(
            'static const u8 sStarterExtraGenders[STARTER_EXTRA_COUNT] =\n{\n    MON_FEMALE,\n    MON_MALE,\n};'
        );
    });

    // B-020: the extras are a pointer array (`const u8 *const []`). Bare `_("x")` there expands to a
    // brace byte-list `{...}` and fails to compile (-Werror: "braces around scalar initializer" /
    // int→pointer), which broke ALL ROM builds on the box. Inline string pointers MUST use the
    // COMPOUND_STRING compound-literal macro. Regresses to a build-breaking C form.
    test('B-020: extras array uses COMPOUND_STRING (pointer-valid), never a bare _() entry', () => {
        const c = buildStarterNameCode({ starter: null, extras: [{ gender: 'M', nickname: 'Kai' }, { gender: 'F', nickname: null }] }, 2);
        expect(c.extraNicknames).toMatch(/const u8 \*const sStarterExtraNicknames\[STARTER_EXTRA_COUNT\]/);
        expect(c.extraNicknames).toContain('COMPOUND_STRING("Kai")');
        expect(c.extraNicknames).toContain('COMPOUND_STRING("")');
        // No entry may be a bare `_(...)` (would not compile as a pointer element).
        expect(c.extraNicknames).not.toMatch(/\n {4}_\(/);
    });

    test('null starter → empty name + genderless scalar', () => {
        const c = buildStarterNameCode({ starter: null, extras: [] }, 0);
        expect(c.starterNickname).toBe('static const u8 sStarterNickname[] = _("");');
        expect(c.starterGender).toBe('static const u8 sStarterGender = MON_GENDERLESS;');
    });

    test('pads with defaults when fewer extras than extraCount', () => {
        const c = buildStarterNameCode({ starter: null, extras: [{ gender: 'F', nickname: 'Mei' }] }, 3);
        expect(c.extraNicknames).toContain('    COMPOUND_STRING("Mei"),\n    COMPOUND_STRING(""),\n    COMPOUND_STRING(""),');
        expect(c.extraGenders).toContain('    MON_FEMALE,\n    MON_GENDERLESS,\n    MON_GENDERLESS,');
    });
});

describe('applyStarterNames', () => {
    // A minimal starter_choose.c-like content carrying the committed default blocks.
    const defaults = require('../../starterNameWriter');
    const sample = [
        'some prefix',
        defaults.DEFAULT_STARTER_NICKNAME,
        defaults.DEFAULT_STARTER_GENDER,
        defaults.defaultExtraNicknames(DEFAULT_EXTRA_COUNT),
        defaults.defaultExtraGenders(DEFAULT_EXTRA_COUNT),
        'some suffix',
    ].join('\n');

    test('replaces all four committed default blocks', () => {
        const naming = { starter: { gender: 'F', nickname: 'Lucia' }, extras: [{ gender: 'M', nickname: 'Ivan' }] };
        const out = applyStarterNames(sample, naming, 1);
        expect(out).toContain('sStarterNickname[] = _("Lucia");');
        expect(out).toContain('sStarterGender = MON_FEMALE;');
        expect(out).toContain('COMPOUND_STRING("Ivan"),');
        expect(out).toContain('MON_MALE,');
        // The default placeholders are gone.
        expect(out).not.toContain('sStarterNickname[] = _("");');
        // prefix/suffix preserved
        expect(out.startsWith('some prefix')).toBe(true);
        expect(out.endsWith('some suffix')).toBe(true);
    });

    test('injection attempt in a nickname is neutralized in the emitted C', () => {
        const naming = { starter: null, extras: [{ gender: 'M', nickname: '"),(void)SPECIES_MEW,_("' }] };
        const out = applyStarterNames(sample, naming, 1);
        // Only [A-Za-z0-9 ] survive → "voidSPECIESMEW", truncated to 12 → "voidSPECIESM".
        expect(out).toContain('COMPOUND_STRING("voidSPECIESM"),');
        expect(out).not.toContain('(void)');
        expect(out).not.toContain('SPECIES_MEW');
    });
});

// B-049 — the extra-starter arrays (species/nicknames/genders) must stay in lock-step with the
// STARTER_EXTRA_COUNT #define. The old writer rewrote the #define + species array to the ROM's count
// but only rewrote the nickname/gender arrays when starterNaming was present, so a ROM with ≠9 extra
// starters and no naming left 9-element name arrays under an [8] #define → C "excess elements".
const { applyStarterChoose, defaultExtraNicknames, defaultExtraGenders, DEFAULT_STARTER_NICKNAME, DEFAULT_STARTER_GENDER } = require('../../starterNameWriter');

function committedStarterChoose() {
    const monDefault = Array.from({ length: DEFAULT_EXTRA_COUNT }, (_, i) => `    SPECIES_DEFAULT_${i}`).join(',\n');
    return [
        `#define STARTER_EXTRA_COUNT ${DEFAULT_EXTRA_COUNT}`,
        '',
        DEFAULT_STARTER_NICKNAME,
        DEFAULT_STARTER_GENDER,
        '',
        `static const u16 sStarterExtraMon[STARTER_EXTRA_COUNT] =\n{\n${monDefault},\n};`,
        '',
        defaultExtraNicknames(DEFAULT_EXTRA_COUNT),
        '',
        defaultExtraGenders(DEFAULT_EXTRA_COUNT),
        '',
    ].join('\n');
}

function arrayLen(content, name, itemToken) {
    const m = content.match(new RegExp(name + '\\[[^\\]]*\\] =\\s*\\{([\\s\\S]*?)\\n\\};'));
    return m ? (m[1].match(new RegExp(itemToken, 'g')) || []).length : -1;
}

describe('applyStarterChoose (B-049)', () => {
    const EIGHT = ['SPECIES_A', 'SPECIES_B', 'SPECIES_C', 'SPECIES_E', 'SPECIES_F', 'SPECIES_G', 'SPECIES_H', 'SPECIES_I'];

    test('null naming + count ≠ 9 resizes EVERY array to the count (no excess elements)', () => {
        const out = applyStarterChoose(committedStarterChoose(), EIGHT, null);
        expect(out).toContain('#define STARTER_EXTRA_COUNT 8');
        expect(arrayLen(out, 'sStarterExtraMon', 'SPECIES_')).toBe(8);
        expect(arrayLen(out, 'sStarterExtraNicknames', 'COMPOUND_STRING\\(')).toBe(8);
        expect(arrayLen(out, 'sStarterExtraGenders', 'MON_')).toBe(8);
    });

    test('naming present still fills nicknames from the bundle, count in lock-step', () => {
        const naming = { starter: { nickname: 'Yuki', gender: 'F' }, extras: [{ nickname: 'Rex', gender: 'M' }] };
        const out = applyStarterChoose(committedStarterChoose(), EIGHT, naming);
        expect(out).toContain('#define STARTER_EXTRA_COUNT 8');
        expect(arrayLen(out, 'sStarterExtraNicknames', 'COMPOUND_STRING\\(')).toBe(8);
        expect(out).toContain('COMPOUND_STRING("Rex")');
    });
});
