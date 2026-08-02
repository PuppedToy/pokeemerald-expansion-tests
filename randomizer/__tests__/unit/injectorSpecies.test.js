// T-239 — inject gSpeciesInfo: base stats, types, abilities and the T-077 wild-held-item strip.
//
// The compile path (randomizer/pokemonWriter.js editSpeciesFile) rewrites a `.baseHP` / `.types` /
// `.abilities` line ONLY when that species' rebalance log carries the matching target; every other line
// stays byte-identical. INV-BYTES therefore requires the injector to mirror that *decision*, not just
// the values — writing a bundle value the writer would have left alone changes bytes `compile()` never
// changed. stripWildHeldItems is the opposite case: it zeroes itemCommon/itemRare for EVERY species.
const { buildSyntheticBase, constants } = require('../fixtures/syntheticBase');
const { buildInjectionContext } = require('../../injector/context');
const { injectSpeciesInfo } = require('../../injector/modules/species');
const { SPECIES_INFO } = require('../../injector/structLayout');

const NONE = 0;

function poke(id, over = {}) {
    return {
        id,
        baseHP: 50, baseAttack: 50, baseDefense: 50, baseSpeed: 50, baseSpAttack: 50, baseSpDefense: 50,
        parsedTypes: ['NORMAL'],
        parsedAbilities: ['RUN_AWAY', 'NONE', 'NONE'],
        log: [],
        ...over,
    };
}

function setup({ pokes, species = {} } = {}) {
    const base = buildSyntheticBase({
        species: {
            SPECIES_ZIGZAGOON: {
                stats: [38, 30, 41, 60, 30, 41],
                types: ['TYPE_NORMAL', 'TYPE_NORMAL'],
                abilities: ['ABILITY_PICKUP', 'ABILITY_GLUTTONY', 'ABILITY_QUICK_FEET'],
                itemCommon: 'ITEM_ORAN_BERRY',
                itemRare: 'ITEM_LEPPA_BERRY',
            },
            SPECIES_LINOONE: {
                stats: [78, 70, 61, 100, 50, 61],
                types: ['TYPE_NORMAL', 'TYPE_NORMAL'],
                abilities: ['ABILITY_PICKUP', 'ABILITY_GLUTTONY', 'ABILITY_QUICK_FEET'],
            },
            ...species,
        },
    });
    const ctx = buildInjectionContext({
        rom: base.rom,
        offsetMap: base.offsetMap,
        data: { pokedex: { pokes } },
    });
    return { ...base, ctx };
}

const readStat = (base, name, field) => base.rom.readU8(base.speciesAt(name) + SPECIES_INFO[field]);
const readType = (base, name, i) => base.rom.readU8(base.speciesAt(name) + SPECIES_INFO.types + i);
const readAbility = (base, name, i) => base.rom.readU16(base.speciesAt(name) + SPECIES_INFO.abilities + i * 2);

