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

const rivalRustboroTMs = [
    'MOVE_WATER_PULSE',
    'MOVE_ROCK_TOMB',
    'MOVE_BRICK_BREAK',
    'MOVE_BULLET_SEED',
];

const rivalRustboroTemplate = (id) => [
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_ZIGZAGOON', 'SPECIES_WURMPLE', 'SPECIES_WINGULL', 'SPECIES_SURSKIT', 'SPECIES_GEODUDE', 'SPECIES_WEEDLE', 'SPECIES_PATRAT', 'SPECIES_PORYGON', 'SPECIES_DELIBIRD', 'SPECIES_DITTO', 'SPECIES_SENTRET', 'SPECIES_POOCHYENA'],
        type: [POKEMON_TYPE_POISON],
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        type: [POKEMON_TYPE_FIRE, POKEMON_TYPE_FLYING, POKEMON_TYPE_ICE, POKEMON_TYPE_BUG],
        tryEvolve: true,
        encounterIds: ['SPECIES_ZIGZAGOON', 'SPECIES_WURMPLE', 'SPECIES_WINGULL', 'SPECIES_SURSKIT'],
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
        id: 'TRAINER_MAY_ROUTE_103_TREECKO',
        level: 7,
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
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        // @TODO Maybe this should be explicitly weak to Rock
        types: [POKEMON_TYPE_FIRE, POKEMON_TYPE_BUG, POKEMON_TYPE_ICE, POKEMON_TYPE_FLYING],
        team: genericBadLCTeamTemplate.map(p => ({
            ...p,
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
        bag: [
            'Life Orb',
            'Oran Berry',
            'Black Sludge',
            'Fighting Gem',
            'Stone Plate',
            'Eviolite',
            'Papaya Berry',
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
        id: 'TRAINER_GRUNT_MUSEUM_1',
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
]

module.exports = {
    file: trainersFile,
    trainersData,
};
