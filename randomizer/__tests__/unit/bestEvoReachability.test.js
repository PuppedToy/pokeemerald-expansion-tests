'use strict';

// T-280 / ADR-026 — `bestEvo` is what a mon can ACTUALLY become (forward reachability) and
// `devolveToBase` is where it can actually have come from (backward reachability). Both used to walk
// `poke.evoTree`, i.e. "the best/first member of my family", which is a different question:
//
//   · Flareon's bestEvo was Espeon and Silcoon's was Dustox — mons they can never turn into. The tier
//     that falls out of bestEvo drives reward, trade and extra-starter selection.
//   · Basculin-Red-Striped's bestEvo was Basculegion-M, which it cannot reach at all.
//   · devolveToBase(Perrserker) returned Meowth, so a reward that hands out "the base form of
//     Perrserker" handed out a Meowth that can never become one.

const { bestEvoOf } = require('../../evoStages');
const { devolveToBase } = require('../../modules/utils');

const rated = (id, rating, ...targets) => ({
    id,
    rating: { absoluteRating: rating, tier: 'RU' },
    evolutionData: { type: 'EVO_TYPE_LC_OF_2', isLC: !targets.length ? false : true },
    ...(targets.length ? { evolutions: targets.map(pokemon => ({ method: 'LEVEL', param: '20', pokemon })) } : {}),
});

describe('T-280 — bestEvo is forward reachability', () => {
    // Eevee's shape: the branches are siblings, not each other's evolutions.
    const DEX = [
        rated('EEVEE', 10, 'VAPOREON', 'FLAREON', 'ESPEON'),
        rated('VAPOREON', 40), rated('FLAREON', 30), rated('ESPEON', 90),
    ];
    const best = bestEvoOf(DEX);

    test('a base form sees every branch and picks the strongest', () => {
        expect(best('EEVEE').id).toBe('ESPEON');
    });

    test('a branch sees only itself — never a sibling', () => {
        expect(best('FLAREON').id).toBe('FLAREON');
        expect(best('VAPOREON').id).toBe('VAPOREON');
    });

    test('the value returned is the reachable mon rating, not the family maximum', () => {
        expect(best('FLAREON').rating).toBe(30);
        expect(best('EEVEE').rating).toBe(90);
    });
});

describe('T-280 — the Wurmple case the owner named', () => {
    // Wurmple sees all four; Silcoon sees only itself and Beautifly.
    const DEX = [
        rated('WURMPLE', 5, 'SILCOON', 'CASCOON'),
        rated('SILCOON', 10, 'BEAUTIFLY'), rated('CASCOON', 10, 'DUSTOX'),
        rated('BEAUTIFLY', 50), rated('DUSTOX', 70),
    ];
    const best = bestEvoOf(DEX);

    test('Wurmple sees the best of the whole line', () => {
        expect(best('WURMPLE').id).toBe('DUSTOX');
    });

    test('Silcoon can only see Silcoon and Beautifly', () => {
        expect(best('SILCOON').id).toBe('BEAUTIFLY');
        expect(best('SILCOON').rating).toBe(50);
    });

    test('a mon that evolves into nothing is its own best evolution', () => {
        expect(best('DUSTOX').id).toBe('DUSTOX');
    });
});

describe('T-280 — a mon that cannot evolve never borrows a line it cannot join', () => {
    const DEX = [
        rated('BASCULIN_RED_STRIPED', 20),
        rated('BASCULIN_WHITE_STRIPED', 20, 'BASCULEGION_M'),
        rated('BASCULEGION_M', 80),
    ];
    const best = bestEvoOf(DEX);

    test('Basculin-Red-Striped is its own best evolution', () => {
        expect(best('BASCULIN_RED_STRIPED').id).toBe('BASCULIN_RED_STRIPED');
        expect(best('BASCULIN_RED_STRIPED').rating).toBe(20);
    });

    test('the striped form that DOES evolve still sees Basculegion', () => {
        expect(best('BASCULIN_WHITE_STRIPED').id).toBe('BASCULEGION_M');
    });
});

describe('T-280 — devolveToBase walks the real edges', () => {
    const solo = { type: 'EVO_TYPE_SOLO', isLC: false };
    const finalOf2 = { type: 'EVO_TYPE_LAST_OF_2', isLC: false };
    const lc = { type: 'EVO_TYPE_LC_OF_2', isLC: true };
    const DEX = [
        { id: 'SPECIES_MEOWTH', family: 'F_MEOWTH', evolutionData: lc, evolutions: [{ pokemon: 'SPECIES_PERSIAN' }] },
        { id: 'SPECIES_PERSIAN', family: 'F_MEOWTH', evolutionData: finalOf2 },
        { id: 'SPECIES_MEOWTH_GALAR', family: 'F_MEOWTH_GALAR', evolutionData: lc, evolutions: [{ pokemon: 'SPECIES_PERRSERKER' }] },
        // Perrserker sits in the NON-Galar family — the exact shape that broke it
        { id: 'SPECIES_PERRSERKER', family: 'F_MEOWTH', evolutionData: finalOf2 },
        { id: 'SPECIES_CORSOLA', family: 'F_CORSOLA', evolutionData: solo },
    ];

    test('a final returns the base it can really come from, across families', () => {
        expect(devolveToBase(DEX, DEX.find(p => p.id === 'SPECIES_PERRSERKER')).id)
            .toBe('SPECIES_MEOWTH_GALAR');
        expect(devolveToBase(DEX, DEX.find(p => p.id === 'SPECIES_PERSIAN')).id)
            .toBe('SPECIES_MEOWTH');
    });

    test('a base form and a non-evolving mon return themselves', () => {
        expect(devolveToBase(DEX, DEX.find(p => p.id === 'SPECIES_MEOWTH')).id).toBe('SPECIES_MEOWTH');
        expect(devolveToBase(DEX, DEX.find(p => p.id === 'SPECIES_CORSOLA')).id).toBe('SPECIES_CORSOLA');
    });

    test('a mega devolves to the species it is a mega of', () => {
        const withMega = [
            ...DEX,
            { id: 'SPECIES_PERSIAN_MEGA', family: 'F_MEOWTH',
              evolutionData: { type: 'EVO_TYPE_MEGA', isLC: false, megaBaseForm: 'SPECIES_PERSIAN' } },
        ];
        expect(devolveToBase(withMega, withMega.find(p => p.id === 'SPECIES_PERSIAN_MEGA')).id)
            .toBe('SPECIES_MEOWTH');
    });
});
