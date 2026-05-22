const fs = require('fs').promises;
const path = require('path');
const rng = require('./rng');

const wild = require('./wild.js');
const trainers = require('./trainers.js');
const {
    EVO_TYPE_LC,
    EVO_TYPE_NFE,
    EVO_TYPE_SOLO,
    EVO_TYPE_FINAL,

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
    GENERIC_DEVIATION,
    TEMPLATE_MOVES_REPLACEMENT,
    TEMPLATE_ABILITIES_REPLACEMENT,
    MEGA_TRAINERS,
} = require('./constants');
const { chooseMoveset, adjustMoveset, rateItemForAPokemon, isSuperEffective, chooseNature } = require('./rating.js');
const { BANNED_SPECIES_FOR_PICKING } = require('./modules/wildModule');
const { sample, checkValidEvo, getFamilyGroup, hasValidMega } = require('./modules/utils');
const { selectWithAutoFallback } = require('./modules/trainerFallback');
const { applyLeadLogic } = require('./modules/trainerTeamOrder');

// Must match LEVEL_CAPS in index.js — used for contextualRatings lookups
const LEVEL_CAPS = [5, 7, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 35, 38, 40, 43, 46, 50, 55, 60, 65, 70];

// Returns the highest cap that is <= level, or the lowest cap if level is below all caps.
function nearestCap(level) {
    let best = LEVEL_CAPS[0];
    for (const cap of LEVEL_CAPS) {
        if (cap <= level) best = cap;
        else break;
    }
    return best;
}
const items = require('./items.js');
const { savePokemonData } = require('./pokemonWriter.js');
const { writeEvoLevels } = require('./evoLevelWriter.js');

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

const regirockReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'DesertRuins', 'scripts.inc');
const regirockReplacementText = 'SPECIES_REGIROCK';

const regiceReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'IslandCave', 'scripts.inc');
const regiceReplacementText = 'SPECIES_REGICE';

const registeelReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'AncientTomb', 'scripts.inc');
const registeelReplacementText = 'SPECIES_REGISTEEL';

const mewReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'NewMauville_Entrance', 'scripts.inc');
const mewReplacementText = 'SPECIES_MEW';

const gymMonReplacement = 'GYM_REWARD_MON';
const gymNameReplacement = 'GYM_REWARD_NAME';
const gymItemReplacement = 'GYM_REWARD_ITEM';
const pokemonRewardFiles = [
    path.resolve(__dirname, '..', 'data', 'maps', 'RustboroCity_Gym', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'DewfordTown_Gym', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'MauvilleCity_Gym', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'LavaridgeTown_Gym_1F', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'PetalburgCity_Gym', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'FortreeCity_Gym', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'MossdeepCity_Gym', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'SootopolisCity_Gym_1F', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'SlateportCity_OceanicMuseum_2F', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'Route119_WeatherInstitute_2F', 'scripts.inc'),
    path.resolve(__dirname, '..', 'data', 'maps', 'LilycoveCity', 'scripts.inc'),
];

const skyPillarTopReplacementFile = path.resolve(__dirname, '..', 'data', 'maps', 'SkyPillar_Top', 'scripts.inc');
const scriptMenuReplacementFile = path.resolve(__dirname, '..', 'src', 'data', 'script_menu.h');
const legend1ReplacementText = 'SPECIES_LEGEND1';
const legend2ReplacementText = 'SPECIES_LEGEND2';
const legend3ReplacementText = 'SPECIES_LEGEND3';

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
    path.resolve(mapsBase, 'VictoryRoad_B1F', 'map.json'),
    path.resolve(mapsBase, 'PetalburgCity', 'map.json'),
    path.resolve(mapsBase, 'RustboroCity', 'map.json'),
    path.resolve(mapsBase, 'VerdanturfTown', 'map.json'),
    path.resolve(mapsBase, 'MauvilleCity', 'map.json'),
    path.resolve(mapsBase, 'DewfordTown', 'map.json'),
    path.resolve(mapsBase, 'SlateportCity', 'map.json'),
    path.resolve(mapsBase, 'LilycoveCity', 'map.json'),
    path.resolve(mapsBase, 'ScorchedSlab', 'map.json'),
];

function nameify(text) {
    return text
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function itemIdToName(itemId) {
    // remove "ITEM_" prefix, Swap _ for ' ' and capitalize the first letter of each word
    return nameify(itemId.replace('ITEM_', ''));
}

function isValidEvolution(level, { param, method }) {
    return (!isNaN(parseInt(param)) && parseInt(param) <= level && parseInt(param) > 4)
        || ((method === 'ITEM' || param === '0') && level > 28);
}

// DJB2 hash — used for per-slot RNG reseeding when trainers are shared across ROMs
function djb2Hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0;
    return h;
}

