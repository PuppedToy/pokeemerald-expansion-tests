'use strict';

/**
 * Inject the evolution levels (T-239, Group A).
 *
 * Reference: `randomizer/evoLevelWriter.js`. In bundle mode (`recompute: false`) it does not roll
 * anything — it reads the levels already stored on `evolutions[].param` / `.minLevel` and patches the gen
 * files with two deliberately narrow regexes. Both rules are copied here, because both decide which
 * bytes `compile()` changes:
 *
 *   · `patchEvoLevelInContent` rewrites `{EVO_LEVEL, n, TARGET}` — a tuple closing right after the
 *     species, i.e. `params == NULL` in the ROM. A conditional level evolution is left alone.
 *   · `patchStoneMinLevelInContent` rewrites the `n` in `{EVO_ITEM, ITEM_x, TARGET,
 *     CONDITIONS({IF_MIN_LEVEL, n})}` — exactly one condition, and it must be IF_MIN_LEVEL.
 *   · Both are keyed by **target species** and applied to every gen file, so every entry pointing at
 *     that target gets the same level, whichever species holds it — including species writer.js filtered
 *     out of the pokemon list (the filter decides which levels are *collected*, not which are *written*).
 *
 * The maps come from `evoLevelWriter.buildEvoLevelMapFromParams` itself, over the same
 * `BANNED_SPECIES_FOR_PICKING`-filtered list writer.js builds — one home for that rule, not two.
 *
 * One subtlety the ROM cannot express: the writer patches by the species NAME as written in the source,
 * while an evolution entry in the ROM only carries a species **id** — and cosmetic forms are aliases of
 * the same id (`#define SPECIES_SPEWPA SPECIES_SPEWPA_ICY_SNOW`). GATE-3 caught this: the bundle
 * re-levels `…_ICY_SNOW`, that literal appears nowhere in the sources, so `compile()` changes nothing
 * while an id-keyed injector rewrote every Scatterbug-family evolution. So a target only counts if the
 * base sources really contain a tuple naming it — the same test the writer's regex applies.
 *
 * Writes are planned first and applied at the end: two species can share one folded `CONDITIONS()`
 * object, and if their targets want different levels that is not injectable at all — better to refuse
 * before touching the ROM than to leave a half-injected image.
 */

const { EVOLUTION, EVOLUTION_PARAM } = require('../structLayout');
const { buildEvoLevelMapFromParams } = require('../../evoLevelWriter');
const { BANNED_SPECIES_FOR_PICKING } = require('../../modules/wildModule');
const { toRomOffset } = require('../symbolMap');
const { loadSpeciesSources } = require('./species');

const TAG = 'evolutions';
const MAX_ENTRIES = 64;   // an evolution array is sentinel-terminated; this bounds a corrupt walk

/** Every distinct evolution array in the ROM, as `[arrayOffset, …]` (folded literals appear once). */
function collectEvolutionArrays(ctx) {
    const { rom } = ctx;
    const field = ctx.evolutionsField();
    const { count } = ctx.layout.species;
    const arrays = new Set();
    for (let id = 0; id < count; id++) {
        const pointer = rom.readU32(ctx.speciesOffset(id) + field);
        if (pointer === 0) continue;
        let offset;
        try {
            offset = toRomOffset(pointer);
        } catch {
            continue;   // not a ROM pointer — a species with no evolutions holds NULL, anything else is data we don't own
        }
        arrays.add(offset);
    }
    return [...arrays];
}

/** The condition array at `offset`, or null when it is not the single `{IF_MIN_LEVEL, n}` shape. */
function readSingleMinLevelCondition(rom, offset, constants) {
    const condition = rom.readU16(offset + EVOLUTION_PARAM.condition);
    if (condition !== constants.require('IF_MIN_LEVEL')) return null;
    const next = rom.readU16(offset + EVOLUTION_PARAM.stride + EVOLUTION_PARAM.condition);
    if (next !== constants.require('CONDITIONS_END')) return null;
    return { arg1Offset: offset + EVOLUTION_PARAM.arg1, current: rom.readU16(offset + EVOLUTION_PARAM.arg1) };
}

/** Does the base source really hold a tuple naming this target — i.e. would the writer's regex match? */
function targetAppearsInSource(sourceText, target, kind) {
    const pattern = kind === 'level'
        ? new RegExp(`\\{EVO_LEVEL,\\s*\\d+,\\s*${target}\\}`)
        : new RegExp(`\\{EVO_ITEM,\\s*ITEM_\\w+,\\s*${target},\\s*CONDITIONS\\(\\{IF_MIN_LEVEL,\\s*\\d+\\}\\)\\}`);
    return pattern.test(sourceText);
}

