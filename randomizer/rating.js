const { activeDiagnostics, DIAGNOSTIC_CODES } = require('./diagnostics');
const {
    TIER_MAGIKARP,
    TIER_ZU,
    TIER_PU,
    TIER_NU,
    TIER_RU,
    TIER_UU,
    TIER_OU,
    TIER_UBERS,
    TIER_LEGEND,
    TIER_AG,
    TIER_SEQ,
    TIER_AG_THRESHOLD,
    TIER_LEGEND_THRESHOLD,
    TIER_UBERS_THRESHOLD,
    TIER_OU_THRESHOLD,
    TIER_UU_THRESHOLD,
    TIER_RU_THRESHOLD,
    TIER_NU_THRESHOLD,
    TIER_PU_THRESHOLD,
    TIER_ZU_THRESHOLD,
    POKEMON_TYPE_POISON,
    POKEMON_TYPE_GRASS,
    AG_BST_THRESHOLD,
    LEGEND_BST_THRESHOLD,
    OU_BST_THRESHOLD,
    UU_BST_THRESHOLD,
    RU_BST_THRESHOLD,
    NU_BST_THRESHOLD,
    MEGA_AG_BST_THRESHOLD,
    MEGA_UBERS_BST_THRESHOLD,
    MEGA_AG_RATING_THRESHOLD,
    EVO_TYPE_NFE_OF_3,
    EVO_TYPE_LC_OF_2,
    EVO_TYPE_LC_OF_3,
    NATURES,
    WISHIWASHI_SCHOOL_LEVEL,
    WISHIWASHI_SCHOOL_HP_FACTOR,
    MELOETTA_FAMILY,
    MELOETTA_RELIC_SONG_ID,
    MULTITYPE_ABILITY,
    JUDGMENT_MOVE_ID,
    MULTI_ATTACK_MOVE_ID,
} = require('./constants');
// T-156/T-158 — the signature moves a Multitype mon (Arceus/Silvally) always carries. Each becomes the
// held Plate's type in battle; force-pick whichever the mon can learn.
const MULTITYPE_SIGNATURE_MOVES = [JUDGMENT_MOVE_ID, MULTI_ATTACK_MOVE_ID];
const { plates, protectionBerries } = require('./items');
const rng = require('./rng');

const BEST_RATING_FOR_MEGA_EVO = 780;
const BEST_RATING_FOR_FULLY_EVO = 720;
const BEST_RATING_FOR_NFE = 515;
const BEST_RATING_FOR_LC_3EVO = 400;

const WORST_RATING_FOR_MEGA_EVO = 480;
const WORST_RATING_FOR_FULLY_EVO = 250;
const WORST_RATING_FOR_NFE = 205;
const WORST_RATING_FOR_LC_3EVO = 180;

const soundBasedOffensiveMoves = [
    'MOVE_UPROAR',
    'MOVE_HYPER_VOICE',
    'MOVE_BUG_BUZZ',
    'MOVE_CHATTER',
    'MOVE_ROUND',
    'MOVE_ECHOED_VOICE',
    'MOVE_SNARL',
    'MOVE_DISARMING_VOICE',
    'MOVE_BOOMBURST',
    'MOVE_SPARKING_ARIA',
    'MOVE_CLANGING_SCALES',
    'MOVE_OVERDRIVE',
    'MOVE_TORCH_SONG',
    'MOVE_ALLURING_VOICE',
    'MOVE_PSYCHIC_NOISE',
    'MOVE_RELIC_SONG',
];

const multiHitMoves = [
    'MOVE_BULLET_SEED',
    'MOVE_ICICLE_SPEAR',
    'MOVE_PIN_MISSILE',
    'MOVE_ROCK_BLAST',
    'MOVE_TAIL_SLAP',
    'MOVE_BONE_RUSH',
    'MOVE_SCALE_SHOT',
    'MOVE_ARM_THRUST',
    'MOVE_BARRAGE',
    'MOVE_COMET_PUNCH',
    'MOVE_DOUBLE_SLAP',
    'MOVE_FURY_ATTACK',
    'MOVE_FURY_SWIPES',
    'MOVE_SPIKE_CANNON',
    'MOVE_WATER_SHURIKEN',  
];

const whiteHerbMoves = [
    'MOVE_OVERHEAT',
    'MOVE_LEAF_STORM',
    'MOVE_DRACO_METEOR',
    'MOVE_FLEUR_CANNON',
    'MOVE_SUPERPOWER',
    'MOVE_CLOSE_COMBAT',
    'MOVE_HAMMER_ARM',
    'MOVE_V_CREATE',
    'MOVE_CLANGING_SCALES',
    'MOVE_PSYCHO_BOOST',
    'MOVE_SHELL_SMASH',
];

const powerHerbMoves = [
    'MOVE_SKY_ATTACK',
    'MOVE_METEOR_BEAM',
    'MOVE_GEOMANCY',
    'MOVE_SKULL_BASH',
    'MOVE_RAZOR_WIND',
    'MOVE_ELECTRO_SHOT',
    'MOVE_FREEZE_SHOCK',
    'MOVE_ICE_BURN',
];

const highCritMoves = [
    'MOVE_X_SCISSOR',
    'MOVE_NIGHT_SLASH',
    'MOVE_SPACIAL_REND',
    'MOVE_CROSS_CHOP',
    'MOVE_BLAZE_KICK',
    'MOVE_AIR_CUTTER',
    'MOVE_LEAF_BLADE',
    'MOVE_DRILL_RUN',
    'MOVE_SLASH',
    'MOVE_CRABHAMMER',
    'MOVE_POISON_TAIL',
    'MOVE_CROSS_POISON',
    'MOVE_PSYCHO_CUT',
    'MOVE_STONE_EDGE',
    'MOVE_AEROBLAST',
    'MOVE_RAZOR_SHELL',
];

// T-160 — moves that ALWAYS land a critical hit (alwaysCriticalHit flag). Used to decline crit items
// (Razor Claw / Scope Lens) on a mon that already crits for free; the guaranteed ×1.5 is credited to the
// move itself in rateMove.
const superCritMoves = [
    'MOVE_STORM_THROW',
    'MOVE_FROST_BREATH',
    'MOVE_SURGING_STRIKES',
    'MOVE_WICKED_BLOW',
    'MOVE_FLOWER_TRICK',
    'MOVE_ZIPPY_ZAP',
];

const punchingMoves = [
    'MOVE_BULLET_PUNCH',
    'MOVE_COMET_PUNCH',
    'MOVE_DIZZY_PUNCH',
    'MOVE_DOUBLE_IRON_BASH',
    'MOVE_DRAIN_PUNCH',
    'MOVE_DYNAMIC_PUNCH',
    'MOVE_FIRE_PUNCH',
    'MOVE_FOCUS_PUNCH',
    'MOVE_HAMMER_ARM',
    'MOVE_HEADLONG_RUSH',
    'MOVE_ICE_HAMMER',
    'MOVE_ICE_PUNCH',
    'MOVE_JET_PUNCH',
    'MOVE_MACH_PUNCH',
    'MOVE_MEGA_PUNCH',
    'MOVE_METEOR_MASH',
    'MOVE_PLASMA_FISTS',
    'MOVE_POWER_UP_PUNCH',
    'MOVE_RAGE_FIST',
    'MOVE_SHADOW_PUNCH',
    'MOVE_SKY_UPPERCUT',
    'MOVE_SURGING_STRIKES',
    'MOVE_THUNDER_PUNCH',
    'MOVE_WICKED_BLOW',
];

// Moves that keep utility alongside a same-type STAB move: penalty 0.6× instead of 0.3×.
// Categories: priority moves (speed niche), draining (recovery niche), item removal, conditional-power.
const sameTypeLowerPenaltyMoves = [
    // Priority (+1 or higher) — speed niche is distinct from raw damage
    'MOVE_BULLET_PUNCH',
    'MOVE_MACH_PUNCH',
    'MOVE_SHADOW_SNEAK',
    'MOVE_SUCKER_PUNCH',
    'MOVE_AQUA_JET',
    'MOVE_ICE_SHARD',
    'MOVE_VACUUM_WAVE',
    'MOVE_WATER_SHURIKEN',
    'MOVE_JET_PUNCH',
    'MOVE_THUNDERCLAP',
    'MOVE_EXTREME_SPEED',
    'MOVE_FIRST_IMPRESSION',
    'MOVE_ACCELEROCK',
    'MOVE_QUICK_ATTACK',
    // Draining — recovery niche alongside raw STAB
    'MOVE_DRAIN_PUNCH',
    'MOVE_LEECH_LIFE',
    'MOVE_HORN_LEECH',
    'MOVE_GIGA_DRAIN',
    'MOVE_PARABOLIC_CHARGE',
    'MOVE_DRAINING_KISS',
    'MOVE_OBLIVION_WING',
    // Item removal — useful regardless of type overlap
    'MOVE_KNOCK_OFF',
    // Conditional-power (doubles if hit first) — mechanically distinct from static STAB
    'MOVE_REVENGE',
    'MOVE_AVALANCHE',
    // 30%+ secondary status — adds a win condition beyond raw damage
    'MOVE_SCALD',
    'MOVE_DISCHARGE',
    'MOVE_LAVA_PLUME',
];

const healingMoves = [
    'MOVE_ABSORB',
    'AQUA_RING',
    'MOVE_BITTER_BLADE',
    'MOVE_DRAIN_PUNCH',
    'MOVE_DRAINING_KISS',
    'MOVE_GIGA_DRAIN',
    'MOVE_HORN_LEECH',
    'MOVE_INGRAIN',
    'MOVE_LEECH_LIFE',
    'MOVE_LEECH_SEED',
    'MOVE_MATCHA_GOTCHA',
    'MOVE_MEGA_DRAIN',
    'MOVE_OBLIVION_WING',
    'MOVE_PARABOLIC_CHARGE',
    'MOVE_STRENGTH_SAP',
];

const typeChart = {
  NORMAL:     { ROCK: 0.5, GHOST: 0, STEEL: 0.5 },
  FIRE:       { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 2, BUG: 2, ROCK: 0.5, DRAGON: 0.5, STEEL: 2 },
  WATER:      { FIRE: 2, WATER: 0.5, GRASS: 0.5, GROUND: 2, ROCK: 2, DRAGON: 0.5 },
  ELECTRIC:   { WATER: 2, ELECTRIC: 0.5, GRASS: 0.5, GROUND: 0, FLYING: 2, DRAGON: 0.5 },
  GRASS:      { FIRE: 0.5, WATER: 2, GRASS: 0.5, POISON: 0.5, GROUND: 2, FLYING: 0.5, BUG: 0.5, ROCK: 2, DRAGON: 0.5, STEEL: 0.5 },
  ICE:        { FIRE: 0.5, WATER: 0.5, GRASS: 2, GROUND: 2, FLYING: 2, DRAGON: 2, STEEL: 0.5 },
  FIGHTING:   { NORMAL: 2, ICE: 2, POISON: 0.5, FLYING: 0.5, PSYCHIC: 0.5, BUG: 0.5, ROCK: 2, GHOST: 0, DARK: 2, STEEL: 2, FAIRY: 0.5 },
  POISON:     { GRASS: 2, POISON: 0.5, GROUND: 0.5, ROCK: 0.5, GHOST: 0.5, STEEL: 0, FAIRY: 2 },
  GROUND:     { FIRE: 2, ELECTRIC: 2, GRASS: 0.5, POISON: 2, FLYING: 0, BUG: 0.5, ROCK: 2, STEEL: 2 },
  FLYING:     { ELECTRIC: 0.5, GRASS: 2, FIGHTING: 2, BUG: 2, ROCK: 0.5, STEEL: 0.5 },
  PSYCHIC:    { FIGHTING: 2, POISON: 2, PSYCHIC: 0.5, DARK: 0, STEEL: 0.5 },
  BUG:        { FIRE: 0.5, GRASS: 2, FIGHTING: 0.5, POISON: 0.5, FLYING: 0.5, PSYCHIC: 2, GHOST: 0.5, DARK: 2, STEEL: 0.5, FAIRY: 0.5 },
  ROCK:       { FIRE: 2, ICE: 2, FIGHTING: 0.5, GROUND: 0.5, FLYING: 2, BUG: 2, STEEL: 0.5 },
  GHOST:      { NORMAL: 0, PSYCHIC: 2, GHOST: 2, DARK: 0.5 },
  DRAGON:     { DRAGON: 2, STEEL: 0.5, FAIRY: 0 },
  DARK:       { FIGHTING: 0.5, PSYCHIC: 2, GHOST: 2, DARK: 0.5, FAIRY: 0.5 },
  STEEL:      { FIRE: 0.5, WATER: 0.5, ELECTRIC: 0.5, ICE: 2, ROCK: 2, FAIRY: 2, STEEL: 0.5 },
  FAIRY:      { FIRE: 0.5, FIGHTING: 2, POISON: 0.5, DRAGON: 2, DARK: 2, STEEL: 0.5 },
};

function damageMultiplier(attackingType, defendingTypes) {
    const chart = typeChart[attackingType.toUpperCase()];
    let result = 1;
    defendingTypes.forEach(defType => {
        if (chart && chart[defType.toUpperCase()] !== undefined) {
            result *= chart[defType.toUpperCase()];
        }
    });
    return result;
}

function isSuperEffective(attackingType, defendingTypes) {
    return damageMultiplier(attackingType, defendingTypes) > 1;
}

// A4: Coverage metrics — how many types the moveset hits SE and how many can wall the entire set.
// superEffectiveCount: types (of 18) that at least one damage move hits for >= 2x
// wallCount: types that resist or are immune to ALL damage moves in the set (<= 0.5x)
// coverageScore: (superEffectiveCount / 18) * 10 - (wallCount / 18) * 5
function computeCoverageMetrics(moveset, moves) {
    const allTypes = Object.keys(typeChart);
    const damageMoves = moveset
        .map(id => moves[id])
        .filter(m => m && m.category !== 'DAMAGE_CATEGORY_STATUS');

    if (damageMoves.length === 0) {
        return { superEffectiveCount: 0, wallCount: 0, coverageScore: 0 };
    }

    let superEffectiveCount = 0;
    let wallCount = 0;

    for (const defType of allTypes) {
        const multipliers = damageMoves.map(m => damageMultiplier(m.type, [defType]));
        if (multipliers.some(mult => mult >= 2)) superEffectiveCount++;
        if (multipliers.every(mult => mult <= 0.5)) wallCount++;
    }

    const coverageScore = (superEffectiveCount / 18) * 10 - (wallCount / 18) * 5;
    return { superEffectiveCount, wallCount, coverageScore };
}

// @TODO Use it later for movesets
const comboList = [
    {
        effects: ['EFFECT_ENDURE', 'EFFECT_FLAIL'],
        rating: 8,
    },
    {
        effects: ['EFFECT_FOCUS_PUNCH', 'EFFECT_SUBSTITUTE'],
        rating: 9,
    },
    {
        effects: ['EFFECT_PROTECT', 'EFFECT_LEECH_SEED'],
        rating: 10,
    },
    {
        effects: ['EFFECT_REST', 'EFFECT_SLEEP_TALK'],
        rating: 7,
    },
    {
        effects: ['EFFECT_WISH', 'EFFECT_PROTECT'],
        rating: 7,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_ATTACK_UP_1'],
        rating: 6,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_SPECIAL_ATTACK_UP_1'],
        rating: 6,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_DEFENSE_UP_2'],
        rating: 6,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_SPECIAL_DEFENSE_UP_2'],
        rating: 6,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_ATTACK_SPATK_UP'],
        rating: 7,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_GROWTH'],
        rating: 7,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'MOVE_STOCKPILE'],
        rating: 8.5,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_COSMIC_POWER'],
        rating: 9,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_ACUPRESSURE'],
        rating: 9,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_ATTACK_UP_2'],
        rating: 9.5,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_SPECIAL_ATTACK_UP_2'],
        rating: 9.5,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_DRAGON_DANCE'],
        rating: 9.5,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_TIDY_UP'],
        rating: 9.5,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_SHIFT_GEAR'],
        rating: 9.5,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_FILLET_AWAY'],
        rating: 9.5,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_BELLY_DRUM'],
        rating: 10,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_VICTORY_DANCE'],
        rating: 10,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_QUIVER_DANCE'],
        rating: 10,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_SPECIAL_ATTACK_UP_3'],
        rating: 10,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_SHELL_SMASH'],
        rating: 10,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_GEOMANCY'],
        rating: 10,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_CLANGOROUS_SOUL'],
        rating: 10,
    },
    {
        effects: ['EFFECT_BATON_PASS', 'EFFECT_NO_RETREAT'],
        rating: 10,
    },
]

// @TODO Moves that shouldn't go together
const antiComboList = [
    [
        'MOVE_REST',
        'MOVE_MILK_DRINK',
        'MOVE_SOFT_BOILED',
        'MOVE_SLACK_OFF',
        'MOVE_HEAL_ORDER',
        'MOVE_RECOVER',
        'MOVE_SYNTHESIS',
        'MOVE_MORNING_SUN',
        'MOVE_MOONLIGHT',
        'MOVE_ROOST',
        'MOVE_SHORE_UP',
        'MOVE_STRENGTH_SAP',
        'MOVE_LIFE_DEW',
    ],
    [
        'MOVE_STOCKPILE',
        'MOVE_COSMIC_POWER',
        'MOVE_DEFEND_ORDER',
        'MOVE_MAGNETIC_FLUX',
    ],
    [
        'MOVE_TOPSY_TURVY',
        'MOVE_HOWL',
        'MOVE_HONE_CLAWS',
        'MOVE_WORK_UP',
        'MOVE_GROWTH',
        'MOVE_CURSE',
        'MOVE_ACUPRESSURE',
        'MOVE_BULK_UP',
        'MOVE_CALM_MIND',
        'MOVE_TAKE_HEART',
        'MOVE_SWORDS_DANCE',
        'MOVE_BELLY_DRUM',
        'MOVE_DRAGON_DANCE',
        'MOVE_TIDY_UP',
        'MOVE_SHIFT_GEAR',
        'MOVE_TAIL_GLOW',
        'MOVE_QUIVER_DANCE',
        'MOVE_VICTORY_DANCE',
        'MOVE_SHELL_SMASH',
        'MOVE_GEOMANCY',
        'MOVE_FILLET_AWAY',
        'MOVE_NO_RETREAT',
        'MOVE_CLANGOROUS_SOUL',
        'MOVE_FOCUS_ENERGY',
    ],
];

const onePerTeamMoves = ['MOVE_HEAL_BELL', 'MOVE_AROMATHERAPY'];

// @TODO These should have their own treatment
const weatherMoves = [
    'MOVE_RAIN_DANCE',
    'MOVE_SUNNY_DAY',
    'MOVE_HAIL',
    'MOVE_SANDSTORM',
    'MOVE_SNOWSCAPE',
    'MOVE_CHILLY_RECEPTION',
];

const unusedSpecialStrategiesMoves = [
    'MOVE_RECYCLE',
    'MOVE_SPEED_SWAP',
]

// A6: Move sets used for combo pattern detection in computeComboBonus.
const setupMoves = new Set([
    'MOVE_SWORDS_DANCE', 'MOVE_DRAGON_DANCE', 'MOVE_NASTY_PLOT', 'MOVE_CALM_MIND',
    'MOVE_QUIVER_DANCE', 'MOVE_SHELL_SMASH', 'MOVE_BELLY_DRUM', 'MOVE_SHIFT_GEAR',
    'MOVE_TAIL_GLOW', 'MOVE_GEOMANCY', 'MOVE_BULK_UP', 'MOVE_COIL', 'MOVE_WORK_UP',
    'MOVE_HONE_CLAWS', 'MOVE_CURSE', 'MOVE_VICTORY_DANCE', 'MOVE_NO_RETREAT',
    'MOVE_CLANGOROUS_SOUL', 'MOVE_FILLET_AWAY', 'MOVE_TAKE_HEART',
]);

const comboPriorityMoves = new Set([
    'MOVE_BULLET_PUNCH', 'MOVE_MACH_PUNCH', 'MOVE_AQUA_JET', 'MOVE_SHADOW_SNEAK',
    'MOVE_SUCKER_PUNCH', 'MOVE_EXTREME_SPEED', 'MOVE_ICE_SHARD', 'MOVE_QUICK_ATTACK',
    'MOVE_VACUUM_WAVE', 'MOVE_JET_PUNCH', 'MOVE_WATER_SHURIKEN',
    'MOVE_FIRST_IMPRESSION', 'MOVE_FAKE_OUT',
    'MOVE_THUNDERCLAP',  // Raging Bolt signature — priority special Electric
]);

const comboRecoveryMoves = new Set([
    'MOVE_RECOVER', 'MOVE_ROOST', 'MOVE_SOFT_BOILED', 'MOVE_SLACK_OFF',
    'MOVE_MILK_DRINK', 'MOVE_HEAL_ORDER', 'MOVE_SYNTHESIS', 'MOVE_MORNING_SUN',
    'MOVE_MOONLIGHT', 'MOVE_SHORE_UP', 'MOVE_REST', 'MOVE_WISH',
    // Passive recovery moves that sustain a pokemon over time
    'MOVE_LEECH_SEED', 'MOVE_AQUA_RING', 'MOVE_INGRAIN',
    // Draining moves: provide healing on hit, acting as recovery over multiple turns
    'MOVE_DRAIN_PUNCH', 'MOVE_GIGA_DRAIN', 'MOVE_LEECH_LIFE', 'MOVE_HORN_LEECH',
    'MOVE_DRAINING_KISS', 'MOVE_BITTER_BLADE', 'MOVE_OBLIVION_WING',
]);

const selfLoweringMoves = new Set([
    'MOVE_LEAF_STORM', 'MOVE_OVERHEAT', 'MOVE_SUPERPOWER', 'MOVE_DRACO_METEOR',
    'MOVE_CLOSE_COMBAT', 'MOVE_FLEUR_CANNON', 'MOVE_PSYCHO_BOOST', 'MOVE_HAMMER_ARM',
    'MOVE_V_CREATE', 'MOVE_CLANGING_SCALES',
]);

const highFlinchMoves = new Set([
    'MOVE_AIR_SLASH', 'MOVE_IRON_HEAD', 'MOVE_ROCK_SLIDE', 'MOVE_HEADBUTT',
    'MOVE_ZEN_HEADBUTT', 'MOVE_BITE', 'MOVE_DARK_PULSE', 'MOVE_ASTONISH',
    'MOVE_EXTRASENSORY', 'MOVE_NEEDLE_ARM',
]);

const hazardSetMoves = new Set([
    'MOVE_STEALTH_ROCK', 'MOVE_SPIKES', 'MOVE_TOXIC_SPIKES', 'MOVE_STICKY_WEB',
]);

// T-159 — dedicated moves that inflict a non-volatile status (Toxic, Will-O-Wisp, Thunder Wave, the
// sleep/poison/paralysis powders, Yawn, Dark Void, Toxic Thread). A target can only ever carry ONE such
// status, so no Pokémon runs two of these moves — the second is rejected in rateMoveForAPokemon.
const STATUS_INFLICTION_EFFECTS = new Set([
    'EFFECT_NON_VOLATILE_STATUS', 'EFFECT_DARK_VOID', 'EFFECT_YAWN', 'EFFECT_TOXIC_THREAD',
]);

const pivotingMoves = new Set([
    'MOVE_U_TURN', 'MOVE_VOLT_SWITCH', 'MOVE_FLIP_TURN', 'MOVE_PARTING_SHOT',
    'MOVE_TELEPORT',
]);

const statusList = {
    MOVE_SPLASH: 0,
    MOVE_CELEBRATE: 0,
    MOVE_HOLD_HANDS: 0,
    MOVE_STRUGGLE: 0,
    MOVE_ROTOTILLER: 0,
    MOVE_AROMATIC_MIST: 0,
    MOVE_MAGNETIC_FLUX: 0,
    MOVE_HAPPY_HOUR: 0,
    MOVE_FLORAL_HEALING: 0,
    MOVE_SPOTLIGHT: 0,
    MOVE_GEAR_UP: 0,
    MOVE_AURORA_VEIL: 0,
    MOVE_DECORATE: 0,
    MOVE_COACHING: 0,
    
    MOVE_STUFF_CHEEKS: 1,
    MOVE_TEATIME: 1,
    MOVE_NIGHTMARE: 1,
    MOVE_SLEEP_TALK: 1,
    MOVE_SPIT_UP: 1,
    MOVE_SWALLOW: 1,
    MOVE_MEMENTO: 1,
    MOVE_FOLLOW_ME: 1,
    MOVE_RAGE_POWDER: 1,
    MOVE_TELEKINESIS: 1,
    MOVE_MAGIC_ROOM: 1,
    MOVE_HELPING_HAND: 1,
    MOVE_TRICK: 1,
    MOVE_SWITCHEROO: 1,
    MOVE_ROLE_PLAY: 1,
    MOVE_RECYCLE: 1,
    MOVE_SKILL_SWAP: 1,
    MOVE_IMPRISON: 1,
    MOVE_GRUDGE: 1,
    MOVE_GRAVITY: 1,
    MOVE_MIRACLE_EYE: 1,
    MOVE_REFRESH: 2,
    MOVE_SNATCH: 2,
    MOVE_HEALING_WISH: 3,
    MOVE_LUNAR_DANCE: 3,
    MOVE_SOAK: 3,
    MOVE_QUASH: 4,

    MOVE_RAIN_DANCE: 1,
    MOVE_SUNNY_DAY: 1,
    MOVE_HAIL: 1,
    MOVE_SANDSTORM: 1,
    MOVE_SNOWSCAPE: 1,
    MOVE_CHILLY_RECEPTION: 3,
    
    MOVE_SWEET_SCENT: 1,
    MOVE_SWEET_KISS: 1,
    MOVE_SUPERSONIC: 1,
    MOVE_BIDE: 2,
    MOVE_SPITE: 2,
    MOVE_PSYCH_UP: 2,
    MOVE_BATON_PASS: 2,
    MOVE_PERISH_SONG: 2,
    MOVE_MUD_SPORT: 2,
    MOVE_WATER_SPORT: 2,
    MOVE_EMBARGO: 2,
    MOVE_CAPTIVATE: 2,

    MOVE_GRASSY_TERRAIN: 2,
    MOVE_MISTY_TERRAIN: 2,
    MOVE_ELECTRIC_TERRAIN: 2,
    MOVE_PSYCHIC_TERRAIN: 2,
    
    MOVE_WIDE_GUARD: 0,
    MOVE_QUICK_GUARD: 1,
    MOVE_ALLY_SWITCH: 1,
    MOVE_HEAL_PULSE: 1,
    MOVE_GUARD_SPLIT: 1,
    MOVE_POWER_SPLIT: 1,
    MOVE_ENTRAINMENT: 1,
    MOVE_BESTOW: 1,
    MOVE_FAIRY_LOCK: 1,
    MOVE_ION_DELUGE: 1,
    MOVE_WONDER_ROOM: 2,
    MOVE_POWER_TRICK: 0,
    MOVE_POWER_SWAP: 2,
    MOVE_GUARD_SWAP: 2,
    MOVE_SPEED_SWAP: 2,
    MOVE_HEART_SWAP: 3,
    MOVE_WORRY_SEED: 2,
    MOVE_POWER_SHIFT: 2,
    MOVE_GASTRO_ACID: 2,
    MOVE_SIMPLE_BEAM: 2,
    MOVE_LUCKY_CHANT: 2,
    MOVE_ODOR_SLEUTH: 2,
    MOVE_MAT_BLOCK: 2,
    MOVE_INGRAIN: 2,
    MOVE_AQUA_RING: 3,
    MOVE_ELECTRIFY: 3,
    MOVE_MAGNET_RISE: 2,
    MOVE_SCREECH: 4,
    MOVE_CONFUSE_RAY: 2,
    MOVE_TEETER_DANCE: 2,
    MOVE_VENOM_DRENCH: 2,
    MOVE_POWDER: 2,
    MOVE_FLATTER: 2,
    MOVE_HEAL_BLOCK: 3,
    MOVE_SWAGGER: 4,
    MOVE_ATTRACT: 4,
    MOVE_ME_FIRST: 4,
    MOVE_AFTER_YOU: 4,
    MOVE_PSYCHO_SHIFT: 4,
    MOVE_MAGIC_COAT: 5,
    MOVE_ENCORE: 6,
    MOVE_COPYCAT: 6,
    
    MOVE_SAFEGUARD: 3,
    MOVE_HAZE: 4,

    MOVE_COUNTER: 7,
    MOVE_MIRROR_COAT: 7,
    MOVE_METAL_BURST: 7.5,
    
    MOVE_SKETCH: 1,
    MOVE_DOODLE: 1,
    MOVE_INSTRUCT: 1,
    MOVE_CAMOUFLAGE: 2,
    MOVE_CONVERSION: 2,
    MOVE_REFLECT_TYPE: 2,
    MOVE_PRESENT: 2,
    MOVE_SPICY_EXTRACT: 2,
    MOVE_TRICK_OR_TREAT: 2,
    MOVE_CRAFTY_SHIELD: 2,
    MOVE_MAGIC_POWDER: 2,
    EFFECT_FLOWER_SHIELD: 2,
    MOVE_FORESTS_CURSE: 2,
    MOVE_CONVERSION_2: 4,
    MOVE_TORMENT: 3,
    MOVE_TRANSFORM: 3,
    MOVE_MIRROR_MOVE: 3,
    MOVE_PURIFY: 5,
    MOVE_TAUNT: 5,
    MOVE_METRONOME: 5,
    MOVE_ASSIST: 5,
    MOVE_NATURE_POWER: 6,
    MOVE_DESTINY_BOND: 6,
    MOVE_CORROSIVE_GAS: 5,

    MOVE_DOUBLE_TEAM: 5,
    MOVE_FOCUS_ENERGY: 1.5,
    MOVE_DRAGON_CHEER: 6,
    MOVE_LASER_FOCUS: 6,
    MOVE_MINIMIZE: 6,
    
    MOVE_BELCH: 6,
    MOVE_COURT_CHANGE: 6,

    MOVE_TOPSY_TURVY: 6,
    MOVE_AGILITY: 7,
    MOVE_AUTOTOMIZE: 7,
    MOVE_TAILWIND: 7.5,
    MOVE_HOWL: 6,
    MOVE_HONE_CLAWS: 6.5,
    MOVE_WORK_UP: 6.5,
    MOVE_GROWTH: 6.5,
    MOVE_CURSE: 6.5,
    MOVE_ACUPRESSURE: 6.5,
    MOVE_BULK_UP: 7,
    MOVE_CALM_MIND: 7,
    MOVE_TAKE_HEART: 8,
    MOVE_SWORDS_DANCE: 8,
    MOVE_BELLY_DRUM: 8,
    MOVE_DRAGON_DANCE: 8.5,
    MOVE_TIDY_UP: 8.5,
    MOVE_SHIFT_GEAR: 8.5,
    MOVE_TAIL_GLOW: 9,
    MOVE_QUIVER_DANCE: 9.5,
    MOVE_VICTORY_DANCE: 9.5,
    MOVE_SHELL_SMASH: 9.5,
    MOVE_GEOMANCY: 9.5,
    MOVE_FILLET_AWAY: 9.5,
    MOVE_NO_RETREAT: 10,
    MOVE_CLANGOROUS_SOUL: 10,
    
    MOVE_STOCKPILE: 8,
    MOVE_DEFEND_ORDER: 8,
    MOVE_COSMIC_POWER: 8,

    MOVE_POISON_GAS: 4,
    MOVE_TOXIC_THREAD: 7,
    MOVE_TOXIC: 8,
    MOVE_WILL_O_WISP: 8,
    MOVE_POISON_POWDER: 3.5,   // 75% acc, regular poison (vs Poison Gas 90%→4)
    MOVE_GRASS_WHISTLE: 4.5,
    MOVE_SING: 4.5,             // 55% acc, sleep (same as Grass Whistle)
    MOVE_HYPNOSIS: 5,           // 60% acc, sleep
    MOVE_YAWN: 5,
    MOVE_LOVELY_KISS: 6.5,
    MOVE_SLEEP_POWDER: 7,
    EFFECT_DARK_VOID: 7,
    MOVE_SPORE: 10,
    MOVE_THUNDER_WAVE: 7,
    MOVE_STUN_SPORE: 5.5,       // 75% acc, paralysis (vs Thunder Wave 90%→7)
    MOVE_GLARE: 7.5,

    MOVE_HEAL_BELL: 6,
    MOVE_AROMATHERAPY: 6,

    MOVE_SPIKES: 6,
    MOVE_TOXIC_SPIKES: 6.5,
    MOVE_STEALTH_ROCK: 8,
    MOVE_STICKY_WEB: 7.5, // T-159: almost Stealth Rock quality — above Spikes/Toxic Spikes, below SR


    MOVE_PARTING_SHOT: 8,
    MOVE_KINGS_SHIELD: 8,
    MOVE_SPIKY_SHIELD: 8,
    MOVE_BANEFUL_BUNKER: 8,
    MOVE_OBSTRUCT: 8,
    MOVE_SILK_TRAP: 8,
    MOVE_BURNING_BULWARK: 8,

    MOVE_PAIN_SPLIT: 5,
    MOVE_LIGHT_SCREEN: 7.5,
    MOVE_REFLECT: 7.5,
    MOVE_SUBSTITUTE: 8,
    MOVE_SHED_TAIL: 8,
    MOVE_DEFOG: 7,
    MOVE_LIFE_DEW: 5,
    MOVE_REST: 6,
    MOVE_WISH: 7,
    MOVE_MILK_DRINK: 8.5,
    MOVE_SOFT_BOILED: 8.5,
    MOVE_SLACK_OFF: 8.5,
    MOVE_SHORE_UP: 8.5,
    MOVE_HEAL_ORDER: 8.5,
    MOVE_RECOVER: 8.5,
    MOVE_SYNTHESIS: 8.5,
    MOVE_MORNING_SUN: 8.5,
    MOVE_MOONLIGHT: 8.5,
    MOVE_ROOST: 8.5,
    MOVE_STRENGTH_SAP: 10,
    MOVE_LEECH_SEED: 8,
    MOVE_OCTOLOCK: 8,
    MOVE_REVIVAL_BLESSING: 10,

    // Special moves like this are discouraged unless gimmick team
    MOVE_TRICK_ROOM: 3,

    // Other moves that are kinda special
    MOVE_LUSTER_PURGE: 8,
    MOVE_MIST_BALL: 8,

    // Others that might need specific handling
    MOVE_GYRO_BALL: 6,
    // Multi-hits for skill link
    // Drops for contrary
};

