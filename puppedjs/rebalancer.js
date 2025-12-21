const { LOG_TYPE_BUFF, LOG_TYPE_NERF, POKEMON_TYPES, LOG_TYPE_ADJUSTMENT } = require("./constants");

const BALANCE_CHANCE = 0.2;

const STAT_BALANCE_CHANCE = 0.7;
const BUFF_STAT_CHANCE = 0.6;
const REPEAT_STAT_CHANCE = 0.5;

const TYPE_BALANCE_CHANCE = 0.1;
const MONOTYPE_BALANCE_CHANCE = 0.1;
const ABILITY_BALANCE_CHANCE = 0.1;
const LEARNSET_BALANCE_CHANCE = 0.2;
const CHANGE_TYPE_MOVE_CHANCE_FROM_OLD_TYPE_CHANCE = 0.9;
const CHANGE_TYPE_MOVE_CHANCE_FROM_OTHER_TYPE_CHANCE = 0.05;
const CHANGE_MOVE_INSERT_CHANCE = 0.5;
const MOVE_RATING_DEVIATION = 0.2;

const BANNED_ABILITIES = [
    // These abilities are not rebalancable
    'FORECAST',
    'STANCE_CHANGE',
    'MULTITYPE',
    'RKS_SYSTEM',
    'ZEN_MODE',
    'SCHOOLING',
    'POWER_CONSTRUCT',
    'BATTLE_BOND',
    'SHIELDS_DOWN',
    'ICE_FACE',
    'DISGUISE',
    'FLOWER_GIFT',
    'GULP_MISSILE',
    'HUNGER_SWITCH',

    // These are a hell to rebalance, but I'd like to do so. For now they are banned.
    'WONDER_GUARD',
    'TRUANT',
    'SLOW_START',
    'DEFEATIST',
];

// @TODO Thoughts after testing it:
// 1. Stat changes carry over forms besides from family. E.g. Meowth +20 def should not carry alolan and galar meowth.

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getLearnLevelBasedOnRating(move) {
    const baseRating = move && typeof move.rating === 'number' ? move.rating : 5;
    const rating = baseRating * Math.random() * (1 + MOVE_RATING_DEVIATION);
    let level = Math.floor(rating * 5);
    if (level < 1) level = 1;
    if (level > 100) level = 100;
    return level;
}

/**
 * Insert a move into a learnset using its ID and rating to derive the level.
 * Returns the new learnset and the level used.
 */
function insertMoveIntoLearnset(learnset, moveId, move) {
    const learnsetCopy = [...learnset];
    const level = getLearnLevelBasedOnRating(move);
    learnsetCopy.push({ move: moveId, level: String(level) });
    learnsetCopy.sort((a, b) => Number(a.level) - Number(b.level));
    return {
        learnset: learnsetCopy,
        level,
    };
}

const familyTracking = {};

