'use strict';

// T-187 — moves_info.h writer. Rewrites ONLY the fields a move actually mutated (power/accuracy/
// type/category), with a concrete value (flattening any gen-conditional), preserving the original in
// an audit comment; untouched fields and untouched moves stay byte-identical.

const { editMovesFile } = require('../../moveWriter');

const SAMPLE = [
    '    [MOVE_POUND] =',
    '    {',
    '        .name = COMPOUND_STRING("Pound"),',
    '        .effect = EFFECT_HIT,',
    '        .power = 40,',
    '        .type = TYPE_NORMAL,',
    '        .accuracy = 100,',
    '        .pp = 35,',
    '        .category = DAMAGE_CATEGORY_PHYSICAL,',
    '        .contestCategory = CONTEST_CATEGORY_TOUGH,',
    '    },',
    '',
    '    [MOVE_RAZOR_WIND] =',
    '    {',
    '        .name = COMPOUND_STRING("Razor Wind"),',
    '        .power = B_UPDATED_MOVE_DATA >= GEN_4 ? 90 : 70,',
    '        .type = TYPE_NORMAL,',
    '        .accuracy = 100,',
    '        .category = DAMAGE_CATEGORY_SPECIAL,',
    '    },',
    '',
    '    [MOVE_SURF] =',
    '    {',
    '        .power = 90,',
    '        .type = TYPE_WATER,',
    '        .accuracy = 100,',
    '        .category = DAMAGE_CATEGORY_SPECIAL,',
    '    },',
    '',
].join('\n');

// POUND: power 40→55 (BUFF), type NORMAL→FIRE (ADJUSTMENT). RAZOR_WIND: power 90→70 (NERF),
// category SPECIAL→PHYSICAL (ADJUSTMENT). SURF: untouched (no log).
const moves = {
    MOVE_POUND: {
        id: 'MOVE_POUND', power: 55, accuracy: 100, type: 'FIRE', category: 'DAMAGE_CATEGORY_PHYSICAL',
        log: [
            { type: 'BUFF', target: 'power', oldValue: 40, value: 15 },
            { type: 'ADJUSTMENT', target: 'type', oldValue: 'NORMAL', value: 'FIRE' },
        ],
    },
    MOVE_RAZOR_WIND: {
        id: 'MOVE_RAZOR_WIND', power: 70, accuracy: 100, type: 'NORMAL', category: 'DAMAGE_CATEGORY_PHYSICAL',
        log: [
            { type: 'NERF', target: 'power', oldValue: 90, value: -20 },
            { type: 'ADJUSTMENT', target: 'category', oldValue: 'DAMAGE_CATEGORY_SPECIAL', value: 'DAMAGE_CATEGORY_PHYSICAL' },
        ],
    },
    MOVE_SURF: { id: 'MOVE_SURF', power: 90, accuracy: 100, type: 'WATER', category: 'DAMAGE_CATEGORY_SPECIAL' },
};

describe('editMovesFile', () => {
    const out = () => editMovesFile(SAMPLE, moves);

    test('rewrites a changed power to its new concrete value with an audit comment', () => {
        const result = out();
        expect(result).toMatch(/^\s*\.power = 55, \/\/ @PUPPED-MOVE-MUTATION #MOVE_POUND \[oldValue = 40\]/m);
    });

    test('rewrites a changed type to TYPE_<new> with the old type recorded', () => {
        const result = out();
        expect(result).toMatch(/^\s*\.type = TYPE_FIRE, \/\/ @PUPPED-MOVE-MUTATION #MOVE_POUND \[oldValue = NORMAL\]/m);
    });

    test('does NOT touch fields that did not change (POUND accuracy/category/pp stay verbatim)', () => {
        const result = out();
        expect(result).toContain('\n        .accuracy = 100,\n        .pp = 35,\n        .category = DAMAGE_CATEGORY_PHYSICAL,\n        .contestCategory = CONTEST_CATEGORY_TOUGH,');
    });

    test('flattens a gen-conditional power line, keeping the original in the audit comment', () => {
        const result = out();
        expect(result).toMatch(/^\s*\.power = 70, \/\/ @PUPPED-MOVE-MUTATION #MOVE_RAZOR_WIND \[oldValue = 90\] -- previous line was >> \.power = B_UPDATED_MOVE_DATA >= GEN_4 \? 90 : 70,/m);
    });

    test('rewrites a changed category', () => {
        const result = out();
        expect(result).toMatch(/^\s*\.category = DAMAGE_CATEGORY_PHYSICAL, \/\/ @PUPPED-MOVE-MUTATION #MOVE_RAZOR_WIND \[oldValue = DAMAGE_CATEGORY_SPECIAL\]/m);
    });

    test('leaves an untouched move (no log) completely byte-identical', () => {
        const result = out();
        expect(result).toContain('    [MOVE_SURF] =\n    {\n        .power = 90,\n        .type = TYPE_WATER,\n        .accuracy = 100,\n        .category = DAMAGE_CATEGORY_SPECIAL,\n    },');
    });

    test('emits exactly one audit comment per changed field (4 total here)', () => {
        const result = out();
        expect((result.match(/@PUPPED-MOVE-MUTATION/g) || []).length).toBe(4);
    });

    test('a moves map with no mutated moves returns the file unchanged', () => {
        const clean = { MOVE_POUND: { id: 'MOVE_POUND', power: 40, type: 'NORMAL', accuracy: 100, category: 'DAMAGE_CATEGORY_PHYSICAL' } };
        expect(editMovesFile(SAMPLE, clean)).toBe(SAMPLE);
    });
});