function rateMove(move) {
    if (move.id in statusList) {
        return statusList[move.id];
    }

    const isStatus = move.category === 'DAMAGE_CATEGORY_STATUS';
    if (isStatus) {
        if (
            move.effect === 'EFFECT_LOCK_ON'
            || move.effect === 'EFFECT_FORESIGHT'
        ) {
            return 2;
        }

        if (
            move.effect === 'EFFECT_DEFENSE_DOWN'
            || move.effect === 'EFFECT_ATTACK_DOWN'
            || move.effect === 'EFFECT_SPECIAL_ATTACK_DOWN'
            || move.effect === 'EFFECT_ROAR'
            || move.effect === 'EFFECT_JUNGLE_HEALING'
        ) {
            return 1.5;
        }

        if (move.effect === 'EFFECT_ACCURACY_DOWN') {
            return 2.0;
        }

        if (
            move.effect === 'EFFECT_DEFENSE_CURL'
            || move.effect === 'EFFECT_DEFENSE_UP'
            || move.effect === 'EFFECT_ENDURE'
            || move.effect === 'EFFECT_CHARGE'
        ) {
            return 3.5;
        }

        if (
            move.effect === 'EFFECT_MEAN_LOOK'
            || move.effect === 'EFFECT_SPEED_DOWN_2'
            || move.effect === 'EFFECT_TAR_SHOT'
            || move.effect === 'EFFECT_PROTECT'
        ) {
            return 4.5;
        }

        if (
            move.effect === 'EFFECT_ATTACK_DOWN_2'
            || move.effect === 'EFFECT_SPECIAL_ATTACK_DOWN_2'
            || move.effect === 'EFFECT_DEFENSE_DOWN_2'
            || move.effect === 'EFFECT_SPECIAL_DEFENSE_DOWN_2'
            || move.effect === 'EFFECT_TICKLE'
            || move.effect === 'EFFECT_NOBLE_ROAR'
        ) {
            return 3;
        }

        if (
            move.effect === 'EFFECT_DEFENSE_UP_2'
            || move.effect === 'EFFECT_SPECIAL_DEFENSE_UP_2'
            || move.effect === 'EFFECT_DEFENSE_UP_3'
        ) {
            return 5;
        }

        if (
            move.effect === 'EFFECT_ATTACK_UP'
            || move.effect === 'EFFECT_SPECIAL_ATTACK_UP'
            || move.effect === 'EFFECT_ATTACK_UP_USER_ALLY'
        ) {
            return 6;
        }

        if (
            move.effect === 'EFFECT_BULK_UP'
            || move.effect === 'EFFECT_ATTACK_SPATK_UP'
            || move.effect === 'EFFECT_CALM_MIND'
            || move.effect === 'EFFECT_ATTACK_ACCURACY_UP'
            || move.effect === 'EFFECT_COIL'
        ) {
            return 6.5;
        }

        return 1;
    }
    
    const moveEffect = move.effect || '';
    // T-159 — fixed-damage moves deal a flat/derived amount independent of the user's Attack/SpAtk, so
    // their stored power (1) is meaningless. Rate them on reliability instead: Seismic Toss / Night
    // Shade (level HP) are the staller's attack-independent chip; Super Fang / Ruination (½ HP) a bit
    // less; the small flat amounts (Dragon Rage 40, Sonic Boom 20, Psywave) are weak. rateMoveForAPokemon
    // skips offense-scaling and STAB for these, so the value below is what reaches move selection.
    if (FIXED_DAMAGE_EFFECTS.includes(moveEffect)) {
        if (moveEffect === 'EFFECT_LEVEL_DAMAGE') return 4.5;
        if (moveEffect === 'EFFECT_FIXED_PERCENT_DAMAGE') return 3.5;
        if (moveEffect === 'EFFECT_ENDEAVOR') return 3;
        return 1.5;
    }
    let power = move.power || 50;
    // Variable HP-scaled moves store power as 1 (truthy, so || 50 doesn't fire).
    // Treat as 50 — conservative realistic average without Endure.
    const isVarPowerHp = moveEffect.includes('EFFECT_FLAIL')
        || moveEffect.includes('EFFECT_REVERSAL')
        || moveEffect.includes('EFFECT_POWER_BASED_ON_USER_HP');
    if (isVarPowerHp && (move.power || 0) <= 1) {
        power = 50;
    }
    // Low Kick / Grass Knot: power is stored as 1 in game data (weight-variable).
    // Average effective power vs typical opponents is ~70; treat it as such.
    const isLowKick = moveEffect === 'EFFECT_LOW_KICK';
    if (isLowKick) {
        power = 70;
    }
    const isMultihit = moveEffect.includes('EFFECT_MULTI_HIT');
    if (isMultihit) {
        power *= 2.5;
    }
    const isTripleKick = moveEffect.includes('EFFECT_TRIPLE_KICK');
    if (isTripleKick) {
        power *= 6.5;
    }
    else {
        const strikeCount = parseInt(move.strikeCount, 10) || 1;
        power *= strikeCount;
        if (strikeCount > 1) {
            power += power*0.5;
        }
    }
    if (move.additionalEffects.includes('MOVE_EFFECT_RECHARGE')) {
        power *= 0.6;
    }
    // T-160 — always-crit moves (Wicked Blow, Surging Strikes, Storm Throw, Frost Breath, Zippy Zap,
    // Flower Trick) land a guaranteed critical hit: ×1.5 damage in this build (B_CRIT_MULTIPLIER = Gen 6+).
    // Fold the guaranteed ×1.5 into effective power here; the flat reliability bonus is added after the cap.
    const alwaysCrit = move.alwaysCriticalHit === 'TRUE';
    if (alwaysCrit) {
        power *= 1.5;
    }
    let rating = Math.min(10 * power / 140, 12);
    // T-160 — a crit also IGNORES the target's Def/SpDef boosts and screens (Reflect / Light Screen /
    // Aurora Veil), so an always-crit move keeps working against defensive setup and screen teams. Credit
    // that reliability with a small flat bonus on top of the ×1.5 (applied after the cap so the strongest
    // always-crit moves, e.g. Surging Strikes, still get it).
    if (alwaysCrit) rating += 0.5;
    const isOhko = moveEffect.includes('EFFECT_OHKO');
    if (isOhko) rating = 12;
    let accuracy = move.accuracy || 110;
    if (accuracy == 0) accuracy = 110;
    rating -= (100 - accuracy) / 10;
    const priority = move.priority || 0;
    // EFFECT_HIT_SWITCH_TARGET: -6 is a phazing mechanics tag, not a "goes last" penalty.
    // EFFECT_REVENGE (Revenge + Avalanche): -4 means "you get hit first → power doubles".
    // The trigger is near-certain in trainer battles, so skip the penalty and apply a bonus.
    const isConditionalPower = moveEffect === 'EFFECT_REVENGE';
    if (!moveEffect.includes('EFFECT_HIT_SWITCH_TARGET') && !isConditionalPower) {
        rating += priority;
    }
    if (isConditionalPower) {
        rating *= 1.5;
    }
    const isSuckerPunch = moveEffect.includes('EFFECT_SUCKER_PUNCH');
    if (isSuckerPunch) rating -= 0.5;
    const isFirstTurnOnly = moveEffect.includes('EFFECT_FIRST_TURN_ONLY');
    if (isFirstTurnOnly) rating += 3; // Fake Out and First Impression are very good moves
    const isTwoTurns = moveEffect.includes('EFFECT_TWO_TURNS_ATTACK');
    if (isTwoTurns) {
        rating *= 0.5;
    }
    const isFocusPunch = moveEffect.includes('EFFECT_FOCUS_PUNCH');
    if (isFocusPunch) {
        rating *= 0.4;
    }
    const isFlyLike = moveEffect.includes('EFFECT_SEMI_INVULNERABLE');
    if (isFlyLike) {
        rating *= 0.7;
    }
    const isRecoilIfMiss = moveEffect.includes('EFFECT_RECOIL_IF_MISS');
    const isRecoil = moveEffect.includes('EFFECT_RECOIL') && !isRecoilIfMiss;
    if (isRecoil) {
        rating *= 0.9;
    }
    const isFutureSight = moveEffect.includes('EFFECT_FUTURE_SIGHT');
    if (isFutureSight) {
        rating *= 0.8;
    }
    const isLastResort = moveEffect.includes('EFFECT_LAST_RESORT');
    if (isLastResort) {
        rating *= 0.6;
    }
    const isSolarBeam = moveEffect.includes('EFFECT_SOLAR_BEAM');
    if (isSolarBeam) {
        rating *= 0.8;
    }
    const hasDefSpefDrop = move.additionalEffects.includes('MOVE_EFFECT_DEF_SPDEF_DOWN');
    const hasSpeDrop = move.additionalEffects.includes('MOVE_EFFECT_SPD_MINUS_1');
    if (hasDefSpefDrop || hasSpeDrop) {
        rating *= 0.95;
    }
    const hasAtkDefDrop = move.additionalEffects.includes('MOVE_EFFECT_ATK_DEF_DOWN');
    const hasSpaDrop = move.additionalEffects.includes('MOVE_EFFECT_SP_ATK_MINUS_2');
    if (hasAtkDefDrop || hasSpaDrop) {
        rating *= 0.9;
    }
    if (isRecoilIfMiss) {
        // Miss → lose 50% max HP. Penalty = miss_chance × 0.5 recoil cost.
        rating *= (1 - ((100 - accuracy) / 100) * 0.5);
    }
    const isBasedOnHp = moveEffect.includes('EFFECT_POWER_BASED_ON_USER_HP');
    if (isBasedOnHp) {
        rating *= 0.9;
    }
    const isExplosion = moveEffect.includes('EFFECT_EXPLOSION');
    if (isExplosion) {
        rating *= 0.5;
    }
    const isMindBlownLike = moveEffect.includes('EFFECT_MAX_HP_50_RECOIL');
    if (isMindBlownLike) {
        rating *= 0.75;
    }
    const isHitEscape = moveEffect.includes('EFFECT_HIT_ESCAPE');
    if (isHitEscape) {
        rating *= 1.5;
    }
    const isKnockOff = moveEffect.includes('EFFECT_KNOCK_OFF');
    if (isKnockOff) {
        rating *= 1.3;
    }
    const isRollout = moveEffect.includes('EFFECT_ROLLOUT');
    if (isRollout) {
        rating *= 2.5;
    }
    const isFalseSwipe = moveEffect.includes('EFFECT_FALSE_SWIPE');
    if (isFalseSwipe) {
        rating *= 0.5;
    }

    return rating;
}

const specialScalingMoves = {
    MOVE_COUNTER: 'counter-bulk',
    MOVE_MIRROR_COAT: 'mirror-bulk',
    MOVE_COMEUPPANCE: 'hp',
    MOVE_METAL_BURST: 'hp',
    MOVE_GYRO_BALL: '-speed',
    MOVE_ELECTRO_BALL: 'speed',
    // MOVE_HEAT_CRASH: 'weight',
    // MOVE_HEAVY_SLAM: 'weight',
    MOVE_HEAT_CRASH: 'defvsatk', // Assume certain correlation with weight
    MOVE_HEAVY_SLAM: 'defvsatk', // Assume certain correlation with weight
    MOVE_BODY_PRESS: 'defense',
    MOVE_FOUL_PLAY: 'defvsatk',
    // Low Kick and Grass Knot use variable power based on target weight but still
    // scale with Attack/SpAtk normally — let them fall through to standard scaling.
};

// T-159 — damage moves whose output does NOT scale with the user's Attack/SpAtk. Fixed-damage moves
// (Seismic Toss, Night Shade, Sonic Boom, Super Fang, …) deal a flat/derived amount; they are the
// staller's attack-independent chip (corpus: Chansey runs Seismic Toss as its only attack on every
// stall team). They must be rated on that flat value, not scaled by the user's (often terrible) offense.
const FIXED_DAMAGE_EFFECTS = [
    'EFFECT_LEVEL_DAMAGE',         // Seismic Toss, Night Shade
    'EFFECT_FIXED_HP_DAMAGE',      // Dragon Rage, Sonic Boom
    'EFFECT_FIXED_PERCENT_DAMAGE', // Super Fang, Nature's Madness, Ruination
    'EFFECT_PSYWAVE',              // Psywave
    'EFFECT_ENDEAVOR',            // Endeavor
];
// Damaging moves that gain nothing from a +Atk/+SpAtk boost: fixed damage, reactive (Counter-like),
// or scaled off a stat the boost doesn't touch (Foul Play → target's Atk; Body Press → user's Def).
const OFFENSE_INDEPENDENT_EFFECTS = [
    ...FIXED_DAMAGE_EFFECTS,
    'EFFECT_COUNTER', 'EFFECT_MIRROR_COAT', 'EFFECT_METAL_BURST', 'EFFECT_COMEUPPANCE',
    'EFFECT_FOUL_PLAY',
    'EFFECT_BODY_PRESS',
];
// Does this move actually benefit from an offensive boost (used to gate Weakness Policy)?
function benefitsFromOffenseBoost(m) {
    return !!m && m.category !== 'DAMAGE_CATEGORY_STATUS' && !OFFENSE_INDEPENDENT_EFFECTS.includes(m.effect);
}

// T-159 — charge / two-turn attacks whose value hinges on an enabler (a Power Herb, or the right
// weather for Solar Beam / Electro Shot). The consolidation pass (adjustMoveset) drops one when the
// finalised held item can't provide the enabler and no weather does.
const CHARGE_MOVE_EFFECTS = ['EFFECT_SOLAR_BEAM', 'EFFECT_TWO_TURNS_ATTACK', 'EFFECT_SEMI_INVULNERABLE'];

const atkBoostinEffects = [
    'EFFECT_ATTACK_UP_1',
    'EFFECT_ATTACK_UP_2',
    'EFFECT_ATTACK_UP_3',
    'EFFECT_ATTACK_ACCURACY_UP',
    'EFFECT_SHIFT_GEAR',
    'EFFECT_BULK_UP',
    'EFFECT_CURSE',
    'EFFECT_COIL',
    'EFFECT_DRAGON_DANCE',
    'EFFECT_VICTORY_DANCE',
    'EFFECT_BELLY_DRUM',
];
const spaBoostinEffects = [
    'EFFECT_SPECIAL_ATTACK_UP_1',
    'EFFECT_SPECIAL_ATTACK_UP_2',
    'EFFECT_SPECIAL_ATTACK_UP_3',
    'EFFECT_CALM_MIND',
    'EFFECT_TAKE_HEART',
    'EFFECT_QUIVER_DANCE',
    'EFFECT_GEOMANCY',
];
const selfDamagingEffects = [
    'EFFECT_SUBSTITUTE',
    'EFFECT_CLANGOROUS_SOUL',
    'EFFECT_BELLY_DRUM',
    'EFFECT_FILLET_AWAY',
    'EFFECT_RECOIL',
];
const OPPONENT_STAT_DROP_EFFECTS = new Set([
    'EFFECT_ATTACK_DOWN',         'EFFECT_ATTACK_DOWN_2',
    'EFFECT_DEFENSE_DOWN',        'EFFECT_DEFENSE_DOWN_2',
    'EFFECT_SPECIAL_ATTACK_DOWN', 'EFFECT_SPECIAL_ATTACK_DOWN_2',
    'EFFECT_SPECIAL_DEFENSE_DOWN','EFFECT_SPECIAL_DEFENSE_DOWN_2',
    'EFFECT_SPEED_DOWN',          'EFFECT_SPEED_DOWN_2',
    'EFFECT_ACCURACY_DOWN',       'EFFECT_EVASION_DOWN',
    'EFFECT_NOBLE_ROAR',          'EFFECT_TICKLE',
]);

