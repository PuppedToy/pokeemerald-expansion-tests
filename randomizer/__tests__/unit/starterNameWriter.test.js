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
            'static const u8 *const sStarterExtraNicknames[STARTER_EXTRA_COUNT] =\n{\n    _("Aada"),\n    _(""),\n};'
        );
        expect(c.extraGenders).toBe(
            'static const u8 sStarterExtraGenders[STARTER_EXTRA_COUNT] =\n{\n    MON_FEMALE,\n    MON_MALE,\n};'
        );
    });

    test('null starter → empty name + genderless scalar', () => {
        const c = buildStarterNameCode({ starter: null, extras: [] }, 0);
        expect(c.starterNickname).toBe('static const u8 sStarterNickname[] = _("");');
        expect(c.starterGender).toBe('static const u8 sStarterGender = MON_GENDERLESS;');
    });

    test('pads with defaults when fewer extras than extraCount', () => {
        const c = buildStarterNameCode({ starter: null, extras: [{ gender: 'F', nickname: 'Mei' }] }, 3);
        expect(c.extraNicknames).toContain('    _("Mei"),\n    _(""),\n    _(""),');
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
        expect(out).toContain('_("Ivan"),');
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
        expect(out).toContain('_("voidSPECIESM"),');
        expect(out).not.toContain('(void)');
        expect(out).not.toContain('SPECIES_MEW');
    });
});
