'use strict';

const { randomizeItems } = require('../itemRandomizer');
const trainers = require('../trainers');
const { BAG_SIZE_OFFSET } = require('../presets');

/**
 * Randomizes items and assembles trainer teams.
 *
 * @param {Object} pokedexArtifact - Must include `tmList` (array of TM move IDs).
 * @param {Object} config          - Must include `difficulty` ('easy'|'fair'|'hard').
 * @returns {{ trainersData: Object[], itemAssignments: Object }}
 */
function runTrainersModule(pokedexArtifact, config) {
    const itemAssignments = randomizeItems();
    const difficulty = config.difficulty.toUpperCase();
    const trainersData = trainers.getTrainersData(itemAssignments, pokedexArtifact.tmList, difficulty);

    const bagOffset = BAG_SIZE_OFFSET[difficulty] || 0;
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
