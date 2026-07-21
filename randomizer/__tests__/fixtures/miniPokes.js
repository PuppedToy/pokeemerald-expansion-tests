'use strict';

// Five minimal Pokémon objects for unit tests.
// Shape matches parsed pokes.json entries (only fields used by rating.js / rebalancer.js).

const MACHOP = {
    id: 'SPECIES_MACHOP',
    family: 'P_FAMILY_MACHOP',
    form: null,
    parsedTypes: ['FIGHTING'],
    parsedAbilities: ['GUTS', 'NO_GUARD', 'STEADFAST'],
    baseHP: 70,
    baseAttack: 80,
    baseDefense: 50,
    baseSpeed: 35,
    baseSpAttack: 35,
    baseSpDefense: 35,
    baseBST: 305,
    evolutions: [{ method: 'LEVEL', param: '28', pokemon: 'SPECIES_MACHOKE' }],
    evolutionData: { type: 'EVO_TYPE_LC_OF_3', isMega: false, isLC: true, isNFE: true, isFinal: false, megaEvos: [] },
    learnset: [
        { level: '1', move: 'MOVE_LOW_KICK' },
        { level: '1', move: 'MOVE_LEER' },
        { level: '7', move: 'MOVE_FOCUS_ENERGY' },
        { level: '13', move: 'MOVE_KARATE_CHOP' },
        { level: '19', move: 'MOVE_SEISMIC_TOSS' },
        { level: '25', move: 'MOVE_KNOCK_OFF' },
    ],
    teachables: ['MOVE_EARTHQUAKE', 'MOVE_CLOSE_COMBAT', 'MOVE_BULK_UP'],
    levelUpLearnset: 'sLoloMachopLearnset',
    teachableLearnset: 'sMachopTeachableLearnset',
    newTeachables: [],
    oldTeachables: [],
};

const MACHOKE = {
    id: 'SPECIES_MACHOKE',
    family: 'P_FAMILY_MACHOP',
    form: null,
    parsedTypes: ['FIGHTING'],
    parsedAbilities: ['GUTS', 'NO_GUARD', 'STEADFAST'],
    baseHP: 80,
    baseAttack: 100,
    baseDefense: 70,
    baseSpeed: 45,
    baseSpAttack: 50,
    baseSpDefense: 60,
    baseBST: 405,
    evolutions: [{ method: 'TRADE', param: '0', pokemon: 'SPECIES_MACHAMP' }],
    evolutionData: { type: 'EVO_TYPE_NFE_OF_3', isMega: false, isLC: false, isNFE: true, isFinal: false, megaEvos: [] },
    learnset: [
        { level: '1', move: 'MOVE_LOW_KICK' },
        { level: '1', move: 'MOVE_LEER' },
        { level: '7', move: 'MOVE_FOCUS_ENERGY' },
        { level: '28', move: 'MOVE_CLOSE_COMBAT' },
    ],
    teachables: ['MOVE_EARTHQUAKE', 'MOVE_CLOSE_COMBAT', 'MOVE_BULK_UP'],
    levelUpLearnset: 'sLoloMachokeLearnset',
    teachableLearnset: 'sMachokeTeachableLearnset',
    newTeachables: [],
    oldTeachables: [],
};

const MACHAMP = {
    id: 'SPECIES_MACHAMP',
    family: 'P_FAMILY_MACHOP',
    form: null,
    parsedTypes: ['FIGHTING'],
    parsedAbilities: ['GUTS', 'NO_GUARD', 'STEADFAST'],
    baseHP: 90,
    baseAttack: 130,
    baseDefense: 80,
    baseSpeed: 55,
    baseSpAttack: 65,
    baseSpDefense: 85,
    baseBST: 505,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_FINAL', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
    learnset: [
        { level: '1', move: 'MOVE_LOW_KICK' },
        { level: '1', move: 'MOVE_LEER' },
        { level: '7', move: 'MOVE_FOCUS_ENERGY' },
        { level: '28', move: 'MOVE_CLOSE_COMBAT' },
        { level: '36', move: 'MOVE_CROSS_CHOP' },
        { level: '48', move: 'MOVE_SUPERPOWER' },
    ],
    teachables: ['MOVE_EARTHQUAKE', 'MOVE_CLOSE_COMBAT', 'MOVE_BULK_UP'],
    levelUpLearnset: 'sLoloMachampLearnset',
    teachableLearnset: 'sMachampTeachableLearnset',
    newTeachables: [],
    oldTeachables: [],
};

