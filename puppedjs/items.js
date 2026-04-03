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
        ITEM_SPLASH_PLATE: 'WATER', // Petalburg Woods
        ITEM_ZAP_PLATE: 'ELECTRIC',
        ITEM_MEADOW_PLATE: 'GRASS', // Petalburg Woods
        ITEM_ICICLE_PLATE: 'ICE',
        ITEM_FIST_PLATE: 'FIGHTING',
        ITEM_TOXIC_PLATE: 'POISON',
        ITEM_EARTH_PLATE: 'GROUND', // Petalburg Woods
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
        'ITEM_FIRE_GEM', // Route 117
        'ITEM_WATER_GEM', // Route 104
        'ITEM_ELECTRIC_GEM',
        'ITEM_GRASS_GEM',
        'ITEM_ICE_GEM',
        'ITEM_FIGHTING_GEM', // Route 117
        'ITEM_POISON_GEM',
        'ITEM_GROUND_GEM', // Route 117
        'ITEM_FLYING_GEM', // Route 104
        'ITEM_PSYCHIC_GEM',
        'ITEM_BUG_GEM',
        'ITEM_ROCK_GEM',
        'ITEM_GHOST_GEM',
        'ITEM_DRAGON_GEM',
        'ITEM_DARK_GEM', // Route 104
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
        'ITEM_TM01', // Route 111
        'ITEM_TM02', // Route 110
        'ITEM_TM03', // Route 104
        'ITEM_TM04',
        'ITEM_TM05', // Changed TM from ROAR. Route 119 @TODO Check how can I run make_learnsets.py
        'ITEM_TM06', // Toxic, Protect, Rest
        'ITEM_TM07', // Route 109
        'ITEM_TM08', // Brawly
        'ITEM_TM09', // Route 104
        'ITEM_TM10', // @TODO Change TM
        'ITEM_TM11', // Route 109
        'ITEM_TM12', // Taunt, Snatch, Skill Swap, Torment
        'ITEM_TM13', // Route 118
        'ITEM_TM14', // Route 124
        'ITEM_TM15', // Route 115
        'ITEM_TM16', // Mauville
        'ITEM_TM17', // Toxic, Protect, Rest
        'ITEM_TM18', // Route 109
        'ITEM_TM19',
        'ITEM_TM20', // @TODO Change TM
        'ITEM_TM21',
        'ITEM_TM22', // Route 115
        'ITEM_TM23', // @TODO Change TM
        'ITEM_TM24', // Route 118
        'ITEM_TM25', // Route 124
        'ITEM_TM26', // Route 117
        'ITEM_TM27', // @TODO Change TM
        'ITEM_TM28', // Route 104
        'ITEM_TM29', // Route 106
        'ITEM_TM30', // Route 106
        'ITEM_TM31', // Route 106
        'ITEM_TM32', // @TODO Change TM
        'ITEM_TM33', // Mauville
        'ITEM_TM34', // Wattson
        'ITEM_TM35', // Route 118
        'ITEM_TM36', // Route 115
        'ITEM_TM37', // Route 109
        'ITEM_TM38', // Route 124
        'ITEM_TM39', // Roxanne
        'ITEM_TM40', // Winona
        'ITEM_TM41', // Taunt, Snatch, Skill Swap, Torment
        'ITEM_TM42', // Norman
        'ITEM_TM43', // @TODO Change TM
        'ITEM_TM44', // Toxic, Protect, Rest
        'ITEM_TM45', // @TODO Change TM
        'ITEM_TM46', // @TODO Change TM
        'ITEM_TM47', // Steven
        'ITEM_TM48', // Taunt, Snatch, Skill Swap, Torment
        'ITEM_TM49', // Taunt, Snatch, Skill Swap, Torment
        'ITEM_TM50', // Flannery
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
        ITEM_ABILITY_PATCH: { // 1 at Route 116, 1 at Route 113, 1 at route 120
            count: 4
        },
        // Normal ability
        ITEM_ABILITY_CAPSULE: { // 1 at Route 104, 1 at Route 110, 1 at Route 112, 1 at Route 113, 1 at Route 115, 1 at Route 117
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
        'ITEM_BLACK_SLUDGE',
        'ITEM_LEFTOVERS',
        'ITEM_LIFE_ORB',
        'ITEM_EVIOLITE',
        'ITEM_ASSAULT_VEST',
        'ITEM_FOCUS_SASH',
        'ITEM_WEAKNESS_POLICY',
        'ITEM_EJECT_BUTTON',
        'ITEM_CUSTAP_BERRY',
        'ITEM_LIGHT_CLAY',
    ],
    
    otherLockedItems: [
        'ITEM_TOXIC_ORB',
        'ITEM_FLAME_ORB',
        'ITEM_STICKY_BARB',
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

    // All items found placed in game files (scripts.inc + map.json),
    // excluding: TMs/HMs, balls, mail, potions/healing, story/key items,
    // fixed items (Choice Band etc.), and non-randomized consumables.
    fullItemPool: [
        // --- Gems (scripts: Route104, Route117, Route119) ---
        // Route104
        // Route117
        // Route119

        // --- Plates (scripts: PetalburgWoods) ---
        // PetalburgWoods

        // --- Protection berries (scripts) ---
        // Route104
        // Route111
        // Route117
        // Route121

        // --- Battle berries (scripts) ---
        'ITEM_KEE_BERRY',       // Route118
        'ITEM_MARANGA_BERRY',   // Route118
        'ITEM_JABOCA_BERRY',    // Route118
        'ITEM_ROWAP_BERRY',     // Route118
        'ITEM_LEPPA_BERRY',     // Route125
        'ITEM_LANSAT_BERRY',    // BattleFrontier_ScottsHouse
        'ITEM_STARF_BERRY',     // BattleFrontier_ScottsHouse
        'ITEM_THROAT_SPRAY',    // Route111
        'ITEM_EJECT_PACK',      // Route111
        'ITEM_MIRROR_HERB',     // Route120
        'ITEM_ADRENALINE_ORB',  // Route120
        'ITEM_RED_CARD',        // Route120
        'ITEM_EXPERT_BELT',     // Route102
        'ITEM_LOADED_DICE',     // Route109
        'ITEM_AIR_BALLOON',     // Route110
        'ITEM_LUM_BERRY',       // Route110
        'ITEM_TERRAIN_EXTENDER',// Route110
        'ITEM_SITRUS_BERRY',    // Route111
        'ITEM_SHED_SHELL',      // Route111
        'ITEM_POWER_HERB',      // Route111
        'ITEM_SAFETY_GOGGLES',  // Route111
        'ITEM_WHITE_HERB',      // Route112
        'ITEM_WIDE_LENS',       // Route114
        'ITEM_SHELL_BELL',      // Route114
        'ITEM_ZOOM_LENS',       // Route114
        'ITEM_RINDO_BERRY',     // Route115
        'ITEM_ROCKY_HELMET',    // Route116
        'ITEM_PUNCHING_GLOVE',  // Route116 + Route115
        'ITEM_BIG_ROOT',        // Route116
        'ITEM_ROOM_SERVICE',    // Route124
        'ITEM_IRON_BALL',       // Route124
        'ITEM_HEAVY_DUTY_BOOTS',// Route125
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
