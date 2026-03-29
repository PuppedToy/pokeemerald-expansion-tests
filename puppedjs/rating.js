const {
    TIER_USELESS,
    TIER_TRASH,
    TIER_BAD,
    TIER_WEAK,
    TIER_AVERAGE,
    TIER_STRONG,
    TIER_PREMIUM,
    TIER_LEGEND,
    TIER_GOD,
    TIER_GOD_THRESHOLD,
    TIER_LEGEND_THRESHOLD,
    TIER_PREMIUM_THRESHOLD,
    TIER_STRONG_THRESHOLD,
    TIER_AVERAGE_THRESHOLD,
    TIER_WEAK_THRESHOLD,
    TIER_BAD_THRESHOLD,
    TIER_TRASH_THRESHOLD,
    POKEMON_TYPE_POISON,
    POKEMON_TYPE_GRASS,
    GOD_BST_THRESHOLD,
    LEGEND_BST_THRESHOLD,
    PREMIUM_BST_THRESHOLD,
    STRONG_BST_THRESHOLD,
    AVERAGE_BST_THRESHOLD,
    WEAK_BST_THRESHOLD,
    MEGA_GOD_BST_THRESHOLD,
    MEGA_LEGEND_BST_THRESHOLD,
    EVO_TYPE_NFE_OF_3,
    EVO_TYPE_LC_OF_2,
    EVO_TYPE_LC_OF_3,
    NATURES,
} = require('./constants');
const { plates, protectionBerries } = require('./items');

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

