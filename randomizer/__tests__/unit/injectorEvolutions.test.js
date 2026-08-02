// T-239 — inject the evolution levels: `Evolution.param` for level evolutions and the
// `CONDITIONS({IF_MIN_LEVEL, n})` argument for stone evolutions.
//
// The compile path (randomizer/evoLevelWriter.js) is deliberately narrow, and the injector copies its
// rules exactly:
//   · levels are keyed by TARGET species (levelMap/stoneMap), and the regex rewrites EVERY tuple that
//     points at that target — in any species' array, in any gen file;
//   · a plain `{EVO_LEVEL, n, TARGET}` is rewritten, one carrying CONDITIONS(...) is NOT (the regex only
//     matches a tuple closing right after the species) → in the ROM: `params == NULL`;
//   · a stone evo is only rewritten in the exact `CONDITIONS({IF_MIN_LEVEL, n})` shape — one condition,
//     and that condition is IF_MIN_LEVEL;
//   · the maps are built from the pokemon list AFTER the banned-species filter writer.js applies.
const { buildSyntheticBase, constants } = require('../fixtures/syntheticBase');
const { buildInjectionContext } = require('../../injector/context');
const { injectEvolutions } = require('../../injector/modules/evolutions');
const { EVOLUTION, EVOLUTION_PARAM } = require('../../injector/structLayout');

// The module checks that a target's literal name really appears in the base sources (the writer patches
// by name, and cosmetic forms share one species id), so a test that invents an evolution must supply the
// source line that goes with it.
const sourceFor = (tuples) => [{ name: 'test.h', text: tuples.join('\n') }];

function setup({ pokes = [], evolutions = {} } = {}) {
    const base = buildSyntheticBase({ evolutions });
    const ctx = buildInjectionContext({
        rom: base.rom,
        offsetMap: base.offsetMap,
        data: { pokedex: { pokes } },
    });
    return { ...base, ctx };
}

/** Follow a species' `evolutions` pointer and read entry `index` back out of the ROM. */
function readEvolution(base, speciesName, index = 0) {
    const arrayAt = base.rom.readPointer(base.speciesAt(speciesName) + base.evolutionsField);
    const at = arrayAt + index * EVOLUTION.stride;
    const params = base.rom.readU32(at + EVOLUTION.params);
    return {
        method: base.rom.readU16(at + EVOLUTION.method),
        param: base.rom.readU16(at + EVOLUTION.param),
        target: base.rom.readU16(at + EVOLUTION.targetSpecies),
        params,
        minLevel: params ? base.rom.readU16((params - 0x08000000) + EVOLUTION_PARAM.arg1) : null,
    };
}

const levelEvo = (target, param) => ({ method: 'EVO_LEVEL', param, target });
const stoneEvo = (item, target, minLevel) => ({
    method: 'EVO_ITEM', param: item, target, conditions: [{ condition: 'IF_MIN_LEVEL', arg1: minLevel }],
});

