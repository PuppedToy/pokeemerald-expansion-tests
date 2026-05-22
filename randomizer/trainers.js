const path = require("path");
const {
    EVO_TYPE_LC,
    TRAINER_POKE_STARTER_TREECKO,
    TRAINER_POKE_ENCOUNTER,
    TRAINER_RESTRICTION_NO_REPEATED_TYPE,
    TRAINER_POKE_STARTER_TORCHIC,
    TRAINER_POKE_STARTER_MUDKIP,
    TIER_MAGIKARP,
    TIER_ZU,
    TIER_PU,
    TIER_NU,
    TIER_OU,
    POKEMON_TYPE_WATER,
    POKEMON_TYPE_ICE,
    POKEMON_TYPE_BUG,
    POKEMON_TYPE_FAIRY,
    POKEMON_TYPE_GRASS,
    POKEMON_TYPE_FIGHTING,
    POKEMON_TYPE_PSYCHIC,
    POKEMON_TYPE_DARK,
    POKEMON_TYPE_POISON,
    POKEMON_TYPE_FIRE,
    POKEMON_TYPE_ROCK,
    POKEMON_TYPE_GROUND,
    POKEMON_TYPE_FLYING,
    POKEMON_TYPE_STEEL,
    TRAINER_REPEAT_ID,
    TIER_UU,
    TIER_RU,
    NATURES,
    POKEMON_TYPE_DRAGON,
    POKEMON_TYPE_ELECTRIC,
    TIER_UBERS,
    TRAINER_POKE_MEGA_FROM_STONE,
    POKEMON_TYPE_NORMAL,
    POKEMON_TYPE_GHOST,
    TIER_AG,
    POKEMON_TYPES,
    TRAINER_GYM_LEADERS_KEEP_TYPE_AMOUNT,
    TRAINER_E4_KEEP_TYPE_AMOUNT,
} = require("./constants");
const { maps: wildMaps } = require('./wild');
const { getBossPreset, getNonBossPreset } = require('./presets');
const rng = require('./rng');

const trainersFile = path.resolve(__dirname, '..', 'src', 'data', 'trainers.party');
const partnersFile = path.resolve(__dirname, '..', 'src', 'data', 'battle_partners.party');

const stevenPokemon = [
    'SPECIES_BALTOY',
    'SPECIES_ARON',
    'SPECIES_BELDUM',
    'SPECIES_KABUTO',
    'SPECIES_OMANYTE',
    'SPECIES_LILEEP',
    'SPECIES_ANORITH',
    'SPECIES_SHIELDON',
    'SPECIES_CRANIDOS',
    'SPECIES_TIRTOUGA',
    'SPECIES_AMAURA',
    'SPECIES_ARCHEN',
    'SPECIES_TYRUNT',
];

const rainAbilities = ['SWIFT_SWIM', 'RAIN_DISH', 'DRY_SKIN', 'HYDRATION'];
const sunAbilities = ['FLOWER_GIFT', 'CHLOROPHYLL', 'LEAF_GUARD', 'SOLAR_POWER', 'PROTOSYNTHESIS'];
const sandAbilities = ['SAND_FORCE', 'SAND_RUSH', 'SAND_VEIL'];
const snowAbilities = ['ICE_BODY', 'SNOW_CLOAK', 'SLUSH_RUSH'];

const aquaTeamTypes = [
    POKEMON_TYPE_WATER,
    POKEMON_TYPE_DARK,
    POKEMON_TYPE_POISON,
    POKEMON_TYPE_ICE,
    POKEMON_TYPE_FLYING,
];

const magmaTeamTypes = [
    POKEMON_TYPE_FIRE,
    POKEMON_TYPE_GROUND,
    POKEMON_TYPE_ROCK,
    POKEMON_TYPE_GRASS,
    POKEMON_TYPE_FIGHTING,
];

function sampleAndRemove(array) {
    const index = Math.floor(rng.random() * array.length);
    const item = array[index];
    array.splice(index, 1);
    return item;
}

const originalE4Types = [POKEMON_TYPE_DARK, POKEMON_TYPE_GHOST, POKEMON_TYPE_ICE, POKEMON_TYPE_DRAGON];
const originalGymTypes = [
    POKEMON_TYPE_ROCK,
    POKEMON_TYPE_FIGHTING,
    POKEMON_TYPE_ELECTRIC,
    POKEMON_TYPE_FIRE,
    POKEMON_TYPE_NORMAL,
    POKEMON_TYPE_FLYING,
    POKEMON_TYPE_PSYCHIC,
    POKEMON_TYPE_WATER,
];

// New defs

const POKEDEF_MAGIKARP = {
    contextualTier: [TIER_MAGIKARP],
    checkValidEvo: true,
};

const POKEDEF_ZU = {
    contextualTier: [TIER_ZU],
    checkValidEvo: true,
};

const POKEDEF_ZU_LC = {
    contextualTier: [TIER_ZU],
    evoType: [EVO_TYPE_LC],
    checkValidEvo: true,
};

const POKEDEF_PU_LC = {
    contextualTier: [TIER_PU],
    evoType: [EVO_TYPE_LC],
    checkValidEvo: true,
};

const POKEDEF_PU = {
    contextualTier: [TIER_PU],
    checkValidEvo: true,
};

const POKEDEF_NU = {
    contextualTier: [TIER_NU],
    checkValidEvo: true,
};

const POKEDEF_RU = {
    contextualTier: [TIER_RU],
    checkValidEvo: true,
};

const POKEDEF_NU_OR_RU = {
    contextualTier: [TIER_NU, TIER_RU],
    checkValidEvo: true,
};

const POKEDEF_UP_TO_UU = {
    contextualTier: [TIER_NU, TIER_RU, TIER_UU],
    checkValidEvo: true,
};

const POKEDEF_UP_TO_OU = {
    contextualTier: [TIER_NU, TIER_RU, TIER_UU, TIER_OU],
    checkValidEvo: true,
};

const POKEDEF_UP_TO_OU_NOEVO = {
    contextualTier: [TIER_NU, TIER_RU, TIER_UU, TIER_OU],
    checkValidEvo: true,
};

const POKEDEF_UU = {
    contextualTier: [TIER_UU],
    checkValidEvo: true,
};

const POKEDEF_OU = {
    contextualTier: [TIER_OU],
    checkValidEvo: true,
};

const POKEDEF_UBERS = {
    contextualTier: [TIER_UBERS],
    checkValidEvo: true,
};

const POKEDEF_UU_OU_MEGA = {
    isMega: true,
    contextualTier: [TIER_RU, TIER_NU, TIER_UU, TIER_OU],
    checkValidEvo: true,
    tryEvolve: true,
};

const POKEDEF_MEGA = {
    isMega: true,
    contextualTier: [TIER_UU, TIER_OU, TIER_UBERS],
    checkValidEvo: true,
    tryEvolve: true,
};

// Auto-tier-down through all mega tiers; if no mega found, drop isMega and retry from top.
const pokeDefUbersMega = (BASE_POKE_DEF = {}) => ({
    isMega: true,
    contextualTier: [TIER_UBERS],
    checkValidEvo: true,
    ...BASE_POKE_DEF,
    fallback: [{
        contextualTier: [TIER_UBERS],
        checkValidEvo: true,
        ...BASE_POKE_DEF,
    }],
});

const pokeDefUbersOrAGMega = (BASE_POKE_DEF = {}) => ({
    isMega: true,
    contextualTier: [TIER_UBERS, TIER_AG],
    checkValidEvo: true,
    ...BASE_POKE_DEF,
    fallback: [{
        contextualTier: [TIER_UBERS, TIER_AG],
        checkValidEvo: true,
        ...BASE_POKE_DEF,
    }],
});

const pokeDefMega = (BASE_POKE_DEF = {}) => ({
    isMega: true,
    contextualTier: [TIER_OU, TIER_UBERS],
    checkValidEvo: true,
    tryEvolve: true,
    ...BASE_POKE_DEF,
    fallback: [{
        contextualTier: [TIER_OU, TIER_UBERS],
        checkValidEvo: true,
        ...BASE_POKE_DEF,
    }],
});

// Weather/terrain setter pattern:
// maxTierDownSteps:1 limits ability-setter phase to T and T-1.
// fallback[0] = move-setter at original T (full auto-tier-down from there).

const pokeDefDrizzleMon = (BASE_POKE_DEF) => ({
    ...BASE_POKE_DEF,
    abilities: ['DRIZZLE'],
    item: 'Damp Rock',
    maxTierDownSteps: 1,
    fallback: [{
        ...BASE_POKE_DEF,
        mustHaveOneOfMoves: ['MOVE_RAIN_DANCE'],
        tryToHaveMove: ['MOVE_RAIN_DANCE'],
        abilities: [...rainAbilities],
        item: 'Damp Rock',
    }],
});

const pokeDefSnowWarningMon = (BASE_POKE_DEF) => ({
    ...BASE_POKE_DEF,
    abilities: ['SNOW_WARNING'],
    item: 'Icy Rock',
    maxTierDownSteps: 1,
    fallback: [{
        ...BASE_POKE_DEF,
        mustHaveOneOfMoves: ['MOVE_HAIL'],
        tryToHaveMove: ['MOVE_HAIL'],
        abilities: [...snowAbilities],
        item: 'Icy Rock',
    }],
});

const pokeDefDroughtMon = (BASE_POKE_DEF) => ({
    ...BASE_POKE_DEF,
    abilities: ['DROUGHT'],
    item: 'Heat Rock',
    maxTierDownSteps: 1,
    fallback: [{
        ...BASE_POKE_DEF,
        mustHaveOneOfMoves: ['MOVE_SUNNY_DAY'],
        tryToHaveMove: ['MOVE_SUNNY_DAY'],
        abilities: [...sunAbilities],
        item: 'Heat Rock',
    }],
});

const pokeDefSandStreamMon = (BASE_POKE_DEF) => ({
    ...BASE_POKE_DEF,
    abilities: ['SAND_STREAM'],
    item: 'Smooth Rock',
    maxTierDownSteps: 1,
    fallback: [{
        ...BASE_POKE_DEF,
        mustHaveOneOfMoves: ['MOVE_SANDSTORM'],
        tryToHaveMove: ['MOVE_SANDSTORM'],
        abilities: [...sandAbilities],
        item: 'Smooth Rock',
    }],
});

const pokeDefPsychicSurgeMon = (BASE_POKE_DEF, item = 'Terrain Extender') => ({
    ...BASE_POKE_DEF,
    abilities: ['PSYCHIC_SURGE'],
    item,
    maxTierDownSteps: 1,
    fallback: [{
        ...BASE_POKE_DEF,
        mustHaveOneOfMoves: ['MOVE_PSYCHIC_TERRAIN'],
        tryToHaveMove: ['MOVE_PSYCHIC_TERRAIN'],
        item,
    }],
});

const pokeDefMistySurgeMon = (BASE_POKE_DEF, item = 'Terrain Extender') => ({
    ...BASE_POKE_DEF,
    abilities: ['MISTY_SURGE'],
    item,
    maxTierDownSteps: 1,
    fallback: [{
        ...BASE_POKE_DEF,
        mustHaveOneOfMoves: ['MOVE_MISTY_TERRAIN'],
        tryToHaveMove: ['MOVE_MISTY_TERRAIN'],
        item,
    }],
});

const pokeDefElectricSurgeMon = (BASE_POKE_DEF, item = 'Terrain Extender') => ({
    ...BASE_POKE_DEF,
    abilities: ['ELECTRIC_SURGE'],
    item,
    maxTierDownSteps: 1,
    fallback: [{
        ...BASE_POKE_DEF,
        mustHaveOneOfMoves: ['MOVE_ELECTRIC_TERRAIN'],
        tryToHaveMove: ['MOVE_ELECTRIC_TERRAIN'],
        item,
    }],
});

const pokeDefGrassySurgeMon = (BASE_POKE_DEF, item = 'Terrain Extender') => ({
    ...BASE_POKE_DEF,
    abilities: ['GRASSY_SURGE'],
    item,
    maxTierDownSteps: 1,
    fallback: [{
        ...BASE_POKE_DEF,
        mustHaveOneOfMoves: ['MOVE_GRASSY_TERRAIN'],
        tryToHaveMove: ['MOVE_GRASSY_TERRAIN'],
        item,
    }],
});

const PROMISING_OU_UBERS_MEGA_LC = {
    megaTier: [TIER_OU, TIER_UBERS],
    contextualTier: [TIER_PU],
    evoType: [EVO_TYPE_LC],
};

const generatePokemonsWithDefinition = (def, amount) => {
    return new Array(amount).fill(null).map(() => ({ ...def }));
}

const genericTrainerTeamPostFlannery   = () => getNonBossPreset('NORMAN');
const genericTrainerTeamPostNorman     = () => getNonBossPreset('WINONA');
const genericTrainerTeamPostShelly     = () => getNonBossPreset('WINONA');
const genericTrainerTeamPostWinona     = () => getNonBossPreset('TATE_AND_LIZA');
const genericTrainerTeamPostMatt       = () => getNonBossPreset('TATE_AND_LIZA');
const genericTrainerTeamPostTateAndLiza = () => getNonBossPreset('JUAN');

const sample = (array) => {
    return array[Math.floor(rng.random() * array.length)];
}

const getSampleItemsFromArray = (array, amount) => {
    const result = new Set();
    for (let i = 0; i < amount; i++) {
        result.add(sample(array));
    }
    return Array.from(result);
};

function getWildEncountersFromMap(mapId, encounterTypes) {
    const map = wildMaps.find(m => m.id === mapId);
    if (!map) {
        throw new Error('Map not found: ' + mapId);
    }

    const result = [];
    Object.entries(map).forEach(([encounterType, encounter]) => {
        if (encounterTypes.includes(encounterType)) {
            result.push(encounter);
        }
    });

    return result;
}

const rival101Encounters = getWildEncountersFromMap('MAP_ROUTE101', ['land', 'old']);
const rival102Encounters = getWildEncountersFromMap('MAP_ROUTE102', ['land', 'old']);
const rival103Encounters = getWildEncountersFromMap('MAP_ROUTE103', ['land', 'old']);
const rival104Encounters = getWildEncountersFromMap('MAP_ROUTE104', ['land', 'old']);

const rivalRustboroEncounters = [
    ...rival101Encounters,
    ...rival102Encounters,
    ...rival103Encounters,
    ...rival104Encounters,
    ...getWildEncountersFromMap('MAP_PETALBURG_WOODS', ['land', 'old']),
    ...getWildEncountersFromMap('MAP_ROUTE115', ['land', 'old']),
    ...getWildEncountersFromMap('MAP_ROUTE116', ['land', 'old']),
];

const rival110Encounters = [
    ...rivalRustboroEncounters,
    ...getWildEncountersFromMap('MAP_ROUTE106', ['land', 'old']),
    ...getWildEncountersFromMap('MAP_GRANITE_CAVE', ['land', 'old']),
    ...getWildEncountersFromMap('MAP_ROUTE109', ['land', 'old']),
    ...getWildEncountersFromMap('MAP_ROUTE110', ['land']),
];

