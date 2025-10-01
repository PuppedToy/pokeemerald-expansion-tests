const path = require('path');

const {
    TIER_BAD,
    TIER_WEAK,
    TIER_AVERAGE,
    TIER_STRONG,

    POKE_TYPE_LC,
    POKE_TYPE_NFE,
    POKE_TYPE_SOLO,
} = require('./constants.js');

// For fishing, each route will have 1 land and 1 old rod option
// Good rod may offer a delay reward in AVERAGE mons
// Super rod will offer a PREMIUM mom shared across different routes

// We will design the game to have a specific amount of encounters available

// This is the true wild data
const wildData = {
    file: path.resolve(__dirname, '..', 'src', 'data', 'wild_encounters.json'),
    replacementTypes: {
        LC_BAD_WEAK: {
            replace: [TIER_WEAK, TIER_BAD],
            type: [POKE_TYPE_LC],
        },
        LC_WEAK: {
            replace: [TIER_WEAK],
            type: [POKE_TYPE_LC],
        },
        LC_OR_SOLO_WEAK: {
            replace: [TIER_WEAK],
            type: [POKE_TYPE_LC, POKE_TYPE_SOLO],
        },
        LC_AVERAGE_OR_WEAK: {
            replace: [TIER_AVERAGE, TIER_WEAK],
            type: [POKE_TYPE_LC],
        },
        NFE_OR_SOLO_AVERAGE_OR_WEAK: {
            replace: [TIER_AVERAGE, TIER_WEAK],
            type: [POKE_TYPE_NFE, POKE_TYPE_SOLO],
        },
        NFE_OR_SOLO_AVERAGE: {
            replace: [TIER_AVERAGE],
            type: [POKE_TYPE_NFE, POKE_TYPE_SOLO],
        },
        NFE_OR_SOLO_STRONG: {
            replace: [TIER_STRONG],
            type: [POKE_TYPE_NFE, POKE_TYPE_SOLO],
        },
    },
    replacements: {
        // Shared
        SPECIES_SHELGON: 'NFE_OR_SOLO_STRONG',

        // Route101
        SPECIES_ZIGZAGOON: 'LC_BAD_WEAK',

        // Route102
        SPECIES_WURMPLE: 'LC_BAD_WEAK',
        SPECIES_WINGULL: 'LC_WEAK',
        SPECIES_LOTAD: 'NFE_OR_SOLO_AVERAGE_OR_WEAK',
        SPECIES_KIRLIA: 'NFE_OR_SOLO_AVERAGE',

        // Route103
        SPECIES_POOCHYENA: 'LC_BAD_WEAK',
        SPECIES_SURSKIT: 'LC_WEAK',
        SPECIES_TENTACOOL: 'NFE_OR_SOLO_AVERAGE_OR_WEAK',
        SPECIES_PELIPPER: 'NFE_OR_SOLO_AVERAGE',

        // Petalburg
        SPECIES_SMEARGLE: 'LC_WEAK',
        SPECIES_GOLDEEN: 'NFE_OR_SOLO_AVERAGE_OR_WEAK',
        SPECIES_MILTANK: 'NFE_OR_SOLO_AVERAGE',

        // Route104
        SPECIES_GEODUDE: 'LC_AVERAGE_OR_WEAK',
        SPECIES_WEEDLE: 'LC_WEAK',
        SPECIES_PONYTA: 'NFE_OR_SOLO_AVERAGE_OR_WEAK',

        // PetalburgWoods
        SPECIES_PATRAT: 'LC_AVERAGE_OR_WEAK',

        // Route115
        SPECIES_SANDSHREW: 'NFE_OR_SOLO_AVERAGE_OR_WEAK',
        SPECIES_DELIBIRD: 'LC_OR_SOLO_WEAK',
        SPECIES_EKANS: 'NFE_OR_SOLO_AVERAGE_OR_WEAK',

        // Route116
        SPECIES_DITTO: 'LC_OR_SOLO_WEAK',
        SPECIES_SENTRET: 'LC_WEAK',
        SPECIES_HOOTHOOT: 'NFE_OR_SOLO_AVERAGE_OR_WEAK',
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
            land: 'SPECIES_POOCHYENA',
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
            super: 'SPECIES_GOLDEEN',
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
    ]
};

module.exports = wildData;
