'use strict';

// T-278 / ADR-026 — the evolution graph, built from `evolutions[]` and never from `family`.

const { buildEvoGraph } = require('../../evoGraph');

// A miniature dex covering every shape the real one has:
//   linear    Pichu → Pikachu → Raichu
//   branching Koffing → Weezing | Weezing-Galar   (the second target lives in another `family`)
//   converging  three Burmy cloaks → one Mothim
//   solo      Corsola (no edges at all)
const DEX = [
    { id: 'PICHU',   family: 'F_PIKACHU', evolutions: [{ pokemon: 'PIKACHU' }] },
    { id: 'PIKACHU', family: 'F_PIKACHU', evolutions: [{ pokemon: 'RAICHU' }] },
    { id: 'RAICHU',  family: 'F_PIKACHU' },

    { id: 'KOFFING',       family: 'F_KOFFING',       evolutions: [{ pokemon: 'WEEZING' }, { pokemon: 'WEEZING_GALAR' }] },
    { id: 'WEEZING',       family: 'F_KOFFING' },
    { id: 'WEEZING_GALAR', family: 'F_KOFFING_GALAR' },

    { id: 'BURMY_PLANT', family: 'F_BURMY',       evolutions: [{ pokemon: 'WORMADAM_PLANT' }, { pokemon: 'MOTHIM' }] },
    { id: 'BURMY_SANDY', family: 'F_BURMY_SANDY', evolutions: [{ pokemon: 'WORMADAM_SANDY' }, { pokemon: 'MOTHIM' }] },
    { id: 'BURMY_TRASH', family: 'F_BURMY_TRASH', evolutions: [{ pokemon: 'WORMADAM_TRASH' }, { pokemon: 'MOTHIM' }] },
    { id: 'WORMADAM_PLANT', family: 'F_BURMY' },
    { id: 'WORMADAM_SANDY', family: 'F_BURMY_SANDY' },
    { id: 'WORMADAM_TRASH', family: 'F_BURMY_TRASH' },
    { id: 'MOTHIM',         family: 'F_BURMY' },

    { id: 'CORSOLA', family: 'F_CORSOLA' },
];

const graph = buildEvoGraph(DEX);

describe('T-278 — edges come from evolutions[], not from family', () => {
    test('a branch target in a different family is still a child', () => {
        expect(graph.childrenOf('KOFFING').sort()).toEqual(['WEEZING', 'WEEZING_GALAR']);
        expect(graph.parentsOf('WEEZING_GALAR')).toEqual(['KOFFING']);
    });

    test('siblings are not related to each other', () => {
        expect(graph.parentsOf('WEEZING')).not.toContain('WEEZING_GALAR');
        expect(graph.childrenOf('WEEZING')).toEqual([]);
    });

    test('a convergence point has every one of its pre-evolutions', () => {
        expect(graph.parentsOf('MOTHIM').sort())
            .toEqual(['BURMY_PLANT', 'BURMY_SANDY', 'BURMY_TRASH']);
    });
});

describe('T-278 — stage classification by degree', () => {
    test.each([
        ['PICHU', true, false],
        ['PIKACHU', false, false],
        ['RAICHU', false, true],
        ['CORSOLA', true, true],
    ])('%s: first=%s final=%s', (id, first, final) => {
        expect(graph.isFirstStage(id)).toBe(first);
        expect(graph.isFinalStage(id)).toBe(final);
    });
});

describe('T-278 — reachability', () => {
    test('forward reachability is what a mon can actually become', () => {
        expect(graph.forwardReachable('PICHU').sort()).toEqual(['PIKACHU', 'RAICHU']);
        expect(graph.forwardReachable('PIKACHU')).toEqual(['RAICHU']);
        // a final stage can become nothing — this is the bug bestEvo has today
        expect(graph.forwardReachable('WEEZING')).toEqual([]);
    });

    test('backward reachability finds the real base, across families', () => {
        expect(graph.baseFormsOf('WEEZING_GALAR')).toEqual(['KOFFING']);
        expect(graph.baseFormsOf('RAICHU')).toEqual(['PICHU']);
        expect(graph.baseFormsOf('PICHU')).toEqual(['PICHU']);
        expect(graph.baseFormsOf('MOTHIM').sort())
            .toEqual(['BURMY_PLANT', 'BURMY_SANDY', 'BURMY_TRASH']);
    });
});

describe('T-278 — the graph never invents a species', () => {
    test('an evolution whose target was filtered out of the run is not an edge', () => {
        const partial = buildEvoGraph([
            { id: 'KOFFING', evolutions: [{ pokemon: 'WEEZING' }, { pokemon: 'WEEZING_GALAR' }] },
            { id: 'WEEZING' },
        ]);
        expect(partial.childrenOf('KOFFING')).toEqual(['WEEZING']);
        expect(partial.has('WEEZING_GALAR')).toBe(false);
    });

    test('a self-referential or duplicated edge is ignored', () => {
        const odd = buildEvoGraph([
            { id: 'A', evolutions: [{ pokemon: 'A' }, { pokemon: 'B' }, { pokemon: 'B' }] },
            { id: 'B' },
        ]);
        expect(odd.childrenOf('A')).toEqual(['B']);
        expect(odd.parentsOf('B')).toEqual(['A']);
    });

    test('a cycle terminates instead of hanging', () => {
        const cyclic = buildEvoGraph([
            { id: 'X', evolutions: [{ pokemon: 'Y' }] },
            { id: 'Y', evolutions: [{ pokemon: 'X' }] },
        ]);
        expect(cyclic.forwardReachable('X')).toEqual(['Y']);
        expect(cyclic.baseFormsOf('X')).toEqual([]);
    });
});
