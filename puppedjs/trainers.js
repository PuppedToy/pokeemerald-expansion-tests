const path = require("path");
const {
    EVO_TYPE_LC,
    TRAINER_POKE_STARTER_TREECKO,
    TRAINER_POKE_ENCOUNTER,
    TRAINER_RESTRICTION_NO_REPEATED_TYPE,
    TRAINER_POKE_STARTER_TORCHIC,
    TRAINER_POKE_STARTER_MUDKIP,
    TIER_BAD,
    TIER_WEAK,
    TIER_PREMIUM,
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
    TIER_STRONG,
    TIER_AVERAGE,
    NATURES,
    POKEMON_TYPE_DRAGON,
    POKEMON_TYPE_ELECTRIC,
    TIER_LEGEND,
    TRAINER_POKE_MEGA_FROM_STONE,
    POKEMON_TYPE_NORMAL,
    POKEMON_TYPE_GHOST,
    TIER_GOD,
    POKEMON_TYPES,
    TRAINER_GYM_LEADERS_KEEP_TYPE_AMOUNT,
    TRAINER_E4_KEEP_TYPE_AMOUNT,
} = require("./constants");

const trainersFile = path.resolve(__dirname, '..', 'src', 'data', 'trainers.party');
const partnersFile = path.resolve(__dirname, '..', 'src', 'data', 'battle_partners.party');

// @TODO Fix booster energy
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

const goodMultiHitMoves = [
    'MOVE_BULLET_SEED',
    'MOVE_ICICLE_SPEAR',
    'MOVE_PIN_MISSILE',
    'MOVE_ROCK_BLAST',
    'MOVE_TAIL_SLAP',
    'MOVE_BONE_RUSH',
    'MOVE_SCALE_SHOT',
];

const multiHitMoves = [
    'MOVE_BULLET_SEED',
    'MOVE_ICICLE_SPEAR',
    'MOVE_PIN_MISSILE',
    'MOVE_ROCK_BLAST',
    'MOVE_TAIL_SLAP',
    'MOVE_BONE_RUSH',
    'MOVE_SCALE_SHOT',
    'MOVE_ARM_THRUST',
    'MOVE_BARRAGE',
    'MOVE_COMET_PUNCH',
    'MOVE_DOUBLE_SLAP',
    'MOVE_FURY_ATTACK',
    'MOVE_FURY_SWIPES',
    'MOVE_SPIKE_CANNON',
    'MOVE_WATER_SHURIKEN',  
];

const whiteHerbMoves = [
    'MOVE_OVERHEAT',
    'MOVE_LEAF_STORM',
    'MOVE_DRACO_METEOR',
    'MOVE_FLEUR_CANNON',
    'MOVE_SUPERPOWER',
    'MOVE_CLOSE_COMBAT',
    'MOVE_HAMMER_ARM',
    'MOVE_V_CREATE',
    'MOVE_CLANGING_SCALES',
    'MOVE_PSYCHO_BOOST',
    'MOVE_SHELL_SMASH',
];

const majorPowerHerbMoves = [
    'MOVE_SKY_ATTACK',
    'MOVE_METEOR_BEAM',
    'MOVE_GEOMANCY',
    'MOVE_SOLAR_BEAM',
    'MOVE_SOLAR_BLADE',
    'MOVE_SKULL_BASH',
    'MOVE_RAZOR_WIND',
    'MOVE_ELECTRO_SHOT',
    'MOVE_FREEZE_SHOCK',
    'MOVE_ICE_BURN',
];

const minorPowerHerbMoves = [
    'MOVE_DIG',
    'MOVE_DIVE',
    'MOVE_FLY',
    'MOVE_BOUNCE',
    'MOVE_SHADOW_FORCE',
    'MOVE_PHANTOM_FORCE',
    'MOVE_SKY_DROP',
];

const punchingMoves = [
    'MOVE_BULLET_PUNCH',
    'MOVE_COMET_PUNCH',
    'MOVE_DIZZY_PUNCH',
    'MOVE_DOUBLE_IRON_BASH',
    'MOVE_DRAIN_PUNCH',
    'MOVE_DYNAMIC_PUNCH',
    'MOVE_FIRE_PUNCH',
    'MOVE_FOCUS_PUNCH',
    'MOVE_HAMMER_ARM',
    'MOVE_HEADLONG_RUSH',
    'MOVE_ICE_HAMMER',
    'MOVE_ICE_PUNCH',
    'MOVE_JET_PUNCH',
    'MOVE_MACH_PUNCH',
    'MOVE_MEGA_PUNCH',
    'MOVE_METEOR_MASH',
    'MOVE_PLASMA_FISTS',
    'MOVE_POWER_UP_PUNCH',
    'MOVE_RAGE_FIST',
    'MOVE_SHADOW_PUNCH',
    'MOVE_SKY_UPPERCUT',
    'MOVE_SURGING_STRIKES',
    'MOVE_THUNDER_PUNCH',
    'MOVE_WICKED_BLOW',
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
    POKEMON_TYPE_PSYCHIC,
    POKEMON_TYPE_FIGHTING,
];

function sampleAndRemove(array) {
    const index = Math.floor(Math.random() * array.length);
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

if (whoKeepsE4Type.includes(0)) {
    e41MainType = originalE4Types[0];
}
if (whoKeepsE4Type.includes(1)) {
    e42MainType = originalE4Types[1];
}
if (whoKeepsE4Type.includes(2)) {
    e43MainType = originalE4Types[2];
}
if (whoKeepsE4Type.includes(3)) {
    e44MainType = originalE4Types[3];
}
if (!e41MainType) {
    e41MainType = sampleAndRemove(e4AllowedTypes);
}
if (!e42MainType) {
    e42MainType = sampleAndRemove(e4AllowedTypes);
}
if (!e43MainType) {
    e43MainType = sampleAndRemove(e4AllowedTypes);
}
if (!e44MainType) {
    e44MainType = sampleAndRemove(e4AllowedTypes);
}

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

const tateAndLizaUseSolrock = Math.random() < 0.5;

const generic3Average3StrongTeamTemplate = () => [
    {
        absoluteTier: [TIER_STRONG],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_AVERAGE],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_STRONG],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_AVERAGE],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_STRONG],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_AVERAGE],
        checkValidEvo: true,
    },
];

const generic2Average3Strong1MegaTeamTemplate = () => [
    {
        absoluteTier: [TIER_STRONG],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_AVERAGE],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_STRONG],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_AVERAGE],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_AVERAGE],
        checkValidEvo: true,
    },
    {
        isMega: true,
        absoluteTier: [TIER_STRONG, TIER_PREMIUM],
        checkValidEvo: true,
        tryEvolve: true,
    },
];

const generic2Average2Strong1Premium1MegaTeamTemplate = () => [
    {
        absoluteTier: [TIER_PREMIUM],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_STRONG],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_STRONG],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_AVERAGE],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_AVERAGE],
        checkValidEvo: true,
    },
    {
        isMega: true,
        absoluteTier: [TIER_STRONG, TIER_PREMIUM],
        checkValidEvo: true,
        tryEvolve: true,
    },
]

// New defs

const POKEDEF_BAD_LC = {
    absoluteTier: [TIER_BAD],
    evoType: [EVO_TYPE_LC],
    checkValidEvo: true,
};

const POKEDEF_BAD = {
    absoluteTier: [TIER_BAD],
    checkValidEvo: true,
};

const POKEDEF_WEAK = {
    absoluteTier: [TIER_WEAK],
    checkValidEvo: true,
};

const POKEDEF_AVERAGE = {
    absoluteTier: [TIER_AVERAGE],
    checkValidEvo: true,
    fallback: [
        {
            absoluteTier: [TIER_WEAK],
            checkValidEvo: true,
            tryEvolve: true,
        }
    ],
};

const POKEDEF_WEAK_OR_AVERAGE = {
    absoluteTier: [TIER_WEAK, TIER_AVERAGE],
    checkValidEvo: true,
    tryEvolve: true,
};

const POKEDEF_UP_TO_STRONG = {
    absoluteTier: [TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
    checkValidEvo: true,
    tryEvolve: true,
};

const POKEDEF_UP_TO_PREMIUM = {
    absoluteTier: [TIER_WEAK, TIER_AVERAGE, TIER_STRONG, TIER_PREMIUM],
    checkValidEvo: true,
    tryEvolve: true,
};

const POKEDEF_UP_TO_PREMIUM_NOEVO = {
    absoluteTier: [TIER_WEAK, TIER_AVERAGE, TIER_STRONG, TIER_PREMIUM],
    checkValidEvo: true,
};

const POKEDEF_STRONG = {
    absoluteTier: [TIER_STRONG],
    checkValidEvo: true,
    tryEvolve: true,
    fallback: [
        {
            absoluteTier: [TIER_AVERAGE],
            checkValidEvo: true,
            tryEvolve: true,
        }
    ],
};

const POKEDEF_PREMIUM = {
    absoluteTier: [TIER_PREMIUM],
    checkValidEvo: true,
    tryEvolve: true,
    fallback: [
        {
            absoluteTier: [TIER_STRONG],
            checkValidEvo: true,
            tryEvolve: true,
        },
        {
            absoluteTier: [TIER_AVERAGE],
            checkValidEvo: true,
            tryEvolve: true,
        },
    ],
};

const POKEDEF_LEGEND = {
    absoluteTier: [TIER_LEGEND],
    checkValidEvo: true,
};

const POKEDEF_STRONG_PREMIUM_MEGA = {
    isMega: true,
    absoluteTier: [TIER_STRONG, TIER_PREMIUM],
    checkValidEvo: true,
    tryEvolve: true,
};

const POKEDEF_MEGA = {
    isMega: true,
    checkValidEvo: true,
    tryEvolve: true,
};

const pokeDefLegendMega = (BASE_POKE_DEF) => ({
    isMega: true,
    absoluteTier: [TIER_LEGEND],
    checkValidEvo: true,
    ...BASE_POKE_DEF,
    fallback: [
        {
            isMega: true,
            absoluteTier: [TIER_PREMIUM],
            checkValidEvo: true,
            ...BASE_POKE_DEF,
        },
        {
            isMega: true,
            absoluteTier: [TIER_LEGEND],
            checkValidEvo: true,
        },
        {
            isMega: true,
            absoluteTier: [TIER_PREMIUM],
            checkValidEvo: true,
        },
    ]
});

const pokeDefLegendOrGodMega = (BASE_POKE_DEF) => ({
    isMega: true,
    absoluteTier: [TIER_LEGEND, TIER_GOD],
    checkValidEvo: true,
    ...BASE_POKE_DEF,
    fallback: [
        {
            isMega: true,
            absoluteTier: [TIER_PREMIUM],
            checkValidEvo: true,
            ...BASE_POKE_DEF,
        },
        {
            isMega: true,
            absoluteTier: [TIER_LEGEND],
            checkValidEvo: true,
        },
        {
            isMega: true,
            absoluteTier: [TIER_PREMIUM],
            checkValidEvo: true,
        },
    ]
});

const pokeDefPremiumMega = (BASE_POKE_DEF) => ({
    isMega: true,
    absoluteTier: [TIER_PREMIUM],
    checkValidEvo: true,
    ...BASE_POKE_DEF,
    fallback: [
        {
            isMega: true,
            absoluteTier: [TIER_STRONG],
            checkValidEvo: true,
            ...BASE_POKE_DEF,
        },
        {
            isMega: true,
            absoluteTier: [TIER_PREMIUM],
            checkValidEvo: true,
        },
        {
            isMega: true,
            absoluteTier: [TIER_STRONG],
            checkValidEvo: true,
        },
    ]
});

const pokeDefOnlyGod = (BASE_POKE_DEF = {}) => ({
    absoluteTier: [TIER_GOD],
    checkValidEvo: true,
    ...BASE_POKE_DEF,
    fallback: [
        {
            absoluteTier: [TIER_GOD],
            checkValidEvo: true,
        },
    ],
});

const pokeDefOnlyLegend = (BASE_POKE_DEF = {}) => ({
    absoluteTier: [TIER_LEGEND],
    checkValidEvo: true,
    ...BASE_POKE_DEF,
    fallback: [
        {
            absoluteTier: [TIER_LEGEND],
            checkValidEvo: true,
        },
    ],
});

const pokeDefOnlyPremium = (BASE_POKE_DEF = {}) => ({
    absoluteTier: [TIER_PREMIUM],
    checkValidEvo: true,
    ...BASE_POKE_DEF,
    fallback: [
        {
            absoluteTier: [TIER_PREMIUM],
            checkValidEvo: true,
        },
    ],
});

const pokeDefOnlyStrong = (BASE_POKE_DEF = {}) => ({
    absoluteTier: [TIER_STRONG],
    checkValidEvo: true,
    ...BASE_POKE_DEF,
    fallback: [
        {
            absoluteTier: [TIER_STRONG],
            checkValidEvo: true,
        },
    ],
});

const pokeDefDrizzleMon = (BASE_POKE_DEF) => {
    return {
        ...BASE_POKE_DEF,
        abilities: ['DRIZZLE'],
        item: 'Damp Rock',
        fallback: [
            {
                ...BASE_POKE_DEF,
                mustHaveOneOfMoves: ['MOVE_RAIN_DANCE'],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                item: 'Damp Rock',
                abilities: [...rainAbilities],
            },
            {
                ...BASE_POKE_DEF,
            },
        ],
    };
};

const pokeDefSnowWarningMon = (BASE_POKE_DEF) => {
    return {
        ...BASE_POKE_DEF,
        abilities: ['SNOW_WARNING'],
        item: 'Icy Rock',
        fallback: [
            {
                ...BASE_POKE_DEF,
                mustHaveOneOfMoves: ['MOVE_HAIL'],
                tryToHaveMove: ['MOVE_HAIL'],
                item: 'Icy Rock',
                abilities: [...snowAbilities],
            },
            {
                ...BASE_POKE_DEF,
            },
        ],
    };
};

const pokeDefDroughtMon = (BASE_POKE_DEF) => {
    return {
        ...BASE_POKE_DEF,
        abilities: ['DROUGHT'],
        item: 'Heat Rock',
        fallback: [
            {
                ...BASE_POKE_DEF,
                mustHaveOneOfMoves: ['MOVE_SUNNY_DAY'],
                tryToHaveMove: ['MOVE_SUNNY_DAY'],
                item: 'Heat Rock',
                abilities: [...sunAbilities],
            },
            {
                ...BASE_POKE_DEF,
            },
        ],
    };
};

const pokeDefSandStreamMon = (BASE_POKE_DEF) => {
    return {
        ...BASE_POKE_DEF,
        abilities: ['SAND_STREAM'],
        item: 'Smooth Rock',
        fallback: [
            {
                ...BASE_POKE_DEF,
                mustHaveOneOfMoves: ['MOVE_SANDSTORM'],
                tryToHaveMove: ['MOVE_SANDSTORM'],
                item: 'Smooth Rock',
                abilities: [...sandAbilities],
            },
            {
                ...BASE_POKE_DEF,
            },
        ],
    };
};

const pokeDefPsychicSurgeMon = (BASE_POKE_DEF, item = 'Terrain Extender') => {
    return {
        ...BASE_POKE_DEF,
        abilities: ['PSYCHIC_SURGE'],
        item,
        fallback: [
            {
                ...BASE_POKE_DEF,
                mustHaveOneOfMoves: ['MOVE_PSYCHIC_TERRAIN'],
                tryToHaveMove: ['MOVE_PSYCHIC_TERRAIN'],
                item,
                abilities: ['PSYCHIC_SURGE'],
            },
            {
                ...BASE_POKE_DEF,
            },
        ],
    };
};

const pokeDefMistySurgeMon = (BASE_POKE_DEF, item = 'Terrain Extender') => {
    return {
        ...BASE_POKE_DEF,
        abilities: ['MISTY_SURGE'],
        item,
        fallback: [
            {
                ...BASE_POKE_DEF,
                mustHaveOneOfMoves: ['MOVE_MISTY_TERRAIN'],
                tryToHaveMove: ['MOVE_MISTY_TERRAIN'],
                item,
                abilities: ['MISTY_SURGE'],
            },
            {
                ...BASE_POKE_DEF,
            },
        ],
    };
};

const pokeDefElectricSurgeMon = (BASE_POKE_DEF, item = 'Terrain Extender') => {
    return {
        ...BASE_POKE_DEF,
        abilities: ['ELECTRIC_SURGE'],
        item,
        fallback: [
            {
                ...BASE_POKE_DEF,
                mustHaveOneOfMoves: ['MOVE_ELECTRIC_TERRAIN'],
                tryToHaveMove: ['MOVE_ELECTRIC_TERRAIN'],
                item,
                abilities: ['ELECTRIC_SURGE'],
            },
            {
                ...BASE_POKE_DEF,
            },
        ],
    };
};

const pokeDefGrassySurgeMon = (BASE_POKE_DEF, item = 'Terrain Extender') => {
    return {
        ...BASE_POKE_DEF,
        abilities: ['GRASSY_SURGE'],
        item,
        fallback: [
            {
                ...BASE_POKE_DEF,
                mustHaveOneOfMoves: ['MOVE_GRASSY_TERRAIN'],
                tryToHaveMove: ['MOVE_GRASSY_TERRAIN'],
                item,
                abilities: ['GRASSY_SURGE'],
            },
            {
                ...BASE_POKE_DEF,
            },
        ],
    };
};

const PROMISING_PREMIUM_LEGEND_GOD_MEGA_LC = {
    megaTier: [TIER_PREMIUM, TIER_LEGEND],
    absoluteTier: [TIER_BAD],
    evoType: [EVO_TYPE_LC],
};

const generatePokemonsWithDefinition = (def, amount) => {
    return new Array(amount).fill(null).map(() => ({ ...def }));
}

const genericAverageWith1StrongTeamTemplate = () => [
    POKEDEF_STRONG,
    ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 5),
];

