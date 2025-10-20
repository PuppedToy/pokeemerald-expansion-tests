const fs = require('fs').promises;
const path = require('path');

const { ratePokemon, rateMove } = require('./rating');
const writer = require('./writer');

const {
    EVO_TYPE_LC_OF_3,
    EVO_TYPE_LC_OF_2,
    EVO_TYPE_NFE_OF_3,
    EVO_TYPE_LAST_OF_3,
    EVO_TYPE_LAST_OF_2,
    EVO_TYPE_SOLO,
    EVO_TYPE_MEGA,
    POKE_FORM_ALOLAN,
    POKE_FORMS,
} = require('./constants.js');
const { balancePokemon } = require('./rebalancer.js');

const speciesDir = path.resolve(__dirname, '..', 'src', 'data', 'pokemon', 'species_info');
const levelUpLearnsetsDir = path.resolve(__dirname, '..', 'src', 'data', 'pokemon', 'level_up_learnsets');
const abilitiesFilePath = path.resolve(__dirname, '..', 'src', 'data', 'abilities.h');
const megaEvosPath = path.resolve(__dirname, '..', 'src', 'data', 'pokemon', 'form_change_tables.h');

const TOTAL_GENS = 9;

const evoIsLC = (evolutionType) => evolutionType === EVO_TYPE_LC_OF_3 || evolutionType === EVO_TYPE_LC_OF_2;
const evoIsNFE = (evolutionType) => evoIsLC(evolutionType) || evolutionType === EVO_TYPE_NFE_OF_3;
const evoIsFinal = (evolutionType) => evolutionType === EVO_TYPE_SOLO || evolutionType === EVO_TYPE_LAST_OF_3 || evolutionType === EVO_TYPE_LAST_OF_2 || evolutionType === EVO_TYPE_MEGA;

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
    'isAlolanForm',
    'isGalarianForm',
    'isHisuianForm',
    'isPaldeanForm',
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
];

const REMOVED_MOVES = [
    'MOVE_NONE',
];

function processLineForDefinitions(line, definitions) {
    const regex = new RegExp(`^#define\\s+(.*?)\\s+(.*)$`);
    const match = line.match(regex);
    if (match) {
        const [, key, value] = match;
        definitions[key] = value.trim();
    }
}

const evoRegex = /{EVO_(.*?), (.*?), (.*?)(?:}|,)/;
function parseEvo(familyId, pokeId, line, evoTree) {
    const match = line.match(evoRegex);
    if (match) {
        const [, method, param, pokemon] = match;
        // Frist time, create the family
        if (!evoTree[familyId]) {
            evoTree[familyId] = [pokeId, [pokemon]];
        }
        else {
            // If family already exists and I'm the base form, it's a branch evo
            if (evoTree[familyId][0] === pokeId) {
                evoTree[familyId][1].push(pokemon);
            }
            // If family already exists and I'm in the first evo stage, it's a 3-stage evo
            else if (evoTree[familyId][1].includes(pokeId)) {
                // If it's the first time we see a 3rd stage evo, create the array
                if (evoTree[familyId].length == 2) {
                    evoTree[familyId].push([pokemon]);
                }
                // Otherwise it's a branch for the 3rd stage evo
                else {
                    evoTree[familyId][2].push(pokemon);
                }
            }
            // Family already exists and I'm not in the first stage, so I'm a 2-stage evo
            // WTF does that mean?
            else {
                console.log(`Warning: Unexpected evo structure for family ${familyId} and poke ${pokeId}
                > ${line}`);
            }
        }
        return {
            method: method.trim(),
            param: param.trim(),
            pokemon: pokemon.trim(),
        };
    }
    return null;
}

