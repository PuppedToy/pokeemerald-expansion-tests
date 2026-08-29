'use strict';

// T-287 — the three Burmy cloaks converge on ONE Mothim, in the source and therefore in the ROM.
//
// The owner's original report: *"Burmy trash no muestra en las docs que evolucione a mothim por piedra
// + level, como hacen el resto de branching evolutions. Cada tipo de burmy evoluciona a un wormadan
// por candy y deben converger todos en el mismo mothim usando una piedra + nivel."*
//
// The source already had the right SHAPE — candy → Wormadam-<cloak>, Dawn Stone + IF_MIN_LEVEL →
// Mothim — but Sandy pointed at SPECIES_MOTHIM_SANDY and Trash at SPECIES_MOTHIM_TRASH. Those are
// byte-identical dupes that B-040 removed from the pool, so the pipeline papered over it with
// `EVOLUTION_TARGET_ALIASES`, remapping them to MOTHIM_PLANT after parsing.
//
// The alias only ever fixed the pipeline's view. The injector writes evolution LEVELS, never targets
// (see injector/modules/evolutions.js), so the cartridge kept sending Sandy and Trash Burmy to their
// own Mothim — species the writer never touches, and which therefore keep vanilla stats. Pointing all
// three at SPECIES_MOTHIM_PLANT in the source is the fix; the alias then has nothing left to do.

const fs = require('fs');
const path = require('path');
const { SPECIES_DIR, TOTAL_GENS } = require('../../constants');
const { parseSpeciesFile } = require('../../parser');
const { buildEvoGraph } = require('../../evoGraph');

const gen4 = fs.readFileSync(path.resolve(SPECIES_DIR, 'gen_4_families.h'), 'utf8');

function burmyEntry(cloak) {
    const start = gen4.indexOf(`[SPECIES_BURMY_${cloak}] =`);
    expect(start).toBeGreaterThan(-1);
    const rest = gen4.slice(start);
    const next = rest.slice(1).search(/\[SPECIES_\w+\] =/);
    return rest.slice(0, next === -1 ? rest.length : next + 1);
}

describe('T-287 — the source itself sends every cloak to the same Mothim', () => {
    test.each([['PLANT'], ['SANDY'], ['TRASH']])(
        'Burmy-%s evolves into SPECIES_MOTHIM_PLANT by stone + level', cloak => {
            const entry = burmyEntry(cloak);
            expect(entry).toMatch(
                /\{EVO_ITEM,\s*ITEM_DAWN_STONE,\s*SPECIES_MOTHIM_PLANT,\s*CONDITIONS\(\{IF_MIN_LEVEL,\s*\d+\}\)\}/);
        });

    test.each([['SANDY'], ['TRASH']])('Burmy-%s no longer names its own Mothim', cloak => {
        expect(burmyEntry(cloak)).not.toMatch(new RegExp(`SPECIES_MOTHIM_${cloak}`));
    });

    test('each cloak still evolves into its own Wormadam by candy', () => {
        for (const cloak of ['PLANT', 'SANDY', 'TRASH']) {
            expect(burmyEntry(cloak)).toMatch(
                new RegExp(`\\{EVO_LEVEL,\\s*\\d+,\\s*SPECIES_WORMADAM_${cloak}\\}`));
        }
    });
});

describe('T-287 — the alias that papered over it is gone', () => {
    test('nothing remaps a Mothim evolution target any more', () => {
        const parser = fs.readFileSync(require.resolve('../../parser'), 'utf8');
        expect(parser).not.toMatch(/^\s*(const|let|var)\s+EVOLUTION_TARGET_ALIASES\b/m);
    });
});

describe('T-287 — the parsed graph is unchanged, because the alias was already producing it', () => {
    const definitions = { VICTREEBEL_SP_DEF: '70', EXEGGUTOR_SP_DEF: '75' };
    const evoTree = {};
    const all = [];
    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        all.push(...parseSpeciesFile(
            fs.readFileSync(path.resolve(SPECIES_DIR, `gen_${gen}_families.h`), 'utf8'), definitions, evoTree));
    }
    const graph = buildEvoGraph(all);

    test('Mothim still has all three cloaks as pre-evolutions', () => {
        expect(graph.parentsOf('SPECIES_MOTHIM_PLANT').sort())
            .toEqual(['SPECIES_BURMY_PLANT', 'SPECIES_BURMY_SANDY', 'SPECIES_BURMY_TRASH']);
    });

    test('and is still the only convergence point in the dex', () => {
        const convergent = all.filter(p => graph.parentsOf(p.id).length > 1).map(p => p.id);
        expect(convergent).toEqual(['SPECIES_MOTHIM_PLANT']);
    });
});