const genericAverageWith2StrongTeamTemplate = () => [
    ...generatePokemonsWithDefinition(POKEDEF_STRONG, 2),
    ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 4),
];

const genericAverageWith3StrongTeamTemplate = () => [
    ...generatePokemonsWithDefinition(POKEDEF_STRONG, 3),
    ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 3),
];

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const getSampleItemsFromArray = (array, amount) => {
    const result = new Set();
    for (let i = 0; i < amount; i++) {
        result.add(sample(array));
    }
    return Array.from(result);
};

const rival103Template = (id) => [
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_ZIGZAGOON'],
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_WURMPLE', 'SPECIES_WINGULL'],
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_SURSKIT', 'SPECIES_SMEARGLE'],
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_WEEDLE', 'SPECIES_PATRAT'],
        tryEvolve: true,
    },
    {
        id: 'RIVAL_MEGA_103_KEEP_' + id,
        ...PROMISING_PREMIUM_LEGEND_GOD_MEGA_LC,
    },
];

const rivalRustboroEncounters = [
    'SPECIES_ZIGZAGOON',
    'SPECIES_WURMPLE',
    'SPECIES_WINGULL',
    'SPECIES_SURSKIT',
    'SPECIES_SMEARGLE',
    'SPECIES_WEEDLE',
    'SPECIES_PATRAT',
    'SPECIES_PORYGON',
    'SPECIES_GEODUDE',
    'SPECIES_DELIBIRD',
    'SPECIES_DITTO',
    'SPECIES_SENTRET',
    'SPECIES_POOCHYENA'
];