describe('base stats — only the logged ones, exactly like the writer', () => {
    test('writes a stat the log names and leaves the others at their base value', () => {
        const base = setup({
            pokes: [poke('SPECIES_ZIGZAGOON', {
                baseHP: 44, baseAttack: 55, baseSpeed: 71,
                log: [{ type: 'BUFF', target: 'baseAttack', oldValue: 30, value: 25 }],
            })],
        });
        injectSpeciesInfo(base.ctx);

        expect(readStat(base, 'SPECIES_ZIGZAGOON', 'baseAttack')).toBe(55);
        expect(readStat(base, 'SPECIES_ZIGZAGOON', 'baseHP')).toBe(38);      // unlogged → untouched
        expect(readStat(base, 'SPECIES_ZIGZAGOON', 'baseSpeed')).toBe(60);   // unlogged → untouched
    });

    test('a species with an empty log is not written at all (bar its held items)', () => {
        const base = setup({ pokes: [poke('SPECIES_LINOONE', { baseHP: 1, parsedTypes: ['FIRE'] })] });
        injectSpeciesInfo(base.ctx);

        expect(readStat(base, 'SPECIES_LINOONE', 'baseHP')).toBe(78);
        expect(readType(base, 'SPECIES_LINOONE', 0)).toBe(constants.require('TYPE_NORMAL'));
        const tags = base.rom.journal.filter(e => e.offset >= base.speciesAt('SPECIES_LINOONE')
            && e.offset < base.speciesAt('SPECIES_LINOONE') + base.strides.species);
        expect(tags.every(e => /item/i.test(e.tag))).toBe(true);
    });

    test('writes every logged stat of a species in one pass', () => {
        const base = setup({
            pokes: [poke('SPECIES_ZIGZAGOON', {
                baseHP: 40, baseAttack: 35, baseDefense: 45, baseSpeed: 65, baseSpAttack: 25, baseSpDefense: 40,
                log: [
                    { target: 'baseHP' }, { target: 'baseAttack' }, { target: 'baseDefense' },
                    { target: 'baseSpeed' }, { target: 'baseSpAttack' }, { target: 'baseSpDefense' },
                ],
            })],
        });
        injectSpeciesInfo(base.ctx);

        expect([...base.rom.readBytes(base.speciesAt('SPECIES_ZIGZAGOON'), 6)]).toEqual([40, 35, 45, 65, 25, 40]);
    });

    test('a stat that does not fit a u8 throws — the compile path would fail the build too', () => {
        const base = setup({
            pokes: [poke('SPECIES_ZIGZAGOON', { baseHP: 300, log: [{ target: 'baseHP' }] })],
        });
        expect(() => injectSpeciesInfo(base.ctx)).toThrow(/SPECIES_ZIGZAGOON|300/);
    });
});

describe('types — MON_TYPES() semantics', () => {
    test('a logged type change writes both slots', () => {
        const base = setup({
            pokes: [poke('SPECIES_ZIGZAGOON', {
                parsedTypes: ['DARK', 'ROCK'],
                log: [{ target: 'type', oldValue: 'NORMAL', value: 'ROCK' }],
            })],
        });
        injectSpeciesInfo(base.ctx);

        expect(readType(base, 'SPECIES_ZIGZAGOON', 0)).toBe(constants.require('TYPE_DARK'));
        expect(readType(base, 'SPECIES_ZIGZAGOON', 1)).toBe(constants.require('TYPE_ROCK'));
    });

    test('a mono-type mon fills both slots with the same type, as MON_TYPES(t) expands', () => {
        const base = setup({
            pokes: [poke('SPECIES_ZIGZAGOON', { parsedTypes: ['GHOST'], log: [{ target: 'type' }] })],
        });
        injectSpeciesInfo(base.ctx);

        expect(readType(base, 'SPECIES_ZIGZAGOON', 0)).toBe(constants.require('TYPE_GHOST'));
        expect(readType(base, 'SPECIES_ZIGZAGOON', 1)).toBe(constants.require('TYPE_GHOST'));
    });

    test('a token that is not a type (a config macro, B-010) leaves that slot as the base has it', () => {
        // The writer emits such a token verbatim, so the compiler resolves it to the base's own value —
        // i.e. the byte does not change. The injector must therefore not touch it (and must not guess).
        const base = setup({
            pokes: [poke('SPECIES_ZIGZAGOON', {
                parsedTypes: ['RALTS_FAMILY_TYPE2', 'FIRE'],
                log: [{ target: 'type' }],
            })],
        });
        injectSpeciesInfo(base.ctx);

        expect(readType(base, 'SPECIES_ZIGZAGOON', 0)).toBe(constants.require('TYPE_NORMAL'));   // base value
        expect(readType(base, 'SPECIES_ZIGZAGOON', 1)).toBe(constants.require('TYPE_FIRE'));
    });
});

