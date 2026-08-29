'use strict';

// T-283 — a species whose stats live in a shared `#define` body must still receive its mutations.
//
// `editSpeciesFile` recognises a species by `    [SPECIES_X] =` and rewrites the `.baseHP` / `.types`
// / `.abilities` lines that FOLLOW it. A species written as `[SPECIES_X] = SOME_SPECIES_INFO,` owns
// none of those lines — they live in a `#define` body shared with its sibling forms — so the writer
// had nothing to edit and the species kept its base stats, while the parser read the macro and the
// docs showed the mutated ones. A docs≠ROM defect, the same class as B-062.
//
// Six live species are affected, all of them survivors of a T-154 cosmetic collapse: Mothim,
// Vivillon-Icy-Snow, Flabébé/Floette/Florges-Red and Alcremie-Strawberry-Vanilla-Cream.
//
// Two things have to be true, and the second is a latent bug the injector's own header warned about
// ("the pathological case where an unconsumed log entry rewrites a macro body and so moves every
// species that uses it"): a macro body must be written for its OWNER, and never for whichever species
// block happened to precede it in the file.

const { editSpeciesFile } = require('../../pokemonWriter');

const macroSource = [
    '    [SPECIES_EARLIER] =',
    '    {',
    '        .baseHP        = 50,',
    '        .baseAttack    = 50,',
    // deliberately NO `.types` line: this species declares its types elsewhere, so a `type` log
    // entry has nothing in its own block to consume it — the setup for the leak below.
    '    },',
    '',
    '#define SHARED_SPECIES_INFO                                              \\',
    '    {                                                                    \\',
    '        .baseHP        = 70,                                             \\',
    '        .baseAttack    = 94,                                             \\',
    '        .types = MON_TYPES(TYPE_BUG, TYPE_FLYING),                       \\',
    '    }',
    '',
    '    [SPECIES_SHARED_A] = SHARED_SPECIES_INFO,',
    '    [SPECIES_SHARED_B] = SHARED_SPECIES_INFO,',
].join('\n');

const mon = (id, over = {}) => ({
    id, baseHP: 70, baseAttack: 94, baseDefense: 50, baseSpeed: 50, baseSpAttack: 50, baseSpDefense: 50,
    parsedTypes: ['BUG', 'FLYING'], parsedAbilities: ['SWARM', 'NONE'], log: [], ...over,
});

describe('T-283 — a macro body is written for the species that owns it', () => {
    const list = [
        mon('SPECIES_EARLIER', { baseHP: 50, baseAttack: 50, parsedTypes: ['NORMAL'] }),
        mon('SPECIES_SHARED_A', { baseHP: 111, log: [{ target: 'baseHP', oldValue: 70, value: 41, type: 'BUFF' }] }),
        mon('SPECIES_SHARED_B'),
    ];
    const out = editSpeciesFile(macroSource, list);

    test('the mutated stat reaches the macro body', () => {
        expect(out).toMatch(/\.baseHP\s*= 111,/);
        expect(out).toContain('@PUPPED-AUTO-BALANCE #SPECIES_SHARED_A');
    });

    test('the line continuation survives, so the macro still compiles', () => {
        const line = out.split('\n').find(l => /\.baseHP\s*= 111,/.test(l));
        expect(line.trimEnd().endsWith('\\')).toBe(true);
        // A `//` comment before a trailing backslash would swallow the next macro line (B-025).
        expect(line).not.toMatch(/\/\/.*\\\s*$/);
    });

    test('an untouched stat in the macro body is left alone', () => {
        expect(out).toMatch(/\.baseAttack\s*= 94,\s*\\/);
    });
});

describe('T-283 — a macro body is never written for the species before it', () => {
    test("an earlier species' unconsumed log entry cannot reach the macro", () => {
        // SPECIES_EARLIER carries a type change its own block cannot consume, because its block has
        // no `.types` line. The entry survives to the next `.types` the writer meets — which is the
        // macro body's, belonging to an entirely different Pokémon.
        const list = [
            mon('SPECIES_EARLIER', {
                baseHP: 50, baseAttack: 50, parsedTypes: ['GHOST'],
                log: [{ target: 'type', oldValue: 'NORMAL', value: 'GHOST', type: 'ADJUSTMENT' }],
            }),
            mon('SPECIES_SHARED_A'),
            mon('SPECIES_SHARED_B'),
        ];
        const out = editSpeciesFile(macroSource, list);
        // The macro's own types must be untouched — Bug/Flying, not the earlier species' Ghost.
        expect(out).toMatch(/\.types = MON_TYPES\(TYPE_BUG, TYPE_FLYING\),\s*\\/);
        expect(out).not.toMatch(/MON_TYPES\(TYPE_GHOST\)[^\n]*\\/);
    });

    test('a macro nothing in the dex owns is left completely alone', () => {
        const orphan = [
            '#define ORPHAN_SPECIES_INFO                                          \\',
            '        .baseHP        = 33,                                         \\',
            '    }',
        ].join('\n');
        const list = [mon('SPECIES_SHARED_A', { baseHP: 111, log: [{ target: 'baseHP', oldValue: 70, value: 41, type: 'BUFF' }] })];
        expect(editSpeciesFile(orphan, list)).toBe(orphan);
    });
});

