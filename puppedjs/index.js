const speciesDir = `${__dirname}\\..\\src\\data\\pokemon\\species_info`;
const levelUpLearnsetsDir = `${__dirname}\\..\\src\\data\\pokemon\\level_up_learnsets`;
const TOTAL_GENS = 9;
const SUPPORTED_PROPERTIES = [
    'baseHP',
    'baseAttack',
    'baseDefense',
    'baseSpeed',
    'baseSpAttack',
    'baseSpDefense',
    'types',
    'abilities',
    'speciesName',
    'levelUpLearnset',
    'teachableLearnset',
    'evolutions',
    'natDexNum',
];
const FIXED_PROPERTIES = {
    catchRate: '255',
    expYield: '0',
};

// I have to figure out how to handle each exceptions
const REMOVED_FAMILIES = [
    'P_FAMILY_UNOWN',
    'P_FAMILY_BURMY',
    'P_FAMILY_ARCEUS',
    'P_FAMILY_GENESECT',
    'P_FAMILY_SCATTERBUG',
    'P_FAMILY_FLABEBE',
    'P_FAMILY_FURFROU',
    'P_FAMILY_TYPE_NULL',
    'P_FAMILY_MINIOR',
    'P_FAMILY_MILCERY',
    'P_FAMILY_OGERPON',
]

const REMOVED_SPECIES = [
    'SPECIES_PICHU_SPIKY_EARED',
    'SPECIES_PIKACHU_COSPLAY',
    'SPECIES_PIKACHU_ROCK_STAR',
    'SPECIES_PIKACHU_BELLE',
    'SPECIES_PIKACHU_POP_STAR',
    'SPECIES_PIKACHU_PHD',
    'SPECIES_PIKACHU_LIBRE',
    'SPECIES_PIKACHU_ORIGINAL',
    'SPECIES_PIKACHU_HOENN',
    'SPECIES_PIKACHU_SINNOH',
    'SPECIES_PIKACHU_UNOVA',
    'SPECIES_PIKACHU_KALOS',
    'SPECIES_PIKACHU_ALOLA',
    'SPECIES_PIKACHU_PARTNER',
    'SPECIES_PIKACHU_WORLD',
    'SPECIES_PIKACHU_GMAX',
    'SPECIES_PIKACHU_STARTER',
    'SPECIES_EEVEE_STARTER',
    'SPECIES_CHERRIM_OVERCAST',
];

const REMOVED_MOVES = [
    'MOVE_NONE',
];

const fs = require('fs').promises;

function processLineForDefinitions(line, definitions) {
    const regex = new RegExp(`^#define\\s+(.*?)\\s+(.*)$`);
    const match = line.match(regex);
    if (match) {
        const [, key, value] = match;
        definitions[key] = value.trim();
    }
}

function parseSpeciesFile(genSpeciesFileText, definitions) {
    const lines = genSpeciesFileText.split('\n');
    const pokemonList = [];
    let currentPokemon;
    let currentFamily;
    for (let i = 0; i < lines.length; i++) {
        processLineForDefinitions(lines[i], definitions);
        if (lines[i].startsWith('#if P_FAMILY_')) {
            currentFamily = lines[i].split(' ')[1];
            if (REMOVED_FAMILIES.includes(currentFamily)) {
                console.log(`Skipping family ${currentFamily}`);
                currentFamily = null;
            }
            else
            {
                console.log(`New family: ${currentFamily}`);
            }
            continue;
        }
        if (!currentFamily) continue;
        if (lines[i].startsWith('    [')) {
            currentPokemon = {
                id: lines[i].split('[')[1].split(']')[0],
                family: currentFamily,
            }
            if (
                REMOVED_SPECIES.includes(currentPokemon.id)
                || currentPokemon.id.includes('_GMAX')
                || currentPokemon.id.includes('_TOTEM')
            ) {
                console.log(`Skipping species ${currentPokemon.id}`);
                currentPokemon = null;
                continue;
            }
        }
        if (!currentPokemon) continue;
        if (lines[i].startsWith('        .')) {
            const currentProperty = lines[i].trim().split('.')[1].split(' ')[0];
            const currentValue = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            if (SUPPORTED_PROPERTIES.includes(currentProperty)) {
                currentPokemon[currentProperty] = currentValue;
            }
            continue;
        }
        if (lines[i].startsWith('    },')) {
            pokemonList.push(currentPokemon);
            currentPokemon = null;
        }
    }
    return pokemonList;
}

