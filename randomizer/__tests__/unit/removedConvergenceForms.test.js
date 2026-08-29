'use strict';

// T-289 — Rockruff-Own-Tempo and Gimmighoul-Roaming leave the obtainable pool.
//
// Both existed only to create a SECOND path into an already-reachable evolution, and both made the
// pipeline place two versions of one Pokémon: a run could hand out a plain Rockruff AND an Own-Tempo
// one (each is its own dedup group), and likewise both Gimmighoul. Nothing is lost by dropping them:
//
//   · the plain Rockruff already branches into all three Lycanroc (candy → Midday, moon stone →
//     Midnight, dusk stone → Dusk), which is also the one-candy-branch convention T-060 set;
//   · Gholdengo is still reachable from Gimmighoul-Chest (EVO_LEVEL 40).
//
// Removing them also leaves the dex with exactly ONE convergent evolution — Mothim — which is the
// only place ADR-026's "a convergence point inherits from all its pre-evolutions" rule can fire.

const fs = require('fs');
const path = require('path');
const { SPECIES_DIR, TOTAL_GENS, POKE_FORMS } = require('../../constants');
const { parseSpeciesFile } = require('../../parser');

function parseAllSpecies() {
    const definitions = { VICTREEBEL_SP_DEF: '70', EXEGGUTOR_SP_DEF: '75' };
    const evoTree = {};
    const all = [];
    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        const text = fs.readFileSync(path.resolve(SPECIES_DIR, `gen_${gen}_families.h`), 'utf8');
        parseAllSpecies.evoTree = evoTree;
        all.push(...parseSpeciesFile(text, definitions, evoTree));
    }
    return { all, evoTree };
}

describe('T-289 — the two duplicate-path forms are out of the pool', () => {
    const { all } = parseAllSpecies();
    const ids = new Set(all.map(p => p.id));

    test.each([
        ['SPECIES_ROCKRUFF_OWN_TEMPO'],
        ['SPECIES_GIMMIGHOUL_ROAMING'],
    ])('%s is not parsed into the pokédex', id => {
        expect(ids.has(id)).toBe(false);
    });

    test('the plain Rockruff still reaches all three Lycanroc', () => {
        const rockruff = all.find(p => p.id === 'SPECIES_ROCKRUFF');
        expect(rockruff).toBeDefined();
        const targets = (rockruff.evolutions || []).map(e => e.pokemon).sort();
        expect(targets).toEqual([
            'SPECIES_LYCANROC_DUSK',
            'SPECIES_LYCANROC_MIDDAY',
            'SPECIES_LYCANROC_MIDNIGHT',
        ]);
    });

    test('Gholdengo is still reachable, from Gimmighoul-Chest', () => {
        const chest = all.find(p => p.id === 'SPECIES_GIMMIGHOUL_CHEST');
        expect(chest).toBeDefined();
        expect((chest.evolutions || []).map(e => e.pokemon)).toContain('SPECIES_GHOLDENGO');
    });

    test('Mothim is the only convergent evolution left in the dex', () => {
        const incoming = new Map();
        for (const poke of all) {
            for (const evo of (poke.evolutions || [])) {
                if (!ids.has(evo.pokemon)) continue;
                if (!incoming.has(evo.pokemon)) incoming.set(evo.pokemon, []);
                incoming.get(evo.pokemon).push(poke.id);
            }
        }
        const convergent = [...incoming.entries()]
            .filter(([, sources]) => sources.length > 1)
            .map(([target]) => target)
            .sort();
        expect(convergent).toEqual(['SPECIES_MOTHIM_PLANT']);
    });

    test('OWN_TEMPO and ROAMING are no longer form suffixes', () => {
        // They were only ever used by the two removed species, so leaving them in POKE_FORMS would
        // keep minting families that can never be populated.
        expect(POKE_FORMS).not.toContain('OWN_TEMPO');
        expect(POKE_FORMS).not.toContain('ROAMING');
    });

    test('no surviving species carries either suffix', () => {
        const stragglers = [...ids].filter(id => /_(OWN_TEMPO|ROAMING)$/.test(id));
        expect(stragglers).toEqual([]);
    });
});