// Solo Pokémon (no evolutions, no mega)
const STARMIE = {
    id: 'SPECIES_STARMIE',
    family: 'P_FAMILY_STARYU',
    form: null,
    parsedTypes: ['WATER', 'PSYCHIC'],
    parsedAbilities: ['ILLUMINATE', 'NATURAL_CURE', 'ANALYTIC'],
    baseHP: 60,
    baseAttack: 75,
    baseDefense: 85,
    baseSpeed: 115,
    baseSpAttack: 100,
    baseSpDefense: 85,
    baseBST: 520,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_FINAL', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
    learnset: [
        { level: '1', move: 'MOVE_TACKLE' },
        { level: '1', move: 'MOVE_HARDEN' },
        { level: '6', move: 'MOVE_WATER_GUN' },
        { level: '20', move: 'MOVE_SURF' },
        { level: '28', move: 'MOVE_PSYCHIC' },
    ],
    teachables: ['MOVE_SURF', 'MOVE_THUNDERBOLT', 'MOVE_FLAMETHROWER'],
    levelUpLearnset: 'sLoloStarmieLearnset',
    teachableLearnset: 'sStarmieTeachableLearnset',
    newTeachables: [],
    oldTeachables: [],
};

// Mega form (inherits base's teachables, no extra rolls)
const SLOWBRO_MEGA = {
    id: 'SPECIES_SLOWBRO_MEGA',
    family: 'P_FAMILY_SLOWPOKE',
    form: 'Mega',
    parsedTypes: ['WATER', 'PSYCHIC'],
    parsedAbilities: ['SHELL_ARMOR', 'NONE', 'NONE'],
    baseHP: 95,
    baseAttack: 75,
    baseDefense: 180,
    baseSpeed: 30,
    baseSpAttack: 130,
    baseSpDefense: 80,
    baseBST: 590,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_MEGA', isMega: true, isLC: false, isNFE: false, isFinal: true, megaBaseForm: 'SPECIES_SLOWBRO', megaEvos: [] },
    learnset: [
        { level: '1', move: 'MOVE_TACKLE' },
        { level: '1', move: 'MOVE_SURF' },
    ],
    teachables: ['MOVE_SURF', 'MOVE_FLAMETHROWER'],
    levelUpLearnset: 'sLoloSlowbroLearnset',
    teachableLearnset: 'sSlowbroMegaTeachableLearnset',
    newTeachables: [],
    oldTeachables: [],
};

// Offensive Pokémon for rateMoveForAPokemon tests (offRatio = 70/40 = 1.75)
const RIOLU = {
    id: 'SPECIES_RIOLU',
    family: 'P_FAMILY_RIOLU',
    form: null,
    parsedTypes: ['FIGHTING'],
    parsedAbilities: ['STEADFAST', 'INNER_FOCUS'],
    baseHP: 40, baseAttack: 70, baseDefense: 40,
    baseSpeed: 60, baseSpAttack: 35, baseSpDefense: 40,
    baseBST: 285,
    evolutions: [{ method: 'HAPPINESS', param: 'DAY', pokemon: 'SPECIES_LUCARIO' }],
    evolutionData: { type: 'EVO_TYPE_LC_OF_2', isMega: false, isLC: true, isNFE: true, isFinal: false, megaEvos: [] },
    learnset: [], teachables: [], newTeachables: [], oldTeachables: [],
};

// Defensive Pokémon for rateMoveForAPokemon tests (offRatio = 75/133 = 0.56)
const BLISSEY = {
    id: 'SPECIES_BLISSEY',
    family: 'P_FAMILY_CHANSEY',
    form: null,
    parsedTypes: ['NORMAL'],
    parsedAbilities: ['NATURAL_CURE', 'SERENE_GRACE', 'HEALER'],
    baseHP: 255, baseAttack: 10, baseDefense: 10,
    baseSpeed: 55, baseSpAttack: 75, baseSpDefense: 135,
    baseBST: 540,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_FINAL', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
    learnset: [], teachables: [], newTeachables: [], oldTeachables: [],
};

