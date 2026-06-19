'use strict';

// TDD (T-001): written BEFORE spriteMapper.js exists.
// These cover the pure parsing/mapping logic that turns committed C source
// into a SPECIES_X -> source-PNG-path map, plus the small name transforms used
// to name the generated sprite files. No filesystem I/O here.

const {
    incbinPathToPng,
    parseFrontPicSymbols,
    parseSpeciesFrontPic,
    buildSpeciesSpriteMap,
    speciesKey,
    trainerClassToFile,
    parseTrainerClasses,
} = require('../../spriteMapper');

describe('incbinPathToPng', () => {
    test('strips .4bpp.smol and appends .png', () => {
        expect(incbinPathToPng('graphics/pokemon/bulbasaur/anim_front.4bpp.smol'))
            .toBe('graphics/pokemon/bulbasaur/anim_front.png');
    });
    test('handles form front.4bpp.smol', () => {
        expect(incbinPathToPng('graphics/pokemon/venusaur/mega/front.4bpp.smol'))
            .toBe('graphics/pokemon/venusaur/mega/front.png');
    });
    test('handles bare .4bpp', () => {
        expect(incbinPathToPng('graphics/pokemon/x/anim_front.4bpp'))
            .toBe('graphics/pokemon/x/anim_front.png');
    });
    test('handles .lz suffix', () => {
        expect(incbinPathToPng('graphics/pokemon/x/anim_front.4bpp.lz'))
            .toBe('graphics/pokemon/x/anim_front.png');
    });
});

describe('parseFrontPicSymbols', () => {
    const POKEMON_H = `
#if P_FAMILY_BULBASAUR
#if !P_GBA_STYLE_SPECIES_GFX
    const u32 gMonFrontPic_Bulbasaur[] = INCBIN_U32("graphics/pokemon/bulbasaur/anim_front.4bpp.smol");
#else
    const u32 gMonFrontPic_Bulbasaur[] = INCBIN_U32("graphics/pokemon/bulbasaur/anim_front_gba.4bpp.smol");
#endif
    const u32 gMonFrontPic_VenusaurMega[] = INCBIN_U32("graphics/pokemon/venusaur/mega/front.4bpp.smol");
#endif
`;
    test('maps symbol to the non-GBA source png path', () => {
        const map = parseFrontPicSymbols(POKEMON_H);
        expect(map.get('gMonFrontPic_Bulbasaur')).toBe('graphics/pokemon/bulbasaur/anim_front.png');
    });
    test('ignores the _gba variant for the same symbol', () => {
        const map = parseFrontPicSymbols(POKEMON_H);
        expect(map.get('gMonFrontPic_Bulbasaur')).not.toContain('_gba');
    });
    test('captures form symbols', () => {
        const map = parseFrontPicSymbols(POKEMON_H);
        expect(map.get('gMonFrontPic_VenusaurMega')).toBe('graphics/pokemon/venusaur/mega/front.png');
    });
    test('only collects front-pic symbols (not back/icon/palette)', () => {
        const map = parseFrontPicSymbols(`
            const u32 gMonFrontPic_Pikachu[] = INCBIN_U32("graphics/pokemon/pikachu/anim_front.4bpp.smol");
            const u32 gMonBackPic_Pikachu[] = INCBIN_U32("graphics/pokemon/pikachu/back.4bpp.smol");
            const u8 gMonIcon_Pikachu[] = INCBIN_U8("graphics/pokemon/pikachu/icon.4bpp");
        `);
        expect([...map.keys()]).toEqual(['gMonFrontPic_Pikachu']);
    });
});

describe('parseSpeciesFrontPic', () => {
    const GEN = `
    [SPECIES_BULBASAUR] =
    {
        .baseHP = 45,
        .frontPic = gMonFrontPic_Bulbasaur,
        .frontPicSize = MON_COORDS_SIZE(40, 40),
    },
    [SPECIES_VENUSAUR_MEGA] =
    {
        .frontPic = gMonFrontPic_VenusaurMega,
    },
`;
    test('maps each species constant to its frontPic symbol', () => {
        const list = parseSpeciesFrontPic(GEN);
        expect(list).toContainEqual({ species: 'SPECIES_BULBASAUR', symbol: 'gMonFrontPic_Bulbasaur' });
        expect(list).toContainEqual({ species: 'SPECIES_VENUSAUR_MEGA', symbol: 'gMonFrontPic_VenusaurMega' });
    });
    test('ignores species blocks without a frontPic', () => {
        const list = parseSpeciesFrontPic(`
            [SPECIES_NONE] =
            {
                .baseHP = 1,
            },
        `);
        expect(list).toEqual([]);
    });
});

describe('buildSpeciesSpriteMap', () => {
    const GEN = `
    [SPECIES_BULBASAUR] = { .frontPic = gMonFrontPic_Bulbasaur, },
    [SPECIES_MISSINGNO] = { .frontPic = gMonFrontPic_DoesNotExist, },
`;
    const POKEMON_H = `
    const u32 gMonFrontPic_Bulbasaur[] = INCBIN_U32("graphics/pokemon/bulbasaur/anim_front.4bpp.smol");
`;
    test('resolves species to its source png path', () => {
        const { map } = buildSpeciesSpriteMap([GEN], POKEMON_H);
        expect(map.get('SPECIES_BULBASAUR')).toBe('graphics/pokemon/bulbasaur/anim_front.png');
    });
    test('reports species whose front-pic symbol is unknown (no silent drop)', () => {
        const { unresolved } = buildSpeciesSpriteMap([GEN], POKEMON_H);
        expect(unresolved).toContain('SPECIES_MISSINGNO');
    });
    test('does not put unresolved species in the map', () => {
        const { map } = buildSpeciesSpriteMap([GEN], POKEMON_H);
        expect(map.has('SPECIES_MISSINGNO')).toBe(false);
    });
});

describe('speciesKey', () => {
    test('strips the SPECIES_ prefix', () => {
        expect(speciesKey('SPECIES_BULBASAUR')).toBe('BULBASAUR');
        expect(speciesKey('SPECIES_VENUSAUR_MEGA')).toBe('VENUSAUR_MEGA');
    });
});

describe('parseTrainerClasses', () => {
    const HTML = `
    const trainerClasses = [
      'Unknown', 'Youngster',
      'Leader Roxanne',
    ];
    function getTrainerImg(c) { return c; }
    `;
    test('extracts the trainerClasses array entries', () => {
        expect(parseTrainerClasses(HTML)).toEqual(['Unknown', 'Youngster', 'Leader Roxanne']);
    });
    test('returns [] when there is no trainerClasses block', () => {
        expect(parseTrainerClasses('const x = 1;')).toEqual([]);
    });
});

describe('trainerClassToFile', () => {
    test('lowercases and replaces spaces with underscores', () => {
        expect(trainerClassToFile('Youngster')).toBe('youngster');
        expect(trainerClassToFile('Leader Roxanne')).toBe('leader_roxanne');
        expect(trainerClassToFile('Aqua Admin F')).toBe('aqua_admin_f');
        expect(trainerClassToFile('Elite Four Sidney')).toBe('elite_four_sidney');
        expect(trainerClassToFile('Sr And Jr')).toBe('sr_and_jr');
    });
});
