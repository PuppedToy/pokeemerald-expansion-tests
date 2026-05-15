const items = {
    // Randomized items - mints
    // ITEM_MECH_MAIL will be replaced by these
    strongAtkMints: [ // 1 at Route 109, 1 at Route 113, 1 at Route 115
        'ITEM_ADAMANT_MINT',
        'ITEM_JOLLY_MINT',
        'ITEM_MODEST_MINT',
        'ITEM_TIMID_MINT',
    ],
    // ITEM_WAVE_MAIL will be replaced by these
    strongDefMints: [ // 1 at Route 103, 1 at route 118, 1 at Route 113, 1 at Route 115
        'ITEM_BOLD_MINT',
        'ITEM_IMPISH_MINT',
        'ITEM_CALM_MINT',
        'ITEM_CAREFUL_MINT',
        'ITEM_RELAXED_MINT',
        'ITEM_SASSY_MINT',
    ],
    // ITEM_WOOD_MAIL will be replaced by these
    midMints: [ // 1 at Rustboro, 1 at Route 117, 1 at Route 113
        'ITEM_LONELY_MINT',
        'ITEM_NAUGHTY_MINT',
        'ITEM_BRAVE_MINT',
        'ITEM_LAX_MINT',
        'ITEM_MILD_MINT',
        'ITEM_RASH_MINT',
        'ITEM_QUIET_MINT',
        'ITEM_GENTLE_MINT',
        'ITEM_HASTY_MINT',
        'ITEM_NAIVE_MINT',
    ],

    shards: ['ITEM_RED_SHARD', 'ITEM_BLUE_SHARD', 'ITEM_YELLOW_SHARD', 'ITEM_GREEN_SHARD'],

    fossils: [
        'ITEM_HELIX_FOSSIL',
        'ITEM_DOME_FOSSIL',
        'ITEM_OLD_AMBER',
        'ITEM_ROOT_FOSSIL',
        'ITEM_CLAW_FOSSIL',
        'ITEM_ARMOR_FOSSIL',
        'ITEM_SKULL_FOSSIL',
        'ITEM_COVER_FOSSIL',
        'ITEM_PLUME_FOSSIL',
        'ITEM_JAW_FOSSIL',
        'ITEM_SAIL_FOSSIL',
    ],

    plates: {
        ITEM_FLAME_PLATE: 'FIRE',
        ITEM_SPLASH_PLATE: 'WATER',
        ITEM_ZAP_PLATE: 'ELECTRIC',
        ITEM_MEADOW_PLATE: 'GRASS',
        ITEM_ICICLE_PLATE: 'ICE',
        ITEM_FIST_PLATE: 'FIGHTING',
        ITEM_TOXIC_PLATE: 'POISON',
        ITEM_EARTH_PLATE: 'GROUND',
        ITEM_SKY_PLATE: 'FLYING',
        ITEM_MIND_PLATE: 'PSYCHIC',
        ITEM_INSECT_PLATE: 'BUG',
        ITEM_STONE_PLATE: 'ROCK',
        ITEM_SPOOKY_PLATE: 'GHOST',
        ITEM_DRACO_PLATE: 'DRAGON',
        ITEM_DREAD_PLATE: 'DARK',
        ITEM_IRON_PLATE: 'STEEL',
        ITEM_PIXIE_PLATE: 'FAIRY',
    },

    memories: [
        'ITEM_FIRE_MEMORY',
        'ITEM_WATER_MEMORY',
        'ITEM_ELECTRIC_MEMORY',
        'ITEM_GRASS_MEMORY',
        'ITEM_ICE_MEMORY',
        'ITEM_FIGHTING_MEMORY',
        'ITEM_POISON_MEMORY',
        'ITEM_GROUND_MEMORY',
        'ITEM_FLYING_MEMORY',
        'ITEM_PSYCHIC_MEMORY',
        'ITEM_BUG_MEMORY',
        'ITEM_ROCK_MEMORY',
        'ITEM_GHOST_MEMORY',
        'ITEM_DRAGON_MEMORY',
        'ITEM_DARK_MEMORY',
        'ITEM_STEEL_MEMORY',
        'ITEM_FAIRY_MEMORY',
    ],

    gems: [
        'ITEM_NORMAL_GEM',
        'ITEM_FIRE_GEM',
        'ITEM_WATER_GEM',
        'ITEM_ELECTRIC_GEM',
        'ITEM_GRASS_GEM',
        'ITEM_ICE_GEM',
        'ITEM_FIGHTING_GEM',
        'ITEM_POISON_GEM',
        'ITEM_GROUND_GEM',
        'ITEM_FLYING_GEM',
        'ITEM_PSYCHIC_GEM',
        'ITEM_BUG_GEM',
        'ITEM_ROCK_GEM',
        'ITEM_GHOST_GEM',
        'ITEM_DRAGON_GEM',
        'ITEM_DARK_GEM',
        'ITEM_STEEL_GEM',
        'ITEM_FAIRY_GEM',
    ],

    // Will I use these?
    specifics: {
        P_FAMILY_PIKACHU: ['ITEM_LIGHT_BALL'],
        P_FAMILY_FARFETCHD: ['ITEM_LEEK'],
        P_FAMILY_CUBONE: ['ITEM_THICK_CLUB'],
        P_FAMILY_CHANSEY: ['ITEM_LUCKY_PUNCH'],
        P_FAMILY_DITTO: ['ITEM_QUICK_POWDER'],
        P_FAMILY_CLAMPERL: ['ITEM_DEEP_SEA_TOOTH', 'ITEM_DEEP_SEA_SCALE'],
        P_FAMILY_ROTOM: ['ITEM_ROTOM_CATALOG'],
        P_FAMILY_SHAYMIN: ['ITEM_GRACIDEA', 'ITEM_REVEAL_GLASS'],
        P_FAMILY_LATIAS: ['ITEM_SOUL_DEW'],
        P_FAMILY_LATIOS: ['ITEM_SOUL_DEW'],
        P_FAMILY_DIALGA: ['ITEM_ADAMANT_ORB', 'ITEM_ADAMANT_CRYSTAL'],
        P_FAMILY_PALKIA: ['ITEM_LUSTROUS_ORB', 'ITEM_LUSTROUS_GLOBE'],
        P_FAMILY_GIRATINA: ['ITEM_GRISEOUS_ORB', 'ITEM_GRISEOUS_CORE'],
        P_FAMILY_KYUREM: ['ITEM_DNA_SPLICERS'],
        P_FAMILY_ZYGARDE: ['ITEM_ZYGARDE_CUBE'],
        P_FAMILY_HOOPA: ['ITEM_PRISON_BOTTLE'],
        P_FAMILY_NECROZMA: ['ITEM_N_SOLARIZER', 'ITEM_N_LUNARIZER'],
        P_FAMILY_CALYREX: ['ITEM_REINS_OF_UNITY'],
    },

    // Probably not randomized
    drives: ['ITEM_DOUSE_DRIVE', 'ITEM_SHOCK_DRIVE', 'ITEM_BURN_DRIVE', 'ITEM_CHILL_DRIVE'],

    // Probably not randomized. Expected to be found at a specific moments.
    premiumItems: [
        'ITEM_CHOICE_BAND',
        'ITEM_CHOICE_SPECS',
        'ITEM_CHOICE_SCARF',
        'ITEM_LUM_BERRY',
        'ITEM_LEFTOVERS',
        'ITEM_EVIOLITE',
        'ITEM_FOCUS_SASH',
        'ITEM_EJECT_BUTTON',
    ],
    
    otherLockedItems: [
        'ITEM_TOXIC_ORB',
        'ITEM_FLAME_ORB',
        'ITEM_DAMP_ROCK',
        'ITEM_HEAT_ROCK',
        'ITEM_SMOOTH_ROCK',
        'ITEM_ICY_ROCK',
        'ITEM_ELECTRIC_SEED',
        'ITEM_GRASSY_SEED',
        'ITEM_MISTY_SEED',
        'ITEM_PSYCHIC_SEED',
        'ITEM_ORAN_BERRY',
    ],

    // These items will also be pooled but won't be in 3-choices.
    // They will appear as singles in the world randomly.
    goodItemPool: [
        'ITEM_BLACK_SLUDGE',
        'ITEM_LIFE_ORB',
        'ITEM_ASSAULT_VEST',
        'ITEM_WEAKNESS_POLICY',
        'ITEM_AIR_BALLOON',
        'ITEM_LOADED_DICE',  
        'ITEM_SITRUS_BERRY',
        'ITEM_SHELL_BELL',
        'ITEM_ROCKY_HELMET',
        'ITEM_BOOSTER_ENERGY',
    ],

    averageItemPool: [
        'ITEM_EJECT_PACK',
        'ITEM_LIGHT_CLAY',
        'ITEM_APICOT_BERRY',
        'ITEM_ENIGMA_BERRY',
        'ITEM_FIGY_BERRY',
        'ITEM_SALAC_BERRY',
        'ITEM_PETAYA_BERRY',
        'ITEM_LIECHI_BERRY',
        'ITEM_GANLON_BERRY',
        'ITEM_KEE_BERRY',
        'ITEM_MARANGA_BERRY',
        'ITEM_JABOCA_BERRY', 
        'ITEM_ROWAP_BERRY',
        'ITEM_CUSTAP_BERRY',
        'ITEM_LEPPA_BERRY',
        'ITEM_LANSAT_BERRY',
        'ITEM_STARF_BERRY',
        'ITEM_THROAT_SPRAY',
        'ITEM_MIRROR_HERB',
        'ITEM_ADRENALINE_ORB',
        'ITEM_RED_CARD',
        'ITEM_EXPERT_BELT',
        'ITEM_TERRAIN_EXTENDER',
        'ITEM_SHED_SHELL',
        'ITEM_POWER_HERB',
        'ITEM_SAFETY_GOGGLES',  
        'ITEM_WHITE_HERB',
        'ITEM_WIDE_LENS',
        'ITEM_ZOOM_LENS',
        'ITEM_PUNCHING_GLOVE',  
        'ITEM_BIG_ROOT',
        'ITEM_ROOM_SERVICE',
        'ITEM_IRON_BALL',
        'ITEM_HEAVY_DUTY_BOOTS',
        'ITEM_ABSORB_BULB',
        'ITEM_CELL_BATTERY',
        'ITEM_LUMINOUS_MOSS',
        'ITEM_SNOWBALL',
        'ITEM_STICKY_BARB',
        'ITEM_BRIGHT_POWDER',
        'ITEM_QUICK_CLAW',
        'ITEM_MUSCLE_BAND',
        'ITEM_WISE_GLASSES',
        'ITEM_METRONOME',
        'ITEM_IRON_BALL',
        'ITEM_GRIP_CLAW',
        'ITEM_FLOAT_STONE',
        'ITEM_BINDING_BAND',
        'ITEM_PROTECTIVE_PADS',
        'ITEM_UTILITY_UMBRELLA',
        'ITEM_CLEAR_AMULET',
        'ITEM_COVERT_CLOAK',
        'ITEM_FOCUS_BAND',
        'ITEM_MENTAL_HERB',
        'ITEM_BLUNDER_POLICY',
    ],

    protectionBerries: {
        NORMAL: 'ITEM_CHILAN_BERRY', // Route 111
        FIRE: 'ITEM_OCCA_BERRY', // Route 117
        WATER: 'ITEM_PASSHO_BERRY', // Route 104
        ELECTRIC: 'ITEM_WACAN_BERRY', // Route 117
        GRASS: 'ITEM_RINDO_BERRY',
        ICE: 'ITEM_YACHE_BERRY', // Route 111
        FIGHTING: 'ITEM_CHOPLE_BERRY', // Route 104
        POISON: 'ITEM_KEBIA_BERRY',
        GROUND: 'ITEM_SHUCA_BERRY', // Route 117
        FLYING: 'ITEM_COBA_BERRY', // Route 111
        PSYCHIC: 'ITEM_PAYAPA_BERRY', // Route 121
        BUG: 'ITEM_TANGA_BERRY', // Route 121
        ROCK: 'ITEM_CHARTI_BERRY', // Route 104
        GHOST: 'ITEM_KASIB_BERRY',
        DRAGON: 'ITEM_HABAN_BERRY',
        DARK: 'ITEM_COLBUR_BERRY', // Route 121
        STEEL: 'ITEM_BABIRI_BERRY',
        FAIRY: 'ITEM_ROSELI_BERRY',
    },

}

module.exports = items;
