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
    TRAINER_RESTRICTION_ALLOW_ONLY_TYPES,
    TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES,
    POKEMON_TYPE_DARK,
    POKEMON_TYPE_POISON,
    POKEMON_TYPE_FIRE,
    POKEMON_TYPE_ROCK,
    POKEMON_TYPE_GROUND,
    POKEMON_TYPE_FLYING,
    EVO_TYPE_SOLO,
    POKEMON_TYPE_STEEL,
    TRAINER_REPEAT_ID,
    TIER_STRONG,
    TIER_AVERAGE,
    NATURES,
    POKEMON_TYPE_DRAGON,
    POKEMON_TYPE_ELECTRIC,
    TIER_LEGEND,
    TRAINER_POKE_MEGA_FROM_STONE,
    EVO_TYPE_FINAL,
    POKEMON_TYPE_NORMAL,
    TRAINER_POKE_MEGA_WITH_STONE,
    POKEMON_TYPE_GHOST,
    TIER_GOD,
} = require("./constants");

const trainersFile = path.resolve(__dirname, '..', 'src', 'data', 'trainers.party');

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

const soundBasedOffensiveMoves = [
    'MOVE_UPROAR',
    'MOVE_HYPER_VOICE',
    'MOVE_BUG_BUZZ',
    'MOVE_CHATTER',
    'MOVE_ROUND',
    'MOVE_ECHOED_VOICE',
    'MOVE_SNARL',
    'MOVE_DISARMING_VOICE',
    'MOVE_BOOMBURST',
    'MOVE_SPARKING_ARIA',
    'MOVE_CLANGING_SCALES',
    'MOVE_OVERDRIVE',
    'MOVE_TORCH_SONG',
    'MOVE_ALLURING_VOICE',
    'MOVE_PSYCHIC_NOISE',
    'MOVE_RELIC_SONG',
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

const rainAbilities = ['SWIFT_SWIM', 'RAIN_DISH', 'DRY_SKIN', 'HYDRATION'];
const sunAbilities = ['FLOWER_GIFT', 'CHLOROPHYLL', 'LEAF_GUARD', 'SOLAR_POWER', 'PROTOSYNTHESIS'];
const sandAbilities = ['SAND_FORCE', 'SAND_RUSH', 'SAND_VEIL', 'SAND_SPIT'];
const snowAbilities = ['ICE_BODY', 'SNOW_CLOAK', 'SLUSH_RUSH'];

const rivalRoute119Template = (id) => [
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_AVERAGE_110_KEEP_ONCE_' + id,
        tryEvolve: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_STRONG_RUSTBORO_KEEP_' + id,
        tryEvolve: true,
    },
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
        id: 'RIVAL_119_SUPERROD_KEEP_' + id,
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_SHELGON', 'SPECIES_PUPITAR', 'SPECIES_GABITE'],
        tryEvolve: true,
        tryMega: true,
    },
    {
        id: 'RIVAL_119_PREMIUM_KEEP_' + id,
        absoluteTier: [TIER_PREMIUM],
        evoType: [EVO_TYPE_FINAL, EVO_TYPE_SOLO],
        tryEvolve: true,
        checkValidEvo: true,
    },
];

const rivalLillycoveTemplate = (id) => [
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_STRONG_RUSTBORO_KEEP_' + id,
        tryEvolve: true,
    },
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
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_119_SUPERROD_KEEP_' + id,
        tryEvolve: true,
        tryMega: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_119_PREMIUM_KEEP_' + id,
        tryEvolve: true,
        checkValidEvo: true,
    },
    {
        id: 'RIVAL_LILLYCOVE_PREMIUM_KEEP_' + id,
        absoluteTier: [TIER_PREMIUM],
        evoType: [EVO_TYPE_FINAL, EVO_TYPE_SOLO],
        tryEvolve: true,
        checkValidEvo: true,
    },
];

const normanTMs = [
    ...flanneryTMs,
    'MOVE_FOCUS_PUNCH',
];

const winonaBag = [
    'Leftovers',
];

const winonaTMs = [
    ...normanTMs,
    'MOVE_THUNDERBOLT',
    'MOVE_ICE_BEAM',
    'MOVE_FLAMETHROWER',
];

const genericBadLCTeamTemplate = [
    {
        absoluteTier: [TIER_BAD],
        evoType: [EVO_TYPE_LC],
    },
    {
        absoluteTier: [TIER_BAD],
        evoType: [EVO_TYPE_LC],
    },
    {
        absoluteTier: [TIER_BAD],
        evoType: [EVO_TYPE_LC],
    },
    {
        absoluteTier: [TIER_BAD],
        evoType: [EVO_TYPE_LC],
    },
    {
        absoluteTier: [TIER_BAD],
        evoType: [EVO_TYPE_LC],
    },
    {
        absoluteTier: [TIER_BAD],
        evoType: [EVO_TYPE_LC],
        item: 'Oran Berry',
    },
];

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

const genericWeakAverageTeamTemplate = () => [
    {
        absoluteTier: [TIER_WEAK, TIER_AVERAGE],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_WEAK, TIER_AVERAGE],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_WEAK, TIER_AVERAGE],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_WEAK, TIER_AVERAGE],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_WEAK, TIER_AVERAGE],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_WEAK, TIER_AVERAGE],
        checkValidEvo: true,
    },
];