describe('abilities', () => {
    test('a logged ability change writes all three slots', () => {
        const base = setup({
            pokes: [poke('SPECIES_ZIGZAGOON', {
                parsedAbilities: ['SAND_VEIL', 'COSTAR', 'SAND_RUSH'],
                log: [{ target: 'ability' }],
            })],
        });
        injectSpeciesInfo(base.ctx);

        expect(readAbility(base, 'SPECIES_ZIGZAGOON', 0)).toBe(constants.require('ABILITY_SAND_VEIL'));
        expect(readAbility(base, 'SPECIES_ZIGZAGOON', 1)).toBe(constants.require('ABILITY_COSTAR'));
        expect(readAbility(base, 'SPECIES_ZIGZAGOON', 2)).toBe(constants.require('ABILITY_SAND_RUSH'));
    });

    test('an unknown ability name throws instead of writing a wrong id', () => {
        const base = setup({
            pokes: [poke('SPECIES_ZIGZAGOON', { parsedAbilities: ['NOT_AN_ABILITY'], log: [{ target: 'ability' }] })],
        });
        expect(() => injectSpeciesInfo(base.ctx)).toThrow(/ABILITY_NOT_AN_ABILITY/);
    });
});

describe('wild held items — T-077 strips them for every species, not just the bundle’s', () => {
    test('zeroes itemCommon and itemRare across the whole table', () => {
        const base = setup({ pokes: [poke('SPECIES_ZIGZAGOON')] });
        injectSpeciesInfo(base.ctx);

        for (const name of ['SPECIES_ZIGZAGOON', 'SPECIES_LINOONE', 'SPECIES_BULBASAUR']) {
            expect(base.rom.readU16(base.speciesAt(name) + SPECIES_INFO.itemCommon)).toBe(NONE);
            expect(base.rom.readU16(base.speciesAt(name) + SPECIES_INFO.itemRare)).toBe(NONE);
        }
        // …including a species the bundle never mentions.
        expect(base.rom.readU16(base.speciesAt('SPECIES_MIRAIDON') + SPECIES_INFO.itemCommon)).toBe(NONE);
    });

    test('covers every entry of the table exactly once', () => {
        const base = setup({ pokes: [] });
        const { writes } = injectSpeciesInfo(base.ctx);
        expect(writes.heldItems).toBe(constants.require('NUM_SPECIES'));
    });
});

describe('mirroring writer.js exactly', () => {
    test('a banned species is never written — writer.js filters the list before savePokemonData', () => {
        // Found by GATE-3 on the real base: Castform's weather forms carry a rebalance log, and injecting
        // them made gSpeciesInfo differ from every compiled ROM by 13 bytes.
        const base = setup({
            pokes: [poke('SPECIES_CASTFORM_SNOWY', { baseHP: 1, baseSpDefense: 2, log: [{ target: 'baseHP' }, { target: 'baseSpDefense' }] })],
        });
        const { writes } = injectSpeciesInfo(base.ctx);

        expect(writes.stats).toBe(0);
        expect(readStat(base, 'SPECIES_CASTFORM_SNOWY', 'baseHP')).not.toBe(1);
    });
});

describe('failure modes', () => {
    test('a species the base sources do not contain is a no-op — compile cannot write it either', () => {
        const base = setup({ pokes: [poke('SPECIES_MISSINGNO', { log: [{ target: 'baseHP' }] })] });
        const { writes } = injectSpeciesInfo(base.ctx);
        expect(writes.stats).toBe(0);
    });

    test('a species in the sources with no id in the base headers throws naming it', () => {
        // Drift between src/data/pokemon/species_info/*.h and include/constants/species.h.
        const base = setup({ pokes: [poke('SPECIES_NOT_A_SPECIES', { baseHP: 7, log: [{ target: 'baseHP' }] })] });
        const speciesSources = [{
            name: 'fake.h',
            text: ['    [SPECIES_NOT_A_SPECIES] =', '    {', '        .baseHP        = 20,', '    },'].join('\n'),
        }];
        expect(() => injectSpeciesInfo(base.ctx, { speciesSources })).toThrow(/SPECIES_NOT_A_SPECIES/);
    });

    test('tags every write so an overlap names this module', () => {
        const base = setup({
            pokes: [poke('SPECIES_ZIGZAGOON', { log: [{ target: 'baseHP' }] })],
        });
        injectSpeciesInfo(base.ctx);
        expect(base.rom.journal.length).toBeGreaterThan(0);
        expect(base.rom.journal.every(e => typeof e.tag === 'string' && e.tag.length > 0)).toBe(true);
        expect(base.rom.journal.some(e => /species/i.test(e.tag))).toBe(true);
    });
});

