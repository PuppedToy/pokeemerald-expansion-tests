const path = require("path");

const constants = {
    TOTAL_GENS: 9,
    GENERIC_DEVIATION: 0.1,

    // T-057: from this trainer level up, a mon's nature is chosen strategically (chooseNature,
    // from its moveset/stats) instead of at random. 12 = Roxanne, the first gym leader.
    NATURE_STRATEGY_MIN_LEVEL: 12,
    // T-057: from this trainer level up, a mon's ability is chosen strategically (best-rated, hidden
    // slot allowed) instead of randomly among its first two slots. 12 = Roxanne. Separate knob from
    // nature (independently tunable) but same default level.
    ABILITY_STRATEGY_MIN_LEVEL: 12,

    SPECIES_DIR: path.resolve(__dirname, '..', 'src', 'data', 'pokemon', 'species_info'),
    LEVEL_UP_LEARNSETS_DIR: path.resolve(__dirname, '..', 'src', 'data', 'pokemon', 'level_up_learnsets'),
    ABILITIES_FILE_PATH: path.resolve(__dirname, '..', 'src', 'data', 'abilities.h'),
    ITEMS_FILE_PATH: path.resolve(__dirname, '..', 'src', 'data', 'items.h'),
    MEGA_EVOS_PATH: path.resolve(__dirname, '..', 'src', 'data', 'pokemon', 'form_change_tables.h'),

    TIER_MAGIKARP: 'MAGIKARP',
    TIER_ZU: 'ZU',
    TIER_PU: 'PU',
    TIER_NU: 'NU',
    TIER_RU: 'RU',
    TIER_UU: 'UU',
    TIER_OU: 'OU',
    TIER_UBERS: 'UBERS',
    TIER_LEGEND: 'LEGEND',
    TIER_AG: 'AG',

    TIER_AG_THRESHOLD: 9.75,
    TIER_LEGEND_THRESHOLD: 9.5,
    TIER_UBERS_THRESHOLD: 9,
    MID_TIER_OU_THRESHOLD: 8.5,
    TIER_OU_THRESHOLD: 8,
    MID_TIER_UU_THRESHOLD: 7.5,
    TIER_UU_THRESHOLD: 7,
    MID_TIER_RU_THRESHOLD: 6.5,
    TIER_RU_THRESHOLD: 6,
    TIER_NU_THRESHOLD: 5,
    TIER_PU_THRESHOLD: 4,
    TIER_ZU_THRESHOLD: 3.0,
    // TIER_MAGIKARP is anything below TIER_ZU_THRESHOLD

    // Wishiwashi Schooling special case — Solo form schools into School form at lvl 20+
    // and reverts to Solo if HP drops to <=25%. The rater treats Solo as the School form
    // (with a 25% HP nerf for the unusable revert zone) once it can school.
    WISHIWASHI_SOLO_ID:          'SPECIES_WISHIWASHI_SOLO',
    WISHIWASHI_SCHOOL_ID:        'SPECIES_WISHIWASHI_SCHOOL',
    WISHIWASHI_SCHOOL_LEVEL:     20,   // "level 20 or above"
    WISHIWASHI_SCHOOL_HP_FACTOR: 0.75, // bottom 25% of HP is dead weight (revert zone)

    // Palafin Zero-to-Hero special case — the placed Zero form transforms into the battle-only
    // Hero form the first time it switches out. The switch is essentially free, so the rater
    // treats Zero as Hero (full Hero stats + typing, no nerf, at every level). Hero stays banned
    // from picking; Zero (and Finizen) are placeable.
    PALAFIN_ZERO_ID:             'SPECIES_PALAFIN_ZERO',
    PALAFIN_HERO_ID:             'SPECIES_PALAFIN_HERO',

    // Meloetta special case (T-064) — Meloetta can switch Aria<->Pirouette in battle via Relic Song.
    // Only base Aria is ever placed (Pirouette is battle-only, banned from picking). Aria's tier is
    // a weighted blend of both forms' ratings, reflecting its in-battle access to Pirouette.
    MELOETTA_ARIA_ID:            'SPECIES_MELOETTA_ARIA',
    MELOETTA_PIROUETTE_ID:       'SPECIES_MELOETTA_PIROUETTE',
    MELOETTA_ARIA_WEIGHT:        0.55,
    MELOETTA_PIROUETTE_WEIGHT:   0.45,
    MELOETTA_RELIC_SONG_ID:      'MOVE_RELIC_SONG',
    MELOETTA_FAMILY:             'P_FAMILY_MELOETTA',

    // Minior special case (T-155) — only the Meteor form is placed. Shields Down keeps it in the bulky,
    // status-immune Meteor shell (Def/SpD 100, no offense) while HP ≥ 50%, then flips it to the Core
    // glass-cannon (Atk/SpA 100, Speed 120) below 50%. The Core (Red) form is parsed but banned from
    // picking; the placed Meteor's rating (absolute + per-level contextual) is a weighted blend of both
    // forms, crediting the defensive/status-immune setup turn AND the offensive payoff (owner choice,
    // Meloetta-style). Only the Red color pair is kept (see REMOVED_SPECIES in parser.js).
    MINIOR_METEOR_ID:            'SPECIES_MINIOR_METEOR_RED',
    MINIOR_CORE_ID:              'SPECIES_MINIOR_CORE_RED',
    MINIOR_METEOR_WEIGHT:        0.45,
    MINIOR_CORE_WEIGHT:          0.55,

    AG_BST_THRESHOLD: 720,
    LEGEND_BST_THRESHOLD: 660,
    OU_BST_THRESHOLD: 600,
    UU_BST_THRESHOLD: 540,
    RU_BST_THRESHOLD: 480,
    NU_BST_THRESHOLD: 400,

    // Megas need higher BST floors so they don't all clump at AG/UBERS.
    // Only truly broken megas (Rayquaza, Mewtwo X/Y) should reach AG.
    MEGA_AG_BST_THRESHOLD: 770,
    MEGA_UBERS_BST_THRESHOLD: 720,
    // Megas require a higher absolute rating to reach AG (10.0 vs 9.75 for non-megas).
    // Megas have inflated raw stats that the model rewards generously; the higher threshold
    // prevents strong-but-not-broken megas (Sceptile, Lucario) from reaching AG.
    MEGA_AG_RATING_THRESHOLD: 10.0,

    EVO_TYPE_LC_OF_3: 'EVO_TYPE_LC_OF_3',
    EVO_TYPE_LC_OF_2: 'EVO_TYPE_LC_OF_2',
    EVO_TYPE_NFE_OF_3: 'EVO_TYPE_NFE_OF_3',
    EVO_TYPE_LAST_OF_3: 'EVO_TYPE_LAST_OF_3',
    EVO_TYPE_LAST_OF_2: 'EVO_TYPE_LAST_OF_2',
    EVO_TYPE_LC: 'EVO_TYPE_LC',
    EVO_TYPE_NFE: 'EVO_TYPE_NFE',
    EVO_TYPE_SOLO: 'EVO_TYPE_SOLO',
    EVO_TYPE_MEGA: 'EVO_TYPE_MEGA',
    EVO_TYPE_FINAL: 'EVO_TYPE_FINAL',

    ENCOUNTER_TYPE_LAND: 'ENCOUNTER_TYPE_LAND',
    ENCOUNTER_TYPE_FISH_OLD: 'ENCOUNTER_TYPE_FISH_OLD',
    ENCOUNTER_TYPE_FISH_GOOD: 'ENCOUNTER_TYPE_FISH_GOOD',
    ENCOUNTER_TYPE_WATER: 'ENCOUNTER_TYPE_WATER',
    ENCOUNTER_TYPE_FISH_SUPER: 'ENCOUNTER_TYPE_FISH_SUPER',
    ENCOUNTER_TYPE_SPECIAL: 'ENCOUNTER_TYPE_SPECIAL',

    TRAINER_POKE_STARTER_TREECKO: 'TRAINER_POKE_STARTER_TREECKO',
    TRAINER_POKE_STARTER_TORCHIC: 'TRAINER_POKE_STARTER_TORCHIC',
    TRAINER_POKE_STARTER_MUDKIP: 'TRAINER_POKE_STARTER_MUDKIP',
    TRAINER_POKE_ENCOUNTER: 'TRAINER_POKE_ENCOUNTER',
    TRAINER_REPEAT_ID: 'TRAINER_REPEAT_ID',
    TRAINER_POKE_MEGA_FROM_STONE: 'TRAINER_POKE_MEGA_FROM_STONE',

    TRAINER_RESTRICTION_NO_REPEATED_TYPE: 'TRAINER_RESTRICTION_NO_REPEATED_TYPE',
    TRAINER_RESTRICTION_ALLOW_ONLY_TYPES: 'TRAINER_RESTRICTION_ALLOW_ONLY_TYPES',
    TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES: 'TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES',
    TRAINER_RESTRICTION_MUST_LEARN_TM_MOVES: 'TRAINER_RESTRICTION_MUST_LEARN_TM_MOVES',
    TRAINER_E4_KEEP_TYPE_AMOUNT: 2,
    TRAINER_GYM_LEADERS_KEEP_TYPE_AMOUNT: 6,
    // T-076 — probability the champion's (Steven's) type is randomized. Unlike gyms/E4 (count knobs)
    // the champion is a single boss, so it flips "changed" with this Bernoulli probability.
    TRAINER_CHAMPION_TYPE_CHANGE_CHANCE: 0.05,

    POKEMON_TYPE_WATER: 'WATER',
    POKEMON_TYPE_ICE: 'ICE',
    POKEMON_TYPE_BUG: 'BUG',
    POKEMON_TYPE_FAIRY: 'FAIRY',
    POKEMON_TYPE_GRASS: 'GRASS',
    POKEMON_TYPE_FIGHTING: 'FIGHTING',
    POKEMON_TYPE_PSYCHIC: 'PSYCHIC',
    POKEMON_TYPE_DARK: 'DARK',
    POKEMON_TYPE_FIRE: 'FIRE',
    POKEMON_TYPE_GROUND: 'GROUND',
    POKEMON_TYPE_ROCK: 'ROCK',
    POKEMON_TYPE_FLYING: 'FLYING',
    POKEMON_TYPE_NORMAL: 'NORMAL',
    POKEMON_TYPE_GHOST: 'GHOST',
    POKEMON_TYPE_POISON: 'POISON',
    POKEMON_TYPE_STEEL: 'STEEL',
    POKEMON_TYPE_DRAGON: 'DRAGON',
    POKEMON_TYPE_ELECTRIC: 'ELECTRIC',

    NATURES: {
        ADAMANT: {
            name: 'Adamant',
            up: 'baseAttack',
            down: 'baseSpecialAttack',
        },
        JOLLY: {
            name: 'Jolly',
            up: 'baseSpeed',
            down: 'baseSpecialAttack',
        },
        MODEST: {
            name: 'Modest',
            up: 'baseSpecialAttack',
            down: 'baseAttack',
        },
        TIMID: {
            name: 'Timid',
            up: 'baseSpeed',
            down: 'baseAttack',
        },
        BOLD: {
            name: 'Bold',
            up: 'baseDefense',
            down: 'baseAttack',
        },
        IMPISH: {
            name: 'Impish',
            up: 'baseDefense',
            down: 'baseSpecialAttack',
        },
        CALM: {
            name: 'Calm',
            up: 'baseSpecialDefense',
            down: 'baseAttack',
        },
        CAREFUL: {
            name: 'Careful',
            up: 'baseSpecialDefense',
            down: 'baseSpecialAttack',
        },
        RELAXED: {
            name: 'Relaxed',
            up: 'baseDefense',
            down: 'baseSpeed',
        },
        SASSY: {
            name: 'Sassy',
            up: 'baseSpecialDefense',
            down: 'baseSpeed',
        },
        LONELY: {
            name: 'Lonely',
            up: 'baseAttack',
            down: 'baseDefense',
        },
        NAUGHTY: {
            name: 'Naughty',
            up: 'baseAttack',
            down: 'baseSpecialDefense',
        },
        BRAVE: {
            name: 'Brave',
            up: 'baseAttack',
            down: 'baseSpeed',
        },
        LAX: {
            name: 'Lax',
            up: 'baseDefense',
            down: 'baseSpecialDefense',
        },
        MILD: {
            name: 'Mild',
            up: 'baseSpecialAttack',
            down: 'baseDefense',
        },
        RASH: {
            name: 'Rash',
            up: 'baseSpecialAttack',
            down: 'baseSpecialDefense',
        },
        QUIET: {
            name: 'Quiet',
            up: 'baseSpecialAttack',
            down: 'baseSpeed',
        },
        GENTLE: {
            name: 'Gentle',
            up: 'baseSpecialDefense',
            down: 'baseDefense',
        },
        HASTY: {
            name: 'Hasty',
            up: 'baseSpeed',
            down: 'baseDefense',
        },
        NAIVE: {
            name: 'Naive',
            up: 'baseSpeed',
            down: 'baseSpecialDefense',
        },
        QUIRKY: {
            name: 'Quirky',
            up: null,
            down: null,
        },
    },

    OUTPUT_DIR: 'output',
    TEMPLATE_FILE: 'template.html',

    TEMPLATE_POKEMON_REPLACEMENT: '<script src="pokes.js"></script>',
    TEMPLATE_MOVES_REPLACEMENT: '<script src="moves.js"></script>',
    TEMPLATE_ABILITIES_REPLACEMENT: '<script src="abilities.js"></script>',
    TEMPLATE_ITEMS_REPLACEMENT: '<script src="items.js"></script>',
    TEMPLATE_TRAINERS_REPLACEMENT: '<script src="trainers.js"></script>',
    TEMPLATE_WILDPOKES_REPALCEMENT: '<script src="wildpokes.js"></script>',
    TEMPLATE_COLORS_REPLACEMENT: '<script src="colors.js"></script>',

    LOG_TYPE_BUFF: 'BUFF',
    LOG_TYPE_NERF: 'NERF',
    LOG_TYPE_ADJUSTMENT: 'ADJUSTMENT',

    POKE_FORM_ALOLA: 'ALOLA',
    POKE_FORM_GALAR: 'GALAR',
    POKE_FORM_HISUI: 'HISUI',
    POKE_FORM_PALDEA: 'PALDEA',
    POKE_FORM_EAST: 'EAST',
    POKE_FORM_SUMMER: 'SUMMER',
    POKE_FORM_AUTUMN: 'AUTUMN',
    POKE_FORM_WINTER: 'WINTER',
    POKE_FORM_SMALL: 'SMALL',
    POKE_FORM_LARGE: 'LARGE',
    POKE_FORM_SUPER: 'SUPER',
    POKE_FORM_OWN_TEMPO: 'OWN_TEMPO',
    POKE_FORM_ANTIQUE: 'ANTIQUE',
    POKE_FORM_ROAMING: 'ROAMING',
    POKE_FORM_ARTISAN: 'ARTISAN',
    // T-157 — Burmy cloaks (Plant is the base family) and Ogerpon masks (Teal is the base family).
    // Each becomes its own family that randomizes independently (Deerling model); they collapse back
    // to the base for wild/trainer dedup via COSMETIC_FORM_SUFFIXES in modules/utils.js.
    POKE_FORM_SANDY: 'SANDY',
    POKE_FORM_TRASH: 'TRASH',
    POKE_FORM_WELLSPRING: 'WELLSPRING',
    POKE_FORM_HEARTHFLAME: 'HEARTHFLAME',
    POKE_FORM_CORNERSTONE: 'CORNERSTONE',

    // Dynamic evo level algorithm constants
    // Base level ranges per evo-target tier (the pokemon being evolved INTO)
    EVO_LEVEL_BASE_RANGES: {
        MAGIKARP: [7, 9],
        ZU:       [10, 11],
        PU:       [12, 13],
        NU:       [14, 19],
        RU:       [20, 28],
        UU:       [29, 35],
        OU:       [39, 48],
        UBERS:    [49, 56],
        LEGEND:   [57, 62],
        AG:       [63, 75],
    },

    // Pre-evo modifier ranges per pre-evo tier (the pokemon that HOLDS the evo entry)
    // Expressed as decimal fractions (e.g. -0.25 = 25% earlier)
    EVO_LEVEL_PRE_EVO_MODIFIERS: {
        MAGIKARP: [-0.20, -0.16],
        ZU:       [-0.15, -0.11],
        PU:       [-0.10, -0.06],
        NU:       [-0.05,  0.00],
        RU:       [ 0.01,  0.05],
        UU:       [ 0.06,  0.10],
        OU:       [ 0.11,  0.20],
        UBERS:    [ 0.21,  0.40],
        AG:       [ 0.41,  0.60],
    },

    // Stage adjustments per evolution type
    // LC_OF_2 = 2-stage line (single evo) → no adjustment
    // LC_OF_3 = first of 3-stage line → evolves 10% earlier
    // NFE_OF_3 = middle of 3-stage line → evolves 10% later
    EVO_LEVEL_STAGE_ADJUSTMENTS: {
        EVO_TYPE_LC_OF_2:  0.00,
        EVO_TYPE_LC_OF_3: -0.10,
        EVO_TYPE_NFE_OF_3: 0.10,
    },

    // Random deviation: ±5%
    EVO_LEVEL_DEVIATION: 0.05,

    // Hard clamps
    EVO_LEVEL_MIN: 5,
    EVO_LEVEL_MAX: 65,

    // T-066 — EXTRA stage0→1 delay for 3-stage lines whose FINAL (stage-2) mon is strong, so lines
    // into powerhouses (e.g. Bagon→Shelgon→Salamence) evolve later, like the official games. Keyed
    // by the final stage-2 tier; expressed as decimal fractions added into the same multiplicative
    // bracket as the other modifiers. Tiers below OU are intentionally absent (no delay).
    EVO_LEVEL_FINAL_STAGE_DELAYS: {
        OU:     [0.01, 0.10],
        UBERS:  [0.11, 0.20],
        LEGEND: [0.21, 0.30],
        AG:     [0.31, 0.50],
    },

    MEGA_TRAINERS: [
        {
            id: '01',
            map: 'Route111',
            trainer: 'TRAINER_TYRON',
            script: 'Route111_EventScript_Tyron',
        },
        {
            id: '02',
            map: 'JaggedPass',
            trainer: 'TRAINER_AUTUMN',
            script: 'JaggedPass_EventScript_Autumn',
        },
        {
            id: '03',
            map: 'Route111',
            trainer: 'TRAINER_CELINA',
            script: 'Route111_EventScript_Celina',
        },
        {
            id: '04',
            map: 'Route118',
            trainer: 'TRAINER_CHRIS',
            script: 'Route118_EventScript_Chris',
        },
        {
            id: '05',
            map: 'Route120',
            trainer: 'TRAINER_ROBERT_1',
            script: 'Route120_EventScript_Robert',
        },
        {
            id: '06',
            map: 'Route121',
            trainer: 'TRAINER_BIANCA',
            script: 'Route121_EventScript_Bianca',
        },
        {
            id: '07',
            map: 'MtPyre_1F',
            trainer: 'TRAINER_LEAH',
            script: 'MtPyre_2F_EventScript_Leah',
        },
        {
            id: '08',
            map: 'Route124',
            trainer: 'TRAINER_LILA_AND_ROY_1',
            script: 'Route124_EventScript_Lila',
        },
        {
            id: '09',
            map: 'Route125',
            trainer: 'TRAINER_TANYA',
            script: 'Route125_EventScript_Tanya',
        },
        {
            id: '10',
            map: 'Route127',
            trainer: 'TRAINER_KOJI_1',
            script: 'Route127_EventScript_Koji',
        },
        {
            id: '11',
            map: 'Route129',
            trainer: 'TRAINER_ALLISON',
            script: 'Route129_EventScript_Allison',
        },
        {
            id: '12',
            map: 'Route123',
            trainer: 'TRAINER_WENDY',
            script: 'Route123_EventScript_Wendy',
        },
        {
            id: '13',
            map: 'Route123',
            trainer: 'TRAINER_ALBERTO',
            script: 'Route123_EventScript_Alberto',
        },
        {
            id: '14',
            map: 'Route123',
            trainer: 'TRAINER_CAMERON_1',
            script: 'Route123_EventScript_Cameron',
        },
        {
            id: '15',
            map: 'Route123',
            trainer: 'TRAINER_KAYLEY',
            script: 'Route123_EventScript_Kayley',
        },
        {
            id: '16',
            map: 'Route123',
            trainer: 'TRAINER_BRAXTON',
            script: 'Route123_EventScript_Braxton',
        },
        {
            id: '17',
            map: 'Route123',
            trainer: 'TRAINER_VIOLET',
            script: 'Route123_EventScript_Violet',
        },
        {
            id: '18',
            map: 'Route123',
            trainer: 'TRAINER_JACKI_1',
            script: 'Route123_EventScript_Jacki',
        },
        {
            id: '19',
            map: 'Route123',
            trainer: 'TRAINER_FREDRICK',
            script: 'Route123_EventScript_Frederick',
        },
        {
            id: '20',
            map: 'Route123',
            trainer: 'TRAINER_DAVIS',
            script: 'Route123_EventScript_Davis',
        },
        {
            id: '21',
            map: 'Route123',
            trainer: 'TRAINER_JONAS',
            script: 'Route123_EventScript_Jonas',
        },
    ],
};

