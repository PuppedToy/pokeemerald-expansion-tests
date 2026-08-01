'use strict';

/**
 * Inject gMovesInfo — move mutation (T-187) fields: power, accuracy, type, category (T-239, Group A).
 *
 * Reference: `randomizer/moveWriter.js editMovesFile`. It walks `gMovesInfo[]` and rewrites only the
 * fields a move's `log` names, flattening any gen-conditional expression for those fields to a concrete
 * value; every other field and every unmutated move stays byte-identical. `saveMoveData` doesn't even
 * open the file when no move mutated — so a run without mutation must write nothing here either.
 *
 * All four fields live in one 32-bit word (see structLayout.MOVE_INFO), shared with `target`, so each is
 * a bit-field read-modify-write. `rom.writeBits` claims only the bits of the field it writes, which is
 * what lets two fields of the same word be written without tripping the overlap guard.
 */

const { MOVE_INFO } = require('../structLayout');

const TAG = 'moves';
const MUTABLE_FIELDS = ['power', 'accuracy', 'type', 'category'];

/** The number to write for one mutated field, or an error naming the move and the offending token. */
function valueFor(constants, field, move) {
    switch (field) {
        case 'power':    return move.power;
        case 'accuracy': return move.accuracy;
        case 'type': {
            const name = `TYPE_${String(move.type).toUpperCase()}`;
            const value = constants.get(name);
            if (value === undefined) throw new Error(`injector/moves: ${move.id} — '${name}' is not a type the base defines`);
            return value;
        }
        case 'category': {
            const name = String(move.category);          // already the full DAMAGE_CATEGORY_* enum name
            const value = constants.get(name);
            if (value === undefined) throw new Error(`injector/moves: ${move.id} — '${name}' is not a move category the base defines`);
            return value;
        }
        default: throw new Error(`injector/moves: unknown field '${field}'`);
    }
}

/**
 * @param {object} ctx  see injector/context.js
 * @returns {{ writes: number, movesTouched: number }}
 */
function injectMoveData(ctx) {
    const { rom, constants, data, log } = ctx;
    const moves = (data.pokedex && data.pokedex.moves) || {};
    let writes = 0;
    let movesTouched = 0;

    for (const [id, move] of Object.entries(moves)) {
        if (!move) continue;
        const targets = (move.log || []).map(entry => entry.target).filter(t => MUTABLE_FIELDS.includes(t));
        if (targets.length === 0) continue;

        const moveId = constants.get(id);
        if (moveId === undefined) {
            throw new Error(
                `injector/moves: '${id}' is not a move the base defines — the bundle and the base disagree`);
        }
        const word = ctx.moveOffset(moveId) + MOVE_INFO.word;

        for (const field of new Set(targets)) {
            const value = valueFor(constants, field, { ...move, id });
            const { shift, width } = MOVE_INFO[field];
            try {
                rom.writeBits(word, shift, width, value, `${TAG}:${field}`);
            } catch (err) {
                throw new Error(`injector/moves: ${id}.${field} = ${value} — ${err.message}`);
            }
            writes += 1;
        }
        movesTouched += 1;
    }

    if (writes) log(`moves: ${writes} mutated field(s) across ${movesTouched} move(s)`);
    return { writes, movesTouched };
}

module.exports = { injectMoveData, MUTABLE_FIELDS, TAG };