// ctx (optional) carries team/run context for weather- and item-conditional move heuristics (T-013):
//   { sun, rain, snow, sand, powerHerb } — sun/rain/snow/sand = an EARLIER teammate sets that weather;
//   powerHerb = a Power Herb is available (held or in the trainer's bag). All default false.
function rateMoveForAPokemon(move, poke, ability, item, otherMoves, currentMoves, ctx = {}) {
    // Status moves are normally gated until the set has ≥2 attacks (don't over-stack utility on an
    // attacker). T-159: a pure staller is the opposite — it WANTS a status-heavy set, so a genuine STALL
    // TOOL (recovery / Toxic / hazard / phazing / cleric / Protect / trap) bypasses the attack floor for
    // it. Non-stall status (Light Screen, Calm Mind, Thunder Wave …) is still gated so it can't flood a
    // stall set, and the Choice / Assault-Vest lock still forbids all status regardless.
    const stallToolException = ctx.stallMode && isStallTool(move, ctx.doubles);
    if (
        (
            (currentMoves.filter(m => m.category !== 'DAMAGE_CATEGORY_STATUS').length < 2 && !stallToolException)
            || item === 'Choice Band'
            || item === 'Choice Specs'
            || item === 'Assault Vest'
            || (item === 'Choice Scarf' && move.effect !== 'EFFECT_TRICK')
        )
        && move.category === 'DAMAGE_CATEGORY_STATUS'
    ) {
        return 0;
    }

    // T-159 — a staller never wants two of the same disruption: cap protect-variants and phazing at one
    // each (recovery is already mutually-exclusive via antiComboList). Only under stallMode, where the
    // relaxed status gate above would otherwise let a redundant second copy through.
    if (ctx.stallMode) {
        if (SELF_PROTECT_MOVES.has(move.id) && currentMoves.some(m => SELF_PROTECT_MOVES.has(m.id))) return 0;
        if (isPhazingMove(move) && currentMoves.some(m => isPhazingMove(m))) return 0;
    }

    // Don't pick boosting moves of unused stats
    if (
        (
            atkBoostinEffects.includes(move.effect)
            && !currentMoves.some(m => m.category === 'DAMAGE_CATEGORY_PHYSICAL')
        ) || (
            spaBoostinEffects.includes(move.effect)
            && !currentMoves.some(m => m.category === 'DAMAGE_CATEGORY_SPECIAL')
        )
    ) {
        return 0;
    }

    const antiComboIndex = antiComboList.findIndex(antiCombo => antiCombo.includes(move.id));
    if (antiComboIndex >= 0
        && currentMoves.some(m => antiComboList[antiComboIndex].includes(m.id))
    ) {
        return 0;
    }

    // T-159 — a target can only ever carry ONE non-volatile status, so a set never runs two status-
    // infliction moves (Toxic + Will-O-Wisp, Thunder Wave + Spore, …). Keep only the first.
    if (STATUS_INFLICTION_EFFECTS.has(move.effect)
        && currentMoves.some(m => STATUS_INFLICTION_EFFECTS.has(m.effect))
    ) {
        return 0;
    }

    if (
        selfDamagingEffects.includes(move.effect)
        && item === 'Focus Sash'
    ) {
        return 0;
    }

    const hasAbility = (abilityToQuery) => {
        return ability === abilityToQuery || (!ability && poke.parsedAbilities.includes(abilityToQuery));
    }

    // T-013: weather context — active if THIS mon sets it (own ability/move, incl. the self-only
    // primals Desolate Land / Primordial Sea) OR an EARLIER teammate does (ctx.* from the build loop;
    // lingering setters only — primals are own-only there). Drives Solar Beam/Blade, Electro Shot,
    // Weather Ball, Growth, Thunder, Blizzard and Aurora Veil. Own weather-move detection is
    // best-effort (only sees moves already on the set — same ordering caveat as Sunny Day).
    const inSun  = hasAbility('DROUGHT') || hasAbility('ORICHALCUM_PULSE') || hasAbility('DESOLATE_LAND')
        || currentMoves.some(m => m.id === 'MOVE_SUNNY_DAY') || ctx.sun === true;
    const inRain = hasAbility('DRIZZLE') || hasAbility('PRIMORDIAL_SEA')
        || currentMoves.some(m => m.id === 'MOVE_RAIN_DANCE') || ctx.rain === true;
    const inSnow = hasAbility('SNOW_WARNING')
        || currentMoves.some(m => m.id === 'MOVE_HAIL' || m.id === 'MOVE_SNOWSCAPE') || ctx.snow === true;
    const inSand = hasAbility('SAND_STREAM')
        || currentMoves.some(m => m.id === 'MOVE_SANDSTORM') || ctx.sand === true;

    // T-125 — TERRAIN context, same shape as weather above: active if THIS mon sets it (own Surge ability /
    // Hadron Engine / terrain move) OR an EARLIER teammate does (ctx.* from the build loop). Drives the
    // terrain-scaling attacking moves below (Rising Voltage / Psyblade under electric, Expanding Force under
    // psychic, Misty Explosion under misty, Grassy Glide under grassy, Terrain Pulse + Steel Roller under any).
    // Format-agnostic (singles + doubles) — a surger anywhere on the team switches these on.
    const inElectricTerrain = hasAbility('ELECTRIC_SURGE') || hasAbility('HADRON_ENGINE')
        || currentMoves.some(m => m.id === 'MOVE_ELECTRIC_TERRAIN') || ctx.electricTerrain === true;
    const inGrassyTerrain = hasAbility('GRASSY_SURGE')
        || currentMoves.some(m => m.id === 'MOVE_GRASSY_TERRAIN') || ctx.grassyTerrain === true;
    const inPsychicTerrain = hasAbility('PSYCHIC_SURGE')
        || currentMoves.some(m => m.id === 'MOVE_PSYCHIC_TERRAIN') || ctx.psychicTerrain === true;
    const inMistyTerrain = hasAbility('MISTY_SURGE')
        || currentMoves.some(m => m.id === 'MOVE_MISTY_TERRAIN') || ctx.mistyTerrain === true;
    const inAnyTerrain = inElectricTerrain || inGrassyTerrain || inPsychicTerrain || inMistyTerrain;

    const maxOff = Math.max(poke.baseAttack, poke.baseSpAttack);
    const avgBulk = (poke.baseHP + poke.baseDefense + poke.baseSpDefense) / 3;
    const offRatio = maxOff / avgBulk;
    const offensiveness = Math.max(0, Math.min(1, (offRatio - 0.7) / 1.0));

    // Toxic Debris renders Toxic Spikes redundant (ability auto-lays them on contact)
    if (move.id === 'MOVE_TOXIC_SPIKES' && hasAbility('TOXIC_DEBRIS')) {
        return 0;
    }

    // Max 1 opponent-stat-lowering move per set
    const isStatDrop = OPPONENT_STAT_DROP_EFFECTS.has(move.effect);
    const hasStatDrop = currentMoves.some(m => OPPONENT_STAT_DROP_EFFECTS.has(m.effect));
    if (isStatDrop && hasStatDrop) return 0;

    // Stat-lowering and setup moves are mutually exclusive for offensive Pokémon.
    // Defensive Pokémon (offRatio ≤ 1.2) may combine both strategies.
    const isSetupMove = antiComboList[2].includes(move.id) || move.effect === 'EFFECT_SPEED_UP_2';
    const hasSetupMove = currentMoves.some(m => antiComboList[2].includes(m.id) || m.effect === 'EFFECT_SPEED_UP_2');
    if (isStatDrop && hasSetupMove && offRatio > 1.2) return 0;
    if (isSetupMove && hasStatDrop && offRatio > 1.2) return 0;

    let rating = move.rating;

    // T-159 — fixed-damage moves ignore the user's offensive stats and type (no STAB, no offense
    // scaling); keep their flat rating so they stay viable on low-offense stallers.
    const isFixedDamage = FIXED_DAMAGE_EFFECTS.includes(move.effect);

    // Fix 7: second status move on an offensive Pokémon is penalised
    if (move.category === 'DAMAGE_CATEGORY_STATUS') {
        const hasStatusMove = currentMoves.some(m => m.category === 'DAMAGE_CATEGORY_STATUS');
        if (hasStatusMove && offRatio > 1.2) {
            rating *= Math.max(0.15, 1 - (offRatio - 1.2) / 0.8);
        }
    }

    // Combos
    let comboActivated = false;
    const comboIndex = comboList.findIndex(combo => combo.effects.includes(move.effect));
    if (comboIndex >= 0) {
        const combo = comboList[comboIndex];
        if (currentMoves.some(m => combo.effects.includes(m.effect) && m.id !== move.id)) {
            rating = combo.rating;
            comboActivated = true;
        }
    }

    // Fix 1: Endure is only useful with a combo partner (Flail / Reversal / Endeavor)
    if (move.effect === 'EFFECT_ENDURE') {
        const comboPartnerEffects = new Set(['EFFECT_FLAIL', 'EFFECT_REVERSAL', 'EFFECT_ENDEAVOR']);
        const hasPartner = [...currentMoves, ...otherMoves].some(m => comboPartnerEffects.has(m.effect));
        if (!hasPartner) return 0;
    }

    // Fix 2: Dream Eater is worthless without a sleep move in the moveset or learnable pool
    if (move.id === 'MOVE_DREAM_EATER') {
        const sleepMoveIds = new Set([
            'MOVE_SLEEP_POWDER', 'MOVE_SPORE', 'MOVE_HYPNOSIS',
            'MOVE_GRASS_WHISTLE', 'MOVE_SING', 'MOVE_LOVELY_KISS',
            'MOVE_YAWN', 'MOVE_DARK_VOID',
        ]);
        const allMoves = [...currentMoves, ...otherMoves];
        if (!allMoves.some(m => sleepMoveIds.has(m.id))) return 0;
        return allMoves.some(m => m.id === 'MOVE_SPORE') ? 8 : 7;
    }

    // Special Ratings
    // T-013: weather-conditional utility / accuracy moves (magnitudes provisional — see task).
    // (Aurora Veil is finalised at the very end so its 0/10 isn't nudged by downstream bonuses.)
    if (move.id === 'MOVE_GROWTH' && inSun) {
        rating = 8;                          // +2 Atk / +2 SpA in sun ≈ Swords Dance / Nasty Plot
    }
    if (move.id === 'MOVE_THUNDER' && inRain) {
        rating += (100 - (move.accuracy || 100)) / 10;   // 100% accurate in rain (undo the acc penalty)
    }
    if (move.id === 'MOVE_BLIZZARD' && inSnow) {
        rating += (100 - (move.accuracy || 100)) / 10;   // 100% accurate in snow
    }
    // T-125 — terrain-scaling attacking moves (magnitudes provisional, mirroring the weather moves above).
    // Each is boosted ONLY under its terrain (a teammate's Surge counts via ctx.*). Steel Roller FAILS with
    // no terrain up, so it's worthless off-terrain.
    if (move.id === 'MOVE_RISING_VOLTAGE' && inElectricTerrain) rating *= 1.8;   // 70→140 vs a grounded target
    if (move.id === 'MOVE_PSYBLADE' && inElectricTerrain) rating *= 1.5;         // 80→120 in electric terrain
    if (move.id === 'MOVE_EXPANDING_FORCE' && inPsychicTerrain) rating *= 1.6;   // 80→120 + hits both foes (doubles)
    if (move.id === 'MOVE_MISTY_EXPLOSION' && inMistyTerrain) rating *= 1.5;     // 100→150 in misty terrain
    if (move.id === 'MOVE_GRASSY_GLIDE' && inGrassyTerrain) rating *= 1.4;       // gains +1 priority in grassy terrain
    if (move.id === 'MOVE_TERRAIN_PULSE' && inAnyTerrain) rating *= 1.9;         // 50→100 + becomes the terrain's type
    if (move.id === 'MOVE_STEEL_ROLLER' && !inAnyTerrain) rating = 0;            // fails when no terrain is up
    if (move.id === 'MOVE_MAGNETIC_FLUX' && (hasAbility('PLUS') || hasAbility('MINUS'))) {
        rating = 8;
    }
    if (move.id === 'MOVE_GEAR_UP' && (hasAbility('PLUS') || hasAbility('MINUS'))) {
        rating = 6.5;
    }
    if ((move.id === 'MOVE_STUFF_CHEEKS' || move.id === 'MOVE_TEATIME') && (hasAbility('GLUTTONY') || hasAbility('HARVEST'))) {
        if (!item) {
            rating = 7;
        } else if (item.includes('Berry')) {
            rating = 9;
        } else {
            rating = 0;
        }
        if (move.id === 'MOVE_TEATIME') {
            rating = Math.max(0, rating - 1);
        }
    }

    if (move.effect === 'EFFECT_SPEED_UP_2') {
        const spd = poke.baseSpeed;
        // Valuable only for high-offense mid-speed Pokémon (sweet spot ~45–85 speed)
        const offScore = Math.max(0, (maxOff - 85) / 85);
        const spdScore = (spd >= 45 && spd <= 85) ? (1 - Math.abs(spd - 65) / 60) : 0;
        rating = 7 * offScore * spdScore;
    }

    // Fix 5: Focus Energy only valuable with a crit-enhancing ability, item, or move
    if (move.id === 'MOVE_FOCUS_ENERGY' || move.id === 'MOVE_LASER_FOCUS') {
        const hasCritAbility = ability === 'SNIPER' || ability === 'SUPER_LUCK';
        const hasCritItem = item === 'Razor Claw' || item === 'Scope Lens';
        const hasCritMove = [...currentMoves, ...otherMoves]
            .some(m => highCritMoves.includes(m.id) || superCritMoves.includes(m.id));
        if (!hasCritAbility && !hasCritItem && !hasCritMove) return 0;
    }

    if (Object.keys(specialScalingMoves).includes(move.id)) {
        const scalingStat = specialScalingMoves[move.id];
        if (scalingStat === 'hp') {
            // Counter/Mirror Coat: damage = 2× hit received; HP is a proxy for survivability to use it.
            rating += poke.baseHP / 100;
        } else if (scalingStat === '-speed') {
            // Gyro Ball: slower user → higher power. Cap floor at 0.1 so it's never zero-rated.
            rating *= Math.max(0.1, (200 - poke.baseSpeed) / 100);
        } else if (scalingStat === 'speed') {
            // Electro Ball: faster user → higher power.
            rating *= poke.baseSpeed / 100;
        } else if (scalingStat === 'weight') {
            rating += Math.min(poke.weight / 100, 2);
        } else if (scalingStat === 'defense') {
            // Body Press uses Defense as the attacking stat in the damage formula.
            rating *= poke.baseDefense / 100;
        } else if (scalingStat === 'defvsatk') {
            const maxDefPlusHp = Math.max(poke.baseDefense + poke.baseHP, poke.baseSpDefense + poke.baseHP) / 2;
            const maxAtk = Math.max(poke.baseAttack, poke.baseSpAttack);
            rating += maxDefPlusHp / maxAtk;
        } else if (scalingStat === 'counter-bulk') {
            // Counter: damage = 2× physical hit received; bulk (HP + Def) determines how often it fires.
            rating = (poke.baseHP + poke.baseDefense) / 60;
        } else if (scalingStat === 'mirror-bulk') {
            // Mirror Coat: same principle using special bulk.
            rating = (poke.baseHP + poke.baseSpDefense) / 60;
        }
    }
    else if (isFixedDamage) {
        // T-159 — attack-independent: keep the flat rating from rateMove (no offense scaling).
    }
    else if (move.category === 'DAMAGE_CATEGORY_PHYSICAL') {
        rating *= poke.baseAttack / 100;
    }
    else if (move.category === 'DAMAGE_CATEGORY_SPECIAL') {
        rating *= poke.baseSpAttack / 100;
    }
    // Status moves value defenses (except setup, which need to be evaluated differently @TODO)
    else {
        rating += (poke.baseHP + poke.baseDefense + poke.baseSpDefense) / 300;
    }

    // Fix 6: opponent-stat-drop moves are a poor fit on offensive Pokémon
    if (OPPONENT_STAT_DROP_EFFECTS.has(move.effect) && offRatio > 1.2) {
        rating *= Math.max(0.1, 1 - (offRatio - 1.2) / 0.8);
    }

    if (move.category !== 'DAMAGE_CATEGORY_STATUS' && !isFixedDamage) {
        let stab = poke.parsedTypes.includes(move.type) ? 1.5 : 1.0;
        if (hasAbility('ADAPTABILITY')) {
            stab = 2.0;
        }
        rating *= stab;

        if (hasAbility('TECHNICIAN') && move.power <= 60) {
            rating *= 1.5;
        }

        if (hasAbility('SKILL_LINK') && move.effect && move.effect.includes('EFFECT_MULTI_HIT')) {
            rating *= 2.5;
        } else if (move.effect && move.effect.includes('EFFECT_MULTI_HIT') && item === 'Loaded Dice') {
            rating *= 2;
        }

        const gemRegex = /^ITEM_(\w+)_GEM$/;
        if (item) {
            const match = item.match(gemRegex);
            if (match) {
                const gemType = match[1];
                if (gemType === move.type) {
                    rating *= 1.3;
                }
            }
        }

        if (item === 'Expert Belt') {
            rating *= 1.15;
        }

        if (item === 'Life Orb') {
            rating *= 1.3;
        }

        if (item === 'Choice Band' && move.category === 'DAMAGE_CATEGORY_PHYSICAL') {
            rating *= 1.5;
        }

        if (item === 'Choice Specs' && move.category === 'DAMAGE_CATEGORY_SPECIAL') {
            rating *= 1.5;
        }

        // If we have a boosting move, rate better same stat moves
        const hasAtkBoostingMove = otherMoves.some(m => atkBoostinEffects.includes(m.effect));
        const hasSpaBoostingMove = otherMoves.some(m => spaBoostinEffects.includes(m.effect));

        if (hasAtkBoostingMove && move.category === 'DAMAGE_CATEGORY_PHYSICAL') {
            rating *= 1.5;
        }

        if (hasSpaBoostingMove && move.category === 'DAMAGE_CATEGORY_SPECIAL') {
            rating *= 1.5;
        }

        // Fix 3: once a ≥+1 priority move is already selected, strip the priority bonus from
        // additional priority candidates. Fake Out (EFFECT_FIRST_TURN_ONLY) is exempt — it is a
        // unique flinch-on-turn-1 effect, not just speed.
        const hasPriorityMove = currentMoves.some(m =>
            (m.priority || 0) >= 1 && m.effect !== 'EFFECT_FIRST_TURN_ONLY'
        );
        const isFirstTurnOnly = move.effect === 'EFFECT_FIRST_TURN_ONLY';
        if (hasPriorityMove && !isFirstTurnOnly && (move.priority || 0) >= 1) {
            rating -= (move.priority || 0);
        }

        // Fix 4: reward moves that break type immunities or resistances in the current moveset
        const currentDmg = currentMoves.filter(m => m.category !== 'DAMAGE_CATEGORY_STATUS');
        let coverageBonus = 0;
        if (currentDmg.length > 0) {
            for (const defType of Object.keys(typeChart)) {
                const bestCurrentMult = Math.max(...currentDmg.map(m => damageMultiplier(m.type, [defType])));
                const candidateMult = damageMultiplier(move.type, [defType]);
                if (candidateMult <= bestCurrentMult) continue;
                let bonus = 0;
                if (bestCurrentMult === 0)        bonus = 3.0 * offensiveness + 0.5;
                else if (bestCurrentMult <= 0.25) bonus = 1.5 * offensiveness + 0.2;
                else if (bestCurrentMult <= 0.5)  bonus = 0.4 * offensiveness;
                coverageBonus = Math.max(coverageBonus, bonus);
            }
            rating += coverageBonus;
        }

        // Fix 8: non-STAB Normal moves add no type coverage once the moveset already has a
        // damage move. The only exemption is when Normal genuinely breaks a type immunity the
        // current set can't reach (coverageBonus ≥ 0.5, from the immunity tier of Fix 4).
        // Combo payoffs (Endure+Flail) and Normal-type STAB are also exempt.
        if (
            move.type === 'NORMAL'
            && !poke.parsedTypes.includes('NORMAL')
            && (move.priority || 0) === 0
            && !comboActivated
            && currentDmg.length >= 1
            && coverageBonus < 0.5
        ) {
            rating *= 0.5;
        }

        // If another damaging move of the same type exists, devalue this move.
        // Whitelisted moves have a distinct textbox niche (priority, drain, item removal, conditional
        // power) so they receive a lighter 0.6× penalty instead of the standard 0.3×.
        if (currentMoves.some(m => m.category !== 'DAMAGE_CATEGORY_STATUS' && m.type === move.type)) {
            rating *= sameTypeLowerPenaltyMoves.includes(move.id) ? 0.6 : 0.3;
        }
    }

    // T-013: two-turn / charge moves (Solar Beam, Sky Attack, Fly, Dig, …) waste the first turn
    // unless the holder can skip it. Heavily devalue them UNLESS holding a Power Herb; Solar Beam /
    // T-013: charge & weather-conditional damage-move heuristics (magnitudes provisional — see task).
    // The base rating already halved two-turn moves (rateMove ×0.5); the ×2.x factors below restore
    // ~full power when the enabler is present. T-159: when the enabler is ABSENT the move should land at
    // ~40% of its 1-turn value, not the old ~10-20% — punishing but still on the table (owner: at the
    // old floor the penalty "no se refleja en la experiencia"). The base rating already carries the
    // charge penalty (rateMove: two-turn ×0.5, Solar Beam ×0.8, semi-invulnerable ×0.7), so the
    // no-enabler factors below are chosen to make base×factor ≈ 0.40 of full: 0.5 (Solar, 0.8 base),
    // 0.8 (two-turn, 0.5 base), 0.57 (semi-invuln, 0.7 base). The unusable-move removal itself happens
    // in the consolidation pass (adjustMoveset) once the held item is known — see resolveTrainerTeam.
    // - Solar Beam / Blade: good in sun (own or earlier-teammate Drought/Orichalcum/Sunny Day, own
    //   Desolate Land) or with a Power Herb (held or in the bag).
    // - Meteor Beam: premium with a Power Herb available (held or in the bag).
    // - Electro Shot: in rain it's instant — MUY PREMIUM; otherwise treat like Meteor Beam (Power Herb).
    // - Geomancy: instant +2/+2/+2 with a Power Herb, special-only (Ubers+); else a weak slow setup.
    // - Weather Ball: in any weather it's a 100-power move of that weather's type (+STAB if shared).
    // - Every other two-turn / semi-invulnerable move (Dig, Fly, Sky Attack, …) wants a Power Herb.
    // herbReady honours both a held Power Herb and one sitting in the bag, uniformly across every charge
    // move (T-159 fixes the old inconsistency where Solar Beam / generic two-turn ignored the bag herb).
    const herbReady = item === 'Power Herb' || ctx.powerHerb === true;
    if (move.id === 'MOVE_SOLAR_BEAM' || move.id === 'MOVE_SOLAR_BLADE') {
        rating *= (herbReady || inSun) ? 2.4 : 0.5;
    } else if (move.id === 'MOVE_METEOR_BEAM') {
        rating *= herbReady ? 2.6 : 0.8;
    } else if (move.id === 'MOVE_ELECTRO_SHOT') {
        rating *= inRain ? 3.0 : (herbReady ? 2.6 : 0.8);
    } else if (move.id === 'MOVE_GEOMANCY') {
        const special = [TIER_UBERS, TIER_AG, TIER_LEGEND].includes(poke.rating && poke.rating.tier);
        rating = (herbReady && special) ? 9 : rating * 0.2;
    } else if (move.id === 'MOVE_WEATHER_BALL') {
        const wType = inSun ? 'FIRE' : inRain ? 'WATER' : inSnow ? 'ICE' : inSand ? 'ROCK' : null;
        if (wType) rating = poke.parsedTypes.includes(wType) ? 10.5 : 7;
    } else if (move.effect === 'EFFECT_TWO_TURNS_ATTACK') {
        rating *= herbReady ? 2.0 : 0.8;
    } else if (move.effect === 'EFFECT_SEMI_INVULNERABLE') {
        rating *= herbReady ? 2.0 : 0.57;
    }

    // T-013: Aurora Veil — finalised here (after any downstream bonuses) so it's exactly 0 without
    // snow on the team and 10 with it.
    if (move.id === 'MOVE_AURORA_VEIL') rating = inSnow ? 10 : 0;

    // T-013 / T-159: Belch can only fire after the holder eats a Berry. On a berryless mon it never
    // works, so it is a hard 0 — never taught to a mon without a berry. The consolidation pass
    // (adjustMoveset, run once the held item is final) drops it if the mon ends up berryless.
    if (move.effect === 'EFFECT_BELCH' && !(typeof item === 'string' && / Berry$/.test(item))) {
        rating = 0;
    }

    // T-159(A) — partial-trap / chip moves (Whirlpool, Sand Tomb, Infestation, Salt Cure) get no credit
    // from raw power for their real job: pinning the foe in while residual damage ticks. That "cover the
    // stall role" value is worth much more to a defensive mon prolonging the game, and more still when
    // the set already carries residual chip (Toxic / Leech Seed / Will-O-Wisp / hazards / another trap).
    // Salt Cure (2×/turn vs Water & Steel) earns the larger base. This is role-specific, not global.
    if (isTrappingMove(move)) {
        const defensiveness = Math.max(0, Math.min(1.5, 1.8 - offRatio));
        const isSaltCure = move.additionalEffects.includes('MOVE_EFFECT_SALT_CURE');
        const hasResidual = [...currentMoves, ...otherMoves].some(m =>
            STALL_STATUS_MOVES.has(m.id) || hazardSetMoves.has(m.id) || isTrappingMove(m));
        let trapBonus = (isSaltCure ? 2.5 : 1.5) * defensiveness;
        if (hasResidual) trapBonus += 1.0 * defensiveness;
        if (ctx.stallMode) trapBonus += 1.0;
        rating += trapBonus;
    }

    // T-159(B) — a committed pure staller builds around the stall kit, not its weak (tier-deficient)
    // attacks. Boost the kit so it fills the set over token offence, and demote every attack after the
    // first so the staller keeps at most one damage move (its chip) and fills the rest with utility.
    // ctx.stallMode is set once per mon by chooseMoveset / adjustMoveset.
    if (ctx.stallMode) {
        if (isStallTool(move, ctx.doubles)) {
            rating *= STALL_TOOL_BOOST;
        }
        if (move.category !== 'DAMAGE_CATEGORY_STATUS'
            && currentMoves.some(m => m.category !== 'DAMAGE_CATEGORY_STATUS')) {
            rating *= STALL_EXTRA_ATTACK_CUT;
        }
    }

    // @TODO move base rating + stab + ability synergy + other moves synergy, coverage
    return rating;
}

function rateItemForAPokemon(item, poke, ability, moveset, level, bagSize, deviation = 0, doubles = false) {
    // T-147 — an offensive DOUBLES mon values anti-support tech much more (Safety Goggles vs Rage Powder
    // redirection + Spore/powder; Covert Cloak vs Fake Out + secondary effects). A dedicated support doesn't
    // get this bump. `doubles` threads from the trainer's battleType at the call site.
    const doublesOffense = doubles && !(poke && poke.isSupportDoubles);
    const itemId = 'ITEM_' + item.replace(/ /, '_').toUpperCase();
    const bestOffensePowerWithSpeed = (Math.max(poke.baseAttack, poke.baseSpAttack) + poke.baseSpeed)/200;
    const bestOffensePower = Math.max(poke.baseAttack, poke.baseSpAttack)/100;
    const specialOffensePower = poke.baseSpAttack/100;
    const physicalOffensePower = poke.baseAttack/100;
    const speedPower = poke.baseSpeed/100;
    const genericDefensePower = (poke.baseDefense + poke.baseSpDefense + poke.baseHP)/300;
    const physicalDefensePower = Math.max(poke.baseDefense + poke.baseHP)/200;
    const specialDefensePower = Math.max(poke.baseSpDefense + poke.baseHP)/200;
    let coverageRating = 0;
    const checkedTypes = [];
    const calculatedDeviation = 1 + ((rng.random() ? 1 : -1) * rng.random() * deviation);
    moveset.forEach(move => {
        if (move.category !== 'DAMAGE_CATEGORY_STATUS' && !checkedTypes.includes(move.type)) {
            checkedTypes.push(move.type);
            coverageRating += 2.5;
        }
    });

    // T-129 — items respect roles. A Choice item locks the holder into the first move it uses, so it must
    // NEVER go on a mon whose set carries a move it can't be locked into: any STATUS move (hazards / setup /
    // status / recovery) or a REACTIVE damaging move (Counter / Mirror Coat / Metal Burst). Mirrors the
    // Assault Vest rule below (0 with any status move). Damaging pivots (U-turn / Volt Switch / Flip Turn)
    // are fine — they switch the holder out, which unlocks it. Without this, a strong attacker was scored
    // Choice-first even with Stealth Rock / Metal Burst in its set (Champion Steven's Solgaleo).
    if (item === 'Choice Band' || item === 'Choice Specs' || item === 'Choice Scarf') {
        const reactiveEffects = ['EFFECT_COUNTER', 'EFFECT_MIRROR_COAT', 'EFFECT_METAL_BURST'];
        const cannotBeLockedInto = moveset.some(m =>
            m.category === 'DAMAGE_CATEGORY_STATUS' || reactiveEffects.includes(m.effect));
        if (cannotBeLockedInto) return 0;
    }
    if (item === 'Choice Band') {
        return 9 * Math.max(1, physicalOffensePower) * speedPower / specialOffensePower * calculatedDeviation;
    }
    if (item === 'Choice Specs') {
        return 9 * Math.max(1, specialOffensePower) * speedPower / physicalOffensePower * calculatedDeviation;
    }
    if (item === 'Choice Scarf') {
        return 10 * bestOffensePower * Math.max(1, speedPower) * calculatedDeviation;
    }
    const hasGuts = ability === 'GUTS';
    const hasFacade = moveset.some(m => m.id === 'MOVE_FACADE');
    const hasQuickFeet = ability === 'QUICK_FEET';
    const hasToxicBoost = ability === 'TOXIC_BOOST';
    const hasPoisonHeal = ability === 'POISON_HEAL';
    const hasComatose = ability === 'COMATOSE';
    const hasInsomniaAndSuch = ability === 'INSOMNIA' || ability === 'VITAL_SPIRIT' || ability === 'SLEEPYTIME' || ability === 'EARLY_BIRD';
    if (item === 'Flame Orb') {
        if (hasFacade && (hasGuts || hasQuickFeet)) {
            return 10 * physicalOffensePower * calculatedDeviation;
        }
        if (hasGuts || hasFacade) {
            return 9 * physicalOffensePower * calculatedDeviation;
        }
        if (hasQuickFeet) {
            return 8 * bestOffensePowerWithSpeed * calculatedDeviation;
        }
        return 0;
    }
    if (item === 'Toxic Orb') {
        if (hasPoisonHeal) {
            return 10 * genericDefensePower * calculatedDeviation;
        }
        if (hasFacade && hasToxicBoost) {
            return 10 * physicalOffensePower * calculatedDeviation;
        }
        if (hasToxicBoost || (hasFacade && (hasGuts || hasQuickFeet))) {
            return 9 * physicalOffensePower * calculatedDeviation;
        }
        if (hasGuts || hasFacade) {
            return 8 * physicalOffensePower * calculatedDeviation;
        }
        if (hasQuickFeet) {
            return 7 * bestOffensePowerWithSpeed * calculatedDeviation;
        }
        return 0;
    }
    if (item === 'Eviolite') {
        if (poke.evolutionData.isNFE) {
            return 15 * calculatedDeviation;
        }
        return 0;
    }
    const hasProtosynthesis = ability === 'PROTOSYNTHESIS';
    const hasQuarkDrive = ability === 'QUARK_DRIVE';
    if (item === 'Booster Energy') {
        if (hasProtosynthesis || hasQuarkDrive) {
            return 10 * bestOffensePowerWithSpeed * calculatedDeviation;
        }
        return 0;
    }
    if (item === 'Damp Rock' || item === 'Heat Rock' || item === 'Icy Rock' || item === 'Smooth Rock' || item === 'Terrain Extender') {
        // @TODO For now these won't be used
        return 0;
    }
    const isElectricSurge = ability === 'ELECTRIC_SURGE';
    const isGrassySurge = ability === 'GRASSY_SURGE';
    const isMistySurge = ability === 'MISTY_SURGE';
    const isPsychicSurge = ability === 'PSYCHIC_SURGE';
    if (item === 'Electric Seed') {
        if (isElectricSurge) {
            return 10 * physicalDefensePower * calculatedDeviation;
        }
        else {
            return 0;
        }
    }
    if (item === 'Grassy Seed') {
        if (isGrassySurge) {
            return 10 * physicalDefensePower * calculatedDeviation;
        }
        else {
            return 0;
        }
    }
    if (item === 'Misty Seed') {
        if (isMistySurge) {
            return 10 * specialOffensePower * calculatedDeviation;
        }
        else {
            return 0;
        }
    }
    if (item === 'Psychic Seed') {
        if (isPsychicSurge) {
            return 10 * specialOffensePower * calculatedDeviation;
        }
        else {
            return 0;
        }
    }
    const hasReflect = moveset.some(m => m.id === 'MOVE_REFLECT');
    const hasLightScreen = moveset.some(m => m.id === 'MOVE_LIGHT_SCREEN');
    const hasAuroraVeil = moveset.some(m => m.id === 'MOVE_AURORA_VEIL');
    if (item === 'Light Clay') {
        if ((hasReflect && hasLightScreen) || hasAuroraVeil) {
            return 10 * genericDefensePower * calculatedDeviation;
        }
        if (hasReflect || hasLightScreen) {
            return 9.5 * genericDefensePower * calculatedDeviation;
        }
        return 0;
    }
    const hasShellSmash = moveset.some(m => m.id === 'MOVE_SHELL_SMASH');
    if (item === 'White Herb') {
        if (hasShellSmash) {
            return 10 * bestOffensePowerWithSpeed * calculatedDeviation;
        }
        const hasWhiteHerbMove = moveset.some(m => whiteHerbMoves.includes(m.id));
        if (hasWhiteHerbMove) {
            return 8 * bestOffensePowerWithSpeed * calculatedDeviation;
        }
        return 0;
    }
    if (item === 'Power Herb') {
        const hasGeomancy = moveset.some(m => m.id === 'MOVE_GEOMANCY');
        if (hasGeomancy) {
            return 10 * specialOffensePower * calculatedDeviation;
        }
        const hasPowerHerbMove = moveset.some(m => powerHerbMoves.includes(m.id));
        if (hasPowerHerbMove) {
            return 8 * specialOffensePower * calculatedDeviation;
        }
        return 0;
    }
    if (item === 'Rocky Helmet') {
        if (ability === 'ROUGH_SKIN' || ability === 'IRON_BARBS') {
            return 9.5 * genericDefensePower * calculatedDeviation;
        }
        return 8 * physicalDefensePower * calculatedDeviation;
    }
    if (item === 'Black Sludge') {
        if (poke.parsedTypes.includes(POKEMON_TYPE_POISON)) {
            return 9.5 * genericDefensePower * calculatedDeviation;
        }
        return 0;
    }
    if (item === 'Punching Glove') {
        const hasPunchingMove = moveset.some(m => punchingMoves.includes(m.id));
        if (hasPunchingMove) {
            return 7 * physicalOffensePower * calculatedDeviation;
        }
        return 0;
    }
    if (item === 'Big Root') {
        const pokeHealingMoves = moveset.filter(m => healingMoves.includes(m.id));
        if (pokeHealingMoves.length === 0) {
            return 0;
        }
        let bestHealingMove = 0;
        pokeHealingMoves.forEach(m => {
            bestHealingMove = Math.max(bestHealingMove, m.rating);
        });
        return (5 + bestHealingMove*0.2) * genericDefensePower * calculatedDeviation;
    }
    if (item === 'Assault Vest') {
        for (const move of moveset) {
            if (move.category === 'DAMAGE_CATEGORY_STATUS') {
                return 0;
            }
        }
        return 9 * genericDefensePower * calculatedDeviation;
    }
    if (item === 'Leftovers') {
        return 9.5 * genericDefensePower * calculatedDeviation;
    }
    if (item === 'Life Orb') {
        const hasMagicGuard = ability === 'MAGIC_GUARD';
        if (hasMagicGuard) {
            return 9.5 * bestOffensePowerWithSpeed * calculatedDeviation;
        }
        return 8.5 * bestOffensePowerWithSpeed * calculatedDeviation;
    }
    if (item === 'Focus Sash') {
        if (hasShellSmash) {
            return 10 * bestOffensePowerWithSpeed / genericDefensePower * calculatedDeviation;
        }
        const hasSelfDamagingMove = moveset.some(m => selfDamagingEffects.includes(m.effect));
        if (hasSelfDamagingMove) {
            return 0;
        }
        return 8.5 * bestOffensePowerWithSpeed / genericDefensePower * calculatedDeviation;
    }
    if (item === 'Shell Bell') {
        return 7 * bestOffensePower * calculatedDeviation;
    }
    if (item === 'Expert Belt') {
        return coverageRating * 0.75 * bestOffensePower * calculatedDeviation;
    }
    if (item === 'Heavy-Duty Boots') {
        const rockDamageMultiplier = damageMultiplier('ROCK', poke.parsedTypes);
        return 5 * calculatedDeviation + (1 - rockDamageMultiplier) * 2;
    }
    if (item === 'Throat Spray') {
        const soundMoves = moveset.filter(m => soundBasedOffensiveMoves.includes(m.id));
        if (soundMoves.length === 0) {
            return 0;
        }
        const bestSoundMoveRating = Math.max(...soundMoves.map(m => m.rating));
        return (8 + bestSoundMoveRating)/2 * specialOffensePower * calculatedDeviation;
    }
    if (item === 'Loaded Dice') {
        const multiHit = moveset.filter(m => multiHitMoves.includes(m.id));
        if (multiHit.length === 0 || ability === 'SKILL_LINK') {
            return 0;
        }
        const bestMultiHitMoveRating = Math.max(...multiHit.map(m => m.rating));
        return (8 + bestMultiHitMoveRating)/2 * bestOffensePower * calculatedDeviation;
    }
    if (item === 'Air Balloon') {
        if (ability === 'LEVITATE' || ability === 'EARTH_EATER') {
            return 0;
        }
        if (damageMultiplier('GROUND', poke.parsedTypes) > 1) {
            return 7.5 * calculatedDeviation;
        }
        return 0;
    }
    const hasSniper = ability === 'SNIPER';
    const hasSuperLuck = ability === 'SUPER_LUCK';
    const hasHighCritMove = highCritMoves.some(m => moveset.some(mm => mm.id === m));
    const hasFocusEnergy = moveset.some(m => m.id === 'MOVE_FOCUS_ENERGY');
    const hasLaserFocus = moveset.some(m => m.id === 'MOVE_LASER_FOCUS');
    const hasSuperCritMove = superCritMoves.some(m => moveset.some(mm => mm.id === m));
    if (item === 'Razor Claw') {
        let razorClawRating = 6;
        if (hasSniper || hasSuperLuck) razorClawRating += 2;
        if (hasHighCritMove) razorClawRating += 1;
        if (hasFocusEnergy) razorClawRating += 1;
        if (hasLaserFocus || hasSuperCritMove || razorClawRating === 6) return 0;
        return razorClawRating * bestOffensePowerWithSpeed * calculatedDeviation;
    }
    const hasHarvest = ability === 'HARVEST';
    const hasBelch = moveset.some(m => m.id === 'MOVE_BELCH');
    const hasCheekPouch = ability === 'CHEEK_POUCH';
    const hasCudChew = ability === 'CUD_CHEW';
    const hasRipen = ability === 'RIPEN';
    const hasNaturalGift = moveset.some(m => m.id === 'MOVE_NATURAL_GIFT');
    if (item === 'Sitrus Berry') {
        if (hasHarvest || hasBelch) {
            return 9.5 * genericDefensePower * calculatedDeviation;
        }
        if (hasCheekPouch || hasRipen || hasNaturalGift || hasCudChew) {
            return 8.5 * genericDefensePower * calculatedDeviation;
        }
        return 7.5 * genericDefensePower * calculatedDeviation;
    }
    if (item === 'Oran Berry') {
        let modifier = 0;
        if (hasHarvest || hasCudChew || hasRipen || hasNaturalGift)
        {
            modifier += 1;
        }
        if (hasCheekPouch) {
            modifier += 5;
        }
        if (hasBelch) {
            modifier += 2;
        }
        const trueHp = Math.floor((poke.baseHP * 2 * level) / 100) + level + 10;
        const minHPAtWhichRatingIsMax = 30;
        const ratingDevaluation = 5; // For each X extra HP, rating devalues by 1 point
        const baseHPNear10Rating = Math.max(0, Math.min(10, 10 - ((trueHp - minHPAtWhichRatingIsMax) / ratingDevaluation)));
        return baseHPNear10Rating * calculatedDeviation + modifier;
    }
    if (item === 'Lum Berry') {
        if (hasGuts || hasQuickFeet || hasFacade || hasToxicBoost || hasPoisonHeal || hasComatose || hasInsomniaAndSuch) {
            return 0;
        }
        if (hasCheekPouch || hasBelch || hasNaturalGift) {
            return 8 * calculatedDeviation;
        }
        return 7 * calculatedDeviation;
    }
    if (item === 'Chesto Berry') {
        if (hasComatose || hasInsomniaAndSuch) {
            return 0;
        }
        const hasRest = moveset.some(m => m.id === 'MOVE_REST');
        if (hasRest) {
            return 9 * genericDefensePower * calculatedDeviation;
        }
        return 2.5 * calculatedDeviation;
    }
    const isGrassType = poke.parsedTypes.includes(POKEMON_TYPE_GRASS);
    if (item === 'Safety Goggles') {
        if (hasInsomniaAndSuch || isGrassType) {
            return 0;
        }
        // T-147 — a big pick for an offensive doubles mon: immunity to Rage Powder redirection + Spore/powder.
        return (doublesOffense ? 8.5 : 5) * calculatedDeviation;
    }
    if (item === 'Covert Cloak') {
        // T-147 — blocks Fake Out (flinch) + added-effect disruption; premium anti-support tech in doubles,
        // marginal in singles.
        return (doublesOffense ? 7.5 : 2.5) * calculatedDeviation;
    }
    if (item === 'Jaboca Berry') {
        if (hasHarvest || hasCudChew || hasRipen || hasCheekPouch)
        {
            return 5 * calculatedDeviation;
        }
        if (hasBelch || hasNaturalGift) {
            return 7.5 * calculatedDeviation;
        }
        return 5 * calculatedDeviation;
    }
    if (item === 'Weakness Policy') {
        // T-159 — WP boosts Atk & SpAtk after a super-effective hit; it is dead weight on a mon with
        // no move that scales with those stats (a pure support, or fixed/reactive-only damage).
        if (!moveset.some(benefitsFromOffenseBoost)) return 0;
        return 10 * genericDefensePower * rng.random() * calculatedDeviation;
    }
    if (item === 'Eject Button') {
        return 10 * rng.random() * calculatedDeviation;
    }
    if (item === 'Red Card') {
        return 7 * rng.random() * calculatedDeviation;
    }
    if (item === 'Eject Pack') {
        return 2.5 * calculatedDeviation;
    }
    if (item === 'Shed Shell') {
        return 1 * calculatedDeviation;
    }
    if (item === 'Leppa Berry') {
        return 1 * calculatedDeviation;
    }
    const isSturdy = ability === 'STURDY';
    const hasEndure = moveset.some(m => m.id === 'MOVE_ENDURE');
    if (item === 'Custap Berry') {
        if (isSturdy || hasEndure) {
            return 7.5 * bestOffensePowerWithSpeed * calculatedDeviation;
        }
        return 4 * bestOffensePowerWithSpeed * calculatedDeviation;
    }
    if (item === 'Kee Berry') {
        return 6 * physicalDefensePower * calculatedDeviation;
    }
    if (item === 'Maranga Berry') {
        return 6 * specialDefensePower * calculatedDeviation;
    }
    if (item === 'Jaboca Berry') {
        return 6 * rng.random() * calculatedDeviation;
    }
    if (item === 'Rowap Berry') {
        return 6 * rng.random() * calculatedDeviation;
    }
    if (item === 'Mirror Herb') {
        return 7 * rng.random() * calculatedDeviation;
    }
    if (item === 'Adrenaline Orb') {
        return 5 * rng.random() * calculatedDeviation;
    }
    if (item.includes(' Berry')) {
        const protectionBerriesEntries = Object.entries(protectionBerries);
        for (const [berryType, berryId] of protectionBerriesEntries) {
            if (berryId === itemId) {
                let berryTypeDamageMultiplier = damageMultiplier(berryType, poke.parsedTypes);
                if (berryTypeDamageMultiplier > 1) {
                    if (hasCheekPouch) berryTypeDamageMultiplier += 1;
                    if (hasRipen) berryTypeDamageMultiplier *= 1.5;
                    return (5 + berryTypeDamageMultiplier) * genericDefensePower * calculatedDeviation;
                }
                return 0;
            }
        }
    }
    if (item.includes(' Gem')) {
        const gemType = item.split(' Gem')[0].toUpperCase();
        const stabExtra = poke.parsedTypes.includes(gemType) ? 0.5 : 0;
        for (const move of moveset) {
            if (move.category !== 'DAMAGE_CATEGORY_STATUS' && move.type === gemType) {
                if (move.id === 'MOVE_ACROBATICS' && gemType === 'FLYING') {
                    if (ability === 'UNBURDEN') {
                        return 9.1 * bestOffensePower * calculatedDeviation + stabExtra;
                    }
                    return 8 * bestOffensePower * calculatedDeviation + stabExtra;
                }
                return 5.5 * bestOffensePower * calculatedDeviation + stabExtra;
            }
        }
        return 0;
    }
    if (item.includes(' Plate')) {
        const plateType = plates[itemId];
        const stabExtra = poke.parsedTypes.includes(plateType) ? 0.5 : 0;
        // T-156 — a Multitype holder (Arceus) becomes the Plate's type and its Judgment becomes that
        // type too, so ANY Plate is effectively STAB coverage of plateType. Value it like a STAB
        // attacker (always the +0.5 STAB), plus a new-coverage bonus when the mon has no existing
        // damaging move of that type — so trainers favour a Plate that widens Arceus's coverage.
        if ((poke.parsedAbilities || []).includes(MULTITYPE_ABILITY) || (poke.id || '').startsWith('SPECIES_ARCEUS')) {
            const alreadyCovers = moveset.some(m => m.category !== 'DAMAGE_CATEGORY_STATUS' && m.type === plateType);
            const newCoverageBonus = alreadyCovers ? 0 : 1;
            return 5.5 * bestOffensePower * calculatedDeviation + 0.5 + newCoverageBonus;
        }
        for (const move of moveset) {
            if (move.category !== 'DAMAGE_CATEGORY_STATUS' && move.type === plateType) {
                return 5.5 * bestOffensePower * calculatedDeviation + stabExtra;
            }
        }
        return 0;
    }
    console.log(`Warning: Item ${item} not rated for ${poke.name}`);
    return calculatedDeviation;
}

