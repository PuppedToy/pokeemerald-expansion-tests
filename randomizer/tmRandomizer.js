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
    { start: 61, end: 71, pool: averageStatusMoves },
    // TM72-75 are fixed weather TMs (see FIXED_TMS below)
    { start: 76, end: 77, pool: barrierMoves },
    { start: 78, end: 90, pool: goodStatusMoves },
    { start: 91, end: 95, pool: godlikeStatusMoves },
];

// TM slots that are hardcoded (not randomized from pools).
const FIXED_TMS = {
    72: 'RAIN_DANCE',
    73: 'SUNNY_DAY',
    74: 'SANDSTORM',
    75: 'HAIL',
};

const TMS_HMS_H_PATH = path.resolve(__dirname, '..', 'include', 'constants', 'tms_hms.h');
const SCRIPT_MENU_PATH = path.resolve(__dirname, '..', 'src', 'data', 'script_menu.h');

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

// "WATER_PULSE" → "Water Pulse"
function toDisplayName(moveName) {
    return moveName.split('_').map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
}

// Returns 0-indexed array: tmList[0] = move for TM01, tmList[4] = move for TM05, etc.
function buildTMList() {
    const tmList = new Array(95).fill(null);
    for (const [slot, move] of Object.entries(FIXED_TMS)) {
        tmList[parseInt(slot) - 1] = move;
    }
    for (const { start, end, pool } of TM_RANGES) {
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

// Menu pick lists: [structName, [tmNum for case0, tmNum for case1, ...]]
// TM numbers are 1-based; order matches the multichoice case ordering in scripts.inc.
const PICK_LISTS = [
    ['MultichoiceList_Route104PickTM',   [5,  6,  7 ]],
    ['MultichoiceList_Route104PickTM2',  [8,  9,  10]],
    ['MultichoiceList_Route106Pick',     [4,  3,  2 ]],
    ['MultichoiceList_Route110Pick',      [63, 64, 62]],
    ['MultichoiceList_Route114PickCharlotte', [13, 15, 14]],
    ['MultichoiceList_Route114PickNolan',    [88, 89, 90]],
    ['MultichoiceList_Route114PickAngelina', [57, 58, 59, 60]],
    ['MultichoiceList_Route111PickTM',   [80, 79, 81]],
    ['MultichoiceList_Route117PickScreen',[77, 76]],
    ['MultichoiceList_Route118PickTM',   [34, 33, 35]],
    ['MultichoiceList_Route118PickTM2',  [20, 21, 22]],
    ['MultichoiceList_Route118PickTM3',  [39, 40, 41]],
    ['MultichoiceList_Route120PickTM',   [42, 43, 44]],
    ['MultichoiceList_Route121PickTM2',  [45, 46, 47]],
    ['MultichoiceList_Route125PickTM',   [48, 49, 50]],
    ['MultichoiceList_Route112PickTMStatus', [85, 86, 87]],
    ['MultichoiceList_Route112PickTMDmg',    [23, 24, 25]],
    ['MultichoiceList_Route111PickFocus',    [12, 29, 30]],
    ['MultichoiceList_Route111PickWilton',   [26, 27, 28]],
    ['MultichoiceList_Route121PickTM',   [82, 83, 84]],
    ['MultichoiceList_Route124PickTM',   [36, 37, 38]],
    ['MultichoiceList_Route109RickyPickTM', [16, 17, 18]],
    ['MultichoiceList_Route109HueyPickTM',  [68, 69, 70]],
    ['MultichoiceList_Route116PickItem',    [65, 66, 67]],
];

// Game Corner TM66-TM70 with their coin prices.
const GAME_CORNER_TMS = [
    { tm: 66, price: '1,500 COINS' },
    { tm: 67, price: '3,500 COINS' },
    { tm: 68, price: '4,000 COINS' },
    { tm: 69, price: '4,000 COINS' },
    { tm: 70, price: '4,000 COINS' },
];

async function patchScriptMenu(tmList) {
    const name = (n) => toDisplayName(tmList[n - 1]);

    let src = await fs.readFile(SCRIPT_MENU_PATH, 'utf8');

    // Replace all-TM pick lists wholesale.
    for (const [listName, tmNums] of PICK_LISTS) {
        const newEntries = tmNums
            .map(n => `    {COMPOUND_STRING("TM ${name(n)}")},`)
            .join('\n');
        src = src.replace(
            new RegExp(
                `(static const struct MenuAction ${listName}\\[\\] =\\n\\{\\n)` +
                `[\\s\\S]*?` +
                `(\\n\\};)`
            ),
            `$1${newEntries}$2`
        );
    }

    await fs.writeFile(SCRIPT_MENU_PATH, src, 'utf8');
    console.log('[TM Randomizer] Updated TM names in script_menu.h');
}

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

    await patchScriptMenu(tmList);
}

async function randomizeTMs() {
    // tmList[n-1] = move name (without MOVE_ prefix) for TM slot n (1-based)
    const tmList = buildTMList();
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
module.exports = { randomizeTMs, buildTMList, writeTMsFromList, annotateTmNumbers, TM_RANGES, FIXED_TMS };