constants.POKEMON_TYPES = [
    constants.POKEMON_TYPE_WATER,
    constants.POKEMON_TYPE_ICE,
    constants.POKEMON_TYPE_BUG,
    constants.POKEMON_TYPE_FAIRY,
    constants.POKEMON_TYPE_GRASS,
    constants.POKEMON_TYPE_FIGHTING,
    constants.POKEMON_TYPE_PSYCHIC,
    constants.POKEMON_TYPE_DARK,
    constants.POKEMON_TYPE_FIRE,
    constants.POKEMON_TYPE_GROUND,
    constants.POKEMON_TYPE_ROCK,
    constants.POKEMON_TYPE_FLYING,
    constants.POKEMON_TYPE_NORMAL,
    constants.POKEMON_TYPE_GHOST,
    constants.POKEMON_TYPE_POISON,
    constants.POKEMON_TYPE_STEEL,
    constants.POKEMON_TYPE_DRAGON,
    constants.POKEMON_TYPE_ELECTRIC,
];

// Config-driven family-type MACROS used inside species_info/*.h (NOT TYPE_ constants). They expand to
// `(P_UPDATED_TYPES >= GEN_6 ? TYPE_FAIRY : TYPE_<old>)`; the expansion ships P_UPDATED_TYPES =
// GEN_LATEST, so both resolve to FAIRY. The parser resolves them so the rater/rebalancer/writer only
// ever deal with real types — otherwise the writer emitted an undefined `TYPE_<macro>` (B-010).
constants.FAMILY_TYPE_MACROS = {
    RALTS_FAMILY_TYPE2: constants.POKEMON_TYPE_FAIRY,
    TOGEPI_FAMILY_TYPE: constants.POKEMON_TYPE_FAIRY,
};

