'use strict';

/**
 * scriptPatch.js — Group-D toggles (T-238, closing the last T-232 leftover).
 *
 * Both branches of every toggle are already compiled into the base; a `setvar` immediate inside a map
 * script picks which one runs (Run & Bun mode + E4 quotas in Sidney's room, the Steven tag battle in
 * the Mossdeep Space Center). Today `runAndBunWriter.js` / `stevenTagWriter.js` rewrite that literal in
 * `scripts.inc` and recompile; injection rewrites the same literal in the ROM.
 *
 * Two rules, both about never guessing:
 *  - the script's address comes from the build's `.sym` (script labels are local — they are NOT in the
 *    `.map`), and the operand is found by scanning that script for the opcode, never by a constant;
 *  - var ids are read from `include/constants/vars.h`, the one home for them (same discipline as the
 *    capacities T-237 reads out of `randomizer_layout.h`).
 */

const path = require('path');
const { BASE_SOURCE_FILES, treeSources } = require('./sources');

/** `setvar destination, value` → `.byte SCR_OP_SETVAR / .2byte dest / .2byte value` (asm/macros/event.inc). */
const SCR_OP_SETVAR = 0x16;
const SETVAR_LENGTH = 5;

const VARS_HEADER = path.resolve(__dirname, '..', '..', 'include', 'constants', 'vars.h');

/** The toggles the randomizer flips today — pinned by a test so a rename can't silently break Phase 3. */
const GROUP_D_VARS = [
    'VAR_DISABLE_STEVEN_TAG_BATTLE',
    'VAR_RUNANDBUN_MODE',
    'VAR_RUNANDBUN_SINGLES_LEFT',
    'VAR_RUNANDBUN_DOUBLES_LEFT',
];

let varCache = null;

/**
 * name → id for every `#define VAR_… 0x….` in the header.
 *
 * @param {string} [file]  which tree to read `vars.h` out of, when no base sources are given
 * @param {object} [opts]
 * @param {import('./sources').BaseSources} [opts.sources]  read `vars.h` from these instead (T-249)
 */
function loadVarConstants(file = VARS_HEADER, { sources = null } = {}) {
    // `file` names the header inside SOME tree; the seam addresses it relative to that tree's root.
    const from = sources || treeSources({ root: path.resolve(path.dirname(file), '..', '..') });
    const text = from.read(BASE_SOURCE_FILES.vars);
    const vars = {};
    const re = /^#define\s+(VAR_\w+)\s+(0x[0-9a-fA-F]+|\d+)/gm;
    let m;
    while ((m = re.exec(text)) !== null) vars[m[1]] = Number(m[2]);
    return vars;
}

function varId(name, { file = VARS_HEADER, sources = null } = {}) {
    const key = sources || file;                   // one parse per header, whoever provided it
    if (!varCache || varCache.key !== key) varCache = { key, vars: loadVarConstants(file, { sources }) };
    const id = varCache.vars[name];
    if (id === undefined) throw new Error(`${name} is not defined in ${path.basename(file)}`);
    return id;
}

function resolveVar(opts) {
    if (typeof opts.varId === 'number') return opts.varId;
    if (opts.var) return varId(opts.var, { sources: opts.sources || null });
    throw new Error('findSetvarOperand needs { varId } or { var }');
}

/**
 * Offset of the 2-byte immediate of `setvar <var>, …` inside the script starting at `at`.
 *
 * @param {object} opts
 * @param {number} opts.at           ROM offset of the script (from the `.sym`)
 * @param {number} [opts.varId]      var id, or
 * @param {string} [opts.var]        var name (resolved through vars.h)
 * @param {number} [opts.limit]      how far into the script to scan
 * @param {boolean} [opts.requireUnique] refuse to pick when the window holds several (default true)
 * @param {number} [opts.expectValue]    assert the immediate the base currently holds
 */
function findSetvarOperand(rom, opts) {
    const { at, limit = 512, requireUnique = true, expectValue = null } = opts;
    const id = resolveVar(opts);
    // The whole 5-byte command must fit inside the window — a setvar that merely starts in it is not
    // "in the first `limit` bytes of the script".
    const end = Math.min(rom.size, at + limit) - SETVAR_LENGTH;

    const hits = [];
    for (let i = at; i <= end; i++) {
        if (rom.buffer[i] !== SCR_OP_SETVAR) continue;
        if (rom.buffer.readUInt16LE(i + 1) !== id) continue;
        hits.push(i + 3);
        if (!requireUnique) break;
    }

    if (hits.length === 0) {
        throw new Error(
            `setvar 0x${id.toString(16)} not found in the ${limit} bytes after 0x${at.toString(16)} — ` +
            `wrong script label, wrong base build, or the script no longer sets that var`);
    }
    if (requireUnique && hits.length > 1) {
        throw new Error(
            `Ambiguous: ${hits.length} setvar 0x${id.toString(16)} sites after 0x${at.toString(16)} ` +
            `(${hits.map(h => `0x${h.toString(16)}`).join(', ')}). Narrow the limit, or pass requireUnique:false.`);
    }

    const operand = hits[0];
    if (expectValue !== null) {
        const actual = rom.buffer.readUInt16LE(operand);
        if (actual !== expectValue) {
            throw new Error(
                `setvar 0x${id.toString(16)} at 0x${operand.toString(16)}: expected ${expectValue} in the base, found ${actual}`);
        }
    }
    return operand;
}

/** Flip a toggle: find the immediate, write the new value, return where it went. */
function patchSetvar(rom, opts) {
    const { value, tag = null, allowOverwrite = false } = opts;
    const operand = findSetvarOperand(rom, opts);
    rom.writeU16(operand, value, tag, { allowOverwrite });
    return operand;
}

module.exports = {
    SCR_OP_SETVAR,
    SETVAR_LENGTH,
    GROUP_D_VARS,
    VARS_HEADER,
    loadVarConstants,
    varId,
    findSetvarOperand,
    patchSetvar,
};
