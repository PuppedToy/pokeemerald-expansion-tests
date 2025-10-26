const fs = require('fs').promises;
const path = require('path');

const wild = require('./wild.js');
const trainers = require('./trainers.js');
const {
    EVO_TYPE_LC,
    EVO_TYPE_NFE,
    EVO_TYPE_SOLO,
    EVO_TYPE_LC_OF_3,
    EVO_TYPE_FINAL,

    TIER_AVERAGE,
    TIER_STRONG,
    TIER_PREMIUM,
    TIER_LEGEND,

    TIER_LEGEND_THRESHOLD,
    TIER_STRONG_THRESHOLD,
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
    NATURES,
    TRAINER_POKE_MEGA_FROM_STONE,
    EVO_TYPE_MEGA,
    TRAINER_POKE_MEGA_WITH_STONE,
} = require('./constants');
const { chooseMoveset, rateItemForAPokemon, isSuperEffective } = require('./rating.js');
const items = require('./items.js');
const { savePokemonData } = require('./pokemonWriter.js');

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

const skyPillarTopReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'SkyPillar_Top', 'scripts.inc');
const scriptMenuReplacementFile = path.resolve(__dirname, '..', 'src', 'data', 'script_menu.h');
const legend1ReplacementText = 'SPECIES_LEGEND1';
const legend2ReplacementText = 'SPECIES_LEGEND2';
const legend3ReplacementText = 'SPECIES_LEGEND3';

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

const mapsBase = path.resolve(__dirname, '..', 'data', 'maps');
const routeFiles = [
    path.resolve(mapsBase, 'Route103', 'map.json'),
    path.resolve(mapsBase, 'Route109', 'map.json'),
    path.resolve(mapsBase, 'Route110', 'map.json'),
    path.resolve(mapsBase, 'Route111', 'map.json'),
    path.resolve(mapsBase, 'Route112', 'map.json'),
    path.resolve(mapsBase, 'Route113', 'map.json'),
    path.resolve(mapsBase, 'Route114', 'map.json'),
    path.resolve(mapsBase, 'Route115', 'map.json'),
    path.resolve(mapsBase, 'Route116', 'map.json'),
    path.resolve(mapsBase, 'Route117', 'map.json'),
    path.resolve(mapsBase, 'Route118', 'map.json'),
    path.resolve(mapsBase, 'Route119', 'map.json'),
    path.resolve(mapsBase, 'Route120', 'map.json'),
    path.resolve(mapsBase, 'Route121', 'map.json'),
    path.resolve(mapsBase, 'Route125', 'map.json'),
    path.resolve(mapsBase, 'Route126', 'map.json'),
    path.resolve(mapsBase, 'Route127', 'map.json'),
    path.resolve(mapsBase, 'PetalburgCity', 'map.json'),
    path.resolve(mapsBase, 'RustboroCity', 'map.json'),
    path.resolve(mapsBase, 'VerdanturfTown', 'map.json'),
    path.resolve(mapsBase, 'MauvilleCity', 'map.json'),
    path.resolve(mapsBase, 'DewfordTown', 'map.json'),
    path.resolve(mapsBase, 'SlateportCity', 'map.json'),
    path.resolve(mapsBase, 'LilycoveCity', 'map.json'),
    path.resolve(mapsBase, 'ScorchedSlab', 'map.json'),
];

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

