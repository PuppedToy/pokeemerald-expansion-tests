const path = require('path');
const fs = require('fs').promises;

// HM moves are always preserved in teachables regardless of the TM pool.
const HM_MOVES = new Set([
    'MOVE_CUT', 'MOVE_FLY', 'MOVE_SURF', 'MOVE_STRENGTH',
    'MOVE_FLASH', 'MOVE_ROCK_SMASH', 'MOVE_WATERFALL', 'MOVE_DIVE',
]);

const SAME_TYPE_TM_BASE_CHANCE = 100;
const DIFFERENT_TYPE_TM_BASE_CHANCE = 35;
// Chance for TMs whose type only appears in this pokemon's mega form, not the base form.
const MEGA_TYPE_TM_BASE_CHANCE = 70;

// Returns types present in any mega of this pokemon's family that are absent from this pokemon.
// Only called for non-mega base forms (megas don't get their own mega-type rolls).
function getMegaExtraTypes(poke, megaEvoTree, pokemonList) {
    if (poke.evolutionData.isMega) return [];
    const megaIds = megaEvoTree[poke.family] || [];
    const extraTypes = new Set();
    for (const megaId of megaIds) {
        const megaPoke = pokemonList.find(p => p.id === megaId);
        if (!megaPoke) continue;
        // Only the direct mega base gets these rolls, not earlier stages in the line.
        if (megaPoke.evolutionData.megaBaseForm !== poke.id) continue;
        for (const t of megaPoke.parsedTypes) {
            if (!poke.parsedTypes.includes(t)) extraTypes.add(t);
        }
    }
    return [...extraTypes];
}

function buildRunTeachables(poke, tmPool, moves, preEvoPoke, megaEvoTree, pokemonList) {
    if (!tmPool) return;

    const originalTeachables = poke.teachables;
    const hmMoves = originalTeachables.filter(m => HM_MOVES.has(m));

    let baseTeachables;
    let evolutionNewTypes = [];

    if (preEvoPoke) {
        // Inherit the full non-HM teachable list from the pre-evolution exactly.
        baseTeachables = preEvoPoke.teachables.filter(m => !HM_MOVES.has(m));
        // Extra rolls only for types this stage gains that the pre-evo doesn't have.
        evolutionNewTypes = poke.parsedTypes.filter(t => !preEvoPoke.parsedTypes.includes(t));
    } else {
        // Base form: start from official TMs present in this run's pool.
        baseTeachables = originalTeachables.filter(m => tmPool.has(m) && !HM_MOVES.has(m));
    }

    const baseSet = new Set(baseTeachables);
    const remaining = [...tmPool].filter(m => !baseSet.has(m) && !HM_MOVES.has(m));

    // Fisher-Yates shuffle
    for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    // Types that only appear in this pokemon's mega form — rolled at reduced chance.
    const megaExtraTypes = getMegaExtraTypes(poke, megaEvoTree, pokemonList);

    const newTeachables = [];
    let totalLearned = baseTeachables.length;

    if (preEvoPoke && poke.evolutionData.isMega) {
        // Megas can't be taught moves in combat — pure inheritance, no extra rolls.
    } else if (preEvoPoke) {
        // Evolution: only roll for newly-gained types and mega-exclusive types.
        for (const tm of remaining) {
            const move = moves[tm];
            if (!move) continue;
            let chance = 0;
            if (evolutionNewTypes.includes(move.type)) {
                chance = Math.max(0, SAME_TYPE_TM_BASE_CHANCE - totalLearned) / 100;
            } else if (megaExtraTypes.includes(move.type)) {
                chance = Math.max(0, MEGA_TYPE_TM_BASE_CHANCE - totalLearned) / 100;
            }
            if (chance > 0 && Math.random() < chance) {
                newTeachables.push(tm);
                totalLearned++;
            }
        }
    } else {
        // Base form: standard same/different-type expansion plus mega-type rolls.
        for (const tm of remaining) {
            const move = moves[tm];
            if (!move) continue;
            let chance;
            if (poke.parsedTypes.includes(move.type)) {
                chance = Math.max(0, SAME_TYPE_TM_BASE_CHANCE - totalLearned) / 100;
            } else if (megaExtraTypes.includes(move.type)) {
                chance = Math.max(0, MEGA_TYPE_TM_BASE_CHANCE - totalLearned) / 100;
            } else {
                chance = Math.max(0, DIFFERENT_TYPE_TM_BASE_CHANCE - totalLearned) / 100;
            }
            if (chance > 0 && Math.random() < chance) {
                newTeachables.push(tm);
                totalLearned++;
            }
        }
    }

    const finalSet = new Set([...baseTeachables, ...newTeachables]);
    const originalNonHMSet = new Set(originalTeachables.filter(m => !HM_MOVES.has(m)));
    poke.teachables    = [...baseTeachables, ...newTeachables, ...hmMoves];
    // Stars: every TM in the final list that wasn't in this pokemon's own official learnset.
    poke.newTeachables = [...finalSet].filter(m => !originalNonHMSet.has(m));
    // Grey: official TMs for this pokemon that have no TM slot this run.
    poke.oldTeachables = originalTeachables.filter(m => !HM_MOVES.has(m) && !finalSet.has(m));

}

