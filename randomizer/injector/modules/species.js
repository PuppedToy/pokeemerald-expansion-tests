'use strict';

/**
 * Inject gSpeciesInfo — base stats, types, abilities, and the wild-held-item strip (T-239, Group A).
 *
 * The reference is the compile path, `randomizer/pokemonWriter.js`, and its rules are narrower than
 * "write what the bundle says":
 *
 *  - `editSpeciesFile` rewrites a `.baseHP` / … / `.types` / `.abilities` line only when that species'
 *    rebalance `log` names the target, and it consumes each log entry as it matches one (`splice`).
 *  - **239 of the 1522 species don't own those lines at all** — Unown's letters, the Vivillon/Flabébé
 *    patterns, Arceus' formes and friends are `[SPECIES_X] = SOME_MISC_INFO(…)`, sharing one `#define`
 *    body. The writer cannot rewrite those species individually, so `compile()` leaves them at their base
 *    stats even when the bundle rebalanced them (16 such species carry a log in a typical run). An
 *    injector that "helpfully" wrote them would differ from every compiled ROM.
 *
 * Rather than re-deriving that (and the pathological case where an unconsumed log entry rewrites a macro
 * body and so moves *every* species that uses it), this module runs `editSpeciesFile` itself over the
 * base sources and injects exactly the lines it changed — attributing each changed line to the species
 * whose block holds it, or to every species that invokes the macro it belongs to. Whatever the writer
 * does, the ROM gets.
 *
 * The one unconditional write is `stripWildHeldItems`: it zeroes `itemCommon`/`itemRare` on every line it
 * finds, whatever the log says (T-077 — the only source of a wild held item). Species that never declare
 * the fields already hold 0, and every declared value in the base is a plain `ITEM_*` constant the
 * stripper matches, so zeroing the whole table is the same thing.
 */

const fs = require('fs');
const path = require('path');
const { SPECIES_INFO } = require('../structLayout');
const { POKEMON_TYPES, SPECIES_DIR, TOTAL_GENS } = require('../../constants');
const { editSpeciesFile } = require('../../pokemonWriter');

const TAG = 'species';
const TAG_ITEMS = 'species:heldItems';

const STAT_FIELDS = ['baseHP', 'baseAttack', 'baseDefense', 'baseSpeed', 'baseSpAttack', 'baseSpDefense'];

const SPECIES_HEADER_RE = /^\s*\[(SPECIES_[A-Z0-9_]+)\]\s*=/;
const MACRO_OPEN_RE = /^#define\s+([A-Za-z_]\w*)/;
const STAT_LINE_RE = /^\s*\.(baseHP|baseAttack|baseDefense|baseSpeed|baseSpAttack|baseSpDefense)\s*=\s*(\d+)\s*,/;
const TYPES_LINE_RE = /^\s*\.types\s*=\s*MON_TYPES\(([^)]*)\)/;
const ABILITIES_LINE_RE = /^\s*\.abilities\s*=\s*\{([^}]*)\}/;

/** The base's species-info sources, `[{ name, text }]`. */
function loadSpeciesSources(dir = SPECIES_DIR) {
    const sources = [];
    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        const file = path.resolve(dir, `gen_${gen}_families.h`);
        if (fs.existsSync(file)) sources.push({ name: `gen_${gen}_families.h`, text: fs.readFileSync(file, 'utf8') });
    }
    return sources;
}

/**
 * For each line: which species' block it sits in, and which `#define` body (if any) it belongs to.
 * A macro body wins — that is the case the writer cannot attribute to one species.
 */
function indexLines(text) {
    const lines = text.split('\n');
    const index = new Array(lines.length);
    let species = null;
    let macro = null;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (macro) {
            index[i] = { species, macro };
            if (!/\\\s*$/.test(line)) macro = null;      // the continuation ended
            continue;
        }
        const open = line.match(MACRO_OPEN_RE);
        if (open && /\\\s*$/.test(line)) {
            macro = open[1];
            index[i] = { species, macro };
            continue;
        }
        const header = line.match(SPECIES_HEADER_RE);
        if (header) species = header[1];
        index[i] = { species, macro: null };
    }
    return index;
}

