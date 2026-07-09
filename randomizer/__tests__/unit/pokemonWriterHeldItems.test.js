'use strict';

// T-077: wild Pokémon must never hold an item. The only source of a wild held item is
// gSpeciesInfo[species].itemCommon/.itemRare (species_info/gen_*_families.h), read by
// SetWildMonHeldItem() in src/pokemon.c. The writer neutralizes both fields to ITEM_NONE.

const { stripWildHeldItems } = require('../../pokemonWriter');

describe('stripWildHeldItems (T-077)', () => {
    test('rewrites .itemCommon to ITEM_NONE', () => {
        const out = stripWildHeldItems('        .itemCommon = ITEM_MIRACLE_SEED,');
        expect(out).toMatch(/^\s*\.itemCommon\s*=\s*ITEM_NONE,/);
        expect(out).not.toContain('ITEM_MIRACLE_SEED');
    });

    test('rewrites .itemRare to ITEM_NONE', () => {
        const out = stripWildHeldItems('        .itemRare = ITEM_HEART_SCALE,');
        expect(out).toMatch(/^\s*\.itemRare\s*=\s*ITEM_NONE,/);
        expect(out).not.toContain('ITEM_HEART_SCALE');
    });

    test('tolerates alignment whitespace before the "="', () => {
        const out = stripWildHeldItems('        .itemRare   = ITEM_SACRED_ASH,');
        expect(out).toMatch(/^\s*\.itemRare\s*=\s*ITEM_NONE,/);
        expect(out).not.toContain('ITEM_SACRED_ASH');
    });

    test('preserves indentation', () => {
        const out = stripWildHeldItems('        .itemCommon = ITEM_HONEY,');
        expect(out.startsWith('        .itemCommon')).toBe(true);
    });

    test('leaves an audit marker but no reference to the stripped item', () => {
        const out = stripWildHeldItems('        .itemCommon = ITEM_HONEY,');
        expect(out).toContain('.itemCommon = ITEM_NONE,');
        expect(out).toContain('@PUPPED-NO-WILD-ITEMS');
        expect(out).not.toContain('ITEM_HONEY');
    });

    test('leaves non held-item lines untouched', () => {
        const input = [
            '    [SPECIES_CHERUBI] =',
            '    {',
            '        .baseHP = 45,',
            '        .itemCommon = ITEM_MIRACLE_SEED,',
            '        .abilities = { ABILITY_CHLOROPHYLL },',
            '    },',
        ].join('\n');
        const out = stripWildHeldItems(input);
        expect(out).toContain('        .baseHP = 45,');
        expect(out).toContain('        .abilities = { ABILITY_CHLOROPHYLL },');
        expect(out).toContain('    [SPECIES_CHERUBI] =');
    });

    test('strips every held-item line in a multi-species block, ITEM_NONE only', () => {
        const input = [
            '    [SPECIES_CHERUBI] =',
            '    {',
            '        .itemCommon = ITEM_MIRACLE_SEED,',
            '    },',
            '    [SPECIES_LUVDISC] =',
            '    {',
            '        .itemRare = ITEM_HEART_SCALE,',
            '    },',
        ].join('\n');
        const out = stripWildHeldItems(input);
        expect(out).not.toContain('ITEM_MIRACLE_SEED');
        expect(out).not.toContain('ITEM_HEART_SCALE');
        // every surviving held-item assignment must be ITEM_NONE
        const assignments = out.split('\n').filter(l => /^\s*\.item(Common|Rare)\s*=/.test(l));
        expect(assignments).toHaveLength(2);
        assignments.forEach(l => expect(l).toMatch(/=\s*ITEM_NONE,/));
    });

    test('does not touch a same-line comment mentioning an item elsewhere', () => {
        // an unrelated field that merely references an item name in a comment is left alone
        const input = '        .friendship = 70, // was ITEM_ORAN_BERRY test';
        expect(stripWildHeldItems(input)).toBe(input);
    });
});

describe('stripWildHeldItems inside #define macros (B-025)', () => {
    // B-025: some held-item fields live inside multi-line `#define ..._SPECIES_INFO` /
    // `..._MISC_INFO` macros (form species like MOTHIM_SPECIES_INFO / MINIOR_MISC_INFO), where
    // every body line ends in a `\` line-continuation. Dropping that `\` terminates the macro
    // before its closing `}`, so it expands to an unclosed brace and the whole gSpeciesInfo[]
    // array is corrupted -> `-Werror` build failure (make: *** [pokemon.o] Error 1).
    const mothimMacro = [
        '#define MOTHIM_SPECIES_INFO                                                 \\',
        '    {                                                                       \\',
        '        .baseHP        = 70,                                                \\',
        '        .expYield = (P_UPDATED_EXP_YIELDS >= GEN_5) ? 148 : 159,            \\',
        '        .itemRare = ITEM_SILVER_POWDER,                                     \\',
        '        .genderRatio = MON_MALE,                                            \\',
        '        .formSpeciesIdTable = sMothimFormSpeciesIdTable,                    \\',
        '    }',
    ].join('\n');

    test('neutralizes the held item but preserves the macro line-continuation', () => {
        const itemLine = stripWildHeldItems(mothimMacro)
            .split('\n')
            .find((l) => /\.itemRare\s*=/.test(l));
        expect(itemLine).toMatch(/=\s*ITEM_NONE,/);          // item neutralized
        expect(itemLine).not.toContain('ITEM_SILVER_POWDER');
        expect(/\\\s*$/.test(itemLine)).toBe(true);          // <-- continuation preserved
    });

    test('drops no `\\` continuation from the macro body', () => {
        const count = (text) => text.split('\n').filter((l) => /\\\s*$/.test(l)).length;
        expect(count(stripWildHeldItems(mothimMacro))).toBe(count(mothimMacro));
    });

    test('a rewritten continuation line uses no `//` comment (which would swallow the next macro line)', () => {
        const itemLine = stripWildHeldItems(mothimMacro)
            .split('\n')
            .find((l) => /\.itemRare\s*=/.test(l));
        // a `//` comment followed by a trailing `\` continues the comment onto `.genderRatio`
        expect(itemLine).not.toMatch(/\/\/.*\\\s*$/);
        // the audit marker still survives (as a block comment)
        expect(itemLine).toContain('@PUPPED-NO-WILD-ITEMS');
    });
});
