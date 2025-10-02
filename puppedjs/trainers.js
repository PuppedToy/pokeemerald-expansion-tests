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
    TIER_AVERAGE,
    TIER_PREMIUM,
} = require("./constants");

const trainersFile = path.resolve(__dirname, '..', 'src', 'data', 'trainers.party');

const lcDogs = [
    'Growlithe',
    'Growlithe-Hisui',
    'Zigzagoon',
    'Zigzagoon-Galar',
    'Electrike',
    'Houndour',
    'Rockruff',
    'Poochyena',
    'Bidoof',
    'Lillipup',
    'Yamper',
    'Fidough',
    'Greavard',
    'Maschiff',
    'Eevee',
    'Snubbull',
    'Riolu'
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
        encounterTypes: ['SPECIES_SURSKIT'],
        item: 'Oran Berry',
    },
    {
        id: 'RIVAL_AVERAGE_103_KEEP_ONCE',
        absoluteTier: [TIER_AVERAGE],
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

const trainersData = [
    {
        id: 'TRAINER_CALVIN_1',
        level: 7,
        team: [
            {
                oneOf: lcDogs,
            },
            {
                oneOf: lcDogs,
            },
            {
                oneOf: lcDogs,
            },
            {
                oneOf: lcDogs,
            },
            {
                oneOf: lcDogs,
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
                absoluteTier: [TIER_WEAK],
                evoType: [EVO_TYPE_LC],
                item: 'Oran Berry',
            },
        ],
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_TREECKO',
        level: 7,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        team: [
            ...rival103Template,
            {
                id: 'RIVAL_STARTER_TREECKO',
                special: TRAINER_POKE_STARTER_TREECKO,
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
                special: TRAINER_POKE_STARTER_TORCHIC,
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
                special: TRAINER_POKE_STARTER_MUDKIP,
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
    }
]

module.exports = {
    file: trainersFile,
    trainersData,
};