function parseMovesFile(movesFileText) {
    const lines = movesFileText.split('\n');
    const moves = {};
    let currentMove;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('    [')) {
            currentMove = {
                id: lines[i].split('[')[1].split(']')[0],
            };
            if (REMOVED_MOVES.includes(currentMove.id)) {
                console.log(`Skipping move ${currentMove.id}`);
                currentMove = null;
            }
            else {
                moves[currentMove.id] = currentMove;
            }
            continue;
        }
        if (!currentMove) continue;
        if (lines[i].startsWith('        .')) {
            const currentProperty = lines[i].trim().split('.')[1].split(' ')[0];
            const currentValue = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            currentMove[currentProperty] = currentValue;
        }
    }
    return moves;
}

function parseLearnsetsFile(learnsetsFileText) {
    const learnsets = {};
    const lines = learnsetsFileText.split('\n');
    let currentLearnset;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('static const struct LevelUpMove ')) {
            currentLearnset = lines[i].replace(/.*?static const struct LevelUpMove (.+?)\[.*/, '$1');
            learnsets[currentLearnset] = [];
            continue;
        }
        if (lines[i].startsWith('    LEVEL_UP_MOVE(')) {
            const currentMove = lines[i].replace(/.*?LEVEL_UP_MOVE\((.*)\).*/, '$1').trim();
            const parts = currentMove.split(',').map(p => p.trim());
            learnsets[currentLearnset].push({
                level: parts[0],
                move: parts[1],
            });
        }
    }
    return learnsets;
}

function parseTeachableFile(teachableFileText) {
    const lines = teachableFileText.split('\n');
    const teachables = {};
    let currentTeachable;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('static const u16 ')) {
            currentTeachable = lines[i].replace(/.*?static const u16 (.+?)\[.*/, '$1');
            teachables[currentTeachable] = [];
            continue;
        }
        if (lines[i].includes('    MOVE_') && !lines[i].includes('MOVE_UNAVAILABLE')) {
            const currentMove = lines[i].trim().replace(/,$/, '').trim();
            teachables[currentTeachable].push(currentMove);
        }
    }

    return teachables;
}

function nameizyPokemonId(pokeId) {
    let result = pokeId
        .replace('SPECIES_', '')
        .replace(/_/g, ' ')
        .toLowerCase();
    // Capitalize first letter and every letter after a space
    result = result.charAt(0).toUpperCase() + result.slice(1);
    result = result.replace(/ (\w)/g, function(m) { return ' ' + m.toUpperCase(); });
    return result;
}

function parseStat(stat, definitions) {
    let trimmed = stat.trim();
    if (definitions[trimmed]) {
        trimmed = definitions[trimmed];
    }
    else if (trimmed.split(' + ').length && definitions[trimmed.split(' + ')[0]]) {
        const parts = trimmed.split(' + ');
        return parseStat(parts[0], definitions) + parseStat(parts[1], definitions);
    }
    else if (trimmed.split(' - ').length && definitions[trimmed.split(' - ')[0]]) {
        const parts = trimmed.split(' - ');
        return parseStat(parts[0], definitions) - parseStat(parts[1], definitions);
    }
    trimmed = trimmed.replace('(', '').replace(')', '').trim();
    if (trimmed.startsWith('P_UPDATED_STATS >= GEN_')) {
        const m = trimmed.match(/P_UPDATED_STATS >= GEN_[^?]+\?\s*?(\d+).*/);
        return m ? parseInt(m[1].trim(), 10) : '';
    }
    return parseInt(trimmed, 10);
}

