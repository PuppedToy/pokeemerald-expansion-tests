'use strict';

// T-078: parseItemsFile surfaces item DISPLAY NAMES → descriptions from src/data/items.h, so the
// generated docs can show a tooltip when you hover a held item or a trainer reward. Items reach the
// docs as display names (e.g. "Choice Scarf"), not ITEM_ ids, so the map is keyed by name.
//
// items.h shapes to handle (same as moves): single-line ITEM_NAME("…") names, multi-line
// COMPOUND_STRING descriptions, and shared description-const pointers.

const fs = require('fs');
const path = require('path');
const { parseItemsFile } = require('../../parser');

describe('parseItemsFile — item descriptions (T-078)', () => {
    test('keys by display name and captures a multi-line COMPOUND_STRING description', () => {
        const text = [
            '    [ITEM_CHOICE_SCARF] =',
            '    {',
            '        .name = ITEM_NAME("Choice Scarf"),',
            '        .pluralName = ITEM_PLURAL_NAME("Choice Scarves"),',
            '        .price = 100,',
            '        .description = COMPOUND_STRING(',
            '            "Boosts Speed, but\\n"',
            '            "allows the use of\\n"',
            '            "only one move."),',
            '        .pocket = POCKET_ITEMS,',
            '    },',
        ].join('\n');
        const items = parseItemsFile(text);
        expect(items['Choice Scarf']).toBe('Boosts Speed, but allows the use of only one move.');
    });

    test('captures a single-line COMPOUND_STRING description', () => {
        const text = [
            '    [ITEM_POWER_HERB] =',
            '    {',
            '        .name = ITEM_NAME("Power Herb"),',
            '        .description = COMPOUND_STRING("Allows immediate use."),',
            '    },',
        ].join('\n');
        const items = parseItemsFile(text);
        expect(items['Power Herb']).toBe('Allows immediate use.');
    });

    test('resolves a description that points at a shared static const', () => {
        const text = [
            'static const u8 sSampleDesc[] = _(',
            '    "A hold item that\\n"',
            '    "restores HP.");',
            '',
            '    [ITEM_LEFTOVERS] =',
            '    {',
            '        .name = ITEM_NAME("Leftovers"),',
            '        .description = sSampleDesc,',
            '    },',
        ].join('\n');
        const items = parseItemsFile(text);
        expect(items['Leftovers']).toBe('A hold item that restores HP.');
    });

    test('never leaves the raw ITEM_NAME( / COMPOUND_STRING( token in name or description', () => {
        const text = [
            '    [ITEM_CHOICE_SCARF] =',
            '    {',
            '        .name = ITEM_NAME("Choice Scarf"),',
            '        .description = COMPOUND_STRING(',
            '            "Boosts Speed."),',
            '    },',
        ].join('\n');
        const items = parseItemsFile(text);
        expect(Object.keys(items)).toEqual(['Choice Scarf']);
        expect(items['Choice Scarf']).not.toMatch(/COMPOUND_STRING|ITEM_NAME/);
    });

    test('skips items with no name or no description', () => {
        const text = [
            '    [ITEM_NONE] =',
            '    {',
            '        .name = ITEM_NAME("????????"),',
            '    },',
            '    [ITEM_MYSTERY] =',
            '    {',
            '        .description = COMPOUND_STRING("No name here."),',
            '    },',
        ].join('\n');
        const items = parseItemsFile(text);
        expect(items['????????']).toBeUndefined();
        expect(Object.keys(items)).toHaveLength(0);
    });

    test('parses the real src/data/items.h for common held items', () => {
        const itemsPath = path.resolve(__dirname, '..', '..', '..', 'src', 'data', 'items.h');
        const items = parseItemsFile(fs.readFileSync(itemsPath, 'utf-8'));
        // A handful of items whose names match the display strings the docs render.
        expect(items['Choice Scarf']).toMatch(/Speed/i);
        expect(items['Leftovers']).toMatch(/HP/i);
        expect(items['Power Herb']).toMatch(/charge|immediate/i);
        // Never expose the C macros as a value.
        for (const desc of Object.values(items)) {
            expect(desc).not.toMatch(/COMPOUND_STRING|ITEM_NAME/);
        }
    });
});
