'use strict';

// T-286 — Meltan evolves into Melmetal.
//
// Owner: *"Meltan: es una familia conjunta. Crear evo de meltan -> melmetal."*
//
// In the official games Melmetal comes from 400 Meltan Candy in Pokémon GO, a mechanic this base has
// no equivalent of, so the expansion ships Meltan with no `.evolutions` at all: two separate
// non-evolving Mythicals sharing a family label. The randomizer therefore treated them as two
// unrelated obtainables — Melmetal could be handed out with no line behind it, and Meltan's mutations
// reached nothing.
//
// A plain candy evolution is the convention T-060 set for a line with a single branch.

const fs = require('fs');
const path = require('path');
const { SPECIES_DIR, TOTAL_GENS } = require('../../constants');
const { parseSpeciesFile } = require('../../parser');
const { buildEvoGraph } = require('../../evoGraph');
const { classifyStages } = require('../../evoStages');
const { EVO_TYPE_LC_OF_2, EVO_TYPE_LAST_OF_2 } = require('../../constants');

const gen7 = fs.readFileSync(path.resolve(SPECIES_DIR, 'gen_7_families.h'), 'utf8');

function speciesEntry(id) {
    const start = gen7.indexOf(`[${id}] =`);
    expect(start).toBeGreaterThan(-1);
    const rest = gen7.slice(start);
    const next = rest.slice(1).search(/\[SPECIES_\w+\] =/);
    return rest.slice(0, next === -1 ? rest.length : next + 1);
}

const definitions = { VICTREEBEL_SP_DEF: '70', EXEGGUTOR_SP_DEF: '75' };
const evoTree = {};
const all = [];
for (let gen = 1; gen <= TOTAL_GENS; gen++) {
    all.push(...parseSpeciesFile(
        fs.readFileSync(path.resolve(SPECIES_DIR, `gen_${gen}_families.h`), 'utf8'), definitions, evoTree));
}
const graph = buildEvoGraph(all);
const stageOf = classifyStages(all);

describe('T-286 — the source declares the line', () => {
    test('Meltan evolves into Melmetal by level', () => {
        expect(speciesEntry('SPECIES_MELTAN'))
            .toMatch(/\.evolutions = EVOLUTION\(\{EVO_LEVEL,\s*\d+,\s*SPECIES_MELMETAL\}\)/);
    });

    test('Melmetal is still a final — it evolves into nothing', () => {
        expect(speciesEntry('SPECIES_MELMETAL')).not.toMatch(/\.evolutions/);
    });
});

describe('T-286 — the pipeline sees one line', () => {
    test('Melmetal inherits from Meltan and from nothing else', () => {
        expect(graph.parentsOf('SPECIES_MELMETAL')).toEqual(['SPECIES_MELTAN']);
    });

    test('Meltan is the base form of the line', () => {
        expect(graph.baseFormsOf('SPECIES_MELMETAL')).toEqual(['SPECIES_MELTAN']);
        expect(graph.forwardReachable('SPECIES_MELTAN')).toEqual(['SPECIES_MELMETAL']);
    });

    test('both are classified as the two-stage line they now are', () => {
        expect(stageOf('SPECIES_MELTAN')).toBe(EVO_TYPE_LC_OF_2);
        expect(stageOf('SPECIES_MELMETAL')).toBe(EVO_TYPE_LAST_OF_2);
    });

    test('one family, so G1 offers one of them per run', () => {
        const { getFamilyGroup } = require('../../modules/utils');
        const meltan = all.find(p => p.id === 'SPECIES_MELTAN');
        const melmetal = all.find(p => p.id === 'SPECIES_MELMETAL');
        expect(getFamilyGroup(melmetal.family)).toBe(getFamilyGroup(meltan.family));
    });

    test('adding the line does not create a second convergence point', () => {
        const convergent = all.filter(p => graph.parentsOf(p.id).length > 1).map(p => p.id);
        expect(convergent).toEqual(['SPECIES_MOTHIM_PLANT']);
    });
});
