'use strict';

/**
 * Inject the level-up and teachable (TM/HM + tutor) learnsets — the `learnsets` registry entry (T-240).
 *
 * Group B of the strategy is "variable-length", but only until T-237: every array in
 * `src/data/pokemon/level_up_learnsets/gen_9.h` and `src/data/pokemon/teachable_learnsets.h` is now a
 * FIXED-capacity export (44 × 4 B / 80 × 2 B) that kept its own name, so this is a plain in-place
 * overwrite — no repoint, no arena. Dropping `static` is also what makes the arrays locatable: each one
 * is a symbol in the base's `.map`, and the bundle already speaks those same names
 * (`poke.levelUpLearnset` / `poke.teachableLearnset`).
 *
 * The compile-path reference is `randomizer/pokemonWriter.js`, and its two functions do NOT agree with
 * each other — mirroring the decision, not the values, is what GATE-3 measures:
 *
 * | | editLearnsetsFile | editTeachableLearnsets |
 * |---|---|---|
 * | keyed by | array name, first match wins | array name, first match wins |
 * | the list | pokedex.pokes minus BANNED_SPECIES_FOR_PICKING (writer.js filters first) | same |
 * | unmatched array | left as the base has it | left as the base has it |
 * | **empty payload** | **rewritten** to just the terminator | **skipped** — the base's list survives |
 * | terminator | LEVEL_UP_END = { LEVEL_UP_MOVE_END, 0 } | MOVE_UNAVAILABLE |
 *
 * Two facts live in the compiled ROM rather than in the writer's output text:
 *
 *  - **The tail is zero.** C zero-fills a `[CAPACITY]` array past its initializers, so injecting a
 *    shorter learnset over a longer base one must clear the rest of the slot; leaving the base's
 *    entries behind the terminator is invisible in-game and still differs from `compile()`.
 *  - **`struct LevelUpMove` is `{ u16 move; u16 level; }`** — move first, the opposite order to the
 *    `LEVEL_UP_MOVE(lvl, move)` macro.
 *
 * Neither is taken on trust: before a byte is written, every array the base exports is **byte-matched
 * against the base source it was compiled from**. That one check pins the field order, the terminator
 * values, the name→symbol mapping, and "these sources and this ROM are the same build" — including the
 * case where the base compiled a different `P_LVL_UP_LEARNSETS` gen file, since all nine define the
 * same array names. Same technique as `wildEncounters` proving its 165 tables (T-239).
 */

const { LEVEL_UP_MOVE, TEACHABLE_MOVE } = require('../structLayout');
const { BASE_SOURCE_FILES } = require('../sources');
const { LEVEL_UP_LEARNSET_CAPACITY, TEACHABLE_LEARNSET_CAPACITY } = require('../../layout');
const { BANNED_SPECIES_FOR_PICKING } = require('../../modules/wildModule');
const { buildInjectionContext } = require('../context');

const TAG_LEVEL_UP = 'learnsets:levelUp';
const TAG_TEACHABLE = 'learnsets:teachable';

