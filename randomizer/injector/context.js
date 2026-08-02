'use strict';

/**
 * context — what every Group-A injector module needs, built (and validated) once per ROM (T-239).
 *
 * T-238 hands a module `{ rom, offsetMap, data, log }`. On top of that the modules need the base's
 * numeric ids (`gameConstants`) and where each table's fields live (`structLayout`) — and, before any
 * write, the proof that the declared layout matches this base: `verifyLayout` reads the anchors back out
 * of the ROM and throws if a single one disagrees. That check is the difference between "the offsets are
 * probably right" and "this ROM is safe to write to".
 *
 * **One context per ROM, built before the first write.** The anchors are the BASE's own data
 * (Bulbasaur's 49 attack, Pound's 40 power), so they can only be read back from a ROM no module has
 * touched yet. Once `group-a-fixed` has rebalanced gSpeciesInfo, re-running them reports a "layout
 * mismatch" that is really just the randomizer's own data — which is exactly how T-240's first GATE-3
 * run failed on 11 of 12 corpus ROMs. So the context is cached per ROM instance: the first module pays
 * for the check on the pristine base, every later module reuses the result, and a first context asked
 * for on an already-written ROM is refused rather than silently unverified.
 */

const path = require('path');
const { loadGameConstants } = require('./gameConstants');
const {
    speciesLayout, moveLayout, itemLayout, verifyLayout, resolveEvolutionsOffset,
} = require('./structLayout');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

// One context per Rom instance — see the header. WeakMap so a finished ROM is still collectable.
const contexts = new WeakMap();

// The constant headers don't change between the ROMs of one bundle, so parse them once per process.
let cachedConstants = null;
let cachedConstantsRoot = null;

function gameConstantsFor(root) {
    if (cachedConstants && cachedConstantsRoot === root) return cachedConstants;
    cachedConstants = loadGameConstants({ root });
    cachedConstantsRoot = root;
    return cachedConstants;
}

/**
 * @param {object} args
 * @param {import('./rom').Rom} args.rom
 * @param {import('./symbolMap').OffsetMap} args.offsetMap
 * @param {object} [args.data]              the bundle's resolved artifacts (see make.js injectOneRom)
 * @param {Function} [args.log]
 * @param {string} [args.root]              repo root the base was built from (constant headers)
 * @param {boolean} [args.verify=true]      run the base anchors (only a test has reason to skip)
 */
function buildInjectionContext({ rom, offsetMap, data = {}, log = () => {}, root = REPO_ROOT, verify = true }) {
    const built = contexts.get(rom);
    if (built) return built;                       // verified when this ROM was still the base

    const constants = gameConstantsFor(root);
    if (verify) {
        if (rom.journal && rom.journal.length > 0) {
            throw new Error(
                `injector: this ROM has already been written to (${rom.journal.length} writes, first tagged ` +
                `'${rom.journal[0].tag}') and no context was built beforehand. The base anchors can only be ` +
                `read back from a pristine base — build the context before the first module writes.`);
        }
        verifyLayout({ rom, offsetMap, constants });
    }

    let evolutionsField = null;
    const ctx = {
        rom,
        offsetMap,
        constants,
        data,
        log,
        root,
        layout: {
            species: speciesLayout({ offsetMap, constants }),
            moves: moveLayout({ offsetMap, constants, rom }),
            items: itemLayout({ offsetMap, constants }),
        },
        /** Offset of SpeciesInfo.evolutions — derived from the base on first use (see structLayout). */
        evolutionsField() {
            if (evolutionsField === null) evolutionsField = resolveEvolutionsOffset({ rom, offsetMap, constants });
            return evolutionsField;
        },
        /** The ROM offset of one species' struct. */
        speciesOffset(id) {
            const { base, stride, count } = ctx.layout.species;
            if (count !== null && (id < 0 || id >= count)) {
                throw new Error(`injector: species id ${id} is outside gSpeciesInfo (0..${count - 1})`);
            }
            return base + id * stride;
        },
        /** The ROM offset of one move's struct. */
        moveOffset(id) {
            const { base, stride, count } = ctx.layout.moves;
            if (id < 0 || id >= count) throw new Error(`injector: move id ${id} is outside gMovesInfo (0..${count - 1})`);
            return base + id * stride;
        },
        /** The ROM offset of one item's struct. */
        itemOffset(id) {
            const { base, stride, count } = ctx.layout.items;
            if (id < 0 || id >= count) throw new Error(`injector: item id ${id} is outside gItemsInfo (0..${count - 1})`);
            return base + id * stride;
        },
    };
    contexts.set(rom, ctx);
    return ctx;
}

module.exports = { buildInjectionContext, REPO_ROOT };
