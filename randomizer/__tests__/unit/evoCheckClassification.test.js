'use strict';

// B-068 — checkValidEvo trusted `evolutionData.type === EVO_TYPE_SOLO` (and `isLC`) as proof that a mon
// has no pre-evolution, and returned true without ever looking at a level.
//
// A branch evolution that crosses families makes that classification lie. Koffing lives in
// P_FAMILY_KOFFING and evolves two ways — by level to Weezing, by Moon Stone to Weezing-Galar — but
// Weezing-Galar lives in P_FAMILY_KOFFING_GALAR, so it is parsed as EVO_TYPE_SOLO / isFinal with no
// pre-evolution recorded. Every trainer could field it at any level: seed 3333 gave Autumn (level 36) a
// Weezing-Galar gated at 38. The same hole covers every regional form reached by a branch out of
// another family.
//
// The check now asks the data instead of the label: does anything in this run's pool actually evolve
// into this mon? If nothing does, it is genuinely a base form. If something does, every step of some
// path up to it has to be legal at this level.

const { checkValidEvo, devolveToLevel } = require('../../modules/utils');

// Koffing (LC, P_FAMILY_KOFFING) --lvl 15--> Weezing, --Moon Stone, min 38--> Weezing-Galar.
const koffing = {
    id: 'SPECIES_KOFFING',
    family: 'P_FAMILY_KOFFING',
    evolutions: [
        { method: 'LEVEL', param: '15', pokemon: 'SPECIES_WEEZING' },
        { method: 'ITEM', param: 'ITEM_MOON_STONE', pokemon: 'SPECIES_WEEZING_GALAR', minLevel: '38' },
    ],
    evolutionData: { type: 'EVO_TYPE_LC_OF_2', isLC: true, isNFE: true, isFinal: false },
};
const weezing = {
    id: 'SPECIES_WEEZING',
    family: 'P_FAMILY_KOFFING',
    evolutions: undefined,
    evolutionData: { type: 'EVO_TYPE_LAST_OF_2', isLC: false, isNFE: false, isFinal: true },
};
// The liar: its own family, so the parser records no pre-evolution and calls it solo.
const weezingGalar = {
    id: 'SPECIES_WEEZING_GALAR',
    family: 'P_FAMILY_KOFFING_GALAR',
    evolutions: undefined,
    evolutionData: { type: 'EVO_TYPE_SOLO', isLC: false, isNFE: false, isFinal: true },
};
// A genuine standalone mon — nothing anywhere evolves into it.
const chatot = {
    id: 'SPECIES_CHATOT',
    family: 'P_FAMILY_CHATOT',
    evolutions: undefined,
    evolutionData: { type: 'EVO_TYPE_SOLO', isLC: false, isNFE: false, isFinal: true },
};

const list = [koffing, weezing, weezingGalar, chatot];

describe('checkValidEvo does not trust the solo classification (B-068)', () => {
    test('a mon parsed as solo but reached by a cross-family stone is illegal below its gate', () => {
        expect(checkValidEvo(list, weezingGalar, 36)).toBe(false);
    });

    test('the same mon is legal at its gate', () => {
        expect(checkValidEvo(list, weezingGalar, 38)).toBe(true);
    });

    test('a genuinely standalone mon stays legal at any level', () => {
        expect(checkValidEvo(list, chatot, 5)).toBe(true);
    });

    test('the level branch of the same line is unaffected', () => {
        expect(checkValidEvo(list, weezing, 14)).toBe(false);
        expect(checkValidEvo(list, weezing, 15)).toBe(true);
    });

    test('a base form is always legal (nothing has to evolve into it)', () => {
        expect(checkValidEvo(list, koffing, 5)).toBe(true);
    });

    test('devolveToLevel already walked the real data, and still does', () => {
        expect(devolveToLevel(list, weezingGalar, 36).id).toBe('SPECIES_KOFFING');
        expect(devolveToLevel(list, weezingGalar, 38).id).toBe('SPECIES_WEEZING_GALAR');
    });
});

describe('checkValidEvo walks the whole chain (B-068)', () => {
    // Beldum --20--> Metang --45--> Metagross: fielding Metagross needs BOTH steps legal, so the check
    // must not stop after one hop.
    const beldum = {
        id: 'SPECIES_BELDUM', family: 'P_FAMILY_BELDUM',
        evolutions: [{ method: 'LEVEL', param: '20', pokemon: 'SPECIES_METANG' }],
        evolutionData: { type: 'EVO_TYPE_LC_OF_3', isLC: true, isNFE: true, isFinal: false },
    };
    const metang = {
        id: 'SPECIES_METANG', family: 'P_FAMILY_BELDUM',
        evolutions: [{ method: 'LEVEL', param: '45', pokemon: 'SPECIES_METAGROSS' }],
        evolutionData: { type: 'EVO_TYPE_NFE_OF_3', isLC: false, isNFE: true, isFinal: false },
    };
    const metagross = {
        id: 'SPECIES_METAGROSS', family: 'P_FAMILY_BELDUM',
        evolutions: undefined,
        evolutionData: { type: 'EVO_TYPE_LAST_OF_3', isLC: false, isNFE: false, isFinal: true },
    };
    const line = [beldum, metang, metagross];

    test('the final stage needs its own step legal', () => {
        expect(checkValidEvo(line, metagross, 44)).toBe(false);
        expect(checkValidEvo(line, metagross, 45)).toBe(true);
    });

    test('the middle stage needs the first step legal', () => {
        expect(checkValidEvo(line, metang, 19)).toBe(false);
        expect(checkValidEvo(line, metang, 20)).toBe(true);
    });
});
