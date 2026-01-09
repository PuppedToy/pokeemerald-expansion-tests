const {
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
    POKEMON_TYPE_POISON,
    POKEMON_TYPE_GRASS,
    GOD_BST_THRESHOLD,
    LEGEND_BST_THRESHOLD,
    PREMIUM_BST_THRESHOLD,
    STRONG_BST_THRESHOLD,
    AVERAGE_BST_THRESHOLD,
    WEAK_BST_THRESHOLD,
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
        if (chart && chart[defType.toUpperCase()]) {
            result *= chart[defType.toUpperCase()];
        }
    });
    return result;
}

function isSuperEffective(attackingType, defendingTypes) {
    return damageMultiplier(attackingType, defendingTypes) > 1;
}

// @TODO Use it later for movesets
const comboList = [
    {
        effects: ['EFFECT_ENDURE', 'EFFECT_FLAIL'],
        rating: 8,
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
        effects: ['EFFECT_BATON_PASS', 'EFFECT_SHIFT_GEAR'],
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
    ],
    [
        'MOVE_STOCKPILE',
        'MOVE_COSMIC_POWER',
        'MOVE_DEFEND_ORDER',
    ],
];

const onePerTeamMoves = ['MOVE_HEAL_BELL', 'MOVE_AROMATHERAPY'];

// @TODO These should have their own treatment
const weatherMoves = [
    'MOVE_RAIN_DANCE',
    'MOVE_SUNNY_DAY',
    'MOVE_HAIL',
    'MOVE_SANDSTORM',
];

const specialStrategiesMoves = [
    'MOVE_TRICK',
    'MOVE_RECYCLE',
]

