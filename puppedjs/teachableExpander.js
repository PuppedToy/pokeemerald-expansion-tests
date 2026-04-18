const path = require('path');
const fs = require('fs').promises;

// HM moves are always preserved in teachables regardless of the TM pool.
const HM_MOVES = new Set([
    'MOVE_CUT', 'MOVE_FLY', 'MOVE_SURF', 'MOVE_STRENGTH',
    'MOVE_FLASH', 'MOVE_ROCK_SMASH', 'MOVE_WATERFALL', 'MOVE_DIVE',
]);

// Chance (in %) that a remaining TM is granted, decreasing with each TM already learned.
const SAME_TYPE_TM_BASE_CHANCE = 100;
const DIFFERENT_TYPE_TM_BASE_CHANCE = 35;

function buildRunTeachables(poke, tmPool, moves) {
    if (!tmPool) return;  // --all-tms mode: leave teachables unchanged

    const officialTMs    = poke.teachables.filter(m => tmPool.has(m) && !HM_MOVES.has(m));
    const hmMoves        = poke.teachables.filter(m => HM_MOVES.has(m));
    const oldTeachables  = poke.teachables.filter(m => !tmPool.has(m) && !HM_MOVES.has(m));

    const officialSet   = new Set(officialTMs);
    const remaining     = [...tmPool].filter(m => !officialSet.has(m) && !HM_MOVES.has(m));

    // Fisher-Yates shuffle
    for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    const newTeachables = [];
    let totalLearned = officialTMs.length;

    for (const tm of remaining) {
        const move = moves[tm];
        if (!move) continue;
        const isSameType = poke.parsedTypes.includes(move.type);
        const chance = isSameType
            ? Math.max(0, SAME_TYPE_TM_BASE_CHANCE - totalLearned) / 100
            : Math.max(0, DIFFERENT_TYPE_TM_BASE_CHANCE - totalLearned) / 100;
        if (chance > 0 && Math.random() < chance) {
            newTeachables.push(tm);
            totalLearned++;
        }
    }

    poke.teachables    = [...officialTMs, ...newTeachables, ...hmMoves];
    poke.newTeachables = newTeachables;
    poke.oldTeachables = oldTeachables;
}

async function buildTmPoolFromFile() {
    const tmsHmsPath = path.resolve(__dirname, '..', 'include', 'constants', 'tms_hms.h');
    const tmsHmsText = await fs.readFile(tmsHmsPath, 'utf-8');
    const tmPool = new Set();
    const tmRegex = /\bF\((\w+)\)/g;
    let m;
    while ((m = tmRegex.exec(tmsHmsText)) !== null) {
        tmPool.add('MOVE_' + m[1]);
    }
    return tmPool;
}

module.exports = { buildRunTeachables, buildTmPoolFromFile, HM_MOVES };