describe('level evolutions', () => {
    test('writes the bundle level into every entry pointing at that target', () => {
        const base = setup({
            evolutions: {
                SPECIES_ZIGZAGOON: [levelEvo('SPECIES_LINOONE', 20)],
                // A second species evolving into the same target — the source regex is target-keyed and
                // global, so both must end up at the same level.
                SPECIES_ZIGZAGOON_GALAR: [levelEvo('SPECIES_LINOONE', 20)],
            },
            pokes: [{ id: 'SPECIES_ZIGZAGOON', evolutions: [{ method: 'LEVEL', param: '31', pokemon: 'SPECIES_LINOONE' }] }],
        });
        injectEvolutions(base.ctx);

        expect(readEvolution(base, 'SPECIES_ZIGZAGOON').param).toBe(31);
        expect(readEvolution(base, 'SPECIES_ZIGZAGOON_GALAR').param).toBe(31);
    });

    test('leaves the method and the target species alone', () => {
        const base = setup({
            evolutions: { SPECIES_ZIGZAGOON: [levelEvo('SPECIES_LINOONE', 20)] },
            pokes: [{ id: 'SPECIES_ZIGZAGOON', evolutions: [{ method: 'LEVEL', param: '7', pokemon: 'SPECIES_LINOONE' }] }],
        });
        injectEvolutions(base.ctx);

        const evo = readEvolution(base, 'SPECIES_ZIGZAGOON');
        expect(evo.method).toBe(constants.require('EVO_LEVEL'));
        expect(evo.target).toBe(constants.require('SPECIES_LINOONE'));
        expect(evo.param).toBe(7);
    });

    test('a conditional level evolution is left untouched — the writer skips it too', () => {
        const base = setup({
            evolutions: {
                SPECIES_ZIGZAGOON: [{
                    method: 'EVO_LEVEL', param: 0, target: 'SPECIES_LINOONE',
                    conditions: [{ condition: 'IF_MIN_LEVEL', arg1: 25 }],
                }],
            },
            pokes: [{ id: 'SPECIES_ZIGZAGOON', evolutions: [{ method: 'LEVEL', param: '44', pokemon: 'SPECIES_LINOONE' }] }],
        });
        injectEvolutions(base.ctx);

        expect(readEvolution(base, 'SPECIES_ZIGZAGOON').param).toBe(0);
    });

    test('a target the bundle never re-levelled stays at the base value', () => {
        const base = setup({
            evolutions: { SPECIES_ZIGZAGOON: [levelEvo('SPECIES_LINOONE', 20)] },
            pokes: [{ id: 'SPECIES_BULBASAUR', evolutions: [{ method: 'LEVEL', param: '9', pokemon: 'SPECIES_IVYSAUR' }] }],
        });
        injectEvolutions(base.ctx);

        expect(readEvolution(base, 'SPECIES_ZIGZAGOON').param).toBe(20);
        expect(readEvolution(base, 'SPECIES_BULBASAUR').param).toBe(9);
    });
});

describe('stone evolutions — the level lives in CONDITIONS({IF_MIN_LEVEL, n})', () => {
    test('writes minLevel into the condition, keeping the stone item and the target', () => {
        const base = setup({
            evolutions: { SPECIES_ZIGZAGOON: [stoneEvo('ITEM_SUN_STONE', 'SPECIES_LINOONE', 25)] },
            pokes: [{
                id: 'SPECIES_ZIGZAGOON',
                evolutions: [{ method: 'ITEM', param: 'ITEM_SUN_STONE', pokemon: 'SPECIES_LINOONE', minLevel: '38' }],
            }],
        });
        injectEvolutions(base.ctx, {
            speciesSources: sourceFor(['{EVO_ITEM, ITEM_SUN_STONE, SPECIES_LINOONE, CONDITIONS({IF_MIN_LEVEL, 25})}']),
        });

        const evo = readEvolution(base, 'SPECIES_ZIGZAGOON');
        expect(evo.minLevel).toBe(38);
        expect(evo.param).toBe(constants.require('ITEM_SUN_STONE'));
        expect(evo.target).toBe(constants.require('SPECIES_LINOONE'));
    });

    test('a condition list that is not exactly one IF_MIN_LEVEL is left alone', () => {
        const base = setup({
            evolutions: {
                SPECIES_ZIGZAGOON: [{
                    method: 'EVO_ITEM', param: 'ITEM_SUN_STONE', target: 'SPECIES_LINOONE',
                    conditions: [{ condition: 'IF_MIN_LEVEL', arg1: 25 }, { condition: 'IF_MIN_FRIENDSHIP', arg1: 220 }],
                }],
            },
            pokes: [{
                id: 'SPECIES_ZIGZAGOON',
                evolutions: [{ method: 'ITEM', param: 'ITEM_SUN_STONE', pokemon: 'SPECIES_LINOONE', minLevel: '40' }],
            }],
        });
        injectEvolutions(base.ctx);

        expect(readEvolution(base, 'SPECIES_ZIGZAGOON').minLevel).toBe(25);
    });

    test('a stone evolution with no conditions at all is left alone', () => {
        const base = setup({
            evolutions: { SPECIES_ZIGZAGOON: [{ method: 'EVO_ITEM', param: 'ITEM_SUN_STONE', target: 'SPECIES_LINOONE' }] },
            pokes: [{
                id: 'SPECIES_ZIGZAGOON',
                evolutions: [{ method: 'ITEM', param: 'ITEM_SUN_STONE', pokemon: 'SPECIES_LINOONE', minLevel: '40' }],
            }],
        });
        injectEvolutions(base.ctx);

        expect(readEvolution(base, 'SPECIES_ZIGZAGOON').params).toBe(0);
    });
});