describe('macro-backed species — what the writer cannot reach, the injector must not write', () => {
    // 239 species are `[SPECIES_X] = SOME_MISC_INFO(…)`: their stats live in one shared #define body, so
    // editSpeciesFile cannot rewrite them per species and compile() leaves them at their base values.
    const macroSource = (name = 'macro.h') => ({
        name,
        text: [
            '#define ZIG_MISC_INFO(x)                                  \\',
            '    {                                                     \\',
            '        .baseHP        = 38,                              \\',
            '        .types = MON_TYPES(TYPE_NORMAL),                  \\',
            '    }',
            '',
            '    [SPECIES_ZIGZAGOON] = ZIG_MISC_INFO(1),',
            '    [SPECIES_ZIGZAGOON_GALAR] = ZIG_MISC_INFO(2),',
            '    [SPECIES_LINOONE] =',
            '    {',
            '        .baseHP        = 78,',
            '    },',
        ].join('\n'),
    });

    test('a macro-backed species with a rebalance log is left alone', () => {
        const base = setup({
            pokes: [poke('SPECIES_ZIGZAGOON', { baseHP: 99, log: [{ target: 'baseHP' }] })],
        });
        const { writes } = injectSpeciesInfo(base.ctx, { speciesSources: [macroSource()] });

        expect(writes.stats).toBe(0);
        expect(readStat(base, 'SPECIES_ZIGZAGOON', 'baseHP')).toBe(38);
    });

    test('a species that owns its line is written from the same pass', () => {
        const base = setup({
            pokes: [poke('SPECIES_LINOONE', { baseHP: 90, log: [{ target: 'baseHP' }] })],
        });
        injectSpeciesInfo(base.ctx, { speciesSources: [macroSource()] });

        expect(readStat(base, 'SPECIES_LINOONE', 'baseHP')).toBe(90);
    });

    test('when the writer does rewrite a macro body, every species using it moves — as the ROM would', () => {
        // The writer attributes a line to the last [SPECIES_…] header it saw, so an unconsumed log entry
        // can land inside a #define. Then the compiler applies it to every user, and so must the injector.
        const source = {
            name: 'bleed.h',
            text: [
                '    [SPECIES_LINOONE] =',
                '    {',
                '        .baseSpeed     = 100,',
                '    },',
                '#define ZIG_MISC_INFO(x)                              \\',
                '    {                                                 \\',
                '        .baseHP        = 38,                          \\',
                '    }',
                '    [SPECIES_ZIGZAGOON] = ZIG_MISC_INFO(1),',
                '    [SPECIES_ZIGZAGOON_GALAR] = ZIG_MISC_INFO(2),',
            ].join('\n'),
        };
        const base = setup({
            pokes: [poke('SPECIES_LINOONE', { baseHP: 55, log: [{ target: 'baseHP' }] })],
        });
        injectSpeciesInfo(base.ctx, { speciesSources: [source] });

        // Linoone's own block has no .baseHP line, so the writer's first match is the macro's.
        expect(readStat(base, 'SPECIES_ZIGZAGOON', 'baseHP')).toBe(55);
        expect(readStat(base, 'SPECIES_ZIGZAGOON_GALAR', 'baseHP')).toBe(55);
    });
});
