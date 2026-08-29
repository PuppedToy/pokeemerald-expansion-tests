'use strict';

// T-284 / ADR-026 — the last two things still keyed off the `family` string:
//
//   1. `poke.evoTree`, which the docs viewer renders as the evolution chain. It was
//      `evoTree[poke.family]`, so wherever the family and the graph disagreed the guide drew a chain
//      the Pokémon is not in: Perrserker's read "Meowth → Persian", Weezing-Galar had none at all.
//   2. `poke.family` itself, which the ADR defines as the identity group — the connected component —
//      but which the parser derives from the upstream `#if P_FAMILY_` block plus a form suffix.
//
// Neither drives inheritance, stage, bestEvo or dedup any more (T-278…T-282, T-285). This is about
// the model being honest and the guide being right.

const { evoChainOf, componentFamilyOf } = require('../../evoStages');

const mon = (id, family, ...targets) => ({
    id, family,
    ...(targets.length ? { evolutions: targets.map(pokemon => ({ method: 'LEVEL', param: '20', pokemon })) } : {}),
});

const DEX = [
    mon('MEOWTH', 'P_FAMILY_MEOWTH', 'PERSIAN'),
    mon('PERSIAN', 'P_FAMILY_MEOWTH'),
    mon('MEOWTH_GALAR', 'P_FAMILY_MEOWTH_GALAR', 'PERRSERKER'),
    mon('PERRSERKER', 'P_FAMILY_MEOWTH'),
    mon('KOFFING', 'P_FAMILY_KOFFING', 'WEEZING', 'WEEZING_GALAR'),
    mon('WEEZING', 'P_FAMILY_KOFFING'),
    mon('WEEZING_GALAR', 'P_FAMILY_KOFFING_GALAR'),
    mon('CORSOLA', 'P_FAMILY_CORSOLA'),
    mon('CORSOLA_GALAR', 'P_FAMILY_CORSOLA_GALAR', 'CURSOLA'),
    mon('CURSOLA', 'P_FAMILY_CORSOLA'),
    mon('PICHU', 'P_FAMILY_PIKACHU', 'PIKACHU'),
    mon('PIKACHU', 'P_FAMILY_PIKACHU', 'RAICHU'),
    mon('RAICHU', 'P_FAMILY_PIKACHU'),
    mon('BURMY_PLANT', 'P_FAMILY_BURMY', 'WORMADAM_PLANT', 'MOTHIM'),
    mon('BURMY_SANDY', 'P_FAMILY_BURMY_SANDY', 'WORMADAM_SANDY', 'MOTHIM'),
    mon('WORMADAM_PLANT', 'P_FAMILY_BURMY'),
    mon('WORMADAM_SANDY', 'P_FAMILY_BURMY_SANDY'),
    mon('MOTHIM', 'P_FAMILY_BURMY'),
];

const chain = evoChainOf(DEX);
const familyOf = componentFamilyOf(DEX);

describe('T-284 — the chain the guide draws is the one the Pokemon is in', () => {
    test('a cross-family evolution shows its own line, not the base line', () => {
        expect(chain('PERRSERKER')).toEqual(['MEOWTH_GALAR', ['PERRSERKER']]);
        expect(chain('CURSOLA')).toEqual(['CORSOLA_GALAR', ['CURSOLA']]);
    });

    test('a branch target in another family appears on its real branch', () => {
        expect(chain('WEEZING_GALAR')).toEqual(['KOFFING', ['WEEZING', 'WEEZING_GALAR']]);
        expect(chain('WEEZING')).toEqual(chain('WEEZING_GALAR'));
    });

    test('a three-stage line is three stages', () => {
        expect(chain('RAICHU')).toEqual(['PICHU', ['PIKACHU'], ['RAICHU']]);
    });

    test('a Pokemon that neither evolves nor comes from anything has no chain', () => {
        expect(chain('CORSOLA')).toBeUndefined();
    });

    test('a convergence point shows every pre-evolution it really has', () => {
        const mothim = chain('MOTHIM');
        expect([...mothim[0]].sort()).toEqual(['BURMY_PLANT', 'BURMY_SANDY']);
        expect(mothim[1]).toEqual(expect.arrayContaining(['MOTHIM', 'WORMADAM_PLANT', 'WORMADAM_SANDY']));
    });

    test('every member of one line gets the same chain', () => {
        expect(chain('MEOWTH')).toEqual(chain('PERSIAN'));
        expect(chain('PICHU')).toEqual(chain('RAICHU'));
    });
});

describe('T-284 — family names the component, not the dev block plus a suffix', () => {
    test('a species parked in the wrong family is renamed to its own line', () => {
        expect(familyOf('PERRSERKER')).toBe('P_FAMILY_MEOWTH_GALAR');
        expect(familyOf('CURSOLA')).toBe('P_FAMILY_CORSOLA_GALAR');
    });

    test('a branch keeps the family of the base it hangs off', () => {
        expect(familyOf('WEEZING_GALAR')).toBe('P_FAMILY_KOFFING');
        expect(familyOf('WEEZING')).toBe('P_FAMILY_KOFFING');
    });

    test('an untouched line is untouched', () => {
        expect(familyOf('RAICHU')).toBe('P_FAMILY_PIKACHU');
        expect(familyOf('CORSOLA')).toBe('P_FAMILY_CORSOLA');
    });

    test('the three Meowth lines are separate families', () => {
        expect(new Set(['MEOWTH', 'MEOWTH_GALAR'].map(familyOf)).size).toBe(2);
        expect(familyOf('PERSIAN')).toBe(familyOf('MEOWTH'));
        expect(familyOf('PERRSERKER')).toBe(familyOf('MEOWTH_GALAR'));
    });

    test('the Burmy cloaks stay separate despite converging on one Mothim', () => {
        expect(familyOf('BURMY_PLANT')).toBe('P_FAMILY_BURMY');
        expect(familyOf('BURMY_SANDY')).toBe('P_FAMILY_BURMY_SANDY');
        expect(familyOf('WORMADAM_SANDY')).toBe('P_FAMILY_BURMY_SANDY');
    });
});
