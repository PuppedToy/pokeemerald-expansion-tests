const { LOG_TYPE_BUFF, LOG_TYPE_NERF, POKEMON_TYPES, LOG_TYPE_ADJUSTMENT } = require("./constants");

const BALANCE_CHANCE = 0.2;

const STAT_BALANCE_CHANCE = 0.7;
const BUFF_STAT_CHANCE = 0.6;
const REPEAT_STAT_CHANCE = 0.5;

const TYPE_BALANCE_CHANCE = 0.1;
const ABILITY_BALANCE_CHANCE = 0.1;

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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

const familyTracking = {};

function balancePokemon(pokemon, abilityNames) {

    const log = [];
    const newPokemon = { ...pokemon };

    if (familyTracking[pokemon.familyId]) {
        const familyLog = familyTracking[pokemon.familyId];
        familyLog.forEach(entry => {
            if (['baseHP', 'baseAttack', 'baseDefense', 'baseSpAttack', 'baseSpDefense', 'baseSpeed'].includes(entry.target)) {
                newPokemon[entry.target] = Math.max(1, newPokemon[entry.target] + entry.value);
            }
            else if (entry.target === 'type') {
                newPokemon.parsedTypes = newPokemon.parsedTypes.map(t => t === entry.oldValue ? entry.value : t);
            }
            else if (entry.target === 'ability') {
                newPokemon.abilities = newPokemon.abilities.map(a => a === entry.oldValue ? entry.value : a);
            }
        });
    }

    if (Math.random() > BALANCE_CHANCE) {
        return {
            ...newPokemon,
            log,
        };
    }


    const stats = shuffleArray(['baseHP', 'baseAttack', 'baseDefense', 'baseSpAttack', 'baseSpDefense', 'baseSpeed']);
    let chance = STAT_BALANCE_CHANCE;
    stats.forEach(stat => {
        if (Math.random() < chance) {
            const changeDiff = Math.random() < BUFF_STAT_CHANCE ? 10 : -10;
            let change = changeDiff;
            while (Math.random() < REPEAT_STAT_CHANCE) {
                change += changeDiff;
            }
            newPokemon[stat] = Math.max(1, newPokemon[stat] + change);
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
        const types = shuffleArray([...pokemon.parsedTypes]);
        const [oldType] = types;
        const allTypes = shuffleArray(
            [...POKEMON_TYPES].filter(t => !pokemon.parsedTypes.includes(t))
        );
        const [newType] = allTypes;
        newPokemon.parsedTypes = newPokemon.parsedTypes.map(t => t === oldType ? newType : t);
        log.push({
            type: LOG_TYPE_ADJUSTMENT,
            target: 'type',
            oldValue: oldType,
            value: newType,
        });
    }

    if (Math.random() < ABILITY_BALANCE_CHANCE) {
        const abilities = shuffleArray(
            [...pokemon.abilities].filter(a => !BANNED_ABILITIES.includes(a))
        );
        const [oldAbility] = abilities;
        const allAbilities = abilityNames
            .filter(a => !pokemon.abilities.includes(a.name) && !BANNED_ABILITIES.includes(a.name));
        const newAbility = allAbilities[Math.floor(Math.random() * allAbilities.length)];
        newPokemon.abilities = newPokemon.abilities.map(a => a === oldAbility ? newAbility : a);
        log.push({
            type: LOG_TYPE_ADJUSTMENT,
            target: 'ability',
            oldValue: oldAbility,
            value: newAbility.name,
        });
    }

    // @TODO Learnset

    if (!familyTracking[newPokemon.familyId]) {
        familyTracking[newPokemon.familyId] = [...log];
    }
    else {
        familyTracking[newPokemon.familyId] = [
            ...familyTracking[newPokemon.familyId],
            ...log,
        ];
    }

    return {
        ...newPokemon,
        log,
    };

}

module.exports = {
    balancePokemon,
};
