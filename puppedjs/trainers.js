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
} = require("./constants");

const trainersFile = path.resolve(__dirname, '..', 'src', 'data', 'trainers.party');

const calvinDogs = [
    'SPECIES_GROWLITHE',
    'SPECIES_GROWLITHE_HISUI',
    'SPECIES_ZIGZAGOON',
    'SPECIES_ZIGZAGOON_GALAR',
    'SPECIES_ELECTRIKE',
    'SPECIES_HOUNDOUR',
    'SPECIES_ROCKRUFF',
    'SPECIES_POOCHYENA',
    'SPECIES_BIDOOF',
    'SPECIES_LILLIPUP',
    'SPECIES_YAMPER',
    'SPECIES_FIDOUGH',
    'SPECIES_GREAVARD',
    'SPECIES_MASCHIFF',
    'SPECIES_EEVEE',
    'SPECIES_RIOLU'
];

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
const sunAbilities = ['FLOWER_GIFT', 'CHLOROPHYLL', 'LEAF_GUARD', 'SOLAR_POWER'];
const sandAbilities = ['SAND_FORCE', 'SAND_RUSH', 'SAND_VEIL', 'SAND_SPIT'];
const snowAbilities = ['ICE_BODY', 'SNOW_CLOAK', 'SLUSH_RUSH'];

const rival103Template = (id) => [
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_ZIGZAGOON'],
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_WURMPLE', 'SPECIES_WINGULL'],
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_SURSKIT'],
    },
    {
        id: 'RIVAL_WEAK_103_KEEP_ONCE_' + id,
        absoluteTier: [TIER_WEAK],
        evoType: [EVO_TYPE_LC],
    },
    {
        id: 'RIVAL_MEGA_103_KEEP_' + id,
        megaTier: [TIER_PREMIUM],
        evoType: [EVO_TYPE_LC],
    },
];

const rivalRustboroBag = [
    'Black Sludge',
    'Expert Belt',
    'Oran Berry',
    'Charti Berry',
    'Chesto Berry',
    'Meadow Plate',
    'Earth Plate',
    'Flame Orb',
    'Water Gem',
    'Flying Gem',
    'Heavy-Duty Boots',
];

const rivalRoute110Bag = [
    ...rivalRustboroBag,
    'Assault Vest',
    'Throat Spray',
    'Jaboca Berry',
    'Red Card',
    'Rocky Helmet',
    'Loaded Dice',
    'Life Orb',
];

const wallyBag = [
    ...rivalRoute110Bag,
    'Lum Berry',
];

const rivalRustboroTMs = [
    'MOVE_WATER_PULSE',
    'MOVE_ROCK_TOMB',
    'MOVE_BRICK_BREAK',
    'MOVE_BULLET_SEED',
];

const rivalRoute110TMs = [
    ...rivalRustboroTMs,
    'MOVE_DRAGON_CLAW',
    'MOVE_TAUNT',
];

const magmaChimneyBag = [
    ...wallyBag,
    'Air Balloon',
    'Toxic Orb',
    'Sitrus Berry',
    'Light Clay',
    'Ground Gem',
    'Fire Gem',
    'Psychic Gem',
    'Fighting Gem',
    'Shuca Berry',
    'Passho Berry',
    'Yache Berry',
    'Colbur Berry',
];

const magmaChimneyTMs = [
    ...rivalRoute110TMs,
    'MOVE_EARTHQUAKE',
];

const flanneryBag = [
    ...magmaChimneyBag,
    'White Herb',
    'Power Herb',
    'Shell Bell',
    'Focus Sash',
    'Razor Claw',
    'Punching Glove',
    'Big Root',
    'Chople Berry',
    'Normal Gem',
    'Safety Goggles',
];

const flanneryTMs = [
    ...magmaChimneyTMs,
    'MOVE_SHADOW_BALL',
    'MOVE_PSYCHIC',
    'MOVE_SOLAR_BEAM',
    'MOVE_SLUDGE_BOMB',
    'MOVE_REST',
    'MOVE_REFLECT',
    'MOVE_LIGHT_SCREEN',
];

const normanTMs = [
    ...flanneryTMs,
    'MOVE_FOCUS_PUNCH',
];

const winonaBag = [
    ...flanneryBag,
    'Leftovers',
];

const winonaTMs = [
    ...normanTMs,
    'MOVE_THUNDERBOLT',
    'MOVE_ICE_BEAM',
    'MOVE_FLAMETHROWER',
];

const rivalRustboroTemplate = (id) => [
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_ZIGZAGOON', 'SPECIES_WURMPLE', 'SPECIES_WINGULL', 'SPECIES_SURSKIT', 'SPECIES_GEODUDE', 'SPECIES_WEEDLE', 'SPECIES_PATRAT', 'SPECIES_PORYGON', 'SPECIES_DELIBIRD', 'SPECIES_DITTO', 'SPECIES_SENTRET', 'SPECIES_POOCHYENA'],
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_ZIGZAGOON', 'SPECIES_WURMPLE', 'SPECIES_WINGULL', 'SPECIES_SURSKIT', 'SPECIES_GEODUDE', 'SPECIES_WEEDLE', 'SPECIES_PATRAT', 'SPECIES_PORYGON', 'SPECIES_DELIBIRD', 'SPECIES_DITTO', 'SPECIES_SENTRET', 'SPECIES_POOCHYENA'],
        tryEvolve: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_WEAK_103_KEEP_ONCE_' + id,
        tryEvolve: true,
    },
    {
        id: 'RIVAL_STRONG_RUSTBORO_KEEP_' + id,
        evolutionTier: [TIER_STRONG],
        evoType: [EVO_TYPE_LC],
        tryEvolve: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_MEGA_103_KEEP_' + id,
        tryEvolve: true,
    },
];

