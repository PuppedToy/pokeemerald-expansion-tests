'use strict';

const { randomizeItems } = require('../itemRandomizer');
const trainers = require('../trainers');
const { getDifficultyTransform, getBagSizeOffset, applyTransform } = require('../presets');

const EXEMPT_TRAINER_PREFIXES = ['TRAINER_WALLY_', 'TRAINER_MAY_', 'TRAINER_BRENDAN_'];
const EXEMPT_TRAINER_IDS = new Set(['TRAINER_STEVEN']);

function isExempt(id) {
    return EXEMPT_TRAINER_IDS.has(id) || EXEMPT_TRAINER_PREFIXES.some(p => id.startsWith(p));
}

/**
 * Randomizes items and assembles trainer teams, then applies a uniform difficulty
 * transform to every non-exempt trainer (bosses, gym leaders, E4, champion, grunts).
 *
 * @param {Object} pokedexArtifact - Must include `tmList`.
 * @param {Object} config          - Must include `difficulty` (integer 1–13).
 * @returns {{ trainersData: Object[], itemAssignments: Object }}
 */
function runTrainersModule(pokedexArtifact, config) {
    const itemAssignments = randomizeItems();
    const level = config.difficulty ?? 7;
    const trainersData = trainers.getTrainersData(itemAssignments, pokedexArtifact.tmList);

    const { numShifts, delta, direction } = getDifficultyTransform(level);
    if (numShifts > 0) {
        for (const trainer of trainersData) {
            if (isExempt(trainer.id)) continue;
            // applyTransform shifts both contextualTier and single-tier absoluteTier slots (B-001),
            // so difficulty scales every non-exempt trainer; evolutionTier slots and megas stay fixed.
            trainer.team = applyTransform(trainer.team, delta, direction, numShifts);
        }
    }

    const bagOffset = getBagSizeOffset(level);
    if (bagOffset !== 0) {
        for (const trainer of trainersData) {
            if (trainer.isBoss || !trainer.bag || trainer.bag.length === 0) continue;
            if (bagOffset < 0) {
                trainer.bag = trainer.bag.slice(0, Math.max(0, trainer.bag.length + bagOffset));
            } else {
                const extra = trainer.bag.slice(-bagOffset);
                trainer.bag = [...trainer.bag, ...extra];
            }
        }
    }

    return { trainersData, itemAssignments };
}

module.exports = { runTrainersModule };
