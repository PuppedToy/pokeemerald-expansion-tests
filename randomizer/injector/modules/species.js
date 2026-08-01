'use strict';

/**
 * Inject gSpeciesInfo — base stats, types, abilities, and the wild-held-item strip (T-239, Group A).
 *
 * The reference is the compile path, `randomizer/pokemonWriter.js`:
 *
 *  - `editSpeciesFile` rewrites a `.baseHP` / `.baseAttack` / … / `.types` / `.abilities` line **only
 *    when that species' rebalance `log` names the matching target**. Every other line of every other
 *    species is left byte-identical. So this module is log-driven too: writing a bundle value the writer
 *    would have left alone would change bytes `compile()` never changed, and INV-BYTES would fail — even
 *    though the value "looks right".
 *  - `stripWildHeldItems` is the opposite: it zeroes `itemCommon`/`itemRare` on **every** line it finds,
 *    independent of any log (T-077 — the only source of a wild held item). Species that never declare
 *    the fields already hold 0, so zeroing the whole table is the same thing.
 *
 * Values come from the bundle's poke object (as in the writer, which prints `currentPokemon.baseHP`),
 * never from the log entry's `value` (that is a delta, and `oldValue` is only for the audit comment).
 */

const { SPECIES_INFO } = require('../structLayout');
const { POKEMON_TYPES } = require('../../constants');

const TAG = 'species';
const TAG_ITEMS = 'species:heldItems';

// log target → SpeciesInfo field. The six stats the rebalancer can move.
const STAT_TARGETS = {
    baseHP: 'baseHP',
    baseAttack: 'baseAttack',
    baseDefense: 'baseDefense',
    baseSpeed: 'baseSpeed',
    baseSpAttack: 'baseSpAttack',
    baseSpDefense: 'baseSpDefense',
};

/**
 * The numeric type for a parsed type token, or null when the token is not a type at all.
 *
 * B-010: the parser can carry a config macro through (`RALTS_FAMILY_TYPE2`, `TOGEPI_FAMILY_TYPE`), which
 * the writer emits verbatim — so the compiler resolves it to whatever the base already holds and the byte
 * does not change. `null` therefore means "leave the base's byte alone", not "unknown, guess something".
 */
function resolveType(constants, token) {
    const upper = String(token).toUpperCase();
    if (POKEMON_TYPES.includes(upper)) return constants.require(`TYPE_${upper}`);
    return constants.get(`TYPE_${upper}`) ?? null;
}

function resolveAbility(constants, token, speciesId) {
    const name = `ABILITY_${String(token).toUpperCase()}`;
    const value = constants.get(name);
    if (value === undefined) {
        throw new Error(`injector/species: ${speciesId} — '${name}' is not an ability the base defines`);
    }
    return value;
}

/**
 * @param {object} ctx  see injector/context.js
 * @returns {{ writes: { stats: number, types: number, abilities: number, heldItems: number } }}
 */
function injectSpeciesInfo(ctx) {
    const { rom, constants, data, log } = ctx;
    const pokes = (data.pokedex && data.pokedex.pokes) || [];
    const writes = { stats: 0, types: 0, abilities: 0, heldItems: 0 };
    const none = constants.require('ITEM_NONE');

    for (const poke of pokes) {
        const targets = new Set((poke.log || []).map(entry => entry.target));
        if (targets.size === 0) continue;               // exactly the writer's `if (!currentLog.length) continue`

        const id = constants.get(poke.id);
        if (id === undefined) {
            throw new Error(
                `injector/species: '${poke.id}' is not a species the base defines — the bundle and the base ` +
                `disagree (a bundle from a different game version?)`);
        }
        const at = ctx.speciesOffset(id);

        for (const [target, field] of Object.entries(STAT_TARGETS)) {
            if (!targets.has(target)) continue;
            const value = poke[field];
            try {
                rom.writeU8(at + SPECIES_INFO[field], value, `${TAG}:${field}`);
            } catch (err) {
                throw new Error(`injector/species: ${poke.id}.${field} = ${value} — ${err.message}`);
            }
            writes.stats += 1;
        }

        if (targets.has('type')) {
            const parsed = poke.parsedTypes || [];
            // MON_TYPES(t) expands to { t, t } — a mono-type mon fills both slots with the same type.
            const slots = [parsed[0], parsed.length > 1 ? parsed[1] : parsed[0]];
            slots.forEach((token, i) => {
                if (token === undefined) return;
                const value = resolveType(constants, token);
                if (value === null) {
                    log(`species ${poke.id}: type token '${token}' is not a type constant — leaving slot ${i} as the base has it`);
                    return;
                }
                rom.writeU8(at + SPECIES_INFO.types + i, value, `${TAG}:types`);
                writes.types += 1;
            });
        }

        if (targets.has('ability')) {
            const parsed = poke.parsedAbilities || [];
            for (let i = 0; i < SPECIES_INFO.abilityCount; i++) {
                const token = parsed[i] === undefined ? 'NONE' : parsed[i];
                rom.writeU16(at + SPECIES_INFO.abilities + i * 2, resolveAbility(constants, token, poke.id), `${TAG}:abilities`);
                writes.abilities += 1;
            }
        }
    }

    // T-077 — every species, whatever the bundle says.
    const { count } = ctx.layout.species;
    if (count === null) {
        throw new Error(
            'injector/species: gSpeciesInfo has no exact size, so the held-item strip cannot cover every ' +
            'species — merge the build\'s .sym (make syms) into the offset map');
    }
    for (let id = 0; id < count; id++) {
        const at = ctx.speciesOffset(id);
        rom.writeU16(at + SPECIES_INFO.itemCommon, none, TAG_ITEMS);
        rom.writeU16(at + SPECIES_INFO.itemRare, none, TAG_ITEMS);
        writes.heldItems += 1;
    }

    log(`species: ${writes.stats} stats, ${writes.types} types, ${writes.abilities} abilities, ` +
        `${writes.heldItems} held-item pairs cleared`);
    return { writes };
}

module.exports = { injectSpeciesInfo, resolveType, TAG };
