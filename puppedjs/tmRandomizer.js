const fs = require('fs').promises;
const path = require('path');
const {
    averageDamagePool,
    goodDamagePool,
    strongDamagePool,
    godlikeDamagePool,
    nichePool,
    averageStatusMoves,
    weatherMoves,
    barrierMoves,
    goodStatusMoves,
    godlikeStatusMoves,
} = require('./tms.js');

// Moves that are HMs — must never appear in FOREACH_TM or the enum redeclares.
const HM_MOVES = new Set([
    'MOVE_CUT', 'MOVE_FLY', 'MOVE_SURF', 'MOVE_STRENGTH',
    'MOVE_FLASH', 'MOVE_ROCK_SMASH', 'MOVE_WATERFALL', 'MOVE_DIVE',
]);

// TM number ranges and their source pools.
// Ranges are inclusive. Pools with fewer moves than slots use all of them.
const TM_RANGES = [
    { start:  1, end: 10, pool: averageDamagePool },
    { start: 11, end: 30, pool: goodDamagePool },
    { start: 31, end: 50, pool: strongDamagePool },
    { start: 51, end: 56, pool: godlikeDamagePool },
    { start: 57, end: 60, pool: nichePool },
    { start: 61, end: 70, pool: averageStatusMoves },
    { start: 71, end: 75, pool: weatherMoves },
    { start: 76, end: 77, pool: barrierMoves },
    { start: 78, end: 90, pool: goodStatusMoves },
    { start: 91, end: 95, pool: godlikeStatusMoves },
];

const TMS_HMS_H_PATH = path.resolve(__dirname, '..', 'include', 'constants', 'tms_hms.h');

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function stripMovePrefix(name) {
    return name.startsWith('MOVE_') ? name.slice(5) : name;
}

function buildForeachTM() {
    // Build a 95-slot array (TM01-TM95); TM96-TM100 stay undefined/unused
    const tmList = [];

    for (const { start, end, pool } of TM_RANGES) {
        const count = end - start + 1;
        const picks = shuffle(pool.filter(m => !HM_MOVES.has(m))).slice(0, count);
        tmList.push(...picks.map(stripMovePrefix));
    }

    // Build macro lines — no trailing backslash on last entry
    const lines = tmList.map((move, i) =>
        i < tmList.length - 1 ? `    F(${move}) \\` : `    F(${move})`
    );

    return lines.join('\n');
}

async function randomizeTMs() {
    const foreachTMBody = buildForeachTM();

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

module.exports = { randomizeTMs };
