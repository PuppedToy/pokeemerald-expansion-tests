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
const SCRIPT_MENU_PATH = path.resolve(__dirname, '..', 'src', 'data', 'script_menu.h');

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

// "WATER_PULSE" → "Water Pulse"
function toDisplayName(moveName) {
    return moveName.split('_').map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
}

// Returns 0-indexed array: tmList[0] = move for TM01, tmList[4] = move for TM05, etc.
function buildTMList() {
    const tmList = [];
    for (const { start, end, pool } of TM_RANGES) {
        const count = end - start + 1;
        const picks = shuffle(pool.filter(m => !HM_MOVES.has(m))).slice(0, count);
        tmList.push(...picks.map(stripMovePrefix));
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
    ['MultichoiceList_Route106Pick',     [4,  3,  2 ]],
    ['MultichoiceList_Route110PickTM',   [63, 64, 62]],
    ['MultichoiceList_Route114PickTM',   [12, 13, 15, 14]],
    ['MultichoiceList_Route115PickTM',   [80, 79, 81]],
    ['MultichoiceList_Route117PickScreen',[77, 76]],
    ['MultichoiceList_Route118PickTM',   [34, 33, 35]],
    ['MultichoiceList_Route121PickTM',   [82, 83, 84]],
    ['MultichoiceList_Route124PickTM',   [36, 37, 38]],
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

    // Game Corner: 5 TM entries with coin prices, followed by {gText_Exit}.
    const newGCEntries = GAME_CORNER_TMS
        .map(({ tm, price }) =>
            `    {COMPOUND_STRING("TM ${name(tm)}{CLEAR_TO 0x48}${price}")},`
        )
        .join('\n');
    src = src.replace(
        /(static const struct MenuAction MultichoiceList_GameCornerTMs\[\] =\n\{\n)[\s\S]*?(\n    \{gText_Exit\},\n\};)/,
        `$1${newGCEntries}$2`
    );

    // Route116PickItem: only the last entry (index 2) is a TM.
    src = src.replace(
        /(static const struct MenuAction MultichoiceList_Route116PickItem\[\] =\n\{[\s\S]*?    )\{COMPOUND_STRING\("TM [^"]*"\)},(\n\};)/,
        `$1{COMPOUND_STRING("TM ${name(65)}")},\n};`
    );

    await fs.writeFile(SCRIPT_MENU_PATH, src, 'utf8');
    console.log('[TM Randomizer] Updated TM names in script_menu.h');
}

async function randomizeTMs() {
    const tmList = buildTMList();
    // tmList is returned for use in trainer generation:
    // tmList[n-1] = move name (without MOVE_ prefix) for TM slot n (1-based)
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

    return tmList;
}

module.exports = { randomizeTMs };
