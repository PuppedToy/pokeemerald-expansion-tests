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
            const currentValue = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
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

function parseAbilitiesFileForAIRating(abilitiesFileText) {
    const lines = abilitiesFileText.split('\n');
    const abilities = {};
    let currentAbility;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('    [')) {
            currentAbility = lines[i].split('[')[1].split(']')[0];
            abilities[currentAbility] = 0;
            continue;
        }
        if (!currentAbility) continue;
        if (lines[i].startsWith('        .aiRating = ')) {
            const rating = lines[i].trim().replace(/.*?=/, '').replace(/,$/, '').trim();
            abilities[currentAbility] = parseFloat(rating);
        }
    }
    return abilities;
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

const statusList = {
    MOVE_BULK_UP: 7,
    MOVE_CALM_MIND: 7,
    MOVE_SWORDS_DANCE: 8,
    MOVE_DEFEND_ORDER: 8,
    MOVE_COSMIC_POWER: 8,
    MOVE_DRAGON_DANCE: 8.5,
    MOVE_QUIVER_DANCE: 9,
    MOVE_VICTORY_DANCE: 9,
    MOVE_TAIL_GLOW: 9,
    MOVE_SHELL_SMASH: 9.5,
    MOVE_SPORE: 10,
    MOVE_BELLY_DRUM: 8,
    MOVE_STEALTH_ROCK: 8,
    MOVE_ACUPRESSURE: 7,
    MOVE_SLEEP_POWDER: 8,
    MOVE_TRICK_ROOM: 7,
    MOVE_DEFOG: 7,
    MOVE_AGILITY: 7,
    MOVE_MILK_DRINK: 8.5,
    MOVE_SOFT_BOILED: 8.5,
    MOVE_SLACK_OFF: 8.5,
    MOVE_HEAL_ORDER: 8.5,
    MOVE_RECOVER: 8.5,
    MOVE_SYNTHESIS: 8.5,
    MOVE_MOONLIGHT: 8.5,
    MOVE_ROOST: 8.5,
    MOVE_HEAL_BELL: 7,
    MOVE_AROMATHERAPY: 7,

    // Other moves that are kinda special
    MOVE_METAL_BURST: 8,
    MOVE_LUSTER_PURGE: 8,
    MOVE_MIST_BALL: 8,

    // Others that might need specific handling
    MOVE_GYRO_BALL: 6,
    // Multi-hits for skill link
    // Drops for contrary
};

