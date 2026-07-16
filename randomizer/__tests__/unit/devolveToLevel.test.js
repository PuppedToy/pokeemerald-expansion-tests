'use strict';

// T-106 — devolveToLevel: given a (possibly mega, possibly final) mon, return the MOST-EVOLVED form
// whose incoming evolution is legal at a given trainer level — the inverse of tryEvolve. This is the
// primitive that projects a recurring character's authoritative endgame roster back to an earlier
// appearance (Champion Metagross → Granite-Cave-level Metang).

const { devolveToLevel } = require('../../modules/utils');

// Beldum(LC) --lvl20--> Metang(NFE) --lvl45--> Metagross(final), + Metagross-Mega.
const beldum = {
    id: 'SPECIES_BELDUM',
    evolutions: [{ method: 'LEVEL', param: '20', pokemon: 'SPECIES_METANG' }],
    evolutionData: { type: 'EVO_TYPE_LC_OF_3', isLC: true, isFinal: false },
    evoTree: ['SPECIES_BELDUM', ['SPECIES_METANG'], ['SPECIES_METAGROSS']],
};
const metang = {
    id: 'SPECIES_METANG',
    evolutions: [{ method: 'LEVEL', param: '45', pokemon: 'SPECIES_METAGROSS' }],
    evolutionData: { type: 'EVO_TYPE_NFE_OF_3', isLC: false, isFinal: false },
    evoTree: ['SPECIES_BELDUM', ['SPECIES_METANG'], ['SPECIES_METAGROSS']],
};
const metagross = {
    id: 'SPECIES_METAGROSS',
    evolutions: undefined,
    evolutionData: { type: 'EVO_TYPE_LAST_OF_3', isLC: false, isFinal: true },
    evoTree: ['SPECIES_BELDUM', ['SPECIES_METANG'], ['SPECIES_METAGROSS']],
};
const metagrossMega = {
    id: 'SPECIES_METAGROSS_MEGA',
    evolutions: undefined,
    evolutionData: { type: 'EVO_TYPE_MEGA', isLC: false, isFinal: true, megaBaseForm: 'SPECIES_METAGROSS' },
    evoTree: ['SPECIES_BELDUM', ['SPECIES_METANG'], ['SPECIES_METAGROSS']],
};
const list = [beldum, metang, metagross, metagrossMega];

describe('devolveToLevel (T-106)', () => {
    test('at a high level the final form stays final (nothing to devolve)', () => {
        expect(devolveToLevel(list, metagross, 78).id).toBe('SPECIES_METAGROSS');
    });

    test('a mega is reduced to its non-mega base at high level', () => {
        expect(devolveToLevel(list, metagrossMega, 78).id).toBe('SPECIES_METAGROSS');
    });

    test('Champion Metagross projected to level 22 devolves to Metang (Metagross needs lvl 45)', () => {
        expect(devolveToLevel(list, metagross, 22).id).toBe('SPECIES_METANG');
    });

    test('a mega projected to level 22 devolves to the level-legal stage (Metang)', () => {
        expect(devolveToLevel(list, metagrossMega, 22).id).toBe('SPECIES_METANG');
    });

    test('below the first evolution level it devolves all the way to the LC base', () => {
        // level 10 < 20 (Beldum→Metang) → cannot even be Metang → Beldum
        expect(devolveToLevel(list, metagross, 10).id).toBe('SPECIES_BELDUM');
    });

    test('exactly at the evolution level the stage is legal (Metang at lvl 20)', () => {
        expect(devolveToLevel(list, metagross, 20).id).toBe('SPECIES_METANG');
    });

    test('a solo/LC mon with no pre-evolution is returned unchanged', () => {
        const solo = { id: 'SPECIES_SOLO', evolutions: undefined, evolutionData: { type: 'EVO_TYPE_SOLO', isFinal: true }, evoTree: ['SPECIES_SOLO'] };
        expect(devolveToLevel([solo], solo, 5).id).toBe('SPECIES_SOLO');
    });
});