describe('T-283 — ordinary species blocks are byte-identical to before', () => {
    test('a normal block still gets the // comment form, with no continuation', () => {
        const plain = [
            '    [SPECIES_PLAIN] =',
            '    {',
            '        .baseHP        = 50,',
            '    },',
        ].join('\n');
        const list = [mon('SPECIES_PLAIN', { baseHP: 60, log: [{ target: 'baseHP', oldValue: 50, value: 10, type: 'BUFF' }] })];
        const out = editSpeciesFile(plain, list);
        expect(out).toContain('        .baseHP        = 60, // @PUPPED-AUTO-BALANCE #SPECIES_PLAIN [oldValue = 50] -- previous line was >>         .baseHP        = 50,');
    });
});

describe('T-283 — the real sources: the affected species now get written', () => {
    // The acceptance criterion, asserted on the outcome rather than by re-deriving the writer's own
    // macro scan in the test (an earlier version of this file did that and drifted immediately).
    const fs = require('fs');
    const path = require('path');
    const { SPECIES_DIR, TOTAL_GENS } = require('../../constants');
    const { parseSpeciesFile } = require('../../parser');

    const definitions = { VICTREEBEL_SP_DEF: '70', EXEGGUTOR_SP_DEF: '75' };
    const evoTree = {};
    const sources = [];
    const dex = [];
    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        const text = fs.readFileSync(path.resolve(SPECIES_DIR, `gen_${gen}_families.h`), 'utf8');
        sources.push(text);
        dex.push(...parseSpeciesFile(text, definitions, evoTree));
    }

    // Every live species whose own block declares no stat line — the ones the writer used to miss.
    const macroBacked = [];
    for (const text of sources) {
        let cur = null; let sawStat = false;
        for (const line of text.split('\n')) {
            const header = line.match(/^    \[(SPECIES_[A-Z0-9_]+)\] =/);
            if (header) {
                if (cur && !sawStat && dex.some(p => p.id === cur)) macroBacked.push(cur);
                cur = header[1]; sawStat = false; continue;
            }
            if (cur && /^\s*\.baseHP\s*=/.test(line)) sawStat = true;
        }
        if (cur && !sawStat && dex.some(p => p.id === cur)) macroBacked.push(cur);
    }

    test('there are exactly the six the audit found', () => {
        expect(macroBacked.sort()).toEqual([
            'SPECIES_ALCREMIE_STRAWBERRY_VANILLA_CREAM',
            'SPECIES_FLABEBE_RED',
            'SPECIES_FLOETTE_RED',
            'SPECIES_FLORGES_RED',
            'SPECIES_MOTHIM_PLANT',
            'SPECIES_VIVILLON_ICY_SNOW',
        ]);
    });

    test.each([
        ['SPECIES_MOTHIM_PLANT'], ['SPECIES_VIVILLON_ICY_SNOW'], ['SPECIES_FLABEBE_RED'],
        ['SPECIES_FLOETTE_RED'], ['SPECIES_FLORGES_RED'],
        ['SPECIES_ALCREMIE_STRAWBERRY_VANILLA_CREAM'],
    ])('%s: a baseHP mutation reaches the source', id => {
        const poke = dex.find(p => p.id === id);
        expect(poke).toBeDefined();
        const mutated = { ...poke, baseHP: 199, log: [{ target: 'baseHP', oldValue: poke.baseHP, value: 1, type: 'BUFF' }] };
        const list = dex.map(p => (p.id === id ? mutated : { ...p, log: [] }));
        const changed = sources.map(text => editSpeciesFile(text, list)).join('\n');
        expect(changed).toContain(`@PUPPED-AUTO-BALANCE #${id}`);
        expect(changed).toMatch(/\.baseHP\s*= 199,/);
    });

    test('a written macro line keeps its continuation', () => {
        const poke = dex.find(p => p.id === 'SPECIES_MOTHIM_PLANT');
        const list = dex.map(p => (p.id === poke.id
            ? { ...p, baseHP: 199, log: [{ target: 'baseHP', oldValue: p.baseHP, value: 1, type: 'BUFF' }] }
            : { ...p, log: [] }));
        const changed = sources.map(text => editSpeciesFile(text, list)).join('\n');
        const line = changed.split('\n').find(l => /\.baseHP\s*= 199,/.test(l));
        expect(line.trimEnd().endsWith('\\')).toBe(true);
        expect(line).not.toMatch(/\/\/.*\\\s*$/);
    });
});
