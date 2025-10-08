const fs = require('fs').promises;
const path = require('path');

const wild = require('./wild.js');
const trainers = require('./trainers.js');
const {
    EVO_TYPE_LC,
    EVO_TYPE_NFE,
    EVO_TYPE_SOLO,
    EVO_TYPE_LC_OF_3,

    TIER_AVERAGE,
    TIER_STRONG,
    TIER_PREMIUM,
    TIER_LEGEND,

    TIER_LEGEND_THRESHOLD,
    TIER_STRONG_THRESHOLD,
    MID_TIER_STRONG_THRESHOLD,
    MID_TIER_PREMIUM_THRESHOLD,
    TRAINER_POKE_ENCOUNTER,
    TRAINER_POKE_STARTER_TREECKO,
    TRAINER_POKE_STARTER_TORCHIC,
    TRAINER_POKE_STARTER_MUDKIP,
    TRAINER_RESTRICTION_NO_REPEATED_TYPE,
    TRAINER_RESTRICTION_ALLOW_ONLY_TYPES,
    TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES,
    TRAINER_REPEAT_ID,
    OUTPUT_DIR,
    TEMPLATE_FILE,
    TEMPLATE_TRAINERS_REPLACEMENT,
    TEMPLATE_POKEMON_REPLACEMENT,
    TEMPLATE_WILDPOKES_REPALCEMENT,
} = require('./constants');
const { chooseMoveset } = require('./rating.js');

const MAX_MEGA_EVO_STONES = 3;

const startersFile = path.resolve(__dirname, '..', 'src', 'starter_choose.c');

const starterMonText = `static const u16 sStarterMon[STARTER_MON_COUNT] =
{
    SPECIES_TREECKO,
    SPECIES_TORCHIC,
    SPECIES_MUDKIP,
};`;

const starterExtraMonText = `static const u16 sStarterExtraMon[STARTER_EXTRA_COUNT] =
{
    SPECIES_BAGON,
    SPECIES_KABUTOPS,
    SPECIES_LARVITAR,
    SPECIES_BELDUM,
    SPECIES_SCYTHER,
    SPECIES_RALTS,
    SPECIES_SHROOMISH,
    SPECIES_NOIBAT,
    SPECIES_SNORUNT,
};`;

const starterExtraCountText = '#define STARTER_EXTRA_COUNT 9';

// Static replacements

const castformReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'Route119_WeatherInstitute_2F', 'scripts.inc');
const castformReplacementText = 'SPECIES_CASTFORM_NORMAL';
const castformMSGBOXReplacementText = 'CASTFORM\\!\\$';
const castformItemReplacementText = 'ITEM_MYSTIC_WATER';

const regirockReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'DesertRuins', 'scripts.inc');
const regirockReplacementText = 'SPECIES_REGIROCK';

const regiceReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'IslandCave', 'scripts.inc');
const regiceReplacementText = 'SPECIES_REGICE';

const registeelReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'AncientTomb', 'scripts.inc');
const registeelReplacementText = 'SPECIES_REGISTEEL';

const mewReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'NewMauville_Entrance', 'scripts.inc');
const mewReplacementText = 'SPECIES_MEW';

const latiosReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'MossdeepCity_Gym', 'scripts.inc');
const latiosReplacementText = 'SPECIES_LATIOS';
const latiosMSGBOXReplacementText = 'LATIOS\\!\\$';

const rayquazaReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'SkyPillar_Top', 'scripts.inc');
const rayquazaReplacementText = 'SPECIES_RAYQUAZA';

const PERFECT_STARTER_TRIOS = [
    ['GRASS', 'FIRE', 'WATER'],
    ['FIGHTING', 'PSYCHIC', 'DARK'],
];

const GOOD_STARTER_TRIOS = [
    ['GRASS', 'ROCK', 'BUG'],
    ['WATER', 'GROUND', 'ELECTRIC'],
    ['FIGHTING', 'FAIRY', 'STEEL'],
    ['FIGHTING', 'FLYING', 'ICE'],
    ['FIGHTING', 'ROCK', 'FLYING'],
    ['FIRE', 'GROUND', 'GRASS'],
    ['FIRE', 'ROCK', 'GRASS'],
    ['FIRE', 'WATER', 'GRASS'],
    ['FIRE', 'GROUND', 'ICE'],
    ['FIRE', 'ROCK', 'STEEL'],
    ['GRASS', 'FLYING', 'ROCK'],
    ['GRASS', 'POISON', 'GROUND'],
    ['GRASS', 'ICE', 'ROCK'],
    ['ICE', 'GROUND', 'ROCK'],
    ['ICE', 'STEEL', 'GROUND'],
];

