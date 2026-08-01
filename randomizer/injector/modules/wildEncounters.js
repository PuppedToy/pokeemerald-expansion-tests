'use strict';

/**
 * Inject the wild-encounter species (T-239, Group A).
 *
 * The compile path rewrites `src/data/wild_encounters.json` — either structurally with the T-162 sweep
 * plan (`writer.applyWildPlanToEncounters`) or, for a pre-T-162 bundle with no `wildPlan`, with the
 * whole-file species substitution (`writer.substituteWildSpecies`) — and lets
 * `tools/wild_encounters/wild_encounters_to_header.py` regenerate the tables. Only a slot's `species`
 * string ever changes; slot counts, encounter rates and each slot's authored levels are untouched. That
 * is what makes this a fixed-offset overwrite instead of a repoint.
 *
 * So: run writer.js's own functions over the base JSON, diff, and write the `u16 species` of exactly the
 * slots that differ. No plan logic is re-implemented here — `distributeSpeciesAcrossSlots` has one home.
 *
 * Finding the array: the generator names it `<base_label>_<PascalType>`, optionally with a time-of-day
 * infix (`gRoute101_Morning_LandMons`). A name match alone would be a guess, so every candidate is
 * checked against the base JSON's own slots (species AND levels) and only an exact match is written to —
 * which also catches an offset map that belongs to a different build.
 */

const fs = require('fs');
const { WILD_POKEMON } = require('../structLayout');
const wildData = require('../../wild');
const writer = require('../../writer');

const TAG = 'wildEncounters';
const HEADERS_LABEL = 'gWildMonHeaders';

const pascalCase = (snake) => snake.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');

/** The symbol-name pattern for one encounter table (`land_mons` → `gRoute101[_Morning]_LandMons`). */
function wildSymbolCandidates(baseLabel, tableType) {
    return new RegExp(`^${baseLabel}(_[A-Za-z0-9]+)?_${pascalCase(tableType)}$`);
}

/** Every `<name>_mons` table of an encounter, as `[type, mons[]]`. */
function encounterTables(encounter) {
    return Object.entries(encounter)
        .filter(([key, value]) => key.endsWith('_mons') && value && Array.isArray(value.mons))
        .map(([key, value]) => [key, value.mons]);
}

/** Apply the compile path's own transformation to the base JSON text and return the patched object. */
function patchedEncounters(source, wildArtifact) {
    const { wildPlan, replacementLog } = wildArtifact || {};
    if (wildPlan && Object.keys(wildPlan).length > 0) {
        const patched = JSON.parse(source);
        const group = (patched.wild_encounter_groups || []).find(g => g.label === HEADERS_LABEL)
            || (patched.wild_encounter_groups || [])[0];
        if (group) writer.applyWildPlanToEncounters(group, wildPlan);
        return patched;
    }
    if (replacementLog && Object.keys(replacementLog).length > 0) {
        return JSON.parse(writer.substituteWildSpecies(source, replacementLog));
    }
    return null;                     // nothing to do — a bundle that changed no wild species
}

/**
 * The ROM offset of one encounter table, proven to be that table: the only symbol whose name matches
 * AND whose bytes are the base JSON's slots.
 */
function resolveTable(ctx, baseLabel, tableType, baseSlots) {
    const { rom, constants, offsetMap } = ctx;
    const pattern = wildSymbolCandidates(baseLabel, tableType);
    const candidates = offsetMap.findAll(pattern);
    if (candidates.length === 0) {
        throw new Error(
            `injector/wildEncounters: the base exports no symbol matching ${pattern} for ${baseLabel}'s ` +
            `${tableType} — the generated table name changed, or this offset map is from another build`);
    }

    const mismatches = [];
    for (const symbol of candidates) {
        let matches = symbol.size >= baseSlots.length * WILD_POKEMON.stride;
        for (let i = 0; matches && i < baseSlots.length; i++) {
            const at = symbol.romOffset + i * WILD_POKEMON.stride;
            const slot = baseSlots[i];
            const species = constants.get(slot.species);
            if (species === undefined) {
                throw new Error(`injector/wildEncounters: '${slot.species}' (${baseLabel} ${tableType} slot ${i}) is not a species the base defines`);
            }
            matches = rom.readU16(at + WILD_POKEMON.species) === species
                && rom.readU8(at + WILD_POKEMON.minLevel) === slot.min_level
                && rom.readU8(at + WILD_POKEMON.maxLevel) === slot.max_level;
        }
        if (matches) return symbol.romOffset;
        mismatches.push(symbol.name);
    }

    throw new Error(
        `injector/wildEncounters: ${mismatches.join(', ')} does not match ${baseLabel}'s ${tableType} in ` +
        `src/data/wild_encounters.json (species/levels differ). The base ROM and the base sources are not ` +
        `the same build — injection would write into the wrong table.`);
}

/**
 * @param {object} ctx  see injector/context.js
 * @param {object} [opts]
 * @param {object} [opts.encountersJson]  parsed base wild_encounters.json (defaults to reading the tree)
 * @returns {{ writes: number, tables: number }}
 */
function injectWildEncounters(ctx, { encountersJson = null } = {}) {
    const { rom, constants, data, log } = ctx;
    const source = encountersJson ? JSON.stringify(encountersJson) : fs.readFileSync(wildData.file, 'utf8');
    const base = JSON.parse(source);
    const patched = patchedEncounters(source, data.wild);
    if (!patched) return { writes: 0, tables: 0 };

    let writes = 0;
    let tables = 0;

    (base.wild_encounter_groups || []).forEach((group, groupIndex) => {
        (group.encounters || []).forEach((encounter, encounterIndex) => {
            const patchedEncounter = patched.wild_encounter_groups[groupIndex].encounters[encounterIndex];
            for (const [tableType, baseSlots] of encounterTables(encounter)) {
                const newSlots = (patchedEncounter[tableType] || {}).mons || [];
                const changed = baseSlots
                    .map((slot, index) => ({ index, from: slot.species, to: (newSlots[index] || {}).species }))
                    .filter(slot => slot.to !== undefined && slot.to !== slot.from);
                if (changed.length === 0) continue;

                const tableAt = resolveTable(ctx, encounter.base_label, tableType, baseSlots);
                for (const slot of changed) {
                    const species = constants.get(slot.to);
                    if (species === undefined) {
                        throw new Error(
                            `injector/wildEncounters: '${slot.to}' (${encounter.base_label} ${tableType} slot ` +
                            `${slot.index}) is not a species the base defines`);
                    }
                    rom.writeU16(tableAt + slot.index * WILD_POKEMON.stride + WILD_POKEMON.species, species, `${TAG}:${tableType}`);
                    writes += 1;
                }
                tables += 1;
            }
        });
    });

    if (writes) log(`wildEncounters: ${writes} slot(s) across ${tables} table(s)`);
    return { writes, tables };
}

module.exports = { injectWildEncounters, wildSymbolCandidates, encounterTables, TAG };
