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
    NATURE_RELAXED,
    TRAINER_REPEAT_ID,
    TIER_STRONG,
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

const rival103Template = [
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
        id: 'RIVAL_WEAK_103_KEEP_ONCE',
        absoluteTier: [TIER_WEAK],
        evoType: [EVO_TYPE_LC],
    },
    {
        id: 'RIVAL_MEGA_103_KEEP',
        megaTier: [TIER_PREMIUM],
        evoType: [EVO_TYPE_LC],
    },
];

// @TODO Auto-pick best item from a selection of owned items
// @TODO Auto-teach best TMs from a selection of owned TMs. Also autopick learnset.
const rivalRustboroTemplate = [
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: ['SPECIES_ZIGZAGOON', 'SPECIES_WURMPLE', 'SPECIES_WINGULL', 'SPECIES_SURSKIT', 'SPECIES_GEODUDE', 'SPECIES_WEEDLE', 'SPECIES_PATRAT', 'SPECIES_PORYGON', 'SPECIES_DELIBIRD', 'SPECIES_DITTO', 'SPECIES_SENTRET', 'SPECIES_POOCHYENA'],
        type: [POKEMON_TYPE_POISON],
        tryEvolve: true,
        item: 'Black Sludge',
        tryToHaveMove: ['MOVE_WATER_PULSE'],
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        type: [POKEMON_TYPE_FIRE, POKEMON_TYPE_FLYING, POKEMON_TYPE_ICE, POKEMON_TYPE_BUG],
        tryEvolve: true,
        encounterIds: ['SPECIES_ZIGZAGOON', 'SPECIES_WURMPLE', 'SPECIES_WINGULL', 'SPECIES_SURSKIT'],
        item: 'Charti Berry',
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_WEAK_103_KEEP_ONCE',
        tryEvolve: true,
        tryToHaveMove: ['MOVE_ROCK_TOMB'],
        item: 'Chesto Berry',
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        id: 'RIVAL_STRONG_RUSTBORO_KEEP',
        evolutionTier: [TIER_STRONG],
        evoType: [EVO_TYPE_LC],
        tryEvolve: true,
        tryToHaveMove: ['MOVE_BRICK_BREAK'],
        item: 'Expert Belt',
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_MEGA_103_KEEP',
        tryEvolve: true,
        tryToHaveMove: ['MOVE_STEEL_WING'],
        item: 'Oran Berry',
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
            ...rival103Template,
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
            ...rival103Template,
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
            ...rival103Template,
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
                nature: NATURE_ADAMANT,
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
                tryToHaveMove: ['MOVE_ROCK_TOMB'],
                item: 'Passho Berry',
            },
            {
                absoluteTier: [TIER_BAD],
                type: [POKEMON_TYPE_STEEL],
                mustHaveOneOfMoves: ['MOVE_ROCK_TOMB'],
                tryToHaveMove: ['MOVE_ROCK_TOMB', 'MOVE_STEEL_WING'],
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
                mustHaveOneOfMoves: ['MOVE_FLING'],
                tryToHaveMove: ['MOVE_FLING'],
                item: 'King\'s Rock',
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
                type: [POKEMON_TYPE_PSYCHIC],
                evoType: [EVO_TYPE_LC],
                item: 'Mind Plate',
            },
            {
                absoluteTier: [TIER_BAD],
                evoType: [EVO_TYPE_LC],
            },
            {
                absoluteTier: [TIER_BAD],
                type: [POKEMON_TYPE_PSYCHIC],
                evoType: [EVO_TYPE_LC],
                item: 'Mind Plate',
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
                item: 'Mind Plate',
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
                nature: NATURE_RELAXED,
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
        team: [
            {
                id: 'RIVAL_STARTER_TREECKO',
                special: TRAINER_POKE_STARTER_TORCHIC,
                item: 'Eviolite',
                tryToHaveMove: ['MOVE_BULLET_SEED'],
                tryEvolve: true,
            },
            ...rivalRustboroTemplate,
        ]
    },
    {
        id: 'TRAINER_MAY_RUSTBORO_TORCHIC',
        level: 14,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                id: 'RIVAL_STARTER_TORCHIC',
                special: TRAINER_POKE_STARTER_MUDKIP,
                item: 'Eviolite',
                tryToHaveMove: ['MOVE_BULLET_SEED'],
                tryEvolve: true,
            },
            ...rivalRustboroTemplate,
        ]
    },
    {
        id: 'TRAINER_MAY_RUSTBORO_MUDKIP',
        level: 14,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            {
                id: 'RIVAL_STARTER_MUDKIP',
                special: TRAINER_POKE_STARTER_TREECKO,
                item: 'Eviolite',
                tryToHaveMove: ['MOVE_BULLET_SEED'],
                tryEvolve: true,
            },
            ...rivalRustboroTemplate,
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
]

module.exports = {
    file: trainersFile,
    trainersData,
};