/** macro name → every species whose entry invokes it. */
function macroUsers(text) {
    const users = new Map();
    let species = null;
    for (const line of text.split('\n')) {
        const header = line.match(SPECIES_HEADER_RE);
        if (header) species = header[1];
        if (!species || MACRO_OPEN_RE.test(line)) continue;   // a #define is the definition, not a use
        for (const call of line.matchAll(/\b([A-Z][A-Z0-9_]*(?:INFO|SPECIES_INFO|MISC_INFO))\s*\(/g)) {
            if (!users.has(call[1])) users.set(call[1], new Set());
            users.get(call[1]).add(species);
        }
    }
    return users;
}

/** Parse one rewritten line into `{ field, value }` (stats), `{ types }` or `{ abilities }`. */
function parseFieldLine(line) {
    const stat = line.match(STAT_LINE_RE);
    if (stat) return { kind: 'stat', field: stat[1], value: Number(stat[2]) };
    const types = line.match(TYPES_LINE_RE);
    if (types) return { kind: 'types', tokens: types[1].split(',').map(t => t.trim()).filter(Boolean) };
    const abilities = line.match(ABILITIES_LINE_RE);
    if (abilities) return { kind: 'abilities', tokens: abilities[1].split(',').map(t => t.trim()).filter(Boolean) };
    return null;
}

/**
 * Run the writer over one source file and return what it changed, per species:
 * `[{ species, change }]` — a macro body fans out to every species that uses it.
 */
function collectSpeciesChanges(baseText, patchedText, fileName = '') {
    const baseLines = baseText.split('\n');
    const patchedLines = patchedText.split('\n');
    if (baseLines.length !== patchedLines.length) {
        throw new Error(
            `injector/species: ${fileName} changed line count (${baseLines.length} → ${patchedLines.length}); ` +
            `pokemonWriter is expected to rewrite lines in place`);
    }
    const index = indexLines(baseText);
    const users = macroUsers(baseText);
    const changes = [];

    for (let i = 0; i < baseLines.length; i++) {
        if (baseLines[i] === patchedLines[i]) continue;
        const parsed = parseFieldLine(patchedLines[i]);
        if (!parsed) continue;                     // e.g. the T-077 held-item strip, handled separately
        const where = index[i];
        const targets = where.macro
            ? [...(users.get(where.macro) || [])]  // a macro body moves every species that invokes it
            : (where.species ? [where.species] : []);
        if (targets.length === 0) {
            throw new Error(
                `injector/species: ${fileName}:${i + 1} was rewritten but belongs to no species ` +
                `(${where.macro ? `macro ${where.macro} — no user found` : 'no enclosing [SPECIES_…] block'})`);
        }
        for (const species of targets) changes.push({ species, change: parsed });
    }
    return changes;
}

/**
 * The numeric type for a parsed type token, or null when the token is not a type at all.
 *
 * B-010: the parser can carry a config macro through (`RALTS_FAMILY_TYPE2`), which the writer emits
 * verbatim — the compiler then resolves it to whatever the base already holds, so the byte does not
 * change. `null` means "leave the base's byte alone", not "unknown, guess something".
 */
function resolveType(constants, token) {
    const bare = String(token).trim();
    const upper = bare.replace(/^TYPE_/, '').toUpperCase();
    if (POKEMON_TYPES.includes(upper)) return constants.require(`TYPE_${upper}`);
    return constants.get(bare) ?? constants.get(`TYPE_${upper}`) ?? null;
}

/**
 * @param {object} ctx  see injector/context.js
 * @param {object} [opts]
 * @param {Array} [opts.speciesSources]  `[{ name, text }]` instead of reading the tree
 * @returns {{ writes: { stats: number, types: number, abilities: number, heldItems: number } }}
 */
function injectSpeciesInfo(ctx, { speciesSources = null } = {}) {
    const { rom, constants, data, log } = ctx;
    const pokes = (data.pokedex && data.pokedex.pokes) || [];
    const writes = { stats: 0, types: 0, abilities: 0, heldItems: 0 };

    const sources = speciesSources || loadSpeciesSources();
    // (species, field) → change, in source order. A species can be hit twice — by its own block and by a
    // macro it invokes — and C's duplicate designated initializers keep the LAST one, so this does too.
    const perSpecies = new Map();
    for (const source of sources) {
        // The writer's own function decides what changes — including which species it CANNOT reach.
        const patched = editSpeciesFile(source.text, pokes);
        for (const { species, change } of collectSpeciesChanges(source.text, patched, source.name)) {
            if (!perSpecies.has(species)) perSpecies.set(species, new Map());
            perSpecies.get(species).set(change.kind === 'stat' ? change.field : change.kind, change);
        }
    }

    {
        for (const [species, byField] of perSpecies) for (const change of byField.values()) {
            const id = constants.get(species);
            if (id === undefined) {
                throw new Error(`injector/species: '${species}' is not a species the base defines`);
            }
            const at = ctx.speciesOffset(id);

            if (change.kind === 'stat') {
                try {
                    rom.writeU8(at + SPECIES_INFO[change.field], change.value, `${TAG}:${change.field}`);
                } catch (err) {
                    throw new Error(`injector/species: ${species}.${change.field} = ${change.value} — ${err.message}`);
                }
                writes.stats += 1;
                continue;
            }

            if (change.kind === 'types') {
                // MON_TYPES(t) expands to { t, t } — a mono-type mon fills both slots with the same type.
                const slots = [change.tokens[0], change.tokens.length > 1 ? change.tokens[1] : change.tokens[0]];
                slots.forEach((token, slot) => {
                    if (token === undefined) return;
                    const value = resolveType(constants, token);
                    if (value === null) {
                        log(`species ${species}: type token '${token}' is not a type constant — leaving slot ${slot} as the base has it`);
                        return;
                    }
                    rom.writeU8(at + SPECIES_INFO.types + slot, value, `${TAG}:types`);
                    writes.types += 1;
                });
                continue;
            }

            for (let slot = 0; slot < SPECIES_INFO.abilityCount; slot++) {
                const token = change.tokens[slot] || 'ABILITY_NONE';   // a short list leaves the rest zeroed
                const value = constants.get(token);
                if (value === undefined) {
                    throw new Error(`injector/species: ${species} — '${token}' is not an ability the base defines`);
                }
                rom.writeU16(at + SPECIES_INFO.abilities + slot * 2, value, `${TAG}:abilities`);
                writes.abilities += 1;
            }
        }
    }

    // T-077 — every species, whatever the bundle says.
    const { count } = ctx.layout.species;
    for (let id = 0; id < count; id++) {
        const at = ctx.speciesOffset(id);
        rom.writeU16(at + SPECIES_INFO.itemCommon, constants.require('ITEM_NONE'), TAG_ITEMS);
        rom.writeU16(at + SPECIES_INFO.itemRare, constants.require('ITEM_NONE'), TAG_ITEMS);
        writes.heldItems += 1;
    }

    log(`species: ${writes.stats} stats, ${writes.types} types, ${writes.abilities} abilities, ` +
        `${writes.heldItems} held-item pairs cleared`);
    return { writes };
}

module.exports = {
    injectSpeciesInfo,
    collectSpeciesChanges,
    indexLines,
    macroUsers,
    loadSpeciesSources,
    resolveType,
    STAT_FIELDS,
    TAG,
};