const superCritMoves = [
    'MOVE_STORM_THROW',
    'MOVE_FROST_BREATH',
    'MOVE_SURGING_STRIKES',
    'MOVE_WICKED_BLOW',
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
    
    MOVE_WIDE_GUARD: 1,
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
    MOVE_POWER_TRICK: 2,
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
    MOVE_FOCUS_ENERGY: 5,
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
    MOVE_GRASS_WHISTLE: 4.5,
    MOVE_YAWN: 5,
    MOVE_LOVELY_KISS: 6.5,
    MOVE_SLEEP_POWDER: 7,
    EFFECT_DARK_VOID: 7,
    MOVE_SPORE: 10,
    MOVE_THUNDER_WAVE: 7,
    MOVE_GLARE: 7.5,

    MOVE_HEAL_BELL: 6,
    MOVE_AROMATHERAPY: 6,

    MOVE_SPIKES: 6,
    MOVE_TOXIC_SPIKES: 6.5,
    MOVE_STEALTH_ROCK: 8,
    MOVE_STICKY_WEB: 8,

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
    if (statusList[move.id]) {
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
            return 3;
        }

        if (
            move.effect === 'EFFECT_ACCURACY_DOWN'
            || move.effect === 'EFFECT_DEFENSE_CURL'
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
            || move.effect === 'EFFECT_ATTACK_DOWN_2'
            || move.effect === 'EFFECT_SPECIAL_ATTACK_DOWN_2'
            || move.effect === 'EFFECT_DEFENSE_DOWN_2'
            || move.effect === 'EFFECT_SPECIAL_DEFENSE_DOWN_2'
            || move.effect === 'EFFECT_TICKLE'
            || move.effect === 'EFFECT_NOBLE_ROAR'
        ) {
            return 4.5;
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
    let power = move.power || 50;
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
    let rating = Math.min(10 * power / 140, 12);
    const isOhko = moveEffect.includes('EFFECT_OHKO');
    if (isOhko) rating = 12;
    let accuracy = move.accuracy || 110;
    if (accuracy == 0) accuracy = 110;
    rating -= (100 - accuracy) / 10;
    const priority = move.priority || 0;
    rating += priority;
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
    const isRecoil = moveEffect.includes('EFFECT_RECOIL');
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
    const isRecoilIfMiss = moveEffect.includes('EFFECT_RECOIL_IF_MISS');
    if (isRecoilIfMiss) {
        rating *= (100 - accuracy)/100;
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
    MOVE_COUNTER: 'hp',
    MOVE_MIRROR_COAT: 'hp',
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
    MOVE_LOW_KICK: 'none',
    MOVE_GRASS_KNOT: 'none',
};

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
function rateMoveForAPokemon(move, poke, ability, item, otherMoves, currentMoves) {
    if (
        (
            currentMoves.filter(m => m.category !== 'DAMAGE_CATEGORY_STATUS').length < 2
            || item === 'Choice Band'
            || item === 'Choice Specs'
            || item === 'Assault Vest'
            || (item === 'Choice Scarf' && move.effect !== 'EFFECT_TRICK')
        )
        && move.category === 'DAMAGE_CATEGORY_STATUS'
    ) {
        return 0;
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

    if (
        selfDamagingEffects.includes(move.effect)
        && item === 'Focus Sash'
    ) {
        return 0;
    }

    const hasAbility = (abilityToQuery) => {
        return ability === abilityToQuery || (!ability && poke.parsedAbilities.includes(abilityToQuery));
    }

    let rating = move.rating;

    // Combos
    const comboIndex = comboList.findIndex(combo => combo.effects.includes(move.effect));
    if (comboIndex >= 0) {
        const combo = comboList[comboIndex];
        if (currentMoves.some(m => combo.effects.includes(m.effect) && m.id !== move.id)) {
            rating = combo.rating;
        }
    }

    // Special Ratings
    if (move.id === 'MOVE_AURORA_VEIL' && hasAbility('SNOW_WARNING')) {
        rating = 10;
    }
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

    if (Object.keys(specialScalingMoves).includes(move.id)) {
        const scalingStat = specialScalingMoves[move.id];
        if (scalingStat === 'hp') {
            rating += poke.baseHP / 100;
        } else if (scalingStat === '-speed') {
            rating += (200 - poke.baseSpeed) / 100;
        } else if (scalingStat === 'speed') {
            rating += poke.baseSpeed / 100;
        } else if (scalingStat === 'weight') {
            rating += Math.min(poke.weight / 100, 2);
        } else if (scalingStat === 'defense') {
            rating += poke.baseDefense / 100;
        } else if (scalingStat === 'defvsatk') {
            const maxDefPlusHp = Math.max(poke.baseDefense + poke.baseHP, poke.baseSpDefense + poke.baseHP) / 2;
            const maxAtk = Math.max(poke.baseAttack, poke.baseSpAttack);
            rating += maxDefPlusHp / maxAtk;
        }
    }
    else if (move.category === 'DAMAGE_CATEGORY_PHYSICAL') {
        rating += poke.baseAttack / 100;
    }
    else if (move.category === 'DAMAGE_CATEGORY_SPECIAL') {
        rating += poke.baseSpAttack / 100;
    }
    // Status moves value defenses (except setup, which need to be evaluated differently @TODO)
    else {
        rating += (poke.baseHP + poke.baseDefense + poke.baseSpDefense) / 300;
    }

    if (move.category !== 'DAMAGE_CATEGORY_STATUS') {
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

        // If another damaging move of the same type exists, devalue this move
        if (currentMoves.some(m => m.category !== 'DAMAGE_CATEGORY_STATUS' && m.type === move.type)) {
            rating *= 0.3;
        }
    }

    // @TODO move base rating + stab + ability synergy + other moves synergy, coverage
    return rating;
}

function rateItemForAPokemon(item, poke, ability, moveset, level, bagSize, bannedItems = [], deviation = 0) {
    if (bannedItems.includes(item)) {
        return 0;
    }
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
    const calculatedDeviation = 1 + ((Math.random() ? 1 : -1) * Math.random() * deviation);
    moveset.forEach(move => {
        if (move.category !== 'DAMAGE_CATEGORY_STATUS' && !checkedTypes.includes(move.type)) {
            checkedTypes.push(move.type);
            coverageRating += 2.5;
        }
    });

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
        return 5 * calculatedDeviation;
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
        return 10 * genericDefensePower * Math.random() * calculatedDeviation;
    }
    if (item === 'Eject Button') {
        return 10 * Math.random() * calculatedDeviation;
    }
    if (item === 'Red Card') {
        return 7 * Math.random() * calculatedDeviation;
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
        return 6 * Math.random() * calculatedDeviation;
    }
    if (item === 'Rowap Berry') {
        return 6 * Math.random() * calculatedDeviation;
    }
    if (item === 'Mirror Herb') {
        return 7 * Math.random() * calculatedDeviation;
    }
    if (item === 'Adrenaline Orb') {
        return 5 * Math.random() * calculatedDeviation;
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
function chooseMoveset(poke, moves, level = 100, startingMoveset = [], ability = null, item = null, tmsInBag = null, deviation = 0) {
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
            console.warn(`Warning: Move ${moveId} not found for ${poke.name}`);
            return null;
        }
        return {
            ...move,
            rating: rateMove(move),
        };
    }).filter(m => m !== null);

    while (uniqueMoves.length > 0 && moveset.length < 4) {
        const ratedMoves = uniqueMoves.map(move => {
            const rating = rateMoveForAPokemon(move, poke, ability, item, uniqueMoves, moveset) * (1 + ((Math.random() ? 1 : -1) * Math.random() * deviation));
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
            // Exception: different priority tiers
            if ((weaker.priority || 0) !== (stronger.priority || 0)) continue;
            // Exception: Iron Fist with two punching moves of the same type
            if (ability === 'IRON_FIST' && punchingMoves.includes(weaker.id) && punchingMoves.includes(stronger.id)) continue;
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
                const rating = rateMoveForAPokemon(move, poke, ability, item, uniqueMoves, moveset) * (1 + ((Math.random() ? 1 : -1) * Math.random() * deviation));
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

function adjustMoveset(poke, level = 100, moveset, importantMoves, moves, ability = null, item = null, deviation = 0) {
    if (!moveset || moveset.length !== 4) {
        // We just can't replace non full sets
        return moveset;
    }

    const learnableMoves = [
        ...poke.learnset.filter(ls => ls.level <= level).map(ls => ls.move),
    ].map(moveId => moves[moveId]).filter(m => m !== undefined && !moveset.includes(m.id));

    const ratings = [];
    for (let i = 0; i < moveset.length; i++) {
        const movesWithoutThisMove = moveset.filter((m, index) => index !== i).map(m => moves[m]);
        ratings.push(rateMoveForAPokemon(
            moves[moveset[i]],
            poke,
            ability,
            item,
            learnableMoves,
            movesWithoutThisMove
        ));
    }

    const bestRating = Math.max(...ratings);

    // Reverse loop so we try to replace the worst moves first
    for (let i = moveset.length - 1; i >= 0; i--) {
        // If the rating is < 1 or is < bestRating / 2, we reconsider it
        if (!importantMoves.includes(moveset[i]) && (ratings[i] < 1 || ratings[i] < bestRating / 2)) {
            const movesWithoutThisMove = moveset.filter((m, index) => index !== i).map(m => moves[m]);
            const ratedMoves = learnableMoves.map(move => {
                const rating = rateMoveForAPokemon(
                    move,
                    poke,
                    ability,
                    item,
                    learnableMoves,
                    movesWithoutThisMove
                );
                return {
                    ...move,
                    rating: rating * (1 + ((Math.random() ? 1 : -1) * Math.random() * deviation)),
                };
            });
            if (ratedMoves.length === 0) {
                continue;
            }
            const sortedMoves = ratedMoves.sort((a, b) => b.rating - a.rating);
            const bestReplacement = sortedMoves[0];
            if (bestReplacement.rating > ratings[i] + 1) {
                const oldMoveset = [...moveset];
                moveset[i] = bestReplacement.id;
                console.log(`Adjusted moves from ${poke.id} @ ${item}: replaced old ${oldMoveset} -> ${moveset}.
        - Old move had a rating of ${ratings[i].toFixed(2)}, new move ${bestReplacement.id} has a rating of ${bestReplacement.rating.toFixed(2)}`);
            }
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
            rating: rating + ((Math.random() ? 1 : -1) * Math.random() * deviation * 5),
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
function computeComboBonus(poke, moveset, moves, tmPool) {
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
    const physicalPriorityIds = new Set([
        'MOVE_BULLET_PUNCH', 'MOVE_MACH_PUNCH', 'MOVE_AQUA_JET', 'MOVE_SHADOW_SNEAK',
        'MOVE_SUCKER_PUNCH', 'MOVE_EXTREME_SPEED', 'MOVE_ICE_SHARD', 'MOVE_QUICK_ATTACK',
        'MOVE_JET_PUNCH', 'MOVE_FIRST_IMPRESSION', 'MOVE_FAKE_OUT',
        'MOVE_GRASSY_GLIDE',  // +1 priority in Grassy Terrain (GRASSY_SURGE setter always creates it)
    ]);
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
    if (hasHazard && hasReliableRecovery) {
        bonus += 0.4;
        bonusLog.push('HAZARD+RECOVERY +0.4');
    } else if (hasHazard && hasAnyMove(new Set(['MOVE_REST']))) {
        bonus += 0.2;
        bonusLog.push('HAZARD+REST +0.2');
    }

    // Pivot + reliable recovery or Regenerator: net HP-positive every pivot cycle.
    // Makes switch-ins free over the long game (Landorus-T, Tornadus-T, Corviknight).
    // Requires reliable recovery (not Rest) because Rest+Sleep loses 2 turns after pivoting.
    if (hasPivot && (hasReliableRecovery || hasAbility('REGENERATOR'))) {
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

// @TODO Maybe add a level-based rating too for the right context
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
    const capAt75Abilities = new Set(['MAGIC_GUARD', 'SHADOW_TAG']);
    if (poke.parsedAbilities.some(a => capAt75Abilities.has(a))) {
        bestAbilityRating = Math.min(bestAbilityRating, 7.5);
    }
    if (poke.parsedAbilities.some(a => a === 'SPEED_BOOST')) {
        bestAbilityRating = Math.min(bestAbilityRating, 6.5);
    }

    // To properly analyze a pokemon, we must understand its role

    let bstRating;
    let abilitiesAttackPowerMultiplier = 1;
    let abilitiesSpaPowerMultiplier = 1;
    let abilitiesSpeedPowerMultiplier = 1;
    if (poke.parsedAbilities.includes('HUGE_POWER') || poke.parsedAbilities.includes('PURE_POWER')) {
        abilitiesAttackPowerMultiplier = 2;
        bestAbilityRating = poke.baseAttack / 12;
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
            console.warn(`Warning: Unknown role ${role} for ${poke.name}. Assigning balanced rating.`);
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
    const comboBonus = computeComboBonus(poke, moveset, moves, tmPool);
    absoluteRating += comboBonus;

    let rawBST =
        poke.baseHP
        + poke.baseAttack * abilitiesAttackPowerMultiplier
        + poke.baseDefense
        + poke.baseSpAttack * abilitiesSpaPowerMultiplier
        + poke.baseSpDefense
        + poke.baseSpeed * abilitiesSpeedPowerMultiplier;
    
    if (rawBST >= WEAK_BST_THRESHOLD && absoluteRating < TIER_WEAK_THRESHOLD) {
        absoluteRating = TIER_WEAK_THRESHOLD + absoluteRating / 100;
    }

    if (rawBST >= AVERAGE_BST_THRESHOLD && absoluteRating < TIER_AVERAGE_THRESHOLD) {
        absoluteRating = TIER_AVERAGE_THRESHOLD + absoluteRating / 100;
    }

    if (rawBST >= STRONG_BST_THRESHOLD && absoluteRating < TIER_STRONG_THRESHOLD) {
        absoluteRating = TIER_STRONG_THRESHOLD + absoluteRating / 100;
    }

    if (rawBST >= PREMIUM_BST_THRESHOLD && absoluteRating < TIER_PREMIUM_THRESHOLD) {
        absoluteRating = TIER_PREMIUM_THRESHOLD + absoluteRating / 100;
    }

    const isMegaForFloor = poke.evolutionData && poke.evolutionData.isMega;
    const effectiveLegendBSTThreshold = isMegaForFloor ? MEGA_LEGEND_BST_THRESHOLD : LEGEND_BST_THRESHOLD;
    const effectiveGodBSTThreshold = isMegaForFloor ? MEGA_GOD_BST_THRESHOLD : GOD_BST_THRESHOLD;

    if (rawBST >= effectiveLegendBSTThreshold && absoluteRating < TIER_LEGEND_THRESHOLD) {
        absoluteRating = TIER_LEGEND_THRESHOLD + absoluteRating / 100;
    }

    if ((rawBST >= effectiveGodBSTThreshold || poke.parsedAbilities.includes('POWER_CONSTRUCT')) && absoluteRating < TIER_GOD_THRESHOLD) {
        absoluteRating = TIER_GOD_THRESHOLD + absoluteRating / 100;
    }

    // TANK pokemon with very low HP (Shuckle archetype): extreme defenses are undermined
    // by a tiny HP pool — nearly any SE hit OHKOs regardless of 230 Def/SpDef.
    // Override floor-clamped values to avoid inflating their tier.
    if (role === 'TANK' && poke.baseHP < 35) {
        absoluteRating = Math.min(absoluteRating, TIER_BAD_THRESHOLD + 0.5);
    }
    // IMPOSTER (Ditto): transforms into the opponent's best pokemon with all their stats,
    // moves, and type. Always mirrors the strongest threat on the field. Floors it to UU
    // since it is always at least as good as the opponent's best pokemon at STRONG tier.
    if (poke.parsedAbilities.includes('IMPOSTER')) {
        absoluteRating = Math.max(absoluteRating, TIER_STRONG_THRESHOLD + 0.1);
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
        absoluteRating = Math.max(absoluteRating, TIER_PREMIUM_THRESHOLD + 0.1);
    }
    // SWORD_OF_RUIN on strong physical attacker (Chien-Pao): drops all opponents' Defense by 25%.
    // Combined with high Attack (120), Ice/Dark STAB, and high Speed — definitionally Uber wallbreaker.
    // The bonusCap at 1.6 prevents the combo score from reaching LEGEND on its own; floor it instead.
    if (poke.parsedAbilities.includes('SWORD_OF_RUIN') && poke.baseAttack >= 110) {
        absoluteRating = Math.max(absoluteRating, TIER_LEGEND_THRESHOLD + 0.05);
    }
    // UNSEEN_FIST + always-crit moves: Wicked Blow / Surging Strikes always crit and bypass Protect.
    // The +1.5 combo bonus pushes Urshifu to the LEGEND threshold but floating-point rounding
    // or BST headroom can leave it just under 9.0. Floor it firmly at Uber.
    if (poke.parsedAbilities.includes('UNSEEN_FIST') &&
        (allLearnableForFloor.has('MOVE_WICKED_BLOW') || allLearnableForFloor.has('MOVE_SURGING_STRIKES'))) {
        absoluteRating = Math.max(absoluteRating, TIER_LEGEND_THRESHOLD + 0.05);
    }
    // BEADS_OF_RUIN on extreme special attacker (Chi-Yu): all opponents lose 25% SpDef.
    // Chi-Yu's 135 SpA + Fire/Dark STAB becomes effectively ~170 SpA equivalent.
    // Frailty caps the combo score below LEGEND; floor to Uber to capture the real threat.
    if (poke.parsedAbilities.includes('BEADS_OF_RUIN') && poke.baseSpAttack >= 130) {
        absoluteRating = Math.max(absoluteRating, TIER_LEGEND_THRESHOLD + 0.05);
    }
    // QUARK_DRIVE on fast special attacker (Iron Bundle): extremely high Speed + SpA combination.
    // Freeze-Dry + Hydro Pump = nearly unresisted coverage, and Iron Bundle outspeeds the entire
    // non-Scarfed meta. Definitionally Uber despite mediocre BST 570.
    if (poke.parsedAbilities.includes('QUARK_DRIVE') && poke.baseSpAttack >= 120 && poke.baseSpeed >= 130) {
        absoluteRating = Math.max(absoluteRating, TIER_LEGEND_THRESHOLD + 0.05);
    }
    // LIQUID_VOICE + HYPER_VOICE on high SpA attacker (Primarina): converts Hyper Voice to a
    // Water-type 90 BP STAB that bypasses Substitute and hits through screens. Paired with
    // Calm Mind and Wish it's one of the best bulky special attackers in UU/OU.
    if (poke.parsedAbilities.includes('LIQUID_VOICE') && allLearnableForFloor.has('MOVE_HYPER_VOICE') &&
        poke.baseSpAttack >= 120) {
        absoluteRating = Math.max(absoluteRating, TIER_PREMIUM_THRESHOLD + 0.1);
    }
    // (hasSetup / hasRecovery are scoped to computeComboBonus; re-derive here for floor checks)
    const hasSetupForFloor    = [...allLearnableForFloor].some(m => setupMoves.has(m));
    // MISTY_SURGE + setup (Tapu Fini): Calm Mind behind Misty Terrain turns Tapu Fini into a
    // setup wall that is immune to status. Water/Fairy typing gives it excellent defensive typing.
    // Valued as OU despite middling SpA because of its defensive role and terrain support.
    if (poke.parsedAbilities.includes('MISTY_SURGE') && hasSetupForFloor) {
        absoluteRating = Math.max(absoluteRating, TIER_PREMIUM_THRESHOLD + 0.1);
    }
    // PROTOSYNTHESIS + Dragon Dance on high-BST physical attacker (Gouging Fire, Raging Bolt equiv):
    // PROTOSYNTHESIS boosts the best stat in sun. Dragon Dance + Flare Blitz under PROTOSYNTHESIS
    // turns Gouging Fire into an unkillable sweeper — definitionally Uber.
    if (poke.parsedAbilities.includes('PROTOSYNTHESIS') && hasSetupForFloor && poke.baseAttack >= 110 && poke.baseBST >= 585) {
        absoluteRating = Math.max(absoluteRating, TIER_LEGEND_THRESHOLD + 0.05);
    }
    // MIRROR_ARMOR + BODY_PRESS + IRON_DEFENSE (Corviknight): stat-drop immunity turns this into
    // an unkillable physical wall that attacks with its doubled Defense via Body Press. Despite
    // modest BST 495, this combination makes it nearly impossible to wear down or weaken.
    if (poke.parsedAbilities.includes('MIRROR_ARMOR') &&
        allLearnableForFloor.has('MOVE_BODY_PRESS') && allLearnableForFloor.has('MOVE_IRON_DEFENSE')) {
        absoluteRating = Math.max(absoluteRating, TIER_PREMIUM_THRESHOLD + 0.1);
    }
    // UNAWARE + TORCH_SONG + recovery (Skeledirge): TORCH_SONG is a SpA-boosting Fire STAB that
    // lets Skeledirge set up through opposing stat boosts (UNAWARE ignores them when defending).
    // Slack Off recovery means it can stall out most setup sweepers. UU-tier defensive utility.
    const comboRecoveryForFloor = new Set(['MOVE_RECOVER','MOVE_ROOST','MOVE_MOONLIGHT','MOVE_MORNING_SUN',
        'MOVE_SLACK_OFF','MOVE_SOFT_BOILED','MOVE_WISH','MOVE_REST','MOVE_SYNTHESIS','MOVE_SHORE_UP',
        'MOVE_MILK_DRINK','MOVE_LEECH_SEED']);
    if (poke.parsedAbilities.includes('UNAWARE') && allLearnableForFloor.has('MOVE_TORCH_SONG') &&
        [...allLearnableForFloor].some(m => comboRecoveryForFloor.has(m))) {
        absoluteRating = Math.max(absoluteRating, TIER_STRONG_THRESHOLD + 0.1);
    }
    // Non-mega extreme glass cannon GOD cap: Pheromosa archetype (~70/37/37 in expansion,
    // defensePower≈3.375) can reach GOD tier via BEAST_BOOST × Quiver Dance × combo cap,
    // but in practice it's OHKO'd by priority before it sweeps. Threshold 3.5 matches
    // the bstRating penalty above. Cap at just below GOD so it remains Uber-tier but not AG.
    if (!(poke.evolutionData && poke.evolutionData.isMega) && role === 'OFFENSIVE' && rawDefensePower <= 3.5) {
        absoluteRating = Math.min(absoluteRating, TIER_GOD_THRESHOLD - 0.01);
    }

    // These tiers are kinda working. I should add that OU is actually exclusive pokemon and UU-RU are the average fully evolved ones
    // GOD should only be used by extremely hard bosses. Should not come up in the game in general. Esp. Eternatus Emax
    let tier;
    if (absoluteRating >= TIER_GOD_THRESHOLD) {
        tier = TIER_GOD;
    }
    else if (absoluteRating >= TIER_LEGEND_THRESHOLD) {
        tier = TIER_LEGEND;
    }
    else if (absoluteRating >= TIER_PREMIUM_THRESHOLD) {
        tier = TIER_PREMIUM;
    }
    else if (absoluteRating >= TIER_STRONG_THRESHOLD) {
        tier = TIER_STRONG;
    }
    else if (absoluteRating >= TIER_AVERAGE_THRESHOLD) {
        tier = TIER_AVERAGE;
    }
    else if (absoluteRating >= TIER_WEAK_THRESHOLD) {
        tier = TIER_WEAK;
    }
    else if (absoluteRating >= TIER_BAD_THRESHOLD) {
        tier = TIER_BAD;
    }
    else if (absoluteRating >= TIER_TRASH_THRESHOLD) {
        tier = TIER_TRASH;
    }
    else {
        tier = TIER_USELESS;
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

module.exports = {
    ratePokemon,
    chooseMoveset,
    adjustMoveset,
    chooseNature,
    rateMove,
    rateItemForAPokemon,
    damageMultiplier,
    isSuperEffective,
    computeCoverageMetrics,
    computeComboBonus,
}