constants.POKE_FORMS = [
    constants.POKE_FORM_ALOLA,
    constants.POKE_FORM_GALAR,
    constants.POKE_FORM_HISUI,
    constants.POKE_FORM_PALDEA,
    constants.POKE_FORM_EAST,
    constants.POKE_FORM_SUMMER,
    constants.POKE_FORM_AUTUMN,
    constants.POKE_FORM_WINTER,
    constants.POKE_FORM_SMALL,
    constants.POKE_FORM_LARGE,
    constants.POKE_FORM_SUPER,
    constants.POKE_FORM_OWN_TEMPO,
    constants.POKE_FORM_ANTIQUE,
    constants.POKE_FORM_ROAMING,
    constants.POKE_FORM_ARTISAN,
    constants.POKE_FORM_SANDY,
    constants.POKE_FORM_TRASH,
    constants.POKE_FORM_WELLSPRING,
    constants.POKE_FORM_HEARTHFLAME,
    constants.POKE_FORM_CORNERSTONE,
];

// Tier order lowest → highest; index used for tier arithmetic in presets and fallback logic.
constants.TIER_SEQ = [
    constants.TIER_MAGIKARP,
    constants.TIER_ZU,
    constants.TIER_PU,
    constants.TIER_NU,
    constants.TIER_RU,
    constants.TIER_UU,
    constants.TIER_OU,
    constants.TIER_UBERS,
    constants.TIER_LEGEND,
    constants.TIER_AG,
];

module.exports = constants;