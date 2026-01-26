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
        LC_NFE_OR_SOLO_AVERAGE_OR_WEAK: {
            replace: [TIER_AVERAGE, TIER_WEAK],
            type: [EVO_TYPE_LC, EVO_TYPE_NFE, EVO_TYPE_SOLO],
        },
        LC_NFE_OR_SOLO_AVERAGE: {
            replace: [TIER_AVERAGE],
            type: [EVO_TYPE_LC, EVO_TYPE_NFE, EVO_TYPE_SOLO],
        },
        NFE_OR_SOLO_STRONG: {
            replace: [TIER_STRONG],
            type: [EVO_TYPE_NFE, EVO_TYPE_SOLO],
        },
        NFE_OR_LC_PREMIUM: {
            replace: [TIER_PREMIUM],
            type: [EVO_TYPE_NFE, EVO_TYPE_LC],
        },
        NFE_OR_SOLO_PREMIUM: {
            replace: [TIER_PREMIUM],
            type: [EVO_TYPE_NFE, EVO_TYPE_SOLO],
        },
        LC_NFE_OR_SOLO_AVERAGE_STRONG: {
            replace: [TIER_AVERAGE, TIER_STRONG],
            type: [EVO_TYPE_LC, EVO_TYPE_NFE, EVO_TYPE_SOLO],
        },
        NFE_OR_LC_STRONG: {
            replace: [TIER_STRONG],
            type: [EVO_TYPE_LC, EVO_TYPE_NFE],
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
        FINAL_STRONG: {
            replace: [TIER_STRONG],
            type: [EVO_TYPE_FINAL],
        },
        FINAL_OR_SOLO_STRONG: {
            replace: [TIER_STRONG],
            type: [EVO_TYPE_FINAL, EVO_TYPE_SOLO],
        },
        FINAL_OR_SOLO_AVERAGE_OR_STRONG: {
            replace: [TIER_AVERAGE, TIER_STRONG],
            type: [EVO_TYPE_FINAL, EVO_TYPE_SOLO],
        },
        FINAL_PREMIUM: {
            replace: [TIER_PREMIUM],
            type: [EVO_TYPE_FINAL],
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
        SPECIES_SHELGON: 'NFE_OR_LC_STRONG',
        SPECIES_PUPITAR: 'NFE_OR_LC_STRONG',
        SPECIES_GABITE: 'NFE_OR_LC_STRONG',
        SPECIES_DOUBLADE: 'NFE_OR_LC_PREMIUM',
        SPECIES_JIRACHI: 'FINAL_PREMIUM',

        // Route101
        SPECIES_ZIGZAGOON: 'LC_BAD_WEAK_AVERAGE',

        // Route102
        SPECIES_WURMPLE: 'LC_BAD_WEAK_AVERAGE',
        SPECIES_WINGULL: 'LC_BAD_WEAK_AVERAGE',
        SPECIES_LOTAD: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_KIRLIA: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route103
        SPECIES_SMEARGLE: 'LC_BAD_WEAK_AVERAGE',
        SPECIES_SURSKIT: 'LC_BAD_WEAK_AVERAGE',
        SPECIES_TENTACOOL: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_PELIPPER: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route104
        SPECIES_GEODUDE: 'LC_BAD_WEAK_AVERAGE',
        SPECIES_WEEDLE: 'LC_BAD_WEAK_AVERAGE',
        SPECIES_PONYTA: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_POOCHYENA: 'LC_NFE_OR_SOLO_AVERAGE',

        // PetalburgWoods
        SPECIES_PATRAT: 'LC_AVERAGE',
        SPECIES_CATERPIE: 'LC_BAD_WEAK_AVERAGE',
        SPECIES_KAKUNA: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_BUTTERFREE: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route115
        SPECIES_SANDSHREW: 'LC_AVERAGE_OR_WEAK',
        SPECIES_DELIBIRD: 'LC_AVERAGE_OR_WEAK',
        SPECIES_EKANS: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_GOLDEEN: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route116
        SPECIES_DITTO: 'LC_AVERAGE_OR_WEAK',
        SPECIES_SENTRET: 'LC_AVERAGE',
        SPECIES_HOOTHOOT: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_SEAKING: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route106
        SPECIES_MACHOP: 'LC_AVERAGE',
        SPECIES_CHARMANDER: 'LC_AVERAGE',
        SPECIES_CHARMELEON: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_MACHOKE: 'LC_NFE_OR_SOLO_AVERAGE',

        // Granite Cave
        SPECIES_ARON: 'LC_STRONG',

        // Route109
        SPECIES_BULBASAUR: 'LC_AVERAGE',
        SPECIES_IVYSAUR: 'LC_WEAK',
        SPECIES_VENUSAUR: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_MAKUHITA: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route110
        SPECIES_ELECTRIKE: 'LC_AVERAGE',
        SPECIES_MANECTRIC: 'LC_AVERAGE',
        SPECIES_MAREEP: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_FLAAFFY: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route117
        SPECIES_ODDISH: 'LC_AVERAGE',
        SPECIES_GLOOM: 'LC_AVERAGE',
        SPECIES_VILEPLUME: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_ABSOL: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route118
        SPECIES_DEDENNE: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_CARVANHA: 'LC_AVERAGE',
        SPECIES_SHARPEDO: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_MILTANK: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route111
        SPECIES_TRAPINCH: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_DROWZEE: 'LC_AVERAGE',
        SPECIES_HYPNO: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_VIBRAVA: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route112
        SPECIES_NUMEL: 'LC_AVERAGE',
        SPECIES_TAILLOW: 'LC_AVERAGE',
        SPECIES_SWELLOW: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_CAMERUPT: 'LC_NFE_OR_SOLO_AVERAGE',

        // Jagged Pass
        SPECIES_NOIBAT: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_NOIVERN: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_WOOBAT: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_SWOOBAT: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route113
        SPECIES_SPINDA: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_BIDOOF: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_BIBAREL: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_LICKITUNG: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route114
        SPECIES_SWABLU: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_ALTARIA: 'LC_WEAK',
        SPECIES_SPOINK: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_GRUMPIG: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route119
        SPECIES_LINOONE: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_SNIVY: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_SERVINE: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_SERPERIOR: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route120
        SPECIES_SANDILE: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_KROKOROK: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_KROOKODILE: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_STUNFISK: 'LC_NFE_OR_SOLO_AVERAGE',

        // Scorched Slab
        // @TODO Make entrance easier, split trainers
        SPECIES_RIBOMBEE: 'NFE_OR_LC_STRONG',
        SPECIES_DUSKULL: 'NFE_OR_LC_STRONG',
        SPECIES_DUSCLOPS: 'NFE_OR_LC_STRONG',
        SPECIES_DUSKNOIR: 'NFE_OR_LC_STRONG',

        // Route121
        SPECIES_SHUPPET: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_METAPOD: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_HONEDGE: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_BANETTE: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route 122
        SPECIES_PORYGON: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_WAILMER: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_WAILORD: 'LC_NFE_OR_SOLO_AVERAGE',

        // Mt. Pyre
        SPECIES_SPINARAK: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_ARIADOS: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_SPIDOPS: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_SPIRITOMB: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route 123 @TODO Add mega stone trainers scattered
        SPECIES_AERODACTYL: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_KABUTOPS: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_KADABRA: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_ALAKAZAM: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route 124
        SPECIES_WO_CHIEN: 'NFE_OR_LC_STRONG',
        SPECIES_GUZZLORD: 'LC_NFE_OR_SOLO_AVERAGE',
        SPECIES_KARTANA: 'LC_NFE_OR_SOLO_AVERAGE',

        // Route 125
        SPECIES_SCORBUNNY: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_RABOOT: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_CINDERACE: 'FINAL_STRONG',

        // Shoal Cave
        SPECIES_FROAKIE: 'FINAL_PREMIUM',
        SPECIES_FROGADIER: 'FINAL_PREMIUM',

        // Route 127
        SPECIES_SCREAM_TAIL: 'FINAL_STRONG',
        SPECIES_OMANYTE: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_OMASTAR: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_RELICANTH: 'FINAL_STRONG',

        // Route 126
        SPECIES_FLUTTER_MANE: 'FINAL_STRONG',
        SPECIES_FINNEON: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_LUMINEON: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_HUNTAIL: 'FINAL_STRONG',

        // Route 128
        SPECIES_ROSELIA: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_ROSERADE: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_STARMIE: 'FINAL_OR_SOLO_AVERAGE',

        // Route 129
        SPECIES_DARKRAI: 'FINAL_STRONG',
        SPECIES_IRON_HANDS: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_IRON_CROWN: 'FINAL_OR_SOLO_AVERAGE',

        // Route 131
        SPECIES_INFERNAPE: 'FINAL_STRONG',
        SPECIES_IRON_JUGULIS: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_IRON_BOULDER: 'FINAL_OR_SOLO_AVERAGE',

        // Pacifidlog Town
        SPECIES_IRON_LEAVES: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_IRON_MOTH: 'FINAL_OR_SOLO_AVERAGE',

        // Route 132
        SPECIES_IRON_THORNS: 'FINAL_OR_SOLO_AVERAGE',
        SPECIES_IRON_TREADS: 'FINAL_OR_SOLO_AVERAGE',

        // Ever Grande
        SPECIES_TORTERRA: 'FINAL_STRONG',
        SPECIES_RAIKOU: 'FINAL_STRONG',
        SPECIES_ENTEI: 'FINAL_STRONG',
        SPECIES_SUICUNE: 'FINAL_STRONG',

        // Victory Road
        SPECIES_SHEDINJA: 'FINAL_OR_SOLO_PREMIUM',
        SPECIES_MOLTRES: 'FINAL_OR_SOLO_PREMIUM',
        SPECIES_ZAPDOS: 'FINAL_OR_SOLO_PREMIUM',
        SPECIES_ARTICUNO: 'FINAL_OR_SOLO_PREMIUM',
        SPECIES_LUGIA: 'FINAL_OR_SOLO_PREMIUM',
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
            land: 'SPECIES_SMEARGLE',
            old: 'SPECIES_SURSKIT',
            good: 'SPECIES_TENTACOOL',
            surf: 'SPECIES_PELIPPER',
            super: 'SPECIES_SHELGON',
        },
        {
            id: 'MAP_ROUTE104',
            land: 'SPECIES_GEODUDE',
            old: 'SPECIES_WEEDLE',
            good: 'SPECIES_PONYTA',
            surf: 'SPECIES_POOCHYENA',
            super: 'SPECIES_SHELGON',
        },
        {
            id: 'MAP_PETALBURG_WOODS',
            land: 'SPECIES_PATRAT',
            old: 'SPECIES_CATERPIE',
            good: 'SPECIES_KAKUNA',
            surf: 'SPECIES_BUTTERFREE',
            super: 'SPECIES_SHELGON',
        },
        {
            id: 'MAP_ROUTE115',
            land: 'SPECIES_SANDSHREW',
            old: 'SPECIES_DELIBIRD',
            good: 'SPECIES_EKANS',
            surf: 'SPECIES_GOLDEEN',
            super: 'SPECIES_SHELGON',
        },
        {
            id: 'MAP_ROUTE116',
            land: 'SPECIES_DITTO',
            old: 'SPECIES_SENTRET',
            good: 'SPECIES_HOOTHOOT',
            surf: 'SPECIES_SEAKING',
            super: 'SPECIES_SHELGON',
        },
        // Pupitar maps
        {
            id: 'MAP_ROUTE106',
            land: 'SPECIES_MACHOP',
            old: 'SPECIES_CHARMANDER',
            good: 'SPECIES_CHARMELEON',
            surf: 'SPECIES_MACHOKE',
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
            surf: 'SPECIES_MAKUHITA',
            super: 'SPECIES_PUPITAR',
        },
        {
            id: 'MAP_ROUTE110',
            land: 'SPECIES_ELECTRIKE',
            old: 'SPECIES_MANECTRIC',
            good: 'SPECIES_MAREEP',
            surf: 'SPECIES_FLAAFFY',
            super: 'SPECIES_PUPITAR',
        },
        {
            id: 'MAP_ROUTE117',
            land: 'SPECIES_ODDISH',
            old: 'SPECIES_GLOOM',
            good: 'SPECIES_VILEPLUME',
            surf: 'SPECIES_ABSOL',
            super: 'SPECIES_PUPITAR',
        },
        {
            id: 'MAP_ROUTE118',
            land: 'SPECIES_DEDENNE',
            old: 'SPECIES_CARVANHA',
            good: 'SPECIES_SHARPEDO',
            surf: 'SPECIES_MILTANK',
            super: 'SPECIES_PUPITAR',
        },
        // Gabite maps
        {
            id: 'MAP_ROUTE111',
            land: 'SPECIES_TRAPINCH',
            old: 'SPECIES_DROWZEE',
            good: 'SPECIES_HYPNO',
            surf: 'SPECIES_VIBRAVA',
            super: 'SPECIES_GABITE',
            level: 36,
        },
        {
            id: 'MAP_ROUTE112',
            land: 'SPECIES_NUMEL',
            old: 'SPECIES_TAILLOW',
            good: 'SPECIES_SWELLOW',
            surf: 'SPECIES_CAMERUPT',
            super: 'SPECIES_GABITE',
        },
        {
            id: 'MAP_JAGGED_PASS',
            land: 'SPECIES_NOIBAT',
            old: 'SPECIES_NOIVERN',
            good: 'SPECIES_WOOBAT',
            surf: 'SPECIES_SWOOBAT',
            super: 'SPECIES_GABITE',
        },
        {
            id: 'MAP_ROUTE113',
            land: 'SPECIES_SPINDA',
            old: 'SPECIES_BIDOOF',
            good: 'SPECIES_BIBAREL',
            surf: 'SPECIES_LICKITUNG',
            super: 'SPECIES_GABITE',
            level: 33,
        },
        {
            id: 'MAP_ROUTE114',
            land: 'SPECIES_SWABLU',
            old: 'SPECIES_ALTARIA',
            good: 'SPECIES_SPOINK',
            surf: 'SPECIES_GRUMPIG',
            super: 'SPECIES_GABITE',
            level: 33,
        },
        {
            id: 'MAP_ROUTE119',
            land: 'SPECIES_LINOONE',
            old: 'SPECIES_SNIVY',
            good: 'SPECIES_SERVINE',
            surf: 'SPECIES_SERPERIOR',
            super: 'SPECIES_GABITE',
            level: 39,
        },
        {
            id: 'MAP_ROUTE120',
            land: 'SPECIES_SANDILE',
            old: 'SPECIES_KROKOROK',
            good: 'SPECIES_KROOKODILE',
            surf: 'SPECIES_STUNFISK',
            super: 'SPECIES_GABITE',
            level: 43,
        },
        // Doublade maps
        {
            id: 'MAP_SCORCHED_SLAB',
            land: 'SPECIES_RIBOMBEE',
            old: 'SPECIES_DUSKULL',
            good: 'SPECIES_DUSCLOPS',
            surf: 'SPECIES_DUSKNOIR',
            super: 'SPECIES_DOUBLADE',
            level: 43,
        },
        {
            id: 'MAP_ROUTE121',
            land: 'SPECIES_SHUPPET',
            old: 'SPECIES_METAPOD',
            good: 'SPECIES_HONEDGE',
            surf: 'SPECIES_BANETTE',
            super: 'SPECIES_DOUBLADE',
            level: 46,
        },
        {
            id: 'MAP_ROUTE122',
            land: 'SPECIES_PORYGON',
            old: 'SPECIES_WAILMER',
            good: 'SPECIES_WAILORD',
            super: 'SPECIES_DOUBLADE',
            level: 46,
        },
        {
            id: 'MAP_MT_PYRE_EXTERIOR',
            land: 'SPECIES_SPINARAK',
            old: 'SPECIES_ARIADOS',
            good: 'SPECIES_SPIDOPS',
            surf: 'SPECIES_SPIRITOMB',
            super: 'SPECIES_DOUBLADE',
            level: 46,
        },
        {
            id: 'MAP_ROUTE123',
            land: 'SPECIES_AERODACTYL',
            old: 'SPECIES_KABUTOPS',
            good: 'SPECIES_KADABRA',
            surf: 'SPECIES_ALAKAZAM',
            super: 'SPECIES_DOUBLADE',
            level: 61,
        },
        {
            id: 'MAP_ROUTE124',
            land: 'SPECIES_WO_CHIEN',
            old: 'SPECIES_GUZZLORD',
            good: 'SPECIES_KARTANA',
            super: 'SPECIES_DOUBLADE',
            level: 53,
        },
        {
            id: 'MAP_ROUTE125',
            land: 'SPECIES_CINDERACE',
            old: 'SPECIES_SCORBUNNY',
            good: 'SPECIES_RABOOT',
            super: 'SPECIES_DOUBLADE',
            level: 56,
        },
        {
            id: 'MAP_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM',
            land: 'SPECIES_FROAKIE',
            level: 56,
        },
        {
            id: 'MAP_SHOAL_CAVE_HIGH_TIDE_ENTRANCE_ROOM',
            surf: 'SPECIES_FROGADIER',
            level: 56,
        },
        {
            id: 'MAP_ROUTE127',
            land: 'SPECIES_SCREAM_TAIL',
            old: 'SPECIES_OMANYTE',
            good: 'SPECIES_OMASTAR',
            underwater: 'SPECIES_RELICANTH',
            super: 'SPECIES_DOUBLADE',
            level: 58,
        },
        {
            id: 'MAP_ROUTE126',
            land: 'SPECIES_FLUTTER_MANE',
            old: 'SPECIES_FINNEON',
            good: 'SPECIES_LUMINEON',
            underwater: 'SPECIES_HUNTAIL',
            super: 'SPECIES_DOUBLADE',
            level: 58,
        },
        {
            id: 'MAP_ROUTE128',
            old: 'SPECIES_ROSELIA',
            good: 'SPECIES_ROSERADE',
            super: 'SPECIES_STARMIE',
            level: 58,
        },
        // Jirachi map
        {
            id: 'MAP_ROUTE129',
            land: 'SPECIES_DARKRAI',
            old: 'SPECIES_IRON_HANDS',
            good: 'SPECIES_IRON_CROWN',
            super: 'SPECIES_JIRACHI',
            level: 61,
        },
        {
            id: 'MAP_ROUTE131',
            land: 'SPECIES_INFERNAPE',
            old: 'SPECIES_IRON_JUGULIS',
            good: 'SPECIES_IRON_BOULDER',
            super: 'SPECIES_JIRACHI',
            level: 61,
        },
        {
            id: 'MAP_PACIFIDLOG_TOWN',
            old: 'SPECIES_IRON_LEAVES',
            good: 'SPECIES_IRON_MOTH',
            super: 'SPECIES_JIRACHI',
            level: 61,
        },
        {
            id: 'MAP_ROUTE132',
            old: 'SPECIES_IRON_THORNS',
            good: 'SPECIES_IRON_TREADS',
            super: 'SPECIES_JIRACHI',
            level: 61,
        },
        {
            id: 'EVER_GRANDE_CITY',
            land: 'SPECIES_TORTERRA',
            old: 'SPECIES_RAIKOU',
            good: 'SPECIES_ENTEI',
            super: 'SPECIES_SUICUNE',
            level: 64,
        },
        {
            id: 'MAP_VICTORY_ROAD_B1F',
            land: 'SPECIES_SHEDINJA',
            old: 'SPECIES_MOLTRES',
            good: 'SPECIES_ZAPDOS',
            surf: 'SPECIES_ARTICUNO',
            super: 'SPECIES_LUGIA',
            level: 67,
        },
        // Special
        {
            id: 'MAP_DESERT_RUINS',
            special: 'SPECIES_REGIROCK',
        },
        {
            id: 'MAP_ISLAND_CAVE',
            special: 'SPECIES_REGICE',
        },
        {
            id: 'MAP_NEW_MAUVILLE',
            special: 'SPECIES_MEW',
        },
        {
            id: 'MAP_ANCIENT_TOMB',
            special: 'SPECIES_REGISTEEL',
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