/**
 * @param {object} ctx  see injector/context.js
 * @param {object} [opts]
 * @param {Array} [opts.speciesSources]  `[{ name, text }]` instead of reading the tree
 * @returns {{ writes: number, levels: number, stones: number }}
 */
function injectEvolutions(ctx, { speciesSources = null } = {}) {
    const { rom, constants, data, log } = ctx;
    const pokes = ((data.pokedex && data.pokedex.pokes) || [])
        .filter(poke => !BANNED_SPECIES_FOR_PICKING.includes(poke.id));
    const { levelMap, stoneMap } = buildEvoLevelMapFromParams(pokes);
    if (levelMap.size === 0 && stoneMap.size === 0) {
        return { writes: 0, levels: 0, stones: 0 };
    }

    // target species id → level, for the two rules. A target whose literal name is absent from the
    // sources is dropped: the writer's regex would not have matched it either.
    const sourceText = (speciesSources || loadSpeciesSources({ baseSources: ctx.baseSources })).map(s => s.text).join('\n');
    const idToName = new Map();               // ids read back from the ROM, named again for error messages
    const byId = (source, kind) => {
        const out = new Map();
        for (const [target, level] of source) {
            const id = constants.get(target);
            if (id === undefined) throw new Error(`injector/evolutions: '${target}' is not a species the base defines`);
            if (!targetAppearsInSource(sourceText, target, kind)) continue;
            if (out.has(id) && out.get(id) !== level) {
                // Two names for one id, both written in the sources, wanting different levels: the text
                // writer can tell them apart, an id-keyed injector cannot. Refuse rather than pick one.
                throw new Error(
                    `injector/evolutions: '${target}' and '${idToName.get(id)}' are the same species id ` +
                    `(${id}) but the bundle gives them different ${kind} levels (${level} vs ${out.get(id)}), ` +
                    `and both names appear in the base sources. This output cannot be injected by id.`);
            }
            idToName.set(id, target);
            out.set(id, level);
        }
        return out;
    };
    const levels = byId(levelMap, 'level');
    const stones = byId(stoneMap, 'stone');

    const evoLevel = constants.require('EVO_LEVEL');
    const evoItem = constants.require('EVO_ITEM');
    const end = constants.require('EVOLUTIONS_END');

    const planned = [];                       // { offset, value, kind }
    const conditionOwners = new Map();        // conditions arg1 offset → { level, target }

    for (const arrayAt of collectEvolutionArrays(ctx)) {
        for (let index = 0; index < MAX_ENTRIES; index++) {
            const at = arrayAt + index * EVOLUTION.stride;
            const method = rom.readU16(at + EVOLUTION.method);
            if (method === end) break;
            const target = rom.readU16(at + EVOLUTION.targetSpecies);
            const params = rom.readU32(at + EVOLUTION.params);

            if (method === evoLevel && params === 0 && levels.has(target)) {
                planned.push({ offset: at + EVOLUTION.param, value: levels.get(target), kind: 'level' });
                continue;
            }
            if (method !== evoItem || params === 0 || !stones.has(target)) continue;

            let conditionsAt;
            try {
                conditionsAt = toRomOffset(params);
            } catch {
                continue;
            }
            const condition = readSingleMinLevelCondition(rom, conditionsAt, constants);
            if (!condition) continue;          // not the shape patchStoneMinLevelInContent matches

            const level = stones.get(target);
            const owner = conditionOwners.get(condition.arg1Offset);
            if (owner && owner.level !== level) {
                throw new Error(
                    `injector/evolutions: one CONDITIONS({IF_MIN_LEVEL, n}) object at ` +
                    `0x${condition.arg1Offset.toString(16)} is shared by two stone evolutions that want ` +
                    `different levels (${idToName.get(owner.target) || owner.target} → ${owner.level}, ` +
                    `${idToName.get(target) || target} → ${level}). The base merged two identical condition ` +
                    `literals, so this ` +
                    `output cannot be injected byte-for-byte: give the base distinct condition arrays ` +
                    `(or build this ROM with ROM_BUILD_MODE=compile) before continuing.`);
            }
            if (owner) continue;               // same level, already planned
            conditionOwners.set(condition.arg1Offset, { level, target });
            planned.push({ offset: condition.arg1Offset, value: level, kind: 'stone' });
        }
    }

    let levelWrites = 0;
    let stoneWrites = 0;
    for (const write of planned) {
        rom.writeU16(write.offset, write.value, `${TAG}:${write.kind}`);
        if (write.kind === 'level') levelWrites += 1;
        else stoneWrites += 1;
    }

    log(`evolutions: ${levelWrites} level param(s), ${stoneWrites} stone IF_MIN_LEVEL condition(s)`);
    return { writes: planned.length, levels: levelWrites, stones: stoneWrites };
}

module.exports = { injectEvolutions, collectEvolutionArrays, TAG };
