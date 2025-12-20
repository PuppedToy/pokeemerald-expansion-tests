const path = require("path");
const fs = require("fs").promises;

const { TOTAL_GENS, SPECIES_DIR, LEVEL_UP_LEARNSETS_DIR } = require("./constants");

function editFiles(genSpeciesFileText, genLearnsetFileText, pokemonList) {
    const speciesLines = genSpeciesFileText.split('\n');
    let learnsetResult = String(genSpeciesFileText);
    let currentPokemonId;
    let currentPokemon;
    let currentLog = [];
    const learnsets = {};
    for (let i = 0; i < speciesLines.length; i++) {
        if (speciesLines[i].startsWith('    [')) {
            currentPokemonId = speciesLines[i].split('[')[1].split(']')[0];
            currentPokemon = pokemonList.find(p => p.id === currentPokemonId);
            if (!currentPokemon) {
                console.warn(`[SPECIES_FILE_WRITER] Could not find pokemon with id ${currentPokemonId} while writing species file.`);
            }
            currentLog = [...(currentPokemon?.log || [])];
            continue;
        }
        if (!currentLog.length) continue;
        if (speciesLines[i].startsWith('        .baseHP')) {
            const hpEntryIndex = currentLog.findIndex(entry => entry.target === 'baseHP');
            if (hpEntryIndex === -1) continue;
            const oldValue = currentLog[hpEntryIndex].oldValue;
            currentLog.splice(hpEntryIndex, 1);
            speciesLines[i] = `        .baseHP        = ${currentPokemon.baseHP}, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${speciesLines[i]}`;
        }
        if (speciesLines[i].startsWith('        .baseAttack')) {
            const atkEntryIndex = currentLog.findIndex(entry => entry.target === 'baseAttack');
            if (atkEntryIndex === -1) continue;
            const oldValue = currentLog[atkEntryIndex].oldValue;
            currentLog.splice(atkEntryIndex, 1);
            speciesLines[i] = `        .baseAttack    = ${currentPokemon.baseAttack}, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${speciesLines[i]}`;
        }
        if (speciesLines[i].startsWith('        .baseDefense')) {
            const defEntryIndex = currentLog.findIndex(entry => entry.target === 'baseDefense');
            if (defEntryIndex === -1) continue;
            const oldValue = currentLog[defEntryIndex].oldValue;
            currentLog.splice(defEntryIndex, 1);
            speciesLines[i] = `        .baseDefense   = ${currentPokemon.baseDefense}, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${speciesLines[i]}`;
        }
        if (speciesLines[i].startsWith('        .baseSpeed')) {
            const speEntryIndex = currentLog.findIndex(entry => entry.target === 'baseSpeed');
            if (speEntryIndex === -1) continue;
            const oldValue = currentLog[speEntryIndex].oldValue;
            currentLog.splice(speEntryIndex, 1);
            speciesLines[i] = `        .baseSpeed     = ${currentPokemon.baseSpeed}, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${speciesLines[i]}`;
        }
        if (speciesLines[i].startsWith('        .baseSpAttack')) {
            const spaEntryIndex = currentLog.findIndex(entry => entry.target === 'baseSpAttack');
            if (spaEntryIndex === -1) continue;
            const oldValue = currentLog[spaEntryIndex].oldValue;
            currentLog.splice(spaEntryIndex, 1);
            speciesLines[i] = `        .baseSpAttack  = ${currentPokemon.baseSpAttack}, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${speciesLines[i]}`;
        }
        if (speciesLines[i].startsWith('        .baseSpDefense')) {
            const spdEntryIndex = currentLog.findIndex(entry => entry.target === 'baseSpDefense');
            if (spdEntryIndex === -1) continue;
            const oldValue = currentLog[spdEntryIndex].oldValue;
            currentLog.splice(spdEntryIndex, 1);
            speciesLines[i] = `        .baseSpDefense = ${currentPokemon.baseSpDefense}, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${speciesLines[i]}`;
        }
        if (speciesLines[i].startsWith('        .types')) {
            const typeEntryIndex = currentLog.findIndex(entry => entry.target === 'type');
            if (typeEntryIndex === -1) continue;
            const oldValue = currentLog[typeEntryIndex].oldValue;
            currentLog.splice(typeEntryIndex, 1);
            const monTypes = currentPokemon.parsedTypes.map(t => `TYPE_${t.toUpperCase()}`).join(', ');
            speciesLines[i] = `        .types = MON_TYPES(${monTypes}), // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${speciesLines[i]}`;
        }
        if (speciesLines[i].startsWith('        .abilities')) {
            const abilityEntryIndex = currentLog.findIndex(entry => entry.target === 'ability');
            if (abilityEntryIndex === -1) continue;
            const oldValue = currentLog[abilityEntryIndex].oldValue;
            currentLog.splice(abilityEntryIndex, 1);
            const monAbilities = currentPokemon.parsedAbilities.map(a => `ABILITY_${a.toUpperCase()}`).join(', ');
            speciesLines[i] = `        .abilities = { ${monAbilities} }, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${speciesLines[i]}`;
        }
        if (speciesLines[i].startsWith('        .levelUpLearnset')) {
            const learnsetEntryIndex = currentLog.findIndex(entry => entry.target === 'levelUpLearnset');
            if (learnsetEntryIndex === -1) continue;
            learnsets[currentPokemon.levelUpLearnset] = currentPokemon.learnset.map(({ level, move}) => `    LEVEL_UP_MOVE( ${level}, ${move}),`).join('\n');
        }
    }
    const learnsetLines = genLearnsetFileText.split('\n');
    let currentLearnsetId;
    let fullReplacement;
    for (let i = 0; i < learnsetLines.length; i++) {
        if (learnsetLines[i].startsWith('static const struct LevelUpMove ')) {
            currentLearnsetId = learnsetLines[i].split('LevelUpMove ')[1].split('[]')[0];
            if (!learnsets[currentLearnsetId]) continue;
            fullReplacement = learnsetLines[i];
        }
        if (!currentLearnsetId) continue;
        fullReplacement += `\n${learnsetLines[i]}`;
        if (learnsetLines[i].startsWith('};')) {
            learnsetResult = learnsetResult.replace(fullReplacement, `static const struct LevelUpMove [] = {\n${learnsets[currentLearnsetId]}\n};`);
        }
    }
    return { species: speciesLines.join('\n'), learnset: learnsetResult };
}

async function savePokemonData(pokemonList) {
    const learnsetsFilePath = path.resolve(LEVEL_UP_LEARNSETS_DIR, 'gen_9.h');
    let learnsetsFileText = await fs.readFile(learnsetsFilePath, 'utf-8');
    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        const genSpeciesFilePath = path.resolve(SPECIES_DIR, `gen_${gen}_families.h`);
        const genSpeciesFileText = await fs.readFile(genSpeciesFilePath, 'utf-8');
        const { species, learnset } = editFiles(genSpeciesFileText, learnsetsFileText, pokemonList);
        learnsetsFileText = learnset;
        await fs.writeFile(genSpeciesFilePath, species, 'utf-8');
    }
    await fs.writeFile(learnsetsFilePath, learnsetsFileText, 'utf-8');
}

module.exports = {
    savePokemonData,
};