const TYPES = {
    FIRE: [],
    WATER: [],
    GRASS: [],
    ELECTRIC: [],
    ICE: [],
    FIGHTING: [],
    POISON: [],
    GROUND: [],
    FLYING: [],
    PSYCHIC: [],
    BUG: [],
    ROCK: [],
    DARK: [],
    STEEL: [],
    FAIRY: [],
    // Non useful types
    NORMAL: [],
    GHOST: [],
    DRAGON: [],
};

function sampleAndRemove(array) {
    if (array.length === 0) return null;
    const index = Math.floor(Math.random() * array.length);
    const element = array[index];
    array.splice(index, 1);
    return element;
}

function sample(array) {
    if (array.length === 0) return null;
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

async function writer(pokemonList, moves, abilities) {
    const elegiblePokemonForStarters = [];
    const averagePokemonLC = [];
    pokemonList.forEach(poke => {
        if (
            poke.evolutionData.type === EVO_TYPE_LC_OF_3
            && poke.evolutionData.isLC
            && (poke.rating.bestEvoTier === TIER_STRONG || poke.rating.bestEvoTier === TIER_AVERAGE)
            && (!poke.rating.megaEvoRating || poke.rating.megaEvoRating < TIER_LEGEND_THRESHOLD)
        ) {
            poke.parsedTypes.forEach(type => {
                if (!TYPES[type]) {
                    TYPES[type] = [];
                }
                TYPES[type].push(poke.id);
            });
        }

        if (poke.evolutionData.isLC && poke.rating.bestEvoRating <= TIER_STRONG_THRESHOLD) {
            averagePokemonLC.push(poke.id);
        }
    });

    // 50% of perfect forward and backwards type weakness in perfect trios
    // The other 50% is for any type trio that only fulfills supereffective but not resistant backwards
    const usedTrios = Math.random() < 0.5 ? PERFECT_STARTER_TRIOS : GOOD_STARTER_TRIOS;

    const emptyTypes = Object.entries(TYPES).filter(([type, pokes]) => pokes.length === 0).map(([type]) => type);
    if (emptyTypes.length > 0) {
        for (let i = usedTrios.length - 1; i >= 0; i--) {
            const trio = usedTrios[i];
            if (trio.some(type => emptyTypes.includes(type))) {
                usedTrios.splice(i, 1);
            }
        }
    }

    if (usedTrios.length === 0) {
        console.log('No good starter trios available due to missing types.');
        return;
    }

    // Pick a random good trio
    const randomTrio = usedTrios[Math.floor(Math.random() * usedTrios.length)];
    randomTrio.forEach(type => {
        const pokesOfType = TYPES[type];
        const randomPoke = pokesOfType[Math.floor(Math.random() * pokesOfType.length)];
        elegiblePokemonForStarters.push(randomPoke);
    });

    const starters = [
        elegiblePokemonForStarters[0],
        elegiblePokemonForStarters[1],
        elegiblePokemonForStarters[2],
    ];
    
    // Pick 9 other unique pokemon from notTooStrongPokemonLC that are not in elegiblePokemonForStarters
    const alreadyChosenSet = new Set();
    alreadyChosenSet.add([...starters]);
    const chosenExtraPokemon = [];
    const shuffledNotTooStrongPokemonLC = averagePokemonLC
        .filter(p => !alreadyChosenSet.has(p))
        .sort(() => 0.5 - Math.random());
    let nextIndex = 0;
    while (chosenExtraPokemon.length < 9 && shuffledNotTooStrongPokemonLC.length > 0) {
        const randomPoke = shuffledNotTooStrongPokemonLC[nextIndex];
        if (!alreadyChosenSet.has(randomPoke)) {
            if (chosenExtraPokemon.length === 8) {
                // The last pokemon must have mega evolution
                const hasMegaEvo = pokemonList.find(p => p.id === randomPoke && p.evolutionData.megaEvos && p.evolutionData.megaEvos.length > 0);
                if (!hasMegaEvo) {
                    nextIndex += 1;
                    continue;
                }
            }
            chosenExtraPokemon.push(randomPoke);
            alreadyChosenSet.add(randomPoke);
        }
        // Remove the considered pokemon from the pool to avoid infinite loops
        shuffledNotTooStrongPokemonLC.splice(nextIndex, 1);
    }

    let newStartersFile = await fs.readFile(startersFile, 'utf8');

    // Edit starterMonText with starters
    newStartersFile = newStartersFile.replace(
        starterMonText,
        `static const u16 sStarterMon[STARTER_MON_COUNT] =
{
    ${starters[0]},
    ${starters[1]},
    ${starters[2]},
};`
    );

    // Edit starterMonText with extra starters
    newStartersFile = newStartersFile.replace(
        starterExtraMonText,
        `static const u16 sStarterExtraMon[STARTER_EXTRA_COUNT] =
{
    ${chosenExtraPokemon.join(',\n    ')},
};`
    );

    // Edit starterExtraCountText with actual count of extra starters
    newStartersFile = newStartersFile.replace(
        starterExtraCountText,
        `#define STARTER_EXTRA_COUNT ${chosenExtraPokemon.length}`
    );

    await fs.writeFile(startersFile, newStartersFile, 'utf8');
    console.log('Starter pokemon updated successfully.');

    const route111File = path.resolve(__dirname, '..', 'data', 'maps', 'Route111', 'map.json');
    let route111Data = await fs.readFile(route111File, 'utf8');

    const chosenPokemonThatHaveMegaEvo = [...starters, ...chosenExtraPokemon].map((pokeId) =>
        pokemonList.find(p => p.id === pokeId),
    ).filter(p => p && p.evolutionData.megaEvos && p.evolutionData.megaEvos.length > 0);
    const itemDataList = [
        'ITEM_SCEPTILITE',
        'ITEM_BLAZIKENITE',
        'ITEM_SWAMPERTITE',
    ];

    for (let i = 0; i < Math.min(chosenPokemonThatHaveMegaEvo.length, MAX_MEGA_EVO_STONES); i++) {
        const poke = chosenPokemonThatHaveMegaEvo[i];
        const megaEvos = poke.evolutionData.megaEvos;
        const chosenMegaEvo = megaEvos[Math.floor(Math.random() * megaEvos.length)];
        const megaItem = pokemonList.find(p => p.id === chosenMegaEvo).evolutionData.megaItem;
        route111Data = route111Data.replace(itemDataList[i], megaItem);
    }

    await fs.writeFile(route111File, route111Data, 'utf8');
    console.log('Route 111 map updated with new starter mega stones.');
    // @TODO Replace mega stone trainers & rival

    const castformReplacementList = pokemonList.filter(poke =>
        !alreadyChosenSet.has(poke.id)
        && poke.evolutionData.isLC
        && poke.evolutionData.megaEvos
        && poke.evolutionData.megaEvos.length > 0
        && (poke.rating.megaEvoTier === TIER_PREMIUM || poke.rating.megaEvoTier === TIER_LEGEND)
    );
    const castformReplacement = sampleAndRemove(castformReplacementList);
    alreadyChosenSet.add(castformReplacement.id);

    const regisReplacementList = pokemonList.filter(poke =>
        !alreadyChosenSet.has(poke.id)
        && poke.rating.bestEvoTier === TIER_STRONG
        && poke.evolutionData.type === EVO_TYPE_SOLO
    );
    const regirockReplacement = sampleAndRemove(regisReplacementList);
    alreadyChosenSet.add(regirockReplacement.id);
    const regiceReplacement = sampleAndRemove(regisReplacementList);
    alreadyChosenSet.add(regiceReplacement.id);
    const registeelReplacement = sampleAndRemove(regisReplacementList);
    alreadyChosenSet.add(registeelReplacement.id);
    const latiosReplacement = sampleAndRemove(regisReplacementList);
    alreadyChosenSet.add(latiosReplacement.id);

    const mewReplacementList = pokemonList.filter(poke =>
        !alreadyChosenSet.has(poke.id)
        && poke.rating.bestEvoTier === TIER_PREMIUM
        && poke.rating.absoluteRating <= MID_TIER_PREMIUM_THRESHOLD
        && poke.evolutionData.type === EVO_TYPE_SOLO
    );
    const mewReplacement = sampleAndRemove(mewReplacementList);
    alreadyChosenSet.add(mewReplacement.id);

    // @TODO Choose between rayquaza, kyogre and groudon
    const rayquazaReplacementList = pokemonList.filter(poke =>
        !alreadyChosenSet.has(poke.id)
        && (
            poke.rating.bestEvoTier === TIER_LEGEND
            || (poke.rating.bestEvoTier === TIER_PREMIUM && poke.rating.absoluteRating >= MID_TIER_PREMIUM_THRESHOLD)
        )
        && poke.evolutionData.type === EVO_TYPE_SOLO
    );
    const rayquazaReplacement = sampleAndRemove(rayquazaReplacementList);
    alreadyChosenSet.add(rayquazaReplacement.id);
    const groudonReplacement = sampleAndRemove(rayquazaReplacementList);
    alreadyChosenSet.add(groudonReplacement.id);
    const kyogreReplacement = sampleAndRemove(rayquazaReplacementList);
    alreadyChosenSet.add(kyogreReplacement.id);

    const replacementLog = {};

    if (castformReplacement) {
        let castformFileData = await fs.readFile(castformReplacementFile, 'utf8');
        // Replace all occurrences for each replacement
        castformFileData = castformFileData.replace(new RegExp(castformReplacementText, 'g'), castformReplacement.id);
        castformFileData = castformFileData.replace(new RegExp(castformMSGBOXReplacementText, 'g'), `${castformReplacement.name.toUpperCase()}!$`);
        const megaEvoItems = castformReplacement.evolutionData.megaEvos.map(me => {
            const megaPoke = pokemonList.find(p => p.id === me);
            return megaPoke ? megaPoke.evolutionData.megaItem : null;
        }).filter(item => item !== null);
        if (megaEvoItems.length > 0) {
            const chosenItem = megaEvoItems[Math.floor(Math.random() * megaEvoItems.length)];
            castformFileData = castformFileData.replace(new RegExp(castformItemReplacementText, 'g'), chosenItem);
        }
        else {
            console.log(`No mega evolution found for ${castformReplacement.id}, keeping original item.`);
        }
        await fs.writeFile(castformReplacementFile, castformFileData, 'utf8');
        replacementLog['SPECIES_CASTFORM_NORMAL'] = castformReplacement.id;
    }

    if (regirockReplacement) {
        let regirockFileData = await fs.readFile(regirockReplacementFile, 'utf8');
        regirockFileData = regirockFileData.replace(new RegExp(regirockReplacementText, 'g'), regirockReplacement.id);
        await fs.writeFile(regirockReplacementFile, regirockFileData, 'utf8');
        replacementLog['SPECIES_REGIROCK'] = regirockReplacement.id;
    }

    if (regiceReplacement) {
        let regiceFileData = await fs.readFile(regiceReplacementFile, 'utf8');
        regiceFileData = regiceFileData.replace(new RegExp(regiceReplacementText, 'g'), regiceReplacement.id);
        await fs.writeFile(regiceReplacementFile, regiceFileData, 'utf8');
        replacementLog['SPECIES_REGICE'] = regiceReplacement.id;
    }

    if (mewReplacement) {
        let mewFileData = await fs.readFile(mewReplacementFile, 'utf8');
        mewFileData = mewFileData.replace(new RegExp(mewReplacementText, 'g'), mewReplacement.id);
        await fs.writeFile(mewReplacementFile, mewFileData, 'utf8');
        replacementLog['SPECIES_MEW'] = mewReplacement.id;
    }

    if (registeelReplacement) {
        let registeelFileData = await fs.readFile(registeelReplacementFile, 'utf8');
        registeelFileData = registeelFileData.replace(new RegExp(registeelReplacementText, 'g'), registeelReplacement.id);
        await fs.writeFile(registeelReplacementFile, registeelFileData, 'utf8');
        replacementLog['SPECIES_REGISTEEL'] = registeelReplacement.id;
    }

    if (latiosReplacement) {
        let latiosFileData = await fs.readFile(latiosReplacementFile, 'utf8');
        latiosFileData = latiosFileData.replace(new RegExp(latiosReplacementText, 'g'), latiosReplacement.id);
        latiosFileData = latiosFileData.replace(new RegExp(latiosMSGBOXReplacementText, 'g'), `${latiosReplacement.name.toUpperCase()}!$`);
        await fs.writeFile(latiosReplacementFile, latiosFileData, 'utf8');
        replacementLog['SPECIES_LATIOS'] = latiosReplacement.id;
    }

    if (rayquazaReplacement) {
        let rayquazaFileData = await fs.readFile(rayquazaReplacementFile, 'utf8');
        rayquazaFileData = rayquazaFileData.replace(new RegExp(rayquazaReplacementText, 'g'), rayquazaReplacement.id);
        await fs.writeFile(rayquazaReplacementFile, rayquazaFileData, 'utf8');
        replacementLog['SPECIES_RAYQUAZA'] = rayquazaReplacement.id;
    }

    if (groudonReplacement) {
        // @TODO Implement groudon map replacement
        replacementLog['SPECIES_GROUDON'] = groudonReplacement.id;
    }

    if (kyogreReplacement) {
        // @TODO Implement kyogre map replacement
        replacementLog['SPECIES_KYOGRE'] = kyogreReplacement.id;
    }

    // Routes replacements

    let wildEncountersFileContent = await fs.readFile((wild.file), 'utf8');

    const { replacementTypes: wildReplacementTypes } = wild;
    const replacementLists = {};

    Object.entries(wildReplacementTypes).forEach(([key, value]) => {
        const { replace: tiers, type: types } = value;
        replacementLists[key] = pokemonList.filter(poke => {
            if (alreadyChosenSet.has(poke.id)) return false;
            if (!tiers.includes(poke.rating.bestEvoTier)) return false;
            let hasAnyTypeOfReplacement = false;
            types.forEach(replacementType => {
                if (replacementType === EVO_TYPE_LC) {
                    hasAnyTypeOfReplacement = hasAnyTypeOfReplacement || poke.evolutionData.isLC;
                }
                else if (replacementType === EVO_TYPE_NFE) {
                    hasAnyTypeOfReplacement = hasAnyTypeOfReplacement || poke.evolutionData.isNFE;
                }
                else if (replacementType === EVO_TYPE_SOLO) {
                    hasAnyTypeOfReplacement = hasAnyTypeOfReplacement || poke.evolutionData.type === EVO_TYPE_SOLO;
                }
            });
            return hasAnyTypeOfReplacement;
        });
    });

    Object.entries(wild.replacements).forEach(([speciesId, replacementTypeKey]) => {
        const replacementType = wildReplacementTypes[replacementTypeKey];
        if (!replacementType) {
            console.log(`No replacement type found for key ${replacementTypeKey}, skipping replacement for ${speciesId}.`);
            return;
        }
        const replacementList = replacementLists[replacementTypeKey];
        if (!replacementList || replacementList.length === 0) {
            console.log(`No replacement list found or empty for type ${replacementTypeKey}, skipping replacement for ${speciesId}.`);
            return;
        }
        const replacement = sampleAndRemove(replacementList);
        if (!replacement) {
            console.log(`No replacement found for ${speciesId} of type ${replacementTypeKey}, skipping.`);
            return;
        }
        alreadyChosenSet.add(replacement.id);
        replacementLog[speciesId] = replacement.id;

        const regex = new RegExp(speciesId, 'g');
        wildEncountersFileContent = wildEncountersFileContent.replace(regex, replacement.id);
    });

    await fs.writeFile((wild.file), wildEncountersFileContent, 'utf8');
    console.log('Wild encounters updated successfully.');

    // Trainers

    let trainersFileContent = await fs.readFile(trainers.file, 'utf8');
    const { trainersData } = trainers;
    const trainersResults = {};

    const storedIds = {};

    trainersData.forEach(trainer => {
        if (trainer.copy) {
            const target = trainersResults[trainer.copy];
            trainersResults[trainer.id] = {
                level: target.level,
                team: [...target.team],
            };
            return;
        }

        const team = [];
        trainer.team.forEach(trainerMonDefinition => {
            let pokemonStrictList = [];
            let pokemonLooseList = [];
            let chosenTrainerMon;
            if (trainerMonDefinition.oneOf) {
                pokemonLooseList = trainerMonDefinition.oneOf.map(p => pokemonList.find(pl => pl.id === p));
            }
            else if (trainerMonDefinition.specific) {
                const specificPokemon = pokemonList.find(p => p.id === trainerMonDefinition.specific);
                if (specificPokemon) {
                    pokemonStrictList = [specificPokemon];
                }
            }
            else if (trainerMonDefinition.special === TRAINER_POKE_ENCOUNTER) {
                pokemonLooseList = trainerMonDefinition.encounterIds.map((encounterId) => {
                    const replacedId = replacementLog[encounterId];
                    const pokemon = pokemonList.find(p => p.id === (replacedId || encounterId));
                    return pokemon;
                });
            }
            else if (trainerMonDefinition.special === TRAINER_POKE_STARTER_TREECKO) {
                const starterPokemon = pokemonList.find(p => p.id === starters[0]);
                pokemonStrictList = [starterPokemon];
            }
            else if (trainerMonDefinition.special === TRAINER_POKE_STARTER_TORCHIC) {
                const starterPokemon = pokemonList.find(p => p.id === starters[1]);
                pokemonStrictList = [starterPokemon];
            }
            else if (trainerMonDefinition.special === TRAINER_POKE_STARTER_MUDKIP) {
                const starterPokemon = pokemonList.find(p => p.id === starters[2]);
                pokemonStrictList = [starterPokemon];
            }
            else if (trainerMonDefinition.special === TRAINER_REPEAT_ID) {
                const repeatedId = storedIds[trainerMonDefinition.id];
                if (repeatedId) {
                    const repeatedPokemon = pokemonList.find(p => p.id === repeatedId);
                    if (repeatedPokemon) {
                        pokemonStrictList = [repeatedPokemon];
                    }
                    else {
                        console.warn(`WARN: No pokemon found with id ${repeatedId} to repeat in trainer ${trainer.id}. The ID was stored but no matching pokemon found.`);
                    }
                }
                else {
                    console.warn(`WARN: No stored id found for ${trainerMonDefinition.idToRepeat} to repeat in trainer ${trainer.id}.`);
                }
            }
            else {
                pokemonLooseList = [...pokemonList];
            }

            // General filters for the loose list
            if (trainerMonDefinition.absoluteTier) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => trainerMonDefinition.absoluteTier.includes(loosePokemon.rating.tier),
                );
            }
            if (trainerMonDefinition.evoType && trainerMonDefinition.evoType.includes(EVO_TYPE_LC)) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => loosePokemon.evolutionData.isLC,
                );
            }
            if (trainerMonDefinition.megaTier) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => loosePokemon.evolutionData.megaEvos
                        && loosePokemon.evolutionData.megaEvos.length > 0
                        && trainerMonDefinition.megaTier.includes(loosePokemon.rating.megaEvoTier),
                );
            }
            if (trainerMonDefinition.type) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => loosePokemon.parsedTypes.some(t => trainerMonDefinition.type.includes(t)),
                );
            }
            if (trainerMonDefinition.abilities) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => loosePokemon.parsedAbilities.some(a => trainerMonDefinition.abilities.includes(a)),
                );
            }

            const canLearnMove = (moveToLearn) => {
                console.log(`Checking if ${chosenTrainerMon.id} @ ${trainer.level} can learn ${moveToLearn}`);
                console.log(`Teachables: ${chosenTrainerMon.teachables}`);
                console.log(`Learnset: ${chosenTrainerMon.learnset ? chosenTrainerMon.learnset.map(lu => `${lu.move} @ ${lu.level}`).join(', ') : 'N/A'}`);
                const result = (
                    chosenTrainerMon.teachables
                    && chosenTrainerMon.teachables.includes(moveToLearn)
                )
                ||
                (
                    chosenTrainerMon.learnset
                    && chosenTrainerMon.learnset.some(lu => lu.move === moveToLearn && lu.level <= trainer.level)
                );
                console.log(`Result: ${result}`);
                return result;
            }
                

            if (trainerMonDefinition.mustHaveOneOfMoves) {
                trainerMonDefinition.mustHaveOneOfMoves.forEach(moveToLearn => {
                    pokemonLooseList = pokemonLooseList.filter(
                        loosePokemon => {
                            chosenTrainerMon = loosePokemon;
                            return canLearnMove(moveToLearn);
                        }
                    );
                });
            }

            // Always apply unique restriction
            if (pokemonLooseList.length > 0) {
                let filteredLooseList = pokemonLooseList.filter(
                    loosePokemon => !team.find(teamPokemon => teamPokemon.pokemon.id === loosePokemon.id)
                );
                
                // Then apply other restrictions
                (trainer.restrictions || []).forEach(restriction => {
                    if (restriction === TRAINER_RESTRICTION_NO_REPEATED_TYPE) {
                        const selectedTypes = new Set(...team.map(pokemon => pokemon.parsedTypes).flat());
                        filteredLooseList = filteredLooseList.filter(p => !p.parsedTypes.some(t => selectedTypes.has(t)));
                    }
                    else if (restriction === TRAINER_RESTRICTION_ALLOW_ONLY_TYPES) {
                        if (trainer.types) {
                            filteredLooseList = filteredLooseList.filter(p => p.parsedTypes.some(t => trainer.types.includes(t)));
                        }
                        else {
                            console.warn(`Trainer ${trainer.id} has restriction TRAINER_RESTRICTION_ALLOW_ONLY_TYPES but no types defined. Ignoring restriction.`);
                        }
                    }
                    else if (restriction === TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES) {
                        if (trainer.abilities) {
                            filteredLooseList = filteredLooseList.filter(p => p.parsedAbilities.some(a => trainer.abilities.includes(a)));
                        }
                        else {
                            console.warn(`Trainer ${trainer.id} has restriction TRAINER_RESTRICTION_ALLOW_ONLY_ABILITIES but no abilities defined. Ignoring restriction.`);
                        }
                    }
                });
                pokemonStrictList = [...pokemonStrictList, ...filteredLooseList];
            }

            // If any strict pokemon meet the restrictions, pick from them
            if (pokemonStrictList.length > 0) {
                chosenTrainerMon = sample(pokemonStrictList);
            }
            // Else pick from the loose list if any
            else if (pokemonLooseList.length > 0) {
                // First try to apply at least unique restriction
                const filteredLooseList = pokemonLooseList.filter(
                    loosePokemon => !team.find(teamPokemon => teamPokemon.pokemon.id === loosePokemon.id)
                );
                if (filteredLooseList.length > 0) {
                    chosenTrainerMon = sample(filteredLooseList);
                }
                else {
                    chosenTrainerMon = sample(pokemonLooseList);
                }
            }
            else {
                console.warn(`WARN: No pokemon available for trainer ${trainer.id} with definition ${JSON.stringify(trainerMonDefinition)}. Picking a random one.`);
                // Pick a random pokemon
                const randomPokemon = sample(pokemonList);
                chosenTrainerMon = randomPokemon;
            }

            if (trainerMonDefinition.tryEvolve) {
                let possibleEvolutions;
                do {
                    if (!chosenTrainerMon.evolutions || chosenTrainerMon.evolutions.length === 0) {
                        break;
                    }

                    // Try to evolve to the first possible evolution
                    possibleEvolutions = chosenTrainerMon.evolutions.filter(({ param }) => 
                        !isNaN(parseInt(param)) && parseInt(param) <= trainer.level && parseInt(param) > 4
                    );
                    if (possibleEvolutions.length > 0) {
                        // sort by param
                        possibleEvolutions.sort((a, b) => parseInt(b.param) - parseInt(a.param));
                        const evolutionToApply = possibleEvolutions[0].pokemon;
                        console.log(`Evolving ${chosenTrainerMon.id} to ${evolutionToApply} for trainer ${trainer.id}`);
                        const evolvedForm = pokemonList.find(p => p.id === evolutionToApply);
                        if (evolvedForm) {
                            chosenTrainerMon = evolvedForm;
                        }
                    }
                } while (possibleEvolutions.length > 0);
            }

            if (chosenTrainerMon) {
                if (trainerMonDefinition.id) {
                    storedIds[trainerMonDefinition.id] = chosenTrainerMon.id;
                }
                const newTeamMember = {
                    pokemon: chosenTrainerMon,
                    item: trainerMonDefinition.item || null,
                    nature: trainerMonDefinition.nature || null,
                    moves: [],
                };
                if (trainerMonDefinition.tryToHaveMove) {
                    trainerMonDefinition.tryToHaveMove.forEach(moveToLearn => {
                        if (
                            canLearnMove(moveToLearn)
                            && !newTeamMember.moves[moveToLearn]
                        ) {
                            newTeamMember.moves.push(moveToLearn);
                        }
                    });
                }
                let validAbilities = [];
                if (trainer.abilities && trainer.abilities.length > 0) {
                    validAbilities = [...validAbilities, ...chosenTrainerMon.parsedAbilities.filter(a => trainer.abilities.includes(a))];
                }
                if (trainerMonDefinition.abilities) {
                    validAbilities = [...validAbilities, ...chosenTrainerMon.parsedAbilities.filter(a => trainerMonDefinition.abilities.includes(a))];
                }
                if (validAbilities.length > 0) {
                    const ability = sample(validAbilities);
                    newTeamMember.ability = ability;
                }
                const { moveset, tmsUsed } = chooseMoveset(
                    chosenTrainerMon,
                    moves,
                    trainer.level,
                    newTeamMember.moves,
                    newTeamMember.ability,
                    newTeamMember.item,
                    [], // @TODO tms in bag
                    0.1, // Deviation for trainer bias
                );
                newTeamMember.moves = moveset;
                team.push(newTeamMember);
            }
            else {
                console.warn(`No pokemon chosen for trainer ${trainer.id} with definition ${JSON.stringify(trainerMonDefinition)}`);
            }
        });

        trainersResults[trainer.id] = {
            level: trainer.level,
            team,
        };
    });

    Object.entries(trainersResults).forEach(([trainerId, trainerData]) => {
        
        const generatedTeamTextLines = trainerData.team.map(teamEntry => {
            const lines = [
                teamEntry.item ? `${teamEntry.pokemon.name} @ ${teamEntry.item}` : teamEntry.pokemon.name,
            ];
            if (teamEntry.ability) {
                lines.push(`Ability: ${teamEntry.ability}`);
            }
            lines.push(`Level: ${trainerData.level}`);
            if (teamEntry.nature) {
                lines.push(`Nature: ${teamEntry.nature}`);
            }
            lines.push('IVs: 31 HP / 31 Atk / 31 Def / 31 SpA / 31 SpD / 31 Spe',);
            if (teamEntry.moves && teamEntry.moves.length > 0) {
                const moveNames = teamEntry.moves.slice(0, 4)
                    .map(m => moves[m] ? moves[m].name : m);
                lines.push(`- ${moveNames.join('\n- ')}`);
            }
            return [...lines, ''];
        }).flat().join('\n');
        
        /* Trainers will be like this
        === TRAINER_ELIJAH ===
        Name: ELIJAH
        Class: Bird Keeper
        Pic: Bird Keeper
        Gender: Male
        Music: Cool
        Double Battle: No
        AI: Check Bad Move

        Zigzagoon
        Level: 5
        IVs: 0 HP / 0 Atk / 0 Def / 0 SpA / 0 SpD / 0 Spe

        === OTHER TRAINER ===
        */

        // Find the trainer name, keep all the content after it until the first pokemon, which will be always after blank line
        // Replace everything up to === OTHER TRAINER === or end of file with the generated team

        const replaceRegex = new RegExp(`(=== ${trainerId} ===[\\s\\S\\n\\r]*?[\\n\\r][\\n\\r])([\\s\\S\\n\\r]*?)(===|$)`, 'g');
        // Group 1 is the text to keep before the team
        // Group 2 is the text to replace (the team)
        // Group 3 is the === of the next trainer or end of file, to keep as is
        // Mind, Group 2 could appear multiple times in the file and I want to replace this specific trainer
        const fullReplacementText = `$1${generatedTeamTextLines}\n$3`;
        trainersFileContent = trainersFileContent.replace(replaceRegex, fullReplacementText);
    });

    await fs.writeFile((trainers.file), trainersFileContent, 'utf8');
    console.log('Trainers updated successfully.');

    let htmlOutputTemplate = await fs.readFile(path.resolve(__dirname, OUTPUT_DIR, TEMPLATE_FILE), 'utf8');

    const trainersResultsSimplified = {};
    Object.entries(trainersResults).forEach(([trainerId, trainerData]) => {
        trainersResultsSimplified[trainerId] = {
            ...trainerData,
            team: trainerData.team.map(teamEntry => ({
                ...teamEntry,
                pokemon: teamEntry.pokemon.id,
            })), 
        };
    });
    htmlOutputTemplate = htmlOutputTemplate.replace(TEMPLATE_TRAINERS_REPLACEMENT, `<script>const trainersData = ${JSON.stringify(trainersResultsSimplified)};</script>`);
    await fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, 'trainers.js'), `const trainersData = ${JSON.stringify(trainersResultsSimplified, null, 4)};`, 'utf8');
    htmlOutputTemplate = htmlOutputTemplate.replace(TEMPLATE_POKEMON_REPLACEMENT, `<script>const pokes = ${JSON.stringify(pokemonList)};</script>`);
    await fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, 'pokes.js'), `const pokes = ${JSON.stringify(pokemonList, null, 4)};`, 'utf8');
    const maps = wild.maps.map(({ id, ...keys }) => {
        const result = {
            id,
        };
        Object.entries(keys).forEach(([key, value]) => {
            if (value !== undefined) {
                result[key] = replacementLog[value];
            }
        });
        return result;
    });
    htmlOutputTemplate = htmlOutputTemplate.replace(TEMPLATE_WILDPOKES_REPALCEMENT, `<script>const wildPokes = ${JSON.stringify(maps)};</script>`);
    await fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, 'wildpokes.js'), `const wildPokes = ${JSON.stringify(maps, null, 4)};`, 'utf8');

    // @TODO Out name depends on a param
    const outFile = path.resolve(__dirname, OUTPUT_DIR, 'out.html');
    await fs.writeFile(outFile, htmlOutputTemplate, 'utf8');
    console.log(`Output HTML file generated at ${outFile}`);
}

module.exports = writer;