const rivalGoodRodEncounters = [
    ...getWildEncountersFromMap('MAP_ROUTE101', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE102', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE103', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE104', ['good']),
    ...getWildEncountersFromMap('MAP_PETALBURG_WOODS', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE115', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE116', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE106', ['good']),
    ...getWildEncountersFromMap('MAP_GRANITE_CAVE', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE109', ['good']),
];

const rival119Encounters = [
    ...rival110Encounters,
    ...rivalGoodRodEncounters,
    ...getWildEncountersFromMap('MAP_ROUTE110', ['old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE117', ['land', 'old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE118', ['land', 'old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE111', ['land', 'old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE112', ['land', 'old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE113', ['land', 'old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE114', ['land', 'old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE119', ['land', 'old', 'good']),
];

const rivalSuperRodEncounters = [
    ...getWildEncountersFromMap('MAP_ROUTE101', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE102', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE103', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE104', ['super']),
    ...getWildEncountersFromMap('MAP_PETALBURG_WOODS', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE115', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE116', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE106', ['super']),
    ...getWildEncountersFromMap('MAP_GRANITE_CAVE', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE109', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE110', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE117', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE118', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE111', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE112', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE113', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE114', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE119', ['super']),
];

const rivalEvergrandeCityEncounters = [
    ...rival119Encounters,
    ...rivalSuperRodEncounters,
    ...getWildEncountersFromMap('MAP_ROUTE120', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_SCORCHED_SLAB', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE121', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE122', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_MT_PYRE_EXTERIOR', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE123', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE124', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE125', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_SHOAL_CAVE_HIGH_TIDE_ENTRANCE_ROOM', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE127', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE126', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE128', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE129', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE131', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_PACIFIDLOG_TOWN', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE132', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('EVER_GRANDE_CITY', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_VICTORY_ROAD_B1F', ['land', 'old', 'good', 'super', 'underwater']),
];

const rival103Template = (id) => [
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival101Encounters],
        tryEvolve: true,
        pickBest: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival102Encounters],
        tryEvolve: true,
        pickBest: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival103Encounters],
        tryEvolve: true,
        pickBest: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival102Encounters, ...rival103Encounters],
        tryEvolve: true,
        pickBest: true,
    },
    {
        id: 'RIVAL_MEGA_103_KEEP_' + id,
        breedTier: 'good',
        ...PROMISING_OU_UBERS_MEGA_LC,
    },
];

const rivalRustboroTemplate = (id) => [
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_STARTER_' + id,
        breedTier: 'perfect',
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rivalRustboroEncounters],
        pickBest: true,
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rivalRustboroEncounters],
        pickBest: true,
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rivalRustboroEncounters],
        tryEvolve: true,
    },
    {
        id: 'RIVAL_PREMIUM_RUSTBORO_KEEP_' + id,
        breedTier: 'good',
        evolutionTier: [TIER_OU],
        evoType: [EVO_TYPE_LC],
        tryEvolve: true,
        fallback: [
            {
                id: 'RIVAL_PREMIUM_RUSTBORO_KEEP_' + id,
                breedTier: 'good',
                evolutionTier: [TIER_UU],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            }
        ],
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_MEGA_103_KEEP_' + id,
        tryEvolve: true,
    },
];

const rivalRoute110Template = (id) => [
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_STARTER_' + id,
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival110Encounters],
        pickBest: true,
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival110Encounters],
        pickBest: true,
        tryEvolve: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_PREMIUM_RUSTBORO_KEEP_' + id,
        tryEvolve: true,
    },
    {
        id: 'RIVAL_PREMIUM_110_KEEP_' + id,
        breedTier: 'good',
        evolutionTier: [TIER_OU],
        evoType: [EVO_TYPE_LC],
        tryEvolve: true,
        fallback: [
            {
                id: 'RIVAL_PREMIUM_110_KEEP_' + id,
                breedTier: 'good',
                evolutionTier: [TIER_UU],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            }
        ],
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_MEGA_103_KEEP_' + id,
        tryEvolve: true,
    },
];


const rivalRoute119Template = (id) => [
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_MEGA_103_KEEP_' + id,
        tryEvolve: true,
        tryMega: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_STARTER_' + id,
        tryEvolve: true,
        tryMega: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival119Encounters],
        pickBest: true,
        tryEvolve: true,
        tryMega: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival119Encounters],
        pickBest: true,
        tryEvolve: true,
        tryMega: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_PREMIUM_RUSTBORO_KEEP_' + id,
        tryEvolve: true,
        tryMega: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_PREMIUM_110_KEEP_' + id,
        tryEvolve: true,
        tryMega: true,
    },
];

const rivalEvergrandeCityTemplate = (id) => [
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_MEGA_103_KEEP_' + id,
        tryEvolve: true,
        tryMega: true,
    },
    {
        special: 'PLAYER_LEGEND_' + id,
        breedTier: 'good',
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_STARTER_' + id,
        tryEvolve: true,
        tryMega: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rivalEvergrandeCityEncounters],
        pickBest: true,
        tryEvolve: true,
        tryMega: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_PREMIUM_RUSTBORO_KEEP_' + id,
        tryEvolve: true,
        tryMega: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_PREMIUM_110_KEEP_' + id,
        tryEvolve: true,
        tryMega: true,
    },
];