// deviation is a value from 0 to 1 indicating how much randomness to add to the rating, so a
// trainer may have their own bias towards certain moves
// Recommanded value: 0.1
function chooseMoveset(poke, moves, level = 100, startingMoveset = [], ability = null, item = null, tmsInBag = null, deviation = 0, ctx = {}) {
    // T-159 — decide the stall archetype once per mon and thread it through ctx to every move rating.
    // (Left as-is if the caller already resolved it. Never fires during the tiering pass — poke.rating
    // isn't stamped yet there, so isPureStaller returns false and the neutral moveset is unaffected.)
    if (ctx.stallMode === undefined) {
        ctx = { ...ctx, stallMode: isPureStaller(poke, moves, level, ctx.doubles === true) };
    }
    const moveset = [...startingMoveset].map(move => moves[move] ? moves[move] : null).filter(m => m !== null);
    const tmsUsed = [];
    const tms = tmsInBag && Array.isArray(tmsInBag) ? poke.teachables.filter(tm => tmsInBag.includes(tm)) : poke.teachables;
    const allMoves = [
        ...poke.learnset.filter(ls => ls.level <= level).map(ls => ls.move),
        ...tms,
    ];
    let uniqueMoves = Array.from(new Set(allMoves)).map(moveId => {
        const move = moves[moveId];
        if (!move) {
            activeDiagnostics().warn(
                DIAGNOSTIC_CODES.MOVE_NOT_FOUND,
                `Move ${moveId} not found in the moves database for ${poke.name}`,
                { move: moveId, pokemon: poke.id || poke.name },
            );
            return null;
        }
        return {
            ...move,
            rating: rateMove(move),
        };
    }).filter(m => m !== null);

    // Zero-to-Hero (Palafin): the transform triggers on switch out, so a pivot/switch move is
    // always wanted. Force the best available pivot (by normal rating — STAB/stats) into the set
    // before the greedy fill, unless the starting moveset already has one. Keyed on the ability
    // (passed arg OR the poke's own abilities) so it applies both at placement and in the
    // rating-internal chooseMoveset(poke, moves) call.
    const hasZeroToHero = ability === 'ZERO_TO_HERO'
        || (poke.parsedAbilities || []).includes('ZERO_TO_HERO');
    let forcedPivotId = null;
    if (hasZeroToHero && moveset.length < 4 && !moveset.some(m => pivotingMoves.has(m.id))) {
        const pivotCandidates = uniqueMoves.filter(m => pivotingMoves.has(m.id));
        if (pivotCandidates.length > 0) {
            const bestPivot = pivotCandidates
                .map(move => ({ move, rating: rateMoveForAPokemon(move, poke, ability, item, uniqueMoves, moveset) }))
                .sort((a, b) => b.rating - a.rating)[0].move;
            moveset.push(bestPivot);
            forcedPivotId = bestPivot.id;
            uniqueMoves = uniqueMoves.filter(move => move.id !== bestPivot.id);
        }
    }

    // Meloetta (T-064): Meloetta switches Aria<->Pirouette in battle via Relic Song, so a trainer's
    // Meloetta should always carry it. Force Relic Song into the set before the greedy fill (like the
    // Zero-to-Hero pivot above) whenever the user is Meloetta and can learn it; protect it from the
    // A3 same-type dedup below. Relic Song is Special, so its normal move rating still applies — this
    // just guarantees the "strongly prioritize Relic Song when the user is Meloetta" behavior.
    let forcedMeloettaMoveId = null;
    const isMeloetta = poke.family === MELOETTA_FAMILY || (poke.id || '').startsWith('SPECIES_MELOETTA');
    if (isMeloetta && moveset.length < 4 && !moveset.some(m => m.id === MELOETTA_RELIC_SONG_ID)) {
        const relicSong = uniqueMoves.find(m => m.id === MELOETTA_RELIC_SONG_ID);
        if (relicSong) {
            moveset.push(relicSong);
            forcedMeloettaMoveId = relicSong.id;
            uniqueMoves = uniqueMoves.filter(move => move.id !== relicSong.id);
        }
    }

    // Arceus / Silvally / Multitype (T-156, T-158): a Multitype mon always carries its signature move
    // (Judgment for Arceus, Multi-Attack for Silvally). Holding a Plate turns that move into the plate's
    // type (its type-flex payoff), and it is at worst Normal STAB, so force in whichever the mon can learn
    // like Relic Song and protect it from the A3 same-type dedup below. Gated on the mon's abilities/id
    // (not `ability`, which is null on the rating-internal chooseMoveset call).
    let forcedSignatureMoveId = null;
    const isMultitype = (poke.parsedAbilities || []).includes(MULTITYPE_ABILITY)
        || (poke.id || '').startsWith('SPECIES_ARCEUS');
    if (isMultitype && moveset.length < 4 && !moveset.some(m => MULTITYPE_SIGNATURE_MOVES.includes(m.id))) {
        for (const sigId of MULTITYPE_SIGNATURE_MOVES) {
            const sig = uniqueMoves.find(m => m.id === sigId);
            if (sig) {
                moveset.push(sig);
                forcedSignatureMoveId = sig.id;
                uniqueMoves = uniqueMoves.filter(move => move.id !== sig.id);
                break;
            }
        }
    }

    while (uniqueMoves.length > 0 && moveset.length < 4) {
        const ratedMoves = uniqueMoves.map(move => {
            const rating = rateMoveForAPokemon(move, poke, ability, item, uniqueMoves, moveset, ctx) * (1 + ((rng.random() ? 1 : -1) * rng.random() * deviation));
            return {
                ...move,
                rating,
            };
        }).filter(m => m !== null);

        ratedMoves.sort((a, b) => b.rating - a.rating);
        moveset.push(ratedMoves[0]);
        uniqueMoves = uniqueMoves.filter(move => move.id !== ratedMoves[0].id);
    }

    // A3: Post-process — remove redundant same-type damage moves from the final set.
    // Keep the highest base-rated move of each type; remove duplicates unless an exception applies.
    // Exceptions:
    //   - The two moves have different priority tiers (e.g. Quick Attack vs Return)
    //   - IRON_FIST ability and both moves are punching moves (Iron Fist punching coverage)
    const damageByType = {};
    moveset.forEach(m => {
        if (m.category === 'DAMAGE_CATEGORY_STATUS') return;
        if (!damageByType[m.type]) damageByType[m.type] = [];
        damageByType[m.type].push(m);
    });

    const toRemoveIds = new Set();
    for (const typeMoves of Object.values(damageByType)) {
        if (typeMoves.length < 2) continue;
        // Sort by base rating (rateMove) descending so index 0 is the keeper
        typeMoves.sort((a, b) => rateMove(b) - rateMove(a));
        for (let i = 1; i < typeMoves.length; i++) {
            const weaker = typeMoves[i];
            const stronger = typeMoves[0];
            // Exception: the forced Zero-to-Hero pivot is always kept (its switch utility is
            // distinct from a same-type attacker, and the rule guarantees its presence).
            if (forcedPivotId && weaker.id === forcedPivotId) continue;
            // Exception: the forced Meloetta Relic Song is always kept (guaranteed transform move).
            if (forcedMeloettaMoveId && weaker.id === forcedMeloettaMoveId) continue;
            // Exception: the forced Multitype signature move (Judgment/Multi-Attack) is always kept.
            if (forcedSignatureMoveId && weaker.id === forcedSignatureMoveId) continue;
            // Exception: different priority tiers
            if ((weaker.priority || 0) !== (stronger.priority || 0)) continue;
            // Exception: Iron Fist with two punching moves of the same type
            if (ability === 'IRON_FIST' && punchingMoves.includes(weaker.id) && punchingMoves.includes(stronger.id)) continue;
            // Exception: whitelisted moves have utility distinct from the stronger same-type move
            if (sameTypeLowerPenaltyMoves.includes(weaker.id)) continue;
            // No exception — mark for removal
            toRemoveIds.add(weaker.id);
            console.log(`[A3] ${poke.name}: removed ${weaker.id} (kept ${stronger.id}, type=${weaker.type})`);
        }
    }

    if (toRemoveIds.size > 0) {
        // Remove flagged moves from the set
        for (let i = moveset.length - 1; i >= 0; i--) {
            if (toRemoveIds.has(moveset[i].id)) {
                moveset.splice(i, 1);
            }
        }
        // Fill freed slots with the next-best moves from uniqueMoves
        while (uniqueMoves.length > 0 && moveset.length < 4) {
            const ratedMoves = uniqueMoves.map(move => {
                const rating = rateMoveForAPokemon(move, poke, ability, item, uniqueMoves, moveset, ctx) * (1 + ((rng.random() ? 1 : -1) * rng.random() * deviation));
                return { ...move, rating };
            }).filter(m => m !== null);
            if (ratedMoves.length === 0) break;
            ratedMoves.sort((a, b) => b.rating - a.rating);
            moveset.push(ratedMoves[0]);
            uniqueMoves = uniqueMoves.filter(move => move.id !== ratedMoves[0].id);
        }
    }

    moveset.forEach(move => {
        if (!poke.learnset.some(ls => ls.move === move.id)
            && tms.includes(move.id))
        {
            tmsUsed.push(move.id);
        }
    });

    return {
        moveset: moveset.map(m => m.id),
        tmsUsed,
    };
}

function adjustMoveset(poke, level = 100, moveset, importantMoves, moves, ability = null, item = null, deviation = 0, ctx = {}) {
    if (!moveset || moveset.length !== 4) {
        // We just can't replace non full sets
        return moveset;
    }

    const learnableMoves = [
        ...poke.learnset.filter(ls => ls.level <= level).map(ls => ls.move),
    ].map(moveId => moves[moveId]).filter(m => m !== undefined && !moveset.includes(m.id));

    // T-159 — this pass runs once the held item is FINAL, so a Power Herb is available to THIS mon iff
    // it actually holds one. Drop the bag-availability signal that assignment used to keep the option
    // open (ctx.powerHerb), and re-rate everything under that honest ctx. Also carry the stall archetype
    // so the consolidation keeps building the stall kit (resolve it here if the caller didn't).
    const stallMode = ctx.stallMode !== undefined ? ctx.stallMode : isPureStaller(poke, moves, level, ctx.doubles === true);
    const cCtx = { ...ctx, powerHerb: item === 'Power Herb', stallMode };
    const movesWithout = i => moveset.filter((m, index) => index !== i).map(m => moves[m]);
    const rateInSet = (mv, i, useCtx = cCtx, useItem = item) =>
        rateMoveForAPokemon(mv, poke, ability, useItem, learnableMoves, movesWithout(i), useCtx);

    const ratings = moveset.map((mid, i) => rateInSet(moves[mid], i));
    const bestRating = Math.max(...ratings);

    // Reverse loop so we try to replace the worst moves first
    for (let i = moveset.length - 1; i >= 0; i--) {
        if (importantMoves.includes(moveset[i])) continue;
        const mv = moves[moveset[i]];

        // T-159 — a charge move is "item-orphaned" when it would rate far higher WITH an enabler this mon
        // now lacks (no held Power Herb, no relevant weather). Detect it via the rater itself — re-rate
        // with every enabler forced on and compare — so the weather/own-ability logic is never duplicated
        // here. (Belch without a berry is already a hard 0, caught by the generic threshold below.)
        let orphaned = false;
        if (mv && CHARGE_MOVE_EFFECTS.includes(mv.effect)) {
            const enabled = rateInSet(mv, i, { ...cCtx, powerHerb: true, sun: true, rain: true }, 'Power Herb');
            orphaned = enabled > 0 && ratings[i] < enabled * 0.6;
        }

        if (!(orphaned || ratings[i] < 1 || ratings[i] < bestRating / 2)) continue;

        const ratedMoves = learnableMoves.map(move => ({
            ...move,
            rating: rateInSet(move, i) * (1 + ((rng.random() ? 1 : -1) * rng.random() * deviation)),
        }));
        if (ratedMoves.length === 0) continue;
        const bestReplacement = ratedMoves.sort((a, b) => b.rating - a.rating)[0];

        // Orphaned item-moves are swapped for any strictly-better option; other weak moves keep the
        // original +1 hysteresis so a set doesn't churn over marginal differences.
        const bar = orphaned ? ratings[i] : ratings[i] + 1;
        if (bestReplacement.rating > bar) {
            const oldMoveset = [...moveset];
            moveset[i] = bestReplacement.id;
            console.log(`Adjusted moves from ${poke.id} @ ${item}: replaced old ${oldMoveset} -> ${moveset}.
        - Old move had a rating of ${ratings[i].toFixed(2)}, new move ${bestReplacement.id} has a rating of ${bestReplacement.rating.toFixed(2)}`);
        }
    }

    return moveset;
}

function chooseNature(poke, moveset, moves, ability, item, deviation = 0) {
    const hasPhysicalMove = moveset.some(moveId => {
        const move = moves[moveId];
        return move && move.category === 'DAMAGE_CATEGORY_PHYSICAL';
    });
    const hasSpecialMove = moveset.some(moveId => {
        const move = moves[moveId];
        return move && move.category === 'DAMAGE_CATEGORY_SPECIAL';
    });
    const hasPriorityMove = moveset.some(moveId => {
        const move = moves[moveId];
        return move && move.priority > 0;
    });
    const amountOfStatusMoves = moveset.filter(moveId => {
        const move = moves[moveId];
        return move && move.category === 'DAMAGE_CATEGORY_STATUS';
    }).length;

    let attackStat = ability === 'HUGE_POWER' || ability === 'PURE_POWER' ? poke.baseAttack * 2 : poke.baseAttack;
    let specialAttackStat = poke.baseSpAttack;

    if (ability === 'PARENTAL_BOND') {
        attackStat *= 1.25;
        specialAttackStat *= 1.25;
    }
    if (ability === 'TRUANT') {
        attackStat *= 0.5;
        specialAttackStat *= 0.5;
    }
    if (ability === 'DEFEATIST') {
        attackStat *= 0.75;
        specialAttackStat *= 0.75;
    }
    if (ability === 'SLOW_START') {
        attackStat *= 0.5;
    }
    if (ability === 'GUTS' && item === 'Flame Orb') {
        attackStat *= 1.5;
    }
    if (ability === 'TOXIC_BOOST' && item === 'Toxic Orb') {
        attackStat *= 1.5;
    }

    const natures = Object.values(NATURES).map(nature => {
        let rating = 0;
        
        if (poke.rating.role === 'OFFENSIVE' || (poke.rating.role === 'BALANCED' && amountOfStatusMoves <= 1)) {
            if (hasPhysicalMove && nature.up === 'baseAttack') {
                rating += 8 * attackStat / 100;
            }
            if (hasSpecialMove && nature.up === 'baseSpAttack') {
                rating += 8 * specialAttackStat / 100;
            }
            if (!hasPhysicalMove && nature.down === 'baseAttack') {
                rating += 2;
            }
            if (!hasSpecialMove && nature.down === 'baseSpAttack') {
                rating += 2;
            }
            if (hasPhysicalMove && nature.down === 'baseAttack') {
                rating -= 4 * attackStat / 100;
            }
            if (hasSpecialMove && nature.down === 'baseSpAttack') {
                rating -= 4 * specialAttackStat / 100;
            }
            if (nature.up === 'baseSpeed') {
                rating += 8.05 * Math.max(attackStat, specialAttackStat) / 100;
                if (hasPriorityMove || item === 'Choice Scarf') {
                    rating -= 1;
                }
                if (item === 'Choice Band' || item === 'Choice Specs' || item === 'Life Orb') {
                    rating += 1;
                }
            }
            if (nature.down === 'baseSpeed') {
                rating = 0;
            }
            if (nature.up === 'baseDefense') {
                rating += 1 * poke.baseDefense / 100;
            }
            if (nature.up === 'baseSpDefense') {
                rating += 1 * poke.baseSpDefense / 100;
            }
            if (nature.down === 'baseDefense') {
                if (hasPhysicalMove && hasSpecialMove) {
                    rating += 2 - 0.5 * poke.baseDefense / 100;
                }
                else {
                    rating -= 2;
                }
            }
            if (nature.down === 'baseSpDefense') {
                if (hasPhysicalMove && hasSpecialMove) {
                    rating += 2 - 0.5 * poke.baseSpDefense / 100;
                }
                else {
                    rating -= 2;
                }
            }
        }
        else if (poke.rating.role === 'TANK' || amountOfStatusMoves >= 4) {
            if (nature.up === 'baseDefense') {
                rating += 8 * poke.baseDefense / 100;
            }
            if (nature.down === 'baseDefense') {
                rating = 0;
            }
            if (nature.up === 'baseSpDefense') {
                rating += 8 * poke.baseSpDefense / 100;
            }
            if (nature.down === 'baseSpDefense') {
                rating = 0;
            }
            if (nature.up === 'baseSpeed') {
                rating = 0;
            }
            if (nature.down === 'baseSpeed') {
                if (hasPhysicalMove && hasSpecialMove) {
                    rating += 2;
                }
            }
            if (nature.up === 'baseAttack') {
                rating += 1 * attackStat / 100;
            }
            if (nature.up === 'baseSpAttack') {
                rating += 1 * specialAttackStat / 100;
            }
            if (nature.down === 'baseAttack') {
                if (hasPhysicalMove) {
                    rating -= 1;
                }
                else {
                    rating += 2;
                }
            }
            if (nature.down === 'baseSpAttack') {
                if (hasSpecialMove) {
                    rating -= 1;
                }
                else {
                    rating += 2;
                }
            }
        }
        else if (poke.rating.role === 'BULKY' || (poke.rating.role === 'BALANCED' && amountOfStatusMoves >=2)) {
            // We try to maximize the best stat, we try to minimize the worst stat
            if (nature.up === 'baseDefense') {
                rating += 5 * poke.baseDefense / 100;
            }
            if (nature.up === 'baseSpDefense') {
                rating += 5 * poke.baseSpDefense / 100;
            }
            if (nature.down === 'baseDefense') {
                rating -= 2 * poke.baseDefense / 100;
            }
            if (nature.down === 'baseSpDefense') {
                rating -= 2 * poke.baseSpDefense / 100;
            }
            if (nature.up === 'baseSpeed') {
                rating += 4 * poke.baseSpeed / 100;
            }
            if (nature.down === 'baseSpeed') {
                rating -= 1.5 * poke.baseSpeed / 100;
            }
            if (nature.up === 'baseAttack') {
                if (hasPhysicalMove) {
                    rating += 5 * attackStat / 100;
                }
                else {
                    rating -= 2;
                }
            }
            if (nature.up === 'baseSpAttack') {
                if (hasSpecialMove) {
                    rating += 5 * specialAttackStat / 100;
                }
                else {
                    rating -= 2;
                }
            }
            if (nature.down === 'baseAttack') {
                if (hasPhysicalMove) {
                    rating -= 2 * attackStat / 100;
                }
                else {
                    rating += 2;
                }
            }
            if (nature.down === 'baseSpAttack') {
                if (hasSpecialMove) {
                    rating -= 2 * specialAttackStat / 100;
                }
                else {
                    rating += 2;
                }
            }
        }

        return {
            ...nature,
            rating: rating + ((rng.random() ? 1 : -1) * rng.random() * deviation * 5),
        }
    });

    natures.sort((a, b) => b.rating - a.rating);
    return natures[0].name;
}

const FLEXIBILITY_THRESHOLD = 20;
const GOOD_STAT_VALUE = 160;
const EXCELLENT_STAT_VALUE = 160;