// baseRngSeed: when non-null, the RNG is reseeded at the start of each trainer slot
// using hash(baseRngSeed, trainer.id, slotIndex). This makes tier-based slots
// deterministic across ROMs that share a trainer artifact but differ in wild data.
async function writer(pokedexArtifact, trainersArtifact, startersArtifact, wildArtifact, isDebug, baseRngSeed = null) {
    let { pokes: pokemonList, moves, abilities } = pokedexArtifact;
    // Deep-clone trainersData — mega trainer processing splices entries in-place,
    // which would corrupt the shared artifact when the same trainers object is used across ROMs.
    const { trainersData: _rawTrainersData, itemAssignments } = trainersArtifact;
    const trainersData = JSON.parse(JSON.stringify(_rawTrainersData));
    const { starters } = startersArtifact;
    const { extraStarters, gymRewards, staticRewards, replacementLog: wildReplacementLog, foundMegaEvos: wildFoundMegaEvos } = wildArtifact;

    pokemonList = pokemonList.filter(poke => !BANNED_SPECIES_FOR_PICKING.includes(poke.id));

    console.log('Randomizing evolution levels...');
    await writeEvoLevels(pokemonList);

    console.log('Updating starter pokemon...');

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
    ${extraStarters.join(',\n    ')},
};`
    );

    // Edit starterExtraCountText with actual count of extra starters
    newStartersFile = newStartersFile.replace(
        starterExtraCountText,
        `#define STARTER_EXTRA_COUNT ${extraStarters.length}`
    );

    await fs.writeFile(startersFile, newStartersFile, 'utf8');
    console.log('Starter pokemon updated successfully.');

    console.log(starters);
    console.log(extraStarters);

    const pokeRewardReplacements = [
        gymRewards.gym1,
        gymRewards.gym2,
        gymRewards.gym3,  // index 2 — gives mega stone
        gymRewards.gym4,
        gymRewards.gym5,
        gymRewards.gym6,
        gymRewards.gym7,
        gymRewards.gym8,
        gymRewards.slateportGrunts, // index 8 — gives mega stone
        gymRewards.shellyReward,    // index 9 — gives mega stone
        gymRewards.wallyLilycove,
    ];

    const replacementLog = {};
    for (let i = 0; i < pokemonRewardFiles.length; i++) {
        const gymFile = pokemonRewardFiles[i];
        let gymFileData = await fs.readFile(gymFile, 'utf8');
        gymFileData = gymFileData.replace(new RegExp(gymMonReplacement, 'g'), pokeRewardReplacements[i].id);
        gymFileData = gymFileData.replace(new RegExp(gymNameReplacement, 'g'), pokeRewardReplacements[i].name);
        if (i === 2 || i === 8 || i === 9) { // Mauville City Gym, Slateport Grunts, and Shelly give a mega stone
            const megaEvoItems = pokeRewardReplacements[i].evolutionData.megaEvos.map(me => {
                const megaPoke = pokemonList.find(p => p.id === me);
                return megaPoke ? megaPoke.evolutionData.megaItem : null;
            }).filter(item => item !== null);
            if (megaEvoItems.length > 0) {
                const chosenItem = megaEvoItems[Math.floor(rng.random() * megaEvoItems.length)];
                gymFileData = gymFileData.replace(new RegExp(gymItemReplacement, 'g'), chosenItem);
            }
            else {
                console.log(`No mega evolution found for ${pokeRewardReplacements[i].id}, keeping original item.`);
            }
        }
        await fs.writeFile(gymFile, gymFileData, 'utf8');
        replacementLog[`SPECIES_GYM${i + 1}_REWARD`] = pokeRewardReplacements[i].id;
    }

    if (staticRewards.regirock) {
        let regirockFileData = await fs.readFile(regirockReplacementFile, 'utf8');
        regirockFileData = regirockFileData.replace(new RegExp(regirockReplacementText, 'g'), staticRewards.regirock.id);
        await fs.writeFile(regirockReplacementFile, regirockFileData, 'utf8');
        replacementLog['SPECIES_REGIROCK'] = staticRewards.regirock.id;
    }

    if (staticRewards.regice) {
        let regiceFileData = await fs.readFile(regiceReplacementFile, 'utf8');
        regiceFileData = regiceFileData.replace(new RegExp(regiceReplacementText, 'g'), staticRewards.regice.id);
        await fs.writeFile(regiceReplacementFile, regiceFileData, 'utf8');
        replacementLog['SPECIES_REGICE'] = staticRewards.regice.id;
    }

    if (staticRewards.mew) {
        let mewFileData = await fs.readFile(mewReplacementFile, 'utf8');
        mewFileData = mewFileData.replace(new RegExp(mewReplacementText, 'g'), staticRewards.mew.id);
        await fs.writeFile(mewReplacementFile, mewFileData, 'utf8');
        replacementLog['SPECIES_MEW'] = staticRewards.mew.id;
    }

    if (staticRewards.registeel) {
        let registeelFileData = await fs.readFile(registeelReplacementFile, 'utf8');
        registeelFileData = registeelFileData.replace(new RegExp(registeelReplacementText, 'g'), staticRewards.registeel.id);
        await fs.writeFile(registeelReplacementFile, registeelFileData, 'utf8');
        replacementLog['SPECIES_REGISTEEL'] = staticRewards.registeel.id;
    }

    let skyPillarTopFileData = await fs.readFile(skyPillarTopReplacementFile, 'utf8');
    let scriptMenuFileData = await fs.readFile(scriptMenuReplacementFile, 'utf8');

    if (staticRewards.legend1) {
        skyPillarTopFileData = skyPillarTopFileData.replace(new RegExp(legend1ReplacementText, 'g'), staticRewards.legend1.id);
        scriptMenuFileData = scriptMenuFileData.replace(new RegExp(legend1ReplacementText, 'g'), staticRewards.legend1.name);
        replacementLog['SPECIES_LEGEND1'] = staticRewards.legend1.id;
    }

    if (staticRewards.legend2) {
        skyPillarTopFileData = skyPillarTopFileData.replace(new RegExp(legend2ReplacementText, 'g'), staticRewards.legend2.id);
        scriptMenuFileData = scriptMenuFileData.replace(new RegExp(legend2ReplacementText, 'g'), staticRewards.legend2.name);
        replacementLog['SPECIES_LEGEND2'] = staticRewards.legend2.id;
    }

    if (staticRewards.legend3) {
        skyPillarTopFileData = skyPillarTopFileData.replace(new RegExp(legend3ReplacementText, 'g'), staticRewards.legend3.id);
        scriptMenuFileData = scriptMenuFileData.replace(new RegExp(legend3ReplacementText, 'g'), staticRewards.legend3.name);
        replacementLog['SPECIES_LEGEND3'] = staticRewards.legend3.id;
    }

    await fs.writeFile(skyPillarTopReplacementFile, skyPillarTopFileData, 'utf8');
    await fs.writeFile(scriptMenuReplacementFile, scriptMenuFileData, 'utf8');

    // Routes replacements — selection was done in wildModule; apply the two-pass substitution here

    let wildEncountersFileContent = await fs.readFile((wild.file), 'utf8');

    const auxWildReplacementsFrom = {};

    // Pass 1: replace each original species with a unique placeholder to avoid chained substitutions
    Object.entries(wildReplacementLog).forEach(([speciesId, replacementId]) => {
        const entryId = rng.random().toString(36).substring(2, 15);
        auxWildReplacementsFrom[speciesId] = `WILDPOKE_${entryId}`;
        wildEncountersFileContent = wildEncountersFileContent.replace(
            new RegExp(speciesId, 'g'),
            auxWildReplacementsFrom[speciesId]
        );
        replacementLog[speciesId] = replacementId;
    });

    // Pass 2: replace placeholders with actual species
    Object.entries(auxWildReplacementsFrom).forEach(([speciesId, placeholder]) => {
        wildEncountersFileContent = wildEncountersFileContent.replace(
            new RegExp(placeholder, 'g'),
            wildReplacementLog[speciesId]
        );
    });

    await fs.writeFile((wild.file), wildEncountersFileContent, 'utf8');
    console.log('Wild encounters updated successfully.');

    // Items

    routeFiles.forEach(async (routeFile) => {
        let routeFileContent = await fs.readFile(routeFile, 'utf8');
        
        routeFileContent = routeFileContent.replace(/ITEM_WOOD_MAIL/g, () => sample(items.midMints));
        routeFileContent = routeFileContent.replace(/ITEM_WAVE_MAIL/g, () => sample(items.strongDefMints));
        routeFileContent = routeFileContent.replace(/ITEM_MECH_MAIL/g, () => sample(items.strongAtkMints));

        await fs.writeFile(routeFile, routeFileContent, 'utf8');
    });

    // Sort mega evos
    const foundMegaEvos = [...wildFoundMegaEvos].sort((a, b) => a.level - b.level);
    
    // Assign mega evos to trainers
    const megaTrainers = MEGA_TRAINERS;
    const megaReplacementLog = {};
    const megaRemoveLog = [];
    
    const megaTrainerFilesContent = {};
    async function removeMegaTrainer(megaTrainer) {
        // data/maps/_map_/map.json
        let mapJson = megaTrainerFilesContent[megaTrainer.map];
        if (!mapJson) {
            const mapJsonPath = path.resolve(__dirname, '..', 'data', 'maps', megaTrainer.map, 'map.json');
            const mapJsonContent = await fs.readFile(mapJsonPath, 'utf8');
            mapJson = JSON.parse(mapJsonContent);
        }
        mapJson.object_events = mapJson.object_events.filter(
            event => event.script !== megaTrainer.script
            && event.trainer_sight_or_berry_tree_id !== `ITEM_MEGA_${megaTrainer.id}`
        );
        megaTrainerFilesContent[megaTrainer.map] = mapJson;
        const trainerIndex = trainersData.findIndex(trainer => trainer.id === megaTrainer.trainer);
        if (trainerIndex >= 0) {
            trainersData.splice(trainerIndex, 1);
        }
        console.log(`Removed mega trainer ${megaTrainer.id} from map ${megaTrainer.map}.`);
        megaRemoveLog.push(megaTrainer.id);
    }

    /* megaEvo structure:
        {
            family: poke.family,
            megaFormId: megaForm.id,
            baseFormId: baseForm.id,
            item: megaForm.evolutionData.megaItem,
            level: Math.max(levelFound, evolveLevel),
        }
    */
    async function updateMegaTrainer(megaTrainer, megaEvo) {
        let mapJson = megaTrainerFilesContent[megaTrainer.map];
        if (!mapJson) {
            const mapJsonPath = path.resolve(__dirname, '..', 'data', 'maps', megaTrainer.map, 'map.json');
            const mapJsonContent = await fs.readFile(mapJsonPath, 'utf8');
            mapJson = JSON.parse(mapJsonContent);
        }
        mapJson.object_events.forEach(event => {
            if (event.trainer_sight_or_berry_tree_id === `ITEM_MEGA_${megaTrainer.id}`) {
                event.trainer_sight_or_berry_tree_id = megaEvo.item;
            }
        });
        megaTrainerFilesContent[megaTrainer.map] = mapJson;
        megaReplacementLog[`ITEM_MEGA_${megaTrainer.id}`] = megaEvo.item;
        console.log(`Assigned mega evolution ${megaEvo.megaFormId} to mega trainer ${megaTrainer.id} on map ${megaTrainer.map}.`);
    }

    let nextMegaEvo = foundMegaEvos.shift();
    for (let i = 0; i < megaTrainers.length; i++) {
        const foundTrainer = trainersData.find(trainer => trainer.id === megaTrainers[i].trainer);
        if (!foundTrainer) {
            throw new Error(`Could not find trainer with id ${megaTrainers[i].trainer} to assign mega evolution.`);
        }
        const level = foundTrainer.level;

        if (!nextMegaEvo || nextMegaEvo.level > level) {
            await removeMegaTrainer(megaTrainers[i]);
            continue;
        }

        await updateMegaTrainer(megaTrainers[i], nextMegaEvo);
        
        // End condition
        if (!foundMegaEvos.length) {
            nextMegaEvo = null;
            continue;
        }
        nextMegaEvo = foundMegaEvos.shift();
    }

    const contentEntries = Object.entries(megaTrainerFilesContent);
    for (let i = 0; i < contentEntries.length; i++) {
        const [map, mapJson] = contentEntries[i];
        const mapJsonPath = path.resolve(__dirname, '..', 'data', 'maps', map, 'map.json');
        await fs.writeFile(
            mapJsonPath,
            JSON.stringify(mapJson, null, 2),
            'utf8'
        );
    }

    // Trainers

    let trainersFileContent = await fs.readFile(trainers.file, 'utf8');
    let partnersFileContent = await fs.readFile(trainers.partnersFile, 'utf8');
    const trainersResults = {};

    const storedIds = {};
    const pokeIdIVCache = {};

    function generateIVs(breedTier, pokeId) {
        if (pokeId && pokeIdIVCache[pokeId]) return pokeIdIVCache[pokeId];
        let ivs;
        if (breedTier === 'perfect') {
            ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
        } else if (breedTier === 'good') {
            const order = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].sort(() => rng.random() - 0.5);
            ivs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
            Object.keys(ivs).forEach(s => { ivs[s] = Math.floor(rng.random() * 32); });
            order.slice(0, 3).forEach(s => { ivs[s] = 31; });
        } else {
            ivs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
            Object.keys(ivs).forEach(s => { ivs[s] = Math.floor(rng.random() * 32); });
        }
        if (pokeId) pokeIdIVCache[pokeId] = ivs;
        return ivs;
    }

    trainersData.forEach(trainer => {
        for(let i = 0; i < (trainer.bag || []).length; i++) {
            const item = trainer.bag[i];
            // If item starts with TM_, replace it with MOVE_ and put it in tms
            if (item.startsWith('TM_')) {
                const moveId = item.replace('TM_', 'MOVE_');
                // Remove item from bag
                trainer.bag.splice(i, 1);
                i--;
                // Add move to tms
                if (!trainer.tms) {
                    trainer.tms = [];
                }
                trainer.tms.push(moveId);
            }
        }

        if (trainer.copy) {
            const target = trainersResults[trainer.copy];
            trainersResults[trainer.id] = {
                level: target.level,
                isBoss: target.isBoss,
                team: [...target.team],
                class: trainer.class,
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
                possibleEvolutions = chosenTrainerMon.evolutions.filter((evo) => {
                    if (chosenTrainerMon.isFinal) return false;
                    if (tryMega) {
                        // If the evo is NOT a evolution line that ends up in a mega, we don't allow it
                        const megaForms = pokemonList.filter(p => p.evolutionData.megaBaseForm && p.evolutionData.megaBaseForm === evo.pokemon);
                        if (megaForms.length) {
                            return true;
                        }
                        let i = 1;
                        do {
                            if (!chosenTrainerMon.evolutions || chosenTrainerMon.evolutions.length === 0) {
                                return false;
                            }

                            for (let i = 0; i < chosenTrainerMon.evolutions.length; i++) {
                                const evolvedForm = pokemonList.find(p => p.id === chosenTrainerMon.evolutions[i].pokemon);
                                if (!evolvedForm) {
                                    console.warn(` - Could not find evolved form ${chosenTrainerMon.evolutions[i].pokemon}, skipping...`);
                                    continue;
                                }
                                const evolvedFormMegaForms = pokemonList.filter(p => p.evolutionData.megaBaseForm && p.evolutionData.megaBaseForm === evolvedForm.id);
                                if (evolvedFormMegaForms.length > 0) {
                                    return true;
                                }
                            }
                            if (chosenTrainerMon.evolutions.length > 1) {
                                console.warn(' - Multiple evolutions found, cannot determine mega evolution path uniquely. Will try randomly.');
                            }
                            if (chosenTrainerMon.evolutions.length > 0) {
                                const randomEvo = sample(chosenTrainerMon.evolutions);
                                const randomEvolvedForm = pokemonList.find(p => p.id === randomEvo.pokemon);
                                if (randomEvolvedForm) {
                                    chosenTrainerMon = randomEvolvedForm;
                                    continue;
                                }
                                else {
                                    console.warn(` - Could not find selected evolved form ${randomEvo.pokemon}, skipping...`);
                                }
                            }
                            console.log('Returning false for mega evolution possibility.');
                            return false;
                        } while (i < 100);
                        console.warn(' - Reached max tries for mega evolution search, returning false.');
                    }
                    return isValidEvolution(trainer.level, evo);
                });
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
            else if (trainerMonDefinition.specificIfTier) {
                // Use the specific pokemon only if it meets the contextualTier filter at trainer.level.
                // If it doesn't qualify, fall back to the normal loose list (contextualTier/type filters apply below).
                const specificPokemon = pokemonList.find(p => p.id === trainerMonDefinition.specificIfTier);
                let qualifies = false;
                if (specificPokemon && trainerMonDefinition.contextualTier) {
                    const cap = nearestCap(trainer.level);
                    const contextual = specificPokemon.contextualRatings?.[cap];
                    qualifies = !!(contextual && trainerMonDefinition.contextualTier.includes(contextual.tier));
                } else if (specificPokemon) {
                    qualifies = true;
                }
                if (qualifies) {
                    pokemonStrictList = [specificPokemon];
                } else {
                    pokemonLooseList = [...pokemonList];
                    console.log(`INFO: specificIfTier fallback for ${trainerMonDefinition.specificIfTier} in trainer ${trainer.id} (level ${trainer.level}) — tier check failed, using loose list.`);
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
                const starterPokemon = pokemonList.find(p => p.id === starters[1]);
                pokemonStrictList = [starterPokemon];
            }
            else if (trainerMonDefinition.special === TRAINER_POKE_STARTER_TORCHIC) {
                const starterPokemon = pokemonList.find(p => p.id === starters[2]);
                pokemonStrictList = [starterPokemon];
            }
            else if (trainerMonDefinition.special === TRAINER_POKE_STARTER_MUDKIP) {
                const starterPokemon = pokemonList.find(p => p.id === starters[0]);
                pokemonStrictList = [starterPokemon];
            }
            else if (trainerMonDefinition.special === 'PLAYER_LEGEND_TREECKO') {
                pokemonStrictList = [staticRewards.legend1];
            }
            else if (trainerMonDefinition.special === 'PLAYER_LEGEND_TORCHIC') {
                pokemonStrictList = [staticRewards.legend2];
            }
            else if (trainerMonDefinition.special === 'PLAYER_LEGEND_MUDKIP') {
                pokemonStrictList = [staticRewards.legend3];
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
                const megaStone = megaReplacementLog[trainerMonDefinition.megaStone];
                let mega = pokemonList.filter(p => p.evolutionData.megaItem === megaStone);
                if (mega.length === 1) {
                    pokemonStrictList = mega;
                }
                else {
                    console.warn(`WARN: No unique mega evolution found for stone ${megaStone} in trainer ${trainer.id}.`);
                }
            }
            else {
                pokemonLooseList = [...pokemonList];
            }

            // General filters for the loose list
            if (trainerMonDefinition.isMega) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => loosePokemon.evolutionData.isMega,
                );
            }
            else {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => !loosePokemon.evolutionData.isMega,
                );
            }
            if (trainerMonDefinition.absoluteTier) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => trainerMonDefinition.absoluteTier.includes(loosePokemon.rating.tier),
                );
            }
            if (trainerMonDefinition.contextualTier) {
                const cap = nearestCap(trainer.level);
                const beforeCount = pokemonLooseList.length;
                const filtered = pokemonLooseList.filter(loosePokemon => {
                    const contextual = loosePokemon.contextualRatings?.[cap];
                    return contextual && trainerMonDefinition.contextualTier.includes(contextual.tier);
                });
                // Fall back to absoluteTier (or unfiltered list) if contextualTier yields nothing
                pokemonLooseList = filtered.length > 0 ? filtered : pokemonLooseList;
                if (filtered.length === 0 && beforeCount > 0) {
                    console.warn(`WARN: contextualTier filter yielded 0 results for trainer ${trainer.id} at level ${trainer.level} (cap=${cap}). Falling back to pre-contextual list.`);
                }
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
            if (trainerMonDefinition.exactTypes)
            {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => trainerMonDefinition.exactTypes.every(t => loosePokemon.parsedTypes.includes(t)),
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
                    loosePokemon => checkValidEvo(pokemonList, loosePokemon, trainer.level, trainer)
                );
            }

            if (trainerMonDefinition.mustHaveOneOfMoves) {
                pokemonLooseList = pokemonLooseList.filter(
                    loosePokemon => canLearnAnyOfMoves(loosePokemon, trainerMonDefinition.mustHaveOneOfMoves),
                );
            }

            // When this slot needs a mega, only consider Pokémon that can actually mega-evolve.
            // Prevents mons without megas (e.g. Pheromosa) from entering a tryMega pool and
            // burning the slot — the empty pool falls through to selectWithAutoFallback tier-down.
            if (trainerMonDefinition.tryMega && !foundMega) {
                pokemonLooseList = pokemonLooseList.filter(hasValidMega);
            }

            // Try evolve all of them
            if (trainerMonDefinition.tryEvolve) {
                pokemonLooseList = pokemonLooseList.map(
                    loosePokemon => tryEvolve(
                        loosePokemon,
                        // @TODO Fix wally problem. It should allow the megatier as an option
                        // (trainerMonDefinition.tryMega || trainerMonDefinition.megaTier) && !foundMega
                        trainerMonDefinition.tryMega && !foundMega
                    )
                );
                pokemonStrictList = pokemonStrictList.map(
                    strictPokemon => tryEvolve(
                        strictPokemon,
                        // (trainerMonDefinition.tryMega || trainerMonDefinition.megaTier) && !foundMega
                        trainerMonDefinition.tryMega && !foundMega
                    )
                );
            }

            // Always apply unique restriction — family-based so megas and their bases,
            // and same-line evolutions, are all excluded when any family member is on the team.
            if (pokemonLooseList.length > 0) {
                let filteredLooseList = pokemonLooseList.filter(loosePokemon => {
                    const candidateFamily = getFamilyGroup(loosePokemon.family);
                    const candidateBase   = loosePokemon.evolutionData?.megaBaseForm || loosePokemon.id;
                    return !team.find(teamPokemon => {
                        // Same family (handles evolutions and evolution-line duplicates)
                        if (getFamilyGroup(teamPokemon.pokemon.family) === candidateFamily) return true;
                        // Mega/base cross-check: if candidate is Mega Latios, candidateBase = Latios
                        if (teamPokemon.pokemon.id === candidateBase) return true;
                        return false;
                    });
                });
                
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

            // Comparator for pickBest: use contextual rating when contextualTier is active
            const getRatingForSort = (poke) => {
                if (trainerMonDefinition.contextualTier) {
                    const cap = nearestCap(trainer.level);
                    return poke.contextualRatings?.[cap]?.absoluteRating ?? poke.rating.absoluteRating;
                }
                return poke.rating.absoluteRating;
            };

            // If any strict pokemon meet the restrictions, pick from them
            if (pokemonStrictList.length > 0) {
                if (trainerMonDefinition.pickBest) {
                    const sortedStrictList = pokemonStrictList.sort((a, b) => getRatingForSort(b) - getRatingForSort(a));
                    chosenTrainerMon = sortedStrictList[0];
                }
                else {
                    chosenTrainerMon = sample(pokemonStrictList);
                }
            }
            // Else forget exact-ID uniqueness but still honour family dedup.
            // Only truly repeat a family if absolutely no other option exists.
            else if (pokemonLooseList.length > 0) {
                const familyFiltered = pokemonLooseList.filter(loosePokemon => {
                    const candidateFamily = getFamilyGroup(loosePokemon.family);
                    const candidateBase   = loosePokemon.evolutionData?.megaBaseForm || loosePokemon.id;
                    return !team.find(teamPokemon => {
                        if (getFamilyGroup(teamPokemon.pokemon.family) === candidateFamily) return true;
                        if (teamPokemon.pokemon.id === candidateBase) return true;
                        return false;
                    });
                });
                const candidatePool = familyFiltered.length > 0 ? familyFiltered : pokemonLooseList;
                if (trainerMonDefinition.pickBest) {
                    const sorted = candidatePool.sort((a, b) => getRatingForSort(b) - getRatingForSort(a));
                    chosenTrainerMon = sorted[0];
                }
                else {
                    chosenTrainerMon = sample(candidatePool);
                }
            }

            return chosenTrainerMon;
        }

        const team = [];
        trainer.team.forEach((trainerMonDefinition, slotIndex) => {
            if (baseRngSeed !== null) {
                // Reseed per slot so tier-based Pokémon choices are identical across shared-trainer ROMs
                // regardless of how many RNG calls the previous slot consumed (encounter/moveset/IV).
                const slotSeed = (baseRngSeed ^ Math.imul(djb2Hash(trainer.id + ':' + slotIndex), 0x9E3779B9)) >>> 0;
                rng.seed(slotSeed);
            }
            const chosenTrainerMon = selectWithAutoFallback(
                trainerMonDefinition,
                choosePokemonFromDefinition,
            );
            if (!chosenTrainerMon) {
                console.error(
                    `No pokemon found for trainer ${trainer.id} slot ${slotIndex} — check definition: ` +
                    JSON.stringify(trainerMonDefinition),
                );
                return;
            }

            if (trainerMonDefinition.tryMega) {
                if (
                    (chosenTrainerMon.evolutionData.isFinal || chosenTrainerMon.evolutionData.type === EVO_TYPE_SOLO)
                    && chosenTrainerMon.evolutionData.megaEvos
                    && chosenTrainerMon.evolutionData.megaEvos.length > 0
                    && !foundMega
                ) {
                    const megaPoke = pokemonList.filter(p => p.evolutionData.megaBaseForm === chosenTrainerMon.id);
                    if (megaPoke.length) {
                        chosenTrainerMon = sample(megaPoke);
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
                let baseFormMon = chosenTrainerMon;
                let megaItem;
                const megaMoves = [];
                if (chosenTrainerMon.evolutionData.megaBaseForm) {
                    baseFormMon = pokemonList.find(p => p.id === chosenTrainerMon.evolutionData.megaBaseForm) || chosenTrainerMon;
                    if (foundMega) {
                        chosenTrainerMon = baseFormMon;
                    } else {
                        if (chosenTrainerMon.id === 'SPECIES_RAYQUAZA_MEGA') {
                            // Rayquaza mega doesn't need an item
                            megaItem = null;
                            megaMoves.push('MOVE_DRAGON_ASCENT');
                        } else if (chosenTrainerMon.evolutionData.megaItem) {
                            megaItem = itemIdToName(chosenTrainerMon.evolutionData.megaItem);
                        }
                        foundMega = true;
                    }
                }
                if (trainerMonDefinition.id) {
                    storedIds[trainerMonDefinition.id] = chosenTrainerMon.id;
                }
                if (baseFormMon.id) {
                    storedIds[baseFormMon.id] = chosenTrainerMon.id;
                }
                const effectiveBreedTier = trainerMonDefinition.breedTier || trainer.breedTier || null;
                const pokeId = trainerMonDefinition.id || null;
                const newTeamMember = {
                    pokemon: baseFormMon,
                    item: megaItem || trainerMonDefinition.item || null,
                    nature: trainerMonDefinition.nature || null,
                    moves: megaMoves,
                    breedTier: effectiveBreedTier,
                    pokeId,
                    ivs: generateIVs(effectiveBreedTier, pokeId),
                };
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
                let ability = null;
                if (validAbilities.length > 0) {
                    ability = sample(validAbilities);
                    let abilityIndex = chosenTrainerMon.parsedAbilities.indexOf(ability);
                    let originalAbility = baseFormMon.parsedAbilities[abilityIndex];
                    if (originalAbility === 'NONE') {
                        abilityIndex = 0;
                        originalAbility = baseFormMon.parsedAbilities[0];
                    }
                    newTeamMember.ability = originalAbility;
                }
                /* Otherwise choose the best ability */
                else {
                    validAbilities = [...chosenTrainerMon.parsedAbilities];
                    if (trainer.level < 28) {
                        // Take just the 2 first, we don't use hidden
                        validAbilities = validAbilities.slice(0, 2);
                    }
                    validAbilities = validAbilities.filter(a => Boolean(a) && a !== 'NONE')
                        .sort(
                            (a, b) => {
                                if (trainer.level < 28) {
                                    // We just sort randomly
                                    return rng.random() - 0.5;
                                }

                                // @TODO Method rateAbilityForAPokemon
                                const abilityA = abilities[`ABILITY_${a}`];
                                const abilityB = abilities[`ABILITY_${b}`];
                                const ratingA = abilityA?.rating * (1 + (rng.random() * GENERIC_DEVIATION * 2 - GENERIC_DEVIATION));
                                const ratingB = abilityB?.rating * (1 + (rng.random() * GENERIC_DEVIATION * 2 - GENERIC_DEVIATION));
                                return ratingB - ratingA;
                            }
                        );
                    
                    if (!validAbilities) {
                        throw new Error(`WARN: No valid abilities found for pokemon ${chosenTrainerMon.id} in trainer ${trainer.id} while picking the best one.`);
                    }
                    ability = validAbilities[0];
                    let abilityIndex = chosenTrainerMon.parsedAbilities.indexOf(ability);
                    let originalAbility = baseFormMon.parsedAbilities[abilityIndex];
                    if (originalAbility === 'NONE') {
                        abilityIndex = 0;
                        originalAbility = baseFormMon.parsedAbilities[0];
                    }
                    newTeamMember.ability = originalAbility;
                }
                let { moveset, tmsUsed } = chooseMoveset(
                    chosenTrainerMon,
                    moves,
                    trainer.level,
                    newTeamMember.moves, // We use the already chosen moves (tryToHaveMove)
                    ability, // We use the real ability for megas
                    newTeamMember.item, // If we have a pre-selected item, use it
                    trainer.tms || [],
                    0.1, // Deviation for trainer bias
                );
                // Remove the first appereance of each used TM from trainer's inventory
                tmsUsed.forEach(tmUsed => {
                    if (trainer.tms && trainer.tms.includes(tmUsed)) {
                        trainer.tms.splice(trainer.tms.indexOf(tmUsed), 1);
                    }
                });
                if (!newTeamMember.item && trainer.bag && trainer.bag.length > 0) {
                    const movesetObjects = moveset.map(m => moves[m]);
                    const sortedBagItems = trainer.bag
                        .map(bagItemId => {
                            const rating = rateItemForAPokemon(
                                bagItemId,
                                chosenTrainerMon,
                                ability,
                                movesetObjects,
                                trainer.level,
                                trainer.bag.length,
                                trainer.bannedItems || [],
                                GENERIC_DEVIATION,
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
                        trainer.bag.splice(trainer.bag.indexOf(newTeamMember.item), 1);
                    }
                }
                if (!newTeamMember.nature) {
                    if (trainer.level < 28) {
                        newTeamMember.nature = sample(Object.values(NATURES)).name;
                    }
                    else {
                        newTeamMember.nature = chooseNature(
                            chosenTrainerMon,
                            moveset,
                            moves,
                            ability,
                            newTeamMember.item,
                            GENERIC_DEVIATION,
                        );
                    }
                }
                if (newTeamMember.item) {
                    moveset = adjustMoveset(
                        chosenTrainerMon,
                        trainer.level,
                        moveset,
                        newTeamMember.moves, // Fixed important moves
                        moves,
                        ability,
                        newTeamMember.item,
                        0.1,
                    );
                }
                newTeamMember.moves = moveset;
                team.push(newTeamMember);
            }
            else {
                console.warn(`No pokemon chosen for trainer ${trainer.id} with definition ${JSON.stringify(trainerMonDefinition)}`);
            }
        });

        trainersResults[trainer.id] = {
            level: trainer.level,
            class: trainer.class || 'Red Back',
            reward: (trainer.reward || []).map(r => {
                if (r.startsWith('SPECIES_')) {
                    return nameify(replacementLog[r].replace('SPECIES_', ''));
                }
                if (r.startsWith('ITEM_')) {
                    const megaStone = megaReplacementLog[r];
                    return itemIdToName(megaStone);
                }
                if (r.startsWith('TM_')) {
                    return 'TM ' + nameify(r.replace('TM_', ''));
                }
                if (r.startsWith('GYM_REWARD_')) {
                    const gymIndex = parseInt(r.replace('GYM_REWARD_', '')) - 1;
                    return pokeRewardReplacements[gymIndex].name;
                }
                return r;
            }) || [],
            isBoss: trainer.isBoss || false,
            isPartner: trainer.isPartner || false,
            location: trainer.location || null,
            team,
            preventShuffle: trainer.preventShuffle || false,
        };
    });

    Object.entries(trainersResults).forEach(([trainerId, trainerData]) => {
        let shuffledTeam = [...trainerData.team];
        if (isDebug) {
            trainerData.level = 5;
            shuffledTeam = [shuffledTeam[0]];
        }
        else if (!trainerData.preventShuffle) {
            shuffledTeam = shuffledTeam.sort(() => rng.random() - 0.5);
            shuffledTeam = applyLeadLogic(shuffledTeam, () => rng.random());
        }

        const generatedTeamTextLines = shuffledTeam.map(teamEntry => {
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
            const iv = teamEntry.ivs;
            lines.push(`IVs: ${iv.hp} HP / ${iv.atk} Atk / ${iv.def} Def / ${iv.spa} SpA / ${iv.spd} SpD / ${iv.spe} Spe`);
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

    // Write teachable_learnsets.h LAST among src/ writes so its timestamp is newer than
    // all data/**/*.inc files. The Makefile's TEACHABLE_DEPS includes those .inc files —
    // if any .inc is newer than teachable_learnsets.h, make_teachables.py regenerates it,
    // wiping the expanded teachables. Writing it last prevents that.
    console.log('Writing expanded teachable learnsets to file...');
    await savePokemonData(pokemonList);

    // Verify timestamp ordering against ALL TEACHABLE_DEPS from the Makefile:
    //   $(ALL_LEARNABLES_JSON)  tools/learnset_helpers/build/all_learnables.json
    //   $(shell find data/ -type f -name "*.inc")
    //   include/constants/tms_hms.h
    //   include/config/pokemon.h
    //   src/pokemon.c
    // If any dep is newer than teachable_learnsets.h, make_teachables.py will overwrite it.
    // NOTE: the shell scripts now also run `touch teachable_learnsets.h` after node finishes,
    // which is the definitive guard. This check is purely diagnostic.
    {
        const repoRoot = path.resolve(__dirname, '..');
        const teachablePath = path.resolve(repoRoot, 'src', 'data', 'pokemon', 'teachable_learnsets.h');
        const teachableStat = await fs.stat(teachablePath);
        const teachableTime = teachableStat.mtimeMs;

        const { execSync } = require('child_process');
        const knownDeps = [
            'tools/learnset_helpers/build/all_learnables.json',
            'include/constants/tms_hms.h',
            'include/config/pokemon.h',
            'src/pokemon.c',
        ];
        const warnings = [];

        // Check known static deps
        for (const depFile of knownDeps) {
            try {
                const st = await fs.stat(path.resolve(repoRoot, depFile));
                if (st.mtimeMs > teachableTime) {
                    warnings.push(`"${depFile}" (${new Date(st.mtimeMs).toISOString()})`);
                }
            } catch (_) { /* file may not exist yet */ }
        }

        // Check all data/**/*.inc files
        try {
            const incFiles = execSync('find data/ -type f -name "*.inc"', {
                cwd: repoRoot,
                encoding: 'utf8',
            }).trim().split('\n').filter(Boolean);
            for (const incFile of incFiles) {
                const st = await fs.stat(path.resolve(repoRoot, incFile));
                if (st.mtimeMs > teachableTime) {
                    warnings.push(`"${incFile}" (${new Date(st.mtimeMs).toISOString()})`);
                }
            }
        } catch (e) {
            console.warn('[TEACHABLE-DEBUG] Could not scan data/*.inc timestamps:', e.message);
        }

        if (warnings.length > 0) {
            console.warn(`[TEACHABLE-TIMESTAMP-WARNING] teachable_learnsets.h (${new Date(teachableTime).toISOString()}) is OLDER than these TEACHABLE_DEPS — make_teachables.py may overwrite the expanded teachables:`);
            warnings.forEach(w => console.warn(`  NEWER: ${w}`));
        } else {
            console.log(`[TEACHABLE-TIMESTAMP-OK] teachable_learnsets.h (${new Date(teachableTime).toISOString()}) is newer than all TEACHABLE_DEPS. Make will NOT regenerate it.`);
        }
    }

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
    htmlOutputTemplate = htmlOutputTemplate.replace(TEMPLATE_MOVES_REPLACEMENT, `<script>const movesData = ${JSON.stringify(moves)};</script>`);
    await fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, 'moves.js'), `const movesData = ${JSON.stringify(moves, null, 4)};`, 'utf8');
    htmlOutputTemplate = htmlOutputTemplate.replace(TEMPLATE_ABILITIES_REPLACEMENT, `<script>const abilitiesData = ${JSON.stringify(abilities)};</script>`);
    await fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, 'abilities.js'), `const abilitiesData = ${JSON.stringify(abilities, null, 4)};`, 'utf8');
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
    maps.unshift({
        id: 'STARTER_EXTRA',
        ...extraStarters.reduce((acc, id, index) => {
            acc[`special${index + 1}`] = id;
            return acc;
        }, {}),
    });
    maps.unshift({
        id: 'STARTERS',
        special1: starters[0],
        special2: starters[1],
        special3: starters[2],
    });
    // Extract static/legendary encounter entries to reposition them geographically.
    // Object.assign mutates and returns the extracted entry so we can add props inline.
    const extractMap = (id, extra = {}) => {
        const idx = maps.findIndex(m => m.id === id);
        return idx !== -1 ? Object.assign(maps.splice(idx, 1)[0], extra) : null;
    };
    const desertRuinsEntry = extractMap('MAP_DESERT_RUINS',   { label: 'Desert Ruins',  staticEncounter: true });
    const islandCaveEntry  = extractMap('MAP_ISLAND_CAVE',    { label: 'Island Cave',   staticEncounter: true });
    const newMauvilleEntry = extractMap('MAP_NEW_MAUVILLE',   { label: 'New Mauville',  staticEncounter: true });
    const ancientTombEntry = extractMap('MAP_ANCIENT_TOMB',   { label: 'Ancient Tomb',  staticEncounter: true });
    const skyPillarEntry   = extractMap('MAP_SKY_PILLAR_TOP', { label: 'Sky Pillar Top', legendaryEncounter: true });
    const route123Entry    = extractMap('MAP_ROUTE123');

    // Insertions: groups sharing the same afterMap are listed in REVERSE desired order so
    // repeated splices at idx+1 yield the correct final sequence.
    const insertions = [
        // Route 116 → Roxanne
        { afterMap: 'MAP_ROUTE116', entry: { id: 'BOSS_ROXANNE_REWARD',          label: 'Roxanne Reward',          boss: true, special1: pokeRewardReplacements[0].id } },
        // Route 106 → Brawly (before Granite Cave)
        { afterMap: 'MAP_ROUTE106', entry: { id: 'BOSS_BRAWLY_REWARD',           label: 'Brawly Reward',           boss: true, special1: pokeRewardReplacements[1].id } },
        // Route 109 → Slateport Grunts
        { afterMap: 'MAP_ROUTE109', entry: { id: 'BOSS_SLATEPORT_GRUNTS_REWARD', label: 'Slateport Grunts Reward', boss: true, special1: pokeRewardReplacements[8].id } },
        // Route 118 → Wattson
        { afterMap: 'MAP_ROUTE118', entry: { id: 'BOSS_WATTSON_REWARD',          label: 'Wattson Reward',          boss: true, special1: pokeRewardReplacements[2].id } },
        // Route 114 group (reverse order → final: Flannery, Desert Ruins, Norman, Island Cave)
        { afterMap: 'MAP_ROUTE114', entry: islandCaveEntry },
        { afterMap: 'MAP_ROUTE114', entry: { id: 'BOSS_NORMAN_REWARD',           label: 'Norman Reward',           boss: true, special1: pokeRewardReplacements[4].id } },
        { afterMap: 'MAP_ROUTE114', entry: desertRuinsEntry },
        { afterMap: 'MAP_ROUTE114', entry: { id: 'BOSS_FLANNERY_REWARD',         label: 'Flannery Reward',         boss: true, special1: pokeRewardReplacements[3].id } },
        // Island Cave → New Mauville (processed after Island Cave is placed)
        { afterMap: 'MAP_ISLAND_CAVE', entry: newMauvilleEntry },
        // Route 119 → Shelly
        { afterMap: 'MAP_ROUTE119', entry: { id: 'BOSS_SHELLY_REWARD',           label: 'Shelly Reward',           boss: true, special1: pokeRewardReplacements[9].id } },
        // Route 120 group (reverse order → final: Winona, Ancient Tomb)
        { afterMap: 'MAP_ROUTE120', entry: ancientTombEntry },
        { afterMap: 'MAP_ROUTE120', entry: { id: 'BOSS_WINONA_REWARD',           label: 'Winona Reward',           boss: true, special1: pokeRewardReplacements[5].id } },
        // Route 121 → Wally Lilycove
        { afterMap: 'MAP_ROUTE121', entry: { id: 'BOSS_WALLY_LILYCOVE',          label: 'Wally Lilycove Reward',   boss: true, special1: pokeRewardReplacements[10].id } },
        // Route 124 → Tate & Liza (before Route 125)
        { afterMap: 'MAP_ROUTE124', entry: { id: 'BOSS_TATE_LIZA_REWARD',        label: 'Tate & Liza Reward',      boss: true, special1: pokeRewardReplacements[6].id } },
        // Route 129 group (reverse order → final: Sky Pillar, Juan, Route 123)
        { afterMap: 'MAP_ROUTE129', entry: route123Entry },
        { afterMap: 'MAP_ROUTE129', entry: { id: 'BOSS_JUAN_REWARD',             label: 'Juan Reward',             boss: true, special1: pokeRewardReplacements[7].id } },
        { afterMap: 'MAP_ROUTE129', entry: skyPillarEntry },
    ];
    for (const { afterMap, entry } of insertions) {
        const idx = maps.findIndex(m => m.id === afterMap);
        if (idx !== -1) {
            maps.splice(idx + 1, 0, entry);
        } else {
            maps.push(entry);
        }
    }
    htmlOutputTemplate = htmlOutputTemplate.replace(TEMPLATE_WILDPOKES_REPALCEMENT, `<script>const wildPokes = ${JSON.stringify(maps)};</script>`);
    await fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, 'wildpokes.js'), `const wildPokes = ${JSON.stringify(maps, null, 4)};`, 'utf8');

    // @TODO Out name depends on a param
    const outFile = path.resolve(__dirname, OUTPUT_DIR, 'out.html');
    await fs.writeFile(outFile, htmlOutputTemplate, 'utf8');

    // Print all megas found in foundMegaEvos set
    for (const megaEvoId of foundMegaEvos) {
        console.log(`Found Mega Evolution used in trainers: ${megaEvoId}`);
    }

    console.log(`Output HTML file generated at ${outFile}`);
}

module.exports = writer;