const rivalRoute110Template = (id) => [
    {
        evoType: [EVO_TYPE_SOLO],
        absoluteTier: [TIER_AVERAGE],
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
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_GEODUDE', 'SPECIES_WEEDLE', 'SPECIES_PATRAT', 'SPECIES_PORYGON', 'SPECIES_DELIBIRD', 'SPECIES_DITTO', 'SPECIES_SENTRET', 'SPECIES_POOCHYENA', 'SPECIES_CHARMANDER', 'SPECIES_ARON', 'SPECIES_BULBASAUR', 'SPECIES_IVYSAUR', 'SPECIES_ABSOL', 'SPECIES_ELECTRIKE', 'SPECIES_MANECTRIC'],
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_GEODUDE', 'SPECIES_WEEDLE', 'SPECIES_PATRAT', 'SPECIES_PORYGON', 'SPECIES_DELIBIRD', 'SPECIES_DITTO', 'SPECIES_SENTRET', 'SPECIES_POOCHYENA', 'SPECIES_CHARMANDER', 'SPECIES_ARON', 'SPECIES_BULBASAUR', 'SPECIES_IVYSAUR', 'SPECIES_ABSOL', 'SPECIES_ELECTRIKE', 'SPECIES_MANECTRIC'],
        tryEvolve: true,
    },
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

const allenCats = [
    'SPECIES_MEOWTH',
    'SPECIES_MEOWTH_ALOLA',
    'SPECIES_MEOWTH_GALAR',
    'SPECIES_SKITTY',
    'SPECIES_GLAMEOW',
    'SPECIES_PURRLOIN',
    'SPECIES_SHINX',
    'SPECIES_ESPURR',
    'SPECIES_SPRIGATITO',
    'SPECIES_LITTEN',
    'SPECIES_LITLEO'
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
            {
                oneOf: calvinDogs,
            },
            {
                oneOf: calvinDogs,
            },
            {
                oneOf: calvinDogs,
            },
            {
                oneOf: calvinDogs,
            },
            {
                oneOf: calvinDogs,
            },
        ]
    },
    {
        id: 'TRAINER_ELIJAH',
        level: 7,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Oran Berry',
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
            },
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
            },
            {
                oneOf: allenCats,
            },
            {
                oneOf: allenCats,
            },
            {
                oneOf: allenCats,
            },
            {
                oneOf: allenCats,
            },
            {
                oneOf: allenCats,
            },
        ],
    },
    {
        id: 'TRAINER_RICK',
        level: 9,
        restrictions: [
            TRAINER_RESTRICTION_ALLOW_ONLY_TYPES,
        ],
        types: [
            POKEMON_TYPE_WATER,
            POKEMON_TYPE_ICE,
            POKEMON_TYPE_BUG,
        ],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WINGULL'],
                item: 'Oran Berry',
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
            },
        ]
    },
    {
        id: 'TRAINER_TIANA',
        level: 9,
        restrictions: [
            TRAINER_RESTRICTION_ALLOW_ONLY_TYPES,
        ],
        types: [
            POKEMON_TYPE_FAIRY,
            POKEMON_TYPE_GRASS,
            POKEMON_TYPE_FIGHTING,
            POKEMON_TYPE_PSYCHIC,
        ],
        team: [
            {
                specific: 'SPECIES_SHROOMISH',
                item: 'Expert Belt',
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
            },
        ]
    },
    // Route 103
    {
        id: 'TRAINER_CARTER',
        level: 9,
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES],
        abilities: [...rainAbilities],
        team: [
            {
                absoluteTier: [TIER_BAD],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                evoType: [EVO_TYPE_LC],
            },
            {
                absoluteTier: [TIER_BAD],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                evoType: [EVO_TYPE_LC],
            },
            {
                absoluteTier: [TIER_BAD],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                evoType: [EVO_TYPE_LC],
            },
            {
                absoluteTier: [TIER_BAD],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                evoType: [EVO_TYPE_LC],
            },
            {
                absoluteTier: [TIER_BAD],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                evoType: [EVO_TYPE_LC],
            },
            {
                absoluteTier: [TIER_BAD],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                evoType: [EVO_TYPE_LC],
            },
        ]
    },
    // Route 104
    {
        id: 'TRAINER_DARIAN',
        level: 9,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [...genericBadLCTeamTemplate],
    },
    {
        id: 'TRAINER_BILLY',
        level: 9,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [...genericBadLCTeamTemplate],
    },
    {
        id: 'TRAINER_CINDY_1',
        level: 9,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Eviolite',
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
            },
        ]
    },
    {
        id: 'TRAINER_WINSTON_1',
        level: 10,
        team: genericBadLCTeamTemplate.map(p => ({
            ...p,
            weakToTypes: [POKEMON_TYPE_ROCK],
            item: 'Charti Berry',
        })),
    },
    {
        id: 'TRAINER_IVAN',
        level: 10,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_WATER],
                mustHaveOneOfMoves: ['MOVE_WATER_PULSE'],
                tryToHaveMove: ['MOVE_WATER_PULSE'],
                item: 'Water Gem',
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
            },
        ],
    },
    {
        id: 'TRAINER_HALEY_1',
        level: 10,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
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
                mustHaveOneOfMoves: ['MOVE_WATER_PULSE'],
                tryToHaveMove: ['MOVE_WATER_PULSE'],
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                mustHaveOneOfMoves: ['MOVE_BULLET_SEED'],
                tryToHaveMove: ['MOVE_BULLET_SEED'],
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                mustHaveOneOfMoves: ['MOVE_STEEL_WING'],
                tryToHaveMove: ['MOVE_STEEL_WING'],
            },
        ]
    },
    {
        id: 'TRAINER_GINA_AND_MIA_1',
        level: 10,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_PORYGON'],
                item: 'Oran Berry',
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_PORYGON'],
                item: 'Expert Belt',
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
        ]
    },
    // Petalburg Woods
    {
        id: 'TRAINER_LYLE',
        level: 9,
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [POKEMON_TYPE_GRASS, POKEMON_TYPE_BUG],
        team: [
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_BUG],
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_GRASS],
                item: 'Meadow Plate',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_BUG],
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_GRASS],
                item: 'Meadow Plate',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_BUG],
            },
            {
                specific: 'SPECIES_PARAS',
                tryToHaveMove: ['MOVE_BULLET_SEED'],
                item: 'Meadow Plate',
            },
        ]
    },
    {
        id: 'TRAINER_GRUNT_PETALBURG_WOODS',
        level: 9,
        isBoss: true,
        team: [
            {
                specific: 'SPECIES_CARVANHA',
                item: 'Eviolite',
                nature: NATURES.ADAMANT,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[0]],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[1]],
                item: 'Expert Belt',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[2]],
                item: 'Toxic Plate',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[3]],
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[4]],
            },
        ],
    },
    {
        id: 'TRAINER_JAMES_1',
        level: 10,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_PATRAT'],
                item: 'Oran Berry',
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
            },
        ],
    },
    // Rustboro City
    {
        id: 'TRAINER_ROXANNE_1',
        level: 10,
        isBoss: true,
        team: [
            {
                absoluteTier: [TIER_BAD],
                mustHaveOneOfMoves: ['MOVE_STEALTH_ROCK'],
                tryToHaveMove: ['MOVE_ROCK_TOMB', 'MOVE_STEALTH_ROCK', 'MOVE_SANDSTORM'],
                item: 'Smooth Rock',
            },
            {
                specific: 'SPECIES_NOSEPASS',
                tryToHaveMove: ['MOVE_ROCK_TOMB', 'MOVE_ROCK_SMASH', 'MOVE_SHOCK_WAVE', 'MOVE_SANDSTORM'],
                item: 'Eviolite',
            },
            {
                absoluteTier: [TIER_BAD],
                type: [POKEMON_TYPE_ROCK],
                tryToHaveMove: ['MOVE_ROCK_TOMB'],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                type: [POKEMON_TYPE_GROUND],
                tryToHaveMove: ['MOVE_ROCK_TOMB', 'MOVE_DIG'],
                item: 'Passho Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                type: [POKEMON_TYPE_STEEL],
                mustHaveOneOfMoves: ['MOVE_ROCK_TOMB'],
                tryToHaveMove: ['MOVE_ROCK_TOMB'],
                item: 'Shuca Berry',
            },
            {
                absoluteTier: [TIER_WEAK],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_ROCK],
                tryToHaveMove: ['MOVE_ROCK_TOMB'],
                item: 'Rock Gem',
            },
        ],
    },
    // Route 115
    {
        id: 'TRAINER_TIMOTHY_1',
        level: 10,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DELIBIRD'],
                item: 'Oran Berry',
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
            },
        ],
    },
    // Route 116
    {
        id: 'TRAINER_JOSE',
        level: 10,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DITTO'],
                item: 'Oran Berry',
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
            },
        ],
    },
    {
        id: 'TRAINER_JOEY',
        level: 10,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
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
            },
        ],
    },
    {
        id: 'TRAINER_KAREN_1',
        level: 10,
        team: [
            {
                absoluteTier: [TIER_BAD],
                type: [POKEMON_TYPE_GROUND],
                evoType: [EVO_TYPE_LC],
                item: 'Earth Plate',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
            },
            {
                absoluteTier: [TIER_BAD],
                type: [POKEMON_TYPE_GROUND],
                evoType: [EVO_TYPE_LC],
                item: 'Earth Plate',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
            },
            {
                absoluteTier: [TIER_BAD],
                type: [POKEMON_TYPE_GROUND],
                evoType: [EVO_TYPE_LC],
                item: 'Earth Plate',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
            },
        ],
    },
    {
        id: 'TRAINER_CLARK',
        level: 10,
        team: [
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Heavy-Duty Boots',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Heavy-Duty Boots',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Heavy-Duty Boots',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Heavy-Duty Boots',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Heavy-Duty Boots',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Heavy-Duty Boots',
            },
        ],
    },
    {
        id: 'TRAINER_JOHNSON',
        level: 10,
        team: [
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_FIGHTING],
                mustHaveOneOfMoves: ['MOVE_BRICK_BREAK'],
                tryToHaveMove: ['MOVE_BRICK_BREAK'],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_BRICK_BREAK'],
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_BRICK_BREAK'],
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_BRICK_BREAK'],
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_BRICK_BREAK'],
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_BRICK_BREAK'],
            },
        ],
    },
    {
        id: 'TRAINER_DEVAN',
        level: 10,
        team: [
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_POISON],
                item: 'Black Sludge',
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
                type: [POKEMON_TYPE_POISON],
                item: 'Black Sludge',
            },
        ],
    },
    {
        id: 'TRAINER_JANICE',
        level: 13,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SENTRET'],
                item: 'Oran Berry',
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
            },
        ],
    },
    {
        id: 'TRAINER_JERRY_1',
        level: 13,
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
            },
            {
                absoluteTier: [TIER_BAD],
                type: [POKEMON_TYPE_PSYCHIC],
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
                type: [POKEMON_TYPE_PSYCHIC],
                evoType: [EVO_TYPE_LC],
            },
        ],
    },
    {
        id: 'TRAINER_SARAH',
        level: 13,
        team: [
            {
                absoluteTier: [TIER_BAD],
                type: [POKEMON_TYPE_FLYING],
                evoType: [EVO_TYPE_LC],
                mustHaveOneOfMoves: ['MOVE_AERIAL_ACE'],
                tryToHaveMove: ['MOVE_AERIAL_ACE'],
                item: 'Flying Gem',
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
                type: [POKEMON_TYPE_FLYING],
                evoType: [EVO_TYPE_LC],
                mustHaveOneOfMoves: ['MOVE_AERIAL_ACE'],
                tryToHaveMove: ['MOVE_AERIAL_ACE'],
                item: 'Flying Gem',
            },
        ],
    },
    // Rusturf Tunnel
    {
        id: 'TRAINER_GRUNT_RUSTURF_TUNNEL',
        level: 13,
        isBoss: true,
        team: [
            {
                specific: 'SPECIES_CARVANHA',
                item: 'Oran Berry',
                nature: NATURES.RELAXED,
                tryToHaveMove: ['MOVE_AQUA_JET', 'MOVE_THIEF', 'MOVE_REST', 'MOVE_SLEEP_TALK'],
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[0]],
                mustHaveOneOfMoves: ['MOVE_WATER_PULSE'],
                tryToHaveMove: ['MOVE_WATER_PULSE'],
                item: 'Water Gem',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[1]],
                item: 'Eviolite',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[2]],
                item: 'Black Sludge',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[3]],
                item: 'Expert Belt',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[4]],
                mustHaveOneOfMoves: ['MOVE_AERIAL_ACE'],
                tryToHaveMove: ['MOVE_AERIAL_ACE'],
                item: 'Flying Gem',
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_MAY_RUSTBORO_TREECKO',
        isBoss: true,
        level: 14,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRustboroBag],
        tms: [...rivalRustboroTMs],
        team: [
            {
                id: 'RIVAL_STARTER_TREECKO',
                special: TRAINER_REPEAT_ID,
                item: 'Eviolite',
                tryEvolve: true,
            },
            ...rivalRustboroTemplate('TREECKO'),
        ]
    },
    {
        id: 'TRAINER_MAY_RUSTBORO_TORCHIC',
        isBoss: true,
        level: 14,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRustboroBag],
        tms: [...rivalRustboroTMs],
        team: [
            {
                id: 'RIVAL_STARTER_TORCHIC',
                special: TRAINER_REPEAT_ID,
                item: 'Eviolite',
                tryToHaveMove: ['MOVE_BULLET_SEED'],
                tryEvolve: true,
            },
            ...rivalRustboroTemplate('TORCHIC'),
        ]
    },
    {
        id: 'TRAINER_MAY_RUSTBORO_MUDKIP',
        isBoss: true,
        level: 14,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRustboroBag],
        tms: [...rivalRustboroTMs],
        team: [
            {
                id: 'RIVAL_STARTER_MUDKIP',
                special: TRAINER_REPEAT_ID,
                item: 'Eviolite',
                tryToHaveMove: ['MOVE_BULLET_SEED'],
                tryEvolve: true,
            },
            ...rivalRustboroTemplate('MUDKIP'),
        ]
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
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Life Orb',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Life Orb',
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_ELLIOT_1',
        level: 16,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_CHARMANDER'],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
        ],
    },
    // Dewford Gym
    {
        id: 'TRAINER_BRAWLY_1',
        level: 16,
        isBoss: true,
        bag: [
            'Life Orb',
            'Oran Berry',
            'Black Sludge',
            'Fighting Gem',
            'Stone Plate',
            'Eviolite',
            'Payapa Berry',
            'Chesto Berry',
            'Expert Belt',
        ],
        tms: [
            'MOVE_WATER_PULSE',
            'MOVE_BULLET_SEED',
        ],
        team: [
            {
                specific: 'SPECIES_MAKUHITA',
                tryToHaveMove: ['MOVE_BRICK_BREAK', 'MOVE_BULK_UP', 'MOVE_FAKE_OUT', 'MOVE_ROCK_TOMB'],
                nature: NATURES.ADAMANT,
                abilities: ['GUTS'],
                item: 'Flame Orb',
            },
            {
                type: [POKEMON_TYPE_FIGHTING],
                evolutionTier: [TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_BRICK_BREAK', 'MOVE_BULK_UP'],
                tryEvolve: true,
            },
            {
                type: [POKEMON_TYPE_DARK],
                evolutionTier: [TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_BRICK_BREAK', 'MOVE_BULK_UP'],
                tryEvolve: true,
            },
            {
                type: [POKEMON_TYPE_FIGHTING],
                evolutionTier: [TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_BRICK_BREAK', 'MOVE_BULK_UP'],
                tryEvolve: true,
            },
            {
                type: [POKEMON_TYPE_ROCK],
                evolutionTier: [TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_BRICK_BREAK', 'MOVE_BULK_UP'],
                tryEvolve: true,
            },
            {
                type: [POKEMON_TYPE_FIGHTING],
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_BRICK_BREAK', 'MOVE_BULK_UP'],
            },
        ],
    },
    // Granite Cave
    {
        id: 'TRAINER_STEVEN',
        level: 19,
        isBoss: true,
        bag: [
            'Oran Berry',
            'Black Sludge',
            'Rock Gem',
            'Earth Plate',
            'Chople Berry',
            'Eviolite',
            'Shuca Berry',
            'Chesto Berry',
            'Expert Belt',
        ],
        tms: [
            'MOVE_WATER_PULSE',
            'MOVE_ROCK_TOMB',
            'MOVE_BULLET_SEED',
            'MOVE_BRICK_BREAK',
        ],
        team: [
            {
                oneOf: stevenPokemon,
                tryToHaveMove: ['MOVE_STEEL_WING'],
            },
            {
                specific: 'SPECIES_SKARMORY',
                tryToHaveMove: ['MOVE_STEEL_WING', 'MOVE_AGILITY', 'MOVE_AERIAL_ACE', 'MOVE_ROCK_TOMB'],
                nature: NATURES.ADAMANT,
                item: 'Life Orb',
            },
            {
                oneOf: stevenPokemon,
                tryToHaveMove: ['MOVE_STEEL_WING'],
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
            },
            {
                type: [POKEMON_TYPE_STEEL],
                evolutionTier: [TIER_PREMIUM, TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_STEEL_WING'],
                tryEvolve: true,
            },
        ],
    },
    // Route 106
    {
        id: 'TRAINER_LOLA_1',
        level: 21,
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_BULBASAUR'],
                item: 'Eviolite',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_EDMOND',
        level: 21,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                item: 'Rocky Helmet',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                item: 'Rocky Helmet',
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_HAILEY',
        level: 21,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                item: 'Loaded Dice',
                mustHaveOneOfMoves: goodMultiHitMoves, // @TODO Doesn't work?
                tryToHaveMove: multiHitMoves,
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryToHaveMove: multiHitMoves,
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryToHaveMove: multiHitMoves,
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryToHaveMove: multiHitMoves,
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryToHaveMove: multiHitMoves,
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                mustHaveOneOfMoves: goodMultiHitMoves,
                item: 'Loaded Dice',
                tryToHaveMove: multiHitMoves,
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_CHANDLER',
        level: 21,
        team: [
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                abilities: [...sunAbilities],
                mustHaveOneOfMoves: ['MOVE_SUNNY_DAY'],
                tryToHaveMove: ['MOVE_SUNNY_DAY'],
                item: 'Heat Rock',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                abilities: [...rainAbilities],
                mustHaveOneOfMoves: ['MOVE_RAIN_DANCE'],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                item: 'Damp Rock',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                abilities: [...sandAbilities],
                mustHaveOneOfMoves: ['MOVE_SANDSTORM'],
                tryToHaveMove: ['MOVE_SANDSTORM'],
                item: 'Smooth Rock',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                abilities: [...snowAbilities],
                mustHaveOneOfMoves: ['MOVE_HAIL'],
                tryToHaveMove: ['MOVE_HAIL'],
                item: 'Icy Rock',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC],
                abilities: [...rainAbilities, ...sunAbilities, ...sandAbilities, ...snowAbilities],
                item: 'Eviolite',
            },
            {
                specific: 'SPECIES_CASTFORM_NORMAL',
                item: 'Oran Berry',
            },
        ],
    },
    {
        id: 'TRAINER_RICKY_1',
        level: 21,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                mustHaveOneOfMoves: ['MOVE_STEALTH_ROCK', 'MOVE_TOXIC_SPIKES', 'MOVE_SPIKES'],
                tryToHaveMove: ['MOVE_STEALTH_ROCK', 'MOVE_TOXIC_SPIKES', 'MOVE_SPIKES', 'MOVE_ROAR', 'MOVE_WHIRLWIND', 'DRAGON_TAIL'],
                item: 'Eviolite',
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                item: 'Red Card',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                item: 'Red Card',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                item: 'Red Card',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                item: 'Red Card',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                item: 'Red Card',
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_HUEY',
        level: 21,
        bag: ['Rocky Helmet', 'Eviolite', 'Oran Berry'],
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_ALYSSA',
        level: 21,
        bag: ['Eviolite', 'Oran Berry'],
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_GRUNT_MUSEUM_1',
        isBoss: true,
        level: 21,
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES],
        abilities: [...rainAbilities],
        team: [
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                mustHaveOneOfMoves: ['MOVE_RAIN_DANCE'],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                item: 'Damp Rock',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                item: 'Life Orb',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                item: 'Water Gem',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                mustHaveOneOfMoves: ['MOVE_RAIN_DANCE'],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                item: 'Damp Rock',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC],
                item: 'Eviolite',
            },
            {
                specific: 'SPECIES_CARVANHA',
                item: 'Rocky Helmet',
            },
        ],
    },
    {
        id: 'TRAINER_GRUNT_MUSEUM_2',
        isBoss: true,
        level: 21,
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES],
        abilities: [...snowAbilities],
        team: [
            {
                evoType: [EVO_TYPE_LC],
                abilities: ['SNOW_WARNING'],
                item: 'Icy Rock',
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                item: 'Life Orb',
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                item: 'Ice Gem',
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                abilities: ['SNOW_WARNING'],
                item: 'Icy Rock',
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC],
                item: 'Eviolite',
            },
            {
                specific: 'SPECIES_SNEASEL',
                abilities: ['PICKPOCKET'],
                item: 'Chople Berry',
            },
        ],
    },
    // Route 110
    {
        id: 'TRAINER_ISABEL_1',
        level: 23,
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [POKEMON_TYPE_DRAGON],
        bag: ['Eviolite', 'Dragon Gem', 'Draco Plate', 'Yache Berry'],
        tms: ['MOVE_DRAGON_CLAW', 'MOVE_DRAGON_CLAW'],
        team: [
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                absoluteTier: [TIER_BAD, TIER_WEAK],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_KALEB',
        level: 23,
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [POKEMON_TYPE_GRASS],
        team: [
            {
                evoType: [EVO_TYPE_LC],
                abilities: ['GRASSY_SURGE'],
                item: 'Terrain Extender',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                item: 'Grassy Seed',
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                item: 'Grassy Seed',
            },
        ],
    },
    {
        id: 'TRAINER_TIMMY',
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Shed Shell',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Shed Shell',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Shed Shell',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Shed Shell',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Shed Shell',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Shed Shell',
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_EDWARD',
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: ['Eviolite', 'Oran Berry'],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ELECTRIKE'],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
        ],
    },
    // Route 103 (later)
    {
        id: 'TRAINER_DAISY',
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Throat Spray',
                mustHaveOneOfMoves: [...soundBasedOffensiveMoves],
                tryToHaveMove: [...soundBasedOffensiveMoves],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Throat Spray',
                mustHaveOneOfMoves: [...soundBasedOffensiveMoves],
                tryToHaveMove: [...soundBasedOffensiveMoves],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Throat Spray',
                mustHaveOneOfMoves: ['MOVE_SNORE'],
                tryToHaveMove: ['MOVE_REST', 'MOVE_SNORE'],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_MARCOS',
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: ['Eviolite', 'Rocky Helmet', 'Oran Berry'],
        team: [
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_RHETT',
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: ['Eviolite', 'Rocky Helmet', 'Oran Berry', 'Assault Vest', 'Black Sludge', 'Red Card'],
        team: [
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_MIGUEL_1',
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: ['Eviolite', 'Oran Berry'],
        team: [
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                mustHaveOneOfMoves: ['MOVE_TAUNT'],
                tryToHaveMove: ['MOVE_TAUNT'],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_TAUNT'],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_TAUNT'],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_TAUNT'],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_TAUNT'],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_TAUNT'],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_ANDREW',
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Jaboca Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Jaboca Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Jaboca Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Jaboca Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Jaboca Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Jaboca Berry',
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_MAY_ROUTE_110_TREECKO',
        isBoss: true,
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRoute110Bag],
        tms: [...rivalRoute110TMs],
        team: [
            {
                id: 'RIVAL_STARTER_TREECKO',
                special: TRAINER_REPEAT_ID,
                item: 'Eviolite',
                tryEvolve: true,
            },
            ...rivalRoute110Template('TREECKO'),
        ]
    },
    {
        id: 'TRAINER_MAY_ROUTE_110_TORCHIC',
        isBoss: true,
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRoute110Bag],
        tms: [...rivalRoute110TMs],
        team: [
            {
                id: 'RIVAL_STARTER_TORCHIC',
                special: TRAINER_REPEAT_ID,
                item: 'Eviolite',
                tryEvolve: true,
            },
            ...rivalRoute110Template('TORCHIC'),
        ]
    },
    {
        id: 'TRAINER_MAY_ROUTE_110_MUDKIP',
        isBoss: true,
        level: 23,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...rivalRoute110Bag],
        tms: [...rivalRoute110TMs],
        team: [
            {
                id: 'RIVAL_STARTER_MUDKIP',
                special: TRAINER_REPEAT_ID,
                item: 'Eviolite',
                tryEvolve: true,
            },
            ...rivalRoute110Template('MUDKIP'),
        ]
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
    {
        id: 'TRAINER_EDWIN_1',
        level: 25,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Lum Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Lum Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Lum Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Lum Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Lum Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Lum Berry',
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_JOSEPH',
        level: 25,
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [POKEMON_TYPE_ELECTRIC],
        team: [
            {
                specific: 'SPECIES_MAGNETON',
                tryToHaveMove: ['MOVE_ELECTRIC_TERRAIN'],
                item: 'Terrain Extender',
                abilities: ['STURDY'],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Electric Seed',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Electric Seed',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Electric Seed',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Electric Seed',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                item: 'Electric Seed',
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_DALE',
        level: 25,
        bag: ['Eviolite', 'Assault Vest', 'Lum Berry', 'Oran Berry'],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_MANECTRIC'],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_WALLY_MAUVILLE',
        isBoss: true,
        level: 25,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...wallyBag],
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
    {
        id: 'TRAINER_BRANDI',
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        level: 26,
        bag: ['Eviolite', 'Assault Vest', 'Lum Berry', 'Oran Berry'],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ODDISH'],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_ISAAC_1',
        level: 26,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: ['Eviolite', 'Assault Vest', 'Lum Berry', 'Oran Berry'],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_GLOOM'],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_DEREK',
        level: 26,
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES],
        abilities: [...sunAbilities],
        team: [
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                mustHaveOneOfMoves: ['MOVE_SUNNY_DAY'],
                tryToHaveMove: ['MOVE_SUNNY_DAY'],
                item: 'Heat Rock',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                item: 'Booster Energy',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                item: 'Booster Energy',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                mustHaveOneOfMoves: ['MOVE_SUNNY_DAY'],
                tryToHaveMove: ['MOVE_SUNNY_DAY'],
                item: 'Heat Rock',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                item: 'Booster Energy',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
                evoType: [EVO_TYPE_LC],
                item: 'Booster Energy',
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_ANNA_AND_MEG_1',
        level: 26,
        team: [
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                mustHaveOneOfMoves: ['MOVE_REFLECT'],
                tryToHaveMove: ['MOVE_REFLECT'],
                item: 'Light Clay',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                mustHaveOneOfMoves: ['MOVE_LIGHT_SCREEN'],
                tryToHaveMove: ['MOVE_LIGHT_SCREEN'],
                item: 'Light Clay',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                mustHaveOneOfMoves: ['MOVE_REFLECT'],
                tryToHaveMove: ['MOVE_REFLECT'],
                item: 'Light Clay',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                mustHaveOneOfMoves: ['MOVE_LIGHT_SCREEN'],
                tryToHaveMove: ['MOVE_LIGHT_SCREEN'],
                item: 'Light Clay',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                mustHaveOneOfMoves: ['MOVE_REFLECT'],
                tryToHaveMove: ['MOVE_REFLECT'],
                item: 'Light Clay',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                mustHaveOneOfMoves: ['MOVE_LIGHT_SCREEN'],
                tryToHaveMove: ['MOVE_LIGHT_SCREEN'],
                item: 'Light Clay',
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_MELINA',
        level: 26,
        team: [
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                weakToTypes: [POKEMON_TYPE_ELECTRIC],
                item: 'Wacan Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                weakToTypes: [POKEMON_TYPE_ELECTRIC],
                item: 'Wacan Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                weakToTypes: [POKEMON_TYPE_ELECTRIC],
                item: 'Wacan Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                weakToTypes: [POKEMON_TYPE_ELECTRIC],
                item: 'Wacan Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                weakToTypes: [POKEMON_TYPE_ELECTRIC],
                item: 'Wacan Berry',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                weakToTypes: [POKEMON_TYPE_ELECTRIC],
                item: 'Wacan Berry',
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_AISHA',
        level: 26,
        team: [
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_GROUND],
                item: 'Ground Gem',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_ROCK],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_GROUND],
                item: 'Ground Gem',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_ELECTRIC],
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_GROUND],
                item: 'Ground Gem',
                tryEvolve: true,
            },
            {
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_ICE],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_MARIA_1',
        level: 26,
        bag: ['Eviolite', 'Assault Vest', 'Lum Berry', 'Ground Gem'],
        team: [
            {
                evoType: [EVO_TYPE_LC],
                type: [POKEMON_TYPE_GROUND],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_EARTHQUAKE'],
                tryToHaveMove: ['MOVE_EARTHQUAKE'],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_EARTHQUAKE'],
                tryToHaveMove: ['MOVE_EARTHQUAKE'],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_EARTHQUAKE'],
                tryToHaveMove: ['MOVE_EARTHQUAKE'],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_EARTHQUAKE'],
                tryToHaveMove: ['MOVE_EARTHQUAKE'],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_EARTHQUAKE'],
                tryToHaveMove: ['MOVE_EARTHQUAKE'],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_EARTHQUAKE'],
                tryToHaveMove: ['MOVE_EARTHQUAKE'],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_LYDIA_1',
        level: 26,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: ['Eviolite', 'Assault Vest', 'Lum Berry'],
        team: [
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_DYLAN_1',
        level: 26,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: ['Oran Berry', 'Lum Berry', 'Jaboca Berry'],
        team: [
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_DEANDRE',
        level: 26,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: ['Oran Berry', 'Lum Berry', 'Jaboca Berry'],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_CARVANHA'],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_DALTON_1',
        level: 26,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: ['Eviolite', 'Lum Berry', 'Life Orb', 'Expert Belt'],
        team: [
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_BAD, TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
        ],
    },
    // Mauville Gym
    {
        id: 'TRAINER_WATTSON_1',
        isBoss: true,
        level: 26,
        bag: [
            'Life Orb',
            'Flame Orb',
            'Black Sludge',
            'Electric Gem',
            'Flying Gem',
            'Eviolite',
            'Air Balloon',
            'Shuca Berry',
            'Expert Belt',
            'Assault Vest',
            'Rocky Helmet',
            'Loaded Dice',
        ],
        tms: [
            'MOVE_WATER_PULSE',
            'MOVE_BULLET_SEED',
            'MOVE_BRICK_BREAK',
            'MOVE_DRAGON_CLAW',
            'MOVE_EARTHQUAKE',
            'MOVE_TAUNT',
        ],
        team: [
            {
                specific: 'SPECIES_PINCURCHIN',
                item: 'Terrain Extender',
                tryToHaveMove: ['MOVE_TAUNT', 'MOVE_SHOCK_WAVE', 'MOVE_BUBBLE_BEAM', 'MOVE_THUNDER_WAVE'],
                nature: NATURES.BOLD,
                abilities: ['ELECTRIC_SURGE'],
            },
            {
                specific: 'SPECIES_MANECTRIC',
                abilities: ['STATIC'],
                tryToHaveMove: ['MOVE_SHOCK_WAVE', 'MOVE_THUNDER_WAVE', 'MOVE_FIRE_FANG', 'MOVE_BITE'],
                item: 'Manectite',
            },
            {
                type: [POKEMON_TYPE_FLYING],
                absoluteTier: [TIER_WEAK],
                tryToHaveMove: ['MOVE_SHOCK_WAVE'],
                checkValidEvo: true,
            },
            {
                type: [POKEMON_TYPE_ELECTRIC],
                absoluteTier: [TIER_AVERAGE],
                tryToHaveMove: ['MOVE_SHOCK_WAVE'],
                item: 'Booster Energy',
                checkValidEvo: true,
            },
            {
                type: [POKEMON_TYPE_GRASS],
                absoluteTier: [TIER_AVERAGE],
                tryToHaveMove: ['MOVE_NATURE_POWER'],
                item: 'Electric Seed',
                checkValidEvo: true,
            },
            {
                type: [POKEMON_TYPE_ELECTRIC],
                absoluteTier: [TIER_WEAK],
                tryToHaveMove: ['MOVE_SHOCK_WAVE'],
                checkValidEvo: true,
            },
        ],
    },
    // Route 111
    {
        id: 'TRAINER_HAYDEN',
        level: 29,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: ['Sitrus Berry', 'Lum Berry', 'Eviolite', 'Expert Belt', 'Shell Bell', 'Assault Vest'],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_DROWZEE'],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_TYRON',
        level: 29,
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_SCEPTILITE',
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_BIANCA',
        level: 29,
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_BLAZIKENITE',
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_CELINA',
        level: 29,
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_SWAMPERTITE',
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_IRENE',
        level: 29,
        team: [
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Air Balloon',
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Air Balloon',
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Air Balloon',
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Air Balloon',
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Air Balloon',
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Air Balloon',
            },
        ],
    },
    {
        id: 'TRAINER_TRAVIS',
        level: 29,
        team: [
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Sitrus Berry',
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Sitrus Berry',
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Sitrus Berry',
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Sitrus Berry',
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Sitrus Berry',
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_WEAK, TIER_AVERAGE],
                tryEvolve: true,
                weakToTypes: [POKEMON_TYPE_GROUND],
                item: 'Sitrus Berry',
            },
        ],
    },
    // Route 112
    {
        id: 'TRAINER_LARRY',
        level: 29,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: ['Sitrus Berry', 'Lum Berry', 'Eviolite', 'Expert Belt', 'Shell Bell', 'Assault Vest'],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_TAILLOW'],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_TRENT_1',
        level: 29,
        team: [
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                weakToTypes: [POKEMON_TYPE_FIRE],
                item: 'Occa Berry',
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                weakToTypes: [POKEMON_TYPE_FIRE],
                item: 'Occa Berry',
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                weakToTypes: [POKEMON_TYPE_FIRE],
                item: 'Occa Berry',
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                weakToTypes: [POKEMON_TYPE_FIRE],
                item: 'Occa Berry',
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                weakToTypes: [POKEMON_TYPE_FIRE],
                item: 'Occa Berry',
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                weakToTypes: [POKEMON_TYPE_FIRE],
                item: 'Occa Berry',
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_BRICE',
        level: 29,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: ['Sitrus Berry', 'Lum Berry', 'Eviolite', 'Expert Belt', 'Shell Bell', 'Assault Vest', 'Black Sludge', 'Air Balloon'],
        team: [
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_CAROL',
        level: 29,
        team: [
            {
                evoType: [EVO_TYPE_FINAL, EVO_TYPE_SOLO],
                abilities: ['POISON_HEAL'],
                item: 'Toxic Orb',
                checkValidEvo: true,
            },
            {
                evoType: [EVO_TYPE_FINAL, EVO_TYPE_SOLO],
                abilities: ['POISON_HEAL'],
                item: 'Toxic Orb',
                checkValidEvo: true,
            },
            {
                evoType: [EVO_TYPE_FINAL, EVO_TYPE_SOLO],
                abilities: ['TOXIC_BOOST'],
                item: 'Toxic Orb',
                checkValidEvo: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
            {
                evoType: [EVO_TYPE_LC],
                evolutionTier: [TIER_AVERAGE],
                tryEvolve: true,
            },
        ],
    },
    {
        id: 'TRAINER_TABITHA_MT_CHIMNEY',
        isBoss: true,
        level: 29,
        bag: [...magmaChimneyBag],
        tms: [...magmaChimneyTMs],
        team: [
            {
                abilities: ['SAND_STREAM'],
                evoType: [EVO_TYPE_FINAL, EVO_TYPE_SOLO],
                checkValidEvo: true,
                item: 'Smooth Rock',
                type: [...magmaTeamTypes],
                fallback: [
                    {
                        abilities: ['SAND_STREAM'],
                        checkValidEvo: true,
                        item: 'Smooth Rock',
                        type: [...magmaTeamTypes],
                    },
                    {
                        absoluteTier: [TIER_AVERAGE, TIER_STRONG],
                        mustHaveOneOfMoves: ['MOVE_SANDSTORM'],
                        tryToHaveMove: ['MOVE_SANDSTORM'],
                        checkValidEvo: true,
                        item: 'Smooth Rock',
                        type: [...magmaTeamTypes],
                    },
                ],
            },
            {
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
                abilities: [...sandAbilities],
                type: [...magmaTeamTypes],
            },
            {
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
                abilities: [...sandAbilities],
                type: [...magmaTeamTypes],
            },
            {
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
                abilities: [...sandAbilities],
                mustHaveOneOfMoves: ['MOVE_SANDSTORM'],
                tryToHaveMove: ['MOVE_SANDSTORM'],
                type: [...magmaTeamTypes],
                item: 'Smooth Rock',
            },
            {
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
                abilities: [...sandAbilities],
                type: [...magmaTeamTypes],
            },
            {
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
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
        tms: [...magmaChimneyTMs],
        team: [
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                type: [magmaTeamTypes[0]],
            },
            {
                specific: 'SPECIES_CAMERUPT',
                item: 'Cameruptite',
                ability: 'SOLID_ROCK',
                tryToHaveMove: ['MOVE_EARTHQUAKE', 'MOVE_LAVA_PLUME', 'MOVE_ROCK_SLIDE', 'MOVE_EARTH_POWER'],
            },
            {
                absoluteTier: [TIER_STRONG],
                checkValidEvo: true,
                type: [magmaTeamTypes[1]],
            },
            {
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
                type: [magmaTeamTypes[2]],
            },
            {
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
                type: [magmaTeamTypes[3]],
            },
            {
                absoluteTier: [TIER_AVERAGE],
                checkValidEvo: true,
                type: [magmaTeamTypes[4]],
            },
        ],
    },
    // Route 112
    {
        id: 'TRAINER_SHAYLA',
        level: 33,
        bag: [...magmaChimneyBag, 'White Herb'],
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                mustHaveOneOfMoves: [...whiteHerbMoves],
                tryToHaveMove: [...whiteHerbMoves],
                item: 'White Herb',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                tryToHaveMove: [...whiteHerbMoves],
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                tryToHaveMove: [...whiteHerbMoves],
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                tryToHaveMove: [...whiteHerbMoves],
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                tryToHaveMove: [...whiteHerbMoves],
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                mustHaveOneOfMoves: [...whiteHerbMoves],
                tryToHaveMove: [...whiteHerbMoves],
                item: 'White Herb',
            },
        ],
    },
    {
        id: 'TRAINER_BRYANT',
        level: 33,
        bag: [...magmaChimneyBag],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_NUMEL'],
                tryEvolve: true,
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
    // Route 111
    {
        id: 'TRAINER_WILTON_1',
        level: 33,
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: [...majorPowerHerbMoves],
                tryToHaveMove: [...majorPowerHerbMoves],
                checkValidEvo: true,
                item: 'Power Herb',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: [...minorPowerHerbMoves],
                tryToHaveMove: [...minorPowerHerbMoves],
                checkValidEvo: true,
                item: 'Power Herb',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: [...majorPowerHerbMoves],
                tryToHaveMove: [...majorPowerHerbMoves],
                checkValidEvo: true,
                item: 'Power Herb',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: [...minorPowerHerbMoves],
                tryToHaveMove: [...minorPowerHerbMoves],
                checkValidEvo: true,
                item: 'Power Herb',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: [...majorPowerHerbMoves],
                tryToHaveMove: [...majorPowerHerbMoves],
                checkValidEvo: true,
                item: 'Power Herb',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: [...minorPowerHerbMoves],
                tryToHaveMove: [...minorPowerHerbMoves],
                checkValidEvo: true,
                item: 'Power Herb',
            },
        ],
    },
    {
        id: 'TRAINER_DAISUKE',
        level: 33,
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Shell Bell',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Shell Bell',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Shell Bell',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Shell Bell',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Shell Bell',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Shell Bell',
            },
        ],
    },
    // Route 113
    {
        id: 'TRAINER_JAYLEN',
        level: 33,
        bag: [...flanneryBag],
        team: genericWeakAverageTeamTemplate(),
    },
    {
        id: 'TRAINER_LUNG',
        level: 33,
        bag: [...flanneryBag],
        team: genericWeakAverageTeamTemplate(),
    },
    {
        id: 'TRAINER_WYATT',
        level: 33,
        bag: [...flanneryBag],
        team: genericWeakAverageTeamTemplate(),
    },
    {
        id: 'TRAINER_LAWRENCE',
        level: 33,
        bag: [...flanneryBag],
        team: [
            {
                special: TRAINER_POKE_MEGA_FROM_STONE,
                megaStone: 'ITEM_HARBOR_MAIL',
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
        id: 'TRAINER_MADELINE_1',
        level: 33,
        bag: [...flanneryBag],
        team: genericWeakAverageTeamTemplate(),
    },
    {
        id: 'TRAINER_TORI_AND_TIA',
        level: 33,
        bag: [...flanneryBag],
        team: genericWeakAverageTeamTemplate(),
    },
    {
        id: 'TRAINER_SOPHIE',
        level: 33,
        bag: [...flanneryBag],
        team: genericWeakAverageTeamTemplate(),
    },
    {
        id: 'TRAINER_LAO_1',
        level: 33,
        bag: [...flanneryBag],
        team: genericWeakAverageTeamTemplate(),
    },
    {
        id: 'TRAINER_DILLON',
        level: 33,
        bag: [...flanneryBag],
        team: genericWeakAverageTeamTemplate(),
    },
    {
        id: 'TRAINER_COBY',
        level: 33,
        bag: [...flanneryBag],
        team: genericWeakAverageTeamTemplate(),
    },
    // Route 114
    {
        id: 'TRAINER_CHARLOTTE',
        level: 33,
        bag: [...flanneryBag],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SWABLU'],
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
        id: 'TRAINER_STEVE_1',
        level: 33,
        bag: [...flanneryBag],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SPOINK'],
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
        id: 'TRAINER_KAI',
        level: 33,
        bag: [...flanneryBag],
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_SNATCH'],
                tryToHaveMove: ['MOVE_SNATCH'],
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
                tryToHaveMove: ['MOVE_SNATCH'],
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_CLAUDE',
        level: 33,
        bag: [...flanneryBag],
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_TORMENT'],
                tryToHaveMove: ['MOVE_TORMENT'],
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
                tryToHaveMove: ['MOVE_TORMENT'],
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_NANCY',
        level: 33,
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_REST'],
                tryToHaveMove: ['MOVE_REST', 'MOVE_SLEEP_TALK'],
                checkValidEvo: true,
                item: 'Chesto Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_REST'],
                tryToHaveMove: ['MOVE_REST', 'MOVE_SLEEP_TALK'],
                checkValidEvo: true,
                item: 'Chesto Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_REST'],
                tryToHaveMove: ['MOVE_REST', 'MOVE_SLEEP_TALK'],
                checkValidEvo: true,
                item: 'Chesto Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_REST'],
                tryToHaveMove: ['MOVE_REST', 'MOVE_SLEEP_TALK'],
                checkValidEvo: true,
                item: 'Chesto Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_REST'],
                tryToHaveMove: ['MOVE_REST', 'MOVE_SLEEP_TALK'],
                checkValidEvo: true,
                item: 'Chesto Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_REST'],
                tryToHaveMove: ['MOVE_REST', 'MOVE_SLEEP_TALK'],
                checkValidEvo: true,
                item: 'Chesto Berry',
            },
        ],
    },
    {
        id: 'TRAINER_NOLAN',
        level: 33,
        bag: [...flanneryBag],
        tms: [
            'MOVE_SHADOW_BALL',
            'MOVE_SHADOW_BALL',
            'MOVE_SHADOW_BALL',
            'MOVE_PSYCHIC',
            'MOVE_PSYCHIC',
            'MOVE_PSYCHIC',
            'MOVE_SLUDGE_BOMB',
            'MOVE_SLUDGE_BOMB',
            'MOVE_SLUDGE_BOMB',
        ],
        team: [
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
        ],
    },
    {
        id: 'TRAINER_SHANE',
        level: 33,
        bag: [...flanneryBag],
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_REFLECT', 'MOVE_LIGHT_SCREEN'],
                tryToHaveMove: ['MOVE_REFLECT', 'MOVE_LIGHT_SCREEN'],
                item: 'Light Clay',
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
                mustHaveOneOfMoves: ['MOVE_REFLECT', 'MOVE_LIGHT_SCREEN'],
                tryToHaveMove: ['MOVE_REFLECT', 'MOVE_LIGHT_SCREEN'],
                item: 'Light Clay',
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
        id: 'TRAINER_TYRA_AND_IVY',
        level: 33,
        bag: [...flanneryBag],
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                abilities: ['TRUANT'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_SKILL_SWAP'],
                tryToHaveMove: ['MOVE_SKILL_SWAP'],
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
        id: 'TRAINER_LUCAS_1',
        level: 33,
        bag: [...flanneryBag],
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_TOXIC'],
                tryToHaveMove: ['MOVE_TOXIC'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_TOXIC'],
                tryToHaveMove: ['MOVE_TOXIC'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_TOXIC'],
                tryToHaveMove: ['MOVE_TOXIC'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_BERNIE_1',
        level: 33,
        bag: [...flanneryBag],
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                type: [POKEMON_TYPE_NORMAL],
                mustHaveOneOfMoves: ['MOVE_HYPER_BEAM'],
                tryToHaveMove: ['MOVE_HYPER_BEAM'],
                abilities: ['ADAPTABILITY'],
                item: 'Normal Gem',
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                tryToHaveMove: ['MOVE_HYPER_BEAM'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                tryToHaveMove: ['MOVE_HYPER_BEAM'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_ANGELINA',
        level: 33,
        bag: [...flanneryBag],
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Wide Lens',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Zoom Lens',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Wide Lens',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Zoom Lens',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Wide Lens',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                item: 'Zoom Lens',
            },
        ],
    },
    {
        id: 'TRAINER_LENNY',
        level: 33,
        bag: [...flanneryBag],
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_LEECH_SEED'],
                truyToHaveMove: ['MOVE_LEECH_SEED', 'MOVE_TOXIC', 'MOVE_PROTECT'],
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
                mustHaveOneOfMoves: ['MOVE_LEECH_SEED'],
                truyToHaveMove: ['MOVE_LEECH_SEED', 'MOVE_TOXIC', 'MOVE_PROTECT'],
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
        id: 'TRAINER_NOB_1',
        level: 33,
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: [...punchingMoves],
                truyToHaveMove: [...punchingMoves],
                item: 'Punching Glove',
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: [...punchingMoves],
                truyToHaveMove: [...punchingMoves],
                item: 'Punching Glove',
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: [...punchingMoves],
                truyToHaveMove: [...punchingMoves],
                item: 'Punching Glove',
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: [...punchingMoves],
                truyToHaveMove: [...punchingMoves],
                item: 'Punching Glove',
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: [...punchingMoves],
                truyToHaveMove: [...punchingMoves],
                item: 'Punching Glove',
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: [...punchingMoves],
                truyToHaveMove: [...punchingMoves],
                item: 'Punching Glove',
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_HECTOR',
        level: 33,
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_SOLAR_BEAM'],
                truyToHaveMove: ['MOVE_SOLAR_BEAM'],
                item: 'Power Herb',
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_SOLAR_BEAM'],
                truyToHaveMove: ['MOVE_SOLAR_BEAM'],
                item: 'Power Herb',
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_SOLAR_BEAM'],
                truyToHaveMove: ['MOVE_SOLAR_BEAM'],
                item: 'Power Herb',
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_SOLAR_BEAM'],
                truyToHaveMove: ['MOVE_SOLAR_BEAM'],
                item: 'Power Herb',
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_SOLAR_BEAM'],
                truyToHaveMove: ['MOVE_SOLAR_BEAM'],
                item: 'Power Herb',
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                mustHaveOneOfMoves: ['MOVE_SOLAR_BEAM'],
                truyToHaveMove: ['MOVE_SOLAR_BEAM'],
                item: 'Power Herb',
                checkValidEvo: true,
            },
        ],
    },
    {
        id: 'TRAINER_MARLENE',
        level: 33,
        bag: [...flanneryBag],
        team: genericWeakAverageTeamTemplate(),
    },
    {
        id: 'TRAINER_CYNDY_1',
        level: 33,
        bag: [...flanneryBag],
        team: genericWeakAverageTeamTemplate(),
    },
    {
        id: 'TRAINER_KOICHI',
        level: 33,
        bag: [...flanneryBag],
        team: genericWeakAverageTeamTemplate(),
    },
    {
        id: 'TRAINER_HELENE',
        level: 33,
        bag: [...flanneryBag],
        team: genericWeakAverageTeamTemplate(),
    },
    {
        id: 'TRAINER_ALIX',
        level: 33,
        bag: [...flanneryBag],
        team: [
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_SANDSHREW'],
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
        id: 'TRAINER_KYRA',
        level: 33,
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                weakToTypes: [POKEMON_TYPE_GRASS],
                item: 'Rindo Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                weakToTypes: [POKEMON_TYPE_GRASS],
                item: 'Rindo Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                weakToTypes: [POKEMON_TYPE_GRASS],
                item: 'Rindo Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                weakToTypes: [POKEMON_TYPE_GRASS],
                item: 'Rindo Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                weakToTypes: [POKEMON_TYPE_GRASS],
                item: 'Rindo Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                weakToTypes: [POKEMON_TYPE_GRASS],
                item: 'Rindo Berry',
            },
        ],
    },
    {
        id: 'TRAINER_JAIDEN',
        level: 33,
        team: [
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                mustHaveOneOfMoves: ['MOVE_ENDURE'],
                tryToHaveMove: ['MOVE_ENDURE'],
                abilities: ['HARVEST'],
                item: 'Custap Berry',
                fallback: {
                    absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                    checkValidEvo: true,
                    mustHaveOneOfMoves: ['MOVE_ENDURE'],
                    tryToHaveMove: ['MOVE_ENDURE'],
                    item: 'Custap Berry',
                },
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                mustHaveOneOfMoves: ['MOVE_ENDURE'],
                tryToHaveMove: ['MOVE_ENDURE'],
                item: 'Custap Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                mustHaveOneOfMoves: ['MOVE_ENDURE'],
                tryToHaveMove: ['MOVE_ENDURE'],
                item: 'Custap Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                mustHaveOneOfMoves: ['MOVE_ENDURE'],
                tryToHaveMove: ['MOVE_ENDURE'],
                item: 'Custap Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                mustHaveOneOfMoves: ['MOVE_ENDURE'],
                tryToHaveMove: ['MOVE_ENDURE'],
                item: 'Custap Berry',
            },
            {
                absoluteTier: [TIER_WEAK, TIER_AVERAGE],
                checkValidEvo: true,
                mustHaveOneOfMoves: ['MOVE_ENDURE'],
                tryToHaveMove: ['MOVE_ENDURE'],
                item: 'Custap Berry',
            },
        ],
    },
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
                absoluteTier: [TIER_STRONG],
                abilities: ['PROTOSYNTHESIS'],
                tryToHaveMove: ['MOVE_OVERHEAT'],
                checkValidEvo: true,
            },
            {
                evolutionTier: [TIER_STRONG],
                evoType: [EVO_TYPE_FINAL],
                type: [POKEMON_TYPE_FIRE],
                tryToHaveMove: ['MOVE_OVERHEAT'],
                checkValidEvo: true,
                item: 'Booster Energy',
            },
            {
                absoluteTier: [TIER_AVERAGE, TIER_STRONG],
                abilities: ['DROUGHT'],
                item: 'Heat Rock',
                tryToHaveMove: ['MOVE_OVERHEAT'],
                checkValidEvo: true,
            },
            {
                absoluteTier: [TIER_AVERAGE, TIER_STRONG],
                tryToHaveMove: ['MOVE_OVERHEAT'],
                abilities: ['CHLOROPHYLL', 'HARVEST'],
                checkValidEvo: true,
            },
            {
                special: TRAINER_POKE_MEGA_WITH_STONE,
                megaTier: [TIER_STRONG, TIER_PREMIUM, TIER_LEGEND],
                megaAbilities: ['SOLAR_POWER'],
                type: [POKEMON_TYPE_FIRE],
                tryToHaveMove: ['MOVE_OVERHEAT'],
                checkValidEvo: true,
                tryEvolve: true,
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
                abilities: ['MISTY_SURGE'],
                checkValidEvo: true,
                item: 'Terrain Extender',
                evoType: [EVO_TYPE_SOLO, EVO_TYPE_FINAL],
            },
            {
                absoluteTier: [TIER_AVERAGE],
                type: [POKEMON_TYPE_FAIRY],
                checkValidEvo: true,
                item: 'Misty Seed',
            },
            {
                special: TRAINER_POKE_MEGA_WITH_STONE,
                absoluteTier: [TIER_AVERAGE, TIER_STRONG, TIER_PREMIUM, TIER_LEGEND],
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
]

module.exports = {
    file: trainersFile,
    trainersData,
};