// A6: Combo-aware rating bonus.
// Detects move+ability synergies that caused pokemon to over-perform their BST in
// competitive play. Returns an additive bonus (0–1.5) applied directly to absoluteRating
// AFTER the 80/10/10 weighted formula, so a +0.5 bonus meaningfully shifts a tier.
// Does NOT double-count patterns already handled elsewhere:
//   - HUGE_POWER / PARENTAL_BOND: already ×2 in bstRating
//   - TECHNICIAN + priority: already ×1.5 in rateMoveForAPokemon
//   - SKILL_LINK + multi-hit: already ×2.5 in rateMoveForAPokemon
//   - ADAPTABILITY stab: already ×2 in rateMoveForAPokemon
function computeComboBonus(poke, moveset, moves, tmPool, role = null, defensePower = Infinity) {
    const hasAbility = (ab) => poke.parsedAbilities.includes(ab);

    // Use the full learnable pool so combos are detected even when chooseMoveset
    // picks 4 damage moves and omits setup/hazard/utility moves entirely.
    // Phase C: if tmPool is provided (default mode), filter teachable moves to only
    // those covered by this game's actual TM list. null = all-tms mode (unfiltered).
    const levelUpMoveIds = (poke.learnset || []).map(e => e.move);
    const teachableMoveIds = poke.teachables || [];
    const gameTeachableMoveIds = tmPool
        ? teachableMoveIds.filter(m => tmPool.has(m))
        : teachableMoveIds;
    const allLearnableMoves = new Set([...moveset, ...levelUpMoveIds, ...gameTeachableMoveIds]);

    const hasMove = (id) => allLearnableMoves.has(id);
    const hasAnyMove = (set) => [...set].some(id => allLearnableMoves.has(id));

    const isFinalEvo = !!(poke.evolutionData && poke.evolutionData.isFinal);
    const isMega = !!(poke.evolutionData && poke.evolutionData.isMega);

    let bonus = 0;
    const bonusLog = [];

    // ── Ability-based bonuses ─────────────────────────────────────────────────

    // Magic Guard: negates Life Orb recoil, hazard chip, residual status — removes every
    // passive damage drawback simultaneously. Ability rating is capped at 7.5 in ratePokemon
    // to prevent double-counting; this gives a reduced additive combo bonus.
    if (hasAbility('MAGIC_GUARD')) {
        bonus += 0.25;
        bonusLog.push('MAGIC_GUARD +0.25');
    }

    // Poison Heal: Toxic Orb becomes 12.5% HP/turn healing instead of damage.
    // Stacks with Sub combos below when applicable.
    if (hasAbility('POISON_HEAL')) {
        bonus += 0.4;
        bonusLog.push('POISON_HEAL +0.4');
    }

    // Speed Boost: +1 Spe each end-of-turn. With Protect/Detect, gain speed for free
    // every other turn with no risk. Bonus scales with offensive power — Ninjask (low Atk,
    // no real threat) gets a smaller bonus than Blaziken (120 Atk, real kill pressure).
    if (hasAbility('SPEED_BOOST')) {
        const hasStrongOffense = Math.max(poke.baseAttack, poke.baseSpAttack) >= 100;
        if (hasMove('MOVE_PROTECT') || hasMove('MOVE_DETECT')
            || hasMove('MOVE_BANEFUL_BUNKER') || hasMove('MOVE_SPIKY_SHIELD')) {
            bonus += hasStrongOffense ? 0.5 : 0.2;
            bonusLog.push(hasStrongOffense ? 'SPEED_BOOST+PROTECT +0.5' : 'SPEED_BOOST+PROTECT(weak) +0.2');
        } else {
            bonus += hasStrongOffense ? 0.25 : 0.1;
            bonusLog.push(hasStrongOffense ? 'SPEED_BOOST +0.25' : 'SPEED_BOOST(weak) +0.1');
        }
    }

    // Protean / Libero: every move gets STAB (1.5×). Equivalent to ~+30% damage
    // on every single attack across the entire moveset.
    if (hasAbility('PROTEAN') || hasAbility('LIBERO')) {
        bonus += 0.4;
        bonusLog.push('PROTEAN/LIBERO +0.4');
    }

    // Serene Grace + high-flinch move: doubles secondary effect rates, turning
    // Air Slash / Iron Head into 60% flinch machines on a faster pokemon.
    // Speed >= 70 required: flinch abuse only works when moving first.
    if (hasAbility('SERENE_GRACE') && hasAnyMove(highFlinchMoves) && poke.baseSpeed >= 70) {
        bonus += 0.6;
        bonusLog.push('SERENE_GRACE+flinch +0.6');
        // Serene Grace + setup: doubles boost-move secondary effects AND has offensive setup.
        // Both halves of the combo are independently powerful; together they're exceptional.
        if (hasAnyMove(setupMoves)) {
            bonus += 0.3;
            bonusLog.push('SERENE_GRACE+setup +0.3');
        }
    }

    // Prankster + any status move: gives +1 priority to all non-damaging moves,
    // meaning Thunder Wave / Taunt / WoW execute before any move including Scarf users.
    if (hasAbility('PRANKSTER')) {
        const hasStatusMove = [...allLearnableMoves].some(id => {
            const m = moves[id];
            return m && m.category === 'DAMAGE_CATEGORY_STATUS';
        });
        if (hasStatusMove) {
            bonus += 0.4;
            bonusLog.push('PRANKSTER+status +0.4');
        }
    }

    // Contrary + self-lowering move: turns a -2 SpA drop (Leaf Storm, Overheat, etc.)
    // into a +2 SpA boost. Spamming Leaf Storm gives +6 SpA in 3 turns with a 130 BP move.
    if (hasAbility('CONTRARY') && hasAnyMove(selfLoweringMoves)) {
        bonus += 0.7;
        bonusLog.push('CONTRARY+self-lower +0.7');
    }

    // PARENTAL_BOND: each move hits twice (second hit at 0.25×). This breaks Focus Sash and
    // Sturdy on the first hit, then finishes with the second. Combined with priority it is
    // nearly impossible to counter offensively.
    if (hasAbility('PARENTAL_BOND')) {
        bonus += 0.3;
        bonusLog.push('PARENTAL_BOND +0.3');
        if (hasAnyMove(comboPriorityMoves)) {
            bonus += 0.4;
            bonusLog.push('PARENTAL_BOND+priority +0.4');
        }
    }

    // BEAST_BOOST: each KO raises the pokemon's best stat by one stage. In a sweep
    // scenario this becomes exponentially threatening. Captured as a combo bonus on top
    // of the 1.3× multiplier already applied to offensePower in the BST formula.
    if (hasAbility('BEAST_BOOST')) {
        const bestOffense = Math.max(poke.baseAttack, poke.baseSpAttack);
        if (bestOffense >= 110) {
            bonus += 0.5;
            bonusLog.push('BEAST_BOOST+strong_offense +0.5');
        } else {
            bonus += 0.3;
            bonusLog.push('BEAST_BOOST +0.3');
        }
    }

    // Protosynthesis / Quark Drive (Paradox pokemon): boosts the highest stat by 30% (or 50%
    // for Speed) in Sun/Electric Terrain, or when holding Booster Energy — always active with
    // team support. On offensive mons this is free setup every battle; on speed mons it gives
    // an unmatched speed tier. Bonus scales with whether it hits offense or speed.
    if (hasAbility('PROTOSYNTHESIS') || hasAbility('QUARK_DRIVE')) {
        bonus += 0.45;
        bonusLog.push('PROTOSYNTHESIS/QUARK_DRIVE +0.45');
        const isOffensiveBooster = poke.baseAttack >= 85 || poke.baseSpAttack >= 85;
        // Speed is the highest stat when it exceeds both offensive stats.
        const isSpeedBooster = poke.baseSpeed > Math.max(poke.baseAttack, poke.baseSpAttack);
        if (isOffensiveBooster) {
            bonus += 0.2;
            bonusLog.push('PROTOSYNTH+offense +0.2');
        }
        if (isSpeedBooster) {
            bonus += 0.2;
            bonusLog.push('PROTOSYNTH+speed +0.2');
        }
    }

    // Declared here (before SUPREME_OVERLORD check) to avoid temporal dead zone —
    // the full priority analysis block below also references this set.
    const physicalPriorityIds = new Set([
        'MOVE_BULLET_PUNCH', 'MOVE_MACH_PUNCH', 'MOVE_AQUA_JET', 'MOVE_SHADOW_SNEAK',
        'MOVE_SUCKER_PUNCH', 'MOVE_EXTREME_SPEED', 'MOVE_ICE_SHARD', 'MOVE_QUICK_ATTACK',
        'MOVE_JET_PUNCH', 'MOVE_FIRST_IMPRESSION', 'MOVE_FAKE_OUT',
        'MOVE_GRASSY_GLIDE',  // +1 priority in Grassy Terrain (GRASSY_SURGE setter always creates it)
    ]);

    // Ruin abilities (Paldean Treasures of Ruin): passive field-wide stat drops that affect
    // ALL opponents. Offensive Ruin abilities (Beads, Sword) effectively make the user hit
    // 33% harder (1 / 0.75 = 1.33×). Defensive ones (Tablets, Chain) reduce incoming damage.
    if (hasAbility('BEADS_OF_RUIN')) { bonus += 0.5; bonusLog.push('BEADS_OF_RUIN +0.5'); }
    if (hasAbility('SWORD_OF_RUIN')) { bonus += 0.5; bonusLog.push('SWORD_OF_RUIN +0.5'); }
    if (hasAbility('TABLETS_OF_RUIN')) { bonus += 0.3; bonusLog.push('TABLETS_OF_RUIN +0.3'); }
    if (hasAbility('CHAIN_OF_RUIN')) { bonus += 0.3; bonusLog.push('CHAIN_OF_RUIN +0.3'); }

    // Supreme Overlord (Kingambit): gains +10% Atk per fainted ally (max +50% at 5 KOs).
    // In the endgame Kingambit becomes an auto-boosted sweeper — often at +30-50% after 3-5
    // teammate KOs. Combined with SD or priority, nearly impossible to stop.
    if (hasAbility('SUPREME_OVERLORD')) {
        bonus += 0.75;
        bonusLog.push('SUPREME_OVERLORD +0.75');
        if (hasAnyMove(setupMoves) || hasAnyMove(physicalPriorityIds)) {
            bonus += 0.3;
            bonusLog.push('SUPREME_OVERLORD+offense +0.3');
        }
    }

    // STANCE_CHANGE (Aegislash): switches between 150/150 offense (Blade) and 240/240 defense
    // (Shield) each turn. Effectively gets both roles simultaneously — wall when defending,
    // sweeper when attacking. This dual-form advantage cannot be captured by raw stats alone.
    if (hasAbility('STANCE_CHANGE')) {
        bonus += 1.2;
        bonusLog.push('STANCE_CHANGE +1.2');
    }

    // TECHNICIAN + priority move: Bullet Punch / Mach Punch at 90 effective BP (60×1.5) with
    // STAB and priority. The ×1.5 Technician is already in rateMoveForAPokemon, but the
    // strategic combo value (guaranteed revenge kill, hazard chip finish, sash break) is extra.
    // Restricted to moves that are meaningfully powered by Technician (≥45 base BP targets).
    // Quick Attack (40 BP) with TECHNICIAN gives 60 effective BP — decent but not a reliable
    // revenge kill tool at high level, unlike Bullet Punch (90 effective BP with STAB).
    const techPriorityMoves = new Set([
        'MOVE_BULLET_PUNCH', 'MOVE_MACH_PUNCH', 'MOVE_JET_PUNCH', 'MOVE_ICE_SHARD',
        'MOVE_SHADOW_SNEAK', 'MOVE_AQUA_JET', 'MOVE_VACUUM_WAVE',
    ]);
    if (hasAbility('TECHNICIAN') && hasAnyMove(techPriorityMoves)) {
        bonus += 0.4;
        bonusLog.push('TECHNICIAN+priority +0.4');
    }

    // UNSEEN_FIST + always-crit moves (Wicked Blow / Surging Strikes): these bypass
    // Protect AND always land critical hits (1.5× modifier ignoring defense drops and burns).
    // One of the most reliable damage sources — can't be walled by standard defensive play.
    if (hasAbility('UNSEEN_FIST') && (hasMove('MOVE_WICKED_BLOW') || hasMove('MOVE_SURGING_STRIKES'))) {
        bonus += 1.5;
        bonusLog.push('UNSEEN_FIST+always_crit +1.5');
    }

    // Strong Jaw + Fishious Rend: Fishious Rend doubles in power when the user moves first
    // (base 85 → 170 BP), and Strong Jaw adds another 1.5× to bite moves → 255 effective BP
    // with priority advantage. One of the highest single-hit damage ceilings in the game.
    // Speed bonus: the double-power condition fires reliably when base speed >= 80 (outspeeds
    // most unboosted threats). Below that, Fishious Rend is weaker than many standard moves.
    if (hasAbility('STRONG_JAW') && hasMove('MOVE_FISHIOUS_REND')) {
        bonus += 1.3;
        bonusLog.push('STRONG_JAW+FISHIOUS_REND +1.3');
        if (poke.baseSpeed >= 80) {
            bonus += 0.5;
            bonusLog.push('FISHIOUS_REND+speed_doubling +0.5');
        }
    }

    // Rage Fist + setup: Rage Fist gains +50 BP each time the user is hit (uncapped).
    // With a bulk-boosting setup move, the user tanks hits while accumulating power.
    // Scaled by rawDefensePower: bulkier users can take more hits → higher Rage Fist BP.
    // Base +0.5, +0.05 per bulk unit, capped at +0.8. Ensures the bonus properly rewards
    // the Annihilape archetype (high defense + setup) over frail pokemon that die first.
    if (hasMove('MOVE_RAGE_FIST') && hasAnyMove(setupMoves)) {
        const rawBulk = (poke.baseHP + Math.max(poke.baseDefense, poke.baseSpDefense) * 0.6 + Math.min(poke.baseDefense, poke.baseSpDefense) * 0.4) / (160 * 2) * 10;
        const rageFistBonus = Math.min(0.8, 0.5 + 0.05 * rawBulk);
        bonus += rageFistBonus;
        bonusLog.push(`RAGE_FIST+setup +${rageFistBonus.toFixed(2)}`);
    }

    // MINDS_EYE + Blood Moon: Ursaluna Bloodmoon's exclusive ability makes Normal-type moves
    // hit Ghost types (removing Normal's only full immunity). With Blood Moon (140 BP, can't
    // use twice in a row) and high SpA, this creates near-unresisted STAB coverage.
    if (hasAbility('MINDS_EYE') && hasMove('MOVE_BLOOD_MOON')) {
        bonus += 0.5;
        bonusLog.push('MINDS_EYE+BLOOD_MOON +0.5');
    }

    // Mold Breaker (and variants): ignores Levitate, hitting every Ground-immune pokemon.
    // Levitate is the most common defensive ability — this removes a major wall category.
    if ((hasAbility('MOLD_BREAKER') || hasAbility('TURBOBLAZE') || hasAbility('TERAVOLT'))
        && (hasMove('MOVE_EARTHQUAKE') || hasMove('MOVE_EARTH_POWER'))) {
        bonus += 0.3;
        bonusLog.push('MOLD_BREAKER+ground +0.3');
    }

    // Magic Bounce: reflects all hazards and status moves back at the user.
    // Denies Stealth Rock setup, Toxic, Thunder Wave, etc. passively. Hatterene, Espeon,
    // Mega Sableye — all owe their viability to this ability negating setup entirely.
    if (hasAbility('MAGIC_BOUNCE')) {
        bonus += 0.45;
        bonusLog.push('MAGIC_BOUNCE +0.45');
    }

    // Terrain setters: each terrain provides passive field-wide benefits every turn the
    // setter is alive. For setters whose STAB matches the terrain, the 30% move boost
    // stacks with STAB to create significantly amplified wallbreaking power.
    // GRASSY_SURGE: boosts Grass moves 30%, heals grounded pokemon 1/16 HP/turn,
    // and critically gives Grassy Glide +1 priority in the setter's own terrain.
    if (hasAbility('GRASSY_SURGE')) {
        bonus += 0.4;
        bonusLog.push('GRASSY_SURGE +0.4');
        if (poke.parsedTypes && poke.parsedTypes.includes('GRASS')) {
            bonus += 0.25;
            bonusLog.push('GRASSY_SURGE+GRASS_STAB +0.25');
        }
        if (hasMove('MOVE_GRASSY_GLIDE')) {
            bonus += 0.45;
            bonusLog.push('GRASSY_SURGE+GRASSY_GLIDE +0.45');
        }
    }
    // ELECTRIC_SURGE: boosts Electric moves 30%, prevents sleep for all grounded pokemon.
    if (hasAbility('ELECTRIC_SURGE')) {
        bonus += 0.4;
        bonusLog.push('ELECTRIC_SURGE +0.4');
        if (poke.parsedTypes && poke.parsedTypes.includes('ELECTRIC')) {
            bonus += 0.3;
            bonusLog.push('ELECTRIC_SURGE+ELECTRIC_STAB +0.3');
        }
    }
    // PSYCHIC_SURGE: boosts Psychic moves 30%, blocks all priority moves on the field —
    // a passive priority nullifier that changes matchups against Sucker Punch, Aqua Jet, etc.
    if (hasAbility('PSYCHIC_SURGE')) {
        bonus += 0.4;
        bonusLog.push('PSYCHIC_SURGE +0.4');
        if (poke.parsedTypes && poke.parsedTypes.includes('PSYCHIC')) {
            bonus += 0.3;
            bonusLog.push('PSYCHIC_SURGE+PSYCHIC_STAB +0.3');
        }
    }
    // MISTY_SURGE: halves Dragon-type moves, prevents all status conditions for all grounded
    // pokemon. Excellent defensive-utility setter. Tapu Fini leverages it as a Calm Mind wall.
    if (hasAbility('MISTY_SURGE')) {
        bonus += 0.45;
        bonusLog.push('MISTY_SURGE +0.45');
        if (hasAnyMove(setupMoves)) {
            bonus += 0.45;
            bonusLog.push('MISTY_SURGE+setup +0.45');
        }
    }

    // ── Weather ability combo bonuses ─────────────────────────────────────────
    // Weather is a powerful team-building axis comparable to terrain.
    // Unlike terrain (4-turn unless extended), permanent weather lasts until changed,
    // and both offensive (Swift Swim, Chlorophyll) and defensive (reduced Fire/Water damage)
    // benefits compound across the whole team.

    // DRIZZLE: offensive weather — permanently doubles effective Water damage (1.5×) and
    // unlocks perfect-accuracy Thunder/Hurricane. Teambuilding bonus for final-evo setters
    // because Drizzle defines entire team archetypes (Swift Swim sweepers, rain cores).
    if (hasAbility('DRIZZLE')) {
        bonus += 0.4;
        bonusLog.push('DRIZZLE +0.4');
        if (hasMove('MOVE_THUNDER') || hasMove('MOVE_HURRICANE')) {
            bonus += 0.35;
            bonusLog.push('DRIZZLE+perfect_acc_move +0.35');
        }
        if (poke.parsedTypes && poke.parsedTypes.includes('WATER')) {
            bonus += 0.25;
            bonusLog.push('DRIZZLE+WATER_STAB +0.25');
        }
        if (hasMove('MOVE_ROOST') || hasMove('MOVE_RECOVER') ||
            hasMove('MOVE_SOFT_BOILED') || hasMove('MOVE_SLACK_OFF') || hasMove('MOVE_WISH')) {
            bonus += 0.15;
            bonusLog.push('DRIZZLE+recovery +0.15');
        }
        if (isFinalEvo && !isMega) {
            bonus += 0.3;
            bonusLog.push('DRIZZLE+teambuilding +0.3');
        }
    }
    // DROUGHT: offensive weather — permanently doubles effective Fire damage (1.5×) and
    // turns Solar Beam/Blade from a 2-turn move into an instant 120 BP move.
    // Teambuilding bonus for final-evo setters: Drought enables Chlorophyll sweepers
    // and sun cores that compound with FIRE_STAB.
    if (hasAbility('DROUGHT')) {
        bonus += 0.4;
        bonusLog.push('DROUGHT +0.4');
        if (hasMove('MOVE_SOLAR_BEAM') || hasMove('MOVE_SOLAR_BLADE')) {
            bonus += 0.25;
            bonusLog.push('DROUGHT+instant_solar +0.25');
        }
        if (poke.parsedTypes && poke.parsedTypes.includes('FIRE')) {
            bonus += 0.25;
            bonusLog.push('DROUGHT+FIRE_STAB +0.25');
        }
        if (isFinalEvo && !isMega) {
            bonus += 0.3;
            bonusLog.push('DROUGHT+teambuilding +0.3');
        }
    }
    // SAND_STREAM: sets permanent Sandstorm. SpDef boost to Rock types. Chip damage
    // to non-Rock/Ground/Steel. Strong defensive utility + Excadrill/Tyranitar synergy.
    if (hasAbility('SAND_STREAM')) {
        bonus += 0.3;
        bonusLog.push('SAND_STREAM +0.3');
        if (poke.parsedTypes && poke.parsedTypes.includes('ROCK')) {
            bonus += 0.2;
            bonusLog.push('SAND_STREAM+ROCK_SPDEF +0.2');
        }
    }
    // SNOW_WARNING: sets permanent Snow. BLIZZARD has 100% accuracy in snow.
    // Defensive value: Ice-type SpDef boost (gen 9 mechanic). Aurora Veil support.
    // BLIZZARD bonus only applies if the setter is a credible special attacker AND fast enough
    // to threaten before being KO'd (SpA >= 100 AND Speed >= 80). Slow/weak Snow setters like
    // Abomasnow, Aurorus, and Vanilluxe can't survive long enough to exploit their own snow —
    // the terrain is primarily team support, not personal offense.
    if (hasAbility('SNOW_WARNING')) {
        bonus += 0.20;
        bonusLog.push('SNOW_WARNING +0.2');
        if (hasMove('MOVE_BLIZZARD') && poke.baseSpAttack >= 100 && poke.baseSpeed >= 80) {
            bonus += 0.3;
            bonusLog.push('SNOW_WARNING+BLIZZARD +0.3');
        }
    }

    // Regenerator + recovery: passive healing on every switch-out combined with
    // active recovery each turn makes these pokemon nearly impossible to wear down.
    // Toxapex, Slowbro, Tangrowth all rely on this combo for their defensive viability.
    if (hasAbility('REGENERATOR') && hasAnyMove(comboRecoveryMoves)) {
        bonus += 0.15;
        bonusLog.push('REGENERATOR+recovery +0.15');
    }

    // Unaware + recovery: ignores ALL opponent stat boosts when taking/dealing damage.
    // Hard counter to every setup sweeper in existence as long as it can keep healing.
    if (hasAbility('UNAWARE') && hasAnyMove(comboRecoveryMoves)) {
        bonus += 0.4;
        bonusLog.push('UNAWARE+recovery +0.4');
    }

    // ── Move combo bonuses ────────────────────────────────────────────────────

    const hasSetup    = hasAnyMove(setupMoves);
    const hasRecovery = hasAnyMove(comboRecoveryMoves);

    // Stat-aware priority check: physical priority is only strategically relevant to
    // physical or mixed attackers. Prevents e.g. Sceptile Mega (special attacker) from
    // getting SETUP+PRIORITY credit for Quick Attack it would never competitively run.
    // (physicalPriorityIds declared earlier to avoid TDZ in SUPREME_OVERLORD check above)
    const specialPriorityIds = new Set([
        'MOVE_VACUUM_WAVE', 'MOVE_WATER_SHURIKEN', 'MOVE_THUNDERCLAP',
    ]);
    const hasPhysicalPriority = [...physicalPriorityIds].some(id => allLearnableMoves.has(id));
    const hasSpecialPriority  = [...specialPriorityIds].some(id => allLearnableMoves.has(id));
    // A pokemon is "clearly physical/special" if its dominant attack exceeds 90% of the other.
    const isClearlyPhysical = poke.baseAttack > poke.baseSpAttack * 0.9;
    const isClearlySpecial  = poke.baseSpAttack > poke.baseAttack * 0.9;
    const hasPriority =
        (isClearlyPhysical && hasPhysicalPriority)
        || (isClearlySpecial && hasSpecialPriority)
        || (!isClearlyPhysical && !isClearlySpecial && (hasPhysicalPriority || hasSpecialPriority));
    const hasHazard   = hasAnyMove(hazardSetMoves);
    const hasPivot    = hasAnyMove(pivotingMoves);
    const hasSub      = hasMove('MOVE_SUBSTITUTE');
    const hasToxic    = hasMove('MOVE_TOXIC') || hasMove('MOVE_WILL_O_WISP');
    // Reliable recovery: excludes Rest (2-turn sleep makes it unreliable for combo synergy
    // unless paried with Sleep Talk/Natural Cure), and excludes passive moves like Leech Seed /
    // Aqua Ring (no action cost but minimal per-turn healing, not a true recovery move).
    // Used for SETUP+RECOVERY and PIVOT+RECOVERY checks to prevent every Rest-user from
    // qualifying. Rest still counts for SUB+STATUS+RECOVERY (Snorlax-style stall).
    const reliableRecoveryMoves = new Set([
        'MOVE_RECOVER', 'MOVE_ROOST', 'MOVE_SOFT_BOILED', 'MOVE_SLACK_OFF',
        'MOVE_MILK_DRINK', 'MOVE_HEAL_ORDER', 'MOVE_SYNTHESIS', 'MOVE_MORNING_SUN',
        'MOVE_MOONLIGHT', 'MOVE_SHORE_UP', 'MOVE_WISH',
        // Draining moves heal proportionally on hit — reliable enough to count for combo synergy
        'MOVE_DRAIN_PUNCH', 'MOVE_GIGA_DRAIN', 'MOVE_LEECH_LIFE', 'MOVE_HORN_LEECH',
        'MOVE_DRAINING_KISS', 'MOVE_BITTER_BLADE', 'MOVE_OBLIVION_WING',
    ]);
    const hasReliableRecovery = [...reliableRecoveryMoves].some(id => allLearnableMoves.has(id));

    // Setup + Priority: after any boost, can't be revenge-killed by faster mons.
    // This is the single most reliable competitive pattern (Scizor SD+BP, Lucario SD+ESpeed,
    // Azumarill BD+AquaJet, Kingambit SD+SuckerPunch).
    if (hasSetup && hasPriority) {
        bonus += 0.7;
        bonusLog.push('SETUP+PRIORITY +0.7');
        // Fast + setup + priority: can both outspeed AND use priority — uniquely hard to revenge kill.
        // Weavile (125 Spe + SD + Sucker Punch) exemplifies this: no speed tier is safe.
        if (poke.baseSpeed >= 90) {
            bonus += 0.3;
            bonusLog.push('SETUP+fast(spe>=90) +0.3');
        }
    } else if (hasSetup && poke.baseSpeed >= 90) {
        // Fast enough that a single setup turn is already enough to outspeed most threats.
        bonus += 0.4;
        bonusLog.push('SETUP+fast(spe>=90) +0.4');
    }

    // Quiver Dance: the best standalone setup move — +1 SpA, SpD, AND Spe in one turn.
    // Boosts three stats simultaneously, including SpDef (unlike Dragon Dance/Shell Smash),
    // making it uniquely powerful. A separate bonus on top of setup+speed when applicable.
    if (hasMove('MOVE_QUIVER_DANCE')) {
        bonus += 0.6;
        bonusLog.push('QUIVER_DANCE +0.6');
    }

    // Shell Smash: +2 Atk/SpA/Spe at -1 Def/SpDef. White Herb restores the defense drop.
    // Covered by setup+priority above when it co-occurs with a priority move, but worth
    // a standalone bonus for the raw power of +2 offense+speed.
    if (hasMove('MOVE_SHELL_SMASH')) {
        bonus += 0.4;
        bonusLog.push('SHELL_SMASH +0.4');
    }

    // Sub + Toxic/WoW + Recovery: the classic stall loop. Sub blocks direct damage, status
    // chips the opponent, recovery patches Sub cost. Gliscor, Gengar, Clodsire archetypes.
    // Use hasReliableRecovery: REST is too universal to count as a "recovery loop" option.
    if (hasSub && hasToxic && hasReliableRecovery) {
        bonus += 0.6;
        bonusLog.push('SUB+STATUS+RECOVERY +0.6');
    } else if (hasSub && hasReliableRecovery) {
        // Sub + recovery without status — still strong (sustained Sub cycling).
        bonus += 0.3;
        bonusLog.push('SUB+RECOVERY +0.3');
    } else if (hasSub && hasAbility('POISON_HEAL')) {
        // Poison Heal covers Sub's HP cost without a recovery move — also valid.
        bonus += 0.3;
        bonusLog.push('SUB+POISON_HEAL +0.3');
    }

    // Hazard setter + recovery: long-term win condition. Hazards deal ~25% per switch.
    // With recovery, the setter can maintain hazards indefinitely (Ferrothorn, Skarmory).
    // Two tiers: reliable recovery (+0.4) vs REST-only (+0.2). REST is less consistent
    // (forced sleep 2 turns) but still a real defensive loop on bulky hazard setters.
    // Bulk guard: an OFFENSIVE glass cannon with a hazard move via TM is not a real hazard
    // setter — it cannot survive long enough to leverage the hazard+recovery loop. Require
    // defensePower ≥ 5.5 for OFFENSIVE pokemon (≈ 80 HP / 85 Def / 80 SpD or better).
    if (hasHazard && hasReliableRecovery && (role !== 'OFFENSIVE' || defensePower >= 5.5)) {
        bonus += 0.4;
        bonusLog.push('HAZARD+RECOVERY +0.4');
    } else if (hasHazard && hasAnyMove(new Set(['MOVE_REST']))) {
        bonus += 0.2;
        bonusLog.push('HAZARD+REST +0.2');
    }

    // Pivot + reliable recovery or Regenerator: net HP-positive every pivot cycle.
    // Makes switch-ins free over the long game (Landorus-T, Tornadus-T, Corviknight).
    // Requires reliable recovery (not Rest) because Rest+Sleep loses 2 turns after pivoting.
    // Also requires physical bulk (Def ≥ 75): frail mons can't safely tank the hit on switch-in
    // to initiate the pivot cycle — Gardevoir Mega (Def 65) is a counterexample.
    if (hasPivot && (hasReliableRecovery || hasAbility('REGENERATOR')) && poke.baseDefense >= 75) {
        bonus += 0.3;
        bonusLog.push('PIVOT+RECOVERY +0.3');
    }

    // Setup + reliable recovery: eliminates both "use up the boost" and "die to chip" counterplay.
    // Classic win conditions: Calm Mind + Recover (Clefable), Bulk Up + Drain Punch (Annihilape),
    // Dragon Dance + Roost (Dragonite), Shell Smash + Synthesis (Torterra).
    // Requires reliable recovery (not Rest) — Rest after a setup turn loses too much momentum.
    if (hasSetup && hasReliableRecovery) {
        bonus += 0.35;
        bonusLog.push('SETUP+RECOVERY +0.35');
    }

    // Huge Power / Pure Power + physical priority: HUGE_POWER already doubles effective attack,
    // meaning even without setup the pokemon threatens OHKOs from full HP. Physical priority
    // on top means it can pick off threats that have taken chip, and revenge kill speedsters.
    // Models Azumarill+Aqua Jet, Mega Mawile+Bullet Punch as always-relevant offensive platforms.
    if ((hasAbility('HUGE_POWER') || hasAbility('PURE_POWER')) && hasPhysicalPriority) {
        bonus += 1.0;
        bonusLog.push('HUGE_POWER+priority +1.0');
    }

    // -ATE abilities (PIXILATE/AERILATE/REFRIGERATE/GALVANIZE) + sound-based move:
    // Converts the Normal-type sound move into a typed STAB that goes through Substitute
    // and Sound-proof immunity. E.g. Sylveon PIXILATE+Hyper Voice = 130 BP Fairy STAB.
    if ((hasAbility('PIXILATE') || hasAbility('AERILATE') || hasAbility('REFRIGERATE') || hasAbility('GALVANIZE'))
        && hasAnyMove(soundBasedOffensiveMoves)) {
        bonus += 0.4;
        bonusLog.push('-ATE+sound_move +0.4');
    }

    // Liquid Voice: all sound-based moves become Water-type. Primarina's Hyper Voice becomes a
    // 90 BP Water-type spread move with STAB that bypasses Substitute — a unique offensive niche
    // that makes it significantly harder to wall than a typical Water-type special attacker.
    if (hasAbility('LIQUID_VOICE') && hasMove('MOVE_HYPER_VOICE')) {
        bonus += 0.6;
        bonusLog.push('LIQUID_VOICE+HYPER_VOICE +0.6');
    }

    // Body Press + Iron Defense: Body Press deals damage equal to the user's Defense stat.
    // Iron Defense doubles Defense in one turn. Together they create an offensive wall that
    // sweeps with its boosted Defense — Corviknight's signature OU strategy.
    if (hasMove('MOVE_BODY_PRESS') && hasMove('MOVE_IRON_DEFENSE')) {
        bonus += 0.55;
        bonusLog.push('BODY_PRESS+IRON_DEFENSE +0.55');
    }

    // Mirror Armor (Corviknight): reflects all stat-lowering effects back to the attacker.
    // Punishes Intimidate, sticky webs, and any direct debuff, and is a top-tier defensive ability.
    if (hasAbility('MIRROR_ARMOR')) {
        bonus += 0.25;
        bonusLog.push('MIRROR_ARMOR +0.25');
    }

    // Good as Gold (Gholdengo): completely immune to all status moves — Taunt, Thunder Wave,
    // Will-O-Wisp, Toxic, Encore, Spore, etc. Combined with Ghost/Steel typing, it's nearly
    // impossible to shut down through traditional defensive tools.
    if (hasAbility('GOOD_AS_GOLD')) {
        bonus += 0.35;
        bonusLog.push('GOOD_AS_GOLD +0.35');
    }

    // Scrappy + physical attacker: Normal and Fighting moves hit Ghost-types as if there were
    // no immunity. For strong physical attackers (Lopunny Mega) this gives near-unresisted
    // Normal/Fighting STAB coverage — directly comparable to MINDS_EYE for Normal/Fighting.
    if (hasAbility('SCRAPPY') && poke.baseAttack >= 100) {
        bonus += 0.35;
        bonusLog.push('SCRAPPY+physical +0.35');
    }

    // Extreme speed tier: at 200+ base Speed, nothing outspeeds without a Scarf.
    // Regieleki at 200 Speed is functionally always moving first against every non-Scarfer,
    // and Electro Ball scales to 150 BP against anything below 67 Speed (most of the meta).
    if (poke.baseSpeed >= 200) {
        bonus += 0.8;
        bonusLog.push('SPEED_200+ +0.8');
    }

    // ── Wire comboList to absoluteRating ─────────────────────────────────────
    // comboList already drives move selection, but never affected absoluteRating.
    // Find the highest-rated comboList entry whose two effects both appear in the moveset.
    // Scale the rating (6–10) to a small additive bonus (0–0.2) to avoid double-counting
    // with the patterns above.
    let bestComboListBonus = 0;
    for (const combo of comboList) {
        const matchCount = moveset.filter(id => {
            const m = moves[id];
            return m && combo.effects.includes(m.effect);
        }).length;
        if (matchCount >= 2) {
            const scaled = Math.max(0, (combo.rating - 6) / 4 * 0.2);
            if (scaled > bestComboListBonus) bestComboListBonus = scaled;
        }
    }
    if (bestComboListBonus > 0) {
        bonus += bestComboListBonus;
        bonusLog.push(`comboList +${bestComboListBonus.toFixed(2)}`);
    }

    // Spectral Thief: steals the opponent's stat boosts and uses them. Completely invalidates
    // every setup sweeper that isn't Ghost-type. Unique in competitve play.
    if (hasMove('MOVE_SPECTRAL_THIEF')) {
        bonus += 0.25;
        bonusLog.push('SPECTRAL_THIEF +0.25');
    }

    // STANCE_CHANGE warrants a higher cap because its dual-form advantage is structurally
    // unique and cannot be captured by the BST formula alone.
    // UNSEEN_FIST warrants a 2.0 cap: its signature always-crit combo is too powerful to
    // share a 1.6 cap with other combos without losing the signal.
    // 1.6 general cap gives top-tier pokemon with multiple synergies slight headroom.
    const bonusCap = hasAbility('STANCE_CHANGE') ? 2.5 : (hasAbility('UNSEEN_FIST') ? 2.0 : 1.6);
    const finalBonus = Math.min(bonus, bonusCap);
    if (finalBonus > 0) {
        console.log(`[A6] ${poke.name}: comboBonus=${finalBonus.toFixed(2)} [${bonusLog.join(', ')}]`);
    }
    return finalBonus;
}