function balancePokemon(pokemon, abilityNames, moves) {

    const inheritedLog = [];
    const newPokemon = { ...pokemon };

    if (familyTracking[pokemon.family]) {
        const familyLog = familyTracking[pokemon.family] || [];
        familyLog.forEach(entry => {
            let changed = false;
            const nextEntry = {...entry}
            if (['baseHP', 'baseAttack', 'baseDefense', 'baseSpAttack', 'baseSpDefense', 'baseSpeed'].includes(entry.target)) {
                nextEntry.oldValue = newPokemon[entry.target];
                newPokemon[entry.target] = Math.min(255, Math.max(1, newPokemon[entry.target] + entry.value));
                changed = true;
            }
            else if (entry.target === 'type') {
                if (entry.oldValue) {
                    const oldTypeIndex = newPokemon.parsedTypes.indexOf(entry.oldValue);
                    if (oldTypeIndex !== -1) {
                        const newParsedTypes = [...newPokemon.parsedTypes];
                        newParsedTypes[oldTypeIndex] = entry.value;
                        newPokemon.parsedTypes = newParsedTypes;
                        changed = true;
                    }
                }
                else if (newPokemon.parsedTypes.length === 1) {
                    newPokemon.parsedTypes.push(entry.value);
                    changed = true;
                }
            }
            else if (entry.target === 'ability') {
                const oldAbilityIndex = newPokemon.parsedAbilities.indexOf(entry.oldValue);
                if (oldAbilityIndex !== -1) {
                    const newParsedAbilities = [...newPokemon.parsedAbilities];
                    newParsedAbilities[oldAbilityIndex] = entry.value;
                    newPokemon.parsedAbilities = newParsedAbilities;
                    changed = true;
                }
            }
            else if (entry.target === 'learnsetMove') {
                if (entry.oldValue) {
                    // Replacement case
                    const index = newPokemon.learnset.findIndex(l => l.move === entry.oldValue);
                    if (index !== -1) {
                        newPokemon.learnset[index] = {
                            ...newPokemon.learnset[index],
                            move: entry.value
                        };
                        changed = true;
                    }
                } else {
                    // Insertion case
                    const exists = newPokemon.learnset.some(l => l.move === entry.value);
                    if (!exists) {
                        const learnsetCopy = [...newPokemon.learnset];
                        learnsetCopy.push({ move: entry.value, level: String(entry.level) });
                        learnsetCopy.sort((a, b) => Number(a.level) - Number(b.level));
                        newPokemon.learnset = learnsetCopy;
                        changed = true;
                    }
                }
            }
            if (changed) {
                inheritedLog.push(nextEntry);
            }
        });
    }

    if (Math.random() > BALANCE_CHANCE) {
        return {
            ...newPokemon,
            log: inheritedLog,
        };
    }

    const log = [];

    const stats = shuffleArray(['baseHP', 'baseAttack', 'baseDefense', 'baseSpAttack', 'baseSpDefense', 'baseSpeed']);
    let chance = STAT_BALANCE_CHANCE;
    inheritedLog.forEach(entry => {
        if (stats.includes(entry.target)) {
            chance *= 0.5;
            stats.splice(stats.indexOf(entry.target), 1);
        }
    });
    stats.forEach(stat => {
        if (Math.random() < chance) {
            const changeDiff = Math.random() < BUFF_STAT_CHANCE ? 10 : -10;
            let change = changeDiff;
            while (Math.random() < REPEAT_STAT_CHANCE) {
                change += changeDiff;
            }
            newPokemon[stat] = Math.min(255, Math.max(1, newPokemon[stat] + change));
            chance *= 0.5;
            log.push({
                type: changeDiff > 0 ? LOG_TYPE_BUFF : LOG_TYPE_NERF,
                target: stat,
                oldValue: newPokemon[stat] - change,
                value: change,
            });
        }
    });

    if (Math.random() < TYPE_BALANCE_CHANCE) {
        let oldType = null;
        if (pokemon.parsedTypes.length === 1 && Math.random() < MONOTYPE_BALANCE_CHANCE) {
            oldType = pokemon.parsedTypes[0];
        }
        else if (pokemon.parsedTypes.length === 2) {
            const types = shuffleArray([...pokemon.parsedTypes]);
            [oldType] = types;
        }
        const allTypes = shuffleArray(
            [...POKEMON_TYPES].filter(t => !pokemon.parsedTypes.includes(t))
        );
        const [newType] = allTypes;
        if (oldType) {
            newPokemon.parsedTypes = newPokemon.parsedTypes.map(t => t === oldType ? newType : t);
        }
        else if (newPokemon.parsedTypes.length === 1) {
            newPokemon.parsedTypes.push(newType);
        }
        else {
            console.warn(`Unexpected type adjustment for ${pokemon.name}`);
        }
        log.push({
            type: LOG_TYPE_ADJUSTMENT,
            target: 'type',
            oldValue: oldType,
            value: newType,
        });
    }

    if (Math.random() < ABILITY_BALANCE_CHANCE) {
        let oldAbility = null;
        if (pokemon.parsedAbilities.includes('NONE')) {
            oldAbility = 'NONE';
        } else {
            const abilities = shuffleArray(
                [...pokemon.parsedAbilities].filter(a => !BANNED_ABILITIES.includes(a))
            );
            if (abilities.length > 0) {
                [oldAbility] = abilities;
            }
        }
        if (oldAbility) {
            const allAbilities = abilityNames
                .filter(a => !pokemon.parsedAbilities.includes(a) && !BANNED_ABILITIES.includes(a));
            const newAbility = allAbilities[Math.floor(Math.random() * allAbilities.length)];
            const oldAbilityIndex = newPokemon.parsedAbilities.indexOf(oldAbility);
            const newParsedAbilities = [...newPokemon.parsedAbilities];
            newParsedAbilities[oldAbilityIndex] = newAbility;
            newPokemon.parsedAbilities = newParsedAbilities;
            let logType = LOG_TYPE_ADJUSTMENT;
            if (oldAbility === 'NONE') {
                logType = LOG_TYPE_BUFF;
            }
            if (newAbility === 'NONE') {
                logType = LOG_TYPE_NERF;
            }
            log.push({
                type: logType,
                target: 'ability',
                oldValue: oldAbility,
                value: newAbility,
            });
        }
    }

    // ----- LEARNSET CHANGES AFTER TYPE CHANGE -----

    const typeChangeLogs = log.filter(entry => entry.target === 'type');

    // Learnset step 1 - if a type changed, the pokemon needs to at least learn one move of the new type
    for (let i = 0; i < typeChangeLogs.length; i++) {
        const currentTypeChange = typeChangeLogs[i];
        const oldType = currentTypeChange.oldValue;
        const newType = currentTypeChange.value;

        if (!newType) continue;

        // [moveId, moveObj][]
        const movesFromTheNewType = Object.entries(moves).filter(
            ([, mv]) => mv.type === newType
        );

        if (movesFromTheNewType.length === 0) {
            console.warn(`[WARN] No moves found of type ${newType} for ${newPokemon.name}.`);
            continue;
        }

        let amountChanged = 0;

        for (let j = 0; j < newPokemon.learnset.length; j++) {
            const learnsetEntry = newPokemon.learnset[j];
            const currentMove = moves[learnsetEntry.move];
            if (!currentMove) {
                console.warn(
                    `[WARN] Move ${learnsetEntry.move} not found in moves database from ${newPokemon.name}'s learnset.`
                );
                continue;
            }

            const shouldChange =
                (oldType && currentMove.type === oldType && Math.random() < CHANGE_TYPE_MOVE_CHANCE_FROM_OLD_TYPE_CHANCE) ||
                (!oldType && Math.random() < CHANGE_TYPE_MOVE_CHANCE_FROM_OTHER_TYPE_CHANCE);

            if (!shouldChange) continue;

            const similarMoves = [...movesFromTheNewType].sort(
                ([, mvA], [, mvB]) => {
                    const rA = typeof mvA.rating === 'number' ? mvA.rating : 5;
                    const rB = typeof mvB.rating === 'number' ? mvB.rating : 5;
                    const rC = typeof currentMove.rating === 'number' ? currentMove.rating : 5;
                    return Math.abs(rA - rC) - Math.abs(rB - rC);
                }
            );

            if (similarMoves.length > 0) {
                const [newMoveId, newMoveObj] = similarMoves[0];

                // Remove from the pool so we don't reuse it
                const idx = movesFromTheNewType.findIndex(([id]) => id === newMoveId);
                if (idx !== -1) {
                    movesFromTheNewType.splice(idx, 1);
                }

                const oldMoveName = learnsetEntry.move;
                newPokemon.learnset[j] = {
                    ...learnsetEntry,
                    move: newMoveId,
                };

                log.push({
                    type: oldMoveName === null ? LOG_TYPE_BUFF : LOG_TYPE_ADJUSTMENT,
                    target: 'learnsetMove',
                    oldValue: oldMoveName,
                    value: newMoveId,
                });
                amountChanged++;
            } else {
                console.warn(
                    `[WARN] No similar move found to replace ${currentMove.name} in ${newPokemon.name}'s learnset.`
                );
            }
        }

        // If we couldn't change any move, we need to insert one. Otherwise just random
        let chanceToInsertExtra = Math.max(0, 1 - (amountChanged * CHANGE_MOVE_INSERT_CHANCE));
        if (Math.random() < chanceToInsertExtra) {
            if (movesFromTheNewType.length > 0) {
                const [newMoveId, newMoveObj] =
                    movesFromTheNewType[Math.floor(Math.random() * movesFromTheNewType.length)];

                const { learnset: newLearnset, level } =
                    insertMoveIntoLearnset(newPokemon.learnset, newMoveId, newMoveObj);
                newPokemon.learnset = newLearnset;

                log.push({
                    type: LOG_TYPE_BUFF,
                    target: 'learnsetMove',
                    oldValue: null,
                    value: newMoveId,
                    level,
                });
            }
        }
    }

    // ----- LEARNSET STEP 2 - RANDOM CHANGES -----
    if (Math.random() < LEARNSET_BALANCE_CHANCE) {
        let amountChanged = 0;

        for (let i = 0; i < newPokemon.learnset.length; i++) {
            const learnsetEntry = newPokemon.learnset[i];
            const currentMove = moves[learnsetEntry.move];
            if (!currentMove) {
                console.warn(
                    `[WARN] Move ${learnsetEntry.move} not found in moves database from ${newPokemon.name}'s learnset.`
                );
                continue;
            }

            if (Math.random() < CHANGE_TYPE_MOVE_CHANCE_FROM_OTHER_TYPE_CHANCE) {
                const allMoves = Object.entries(moves);

                const similarMoves = [...allMoves].sort(
                    ([, mvA], [, mvB]) => {
                        const rA = typeof mvA.rating === 'number' ? mvA.rating : 5;
                        const rB = typeof mvB.rating === 'number' ? mvB.rating : 5;
                        const rC = typeof currentMove.rating === 'number' ? currentMove.rating : 5;
                        return Math.abs(rA - rC) - Math.abs(rB - rC);
                    }
                );

                if (similarMoves.length > 0) {
                    const [newMoveId] = similarMoves[0];
                    const oldMoveName = learnsetEntry.move;

                    newPokemon.learnset[i] = {
                        ...learnsetEntry,
                        move: newMoveId,
                    };

                    log.push({
                        type: LOG_TYPE_ADJUSTMENT,
                        target: 'learnsetMove',
                        oldValue: oldMoveName,
                        value: newMoveId,
                    });
                    amountChanged++;
                } else {
                    console.warn(
                        `[WARN] No similar move found to replace ${currentMove.name} in ${newPokemon.name}'s learnset.`
                    );
                }
            }
        }

        let chanceToInsertExtra = Math.max(0, 1 - (amountChanged * CHANGE_MOVE_INSERT_CHANCE));
        while (Math.random() < chanceToInsertExtra) {
            const allMoves = Object.entries(moves);
            if (allMoves.length === 0) break;

            const [newMoveId, newMoveObj] =
                allMoves[Math.floor(Math.random() * allMoves.length)];

            const { learnset: newLearnset, level } =
                insertMoveIntoLearnset(newPokemon.learnset, newMoveId, newMoveObj);
            newPokemon.learnset = newLearnset;

            log.push({
                type: LOG_TYPE_ADJUSTMENT,
                target: 'learnsetMove',
                oldValue: null,
                value: newMoveId,
                level,
            });

            amountChanged++;
            chanceToInsertExtra = Math.max(0, 1 - (amountChanged * CHANGE_MOVE_INSERT_CHANCE));
        }
    }

    if (!familyTracking[newPokemon.family]) {
        familyTracking[newPokemon.family] = [...log];
    }
    else {
        familyTracking[newPokemon.family] = [
            ...familyTracking[newPokemon.family],
            ...log,
        ];
    }

    return {
        ...newPokemon,
        log: [
            ...inheritedLog,
            ...log,
        ],
    };

}

module.exports = {
    balancePokemon,
};