function getTrainersData(itemAssignments, tmList) {
    // Gym / E4 type randomization — seeded here so it respects rng.seed(config.seed)
    const coinsForE4Types = [0, 1, 2, 3];
    const coinsForGymTypes = [0, 1, 2, 3, 4, 5, 6, 7];
    const whoKeepsE4Type = [];
    const whoKeepsGymType = [];
    for (let i = 0; i < TRAINER_E4_KEEP_TYPE_AMOUNT; i++) {
        whoKeepsE4Type.push(sampleAndRemove(coinsForE4Types));
    }
    for (let i = 0; i < TRAINER_GYM_LEADERS_KEEP_TYPE_AMOUNT; i++) {
        const chosenType = sampleAndRemove(coinsForGymTypes);
        whoKeepsGymType.push(chosenType);
    }
    const e4AllowedTypes = [...POKEMON_TYPES];
    for (let i = 0; i < originalE4Types.length; i++) {
        e4AllowedTypes.splice(e4AllowedTypes.indexOf(originalE4Types[i]), 1);
    }
    e4AllowedTypes.splice(e4AllowedTypes.indexOf(POKEMON_TYPE_STEEL), 1);
    const gymAllowedTypes = [...POKEMON_TYPES];
    for (let i = 0; i < originalGymTypes.length; i++) {
        gymAllowedTypes.splice(gymAllowedTypes.indexOf(originalGymTypes[i]), 1);
    }
    gymAllowedTypes.splice(gymAllowedTypes.indexOf(POKEMON_TYPE_STEEL), 1);

    let e41MainType;
    let e42MainType;
    let e43MainType;
    let e44MainType;

    if (whoKeepsE4Type.includes(0)) { e41MainType = originalE4Types[0]; }
    if (whoKeepsE4Type.includes(1)) { e42MainType = originalE4Types[1]; }
    if (whoKeepsE4Type.includes(2)) { e43MainType = originalE4Types[2]; }
    if (whoKeepsE4Type.includes(3)) { e44MainType = originalE4Types[3]; }
    if (!e41MainType) { e41MainType = sampleAndRemove(e4AllowedTypes); }
    if (!e42MainType) { e42MainType = sampleAndRemove(e4AllowedTypes); }
    if (!e43MainType) { e43MainType = sampleAndRemove(e4AllowedTypes); }
    if (!e44MainType) { e44MainType = sampleAndRemove(e4AllowedTypes); }

    const gymIsChangedType = [];
    const gymMainTypes = [];
    for (let i = 0; i < originalGymTypes.length; i++) {
        if (whoKeepsGymType.includes(i)) {
            gymMainTypes.push(originalGymTypes[i]);
            gymIsChangedType.push(false);
        } else {
            gymMainTypes.push(sampleAndRemove(gymAllowedTypes));
            gymIsChangedType.push(true);
        }
    }

    const tateAndLizaUseSolrock = rng.random() < 0.5;

    // Pool-derived item arrays (display names from itemRandomizer)
    const route102BallItems      = itemAssignments.route102Ball;
    const petalburgPlateItems    = itemAssignments.petalburgPlates;
    const route104GemItems       = itemAssignments.route104Gems;
    const route104BerryItems     = itemAssignments.route104Berries;
    const route111ItemItems      = itemAssignments.route111Items;
    const route111BerryItems     = itemAssignments.route111Berries;
    const route117BerryItems     = itemAssignments.route117Berries;
    const route106GoodItem       = itemAssignments.route106GoodItem;
    const route106BallItems      = itemAssignments.route106Ball;
    const route116XSpecialItem   = itemAssignments.route116XSpecial;
    const route116GemItems       = itemAssignments.route116Gems;
    const route116BerryItems     = itemAssignments.route116Berries;
    const route116BallItems      = itemAssignments.route116Ball;
    const route109GoodItem           = itemAssignments.route109GoodItem;
    const route110GoodItem           = itemAssignments.route110GoodItem;
    const route110LumGoodItem        = itemAssignments.route110LumGoodItem;
    const route117GoodItem           = itemAssignments.route117GoodItem;
    const route110ExtenderBallItems  = itemAssignments.route110ExtenderBall;
    const route117GemItems       = itemAssignments.route117Gems;
    const route117PlateItems     = itemAssignments.route117Plates;
    const route111HpUpGoodItem    = itemAssignments.route111HpUpGoodItem;
    const route111BallAItems      = itemAssignments.route111BallA;
    const route111BallCItems      = itemAssignments.route111BallC;
    const route114WyattGoodItem    = itemAssignments.route114WyattGoodItem;
    const route118BarnyGoodItem  = itemAssignments.route118BarnyGoodItem;
    const route118ItemItems      = itemAssignments.route118Items;
    const route120AngelicaGoodItem = itemAssignments.route120AngelicaGoodItem;
    const route121BerryItems     = itemAssignments.route121Berries;

    // TM helper: tmItem(n) → 'TM_MOVENAME' for TM slot n (1-based)
    const tmItem = (n) => `TM_${tmList[n - 1]}`;

    // Pool-derived choice arrays (replace old hardcoded versions below)
    const woodsPlatesChoice    = petalburgPlateItems;
    const choice104Berry       = route104BerryItems;
    const choice104Gem         = route104GemItems;
    const choice116Gem         = route116GemItems;
    const choice116Berry       = route116BerryItems;
    const choice116PickTMs     = [tmItem(65), tmItem(66), tmItem(67)];
    const choice104TMs         = [tmItem(5), tmItem(6), tmItem(7)];
    const choice104TMs2        = [tmItem(8), tmItem(9), tmItem(10)];
    const choicesDewfordTMs    = [tmItem(4), tmItem(3), tmItem(2)];
    const choice110TMs         = [tmItem(63), tmItem(64), tmItem(62)];
    const choiceMelinaBerries  = route117BerryItems;
    const choiceAishaGems      = route117GemItems;
    const choiceNobTMs         = [tmItem(80), tmItem(79), tmItem(81)];
    const choiceCharlotteTMs   = [tmItem(13), tmItem(15), tmItem(14)];
    const choiceChesterTMs     = [tmItem(34), tmItem(33), tmItem(35)];
    const choiceDeandreTMs     = [tmItem(20), tmItem(21), tmItem(22)];
    const choiceHectorTMs      = [tmItem(77), tmItem(76)];
    const choiceCarolTMs       = [tmItem(85), tmItem(86), tmItem(87)];
    const choiceBriceTMs       = [tmItem(23), tmItem(24), tmItem(25)];
    const choiceTammyTMs       = [tmItem(82), tmItem(83), tmItem(84)];
    const choiceRickyTMs       = [tmItem(16), tmItem(17), tmItem(18)];
    const choiceHueyTMs        = [tmItem(68), tmItem(69), tmItem(70)];
    const choiceGraceTMs       = [tmItem(36), tmItem(37), tmItem(38)];
    const choiceWiltonTMs      = [tmItem(26), tmItem(27), tmItem(28)];
    const choiceNolanTMs       = [tmItem(88), tmItem(89), tmItem(90)];
    const choiceAngelinaTMs    = [tmItem(57), tmItem(58), tmItem(59), tmItem(60)];
    const choiceBryanTMs       = [tmItem(12), tmItem(29), tmItem(30)];
    const rival103TM           = tmItem(71);
    const choiceHeidiItems     = [...route111ItemItems];
    const choiceWadeBerries    = route118ItemItems;
    const choiceRoseTMs        = [tmItem(39), tmItem(40), tmItem(41)];
    const choiceClarissaTMs    = [tmItem(42), tmItem(43), tmItem(44)];
    const choiceWalterTMs      = [tmItem(45), tmItem(46), tmItem(47)];
    const choiceCristinBerries = route121BerryItems;
    const choicePresleyTMs     = [tmItem(48), tmItem(49), tmItem(50)];
    const choiceJosephSeeds    = ['Electric Seed', 'Grassy Seed', 'Psychic Seed', 'Misty Seed'];
    const jessicaTM            = tmItem(52);
    const spencerTM            = tmItem(92);
    const rolandTM             = tmItem(53);
    const auronTM              = tmItem(54);
    const aidanTM              = tmItem(55);
    const athenaTM             = tmItem(93);
    const quincyTM             = tmItem(56);
    const katelynTM            = tmItem(94);

const rival103Bag = () => [
    'Oran Berry',
    rival103TM,
    sample([...route102BallItems]),
];

const petalwoodGruntBag = () => [
    ...rival103Bag(),
    'Eviolite',
    sample([...petalburgPlateItems]),
];

const roxanneBag = () => [
    ...petalwoodGruntBag(),
    sample([...choice104Gem]),
    sample([...choice104Berry]),
    sample([...choice104TMs]),
    tmItem(1),
];

const rusturfGruntBag = () => [
    ...roxanneBag(),
    sample([...route116BallItems]),
    sample([...choice116PickTMs]),
    route116XSpecialItem,
];

const rivalRustboroBag = () => [
    ...rusturfGruntBag(),
    sample(['Toxic Orb', 'Flame Orb']),
    sample([...choice116Gem]),
    sample([...choice116Berry]),
    'Lum Berry',
];

const brawlyBag = () => [
    ...rivalRustboroBag(),
    route106GoodItem,
    sample([...choicesDewfordTMs]),
    sample([...route106BallItems]),
    tmItem(61),
];

const stevenBag = () => [
    ...brawlyBag(),
    tmItem(19),  // Steven's TM
];

const slateportGruntsBag = () => [
    ...stevenBag(),
    route109GoodItem,
    sample([...choiceRickyTMs]),
    sample([...choiceHueyTMs]),
    // 'Damp Rock',
    // 'Heat Rock',
    // 'Smooth Rock',
    // 'Icy Rock',
];

const rivalRoute110Bag = () => [
    ...slateportGruntsBag(),
    sample([...choice110TMs]),
    route110GoodItem,
    sample([...route110ExtenderBallItems]),
];

const wallyBag = () => [
    ...rivalRoute110Bag(),
    route110LumGoodItem,
    sample([...choiceJosephSeeds]),
    sample([...choiceDeandreTMs]),
];

const wattsonBag = () => [
    ...wallyBag(),
    sample([...choiceHectorTMs]),
    sample([...choiceMelinaBerries]),
    sample(choiceAishaGems),
    route117GoodItem,
    'Light Clay',
    tmItem(11),   // Wattson's gym TM
    'TM_ROCK_SMASH',  // HM, not randomized
];

const magmaChimneyBag = () => [
    ...wattsonBag(),
    route111HpUpGoodItem,
    sample([...route111BallAItems]),
    sample([...choiceCarolTMs]),
    sample([...choiceBriceTMs]),
];

const flanneryBag = () => [
    ...magmaChimneyBag(),
    route114WyattGoodItem,
    sample(choiceNobTMs),
    sample([...choiceWiltonTMs]),
    sample([...choiceCharlotteTMs]),
    sample([...choiceNolanTMs]),
    sample([...choiceAngelinaTMs]),
    'Nugget',
    tmItem(78),   // Flannery's gym TM
    'TM_STRENGTH',  // HM, not randomized
];

const normanBag = () => [
    ...flanneryBag(),
    sample([...route111BerryItems]),
    sample([...route111BallCItems]),
    sample([...choiceNobTMs]),
    sample([...choiceBryanTMs]),
    sample([...choiceHeidiItems]),
    tmItem(31),   // Norman's gym TM
    'TM_SURF',    // HM, not randomized
];

const shellyBag = () => [
    ...normanBag(),
    route118BarnyGoodItem,
    sample([...choiceWadeBerries]),
    sample([...choiceRoseTMs]),
    sample([...choiceChesterTMs]),
    'Lum Berry',
];

const rival119Bag = () => [
    ...shellyBag(),
    'Leftovers',
];

const winonaBag = () => [
    ...rival119Bag(),
    route120AngelicaGoodItem,
    sample([...choiceClarissaTMs]),
    tmItem(32),   // Winona's gym TM
];

const wallyBag2 = () => [
    ...winonaBag(),
    'Focus Sash',
    sample([...choiceTammyTMs]),
    sample([...choiceCristinBerries]),
    sample([...choiceWalterTMs]),
    jessicaTM,
];

const choiceIsabellaItem = ['Choice Band', 'Choice Scarf', 'Choice Specs'];

const tateAndLizaBag = () => [
    ...wallyBag2(),
    sample([...choiceIsabellaItem]),
    sample([...choiceGraceTMs]),
    spencerTM,   // Spencer's route 124 TM
    rolandTM,   // Roland's route 124 TM
    tmItem(91),   // Tate & Liza's gym TM
];

const spaceCenterBag = () => [
    ...tateAndLizaBag(),
    sample([...choicePresleyTMs]),
    auronTM,   // Auron's route 125 TM
];

const archieBag = () => [
    ...spaceCenterBag(),
    aidanTM,   // Aidan's route 127 TM
    athenaTM,   // Athena's route 127 TM
    'Eject Button',   // route 127 static item
]

const juanBag = () => [
    ...archieBag(),
    tmItem(51),   // Juan's gym TM (randomized)
    'TM_WATERFALL',   // HM — not randomized
];

const endgameBag = () => [
    ...juanBag(),
    quincyTM,   // Quincy's victory road TM
    katelynTM,   // Katelynn's victory road TM
    tmItem(95),   // EverGrande rival TM
];

const trainersData = [
    // Route 101
    {
        id: 'TRAINER_CALVIN_1',
        location: 'Route 101',
        class: 'Youngster',
        reward: ['SPECIES_ZIGZAGOON'],
        level: 7,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ZIGZAGOON'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU_LC, 4),
            { ...POKEDEF_MAGIKARP },
        ]
    },
    {
        id: 'TRAINER_ELIJAH',
        location: 'Route 101',
        class: 'Bird Keeper',
        reward: ['Oran Berry'],
        level: 7,
        team: [
            {
                ...POKEDEF_PU_LC,
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU_LC, 4),
            { ...POKEDEF_MAGIKARP },
        ],
    },
    // Route 102
    {
        id: 'TRAINER_ALLEN',
        location: 'Route 102',
        class: 'Camper',
        reward: ['SPECIES_WURMPLE'],
        level: 7,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WURMPLE'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU_LC, 4),
            { ...POKEDEF_MAGIKARP },
        ],
    },
    {
        id: 'TRAINER_RICK',
        location: 'Route 102',
        class: 'Bug Catcher',
        reward: ['SPECIES_WINGULL'],
        level: 7,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WINGULL'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU_LC, 4),
            { ...POKEDEF_MAGIKARP },
        ]
    },
    {
        id: 'TRAINER_TIANA',
        location: 'Route 102',
        class: 'Lass',
        reward: [...route102BallItems],
        level: 7,
        bag: [...route102BallItems],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_ZU_LC, 5),
            { ...POKEDEF_MAGIKARP },
        ]
    },
    // Route 103
    {
        id: 'TRAINER_SAWYER_1',
        location: 'Route 103',
        class: 'Hiker',
        reward: ['SPECIES_SMEARGLE'],
        level: 7,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SMEARGLE'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU_LC, 4),
            { ...POKEDEF_MAGIKARP },
        ]
    },
    {
        id: 'TRAINER_CARTER',
        location: 'Route 103',
        class: 'Fisherman',
        reward: ['SPECIES_SURSKIT'],
        level: 7,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SURSKIT'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU_LC, 4),
            { ...POKEDEF_MAGIKARP },
        ]
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_TREECKO',
        location: 'Route 103',
        class: 'May',
        reward: [rival103TM],
        bag: [...rival103Bag()],
        level: 7,
        isBoss: true,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                id: 'RIVAL_STARTER_TREECKO',
                breedTier: 'perfect',
                special: TRAINER_POKE_STARTER_TORCHIC,
            },
            ...rival103Template('TREECKO'),
        ]
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_TORCHIC',
        location: 'Route 103',
        class: 'May',
        reward: [rival103TM],
        bag: [...rival103Bag()],
        level: 7,
        isBoss: true,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                id: 'RIVAL_STARTER_TORCHIC',
                breedTier: 'perfect',
                special: TRAINER_POKE_STARTER_MUDKIP,
            },
            ...rival103Template('TORCHIC'),
        ]
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_MUDKIP',
        location: 'Route 103',
        class: 'May',
        reward: [rival103TM],
        bag: [...rival103Bag()],
        level: 7,
        isBoss: true,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                id: 'RIVAL_STARTER_MUDKIP',
                breedTier: 'perfect',
                special: TRAINER_POKE_STARTER_TREECKO,
            },
            ...rival103Template('MUDKIP'),
        ]
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_TREECKO',
        location: 'Route 103',
        copy: 'TRAINER_MAY_ROUTE_103_TREECKO',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_TORCHIC',
        location: 'Route 103',
        copy: 'TRAINER_MAY_ROUTE_103_TORCHIC',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_MUDKIP',
        location: 'Route 103',
        copy: 'TRAINER_MAY_ROUTE_103_MUDKIP',
        class: 'Brendan',
    },
    // Route 104
    {
        id: 'TRAINER_BILLY',
        location: 'Route 104',
        class: 'Youngster',
        reward: ['SPECIES_GEODUDE'],
        level: 10,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_GEODUDE'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU_LC, 5),
        ]
    },
    {
        id: 'TRAINER_DARIAN',
        location: 'Route 104',
        class: 'Fisherman',
        reward: ['SPECIES_WEEDLE'],
        level: 10,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WEEDLE'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU_LC, 5),
        ]
    },
    {
        id: 'TRAINER_CINDY_1',
        location: 'Route 104',
        class: 'Lady',
        reward: ['Eviolite'],
        level: 10,
        bag: [...getSampleItemsFromArray(rival103Bag(), 1), 'Eviolite'],
        team: [
            {
                contextualTier: [TIER_PU],
                evoType: [EVO_TYPE_LC],
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU_LC, 5),
        ]
    },
    {
        id: 'TRAINER_KOICHI',
        location: 'Route 115',
        class: 'Black Belt',
        reward: [...choice104TMs2],
        level: 10,
        bag: [...choice104TMs2],
        team: [
            {
                contextualTier: [TIER_PU],
                evoType: [EVO_TYPE_LC],
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU_LC, 5),
        ]
    },
    // Petalburg Woods
    {
        id: 'TRAINER_LYLE',
        location: 'Petalburg Woods',
        class: 'Bug Catcher',
        reward: [...woodsPlatesChoice],
        level: 10,
        bag: [...woodsPlatesChoice],
        team: [
            { ...POKEDEF_PU_LC },
            ...generatePokemonsWithDefinition(POKEDEF_ZU_LC, 5),
        ],
    },
    {
        id: 'TRAINER_GRUNT_PETALBURG_WOODS',
        location: 'Petalburg Woods',
        class: 'Aqua Grunt M',
        level: 10,
        reward: ['Ability Capsule'],
        isBoss: true,
        bag: [...petalwoodGruntBag()],
        team: [
            {
                ...getBossPreset('PETALBURG_WOODS_GRUNT')[0],
                type: [aquaTeamTypes[0]],
            },
            {
                ...getBossPreset('PETALBURG_WOODS_GRUNT')[1],
                exactTypes: [aquaTeamTypes[0], aquaTeamTypes[1]],
                fallback: [
                    {
                        ...getBossPreset('PETALBURG_WOODS_GRUNT')[1],
                        type: [aquaTeamTypes[0], aquaTeamTypes[1]],
                    }
                ]
            },
            {
                ...getBossPreset('PETALBURG_WOODS_GRUNT')[2],
                type: [aquaTeamTypes[1]],
            },
            {
                ...getBossPreset('PETALBURG_WOODS_GRUNT')[3],
                type: [aquaTeamTypes[2]],
            },
            {
                ...getBossPreset('PETALBURG_WOODS_GRUNT')[4],
                type: [aquaTeamTypes[3]],
            },
            {
                ...getBossPreset('PETALBURG_WOODS_GRUNT')[5],
                type: [aquaTeamTypes[4]],
            },
        ],
    },
    {
        id: 'TRAINER_JAMES_1',
        location: 'Petalburg Woods',
        class: 'Bug Catcher',
        reward: ['SPECIES_PATRAT'],
        level: 12,
        bag: [...getSampleItemsFromArray(petalwoodGruntBag(), 2)],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_PATRAT'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU, 5),
        ],
    },
    {
        id: 'TRAINER_DAREJAN',
        location: 'Petalburg Woods',
        class: 'Fisherman',
        reward: ['SPECIES_CATERPIE'],
        level: 12,
        bag: [...getSampleItemsFromArray(petalwoodGruntBag(), 2)],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_CATERPIE'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU, 5),
        ],
    },
    // Route 104 again
    {
        id: 'TRAINER_HALEY_1',
        location: 'Route 104',
        class: 'Lass',
        reward: [...choice104TMs],
        level: 12,
        bag: [...choice104TMs],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_PU, 2),
            ...generatePokemonsWithDefinition(POKEDEF_ZU, 4),
        ]
    },
    {
        id: 'TRAINER_WINSTON_1',
        location: 'Route 104',
        class: 'Rich Boy',
        reward: [...choice104Berry],
        level: 12,
        bag: [...choice104Berry],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_PU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_ZU, 5),
        ]
    },
    {
        id: 'TRAINER_IVAN',
        location: 'Route 104',
        class: 'Fisherman',
        reward: [...choice104Gem],
        level: 12,
        bag: [...choice104Gem],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_PU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_ZU, 5),
        ]
    },
    {
        id: 'TRAINER_ALIX',
        location: 'Route 115',
        class: 'Battle Girl',
        reward: ['SPECIES_SANDSHREW'],
        level: 12,
        bag: [...getSampleItemsFromArray(petalwoodGruntBag(), 2)],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SANDSHREW'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU, 5),
        ],
    },
    {
        id: 'TRAINER_TIMOTHY_1',
        location: 'Route 115',
        class: 'Expert M',
        reward: ['SPECIES_DELIBIRD'],
        level: 12,
        bag: [...getSampleItemsFromArray(petalwoodGruntBag(), 2)],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DELIBIRD'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_ZU, 5),
        ],
    },
    {
        id: 'TRAINER_MARLENE',
        location: 'Route 115',
        class: 'Psychic F',
        reward: ['Nugget'],
        level: 12,
        bag: [...getSampleItemsFromArray(petalwoodGruntBag(), 2)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_PU, 2),
            ...generatePokemonsWithDefinition(POKEDEF_ZU, 4),
        ],
    },
    // Rustboro City
    {
        id: 'TRAINER_ROXANNE_1',
        location: 'Rustboro Gym',
        level: 12,
        class: 'Leader Roxanne',
        reward: ['GYM_REWARD_1', tmItem(1)],
        isBoss: true,
        bag: roxanneBag(),
        team: [
            {
                ...getBossPreset('ROXANNE')[0],
                type: [gymMainTypes[0]],
            },
            {
                ...getBossPreset('ROXANNE')[1],
                type: [gymMainTypes[0]],
            },
            gymIsChangedType[0] ? {
                ...getBossPreset('ROXANNE')[2],
                breedTier: 'perfect',
                type: [gymMainTypes[0]],
            } : {
                specificIfTier: 'SPECIES_NOSEPASS',
                breedTier: 'perfect',
                ...getBossPreset('ROXANNE')[2],
                type: [gymMainTypes[0]],
            },
            {
                ...getBossPreset('ROXANNE')[3],
                type: [gymMainTypes[0]],
            },
            {
                ...getBossPreset('ROXANNE')[4],
                type: [gymMainTypes[0]],
            },
            {
                ...getBossPreset('ROXANNE')[5],
                type: [gymMainTypes[0]],
            },
        ],
    },
    // Route 116
    {
        id: 'TRAINER_JOSE',
        location: 'Route 116',
        level: 15,
        class: 'Bug Catcher',
        reward: ['SPECIES_DITTO'],
        bag: [...getSampleItemsFromArray(roxanneBag(), 4)],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DITTO'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_PU, 5),
        ],
    },
    {
        id: 'TRAINER_JOEY',
        location: 'Route 116',
        class: 'Youngster',
        reward: ['Nugget'],
        level: 15,
        bag: [...getSampleItemsFromArray(roxanneBag(), 4)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 5),
        ],
    },
    {
        id: 'TRAINER_JOHNSON',
        location: 'Route 116',
        class: 'Rich Boy',
        reward: [...route116BallItems],
        level: 15,
        bag: [...getSampleItemsFromArray(roxanneBag(), 3), sample([...route116BallItems])],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 5),
        ],
    },
    {
        id: 'TRAINER_DEVAN',
        location: 'Route 116',
        class: 'Hiker',
        reward: [route116XSpecialItem],
        level: 15,
        bag: [...getSampleItemsFromArray(roxanneBag(), 3), route116XSpecialItem],
        team: [
            {
                ...POKEDEF_NU,
                type: [POKEMON_TYPE_POISON],
                item: route116XSpecialItem,
            },
            ...generatePokemonsWithDefinition(POKEDEF_PU, 5),
        ],
    },
    {
        id: 'TRAINER_CLARK',
        location: 'Route 116',
        class: 'Pokemaniac',
        reward: [...choice116PickTMs],
        bag: [...getSampleItemsFromArray(roxanneBag(), 3), ...choice116PickTMs],
        level: 15,
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 5),
        ],
    },
    // Rusturf Tunnel
    {
        id: 'TRAINER_GRUNT_RUSTURF_TUNNEL',
        location: 'Rusturf Tunnel',
        level: 15,
        class: 'Magma Grunt F',
        isBoss: true,
        bag: [...rusturfGruntBag()],
        team: [
            {
                ...getBossPreset('RUSTURF_GRUNT')[0],
                type: [magmaTeamTypes[0]],
            },
            {
                ...getBossPreset('RUSTURF_GRUNT')[1],
                type: [magmaTeamTypes[1]],
            },
            {
                ...getBossPreset('RUSTURF_GRUNT')[2],
                type: [magmaTeamTypes[2]],
            },
            {
                ...getBossPreset('RUSTURF_GRUNT')[3],
                type: [magmaTeamTypes[3]],
            },
            {
                ...getBossPreset('RUSTURF_GRUNT')[4],
                exactTypes: [magmaTeamTypes[0], magmaTeamTypes[1]],
                fallback: [
                    {
                        ...getBossPreset('RUSTURF_GRUNT')[4],
                        type: [magmaTeamTypes[0], magmaTeamTypes[1]],
                    }
                ]
            },
            {
                ...getBossPreset('RUSTURF_GRUNT')[5],
                type: [magmaTeamTypes[4]],
            },
        ],
    },
    // Route 116 again
    {
        id: 'TRAINER_JANICE',
        location: 'Route 116',
        class: 'Lass',
        reward: ['SPECIES_SENTRET'],
        level: 17,
        bag: getSampleItemsFromArray(rusturfGruntBag(), 4),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SENTRET'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_PU, 5),
        ],
    },
    {
        id: 'TRAINER_JERRY_1',
        location: 'Route 116',
        class: 'School Kid M',
        reward: ['Flame Orb', 'Toxic Orb'],
        level: 17,
        bag: getSampleItemsFromArray(rusturfGruntBag(), 2),
        team: [
            {
                ...POKEDEF_PU,
                abilities: ['GUTS'],
                item: 'Flame Orb',
                fallback: [
                    {
                        ...POKEDEF_NU,
                    },
                ]
            },
            {
                ...POKEDEF_PU,
                abilities: ['POISON_HEAL'],
                item: 'Toxic Orb',
                fallback: [
                    {
                        ...POKEDEF_NU,
                    },
                ]
            },
            ...generatePokemonsWithDefinition(POKEDEF_PU, 4),
        ],
    },
    {
        id: 'TRAINER_SARAH',
        location: 'Route 116',
        class: 'Lady',
        reward: [...choice116Gem],
        level: 17,
        bag: [...choice116Gem, ...getSampleItemsFromArray(rusturfGruntBag(), 2)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 5),
        ]
    },
    {
        id: 'TRAINER_KAREN_1',
        location: 'Route 116',
        class: 'School Kid F',
        reward: [...choice116Berry],
        level: 17,
        bag: [...choice116Berry, ...getSampleItemsFromArray(rusturfGruntBag(), 2)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 5),
        ]
    },
    // Rustboro Rival
    {
        id: 'TRAINER_MAY_RUSTBORO_TREECKO',
        location: 'Rustboro City',
        class: 'May',
        isBoss: true,
        level: 17,
        reward: ['Lum Berry'],
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRustboroBag()],
        team: [...rivalRustboroTemplate('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_RUSTBORO_TORCHIC',
        location: 'Rustboro City',
        class: 'May',
        isBoss: true,
        level: 17,
        reward: ['Lum Berry'],
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRustboroBag()],
        team: [...rivalRustboroTemplate('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_RUSTBORO_MUDKIP',
        location: 'Rustboro City',
        class: 'May',
        isBoss: true,
        level: 17,
        reward: ['Lum Berry'],
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRustboroBag()],
        team: [...rivalRustboroTemplate('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_RUSTBORO_TREECKO',
        location: 'Rustboro City',
        copy: 'TRAINER_MAY_RUSTBORO_TREECKO',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_RUSTBORO_TORCHIC',
        location: 'Rustboro City',
        copy: 'TRAINER_MAY_RUSTBORO_TORCHIC',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_RUSTBORO_MUDKIP',
        location: 'Rustboro City',
        copy: 'TRAINER_MAY_RUSTBORO_MUDKIP',
        class: 'Brendan',
    },
    // Route 106
    {
        id: 'TRAINER_KYLA',
        location: 'Route 106',
        class: 'Tuber F',
        reward: ['SPECIES_MACHOP'],
        level: 19,
        bag: getSampleItemsFromArray(rivalRustboroBag(), 4),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_MACHOP'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_PU, 5),
        ],
    },
    {
        id: 'TRAINER_ELLIOT_1',
        location: 'Route 106',
        class: 'Fisherman',
        reward: ['SPECIES_CHARMANDER'],
        level: 19,
        bag: getSampleItemsFromArray(rivalRustboroBag(), 4),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_CHARMANDER'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_PU, 5),
        ],
    },
    {
        id: 'TRAINER_JOSUE',
        location: 'Route 106',
        class: 'Bird Keeper',
        reward: [...choicesDewfordTMs],
        level: 19,
        bag: [...getSampleItemsFromArray(rivalRustboroBag(), 1), ...choicesDewfordTMs],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 5),
        ]
    },
    {
        id: 'TRAINER_NED',
        location: 'Route 106',
        class: 'Fisherman',
        reward: [route106GoodItem],
        level: 19,
        bag: [route106GoodItem, ...getSampleItemsFromArray(rivalRustboroBag(), 3)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 5),
        ]
    },
    {
        id: 'TRAINER_ANDRES_1',
        location: 'Route 106',
        class: 'Ruin Maniac',
        reward: [...route106BallItems],
        level: 19,
        bag: [...route106BallItems, ...getSampleItemsFromArray(rivalRustboroBag(), 2)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 5),
        ]
    },
    // Dewford Gym
    {
        id: 'TRAINER_BRAWLY_1',
        location: 'Dewford Gym',
        class: 'Leader Brawly',
        level: 19,
        reward: ['GYM_REWARD_2', tmItem(61)],
        isBoss: true,
        bag: brawlyBag(),
        bannedItems: ['Flame Orb', 'Toxic Orb'],
        team: [
            {
                ...getBossPreset('BRAWLY')[0],
                type: [gymMainTypes[1]],
            },
            {
                ...getBossPreset('BRAWLY')[1],
                type: [gymMainTypes[1]],
            },
            {
                ...getBossPreset('BRAWLY')[2],
                type: [gymMainTypes[1]],
            },
            {
                ...getBossPreset('BRAWLY')[3],
                type: [gymMainTypes[1]],
            },
            {
                ...getBossPreset('BRAWLY')[4],
                type: [gymMainTypes[1]],
            },
            gymIsChangedType[1] ? {
                ...getBossPreset('BRAWLY')[5],
                type: [gymMainTypes[1]],
                abilities: ['GUTS'],
                breedTier: 'perfect',
                item: 'Flame Orb',
                fallback: [
                    {
                        ...getBossPreset('BRAWLY')[5],
                        type: [gymMainTypes[1]],
                        abilities: ['POISON_HEAL'],
                        breedTier: 'perfect',
                        item: 'Toxic Orb',
                    },
                    {
                        ...getBossPreset('BRAWLY')[5],
                        breedTier: 'perfect',
                        type: [gymMainTypes[1]],
                    },
                ],
            } : {
                specificIfTier: 'SPECIES_MAKUHITA',
                ...getBossPreset('BRAWLY')[5],
                type: [gymMainTypes[1]],
                nature: NATURES.ADAMANT.name,
                breedTier: 'perfect',
                abilities: ['GUTS'],
                item: 'Flame Orb',
            },
        ],
    },
    // Granite Cave
    {
        id: 'TRAINER_STEVEN',
        location: 'Granite Cave',
        class: 'Steven',
        level: 22,
        isBoss: true,
        reward: [tmItem(19)],
        bag: stevenBag(),
        team: [
            {
                ...getBossPreset('GRANITE_CAVE_STEVEN')[0],
                specificIfTier: 'SPECIES_METANG',
                breedTier: 'perfect',
                type: [POKEMON_TYPE_STEEL],
            },
            {
                ...getBossPreset('GRANITE_CAVE_STEVEN')[1],
                breedTier: 'good',
                type: [POKEMON_TYPE_STEEL],
            },
            {
                ...getBossPreset('GRANITE_CAVE_STEVEN')[2],
                breedTier: 'good',
                type: [POKEMON_TYPE_STEEL],
            },
            {
                oneOf: stevenPokemon,
                breedTier: 'good',
                tryEvolve: true,
            },
            {
                oneOf: stevenPokemon,
                breedTier: 'good',
                tryEvolve: true,
            },
            {
                oneOf: stevenPokemon,
                breedTier: 'good',
                tryEvolve: true,
            },
        ],
    },
    // Route 106
    {
        id: 'TRAINER_LOLA_1',
        location: 'Route 109',
        class: 'Tuber F',
        reward: ['SPECIES_BULBASAUR'],
        level: 24,
        bag: getSampleItemsFromArray(stevenBag(), 5),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_BULBASAUR'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_NU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 2),
        ],
    },
    {
        id: 'TRAINER_EDMOND',
        location: 'Route 109',
        class: 'Sailor',
        reward: ['Nugget'],
        level: 24,
        bag: getSampleItemsFromArray(stevenBag(), 5),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 2),
        ]
    },
    {
        id: 'TRAINER_RICKY_1',
        location: 'Route 109',
        class: 'Tuber M',
        reward: [...choiceRickyTMs],
        level: 24,
        bag: [...choiceRickyTMs, ...getSampleItemsFromArray(stevenBag(), 3)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 2),
        ]
    },
    {
        id: 'TRAINER_HUEY',
        location: 'Route 109',
        class: 'Pokefan M',
        reward: [...choiceHueyTMs],
        level: 24,
        bag: [...choiceHueyTMs, ...getSampleItemsFromArray(stevenBag(), 3)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 2),
        ]
    },
    {
        id: 'TRAINER_HAILEY',
        location: 'Route 109',
        class: 'Tuber F',
        reward: [route109GoodItem],
        level: 24,
        bag: [route109GoodItem, ...getSampleItemsFromArray(stevenBag(), 4)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 2),
        ],
    },
    {
        id: 'TRAINER_CHANDLER',
        location: 'Route 109',
        class: 'Youngster',
        reward: ['Heat Rock', 'Damp Rock', 'Smooth Rock', 'Icy Rock', tmItem(73), tmItem(72), tmItem(74), tmItem(75)],
        level: 24,
        bag: getSampleItemsFromArray(stevenBag(), 3),
        team: [
            pokeDefDrizzleMon(POKEDEF_NU),
            pokeDefDroughtMon(POKEDEF_NU),
            pokeDefSandStreamMon(POKEDEF_NU),
            pokeDefSnowWarningMon(POKEDEF_NU),
            {
                ...POKEDEF_NU,
                abilities: [...rainAbilities, ...sunAbilities, ...sandAbilities, ...snowAbilities],
            },
            {
                specific: 'SPECIES_CASTFORM_NORMAL',
            },
        ],
    },
    {
        id: 'TRAINER_GRUNT_MUSEUM_1',
        location: 'Slateport Museum',
        class: 'Aqua Grunt M',
        isBoss: true,
        reward: ['GYM_REWARD_9'],
        level: 24,
        preventShuffle: true,
        bag: [...slateportGruntsBag()],
        team: [
            pokeDefDrizzleMon(getBossPreset('MUSEUM_GRUNT_1')[0]),
            {
                ...getBossPreset('MUSEUM_GRUNT_1')[1],
                abilities: [...rainAbilities],
            },
            {
                ...getBossPreset('MUSEUM_GRUNT_1')[2],
                abilities: [...rainAbilities],
            },
            pokeDefDrizzleMon(getBossPreset('MUSEUM_GRUNT_1')[3]),
            {
                ...getBossPreset('MUSEUM_GRUNT_1')[4],
                abilities: [...rainAbilities],
            },
            {
                ...getBossPreset('MUSEUM_GRUNT_1')[5],
                abilities: [...rainAbilities],
            },
        ],
    },
    {
        id: 'TRAINER_GRUNT_MUSEUM_2',
        location: 'Slateport Museum',
        class: 'Aqua Grunt M',
        isBoss: true,
        reward: ['GYM_REWARD_9'],
        level: 24,
        preventShuffle: true,
        bag: [...slateportGruntsBag()],
        team: [
            pokeDefSnowWarningMon(getBossPreset('MUSEUM_GRUNT_2')[0]),
            {
                ...getBossPreset('MUSEUM_GRUNT_2')[1],
                abilities: [...snowAbilities],
            },
            {
                ...getBossPreset('MUSEUM_GRUNT_2')[2],
                abilities: [...snowAbilities],
            },
            pokeDefSnowWarningMon(getBossPreset('MUSEUM_GRUNT_2')[3]),
            {
                ...getBossPreset('MUSEUM_GRUNT_2')[4],
                abilities: [...snowAbilities],
            },
            {
                ...getBossPreset('MUSEUM_GRUNT_2')[5],
                abilities: [...snowAbilities],
            },
        ],
    },
    // Route 110
    {
        id: 'TRAINER_ISABEL_1',
        location: 'Route 110',
        class: 'Pokefan F',
        reward: [...choice110TMs],
        level: 26,
        bag: [...choice110TMs, ...getSampleItemsFromArray(slateportGruntsBag(), 4)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 5),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 1),
        ],
    },
    {
        id: 'TRAINER_KALEB',
        location: 'Route 110',
        class: 'Pokefan M',
        reward: [...route110ExtenderBallItems],
        level: 26,
        bag: [...route110ExtenderBallItems, ...getSampleItemsFromArray(slateportGruntsBag(), 5)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 5),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 1),
        ],
    },
    {
        id: 'TRAINER_TIMMY',
        location: 'Route 110',
        class: 'Youngster',
        reward: [route110GoodItem],
        level: 26,
        bag: [route110GoodItem, ...getSampleItemsFromArray(slateportGruntsBag(), 5)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 5),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 1),
        ]
    },
    {
        id: 'TRAINER_EDWARD',
        location: 'Route 110',
        class: 'Psychic M',
        reward: ['SPECIES_ELECTRIKE'],
        level: 26,
        bag: getSampleItemsFromArray(slateportGruntsBag(), 6),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ELECTRIKE'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_NU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 1),
        ],
    },
    {
        id: 'TRAINER_DALE',
        location: 'Route 110',
        class: 'Fisherman',
        reward: ['SPECIES_MANECTRIC'],
        level: 26,
        bag: getSampleItemsFromArray(slateportGruntsBag(), 6),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_MANECTRIC'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_NU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_PU, 1),
        ],
    },
    // Route 110 Again
    {
        id: 'TRAINER_MAY_ROUTE_110_TREECKO',
        location: 'Route 110',
        class: 'May',
        isBoss: true,
        level: 26,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRoute110Bag()],
        team: [...rivalRoute110Template('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_110_TORCHIC',
        location: 'Route 110',
        class: 'May',
        isBoss: true,
        level: 26,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRoute110Bag()],
        team: [...rivalRoute110Template('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_110_MUDKIP',
        location: 'Route 110',
        class: 'May',
        isBoss: true,
        level: 26,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRoute110Bag()],
        team: [...rivalRoute110Template('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_110_TREECKO',
        location: 'Route 110',
        copy: 'TRAINER_MAY_ROUTE_110_TREECKO',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_110_TORCHIC',
        location: 'Route 110',
        copy: 'TRAINER_MAY_ROUTE_110_TORCHIC',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_110_MUDKIP',
        location: 'Route 110',
        copy: 'TRAINER_MAY_ROUTE_110_MUDKIP',
        class: 'Brendan',
    },
    // Route 110 after rival
    {
        id: 'TRAINER_EDWIN_1',
        location: 'Route 110',
        class: 'Collector',
        reward: [route110LumGoodItem],
        level: 28,
        bag: [route110LumGoodItem, ...getSampleItemsFromArray(rivalRoute110Bag(), 6)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 6),
        ],
    },
    {
        id: 'TRAINER_JOSEPH',
        location: 'Route 110',
        class: 'Guitarist',
        reward: [...choiceJosephSeeds],
        bag: [...getSampleItemsFromArray(rivalRoute110Bag(), 3)],
        level: 28,
        team: [
            pokeDefPsychicSurgeMon(POKEDEF_NU, 'Psychic Seed'),
            pokeDefMistySurgeMon(POKEDEF_NU, 'Misty Seed'),
            pokeDefElectricSurgeMon(POKEDEF_NU, 'Electric Seed'),
            pokeDefGrassySurgeMon(POKEDEF_NU, 'Grassy Seed'),
            {
                ...POKEDEF_NU,
                type: [POKEMON_TYPE_PSYCHIC, POKEMON_TYPE_FAIRY, POKEMON_TYPE_ELECTRIC, POKEMON_TYPE_GRASS],
            },
            {
                ...POKEDEF_NU,
                type: [POKEMON_TYPE_PSYCHIC, POKEMON_TYPE_FAIRY, POKEMON_TYPE_ELECTRIC, POKEMON_TYPE_GRASS],
            },
        ],
    },
    // Route 118
    {
        id: 'TRAINER_DALTON_1',
        location: 'Route 118',
        class: 'Guitarist',
        reward: ['SPECIES_CARVANHA'],
        level: 28,
        bag: getSampleItemsFromArray(rivalRoute110Bag(), 7),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_CARVANHA'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_NU, 5),
        ],
    },
    {
        id: 'TRAINER_DEANDRE',
        location: 'Route 118',
        class: 'Youngster',
        reward: [...choiceDeandreTMs],
        level: 28,
        bag: [...choiceDeandreTMs, ...getSampleItemsFromArray(rivalRoute110Bag(), 4)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_NU, 6),
        ],
    },
    // Wally
    {
        id: 'TRAINER_WALLY_MAUVILLE',
        location: 'Route 110',
        class: 'Wally',
        isBoss: true,
        breedTier: 'good',
        level: 28,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...wallyBag()],
        team: [
            {
                id: 'WALLY_1',
                megaTier: [TIER_OU, TIER_UBERS],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                checkValidEvo: true,
            },
            {
                id: 'WALLY_2',
                evolutionTier: [TIER_OU],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                checkValidEvo: true,
            },
            {
                id: 'WALLY_3',
                evolutionTier: [TIER_OU],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                checkValidEvo: true,
            },
            {
                id: 'WALLY_4',
                evolutionTier: [TIER_OU],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                checkValidEvo: true,
            },
            {
                id: 'WALLY_5',
                evolutionTier: [TIER_UU],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                checkValidEvo: true,
            },
            {
                id: 'WALLY_6',
                evolutionTier: [TIER_UU],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                checkValidEvo: true,
            },
        ],
    },
    // Route 117
    {
        id: 'TRAINER_BRANDI',
        location: 'Route 117',
        class: 'Psychic F',
        reward: ['SPECIES_ODDISH'],
        level: 29,
        bag: getSampleItemsFromArray(wallyBag(), 8),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ODDISH'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_NU, 5),
        ],
    },
    {
        id: 'TRAINER_ISAAC_1',
        location: 'Route 117',
        class: 'Pokemon Breeder M',
        reward: ['SPECIES_GLOOM'],
        level: 29,
        bag: getSampleItemsFromArray(wallyBag(), 8),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_GLOOM'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_NU, 5),
        ],
    },
    {
        id: 'TRAINER_HECTOR',
        location: 'Route 115',
        class: 'Expert M',
        reward: [...choiceHectorTMs, 'Light Clay'],
        level: 29,
        bag: [...getSampleItemsFromArray(wallyBag(), 5)],
        team: [
            {
                ...POKEDEF_RU,
                mustHaveOneOfMoves: ['MOVE_REFLECT'],
                tryToHaveMove: ['MOVE_REFLECT'],
                item: 'Light Clay',
            },
            {
                ...POKEDEF_RU,
                mustHaveOneOfMoves: ['MOVE_LIGHT_SCREEN'],
                tryToHaveMove: ['MOVE_LIGHT_SCREEN'],
                item: 'Light Clay',
            },
            ...generatePokemonsWithDefinition(POKEDEF_NU, 4),
        ],
    },
    {
        id: 'TRAINER_MELINA',
        location: 'Route 117',
        class: 'Running Triathlete F',
        reward: [...choiceMelinaBerries],
        level: 29,
        bag: [...choiceMelinaBerries, ...getSampleItemsFromArray(wallyBag(), 6)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 5),
        ],
    },
    {
        id: 'TRAINER_AISHA',
        location: 'Route 117',
        class: 'Battle Girl',
        reward: [...choiceAishaGems],
        level: 29,
        bag: [...choiceAishaGems, ...getSampleItemsFromArray(wallyBag(), 6)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 5),
        ],
    },
    {
        id: 'TRAINER_MARIA_1',
        location: 'Route 117',
        class: 'Expert F',
        reward: [route117GoodItem],
        level: 29,
        bag: [route117GoodItem, ...getSampleItemsFromArray(wallyBag(), 7)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 5),
        ],
    },
    {
        id: 'TRAINER_LYDIA_1',
        location: 'Route 117',
        class: 'Pokemon Breeder F',
        reward: [...route117PlateItems],
        level: 29,
        bag: [...route117PlateItems, ...getSampleItemsFromArray(wallyBag(), 4)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 5),
        ]
    },
    {
        id: 'TRAINER_DEREK',
        location: 'Route 117',
        class: 'Bug Maniac',
        reward: ['Nugget'],
        level: 29,
        bag: getSampleItemsFromArray(wallyBag(), 8),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 5),
        ]
    },
    // Mauville Gym
    {
        id: 'TRAINER_WATTSON_1',
        location: 'Mauville Gym',
        class: 'Leader Wattson',
        isBoss: true,
        reward: ['GYM_REWARD_3', tmItem(11)],
        level: 29,
        preventShuffle: gymIsChangedType[2],
        bag: [...wattsonBag()],
        bannedItems: ['Electric Seed', 'Psychic Seed', 'Misty Seed', 'Grassy Seed'],
        team: [
            gymIsChangedType[2] ? {
                ...getBossPreset('WATTSON')[0],
                type: [gymMainTypes[2]],
            } : pokeDefElectricSurgeMon(getBossPreset('WATTSON')[0]),
            gymIsChangedType[2] ? {
                ...POKEDEF_UU_OU_MEGA,
                breedTier: 'perfect',
                type: [gymMainTypes[2]],
            } : {
                specificIfTier: 'SPECIES_MANECTRIC_MEGA',
                ...POKEDEF_UU_OU_MEGA,
                breedTier: 'perfect',
                type: [gymMainTypes[2]],
            },
            gymIsChangedType[2] ? {
                ...getBossPreset('WATTSON')[2],
                type: [gymMainTypes[2]],
            } : {
                ...getBossPreset('WATTSON')[2],
                type: [gymMainTypes[2]],
                item: 'Electric Seed',
            },
            {
                ...getBossPreset('WATTSON')[3],
                type: [gymMainTypes[2]],
            },
            {
                ...getBossPreset('WATTSON')[4],
                type: [gymMainTypes[2]],
            },
            {
                ...getBossPreset('WATTSON')[5],
                type: [gymMainTypes[2]],
            },
        ],
    },
    // Route 111
    {
        id: 'TRAINER_HAYDEN',
        location: 'Route 111',
        class: 'Kindler',
        reward: ['SPECIES_DROWZEE'],
        level: 32,
        bag: getSampleItemsFromArray(wattsonBag(), 10),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DROWZEE'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_RU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 2),
        ],
    },
    {
        id: 'TRAINER_TYRON',
        location: 'Route 111',
        class: 'Camper',
        reward: ['ITEM_MEGA_01'],
        level: 32,
        bag: getSampleItemsFromArray(wattsonBag(), 9),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_01',
            },
            ...generatePokemonsWithDefinition(POKEDEF_RU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 2),
        ],
    },
    {
        id: 'TRAINER_IRENE',
        location: 'Route 111',
        class: 'Picnicker',
        reward: [...route111BallAItems],
        level: 32,
        bag: [...route111BallAItems, ...getSampleItemsFromArray(wattsonBag(), 8)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 2),
        ]
    },
    {
        id: 'TRAINER_TRAVIS',
        location: 'Route 111',
        class: 'Pokemon Breeder M',
        reward: [route111HpUpGoodItem],
        level: 32,
        bag: [route111HpUpGoodItem, ...getSampleItemsFromArray(wattsonBag(), 8)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 2),
        ]
    },
    // Route 112
    {
        id: 'TRAINER_BRYANT',
        location: 'Route 112',
        class: 'Kindler',
        reward: ['SPECIES_NUMEL'],
        level: 32,
        bag: getSampleItemsFromArray(wattsonBag(), 10),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_NUMEL'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_RU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 2),
        ],
    },
    {
        id: 'TRAINER_LARRY',
        location: 'Route 112',
        class: 'Fisherman',
        reward: ['SPECIES_TAILLOW'],
        level: 32,
        bag: getSampleItemsFromArray(wattsonBag(), 10),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_TAILLOW'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_RU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 2),
        ],
    },
    {
        id: 'TRAINER_CAROL',
        location: 'Route 112',
        class: 'Cycling Triathlete F',
        reward: [...choiceCarolTMs],
        level: 32,
        bag: [...choiceCarolTMs, ...getSampleItemsFromArray(wattsonBag(), 7)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 2),
        ],
    },
    {
        id: 'TRAINER_BRICE',
        location: 'Route 112',
        class: 'Hiker',
        reward: [...choiceBriceTMs],
        level: 32,
        bag: [...choiceBriceTMs, ...getSampleItemsFromArray(wattsonBag(), 7)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 2),
        ]
    },
    {
        id: 'TRAINER_TABITHA_MT_CHIMNEY',
        location: 'Mt. Chimney',
        class: 'Magma Admin',
        isBoss: true,
        level: 32,
        preventShuffle: true,
        bag: [...magmaChimneyBag()],
        team: [
            pokeDefSandStreamMon(getBossPreset('TABITHA_CHIMNEY')[0]),
            {
                ...getBossPreset('TABITHA_CHIMNEY')[1],
                abilities: [...sandAbilities],
            },
            {
                ...getBossPreset('TABITHA_CHIMNEY')[2],
                abilities: [...sandAbilities],
            },
            pokeDefSandStreamMon(getBossPreset('TABITHA_CHIMNEY')[3]),
            {
                ...getBossPreset('TABITHA_CHIMNEY')[4],
                abilities: [...sandAbilities],
            },
            {
                ...getBossPreset('TABITHA_CHIMNEY')[5],
                abilities: [...sandAbilities],
            },
        ],
    },
    {
        id: 'TRAINER_MAXIE_MT_CHIMNEY',
        location: 'Mt. Chimney',
        class: 'Magma Leader Maxie',
        isBoss: true,
        reward: ['Good Rod'],
        level: 33,
        preventShuffle: true,
        bag: [...magmaChimneyBag()],
        team: [
            pokeDefDroughtMon(getBossPreset('MAXIE_CHIMNEY')[0]),
            {
                id: 'MAXIE_MEGA',
                specificIfTier: 'SPECIES_CAMERUPT_MEGA',
                ...POKEDEF_UU_OU_MEGA,
                breedTier: 'perfect',
            },
            {
                ...getBossPreset('MAXIE_CHIMNEY')[2],
                abilities: [...sunAbilities],
                type: [magmaTeamTypes[0], magmaTeamTypes[1]],
                fallback: [
                    {
                        ...POKEDEF_RU,
                        type: [magmaTeamTypes[0], magmaTeamTypes[1]],
                    },
                    {
                        ...POKEDEF_RU,
                        type: [...magmaTeamTypes],
                        abilities: [...sunAbilities],
                    },
                    {
                        ...POKEDEF_RU,
                        type: [...magmaTeamTypes],
                    }
                ],
            },
            pokeDefDroughtMon(getBossPreset('MAXIE_CHIMNEY')[3]),
            {
                ...getBossPreset('MAXIE_CHIMNEY')[4],
                abilities: [...sunAbilities],
                fallback: [
                    {
                        ...POKEDEF_RU,
                        type: [...magmaTeamTypes],
                    }
                ],
            },
            {
                ...getBossPreset('MAXIE_CHIMNEY')[5],
                type: [magmaTeamTypes[0], magmaTeamTypes[1]],
            },
        ],
    },
    // Jagged Pass
    {
        id: 'TRAINER_ERIC',
        location: 'Jagged Pass',
        class: 'Hiker',
        reward: ['SPECIES_NOIBAT'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 10),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_NOIBAT'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_RU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
        ],
    },
    {
        id: 'TRAINER_JULIO',
        location: 'Jagged Pass',
        class: 'Cycling Triathlete M',
        reward: ['SPECIES_NOIVERN', 'SPECIES_WOOBAT'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 10),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_NOIVERN'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WOOBAT'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_RU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
        ],
    },
    {
        id: 'TRAINER_AUTUMN',
        location: 'Jagged Pass',
        class: 'Picnicker',
        reward: ['ITEM_MEGA_02'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 10),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_02',
            },
            ...generatePokemonsWithDefinition(POKEDEF_RU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
        ],
    },
    // Route 113
    {
        id: 'TRAINER_LAWRENCE',
        location: 'Route 113',
        class: 'Camper',
        reward: ['SPECIES_SPINDA'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 10),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SPINDA'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_RU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
        ],
    },
    {
        id: 'TRAINER_JAYLEN',
        location: 'Route 113',
        class: 'Youngster',
        reward: ['SPECIES_BIDOOF', 'SPECIES_BIBAREL'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 10),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_BIDOOF'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_BIBAREL'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_RU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
        ],
    },
    // Route 114
    {
        id: 'TRAINER_STEVE_1',
        location: 'Route 114',
        class: 'Pokemaniac',
        reward: ['SPECIES_SWABLU'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 11),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SWABLU'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_RU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
        ],
    },
    {
        id: 'TRAINER_CLAUDE',
        location: 'Route 114',
        class: 'Fisherman',
        reward: ['SPECIES_ALTARIA', 'SPECIES_SPOINK'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 11),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ALTARIA'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SPOINK'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_RU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
        ],
    },
    {
        id: 'TRAINER_WILTON_1',
        location: 'Route 114',
        class: 'Cooltrainer M',
        reward: [...choiceWiltonTMs],
        level: 36,
        bag: [...choiceWiltonTMs, ...getSampleItemsFromArray(magmaChimneyBag(), 9)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 5),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
        ],
    },
    {
        id: 'TRAINER_SHAYLA',
        location: 'Route 114',
        class: 'Aroma Lady',
        reward: ['Nugget'],
        level: 36,
        bag: ['Nugget', ...getSampleItemsFromArray(magmaChimneyBag(), 10)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 5),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
        ],
    },
    {
        id: 'TRAINER_CHARLOTTE',
        location: 'Route 114',
        class: 'Picnicker',
        reward: [...choiceCharlotteTMs],
        level: 36,
        bag: [...choiceCharlotteTMs, ...getSampleItemsFromArray(magmaChimneyBag(), 9)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 5),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
        ],
    },
    {
        id: 'TRAINER_NOLAN',
        location: 'Route 114',
        class: 'Youngster',
        reward: [...choiceNolanTMs],
        level: 36,
        bag: [...choiceNolanTMs, ...getSampleItemsFromArray(magmaChimneyBag(), 9)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 5),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
        ]
    },
    {
        id: 'TRAINER_ANGELINA',
        location: 'Route 114',
        class: 'Battle Girl',
        reward: [...choiceAngelinaTMs],
        level: 36,
        bag: [...choiceAngelinaTMs, ...getSampleItemsFromArray(magmaChimneyBag(), 9)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 5),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
        ]
    },
    {
        id: 'TRAINER_WYATT',
        location: 'Route 113',
        class: 'Pokemaniac',
        reward: [route114WyattGoodItem],
        level: 36,
        bag: [route114WyattGoodItem, ...getSampleItemsFromArray(magmaChimneyBag(), 10)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_RU, 5),
            ...generatePokemonsWithDefinition(POKEDEF_NU, 1),
        ]
    },
    // Flannery Gym
    {
        id: 'TRAINER_FLANNERY_1',
        location: 'Lavaridge Gym',
        class: 'Leader Flannery',
        level: 36,
        reward: ['GYM_REWARD_4', 'Access to Desert Ruins', tmItem(78)],
        isBoss: true,
        bag: flanneryBag(),
        team: [
            gymIsChangedType[3] ? {
                ...getBossPreset('FLANNERY')[0],
                breedTier: 'perfect',
                type: [gymMainTypes[3]],
            } : {
                specificIfTier: 'SPECIES_TORKOAL',
                ...getBossPreset('FLANNERY')[0],
                type: [gymMainTypes[3]],
                abilities: ['DROUGHT'],
                breedTier: 'perfect',
                item: 'Heat Rock',
                tryEvolve: true,
            },
            {
                ...POKEDEF_UU_OU_MEGA,
                type: [gymMainTypes[3]],
            },
            {
                ...getBossPreset('FLANNERY')[2],
                type: [gymMainTypes[3]],
            },
            {
                ...getBossPreset('FLANNERY')[3],
                type: [gymMainTypes[3]],
            },
            gymIsChangedType[3] ? {
                ...getBossPreset('FLANNERY')[4],
                type: [gymMainTypes[3]],
            } : {
                ...getBossPreset('FLANNERY')[4],
                type: [gymMainTypes[3]],
                abilities: [...sunAbilities],
            },
            {
                ...getBossPreset('FLANNERY')[5],
                type: [gymMainTypes[3]],
            },
        ],
    },
    // Route 111
    {
        id: 'TRAINER_CELIA',
        location: 'Route 111',
        class: 'Lass',
        reward: ['SPECIES_TRAPINCH'],
        level: 39,
        bag: getSampleItemsFromArray(flanneryBag(), 13),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_TRAPINCH'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_RU, 5),
        ],
    },
    {
        id: 'TRAINER_BRANDEN',
        location: 'Route 111',
        class: 'Expert M',
        reward: ['Strong Pokemon'],
        level: 39,
        bag: getSampleItemsFromArray(flanneryBag(), 13),
        team: genericTrainerTeamPostNorman(),
    },
    {
        id: 'TRAINER_CELINA',
        location: 'Route 111',
        class: 'Aroma Lady',
        reward: ['ITEM_MEGA_03'],
        level: 39,
        bag: getSampleItemsFromArray(flanneryBag(), 12),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_03',
            },
            ...generatePokemonsWithDefinition(POKEDEF_UU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_RU, 4),
        ],
    },
    {
        id: 'TRAINER_BEAU',
        location: 'Route 111',
        class: 'Camper',
        reward: ['Master Ball'],
        level: 39,
        bag: getSampleItemsFromArray(flanneryBag(), 13),
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_DREW',
        location: 'Route 111',
        class: 'Guitarist',
        reward: [...route111BerryItems],
        level: 39,
        bag: [...route111BerryItems, ...getSampleItemsFromArray(flanneryBag(), 12)],
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_DUSTY_1',
        location: 'Route 111',
        class: 'Ruin Maniac',
        reward: [...route111BallCItems],
        level: 39,
        bag: [...route111BallCItems, ...getSampleItemsFromArray(flanneryBag(), 13)],
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_NOB_1',
        location: 'Route 111',
        class: 'Black Belt',
        reward: [...choiceNobTMs],
        level: 39,
        bag: [...choiceNobTMs, ...getSampleItemsFromArray(flanneryBag(), 11)],
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_BECKY',
        location: 'Route 111',
        class: 'Picnicker',
        reward: ['Nugget'],
        level: 39,
        bag: getSampleItemsFromArray(flanneryBag(), 12),
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_BRYAN',
        location: 'Route 111',
        class: 'Youngster',
        reward: [...choiceBryanTMs],
        level: 39,
        bag: [...choiceBryanTMs, ...getSampleItemsFromArray(flanneryBag(), 11)],
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_HEIDI',
        location: 'Route 111',
        class: 'Battle Girl',
        reward: [...choiceHeidiItems],
        level: 39,
        bag: [...choiceHeidiItems, ...getSampleItemsFromArray(flanneryBag(), 13)],
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_NORMAN_1',
        location: 'Petalburg Gym',
        class: 'Leader Norman',
        level: 39,
        isBoss: true,
        reward: ['GYM_REWARD_5', 'Access to Island Cave', 'Access to New Mauville', tmItem(31)],
        bag: normanBag(),
        bannedItems: gymIsChangedType[4] ? [] : ['Assault Vest', 'Flame Orb', 'Toxic Orb'],
        team: [
            {
                ...getBossPreset('NORMAN')[0],
                type: [gymMainTypes[4]],
            },
            gymIsChangedType[4] ? {
                ...getBossPreset('NORMAN')[1],
                breedTier: 'perfect',
                type: [gymMainTypes[4]],
            } : {
                specificIfTier: 'SPECIES_SLAKING',
                ...getBossPreset('NORMAN')[1],
                breedTier: 'perfect',
                type: [gymMainTypes[4]],
            },
            {
                ...getBossPreset('NORMAN')[2],
                type: [gymMainTypes[4]],
            },
            {
                ...getBossPreset('NORMAN')[3],
                type: [gymMainTypes[4]],
            },
            {
                ...getBossPreset('NORMAN')[4],
                type: [gymMainTypes[4]],
            },
            {
                ...POKEDEF_UU_OU_MEGA,
                type: [gymMainTypes[4]],
                fallback: [
                   {
                        isMega: true,
                        contextualTier: [TIER_UU, TIER_OU, TIER_UBERS],
                        type: [gymMainTypes[4]],
                        checkValidEvo: true,
                        tryEvolve: true,
                   },
                   {
                        contextualTier: [TIER_OU],
                        type: [gymMainTypes[4]],
                        checkValidEvo: true,
                   },
                   {
                        contextualTier: [TIER_UU],
                        type: [gymMainTypes[4]],
                        checkValidEvo: true,
                   }
                ]
            },
        ],
    },
    // Route 105 (Island Cave)
    {
        id: 'TRAINER_FOSTER',
        location: 'Route 105',
        class: 'Ruin Maniac',
        reward: ['Strong Pokemon'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericTrainerTeamPostNorman(),
    },
    {
        id: 'TRAINER_IMANI',
        location: 'Route 105',
        class: 'Tuber F',
        reward: ['Master Ball'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericTrainerTeamPostNorman(),
    },
    // Route 110 (New Mauville)
    {
        id: 'TRAINER_ABIGAIL_1',
        location: 'Route 110',
        class: 'Cycling Triathlete F',
        reward: ['Strong Pokemon'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericTrainerTeamPostNorman(),
    },
    {
        id: 'TRAINER_JACLYN',
        location: 'Route 110',
        class: 'Psychic F',
        reward: ['Master Ball'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericTrainerTeamPostNorman(),
    },
    // Route 118
    {
        id: 'TRAINER_PERRY',
        location: 'Route 118',
        class: 'Bird Keeper',
        reward: ['SPECIES_DEDENNE'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DEDENNE'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_UU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_RU, 3),
            { ...POKEDEF_UU_OU_MEGA },
        ],
    },
    {
        id: 'TRAINER_CHRIS',
        location: 'Route 118',
        class: 'Fisherman',
        reward: ['ITEM_MEGA_04'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 14),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_04',
            },
            ...generatePokemonsWithDefinition(POKEDEF_UU, 2),
            ...generatePokemonsWithDefinition(POKEDEF_RU, 3),
        ],
    },
    {
        id: 'TRAINER_WADE',
        location: 'Route 118',
        class: 'Camper',
        reward: [...choiceWadeBerries],
        level: 42,
        bag: [...choiceWadeBerries, ...getSampleItemsFromArray(normanBag(), 14)],
        team: genericTrainerTeamPostNorman(),
    },
    {
        id: 'TRAINER_BARNY',
        location: 'Route 118',
        class: 'Pokemon Breeder M',
        reward: [route118BarnyGoodItem],
        level: 42,
        bag: [route118BarnyGoodItem, ...getSampleItemsFromArray(normanBag(), 14)],
        team: genericTrainerTeamPostNorman(),
    },
    {
        id: 'TRAINER_ROSE_1',
        location: 'Route 118',
        class: 'Aroma Lady',
        reward: [...choiceRoseTMs],
        level: 42,
        bag: [...choiceRoseTMs, ...getSampleItemsFromArray(normanBag(), 13)],
        team: genericTrainerTeamPostNorman(),
    },
    {
        id: 'TRAINER_CHESTER',
        location: 'Route 118',
        class: 'Black Belt',
        reward: [...choiceChesterTMs],
        level: 42,
        bag: [...choiceChesterTMs, ...getSampleItemsFromArray(normanBag(), 13)],
        team: genericTrainerTeamPostNorman(),
    },
    // Route 119
    {
        id: 'TRAINER_KENT',
        location: 'Route 119',
        class: 'Bug Catcher',
        reward: ['SPECIES_LINOONE'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_LINOONE'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_UU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_RU, 3),
            { ...POKEDEF_UU_OU_MEGA },
        ],
    },
    {
        id: 'TRAINER_BRENT',
        location: 'Route 119',
        class: 'Bug Maniac',
        reward: ['SPECIES_SERVINE', 'SPECIES_SNIVY'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SERVINE'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SNIVY'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SERPERIOR'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_RU, 2),
            { ...POKEDEF_UU_OU_MEGA },
        ],
    },
    // Weather Institute
    {
        id: 'TRAINER_SHELLY_WEATHER_INSTITUTE',
        location: 'Weather Institute',
        class: 'Aqua Admin F',
        level: 42,
        reward: ['GYM_REWARD_10'],
        isBoss: true,
        bag: [...shellyBag()],
        team: [
            {
                ...getBossPreset('SHELLY_WEATHER')[0],
                type: [aquaTeamTypes[0]],
            },
            {
                ...getBossPreset('SHELLY_WEATHER')[1],
                type: [aquaTeamTypes[1]],
            },
            {
                ...getBossPreset('SHELLY_WEATHER')[2],
                type: [aquaTeamTypes[2]],
            },
            {
                ...getBossPreset('SHELLY_WEATHER')[3],
                type: [aquaTeamTypes[3]],
            },
            {
                ...getBossPreset('SHELLY_WEATHER')[4],
                type: [aquaTeamTypes[4]],
            },
            {
                isMega: true,
                contextualTier: [TIER_UU, TIER_OU],
                checkValidEvo: true,
                tryEvolve: true,
                type: [...aquaTeamTypes],
            },
        ],
    },
    // Route 119 Rival Battles
    {
        id: 'TRAINER_MAY_ROUTE_119_TREECKO',
        location: 'Route 119',
        class: 'May',
        isBoss: true,
        level: 44,
        reward: ['Leftovers'],
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rival119Bag()],
        team: [...rivalRoute119Template('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_119_TORCHIC',
        location: 'Route 119',
        class: 'May',
        isBoss: true,
        level: 44,
        reward: ['Leftovers'],
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rival119Bag()],
        team: [...rivalRoute119Template('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_119_MUDKIP',
        location: 'Route 119',
        class: 'May',
        isBoss: true,
        level: 44,
        reward: ['Leftovers'],
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rival119Bag()],
        team: [...rivalRoute119Template('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_119_TREECKO',
        location: 'Route 119',
        copy: 'TRAINER_MAY_ROUTE_119_TREECKO',
        class: 'May',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_119_TORCHIC',
        location: 'Route 119',
        copy: 'TRAINER_MAY_ROUTE_119_TORCHIC',
        class: 'May',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_119_MUDKIP',
        location: 'Route 119',
        copy: 'TRAINER_MAY_ROUTE_119_MUDKIP',
        class: 'May',
    },
    // Route 119 continued
    {
        id: 'TRAINER_LEONEL',
        location: 'Route 120',
        class: 'Cooltrainer M',
        reward: ['SPECIES_SANDILE'],
        level: 46,
        bag: getSampleItemsFromArray(rival119Bag(), 17),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SANDILE'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_UU, 2),
            ...generatePokemonsWithDefinition(POKEDEF_RU, 2),
            { ...POKEDEF_UU_OU_MEGA },
        ],
    },
    {
        id: 'TRAINER_COLIN',
        location: 'Route 120',
        class: 'Expert M',
        reward: ['SPECIES_KROKOROK', 'SPECIES_KROOKODILE', 'SPECIES_STUNFISK', 'SPECIES_RIBOMBEE', 'SPECIES_DUSKULL', 'SPECIES_DUSCLOPS', 'SPECIES_DUSKNOIR'],
        level: 46,
        bag: getSampleItemsFromArray(rival119Bag(), 17),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_RIBOMBEE'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DUSKULL'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DUSCLOPS'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DUSKNOIR'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_KROKOROK', 'SPECIES_KROOKODILE', 'SPECIES_STUNFISK'],
                pickBest: true,
                tryEvolve: true,
            },
            {
                isMega: true,
                contextualTier: [TIER_UU, TIER_OU],
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_ROBERT_1',
        location: 'Route 120',
        class: 'Bird Keeper',
        reward: ['ITEM_MEGA_05'],
        level: 46,
        bag: getSampleItemsFromArray(rival119Bag(), 16),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_05',
            },
            ...generatePokemonsWithDefinition(POKEDEF_UU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_RU, 2),
        ],
    },
    {
        id: 'TRAINER_CLARISSA',
        location: 'Route 120',
        class: 'Aroma Lady',
        reward: [...choiceClarissaTMs],
        level: 46,
        bag: [...choiceClarissaTMs, ...getSampleItemsFromArray(rival119Bag(), 15)],
        team: genericTrainerTeamPostShelly(),
    },
    {
        id: 'TRAINER_ANGELICA',
        location: 'Route 120',
        class: 'Parasol Lady',
        reward: [route120AngelicaGoodItem],
        level: 46,
        bag: [route120AngelicaGoodItem, ...getSampleItemsFromArray(rival119Bag(), 16)],
        team: genericTrainerTeamPostShelly(),
    },
    {
        id: 'TRAINER_JACKSON_1',
        location: 'Route 120',
        class: 'Pokemon Ranger M',
        reward: ['Nugget'],
        level: 46,
        bag: ['Nugget', ...getSampleItemsFromArray(rival119Bag(), 16)],
        team: genericTrainerTeamPostShelly(),
    },
    // Fortree City Gym
    {
        id: 'TRAINER_WINONA_1',
        location: 'Fortree Gym',
        class: 'Leader Winona',
        level: 46,
        isBoss: true,
        reward: ['GYM_REWARD_6', 'Access to Ancient Tomb', tmItem(32)],
        bag: [...winonaBag(), 'Flying Gem'],
        team: [
            {
                ...getBossPreset('WINONA')[0],
                type: [gymMainTypes[5]],
                mustHaveOneOfMoves: ['MOVE_TAILWIND'],
                tryToHaveMove: ['MOVE_TAILWIND'],
                fallback: [
                    {
                        ...getBossPreset('WINONA')[0],
                        type: [gymMainTypes[5]],
                    },
                ]
            },
            gymIsChangedType[5] ? {
                ...POKEDEF_UU_OU_MEGA,
                breedTier: 'perfect',
                type: [gymMainTypes[5]],
            } : {
                specificIfTier: 'SPECIES_ALTARIA_MEGA',
                ...POKEDEF_UU_OU_MEGA,
                breedTier: 'perfect',
                type: [gymMainTypes[5]],
            },
            {
                ...getBossPreset('WINONA')[2],
                type: [gymMainTypes[5]],
            },
            {
                ...getBossPreset('WINONA')[3],
                type: [gymMainTypes[5]],
            },
            {
                ...getBossPreset('WINONA')[4],
                type: [gymMainTypes[5]],
            },
            {
                ...getBossPreset('WINONA')[5],
                type: [gymMainTypes[5]],
            },
        ],
    },
    // Route 120 After Gym
    {
        id: 'TRAINER_JEFFREY_1',
        location: 'Route 120',
        class: 'Bug Maniac',
        reward: ['Master Ball'],
        level: 49,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: genericTrainerTeamPostWinona(),
    },
    {
        id: 'TRAINER_CHIP',
        location: 'Route 120',
        class: 'Ruin Maniac',
        reward: ['Access to Premium Pokemon'],
        level: 49,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: genericTrainerTeamPostWinona(),
    },
    // Route 121
    {
        id: 'TRAINER_MARCEL',
        location: 'Route 121',
        class: 'Cooltrainer M',
        reward: ['SPECIES_SHUPPET'],
        level: 49,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SHUPPET'],
                tryEvolve: true,
            },
            { ...POKEDEF_UU_OU_MEGA },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 2),
            ...generatePokemonsWithDefinition(POKEDEF_RU, 1),
        ],
    },
    {
        id: 'TRAINER_MYLES',
        location: 'Route 121',
        class: 'Fisherman',
        reward: ['SPECIES_METAPOD', 'SPECIES_HONEDGE', 'SPECIES_BANETTE'],
        level: 49,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_METAPOD'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_HONEDGE'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_BANETTE'],
                tryEvolve: true,
            },
            { ...POKEDEF_UU_OU_MEGA },
            ...generatePokemonsWithDefinition(POKEDEF_UU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_RU, 1),
        ],
    },
    {
        id: 'TRAINER_BIANCA',
        location: 'Route 121',
        class: 'Camper',
        reward: ['ITEM_MEGA_06'],
        level: 49,
        bag: getSampleItemsFromArray(winonaBag(), 17),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_06',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_RU, 1),
        ],
    },
    {
        id: 'TRAINER_CALE',
        location: 'Route 121',
        class: 'Bug Maniac',
        reward: ['Focus Sash'],
        level: 49,
        bag: ['Focus Sash', ...getSampleItemsFromArray(winonaBag(), 17)],
        team: genericTrainerTeamPostWinona(),
    },
    {
        id: 'TRAINER_TAMMY',
        location: 'Route 121',
        class: 'Hex Maniac',
        reward: [...choiceTammyTMs],
        level: 49,
        bag: [...choiceTammyTMs, ...getSampleItemsFromArray(winonaBag(), 16)],
        team: genericTrainerTeamPostWinona(),
    },
    {
        id: 'TRAINER_WALTER_1',
        location: 'Route 121',
        class: 'Gentleman',
        reward: [...choiceWalterTMs],
        level: 49,
        bag: [...choiceWalterTMs, ...getSampleItemsFromArray(winonaBag(), 16)],
        team: genericTrainerTeamPostWinona(),
    },
    {
        id: 'TRAINER_JESSICA_1',
        location: 'Route 121',
        class: 'Beauty',
        reward: [jessicaTM],
        level: 49,
        bag: [jessicaTM, ...getSampleItemsFromArray(winonaBag(), 17)],
        team: genericTrainerTeamPostWinona(),
    },
    {
        id: 'TRAINER_CRISTIN_1',
        location: 'Route 121',
        class: 'Cooltrainer F',
        reward: [...choiceCristinBerries],
        level: 49,
        bag: [...choiceCristinBerries, ...getSampleItemsFromArray(winonaBag(), 17)],
        team: genericTrainerTeamPostWinona(),
    },
    // Lillycove Wally Rival
    {
        id: 'TRAINER_WALLY_LILYCOVE',
        location: 'Route 121',
        class: 'Wally',
        isBoss: true,
        breedTier: 'good',
        reward: ['GYM_REWARD_11'],
        level: 49,
        bag: [...wallyBag2()],
        team: [
            {
                special: TRAINER_REPEAT_ID,
                id: 'WALLY_1',
                tryEvolve: true,
                tryMega: true,
            },
            {
                special: TRAINER_REPEAT_ID,
                id: 'WALLY_2',
                tryEvolve: true,
                tryMega: true,
            },
            {
                special: TRAINER_REPEAT_ID,
                id: 'WALLY_3',
                tryEvolve: true,
                tryMega: true,
            },
            {
                special: TRAINER_REPEAT_ID,
                id: 'WALLY_4',
                tryEvolve: true,
                tryMega: true,
            },
            {
                special: TRAINER_REPEAT_ID,
                id: 'WALLY_5',
                tryEvolve: true,
                tryMega: true,
            },
            {
                special: TRAINER_REPEAT_ID,
                id: 'WALLY_6',
                tryEvolve: true,
                tryMega: true,
            },
        ],
    },
    // Magma Hideout
    {
        id: 'TRAINER_MAXIE_MAGMA_HIDEOUT',
        location: 'Magma Hideout',
        class: 'Magma Leader Maxie',
        isBoss: true,
        level: 51,
        preventShuffle: true,
        bag: [...wallyBag2()],
        team: [
            pokeDefDroughtMon(getBossPreset('MAXIE_MAGMA')[0]),
            {
                special: TRAINER_REPEAT_ID,
                id: 'MAXIE_MEGA',
                tryEvolve: true,
                tryMega: true,
            },
            {
                ...getBossPreset('MAXIE_MAGMA')[2],
                type: [magmaTeamTypes[1]],
                abilities: [...sunAbilities],
            },
            pokeDefDroughtMon(getBossPreset('MAXIE_MAGMA')[3]),
            {
                ...getBossPreset('MAXIE_MAGMA')[4],
                type: [...magmaTeamTypes],
                abilities: [...sunAbilities],
            },
            {
                ...getBossPreset('MAXIE_MAGMA')[5],
                type: [...magmaTeamTypes],
                abilities: [...sunAbilities],
            },
        ],
    },
    // Mt. Pyre
    {
        id: 'TRAINER_TAYLOR',
        location: 'Route 119',
        class: 'Collector',
        reward: ['SPECIES_PORYGON'],
        level: 54,
        bag: getSampleItemsFromArray(wallyBag2(), 20),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_PORYGON'],
                tryEvolve: true,
            },
            { ...POKEDEF_UU_OU_MEGA },
            ...generatePokemonsWithDefinition(POKEDEF_UU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_RU, 1),
        ],
    },
    {
        id: 'TRAINER_MARK',
        location: 'Mt. Pyre',
        class: 'Pokemaniac',
        reward: ['SPECIES_SPINARAK', 'SPECIES_ARIADOS', 'SPECIES_SPIDOPS', 'SPECIES_SPIRITOMB'],
        level: 54,
        bag: getSampleItemsFromArray(wallyBag2(), 20),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SPINARAK'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ARIADOS'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SPIDOPS'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SPIRITOMB'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_UU, 2),
        ],
    },
    {
        id: 'TRAINER_LEAH',
        location: 'Mt. Pyre',
        class: 'Hex Maniac',
        reward: ['ITEM_MEGA_07'],
        level: 54,
        bag: getSampleItemsFromArray(wallyBag2(), 19),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_07',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_RU, 1),
        ],
    },
    // Aqua Hideout
    {
        id: 'TRAINER_MATT',
        location: 'Aqua Hideout',
        class: 'Aqua Admin M',
        isBoss: true,
        level: 54,
        preventShuffle: true,
        bag: [...wallyBag2()],
        team: [
            {
                isMega: true,
                checkValidEvo: true,
                pickBest: true,
                abilities: ['SNOW_WARNING'],
            },
            {
                ...getBossPreset('MATT_AQUA')[1],
                abilities: [...snowAbilities],
            },
            pokeDefSnowWarningMon(getBossPreset('MATT_AQUA')[2]),
            {
                ...getBossPreset('MATT_AQUA')[3],
                abilities: [...snowAbilities],
            },
            {
                ...getBossPreset('MATT_AQUA')[4],
                abilities: [...snowAbilities],
            },
            {
                ...getBossPreset('MATT_AQUA')[5],
                abilities: [...snowAbilities],
            },
        ],
    },
    // Route 124
    {
        id: 'TRAINER_CHAD',
        location: 'Route 124',
        class: 'Sailor',
        reward: ['SPECIES_WO_CHIEN'],
        level: 56,
        bag: getSampleItemsFromArray(wallyBag2(), 20),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WO_CHIEN'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 2),
            ...generatePokemonsWithDefinition(POKEDEF_RU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_MEGA, 1),
        ],
    },
    {
        id: 'TRAINER_LILA_AND_ROY_1',
        location: 'Route 124',
        label: 'Lila',
        class: 'Tuber F',
        reward: ['ITEM_MEGA_08'],
        level: 56,
        bag: getSampleItemsFromArray(wallyBag2(), 19),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_08',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 2),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 2),
            ...generatePokemonsWithDefinition(POKEDEF_RU, 1),
        ],
    },
    {
        id: 'TRAINER_ISABELLA',
        location: 'Route 124',
        class: 'Parasol Lady',
        reward: [...choiceIsabellaItem],
        level: 56,
        bag: [...choiceIsabellaItem, ...getSampleItemsFromArray(wallyBag2(), 17)],
        team: genericTrainerTeamPostMatt(),
    },
    {
        id: 'TRAINER_GRACE',
        location: 'Route 124',
        class: 'Expert F',
        reward: [...choiceGraceTMs],
        level: 56,
        bag: [...choiceGraceTMs, ...getSampleItemsFromArray(wallyBag2(), 17)],
        team: genericTrainerTeamPostMatt(),
    },
    {
        id: 'TRAINER_SPENCER',
        location: 'Route 124',
        class: 'Fisherman',
        reward: [spencerTM],
        level: 56,
        bag: [spencerTM, ...getSampleItemsFromArray(wallyBag2(), 19)],
        team: genericTrainerTeamPostMatt(),
    },
    {
        id: 'TRAINER_ROLAND',
        location: 'Route 124',
        class: 'Expert M',
        reward: [rolandTM],
        level: 56,
        bag: [rolandTM, ...getSampleItemsFromArray(wallyBag2(), 19)],
        team: genericTrainerTeamPostMatt(),
    },
    // Gym Leader - Tate & Liza
    {
        id: 'TRAINER_TATE_AND_LIZA_1',
        location: 'Mossdeep Gym',
        class: 'Leader Tate And Liza',
        level: 56,
        isBoss: true,
        reward: ['GYM_REWARD_7', 'Access to Shoal Cave', tmItem(91)],
        preventShuffle: true,
        bag: [...tateAndLizaBag()],
        bannedItems: gymIsChangedType[6] ? [] : ['Focus Sash', 'Room Service', 'Light Clay'],
        team: [
            gymIsChangedType[6] ? {
                ...getBossPreset('TATE_AND_LIZA')[0],
                type: [gymMainTypes[6]],
            } : {
                ...getBossPreset('TATE_AND_LIZA')[0],
                mustHaveOneOfMoves: ['MOVE_TRICK_ROOM'],
                tryToHaveMove: ['MOVE_TRICK_ROOM'],
                type: [gymMainTypes[6]],
                item: 'Focus Sash',
                pickBest: true,
                fallback: [
                    {
                        ...getBossPreset('TATE_AND_LIZA')[0],
                        checkValidEvo: true,
                        type: [gymMainTypes[6]],
                        item: 'Focus Sash',
                    },
                ]
            },
            gymIsChangedType[6] ? {
                ...getBossPreset('TATE_AND_LIZA')[1],
                breedTier: 'perfect',
                type: [gymMainTypes[6]],
            } : (tateAndLizaUseSolrock ?
            {
                specific: 'SPECIES_SOLROCK',
                tryToHaveMove: ['MOVE_EXPLOSION', 'MOVE_LIGHT_SCREEN', 'MOVE_REFLECT'],
                breedTier: 'perfect',
                item: 'Light Clay',
                nature: 'Relaxed',
            }
            : {
                specific: 'SPECIES_LUNATONE',
                tryToHaveMove: ['MOVE_EXPLOSION', 'MOVE_LIGHT_SCREEN', 'MOVE_REFLECT'],
                breedTier: 'perfect',
                item: 'Light Clay',
                nature: 'Sassy',
            }),
            gymIsChangedType[6] ? {
                ...getBossPreset('TATE_AND_LIZA')[2],
                type: [gymMainTypes[6]],
            } : (tateAndLizaUseSolrock ?
            {
                specificIfTier: 'SPECIES_LUNALA',
                ...POKEDEF_UBERS,
                item: 'Room Service',
                nature: 'Quiet',
                fallback: [
                    {
                        specificIfTier: 'SPECIES_LUNALA',
                        ...POKEDEF_OU,
                        item: 'Room Service',
                        nature: 'Quiet',
                    },
                    {
                        ...POKEDEF_OU,
                        type: [gymMainTypes[6]],
                    }
                ]
            } : {
                specificIfTier: 'SPECIES_SOLGALEO',
                ...POKEDEF_UBERS,
                item: 'Room Service',
                nature: 'Brave',
                fallback: [
                    {
                        specificIfTier: 'SPECIES_SOLGALEO',
                        ...POKEDEF_OU,
                        item: 'Room Service',
                        nature: 'Quiet',
                    },
                    {
                        ...POKEDEF_OU,
                        type: [gymMainTypes[6]],
                    }
                ]
            }),
            gymIsChangedType[6] ? {
                ...POKEDEF_MEGA,
                type: [gymMainTypes[6]],
            } : {
                ...POKEDEF_MEGA,
                hasStat: ['baseSpeed', '<', '50'],
                type: [gymMainTypes[6]],
                fallback: [
                    {
                        ...POKEDEF_MEGA,
                        hasStat: ['baseSpeed', '<', '70'],
                        type: [gymMainTypes[6]],
                    },
                    {
                        ...POKEDEF_MEGA,
                        type: [gymMainTypes[6]],
                    },
                    {
                        ...POKEDEF_OU,
                        type: [gymMainTypes[6]],
                    },
                ]
            },
            gymIsChangedType[6] ? {
                ...getBossPreset('TATE_AND_LIZA')[4],
                type: [gymMainTypes[6]],
            } : {
                ...getBossPreset('TATE_AND_LIZA')[4],
                type: [gymMainTypes[6]],
                hasStat: ['baseSpeed', '<', '50'],
                fallback: [
                    {
                        contextualTier: [TIER_UU],
                        checkValidEvo: true,
                        type: [gymMainTypes[6]],
                        hasStat: ['baseSpeed', '<', '70'],
                    },
                    {
                        contextualTier: [TIER_RU],
                        checkValidEvo: true,
                        type: [gymMainTypes[6]],
                        hasStat: ['baseSpeed', '<', '50'],
                        pickBest: true,
                    },
                    {
                        contextualTier: [TIER_UU],
                        checkValidEvo: true,
                        type: [gymMainTypes[6]],
                    },
                ],
            },
            gymIsChangedType[6] ? {
                ...getBossPreset('TATE_AND_LIZA')[5],
                type: [gymMainTypes[6]],
            } : {
                ...getBossPreset('TATE_AND_LIZA')[5],
                type: [gymMainTypes[6]],
                hasStat: ['baseSpeed', '<', '50'],
                fallback: [
                    {
                        contextualTier: [TIER_UU],
                        checkValidEvo: true,
                        type: [gymMainTypes[6]],
                        hasStat: ['baseSpeed', '<', '70'],
                    },
                    {
                        contextualTier: [TIER_RU],
                        checkValidEvo: true,
                        type: [gymMainTypes[6]],
                        hasStat: ['baseSpeed', '<', '50'],
                        pickBest: true,
                    },
                    {
                        contextualTier: [TIER_UU],
                        checkValidEvo: true,
                        type: [gymMainTypes[6]],
                    },
                ],
            },
        ],
    },
    // Route 125
    {
        id: 'TRAINER_ERNEST_1',
        location: 'Route 125',
        class: 'Sailor',
        reward: ['SPECIES_FROAKIE', 'SPECIES_FROGADIER'],
        level: 59,
        bag: getSampleItemsFromArray(tateAndLizaBag(), 25),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_FROAKIE'],
                tryMega: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_FROGADIER'],
                tryMega: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_UU, 3),
            {
                ...POKEDEF_MEGA,
            },
        ],
    },
    {
        id: 'TRAINER_STAN',
        location: 'Route 125',
        class: 'Rich Boy',
        reward: ['SPECIES_CINDERACE'],
        level: 59,
        bag: getSampleItemsFromArray(tateAndLizaBag(), 25),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_CINDERACE'],
                tryMega: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 3),
            {
                ...POKEDEF_MEGA,
            },
        ],
    },
    {
        id: 'TRAINER_TANYA',
        location: 'Route 125',
        class: 'Tuber F',
        reward: ['ITEM_MEGA_09'],
        level: 59,
        bag: getSampleItemsFromArray(tateAndLizaBag(), 25),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_09',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 2),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 3),
        ],
    },
    {
        id: 'TRAINER_PRESLEY',
        location: 'Route 125',
        class: 'Bird Keeper',
        reward: [...choicePresleyTMs],
        level: 59,
        bag: [...choicePresleyTMs, ...getSampleItemsFromArray(tateAndLizaBag(), 22)],
        team: genericTrainerTeamPostTateAndLiza(),
    },
    {
        id: 'TRAINER_AURON',
        location: 'Route 125',
        class: 'Expert M',
        reward: [auronTM],
        level: 59,
        bag: [auronTM, ...getSampleItemsFromArray(tateAndLizaBag(), 24)],
        team: genericTrainerTeamPostTateAndLiza(),
    },
    // Mossdeep Space Center
    {
        id: 'TRAINER_GRUNT_SPACE_CENTER_5',
        location: 'Mossdeep Space Center',
        class: 'Magma Grunt M',
        isBoss: true,
        level: 59,
        bag: [...spaceCenterBag()],
        team: [
            { ...getBossPreset('SPACE_CENTER_GRUNT_5')[0], type: [magmaTeamTypes[0], magmaTeamTypes[1]] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_5')[1], type: [magmaTeamTypes[0], magmaTeamTypes[1]] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_5')[2], type: [magmaTeamTypes[0], magmaTeamTypes[1]] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_5')[3], type: [...magmaTeamTypes] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_5')[4], type: [...magmaTeamTypes] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_5')[5], type: [...magmaTeamTypes] },
        ],
    },
    {
        id: 'TRAINER_GRUNT_SPACE_CENTER_6',
        location: 'Mossdeep Space Center',
        class: 'Magma Grunt M',
        isBoss: true,
        level: 59,
        bag: [...spaceCenterBag()],
        team: [
            { ...getBossPreset('SPACE_CENTER_GRUNT_6')[0], type: [magmaTeamTypes[0], magmaTeamTypes[1]] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_6')[1], type: [...magmaTeamTypes] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_6')[2], type: [magmaTeamTypes[0], magmaTeamTypes[1]] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_6')[3], type: [magmaTeamTypes[0], magmaTeamTypes[1]] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_6')[4], type: [...magmaTeamTypes] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_6')[5], type: [...magmaTeamTypes] },
        ],
    },
    {
        id: 'TRAINER_GRUNT_SPACE_CENTER_7',
        location: 'Mossdeep Space Center',
        class: 'Magma Grunt M',
        isBoss: true,
        level: 59,
        bag: [...spaceCenterBag()],
        team: [
            { ...getBossPreset('SPACE_CENTER_GRUNT_7')[0], type: [magmaTeamTypes[0], magmaTeamTypes[1]] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_7')[1], type: [magmaTeamTypes[0], magmaTeamTypes[1]] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_7')[2], type: [magmaTeamTypes[0], magmaTeamTypes[1]] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_7')[3], type: [...magmaTeamTypes] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_7')[4], type: [...magmaTeamTypes] },
            { ...getBossPreset('SPACE_CENTER_GRUNT_7')[5], type: [...magmaTeamTypes] },
        ],
    },
    {
        id: 'PARTNER_STEVEN',
        class: 'Steven',
        isPartner: true,
        breedTier: 'perfect',
        preventShuffle: true,
        level: 59,
        bag: [...spaceCenterBag()],
        team: [
            {
                id: 'STEVEN_LEGEND',
                ...POKEDEF_UBERS,
                type: [POKEMON_TYPE_STEEL],
                hasStat: ['baseBST', '>', '659'],
                fallback: [
                    {
                        id: 'STEVEN_LEGEND',
                        ...POKEDEF_UBERS,
                        type: [POKEMON_TYPE_ROCK],
                        hasStat: ['baseBST', '>', '659'],
                    },
                    {
                        id: 'STEVEN_LEGEND',
                        ...POKEDEF_UBERS,
                        hasStat: ['baseBST', '>', '659'],
                    },
                ],
            },
            pokeDefUbersOrAGMega({
                id: 'STEVEN_MEGA',
                type: [POKEMON_TYPE_STEEL],
                pickBest: true,
            }),
            {
                id: 'BEST_STEVEN_POKE',
                oneOf: [...stevenPokemon],
                pickBest: true,
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_TABITHA_MOSSDEEP',
        location: 'Mossdeep Space Center',
        class: 'Magma Admin',
        isBoss: true,
        level: 59,
        preventShuffle: true,
        bag: [...spaceCenterBag()],
        team: [
            {
                ...getBossPreset('TABITHA_MOSSDEEP')[0],
                abilities: [...sunAbilities],
                fallback: [
                    {
                        contextualTier: [TIER_UU],
                        checkValidEvo: true,
                        abilities: [...sunAbilities],
                    },
                ],
            },
            {
                ...POKEDEF_UU_OU_MEGA,
                type: [magmaTeamTypes[0]],
                fallback: [
                    {
                        ...POKEDEF_UU_OU_MEGA,
                        type: [magmaTeamTypes[0]],
                    },
                    {
                        ...POKEDEF_UU_OU_MEGA,
                        type: [...magmaTeamTypes],
                    },
                ]
            },
            pokeDefDroughtMon(getBossPreset('TABITHA_MOSSDEEP')[2]),
        ],
    },
    {
        id: 'TRAINER_MAXIE_MOSSDEEP',
        location: 'Mossdeep Space Center',
        class: 'Magma Leader Maxie',
        isBoss: true,
        breedTier: 'perfect',
        level: 59,
        preventShuffle: true,
        bag: [...spaceCenterBag()],
        team: [
            {
                specificIfTier: 'SPECIES_GROUDON',
                ...getBossPreset('MAXIE_MOSSDEEP')[0],
                item: 'Heat Rock',
                fallback: [
                    {
                        specificIfTier: 'SPECIES_GROUDON',
                        contextualTier: [TIER_OU],
                        item: 'Heat Rock',
                    },
                    pokeDefDroughtMon(getBossPreset('MAXIE_MOSSDEEP')[0]),
                ]
            },
            {
                ...getBossPreset('MAXIE_MOSSDEEP')[1],
                abilities: [...sunAbilities],
                pickBest: true,
            },
            pokeDefUbersMega({
                type: [magmaTeamTypes[0]],
            }),
        ],
    },
    // Route 127
    {
        id: 'TRAINER_DONNY',
        location: 'Route 127',
        class: 'Swimming Triathlete F',
        reward: ['SPECIES_SCREAM_TAIL'],
        level: 61,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SCREAM_TAIL'],
                tryMega: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 3),
            {
                ...POKEDEF_MEGA,
            },
        ],
    },
    {
        id: 'TRAINER_CAMDEN',
        location: 'Route 127',
        class: 'Swimming Triathlete M',
        reward: ['SPECIES_RELICANTH'],
        level: 61,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_RELICANTH'],
                tryMega: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 3),
            {
                ...POKEDEF_MEGA,
            },
        ],
    },
    {
        id: 'TRAINER_KOJI_1',
        location: 'Route 127',
        class: 'Black Belt',
        reward: ['ITEM_MEGA_10'],
        level: 61,
        bag: getSampleItemsFromArray(spaceCenterBag(), 24),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_10',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 2),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 3),
        ],
    },
    {
        id: 'TRAINER_AIDAN',
        location: 'Route 127',
        class: 'Bird Keeper',
        reward: [aidanTM],
        level: 61,
        bag: [aidanTM, ...getSampleItemsFromArray(spaceCenterBag(), 24)],
        team: genericTrainerTeamPostTateAndLiza(),
    },
    {
        id: 'TRAINER_ATHENA',
        location: 'Route 127',
        class: 'Cooltrainer F',
        reward: [athenaTM],
        level: 61,
        bag: [athenaTM, ...getSampleItemsFromArray(spaceCenterBag(), 24)],
        team: genericTrainerTeamPostTateAndLiza(),
    },
    {
        id: 'TRAINER_HENRY',
        location: 'Route 127',
        class: 'Fisherman',
        reward: ['Eject Button'],
        level: 61,
        bag: ['Eject Button', ...getSampleItemsFromArray(spaceCenterBag(), 24)],
        team: genericTrainerTeamPostTateAndLiza(),
    },
    // Route 126
    {
        id: 'TRAINER_BRENDA',
        location: 'Route 126',
        class: 'Swimmer F',
        reward: ['Random Defensive Mint', 'SPECIES_FLUTTER_MANE'],
        level: 61,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_FLUTTER_MANE'],
                tryMega: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 3),
            {
                ...POKEDEF_MEGA,
            },
        ],
    },
    {
        id: 'TRAINER_LEONARDO',
        location: 'Route 126',
        class: 'Swimmer M',
        reward: ['SPECIES_HUNTAIL'],
        level: 61,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_HUNTAIL'],
                tryMega: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 3),
            {
                ...POKEDEF_MEGA,
            },
        ],
    },
    // Seafloor Cavern
    {
        id: 'TRAINER_ARCHIE',
        location: 'Seafloor Cavern',
        class: 'Aqua Leader Archie',
        reward: ['Access to Sky Pillar'],
        isBoss: true,
        level: 61,
        bag: [...archieBag()],
        preventShuffle: true,
        team: [
            {
                specificIfTier: 'SPECIES_KYOGRE',
                ...getBossPreset('ARCHIE')[0],
                item: 'Damp Rock',
                fallback: [
                    {
                        specificIfTier: 'SPECIES_KYOGRE',
                        contextualTier: [TIER_OU],
                        checkValidEvo: true,
                        item: 'Damp Rock',
                    },
                    pokeDefDrizzleMon(getBossPreset('ARCHIE')[0]),
                ]
            },
            {
                specificIfTier: 'SPECIES_SHARPEDO_MEGA',
                ...POKEDEF_UU_OU_MEGA,
                breedTier: 'perfect',
                nature: 'Adamant',
            },
            {
                ...getBossPreset('ARCHIE')[2],
                abilities: [...rainAbilities],
                type: [...aquaTeamTypes],
            },
            {
                ...getBossPreset('ARCHIE')[3],
                abilities: [...rainAbilities],
                type: [aquaTeamTypes[1], aquaTeamTypes[2], aquaTeamTypes[3], aquaTeamTypes[4]],
            },
            pokeDefDrizzleMon(getBossPreset('ARCHIE')[4]),
            {
                ...getBossPreset('ARCHIE')[5],
                abilities: [...rainAbilities],
                type: [...aquaTeamTypes],
            },
        ],
    },
    // Route 129
    {
        id: 'TRAINER_CLARENCE',
        location: 'Route 129',
        class: 'Sailor',
        reward: ['SPECIES_DARKRAI'],
        level: 64,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DARKRAI'],
                tryMega: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 2),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 2),
            {
                ...POKEDEF_UU_OU_MEGA,
            },
        ],
    },
    {
        id: 'TRAINER_ALLISON',
        location: 'Route 129',
        class: 'Tuber F',
        reward: ['ITEM_MEGA_11'],
        level: 64,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_11',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 2),
        ],
    },
    // Sootopolis Gym
    {
        id: 'TRAINER_JUAN_1',
        location: 'Sootopolis Gym',
        class: 'Leader Juan',
        level: 64,
        isBoss: true,
        reward: ['GYM_REWARD_8', tmItem(51)],
        bag: [...juanBag()],
        team: [
            {
                ...getBossPreset('JUAN')[0],
                type: [gymMainTypes[7]],
            },
            {
                ...getBossPreset('JUAN')[1],
                type: [gymMainTypes[7]],
            },
            {
                ...getBossPreset('JUAN')[2],
                type: [gymMainTypes[7]],
            },
            {
                ...getBossPreset('JUAN')[3],
                type: [gymMainTypes[7]],
            },
            {
                ...getBossPreset('JUAN')[4],
                type: [gymMainTypes[7]],
            },
            gymIsChangedType[7] ? {
                ...getBossPreset('JUAN')[5],
                type: [gymMainTypes[7]],
                breedTier: 'perfect',
                pickBest: true,
            } : {
                specificIfTier: 'SPECIES_KINGDRA',
                ...getBossPreset('JUAN')[5],
                item: 'Chesto Berry',
                breedTier: 'perfect',
                abilities: ['SNIPER'],
                nature: 'Jolly',
                tryToHaveMove: ['MOVE_DRAGON_DANCE', 'MOVE_WATERFALL'],
                fallback: [
                    {
                        ...getBossPreset('JUAN')[5],
                        checkValidEvo: true,
                        type: [gymMainTypes[7]],
                    }
                ]
            },
        ],
    },
    // Route 123
    {
        id: 'TRAINER_ED',
        location: 'Route 123',
        class: 'Collector',
        reward: ['SPECIES_AERODACTYL'],
        level: 67,
        bag: [...juanBag()],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_AERODACTYL'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 3),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 1),
            {
                ...POKEDEF_MEGA,
            },
        ],
    },
    {
        id: 'TRAINER_KINDRA',
        location: 'Route 123',
        class: 'Hex Maniac',
        reward: ['SPECIES_KABUTOPS', 'SPECIES_KADABRA', 'SPECIES_ALAKAZAM'],
        level: 67,
        bag: [...juanBag()],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_KABUTOPS'],
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_KADABRA'],
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ALAKAZAM'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 1),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 1),
            {
                ...POKEDEF_MEGA,
            },
        ],
    },
    {
        id: 'TRAINER_WENDY',
        location: 'Route 123',
        class: 'Cooltrainer F',
        reward: ['ITEM_MEGA_12'],
        level: 67,
        bag: [...juanBag()],
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_12',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 1),
        ],
    },
    {
        id: 'TRAINER_ALBERTO',
        location: 'Route 123',
        class: 'Bird Keeper',
        reward: ['ITEM_MEGA_13'],
        level: 67,
        bag: [...juanBag()],
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_13',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 1),
        ],
    },
    {
        id: 'TRAINER_CAMERON_1',
        location: 'Route 123',
        class: 'Psychic M',
        reward: ['ITEM_MEGA_14'],
        level: 67,
        bag: [...juanBag()],
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_14',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 1),
        ],
    },
    {
        id: 'TRAINER_KAYLEY',
        location: 'Route 123',
        class: 'Parasol Lady',
        reward: ['ITEM_MEGA_15'],
        level: 67,
        bag: [...juanBag()],
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_15',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 1),
        ],
    },
    {
        id: 'TRAINER_BRAXTON',
        location: 'Route 123',
        class: 'Cooltrainer M',
        reward: ['ITEM_MEGA_16'],
        level: 67,
        bag: [...juanBag()],
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_16',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 4),
            ...generatePokemonsWithDefinition(POKEDEF_UU, 1),
        ],
    },
    // Victory Road
    {
        id: 'TRAINER_WALLY_VR_1',
        location: 'Victory Road',
        class: 'Wally',
        isBoss: true,
        breedTier: 'good',
        level: 67,
        bag: [...juanBag()],
        team: [
            POKEDEF_UBERS,
            {
                special: TRAINER_REPEAT_ID,
                id: 'WALLY_1',
                tryEvolve: true,
                tryMega: true,
            },
            {
                special: TRAINER_REPEAT_ID,
                id: 'WALLY_2',
                tryEvolve: true,
                tryMega: true,
            },
            {
                special: TRAINER_REPEAT_ID,
                id: 'WALLY_3',
                tryEvolve: true,
                tryMega: true,
            },
            {
                special: TRAINER_REPEAT_ID,
                id: 'WALLY_4',
                tryEvolve: true,
                tryMega: true,
            },
            {
                special: TRAINER_REPEAT_ID,
                id: 'WALLY_5',
                tryEvolve: true,
                tryMega: true,
            },
        ],
    },
    {
        id: 'TRAINER_HOPE',
        location: 'Victory Road',
        class: 'Expert F',
        breedTier: 'good',
        reward: ['SPECIES_SHEDINJA', 'SPECIES_MOLTRES', 'SPECIES_ARTICUNO', 'SPECIES_ZAPDOS', 'SPECIES_LUGIA'],
        level: 70,
        bag: [...juanBag()],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SHEDINJA'],
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_MOLTRES'],
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ARTICUNO'],
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ZAPDOS'],
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_LUGIA'],
            },
            {
                ...POKEDEF_MEGA,
            },
        ],
    },
    {
        id: 'TRAINER_QUINCY',
        location: 'Victory Road',
        class: 'Black Belt',
        breedTier: 'good',
        reward: [quincyTM],
        level: 70,
        bag: [quincyTM, ...getSampleItemsFromArray(juanBag(), 24)],
        team: genericTrainerTeamPostTateAndLiza(),
    },
    {
        id: 'TRAINER_KATELYNN',
        location: 'Victory Road',
        class: 'Cooltrainer F',
        breedTier: 'good',
        reward: [katelynTM],
        level: 70,
        bag: [katelynTM, ...getSampleItemsFromArray(juanBag(), 24)],
        team: genericTrainerTeamPostTateAndLiza(),
    },
    // Ever Grande Rival
    {
        id: 'TRAINER_MAY_EVERGRANDE_CITY_TREECKO',
        location: 'Ever Grande City',
        class: 'May',
        isBoss: true,
        level: 70,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        reward: [tmItem(95)],
        bag: [...endgameBag()],
        team: [...rivalEvergrandeCityTemplate('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_EVERGRANDE_CITY_TORCHIC',
        location: 'Ever Grande City',
        class: 'May',
        isBoss: true,
        level: 70,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        reward: [tmItem(95)],
        bag: [...endgameBag()],
        team: [...rivalEvergrandeCityTemplate('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_EVERGRANDE_CITY_MUDKIP',
        location: 'Ever Grande City',
        class: 'May',
        isBoss: true,
        level: 70,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        reward: [tmItem(95)],
        bag: [...endgameBag()],
        team: [...rivalEvergrandeCityTemplate('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_EVERGRANDE_TREECKO',
        location: 'Ever Grande City',
        copy: 'TRAINER_MAY_EVERGRANDE_CITY_TREECKO',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_EVERGRANDE_TORCHIC',
        location: 'Ever Grande City',
        copy: 'TRAINER_MAY_EVERGRANDE_CITY_TORCHIC',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_EVERGRANDE_MUDKIP',
        location: 'Ever Grande City',
        copy: 'TRAINER_MAY_EVERGRANDE_CITY_MUDKIP',
        class: 'Brendan',
    },
    // Last 123 mega trainers
    {
        id: 'TRAINER_VIOLET',
        location: 'Route 123',
        class: 'Aroma Lady',
        reward: ['ITEM_MEGA_17'],
        level: 73,
        bag: [...endgameBag()],
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_17',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 5),
        ],
    },
    {
        id: 'TRAINER_JACKI_1',
        location: 'Route 123',
        class: 'Psychic F',
        reward: ['ITEM_MEGA_18'],
        level: 73,
        bag: [...endgameBag()],
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_18',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 5),
        ],
    },
    {
        id: 'TRAINER_FREDRICK',
        location: 'Route 123',
        class: 'Expert M',
        reward: ['ITEM_MEGA_19'],
        level: 73,
        bag: [...endgameBag()],
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_19',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 5),
        ],
    },
    {
        id: 'TRAINER_DAVIS',
        location: 'Route 123',
        class: 'Youngster',
        reward: ['ITEM_MEGA_20'],
        level: 73,
        bag: [...endgameBag()],
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_20',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 5),
        ],
    },
    {
        id: 'TRAINER_JONAS',
        location: 'Route 123',
        class: 'Ninja Boy',
        reward: ['ITEM_MEGA_21'],
        level: 73,
        bag: [...endgameBag()],
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_MEGA_21',
            },
            ...generatePokemonsWithDefinition(POKEDEF_OU, 5),
        ],
    },
    // E4 & Champion
    {
        id: 'TRAINER_SIDNEY',
        location: 'Elite Four',
        class: 'Elite Four Sidney',
        isBoss: true,
        breedTier: 'good',
        level: 73,
        bag: [...endgameBag()],
        team: [
            { ...getBossPreset('SIDNEY')[0], type: [e41MainType] },
            { ...getBossPreset('SIDNEY')[1], type: [e41MainType] },
            { ...getBossPreset('SIDNEY')[2], type: [e41MainType] },
            { ...getBossPreset('SIDNEY')[3], type: [e41MainType] },
            { ...getBossPreset('SIDNEY')[4], type: [e41MainType] },
            pokeDefMega({ type: [e41MainType] }),
        ],
    },
    {
        id: 'TRAINER_PHOEBE',
        location: 'Elite Four',
        class: 'Elite Four Phoebe',
        isBoss: true,
        breedTier: 'good',
        level: 74,
        bag: [...endgameBag()],
        team: [
            { ...getBossPreset('PHOEBE')[0], type: [e42MainType] },
            { ...getBossPreset('PHOEBE')[1], type: [e42MainType] },
            { ...getBossPreset('PHOEBE')[2], type: [e42MainType] },
            { ...getBossPreset('PHOEBE')[3], type: [e42MainType] },
            { ...getBossPreset('PHOEBE')[4], type: [e42MainType] },
            pokeDefMega({ type: [e42MainType] }),
        ],
    },
    {
        id: 'TRAINER_GLACIA',
        location: 'Elite Four',
        class: 'Elite Four Glacia',
        isBoss: true,
        breedTier: 'good',
        level: 75,
        bag: [...endgameBag()],
        team: [
            { ...getBossPreset('GLACIA')[0], type: [e43MainType] },
            { ...getBossPreset('GLACIA')[1], type: [e43MainType] },
            { ...getBossPreset('GLACIA')[2], type: [e43MainType] },
            { ...getBossPreset('GLACIA')[3], type: [e43MainType] },
            { ...getBossPreset('GLACIA')[4], type: [e43MainType] },
            pokeDefUbersMega({ type: [e43MainType] }),
        ],
    },
    {
        id: 'TRAINER_DRAKE',
        location: 'Elite Four',
        class: 'Elite Four Drake',
        isBoss: true,
        breedTier: 'good',
        level: 76,
        bag: [...endgameBag()],
        team: [
            { ...getBossPreset('DRAKE')[0], type: [e44MainType] },
            { ...getBossPreset('DRAKE')[1], type: [e44MainType] },
            { ...getBossPreset('DRAKE')[2], type: [e44MainType] },
            { ...getBossPreset('DRAKE')[3], type: [e44MainType] },
            { ...getBossPreset('DRAKE')[4], type: [e44MainType] },
            pokeDefUbersMega({ type: [e44MainType] }),
        ],
    },
    {
        id: 'TRAINER_CHAMPION_STEVEN',
        location: 'Champion',
        class: 'Steven',
        isBoss: true,
        breedTier: 'perfect',
        level: 78,
        bag: [...endgameBag()],
        team: [
            {
                ...getBossPreset('CHAMPION_STEVEN')[0],
                hasStat: ['baseBST', '<', '851'],
            },
            getBossPreset('CHAMPION_STEVEN')[1],
            {
                special: TRAINER_REPEAT_ID,
                id: 'STEVEN_MEGA',
                tryMega: true,
                fallback: [
                    pokeDefUbersMega(),
                ],
            },
            getBossPreset('CHAMPION_STEVEN')[3],
            getBossPreset('CHAMPION_STEVEN')[4],
            {
                special: TRAINER_REPEAT_ID,
                id: 'STEVEN_LEGEND',
            },
        ],
    },
];

    return trainersData;
}

module.exports = {
    file: trainersFile,
    partnersFile,
    getTrainersData,
};
