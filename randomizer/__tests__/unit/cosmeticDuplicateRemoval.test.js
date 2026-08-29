'use strict';

// T-291 — the cosmetic duplicates leave the game, not just the dedup group.
//
// G4 (ADR-026): "a cosmetic form set keeps one form; the rest leave the game." Cosmetic means the
// forms share stats, types and abilities, so a run that could hand out two of them is handing out the
// same Pokémon twice under different art. G1 already stopped them being offered together — this
// removes them from the pool outright, so they stop consuming a dex slot, a docs entry and a
// randomization roll.
//
// The forms KEPT are the canonical ones: the one the player would meet by default, and — for
// Basculin — the only one that leads anywhere, since White-Striped is the base of Basculegion.

const fs = require('fs');
const path = require('path');
const { SPECIES_DIR, TOTAL_GENS } = require('../../constants');
const { parseSpeciesFile } = require('../../parser');
const { buildEvoGraph } = require('../../evoGraph');

function parseAll() {
    const definitions = { VICTREEBEL_SP_DEF: '70', EXEGGUTOR_SP_DEF: '75' };
    const evoTree = {};
    const all = [];
    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        all.push(...parseSpeciesFile(
            fs.readFileSync(path.resolve(SPECIES_DIR, `gen_${gen}_families.h`), 'utf8'), definitions, evoTree));
    }
    return all;
}

const all = parseAll();
const ids = new Set(all.map(p => p.id));

describe('T-291 — the duplicate forms are gone', () => {
    test.each([
        ['SPECIES_BASCULIN_RED_STRIPED'], ['SPECIES_BASCULIN_BLUE_STRIPED'],
        ['SPECIES_DEERLING_SUMMER'], ['SPECIES_DEERLING_AUTUMN'], ['SPECIES_DEERLING_WINTER'],
        ['SPECIES_SAWSBUCK_SUMMER'], ['SPECIES_SAWSBUCK_AUTUMN'], ['SPECIES_SAWSBUCK_WINTER'],
        ['SPECIES_PUMPKABOO_SMALL'], ['SPECIES_PUMPKABOO_LARGE'], ['SPECIES_PUMPKABOO_SUPER'],
        ['SPECIES_GOURGEIST_SMALL'], ['SPECIES_GOURGEIST_LARGE'], ['SPECIES_GOURGEIST_SUPER'],
        ['SPECIES_SHELLOS_EAST'], ['SPECIES_GASTRODON_EAST'],
        ['SPECIES_SINISTEA_ANTIQUE'], ['SPECIES_POLTEAGEIST_ANTIQUE'],
        ['SPECIES_POLTCHAGEIST_ARTISAN'], ['SPECIES_SINISTCHA_MASTERPIECE'],
        ['SPECIES_SQUAWKABILLY_BLUE'], ['SPECIES_SQUAWKABILLY_YELLOW'], ['SPECIES_SQUAWKABILLY_WHITE'],
        ['SPECIES_TATSUGIRI_DROOPY'], ['SPECIES_TATSUGIRI_STRETCHY'],
        ['SPECIES_ZARUDE_DADA'],
        ['SPECIES_XERNEAS_ACTIVE'],
    ])('%s is not in the pokédex', id => {
        expect(ids.has(id)).toBe(false);
    });
});

describe('T-291 — exactly one form of each set survives', () => {
    test.each([
        ['SPECIES_BASCULIN_WHITE_STRIPED'],   // the only one that evolves
        ['SPECIES_DEERLING_SPRING'], ['SPECIES_SAWSBUCK_SPRING'],
        ['SPECIES_PUMPKABOO_AVERAGE'], ['SPECIES_GOURGEIST_AVERAGE'],
        ['SPECIES_SHELLOS_WEST'], ['SPECIES_GASTRODON_WEST'],
        ['SPECIES_SINISTEA_PHONY'], ['SPECIES_POLTEAGEIST_PHONY'],
        ['SPECIES_POLTCHAGEIST_COUNTERFEIT'], ['SPECIES_SINISTCHA_UNREMARKABLE'],
        ['SPECIES_SQUAWKABILLY_GREEN'],
        ['SPECIES_TATSUGIRI_CURLY'],
        ['SPECIES_ZARUDE'],
        ['SPECIES_XERNEAS_NEUTRAL'],
    ])('%s survives', id => {
        expect(ids.has(id)).toBe(true);
    });
});

describe('T-291 — nothing is stranded by the removals', () => {
    const graph = buildEvoGraph(all);

    test('every surviving evolution target still exists', () => {
        const dangling = [];
        for (const poke of all) {
            for (const evo of poke.evolutions || []) {
                if (!ids.has(evo.pokemon)) dangling.push(`${poke.id} → ${evo.pokemon}`);
            }
        }
        expect(dangling).toEqual([]);
    });

    test('the surviving line still reaches its final stage', () => {
        expect(graph.forwardReachable('SPECIES_BASCULIN_WHITE_STRIPED'))
            .toEqual(expect.arrayContaining(['SPECIES_BASCULEGION_M']));
        expect(graph.forwardReachable('SPECIES_POLTCHAGEIST_COUNTERFEIT'))
            .toEqual(['SPECIES_SINISTCHA_UNREMARKABLE']);
        expect(graph.forwardReachable('SPECIES_PUMPKABOO_AVERAGE'))
            .toEqual(['SPECIES_GOURGEIST_AVERAGE']);
    });

    test('removing Poltchageist-Artisan does not orphan a Sinistcha', () => {
        // Masterpiece was only reachable from Artisan, so both had to go together.
        expect(ids.has('SPECIES_SINISTCHA_UNREMARKABLE')).toBe(true);
        expect(graph.parentsOf('SPECIES_SINISTCHA_UNREMARKABLE'))
            .toEqual(['SPECIES_POLTCHAGEIST_COUNTERFEIT']);
    });
});
