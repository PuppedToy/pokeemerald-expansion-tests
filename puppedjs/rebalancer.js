const { LOG_TYPE_BUFF, LOG_TYPE_NERF, POKEMON_TYPES, LOG_TYPE_ADJUSTMENT } = require("./constants");

const BALANCE_CHANCE = 0.2;

const STAT_BALANCE_CHANCE = 0.7;
const BUFF_STAT_CHANCE = 0.6;
const REPEAT_STAT_CHANCE = 0.5;

const TYPE_BALANCE_CHANCE = 0.1;
const MONOTYPE_BALANCE_CHANCE = 0.1;
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

const familyTracking = {};

function balancePokemon(pokemon, abilityNames) {

    const inheritedLog = [];
    const newPokemon = { ...pokemon };

    if (familyTracking[pokemon.family]) {
        const familyLog = familyTracking[pokemon.family] || [];
        familyLog.forEach(entry => {
            let changed = false;
            if (['baseHP', 'baseAttack', 'baseDefense', 'baseSpAttack', 'baseSpDefense', 'baseSpeed'].includes(entry.target)) {
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
            if (changed) {
                inheritedLog.push(entry);
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

    // @TODO Learnset

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