describe('mirroring writer.js exactly', () => {
    test('a banned species contributes no levels — writer.js filters the list first', () => {
        const base = setup({
            evolutions: { SPECIES_ZIGZAGOON: [levelEvo('SPECIES_LINOONE', 20)] },
            pokes: [{
                id: 'SPECIES_GRENINJA_ASH',   // BANNED_SPECIES_FOR_PICKING
                evolutions: [{ method: 'LEVEL', param: '3', pokemon: 'SPECIES_LINOONE' }],
            }],
        });
        injectEvolutions(base.ctx);

        expect(readEvolution(base, 'SPECIES_ZIGZAGOON').param).toBe(20);
    });

    test('a bundle with no evolution levels writes nothing', () => {
        const base = setup({
            evolutions: { SPECIES_ZIGZAGOON: [levelEvo('SPECIES_LINOONE', 20)] },
            pokes: [{ id: 'SPECIES_ZIGZAGOON', evolutions: [] }],
        });
        const { writes } = injectEvolutions(base.ctx);

        expect(writes).toBe(0);
        expect(base.rom.journal).toHaveLength(0);
    });

    test('tags every write with this module', () => {
        const base = setup({
            evolutions: { SPECIES_ZIGZAGOON: [levelEvo('SPECIES_LINOONE', 20)] },
            pokes: [{ id: 'SPECIES_ZIGZAGOON', evolutions: [{ method: 'LEVEL', param: '31', pokemon: 'SPECIES_LINOONE' }] }],
        });
        injectEvolutions(base.ctx);
        expect(base.rom.journal.every(e => /evolution/i.test(e.tag))).toBe(true);
    });
});

