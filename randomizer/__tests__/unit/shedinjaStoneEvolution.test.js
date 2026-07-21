'use strict';

// T-183 — Shedinja is a Dusk Stone evolution of Nincada, not the Poké-Ball byproduct mechanic.
// Nincada is a branched evolution: EVO_LEVEL → Ninjask (level rolled by the randomizer) and
// EVO_ITEM(ITEM_DUSK_STONE) → Shedinja with an IF_MIN_LEVEL gate the randomizer rolls per run
// ("piedra + nivel generada en randomización"), exactly like every other branched stone evo.

const fs = require('fs');
const path = require('path');
const rng = require('../../rng');
const { SPECIES_DIR } = require('../../constants');
const { parseSpeciesFile } = require('../../parser');
const { applyEvoLevels } = require('../../evoLevelWriter');

afterEach(() => rng.reset());

// Slice the real [SPECIES_NINCADA] = { ... } block out of the source (up to the next species decl).
function readNincadaEntry() {
    const src = fs.readFileSync(path.join(SPECIES_DIR, 'gen_3_families.h'), 'utf8');
    const start = src.indexOf('[SPECIES_NINCADA] =');
    expect(start).toBeGreaterThan(-1);
    const rest = src.slice(start + '[SPECIES_NINCADA] ='.length);
    const nextDecl = rest.search(/\[SPECIES_\w+\] =/);
    return rest.slice(0, nextDecl === -1 ? rest.length : nextDecl);
}

describe('T-183 — real source: Nincada evolves Shedinja by Dusk Stone', () => {
    const entry = readNincadaEntry();

    test('Shedinja branch is a Dusk Stone stone evolution with an IF_MIN_LEVEL gate', () => {
        expect(entry).toMatch(
            /\{EVO_ITEM,\s*ITEM_DUSK_STONE,\s*SPECIES_SHEDINJA,\s*CONDITIONS\(\{IF_MIN_LEVEL,\s*\d+\}\)\}/,
        );
    });

    test('Ninjask branch stays a plain level evolution', () => {
        expect(entry).toMatch(/\{EVO_LEVEL,\s*\d+,\s*SPECIES_NINJASK\}/);
    });

    test('the old Poké-Ball byproduct mechanic is gone', () => {
        expect(entry).not.toMatch(/EVO_SPLIT_FROM_EVO/);
        expect(entry).not.toMatch(/ITEM_POKE_BALL/);
    });
});

describe('T-183 — parser + randomizer handle the Nincada branch', () => {
    // A Nincada-shaped family fixture mirroring the new source data.
    const mon = (id, body) => `    [${id}] =
    {
        .baseHP = 31, .baseAttack = 45, .baseDefense = 90,
        .baseSpeed = 40, .baseSpAttack = 30, .baseSpDefense = 30,
        .types = MON_TYPES(TYPE_BUG, TYPE_GROUND),
        .abilities = { ABILITY_COMPOUND_EYES, ABILITY_NONE },
        .speciesName = _("Mon"),
        .natDexNum = NATIONAL_DEX_NINCADA,
${body ? `        .evolutions = EVOLUTION(${body}),\n` : ''}    },
`;
    const FIXTURE = `
#if P_FAMILY_NINCADA
${mon('SPECIES_NINCADA', '{EVO_LEVEL, 20, SPECIES_NINJASK},\n                                {EVO_ITEM, ITEM_DUSK_STONE, SPECIES_SHEDINJA, CONDITIONS({IF_MIN_LEVEL, 25})}')}${mon('SPECIES_NINJASK')}${mon('SPECIES_SHEDINJA')}#endif //P_FAMILY_NINCADA
`;

    test('parseEvo reads Shedinja as a stone (ITEM) evo and Ninjask as a level evo', () => {
        const list = parseSpeciesFile(FIXTURE, {}, {});
        const nincada = list.find(p => p.id === 'SPECIES_NINCADA');
        expect(nincada).toBeDefined();

        const ninjask = nincada.evolutions.find(e => e.pokemon === 'SPECIES_NINJASK');
        const shedinja = nincada.evolutions.find(e => e.pokemon === 'SPECIES_SHEDINJA');

        expect(ninjask).toEqual(expect.objectContaining({ method: 'LEVEL', param: '20' }));
        expect(shedinja).toEqual(expect.objectContaining({
            method: 'ITEM',
            param: 'ITEM_DUSK_STONE',
            minLevel: '25',
        }));
        // No trace of the old byproduct method survives parsing.
        expect(nincada.evolutions.some(e => e.method === 'SPLIT_FROM_EVO')).toBe(false);
    });

    test('applyEvoLevels rolls a level for both branches (Ninjask→levelMap, Shedinja→stoneMap)', () => {
        const nincada = {
            id: 'SPECIES_NINCADA',
            rating: { tier: 'NU' },
            evolutionData: { type: 'EVO_TYPE_LC_OF_2' },
            evolutions: [
                { method: 'LEVEL', param: '20', pokemon: 'SPECIES_NINJASK' },
                { method: 'ITEM', param: 'ITEM_DUSK_STONE', pokemon: 'SPECIES_SHEDINJA', minLevel: '25' },
            ],
        };
        const pokes = [
            nincada,
            { id: 'SPECIES_NINJASK', rating: { tier: 'RU' }, evolutionData: { type: 'EVO_TYPE_LAST_OF_2' }, evolutions: [] },
            { id: 'SPECIES_SHEDINJA', rating: { tier: 'PU' }, evolutionData: { type: 'EVO_TYPE_LAST_OF_2' }, evolutions: [] },
        ];

        rng.seed(19);
        const { levelMap, stoneMap } = applyEvoLevels(pokes);

        expect(levelMap.has('SPECIES_NINJASK')).toBe(true);
        expect(stoneMap.has('SPECIES_SHEDINJA')).toBe(true);
        expect(levelMap.has('SPECIES_SHEDINJA')).toBe(false);

        // The Dusk Stone stays on evo.param; the rolled level lands on evo.minLevel.
        const shedinjaEvo = nincada.evolutions.find(e => e.pokemon === 'SPECIES_SHEDINJA');
        expect(shedinjaEvo.param).toBe('ITEM_DUSK_STONE');
        expect(Number.isInteger(stoneMap.get('SPECIES_SHEDINJA'))).toBe(true);
        expect(Number(shedinjaEvo.minLevel)).toBe(stoneMap.get('SPECIES_SHEDINJA'));
    });
});
