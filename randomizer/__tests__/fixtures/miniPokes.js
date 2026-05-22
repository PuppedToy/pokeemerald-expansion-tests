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

module.exports = { MACHOP, MACHOKE, MACHAMP, STARMIE, SLOWBRO_MEGA, RIOLU, BLISSEY };
