const items = {
    megaStones: {
        ITEM_HARBOR_MAIL: 'SPECIES_SPINDA', // Route 113
    },

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
        ITEM_MEADOW_PLATE: 'GRASS', // Petalburg Woods
        ITEM_ICICLE_PLATE: 'ICE',
        ITEM_FIST_PLATE: 'FIGHTING',
        ITEM_TOXIC_PLATE: 'POISON',
        ITEM_EARTH_PLATE: 'GROUND', // Route 116
        ITEM_SKY_PLATE: 'FLYING',
        ITEM_MIND_PLATE: 'PSYCHIC', // Route 116
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
        'ITEM_WATER_GEM', // Route 103
        'ITEM_ELECTRIC_GEM',
        'ITEM_GRASS_GEM',
        'ITEM_ICE_GEM',
        'ITEM_FIGHTING_GEM', // Route 111
        'ITEM_POISON_GEM',
        'ITEM_GROUND_GEM', // Route 117
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

    specifics: {
        P_FAMILY_PIKACHU: ['ITEM_LIGHT_BALL'],
        P_FAMILY_FARFETCHD: ['ITEM_LEEK'],
        P_FAMILY_CUBONE: ['ITEM_THICK_CLUB'],
        P_FAMILY_CHANSEY: ['ITEM_LUCKY_PUNCH'],
        P_FAMILY_DITTO: ['ITEM_QUICK_POWDER'],
        P_FAMILY_CLAMPERL: ['ITEM_DEEP_SEA_TOOTH', 'ITEM_DEEP_SEA_SCALE'],
        P_FAMILY_ROTOM: ['ITEM_ROTOM_CATALOG'],
        P_FAMILY_SHAYMIN: ['ITEM_GRACIDEA', 'ITEM_REVEAL_GLASS'],
        // Will I use these?
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

    tms: [
        'ITEM_TM_FOCUS_PUNCH', // Route 111
        'ITEM_TM_DRAGON_CLAW', // Route 110
        'ITEM_TM_WATER_PULSE', // Route 104
        'ITEM_TM_CALM_MIND',
        'ITEM_TM_ROAR', // @TODO Change TM
        'ITEM_TM_TOXIC', // Route 114
        'ITEM_TM_HAIL', // Route 109
        'ITEM_TM_BULK_UP', // Brawly
        'ITEM_TM_BULLET_SEED', // Route 104
        'ITEM_TM_HIDDEN_POWER', // @TODO Change TM
        'ITEM_TM_SUNNY_DAY', // Route 109
        'ITEM_TM_TAUNT', // Route 103
        'ITEM_TM_ICE_BEAM',
        'ITEM_TM_BLIZZARD',
        'ITEM_TM_HYPER_BEAM', // Route 114
        'ITEM_TM_LIGHT_SCREEN', // Route 114
        'ITEM_TM_PROTECT', // Route 114
        'ITEM_TM_RAIN_DANCE', // Route 109
        'ITEM_TM_GIGA_DRAIN',
        'ITEM_TM_SAFEGUARD', // @TODO Change TM
        'ITEM_TM_FRUSTRATION',
        'ITEM_TM_SOLAR_BEAM', // Route 115
        'ITEM_TM_IRON_TAIL', // @TODO Change TM
        'ITEM_TM_THUNDERBOLT',
        'ITEM_TM_THUNDER',
        'ITEM_TM_EARTHQUAKE', // Route 117
        'ITEM_TM_RETURN', // @TODO Change TM
        'ITEM_TM_DIG', // Route 104
        'ITEM_TM_PSYCHIC', // Route 114
        'ITEM_TM_SHADOW_BALL', // Route 114
        'ITEM_TM_BRICK_BREAK', // Route 116
        'ITEM_TM_DOUBLE_TEAM', // @TODO Change TM
        'ITEM_TM_REFLECT', // Route 114
        'ITEM_TM_SHOCK_WAVE', // Wattson
        'ITEM_TM_FLAMETHROWER',
        'ITEM_TM_SLUDGE_BOMB', // Route 114
        'ITEM_TM_SANDSTORM', // Route 109
        'ITEM_TM_FIRE_BLAST',
        'ITEM_TM_ROCK_TOMB', // Roxanne
        'ITEM_TM_AERIAL_ACE', // Winona
        'ITEM_TM_TORMENT', // Route 114
        'ITEM_TM_FACADE', // Norman
        'ITEM_TM_SECRET_POWER', // @TODO Change TM
        'ITEM_TM_REST', // Route 114
        'ITEM_TM_ATTRACT', // @TODO Change TM
        'ITEM_TM_THIEF', // @TODO Change TM
        'ITEM_TM_STEEL_WING', // Steven
        'ITEM_TM_SKILL_SWAP', // Route 114
        'ITEM_TM_SNATCH', // Route 114
        'ITEM_TM_OVERHEAT', // Flannery
    ],
    
    // Can I use these?
    tmsExtended: [
        'ITEM_TM51',
        'ITEM_TM52',
        'ITEM_TM53',
        'ITEM_TM54',
        'ITEM_TM55',
        'ITEM_TM56',
        'ITEM_TM57',
        'ITEM_TM58',
        'ITEM_TM59',
        'ITEM_TM60',
        'ITEM_TM61',
        'ITEM_TM62',
        'ITEM_TM63',
        'ITEM_TM64',
        'ITEM_TM65',
        'ITEM_TM66',
        'ITEM_TM67',
        'ITEM_TM68',
        'ITEM_TM69',
        'ITEM_TM70',
        'ITEM_TM71',
        'ITEM_TM72',
        'ITEM_TM73',
        'ITEM_TM74',
        'ITEM_TM75',
        'ITEM_TM76',
        'ITEM_TM77',
        'ITEM_TM78',
        'ITEM_TM79',
        'ITEM_TM80',
        'ITEM_TM81',
        'ITEM_TM82',
        'ITEM_TM83',
        'ITEM_TM84',
        'ITEM_TM85',
        'ITEM_TM86',
        'ITEM_TM87',
        'ITEM_TM88',
        'ITEM_TM89',
        'ITEM_TM90',
        'ITEM_TM91',
        'ITEM_TM92',
        'ITEM_TM93',
        'ITEM_TM94',
        'ITEM_TM95',
        'ITEM_TM96',
        'ITEM_TM97',
        'ITEM_TM98',
        'ITEM_TM99',
        'ITEM_TM100',
    ],

    // Probably wont use them
    specialFossils: [
        'ITEM_FOSSILIZED_BIRD',
        'ITEM_FOSSILIZED_FISH',
        'ITEM_FOSSILIZED_DRAKE',
        'ITEM_FOSSILIZED_DINO',
    ],

    // These are valuable consumables that will not be randomized
    consumables: {
        // Hidden ability
        ITEM_ABILITY_PATCH: { // 1 at Route 116, 1 at Route 113
            count: 4
        },
        // Normal ability
        ITEM_ABILITY_CAPSULE: { // 1 at Route 104, 1 at Route 110, 1 at Route 112, 1 at Route 113, 1 at Route 115
            count: 8
        },
        ITEM_HEART_SCALE: { // From the start of the game I guess?
            count: 15
        },
    },

    // Probably not randomized
    drives: ['ITEM_DOUSE_DRIVE', 'ITEM_SHOCK_DRIVE', 'ITEM_BURN_DRIVE', 'ITEM_CHILL_DRIVE'],

    // Probably not randomized
    premiumItems: [
        'ITEM_CHOICE_BAND',
        'ITEM_CHOICE_SPECS',
        'ITEM_CHOICE_SCARF',
        'ITEM_LEFTOVERS', // New Mauville
        'ITEM_LIFE_ORB', // Route 106
        'ITEM_EVIOLITE', // Route 104
        'ITEM_ASSAULT_VEST', // Route 103
    ],

    goodItems: [
        'ITEM_SHELL_BELL', // Route 111
        'ITEM_ROCKY_HELMET', // Route 109
        'ITEM_SAFETY_GOGGLES', // Route 111
        'ITEM_HEAVY_DUTY_BOOTS', // Route 115
    ],

    goodSituationalItems: [
        'ITEM_FLAME_ORB', // Route 115
        'ITEM_TOXIC_ORB', // Route 112
        'ITEM_DAMP_ROCK', // Route 109
        'ITEM_HEAT_ROCK', // Route 109
        'ITEM_SMOOTH_ROCK', // Route 109
        'ITEM_ICY_ROCK', // Route 109
        'ITEM_WIDE_LENS', // Route 114
        'ITEM_EXPERT_BELT', // Route 102
        'ITEM_LIGHT_CLAY', // Route 117
        'ITEM_ZOOM_LENS', // Route 114
        'ITEM_BLACK_SLUDGE', // Route 116
        'ITEM_SHED_SHELL', // Route 110
        'ITEM_BIG_ROOT', // Route 111
        'ITEM_TERRAIN_EXTENDER', // Route 110
        'ITEM_PUNCHING_GLOVE', // Route 115
        'ITEM_LOADED_DICE', // Route 109
    ],

    goodConsumables: [
        'ITEM_WHITE_HERB', // Route 112
        'ITEM_POWER_HERB', // Route 111
        'ITEM_FOCUS_SASH', // Route 113
        'ITEM_AIR_BALLOON', // Route 111
        'ITEM_RED_CARD', // Route 109
        'ITEM_EJECT_BUTTON',
        'ITEM_WEAKNESS_POLICY',
        'ITEM_ADRENALINE_ORB', // Desert
        'ITEM_ELECTRIC_SEED', // Route 110
        'ITEM_PSYCHIC_SEED',
        'ITEM_MISTY_SEED', // Route 118
        'ITEM_GRASSY_SEED',
        'ITEM_THROAT_SPRAY', // Route 103
        'ITEM_EJECT_PACK', // Route 103
        'ITEM_ROOM_SERVICE',
        'ITEM_LEPPA_BERRY',
        'ITEM_LUM_BERRY', // Route 110
        'ITEM_SITRUS_BERRY', // Route 111
        'ITEM_CUSTAP_BERRY',
        'ITEM_JABOCA_BERRY', // Route 103
        'ITEM_ROWAP_BERRY',
        'ITEM_KEE_BERRY',
        'ITEM_MARANGA_BERRY',
        'ITEM_BOOSTER_ENERGY', // Route 117
        'ITEM_MASTER_BALL',
    ],

    midConsumables: [
        'ITEM_LIECHI_BERRY',
        'ITEM_GANLON_BERRY',
        'ITEM_SALAC_BERRY',
        'ITEM_PETAYA_BERRY',
        'ITEM_APICOT_BERRY',
        'ITEM_LANSAT_BERRY',
        'ITEM_STARF_BERRY',
        'ITEM_ENIGMA_BERRY',
        'ITEM_MICLE_BERRY',
        'ITEM_MIRROR_HERB',
    ],

    protectionBerries: {
        NORMAL: 'ITEM_CHILAN_BERRY', // Route 111
        FIRE: 'ITEM_OCCA_BERRY', // Route 112
        WATER: 'ITEM_PASSHO_BERRY',
        ELECTRIC: 'ITEM_WACAN_BERRY', // Route 117
        GRASS: 'ITEM_RINDO_BERRY',
        ICE: 'ITEM_YACHE_BERRY',
        FIGHTING: 'ITEM_CHOPLE_BERRY',
        POISON: 'ITEM_KEBIA_BERRY',
        GROUND: 'ITEM_SHUCA_BERRY',
        FLYING: 'ITEM_COBA_BERRY',
        PSYCHIC: 'ITEM_PAYAPA_BERRY',
        BUG: 'ITEM_TANGA_BERRY',
        ROCK: 'ITEM_CHARTI_BERRY', // Route 104
        GHOST: 'ITEM_KASIB_BERRY',
        DRAGON: 'ITEM_HABAN_BERRY',
        DARK: 'ITEM_COLBUR_BERRY',
        STEEL: 'ITEM_BABIRI_BERRY',
        FAIRY: 'ITEM_ROSELI_BERRY',
    },

    midItems: [
        'ITEM_ABSORB_BULB',
        'ITEM_CELL_BATTERY',
        'ITEM_LUMINOUS_MOSS',
        'ITEM_SNOWBALL',
        'ITEM_BRIGHT_POWDER',
        'ITEM_QUICK_CLAW',
        'ITEM_MUSCLE_BAND',
        'ITEM_WISE_GLASSES',
        'ITEM_METRONOME',
        'ITEM_IRON_BALL',
        'ITEM_GRIP_CLAW',
        'ITEM_STICKY_BARB',
        'ITEM_FLOAT_STONE',
        'ITEM_BINDING_BAND',
        'ITEM_PROTECTIVE_PADS',
        'ITEM_UTILITY_UMBRELLA',
        'ITEM_CLEAR_AMULET',
        'ITEM_COVERT_CLOAK',
    ],

    weakConsumables: [
        'ITEM_FOCUS_BAND',
        'ITEM_MENTAL_HERB',
        'ITEM_BLUNDER_POLICY',
        'ITEM_CHERI_BERRY',
        'ITEM_CHESTO_BERRY',
        'ITEM_PECHA_BERRY',
        'ITEM_RAWST_BERRY',
        'ITEM_ASPEAR_BERRY',
        'ITEM_ORAN_BERRY',
        'ITEM_PERSIM_BERRY',
    ],

}

module.exports = items;
