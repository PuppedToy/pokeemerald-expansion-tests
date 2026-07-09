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
