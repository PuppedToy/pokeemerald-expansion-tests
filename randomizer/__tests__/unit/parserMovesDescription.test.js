'use strict';

// T-011: parseMovesFile must surface human-readable move descriptions.
// In src/data/moves_info.h descriptions are written three ways:
//   - inline single-line  .description = COMPOUND_STRING("..."),
//   - inline multi-line    .description = COMPOUND_STRING("..\n" "..").,
//   - a pointer to a shared `static const u8 sXxxDescription[] = _(...)`.
// Before the fix the line-by-line parser captured the bare token "COMPOUND_STRING(" for
// multi-line entries and the variable name for pointers. These tests pin the correct text.

const { parseMovesFile } = require('../../parser');

describe('parseMovesFile — descriptions (T-011)', () => {
    test('captures a multi-line COMPOUND_STRING description, normalising \\n to spaces', () => {
        const text = [
            '    [MOVE_POUND] =',
            '    {',
            '        .name = COMPOUND_STRING("Pound"),',
            '        .description = COMPOUND_STRING(',
            '            "Pounds the foe with\\n"',
            '            "forelegs or tail."),',
            '        .power = 40,',
            '        .type = TYPE_NORMAL,',
            '    },',
        ].join('\n');
        const moves = parseMovesFile(text);
        expect(moves.MOVE_POUND.description).toBe('Pounds the foe with forelegs or tail.');
        // Surrounding properties keep parsing.
        expect(moves.MOVE_POUND.name).toBe('Pound');
        expect(moves.MOVE_POUND.power).toBe('40');
        expect(moves.MOVE_POUND.type).toBe('TYPE_NORMAL');
    });

    test('captures a single-line COMPOUND_STRING description', () => {
        const text = [
            '    [MOVE_TACKLE] =',
            '    {',
            '        .description = COMPOUND_STRING("A full-body charge attack."),',
            '        .power = 40,',
            '    },',
        ].join('\n');
        const moves = parseMovesFile(text);
        expect(moves.MOVE_TACKLE.description).toBe('A full-body charge attack.');
    });

    test('resolves a description that points at a shared static const', () => {
        const text = [
            'static const u8 sMegaDrainDescription[] = _(',
            '    "An attack that absorbs\\n"',
            '    "half the damage inflicted.");',
            '',
            '    [MOVE_MEGA_DRAIN] =',
            '    {',
            '        .description = sMegaDrainDescription,',
            '        .power = 40,',
            '    },',
        ].join('\n');
        const moves = parseMovesFile(text);
        expect(moves.MOVE_MEGA_DRAIN.description).toBe('An attack that absorbs half the damage inflicted.');
    });

    test('never leaves the raw COMPOUND_STRING( token as the description', () => {
        const text = [
            '    [MOVE_POUND] =',
            '    {',
            '        .description = COMPOUND_STRING(',
            '            "Pounds the foe with\\n"',
            '            "forelegs or tail."),',
            '    },',
        ].join('\n');
        const moves = parseMovesFile(text);
        expect(moves.MOVE_POUND.description).not.toMatch(/COMPOUND_STRING/);
    });
});