async function exe() {
    const movesFilePath = `${__dirname}\\..\\src\\data\\moves_info.h`;
    const movesFileText = await fs.readFile(movesFilePath, 'utf-8');
    const moves = parseMovesFile(movesFileText);
    await fs.writeFile(`${__dirname}\\moves.json`, JSON.stringify(moves, null, 2), 'utf-8');

    const levelUpLearnsets = {};
    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        const learnsetsFilePath = `${levelUpLearnsetsDir}\\gen_${gen}.h`;
        const learnsetsFileText = await fs.readFile(learnsetsFilePath, 'utf-8');
        Object.assign(levelUpLearnsets, parseLearnsetsFile(learnsetsFileText));
    }
    await fs.writeFile(`${__dirname}\\level_up_learnsets.json`, JSON.stringify(levelUpLearnsets, null, 2), 'utf-8');

    const teachablesFilePath = `${__dirname}\\..\\src\\data\\pokemon\\teachable_learnsets.h`;
    const teachablesFileText = await fs.readFile(teachablesFilePath, 'utf-8');
    const TMTeachables = parseTeachableFile(teachablesFileText);
    await fs.writeFile(`${__dirname}\\teachable_learnsets.json`, JSON.stringify(TMTeachables, null, 2), 'utf-8');

    const genPokes = [];
    const allPokes = [];
    const definitions = {
        VICTREEBEL_SP_DEF: '70',
        EXEGGUTOR_SP_DEF: '75',
    };
    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        const genSpeciesFilePath = `${speciesDir}\\gen_${gen}_families.h`;
        const genSpeciesFileText = await fs.readFile(genSpeciesFilePath, 'utf-8');
        genPokes.push(parseSpeciesFile(genSpeciesFileText, definitions));
    }
    console.log(definitions);

    genPokes.forEach((genPokeList, i) => {
        console.log(`Gen ${i + 1} has ${genPokeList.length} pokes`);
        genPokeList.forEach(poke => {
            let learnset = [];
            let teachables = [];
            if (poke.levelUpLearnset && levelUpLearnsets[poke.levelUpLearnset]) {
                learnset = levelUpLearnsets[poke.levelUpLearnset];
            }
            if (poke.teachableLearnset && TMTeachables[poke.teachableLearnset]) {
                teachables = TMTeachables[poke.teachableLearnset];
            }
            const baseHP = parseStat(poke.baseHP, definitions);
            const baseAttack = parseStat(poke.baseAttack, definitions);
            const baseDefense = parseStat(poke.baseDefense, definitions);
            const baseSpeed = parseStat(poke.baseSpeed, definitions);
            const baseSpAttack = parseStat(poke.baseSpAttack, definitions);
            const baseSpDefense = parseStat(poke.baseSpDefense, definitions);
            const baseBST = baseHP + baseAttack + baseDefense + baseSpeed + baseSpAttack + baseSpDefense;
            allPokes.push({
                name: nameizyPokemonId(poke.id),
                // transform "MON_TYPES(TYPE_GRASS, TYPE_POISON)" to ["GRASS", "POISON"]
                parsedTypes: poke.types.replace(/MON_TYPES\(/, '').replace(/\)/, '').split(', ').map(t => t.replace('TYPE_', '')),
                // transform "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_CHLOROPHYLL }" to ["OVERGROW", "NONE", "CHLOROPHYLL"]
                parsedAbilities: poke.abilities.replace(/{ /, '').replace(/ }/, '').split(', ').map(a => a.replace('ABILITY_', '')),
                ...poke,
                baseHP,
                baseAttack,
                baseDefense,
                baseSpeed,
                baseSpAttack,
                baseSpDefense,
                baseBST,
                ...FIXED_PROPERTIES,
                learnset,
                teachables,
            });
        });
    });

    await fs.writeFile(`${__dirname}\\pokes.json`, JSON.stringify(allPokes, null, 2), 'utf-8');
}

exe();