// Wishiwashi Solo form — the entry that actually appears in-game (BST 175, ZU on raw stats).
// Schools into the School form at lvl 20+; both share the Schooling ability and learnset.
const WISHIWASHI_SOLO = {
    id: 'SPECIES_WISHIWASHI_SOLO',
    family: 'P_FAMILY_WISHIWASHI',
    form: null,
    parsedTypes: ['WATER'],
    parsedAbilities: ['SCHOOLING', 'NONE', 'NONE'],
    baseHP: 45,
    baseAttack: 20,
    baseDefense: 20,
    baseSpeed: 40,
    baseSpAttack: 25,
    baseSpDefense: 25,
    baseBST: 175,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_FINAL', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
    learnset: [
        { level: '1', move: 'MOVE_TACKLE' },
        { level: '12', move: 'MOVE_SURF' },
        { level: '20', move: 'MOVE_FLAMETHROWER' },
    ],
    teachables: ['MOVE_SURF', 'MOVE_FLAMETHROWER'],
    levelUpLearnset: 'sLoloWishiwashiLearnset',
    teachableLearnset: 'sWishiwashiTeachableLearnset',
    newTeachables: [],
    oldTeachables: [],
};

// Wishiwashi School form — banned from picking; only used as the stat/type source for the
// Solo form's effective rating (BST 620).
const WISHIWASHI_SCHOOL = {
    id: 'SPECIES_WISHIWASHI_SCHOOL',
    family: 'P_FAMILY_WISHIWASHI',
    form: null,
    parsedTypes: ['WATER'],
    parsedAbilities: ['SCHOOLING', 'NONE', 'NONE'],
    baseHP: 45,
    baseAttack: 140,
    baseDefense: 130,
    baseSpeed: 30,
    baseSpAttack: 140,
    baseSpDefense: 135,
    baseBST: 620,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_FINAL', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
    learnset: [
        { level: '1', move: 'MOVE_TACKLE' },
        { level: '12', move: 'MOVE_SURF' },
        { level: '20', move: 'MOVE_FLAMETHROWER' },
    ],
    teachables: ['MOVE_SURF', 'MOVE_FLAMETHROWER'],
    levelUpLearnset: 'sLoloWishiwashiLearnset',
    teachableLearnset: 'sWishiwashiTeachableLearnset',
    newTeachables: [],
    oldTeachables: [],
};

// Palafin Zero form — the placed form. Weak on its own (BST 457), but Zero-to-Hero transforms
// it into the Hero form on the first switch out. Rated/moved as Hero.
const PALAFIN_ZERO = {
    id: 'SPECIES_PALAFIN_ZERO',
    family: 'P_FAMILY_FINIZEN',
    form: null,
    parsedTypes: ['WATER'],
    parsedAbilities: ['ZERO_TO_HERO', 'NONE', 'NONE'],
    baseHP: 100,
    baseAttack: 70,
    baseDefense: 72,
    baseSpeed: 100,
    baseSpAttack: 53,
    baseSpDefense: 62,
    baseBST: 457,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_FINAL', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
    learnset: [
        { level: '1', move: 'MOVE_FLIP_TURN' },
        { level: '1', move: 'MOVE_WAVE_CRASH' },
        { level: '1', move: 'MOVE_TACKLE' },
    ],
    teachables: ['MOVE_FLIP_TURN', 'MOVE_WAVE_CRASH', 'MOVE_U_TURN', 'MOVE_KNOCK_OFF'],
    levelUpLearnset: 'sPalafinLevelUpLearnset',
    teachableLearnset: 'sPalafinTeachableLearnset',
    newTeachables: [],
    oldTeachables: [],
};