// Map an absoluteRating to a competitive tier. Stone megas need a higher AG threshold (their
// inflated stats are rewarded generously); non-megas and stoneless megas use TIER_AG_THRESHOLD.
// Extracted so cross-form re-rates (e.g. the Meloetta Aria/Pirouette blend, T-064) recompute the
// tier the exact same way ratePokemon does.
function tierFromRating(absoluteRating, { isStoneMega = false } = {}) {
    const agRatingThreshold = isStoneMega ? MEGA_AG_RATING_THRESHOLD : TIER_AG_THRESHOLD;
    if (absoluteRating >= agRatingThreshold)      return TIER_AG;
    if (absoluteRating >= TIER_LEGEND_THRESHOLD)  return TIER_LEGEND;
    if (absoluteRating >= TIER_UBERS_THRESHOLD)   return TIER_UBERS;
    if (absoluteRating >= TIER_OU_THRESHOLD)      return TIER_OU;
    if (absoluteRating >= TIER_UU_THRESHOLD)      return TIER_UU;
    if (absoluteRating >= TIER_RU_THRESHOLD)      return TIER_RU;
    if (absoluteRating >= TIER_NU_THRESHOLD)      return TIER_NU;
    if (absoluteRating >= TIER_PU_THRESHOLD)      return TIER_PU;
    if (absoluteRating >= TIER_ZU_THRESHOLD)      return TIER_ZU;
    return TIER_MAGIKARP;
}

// @TODO Maybe add a level-based rating too for the right context
// T-097 — the shared offense/defense/speed POWER + ROLE classification, extracted from ratePokemon so BOTH
// the singles rater and the doubles rater (ratePokemonDoubles) compute a mon's power profile identically
// (SSOT — no drift). Behaviour-preserving vs the previous inline block. `hugePowerRating` is the HUGE_POWER/
// PURE_POWER ability-rating override (baseAttack/12); returned rather than set so each rater applies it to
// bestAbilityRating in its own way. The three power components are capped at 10.
function computePowerAndRole(poke) {
    let abilitiesAttackPowerMultiplier = 1;
    let abilitiesSpaPowerMultiplier = 1;
    let abilitiesSpeedPowerMultiplier = 1;
    let hugePowerRating = null;
    if (poke.parsedAbilities.includes('HUGE_POWER') || poke.parsedAbilities.includes('PURE_POWER')) {
        abilitiesAttackPowerMultiplier = 2;
        hugePowerRating = poke.baseAttack / 12;
    }
    if (poke.parsedAbilities.includes('PARENTAL_BOND')) {
        abilitiesAttackPowerMultiplier *= 1.25;
        abilitiesSpaPowerMultiplier *= 1.25;
    }
    // BEAST_BOOST snowballs after each KO. Model it as a 1.3× offensive multiplier,
    // simulating that the pokemon progressively becomes more threatening in-game.
    if (poke.parsedAbilities.includes('BEAST_BOOST')) {
        abilitiesAttackPowerMultiplier *= 1.3;
        abilitiesSpaPowerMultiplier *= 1.3;
    }
    // TRANSISTOR: boosts Electric-type moves by 1.3×. Regieleki's exclusive ability
    // combined with 200 Speed makes its Electric STAB significantly stronger than any
    // other Electric-type attacker. Model as a SpA multiplier (Electric is special primary).
    if (poke.parsedAbilities.includes('TRANSISTOR')) {
        abilitiesSpaPowerMultiplier *= 1.3;
    }
    if (poke.parsedAbilities.every(abilityId => abilityId === 'TRUANT' || abilityId === 'NONE')) {
        abilitiesAttackPowerMultiplier = 0.5;
        abilitiesSpaPowerMultiplier = 0.5;
    }
    if (poke.parsedAbilities.every(abilityId => abilityId === 'DEFEATIST' || abilityId === 'NONE')) {
        abilitiesAttackPowerMultiplier = 0.75;
        abilitiesSpaPowerMultiplier = 0.75;
    }
    if (poke.parsedAbilities.every(abilityId => abilityId === 'SLOW_START' || abilityId === 'NONE')) {
        abilitiesAttackPowerMultiplier = 0.5;
        abilitiesSpeedPowerMultiplier = 0.5;
    }
    let offensePower = Math.max(poke.baseAttack * abilitiesAttackPowerMultiplier, poke.baseSpAttack * abilitiesSpaPowerMultiplier) / EXCELLENT_STAT_VALUE * 10;
    let speedPower = poke.baseSpeed * abilitiesSpeedPowerMultiplier / EXCELLENT_STAT_VALUE * 10;
    let defensePower = (poke.baseHP + Math.max(poke.baseDefense, poke.baseSpDefense)* 0.6 + Math.min(poke.baseDefense, poke.baseSpDefense) * 0.4) / (EXCELLENT_STAT_VALUE * 2) * 10;
    // rawDefensePower captures pre-flexibility bulk for the glass cannon checks below.
    // Pheromosa's equal 37/37 defenses trigger a flexibility bonus that inflates defensePower
    // past the 3.5 threshold, so we use rawDefensePower to reliably detect the archetype.
    const rawDefensePower = defensePower;
    // rawOffensePower: base-stat-only offense, used by the speed guard below.
    // Intentionally does NOT include ability multipliers so that TRANSISTOR / BEAST_BOOST
    // cannot circumvent the guard on behalf of a fundamentally low-base-attack pokemon.
    const rawOffensePower = Math.max(poke.baseAttack, poke.baseSpAttack) / EXCELLENT_STAT_VALUE * 10;

    let role;
    if (Math.abs(offensePower - defensePower) < 1.0) {
        if (Math.abs(offensePower - speedPower) < 1.0 && Math.abs(defensePower - speedPower) < 1.0) {
            role = 'BALANCED';
        }
        else if (speedPower < offensePower && speedPower < defensePower) {
            role = 'BULKY';
        }
        else {
            role = 'OFFENSIVE';
        }
    }
    else if (offensePower > defensePower) {
        if (speedPower > offensePower || Math.abs(offensePower - speedPower) < 1.0 || speedPower > defensePower) {
            role = 'OFFENSIVE';
        }
        else {
            role = 'BULKY';
        }
    }
    else {
        // defensePower > offensePower
        role = 'TANK';
    }

    // Add flexibility bonuses here
    if (Math.abs(poke.baseAttack - poke.baseSpAttack) < FLEXIBILITY_THRESHOLD) {
        offensePower += 0.1 * (Math.min(poke.baseAttack, poke.baseSpAttack) / EXCELLENT_STAT_VALUE * 10);
    }
    if (Math.abs(poke.baseDefense - poke.baseSpDefense) < FLEXIBILITY_THRESHOLD) {
        defensePower += 0.1 * (Math.min(poke.baseDefense, poke.baseSpDefense) / EXCELLENT_STAT_VALUE * 10);
    }

    // Add outlier bonuses here - for now only offense and speed have such bonuses
    if (Math.max(poke.baseAttack, poke.baseSpAttack) >= GOOD_STAT_VALUE) {
        offensePower *= 1.1;
    }
    if (poke.baseSpeed >= GOOD_STAT_VALUE) {
        speedPower *= 1.1;
    }

    // Speed/offense ratio guard: extreme speed (Spe≥160, post-outlier) inflates speedPower
    // far above what a mediocre base offense can leverage. Cap speedPower to rawOffensePower+1.5
    // when base offense is weak (< 8.0, i.e. base Atk/SpA < ~128). This prevents Regieleki-style
    // pokemon from scoring LEGEND/AG through speed alone without real offensive presence.
    // The SPEED_200+ combo bonus (+0.8) still fires, capturing the real strategic upside.
    if (rawOffensePower < 8.0 && speedPower > rawOffensePower + 1.5) {
        speedPower = rawOffensePower + 1.5;
    }

    // POISON_HEAL converts Toxic Orb damage into 12.5% HP/turn healing, making the
    // pokemon significantly bulkier in practice than raw stats suggest.
    if (poke.parsedAbilities.includes('POISON_HEAL')) {
        defensePower *= 1.25;
    }

    // Eviolite boost: NFE/LC pokemon with decent defensive bulk benefit from the +50% Def/SpDef
    // item that late-game trainers can give them. Only applied when max(Def, SpDef) >= 50
    // so glass cannons don't get an undeserved defensive boost.
    // Role is already determined above (based on raw stats), so this only affects the rating value.
    if (Math.max(poke.baseDefense, poke.baseSpDefense) >= 50 && poke.evolutionData) {
        const evoType = poke.evolutionData.type;
        if (evoType === EVO_TYPE_NFE_OF_3) {
            defensePower *= 1.35;
        } else if (evoType === EVO_TYPE_LC_OF_2) {
            defensePower *= 1.25;
        } else if (evoType === EVO_TYPE_LC_OF_3) {
            defensePower *= 1.15;
        }
    }
    // Cap each power component at 10 (the "excellent" baseline). This prevents extreme
    // outlier stats (Blissey 255 HP, Chansey with Eviolite, Ninjask 195 Spe) from
    // producing absurd bstRatings that push pure walls or niche speedsters to top tiers.
    offensePower = Math.min(offensePower, 10);
    speedPower   = Math.min(speedPower,   10);
    defensePower = Math.min(defensePower, 10);
    return {
        offensePower, speedPower, defensePower, rawOffensePower, rawDefensePower, role, hugePowerRating,
        abilitiesAttackPowerMultiplier, abilitiesSpaPowerMultiplier, abilitiesSpeedPowerMultiplier,
    };
}

// ── T-159: stall archetype ────────────────────────────────────────────────────────────────────────
// A pure staller wins by residual chip + recovery, not by attacking. A mon is flipped to this archetype
// ONLY when its offence is far below what its tier is built on AND it can actually assemble the kit —
// conservative by design so teams aren't flooded with stall (owner T-159). Applies to singles and
// doubles; in doubles the "utility" slot may be a support move (redirection / Fake Out / Helping Hand).
const TRAP_CHIP_EFFECTS = ['MOVE_EFFECT_WRAP', 'MOVE_EFFECT_TRAP_BOTH', 'MOVE_EFFECT_SALT_CURE'];
const PHAZING_MOVES = new Set(['MOVE_WHIRLWIND', 'MOVE_ROAR', 'MOVE_DRAGON_TAIL', 'MOVE_CIRCLE_THROW']);
const STALL_STATUS_MOVES = new Set(['MOVE_TOXIC', 'MOVE_WILL_O_WISP', 'MOVE_LEECH_SEED']);
// Single-target protect variants (a staller wants at most ONE). Team-protects (Wide/Quick/Crafty Guard)
// are doubles support, handled separately — they must NOT count as a singles staller's Protect.
const SELF_PROTECT_MOVES = new Set([
    'MOVE_PROTECT', 'MOVE_DETECT', 'MOVE_SPIKY_SHIELD', 'MOVE_BANEFUL_BUNKER', 'MOVE_KINGS_SHIELD',
    'MOVE_OBSTRUCT', 'MOVE_SILK_TRAP', 'MOVE_BURNING_BULWARK',
]);
const isPhazingMove = m => !!m && (m.effect === 'EFFECT_ROAR' || m.effect === 'EFFECT_HIT_SWITCH_TARGET' || PHAZING_MOVES.has(m.id));
// Doubles-only support tools that can fill a staller's utility slot (owner T-159).
const DOUBLES_SUPPORT_TOOLS = new Set([
    'MOVE_FOLLOW_ME', 'MOVE_RAGE_POWDER', 'MOVE_HELPING_HAND', 'MOVE_FAKE_OUT',
    'MOVE_ALLY_SWITCH', 'MOVE_POLLEN_PUFF', 'MOVE_DECORATE',
]);
// Thresholds (computePowerAndRole units: 10 = an "excellent" stat). offensePower ≤ 6.0 ≈ base offence
// ≤ ~96, matching the corpus support/wall band (offence ≤95). The defence gap ensures bulk dominates.
const STALL_MAX_OFFENSE_POWER = 6.0;
const STALL_MIN_DEF_GAP = 2.0;
const STALL_MIN_TOOLS = 3;
const STALL_TOOL_BOOST = 1.5;       // stall-kit moves win the slots over a staller's weak attacks
const STALL_EXTRA_ATTACK_CUT = 0.4; // a pure staller wants at most ONE attack; demote the rest

function isTrappingMove(m) {
    return !!m && Array.isArray(m.additionalEffects)
        && m.additionalEffects.some(e => TRAP_CHIP_EFFECTS.includes(e));
}

// Is this move part of the stall kit? recovery / status chip / trap / phazing / cleric / hazards /
// Protect / attack-independent damage / disruption; plus doubles support tools when `doubles`.
function isStallTool(m, doubles = false) {
    if (!m) return false;
    if (comboRecoveryMoves.has(m.id)) return true;
    if (STALL_STATUS_MOVES.has(m.id)) return true;
    if (hazardSetMoves.has(m.id)) return true;
    if (onePerTeamMoves.includes(m.id)) return true;                       // Heal Bell / Aromatherapy (cleric)
    if (SELF_PROTECT_MOVES.has(m.id)) return true;
    if (m.effect === 'EFFECT_HAZE') return true;
    if (isPhazingMove(m)) return true;
    if (FIXED_DAMAGE_EFFECTS.includes(m.effect)) return true;             // Seismic Toss / Night Shade
    if (m.effect === 'EFFECT_FOUL_PLAY' || m.id === 'MOVE_KNOCK_OFF') return true;
    if (isTrappingMove(m)) return true;
    if (doubles && DOUBLES_SUPPORT_TOOLS.has(m.id)) return true;
    return false;
}

// Full movepool (level-up up to `level` + teachables) as move objects.
function movepoolObjects(poke, moves, level = 100) {
    const ids = new Set([
        ...(poke.learnset || []).filter(ls => ls.level <= level).map(ls => ls.move),
        ...(poke.teachables || []),
    ]);
    return [...ids].map(id => moves[id]).filter(Boolean);
}

// A mon is a PURE STALLER when its offence is far below its tier baseline (defensive role, low absolute
// offence, bulk clearly dominating) AND it can complete a stall kit (reliable recovery plus enough stall
// tools). Conservative: if the kit can't be satisfied, stall is NOT forced. Gated on the STAMPED role so
// the tiering pass (which runs before poke.rating exists) never triggers a stall build.
function isPureStaller(poke, moves, level = 100, doubles = false) {
    const role = poke && poke.rating && poke.rating.role;
    if (role !== 'TANK' && role !== 'BULKY') return false;
    const { offensePower, defensePower } = computePowerAndRole(poke);
    if (offensePower > STALL_MAX_OFFENSE_POWER) return false;
    if (defensePower - offensePower < STALL_MIN_DEF_GAP) return false;
    const pool = movepoolObjects(poke, moves, level);
    if (!pool.some(m => comboRecoveryMoves.has(m.id))) return false;       // no heal engine → not stall
    return pool.filter(m => isStallTool(m, doubles)).length >= STALL_MIN_TOOLS;
}