const rivalRustboroTemplate = (id) => [
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_STARTER_' + id,
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
        evolutionTier: [TIER_PREMIUM],
        evoType: [EVO_TYPE_LC],
        tryEvolve: true,
        fallback: [
            {
                id: 'RIVAL_PREMIUM_RUSTBORO_KEEP_' + id,
                evolutionTier: [TIER_STRONG],
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

const rival110Encounters = [
    ...rivalRustboroEncounters,
    'SPECIES_CHARMANDER',
    'SPECIES_ARON',
    'SPECIES_BULBASAUR',
    'SPECIES_IVYSAUR',
    'SPECIES_ABSOL',
    'SPECIES_ELECTRIKE',
    'SPECIES_MANECTRIC',
    'SPECIES_ODDISH',
    'SPECIES_GLOOM',
    'SPECIES_CARVANHA',
];

const rival119Encounters = [
    ...rival110Encounters,
    'SPECIES_DEDENNE',
    'SPECIES_SHELGON',
    'SPECIES_PUPITAR',
    'SPECIES_GABITE',
    'SPECIES_VENUSAUR',
    'SPECIES_CHARMELEON',
    'SPECIES_MIGHTYENA',
    'SPECIES_HOOTHOOT',
    'SPECIES_EKANS',
    'SPECIES_SANDSHREW',
    'SPECIES_PONYTA',
    'SPECIES_MILTANK',
    'SPECIES_GOLDEEN',
    'SPECIES_PELIPPER',
    'SPECIES_TENTACOOL',
    'SPECIES_LOTAD',
    'SPECIES_KIRLIA',
    'SPECIES_MAREEP',
    'SPECIES_VILEPLUME',
    'SPECIES_SHARPEDO',
    'SPECIES_TRAPINCH',
    'SPECIES_DROWZEE',
    'SPECIES_HYPNO',
    'SPECIES_NUMEL',
    'SPECIES_TAILLOW',
    'SPECIES_SWELLOW',
    'SPECIES_SPINDA',
    'SPECIES_SWABLU',
    'SPECIES_ALTARIA',
    'SPECIES_SPOINK',
    'SPECIES_LINOONE',
    'SPECIES_SNIVY',
    'SPECIES_SERVINE',
];

const rivalEvergrandeCityEncounters = [
    ...rival119Encounters,
    'SPECIES_SANDILE',
    'SPECIES_KROKOROK',
    'SPECIES_KROOKODILE',
    'SPECIES_RIBOMBEE',
    'SPECIES_SHUPPET',
    'SPECIES_METAPOD',
    'SPECIES_HONEDGE',
    'SPECIES_DOUBLADE',
    'SPECIES_WAILMER',
    'SPECIES_WAILORD',
    'SPECIES_SPINARAK',
    'SPECIES_ARIADOS',
    'SPECIES_SPIDOPS',
    'SPECIES_WO_CHIEN',
    'SPECIES_GUZZLORD',
    'SPECIES_KARTANA',
    'SPECIES_GOLETT',
    'SPECIES_RABOOT',
    'SPECIES_SCORBUNNY',
    'SPECIES_FROAKIE',
    'SPECIES_FROGADIER',
    'SPECIES_SCREAM_TAIL',
    'SPECIES_OMANYTE',
    'SPECIES_OMASTAR',
    'SPECIES_RELICANTH',
    'SPECIES_FLUTTER_MANE',
    'SPECIES_FINNEON',
    'SPECIES_LUMINEON',
    'SPECIES_HUNTAIL',
    'SPECIES_HAWLUCHA',
    'SPECIES_ROSELIA',
    'SPECIES_ROSERADE',
    'SPECIES_STARMIE',
    'SPECIES_IRON_HANDS',
    'SPECIES_IRON_CROWN',
    'SPECIES_JIRACHI',
    'SPECIES_IRON_JUGULIS',
    'SPECIES_IRON_BOULDER',
    'SPECIES_IRON_LEAVES',
    'SPECIES_IRON_MOTH',
    'SPECIES_IRON_THORNS',
    'SPECIES_IRON_TREADS',
    'SPECIES_RAIKOU',
    'SPECIES_ENTEI',
    'SPECIES_SUICUNE',
]

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
        evolutionTier: [TIER_PREMIUM],
        evoType: [EVO_TYPE_LC],
        tryEvolve: true,
        fallback: [
            {
                id: 'RIVAL_PREMIUM_110_KEEP_' + id,
                evolutionTier: [TIER_STRONG],
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

const rival103Bag = [
    'Oran Berry',
];

const petalwoodGruntBag = [
    ...rival103Bag,
    'Expert Belt',
    'Eviolite',
    'Splash Plate',
];

const woodsPlatesChoice = [
    'Meadow Plate',
    'Splash Plate',
    'Earth Plate'
];

const choice104Berry = ['Charti Berry', 'Chople Berry', 'Passho Berry'];
const choice104Gem = ['Water Gem', 'Flying Gem', 'Dark Gem'];
const choice104TMs = [
    'TM_WATER_PULSE',
    'TM_BULLET_SEED',
    'TM_DIG',
];

const bagAfterWoodGrunt = () => [
    'Oran Berry',
    'Expert Belt',
    'Eviolite',
    sample([...woodsPlatesChoice]),    
];

const roxanneBag = () => [
    ...bagAfterWoodGrunt(),
    sample([...choice104Gem]),
    sample([...choice104Berry]),
    sample([...choice104TMs]),
];

const rusturfGruntBag = () => [
    ...roxanneBag(),
    'Rocky Helmet',
    'Black Sludge',
    'TM_ROCK_TOMB',
];

const rivalRustboroBag = () => [
    ...rusturfGruntBag(),
    sample(['Toxic Orb', 'Flame Orb']),
    sample(['Big Root', 'Punching Glove', 'TM_GIGA_DRAIN']),
];

const choicesDewfordTMs = [
    'TM_BRICK_BREAK',
    'TM_SHADOW_BALL',
    'TM_PSYCHIC',
];

const brawlyBag = () => [
    ...rivalRustboroBag(),
    sample([...choicesDewfordTMs]),
    'Life Orb',
];

const stevenBag = () => [
    ...brawlyBag(),
    'TM_BULK_UP',
    'TM_STEEL_WING',
];

const slateportGruntsBag = () => [
    ...brawlyBag(),
    'Loaded Dice',
    // 'Damp Rock',
    // 'Heat Rock',
    // 'Smooth Rock',
    // 'Icy Rock',
];

const choice110TMs = [
    'TM_DRAGON_CLAW',
    'TM_EARTHQUAKE',
    'TM_FOCUS_PUNCH',
];

const rivalRoute110Bag = () => [
    ...slateportGruntsBag(),
    sample(choice110TMs),
    'Air Balloon',
    // 'Terrain Extender',
];

const choiceJosephSeeds = [
    'Electric Seed', 'Grassy Seed', 'Psychic Seed', 'Misty Seed'
];

const wallyBag = () => [
    ...rivalRoute110Bag(),
    sample([...choiceJosephSeeds]),
    'Lum Berry',
];

const choiceMelinaBerries = [
    'Wacan Berry',
    'Occa Berry',
    'Shuca Berry',
];
const choiceAishaGems = ['Fire Gem', 'Ground Gem', 'Fighting Gem'];

const wattsonBag = () => [
    ...wallyBag(),
    sample(['TM_REFLECT', 'TM_LIGHT_SCREEN']),
    sample(choiceMelinaBerries),
    sample(choiceAishaGems),
    'Light Clay',
    'Assault Vest',
    'TM_SHOCK_WAVE',
    'TM_ROCK_SMASH',
];

const magmaChimneyBag = () => [
    ...wattsonBag(),
    'Shed Shell',
    'Sitrus Berry',
];

const choiceNobTMs = ['TM_SOLAR_BEAM', 'TM_HYPER_BEAM', 'TM_SLUDGE_BOMB'];
const choiceClaudeTMs = ['TM_TAUNT', 'TM_TORMENT', 'TM_SKILL_SWAP', 'TM_SNATCH'];

const flanneryBag = () => [
    ...magmaChimneyBag(),
    sample(choiceNobTMs),
    sample([...choiceClaudeTMs]),
    'TM_OVERHEAT',
    'TM_STRENGTH',
    'White Herb',
    'Power Herb',
    'Shell Bell',
];

const choiceHeidiItems = [
    'Throat Spray',
    'Eject Pack',
    'Custap Berry',
];

const normanBag = () => [
    ...flanneryBag(),
    sample(['Yache Berry', 'Chilan Berry', 'Coba Berry']),
    sample([...choiceHeidiItems]),
    'Safety Goggles',
    'TM_FACADE',
    'TM_SURF',
];

const choiceWadeBerries = [
    'Kee Berry',
    'Maranga Berry',
    'Rowap Berry',
    'Jaboca Berry',
];

const choiceChesterTMs = [
    'TM_THUNDERBOLT',
    'TM_ICE_BEAM',
    'TM_FLAMETHROWER',
];

const shellyBag = () => [
    ...normanBag(),
    sample(choiceWadeBerries),
    sample(choiceChesterTMs),
    'Booster Energy',
];

const rival119Bag = () => [
    ...shellyBag(),
    'Leftovers',
];

const choiceClarissaItems = [
    'Mirror Herb',
    'Adrenaline Orb',
    'Red Card',
];

const winonaBag = () => [
    ...rival119Bag(),
    sample([...choiceClarissaItems]),
    'TM_AERIAL_ACE',
];

const choiceTammyTMs = [
    'TM_TOXIC',
    'TM_PROTECT',
    'TM_REST',
];

const choiceCristinBerries = ['Payapa Berry', 'Colbur Berry', 'Tanga Berry'];

const wallyBag2 = () => [
    ...winonaBag(),
    'Focus Sash',
    sample([...choiceTammyTMs]),
    sample([...choiceCristinBerries]),
];

const choiceIsabellaItem = ['Choice Band', 'Choice Scarf', 'Choice Specs'];
const choiceGraceTMs = ['TM_BLIZZARD', 'TM_THUNDER', 'TM_FIRE_BLAST'];

const tateAndLizaBag = () => [
    ...wallyBag2(),
    sample([...choiceIsabellaItem]),
    sample([...choiceGraceTMs]),
    'TM_CALM_MIND',
];

const choicePresleyItems = ['Weakness Policy', 'Eject Button', 'Leppa Berry'];

const spaceCenterBag = () => [
    ...tateAndLizaBag(),
    sample([...choicePresleyItems]),
    'Heavy-Duty Boots',
];

const juanBag = () => [
    ...spaceCenterBag(),
    'TM_WATERFALL'
];

const trainersData = [
    // Route 101
    {
        id: 'TRAINER_CALVIN_1',
        class: 'Youngster',
        reward: ['SPECIES_ZIGZAGOON'],
        level: 7,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ZIGZAGOON'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 4),
        ]
    },
    {
        id: 'TRAINER_ELIJAH',
        class: 'Bird Keeper',
        reward: ['Oran Berry'],
        level: 7,
        team: [
            {
                ...POKEDEF_BAD_LC,
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 4),
        ],
    },
    // Route 103
    {
        id: 'TRAINER_MAY_ROUTE_103_TREECKO',
        class: 'May',
        level: 7,
        isBoss: true,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                id: 'RIVAL_STARTER_TREECKO',
                special: TRAINER_POKE_STARTER_TORCHIC,
                item: 'Oran Berry',
            },
            ...rival103Template('TREECKO'),
        ]
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_TORCHIC',
        class: 'May',
        level: 7,
        isBoss: true,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                id: 'RIVAL_STARTER_TORCHIC',
                special: TRAINER_POKE_STARTER_MUDKIP,
                item: 'Oran Berry',
            },
            ...rival103Template('TORCHIC'),
        ]
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_MUDKIP',
        class: 'May',
        level: 7,
        isBoss: true,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                id: 'RIVAL_STARTER_MUDKIP',
                special: TRAINER_POKE_STARTER_TREECKO,
                item: 'Oran Berry',
            },
            ...rival103Template('MUDKIP'),
        ]
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_TREECKO',
        copy: 'TRAINER_MAY_ROUTE_103_TREECKO',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_TORCHIC',
        copy: 'TRAINER_MAY_ROUTE_103_TORCHIC',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_MUDKIP',
        copy: 'TRAINER_MAY_ROUTE_103_MUDKIP',
        class: 'Brendan',
    },
    // Route 102
    {
        id: 'TRAINER_ALLEN',
        class: 'Youngster',
        reward: ['SPECIES_WURMPLE'],
        level: 9,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WURMPLE'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 4),
        ],
    },
    {
        id: 'TRAINER_RICK',
        class: 'Bug Catcher',
        reward: ['Old Rod', 'SPECIES_WINGULL'],
        level: 9,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WINGULL'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 4),
        ]
    },
    {
        id: 'TRAINER_TIANA',
        class: 'Lass',
        reward: ['Expert Belt'],
        level: 9,
        bag: [...rival103Bag],
        team: [
            {
                ...POKEDEF_BAD_LC,
                item: 'Expert Belt',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 4),
        ]
    },
    // Route 103
    {
        id: 'TRAINER_CARTER',
        class: 'Fisherman',
        reward: ['SPECIES_SURSKIT'],
        level: 9,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SURSKIT'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 4),
        ]
    },
    // Route 104
    {
        id: 'TRAINER_DARIAN',
        class: 'Fisherman',
        reward: ['SPECIES_WEEDLE'],
        level: 9,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WEEDLE'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 4),
        ]
    },
    {
        id: 'TRAINER_CINDY_1',
        class: 'Lady',
        reward: ['Eviolite'],
        level: 9,
        bag: [...rival103Bag],
        team: [
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Eviolite',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 4),
        ]
    },
    // Petalburg Woods
    {
        id: 'TRAINER_LYLE',
        class: 'Bug Catcher',
        reward: [...woodsPlatesChoice],
        level: 9,
        bag: [...woodsPlatesChoice],
        team: [
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_GRASS],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_WATER],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_GROUND],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 2),
        ],
    },
    {
        id: 'TRAINER_GRUNT_PETALBURG_WOODS',
        class: 'Aqua Grunt M',
        level: 9,
        isBoss: true,
        bag: [...petalwoodGruntBag],
        team: [
            {
                specific: 'SPECIES_CARVANHA',
                nature: NATURES.ADAMANT.name,
                abilities: ['SPEED_BOOST'],
            },
            {
                ...POKEDEF_BAD,
                type: [aquaTeamTypes[1]],
            },
            {
                ...POKEDEF_BAD,
                type: [aquaTeamTypes[2]],
            },
            {
                ...POKEDEF_BAD,
                type: [aquaTeamTypes[3]],
            },
            {
                ...POKEDEF_BAD,
                type: [aquaTeamTypes[4]],
            },
            {
                ...POKEDEF_BAD,
                type: [aquaTeamTypes[0]],
            },
        ],
    },
    {
        id: 'TRAINER_JAMES_1',
        class: 'Bug Catcher',
        reward: ['SPECIES_PATRAT'],
        level: 10,
        bag: [...rival103Bag],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_PATRAT'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ],
    },
    // Route 104 again
    {
        id: 'TRAINER_WINSTON_1',
        class: 'Rich Boy',
        reward: [...choice104Berry],
        level: 10,
        bag: [...choice104Berry],
        team: [
            {
                ...POKEDEF_BAD_LC,
                weakToTypes: [POKEMON_TYPE_WATER],
            },
            {
                ...POKEDEF_BAD_LC,
                weakToTypes: [POKEMON_TYPE_ROCK],
            },
            {
                ...POKEDEF_BAD_LC,
                weakToTypes: [POKEMON_TYPE_FIGHTING],
            },
            {
                ...POKEDEF_BAD_LC,
                weakToTypes: [POKEMON_TYPE_WATER],
            },
            {
                ...POKEDEF_BAD_LC,
                weakToTypes: [POKEMON_TYPE_ROCK],
            },
            {
                ...POKEDEF_BAD_LC,
                weakToTypes: [POKEMON_TYPE_FIGHTING],
            },
        ]
    },
    {
        id: 'TRAINER_IVAN',
        class: 'Fisherman',
        reward: [...choice104Gem],
        level: 10,
        bag: getSampleItemsFromArray([...choice104Gem], 2),
        team: [
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_WATER],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_FLYING],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_DARK],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_WATER],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_FLYING],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_DARK],
            },
        ],
    },
    {
        id: 'TRAINER_HALEY_1',
        class: 'Lass',
        reward: [...choice104TMs],
        level: 10,
        bag: [...rival103Bag],
        tms: [...choice104TMs],
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_GINA_AND_MIA_1',
        class: 'Twins',
        reward: ['SPECIES_PORYGON'],
        level: 10,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_PORYGON'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ]
    },
    // Route 115
    {
        id: 'TRAINER_TIMOTHY_1',
        class: 'Expert M',
        reward: ['SPECIES_DELIBIRD'],
        level: 10,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DELIBIRD'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ],
    },
    {
        id: 'TRAINER_MARLENE',
        class: 'Psychic F',
        reward: ['Ability Capsule'],
        level: 10,
        bag: [...rival103Bag],
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    // Rustboro City
    {
        id: 'TRAINER_ROXANNE_1',
        level: 10,
        class: 'Leader Roxanne',
        reward: ['GYM_REWARD_1'],
        isBoss: true,
        bag: roxanneBag(),
        tms: ['MOVE_ROCK_TOMB', 'MOVE_ROCK_TOMB'],
        team: [
            gymIsChangedType[0] ? {
                ...POKEDEF_WEAK,
                type: [gymMainTypes[0]],
            } : {
                specific: 'SPECIES_NOSEPASS',
            },
            {
                ...POKEDEF_WEAK,
                type: [gymMainTypes[0]],
            },
            {
                ...POKEDEF_BAD,
                type: [gymMainTypes[0]],
            },
            {
                ...POKEDEF_BAD,
                type: [gymMainTypes[0]],
            },
            {
                ...POKEDEF_BAD,
                type: [gymMainTypes[0]],
            },
            {
                ...POKEDEF_BAD,
                type: [gymMainTypes[0]],
            },
        ],
    },
    // Route 104
    {
        id: 'TRAINER_BILLY',
        class: 'Youngster',
        reward: ['SPECIES_GEODUDE'],
        level: 13,
        bag: getSampleItemsFromArray(roxanneBag(), 3),
        tms: getSampleItemsFromArray(choice104TMs, 1),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_GEODUDE'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 5),
        ]
    },
    // Route 116
    {
        id: 'TRAINER_JOSE',
        level: 13,
        class: 'Bug Catcher',
        reward: ['SPECIES_DITTO'],
        bag: getSampleItemsFromArray(roxanneBag(), 3),
        tms: getSampleItemsFromArray(choice104TMs, 1),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DITTO'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 5),
        ],
    },
    {
        id: 'TRAINER_JOEY',
        class: 'Youngster',
        reward: ['Ability Patch'],
        level: 13,
        bag: getSampleItemsFromArray(roxanneBag(), 3),
        tms: getSampleItemsFromArray(choice104TMs, 1),
        team: generatePokemonsWithDefinition(POKEDEF_BAD, 6),
    },
    {
        id: 'TRAINER_JOHNSON',
        class: 'Youngster',
        reward: ['Rocky Helmet'],
        level: 13,
        bag: [...getSampleItemsFromArray(roxanneBag(), 2), 'Rocky Helmet'],
        tms: getSampleItemsFromArray(choice104TMs, 1),
        team: generatePokemonsWithDefinition(POKEDEF_BAD, 6),
    },
    {
        id: 'TRAINER_DEVAN',
        class: 'Hiker',
        reward: ['Black Sludge'],
        level: 13,
        bag: getSampleItemsFromArray(roxanneBag(), 2),
        tms: getSampleItemsFromArray(choice104TMs, 1),
        team: [
            {
                ...POKEDEF_BAD,
                type: [POKEMON_TYPE_POISON],
                item: 'Black Sludge',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 5),
        ],
    },
    {
        id: 'TRAINER_CLARK',
        class: 'Hiker',
        reward: ['Punching Glove', 'Big Root', 'TM_GIGA_DRAIN'],
        level: 13,
        team: [
            {
                ...POKEDEF_BAD,
                mustHaveOneOfMoves: [...punchingMoves],
                item: 'Punching Glove',
            },
            {
                ...POKEDEF_BAD,
                mustHaveOneOfMoves: ['MOVE_GIGA_DRAIN'],
                tryToHaveMove: ['MOVE_GIGA_DRAIN'],
                item: 'Big Root',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 4),
        ],
    },
    // Rusturf Tunnel
    {
        id: 'TRAINER_GRUNT_RUSTURF_TUNNEL',
        level: 13,
        class: 'Aqua Grunt M',
        isBoss: true,
        bag: [...rusturfGruntBag()],
        team: [
            {
                specific: 'SPECIES_CARVANHA',
                nature: NATURES.RELAXED.name,
                abilities: ['ROUGH_SKIN'],
            },
            {
                ...POKEDEF_BAD,
                type: [aquaTeamTypes[0]],
                tryEvolve: true,
            },
            {
                ...POKEDEF_BAD,
                type: [aquaTeamTypes[1]],
                tryEvolve: true,
            },
            {
                ...POKEDEF_BAD,
                type: [aquaTeamTypes[2]],
                tryEvolve: true,
            },
            {
                ...POKEDEF_BAD,
                type: [aquaTeamTypes[3]],
                tryEvolve: true,
            },
            {
                ...POKEDEF_BAD,
                type: [aquaTeamTypes[4]],
                tryEvolve: true,
            },
        ],
    },
    // Route 116 again
    {
        id: 'TRAINER_JANICE',
        class: 'Lass',
        reward: ['SPECIES_SENTRET'],
        level: 14,
        bag: getSampleItemsFromArray(rusturfGruntBag(), 3),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SENTRET'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 5),
        ],
    },
    {
        id: 'TRAINER_JERRY_1',
        class: 'School Kid M',
        reward: ['Flame Orb', 'Toxic Orb', 'Sticky Barb'],
        level: 14,
        bag: getSampleItemsFromArray(rusturfGruntBag(), 1),
        team: [
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                abilities: ['GUTS'],
                item: 'Flame Orb',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                abilities: ['POISON_HEAL'],
                item: 'Toxic Orb',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 4),
        ],
    },
    {
        id: 'TRAINER_SARAH',
        class: 'Lady',
        reward: ['Random Defensive Mint'],
        level: 14,
        bag: getSampleItemsFromArray(rusturfGruntBag(), 3),
        team: generatePokemonsWithDefinition(POKEDEF_BAD, 6),
    },
    {
        id: 'TRAINER_KAREN_1',
        class: 'School Kid F',
        reward: ['Random Offensive Mint'],
        level: 14,
        bag: getSampleItemsFromArray(rusturfGruntBag(), 3),
        team: generatePokemonsWithDefinition(POKEDEF_BAD, 6),
    },
    // Rustboro Rival
    {
        id: 'TRAINER_MAY_RUSTBORO_TREECKO',
        class: 'May',
        isBoss: true,
        level: 14,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRustboroBag()],
        team: [...rivalRustboroTemplate('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_RUSTBORO_TORCHIC',
        class: 'May',
        isBoss: true,
        level: 14,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRustboroBag()],
        team: [...rivalRustboroTemplate('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_RUSTBORO_MUDKIP',
        class: 'May',
        isBoss: true,
        level: 14,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRustboroBag()],
        team: [...rivalRustboroTemplate('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_RUSTBORO_TREECKO',
        copy: 'TRAINER_MAY_RUSTBORO_TREECKO',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_RUSTBORO_TORCHIC',
        copy: 'TRAINER_MAY_RUSTBORO_TORCHIC',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_RUSTBORO_MUDKIP',
        copy: 'TRAINER_MAY_RUSTBORO_MUDKIP',
        class: 'Brendan',
    },
    // Route 106
    {
        id: 'TRAINER_NED',
        class: 'Fisherman',
        reward: ['Life Orb'],
        level: 16,
        bag: ['Life Orb', ...getSampleItemsFromArray(rivalRustboroBag(), 3)],
        team: generatePokemonsWithDefinition(POKEDEF_BAD, 6),
    },
    {
        id: 'TRAINER_ELLIOT_1',
        class: 'Fisherman',
        reward: ['SPECIES_CHARMANDER'],
        level: 16,
        bag: getSampleItemsFromArray(rivalRustboroBag(), 4),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_CHARMANDER'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 5),
        ],
    },
    {
        id: 'TRAINER_ANDRES_1',
        class: 'Ruin Maniac',
        reward: ['Ability Capsule'],
        level: 16,
        bag: getSampleItemsFromArray(rivalRustboroBag(), 4),
        team: generatePokemonsWithDefinition(POKEDEF_BAD, 6),
    },
    {
        id: 'TRAINER_JOSUE',
        class: 'Bird Keeper',
        reward: [...choicesDewfordTMs],
        level: 16,
        bag: getSampleItemsFromArray(rivalRustboroBag(), 1),
        tms: ['MOVE_BRICK_BREAK', 'MOVE_SHADOW_BALL', 'MOVE_PSYCHIC'],
        team: [
            {
                ...POKEDEF_BAD,
                type: [POKEMON_TYPE_FIGHTING],
            },
            {
                ...POKEDEF_BAD,
                type: [POKEMON_TYPE_GHOST],
            },
            {
                ...POKEDEF_BAD,
                type: [POKEMON_TYPE_PSYCHIC],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 3),
        ],
    },
    // Dewford Gym
    {
        id: 'TRAINER_BRAWLY_1',
        class: 'Leader Brawly',
        level: 16,
        reward: ['GYM_REWARD_2'],
        isBoss: true,
        bag: [...brawlyBag(), 'Fighting Gem'],
        tms: ['MOVE_BULK_UP', 'MOVE_BULK_UP'],
        bannedItems: ['Flame Orb', 'Toxic Orb'],
        team: [
            gymIsChangedType[1] ? {
                ...POKEDEF_BAD,
                type: [gymMainTypes[1]],
                abilities: ['GUTS'],
                item: 'Flame Orb',
                fallback: [
                    {
                        ...POKEDEF_BAD,
                        type: [gymMainTypes[1]],
                        abilities: ['POISON_HEAL'],
                        item: 'Toxic Orb',
                    },
                    {
                        ...POKEDEF_WEAK,
                        type: [gymMainTypes[1]],
                    },
                ],
            } : {
                specific: 'SPECIES_MAKUHITA',
                tryToHaveMove: ['MOVE_BULK_UP', 'MOVE_FAKE_OUT', 'MOVE_ROCK_TOMB'],
                nature: NATURES.ADAMANT.name,
                abilities: ['GUTS'],
                item: 'Flame Orb',
            },
            {
                ...POKEDEF_WEAK,
                type: [gymMainTypes[1]],
            },
            {
                ...POKEDEF_WEAK,
                type: [gymMainTypes[1]],
            },
            {
                ...POKEDEF_BAD,
                type: [gymMainTypes[1]],
            },
            {
                ...POKEDEF_BAD,
                type: [gymMainTypes[1]],
            },
            {
                ...POKEDEF_BAD,
                type: [gymMainTypes[1]],
            },
        ],
    },
    // Granite Cave
    {
        id: 'TRAINER_STEVEN',
        class: 'Steven',
        level: 19,
        isBoss: true,
        bag: [...stevenBag(), 'Steel Gem'],
        tms: ['MOVE_STEEL_WING', 'MOVE_STEEL_WING'],
        team: [
            {
                ...POKEDEF_WEAK,
                type: [POKEMON_TYPE_STEEL],
            },
            {
                ...POKEDEF_WEAK,
                type: [POKEMON_TYPE_STEEL],
            },
            {
                oneOf: stevenPokemon,
                tryEvolve: true,
            },
            {
                oneOf: stevenPokemon,
                tryEvolve: true,
            },
            {
                oneOf: stevenPokemon,
                tryEvolve: true,
            },
            {
                ...POKEDEF_BAD,
                type: [POKEMON_TYPE_STEEL],
            },
        ],
    },
    // Route 106
    {
        id: 'TRAINER_LOLA_1',
        class: 'Tuber F',
        reward: ['SPECIES_BULBASAUR'],
        level: 21,
        bag: getSampleItemsFromArray(stevenBag(), 5),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_BULBASAUR'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 1),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 4),
        ],
    },
    {
        id: 'TRAINER_EDMOND',
        class: 'Sailor',
        reward: ['Ability Capsule'],
        level: 21,
        bag: getSampleItemsFromArray(stevenBag(), 5),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 1),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 5),
        ]
    },
    {
        id: 'TRAINER_HAILEY',
        class: 'Tuber F',
        reward: ['Loaded Dice'],
        level: 21,
        bag: getSampleItemsFromArray(stevenBag(), 4),
        team: [
            {
                ...POKEDEF_BAD,
                item: 'Loaded Dice',
                mustHaveOneOfMoves: goodMultiHitMoves,
                tryToHaveMove: multiHitMoves,
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 1),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 4),
        ],
    },
    {
        id: 'TRAINER_CHANDLER',
        class: 'Tuber M',
        reward: ['Heat Rock', 'Damp Rock', 'Smooth Rock', 'Icy Rock'],
        level: 21,
        bag: getSampleItemsFromArray(stevenBag(), 3),
        team: [
            pokeDefDrizzleMon(POKEDEF_BAD),
            pokeDefDroughtMon(POKEDEF_BAD),
            pokeDefSandStreamMon(POKEDEF_BAD),
            pokeDefSnowWarningMon(POKEDEF_BAD),
            {
                ...POKEDEF_WEAK,
                abilities: [...rainAbilities, ...sunAbilities, ...sandAbilities, ...snowAbilities],
            },
            {
                specific: 'SPECIES_CASTFORM_NORMAL',
                tryToHaveMove: ['MOVE_HEADBUTT', 'MOVE_WATER_PULSE', 'MOVE_POWDER_SNOW', 'MOVE_SHADOW_BALL'],
            },
        ],
    },
    {
        id: 'TRAINER_RICKY_1',
        class: 'Tuber M',
        reward: ['Random Defensive Mint'],
        level: 21,
        bag: getSampleItemsFromArray(stevenBag(), 5),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 1),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 5),
        ]
    },
    {
        id: 'TRAINER_HUEY',
        class: 'Sailor',
        reward: ['Random Offensive Mint'],
        level: 21,
        bag: getSampleItemsFromArray(stevenBag(), 5),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 1),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 5),
        ]
    },
    {
        id: 'TRAINER_GRUNT_MUSEUM_1',
        class: 'Aqua Grunt M',
        isBoss: true,
        level: 21,
        preventShuffle: true,
        bag: [...slateportGruntsBag()],
        team: [
            pokeDefDrizzleMon(POKEDEF_BAD),
            {
                ...POKEDEF_BAD,
                abilities: [...rainAbilities],
            },
            {
                ...POKEDEF_BAD,
                abilities: [...rainAbilities],
            },
            pokeDefDrizzleMon(POKEDEF_BAD),
            {
                ...POKEDEF_BAD,
                abilities: [...rainAbilities],
            },
            {
                ...POKEDEF_BAD,
                abilities: [...rainAbilities],
            },
        ],
    },
    {
        id: 'TRAINER_GRUNT_MUSEUM_2',
        class: 'Aqua Grunt M',
        isBoss: true,
        level: 21,
        preventShuffle: true,
        bag: [...slateportGruntsBag()],
        team: [
            pokeDefSnowWarningMon(POKEDEF_BAD),
            {
                ...POKEDEF_BAD,
                abilities: [...snowAbilities],
            },
            {
                ...POKEDEF_BAD,
                abilities: [...snowAbilities],
            },
            pokeDefSnowWarningMon(POKEDEF_BAD),
            {
                ...POKEDEF_BAD,
                abilities: [...snowAbilities],
            },
            {
                ...POKEDEF_BAD,
                abilities: [...snowAbilities],
            },
        ],
    },
    // Route 110
    {
        id: 'TRAINER_ISABEL_1',
        class: 'Pokefan F',
        reward: [...choice110TMs],
        level: 23,
        bag: [...choice110TMs, ...getSampleItemsFromArray(slateportGruntsBag(), 3)],
        team: [
            {
                ...POKEDEF_BAD,
                type: [POKEMON_TYPE_DRAGON],
            },
            {
                ...POKEDEF_WEAK,
                type: [POKEMON_TYPE_GROUND],
            },
            {
                ...POKEDEF_WEAK,
                type: [POKEMON_TYPE_FIGHTING],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 3),
        ],
    },
    {
        id: 'TRAINER_KALEB',
        class: 'Pokefan M',
        reward: ['Terrain Extender'],
        level: 23,
        bag: getSampleItemsFromArray(slateportGruntsBag(), 3),
        team: [
            pokeDefGrassySurgeMon(POKEDEF_BAD),
            {
                ...POKEDEF_WEAK,
                tryEvolve: true,
                item: 'Grassy Seed',
            },
            {
                ...POKEDEF_WEAK,
                tryEvolve: true,
                item: 'Grassy Seed',
            },
            {
                ...POKEDEF_BAD,
                type: [POKEMON_TYPE_GRASS],
            },
            {
                ...POKEDEF_BAD,
                type: [POKEMON_TYPE_GRASS],
            },
            {
                ...POKEDEF_BAD,
                type: [POKEMON_TYPE_GRASS],
            },
        ],
    },
    {
        id: 'TRAINER_TIMMY',
        class: 'Youngster',
        reward: ['Air Balloon'],
        level: 23,
        bag: ['Air Balloon', ...getSampleItemsFromArray(slateportGruntsBag(), 5)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 2),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 4),
        ]
    },
    {
        id: 'TRAINER_EDWARD',
        class: 'Psychic M',
        reward: ['SPECIES_ELECTRIKE'],
        level: 23,
        bag: getSampleItemsFromArray(slateportGruntsBag(), 6),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ELECTRIKE'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 1),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 4),
        ],
    },
    // Route 103 (later)
    {
        id: 'TRAINER_DAISY',
        class: 'Aroma Lady',
        reward: ['Random Offensive Mint'],
        level: 23,
        bag: getSampleItemsFromArray(slateportGruntsBag(), 6),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 2),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 4),
        ]
    },
    {
        id: 'TRAINER_MARCOS',
        class: 'Guitarist',
        reward: ['Random Defensive Mint'],
        level: 23,
        bag: getSampleItemsFromArray(slateportGruntsBag(), 6),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 2),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 4),
        ]
    },
    {
        id: 'TRAINER_ANDREW',
        class: 'Fisherman',
        reward: ['Ability Capsule'],
        level: 23,
        bag: getSampleItemsFromArray(slateportGruntsBag(), 6),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 2),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 4),
        ]
    },
    // Route 110 Again
    {
        id: 'TRAINER_MAY_ROUTE_110_TREECKO',
        class: 'May',
        isBoss: true,
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRoute110Bag()],
        team: [...rivalRoute110Template('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_110_TORCHIC',
        class: 'May',
        isBoss: true,
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRoute110Bag()],
        team: [...rivalRoute110Template('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_110_MUDKIP',
        class: 'May',
        isBoss: true,
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRoute110Bag()],
        team: [...rivalRoute110Template('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_110_TREECKO',
        copy: 'TRAINER_MAY_ROUTE_110_TREECKO',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_110_TORCHIC',
        copy: 'TRAINER_MAY_ROUTE_110_TORCHIC',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_110_MUDKIP',
        copy: 'TRAINER_MAY_ROUTE_110_MUDKIP',
        class: 'Brendan',
    },
    // Route 110 after rival
        {
        id: 'TRAINER_DALE',
        class: 'Fisherman',
        reward: ['SPECIES_MANECTRIC'],
        level: 25,
        bag: getSampleItemsFromArray(rivalRoute110Bag(), 7),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_MANECTRIC'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 2),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 3)
        ],
    },
    {
        id: 'TRAINER_EDWIN_1',
        class: 'Collector',
        reward: ['Lum Berry'],
        level: 25,
        bag: ['Lum Berry', ...getSampleItemsFromArray(rivalRoute110Bag(), 6)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 3),
        ],
    },
    {
        id: 'TRAINER_JOSEPH',
        class: 'Guitarist',
        reward: [...choiceJosephSeeds],
        level: 25,
        team: [
            pokeDefPsychicSurgeMon(POKEDEF_BAD, 'Psychic Seed'),
            pokeDefMistySurgeMon(POKEDEF_BAD, 'Misty Seed'),
            pokeDefElectricSurgeMon(POKEDEF_BAD, 'Electric Seed'),
            pokeDefGrassySurgeMon(POKEDEF_BAD, 'Grassy Seed'),
            {
                ...POKEDEF_WEAK,
                type: [POKEMON_TYPE_PSYCHIC, POKEMON_TYPE_FAIRY, POKEMON_TYPE_ELECTRIC, POKEMON_TYPE_GRASS],
            },
            {
                ...POKEDEF_WEAK,
                type: [POKEMON_TYPE_PSYCHIC, POKEMON_TYPE_FAIRY, POKEMON_TYPE_ELECTRIC, POKEMON_TYPE_GRASS],
            },
        ],
    },
    // Route 118
    {
        id: 'TRAINER_DALTON_1',
        class: 'Guitarist',
        reward: ['SPECIES_CARVANHA'],
        level: 25,
        bag: getSampleItemsFromArray(rivalRoute110Bag(), 7),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_CARVANHA'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 2),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 3),
        ],
    },
    {
        id: 'TRAINER_DEANDRE',
        class: 'Youngster',
        reward: ['Random Defensive Mint'],
        level: 25,
        bag: getSampleItemsFromArray(rivalRoute110Bag(), 7),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
            ...generatePokemonsWithDefinition(POKEDEF_BAD, 3),
        ],
    },
    // Wally
    {
        id: 'TRAINER_WALLY_MAUVILLE',
        class: 'Wally',
        isBoss: true,
        level: 25,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...wallyBag()],
        team: [
            {
                id: 'WALLY_1',
                megaTier: [TIER_PREMIUM, TIER_LEGEND],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                checkValidEvo: true,
            },
            {
                id: 'WALLY_2',
                evolutionTier: [TIER_PREMIUM],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                checkValidEvo: true,
            },
            {
                id: 'WALLY_3',
                evolutionTier: [TIER_PREMIUM],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                checkValidEvo: true,
            },
            {
                id: 'WALLY_4',
                evolutionTier: [TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                checkValidEvo: true,
            },
            {
                id: 'WALLY_5',
                evolutionTier: [TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                checkValidEvo: true,
            },
            {
                id: 'WALLY_6',
                evolutionTier: [TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                checkValidEvo: true,
            },
        ],
    },
    // Route 117
    {
        id: 'TRAINER_BRANDI',
        class: 'Psychic F',
        reward: ['SPECIES_ODDISH'],
        level: 26,
        bag: getSampleItemsFromArray(wallyBag(), 8),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ODDISH'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 5),
        ],
    },
    {
        id: 'TRAINER_ISAAC_1',
        class: 'Pokemon Breeder M',
        reward: ['SPECIES_GLOOM'],
        level: 26,
        bag: getSampleItemsFromArray(wallyBag(), 8),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_GLOOM'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 5),
        ],
    },
    {
        id: 'TRAINER_DYLAN_1',
        class: 'Running Triathlete M',
        reward: ['Random Defensive Mint'],
        level: 26,
        bag: getSampleItemsFromArray(wallyBag(), 8),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 6),
        ]
    },
    {
        id: 'TRAINER_LYDIA_1',
        class: 'Pokemon Breeder F',
        reward: ['Ability Capsule'],
        level: 26,
        bag: getSampleItemsFromArray(wallyBag(), 8),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 6),
        ]
    },
    {
        id: 'TRAINER_DEREK',
        class: 'Bug Maniac',
        reward: ['Ability Patch'],
        level: 26,
        bag: getSampleItemsFromArray(wallyBag(), 8),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 6),
        ]
    },
    {
        id: 'TRAINER_ANNA_AND_MEG_1',
        class: 'Sr And Jr',
        reward: ['MOVE_REFLECT', 'MOVE_LIGHT_SCREEN', 'Light Clay'],
        level: 26,
        bag: getSampleItemsFromArray(wallyBag(), 5),
        team: [
            {
                ...POKEDEF_WEAK,
                mustHaveOneOfMoves: ['MOVE_REFLECT'],
                tryToHaveMove: ['MOVE_REFLECT'],
                item: 'Light Clay',
            },
            {
                ...POKEDEF_WEAK,
                mustHaveOneOfMoves: ['MOVE_LIGHT_SCREEN'],
                tryToHaveMove: ['MOVE_LIGHT_SCREEN'],
                item: 'Light Clay',
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 4),
        ],
    },
    {
        id: 'TRAINER_MELINA',
        class: 'Running Triathlete F',
        reward: [...choiceMelinaBerries],
        level: 26,
        bag: getSampleItemsFromArray(wallyBag(), 5),
        team: [
            {
                ...POKEDEF_WEAK,
                weakToTypes: [POKEMON_TYPE_ELECTRIC],
                item: 'Wacan Berry',
            },
            {
                ...POKEDEF_WEAK,
                weakToTypes: [POKEMON_TYPE_FIRE],
                item: 'Occa Berry',
            },
            {
                ...POKEDEF_WEAK,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Shuca Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ],
    },
    {
        id: 'TRAINER_AISHA',
        class: 'Battle Girl',
        reward: [...choiceAishaGems],
        level: 26,
        bag: [...choiceAishaGems, ...getSampleItemsFromArray(wallyBag(), 5)],
        team: [
            {
                ...POKEDEF_WEAK,
                type: [POKEMON_TYPE_FIRE],
            },
            {
                ...POKEDEF_WEAK,
                type: [POKEMON_TYPE_GROUND],
            },
            {
                ...POKEDEF_WEAK,
                type: [POKEMON_TYPE_FIGHTING],
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ],
    },
    {
        id: 'TRAINER_MARIA_1',
        class: 'Running Triathlete F',
        reward: ['Assault Vest'],
        level: 26,
        bag: ['Assault Vest', ...getSampleItemsFromArray(wallyBag(), 7)],
        team: generatePokemonsWithDefinition(POKEDEF_WEAK, 6),
    },
    // Mauville Gym
    {
        id: 'TRAINER_WATTSON_1',
        class: 'Leader Wattson',
        isBoss: true,
        reward: ['GYM_REWARD_3'],
        level: 26,
        preventShuffle: gymIsChangedType[2],
        bag: [...wattsonBag(), 'Electric Gem'],
        tms: ['MOVE_SHOCK_WAVE', 'MOVE_SHOCK_WAVE'],
        bannedItems: ['Electric Seed', 'Psychic Seed', 'Misty Seed', 'Grassy Seed'],
        team: [
            gymIsChangedType[2] ? {
                ...POKEDEF_AVERAGE,
                type: [gymMainTypes[2]],
            } : pokeDefElectricSurgeMon({
                absoluteTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
            }),
            gymIsChangedType[2] ? {
                ...POKEDEF_MEGA,
                type: [gymMainTypes[2]],
                fallback: [
                    {
                        specific: 'SPECIES_MANECTRIC',
                        abilities: ['STATIC'],
                        tryToHaveMove: ['MOVE_THUNDER_WAVE', 'MOVE_FIRE_FANG', 'MOVE_BITE'],
                        item: 'Manectite',
                    }
                ]
            } : {
                specific: 'SPECIES_MANECTRIC',
                abilities: ['STATIC'],
                tryToHaveMove: ['MOVE_THUNDER_WAVE', 'MOVE_FIRE_FANG', 'MOVE_BITE'],
                item: 'Manectite',
            },
            gymIsChangedType[2] ? {
                ...POKEDEF_AVERAGE,
                type: [gymMainTypes[2]],
            } : {
                ...POKEDEF_AVERAGE,
                type: [gymMainTypes[2]],
                item: 'Electric Seed',
            },
            {
                ...POKEDEF_AVERAGE,
                type: [gymMainTypes[2]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [gymMainTypes[2]],
            },
            {
                ...POKEDEF_WEAK,
                type: [gymMainTypes[2]],
                tryEvolve: true,
            },
        ],
    },
    // Route 111
    {
        id: 'TRAINER_HAYDEN',
        class: 'Kindler',
        reward: ['SPECIES_DROWZEE'],
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag(), 10),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DROWZEE'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 1),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 4),
        ],
    },
    {
        id: 'TRAINER_TYRON',
        class: 'Camper',
        reward: ['ITEM_SCEPTILITE'],
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag(), 9),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_SCEPTILITE',
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 5)
        ],
    },
    {
        id: 'TRAINER_BIANCA',
        class: 'Picnicker',
        reward: ['ITEM_BLAZIKENITE'],
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag(), 9),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_BLAZIKENITE',
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 5),
        ],
    },
    {
        id: 'TRAINER_CELINA',
        class: 'Aroma Lady',
        reward: ['ITEM_SWAMPERTITE'],
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag(), 9),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_SWAMPERTITE',
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 5),
        ],
    },
    {
        id: 'TRAINER_IRENE',
        class: 'Picnicker',
        reward: ['Shed Shell'],
        level: 29,
        bag: [...getSampleItemsFromArray(wattsonBag(), 9), 'Shed Shell'],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 4),
        ]
    },
    {
        id: 'TRAINER_TRAVIS',
        class: 'Camper',
        reward: ['Sitrus Berry'],
        level: 29,
        bag: [...getSampleItemsFromArray(wattsonBag(), 9), 'Sitrus Berry'],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 4),
        ]
    },
    // Route 112
    {
        id: 'TRAINER_LARRY',
        class: 'Camper',
        reward: ['SPECIES_TAILLOW'],
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag(), 10),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_TAILLOW'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 1),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 4),
        ],
    },
    {
        id: 'TRAINER_BRICE',
        class: 'Hiker',
        reward: ['Ability Capsule'],
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag(), 10),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 4),
        ]
    },
    {
        id: 'TRAINER_CAROL',
        class: 'Cooltrainer F',
        reward: ['Random Defensive Mint'],
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag(), 10),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 4),
        ],
    },
    {
        id: 'TRAINER_TABITHA_MT_CHIMNEY',
        class: 'Magma Admin',
        isBoss: true,
        level: 29,
        preventShuffle: true,
        bag: [...magmaChimneyBag()],
        team: [
            pokeDefSandStreamMon(POKEDEF_AVERAGE),
            {
                ...POKEDEF_AVERAGE,
                abilities: [...sandAbilities],
            },
            {
                ...POKEDEF_AVERAGE,
                abilities: [...sandAbilities],
            },
            {
                ...POKEDEF_AVERAGE,
                abilities: [...sandAbilities],
            },
            {
                ...POKEDEF_WEAK,
                abilities: [...sandAbilities],
            },
            {
                ...POKEDEF_WEAK,
                abilities: [...sandAbilities],
            },
        ],
    },
    {
        id: 'TRAINER_MAXIE_MT_CHIMNEY',
        class: 'Magma Leader Maxie',
        isBoss: true,
        level: 30,
        bag: [...magmaChimneyBag()],
        team: [
            pokeDefDroughtMon(POKEDEF_AVERAGE),
            {
                specific: 'SPECIES_CAMERUPT',
                item: 'Cameruptite',
                abilities: ['SOLID_ROCK'],
            },
            {
                ...POKEDEF_AVERAGE,
                abilities: [...sunAbilities],
                type: [magmaTeamTypes[0], magmaTeamTypes[1]],
                fallback: [
                    {
                        ...POKEDEF_AVERAGE,
                        type: [...magmaTeamTypes],
                        abilities: [...sunAbilities],
                    },
                    {
                        ...POKEDEF_AVERAGE,
                        type: [magmaTeamTypes[0], magmaTeamTypes[1]],
                    },
                    {
                        ...POKEDEF_AVERAGE,
                        type: [...magmaTeamTypes],
                    }
                ],
            },
            {
                ...POKEDEF_AVERAGE,
                abilities: [...sunAbilities],
                fallback: [
                    {
                        ...POKEDEF_AVERAGE,
                        type: [...magmaTeamTypes],
                    }
                ],
            },
            {
                ...POKEDEF_AVERAGE,
                abilities: [...sunAbilities],
                fallback: [
                    {
                        ...POKEDEF_AVERAGE,
                        type: [...magmaTeamTypes],
                    }
                ],
            },
            {
                ...POKEDEF_AVERAGE,
                abilities: [...sunAbilities],
                fallback: [
                    {
                        ...POKEDEF_AVERAGE,
                        type: [...magmaTeamTypes],
                    }
                ],
            },
        ],
    },
    // Route 112
    {
        id: 'TRAINER_BRYANT',
        class: 'Kindler',
        reward: ['SPECIES_NUMEL'],
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 11),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_NUMEL'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ],
    },
    {
        id: 'TRAINER_SHAYLA',
        class: 'Aroma Lady',
        reward: ['White Herb'],
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 10),
        team: [
            {
                ...POKEDEF_AVERAGE,
                mustHaveOneOfMoves: [...whiteHerbMoves],
                tryToHaveMove: [...whiteHerbMoves],
                item: 'White Herb',
                fallback: [
                    {
                        ...POKEDEF_WEAK,
                        mustHaveOneOfMoves: [...whiteHerbMoves],
                        tryToHaveMove: [...whiteHerbMoves],
                        item: 'White Herb',
                    },
                    {
                        ...POKEDEF_AVERAGE,
                    }
                ]
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ],
    },
    // Route 111
    {
        id: 'TRAINER_WILTON_1',
        class: 'Cooltrainer M',
        reward: ['Power Herb'],
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 10),
        team: [
            {
                ...POKEDEF_WEAK_OR_AVERAGE,
                mustHaveOneOfMoves: [...majorPowerHerbMoves],
                tryToHaveMove: [...majorPowerHerbMoves],
                item: 'Power Herb',
                fallback: [
                    {
                        ...POKEDEF_WEAK_OR_AVERAGE,
                        mustHaveOneOfMoves: [...minorPowerHerbMoves],
                        tryToHaveMove: [...minorPowerHerbMoves],
                        item: 'Power Herb',
                    },
                    {
                        ...POKEDEF_AVERAGE,
                    }
                ]
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ],
    },
    // Route 113
    {
        id: 'TRAINER_JAYLEN',
        class: 'Youngster',
        reward: ['Random Niche Mint'],
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 11),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 3),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ]
    },
    {
        id: 'TRAINER_LUNG',
        class: 'Ninja Boy',
        reward: ['Random Defensive Mint'],
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 11),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 3),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ]
    },
    {
        id: 'TRAINER_WYATT',
        class: 'Pokemaniac',
        reward: ['Random Offensive Mint'],
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 11),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 3),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ]
    },
    {
        id: 'TRAINER_LAWRENCE',
        class: 'Camper',
        reward: ['SPECIES_SPINDA', 'ITEM_HARBOR_MAIL'],
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 10),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_HARBOR_MAIL',
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ],
    },
    {
        id: 'TRAINER_MADELINE_1',
        class: 'Parasol Lady',
        reward: ['Ability Capsule'],
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 11),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 3),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ]
    },
    // Route 114
    {
        id: 'TRAINER_CHARLOTTE',
        class: 'Picnicker',
        reward: ['Super Rod', 'SPECIES_SWABLU'],
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 11),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SWABLU'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ],
    },
    {
        id: 'TRAINER_STEVE_1',
        class: 'Pokemaniac',
        reward: ['SPECIES_SPOINK'],
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 11),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SPOINK'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ],
    },
    {
        id: 'TRAINER_CLAUDE',
        class: 'Fisherman',
        reward: [...choiceClaudeTMs],
        level: 33,
        bag: [...choiceClaudeTMs, ...getSampleItemsFromArray(magmaChimneyBag(), 7)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 3),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ]
    },
    {
        id: 'TRAINER_NOLAN',
        class: 'Fisherman',
        reward: ['Wide Lens', 'Zoom Lens'],
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 11),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 3),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ]
    },
    {
        id: 'TRAINER_ANGELINA',
        class: 'Picnicker',
        reward: ['Shell Bell'],
        level: 33,
        bag: ['Shell Bell', ...getSampleItemsFromArray(magmaChimneyBag(), 10)],
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 3),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ]
    },
    // Route 115
    {
        id: 'TRAINER_ALIX',
        class: 'Psychic F',
        reward: ['SPECIES_SANDSHREW'],
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 11),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SANDSHREW'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ],
    },
    {
        id: 'TRAINER_NOB_1',
        class: 'Black Belt',
        reward: [...choiceNobTMs],
        level: 33,
        bag: [...getSampleItemsFromArray(magmaChimneyBag(), 8), ...choiceNobTMs],
        team: [
            {
                ...POKEDEF_AVERAGE,
                type: [POKEMON_TYPE_GRASS],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [POKEMON_TYPE_POISON],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [POKEMON_TYPE_NORMAL],
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 3),
        ],
    },
    // Flannery Gym
    {
        id: 'TRAINER_FLANNERY_1',
        class: 'Leader Flannery',
        level: 33,
        reward: ['GYM_REWARD_4', 'Access to Desert Ruins'],
        isBoss: true,
        bag: [...flanneryBag(), 'Fire Gem'],
        tms: ['MOVE_OVERHEAT', 'MOVE_OVERHEAT'],
        team: [
            gymIsChangedType[3] ? {
                ...POKEDEF_AVERAGE,
                type: [gymMainTypes[3]],
            } : {
                specific: 'SPECIES_TORKOAL',
                abilities: ['DROUGHT'],
                item: 'Heat Rock',
                tryToHaveMove: ['MOVE_RAPID_SPIN', 'MOVE_CLEAR_SMOG', 'MOVE_SOLAR_BEAM'],
                checkValidEvo: true,
                tryEvolve: true,
            },
            {
                isMega: true,
                absoluteTier: [TIER_PREMIUM, TIER_LEGEND],
                type: [gymMainTypes[3]],
                checkValidEvo: true,
                tryEvolve: true,
                fallback: [
                    {
                        isMega: true,
                        absoluteTier: [TIER_AVERAGE, TIER_STRONG, TIER_PREMIUM, TIER_LEGEND],
                        type: [gymMainTypes[3]],
                        checkValidEvo: true,
                        tryEvolve: true,
                    },
                    {
                        absoluteTier: [TIER_PREMIUM],
                        checkValidEvo: true,
                        type: [gymMainTypes[3]],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        checkValidEvo: true,
                        type: [gymMainTypes[3]],
                    }
                ],
            },
            {
                ...POKEDEF_STRONG,
                type: [gymMainTypes[3]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [gymMainTypes[3]],
            },
            gymIsChangedType[3] ? {
                ...POKEDEF_AVERAGE,
                type: [gymMainTypes[3]],
            } : {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                type: [gymMainTypes[3]],
                abilities: [...sunAbilities],
                pickBest: true,
                fallback: [
                    {
                        ...POKEDEF_AVERAGE,
                        type: [gymMainTypes[3]],
                    },
                ]
            },
            {
                ...POKEDEF_AVERAGE,
                type: [gymMainTypes[3]],
            },
        ],
    },
    // Route 111
    {
        id: 'TRAINER_CELIA',
        class: 'Picnicker',
        reward: ['SPECIES_TRAPINCH'],
        level: 36,
        bag: getSampleItemsFromArray(flanneryBag(), 13),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_TRAPINCH'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 5),
        ],
    },
    {
        id: 'TRAINER_BEAU',
        class: 'Camper',
        reward: ['Master Ball'],
        level: 36,
        bag: getSampleItemsFromArray(flanneryBag(), 13),
        team: generatePokemonsWithDefinition(POKEDEF_AVERAGE, 6),
    },
    {
        id: 'TRAINER_BRANDEN',
        class: 'Camper',
        reward: ['Strong Pokemon'],
        level: 36,
        bag: getSampleItemsFromArray(flanneryBag(), 13),
        team: genericAverageWith1StrongTeamTemplate(),
    },
    {
        id: 'TRAINER_DREW',
        class: 'Camper',
        reward: ['Yache Berry', 'Coba Berry', 'Chilan Berry'],
        level: 36,
        bag: ['Yache Berry', 'Coba Berry', ...getSampleItemsFromArray(flanneryBag(), 10)],
        team: [
            {
                ...POKEDEF_AVERAGE,
                item: 'Chilan Berry',
            },
            {
                ...POKEDEF_AVERAGE,
                weakToTypes: [POKEMON_TYPE_ICE],
            },
            {
                ...POKEDEF_AVERAGE,
                weakToTypes: [POKEMON_TYPE_FLYING],
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 3),
        ]
    },
    {
        id: 'TRAINER_BECKY',
        class: 'Picnicker',
        reward: ['Random Defensive Mint'],
        level: 36,
        bag: getSampleItemsFromArray(flanneryBag(), 13),
        team: generatePokemonsWithDefinition(POKEDEF_AVERAGE, 6),
    },
    {
        id: 'TRAINER_BRYAN',
        class: 'Ruin Maniac',
        reward: ['Ability Patch'],
        level: 36,
        bag: getSampleItemsFromArray(flanneryBag(), 13),
        team: generatePokemonsWithDefinition(POKEDEF_AVERAGE, 6),
    },
    {
        id: 'TRAINER_HEIDI',
        class: 'Picnicker',
        reward: [...choiceHeidiItems],
        level: 36,
        bag: [...choiceHeidiItems, ...getSampleItemsFromArray(flanneryBag(), 10)],
        team: generatePokemonsWithDefinition(POKEDEF_AVERAGE, 6),
    },
    {
        id: 'TRAINER_DUSTY_1',
        class: 'Ruin Maniac',
        reward: ['Safety Goggles'],
        level: 36,
        bag: ['Safety Goggles', ...getSampleItemsFromArray(flanneryBag(), 12)],
        team: generatePokemonsWithDefinition(POKEDEF_AVERAGE, 6),
    },
    {
        id: 'TRAINER_NORMAN_1',
        class: 'Leader Norman',
        level: 36,
        isBoss: true,
        reward: ['GYM_REWARD_5', 'Access to Island Cave', 'Access to New Mauville'],
        bag: [...normanBag(), 'Normal Gem'],
        tms: ['MOVE_FACADE', 'MOVE_FACADE'],
        bannedItems: gymIsChangedType[4] ? [] : ['Assault Vest', 'Flame Orb', 'Toxic Orb'],
        team: [
            gymIsChangedType[4] ? {
                ...POKEDEF_STRONG,
                type: [gymMainTypes[4]],
            } : {
                specific: 'SPECIES_SLAKING',
                item: 'Assault Vest',
                tryToHaveMove: ['MOVE_FIRE_BLAST', 'MOVE_EARTHQUAKE', 'MOVE_FACADE', 'MOVE_SUCKER_PUNCH'],
            },
            gymIsChangedType[4] ? {
                ...POKEDEF_STRONG,
                type: [gymMainTypes[4]],
            } : {
                ...POKEDEF_STRONG,
                abilities: ['GUTS'],
                mustHaveOneOfMoves: ['MOVE_FACADE'],
                tryToHaveMove: ['MOVE_FACADE', 'MOVE_PROTECT'],
                type: [gymMainTypes[4]],
                item: 'Flame Orb',
                fallback: [
                    {
                        ...POKEDEF_WEAK_OR_AVERAGE,
                        abilities: ['GUTS'],
                        mustHaveOneOfMoves: ['MOVE_FACADE', 'MOVE_PROTECT'],
                        type: [gymMainTypes[4]],
                        item: 'Flame Orb',
                        pickBest: true,
                    },
                    {
                        ...POKEDEF_STRONG,
                        mustHaveOneOfMoves: ['MOVE_FACADE'],
                    },
                ]
            },
            {
                ...POKEDEF_STRONG,
                type: [gymMainTypes[4]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [gymMainTypes[4]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [gymMainTypes[4]],
            },
            {
                isMega: true,
                absoluteTier: [TIER_PREMIUM, TIER_LEGEND],
                type: [gymMainTypes[4]],
                checkValidEvo: true,
                tryEvolve: true,
                fallback: [
                   {
                        isMega: true,
                        absoluteTier: [TIER_STRONG, TIER_PREMIUM, TIER_LEGEND],
                        type: [gymMainTypes[4]],
                        checkValidEvo: true,
                        tryEvolve: true,
                   },
                   {
                        absoluteTier: [TIER_PREMIUM],
                        type: [gymMainTypes[4]],
                        checkValidEvo: true,
                   },
                   {
                        absoluteTier: [TIER_STRONG],
                        type: [gymMainTypes[4]],
                        checkValidEvo: true,
                   }
                ]
            },
        ],
    },
    // Route 105 (Island Cave)
    {
        id: 'TRAINER_BEVERLY',
        class: 'Swimmer F',
        reward: ['Access to Island Cave'],
        level: 39,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericAverageWith1StrongTeamTemplate(),
    },
    {
        id: 'TRAINER_IMANI',
        class: 'Swimmer F',
        reward: ['Master Ball'],
        level: 39,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericAverageWith1StrongTeamTemplate(),
    },
    {
        id: 'TRAINER_FOSTER',
        class: 'Ruin Maniac',
        reward: ['Strong Pokemon'],
        level: 39,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericAverageWith2StrongTeamTemplate(),
    },
    // Route 110 (New Mauville)
    {
        id: 'TRAINER_JACLYN',
        class: 'Psychic F',
        reward: ['Master Ball'],
        level: 39,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericAverageWith2StrongTeamTemplate(),
    },
    {
        id: 'TRAINER_ABIGAIL_1',
        class: 'Cycling Triathlete F',
        reward: ['Strong Pokemon'],
        level: 39,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericAverageWith3StrongTeamTemplate(),
    },
    // Route 118
    {
        id: 'TRAINER_PERRY',
        class: 'Bird Keeper',
        reward: ['SPECIES_DEDENNE'],
        level: 39,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DEDENNE'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 1),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 4),
        ],
    },
    {
        id: 'TRAINER_WADE',
        class: 'Fisherman',
        reward: [...choiceWadeBerries],
        level: 39,
        bag: [...choiceWadeBerries, ...getSampleItemsFromArray(normanBag(), 11)],
        team: genericAverageWith2StrongTeamTemplate(),
    },
    {
        id: 'TRAINER_BARNY',
        class: 'Fisherman',
        reward: ['Ability Capsule'],
        level: 39,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericAverageWith2StrongTeamTemplate(),
    },
    {
        id: 'TRAINER_ROSE_1',
        class: 'Aroma Lady',
        reward: ['Random Offensive Mint'],
        level: 39,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericAverageWith2StrongTeamTemplate(),
    },
    {
        id: 'TRAINER_CHESTER',
        class: 'Bird Keeper',
        reward: [...choiceChesterTMs],
        level: 39,
        bag: [...choiceChesterTMs, ...getSampleItemsFromArray(normanBag(), 12)],
        team: [
            {
                ...POKEDEF_AVERAGE,
                type: [POKEMON_TYPE_ELECTRIC],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [POKEMON_TYPE_ICE],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [POKEMON_TYPE_ELECTRIC],
            },
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 2),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 1),
        ],
    },
    // Route 119
    {
        id: 'TRAINER_KENT',
        class: 'Bug Catcher',
        reward: ['SPECIES_LINOONE'],
        level: 39,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_LINOONE'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 1),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 4),
        ],
    },
    {
        id: 'TRAINER_BRENT',
        class: 'Bug Maniac',
        reward: ['SPECIES_SERVINE', 'SPECIES_SNIVY'],
        level: 39,
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
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 4),
        ],
    },
    {
        id: 'TRAINER_DOUG',
        class: 'Bug Catcher',
        reward: ['Random Defensive Mint'],
        level: 39,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericAverageWith2StrongTeamTemplate(),
    },
    {
        id: 'TRAINER_TAYLOR',
        class: 'Bug Maniac',
        reward: ['Random Offensive Mint'],
        level: 39,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericAverageWith2StrongTeamTemplate(),
    },
    // Weather Institute
    {
        id: 'TRAINER_SHELLY_WEATHER_INSTITUTE',
        class: 'Aqua Admin F',
        level: 39,
        isBoss: true,
        bag: [...shellyBag()],
        team: [
            {
                ...POKEDEF_STRONG,
                type: [aquaTeamTypes[0]],
            },
            {
                ...POKEDEF_STRONG,
                type: [aquaTeamTypes[1]],
            },
            {
                ...POKEDEF_STRONG,
                type: [aquaTeamTypes[2]],
            },
            {
                ...POKEDEF_STRONG,
                type: [aquaTeamTypes[3]],
            },
            {
                ...POKEDEF_STRONG,
                type: [aquaTeamTypes[4]],
            },
            {
                isMega: true,
                absoluteTier: [TIER_STRONG, TIER_PREMIUM],
                checkValidEvo: true,
                tryEvolve: true,
                type: [...aquaTeamTypes],
            },
        ],
    },
    // Route 119 continued
    {
        id: 'TRAINER_FABIAN',
        class: 'Guitarist',
        reward: ['Leftovers'],
        level: 41,
        bag: ['Leftovers', ...getSampleItemsFromArray(shellyBag(), 15)],
        team: generic2Average3Strong1MegaTeamTemplate(),
    },
    // Route 119 Rival Battles
    {
        id: 'TRAINER_MAY_ROUTE_119_TREECKO',
        class: 'May',
        isBoss: true,
        level: 41,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rival119Bag()],
        team: [...rivalRoute119Template('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_119_TORCHIC',
        class: 'May',
        isBoss: true,
        level: 41,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rival119Bag()],
        team: [...rivalRoute119Template('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_119_MUDKIP',
        class: 'May',
        isBoss: true,
        level: 41,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rival119Bag()],
        team: [...rivalRoute119Template('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_119_TREECKO',
        copy: 'TRAINER_MAY_ROUTE_119_TREECKO',
        class: 'May',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_119_TORCHIC',
        copy: 'TRAINER_MAY_ROUTE_119_TORCHIC',
        class: 'May',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_119_MUDKIP',
        copy: 'TRAINER_MAY_ROUTE_119_MUDKIP',
        class: 'May',
    },
    // Route 119 continued
    {
        id: 'TRAINER_LEONEL',
        class: 'Cooltrainer M',
        reward: ['SPECIES_SANDILE'],
        level: 43,
        bag: getSampleItemsFromArray(rival119Bag(), 17),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SANDILE'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 2),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 3),
        ],
    },
    {
        id: 'TRAINER_ROBERT_1',
        class: 'Bird Keeper',
        reward: ['Access to Scorched Slab'],
        level: 43,
        bag: getSampleItemsFromArray(rival119Bag(), 17),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_KROOKODILE'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_KROKOROK'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 1),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 3),
        ],
    },
    {
        id: 'TRAINER_COLIN',
        class: 'Bird Keeper',
        reward: ['SPECIES_KROOKODILE', 'SPECIES_KROKOROK', 'SPECIES_RIBOMBEE', 'ITEM_ORANGE_MAIL'],
        level: 43,
        bag: getSampleItemsFromArray(rival119Bag(), 17),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_ORANGE_MAIL',
            },
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 2),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 3),
        ],
    },
    {
        id: 'TRAINER_CLARISSA',
        class: 'Parasol Lady',
        reward: [...choiceClarissaItems],
        level: 43,
        bag: getSampleItemsFromArray(rival119Bag(), 14),
        team: [
            {
                ...POKEDEF_STRONG,
                item: 'Mirror Herb',
            },
            {
                ...POKEDEF_STRONG,
                item: 'Adrenaline Orb',
            },
            {
                ...POKEDEF_STRONG,
                item: 'Red Card',
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 3),
        ]
    },
    {
        id: 'TRAINER_ANGELICA',
        class: 'Parasol Lady',
        reward: ['Random Offensive Mint'],
        level: 43,
        bag: getSampleItemsFromArray(rival119Bag(), 17),
        team: generic3Average3StrongTeamTemplate(),
    },
    // Fortree City Gym
    {
        id: 'TRAINER_WINONA_1',
        class: 'Leader Winona',
        level: 43,
        isBoss: true,
        reward: ['GYM_REWARD_6', 'Access to Ancient Tomb'],
        bag: [...winonaBag(), 'Flying Gem'],
        tms: ['MOVE_AERIAL_ACE', 'MOVE_AERIAL_ACE'],
        team: [
            {
                ...POKEDEF_STRONG,
                type: [gymMainTypes[5]],
                mustHaveOneOfMoves: ['MOVE_TAILWIND'],
                tryToHaveMove: ['MOVE_TAILWIND'],
                fallback: [
                    {
                        ...POKEDEF_AVERAGE,
                        type: [gymMainTypes[5]],
                        mustHaveOneOfMoves: ['MOVE_TAILWIND'],
                        tryToHaveMove: ['MOVE_TAILWIND'],
                        pickBest: true,
                    },
                    {
                        ...POKEDEF_STRONG,
                        type: [gymMainTypes[5]],
                    }
                ]
            },
            gymIsChangedType[5] ? {
                isMega: true,
                absoluteTier: [TIER_PREMIUM, TIER_LEGEND],
                type: [gymMainTypes[5]],
                checkValidEvo: true,
                tryEvolve: true,
                fallback: [
                   {
                        isMega: true,
                        absoluteTier: [TIER_STRONG, TIER_PREMIUM, TIER_LEGEND],
                        type: [gymMainTypes[5]],
                        checkValidEvo: true,
                        tryEvolve: true,
                   },
                   {
                        absoluteTier: [TIER_PREMIUM],
                        type: [gymMainTypes[5]],
                        checkValidEvo: true,
                   },
                   {
                        absoluteTier: [TIER_STRONG],
                        type: [gymMainTypes[5]],
                        checkValidEvo: true,
                   }
                ]
            } : {
                specific: 'SPECIES_ALTARIA',
                item: 'Altarianite',
                tryToHaveMove: ['MOVE_FACADE', 'MOVE_DRAGON_PULSE', 'MOVE_HYPER_BEAM'],
            },
            {
                ...POKEDEF_PREMIUM,
                type: [gymMainTypes[5]],
            },
            {
                ...POKEDEF_STRONG,
                type: [gymMainTypes[5]],
            },
            {
                ...POKEDEF_STRONG,
                type: [gymMainTypes[5]],
            },
            {
                ...POKEDEF_STRONG,
                type: [gymMainTypes[5]],
            },
        ],
    },
    // Route 120 After Gym
    {
        id: 'TRAINER_JEFFREY_1',
        class: 'Bug Maniac',
        reward: ['Master Ball'],
        level: 46,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: generic2Average3Strong1MegaTeamTemplate(),
    },
    {
        id: 'TRAINER_CHIP',
        class: 'Ruin Maniac',
        reward: ['Access to Premium Pokemon'],
        level: 46,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: generic2Average2Strong1Premium1MegaTeamTemplate(),
    },
    // Route 121
    {
        id: 'TRAINER_MARCEL',
        class: 'Cooltrainer M',
        reward: ['SPECIES_SHUPPET', 'SPECIES_METAPOD', 'SPECIES_HONEDGE'],
        level: 46,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SHUPPET'],
                tryEvolve: true,
            },
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
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 3),
        ],
    },
    {
        id: 'TRAINER_CALE',
        class: 'Bug Maniac',
        reward: ['Focus Sash'],
        level: 46,
        bag: getSampleItemsFromArray(winonaBag(), 17),
        team: [
            {
                ...POKEDEF_AVERAGE,
                item: 'Focus Sash',
            },
            { ...POKEDEF_STRONG_PREMIUM_MEGA },
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 3),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 1),
        ],
    },
    {
        id: 'TRAINER_TAMMY',
        class: 'Hex Maniac',
        reward: [...choiceTammyTMs],
        level: 46,
        bag: getSampleItemsFromArray(winonaBag(), 15),
        team: [
            {
                ...POKEDEF_STRONG,
                mustHaveOneOfMoves: ['MOVE_SLEEP_TALK'],
                tryToHaveMove: ['MOVE_REST', 'MOVE_SLEEP_TALK'],
            },
            {
                ...POKEDEF_STRONG_PREMIUM_MEGA,
                type: [POKEMON_TYPE_POISON],
                mustHaveOneOfMoves: ['MOVE_TOXIC'],
                tryToHaveMove: ['MOVE_TOXIC', 'MOVE_PROTECT'],
                fallback: [
                    {
                        isMega: true,
                        mustHaveOneOfMoves: ['MOVE_TOXIC'],
                        tryToHaveMove: ['MOVE_TOXIC', 'MOVE_PROTECT'],
                    },
                    {
                        isMega: true,
                    },
                ],
            },
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 2),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
        ],
    },
    {
        id: 'TRAINER_JESSICA_1',
        class: 'Beauty',
        reward: ['Ability Capsule'],
        level: 46,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: generic2Average3Strong1MegaTeamTemplate(),
    },
    {
        id: 'TRAINER_MYLES',
        class: 'Pokemon Breeder M',
        reward: ['Ability Patch'],
        level: 46,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: generic2Average3Strong1MegaTeamTemplate(),
    },
    {
        id: 'TRAINER_WALTER_1',
        class: 'Gentleman',
        reward: ['Random Defensive Mint'],
        level: 46,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: generic2Average3Strong1MegaTeamTemplate(),
    },
    {
        id: 'TRAINER_PAT',
        class: 'Pokemon Breeder F',
        reward: ['Random Offensive Mint'],
        level: 46,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: generic2Average3Strong1MegaTeamTemplate(),
    },
    {
        id: 'TRAINER_CRISTIN_1',
        class: 'Cooltrainer F',
        reward: [...choiceCristinBerries],
        level: 46,
        bag: getSampleItemsFromArray(winonaBag(), 15),
        team: [
            {
                ...POKEDEF_STRONG,
                weakToTypes: [POKEMON_TYPE_PSYCHIC],
                item: 'Payapa Berry',
            },
            {
                ...POKEDEF_STRONG,
                weakToTypes: [POKEMON_TYPE_DARK],
                item: 'Colbur Berry',
            },
            {
                ...POKEDEF_STRONG,
                weakToTypes: [POKEMON_TYPE_BUG],
                item: 'Tanga Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            { ...POKEDEF_STRONG_PREMIUM_MEGA },
        ],
    },
    // Lillycove Wally Rival
    {
        id: 'TRAINER_WALLY_LILYCOVE',
        class: 'Wally',
        isBoss: true,
        level: 46,
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
        class: 'Magma Leader Maxie',
        isBoss: true,
        level: 48,
        preventShuffle: true,
        bag: [...wallyBag2()],
        team: [
            {
                abilities: ['DROUGHT'],
                item: 'Heat Rock',
                absoluteTier: [TIER_STRONG, TIER_AVERAGE],
                checkValidEvo: true,
                pickBest: true,
            },
            {
                specific: 'SPECIES_CAMERUPT',
                item: 'Cameruptite',
                abilities: ['SOLID_ROCK'],
            },
            {
                absoluteTier: [TIER_PREMIUM],
                checkValidEvo: true,
                type: [magmaTeamTypes[1]],
                abilities: [...sunAbilities],
                fallback: [
                    {
                        absoluteTier: [TIER_PREMIUM],
                        checkValidEvo: true,
                        type: [magmaTeamTypes[1]],
                    },
                ]
            },
            pokeDefDroughtMon(POKEDEF_STRONG),
            {
                absoluteTier: [TIER_PREMIUM],
                checkValidEvo: true,
                type: [...magmaTeamTypes],
                abilities: [...sunAbilities],
                fallback: [
                    {
                        absoluteTier: [TIER_PREMIUM],
                        checkValidEvo: true,
                        abilities: [...sunAbilities],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        checkValidEvo: true,
                        type: [...magmaTeamTypes],
                        abilities: [...sunAbilities],
                    },
                    {
                        absoluteTier: [TIER_PREMIUM],
                        checkValidEvo: true,
                        type: [...magmaTeamTypes],
                    }
                ]
            },
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                type: [...magmaTeamTypes],
                abilities: [...sunAbilities],
                fallback: [
                    {
                        absoluteTier: [TIER_STRONG],
                        checkValidEvo: true,
                        abilities: [...sunAbilities],
                    },
                    {
                        absoluteTier: [TIER_AVERAGE],
                        checkValidEvo: true,
                        type: [...magmaTeamTypes],
                        abilities: [...sunAbilities],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        checkValidEvo: true,
                        type: [...magmaTeamTypes],
                    }
                ]
            },
        ],
    },
    // Mt. Pyre
    {
        id: 'TRAINER_MARK',
        class: 'Pokemaniac',
        reward: ['SPECIES_SPINARAK', 'SPECIES_ARIADOS', 'SPECIES_SPIDOPS'],
        level: 51,
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
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 3),
        ],
    },
    // Aqua Hideout
    {
        id: 'TRAINER_MATT',
        class: 'Aqua Admin M',
        isBoss: true,
        level: 51,
        preventShuffle: true,
        bag: [...wallyBag2()],
        team: [
            {
                isMega: true,
                checkValidEvo: true,
                pickBest: true,
                abilities: ['SNOW_WARNING'],
                fallback: [
                    {
                        absoluteTier: [TIER_PREMIUM],
                        isMega: true,
                        type: [POKEMON_TYPE_ICE],
                        pickBest: true,
                        checkValidEvo: true,
                        mustHaveOneOfMoves: ['MOVE_HAIL'],
                        tryToHaveMove: ['MOVE_HAIL'],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        isMega: true,
                        type: [POKEMON_TYPE_ICE],
                        pickBest: true,
                        checkValidEvo: true,
                        mustHaveOneOfMoves: ['MOVE_HAIL'],
                        tryToHaveMove: ['MOVE_HAIL'],
                    },
                ],
            },
            {
                absoluteTier: [TIER_PREMIUM],
                checkValidEvo: true,
                abilities: [...snowAbilities],
                fallback: [
                    {
                        absoluteTier: [TIER_PREMIUM],
                        checkValidEvo: true,
                        type: [POKEMON_TYPE_ICE],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        checkValidEvo: true,
                        abilities: [...snowAbilities],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        checkValidEvo: true,
                        type: [POKEMON_TYPE_ICE],
                    },
                ]
            },
            pokeDefSnowWarningMon({
                absoluteTier: [TIER_AVERAGE, TIER_STRONG],
                checkValidEvo: true,
                pickBest: true,
            }),
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                abilities: [...snowAbilities],
                fallback: [
                    {
                        absoluteTier: [TIER_AVERAGE],
                        checkValidEvo: true,
                        abilities: [...snowAbilities],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        checkValidEvo: true,
                        type: [POKEMON_TYPE_ICE],
                    },
                ]
            },
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                abilities: [...snowAbilities],
                fallback: [
                    {
                        absoluteTier: [TIER_AVERAGE],
                        checkValidEvo: true,
                        abilities: [...snowAbilities],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        checkValidEvo: true,
                        type: [POKEMON_TYPE_ICE],
                    },
                ]
            },
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                abilities: [...snowAbilities],
                fallback: [
                    {
                        absoluteTier: [TIER_AVERAGE],
                        checkValidEvo: true,
                        abilities: [...snowAbilities],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        checkValidEvo: true,
                        type: [POKEMON_TYPE_ICE],
                    },
                ]
            },
        ],
    },
    // Route 124
    {
        id: 'TRAINER_CHAD',
        class: 'Swimmer M',
        reward: ['SPECIES_WO_CHIEN'],
        level: 53,
        bag: getSampleItemsFromArray(wallyBag2(), 20),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WO_CHIEN'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 2),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            ...generatePokemonsWithDefinition(POKEDEF_STRONG_PREMIUM_MEGA, 1),
        ],
    },
    {
        id: 'TRAINER_ISABELLA',
        class: 'Swimming Triathlete F',
        reward: [...choiceIsabellaItem],
        level: 53,
        bag: [...choiceIsabellaItem, ...getSampleItemsFromArray(wallyBag2(), 17)],
        team: generic2Average3Strong1MegaTeamTemplate(),
    },
    {
        id: 'TRAINER_SPENCER',
        class: 'Swimmer M',
        reward: ['Room Service', 'Iron Ball'],
        level: 53,
        bag: getSampleItemsFromArray(wallyBag2(), 18),
        team: [
            {
                ...POKEDEF_STRONG,
                mustHaveOneOfMoves: ['MOVE_TRICK_ROOM'],
                tryToHaveMove: ['MOVE_TRICK_ROOM'],
                item: 'Focus Sash',
            },
            {
                ...POKEDEF_STRONG,
                item: 'Room Service',
            },
            {
                ...POKEDEF_STRONG,
                item: 'Iron Ball',
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            { ...POKEDEF_STRONG_PREMIUM_MEGA },
        ],
    },
    {
        id: 'TRAINER_GRACE',
        class: 'Swimmer F',
        reward: [...choiceGraceTMs],
        level: 53,
        bag: [...choiceGraceTMs, ...getSampleItemsFromArray(wallyBag2(), 17)],
        team: [
            {
                ...POKEDEF_STRONG_PREMIUM_MEGA,
                type: [POKEMON_TYPE_ELECTRIC],
                fallback: [
                    {
                        ...POKEDEF_STRONG,
                        type: [POKEMON_TYPE_ELECTRIC],
                    },
                ]
            },
            {
                ...POKEDEF_STRONG,
                type: [POKEMON_TYPE_ICE],
                tryMega: true,
            },
            {
                ...POKEDEF_STRONG,
                type: [POKEMON_TYPE_FIRE],
                tryMega: true,
            },
            {
                ...POKEDEF_STRONG,
                tryMega: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
        ],
    },
    // Gym Leader - Tate & Liza
    {
        id: 'TRAINER_TATE_AND_LIZA_1',
        class: 'Leader Tate And Liza',
        level: 53,
        isBoss: true,
        reward: ['GYM_REWARD_7', 'Access to Shoal Cave'],
        preventShuffle: true,
        bag: [...tateAndLizaBag(), 'Psychic Gem'],
        tms: ['MOVE_CALM_MIND', 'MOVE_CALM_MIND'],
        bannedItems: gymIsChangedType[6] ? ['Focus Sash', 'Room Service'] : ['Focus Sash', 'Room Service', 'Light Clay'],
        team: [
            {
                ...POKEDEF_UP_TO_PREMIUM,
                mustHaveOneOfMoves: ['MOVE_TRICK_ROOM'],
                tryToHaveMove: ['MOVE_TRICK_ROOM'],
                type: [gymMainTypes[6]],
                item: 'Focus Sash',
                pickBest: true,
                fallback: [
                    {
                        ...POKEDEF_PREMIUM,
                        type: [gymMainTypes[6]],
                    },
                ]
            },
            gymIsChangedType[6] ? {
                ...POKEDEF_WEAK,
                type: [gymMainTypes[6]],
            } : (tateAndLizaUseSolrock ?
            {
                specific: 'SPECIES_SOLROCK',
                tryToHaveMove: ['MOVE_EXPLOSION', 'MOVE_LIGHT_SCREEN', 'MOVE_REFLECT'],
                item: 'Light Clay',
                nature: 'Relaxed',
            }
            : {
                specific: 'SPECIES_LUNATONE',
                tryToHaveMove: ['MOVE_EXPLOSION', 'MOVE_LIGHT_SCREEN', 'MOVE_REFLECT'],
                item: 'Light Clay',
                nature: 'Sassy',
            }),
            gymIsChangedType[6] ? {
                ...POKEDEF_LEGEND,
                item: 'Room Service',
                type: [gymMainTypes[6]],
            } : (tateAndLizaUseSolrock ?
            {
                specific: 'SPECIES_LUNALA',
                item: 'Room Service',
                nature: 'Quiet',
            } : {
                specific: 'SPECIES_SOLGALEO',
                item: 'Room Service',
                nature: 'Brave',
            }),
            {
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
                        ...POKEDEF_PREMIUM,
                        type: [gymMainTypes[6]],
                    },
                ]
            },
            {
                ...POKEDEF_STRONG,
                type: [gymMainTypes[6]],
                hasStat: ['baseSpeed', '<', '50'],
                fallback: [
                    {
                        ...POKEDEF_STRONG,
                        type: [gymMainTypes[6]],
                        hasStat: ['baseSpeed', '<', '70'],
                    },
                    {
                        ...POKEDEF_AVERAGE,
                        type: [gymMainTypes[6]],
                        hasStat: ['baseSpeed', '<', '50'],
                        pickBest: true,
                    },
                    {
                        ...POKEDEF_STRONG,
                        type: [gymMainTypes[6]],
                    },
                ],
            },
            {
                ...POKEDEF_STRONG,
                type: [gymMainTypes[6]],
                hasStat: ['baseSpeed', '<', '50'],
                fallback: [
                    {
                        ...POKEDEF_STRONG,
                        type: [gymMainTypes[6]],
                        hasStat: ['baseSpeed', '<', '70'],
                    },
                    {
                        ...POKEDEF_AVERAGE,
                        type: [gymMainTypes[6]],
                        hasStat: ['baseSpeed', '<', '50'],
                        pickBest: true,
                    },
                    {
                        ...POKEDEF_STRONG,
                        type: [gymMainTypes[6]],
                    },
                ],
            },
        ],
    },
    // Route 125
    {
        id: 'TRAINER_ERNEST_1',
        class: 'Sailor',
        reward: ['SPECIES_FROAKIE', 'SPECIES_FROGADIER'],
        level: 56,
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
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 1),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            {
                ...POKEDEF_STRONG_PREMIUM_MEGA,
            },
        ],
    },
    {
        id: 'TRAINER_AURON',
        class: 'Expert M',
        reward: ['Heavy-Duty Boots'],
        level: 56,
        bag: ['Heavy-Duty Boots', ...getSampleItemsFromArray(tateAndLizaBag(), 24)],
        team: generic2Average2Strong1Premium1MegaTeamTemplate(),
    },
    {
        id: 'TRAINER_PRESLEY',
        class: 'Bird Keeper',
        reward: [...choicePresleyItems],
        level: 56,
        bag: [...choicePresleyItems, ...getSampleItemsFromArray(tateAndLizaBag(), 22)],
        team: generic2Average2Strong1Premium1MegaTeamTemplate(),
    },
    // Mossdeep Space Center
    {
        id: 'TRAINER_GRUNT_SPACE_CENTER_5',
        class: 'Magma Grunt M',
        isBoss: true,
        level: 56,
        bag: [...spaceCenterBag()],
        team: [
            {
                ...POKEDEF_STRONG,
                type: [magmaTeamTypes[0], magmaTeamTypes[1]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [magmaTeamTypes[0], magmaTeamTypes[1]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [magmaTeamTypes[0], magmaTeamTypes[1]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [...magmaTeamTypes],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [...magmaTeamTypes],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [...magmaTeamTypes],
            },
        ],
    },
    {
        id: 'TRAINER_GRUNT_SPACE_CENTER_6',
        class: 'Magma Grunt M',
        isBoss: true,
        level: 56,
        bag: [...spaceCenterBag()],
        team: [
            {
                ...POKEDEF_STRONG,
                type: [magmaTeamTypes[0], magmaTeamTypes[1]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [magmaTeamTypes[0], magmaTeamTypes[1]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [magmaTeamTypes[0], magmaTeamTypes[1]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [...magmaTeamTypes],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [...magmaTeamTypes],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [...magmaTeamTypes],
            },
        ],
    },
    {
        id: 'TRAINER_GRUNT_SPACE_CENTER_7',
        class: 'Magma Grunt M',
        isBoss: true,
        level: 56,
        bag: [...spaceCenterBag()],
        team: [
            {
                ...POKEDEF_STRONG,
                type: [magmaTeamTypes[0], magmaTeamTypes[1]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [magmaTeamTypes[0], magmaTeamTypes[1]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [magmaTeamTypes[0], magmaTeamTypes[1]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [...magmaTeamTypes],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [...magmaTeamTypes],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [...magmaTeamTypes],
            },
        ],
    },
    {
        id: 'PARTNER_STEVEN',
        class: 'Steven',
        isPartner: true,
        preventShuffle: true,
        level: 56,
        bag: [...spaceCenterBag()],
        team: [
            {
                id: 'STEVEN_LEGEND',
                ...POKEDEF_LEGEND,
                type: [POKEMON_TYPE_STEEL],
                hasStat: ['baseBST', '>', '659'],
                fallback: [
                    {
                        id: 'STEVEN_LEGEND',
                        ...POKEDEF_LEGEND,
                        type: [POKEMON_TYPE_ROCK],
                        hasStat: ['baseBST', '>', '659'],
                    },
                    {
                        id: 'STEVEN_LEGEND',
                        ...POKEDEF_LEGEND,
                        hasStat: ['baseBST', '>', '659'],
                    },
                ],
            },
            pokeDefLegendOrGodMega({
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
        class: 'Magma Admin',
        isBoss: true,
        level: 56,
        preventShuffle: true,
        bag: [...spaceCenterBag()],
        team: [
            {
                ...POKEDEF_STRONG,
                abilities: [...sunAbilities],
                fallback: [
                    {
                        ...POKEDEF_UP_TO_STRONG,
                        abilities: [...sunAbilities],
                    },
                ],
            },
            {
                ...POKEDEF_STRONG_PREMIUM_MEGA,
                type: [magmaTeamTypes[0]],
                fallback: [
                    {
                        ...POKEDEF_STRONG_PREMIUM_MEGA,
                        type: [magmaTeamTypes[0]],
                    },
                    {
                        ...POKEDEF_STRONG_PREMIUM_MEGA,
                        type: [...magmaTeamTypes],
                    },
                ]
            },
            pokeDefDroughtMon(POKEDEF_UP_TO_PREMIUM),
        ],
    },
    {
        id: 'TRAINER_MAXIE_MOSSDEEP',
        class: 'Magma Leader Maxie',
        isBoss: true,
        level: 56,
        preventShuffle: true,
        bag: [...spaceCenterBag()],
        team: [
            {
                specific: 'SPECIES_GROUDON',
                item: 'Heat Rock',
            },
            {
                ...POKEDEF_UP_TO_PREMIUM_NOEVO,
                abilities: [...sunAbilities],
                pickBest: true,
            },
            pokeDefLegendMega({
                type: [magmaTeamTypes[0]],
            }),
        ],
    },
    // Route 127
    {
        id: 'TRAINER_DONNY',
        class: 'Swimming Triathlete F',
        reward: ['SPECIES_SCREAM_TAIL'],
        level: 58,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SCREAM_TAIL'],
                tryMega: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 2),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            {
                ...POKEDEF_STRONG_PREMIUM_MEGA,
            },
        ],
    },
    {
        id: 'TRAINER_CAMDEN',
        class: 'Swimming Triathlete M',
        reward: ['SPECIES_RELICANTH'],
        level: 58,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_RELICANTH'],
                tryMega: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 2),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            {
                ...POKEDEF_STRONG_PREMIUM_MEGA,
            },
        ],
    },
    {
        id: 'TRAINER_AIDAN',
        class: 'Bird Keeper',
        reward: ['Ability Patch'],
        level: 58,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: generic2Average2Strong1Premium1MegaTeamTemplate(),
    },
    {
        id: 'TRAINER_ATHENA',
        class: 'Cooltrainer F',
        reward: ['Ability Capsule'],
        level: 58,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: generic2Average2Strong1Premium1MegaTeamTemplate(),
    },
    {
        id: 'TRAINER_HENRY',
        class: 'Fisherman',
        reward: ['Random Offensive Mint'],
        level: 58,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: generic2Average2Strong1Premium1MegaTeamTemplate(),
    },
    // Route 126
    {
        id: 'TRAINER_BRENDA',
        class: 'Swimmer F',
        reward: ['Random Defensive Mint', 'SPECIES_FLUTTER_MANE'],
        level: 58,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_FLUTTER_MANE'],
                tryMega: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 2),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            {
                ...POKEDEF_STRONG_PREMIUM_MEGA,
            },
        ],
    },
    {
        id: 'TRAINER_LEONARDO',
        class: 'Swimmer M',
        reward: ['SPECIES_HUNTAIL'],
        level: 58,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_HUNTAIL'],
                tryMega: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 2),
            ...generatePokemonsWithDefinition(POKEDEF_AVERAGE, 2),
            {
                ...POKEDEF_STRONG_PREMIUM_MEGA,
            },
        ],
    },
    // Seafloor Cavern
    {
        id: 'TRAINER_ARCHIE',
        class: 'Aqua Leader Archie',
        reward: ['Access to Sky Pillar'],
        isBoss: true,
        level: 58,
        bag: [...spaceCenterBag()],
        preventShuffle: true,
        team: [
            {
                specific: 'SPECIES_KYOGRE',
                item: 'Damp Rock',
            },
            {
                specific: 'SPECIES_SHARPEDO',
                item: 'Sharpedonite',
                abilities: ['SPEED_BOOST'],
                nature: 'Adamant',
            },
            {
                absoluteTier: [TIER_PREMIUM],
                abilities: [...rainAbilities],
                checkValidEvo: true,
                type: [...aquaTeamTypes],
                fallback: [
                    {
                        absoluteTier: [TIER_PREMIUM],
                        abilities: [...rainAbilities],
                        checkValidEvo: true,
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        abilities: [...rainAbilities],
                        checkValidEvo: true,
                        type: [...aquaTeamTypes],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        abilities: [...rainAbilities],
                        checkValidEvo: true,
                    },
                ]
            },
            {
                absoluteTier: [TIER_PREMIUM],
                abilities: [...rainAbilities],
                checkValidEvo: true,
                type: [aquaTeamTypes[1], aquaTeamTypes[2], aquaTeamTypes[3], aquaTeamTypes[4]],
                fallback: [
                    {
                        absoluteTier: [TIER_PREMIUM],
                        checkValidEvo: true,
                        type: [aquaTeamTypes[1], aquaTeamTypes[2], aquaTeamTypes[3], aquaTeamTypes[4]],
                    }
                ],
            },
            pokeDefDrizzleMon({
                absoluteTier: [TIER_AVERAGE, TIER_STRONG],
                checkValidEvo: true,
                pickBest: true,
            }),
            {
                absoluteTier: [TIER_STRONG],
                abilities: [...rainAbilities],
                checkValidEvo: true,
                type: [...aquaTeamTypes],
                fallback: [
                    {
                        absoluteTier: [TIER_STRONG],
                        abilities: [...rainAbilities],
                        checkValidEvo: true,
                    },
                ]
            },
        ],
    },
    // Sootopolis Gym
    {
        id: 'TRAINER_JUAN_1',
        class: 'Leader Juan',
        level: 61,
        isBoss: true,
        reward: ['GYM_REWARD_8'],
        bag: [...juanBag(), 'Water Gem'],
        tms: ['MOVE_WATERFALL', 'MOVE_WATER_PULSE'],
        team: [
            gymIsChangedType[7] ? {
                ...POKEDEF_STRONG,
                type: [gymMainTypes[7]],
                pickBest: true,
            } : {
                specific: 'SPECIES_KINGDRA',
                item: 'Chesto Berry',
                abilities: ['SNIPER'],
                nature: 'Jolly',
                tryToHaveMove: ['MOVE_DRAGON_DANCE', 'MOVE_WATERFALL', 'MOVE_BLIZZARD', 'MOVE_REST'],
            },
            pokeDefLegendMega({
                type: [gymMainTypes[7]],
            }),
            pokeDefOnlyLegend({
                type: [gymMainTypes[7]],
            }),
            pokeDefOnlyPremium({
                type: [gymMainTypes[7]],
            }),
            pokeDefOnlyPremium({
                type: [gymMainTypes[7]],
            }),
            pokeDefOnlyPremium({
                type: [gymMainTypes[7]],
            }),
        ],
    },
    // Victory Road
    {
        id: 'TRAINER_WALLY_VR_1',
        class: 'Wally',
        isBoss: true,
        level: 64,
        bag: [...spaceCenterBag()],
        team: [
            pokeDefOnlyLegend(),
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
        class: 'Cooltrainer F',
        reward: ['SPECIES_SHEDINJA', 'ITEM_GLITTER_MAIL'],
        level: 67,
        bag: [...spaceCenterBag()],
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_GLITTER_MAIL',
            },
            ...generatePokemonsWithDefinition(POKEDEF_PREMIUM, 3),
            ...generatePokemonsWithDefinition(POKEDEF_STRONG, 2),
        ],
    },
    // Ever Grande Rival
    {
        id: 'TRAINER_MAY_EVERGRANDE_CITY_TREECKO',
        class: 'May',
        isBoss: true,
        level: 67,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...spaceCenterBag()],
        team: [...rivalEvergrandeCityTemplate('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_EVERGRANDE_CITY_TORCHIC',
        class: 'May',
        isBoss: true,
        level: 67,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...spaceCenterBag()],
        team: [...rivalEvergrandeCityTemplate('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_EVERGRANDE_CITY_MUDKIP',
        class: 'May',
        isBoss: true,
        level: 67,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...spaceCenterBag()],
        team: [...rivalEvergrandeCityTemplate('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_EVERGRANDE_TREECKO',
        copy: 'TRAINER_MAY_EVERGRANDE_CITY_TREECKO',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_EVERGRANDE_TORCHIC',
        copy: 'TRAINER_MAY_EVERGRANDE_CITY_TORCHIC',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_EVERGRANDE_MUDKIP',
        copy: 'TRAINER_MAY_EVERGRANDE_CITY_MUDKIP',
        class: 'Brendan',
    },
    // E4 & Champion
    {
        id: 'TRAINER_SIDNEY',
        class: 'Elite Four Sidney',
        isBoss: true,
        level: 70,
        bag: [...spaceCenterBag()],
        team: [
            pokeDefOnlyLegend({
                type: [e41MainType],
            }),
            pokeDefOnlyPremium({
                type: [e41MainType],
            }),
            pokeDefOnlyPremium({
                type: [e41MainType],
            }),
            pokeDefOnlyStrong({
                type: [e41MainType],
            }),
            pokeDefPremiumMega({
                type: [e41MainType],
            }),
            pokeDefOnlyStrong({
                type: [e41MainType],
            }),
        ],
    },
    {
        id: 'TRAINER_PHOEBE',
        class: 'Elite Four Phoebe',
        isBoss: true,
        level: 71,
        bag: [...spaceCenterBag()],
        team: [
            pokeDefOnlyLegend({
                type: [e42MainType],
            }),
            pokeDefOnlyPremium({
                type: [e42MainType],
            }),
            pokeDefOnlyPremium({
                type: [e42MainType],
            }),
            pokeDefOnlyStrong({
                type: [e42MainType],
            }),
            pokeDefPremiumMega({
                type: [e42MainType],
            }),
            pokeDefOnlyStrong({
                type: [e42MainType],
            }),
        ],
    },
    {
        id: 'TRAINER_GLACIA',
        class: 'Elite Four Glacia',
        isBoss: true,
        level: 72,
        bag: [...spaceCenterBag()],
        team: [
            pokeDefOnlyLegend({
                type: [e43MainType],
            }),
            pokeDefOnlyPremium({
                type: [e43MainType],
            }),
            pokeDefOnlyPremium({
                type: [e43MainType],
            }),
            pokeDefOnlyStrong({
                type: [e43MainType],
            }),
            pokeDefLegendMega({
                type: [e43MainType],
            }),
            pokeDefOnlyStrong({
                type: [e43MainType],
            }),
        ],
    },
    {
        id: 'TRAINER_DRAKE',
        class: 'Elite Four Drake',
        isBoss: true,
        level: 73,
        bag: [...spaceCenterBag()],
        team: [
            pokeDefOnlyLegend({
                type: [e44MainType],
            }),
            pokeDefOnlyPremium({
                type: [e44MainType],
            }),
            pokeDefOnlyPremium({
                type: [e44MainType],
            }),
            pokeDefOnlyStrong({
                type: [e44MainType],
            }),
            pokeDefLegendMega({
                type: [e44MainType],
            }),
            pokeDefOnlyStrong({
                type: [e44MainType],
            }),
        ],
    },
    {
        id: 'TRAINER_CHAMPION_STEVEN',
        class: 'Steven',
        isBoss: true,
        level: 75,
        bag: [...spaceCenterBag()],
        team: [
            pokeDefOnlyGod({
                hasStat: ['baseBST', '<', '851'],
            }),
            pokeDefOnlyPremium(),
            {
                special: TRAINER_REPEAT_ID,
                id: 'STEVEN_MEGA',
                tryMega: true,
                fallback: [
                    pokeDefLegendMega(),
                ],
            },
            pokeDefOnlyPremium(),
            pokeDefOnlyPremium(),
            {
                special: TRAINER_REPEAT_ID,
                id: 'STEVEN_LEGEND',
            },
        ],
    },
];

module.exports = {
    file: trainersFile,
    partnersFile,
    trainersData,
};
