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

const trainers = [
    {
        id: 'TRAINER_CALVIN_1',
        level: 9,
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
                type: 'encounter',
                item: 'Oran Berry',
            },
        ]
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_TREECKO',
        // @TODO
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_TORCHIC',
        // @TODO
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_MUDKIP',
        // @TODO
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_TREECKO',
        // @TODO
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_TORCHIC',
        // @TODO
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_MUDKIP',
        // @TODO
    }
]