function ratePokemon(poke, moves, abilities, tmPool) {
    let bestAbilityRating = 0;
    poke.parsedAbilities.forEach(abilityId => {
        if (abilityId === 'NONE') return;
        const abilityRating = abilities[`ABILITY_${abilityId}`]?.rating || 0;
        if (abilityRating > bestAbilityRating) {
            bestAbilityRating = abilityRating;
        }
    });

    // S1: Terrain surge abilities are rated very high in abilities.h (9–10), but the combo
    // system in computeComboBonus already captures their terrain-specific value (+0.4–0.75).
    // Letting bestAbilityRating contribute its full value to absoluteRating×0.10 on top of
    // the combo bonus causes terrain setters (Tapu Koko, Tapu Lele, etc.) to rate 0.5–1.0
    // points above their Smogon tier. Cap at 7.5 to prevent double-counting.
    const surgeAbilities = new Set(['ELECTRIC_SURGE', 'GRASSY_SURGE', 'PSYCHIC_SURGE', 'MISTY_SURGE']);
    if (poke.parsedAbilities.some(a => surgeAbilities.has(a))) {
        bestAbilityRating = Math.min(bestAbilityRating, 7.5);
    }
    // MAGIC_GUARD: has an explicit +0.25 combo bonus, so ability rating (9) would double-count.
    // Cap at 7.5 to prevent the combined contribution from being too large.
    // SHADOW_TAG: no direct combo, but rated 10 in abilities.h — contributes 1.0 to the final
    // score which pushes Shadow Tag megas (Gengar) to GOD. Cap at 7.5.
    // SPEED_BOOST: SPEED_BOOST+PROTECT combo already models it (+0.5). Cap more aggressively at
    // 6.5 to prevent double-counting on top of the combo bonus.
    const capAt75Abilities = new Set(['MAGIC_GUARD', 'SHADOW_TAG',
        // Weather abilities rated 9 in abilities.h — cap same as terrain surges (7.5).
        // Combo system captures their weather-specific value; letting the ability rating
        // contribute its full 0.9 double-counts alongside the weather combo bonuses.
        'DRIZZLE', 'DROUGHT', 'SAND_STREAM', 'SNOW_WARNING',
    ]);
    if (poke.parsedAbilities.some(a => capAt75Abilities.has(a))) {
        bestAbilityRating = Math.min(bestAbilityRating, 7.5);
    }
    if (poke.parsedAbilities.some(a => a === 'SPEED_BOOST')) {
        bestAbilityRating = Math.min(bestAbilityRating, 6.5);
    }
    // DROUGHT / DRIZZLE on mega: megas can't hold Heat Rock / Damp Rock (the item that extends
    // weather to 8 turns). Their weather sets for only 5 turns and is purely self-serving —
    // the main value is the mon's own offense in sun/rain, not team-wide weather support.
    // Cap more aggressively than non-mega setters.
    if (poke.evolutionData && poke.evolutionData.isMega &&
        (poke.parsedAbilities.includes('DROUGHT') || poke.parsedAbilities.includes('DRIZZLE'))) {
        bestAbilityRating = Math.min(bestAbilityRating, 4.0);
    }
    // -ATE abilities (PIXILATE, AERILATE, REFRIGERATE, GALVANIZE): the combo system in
    // computeComboBonus already captures their STAB-conversion value via -ATE+sound (+0.4).
    // Letting them contribute their full ability.h rating (8) double-counts. Cap at 7.0.
    const ateAbilities = new Set(['PIXILATE', 'AERILATE', 'REFRIGERATE', 'GALVANIZE']);
    if (poke.parsedAbilities.some(a => ateAbilities.has(a))) {
        bestAbilityRating = Math.min(bestAbilityRating, 7.0);
    }
    // LIGHTNING_ROD / VOLT_ABSORB / MOTOR_DRIVE: draws or absorbs Electric moves.
    // In singles the "draw" mechanic is irrelevant; only the immunity matters.
    // Value scales with how much the Electric immunity helps: removing a 2x weakness is
    // excellent, but if the holder already resists/is immune to Electric, the ability
    // adds little. Sceptile Mega (Grass/Dragon) typifies the near-worthless case.
    // Ground types are already immune to Electric — ability is fully redundant.
    const elecAbsorbAbilities = new Set(['LIGHTNING_ROD', 'VOLT_ABSORB', 'MOTOR_DRIVE']);
    if (poke.parsedAbilities.some(a => elecAbsorbAbilities.has(a))) {
        const isElecWeak   = poke.parsedTypes.some(t => t === 'WATER' || t === 'FLYING');
        const isElecImmune = poke.parsedTypes.some(t => t === 'GROUND');
        if (isElecImmune) {
            // Ground is already immune — ability is completely redundant
            bestAbilityRating = Math.min(bestAbilityRating, 3.0);
        } else if (!isElecWeak) {
            // Neutral or resists Electric: immunity gives some value but far less than removing a weakness
            bestAbilityRating = Math.min(bestAbilityRating, 4.5);
        }
    }
    // SNOW_WARNING on mega pokemon: mega holders can't equip Light Clay, which is the primary
    // item that makes Snow Warning / Aurora Veil teams viable (8 turns instead of 5).
    // Without Light Clay, the snow support value is significantly diminished compared to a
    // non-mega (Alolan Ninetales) that can hold the item.
    if (poke.parsedAbilities.includes('SNOW_WARNING') && poke.evolutionData && poke.evolutionData.isMega) {
        bestAbilityRating = Math.min(bestAbilityRating, 5.0);
    }

    // To properly analyze a pokemon, we must understand its role

    let bstRating;
    // T-097 — power + role now come from the shared helper (SSOT with the doubles rater). HUGE_POWER's
    // ability-rating override is returned rather than set, so re-apply it here (singles behaviour).
    const {
        offensePower, speedPower, defensePower, rawDefensePower, role, hugePowerRating,
        abilitiesAttackPowerMultiplier, abilitiesSpaPowerMultiplier, abilitiesSpeedPowerMultiplier,
    } = computePowerAndRole(poke);
    if (hugePowerRating != null) bestAbilityRating = hugePowerRating;

    switch (role) {
        case 'BALANCED':
            bstRating = (offensePower + defensePower + speedPower) / 2.9;
            break;
        case 'OFFENSIVE':
            bstRating = offensePower * 0.55 + speedPower * 0.4 + defensePower * 0.05;
            break;
        case 'BULKY':
            bstRating = offensePower * 0.475 + defensePower * 0.475 + speedPower * 0.05;
            break;
        case 'TANK':
            bstRating = defensePower * 0.8 + offensePower * 0.15 + speedPower * 0.05;
            break;
        default:
            activeDiagnostics().warn(
                DIAGNOSTIC_CODES.ROLE_UNKNOWN,
                `Unknown battle role ${role} for ${poke.name} — assigning a balanced rating`,
                { role, pokemon: poke.id || poke.name },
            );
            bstRating = (offensePower + defensePower + speedPower) / 3;
    }

    // Offensive mega frailty penalty: Beedrill/Alakazam Mega archetype.
    // Very high offense+speed with almost no bulk — folded by any priority or fast scarfer.
    // Without penalty, the OFFENSIVE formula grossly over-rates them.
    if (poke.evolutionData && poke.evolutionData.isMega && role === 'OFFENSIVE' && defensePower <= 4.5) {
        bstRating *= 0.85;
    }
    // Non-mega extreme glass cannon penalty: Pheromosa archetype (~70/37/37 in expansion).
    // BST under 600 with very low bulk means most coverage or priority moves OHKO it before
    // it can leverage offensive stats. BEAST_BOOST×1.3 + Quiver Dance + combo cap produces
    // a score that doesn't reflect real staying power. Threshold 3.5 captures Pheromosa
    // (defensePower≈3.4) but not moderately frail pokemon like Alakazam (≈3.9) or Weavile (≈4.6).
    if (!(poke.evolutionData && poke.evolutionData.isMega) && role === 'OFFENSIVE' && rawDefensePower <= 3.5) {
        bstRating *= 0.85;
    }

    // Wonder Guard?
    // @TODO if any stat is a hard outlier, increase bst rating (deoxys, blissey)
    // @TODO What happens to Zacian and Eternatus-Emax?

    // For now we will just do absolute
    // @TODO relative

    const { moveset } = chooseMoveset(poke, moves);

    let movesRating = 0;
    moveset.forEach(moveId => {
        if (moves[moveId] && moves[moveId].rating) {
            movesRating += moves[moveId].rating;
        }
    });
    movesRating *= 0.25;

    // A4: Blend coverage score into moves rating (70% raw moves, 30% coverage).
    const coverageMetrics = computeCoverageMetrics(moveset, moves);
    movesRating = movesRating * 0.7 + coverageMetrics.coverageScore * 0.3;

    let absoluteRating = (bstRating * 0.8) + (movesRating * 0.1) + (bestAbilityRating * 0.1);

    // A6: Additive combo bonus applied after weighted formula, before BST floor clamps.
    // Keeps BST integrity intact while letting move+ability synergies meaningfully shift tier.
    const comboBonus = computeComboBonus(poke, moveset, moves, tmPool, role, defensePower);
    absoluteRating += comboBonus;

    let rawBST =
        poke.baseHP
        + poke.baseAttack * abilitiesAttackPowerMultiplier
        + poke.baseDefense
        + poke.baseSpAttack * abilitiesSpaPowerMultiplier
        + poke.baseSpDefense
        + poke.baseSpeed * abilitiesSpeedPowerMultiplier;
    
    if (rawBST >= NU_BST_THRESHOLD && absoluteRating < TIER_NU_THRESHOLD) {
        absoluteRating = TIER_NU_THRESHOLD + absoluteRating / 100;
    }

    if (rawBST >= RU_BST_THRESHOLD && absoluteRating < TIER_RU_THRESHOLD) {
        absoluteRating = TIER_RU_THRESHOLD + absoluteRating / 100;
    }

    if (rawBST >= UU_BST_THRESHOLD && absoluteRating < TIER_UU_THRESHOLD) {
        absoluteRating = TIER_UU_THRESHOLD + absoluteRating / 100;
    }

    if (rawBST >= OU_BST_THRESHOLD && absoluteRating < TIER_OU_THRESHOLD) {
        absoluteRating = TIER_OU_THRESHOLD + absoluteRating / 100;
    }

    // Stoneless megas (Rayquaza: Dragon Ascent, no stone) follow non-mega BST floor and tier rules.
    const isStoneMega = !!(poke.evolutionData && poke.evolutionData.isMega && poke.evolutionData.megaItem);
    const isMegaForFloor = isStoneMega;
    const effectiveGodBSTThreshold = isMegaForFloor ? MEGA_AG_BST_THRESHOLD : AG_BST_THRESHOLD;

    // Non-megas: BST ≥ 660 floors to LEGEND. Megas: no LEGEND BST floor — only base-form rule.
    if (!isMegaForFloor && rawBST >= LEGEND_BST_THRESHOLD && absoluteRating < TIER_LEGEND_THRESHOLD) {
        absoluteRating = TIER_LEGEND_THRESHOLD + absoluteRating / 100;
    }
    // Megas: BST ≥ 720 floors to UBERS (unchanged from before).
    if (isMegaForFloor && rawBST >= MEGA_UBERS_BST_THRESHOLD && absoluteRating < TIER_UBERS_THRESHOLD) {
        absoluteRating = TIER_UBERS_THRESHOLD + absoluteRating / 100;
    }

    if ((rawBST >= effectiveGodBSTThreshold || poke.parsedAbilities.includes('POWER_CONSTRUCT')) && absoluteRating < TIER_AG_THRESHOLD) {
        absoluteRating = TIER_AG_THRESHOLD + absoluteRating / 100;
    }

    // TANK pokemon with very low HP (Shuckle archetype): extreme defenses are undermined
    // by a tiny HP pool — nearly any SE hit OHKOs regardless of 230 Def/SpDef.
    // Override floor-clamped values to avoid inflating their tier.
    if (role === 'TANK' && poke.baseHP < 35) {
        absoluteRating = Math.min(absoluteRating, TIER_PU_THRESHOLD + 0.5);
    }
    // IMPOSTER (Ditto): transforms into the opponent's best pokemon with all their stats,
    // moves, and type. Always mirrors the strongest threat on the field. Floors it to UU
    // since it is always at least as good as the opponent's best pokemon at STRONG tier.
    if (poke.parsedAbilities.includes('IMPOSTER')) {
        absoluteRating = Math.max(absoluteRating, TIER_UU_THRESHOLD + 0.1);
    }
    // STRONG_JAW + FISHIOUS_REND (Dracovish): 255 effective BP bite move when moving first.
    // Universally considered broken in gen 8 — wallbreaks Blissey, Ho-Oh, and defensive
    // staples in one hit. The combo score alone can't reach PREMIUM because Dracovish's
    // mediocre BST (505) drives a low bstRating. Floor to PREMIUM to capture the real threat.
    const allLearnableForFloor = new Set([
        ...(poke.learnset || []).map(e => e.move),
        ...(poke.teachables || []),
    ]);
    if (poke.parsedAbilities.includes('STRONG_JAW') && allLearnableForFloor.has('MOVE_FISHIOUS_REND')) {
        absoluteRating = Math.max(absoluteRating, TIER_OU_THRESHOLD + 0.1);
    }
    // SWORD_OF_RUIN on strong physical attacker (Chien-Pao): drops all opponents' Defense by 25%.
    // Combined with high Attack (120), Ice/Dark STAB, and high Speed — definitionally Uber wallbreaker.
    // The bonusCap at 1.6 prevents the combo score from reaching LEGEND on its own; floor it instead.
    if (poke.parsedAbilities.includes('SWORD_OF_RUIN') && poke.baseAttack >= 110) {
        absoluteRating = Math.max(absoluteRating, TIER_UBERS_THRESHOLD + 0.05);
    }
    // UNSEEN_FIST + always-crit moves: Wicked Blow / Surging Strikes always crit and bypass Protect.
    // The +1.5 combo bonus pushes Urshifu to the LEGEND threshold but floating-point rounding
    // or BST headroom can leave it just under 9.0. Floor it firmly at Uber.
    if (poke.parsedAbilities.includes('UNSEEN_FIST') &&
        (allLearnableForFloor.has('MOVE_WICKED_BLOW') || allLearnableForFloor.has('MOVE_SURGING_STRIKES'))) {
        absoluteRating = Math.max(absoluteRating, TIER_UBERS_THRESHOLD + 0.05);
    }
    // BEADS_OF_RUIN on extreme special attacker (Chi-Yu): all opponents lose 25% SpDef.
    // Chi-Yu's 135 SpA + Fire/Dark STAB becomes effectively ~170 SpA equivalent.
    // Frailty caps the combo score below LEGEND; floor to Uber to capture the real threat.
    if (poke.parsedAbilities.includes('BEADS_OF_RUIN') && poke.baseSpAttack >= 130) {
        absoluteRating = Math.max(absoluteRating, TIER_UBERS_THRESHOLD + 0.05);
    }
    // QUARK_DRIVE on fast special attacker (Iron Bundle): extremely high Speed + SpA combination.
    // Freeze-Dry + Hydro Pump = nearly unresisted coverage, and Iron Bundle outspeeds the entire
    // non-Scarfed meta. Definitionally Uber despite mediocre BST 570.
    if (poke.parsedAbilities.includes('QUARK_DRIVE') && poke.baseSpAttack >= 120 && poke.baseSpeed >= 130) {
        absoluteRating = Math.max(absoluteRating, TIER_UBERS_THRESHOLD + 0.05);
    }
    // LIQUID_VOICE + HYPER_VOICE on high SpA attacker (Primarina): converts Hyper Voice to a
    // Water-type 90 BP STAB that bypasses Substitute and hits through screens. Paired with
    // Calm Mind and Wish it's one of the best bulky special attackers in UU/OU.
    if (poke.parsedAbilities.includes('LIQUID_VOICE') && allLearnableForFloor.has('MOVE_HYPER_VOICE') &&
        poke.baseSpAttack >= 120) {
        absoluteRating = Math.max(absoluteRating, TIER_OU_THRESHOLD + 0.1);
    }
    // (hasSetup / hasRecovery are scoped to computeComboBonus; re-derive here for floor checks)
    const hasSetupForFloor    = [...allLearnableForFloor].some(m => setupMoves.has(m));
    // MISTY_SURGE + setup (Tapu Fini): Calm Mind behind Misty Terrain turns Tapu Fini into a
    // setup wall that is immune to status. Water/Fairy typing gives it excellent defensive typing.
    // Valued as OU despite middling SpA because of its defensive role and terrain support.
    if (poke.parsedAbilities.includes('MISTY_SURGE') && hasSetupForFloor) {
        absoluteRating = Math.max(absoluteRating, TIER_OU_THRESHOLD + 0.1);
    }
    // PROTOSYNTHESIS + Dragon Dance on high-BST physical attacker (Gouging Fire, Raging Bolt equiv):
    // PROTOSYNTHESIS boosts the best stat in sun. Dragon Dance + Flare Blitz under PROTOSYNTHESIS
    // turns Gouging Fire into an unkillable sweeper — definitionally Uber.
    if (poke.parsedAbilities.includes('PROTOSYNTHESIS') && hasSetupForFloor && poke.baseAttack >= 110 && poke.baseBST >= 585) {
        absoluteRating = Math.max(absoluteRating, TIER_UBERS_THRESHOLD + 0.05);
    }
    // MIRROR_ARMOR + BODY_PRESS + IRON_DEFENSE (Corviknight): stat-drop immunity turns this into
    // an unkillable physical wall that attacks with its doubled Defense via Body Press. Despite
    // modest BST 495, this combination makes it nearly impossible to wear down or weaken.
    if (poke.parsedAbilities.includes('MIRROR_ARMOR') &&
        allLearnableForFloor.has('MOVE_BODY_PRESS') && allLearnableForFloor.has('MOVE_IRON_DEFENSE')) {
        absoluteRating = Math.max(absoluteRating, TIER_OU_THRESHOLD + 0.1);
    }
    // UNAWARE + TORCH_SONG + recovery (Skeledirge): TORCH_SONG is a SpA-boosting Fire STAB that
    // lets Skeledirge set up through opposing stat boosts (UNAWARE ignores them when defending).
    // Slack Off recovery means it can stall out most setup sweepers. UU-tier defensive utility.
    const comboRecoveryForFloor = new Set(['MOVE_RECOVER','MOVE_ROOST','MOVE_MOONLIGHT','MOVE_MORNING_SUN',
        'MOVE_SLACK_OFF','MOVE_SOFT_BOILED','MOVE_WISH','MOVE_REST','MOVE_SYNTHESIS','MOVE_SHORE_UP',
        'MOVE_MILK_DRINK','MOVE_LEECH_SEED']);
    if (poke.parsedAbilities.includes('UNAWARE') && allLearnableForFloor.has('MOVE_TORCH_SONG') &&
        [...allLearnableForFloor].some(m => comboRecoveryForFloor.has(m))) {
        absoluteRating = Math.max(absoluteRating, TIER_UU_THRESHOLD + 0.1);
    }
    // DRIZZLE / DROUGHT setters (fully evolved): weather setters define the metagame.
    // Their ability dictates team-building for both sides — anything with Drizzle or Drought
    // is always at minimum OU because of their unique, irreplaceable team-support role.
    // Low-BST setters (Pelipper 440, Politoed 500) can't reach PREMIUM through stats alone
    // but are universally considered OU anchors. Floor to just above PREMIUM threshold.
    const isFinalEvo = poke.evolutionData && poke.evolutionData.isFinal;
    // SNOW_WARNING + AURORA_VEIL + high Speed: the fast Aurora Veil setter archetype (Ninetales
    // Alola). BLIZZARD bonus doesn't apply (SpA 81 < 100), but its 109 Speed + Veil support
    // makes it a unique UU/OU team enabler. Floor to STRONG (UU) for this niche.
    if (isFinalEvo && poke.parsedAbilities.includes('SNOW_WARNING') &&
        allLearnableForFloor.has('MOVE_AURORA_VEIL') && poke.baseSpeed >= 100) {
        absoluteRating = Math.max(absoluteRating, TIER_UU_THRESHOLD + 0.1);
    }
    // Physically frail mega cap: megas with very low Defense (≤65) and high BST (≥600) are
    // severely vulnerable to priority and fast physical attackers despite their raw offensive power.
    // They can't reliably set up or absorb neutral physical hits. Gardevoir Mega (65 Def, 618 BST)
    // typifies this — it has never been Uber in Smogon competitive history despite absurd SpA.
    if (isMegaForFloor && poke.baseDefense <= 65 && poke.baseBST >= 600) {
        absoluteRating = Math.min(absoluteRating, TIER_UBERS_THRESHOLD - 0.05);
    }
    // Non-mega extreme glass cannon GOD cap: Pheromosa archetype (~70/37/37 in expansion,
    // defensePower≈3.375) can reach GOD tier via BEAST_BOOST × Quiver Dance × combo cap,
    // but in practice it's OHKO'd by priority before it sweeps. Threshold 3.5 matches
    // the bstRating penalty above. Cap at just below GOD so it remains Uber-tier but not AG.
    if (!(poke.evolutionData && poke.evolutionData.isMega) && role === 'OFFENSIVE' && rawDefensePower <= 3.5) {
        absoluteRating = Math.min(absoluteRating, TIER_AG_THRESHOLD - 0.01);
    }

    // These tiers are kinda working. I should add that OU is actually exclusive pokemon and UU-RU are the average fully evolved ones
    // GOD should only be used by extremely hard bosses. Should not come up in the game in general. Esp. Eternatus Emax
    // Stone megas need MEGA_AG_RATING_THRESHOLD (10.0) to reach AG; non-megas and stoneless megas
    // (Rayquaza) need only TIER_AG_THRESHOLD (9.75). Stone megas have inflated stats the model rewards
    // generously; stoneless megas like Rayquaza are effectively the same pokemon as their base form.
    let tier = tierFromRating(absoluteRating, { isStoneMega });

    // If no damage moves are reachable in this context (learnset + tmPool-filtered teachables),
    // the pokemon cannot contribute offensively at all. Force MAGIKARP regardless of BST/ability.
    // This fires for contextual ratings (tmPool = empty Set) when all learnset moves are status moves.
    const availableMoveIds = [
        ...poke.learnset.map(ls => ls.move),
        ...(poke.teachables || []).filter(m => tmPool && tmPool.has(m)),
    ];
    if (!availableMoveIds.some(id => {
        const m = moves[id];
        return m && (m.category === 'DAMAGE_CATEGORY_PHYSICAL' || m.category === 'DAMAGE_CATEGORY_SPECIAL');
    })) {
        tier = TIER_MAGIKARP;
        absoluteRating = 0;
    }

    return {
        absoluteRating,
        absoluteBSTRating: bstRating,
        bestMoveset: moveset,
        movesRating,
        bestAbilityRating,
        coverageMetrics,
        comboBonus,
        tier,
        role,
    };
}

/**
 * wishiwashiEffectivePoke — Schooling special case.
 *
 * Wishiwashi's Solo form schools into the School form at level 20+ (and reverts to Solo if
 * its HP drops to <=25%). Since only the Solo form is ever placed, the rater must score it
 * as the School form once it can school. Schooling swaps the entire form, so we take the
 * School entry's 6 base stats AND its typing, then nerf HP by 25% (the revert zone is dead
 * weight). Solo's abilities / learnset / teachables are kept — the party member is the Solo
 * species; only its stats and typing change on transform. The inputs are never mutated.
 *
 * level defaults to Infinity so absolute callers always get the School form; contextual
 * callers pass the level cap and get the Solo form back unchanged below level 20.
 */
function wishiwashiEffectivePoke(soloPoke, schoolPoke, level = Infinity) {
    if (level < WISHIWASHI_SCHOOL_LEVEL) return soloPoke; // can't school yet → Solo form
    const baseHP = Math.floor(schoolPoke.baseHP * WISHIWASHI_SCHOOL_HP_FACTOR);
    const eff = {
        ...soloPoke, // keep id / abilities / learnset / teachables
        baseHP,
        baseAttack:    schoolPoke.baseAttack,
        baseDefense:   schoolPoke.baseDefense,
        baseSpeed:     schoolPoke.baseSpeed,
        baseSpAttack:  schoolPoke.baseSpAttack,
        baseSpDefense: schoolPoke.baseSpDefense,
        parsedTypes:   schoolPoke.parsedTypes, // Schooling swaps the full form → School's typing
        types:         schoolPoke.types,
    };
    eff.baseBST = eff.baseHP + eff.baseAttack + eff.baseDefense
                + eff.baseSpeed + eff.baseSpAttack + eff.baseSpDefense;
    return eff;
}

/**
 * palafinEffectivePoke — Zero-to-Hero special case.
 *
 * Palafin Zero transforms into the battle-only Hero form the first time it switches out. The
 * switch is essentially free and the change is permanent for the battle, so in practice the mon
 * is always Hero. We keep Zero's identity (id / learnset / teachables / abilities — the forms
 * share learnsets) but adopt Hero's full stats and typing.
 *
 * Unlike wishiwashiEffectivePoke there is NO level gate and NO HP nerf: the transform has no
 * level requirement and the single turn spent in Zero form before switching is negligible.
 */
function palafinEffectivePoke(zeroPoke, heroPoke) {
    const eff = {
        ...zeroPoke, // keep id / abilities / learnset / teachables (forms share learnsets)
        baseHP:        heroPoke.baseHP,
        baseAttack:    heroPoke.baseAttack,
        baseDefense:   heroPoke.baseDefense,
        baseSpeed:     heroPoke.baseSpeed,
        baseSpAttack:  heroPoke.baseSpAttack,
        baseSpDefense: heroPoke.baseSpDefense,
        parsedTypes:   heroPoke.parsedTypes, // Zero-to-Hero swaps the full form → Hero's typing
        types:         heroPoke.types,
    };
    eff.baseBST = eff.baseHP + eff.baseAttack + eff.baseDefense
                + eff.baseSpeed + eff.baseSpAttack + eff.baseSpDefense;
    return eff;
}

/**
 * rateContextual — same algorithm as ratePokemon, but restricted to a trainer's universe.
 *
 * context = { level: number, tms: string[] }
 *   - level: cap the learnset to moves learned at or below this level
 *   - tms: only these TM move IDs are considered available (pass [] for learnset-only)
 *
 * The generic rating (poke.rating) is never modified by this function.
 * Calling rateContextual(poke, moves, abilities, { level: 100, tms: [...fullTmPool] })
 * produces the exact same result as ratePokemon(poke, moves, abilities, fullTmPool).
 */
function rateContextual(poke, moves, abilities, context) {
    const { level = 100, tms = [] } = context;
    const restrictedPoke = {
        ...poke,
        learnset: poke.learnset.filter(entry => entry.level <= level),
    };
    const restrictedTmPool = new Set(tms);
    return ratePokemon(restrictedPoke, moves, abilities, restrictedTmPool);
}

// ── T-094 / ADR-015 — doubles move rating ────────────────────────────────────────────────────────
// Spread targets hit 2+ Pokémon in a double battle. `.includes` also matches the gen-conditional
// target strings (e.g. Surf/Earthquake's `B_UPDATED_MOVE_DATA >= GEN_4 ? ... : ...`).
const SPREAD_TARGET_TOKENS = ['MOVE_TARGET_BOTH', 'MOVE_TARGET_FOES_AND_ALLY', 'MOVE_TARGET_ALL_BATTLERS'];

function isSpreadMove(move) {
    const target = (move && move.target) || '';
    return SPREAD_TARGET_TOKENS.some(tok => target.includes(tok));
}

// T-095/ADR-015 — moves near-worthless in singles but pivotal in doubles: a doubles-specific floor.
// Refined against the Group 2B research + owner-validated Batch-2 gaps (see docs/research/rating-decisions.md).
const DOUBLES_SUPPORT_RATINGS = {
    MOVE_FOLLOW_ME: 7, MOVE_RAGE_POWDER: 7,                                        // redirection
    MOVE_HELPING_HAND: 6, MOVE_AFTER_YOU: 5, MOVE_COACHING: 4.5, MOVE_DECORATE: 6, // ally buffs
    MOVE_WIDE_GUARD: 5, MOVE_QUICK_GUARD: 4, MOVE_ALLY_SWITCH: 4,                   // protection / positioning
    MOVE_TRICK_ROOM: 7, MOVE_TAILWIND: 7.5,                                        // speed control (archetype-defining)
    MOVE_PROTECT: 5.5, MOVE_DETECT: 5.5, MOVE_SPIKY_SHIELD: 5.5,                    // self-protection (scout + stall for ally)
    MOVE_KINGS_SHIELD: 5.5, MOVE_BANEFUL_BUNKER: 5.5, MOVE_SILK_TRAP: 5.5,
    // Batch-2 (T-100 rating-gaps, owner-validated 2026-07-10) — doubles-only floors.
    // (Fake Out was in the gap list but rateMove already scores it ~8.86 via the first-turn bonus, so
    //  no floor is needed — verified, see docs/research/rating-decisions.md.)
    MOVE_TAUNT: 6.5,                                                               // gates setup/speed-control/redirection (doubles floor only; singles base unchanged)
    MOVE_SNARL: 6, MOVE_FAKE_TEARS: 6, MOVE_STRUGGLE_BUG: 5.5,                      // spread offensive stat-drop = doubles support, not a penalty
    MOVE_ICY_WIND: 6, MOVE_ELECTROWEB: 5.5, MOVE_BULLDOZE: 5,                       // spread speed control
    MOVE_PERISH_SONG: 5.5,                                                         // wincon vs bulk (trapping combo deferred: Shadow Tag decision open)
    // T-141 — Encore is premium doubles disruption (locks a foe into a bad move; devastating off Prankster).
    // (Parting Shot needs no floor — rateMove already scores it ~8 in singles.)
    MOVE_ENCORE: 6.5,
};

// Doubles value of a move: the singles rating plus a spread bonus for damaging moves that hit both
// foes (gen-6+ doubles deal 0.75x per target but hit two → ~1.5x total damage). Foes-only spread
// (BOTH) gets the full bonus; spread that also hits the ally (FOES_AND_ALLY / ALL_BATTLERS) gets a
// reduced bonus for the friendly-fire cost. Then a doubles-support floor (T-095) lifts the moves that
// singles rates near zero but doubles relies on.
function rateMoveDoubles(move) {
    let rating = rateMove(move);
    if (Number(move.power) > 0 && isSpreadMove(move)) {
        const hitsAlly = /MOVE_TARGET_(FOES_AND_ALLY|ALL_BATTLERS)/.test(move.target || '');
        rating *= hitsAlly ? 1.2 : 1.35;
    }
    const support = DOUBLES_SUPPORT_RATINGS[move.id];
    if (support !== undefined) rating = Math.max(rating, support);
    return rating;
}

// T-096/ADR-015 — abilities whose value jumps in doubles. Keyed by ABILITY_* (matching the abilities
// object). A floor: max'd against the singles aiRating, so a doubles-relevant ability is never rated
// below its singles value. Initial pass — refined against the Group 2B research.
const DOUBLES_ABILITY_RATINGS = {
    // Redirection draws (the "draw" half is worthless in singles, decisive in doubles).
    ABILITY_LIGHTNING_ROD: 8, ABILITY_STORM_DRAIN: 8, ABILITY_VOLT_ABSORB: 7, ABILITY_MOTOR_DRIVE: 6,
    ABILITY_INTIMIDATE: 9,                                          // lowers BOTH foes' Attack
    ABILITY_FRIEND_GUARD: 6, ABILITY_HOSPITALITY: 6, ABILITY_TELEPATHY: 5, // ally protection / heal (doubles-only; T-141)
    ABILITY_HEALER: 4, ABILITY_SYMBIOSIS: 4, ABILITY_AROMA_VEIL: 4, // ally support
    ABILITY_DEFIANT: 7, ABILITY_COMPETITIVE: 7,                     // punish the ubiquitous Intimidate (T-141: 6→7, on 69% of doubles teams)
    ABILITY_JUSTIFIED: 5, ABILITY_RATTLED: 4,                       // trigger more often
    ABILITY_OVERCOAT: 4,                                            // spread powder / weather immunity
};

// Doubles value of an ability: the singles aiRating, floored up for doubles-relevant abilities.
function rateAbilityDoubles(abilityKey, ability) {
    const base = (ability && ability.rating) || 0;
    const floor = DOUBLES_ABILITY_RATINGS[abilityKey];
    return floor !== undefined ? Math.max(base, floor) : base;
}

// T-141 — ally-only abilities do NOTHING in singles (they act solely on an ally, which is absent in a
// 1v1), yet the C aiRating scores them as if useful — inflating the singles tier of Tatsugiri (Commander
// 10!), Sinistcha (Hospitality 5), Flamigo (Costar 5), Stonjourner (Power Spot 2). Corrected to 0 for the
// SINGLES rating; their DOUBLES value is restored by DOUBLES_ABILITY_RATINGS / the combo. Owner-authorised
// clear-error fix (docs/research/doubles-support.md §4c) — the only sanctioned singles rating change.
const SINGLES_ABILITY_CORRECTIONS = {
    ABILITY_COMMANDER: 0, ABILITY_HOSPITALITY: 0, ABILITY_COSTAR: 0, ABILITY_POWER_SPOT: 0,
};
function rateAbilitySingles(abilityKey, ability) {
    const corrected = SINGLES_ABILITY_CORRECTIONS[abilityKey];
    return corrected !== undefined ? corrected : ((ability && ability.rating) || 0);
}

// ── T-097 — DOUBLES pokemon rating ────────────────────────────────────────────────────────────────────
// Mirrors the singles composition (bstRating·0.8 + movesRating·0.1 + abilityRating·0.1 + comboBonus) with
// doubles-adjusted pieces (owner-validated design). Singles rating is untouched.

// bstRating RE-WEIGHTED for doubles (owner ✔ bulk↑ / raw Speed↓): in 6v6 speed control (TR / Tailwind /
// Icy Wind + redundancy) makes raw Speed less binary and bulk is premium (surviving spread damage).
function bstRatingDoubles({ offensePower, defensePower, speedPower }, role) {
    switch (role) {
        case 'BALANCED':  return (offensePower + defensePower * 1.2 + speedPower * 0.8) / 2.9;
        case 'OFFENSIVE': return offensePower * 0.50 + defensePower * 0.25 + speedPower * 0.25;
        case 'BULKY':     return offensePower * 0.40 + defensePower * 0.55 + speedPower * 0.05;
        case 'TANK':      return defensePower * 0.80 + offensePower * 0.15 + speedPower * 0.05;
        default:          return (offensePower + defensePower + speedPower) / 3;
    }
}