describe('shared literals — the hazard of writing through a pointer', () => {
    test('an evolution array reached from two species is written once, not twice', () => {
        // If the compiler folded two identical EVOLUTION() literals into one object, walking both species
        // reaches the same bytes; writing twice would trip the overlap guard for no reason.
        const base = setup({
            evolutions: { SPECIES_ZIGZAGOON: [levelEvo('SPECIES_LINOONE', 20)] },
            pokes: [{ id: 'SPECIES_ZIGZAGOON', evolutions: [{ method: 'LEVEL', param: '31', pokemon: 'SPECIES_LINOONE' }] }],
        });
        const shared = base.rom.readU32(base.speciesAt('SPECIES_ZIGZAGOON') + base.evolutionsField);
        base.rom.buffer.writeUInt32LE(shared, base.speciesAt('SPECIES_LINOONE') + base.evolutionsField);

        expect(() => injectEvolutions(base.ctx)).not.toThrow();
        expect(readEvolution(base, 'SPECIES_ZIGZAGOON').param).toBe(31);
    });

    test('one condition array shared by two targets with different levels throws, never half-writes', () => {
        const base = setup({
            evolutions: {
                SPECIES_ZIGZAGOON: [stoneEvo('ITEM_SUN_STONE', 'SPECIES_LINOONE', 25)],
                SPECIES_LINOONE: [stoneEvo('ITEM_SUN_STONE', 'SPECIES_VENUSAUR', 25)],
            },
            pokes: [
                { id: 'SPECIES_ZIGZAGOON', evolutions: [{ method: 'ITEM', param: 'ITEM_SUN_STONE', pokemon: 'SPECIES_LINOONE', minLevel: '30' }] },
                { id: 'SPECIES_LINOONE', evolutions: [{ method: 'ITEM', param: 'ITEM_SUN_STONE', pokemon: 'SPECIES_VENUSAUR', minLevel: '44' }] },
            ],
        });
        // Fold both stone evolutions onto one CONDITIONS() object, as -fmerge-all-constants would.
        const zigzagoonEvo = base.rom.readPointer(base.speciesAt('SPECIES_ZIGZAGOON') + base.evolutionsField);
        const linooneEvo = base.rom.readPointer(base.speciesAt('SPECIES_LINOONE') + base.evolutionsField);
        const sharedConditions = base.rom.readU32(zigzagoonEvo + EVOLUTION.params);
        base.rom.buffer.writeUInt32LE(sharedConditions, linooneEvo + EVOLUTION.params);

        let error = null;
        try {
            injectEvolutions(base.ctx, {
                speciesSources: sourceFor([
                    '{EVO_ITEM, ITEM_SUN_STONE, SPECIES_LINOONE, CONDITIONS({IF_MIN_LEVEL, 25})}',
                    '{EVO_ITEM, ITEM_SUN_STONE, SPECIES_VENUSAUR, CONDITIONS({IF_MIN_LEVEL, 25})}',
                ]),
            });
        } catch (err) {
            error = err;
        }
        expect(error).not.toBeNull();
        expect(error.message).toMatch(/SPECIES_LINOONE|SPECIES_VENUSAUR/);
        expect(error.message).toMatch(/shar|merge/i);
        // It refuses before touching the ROM, so a failed run leaves no half-injected image behind.
        expect(base.rom.journal).toHaveLength(0);
    });
});

describe('name vs id — cosmetic forms share a species id', () => {
    test('a target whose literal name is absent from the sources is not written', () => {
        // GATE-3 on the real base: the bundle re-levels SPECIES_SPEWPA_ICY_SNOW, but the sources only
        // ever write SPECIES_SPEWPA (the same id). compile() changes nothing, so neither may the injector.
        const base = setup({
            evolutions: { SPECIES_ZIGZAGOON: [levelEvo('SPECIES_LINOONE', 20)] },
            pokes: [{ id: 'SPECIES_ZIGZAGOON', evolutions: [{ method: 'LEVEL', param: '44', pokemon: 'SPECIES_LINOONE' }] }],
        });
        const { writes } = injectEvolutions(base.ctx, {
            speciesSources: sourceFor(['{EVO_LEVEL, 20, SPECIES_LINOONE_GALAR}']),   // a different literal
        });

        expect(writes).toBe(0);
        expect(readEvolution(base, 'SPECIES_ZIGZAGOON').param).toBe(20);
    });

    test('two aliases of one id wanting different levels throws instead of picking one', () => {
        const base = setup({
            evolutions: { SPECIES_ZIGZAGOON: [levelEvo('SPECIES_LINOONE', 20)] },
            pokes: [
                { id: 'SPECIES_ZIGZAGOON', evolutions: [{ method: 'LEVEL', param: '31', pokemon: 'SPECIES_LINOONE' }] },
                { id: 'SPECIES_ZIGZAGOON_GALAR', evolutions: [{ method: 'LEVEL', param: '44', pokemon: 'SPECIES_LINOONE_ALIAS' }] },
            ],
        });
        // Both literals present in the sources, and both names resolve to the same id.
        const constantsGet = base.ctx.constants.get.bind(base.ctx.constants);
        base.ctx.constants.get = (name) => (name === 'SPECIES_LINOONE_ALIAS' ? constantsGet('SPECIES_LINOONE') : constantsGet(name));

        expect(() => injectEvolutions(base.ctx, {
            speciesSources: sourceFor(['{EVO_LEVEL, 20, SPECIES_LINOONE}', '{EVO_LEVEL, 20, SPECIES_LINOONE_ALIAS}']),
        })).toThrow(/same species id/);
    });
});
