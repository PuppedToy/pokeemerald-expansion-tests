const fs = require('fs').promises;
const path = require('path');
const rng = require('./rng');
const {
    averageDamagePool,
    goodDamagePool,
    strongDamagePool,
    godlikeDamagePool,
    nichePool,
    averageStatusMoves,
    barrierMoves,
    goodStatusMoves,
    godlikeStatusMoves,
    goodStatusMovesDoubles,
    godlikeStatusMovesDoubles,
} = require('./tms.js');

// Moves that are HMs — must never appear in FOREACH_TM or the enum redeclares.
const HM_MOVES = new Set([
    'MOVE_CUT', 'MOVE_FLY', 'MOVE_SURF', 'MOVE_STRENGTH',
    'MOVE_FLASH', 'MOVE_ROCK_SMASH', 'MOVE_WATERFALL', 'MOVE_DIVE',
]);

// TM number ranges and their source pools.
// Ranges are inclusive. Pools with fewer moves than slots use all of them.
// T-152 — `includeDoubles` folds the doubles-only status TMs into their tier's pool. It is set for
// doubles/mixed runs; the pool TIER of each slot never changes (so TM_RANGES, exported for pricing,
// is the singles/base view — a pricing tier is format-independent).
function tmRanges(includeDoubles = false) {
    return [
        { start:  1, end: 10, pool: averageDamagePool },
        { start: 11, end: 30, pool: goodDamagePool },
        { start: 31, end: 50, pool: strongDamagePool },
        { start: 51, end: 56, pool: godlikeDamagePool },
        { start: 57, end: 60, pool: nichePool },
        { start: 61, end: 71, pool: averageStatusMoves },
        // TM72-75 are fixed weather TMs (see FIXED_TMS below)
        { start: 76, end: 77, pool: barrierMoves },
        { start: 78, end: 90, pool: includeDoubles ? [...goodStatusMoves, ...goodStatusMovesDoubles] : goodStatusMoves },
        { start: 91, end: 95, pool: includeDoubles ? [...godlikeStatusMoves, ...godlikeStatusMovesDoubles] : godlikeStatusMoves },
    ];
}

const TM_RANGES = tmRanges(false);

// T-152 — a run is "doubles" for TM purposes if its format sends out two Pokémon at once.
const usesDoublesTms = (battleFormat) => battleFormat === 'doubles' || battleFormat === 'mixed';

// TM slots that are hardcoded (not randomized from pools).
const FIXED_TMS = {
    72: 'RAIN_DANCE',
    73: 'SUNNY_DAY',
    74: 'SANDSTORM',
    75: 'HAIL',
};

const TMS_HMS_H_PATH = path.resolve(__dirname, '..', 'include', 'constants', 'tms_hms.h');

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function stripMovePrefix(name) {
    return name.startsWith('MOVE_') ? name.slice(5) : name;
}

// Returns 0-indexed array: tmList[0] = move for TM01, tmList[4] = move for TM05, etc.
function buildTMList(battleFormat = 'singles') {
    const tmList = new Array(95).fill(null);
    for (const [slot, move] of Object.entries(FIXED_TMS)) {
        tmList[parseInt(slot) - 1] = move;
    }
    for (const { start, end, pool } of tmRanges(usesDoublesTms(battleFormat))) {
        const count = end - start + 1;
        const picks = shuffle(pool.filter(m => !HM_MOVES.has(m))).slice(0, count);
        for (let i = 0; i < count; i++) {
            tmList[start - 1 + i] = stripMovePrefix(picks[i]);
        }
    }
    return tmList;
}

function formatForeachTM(tmList) {
    const lines = tmList.map((move, i) =>
        i < tmList.length - 1 ? `    F(${move}) \\` : `    F(${move})`
    );
    return lines.join('\n');
}

// T-236 — the TM pick menus (24 locations) read gItemPicks[] (src/randomizer_picks.c, static
// PICK_TM_* entries) and build their labels at runtime ("TM <move>" via BufferItemPickName →
// gTMHMItemMoveIds), so nothing here rewrites script_menu.h anymore. The per-location TM slots
// live in that C table; the map scripts keep their static finditem handlers.

async function writeTMsFromList(tmList) {
    const foreachTMBody = formatForeachTM(tmList);

    const content =
`#ifndef GUARD_CONSTANTS_TMS_HMS_H
#define GUARD_CONSTANTS_TMS_HMS_H

#define FOREACH_TM(F) \\
${foreachTMBody}

#define FOREACH_HM(F) \\
    F(CUT) \\
    F(FLY) \\
    F(SURF) \\
    F(STRENGTH) \\
    F(FLASH) \\
    F(ROCK_SMASH) \\
    F(WATERFALL) \\
    F(DIVE)

#define FOREACH_TMHM(F) \\
    FOREACH_TM(F) \\
    FOREACH_HM(F)

#endif
`;

    await fs.writeFile(TMS_HMS_H_PATH, content, 'utf8');
    console.log('[TM Randomizer] Wrote randomized FOREACH_TM to tms_hms.h');
}

async function randomizeTMs(battleFormat = 'singles') {
    // tmList[n-1] = move name (without MOVE_ prefix) for TM slot n (1-based)
    const tmList = buildTMList(battleFormat);
    await writeTMsFromList(tmList);
    return tmList;
}

// Stamp each move with its 1-based TM number from a tmList (tmList[0] → TM01; entries are move
// names without the MOVE_ prefix). Mutates and returns `moves`. Non-TM moves are left untouched.
// Used by the docs pipeline so the Moves tab can show a "TM01" label and filter by TM (T-011).
function annotateTmNumbers(moves, tmList) {
    (tmList || []).forEach((mv, idx) => {
        if (!mv) return;
        const id = 'MOVE_' + mv;
        if (moves[id]) moves[id].tm = idx + 1;
    });
    return moves;
}

// buildTMList exported for browser use (RNG-only, no file I/O).
// writeTMsFromList exported for bundle mode compilation in make.js.
// TM_RANGES / FIXED_TMS exported so the item-price writer (T-073) maps TM# → pool from the same
// SSOT (a cross-check test guards drift). Ranges are the pool boundaries; FIXED_TMS are the weather slots.
module.exports = { randomizeTMs, buildTMList, writeTMsFromList, annotateTmNumbers, TM_RANGES, tmRanges, FIXED_TMS };