function rateMove(move) {
    const isStatus = move.category === 'DAMAGE_CATEGORY_STATUS';
    if (isStatus) return statusList[move.id] || 5;
    if (statusList[move.id]) {
        return statusList[move.id];
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

function ratePokemon(poke, moves, abilitiesRatings) {
    const BEST_RATING_FOR_MEGA_EVO = 780;
    const BEST_RATING_FOR_FULLY_EVO = 720;
    const BEST_RATING_FOR_NFE = 515;
    const BEST_RATING_FOR_LC_3EVO = 400;

    const WORST_RATING_FOR_MEGA_EVO = 480;
    const WORST_RATING_FOR_FULLY_EVO = 250;
    const WORST_RATING_FOR_NFE = 205;
    const WORST_RATING_FOR_LC_3EVO = 180;

    let bestAbilityRating = 0;
    poke.parsedAbilities.forEach(abilityId => {
        if (abilityId === 'NONE') return;
        const abilityRating = abilitiesRatings[`ABILITY_${abilityId}`] || 0;
        if (abilityRating > bestAbilityRating) {
            bestAbilityRating = abilityRating;
        }
    });

    let trueBST = poke.baseBST;
    if (poke.abilities.includes('TRUANT')) {
        trueBST *= 0.7;
    }
    if (poke.abilities.includes('HUGE_POWER') || poke.abilities.includes('PURE_POWER')) {
        trueBST += poke.baseAttack;
        bestAbilityRating = poke.baseAttack / 12;
    }
    // Wonder Guard?
    // @TODO if any stat is a hard outlier, increase bst rating (deoxys, blissey)
    // @TODO What happens to Zacian and Eternatus-Emax?

    // 0-10 while 0 is WORST_RATING_FOR_LC_3EVO and 10 is BEST_RATING_FOR_MEGA_EVO
    const absoluteBSTRating = Math.max(0, (trueBST - WORST_RATING_FOR_LC_3EVO) * 10 / (BEST_RATING_FOR_MEGA_EVO - WORST_RATING_FOR_LC_3EVO));
    // For now we will just do absolute
    // @TODO relative

    const sortedMoves = [
        ...poke.learnset.map(({ move }) => move),
        ...poke.teachables,
    ].sort((a, b) => {
        return (moves[b].rating || 0) - (moves[a].rating || 0);
    });

    const best4Moves = sortedMoves.slice(0, 4);

    let movesRating = 0;
    best4Moves.forEach(moveId => {
        if (moves[moveId] && moves[moveId].rating) {
            movesRating += moves[moveId].rating;
        }
    });
    movesRating *= 0.25;

    const absoluteRating = (absoluteBSTRating * 0.8) + (movesRating * 0.1) + (bestAbilityRating * 0.1);

    // These tiers are kinda working. I should add that OU is actually exclusive pokemon and UU-RU are the average fully evolved ones
    // GOD should only be used by extremely hard bosses. Should not come up in the game in general. Esp. Eternatus Emax
    let temporaryTier;
    if (absoluteRating >= 9) {
        temporaryTier = 'GOD';
    }
    else if (absoluteRating >= 8) {
        temporaryTier = 'LEGEND';
    }
    else if (absoluteRating >= 7) {
        temporaryTier = 'OU';
    }
    else if (absoluteRating >= 6) {
        temporaryTier = 'UU';
    }
    else if (absoluteRating >= 5) {
        temporaryTier = 'RU';
    }
    else if (absoluteRating >= 4) {
        temporaryTier = 'NU';
    }
    else if (absoluteRating >= 3) {
        temporaryTier = 'PU';
    }
    else if (absoluteRating >= 2) {
        temporaryTier = 'LC';
    }
    else if (absoluteRating >= 1) {
        temporaryTier = 'BAD';
    }
    else {
        temporaryTier = 'OOPSIE';
    }

    return {
        absoluteRating,
        absoluteBSTRating,
        best4Moves,
        movesRating,
        bestAbilityRating,
        temporaryTier,
    };
}

async function exe() {
    const abilitiesFilePath = `${__dirname}\\..\\src\\data\\abilities.h`;
    const abilitiesFileText = await fs.readFile(abilitiesFilePath, 'utf-8');
    const abilitiesRatings = parseAbilitiesFileForAIRating(abilitiesFileText);
    await fs.writeFile(`${__dirname}\\abilitiesRatings.json`, JSON.stringify(abilitiesRatings, null, 2), 'utf-8');

    const movesFilePath = `${__dirname}\\..\\src\\data\\moves_info.h`;
    const movesFileText = await fs.readFile(movesFilePath, 'utf-8');
    const moves = parseMovesFile(movesFileText);

    Object.keys(moves).forEach(moveId => {
        moves[moveId].power = parseMoveStat(moves[moveId].power);
        moves[moveId].accuracy = parseMoveStat(moves[moveId].accuracy);
        moves[moveId].pp = parseMoveStat(moves[moveId].pp);
        moves[moveId].priority = parseMoveStat(moves[moveId].priority);
        moves[moveId].rating = rateMove(moves[moveId]);
    });

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
            const fullPoke = {
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
            };
            fullPoke.rating = ratePokemon(fullPoke, moves, abilitiesRatings);
            allPokes.push(fullPoke);
        });
    });

    // const sortedPokesByAbsoluteRating = allPokes.sort((a, b) => {
    //     return b.rating.absoluteRating - a.rating.absoluteRating;
    // });

    // @TODO Algorithm to assing tiers based on rating distribution

    await fs.writeFile(`${__dirname}\\pokes.json`, JSON.stringify(allPokes, null, 2), 'utf-8');
}

exe();