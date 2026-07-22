'use strict';

// T-187 — moves_info.h writer.
//
// Persists move mutation (T-187) to the C source so it reaches the built ROM. Line-oriented rewrite in
// the same style as pokemonWriter.editSpeciesFile: walk the `gMovesInfo[]` table, and for each move that
// carries a `log`, rewrite ONLY the fields it changed (power / accuracy / type / category) to a concrete
// value — flattening any gen-conditional expression for those fields — while preserving the original
// line in a trailing @PUPPED-MOVE-MUTATION audit comment. Every other field and every unmutated move is
// left byte-identical. The build's restore() (git checkout -- src/) reverts moves_info.h afterwards.

const path = require('path');
const fs = require('fs').promises;

const MOVES_INFO_PATH = path.resolve(__dirname, '..', 'src', 'data', 'moves_info.h');

const MUTABLE_FIELDS = ['power', 'accuracy', 'type', 'category'];
// Start of a gMovesInfo[] entry, e.g. `    [MOVE_POUND] =`.
const MOVE_START_RE = /^\s*\[(MOVE_[A-Za-z0-9_]+)\]\s*=/;
// A mutable field assignment line, e.g. `        .power = 40,`.
const FIELD_RE = /^(\s*)\.(power|accuracy|type|category)\s*=/;

// The concrete C literal for a mutated field's new value.
function cValueFor(target, move) {
    switch (target) {
        case 'power':    return String(move.power);
        case 'accuracy': return String(move.accuracy);
        case 'type':     return `TYPE_${move.type}`;       // move.type is the bare type name (e.g. FIRE)
        case 'category': return String(move.category);     // move.category is the full DAMAGE_CATEGORY_* enum
        default:         return null;
    }
}

function editMovesFile(movesFileText, moves) {
    const lines = movesFileText.split('\n');
    let currentId = null;
    let currentMove = null;
    let pending = null;   // Set of mutated field targets still to write for the current move

    for (let i = 0; i < lines.length; i++) {
        const start = lines[i].match(MOVE_START_RE);
        if (start) {
            currentId = start[1];
            currentMove = moves[currentId] || null;
            const log = (currentMove && currentMove.log) || [];
            pending = new Set(log.map(e => e.target).filter(t => MUTABLE_FIELDS.includes(t)));
            continue;
        }
        if (!pending || pending.size === 0) continue;

        const fieldMatch = lines[i].match(FIELD_RE);
        if (!fieldMatch) continue;
        const field = fieldMatch[2];
        if (!pending.has(field)) continue;
        pending.delete(field);

        const entry = currentMove.log.find(e => e.target === field);
        const oldValue = entry ? entry.oldValue : '';
        const indent = fieldMatch[1];
        const value = cValueFor(field, currentMove);
        lines[i] = `${indent}.${field} = ${value}, // @PUPPED-MOVE-MUTATION #${currentId} [oldValue = ${oldValue}] -- previous line was >> ${lines[i].trim()}`;
    }
    return lines.join('\n');
}

// Read moves_info.h, apply the mutation, write it back. No-op (returns false, no file write) when no
// move mutated — so a run without move mutation leaves the source byte-identical.
async function saveMoveData(moves) {
    const anyMutated = Object.values(moves).some(m => m && m.log && m.log.length);
    if (!anyMutated) return false;
    const text = await fs.readFile(MOVES_INFO_PATH, 'utf-8');
    await fs.writeFile(MOVES_INFO_PATH, editMovesFile(text, moves), 'utf-8');
    return true;
}

module.exports = { editMovesFile, saveMoveData, MOVES_INFO_PATH };