const statusList = {
    MOVE_SPLASH: 0,
    MOVE_CELEBRATE: 0,
    MOVE_HOLD_HANDS: 0,
    MOVE_STRUGGLE: 0,

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
    
    MOVE_WIDE_GUARD: 1,
    MOVE_QUICK_GUARD: 1,
    MOVE_ALLY_SWITCH: 1,
    MOVE_HEAL_PULSE: 1,
    MOVE_GUARD_SPLIT: 1,
    MOVE_POWER_SPLIT: 1,
    MOVE_ENTRAINMENT: 1,
    MOVE_BESTOW: 1,
    MOVE_WONDER_ROOM: 2,
    MOVE_POWER_TRICK: 2,
    MOVE_POWER_SWAP: 2,
    MOVE_GUARD_SWAP: 2,
    MOVE_HEART_SWAP: 3,
    MOVE_WORRY_SEED: 2,
    MOVE_GASTRO_ACID: 2,
    MOVE_SIMPLE_BEAM: 2,
    MOVE_LUCKY_CHANT: 2,
    MOVE_ODOR_SLEUTH: 2,
    MOVE_MAT_BLOCK: 2,
    MOVE_INGRAIN: 2,
    MOVE_AQUA_RING: 3,
    MOVE_MAGNET_RISE: 2,
    MOVE_SCREECH: 4,
    MOVE_CONFUSE_RAY: 2,
    MOVE_TEETER_DANCE: 2,
    MOVE_FLATTER: 2,
    MOVE_HEAL_BLOCK: 3,
    MOVE_SWAGGER: 4,
    MOVE_ATTRACT: 4,
    MOVE_ME_FIRST: 4,
    MOVE_AFTER_YOU: 4,
    MOVE_PSYCHO_SHIFT: 4,
    MOVE_ENCORE: 6,
    MOVE_COPYCAT: 6,
    
    MOVE_SAFEGUARD: 3,
    MOVE_HAZE: 4,

    MOVE_MAGIC_COAT: 7,
    MOVE_COUNTER: 7,
    MOVE_METAL_BURST: 7.5,
    
    MOVE_SKETCH: 1,
    MOVE_CAMOUFLAGE: 2,
    MOVE_CONVERSION: 2,
    MOVE_REFLECT_TYPE: 2,
    MOVE_PRESENT: 2,
    MOVE_CONVERSION_2: 4,
    MOVE_TORMENT: 3,
    MOVE_TRANSFORM: 3,
    MOVE_MIRROR_MOVE: 3,
    MOVE_TAUNT: 5,
    MOVE_METRONOME: 5,
    MOVE_ASSIST: 5,
    MOVE_NATURE_POWER: 6,
    MOVE_DESTINY_BOND: 6,

    MOVE_DOUBLE_TEAM: 5,
    MOVE_FOCUS_ENERGY: 5,
    MOVE_MINIMIZE: 6,
    
    MOVE_BELCH: 6,

    MOVE_HOWL: 6,
    MOVE_HONE_CLAWS: 6.5,
    MOVE_WORK_UP: 6.5,
    MOVE_GROWTH: 6.5,
    MOVE_CURSE: 6.5,
    MOVE_ACUPRESSURE: 6.5,
    MOVE_AGILITY: 7,
    MOVE_AUTOTOMIZE: 7,
    MOVE_BULK_UP: 7,
    MOVE_CALM_MIND: 7,
    MOVE_TAILWIND: 7.5,
    MOVE_SWORDS_DANCE: 8,
    MOVE_BELLY_DRUM: 8,
    MOVE_DRAGON_DANCE: 8.5,
    MOVE_SHIFT_GEAR: 8.5,
    MOVE_TAIL_GLOW: 9,
    MOVE_QUIVER_DANCE: 9.5,
    MOVE_VICTORY_DANCE: 9.5,
    MOVE_SHELL_SMASH: 9.5,
    MOVE_GEOMANCY: 9.5,
    MOVE_NO_RETREAT: 10,
    MOVE_CLANGOROUS_SOUL: 10,
    
    MOVE_STOCKPILE: 8,
    MOVE_DEFEND_ORDER: 8,
    MOVE_COSMIC_POWER: 8,

    MOVE_POISON_GAS: 4,
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

    MOVE_PAIN_SPLIT: 5,
    MOVE_LIGHT_SCREEN: 7.5,
    MOVE_REFLECT: 7.5,
    MOVE_SUBSTITUTE: 8,
    MOVE_DEFOG: 7,
    MOVE_REST: 6,
    MOVE_WISH: 7,
    MOVE_MILK_DRINK: 8.5,
    MOVE_SOFT_BOILED: 8.5,
    MOVE_SLACK_OFF: 8.5,
    MOVE_HEAL_ORDER: 8.5,
    MOVE_RECOVER: 8.5,
    MOVE_SYNTHESIS: 8.5,
    MOVE_MORNING_SUN: 8.5,
    MOVE_MOONLIGHT: 8.5,
    MOVE_ROOST: 8.5,
    MOVE_LEECH_SEED: 8,

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
            || move.effect === 'EFFECT_ROAR'
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
            || move.effect === 'EFFECT_PROTECT'
            || move.effect === 'EFFECT_ATTACK_DOWN_2'
            || move.effect === 'EFFECT_DEFENSE_DOWN_2'
            || move.effect === 'EFFECT_SPECIAL_DEFENSE_DOWN_2'
            || move.effect === 'EFFECT_TICKLE'
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
        power *= 4;
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
    const pp = move.pp || 40;
    rating += (pp-5)/20;
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
    let accuracy = move.accuracy || 110;
    if (accuracy == 0) accuracy = 110;
    rating -= (100 - accuracy) / 10;
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
        rating *= 0.3;
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

function rateMoveForAPokemon(move, poke, ability, item, otherMoves, currentMoves) {
    if (
        currentMoves.filter(m => m.category !== 'DAMAGE_CATEGORY_STATUS').length < 2
        && move.category === 'DAMAGE_CATEGORY_STATUS'
    ) {
        return 0;
    }

    const hasAbility = (abilityToQuery) => {
        return ability === abilityToQuery || (!ability && poke.parsedAbilities.includes(abilityToQuery));
    }

    let rating = move.rating;
    if (move.category === 'DAMAGE_CATEGORY_PHYSICAL') {
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

function ratePokemon(poke, moves, abilities) {
    let bestAbilityRating = 0;
    poke.parsedAbilities.forEach(abilityId => {
        if (abilityId === 'NONE') return;
        const abilityRating = abilities[`ABILITY_${abilityId}`]?.rating || 0;
        if (abilityRating > bestAbilityRating) {
            bestAbilityRating = abilityRating;
        }
    });

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
        if (speedPower > offensePower || Math.abs(offensePower - speedPower) < 1.0 || speedPower > (defensePower + 1)) {
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

    let absoluteRating = (bstRating * 0.8) + (movesRating * 0.1) + (bestAbilityRating * 0.1);

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

    if (rawBST >= LEGEND_BST_THRESHOLD && absoluteRating < TIER_LEGEND_THRESHOLD) {
        absoluteRating = TIER_LEGEND_THRESHOLD + absoluteRating / 100;
    }

    if ((rawBST >= GOD_BST_THRESHOLD || poke.parsedAbilities.includes('POWER_CONSTRUCT')) && absoluteRating < TIER_GOD_THRESHOLD) {
        absoluteRating = TIER_GOD_THRESHOLD + absoluteRating / 100;
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
    else {
        tier = TIER_BAD;
    }

    return {
        absoluteRating,
        absoluteBSTRating: bstRating,
        bestMoveset: moveset,
        movesRating,
        bestAbilityRating,
        tier,
        role,
    };
}

module.exports = {
    ratePokemon,
    chooseMoveset,
    chooseNature,
    rateMove,
    rateItemForAPokemon,
    damageMultiplier,
    isSuperEffective,
}