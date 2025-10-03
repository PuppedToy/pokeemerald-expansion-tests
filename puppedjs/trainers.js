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
    NATURE_ADAMANT,
    POKEMON_TYPE_STEEL,
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
    'SPECIES_SNUBBULL',
    'SPECIES_RIOLU'
];

const rival103Template = [
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_ZIGZAGOON'],
        item: 'Oran Berry',
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_WURMPLE', 'SPECIES_WINGULL'],
        item: 'Oran Berry',
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_SURSKIT'],
        item: 'Oran Berry',
    },
    {
        id: 'RIVAL_WEAK_103_KEEP_ONCE',
        absoluteTier: [TIER_WEAK],
        evoType: [EVO_TYPE_LC],
        item: 'Oran Berry',
    },
    {
        id: 'RIVAL_MEGA_103_KEEP',
        megaTier: [TIER_PREMIUM],
        evoType: [EVO_TYPE_LC],
        item: 'Oran Berry',
    },
];

const genericBadLCTeamTemplate = (item) => [
    {
        absoluteTier: [TIER_BAD],
        evoType: [EVO_TYPE_LC],
        item,
    },
    {
        absoluteTier: [TIER_BAD],
        evoType: [EVO_TYPE_LC],
        item,
    },
    {
        absoluteTier: [TIER_BAD],
        evoType: [EVO_TYPE_LC],
        item,
    },
    {
        absoluteTier: [TIER_BAD],
        evoType: [EVO_TYPE_LC],
        item,
    },
    {
        absoluteTier: [TIER_BAD],
        evoType: [EVO_TYPE_LC],
        item,
    },
    {
        absoluteTier: [TIER_BAD],
        evoType: [EVO_TYPE_LC],
        item,
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
    POKEMON_TYPE_ICE,
    POKEMON_TYPE_POISON,
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
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_ZIGZAGOON'],
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
        ],
    },
    // Route 102
    {
        id: 'TRAINER_ALLEN',
        level: 9,
        team: [
            {
                oneOf: allenCats,
                item: 'Oran Berry',
            },
            {
                oneOf: allenCats,
                item: 'Oran Berry',
            },
            {
                oneOf: allenCats,
                item: 'Oran Berry',
            },
            {
                oneOf: allenCats,
                item: 'Oran Berry',
            },
            {
                oneOf: allenCats,
                item: 'Oran Berry',
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WURMPLE'],
                item: 'Oran Berry',
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
                absoluteTier: [TIER_BAD],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Oran Berry',
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_WINGULL'],
                item: 'Oran Berry',
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
                item: 'Expert Belt',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Expert Belt',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Expert Belt',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Expert Belt',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Expert Belt',
            },
        ]
    },
    // Route 103
    {
        id: 'TRAINER_MAY_ROUTE_103_TREECKO',
        level: 7,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            ...rival103Template,
            {
                id: 'RIVAL_STARTER_TREECKO',
                special: TRAINER_POKE_STARTER_TORCHIC,
                item: 'Oran Berry',
            }
        ]
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_TORCHIC',
        level: 7,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            ...rival103Template,
            {
                id: 'RIVAL_STARTER_TORCHIC',
                special: TRAINER_POKE_STARTER_MUDKIP,
                item: 'Oran Berry',
            }
        ]
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_MUDKIP',
        level: 7,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            ...rival103Template,
            {
                id: 'RIVAL_STARTER_MUDKIP',
                special: TRAINER_POKE_STARTER_TREECKO,
                item: 'Oran Berry',
            }
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
        abilities: ['DRIZZLE', 'SWIFT_SWIM', 'RAIN_DISH', 'DRY_SKIN', 'HYDRATION'],
        team: [
            {
                absoluteTier: [TIER_BAD],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                tryToHaveMove: ['MOVE_RAIN_DANCE'],
                item: 'Oran Berry',
            },
        ]
    },
    // Route 104
    {
        id: 'TRAINER_DARIAN',
        level: 9,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: genericBadLCTeamTemplate('Oran Berry'),
    },
    {
        id: 'TRAINER_BILLY',
        level: 9,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: genericBadLCTeamTemplate('Oran Berry'),
    },
    {
        id: 'TRAINER_CINDY_1',
        level: 9,
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
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Eviolite',
            },
        ]
    },
    {
        id: 'TRAINER_WINSTON_1',
        level: 10,
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        // @TODO Maybe this should be explicitly weak to Rock
        types: [POKEMON_TYPE_FIRE, POKEMON_TYPE_BUG, POKEMON_TYPE_ICE, POKEMON_TYPE_FLYING],
        team: genericBadLCTeamTemplate('Charti Berry'),
    },
    {
        id: 'TRAINER_IVAN',
        level: 10,
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [POKEMON_TYPE_WATER],
        team: [
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_WATER_PULSE'],
                item: 'Water Gem',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_WATER_PULSE'],
                item: 'Water Gem',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_WATER_PULSE'],
                item: 'Water Gem',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_WATER_PULSE'],
                item: 'Water Gem',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                tryToHaveMove: ['MOVE_WATER_PULSE'],
                item: 'Water Gem',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Eviolite',
            },
        ],
    },
    {
        id: 'TRAINER_HALEY_1',
        level: 10,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: genericBadLCTeamTemplate('Heavy-Duty Boots'),
    },
    {
        id: 'TRAINER_GINA_AND_MIA_1',
        level: 10,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                absoluteTier: [TIER_BAD],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Oran Berry',
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_PORYGON'],
                item: 'Eviolite',
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
                item: 'Oran Berry',
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
                item: 'Oran Berry',
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
                item: 'Oran Berry',
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
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[0]],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[1]],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[2]],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[3]],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC, EVO_TYPE_SOLO],
                type: [aquaTeamTypes[4]],
                item: 'Oran Berry',
            },
            {
                specific: 'SPECIES_CARVANHA',
                item: 'Eviolite',
                nature: NATURE_ADAMANT,
            },
        ],
    },
    {
        id: 'TRAINER_JAMES_1',
        level: 10,
        team: [
            {
                absoluteTier: [TIER_BAD],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                item: 'Oran Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
                item: 'Oran Berry',
            },
            {
                special: TRAINER_POKE_ENCOUNTER,
                encounterIds: ['SPECIES_PATRAT'],
                item: 'Eviolite',
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
                absoluteTier: [TIER_BAD],
                type: [POKEMON_TYPE_ROCK],
                tryToHaveMove: ['MOVE_ROCK_TOMB'],
                item: 'Rindo Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                type: [POKEMON_TYPE_GROUND],
                tryToHaveMove: ['MOVE_ROCK_TOMB'],
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
            {
                specific: 'SPECIES_NOSEPASS',
                tryToHaveMove: ['MOVE_ROCK_TOMB'],
                item: 'Eviolite',
            },
        ],
    },
]

module.exports = {
    file: trainersFile,
    trainersData,
};
