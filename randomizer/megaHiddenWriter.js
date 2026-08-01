'use strict';
// T-236 — data-driven mega-trainer removal. When a mega trainer can't be assigned a mega stone
// (no evolution found at its level), the old writer DELETED its two object_events (trainer NPC +
// stone ball) from map.json — a structural edit of compiled map data, not injectable. Now the pair
// stays in the map and the engine skips spawning them when gMegaTrainerHidden[i] is set
// (src/randomizer_picks.c, RandomizerIsHiddenMegaObject); this module regenerates that array's
// initializer between the anchors. The injector overwrites the same bytes at the .map offset.
const fs = require('fs');
const path = require('path');

const PICKS_C_PATH = path.join(path.resolve(__dirname, '..'), 'src', 'randomizer_picks.c');

// Must match MEGA_TRAINER_COUNT in include/constants/randomizer_picks.h and the MEGA_TRAINERS
// list in constants.js (index = parseInt(id) - 1).
const MEGA_TRAINER_COUNT = 21;

function genMegaHiddenSection(hiddenIndices) {
    const bad = hiddenIndices.filter(i => !Number.isInteger(i) || i < 0 || i >= MEGA_TRAINER_COUNT);
    if (bad.length)
        throw new Error(`genMegaHiddenSection: mega index out of range: ${bad.join(', ')}`);
    const hidden = new Set(hiddenIndices);
    return Array.from({ length: MEGA_TRAINER_COUNT }, (_, i) =>
        `    [${i}] = ${hidden.has(i) ? 'TRUE' : 'FALSE'},`
    ).join('\n');
}

function updateMegaHiddenTable(hiddenIndices) {
    const section = genMegaHiddenSection(hiddenIndices);
    let content = fs.readFileSync(PICKS_C_PATH, 'utf8');
    const regex = /(\/\/ @MEGA_HIDDEN_START[^\n]*\n)[\s\S]*?(\n[ \t]*\/\/ @MEGA_HIDDEN_END)/;
    if (!regex.test(content))
        throw new Error(`updateMegaHiddenTable: @MEGA_HIDDEN_START/END anchors not found in ${PICKS_C_PATH}`);
    content = content.replace(regex, `$1${section}$2`);
    fs.writeFileSync(PICKS_C_PATH, content);
    console.log('[Mega Writer] Updated gMegaTrainerHidden[] in src/randomizer_picks.c');
}

module.exports = { genMegaHiddenSection, updateMegaHiddenTable, MEGA_TRAINER_COUNT };