// The doubles value the tier must reflect (rating-decisions.md → T-097): Trick Room inversion, spread
// attacker, support (redirection / Intimidate / Fake Out / speed control), pivots/Regenerator. POTENTIAL-
// based (ability pool + learnable moves), like the weather abuser score — not the chosen singles moveset.
// Additive, capped (like computeComboBonus). Weights tunable.
const DOUBLES_COMBO = {
    trickRoom: 0.5, spread: 0.4, redirection: 0.5, intimidate: 0.5, fakeOut: 0.35, speedControl: 0.4,
    pivot: 0.3, terrain: 0.45, weather: 0.45, friendGuard: 0.35, prankster: 0.4, cap: 1.0,   // T-097 tuning: cap lowered 1.5→1.0 (temper stacking); prankster T-141
};
// T-141 — support moves that Prankster upgrades to priority (the reason Prankster is a doubles-skewed ability).
const PRANKSTER_SUPPORT_MOVES = ['MOVE_TAILWIND', 'MOVE_TAUNT', 'MOVE_THUNDER_WAVE', 'MOVE_ENCORE', 'MOVE_FOLLOW_ME', 'MOVE_RAGE_POWDER', 'MOVE_WILL_O_WISP'];
const DOUBLES_SURGE_ABILITIES = ['ELECTRIC_SURGE', 'GRASSY_SURGE', 'PSYCHIC_SURGE', 'MISTY_SURGE'];
// Weather is a doubles archetype (corpus) — a setter is premium support, like a terrain setter.
const DOUBLES_WEATHER_ABILITIES = ['DROUGHT', 'DRIZZLE', 'SAND_STREAM', 'SNOW_WARNING', 'ORICHALCUM_PULSE'];
function computeComboBonusDoubles(poke, moves, { offensePower }) {
    const abils = poke.parsedAbilities || [];
    const learnable = new Set([...(poke.learnset || []).map(l => l.move), ...(poke.teachables || [])]);
    const canLearn = list => list.some(m => learnable.has(m));
    let bonus = 0;
    // Trick Room: a slow + strong mon moves first under TR (premium abuser).
    if ((poke.baseSpeed == null ? 999 : poke.baseSpeed) <= 55 && offensePower >= 6) bonus += DOUBLES_COMBO.trickRoom;
    // Spread attacker: can field a damaging spread move (Earthquake / Rock Slide / Heat Wave / Dazzling Gleam…).
    if (offensePower >= 5 && [...learnable].some(m => moves[m] && Number(moves[m].power) > 0 && isSpreadMove(moves[m]))) bonus += DOUBLES_COMBO.spread;
    // Redirection (ability draw or Follow Me / Rage Powder).
    if (abils.some(a => a === 'LIGHTNING_ROD' || a === 'STORM_DRAIN') || canLearn(['MOVE_FOLLOW_ME', 'MOVE_RAGE_POWDER'])) bonus += DOUBLES_COMBO.redirection;
    if (abils.includes('INTIMIDATE')) bonus += DOUBLES_COMBO.intimidate;                                   // -Atk both foes
    if (canLearn(['MOVE_FAKE_OUT'])) bonus += DOUBLES_COMBO.fakeOut;                                        // free turn / flinch
    if (canLearn(['MOVE_TAILWIND', 'MOVE_TRICK_ROOM', 'MOVE_ICY_WIND', 'MOVE_ELECTROWEB'])) bonus += DOUBLES_COMBO.speedControl;
    if (abils.includes('REGENERATOR') || canLearn(['MOVE_U_TURN', 'MOVE_VOLT_SWITCH', 'MOVE_FLIP_TURN'])) bonus += DOUBLES_COMBO.pivot; // 6v6 momentum
    // T-097 tuning — terrain setters (Tapu-style), weather setters (Drought/Drizzle/…), + Friend Guard:
    // bulky field/ally support (owner ✔; weather is a doubles archetype in the corpus).
    if (abils.some(a => DOUBLES_SURGE_ABILITIES.includes(a))) bonus += DOUBLES_COMBO.terrain;
    if (abils.some(a => DOUBLES_WEATHER_ABILITIES.includes(a))) bonus += DOUBLES_COMBO.weather;
    // Ally-support abilities (Friend Guard / Hospitality): dedicated doubles support (T-141: + Hospitality).
    if (abils.includes('FRIEND_GUARD') || abils.includes('HOSPITALITY')) bonus += DOUBLES_COMBO.friendGuard;
    // Prankster on a support kit gives +1 priority to Tailwind / Taunt / T-Wave / Encore / redirection (T-141).
    if (abils.includes('PRANKSTER') && canLearn(PRANKSTER_SUPPORT_MOVES)) bonus += DOUBLES_COMBO.prankster;
    return Math.min(bonus, DOUBLES_COMBO.cap);
}

// ── T-141 (owner round 4) — DOUBLES support RATING + its own tier dimension ─────────────────────────
// Support is its OWN doubles axis (like the offensive tier). A mon's support value = the sum of its
// support tools, each scored by a QUALITY TIER — elite 8 / good 5 / filler 2 — MINUS a penalty for the
// mon's own offense (a strong attacker that carries a support tool isn't a dedicated support). The summed
// rating maps to its own support RU/UU/OU thresholds.
//
// Why quality tiers (owner round 4): the earlier model valued each tool by raw corpus frequency but CAPPED
// it (Intimidate's 43 → 8), which FLATTENED every tool to ≈8 and let BREADTH win — Calyrex's six *filler*
// tools (Helping Hand, Heal Pulse, Light Screen, Life Dew, Reflect, Skill Swap; zero elite) summed to 31
// and out-scored Amoonguss's three *elite* tools (Spore + Rage Powder + Regenerator). Owner: "el hecho de
// que pueda aprender ≥2 no lo hace support dedicado" — only a real support COMBINATION counts, and a good
// OU attacker isn't a support just because it can learn a couple. The three quality tiers (frequency-
// informed, then doubles-expert-corrected — redirection Rage Powder/Follow Me are elite though the Gen 6-7
// corpus under-counts Follow Me) make the rating encode the owner's own rule exactly: 2 elite tools → 16
// (UU), 3 elite → 24 (OU), while filler breadth barely moves (six filler ≈ 12). Protect is EXCLUDED
// (universal utility, on 56% of ALL mons incl. attackers — not a support discriminator).
// docs/research/doubles-support.md §2-3.
// T-147 (owner, corpus-validated) — a PREMIUM tier (12) above elite (8): the genuinely build-defining
// doubles tools that must set the top of the (now relative) scale — redirection (Follow Me 5% but corpus-
// under-counted / archetype-defining; Rage Powder 11%), Fake Out (36% — 2nd only to Protect), Tailwind
// (22% speed control), Spore (14% hard-disable). Taunt/Thunder Wave stay ELITE (common but universal TMs,
// so the relative scale — not their raw value — stops them from manufacturing a support). Wide Guard 10 (an
// owner call — only 8% corpus, so between good and premium). See tasks/T-147 + docs/research/doubles-support.md.
const SUPPORT_PREMIUM = 12, SUPPORT_ELITE = 8, SUPPORT_GOOD = 5, SUPPORT_FILLER = 2;
const SUPPORT_MOVE_POINTS = {
    // PREMIUM (12) — build-defining: redirection, Fake Out, speed control, hard-disable.
    MOVE_FAKE_OUT: 12, MOVE_TAILWIND: 12, MOVE_RAGE_POWDER: 12, MOVE_FOLLOW_ME: 12, MOVE_SPORE: 12,
    // ELITE (8) — strong but common/universal disruption + Trick Room / Perish Song.
    MOVE_TRICK_ROOM: 8, MOVE_TAUNT: 8, MOVE_WILL_O_WISP: 8, MOVE_THUNDER_WAVE: 8, MOVE_PERISH_SONG: 8,
    MOVE_WIDE_GUARD: 10,
    // GOOD (5) — real support, but not alone build-defining: guards, single-target speed drops, cleric, pivot.
    MOVE_HELPING_HAND: 5, MOVE_QUICK_GUARD: 5, MOVE_ICY_WIND: 5, MOVE_ELECTROWEB: 5,
    MOVE_SNARL: 5, MOVE_ENCORE: 5, MOVE_PARTING_SHOT: 5, MOVE_SLEEP_POWDER: 5, MOVE_DECORATE: 5,
    MOVE_POLLEN_PUFF: 5, MOVE_COACHING: 5, MOVE_NUZZLE: 5, MOVE_AROMATHERAPY: 5, MOVE_HEAL_BELL: 5,
    // FILLER (2) — situational / unreliable: heals, screens, one-target utility, RNG sleep.
    MOVE_HEAL_PULSE: 2, MOVE_LIFE_DEW: 2, MOVE_WISH: 2, MOVE_LIGHT_SCREEN: 2, MOVE_REFLECT: 2,
    MOVE_AURORA_VEIL: 2, MOVE_INSTRUCT: 2, MOVE_DISABLE: 2, MOVE_YAWN: 2, MOVE_AFTER_YOU: 2,
    MOVE_ALLY_SWITCH: 2, MOVE_SKILL_SWAP: 2, MOVE_FEINT: 2, MOVE_FAKE_TEARS: 2, MOVE_STRUGGLE_BUG: 2,
    MOVE_HYPNOSIS: 2, MOVE_LOVELY_KISS: 2, MOVE_GRASS_WHISTLE: 2, MOVE_SING: 2,
};
const SUPPORT_ABILITY_POINTS = {
    // MAX (16) — dedicated-support signature abilities (Gen 8/9; absent from the Gen 6-7 corpus, so this is
    // a mechanics call, owner T-147): Friend Guard (25% ally damage cut) / Hospitality (heal ally on entry).
    FRIEND_GUARD: 16, HOSPITALITY: 16,
    // ELITE (8) — the build-defining doubles support abilities (Intimidate is on 52% of corpus teams).
    // PRANKSTER is NOT here — it is a ×1.5 MULTIPLIER on the whole support total (its value is conditional
    // on carrying status moves; see supportRating).
    INTIMIDATE: 8, REGENERATOR: 8, ELECTRIC_SURGE: 8, MISTY_SURGE: 8, GRASSY_SURGE: 8,
    PSYCHIC_SURGE: 8,
    // GOOD (5) — redirection abilities, priority-block, ally healers/guards.
    ARMOR_TAIL: 5, STORM_DRAIN: 5, LIGHTNING_ROD: 5, QUEENLY_MAJESTY: 5, DAZZLING: 5, HEALER: 5,
    AROMA_VEIL: 5, SWEET_VEIL: 5, TELEPATHY: 5,
    // RUIN (4, owner T-147) — the Ruin abilities drop a stat of every other mon (incl. the ally); a small
    // team-wide utility credit. No corpus data (Gen 9).
    BEADS_OF_RUIN: 4, SWORD_OF_RUIN: 4, TABLETS_OF_RUIN: 4, VESSEL_OF_RUIN: 4,
    // FILLER (2) — absorb typings that only incidentally help an ally.
    WATER_ABSORB: 2, VOLT_ABSORB: 2, SAP_SIPPER: 2,
};
const SUPPORT_TOOL_CAP = 16;             // T-147 — raised 8 → 16 so the premium/max tools take full effect
const PRANKSTER_SUPPORT_MULT = 1.5;      // T-147 — Prankster multiplies the support total (conditional value)
// T-147 — "god combo" bonuses: Encore is far stronger with priority (Prankster) or paired with Tailwind.
const ENCORE_COMBO_BONUS = 4;
// Penalty by the mon's OFFENSIVE doubles tier (its real threat level), NOT raw stats: a support with high
// UNUSED offence (Sinistcha — 121 SpA but offensively RU) keeps its full support value, while a genuine
// OU+ attacker's support value is heavily discounted (owner: a good OU attacker is NOT a support just
// because it can learn a couple of support moves). RU-or-weaker offence → no penalty.
const SUPPORT_PENALTY_BY_TIER = { [TIER_UU]: 3, [TIER_OU]: 10, [TIER_UBERS]: 16, [TIER_LEGEND]: 22, [TIER_AG]: 28 };
// The DOUBLES support tiers — thresholds on the (quality-tier points − offensive-tier-penalty) scale,
// calibrated so the corpus support exemplars land OU and pure attackers fall out. With elite tools worth 8,
// this encodes the owner's own rule directly: 1 elite tool (8) < RU → a half-support attacker, NOT a
// support; 2 elite (16) → UU; 3+ elite (24) → OU. Filler (2 each) barely moves the needle, so breadth of
// mediocre moves can't manufacture a support (Calyrex's six filler tools ≈ 12 → below UU alone).
// T-147 — ABSOLUTE fallback thresholds only (isolated callers / tests). The PIPELINE uses the RELATIVE
// scale (computeSupportScale). Recalibrated up for the premium (12) values so a lone premium tool doesn't
// clear RU: 1 premium (12) < RU; 2 tools (~20-24) → UU; 3 tools (~30+) → OU.
const SUPPORT_TIER_THRESHOLDS = { OU: 30, UU: 20, RU: 13 };
// A support must also be VIABLE — a frail pre-evo (Smoliv) dies before it supports, no matter its kit. So
// each support tier has a minimum BST (real OU supports: Whimsicott 480 / Amoonguss 464 / Sinistcha 508 /
// Cresselia 600); a low-BST mon caps out at the tier its BST allows, or drops out entirely.
const SUPPORT_TIER_MIN_BST = { OU: 440, UU: 380, RU: 320 };

// The species' doubles SUPPORT rating: Σ capped tool points − offensive-tier penalty (never below 0).
// `offensiveTier` is the mon's pure offensive doubles tier; falls back to tierFromRatingDoubles(poke.
// ratingDoubles) (set at rating time) so detectors/selectors can call it with just the poke.
// `applyPranksterMult` (T-147): the dex-wide scale (computeSupportScale) computes its MAX with this OFF, so
// a Prankster ×1.5 outlier doesn't compress the percentile band — Prankster mons still rise above the max
// via the multiplier when their OWN (mult-on) rating is compared to the scale, they just don't define it.
function supportRating(poke, offensiveTier, { applyPranksterMult = true } = {}) {
    const abils = poke.parsedAbilities || [];
    const learnable = new Set([...(poke.learnset || []).map(l => l.move), ...(poke.teachables || [])]);
    let pts = 0;
    for (const mv in SUPPORT_MOVE_POINTS) if (learnable.has(mv)) pts += Math.min(SUPPORT_MOVE_POINTS[mv], SUPPORT_TOOL_CAP);
    for (const a of abils) if (SUPPORT_ABILITY_POINTS[a]) pts += Math.min(SUPPORT_ABILITY_POINTS[a], SUPPORT_TOOL_CAP);
    // T-147 — god combos: Encore is far stronger with priority (Prankster) or paired with Tailwind.
    if (learnable.has('MOVE_ENCORE')) {
        if (abils.includes('PRANKSTER')) pts += ENCORE_COMBO_BONUS;
        if (learnable.has('MOVE_TAILWIND')) pts += ENCORE_COMBO_BONUS;
    }
    // T-147 — Prankster gives every status move +1 priority → it MULTIPLIES the support kit's value (its
    // worth is conditional on carrying status moves), rather than adding a flat amount.
    if (applyPranksterMult && abils.includes('PRANKSTER')) pts *= PRANKSTER_SUPPORT_MULT;
    const offT = offensiveTier || (typeof poke.ratingDoubles === 'number' ? tierFromRatingDoubles(poke.ratingDoubles) : null);
    return Math.max(0, pts - (SUPPORT_PENALTY_BY_TIER[offT] || 0));
}
// T-147 — relative-to-max support tiers. The universal TMs (Taunt/Thunder Wave = +16 to almost everyone)
// lift every raw score equally, so ABSOLUTE thresholds mislabel filler-attackers OU. Scale the tiers to the
// run's MAX support rating: OU ≥ 0.75·max, UU ≥ 0.50·max, RU ≥ 0.25·max — with a floor so ≥10 BST-viable
// mons always reach OU (matters when the support pool is small). Owner-validated (T-147); on the live bundle
// this drops OU support from ~97 to ~22 and Zangoose 27 → UU. `SUPPORT_TIER_THRESHOLDS` remains the absolute
// fallback for isolated callers (no dex scale available).
const SUPPORT_OU_MIN_COUNT = 10;
const bstOf = p => (p.baseHP || 0) + (p.baseAttack || 0) + (p.baseDefense || 0) + (p.baseSpAttack || 0) + (p.baseSpDefense || 0) + (p.baseSpeed || 0);
function computeSupportScale(pokes) {
    const offT = p => tierFromRatingDoubles(p.ratingDoubles);
    // The percentile band's MAX excludes the Prankster ×1.5 (owner T-147) so one Prankster outlier can't
    // compress OU down to the floor for everyone else.
    const baseMax = Math.max(0, ...pokes.map(p => supportRating(p, offT(p), { applyPranksterMult: false })));
    // The ≥10-OU floor uses the ACTUAL (mult-on) ratings among BST-OU-viable mons, so ≥10 real mons always
    // clear the OU bar (and frail high-scorers don't count).
    const viableActual = pokes.filter(p => bstOf(p) >= SUPPORT_TIER_MIN_BST.OU).map(p => supportRating(p, offT(p))).filter(r => r > 0).sort((a, b) => b - a);
    const tenth = viableActual.length ? viableActual[Math.min(SUPPORT_OU_MIN_COUNT, viableActual.length) - 1] : 0;
    return { OU: Math.min(0.75 * baseMax, tenth), UU: 0.5 * baseMax, RU: 0.25 * baseMax };
}
// The support TIER (OU/UU/RU) or null — the highest tier where BOTH the rating clears the (relative or, by
// default, absolute) threshold AND the BST clears the viability minimum (a frail pre-evo with a big kit is
// capped down or dropped).
function supportTierDoubles(poke, offensiveTier, scale = SUPPORT_TIER_THRESHOLDS) {
    const r = supportRating(poke, offensiveTier);
    const bst = bstOf(poke);
    if (r >= scale.OU && bst >= SUPPORT_TIER_MIN_BST.OU) return TIER_OU;
    if (r >= scale.UU && bst >= SUPPORT_TIER_MIN_BST.UU) return TIER_UU;
    if (r >= scale.RU && bst >= SUPPORT_TIER_MIN_BST.RU) return TIER_RU;
    return null;
}
// T-147 — second pass over the whole dex: compute the relative scale and (re)stamp each mon's support tier,
// numeric rating, support-dominant flag and effective tierDoubles (= max of offensive & support tiers).
// Called by pokedexModule after the per-poke doubles rating. Returns the scale (for logging/audit).
function assignSupportTiersDoubles(pokes) {
    const scale = computeSupportScale(pokes);
    for (const p of pokes) {
        const offT = tierFromRatingDoubles(p.ratingDoubles);
        const supT = supportTierDoubles(p, offT, scale);
        p.supportRatingDoubles = supportRating(p, offT);
        p.supportTierDoubles = supT;
        p.isSupportDoubles = !!supT && TIER_SEQ.indexOf(supT) > TIER_SEQ.indexOf(offT);
        p.tierDoubles = p.isSupportDoubles ? supT : offT;
    }
    return scale;
}
// A mon is a dedicated support iff its SUPPORT tier is at least as high as its OFFENSIVE tier (owner T-147:
// "si tier normal > tier support NO ES SUPPORT"). An OU attacker that merely learns a couple of support
// moves (support tier RU, offence OU) is NOT a dedicated support — so the support role/hard-pick never
// fields it. Prefers the STORED relative tiers stamped by assignSupportTiersDoubles; falls back to an
// isolated compute for tests.
function isDedicatedSupport(poke) {
    if (!poke) return false;
    const offT = tierFromRatingDoubles(poke.ratingDoubles);
    const supT = (poke.supportTierDoubles !== undefined) ? poke.supportTierDoubles : supportTierDoubles(poke, offT);
    return !!supT && TIER_SEQ.indexOf(supT) >= TIER_SEQ.indexOf(offT);
}

// ITEMISED support breakdown — the exact tools + their quality-tier points, the offensive-tier penalty and
// the resulting rating/tier. Powers the decision-log's support ranking (owner: "me gustaría poder auditar
// eso"): so the log can show WHY a mon is OU/UU support, not just the number. Tools sorted best-first.
function supportToolBreakdown(poke, offensiveTier) {
    const abils = poke.parsedAbilities || [];
    const learnable = new Set([...(poke.learnset || []).map(l => l.move), ...(poke.teachables || [])]);
    const tools = [];
    for (const mv in SUPPORT_MOVE_POINTS) if (learnable.has(mv)) tools.push({ id: mv, kind: 'move', value: SUPPORT_MOVE_POINTS[mv] });
    for (const a of abils) if (SUPPORT_ABILITY_POINTS[a]) tools.push({ id: a, kind: 'ability', value: SUPPORT_ABILITY_POINTS[a] });
    tools.sort((x, y) => y.value - x.value);
    const pts = tools.reduce((s, t) => s + t.value, 0);
    const offT = offensiveTier || (typeof poke.ratingDoubles === 'number' ? tierFromRatingDoubles(poke.ratingDoubles) : null);
    const penalty = SUPPORT_PENALTY_BY_TIER[offT] || 0;
    return { tools, pts, offTier: offT, penalty, rating: Math.max(0, pts - penalty), tier: supportTierDoubles(poke, offT) };
}

// The doubles SUPPORT moves this species can learn, ranked best-first (quality-tier value). Used to build a
// dedicated support's moveset — its role IS support, so it should carry its best support moves rather than
// an all-attacking set (owner: "el moveset debería saber que su rol es support"). Moves only (abilities are
// chosen separately). `filter(move)` optionally gates on the trainer's reachable moves (TM bag / level).
function topSupportMoves(poke, { filter = null, limit = Infinity } = {}) {
    const learnable = new Set([...(poke.learnset || []).map(l => l.move), ...(poke.teachables || [])]);
    const ranked = Object.keys(SUPPORT_MOVE_POINTS)
        .filter(mv => learnable.has(mv) && (!filter || filter(mv)))
        .sort((a, b) => SUPPORT_MOVE_POINTS[b] - SUPPORT_MOVE_POINTS[a]);
    return Number.isFinite(limit) ? ranked.slice(0, limit) : ranked;
}

// T-097 tuning (owner ✔): doubles punishes FRAILTY harder (a frail mon is folded by spread damage) and does
// not reward a PASSIVE wall (bulk with no offence and no support role isn't a doubles threat).
const DBL_FRAILTY_DEF = 5.5, DBL_FRAILTY_FACTOR = 0.5;      // ratingDoubles -= (5.5 - defensePower)·0.5 when frail
const DBL_PASSIVE_OFF = 4.0, DBL_PASSIVE_COMBO = 0.3, DBL_PASSIVE_PENALTY = 0.8;

// The doubles rating of a mon (parallel to ratePokemon's absoluteRating). Uses the doubles move/ability
// values (move.ratingDoubles / ability.ratingDoubles) + the re-weighted bstRating + the doubles combo.
// T-097 — the doubles tier scale has its OWN thresholds (owner ✔), calibrated so the doubles-rating
// distribution populates tiers ~like singles (base pokedex, matched proportions). Tunable.
const DOUBLES_TIER_THRESHOLDS = { AG: 9.4, LEGEND: 9.0, UBERS: 8.3, OU: 7.65, UU: 7.0, RU: 6.05, NU: 4.75, PU: 3.05, ZU: 1.4 };
function tierFromRatingDoubles(ratingDoubles) {
    const T = DOUBLES_TIER_THRESHOLDS;
    if (ratingDoubles >= T.AG)     return TIER_AG;
    if (ratingDoubles >= T.LEGEND) return TIER_LEGEND;
    if (ratingDoubles >= T.UBERS)  return TIER_UBERS;
    if (ratingDoubles >= T.OU)     return TIER_OU;
    if (ratingDoubles >= T.UU)     return TIER_UU;
    if (ratingDoubles >= T.RU)     return TIER_RU;
    if (ratingDoubles >= T.NU)     return TIER_NU;
    if (ratingDoubles >= T.PU)     return TIER_PU;
    if (ratingDoubles >= T.ZU)     return TIER_ZU;
    return TIER_MAGIKARP;
}

// `moveset` MUST be passed (the singles rater's chosen bestMoveset) so this consumes NO rng — calling
// chooseMoveset again would perturb the shared rng stream and silently shift the SINGLES ratings + the
// downstream pipeline. Doubles-aware move selection is deferred to T-109; here we rate the singles set with
// the doubles move values. Falls back to chooseMoveset only for standalone/unit use.
function ratePokemonDoubles(poke, moves, abilities, tmPool, moveset = null) {
    let bestAbilityRating = 0;
    poke.parsedAbilities.forEach(abilityId => {
        if (abilityId === 'NONE') return;
        const ab = abilities[`ABILITY_${abilityId}`];
        const r = ab ? (ab.ratingDoubles != null ? ab.ratingDoubles : (ab.rating || 0)) : 0;
        if (r > bestAbilityRating) bestAbilityRating = r;
    });
    const {
        offensePower, speedPower, defensePower, role, hugePowerRating,
        abilitiesAttackPowerMultiplier, abilitiesSpaPowerMultiplier, abilitiesSpeedPowerMultiplier,
    } = computePowerAndRole(poke);
    if (hugePowerRating != null) bestAbilityRating = Math.max(bestAbilityRating, hugePowerRating);
    const bstRating = bstRatingDoubles({ offensePower, defensePower, speedPower }, role);
    if (!moveset) moveset = chooseMoveset(poke, moves).moveset;
    let movesRating = 0;
    moveset.forEach(moveId => {
        const m = moves[moveId];
        if (m) movesRating += (m.ratingDoubles != null ? m.ratingDoubles : (m.rating || 0));
    });
    movesRating *= 0.25;
    const coverageMetrics = computeCoverageMetrics(moveset, moves);
    movesRating = movesRating * 0.7 + coverageMetrics.coverageScore * 0.3;
    const combo = computeComboBonusDoubles(poke, moves, { offensePower });
    let ratingDoubles = (bstRating * 0.8) + (movesRating * 0.1) + (bestAbilityRating * 0.1) + combo;
    // T-097 tuning — frailty penalty (spread damage folds frail mons) + passive-wall penalty (bulk with no
    // offence and no support role isn't a doubles threat).
    if (defensePower < DBL_FRAILTY_DEF) ratingDoubles -= (DBL_FRAILTY_DEF - defensePower) * DBL_FRAILTY_FACTOR;
    if (offensePower < DBL_PASSIVE_OFF && combo < DBL_PASSIVE_COMBO) ratingDoubles -= DBL_PASSIVE_PENALTY;

    // T-140 — BST floor (parity with the singles rater): raw BST guarantees a minimum tier, so BST keeps
    // pacing the run in doubles too. Same format-independent BST cutoffs as singles; the DOUBLES tier
    // thresholds are the floor targets. Applied AFTER the penalties, so BST has the final word — a
    // high-BST frail mon is never rated below its BST tier just because spread damage folds it.
    const rawBST = poke.baseHP
        + poke.baseAttack * abilitiesAttackPowerMultiplier
        + poke.baseDefense
        + poke.baseSpAttack * abilitiesSpaPowerMultiplier
        + poke.baseSpDefense
        + poke.baseSpeed * abilitiesSpeedPowerMultiplier;
    const DT = DOUBLES_TIER_THRESHOLDS;
    const floorTo = (threshold) => { if (ratingDoubles < threshold) ratingDoubles = threshold + ratingDoubles / 100; };
    // Stone megas follow the mega BST rules (UBERS/AG); non-megas the LEGEND rule — mirrors singles.
    const isStoneMega = !!(poke.evolutionData && poke.evolutionData.isMega && poke.evolutionData.megaItem);
    if (rawBST >= NU_BST_THRESHOLD) floorTo(DT.NU);
    if (rawBST >= RU_BST_THRESHOLD) floorTo(DT.RU);
    if (rawBST >= UU_BST_THRESHOLD) floorTo(DT.UU);
    if (rawBST >= OU_BST_THRESHOLD) floorTo(DT.OU);
    if (!isStoneMega && rawBST >= LEGEND_BST_THRESHOLD) floorTo(DT.LEGEND);
    if (isStoneMega && rawBST >= MEGA_UBERS_BST_THRESHOLD) floorTo(DT.UBERS);
    if (rawBST >= (isStoneMega ? MEGA_AG_BST_THRESHOLD : AG_BST_THRESHOLD) || poke.parsedAbilities.includes('POWER_CONSTRUCT')) floorTo(DT.AG);

    // T-141 (owner r3) — SUPPORT is its own doubles axis. The mon is worth the HIGHER of its offensive and
    // support tiers; when support strictly beats offense, support is its identity → tagged (the viewer shows
    // a "support" tag on top of the role/tier). teambuilding uses the effective tierDoubles.
    const offensiveTier = tierFromRatingDoubles(ratingDoubles);
    const supTier = supportTierDoubles(poke, offensiveTier);
    const supportDominant = supTier != null && TIER_SEQ.indexOf(supTier) > TIER_SEQ.indexOf(offensiveTier);
    return {
        ratingDoubles,
        tierDoubles: supportDominant ? supTier : offensiveTier,
        role,
        supportTierDoubles: supTier,
        supportRatingDoubles: supportRating(poke, offensiveTier), // numeric — stored for the audit ranking
        isSupportDoubles: supportDominant,
    };
}

// T-111 — the per-level DOUBLES rating (mirror of rateContextual). `singlesMoveset` is the singles
// contextual bestMoveset at this cap — passed so this consumes NO rng (see ratePokemonDoubles). Returns
// { absoluteRating, tier } to match the singles contextualRatings[cap] shape the selectors read.
function rateContextualDoubles(poke, moves, abilities, context, singlesMoveset = null) {
    const { level = 100, tms = [] } = context;
    const restrictedPoke = { ...poke, learnset: poke.learnset.filter(entry => entry.level <= level) };
    const rd = ratePokemonDoubles(restrictedPoke, moves, abilities, new Set(tms), singlesMoveset);
    return { absoluteRating: rd.ratingDoubles, tier: rd.tierDoubles };
}

module.exports = {
    ratePokemon,
    ratePokemonDoubles,
    rateAbilitySingles,
    supportRating,
    supportTierDoubles,
    computeSupportScale,          // T-147 — relative support scale (dex-wide)
    assignSupportTiersDoubles,    // T-147 — second-pass relative tier assignment
    supportToolBreakdown,
    topSupportMoves,
    isDedicatedSupport,
    bstRatingDoubles,
    computeComboBonusDoubles,
    tierFromRating,
    tierFromRatingDoubles,
    rateContextual,
    rateContextualDoubles,
    isSpreadMove,
    rateMoveDoubles,
    rateAbilityDoubles,
    wishiwashiEffectivePoke,
    palafinEffectivePoke,
    chooseMoveset,
    adjustMoveset,
    chooseNature,
    rateMove,
    rateMoveForAPokemon,
    rateItemForAPokemon,
    damageMultiplier,
    isSuperEffective,
    computeCoverageMetrics,
    computeComboBonus,
    isPureStaller,      // T-159 — stall-archetype breakpoint
    isStallTool,        // T-159 — stall-kit membership
    computePowerAndRole,
}