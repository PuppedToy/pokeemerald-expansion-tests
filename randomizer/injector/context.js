'use strict';

/**
 * context — what every Group-A injector module needs, built (and validated) once per ROM (T-239).
 *
 * T-238 hands a module `{ rom, offsetMap, data, log }`. On top of that the modules need the base's
 * numeric ids (`gameConstants`) and where each table's fields live (`structLayout`) — and, before any
 * write, the proof that the declared layout matches this base: `verifyLayout` reads the anchors back out
 * of the ROM and throws if a single one disagrees. That check is the difference between "the offsets are
 * probably right" and "this ROM is safe to write to".
 */

const path = require('path');
const { loadGameConstants } = require('./gameConstants');
const {
    speciesLayout, moveLayout, itemLayout, verifyLayout, resolveEvolutionsOffset,
} = require('./structLayout');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

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
    const constants = gameConstantsFor(root);
    if (verify) verifyLayout({ rom, offsetMap, constants });

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
    return ctx;
}

module.exports = { buildInjectionContext, REPO_ROOT };