function expandAllTeachables(pokemonList, tmPool, moves) {
    if (!tmPool) return;

    // Build megaEvoTree: family → [SPECIES_X_MEGA, ...]
    const megaEvoTree = {};
    for (const poke of pokemonList) {
        if (poke.evolutionData.isMega) {
            if (!megaEvoTree[poke.family]) megaEvoTree[poke.family] = [];
            megaEvoTree[poke.family].push(poke.id);
        }
    }

    // Build preEvoMap: species ID → pre-evolution poke object
    const preEvoMap = {};
    for (const poke of pokemonList) {
        if (poke.evolutions) {
            for (const evo of poke.evolutions) {
                if (evo && evo.pokemon) preEvoMap[evo.pokemon] = poke;
            }
        }
        // Mega forms inherit from their base form.
        if (poke.evolutionData.isMega && poke.evolutionData.megaBaseForm) {
            const basePoke = pokemonList.find(p => p.id === poke.evolutionData.megaBaseForm);
            if (basePoke) preEvoMap[poke.id] = basePoke;
        }
    }

    // Process in topological order: always expand a pre-evo before its evolutions.
    const processed = new Set();

    function process(poke) {
        if (processed.has(poke.id)) return;
        const preEvo = preEvoMap[poke.id];
        if (preEvo && !processed.has(preEvo.id)) process(preEvo);
        buildRunTeachables(poke, tmPool, moves, preEvo || null, megaEvoTree, pokemonList);
        processed.add(poke.id);
    }

    for (const poke of pokemonList) process(poke);

    const totalNew = pokemonList.reduce((sum, p) => sum + (p.newTeachables ? p.newTeachables.length : 0), 0);
    const expanded = pokemonList.filter(p => p.newTeachables && p.newTeachables.length > 0).length;
    console.log(`[TEACHABLE-DEBUG] expandAllTeachables done: ${pokemonList.length} pokemon processed, ${expanded} gained new teachables, ${totalNew} total new moves added.`);

    // Sanity check: detect duplicate teachableLearnset values (two pokemon claiming the same C array).
    const learnsetIdCount = {};
    for (const poke of pokemonList) {
        if (!poke.teachableLearnset) continue;
        if (!learnsetIdCount[poke.teachableLearnset]) learnsetIdCount[poke.teachableLearnset] = [];
        learnsetIdCount[poke.teachableLearnset].push(poke.id);
    }
    for (const [id, owners] of Object.entries(learnsetIdCount)) {
        if (owners.length > 1) {
            console.warn(`[TEACHABLE-DUPE] teachableLearnset "${id}" claimed by multiple pokemon: ${owners.join(', ')}`);
        }
    }
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

module.exports = { buildRunTeachables, expandAllTeachables, buildTmPoolFromFile, HM_MOVES };
