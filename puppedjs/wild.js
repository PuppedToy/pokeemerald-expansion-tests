const path = require('path');

const {
    TIER_BAD,
    TIER_WEAK,
    TIER_AVERAGE,
    TIER_STRONG,

    EVO_TYPE_LC,
    EVO_TYPE_NFE,
    EVO_TYPE_SOLO,
    TIER_PREMIUM,
    EVO_TYPE_FINAL,
    TIER_LEGEND,
} = require('./constants.js');

// For fishing, each route will have 1 land and 1 old rod option
// Good rod may offer a delay reward in AVERAGE mons
// Super rod will offer a PREMIUM mom shared across different routes

// We will design the game to have a specific amount of encounters available

// This is the true wild data
const wildData = {
    file: path.resolve(__dirname, '..', 'src', 'data', 'wild_encounters.json'),
    replacementTypes: {
        LC_WEAK: {
            replace: [TIER_WEAK],
            type: [EVO_TYPE_LC],
        },
        LC_BAD_WEAK_AVERAGE: {
            replace: [TIER_AVERAGE, TIER_WEAK, TIER_BAD],
            type: [EVO_TYPE_LC],
        },
        LC_AVERAGE_OR_WEAK: {
            replace: [TIER_AVERAGE, TIER_WEAK],
            type: [EVO_TYPE_LC],
        },
        LC_AVERAGE: {
            replace: [TIER_AVERAGE],
            type: [EVO_TYPE_LC],
        },
        LC_STRONG: {
            replace: [TIER_STRONG],
            type: [EVO_TYPE_LC],
        },
        LC_AVERAGE_OR_STRONG: {
            replace: [TIER_AVERAGE, TIER_STRONG],
            type: [EVO_TYPE_LC],
        },
        LC_NFE_OR_SOLO_AVERAGE_OR_STRONG: {
            replace: [TIER_AVERAGE, TIER_STRONG],
            type: [EVO_TYPE_LC, EVO_TYPE_NFE, EVO_TYPE_SOLO],
        },
        NFE_OR_SOLO_AVERAGE_OR_WEAK: {
            replace: [TIER_AVERAGE, TIER_WEAK],
            type: [EVO_TYPE_NFE, EVO_TYPE_SOLO],
        },
        NFE_OR_SOLO_AVERAGE: {
            replace: [TIER_AVERAGE],
            type: [EVO_TYPE_NFE, EVO_TYPE_SOLO],
        },
        NFE_OR_SOLO_STRONG: {
            replace: [TIER_STRONG],
            type: [EVO_TYPE_NFE, EVO_TYPE_SOLO],
        },
        NFE_OR_SOLO_PREMIUM: {
            replace: [TIER_PREMIUM],
            type: [EVO_TYPE_NFE, EVO_TYPE_SOLO],
        },
        NFE_OR_SOLO_AVERAGE_STRONG: {
            replace: [TIER_AVERAGE, TIER_STRONG],
            type: [EVO_TYPE_NFE, EVO_TYPE_SOLO],
        },
        NFE_STRONG: {
            replace: [TIER_STRONG],
            type: [EVO_TYPE_NFE],
        },
        NFE_MEGA: {
            replace: [TIER_BAD, TIER_WEAK, TIER_AVERAGE, TIER_STRONG],
            hasMega: true,
            type: [EVO_TYPE_LC, EVO_TYPE_NFE],
        },
        FINAL_OR_SOLO_AVERAGE: {
            replace: [TIER_AVERAGE],
            type: [EVO_TYPE_FINAL, EVO_TYPE_SOLO],
        },
        FINAL_OR_SOLO_STRONG: {
            replace: [TIER_STRONG],
            type: [EVO_TYPE_FINAL, EVO_TYPE_SOLO],
        },
        FINAL_OR_SOLO_AVERAGE_OR_STRONG: {
            replace: [TIER_AVERAGE, TIER_STRONG],
            type: [EVO_TYPE_FINAL, EVO_TYPE_SOLO],
        },
        FINAL_OR_SOLO_PREMIUM: {
            replace: [TIER_PREMIUM],
            type: [EVO_TYPE_FINAL, EVO_TYPE_SOLO],
        },
        FINAL_OR_SOLO_MEGA_LEGENDARY: {
            type: [EVO_TYPE_FINAL, EVO_TYPE_SOLO],
            hasMega: true,
            megaTiers: [TIER_LEGEND],
        },
        LC_NFE_OR_SOLO_AVERAGE: {
            replace: [TIER_AVERAGE],
            type: [EVO_TYPE_LC, EVO_TYPE_NFE, EVO_TYPE_SOLO],
        },
    },
    replacements: {
        // Shared
        SPECIES_SHELGON: 'NFE_OR_SOLO_STRONG',
        SPECIES_PUPITAR: 'NFE_OR_SOLO_STRONG',
        SPECIES_GABITE: 'NFE_OR_SOLO_STRONG',
        SPECIES_DOUBLADE: 'NFE_OR_SOLO_PREMIUM',
        SPECIES_JIRACHI: 'FINAL_OR_SOLO_PREMIUM',

        // Route101
        SPECIES_ZIGZAGOON: 'LC_BAD_WEAK_AVERAGE',

        // Route102
        SPECIES_WURMPLE: 'LC_BAD_WEAK_AVERAGE',
        SPECIES_WINGULL: 'LC_BAD_WEAK_AVERAGE',
        SPECIES_LOTAD: 'NFE_OR_SOLO_AVERAGE',
        SPECIES_KIRLIA: 'NFE_OR_SOLO_AVERAGE',

        // Route103
        SPECIES_SURSKIT: 'LC_BAD_WEAK_AVERAGE',
        SPECIES_TENTACOOL: 'NFE_OR_SOLO_AVERAGE',
        SPECIES_PELIPPER: 'NFE_OR_SOLO_AVERAGE',

        // Petalburg
        SPECIES_SMEARGLE: 'LC_BAD_WEAK_AVERAGE',
        SPECIES_GOLDEEN: 'NFE_OR_SOLO_AVERAGE_OR_WEAK',
        SPECIES_MILTANK: 'NFE_OR_SOLO_AVERAGE',

        // Route104
        SPECIES_GEODUDE: 'LC_AVERAGE_OR_WEAK',
        SPECIES_WEEDLE: 'LC_BAD_WEAK_AVERAGE',
        SPECIES_PONYTA: 'NFE_OR_SOLO_AVERAGE_OR_WEAK',

        // PetalburgWoods
        SPECIES_PATRAT: 'LC_AVERAGE_OR_WEAK',

        // Rustboro City
        SPECIES_PORYGON: 'LC_AVERAGE_OR_WEAK',

        // Route115
        SPECIES_SANDSHREW: 'NFE_OR_SOLO_AVERAGE',
        SPECIES_DELIBIRD: 'LC_AVERAGE_OR_WEAK',
        SPECIES_EKANS: 'NFE_OR_SOLO_AVERAGE',

        // Route116
        SPECIES_DITTO: 'LC_AVERAGE_OR_WEAK',
        SPECIES_SENTRET: 'LC_AVERAGE',
        SPECIES_HOOTHOOT: 'NFE_OR_SOLO_AVERAGE',

        // Dewford
        SPECIES_POOCHYENA: 'LC_WEAK',
        SPECIES_MIGHTYENA: 'NFE_OR_SOLO_AVERAGE',

        // Route106
        SPECIES_CHARMANDER: 'LC_AVERAGE',
        SPECIES_CHARMELEON: 'NFE_OR_SOLO_AVERAGE',

        // Granite Cave
        SPECIES_ARON: 'LC_STRONG',

        // Route109
        SPECIES_BULBASAUR: 'LC_AVERAGE',
        SPECIES_IVYSAUR: 'LC_WEAK',
        SPECIES_VENUSAUR: 'NFE_OR_SOLO_AVERAGE',

        // Slateport City
        SPECIES_ABSOL: 'LC_WEAK',

        // Route110
        SPECIES_ELECTRIKE: 'LC_AVERAGE',
        SPECIES_MANECTRIC: 'LC_AVERAGE',
        SPECIES_MAREEP: 'NFE_OR_SOLO_AVERAGE',

        // Route117
        SPECIES_ODDISH: 'LC_AVERAGE',
        SPECIES_GLOOM: 'LC_AVERAGE',
        SPECIES_VILEPLUME: 'NFE_OR_SOLO_AVERAGE',

        // Route118
        SPECIES_DEDENNE: 'NFE_OR_SOLO_AVERAGE_STRONG',
        SPECIES_CARVANHA: 'LC_AVERAGE',
        SPECIES_SHARPEDO: 'NFE_OR_SOLO_AVERAGE',

        // Route111
        SPECIES_TRAPINCH: 'LC_AVERAGE_OR_STRONG',
        SPECIES_DROWZEE: 'LC_AVERAGE',
        SPECIES_HYPNO: 'NFE_OR_SOLO_AVERAGE',

        // Route112
        SPECIES_NUMEL: 'LC_AVERAGE',
        SPECIES_TAILLOW: 'LC_AVERAGE',
        SPECIES_SWELLOW: 'NFE_OR_SOLO_AVERAGE',

        // Route113
        SPECIES_SPINDA: 'NFE_MEGA',

        // Route114
        SPECIES_SWABLU: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_ALTARIA: 'LC_WEAK',
        SPECIES_SPOINK: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route119
        SPECIES_LINOONE: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_SNIVY: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_SERVINE: 'NFE_OR_SOLO_AVERAGE',

        // Route120
        SPECIES_SANDILE: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_KROKOROK: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_KROOKODILE: 'NFE_OR_SOLO_AVERAGE',

        // Scorched Slab
        SPECIES_RIBOMBEE: 'NFE_MEGA',

        // Route121
        SPECIES_SHUPPET: 'LC_NFE_OR_SOLO_AVERAGE_OR_STRONG',
        SPECIES_METAPOD: 'LC_NFE_OR_SOLO_AVERAGE_OR_STRONG',
        SPECIES_HONEDGE: 'LC_NFE_OR_SOLO_AVERAGE_OR_STRONG',

        // Lilycove City
        SPECIES_WAILMER: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route 122
        SPECIES_WAILORD: 'LC_NFE_OR_SOLO_AVERAGE',

        // Mt. Pyre
        SPECIES_SPINARAK: 'LC_NFE_OR_SOLO_AVERAGE_OR_STRONG',
        SPECIES_ARIADOS: 'LC_NFE_OR_SOLO_AVERAGE_OR_STRONG',
        SPECIES_SPIDOPS: 'LC_NFE_OR_SOLO_AVERAGE_OR_STRONG',

        // Route 124
        SPECIES_WO_CHIEN: 'NFE_OR_SOLO_STRONG',
        SPECIES_GUZZLORD: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_KARTANA: 'LC_NFE_OR_SOLO_AVERAGE',

        // Mossdeep
        SPECIES_GOLETT: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route 125
        SPECIES_SCORBUNNY: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_RABOOT: 'FINAL_OR_SOLO_AVERAGE',

        // Shoal Cave
        SPECIES_FROAKIE: 'FINAL_OR_SOLO_STRONG',
        SPECIES_FROGADIER: 'FINAL_OR_SOLO_STRONG',

        // Route 127
        SPECIES_SCREAM_TAIL: 'FINAL_OR_SOLO_STRONG',
        SPECIES_OMANYTE: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_OMASTAR: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_RELICANTH: 'FINAL_OR_SOLO_STRONG',

        // Route 126
        SPECIES_FLUTTER_MANE: 'FINAL_OR_SOLO_STRONG',
        SPECIES_FINNEON: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_LUMINEON: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_HUNTAIL: 'FINAL_OR_SOLO_STRONG',

        // Sootopolis
        SPECIES_HAWLUCHA: 'FINAL_OR_SOLO_STRONG',

        // Route 128
        SPECIES_ROSELIA: 'FINAL_OR_SOLO_AVERAGE_OR_STRONG',
        SPECIES_ROSERADE: 'FINAL_OR_SOLO_AVERAGE_OR_STRONG',
        SPECIES_STARMIE: 'FINAL_OR_SOLO_AVERAGE_OR_STRONG',

        // Route 129
        SPECIES_IRON_HANDS: 'FINAL_OR_SOLO_STRONG',
        SPECIES_IRON_CROWN: 'FINAL_OR_SOLO_STRONG',

        // Route 131
        SPECIES_IRON_JUGULIS: 'FINAL_OR_SOLO_STRONG',
        SPECIES_IRON_BOULDER: 'FINAL_OR_SOLO_STRONG',

        // Pacifidlog Town
        SPECIES_IRON_LEAVES: 'FINAL_OR_SOLO_STRONG',
        SPECIES_IRON_MOTH: 'FINAL_OR_SOLO_STRONG',

        // Route 132
        SPECIES_IRON_THORNS: 'FINAL_OR_SOLO_STRONG',
        SPECIES_IRON_TREADS: 'FINAL_OR_SOLO_STRONG',

        // Ever Grande
        SPECIES_RAIKOU: 'FINAL_OR_SOLO_PREMIUM',
        SPECIES_ENTEI: 'FINAL_OR_SOLO_PREMIUM',
        SPECIES_SUICUNE: 'FINAL_OR_SOLO_PREMIUM',

        // Victory Road
        SPECIES_SHEDINJA: 'FINAL_OR_SOLO_MEGA_LEGENDARY',
    },
    maps: [
        // Shelgon maps
        {
            id: 'MAP_ROUTE101',
            land: 'SPECIES_ZIGZAGOON',
        },
        {
            id: 'MAP_ROUTE102',
            land: 'SPECIES_WURMPLE',
            old: 'SPECIES_WINGULL',
            good: 'SPECIES_LOTAD',
            surf: 'SPECIES_KIRLIA',
            super: 'SPECIES_SHELGON',
        },
        {
            id: 'MAP_ROUTE103',
            old: 'SPECIES_SURSKIT',
            good: 'SPECIES_TENTACOOL',
            surf: 'SPECIES_PELIPPER',
            super: 'SPECIES_SHELGON',
        },
        {
            id: 'MAP_PETALBURG_CITY',
            old: 'SPECIES_SMEARGLE',
            good: 'SPECIES_GOLDEEN',
            surf: 'SPECIES_MILTANK',
            super: 'SPECIES_SHELGON',
        },
        {
            id: 'MAP_ROUTE104',
            land: 'SPECIES_GEODUDE',
            old: 'SPECIES_WEEDLE',
            good: 'SPECIES_PONYTA',
            super: 'SPECIES_SHELGON',
        },
        {
            id: 'MAP_PETALBURG_WOODS',
            land: 'SPECIES_PATRAT',
        },
        {
            id: 'MAP_RUSTBORO_CITY',
            land: 'SPECIES_PORYGON'
        },
        {
            id: 'MAP_ROUTE115',
            land: 'SPECIES_SANDSHREW',
            old: 'SPECIES_DELIBIRD',
            good: 'SPECIES_EKANS',
            super: 'SPECIES_SHELGON',
        },
        {
            id: 'MAP_ROUTE116',
            land: 'SPECIES_DITTO',
            old: 'SPECIES_SENTRET',
            good: 'SPECIES_HOOTHOOT',
            super: 'SPECIES_SHELGON',
        },
        // Pupitar maps
        {
            id: 'MAP_DEWFORD_TOWN',
            old: 'SPECIES_POOCHYENA',
            good: 'SPECIES_MIGHTYENA',
            super: 'SPECIES_PUPITAR',
        },
        {
            id: 'MAP_ROUTE106',
            old: 'SPECIES_CHARMANDER',
            good: 'SPECIES_CHARMELEON',
            super: 'SPECIES_PUPITAR',
        },
        {
            id: 'MAP_GRANITE_CAVE',
            land: 'SPECIES_ARON',
        },
        {
            id: 'MAP_ROUTE109',
            land: 'SPECIES_BULBASAUR',
            old: 'SPECIES_IVYSAUR',
            good: 'SPECIES_VENUSAUR',
            super: 'SPECIES_PUPITAR',
        },
        {
            id: 'SLATEPORT_CITY',
            old: 'SPECIES_ABSOL',
            good: 'SPECIES_ABSOL',
            super: 'SPECIES_ABSOL',
        },
        {
            id: 'MAP_ROUTE110',
            land: 'SPECIES_ELECTRIKE',
            old: 'SPECIES_MANECTRIC',
            good: 'SPECIES_MAREEP',
            super: 'SPECIES_PUPITAR',
        },
        {
            id: 'MAP_ROUTE117',
            land: 'SPECIES_ODDISH',
            old: 'SPECIES_GLOOM',
            good: 'SPECIES_VILEPLUME',
            super: 'SPECIES_PUPITAR',
        },
        {
            id: 'MAP_ROUTE118',
            land: 'SPECIES_DEDENNE',
            old: 'SPECIES_CARVANHA',
            good: 'SPECIES_SHARPEDO',
            super: 'SPECIES_PUPITAR',
        },
        // Gabite maps
        {
            id: 'MAP_ROUTE111',
            land: 'SPECIES_TRAPINCH',
            old: 'SPECIES_DROWZEE',
            good: 'SPECIES_HYPNO',
            super: 'SPECIES_GABITE',
        },
        {
            id: 'MAP_ROUTE112',
            land: 'SPECIES_NUMEL',
            old: 'SPECIES_TAILLOW',
            good: 'SPECIES_SWELLOW',
            super: 'SPECIES_GABITE',
        },
        {
            id: 'MAP_ROUTE113',
            land: 'SPECIES_SPINDA',
        },
        {
            id: 'MAP_ROUTE114',
            land: 'SPECIES_SWABLU',
            old: 'SPECIES_ALTARIA',
            good: 'SPECIES_SPOINK',
            super: 'SPECIES_GABITE',
        },
        {
            id: 'MAP_ROUTE119',
            land: 'SPECIES_LINOONE',
            old: 'SPECIES_SNIVY',
            good: 'SPECIES_SERVINE',
            super: 'SPECIES_GABITE',
        },
        {
            id: 'MAP_ROUTE120',
            land: 'SPECIES_SANDILE',
            old: 'SPECIES_KROKOROK',
            good: 'SPECIES_KROOKODILE',
            super: 'SPECIES_GABITE',
        },
        {
            id: 'MAP_SCORCHED_SLAB',
            land: 'SPECIES_RIBOMBEE',
        },
        // Doublade maps
        {
            id: 'MAP_ROUTE121',
            land: 'SPECIES_SHUPPET',
            old: 'SPECIES_METAPOD',
            good: 'SPECIES_HONEDGE',
            super: 'SPECIES_DOUBLADE',
        },
        {
            id: 'MAP_LILYCOVE_CITY',
            old: 'SPECIES_WAILMER',
            good: 'SPECIES_WAILMER',
            super: 'SPECIES_WAILMER',
        },
        {
            id: 'MAP_ROUTE122',
            old: 'SPECIES_WAILORD',
            good: 'SPECIES_WAILORD',
            super: 'SPECIES_WAILORD',
        },
        {
            id: 'MAP_MT_PYRE_EXTERIOR',
            land: 'SPECIES_SPINARAK',
            old: 'SPECIES_ARIADOS',
            good: 'SPECIES_SPIDOPS',
            super: 'SPECIES_DOUBLADE',
        },
        {
            id: 'MAP_ROUTE124',
            land: 'SPECIES_WO_CHIEN',
            old: 'SPECIES_GUZZLORD',
            good: 'SPECIES_KARTANA',
            super: 'SPECIES_DOUBLADE',
        },
        {
            id: 'MAP_MOSSDEEP_CITY',
            old: 'SPECIES_GOLETT',
            good: 'SPECIES_GOLETT',
            super: 'SPECIES_GOLETT',
        },
        {
            id: 'MAP_ROUTE125',
            old: 'SPECIES_SCORBUNNY',
            good: 'SPECIES_RABOOT',
            super: 'SPECIES_DOUBLADE',
        },
        {
            id: 'MAP_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM',
            land: 'SPECIES_FROAKIE',
        },
        {
            id: 'MAP_SHOAL_CAVE_HIGH_TIDE_ENTRANCE_ROOM',
            surf: 'SPECIES_FROGADIER',
        },
        {
            id: 'MAP_ROUTE127',
            land: 'SPECIES_SCREAM_TAIL',
            old: 'SPECIES_OMANYTE',
            good: 'SPECIES_OMASTAR',
            super: 'SPECIES_DOUBLADE',
        },
        {
            id: 'MAP_UNDERWATER_ROUTE127',
            land: 'SPECIES_RELICANTH',
        },
        {
            id: 'MAP_ROUTE126',
            land: 'SPECIES_FLUTTER_MANE',
            old: 'SPECIES_FINNEON',
            good: 'SPECIES_LUMINEON',
            super: 'SPECIES_DOUBLADE',
        },
        {
            id: 'MAP_UNDERWATER_ROUTE126',
            land: 'SPECIES_HUNTAIL',
        },
        {
            id: 'SOOTOPOLIS_CITY',
            old: 'SPECIES_HAWLUCHA',
            good: 'SPECIES_HAWLUCHA',
            super: 'SPECIES_HAWLUCHA',
        },
        {
            id: 'MAP_ROUTE128',
            old: 'SPECIES_ROSELIA',
            good: 'SPECIES_ROSERADE',
            super: 'SPECIES_STARMIE',
        },
        // Jirachi map
        {
            id: 'MAP_ROUTE129',
            old: 'SPECIES_IRON_HANDS',
            good: 'SPECIES_IRON_CROWN',
            super: 'SPECIES_JIRACHI',
        },
        {
            id: 'MAP_ROUTE131',
            old: 'SPECIES_IRON_JUGULIS',
            good: 'SPECIES_IRON_BOULDER',
            super: 'SPECIES_JIRACHI',
        },
        {
            id: 'MAP_PACIFIDLOG_TOWN',
            old: 'SPECIES_IRON_LEAVES',
            good: 'SPECIES_IRON_MOTH',
            super: 'SPECIES_JIRACHI',
        },
        {
            id: 'MAP_ROUTE132',
            old: 'SPECIES_IRON_THORNS',
            good: 'SPECIES_IRON_TREADS',
            super: 'SPECIES_JIRACHI',
        },
        {
            id: 'EVER_GRANDE_CITY',
            old: 'SPECIES_RAIKOU',
            good: 'SPECIES_ENTEI',
            super: 'SPECIES_SUICUNE',
        },
        {
            id: 'MAP_VICTORY_ROAD_B1F',
            land: 'SPECIES_SHEDINJA',
        },
        // Special
        {
            id: 'MAP_WEATHER_INSTITUTE',
            special: 'SPECIES_CASTFORM_NORMAL',
        },
        {
            id: 'MAP_DESERT_RUINS',
            special: 'SPECIES_REGIROCK',
        },
        {
            id: 'MAP_ISLAND_CAVE',
            special: 'SPECIES_REGICE',
        },
        {
            id: 'MAP_ANCIENT_TOMB',
            special: 'SPECIES_REGISTEEL',
        },
        {
            id: 'MAP_TATE_AND_LIZAS_GIFT',
            special: 'SPECIES_LATIOS',
        },
        {
            id: 'MAP_NEW_MAUVILLE',
            special: 'SPECIES_MEW',
        },
        {
            id: 'MAP_SKY_PILLAR_TOP',
            special1: 'SPECIES_LEGEND1',
            special2: 'SPECIES_LEGEND2',
            special3: 'SPECIES_LEGEND3',
        },
    ]
};

module.exports = wildData;
