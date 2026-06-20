'use strict';

// T-011: moves must carry their 1-based TM number so the docs can show a "TM01" label and a
// "TMs only" filter. tmList (from runPokedexModule) is 0-indexed — tmList[0] is TM01 — and holds
// move names WITHOUT the MOVE_ prefix; HMs are excluded (95 TM slots only).

const { annotateTmNumbers } = require('../../tmRandomizer');

describe('annotateTmNumbers (T-011)', () => {
    test('assigns 1-based TM numbers from tmList; non-TM moves get none', () => {
        const moves = {
            MOVE_VACUUM_WAVE:  { id: 'MOVE_VACUUM_WAVE' },
            MOVE_BRUTAL_SWING: { id: 'MOVE_BRUTAL_SWING' },
            MOVE_TACKLE:       { id: 'MOVE_TACKLE' },
        };
        annotateTmNumbers(moves, ['VACUUM_WAVE', 'BRUTAL_SWING']);
        expect(moves.MOVE_VACUUM_WAVE.tm).toBe(1);
        expect(moves.MOVE_BRUTAL_SWING.tm).toBe(2);
        expect(moves.MOVE_TACKLE.tm).toBeUndefined();
    });

    test('skips empty slots and moves not present in the parsed set', () => {
        const moves = { MOVE_A: { id: 'MOVE_A' } };
        annotateTmNumbers(moves, [null, 'A', 'GHOST_MOVE_NOT_PARSED']);
        expect(moves.MOVE_A.tm).toBe(2);            // index 1 → TM02
        expect(Object.keys(moves)).toEqual(['MOVE_A']); // unknown move is not created
    });

    test('tolerates a missing/empty tmList', () => {
        const moves = { MOVE_A: { id: 'MOVE_A' } };
        expect(() => annotateTmNumbers(moves, undefined)).not.toThrow();
        expect(() => annotateTmNumbers(moves, [])).not.toThrow();
        expect(moves.MOVE_A.tm).toBeUndefined();
    });
});