// The declaration regexes are the writers' own (pokemonWriter.js), `static` included: an
// upstream-shaped file must still parse, or a sync would fail here as a mystery instead of a diff.
const LEVEL_UP_DECL = /^(?:static )?const struct LevelUpMove (\w+)\[/;
const LEVEL_UP_ENTRY = /^\s*LEVEL_UP_MOVE\(\s*(\d+)\s*,\s*([A-Z_][A-Z0-9_]*)\s*\)\s*,?\s*$/;
const LEVEL_UP_END = /^\s*LEVEL_UP_END\s*,?\s*$/;
const TEACHABLE_DECL = /^(?:static )?const u16 (\w*TeachableLearnset)\[/;
const TEACHABLE_ENTRY = /^\s*([A-Z_][A-Z0-9_]*)\s*,?\s*$/;
const TEACHABLE_END = /^\s*MOVE_UNAVAILABLE\s*,?\s*$/;

/** The base's `gen_9.h` — the only level-up file the writer edits (see the P_LVL_UP_LEARNSETS note above). */
const LEVEL_UP_REL = BASE_SOURCE_FILES.levelUpLearnsets;
const TEACHABLE_REL = BASE_SOURCE_FILES.teachableLearnsets;

/**
 * Walk one learnset source file. Blocks are read the way the writers read them — declaration line,
 * body, `};` — and a body line that is neither an entry nor the terminator is **refused**: silently
 * skipping it would inject a payload one entry short of what the compiler produced.
 *
 * @returns {Map<string, Array>} array name → its entries, terminator excluded, in source order
 */
function parseArrays(text, { declaration, entry, terminator, parseEntry, kind }) {
    const arrays = new Map();
    let name = null;
    let entries = null;
    let terminated = false;

    text.split('\n').forEach((line, index) => {
        if (name === null) {
            const decl = line.match(declaration);
            if (decl) { name = decl[1]; entries = []; terminated = false; }
            return;
        }
        if (line.startsWith('};')) {
            arrays.set(name, entries);
            name = null;
            entries = null;
            return;
        }
        if (!line.trim() || line.trim().startsWith('//')) return;
        if (terminator.test(line)) { terminated = true; return; }
        const match = line.match(entry);
        if (!match) {
            throw new Error(
                `injector/learnsets: ${kind} ${name}, line ${index + 1}: '${line.trim()}' is neither an ` +
                `entry nor the terminator. The base source's format changed — the injector would write a ` +
                `learnset the compile path does not produce.`);
        }
        if (terminated) {
            throw new Error(`injector/learnsets: ${kind} ${name} has entries after its terminator (line ${index + 1})`);
        }
        entries.push(parseEntry(match));
    });

    if (name !== null) throw new Error(`injector/learnsets: ${kind} ${name} is never closed`);
    return arrays;
}

const parseLevelUpSource = (text) => parseArrays(text, {
    declaration: LEVEL_UP_DECL, entry: LEVEL_UP_ENTRY, terminator: LEVEL_UP_END, kind: 'level-up learnset',
    parseEntry: (m) => ({ level: Number(m[1]), move: m[2] }),
});

const parseTeachableSource = (text) => parseArrays(text, {
    declaration: TEACHABLE_DECL, entry: TEACHABLE_ENTRY, terminator: TEACHABLE_END, kind: 'teachable learnset',
    parseEntry: (m) => m[1],
});

/**
 * The list the compile path actually writes from: writer.js drops BANNED_SPECIES_FOR_PICKING before
 * calling savePokemonData, so a banned species' learnset never reaches a compiled ROM (T-239 found the
 * same rule the hard way on gSpeciesInfo). Same filter, same place in the flow.
 */
const pickablePokes = (data) => ((data.pokedex && data.pokedex.pokes) || [])
    .filter(poke => !BANNED_SPECIES_FOR_PICKING.includes(poke.id));

/**
 * Locate one array and prove it: the symbol exists, its slot is exactly the capacity the base's layout
 * header declares, and its bytes are the learnset the base source says it holds.
 *
 * @returns {{ at: number, capacity: number } | null}  null when the base does not export the array
 */
function resolveSlot(ctx, name, baseEntries, { stride, capacity, encode, kind }) {
    const { rom, offsetMap } = ctx;
    if (!offsetMap.has(name)) return null;         // an #if P_FAMILY_* the base compiled out

    const symbol = offsetMap.require(name);
    const expectedSize = capacity * stride;
    // The `.map` only BOUNDS a symbol; the `.sym` states its true size (see OffsetMap.merge). Only an
    // exact size can contradict the header — a bound may legitimately be larger.
    if (symbol.sizeExact ? symbol.size !== expectedSize : symbol.size < expectedSize) {
        throw new Error(
            `injector/learnsets: ${kind} ${name} occupies ${symbol.size} B in the base, but the layout ` +
            `header declares ${capacity} entries (${expectedSize} B). The base was not built from this ` +
            `include/constants/randomizer_layout.h — writing it would spill into the next array.`);
    }

    const at = offsetMap.offsetOf(name);
    const expected = encode(baseEntries, ctx, name);
    const actual = rom.readBytes(at, expected.length);
    if (!actual.equals(expected)) {
        throw new Error(
            `injector/learnsets: ${kind} ${name} does not match the base source at 0x${at.toString(16)} ` +
            `(${baseEntries.length} entries expected). The base ROM and the base sources are not the same ` +
            `build — injection would overwrite the wrong data.`);
    }
    return { at, capacity };
}

/** A level-up slot's payload as the compiler lays it out: entries, terminator, zero tail. */
function encodeLevelUp(entries, ctx, name, capacity = null) {
    const buffer = Buffer.alloc(((capacity ?? entries.length + 1)) * LEVEL_UP_MOVE.stride, 0);
    entries.forEach((entry, i) => {
        const at = i * LEVEL_UP_MOVE.stride;
        buffer.writeUInt16LE(moveId(ctx, entry.move, name), at + LEVEL_UP_MOVE.move);
        const level = Number(entry.level);
        if (!Number.isInteger(level) || level < 0 || level > 0xffff) {
            throw new Error(`injector/learnsets: ${name} entry ${i} has level '${entry.level}', which is not a level`);
        }
        buffer.writeUInt16LE(level, at + LEVEL_UP_MOVE.level);
    });
    buffer.writeUInt16LE(ctx.constants.require('LEVEL_UP_MOVE_END'), entries.length * LEVEL_UP_MOVE.stride);
    return buffer;
}

/** A teachable slot's payload: move ids, MOVE_UNAVAILABLE, zero tail. */
function encodeTeachable(moves, ctx, name, capacity = null) {
    const buffer = Buffer.alloc(((capacity ?? moves.length + 1)) * TEACHABLE_MOVE.stride, 0);
    moves.forEach((move, i) => buffer.writeUInt16LE(moveId(ctx, move, name), i * TEACHABLE_MOVE.stride));
    buffer.writeUInt16LE(ctx.constants.require('MOVE_UNAVAILABLE'), moves.length * TEACHABLE_MOVE.stride);
    return buffer;
}

function moveId(ctx, move, name) {
    const id = ctx.constants.get(move);
    if (id === undefined) {
        throw new Error(`injector/learnsets: ${name} wants '${move}', which is not a move the base defines`);
    }
    return id;
}

/**
 * One family: verify every slot first (so a build mismatch throws before anything is written), then
 * write the arrays the run claims.
 */
function injectFamily(ctx, { source, sourceRel, parse, match, payloadOf, encode, stride, capacity, tag, kind }) {
    const { rom, data, log } = ctx;
    const text = source ?? ctx.baseSources.read(sourceRel);
    const baseArrays = parse(text);
    const pokes = pickablePokes(data);

    const slots = [];
    let absent = 0;
    for (const [name, baseEntries] of baseArrays) {
        const slot = resolveSlot(ctx, name, baseEntries, { stride, capacity, encode, kind });
        if (!slot) { absent += 1; continue; }
        slots.push({ name, at: slot.at });
    }

    // The T-234/T-237 trap: a table the base stopped exporting (LTO garbage-collected it, `static` came
    // back, the map is from another build) makes every write a silent no-op, and the ROM ships BASE
    // learnsets while claiming to be randomized. A run that names arrays the base exports NONE of is
    // that failure, so it stops here instead of producing a plausible-looking ROM.
    const claimed = new Set(pokes.map(match).filter(Boolean));
    if (claimed.size > 0 && slots.length === 0) {
        throw new Error(
            `injector/learnsets: this run writes ${claimed.size} ${kind}s but the base exports none of the ` +
            `${baseArrays.size} arrays in its own source. The base does not carry these symbols (LTO may ` +
            `have dropped them — cf. T-234/T-237) or the offset map is from another build.`);
    }

    let writes = 0;
    let skipped = 0;
    for (const { name, at } of slots) {
        const poke = pokes.find(p => match(p) === name);       // first match wins, as `find` does for the writer
        const payload = poke && payloadOf(poke);
        if (!payload) { skipped += 1; continue; }
        if (payload.length + 1 > capacity) {
            throw new Error(
                `injector/learnsets: ${name} would hold ${payload.length} moves, but its slot is ${capacity} ` +
                `entries (${capacity - 1} moves + terminator). Raise the capacity in ` +
                `include/constants/randomizer_layout.h — the same guard pokemonWriter.js applies.`);
        }
        rom.writeBytes(at, encode(payload, ctx, name, capacity), tag);
        writes += 1;
    }

    log(`${kind}s: ${writes} written, ${skipped} left as the base has them, ${absent} not exported by the base`);
    return { writes, skipped, absent, arrays: slots.length };
}

/**
 * @param {object} ctx  see injector/context.js
 * @param {object} [opts]
 * @param {string} [opts.source]  the base's gen_9.h text (defaults to reading the tree)
 */
function injectLevelUpLearnsets(ctx, { source = null } = {}) {
    return injectFamily(ctx, {
        source,
        sourceRel: LEVEL_UP_REL,
        parse: parseLevelUpSource,
        match: (poke) => poke.levelUpLearnset,
        // An EMPTY level-up list is still written: the writer emits a block holding only LEVEL_UP_END.
        payloadOf: (poke) => poke.learnset || [],
        encode: encodeLevelUp,
        stride: LEVEL_UP_MOVE.stride,
        capacity: LEVEL_UP_LEARNSET_CAPACITY,
        tag: TAG_LEVEL_UP,
        kind: 'level-up learnset',
    });
}

/**
 * @param {object} ctx  see injector/context.js
 * @param {object} [opts]
 * @param {string} [opts.source]  the base's teachable_learnsets.h text (defaults to reading the tree)
 */
function injectTeachableLearnsets(ctx, { source = null } = {}) {
    return injectFamily(ctx, {
        source,
        sourceRel: TEACHABLE_REL,
        parse: parseTeachableSource,
        match: (poke) => poke.teachableLearnset,
        // An empty teachable list is SKIPPED — editTeachableLearnsets returns before replacing the block.
        payloadOf: (poke) => (poke.teachables && poke.teachables.length ? poke.teachables : null),
        encode: encodeTeachable,
        stride: TEACHABLE_MOVE.stride,
        capacity: TEACHABLE_LEARNSET_CAPACITY,
        tag: TAG_TEACHABLE,
        kind: 'teachable learnset',
    });
}

/**
 * @param {object} args  `{ rom, offsetMap, data, log }` as the registry calls it (injector/index.js)
 * @param {object} [args.sources]  base source text instead of reading the tree —
 *        `{ levelUpSource, teachableSource }`
 */
function applyLearnsets({ rom, offsetMap, data = {}, log = () => {}, sources = {}, baseSources = null }) {
    const ctx = buildInjectionContext({ rom, offsetMap, data, log, baseSources });
    return {
        levelUp: injectLevelUpLearnsets(ctx, { source: sources.levelUpSource || null }),
        teachable: injectTeachableLearnsets(ctx, { source: sources.teachableSource || null }),
    };
}

module.exports = {
    applyLearnsets,
    injectLevelUpLearnsets,
    injectTeachableLearnsets,
    parseLevelUpSource,
    parseTeachableSource,
    encodeLevelUp,
    encodeTeachable,
    TAG_LEVEL_UP,
    TAG_TEACHABLE,
};