const genericWeakAverageStrongTeamTemplate = () => [
    {
        absoluteTier: [TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
        checkValidEvo: true,
    },
    {
        absoluteTier: [TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
        checkValidEvo: true,
    },
];

const genericAverageWith1StrongTeamTemplate = () => [
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
        absoluteTier: [TIER_AVERAGE],
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
];

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

const generic3Average3StrongTeamTemplateWithMega = () => [
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
        special: TRAINER_POKE_MEGA_WITH_STONE,
        megaTier: [TIER_STRONG],
        checkValidEvo: true,
        tryEvolve: true,
    },
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

// New defs

const POKEDEF_BAD_LC = {
    absoluteTier: [TIER_BAD],
    evoType: [EVO_TYPE_LC],
    tryEvolve: true,
};

const POKEDEF_BAD_LC_OR_SOLO = {
    absoluteTier: [TIER_BAD],
    evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
    tryEvolve: true,
};

const POKEDEF_WEAK_LC = {
    absoluteTier: [TIER_WEAK],
    evoType: [EVO_TYPE_LC],
    tryEvolve: true,
};

const POKEDEF_WEAK_NOEVO = {
    absoluteTier: [TIER_WEAK],
    checkValidEvo: true,
};

const POKEDEF_AVERAGE_NOEVO = {
    absoluteTier: [TIER_AVERAGE],
    checkValidEvo: true,
};

const POKEDEF_WEAK = {
    absoluteTier: [TIER_WEAK],
    checkValidEvo: true,
    tryEvolve: true,
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

const pokeDefToxicOrbMon = (BASE_POKE_DEF) => {
    return {
        ...BASE_POKE_DEF,
        abilities: ['POISON_HEAL'],
        item: 'Toxic Orb',
        fallback: [
            {
                ...BASE_POKE_DEF,
                abilities: ['TOXIC_BOOST'],
                item: 'Toxic Orb',
            },
            {
                ...BASE_POKE_DEF,
            },
        ],
    };
};

const PROMISING_PREMIUM_LEGEND_GOD_MEGA_LC = {
    megaTier: [TIER_PREMIUM, TIER_LEGEND, TIER_GOD],
    absoluteTier: [TIER_BAD],
    evoType: [EVO_TYPE_LC],
};

const generatePokemonsWithDefinition = (def, amount) => {
    return new Array(amount).fill(null).map(() => ({ ...def }));
}

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
        id: 'RIVAL_STRONG_RUSTBORO_KEEP_' + id,
        evolutionTier: [TIER_PREMIUM],
        evoType: [EVO_TYPE_LC],
        tryEvolve: true,
        fallback: [
            {
                id: 'RIVAL_STRONG_RUSTBORO_KEEP_' + id,
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
    'SPECIES_DEDENNE',
    'SPECIES_CARVANHA',
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
        id: 'RIVAL_STRONG_RUSTBORO_KEEP_' + id,
        tryEvolve: true,
    },
    {
        id: 'RIVAL_STRONG_110_KEEP_' + id,
        evolutionTier: [TIER_PREMIUM],
        evoType: [EVO_TYPE_LC],
        tryEvolve: true,
        fallback: [
            {
                id: 'RIVAL_STRONG_110_KEEP_' + id,
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

const rival103Bag = [
    'Oran Berry',
];

const petalwoodGruntBag = [
    ...rival103Bag,
    'Expert Belt',
    'Eviolite',
    'Splash Plate',
];

const roxanneTMs = [
    'MOVE_WATER_PULSE',
    'MOVE_BULLET_SEED',
];

const roxanneBag = [
    ...petalwoodGruntBag,
    'Meadow Plate',
    'Earth Plate',
    'Water Gem',
    'Flying Gem',
    'Dark Gem',
    'Passho Berry',
    'Charti Berry',
    'Chople Berry',
];

const rusturfGruntBag = [
    ...roxanneBag,
    'Rocky Helmet',
    'Black Sludge',
];

const rusturfGruntTMs = [
    ...roxanneTMs,
    'MOVE_ROCK_TOMB',
];

const rivalRustboroBag = [
    ...rusturfGruntBag,
    'Flame Orb',
];

const brawylyBag = [
    ...rivalRustboroBag,
    'Life Orb',
];

const brawlyTMs = [
    ...rusturfGruntTMs,
    'MOVE_BRICK_BREAK',
    'MOVE_SHADOW_BALL',
    'MOVE_PSYCHIC',
];

const slateportGruntsBag = [
    ...brawylyBag,
    'Loaded Dice',
    // 'Damp Rock',
    // 'Heat Rock',
    // 'Smooth Rock',
    // 'Icy Rock',
];

const slateportGruntsTMs = [
    ...brawlyTMs,
    'MOVE_STEEL_WING',
];

const rivalRoute110Bag = [
    ...slateportGruntsBag,
    // 'Terrain Extender',
    'Shed Shell',
];

const rivalRoute110TMs = [
    ...slateportGruntsTMs,
    'MOVE_DRAGON_CLAW',
    'MOVE_EARTHQUAKE',
    'MOVE_FOCUS_PUNCH',
];

const wallyBag = [
    ...rivalRoute110Bag,
    'Lum Berry',
    'Electric Seed',
    'Grassy Seed',
    'Psychic Seed',
    'Misty Seed',
];

const wattsonBag = [
    'Light Clay',
    'Assault Vest',
    'Wacan Berry',
    'Occa Berry',
    'Shuca Berry',
    'Fire Gem',
    'Ground Gem',
    'Fighting Gem',
];

const wattsonTMs = [
    ...rivalRoute110TMs,
    'TM_REFLECT',
    'TM_LIGHT_SCREEN',
];


const magmaChimneyBag = [
    ...wattsonBag,
    'Air Balloon',
    'Toxic Orb',
    'Sitrus Berry',
];

const flanneryBag = [
    ...magmaChimneyBag,
    'White Herb',
    'Power Herb',
    'Shell Bell',
];

const flanneryTMs = [
    ...wattsonTMs,
    'MOVE_TAUNT',
    'MOVE_TORMENT',
    'MOVE_SKILL_SWAP',
    'MOVE_SNATCH',
    'MOVE_SOLAR_BEAM',
    'MOVE_HYPER_BEAM',
    'MOVE_SLUDGE_BOMB',
];

const trainersData = [
    // Route 101
    {
        id: 'TRAINER_CALVIN_1',
        level: 7,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ZIGZAGOON'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ]
    },
    {
        id: 'TRAINER_ELIJAH',
        level: 7,
        team: [
            {
                ...POKEDEF_BAD_LC,
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ],
    },
    // Route 103
    {
        id: 'TRAINER_MAY_ROUTE_103_TREECKO',
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
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_TORCHIC',
        copy: 'TRAINER_MAY_ROUTE_103_TORCHIC',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_MUDKIP',
        copy: 'TRAINER_MAY_ROUTE_103_MUDKIP',
    },
    // Route 102
    {
        id: 'TRAINER_ALLEN',
        level: 9,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WURMPLE'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ],
    },
    {
        id: 'TRAINER_RICK',
        level: 9,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WINGULL'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ]
    },
    {
        id: 'TRAINER_TIANA',
        level: 9,
        bag: [...rival103Bag],
        team: [
            {
                ...POKEDEF_BAD_LC,
                item: 'Expert Belt',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ]
    },
    // Route 103
    {
        id: 'TRAINER_CARTER',
        level: 9,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SURSKIT'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ]
    },
    // Route 104
    {
        id: 'TRAINER_DARIAN',
        level: 9,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WEEDLE'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ]
    },
    {
        id: 'TRAINER_CINDY_1',
        level: 9,
        bag: [...rival103Bag],
        team: [
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Eviolite',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ]
    },
    // Petalburg Woods
    {
        id: 'TRAINER_LYLE',
        level: 9,
        bag: ['Meadow Plate', 'Splash Plate', 'Earth Plate'],
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
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 3),
        ],
    },
    {
        id: 'TRAINER_GRUNT_PETALBURG_WOODS',
        level: 9,
        isBoss: true,
        bag: [...petalwoodGruntBag],
        team: [
            {
                specific: 'SPECIES_CARVANHA',
                nature: NATURES.ADAMANT,
                abilities: ['SPEED_BOOST'],
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                type: [aquaTeamTypes[1]],
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                type: [aquaTeamTypes[2]],
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                type: [aquaTeamTypes[3]],
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                type: [aquaTeamTypes[4]],
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                type: [aquaTeamTypes[0]],
            },
        ],
    },
    {
        id: 'TRAINER_JAMES_1',
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
        level: 10,
        bag: [...rival103Bag],
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
        level: 10,
        bag: [...rival103Bag, 'Water Gem', 'Flying Gem', 'Dark Gem'],
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
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 3),
        ],
    },
    {
        id: 'TRAINER_HALEY_1',
        level: 10,
        bag: [...rival103Bag],
        tms: [...roxanneTMs, 'MOVE_DIG'],
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_GINA_AND_MIA_1',
        level: 10,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_PORYGON'],
                item: 'Oran Berry',
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_PORYGON'],
                item: 'Oran Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 4),
        ]
    },
    // Route 115
    {
        id: 'TRAINER_TIMOTHY_1',
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
        level: 10,
        bag: [...rival103Bag],
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    // Rustboro City
    {
        id: 'TRAINER_ROXANNE_1',
        level: 10,
        isBoss: true,
        bag: [...roxanneBag, 'Rock Gem'],
        tms: [...roxanneTMs],
        team: [
            {
                ...POKEDEF_BAD_LC,
                mustHaveOneOfMoves: ['MOVE_STEALTH_ROCK'],
                tryToHaveMove: ['MOVE_ROCK_TOMB', 'MOVE_STEALTH_ROCK', 'MOVE_SANDSTORM'],
                fallback: [
                    {
                        ...POKEDEF_BAD_LC,
                        type: [POKEMON_TYPE_ROCK],
                        tryToHaveMove: ['MOVE_ROCK_TOMB'],
                    },
                ],
            },
            {
                specific: 'SPECIES_NOSEPASS',
                tryToHaveMove: ['MOVE_ROCK_TOMB', 'MOVE_ROCK_SMASH', 'MOVE_SHOCK_WAVE', 'MOVE_SANDSTORM'],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_ROCK],
                tryToHaveMove: ['MOVE_ROCK_TOMB'],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_GRASS],
                tryToHaveMove: ['MOVE_ROCK_TOMB'],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_STEEL],
                tryToHaveMove: ['MOVE_ROCK_TOMB'],
            },
            {
                ...POKEDEF_WEAK_LC,
                type: [POKEMON_TYPE_ROCK],
                tryToHaveMove: ['MOVE_ROCK_TOMB'],
            },
        ],
    },
    // Route 104
    {
        id: 'TRAINER_BILLY',
        level: 13,
        bag: getSampleItemsFromArray(roxanneBag, 3),
        tms: getSampleItemsFromArray(roxanneTMs, 1),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_GEODUDE'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ]
    },
    // Route 116
    {
        id: 'TRAINER_JOSE',
        level: 13,
        bag: getSampleItemsFromArray(roxanneBag, 3),
        tms: getSampleItemsFromArray(roxanneTMs, 1),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DITTO'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ],
    },
    {
        id: 'TRAINER_JOEY',
        level: 13,
        bag: getSampleItemsFromArray(roxanneBag, 3),
        tms: getSampleItemsFromArray(roxanneTMs, 1),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_JOHNSON',
        level: 13,
        bag: [...getSampleItemsFromArray(roxanneBag, 2), 'Rocky Helmet'],
        tms: getSampleItemsFromArray(roxanneTMs, 1),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_DEVAN',
        level: 13,
        bag: getSampleItemsFromArray(roxanneBag, 2),
        tms: getSampleItemsFromArray(roxanneTMs, 1),
        team: [
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_POISON],
                item: 'Black Sludge',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ],
    },
    // Rusturf Tunnel
    {
        id: 'TRAINER_GRUNT_RUSTURF_TUNNEL',
        level: 13,
        isBoss: true,
        bag: [...rusturfGruntBag],
        tms: [...rusturfGruntTMs],
        team: [
            {
                specific: 'SPECIES_CARVANHA',
                nature: NATURES.RELAXED,
                abilities: ['ROUGH_SKIN'],
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                type: [aquaTeamTypes[0]],
                tryEvolve: true,
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                type: [aquaTeamTypes[1]],
                tryEvolve: true,
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                type: [aquaTeamTypes[2]],
                tryEvolve: true,
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                type: [aquaTeamTypes[3]],
                tryEvolve: true,
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                type: [aquaTeamTypes[4]],
                tryEvolve: true,
            },
        ],
    },
    // Route 116 again
    {
        id: 'TRAINER_JANICE',
        level: 14,
        bag: getSampleItemsFromArray(rusturfGruntBag, 3),
        tms: getSampleItemsFromArray(rusturfGruntTMs, 1),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SENTRET'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ],
    },
    {
        id: 'TRAINER_JERRY_1',
        level: 14,
        bag: getSampleItemsFromArray(rusturfGruntBag, 2),
        tms: getSampleItemsFromArray(rusturfGruntTMs, 1),
        team: [
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                abilities: ['GUTS'],
                item: 'Flame Orb',
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ],
    },
    {
        id: 'TRAINER_SARAH',
        level: 14,
        bag: getSampleItemsFromArray(rusturfGruntBag, 3),
        tms: getSampleItemsFromArray(rusturfGruntTMs, 1),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_KAREN_1',
        level: 14,
        bag: getSampleItemsFromArray(rusturfGruntBag, 3),
        tms: getSampleItemsFromArray(rusturfGruntTMs, 1),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    // Rustboro Rival
    {
        id: 'TRAINER_MAY_RUSTBORO_TREECKO',
        isBoss: true,
        level: 14,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRustboroBag],
        tms: [...rusturfGruntTMs],
        team: [...rivalRustboroTemplate('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_RUSTBORO_TORCHIC',
        isBoss: true,
        level: 14,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRustboroBag],
        tms: [...rusturfGruntTMs],
        team: [...rivalRustboroTemplate('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_RUSTBORO_MUDKIP',
        isBoss: true,
        level: 14,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRustboroBag],
        tms: [...rusturfGruntTMs],
        team: [...rivalRustboroTemplate('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_RUSTBORO_TREECKO',
        copy: 'TRAINER_MAY_RUSTBORO_TREECKO',
    },
    {
        id: 'TRAINER_BRENDAN_RUSTBORO_TORCHIC',
        copy: 'TRAINER_MAY_RUSTBORO_TORCHIC',
    },
    {
        id: 'TRAINER_BRENDAN_RUSTBORO_MUDKIP',
        copy: 'TRAINER_MAY_RUSTBORO_MUDKIP',
    },
    // Route 106
    {
        id: 'TRAINER_NED',
        level: 16,
        bag: getSampleItemsFromArray(rivalRustboroBag, 3),
        tms: getSampleItemsFromArray(rusturfGruntTMs, 1),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_ELLIOT_1',
        level: 16,
        bag: getSampleItemsFromArray(rivalRustboroBag, 3),
        tms: getSampleItemsFromArray(rusturfGruntTMs, 1),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_CHARMANDER'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ],
    },
    {
        id: 'TRAINER_ANDRES_1',
        level: 16,
        bag: getSampleItemsFromArray(rivalRustboroBag, 3),
        tms: getSampleItemsFromArray(rusturfGruntTMs, 1),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_JOSUE',
        level: 16,
        bag: getSampleItemsFromArray(rivalRustboroBag, 2),
        tms: ['MOVE_BRICK_BREAK', 'MOVE_SHADOW_BALL', 'MOVE_PSYCHIC'],
        team: [
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_FIGHTING],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_GHOST],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_PSYCHIC],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 3),
        ],
    },
    // Dewford Gym
    {
        id: 'TRAINER_BRAWLY_1',
        level: 16,
        isBoss: true,
        bag: [...brawylyBag],
        tms: [...brawlyTMs],
        team: [
            {
                specific: 'SPECIES_MAKUHITA',
                tryToHaveMove: ['MOVE_BULK_UP', 'MOVE_FAKE_OUT', 'MOVE_ROCK_TOMB'],
                nature: NATURES.ADAMANT,
                abilities: ['GUTS'],
                item: 'Flame Orb',
            },
            {
                ...POKEDEF_WEAK_NOEVO,
                type: [POKEMON_TYPE_FIGHTING],
                tryToHaveMove: ['MOVE_BULK_UP'],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_DARK],
                tryToHaveMove: ['MOVE_BULK_UP'],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_FIGHTING],
                tryToHaveMove: ['MOVE_BULK_UP'],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_ROCK],
                tryToHaveMove: ['MOVE_BULK_UP'],
            },
            {
                ...POKEDEF_WEAK_NOEVO,
                type: [POKEMON_TYPE_FIGHTING],
                tryToHaveMove: ['MOVE_BULK_UP'],
            },
        ],
    },
    // Granite Cave
    {
        id: 'TRAINER_STEVEN',
        level: 19,
        isBoss: true,
        bag: [...brawylyBag, 'Steel Gem', 'Rock Gem'],
        tms: [...brawlyTMs],
        team: [
            {
                specific: 'SPECIES_SKARMORY',
                tryToHaveMove: ['MOVE_STEEL_WING'],
                nature: NATURES.ADAMANT,
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_STEEL],
                tryToHaveMove: ['MOVE_STEEL_WING'],
            },
            {
                oneOf: stevenPokemon,
                tryToHaveMove: ['MOVE_STEEL_WING'],
                tryEvolve: true,
            },
            {
                type: [POKEMON_TYPE_STEEL],
                evolutionTier: [TIER_PREMIUM, TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_STEEL_WING'],
                tryEvolve: true,
            },
            {
                oneOf: stevenPokemon,
                tryToHaveMove: ['MOVE_STEEL_WING'],
                tryEvolve: true,
            },
            {
                ...POKEDEF_WEAK_NOEVO,
                type: [POKEMON_TYPE_STEEL],
                tryToHaveMove: ['MOVE_STEEL_WING'],
            },
        ],
    },
    // Route 106
    {
        id: 'TRAINER_LOLA_1',
        level: 21,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_BULBASAUR'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5)
        ],
    },
    {
        id: 'TRAINER_EDMOND',
        level: 21,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_HAILEY',
        level: 21,
        bag: getSampleItemsFromArray(brawylyBag, 3),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: [
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                item: 'Loaded Dice',
                mustHaveOneOfMoves: goodMultiHitMoves,
                tryToHaveMove: multiHitMoves,
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ],
    },
    {
        id: 'TRAINER_CHANDLER',
        level: 21,
        bag: getSampleItemsFromArray(brawylyBag, 2),
        team: [
            pokeDefDrizzleMon(POKEDEF_BAD_LC),
            pokeDefDroughtMon(POKEDEF_BAD_LC),
            pokeDefSandStreamMon(POKEDEF_BAD_LC),
            pokeDefSnowWarningMon(POKEDEF_BAD_LC),
            {
                ...POKEDEF_BAD_LC,
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
        level: 21,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_HUEY',
        level: 21,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_GRUNT_MUSEUM_1',
        isBoss: true,
        level: 21,
        bag: [...slateportGruntsBag],
        tms: [...slateportGruntsTMs],
        team: [
            pokeDefDrizzleMon(POKEDEF_BAD_LC_OR_SOLO),
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                abilities: [...rainAbilities],
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                abilities: [...rainAbilities],
            },
            pokeDefDrizzleMon(POKEDEF_BAD_LC_OR_SOLO),
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                abilities: [...rainAbilities],
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                abilities: [...rainAbilities],
            },
        ],
    },
    {
        id: 'TRAINER_GRUNT_MUSEUM_2',
        isBoss: true,
        level: 21,
        bag: [...slateportGruntsBag],
        tms: [...slateportGruntsTMs],
        team: [
            pokeDefSnowWarningMon(POKEDEF_BAD_LC_OR_SOLO),
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                abilities: [...snowAbilities],
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                abilities: [...snowAbilities],
            },
            pokeDefSnowWarningMon(POKEDEF_BAD_LC_OR_SOLO),
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                abilities: [...snowAbilities],
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                abilities: [...snowAbilities],
            },
        ],
    },
    // Route 110
    {
        id: 'TRAINER_ISABEL_1',
        level: 23,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: ['MOVE_DRAGON_CLAW', 'ITEM_TM_EARTHQUAKE', 'ITEM_TM_FOCUS_PUNCH'],
        team: [
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                type: [POKEMON_TYPE_DRAGON],
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                type: [POKEMON_TYPE_GROUND],
            },
            {
                ...POKEDEF_BAD_LC_OR_SOLO,
                mustHaveOneOfMoves: ['MOVE_THUNDER_WAVE', 'MOVE_SUPERSONIC', 'MOVE_CONFUSE_RAY', 'MOVE_ATTRACT'],
                type: [POKEMON_TYPE_FIGHTING],
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 3),
        ],
    },
    {
        id: 'TRAINER_KALEB',
        level: 23,
        bag: getSampleItemsFromArray(brawylyBag, 2),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: [
            pokeDefGrassySurgeMon(POKEDEF_BAD_LC),
            {
                ...POKEDEF_BAD_LC,
                tryEvolve: true,
                item: 'Grassy Seed',
            },
            {
                ...POKEDEF_BAD_LC,
                tryEvolve: true,
                item: 'Grassy Seed',
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_GRASS],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_GRASS],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_GRASS],
            },
        ],
    },
    {
        id: 'TRAINER_TIMMY',
        level: 23,
        bag: ['Shed Shell', ...getSampleItemsFromArray(brawylyBag, 3)],
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_EDWARD',
        level: 23,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ELECTRIKE'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ],
    },
    // Route 103 (later)
    {
        id: 'TRAINER_DAISY',
        level: 23,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_MARCOS',
        level: 23,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_ANDREW',
        level: 23,
                level: 23,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    // Route 110 Again
    {
        id: 'TRAINER_MAY_ROUTE_110_TREECKO',
        isBoss: true,
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRoute110Bag],
        tms: [...rivalRoute110TMs],
        team: [...rivalRoute110Template('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_110_TORCHIC',
        isBoss: true,
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRoute110Bag],
        tms: [...rivalRoute110TMs],
        team: [...rivalRoute110Template('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_110_MUDKIP',
        isBoss: true,
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRoute110Bag],
        tms: [...rivalRoute110TMs],
        team: [...rivalRoute110Template('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_110_TREECKO',
        copy: 'TRAINER_MAY_ROUTE_110_TREECKO',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_110_TORCHIC',
        copy: 'TRAINER_MAY_ROUTE_110_TORCHIC',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_110_MUDKIP',
        copy: 'TRAINER_MAY_ROUTE_110_MUDKIP',
    },
    // Route 110 after rival
        {
        id: 'TRAINER_DALE',
        level: 25,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_MANECTRIC'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5)
        ],
    },
    {
        id: 'TRAINER_EDWIN_1',
        level: 25,
        bag: ['Lum Berry', ...getSampleItemsFromArray(brawylyBag, 3)],
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    {
        id: 'TRAINER_JOSEPH',
        level: 25,
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: [
            pokeDefPsychicSurgeMon(POKEDEF_BAD_LC, 'Psychic Seed'),
            pokeDefMistySurgeMon(POKEDEF_BAD_LC, 'Misty Seed'),
            pokeDefElectricSurgeMon(POKEDEF_BAD_LC, 'Electric Seed'),
            pokeDefGrassySurgeMon(POKEDEF_BAD_LC, 'Grassy Seed'),
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_PSYCHIC, POKEMON_TYPE_FAIRY, POKEMON_TYPE_ELECTRIC, POKEMON_TYPE_GRASS],
            },
            {
                ...POKEDEF_BAD_LC,
                type: [POKEMON_TYPE_PSYCHIC, POKEMON_TYPE_FAIRY, POKEMON_TYPE_ELECTRIC, POKEMON_TYPE_GRASS],
            },
        ],
    },
    // Route 118
    {
        id: 'TRAINER_DEANDRE',
        level: 25,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),        
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_CARVANHA'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_BAD_LC, 5),
        ],
    },
    {
        id: 'TRAINER_DALTON_1',
        level: 25,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: generatePokemonsWithDefinition(POKEDEF_BAD_LC, 6),
    },
    // Wally
    {
        id: 'TRAINER_WALLY_MAUVILLE',
        isBoss: true,
        level: 25,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...wallyBag],
        tms: [...rivalRoute110TMs],
        team: [
            {
                id: 'WALLY_1',
                megaTier: [TIER_PREMIUM, TIER_LEGEND],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                id: 'WALLY_2',
                evolutionTier: [TIER_PREMIUM],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                id: 'WALLY_3',
                evolutionTier: [TIER_PREMIUM],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                id: 'WALLY_4',
                evolutionTier: [TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                id: 'WALLY_5',
                evolutionTier: [TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                id: 'WALLY_6',
                evolutionTier: [TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
        ],
    },
    // Route 117
    {
        id: 'TRAINER_BRANDI',
        level: 26,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ODDISH'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_NOEVO, 5),
        ],
    },
    {
        id: 'TRAINER_ISAAC_1',
        level: 26,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_GLOOM'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_NOEVO, 5),
        ],
    },
    {
        id: 'TRAINER_DYLAN_1',
        level: 26,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_NOEVO, 6),
        ]
    },
    {
        id: 'TRAINER_LYDIA_1',
        level: 26,
        bag: getSampleItemsFromArray(brawylyBag, 4),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_NOEVO, 6),
        ]
    },
    {
        id: 'TRAINER_DEREK',
        level: 26,
        bag: getSampleItemsFromArray(brawylyBag, 5),
        tms: getSampleItemsFromArray(brawlyTMs, 3),
        team: [
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_NOEVO, 6),
        ]
    },
    {
        id: 'TRAINER_ANNA_AND_MEG_1',
        level: 26,
        bag: getSampleItemsFromArray(brawylyBag, 2),
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: [
            {
                ...POKEDEF_WEAK_NOEVO,
                mustHaveOneOfMoves: ['MOVE_REFLECT'],
                tryToHaveMove: ['MOVE_REFLECT'],
                item: 'Light Clay',
            },
            {
                ...POKEDEF_WEAK_NOEVO,
                mustHaveOneOfMoves: ['MOVE_LIGHT_SCREEN'],
                tryToHaveMove: ['MOVE_LIGHT_SCREEN'],
                item: 'Light Clay',
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_NOEVO, 4),
        ],
    },
    {
        id: 'TRAINER_MELINA',
        level: 26,
        bag: [sample(brawylyBag)],
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: [
            {
                ...POKEDEF_WEAK_NOEVO,
                weakToTypes: [POKEMON_TYPE_ELECTRIC],
                item: 'Wacan Berry',
            },
            {
                ...POKEDEF_WEAK_NOEVO,
                weakToTypes: [POKEMON_TYPE_FIRE],
                item: 'Occa Berry',
            },
            {
                ...POKEDEF_WEAK_NOEVO,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Shuca Berry',
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_NOEVO, 3),
        ],
    },
    {
        id: 'TRAINER_AISHA',
        level: 26,
        bag: ['Fire Gem', 'Ground Gem', 'Fighting Gem', sample(brawylyBag)],
        team: [
            {
                ...POKEDEF_WEAK_NOEVO,
                type: [POKEMON_TYPE_FIRE],
            },
            {
                ...POKEDEF_WEAK_NOEVO,
                type: [POKEMON_TYPE_GROUND],
            },
            {
                ...POKEDEF_WEAK_NOEVO,
                type: [POKEMON_TYPE_FIGHTING],
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_NOEVO, 3),
        ],
    },
    {
        id: 'TRAINER_MARIA_1',
        level: 26,
        bag: ['Assault Vest', ...getSampleItemsFromArray(brawylyBag, 3)],
        tms: getSampleItemsFromArray(brawlyTMs, 2),
        team: generatePokemonsWithDefinition(POKEDEF_WEAK_NOEVO, 6),
    },
    // Mauville Gym
    {
        id: 'TRAINER_WATTSON_1',
        isBoss: true,
        level: 26,
        bag: [...wattsonBag, 'Electric Gem', 'Zap Plate'],
        tms: [...wattsonTMs],
        team: [
            pokeDefElectricSurgeMon({
                absoluteTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                tryToHaveMove: ['MOVE_SHOCK_WAVE'],
            }),
            {
                specific: 'SPECIES_MANECTRIC',
                abilities: ['STATIC'],
                tryToHaveMove: ['MOVE_SHOCK_WAVE', 'MOVE_THUNDER_WAVE', 'MOVE_FIRE_FANG', 'MOVE_BITE'],
                item: 'Manectite',
            },
            {
                ...POKEDEF_AVERAGE_NOEVO,
                type: [POKEMON_TYPE_ELECTRIC],
                item: 'Electric Seed',
                tryToHaveMove: ['MOVE_SHOCK_WAVE'],
            },
            {
                ...POKEDEF_AVERAGE_NOEVO,
                type: [POKEMON_TYPE_GRASS],
                tryToHaveMove: ['MOVE_SHOCK_WAVE'],
            },
            {
                ...POKEDEF_AVERAGE_NOEVO,
                type: [POKEMON_TYPE_ELECTRIC],
                tryToHaveMove: ['MOVE_SHOCK_WAVE'],
            },
            {
                ...POKEDEF_WEAK_NOEVO,
                type: [POKEMON_TYPE_FLYING],
                tryToHaveMove: ['MOVE_SHOCK_WAVE'],
            },
        ],
    },
    // Route 111
    {
        id: 'TRAINER_HAYDEN',
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag, 7),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DROWZEE'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 5)
        ],
    },
    {
        id: 'TRAINER_TYRON',
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag, 5),
        tms: getSampleItemsFromArray(wattsonTMs, 2),
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
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag, 5),
        tms: getSampleItemsFromArray(wattsonTMs, 2),
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
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag, 5),
        tms: getSampleItemsFromArray(wattsonTMs, 2),
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
        level: 29,
        bag: [...getSampleItemsFromArray(wattsonBag, 6), 'Air Balloon'],
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    },
    {
        id: 'TRAINER_TRAVIS',
        level: 29,
        bag: [...getSampleItemsFromArray(wattsonBag, 6), 'Sitrus Berry'],
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    },
    // Route 112
    {
        id: 'TRAINER_LARRY',
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag, 7),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_TAILLOW'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 5),
        ],
    },
    {
        id: 'TRAINER_BRICE',
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag, 7),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    },
    {
        id: 'TRAINER_CAROL',
        level: 29,
        bag: getSampleItemsFromArray(wattsonBag, 6),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: [
            pokeDefToxicOrbMon(POKEDEF_WEAK_OR_AVERAGE),
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 5),
        ],
    },
    {
        id: 'TRAINER_TABITHA_MT_CHIMNEY',
        isBoss: true,
        level: 29,
        bag: [...magmaChimneyBag],
        tms: [...wattsonTMs],
        team: [
            pokeDefSandStreamMon(POKEDEF_UP_TO_STRONG),
            {
                ...POKEDEF_AVERAGE,
                abilities: [...sandAbilities],
                type: [...magmaTeamTypes],
            },
            {
                ...POKEDEF_AVERAGE,
                abilities: [...sandAbilities],
                type: [...magmaTeamTypes],
            },
            pokeDefSandStreamMon(POKEDEF_UP_TO_STRONG),
            {
                ...POKEDEF_AVERAGE,
                abilities: [...sandAbilities],
                type: [...magmaTeamTypes],
            },
            {
                ...POKEDEF_AVERAGE,
                abilities: [...sandAbilities],
                type: [...magmaTeamTypes],
            },
        ],
    },
    {
        id: 'TRAINER_MAXIE_MT_CHIMNEY',
        isBoss: true,
        level: 30,
        bag: [...magmaChimneyBag],
        tms: [...wattsonTMs],
        team: [
            {
                ...POKEDEF_STRONG,
                type: [magmaTeamTypes[0]],
            },
            {
                specific: 'SPECIES_CAMERUPT',
                item: 'Cameruptite',
                ability: 'SOLID_ROCK',
                tryToHaveMove: ['MOVE_EARTHQUAKE', 'MOVE_LAVA_PLUME', 'MOVE_ROCK_SLIDE', 'MOVE_EARTH_POWER'],
            },
            {
                ...POKEDEF_STRONG,
                type: [magmaTeamTypes[1]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [magmaTeamTypes[2]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [magmaTeamTypes[3]],
            },
            {
                ...POKEDEF_AVERAGE,
                type: [magmaTeamTypes[4]],
            },
        ],
    },
    // Route 112
    {
        id: 'TRAINER_BRYANT',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 7),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_NUMEL'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 5),
        ],
    },
    {
        id: 'TRAINER_SHAYLA',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 6),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
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
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 5),
        ],
    },
    // Route 111
    {
        id: 'TRAINER_WILTON_1',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 6),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
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
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 5),
        ],
    },
    // Route 113
    {
        id: 'TRAINER_JAYLEN',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 7),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    },
    {
        id: 'TRAINER_LUNG',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 7),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    },
    {
        id: 'TRAINER_WYATT',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 7),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    },
    {
        id: 'TRAINER_LAWRENCE',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 6),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_HARBOR_MAIL',
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK, 5),
        ],
    },
    {
        id: 'TRAINER_MADELINE_1',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 6),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    },
    // Route 114
    {
        id: 'TRAINER_CHARLOTTE',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 7),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SWABLU'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 5),
        ],
    },
    {
        id: 'TRAINER_STEVE_1',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 7),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SPOINK'],
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 5),
        ],
    },
    {
        id: 'TRAINER_CLAUDE',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 7),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    },
    {
        id: 'TRAINER_NOLAN',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 7),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    },
    {
        id: 'TRAINER_ANGELINA',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 7),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    },
    // Route 115
    {
        id: 'TRAINER_ALIX',
        level: 33,
        bag: getSampleItemsFromArray(magmaChimneyBag, 7),
        tms: getSampleItemsFromArray(wattsonTMs, 4),
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SANDSHREW'],
                tryEvolve: true,
            },
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 5),
        ],
    },
    {
        id: 'TRAINER_NOB_1',
        level: 33,
        bag: ['Power Herb', getSampleItemsFromArray(magmaChimneyBag, 6)],
        tms: ['MOVE_SOLAR_BEAM', 'MOVE_HYPER_BEAM', 'MOVE_SLUDGE_BOMB', sample(wattsonTMs)],
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
            ...generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 3),
        ],
    },
    // {
    //     id: 'TRAINER_HECTOR',
    //     level: 33,
    //     bag: getSampleItemsFromArray(magmaChimneyBag, 7),
    //     tms: getSampleItemsFromArray(wattsonTMs, 4),
    //     team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    // },
    // {
    //     id: 'TRAINER_CYNDY_1',
    //     level: 33,
    //     bag: getSampleItemsFromArray(magmaChimneyBag, 7),
    //     tms: getSampleItemsFromArray(wattsonTMs, 4),
    //     team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    // },
    // {
    //     id: 'TRAINER_KOICHI',
    //     level: 33,
    //     bag: getSampleItemsFromArray(magmaChimneyBag, 7),
    //     tms: getSampleItemsFromArray(wattsonTMs, 4),
    //     team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    // },
    // {
    //     id: 'TRAINER_HELENE',
    //     level: 33,
    //     bag: getSampleItemsFromArray(magmaChimneyBag, 7),
    //     tms: getSampleItemsFromArray(wattsonTMs, 4),
    //     team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    // },
    // {
    //     id: 'TRAINER_KYRA',
    //     level: 33,
    //     bag: getSampleItemsFromArray(magmaChimneyBag, 7),
    //     tms: getSampleItemsFromArray(wattsonTMs, 4),
    //     team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    // },
    // {
    //     id: 'TRAINER_JAIDEN',
    //     level: 33,
    //     bag: getSampleItemsFromArray(magmaChimneyBag, 7),
    //     tms: getSampleItemsFromArray(wattsonTMs, 4),
    //     team: generatePokemonsWithDefinition(POKEDEF_WEAK_OR_AVERAGE, 6),
    // },
    // Flannery Gym
    {
        id: 'TRAINER_FLANNERY_1',
        level: 33,
        isBoss: true,
        bag: [...flanneryBag],
        tms: [...flanneryTMs],
        team: [
            {
                specific: 'SPECIES_TORKOAL',
                abilities: ['DROUGHT'],
                item: 'Heat Rock',
                tryToHaveMove: ['MOVE_OVERHEAT', 'MOVE_RAPID_SPIN', 'MOVE_CLEAR_SMOG', 'MOVE_SOLAR_BEAM'],
                checkValidEvo: true,
                tryEvolve: true,
            },
            {
                ...POKEDEF_STRONG,
                abilities: ['PROTOSYNTHESIS'],
                tryToHaveMove: ['MOVE_OVERHEAT'],
                fallback: [
                    {
                        absoluteTier: [TIER_AVERAGE, TIER_STRONG],
                        abilities: ['PROTOSYNTHESIS'],
                        tryToHaveMove: ['MOVE_OVERHEAT'],
                        checkValidEvo: true,
                        tryEvolve: true,  
                    },
                    {
                        ...POKEDEF_STRONG,
                    }
                ]
            },
            {
                ...POKEDEF_STRONG,
                type: [POKEMON_TYPE_FIRE],
                tryToHaveMove: ['MOVE_OVERHEAT'],
            },
            ...pokeDefDroughtMon(POKEDEF_AVERAGE),
            {
                ...POKEDEF_AVERAGE,
                tryToHaveMove: ['MOVE_OVERHEAT'],
                abilities: ['CHLOROPHYLL', 'HARVEST'],
            },
            {
                special: TRAINER_POKE_MEGA_WITH_STONE,
                megaTier: [TIER_STRONG, TIER_PREMIUM, TIER_LEGEND],
                megaAbilities: ['SOLAR_POWER'],
                type: [POKEMON_TYPE_FIRE],
                tryToHaveMove: ['MOVE_OVERHEAT'],
                checkValidEvo: true,
                tryEvolve: true,
                fallback: [
                    {
                        special: TRAINER_POKE_MEGA_WITH_STONE,
                        megaTier: [TIER_STRONG, TIER_PREMIUM, TIER_LEGEND],
                        type: [POKEMON_TYPE_FIRE],
                        tryToHaveMove: ['MOVE_OVERHEAT'],
                        checkValidEvo: true,
                        tryEvolve: true,
                    },
                ],
            },
        ],
    },
    // Route 111
    {
        id: 'TRAINER_CELIA',
        level: 36,
        bag: [...flanneryBag],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_TRAPINCH'],
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_BEAU',
        level: 36,
        bag: [...flanneryBag],
        team: genericAverageWith1StrongTeamTemplate(),
    },
    {
        id: 'TRAINER_BRANDEN',
        level: 36,
        bag: [...flanneryBag],
        team: genericAverageWith1StrongTeamTemplate(),
    },
    {
        id: 'TRAINER_DREW',
        level: 36,
        bag: [...flanneryBag],
        team: genericWeakAverageStrongTeamTemplate()
            .map((p) => ({ ...p, item: 'Chilan Berry', })),
    },
    {
        id: 'TRAINER_BECKY',
        level: 36,
        bag: [...flanneryBag],
        team: genericWeakAverageStrongTeamTemplate()
            .map((p) => ({ ...p, type: [POKEMON_TYPE_FIGHTING], item: 'Fighting Gem', })),
    },
    {
        id: 'TRAINER_BRYAN',
        level: 36,
        bag: [...flanneryBag],
        team: genericWeakAverageStrongTeamTemplate()
            .map((p) => ({
                ...p,
                mustHaveOneOfMoves: ['MOVE_FOCUS_PUNCH'],
                tryToHaveMove: ['MOVE_FOCUS_PUNCH', 'MOVE_SUBSTITUTE', 'MOVE_THUNDER_WAVE', 'MOVE_CONFUSE_RAY'],
            })),
    },
    {
        id: 'TRAINER_HEIDI',
        level: 36,
        bag: [...flanneryBag],
        team: genericWeakAverageStrongTeamTemplate()
            .map((p) => ({
                ...p,
                mustHaveOneOfMoves: ['MOVE_SPORE', 'MOVE_SLEEP_POWDER'],
            })),
    },
    {
        id: 'TRAINER_DUSTY_1',
        level: 36,
        bag: [...flanneryBag],
        team: genericWeakAverageStrongTeamTemplate()
            .map((p) => ({
                ...p,
                abilities: ['INTIMIDATE'],
                item: 'Adrenaline Orb',
            })),
    },
    {
        id: 'TRAINER_NORMAN_1',
        level: 36,
        isBoss: true,
        bag: [...flanneryBag],
        tms: [...normanTMs],
        team: [
            {
                specific: 'SPECIES_SLAKING',
                item: 'Assault Vest',
                tryToHaveMove: ['MOVE_FIRE_BLAST', 'MOVE_EARTHQUAKE', 'MOVE_FACADE', 'MOVE_SUCKER_PUNCH'],
            },
            {
                absoluteTier: [TIER_STRONG],
                abilities: ['GUTS'],
                mustHaveOneOfMoves: ['MOVE_FACADE'],
                tryToHaveMove: ['MOVE_FACADE', 'MOVE_PROTECT'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_STRONG],
                type: [POKEMON_TYPE_NORMAL],
                tryToHaveMove: ['MOVE_FACADE'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_AVERAGE],
                type: [POKEMON_TYPE_GHOST],
                tryToHaveMove: ['MOVE_FACADE'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_STRONG],
                type: [POKEMON_TYPE_NORMAL],
                tryToHaveMove: ['MOVE_FACADE'],
                checkValidEvo: true,
            },
            {
                special: TRAINER_POKE_MEGA_WITH_STONE,
                megaTier: [TIER_PREMIUM, TIER_LEGEND],
                type: [POKEMON_TYPE_NORMAL],
                tryToHaveMove: ['MOVE_FACADE'],
                checkValidEvo: true,
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_AMY_AND_LIV_1',
        level: 39,
        bag: [...flanneryBag],
        team: [
            {
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
                mustHaveOneOfMoves: ['MOVE_HELPING_HAND'],
                tryToHaveMove: ['MOVE_HELPING_HAND'],
                item: 'Eject Pack',
            },
            {
                special: TRAINER_POKE_MEGA_WITH_STONE,
                megaTier: [TIER_AVERAGE],
                checkValidEvo: true,
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Eject Pack',
            },
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                item: 'Eject Pack',
            },
            {
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Eject Pack',
            },
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                item: 'Eject Pack',
            },
        ],
    },
    {
        id: 'TRAINER_BEVERLY',
        level: 39,
        bag: [...flanneryBag],
        team: [
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
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
            },
            {
                special: TRAINER_POKE_MEGA_WITH_STONE,
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_IMANI',
        level: 39,
        bag: [...flanneryBag],
        team: [
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
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
            },
            {
                special: TRAINER_POKE_MEGA_WITH_STONE,
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_FOSTER',
        level: 39,
        bag: [...flanneryBag],
        tms: [...normanTMs],
        team: [
            {
                absoluteTier: [TIER_STRONG],
                evoType: [EVO_TYPE_SOLO],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_STRONG],
                evoType: [EVO_TYPE_SOLO],
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
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
            },
            {
                special: TRAINER_POKE_MEGA_WITH_STONE,
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_ABIGAIL_1',
        level: 39,
        bag: [...flanneryBag],
        tms: [...normanTMs],
        team: [
            {
                absoluteTier: [TIER_STRONG],
                evoType: [EVO_TYPE_SOLO],
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
            {
                special: TRAINER_POKE_MEGA_WITH_STONE,
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_PERRY',
        level: 39,
        bag: [...winonaBag],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DEDENNE'],
                tryEvolve: true,
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
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_WADE',
        level: 39,
        bag: [...winonaBag],
        team: [
            {
                abilities: ['MISTY_SURGE'],
                checkValidEvo: true,
                item: 'Terrain Extender',
                evoType: [EVO_TYPE_SOLO, EVO_TYPE_FINAL],
            },
            {
                absoluteTier: [TIER_STRONG],
                type: [POKEMON_TYPE_FAIRY],
                checkValidEvo: true,
                item: 'Misty Seed',
            },
            {
                absoluteTier: [TIER_AVERAGE],
                type: [POKEMON_TYPE_FAIRY],
                checkValidEvo: true,
                item: 'Misty Seed',
            },
            {
                absoluteTier: [TIER_AVERAGE],
                type: [POKEMON_TYPE_FAIRY],
                checkValidEvo: true,
                item: 'Misty Seed',
            },
            {
                absoluteTier: [TIER_AVERAGE],
                type: [POKEMON_TYPE_FAIRY],
                checkValidEvo: true,
                item: 'Misty Seed',
            },
            {
                special: TRAINER_POKE_MEGA_WITH_STONE,
                absoluteTier: [TIER_AVERAGE, TIER_STRONG],
                type: [POKEMON_TYPE_FAIRY],
                checkValidEvo: true,
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_BARNY',
        level: 39,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate().map((p) => ({
            ...p,
            weakToTypes: [POKEMON_TYPE_FLYING],
            item: 'Coba Berry',
        })),
    },
    {
        id: 'TRAINER_ROSE_1',
        level: 39,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate().map((p) => ({
            ...p,
            item: 'Kee Berry',
        })),
    },
    {
        id: 'TRAINER_CHESTER',
        level: 39,
        bag: [...winonaBag],
        tms: [
            'MOVE_THUNDERBOLT',
            'MOVE_THUNDERBOLT',
            'MOVE_THUNDERBOLT',
            'MOVE_ICE_BEAM',
            'MOVE_ICE_BEAM',
            'MOVE_ICE_BEAM',
            'MOVE_FLAMETHROWER',
            'MOVE_FLAMETHROWER',
            'MOVE_FLAMETHROWER',
        ],
        team: generic3Average3StrongTeamTemplateWithMega(),
    },
    // Route 119
    {
        id: 'TRAINER_KENT',
        level: 39,
        bag: [...winonaBag],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_LINOONE'],
                tryEvolve: true,
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
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_BRENT',
        level: 39,
        bag: [...winonaBag],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SNIVY'],
                tryEvolve: true,
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SERVINE'],
                tryEvolve: true,
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
        ],
    },
    {
        id: 'TRAINER_DONALD',
        level: 39,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate(),
    },
    {
        id: 'TRAINER_GREG',
        level: 39,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate(),
    },
    {
        id: 'TRAINER_DOUG',
        level: 39,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate().map((p) => ({
            ...p,
            item: 'Weakness Policy',
        })),
    },
    {
        id: 'TRAINER_TAYLOR',
        level: 39,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate().map((p) => ({
            ...p,
            item: 'Rowap Berry',
        })),
    },
    {
        id: 'TRAINER_CATHERINE_1',
        level: 39,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate().map((p) => ({
            ...p,
            item: 'Maranga Berry',
        })),
    },
    {
        id: 'TRAINER_RACHEL',
        level: 39,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate().map((p) => ({
            ...p,
            weakToTypes: [POKEMON_TYPE_DARK],
            item: 'Colbur Berry',
        })),
    },
    {
        id: 'TRAINER_JACKSON_1',
        level: 39,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate().map((p) => ({
            ...p,
            weakToTypes: [POKEMON_TYPE_POISON],
            item: 'Kebia Berry',
        })),
    },
    {
        id: 'TRAINER_PHIL',
        level: 39,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate().map((p) => ({
            ...p,
            weakToTypes: [POKEMON_TYPE_FLYING],
            item: 'Coba Berry',
        })),
    },
    {
        id: 'TRAINER_DAYTON',
        level: 39,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate().map((p) => ({
            ...p,
            type: [POKEMON_TYPE_ELECTRIC],
            item: 'Electric Gem',
        })),
    },
    {
        id: 'TRAINER_HUGH',
        level: 39,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate().map((p) => ({
            ...p,
            type: [POKEMON_TYPE_ELECTRIC],
            item: 'Zap Plate',
        })),
    },
    {
        id: 'TRAINER_SHELLY_WEATHER_INSTITUTE',
        level: 39,
        isBoss: true,
        bag: [...winonaBag],
        tms: [...winonaTMs],
        team: [
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                type: [aquaTeamTypes[0]],
            },
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                type: [aquaTeamTypes[1]],
            },
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                type: [aquaTeamTypes[2]],
            },
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                type: [aquaTeamTypes[3]],
            },
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                type: [aquaTeamTypes[4]],
            },
            {
                special: TRAINER_POKE_MEGA_WITH_STONE,
                megaTier: [TIER_STRONG, TIER_PREMIUM],
                checkValidEvo: true,
                tryEvolve: true,
                type: [aquaTeamTypes[0]],
            },
        ],
    },
    {
        id: 'TRAINER_FABIAN',
        level: 40,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate(), // @TODO Teach meteor beam. Can't do that right now because I don't know how to python the tool
    },
    {
        id: 'TRAINER_MAY_ROUTE_119_TREECKO',
        isBoss: true,
        level: 40,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...winonaBag],
        tms: [...winonaTMs],
        team: [...rivalRoute119Template('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_119_TORCHIC',
        isBoss: true,
        level: 40,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...winonaBag],
        tms: [...winonaTMs],
        team: [...rivalRoute119Template('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_119_MUDKIP',
        isBoss: true,
        level: 40,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...winonaBag],
        tms: [...winonaTMs],
        team: [...rivalRoute119Template('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_119_TREECKO',
        copy: 'TRAINER_MAY_ROUTE_119_TREECKO',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_119_TORCHIC',
        copy: 'TRAINER_MAY_ROUTE_119_TORCHIC',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_119_MUDKIP',
        copy: 'TRAINER_MAY_ROUTE_119_MUDKIP',
    },
    {
        id: 'TRAINER_LEONEL',
        level: 42,
        bag: [...winonaBag],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SANDILE'],
                tryEvolve: true,
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
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_ROBERT_1',
        level: 42,
        bag: [...winonaBag],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_KROKOROK'],
                tryEvolve: true,
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
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_COLIN',
        level: 42,
        bag: [...winonaBag],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_KROOKODILE'],
                tryEvolve: true,
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
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_HIDEO',
        level: 42,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate()
            .map((p) => ({ ...p, type: POKEMON_TYPE_ICE, item: 'Icicle Plate', })),
    },
    {
        id: 'TRAINER_CLARISSA',
        level: 42,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate()
            .map((p) => ({ ...p, type: POKEMON_TYPE_ROCK, item: 'Rock Gem', })),
    },
    {
        id: 'TRAINER_ANGELICA',
        level: 42,
        bag: [...winonaBag],
        team: generic3Average3StrongTeamTemplate(),
    },
    {
        id: 'TRAINER_WINONA_1',
        level: 42,
        isBoss: true,
        bag: [...winonaBag],
        tms: [...winonaTMs, 'MOVE_AERIAL_ACE'],
        team: [
            {
                specific: 'SPECIES_ALTARIA',
                item: 'Altarianite',
                nature: 'Adamant',
                tryToHaveMove: ['MOVE_DRAGON_DANCE', 'MOVE_FACADE', 'MOVE_EARTHQUAKE', 'MOVE_AERIAL_ACE'],
            },
            {
                absoluteTier: [TIER_STRONG],
                type: [POKEMON_TYPE_FLYING],
                tryToHaveMove: ['MOVE_AERIAL_ACE'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_AVERAGE],
                type: [POKEMON_TYPE_STEEL],
                tryToHaveMove: ['MOVE_FACADE'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_AVERAGE],
                type: [POKEMON_TYPE_GROUND],
                tryToHaveMove: ['MOVE_FACADE'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_STRONG],
                type: [POKEMON_TYPE_FLYING],
                tryToHaveMove: ['MOVE_AERIAL_ACE'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_PREMIUM],
                type: [POKEMON_TYPE_FLYING],
                tryToHaveMove: ['MOVE_AERIAL_ACE'],
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_MAY_LILLYCOVE_TREECKO',
        isBoss: true,
        level: 45,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...winonaBag],
        tms: [...winonaTMs],
        team: [...rivalLillycoveTemplate('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_LILLYCOVE_TORCHIC',
        isBoss: true,
        level: 45,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...winonaBag],
        tms: [...winonaTMs],
        team: [...rivalLillycoveTemplate('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_LILLYCOVE_MUDKIP',
        isBoss: true,
        level: 45,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...winonaBag],
        tms: [...winonaTMs],
        team: [...rivalLillycoveTemplate('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_LILLYCOVE_TREECKO',
        copy: 'TRAINER_MAY_LILLYCOVE_TREECKO',
    },
    {
        id: 'TRAINER_BRENDAN_LILLYCOVE_TORCHIC',
        copy: 'TRAINER_MAY_LILLYCOVE_TORCHIC',
    },
    {
        id: 'TRAINER_BRENDAN_LILLYCOVE_MUDKIP',
        copy: 'TRAINER_MAY_LILLYCOVE_MUDKIP',
    },
    {
        id: 'TRAINER_MAXIE_MAGMA_HIDEOUT',
        isBoss: true,
        level: 47,
        bag: [...winonaBag],
        tms: [...winonaTMs],
        team: [
            {
                specific: 'SPECIES_GROUDON',
                item: 'Heat Rock',
            },
            {
                absoluteTier: [TIER_STRONG, TIER_PREMIUM],
                abilities: [...sunAbilities],
                checkValidEvo: true,
                type: [magmaTeamTypes[0]],
                fallback: [
                    {
                        absoluteTier: [TIER_PREMIUM],
                        checkValidEvo: true,
                        type: [magmaTeamTypes[0]],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        checkValidEvo: true,
                        type: [magmaTeamTypes[0]],
                    },
                ]
            },
            {
                absoluteTier: [TIER_STRONG, TIER_PREMIUM],
                abilities: [...sunAbilities],
                checkValidEvo: true,
                type: [magmaTeamTypes[2]],
                fallback: [
                    {
                        absoluteTier: [TIER_PREMIUM],
                        checkValidEvo: true,
                        type: [magmaTeamTypes[2]],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        checkValidEvo: true,
                        type: [magmaTeamTypes[2]],
                    },
                ]
            },
            {
                absoluteTier: [TIER_STRONG, TIER_PREMIUM],
                abilities: [...sunAbilities],
                checkValidEvo: true,
                type: [magmaTeamTypes[3]],
                fallback: [
                    {
                        absoluteTier: [TIER_PREMIUM],
                        checkValidEvo: true,
                        type: [magmaTeamTypes[3]],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        checkValidEvo: true,
                        type: [magmaTeamTypes[3]],
                    },
                ]
            },
            {
                absoluteTier: [TIER_STRONG, TIER_PREMIUM],
                abilities: [...sunAbilities],
                checkValidEvo: true,
                type: [magmaTeamTypes[4]],
                fallback: [
                    {
                        absoluteTier: [TIER_PREMIUM],
                        checkValidEvo: true,
                        type: [magmaTeamTypes[4]],
                    },
                    {
                        absoluteTier: [TIER_STRONG],
                        checkValidEvo: true,
                        type: [magmaTeamTypes[4]],
                    },
                ]
            },
            {
                specific: 'SPECIES_CAMERUPT',
                item: 'Cameruptite',
                ability: 'SOLID_ROCK',
                tryToHaveMove: ['MOVE_EARTHQUAKE', 'MOVE_LAVA_PLUME', 'MOVE_ROCK_SLIDE', 'MOVE_EARTH_POWER'],
            },
        ],
    },
    // @TODO TRAINER_MATT
]

module.exports = {
    file: trainersFile,
    trainersData,
};
