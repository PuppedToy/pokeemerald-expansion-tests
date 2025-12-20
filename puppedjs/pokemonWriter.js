const path = require("path");
const fs = require("fs").promises;

const { TOTAL_GENS, SPECIES_DIR, LEVEL_UP_LEARNSETS_DIR } = require("./constants");

function editSpeciesFile(genSpeciesFileText, pokemonList) {
    const lines = genSpeciesFileText.split('\n');
    let currentPokemonId;
    let currentPokemon;
    let currentLog = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('    [')) {
            currentPokemonId = lines[i].split('[')[1].split(']')[0];
            currentPokemon = pokemonList.find(p => p.id === currentPokemonId);
            if (!currentPokemon) {
                console.warn(`[SPECIES_FILE_WRITER] Could not find pokemon with id ${currentPokemonId} while writing species file.`);
            }
            currentLog = [...(currentPokemon?.log || [])];
            continue;
        }
        if (!currentLog.length) continue;
        if (lines[i].startsWith('        .baseHP')) {
            const hpEntryIndex = currentLog.findIndex(entry => entry.target === 'baseHP');
            if (hpEntryIndex === -1) continue;
            const oldValue = currentLog[hpEntryIndex].oldValue;
            currentLog.splice(hpEntryIndex, 1);
            lines[i] = `        .baseHP        = ${currentPokemon.baseHP}, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${lines[i]}`;
        }
        if (lines[i].startsWith('        .baseAttack')) {
            const atkEntryIndex = currentLog.findIndex(entry => entry.target === 'baseAttack');
            if (atkEntryIndex === -1) continue;
            const oldValue = currentLog[atkEntryIndex].oldValue;
            currentLog.splice(atkEntryIndex, 1);
            lines[i] = `        .baseAttack    = ${currentPokemon.baseAttack}, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${lines[i]}`;
        }
        if (lines[i].startsWith('        .baseDefense')) {
            const defEntryIndex = currentLog.findIndex(entry => entry.target === 'baseDefense');
            if (defEntryIndex === -1) continue;
            const oldValue = currentLog[defEntryIndex].oldValue;
            currentLog.splice(defEntryIndex, 1);
            lines[i] = `        .baseDefense   = ${currentPokemon.baseDefense}, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${lines[i]}`;
        }
        if (lines[i].startsWith('        .baseSpeed')) {
            const speEntryIndex = currentLog.findIndex(entry => entry.target === 'baseSpeed');
            if (speEntryIndex === -1) continue;
            const oldValue = currentLog[speEntryIndex].oldValue;
            currentLog.splice(speEntryIndex, 1);
            lines[i] = `        .baseSpeed     = ${currentPokemon.baseSpeed}, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${lines[i]}`;
        }
        if (lines[i].startsWith('        .baseSpAttack')) {
            const spaEntryIndex = currentLog.findIndex(entry => entry.target === 'baseSpAttack');
            if (spaEntryIndex === -1) continue;
            const oldValue = currentLog[spaEntryIndex].oldValue;
            currentLog.splice(spaEntryIndex, 1);
            lines[i] = `        .baseSpAttack  = ${currentPokemon.baseSpAttack}, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${lines[i]}`;
        }
        if (lines[i].startsWith('        .baseSpDefense')) {
            const spdEntryIndex = currentLog.findIndex(entry => entry.target === 'baseSpDefense');
            if (spdEntryIndex === -1) continue;
            const oldValue = currentLog[spdEntryIndex].oldValue;
            currentLog.splice(spdEntryIndex, 1);
            lines[i] = `        .baseSpDefense = ${currentPokemon.baseSpDefense}, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${lines[i]}`;
        }
        if (lines[i].startsWith('        .types')) {
            const typeEntryIndex = currentLog.findIndex(entry => entry.target === 'type');
            if (typeEntryIndex === -1) continue;
            const oldValue = currentLog[typeEntryIndex].oldValue;
            currentLog.splice(typeEntryIndex, 1);
            const monTypes = currentPokemon.parsedTypes.map(t => `TYPE_${t.toUpperCase()}`).join(', ');
            lines[i] = `        .types = MON_TYPES(${monTypes}), // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${lines[i]}`;
        }
        if (lines[i].startsWith('        .abilities')) {
            const abilityEntryIndex = currentLog.findIndex(entry => entry.target === 'ability');
            if (abilityEntryIndex === -1) continue;
            const oldValue = currentLog[abilityEntryIndex].oldValue;
            currentLog.splice(abilityEntryIndex, 1);
            const monAbilities = currentPokemon.parsedAbilities.map(a => `ABILITY_${a.toUpperCase()}`).join(', ');
            lines[i] = `        .abilities = { ${monAbilities} }, // @PUPPED-AUTO-BALANCE #${currentPokemon.id} [oldValue = ${oldValue}] -- previous line was >> ${lines[i]}`;
        }
    }
    return lines.join('\n');
}

async function editLearnsetsFile(learnsetsFileText, pokemonList) {
    const learnsetLines = learnsetsFileText.split('\n');
    let currentPokemon;
    let fullReplacement;
    let result = learnsetsFileText;
    for (let i = 0; i < learnsetLines.length; i++) {
        if (learnsetLines[i].startsWith('static const struct LevelUpMove ')) {
            const currentLearnsetId = learnsetLines[i].split('LevelUpMove ')[1].split('[]')[0];
            currentPokemon = pokemonList.find(p => p.levelUpLearnset === currentLearnsetId);
            if (!currentPokemon) {
                currentPokemon = null;
                continue;
            }
            fullReplacement = learnsetLines[i];
        }
        if (!currentPokemon) continue;
        fullReplacement += `\n${learnsetLines[i]}`;
        if (learnsetLines[i].startsWith('};')) {
            result = result.replace(fullReplacement, `static const struct LevelUpMove [] = {\n${learnsets[currentLearnsetId]}\n};`);
            currentPokemon = null;
            fullReplacement = null;
        }
    }
    return result;
}

async function savePokemonData(pokemonList) {
    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        const genSpeciesFilePath = path.resolve(SPECIES_DIR, `gen_${gen}_families.h`);
        const genSpeciesFileText = await fs.readFile(genSpeciesFilePath, 'utf-8');
        const result = editSpeciesFile(genSpeciesFileText, pokemonList);
        await fs.writeFile(genSpeciesFilePath, result, 'utf-8');
    }
    const learnsetsFilePath = path.resolve(LEVEL_UP_LEARNSETS_DIR, 'gen_9.h');
    const learnsetsFileText = await fs.readFile(learnsetsFilePath, 'utf-8');
    const learnsetsResult = await editLearnsetsFile(learnsetsFileText, pokemonList);
    await fs.writeFile(learnsetsFilePath, learnsetsResult, 'utf-8');
}

module.exports = {
    savePokemonData,
};