function parseSpeciesFile(genSpeciesFileText, definitions, evoTree) {
    const lines = genSpeciesFileText.split('\n');
    const pokemonList = [];
    let currentPokemon;
    let currentFamily;
    let currentEvos;
    for (let i = 0; i < lines.length; i++) {
        processLineForDefinitions(lines[i], definitions);
        if (lines[i].startsWith('#if P_FAMILY_')) {
            currentFamily = lines[i].split(' ')[1];
            if (REMOVED_FAMILIES.includes(currentFamily)) {
                console.log(`Skipping family ${currentFamily}`);
                currentFamily = null;
            }
            continue;
        }
        if (!currentFamily) continue;
        if (lines[i].startsWith('    [')) {
            currentPokemon = {
                id: lines[i].split('[')[1].split(']')[0],
                family: currentFamily,
            }
            let form = null;
            POKE_FORMS.forEach(pokeForm => {
                if (currentPokemon.id.endsWith(`_${pokeForm}`)) {
                    form = pokeForm;
                    currentPokemon.family = `${currentFamily}_${pokeForm}`;
                }
            });
            currentPokemon.form = form;
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
        if (lines[i].includes('.evolutions = EVOLUTION(')) {
            currentEvos = [
                parseEvo(currentPokemon.family, currentPokemon.id, lines[i], evoTree),
            ];
            continue;
        }
        if (lines[i].startsWith('        .')) {
            if (currentEvos) {
                currentPokemon.evolutions = currentEvos.filter(e => e !== null);
                currentEvos = null;
            }
            const currentProperty = lines[i].trim().split('.')[1].split(' ')[0];
            const currentValue = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            if (SUPPORTED_PROPERTIES.includes(currentProperty) && !currentPokemon[currentProperty]) {
                currentPokemon[currentProperty] = currentValue;
            }
            continue;
        }
        if (currentEvos) {
            const parsedEvo = parseEvo(currentPokemon.family, currentPokemon.id, lines[i], evoTree);
            if (parsedEvo) {
                currentEvos.push(parsedEvo);
                continue;
            }
        }
        if (lines[i].startsWith('    },')) {
            if (currentEvos) {
                currentPokemon.evolutions = currentEvos.filter(e => e !== null);
                currentEvos = null;
            }
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
                additionalEffects: [],
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
        if (lines[i].startsWith('        .') && !lines[i].startsWith('        .additionalEffects =')) {
            const currentProperty = lines[i].trim().split('.')[1].split(' ')[0];
            let currentValue = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            const compoundMatch = currentValue.match(/COMPOUND_STRING\("(.*)"\),?/);
            if (compoundMatch) {
                currentValue = compoundMatch[1];
            }
            currentMove[currentProperty] = currentValue;
        }
        if (lines[i].startsWith('            .moveEffect = ')) {
            const effect = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            currentMove.additionalEffects.push(effect);
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

function parseAbilitiesFile(abilitiesFileText) {
    const lines = abilitiesFileText.split('\n');
    const abilities = {};
    let currentAbility;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('    [')) {
            currentAbility = lines[i].split('[')[1].split(']')[0];
            abilities[currentAbility] = {
                name: '',
                rating: 0,
            };
            continue;
        }
        if (!currentAbility) continue;
        if (lines[i].startsWith('        .aiRating = ')) {
            const rating = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            abilities[currentAbility].rating = parseFloat(rating);
        }
        if (lines[i].startsWith('        .name = ')) {
            const nameMatch = lines[i].trim().match(/\.name = \_\("(.*)"\),?/);
            if (nameMatch) {
                abilities[currentAbility].name = nameMatch[1];
            }
            else {
                abilities[currentAbility].name = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            }
        }
    }
    return abilities;
}

function parseMegaEvoStonesFile(megaEvosFileText) {
    const lines = megaEvosFileText.split('\n');
    const megaEvoStones = {};

    for (let i = 0; i < lines.length; i++) {
        if (
            lines[i].startsWith('    {FORM_CHANGE_BATTLE_MEGA_EVOLUTION_ITEM,    ')
            || lines[i].startsWith('    {FORM_CHANGE_BATTLE_PRIMAL_REVERSION,   ')
        ) {
            const parts = lines[i]
                .replace(/^\s*?\{FORM_CHANGE_BATTLE_.*?,\s*/, '')
                .replace(/\s*?\},\s*$/, '')
                .split(',')
                .map(p => p.trim());
            megaEvoStones[parts[0]] = parts[1];
        }
    }

    return megaEvoStones;
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

function parseStat(stat, definitions = {}) {
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

function parseMoveStat(stat) {
    if (!stat) return 0;
    let trimmed = stat.trim();
    trimmed = trimmed.replace('(', '').replace(')', '').trim();
    if (trimmed.startsWith('B_UPDATED_MOVE_DATA >= GEN_')) {
        const m = trimmed.match(/B_UPDATED_MOVE_DATA >= GEN_[^?]+\?\s*?(\d+).*/);
        return m ? parseInt(m[1].trim(), 10) : '';
    }
    return parseInt(trimmed, 10);
}

function getEvolutionType(pokemon, evoTree) {
    if (!pokemon) {
        console.log('Warning: getEvolutionType called with null pokemon');
    }
    if (pokemon.id.match(/.*_(MEGA|PRIMAL|MEGA_X|MEGA_Y)$/)) {
        return EVO_TYPE_MEGA;
    }
    if (!evoTree[pokemon.family]) {
        return EVO_TYPE_SOLO;
    }
    const familyData = evoTree[pokemon.family];
    if (familyData.length === 2) {
        if (familyData[0] === pokemon.id) {
            return EVO_TYPE_LC_OF_2;
        }
        return EVO_TYPE_LAST_OF_2;
    }
    if (familyData.length === 3) {
        if (familyData[0] === pokemon.id) {
            return EVO_TYPE_LC_OF_3;
        }
        if (familyData[1].includes(pokemon.id)) {
            return EVO_TYPE_NFE_OF_3;
        }
        return EVO_TYPE_LAST_OF_3;
    }
    return EVO_TYPE_SOLO;
}

async function exe() {
    const abilitiesFileText = await fs.readFile(abilitiesFilePath, 'utf-8');
    const abilities = parseAbilitiesFile(abilitiesFileText);
    await fs.writeFile(path.resolve(__dirname, 'abilities.json'), JSON.stringify(abilities, null, 2), 'utf-8');

    const megaEvosFileText = await fs.readFile(megaEvosPath, 'utf-8');
    const megaEvoStones = parseMegaEvoStonesFile(megaEvosFileText);

    const movesFilePath = path.resolve(__dirname, '..', 'src', 'data', 'moves_info.h');
    const movesFileText = await fs.readFile(movesFilePath, 'utf-8');
    const moves = parseMovesFile(movesFileText);

    Object.keys(moves).forEach(moveId => {
        moves[moveId].power = parseMoveStat(moves[moveId].power);
        moves[moveId].accuracy = parseMoveStat(moves[moveId].accuracy);
        moves[moveId].pp = parseMoveStat(moves[moveId].pp);
        moves[moveId].priority = parseMoveStat(moves[moveId].priority);
        moves[moveId].type = moves[moveId].type.replace('TYPE_', '');
        moves[moveId].rating = rateMove(moves[moveId]);
    });

    await fs.writeFile(path.resolve(__dirname, 'moves.json'), JSON.stringify(moves, null, 2), 'utf-8');

    const levelUpLearnsets = {};
    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        const learnsetsFilePath = path.resolve(levelUpLearnsetsDir, `gen_${gen}.h`);
        const learnsetsFileText = await fs.readFile(learnsetsFilePath, 'utf-8');
        Object.assign(levelUpLearnsets, parseLearnsetsFile(learnsetsFileText));
    }
    await fs.writeFile(path.resolve(__dirname, 'level_up_learnsets.json'), JSON.stringify(levelUpLearnsets, null, 2), 'utf-8');

    const teachablesFilePath = path.resolve(__dirname, '..', 'src', 'data', 'pokemon', 'teachable_learnsets.h');
    const teachablesFileText = await fs.readFile(teachablesFilePath, 'utf-8');
    const TMTeachables = parseTeachableFile(teachablesFileText);
    await fs.writeFile(path.resolve(__dirname, 'teachable_learnsets.json'), JSON.stringify(TMTeachables, null, 2), 'utf-8');

    const genPokes = [];
    const allPokes = [];
    const definitions = {
        VICTREEBEL_SP_DEF: '70',
        EXEGGUTOR_SP_DEF: '75',
    };
    const evoTree = {};
    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        const genSpeciesFilePath = path.resolve(speciesDir, `gen_${gen}_families.h`);
        const genSpeciesFileText = await fs.readFile(genSpeciesFilePath, 'utf-8');
        const parsedPokes = parseSpeciesFile(genSpeciesFileText, definitions, evoTree);
        genPokes.push(parsedPokes);
    }

    const megaEvoTree = {};
    genPokes.forEach((genPokeList, i) => {
        genPokeList.forEach(poke => {
            let learnset = [];
            let teachables = [];
            if (poke.levelUpLearnset && levelUpLearnsets[poke.levelUpLearnset]) {
                learnset = levelUpLearnsets[poke.levelUpLearnset];
            }
            if (poke.teachableLearnset && TMTeachables[poke.teachableLearnset]) {
                teachables = TMTeachables[poke.teachableLearnset];
            }
            const evolutionType = getEvolutionType(poke, evoTree);
            const isMega = evolutionType === EVO_TYPE_MEGA;
            let megaBaseForm = undefined;
            let megaItem = undefined;
            const isLC = evoIsLC(evolutionType);
            const isNFE = evoIsNFE(evolutionType);
            const isFinal = evoIsFinal(evolutionType);
            if (isMega) {
                if (!megaEvoTree[poke.family]) {
                    megaEvoTree[poke.family] = [];
                }
                megaEvoTree[poke.family].push(poke.id);
                megaBaseForm = poke.natDexNum.replace('NATIONAL_DEX_', 'SPECIES_');
                megaItem = megaEvoStones[poke.id];
            }
            const baseHP = parseStat(poke.baseHP, definitions);
            const baseAttack = parseStat(poke.baseAttack, definitions);
            const baseDefense = parseStat(poke.baseDefense, definitions);
            const baseSpeed = parseStat(poke.baseSpeed, definitions);
            const baseSpAttack = parseStat(poke.baseSpAttack, definitions);
            const baseSpDefense = parseStat(poke.baseSpDefense, definitions);
            const baseBST = baseHP + baseAttack + baseDefense + baseSpeed + baseSpAttack + baseSpDefense;
            const fullPoke = {
                name: nameizyPokemonId(poke.id),
                // transform "MON_TYPES(TYPE_GRASS, TYPE_POISON)" to ["GRASS", "POISON"]
                parsedTypes: poke.types.replace(/MON_TYPES\(/, '').replace(/\)/, '').split(', ').map(t => t.replace('TYPE_', '')),
                // transform "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_CHLOROPHYLL }" to ["OVERGROW", "NONE", "CHLOROPHYLL"]
                parsedAbilities: poke.abilities
                    .replace(/{ /, '').replace(/ }/, '').split(', ').map(a => a.replace('ABILITY_', '')),
                ...poke,
                baseHP,
                baseAttack,
                baseDefense,
                baseSpeed,
                baseSpAttack,
                baseSpDefense,
                baseBST,
                evolutionData: {
                    type: evolutionType,
                    isMega,
                    megaBaseForm,
                    megaItem,
                    isLC,
                    isNFE,
                    isFinal,
                },
                ...FIXED_PROPERTIES,
                learnset,
                teachables,
                evoTree: evoTree[poke.family],
            };
            fullPoke.rating = ratePokemon(fullPoke, moves, abilities);
            allPokes.push(fullPoke);
        });
    });

    for (let i = 0; i < allPokes.length; i++) {
        allPokes[i] = balancePokemon(allPokes[i], Object.keys(abilities).map(key => key.replace('ABILITY_', '')));
        if (allPokes[i].log && allPokes[i].log.length) {
            allPokes[i].baseBST = allPokes[i].baseHP
                + allPokes[i].baseAttack
                + allPokes[i].baseDefense
                + allPokes[i].baseSpAttack
                + allPokes[i].baseSpDefense
                + allPokes[i].baseSpeed;
            allPokes[i].rating = ratePokemon(allPokes[i], moves, abilities);
        }
    }

    allPokes.forEach(poke => {
        let bestEvo = poke.id;
        let bestEvoRating = poke.rating.absoluteRating;
        let bestEvoTier = poke.rating.tier;
        (poke.evoTree || []).forEach(evoStage => {
            if (Array.isArray(evoStage)) {
                evoStage.forEach(evo => {
                    const evoPoke = allPokes.find(p => p.id === evo);
                    if (evoPoke && evoPoke.rating.absoluteRating > bestEvoRating) {
                        bestEvo = evoPoke.id;
                        bestEvoRating = evoPoke.rating.absoluteRating;
                        bestEvoTier = evoPoke.rating.tier;
                    }
                });
            }
            else {
                const evoPoke = allPokes.find(p => p.id === evoStage);
                if (evoPoke && evoPoke.rating.absoluteRating > bestEvoRating) {
                    bestEvo = evoPoke.id;
                    bestEvoRating = evoPoke.rating.absoluteRating;
                    bestEvoTier = evoPoke.rating.tier;
                }
            }
        });

        poke.rating.bestEvo = bestEvo;
        poke.rating.bestEvoRating = bestEvoRating;
        poke.rating.bestEvoTier = bestEvoTier;
        if (megaEvoTree[poke.family] && !poke.evolutionData.isMega) {
            poke.evolutionData.megaEvos = megaEvoTree[poke.family];
        }

        if (poke.evolutionData.megaEvos && poke.evolutionData.megaEvos.length) {
            let bestMegaEvo = poke.evolutionData.megaEvos[0];
            let bestMegaEvoRating = 0;
            let bestMegaEvoTier = 'BAD';
            poke.evolutionData.megaEvos.forEach(megaEvoId => {
                const megaEvoPoke = allPokes.find(p => p.id === megaEvoId);
                if (megaEvoPoke && megaEvoPoke.rating.absoluteRating > bestMegaEvoRating) {
                    bestMegaEvo = megaEvoPoke.id;
                    bestMegaEvoRating = megaEvoPoke.rating.absoluteRating;
                    bestMegaEvoTier = megaEvoPoke.rating.tier;
                }
            });
            if (bestMegaEvoRating > bestEvoRating) {
                bestEvo = bestMegaEvo;
                bestEvoRating = bestMegaEvoRating;
                bestEvoTier = bestMegaEvoTier;
            }
            poke.rating.megaEvo = bestMegaEvo;
            poke.rating.megaEvoRating = bestMegaEvoRating;
            poke.rating.megaEvoTier = bestMegaEvoTier;
        }
    });

    // const sortedPokesByAbsoluteRating = allPokes.sort((a, b) => {
    //     return b.rating.absoluteRating - a.rating.absoluteRating;
    // });

    // @TODO Algorithm to assing tiers based on rating distribution

    await fs.writeFile(path.resolve(__dirname, 'evoTree.json'), JSON.stringify(evoTree, null, 2), 'utf-8');
    await fs.writeFile(path.resolve(__dirname, 'pokes.json'), JSON.stringify(allPokes, null, 2), 'utf-8');

    await writer(allPokes, moves, abilities);
}

exe();