// Palafin Hero form — battle-only, banned from picking. Only used as the stat/type source for
// the Zero form's effective rating (BST 650, physical attacker).
const PALAFIN_HERO = {
    id: 'SPECIES_PALAFIN_HERO',
    family: 'P_FAMILY_FINIZEN',
    form: null,
    parsedTypes: ['WATER'],
    parsedAbilities: ['ZERO_TO_HERO', 'NONE', 'NONE'],
    baseHP: 100,
    baseAttack: 160,
    baseDefense: 97,
    baseSpeed: 100,
    baseSpAttack: 106,
    baseSpDefense: 87,
    baseBST: 650,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_FINAL', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
    learnset: [
        { level: '1', move: 'MOVE_FLIP_TURN' },
        { level: '1', move: 'MOVE_WAVE_CRASH' },
        { level: '1', move: 'MOVE_TACKLE' },
    ],
    teachables: ['MOVE_FLIP_TURN', 'MOVE_WAVE_CRASH', 'MOVE_U_TURN', 'MOVE_KNOCK_OFF'],
    levelUpLearnset: 'sPalafinLevelUpLearnset',
    teachableLearnset: 'sPalafinTeachableLearnset',
    newTeachables: [],
    oldTeachables: [],
};

// Greninja Battle Bond (T-185) — the placed SOLO form. Battle Bond KO-transforms it into the
// battle-only Ash form. Own stats match normal Greninja (BST 530); its rating is a 0.70/0.30 blend
// with Ash, and a trainer builds its set from Ash's stats via greninjaEffectivePoke.
const GRENINJA_BOND = {
    id: 'SPECIES_GRENINJA_BATTLE_BOND',
    family: 'P_FAMILY_GRENINJA_BATTLE_BOND',
    form: null,
    parsedTypes: ['WATER', 'DARK'],
    parsedAbilities: ['BATTLE_BOND', 'NONE', 'NONE'],
    baseHP: 72,
    baseAttack: 95,
    baseDefense: 67,
    baseSpeed: 122,
    baseSpAttack: 103,
    baseSpDefense: 71,
    baseBST: 530,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_SOLO', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
    learnset: [
        { level: '1', move: 'MOVE_WATER_SHURIKEN' },
        { level: '1', move: 'MOVE_HYDRO_PUMP' },
        { level: '1', move: 'MOVE_DARK_PULSE' },
        { level: '1', move: 'MOVE_U_TURN' },
    ],
    teachables: ['MOVE_ICE_BEAM', 'MOVE_GUNK_SHOT', 'MOVE_U_TURN'],
    levelUpLearnset: 'sGreninjaLevelUpLearnset',
    teachableLearnset: 'sGreninjaTeachableLearnset',
    newTeachables: [],
    oldTeachables: [],
};

// Ash-Greninja (T-185) — battle-only, banned from picking. The stat/type source for the placed
// Battle Bond form's effective set (BST 640, huge mixed offense) and one half of its rating blend.
const GRENINJA_ASH = {
    id: 'SPECIES_GRENINJA_ASH',
    family: 'P_FAMILY_GRENINJA_BATTLE_BOND',
    form: null,
    parsedTypes: ['WATER', 'DARK'],
    parsedAbilities: ['BATTLE_BOND', 'NONE', 'NONE'],
    baseHP: 72,
    baseAttack: 145,
    baseDefense: 67,
    baseSpeed: 132,
    baseSpAttack: 153,
    baseSpDefense: 71,
    baseBST: 640,
    evolutions: [],
    evolutionData: { type: 'EVO_TYPE_SOLO', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: [] },
    learnset: [
        { level: '1', move: 'MOVE_WATER_SHURIKEN' },
        { level: '1', move: 'MOVE_HYDRO_PUMP' },
        { level: '1', move: 'MOVE_DARK_PULSE' },
        { level: '1', move: 'MOVE_U_TURN' },
    ],
    teachables: ['MOVE_ICE_BEAM', 'MOVE_GUNK_SHOT', 'MOVE_U_TURN'],
    levelUpLearnset: 'sGreninjaLevelUpLearnset',
    teachableLearnset: 'sGreninjaTeachableLearnset',
    newTeachables: [],
    oldTeachables: [],
};

module.exports = { MACHOP, MACHOKE, MACHAMP, STARMIE, SLOWBRO_MEGA, RIOLU, BLISSEY, WISHIWASHI_SOLO, WISHIWASHI_SCHOOL, PALAFIN_ZERO, PALAFIN_HERO, GRENINJA_BOND, GRENINJA_ASH };