function itemIdToName(itemId) {
    // remove "ITEM_" prefix, Swap _ for ' ' and capitalize the first letter of each word
    return itemId
        .replace('ITEM_', '')
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function isValidEvolution(level, { param, method }) {
    return (!isNaN(parseInt(param)) && parseInt(param) <= level && parseInt(param) > 4)
        || ((method === 'ITEM' || param === '0') && level > 25);
}

async function writer(pokemonList, moves, abilities) {

    console.log('Writing pokemon buff / nerfs to files...');
    // Save pokemon buffed / nerfed versions
    await savePokemonData(pokemonList);

    console.log('Updating starter pokemon...');

    let eligiblePokemonForStarters = pokemonList.filter(poke => {
        return poke.evolutionData.type === EVO_TYPE_LC_OF_3
            && poke.evolutionData.isLC
            && poke.rating.bestEvoTier === TIER_STRONG
    });

    const starters = [null, null, null];

    while (eligiblePokemonForStarters.length > 0 && (starters[0] === null || starters[1] === null || starters[2] === null)) {
        // First pick the first pokemon randomly
        starters[0] = sampleAndRemove(eligiblePokemonForStarters);

        // Try to find a pokemon weak to any of starters[0]'s types
        const starters0Types = starters[0].parsedTypes;
        const weakToStarters0Types = eligiblePokemonForStarters.filter(poke => {
            if (poke.id === starters[0].id) return false;
            return starters0Types.some(type => isSuperEffective(type, poke.parsedTypes));
        });
        // If none found, restart
        if (weakToStarters0Types.length === 0) {
            starters[0] = null;
            continue;
        }
        starters[1] = sample(weakToStarters0Types);

        // Try to find a pokemon weak to starters1's types and that also fulfills that starters0 is weak to its types
        const starters1Types = starters[1].parsedTypes;
        const weakToStarters1TypesAndStrongToStarters0 = eligiblePokemonForStarters.filter(poke => {
            if (poke.id === starters[1].id) return false;
            return starters1Types.some(type => isSuperEffective(type, poke.parsedTypes))
                && poke.parsedTypes.some(type => isSuperEffective(type, starters[0].parsedTypes))
                && poke.id !== starters[0].id
                && poke.id !== starters[1].id;
        });

        if (weakToStarters1TypesAndStrongToStarters0.length === 0) {
            starters[0] = null;
            starters[1] = null;
            continue;
        }
        starters[2] = sample(weakToStarters1TypesAndStrongToStarters0);
    }

    if (starters[0] === null || starters[1] === null || starters[2] === null) {
        console.error('Failed to find valid starter Pokemon. Going through fallback method.');
        eligiblePokemonForStarters = pokemonList.filter(poke => {
            return poke.evolutionData.type === EVO_TYPE_LC_OF_3
                && poke.evolutionData.isLC
                && poke.rating.bestEvoTier === TIER_STRONG
            });
        starters[0] = sampleAndRemove(eligiblePokemonForStarters);
        starters[1] = sampleAndRemove(eligiblePokemonForStarters);
        starters[2] = sampleAndRemove(eligiblePokemonForStarters);
        return;
    }

    const alreadyChosenSet = new Set();

    starters.forEach((starter, index) => {
        starters[index] = starter.id;
        alreadyChosenSet.add(starter.id);
    });

    let premiumLCPokes = pokemonList.filter(poke => {
        return poke.evolutionData.type === EVO_TYPE_LC_OF_3
            && poke.evolutionData.isLC
            && poke.rating.bestEvoTier === TIER_PREMIUM
            && !alreadyChosenSet.has(poke.id);
    });
    if (premiumLCPokes.length <= 0) {
        console.warn('No premium 3-evo-LC pokemon found for extra starters, using premium LC instead.');
        premiumLCPokes = pokemonList.filter(poke => {
            return poke.evolutionData.isLC
                && (poke.rating.bestEvoTier === TIER_PREMIUM)
                && !alreadyChosenSet.has(poke.id);
        });
        if (premiumLCPokes.length <= 0) {
            console.error('No premium LC pokemon found for extra starters, using strong LC instead.');
            premiumLCPokes = pokemonList.filter(poke => {
                return poke.evolutionData.type === EVO_TYPE_LC_OF_3
                    && poke.evolutionData.isLC
                    && (poke.rating.bestEvoTier === TIER_STRONG)
                    && !alreadyChosenSet.has(poke.id);
            });
        }
        if (premiumLCPokes.length <= 0) {
            throw new Error('No strong 3-evo-LC pokemon found for extra starters, using strong LC instead.');
        }
    }

    const chosenExtraPokemon = [
        sample(premiumLCPokes).id,
    ];
    alreadyChosenSet.add(chosenExtraPokemon[0]);

    const lcPokesWithMegaEvo = pokemonList.filter(poke => {
        return poke.evolutionData.isLC
            && poke.evolutionData.megaEvos
            && poke.evolutionData.megaEvos.length > 0
            && !alreadyChosenSet.has(poke.id)
            && poke.rating.bestEvoRating <= TIER_STRONG_THRESHOLD;
    });

    if (lcPokesWithMegaEvo.length <= 0) {
        console.warn('No LC pokemon with mega evolutions found for extra starters.');
    }

    while (chosenExtraPokemon.length < 3 && lcPokesWithMegaEvo.length > 0) {
        const chosenPoke = sampleAndRemove(lcPokesWithMegaEvo);
        chosenExtraPokemon.push(chosenPoke.id);
        alreadyChosenSet.add(chosenPoke.id);
    }
    
    // Pick 6 other unique pokemon from notTooStrongPokemonLC that are not in eligiblePokemonForStarters
    const averagePokemonLC = pokemonList.filter(poke => {
        return poke.evolutionData.isLC
            && poke.rating.bestEvoTier === TIER_AVERAGE
            && !alreadyChosenSet.has(poke.id);
    });
    while (chosenExtraPokemon.length < 9 && averagePokemonLC.length > 0) {
        const randomPoke = sampleAndRemove(averagePokemonLC);
        chosenExtraPokemon.push(randomPoke.id);
        alreadyChosenSet.add(randomPoke.id);
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

    const megaReplacements = {};

    for (let i = 0; i < Math.min(chosenPokemonThatHaveMegaEvo.length, MAX_MEGA_EVO_STONES); i++) {
        const poke = chosenPokemonThatHaveMegaEvo[i];
        const megaEvos = poke.evolutionData.megaEvos;
        const chosenMegaEvo = megaEvos[Math.floor(Math.random() * megaEvos.length)];
        const megaItem = pokemonList.find(p => p.id === chosenMegaEvo).evolutionData.megaItem;
        route111Data = route111Data.replace(itemDataList[i], megaItem);
        megaReplacements[itemDataList[i]] = megaItem;
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

    const strongSoloReplacementList = pokemonList.filter(poke =>
        !alreadyChosenSet.has(poke.id)
        && poke.rating.bestEvoTier === TIER_STRONG
        && poke.evolutionData.type === EVO_TYPE_SOLO
    );
    const regirockReplacement = sampleAndRemove(strongSoloReplacementList);
    alreadyChosenSet.add(regirockReplacement.id);
    const regiceReplacement = sampleAndRemove(strongSoloReplacementList);
    alreadyChosenSet.add(regiceReplacement.id);
    const mewReplacement = sampleAndRemove(strongSoloReplacementList);
    alreadyChosenSet.add(mewReplacement.id);
    const latiosReplacement = sampleAndRemove(strongSoloReplacementList);
    alreadyChosenSet.add(latiosReplacement.id);

    const premiumSoloReplacementList = pokemonList.filter(poke =>
        !alreadyChosenSet.has(poke.id)
        && poke.rating.bestEvoTier === TIER_PREMIUM
        && poke.evolutionData.type === EVO_TYPE_SOLO
    );
    const registeelReplacement = sampleAndRemove(premiumSoloReplacementList);
    alreadyChosenSet.add(registeelReplacement.id);

    // @TODO Choose between rayquaza, kyogre and groudon
    const legendReplacementList = pokemonList.filter(poke =>
        !alreadyChosenSet.has(poke.id)
        && (
            poke.rating.bestEvoTier === TIER_LEGEND
            || (poke.rating.bestEvoTier === TIER_PREMIUM && poke.rating.absoluteRating >= MID_TIER_PREMIUM_THRESHOLD)
        )
        && poke.evolutionData.type === EVO_TYPE_SOLO
    );
    const legend1Replacement = sampleAndRemove(legendReplacementList);
    alreadyChosenSet.add(legend1Replacement.id);
    const legend2Replacement = sampleAndRemove(legendReplacementList);
    alreadyChosenSet.add(legend2Replacement.id);
    const legend3Replacement = sampleAndRemove(legendReplacementList);
    alreadyChosenSet.add(legend3Replacement.id);

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

    let skyPillarTopFileData = await fs.readFile(skyPillarTopReplacementFile, 'utf8');
    let scriptMenuFileData = await fs.readFile(scriptMenuReplacementFile, 'utf8');

    if (legend1Replacement) {
        skyPillarTopFileData = skyPillarTopFileData.replace(new RegExp(legend1ReplacementText, 'g'), legend1Replacement.id);
        scriptMenuFileData = scriptMenuFileData.replace(new RegExp(legend1ReplacementText, 'g'), legend1Replacement.name);
        replacementLog['SPECIES_LEGEND1'] = legend1Replacement.id;
    }

    if (legend2Replacement) {
        skyPillarTopFileData = skyPillarTopFileData.replace(new RegExp(legend2ReplacementText, 'g'), legend2Replacement.id);
        scriptMenuFileData = scriptMenuFileData.replace(new RegExp(legend2ReplacementText, 'g'), legend2Replacement.name);        
        replacementLog['SPECIES_LEGEND2'] = legend2Replacement.id;
    }

    if (legend3Replacement) {
        skyPillarTopFileData = skyPillarTopFileData.replace(new RegExp(legend3ReplacementText, 'g'), legend3Replacement.id);
        scriptMenuFileData = scriptMenuFileData.replace(new RegExp(legend3ReplacementText, 'g'), legend3Replacement.name);
        replacementLog['SPECIES_LEGEND3'] = legend3Replacement.id;
    }

    await fs.writeFile(skyPillarTopReplacementFile, skyPillarTopFileData, 'utf8');
    await fs.writeFile(scriptMenuReplacementFile, scriptMenuFileData, 'utf8');

    // Routes replacements

    let wildEncountersFileContent = await fs.readFile((wild.file), 'utf8');

    const { replacementTypes: wildReplacementTypes } = wild;
    const replacementLists = {};

    Object.entries(wildReplacementTypes).forEach(([key, value]) => {
        const { replace: tiers, type: types, hasMega } = value;
        replacementLists[key] = pokemonList.filter(poke => {
            if (alreadyChosenSet.has(poke.id)) return false;
            if (!tiers.includes(poke.rating.bestEvoTier)) return false;
            if (hasMega && !poke.evolutionData.megaEvos) return false;
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
                else if (replacementType === EVO_TYPE_FINAL) {
                    hasAnyTypeOfReplacement = hasAnyTypeOfReplacement || poke.evolutionData.isFinal;
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

    // Items

    routeFiles.forEach(async (routeFile) => {
        let routeFileContent = await fs.readFile(routeFile, 'utf8');
        
        routeFileContent = routeFileContent.replace(/ITEM_WOOD_MAIL/g, () => sample(items.midMints));
        routeFileContent = routeFileContent.replace(/ITEM_WAVE_MAIL/g, () => sample(items.strongDefMints));
        routeFileContent = routeFileContent.replace(/ITEM_MECH_MAIL/g, () => sample(items.strongAtkMints));

        Object.entries(items.megaStones).forEach(([itemIdToReplace, speciesId]) => {
            if (routeFileContent.includes(itemIdToReplace) === false) {
                return;
            }
            const replacementPoke = replacementLog[speciesId] || speciesId;
            const poke = pokemonList.find(p => p.id === replacementPoke);
            console.log(`Replacing ${itemIdToReplace} with a mega stone for ${replacementPoke} (${speciesId}) in ${routeFile}.`);
            if (poke && poke.evolutionData.megaEvos && poke.evolutionData.megaEvos.length > 0) {
                const megaId = sample(poke.evolutionData.megaEvos);
                const megaItem = pokemonList.find(p => p.id === megaId).evolutionData.megaItem;
                console.log(` - Chose mega evolution ${megaId} with item ${megaItem}.`);
                megaReplacements[itemIdToReplace] = megaItem;
                routeFileContent = routeFileContent.replace(itemIdToReplace, megaItem);
            }
            else {
                console.warn(`WARN: No mega evolution found for ${replacementPoke} (${speciesId}) to replace ${itemIdToReplace} in ${routeFile}.`);
            }
        });

        await fs.writeFile(routeFile, routeFileContent, 'utf8');
    });

    // Trainers

    let trainersFileContent = await fs.readFile(trainers.file, 'utf8');
    let partnersFileContent = await fs.readFile(trainers.partnersFile, 'utf8');
    const { trainersData } = trainers;
    const trainersResults = {};

    const storedIds = {};

    trainersData.forEach(trainer => {
        if (trainer.copy) {
            const target = trainersResults[trainer.copy];
            trainersResults[trainer.id] = {
                level: target.level,
                isBoss: target.isBoss,
                team: [...target.team],
            };
            return;
        }

        let foundMega = false;

        const canLearnMove = (pokemon, moveToLearn) => {
            const result = (
                pokemon.teachables
                && pokemon.teachables.includes(moveToLearn)
            )
            ||
            (
                pokemon.learnset
                && pokemon.learnset.some(lu => lu.move === moveToLearn && lu.level <= trainer.level)
            );
            return result;
        };

        const canLearnAnyOfMoves = (pokemon, movesToLearn) => {
            const result = movesToLearn.some(moveToLearn => canLearnMove(pokemon, moveToLearn));
            return result;
        }

        const tryEvolve = (pokemon, tryMega) => {
            let chosenTrainerMon = { ...pokemon };
            let possibleEvolutions;

            do {
                if (!chosenTrainerMon.evolutions || chosenTrainerMon.evolutions.length === 0) {
                    break;
                }

                // Try to evolve to the first possible evolution
                possibleEvolutions = chosenTrainerMon.evolutions.filter((evo) => 
                    isValidEvolution(trainer.level, evo)
                    && (
                        !tryMega
                        || !chosenTrainerMon.evolutionData.isFinal
                        || pokemonList.some(p => p.evolutionData.megaBaseForm && p.evolutionData.megaBaseForm === evo.pokemon)
                    )
                );
                if (possibleEvolutions.length > 0) {
                    // sort by param
                    possibleEvolutions.sort((a, b) => parseInt(b.param) - parseInt(a.param));
                    let evolvedForm;
                    for (let i = 0; i < possibleEvolutions.length && !evolvedForm; i++) {
                        const evolutionToApply = possibleEvolutions[i].pokemon;
                        evolvedForm = pokemonList.find(p => p.id === evolutionToApply);
                        if (evolvedForm) {
                            chosenTrainerMon = evolvedForm;
                        }
                    }
                    if (!evolvedForm) {
                        break;
                    }
                }
            } while (possibleEvolutions.length > 0);

            return chosenTrainerMon;
        }

        const choosePokemonFromDefinition = (trainerMonDefinition) => {
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
            else if (trainerMonDefinition.special === TRAINER_POKE_MEGA_FROM_STONE) {
                const megaStone = megaReplacements[trainerMonDefinition.megaStone] || trainerMonDefinition.megaStone;
                let mega = pokemonList.filter(p => p.evolutionData.megaItem === megaStone);
                if (mega.length === 1) {
                    mega = mega[0];
                    const pokemonThatEvolvesToMega = pokemonList.find(p => 
                        p.evolutionData.isFinal
                        && p.evolutionData.megaEvos
                        && p.evolutionData.megaEvos.includes(mega.id)
                    );
                    if (pokemonThatEvolvesToMega) {
                        pokemonStrictList = [pokemonThatEvolvesToMega];
                        trainerMonDefinition.item = itemIdToName(mega.evolutionData.megaItem);
                        foundMega = true;
                    }
                    else {
                        console.warn(`WARN: No pokemon found that evolves to mega ${mega.id} for trainer ${trainer.id}.`);
                    }
                }
                else {
                    console.warn(`WARN: No unique mega evolution found for stone ${megaStone} in trainer ${trainer.id}.`);
                }
            }
            else {
                pokemonLooseList = [...pokemonList];
            }

            // General filters for the loose list
            if (trainerMonDefinition.special === TRAINER_POKE_MEGA_WITH_STONE) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => loosePokemon.evolutionData.isFinal
                        && !loosePokemon.evolutionData.isMega
                        && loosePokemon.evolutionData.megaEvos
                        && loosePokemon.evolutionData.megaEvos.length > 0
                );
                if (trainerMonDefinition.megaAbilities) {
                    pokemonLooseList = pokemonLooseList.filter(
                        loosePokemon => {
                            const megaId = loosePokemon.evolutionData.megaEvos[0];
                            const megaPoke = pokemonList.find(p => p.id === megaId);
                            return megaPoke && megaPoke.parsedAbilities.some(a => trainerMonDefinition.megaAbilities.includes(a));
                        }
                    );
                }
            }
            if (trainerMonDefinition.absoluteTier) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => trainerMonDefinition.absoluteTier.includes(loosePokemon.rating.tier),
                );
            }
            if (trainerMonDefinition.evoType) {
                pokemonLooseList = pokemonLooseList.filter(loosePokemon => {
                    let result = false;
                    trainerMonDefinition.evoType.forEach(evoType => {
                        if (evoType === EVO_TYPE_LC) {
                            result = result || loosePokemon.evolutionData.isLC;
                        }
                        else if (evoType === EVO_TYPE_NFE) {
                            result = result || loosePokemon.evolutionData.isNFE;
                        }
                        else if (evoType === EVO_TYPE_SOLO) {
                            result = result || loosePokemon.evolutionData.type === EVO_TYPE_SOLO;
                        }
                        else if (evoType === EVO_TYPE_FINAL) {
                            result = result || loosePokemon.evolutionData.isFinal;
                        }
                    });
                    return result;
                });
            }
            if (trainerMonDefinition.megaTier) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => loosePokemon.evolutionData.megaEvos
                        && loosePokemon.evolutionData.megaEvos.length > 0
                        && trainerMonDefinition.megaTier.includes(loosePokemon.rating.megaEvoTier),
                );
            }
            if (trainerMonDefinition.evolutionTier) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => trainerMonDefinition.evolutionTier.includes(loosePokemon.rating.bestEvoTier),
                );
            }
            if (trainerMonDefinition.type) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => loosePokemon.parsedTypes.some(t => trainerMonDefinition.type.includes(t)),
                );
            }
            else if (trainerMonDefinition.weakToTypes) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => trainerMonDefinition.weakToTypes.some(
                        t => isSuperEffective(t, loosePokemon.parsedTypes),
                    ),
                );
            }
            if (trainerMonDefinition.abilities) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => loosePokemon.parsedAbilities.some(a => trainerMonDefinition.abilities.includes(a)),
                );
            }
            if (trainerMonDefinition.hasStat) {
                const [statName, comparator, value] = trainerMonDefinition.hasStat;
                let checkIfMonFulfillsCondition = () => true;
                if (comparator === '<') {
                    checkIfMonFulfillsCondition = (loosePokemon) => loosePokemon[statName] < value;
                }
                else if (comparator === '>') {
                    checkIfMonFulfillsCondition = (loosePokemon) => loosePokemon[statName] > value;
                }
                else {
                    console.warn(`WARN: Unknown comparator "${comparator}" in hasStat for trainer ${trainer.id}.`);
                }
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => checkIfMonFulfillsCondition(loosePokemon),
                );
            }
            if (trainerMonDefinition.checkValidEvo) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => {
                        if (loosePokemon.evolutionData.type === EVO_TYPE_SOLO || loosePokemon.evolutionData.isLC) {
                            return true;
                        }
                        if (loosePokemon.evolutionData.isMega) {
                            return false;
                        }
                        const pokemonThatEvolveToThis = pokemonList.filter(p => {
                            const evolutions = (p.evolutions || [])
                                .filter(e => e.pokemon === loosePokemon.id);
                            if (!evolutions.length) return false;
                            return evolutions.some(evo => isValidEvolution(trainer.level, evo));
                        });
                        return pokemonThatEvolveToThis.length > 0;
                    }
                );
            }

            if (trainerMonDefinition.mustHaveOneOfMoves) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => canLearnAnyOfMoves(loosePokemon, trainerMonDefinition.mustHaveOneOfMoves),
                );
            }

            // Try evolve all of them
            if (trainerMonDefinition.tryEvolve) {
                pokemonLooseList = pokemonLooseList.map(loosePokemon => tryEvolve(loosePokemon, trainerMonDefinition.tryMega && !foundMega));
                pokemonStrictList = pokemonStrictList.map(strictPokemon => tryEvolve(strictPokemon, trainerMonDefinition.tryMega && !foundMega));
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
                if (trainerMonDefinition.pickBest) {
                    const sortedStrictList = pokemonStrictList.sort((a, b) => b.rating.absoluteRating - a.rating.absoluteRating);
                    chosenTrainerMon = sortedStrictList[0];
                }
                else {
                    chosenTrainerMon = sample(pokemonStrictList);
                }
            }
            // Else forget about unique restriction
            else if (pokemonLooseList.length > 0) {
                if (trainerMonDefinition.pickBest) {
                    const sortedLooseList = pokemonLooseList.sort((a, b) => b.rating.absoluteRating - a.rating.absoluteRating);
                    chosenTrainerMon = sortedLooseList[0];
                }
                else {
                    chosenTrainerMon = sample(pokemonLooseList);
                }
            }

            return chosenTrainerMon;
        }

        const team = [];
        trainer.team.forEach(trainerMonDefinition => {
            let chosenTrainerMon = choosePokemonFromDefinition(trainerMonDefinition);

            if (!chosenTrainerMon && trainerMonDefinition.fallback && trainerMonDefinition.fallback.length) {
                console.log(`No pokemon meet the restrictions for trainer ${trainer.id} with definition ${JSON.stringify(trainerMonDefinition)}. Trying fallback definitions.`);
                let fallbackCount = 1;
                do {
                    console.log(`Trying fallback definition #${fallbackCount++} for trainer ${trainer.id}`);
                    const fallbackDefinition = trainerMonDefinition.fallback.shift();
                    chosenTrainerMon = choosePokemonFromDefinition(fallbackDefinition);
                } while (!chosenTrainerMon && trainerMonDefinition.fallback && trainerMonDefinition.fallback.length);
            }
            if (!chosenTrainerMon) {
                console.warn(`WARN: No pokemon available for trainer ${trainer.id} with definition ${JSON.stringify(trainerMonDefinition)}. Picking a random one.`);
                // Pick a random pokemon
                const randomPokemon = sample(pokemonList);
                chosenTrainerMon = randomPokemon;
            }

            if (trainerMonDefinition.tryMega) {
                if (
                    (chosenTrainerMon.evolutionData.isFinal || chosenTrainerMon.evolutionData.type === EVO_TYPE_SOLO)
                    && chosenTrainerMon.evolutionData.megaEvos
                    && chosenTrainerMon.evolutionData.megaEvos.length > 0
                    && !foundMega
                ) {
                    const megaId = sample(chosenTrainerMon.evolutionData.megaEvos);
                    const megaPoke = pokemonList.find(p => p.id === megaId);
                    if (megaPoke) {
                        trainerMonDefinition.item = itemIdToName(megaPoke.evolutionData.megaItem);
                        foundMega = true;
                    }
                    else {
                        console.warn(`WARN: Chosen pokemon ${chosenTrainerMon.id} for mega in trainer ${trainer.id} has no mega evolution data.`);
                    }
                }
                else {
                    console.warn(`WARN: Chosen pokemon ${chosenTrainerMon.id} for mega in trainer ${trainer.id} has no mega evolutions.`);
                }
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
                if (trainerMonDefinition.special === TRAINER_POKE_MEGA_WITH_STONE) {
                    const megaEvos = chosenTrainerMon.evolutionData.megaEvos;
                    if (megaEvos && megaEvos.length > 0) {
                        const megaId = sample(megaEvos);
                        const megaPoke = pokemonList.find(p => p.id === megaId);
                        if (megaPoke) {
                            newTeamMember.item = itemIdToName(megaPoke.evolutionData.megaItem);
                            foundMega = true;
                        }
                        else {
                            console.warn(`WARN: Chosen pokemon ${chosenTrainerMon.id} for mega with stone in trainer ${trainer.id} has no mega evolution data.`);
                        }
                    }
                    else {
                        console.warn(`WARN: Chosen pokemon ${chosenTrainerMon.id} for mega with stone in trainer ${trainer.id} has no mega evolutions.`);
                    }
                }
                if (trainerMonDefinition.tryToHaveMove) {
                    trainerMonDefinition.tryToHaveMove.forEach(moveToLearn => {
                        if (
                            canLearnMove(chosenTrainerMon, moveToLearn)
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
                    trainer.tms || [],
                    0.1, // Deviation for trainer bias
                );
                // Remove the first appereance of each used TM from trainer's inventory
                tmsUsed.forEach(tmUsed => {
                    if (trainer.tms && trainer.tms.includes(tmUsed)) {
                        trainer.tms.splice(trainer.tms.indexOf(tmUsed), 1);
                    }
                });
                newTeamMember.moves = moveset;
                if (!newTeamMember.nature) {
                    if (trainer.level < 25) {
                        newTeamMember.nature = sample(Object.values(NATURES));
                    }
                    else {
                        // @TODO Rate natures
                        newTeamMember.nature = sample(Object.values(NATURES));
                    }
                }
                if (!newTeamMember.ability && chosenTrainerMon.parsedAbilities.length > 0) {
                    let abilities;
                    if (trainer.level < 25) {
                        abilities = chosenTrainerMon.parsedAbilities
                            .slice(0, 2)
                            .filter(ability => Boolean(ability) && ability !== 'NONE');
                    }
                    else {
                        abilities = chosenTrainerMon.parsedAbilities
                            .filter(ability => Boolean(ability) && ability !== 'NONE');
                    }
                    newTeamMember.ability = sample(abilities);
                }
                if (!newTeamMember.item && trainer.bag && trainer.bag.length > 0) {
                    const movesetObjects = newTeamMember.moves.map(m => moves[m]);
                    const sortedBagItems = trainer.bag
                        .map(bagItemId => {
                            const rating = rateItemForAPokemon(
                                bagItemId,
                                chosenTrainerMon,
                                newTeamMember.ability,
                                movesetObjects,
                                trainer.level,
                                trainer.bag.length,
                                trainer.bannedItems || [],
                                0.1
                            );
                            // console.log(`Rating item ${bagItemId} for pokemon LV.${trainer.level} ${chosenTrainerMon.id} resulted in rating ${rating}`);
                            return {
                                id: bagItemId,
                                rating,
                            };
                        })
                        .filter(bi => bi.rating > 0)
                        .sort((a, b) => b.rating - a.rating)
                        .map(bi => bi.id);

                    if (sortedBagItems.length > 0) {
                        newTeamMember.item = sortedBagItems[0];
                    }
                    trainer.bag.splice(trainer.bag.indexOf(newTeamMember.item), 1);
                }
                team.push(newTeamMember);
            }
            else {
                console.warn(`No pokemon chosen for trainer ${trainer.id} with definition ${JSON.stringify(trainerMonDefinition)}`);
            }
        });

        trainersResults[trainer.id] = {
            level: trainer.level,
            isBoss: trainer.isBoss || false,
            isPartner: trainer.isPartner || false,
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
        if (trainerData.isPartner) {
            partnersFileContent = partnersFileContent.replace(replaceRegex, fullReplacementText);
        }
        else {
            trainersFileContent = trainersFileContent.replace(replaceRegex, fullReplacementText);
        }
    });

    await fs.writeFile((trainers.file), trainersFileContent, 'utf8');
    await fs.writeFile((trainers.partnersFile), partnersFileContent, 'utf8');
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
