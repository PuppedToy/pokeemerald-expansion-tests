const path = require("path");
const fs = require("fs").promises;

const { TOTAL_GENS, SPECIES_DIR, LEVEL_UP_LEARNSETS_DIR, POKEMON_TYPES } = require("./constants");

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
            const monTypes = currentPokemon.parsedTypes.map(t => {
                const up = String(t).toUpperCase();
                if (POKEMON_TYPES.includes(up)) return `TYPE_${up}`;
                // B-010 guard: an unrecognized token is a config macro (e.g. *_FAMILY_TYPE*) already
                // valid in the source — emit it verbatim, never an undefined TYPE_<macro>.
                console.warn(`[pokemonWriter] ${currentPokemon.id}: non-type token "${t}" in .types — emitting verbatim`);
                return t;
            }).join(', ');
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

// T-077: neutralize every wild held item. The only source of a wild held item is
// gSpeciesInfo[species].itemCommon/.itemRare (read exclusively by SetWildMonHeldItem() in
// src/pokemon.c), so rewriting both fields to ITEM_NONE guarantees zero items on wild
// Pokémon. Runs for EVERY species, independent of the rebalance log. The original value is
// preserved in a trailing comment for auditability, matching the writer's @PUPPED style.
function stripWildHeldItems(fileText) {
    const heldItemLine = /^(\s*)\.(itemCommon|itemRare)(\s*)=\s*ITEM_[A-Za-z0-9_]+\s*,.*$/;
    return fileText.split('\n').map((line) => {
        const m = line.match(heldItemLine);
        if (!m) return line;
        const [, indent, field, ws] = m;
        // Emit no reference to the stripped item — not even in the comment — so the old item
        // name survives nowhere in the source (keeps greps for e.g. ITEM_HEART_SCALE clean).
        //
        // B-025: some held-item fields sit inside multi-line `#define ..._SPECIES_INFO` /
        // `..._MISC_INFO` macros (form species like MOTHIM_SPECIES_INFO / MINIOR_MISC_INFO),
        // where the line ends in a `\` continuation. Dropping it terminates the macro before its
        // closing `}` and corrupts the whole gSpeciesInfo[] array (-> `-Werror` build failure).
        // Preserve the continuation, and annotate with a block comment: a `//` comment before a
        // trailing `\` would continue the comment onto — and swallow — the next macro line.
        if (/\\\s*$/.test(line)) {
            return `${indent}.${field}${ws}= ITEM_NONE, /* @PUPPED-NO-WILD-ITEMS (T-077) */ \\`;
        }
        return `${indent}.${field}${ws}= ITEM_NONE, // @PUPPED-NO-WILD-ITEMS (T-077)`;
    }).join('\n');
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
            }
            else
            {
                fullReplacement = learnsetLines[i];
            }
            continue;
        }
        if (!currentPokemon) continue;
        fullReplacement += `\n${learnsetLines[i]}`;
        if (learnsetLines[i].startsWith('};')) {
            result = result.replace(fullReplacement, `static const struct LevelUpMove ${currentPokemon.levelUpLearnset}[] = {\n${currentPokemon.learnset
                .map(({ level, move }) => `    LEVEL_UP_MOVE(${level}, ${move}),`).join('\n')}\n    LEVEL_UP_END\n};`);
            currentPokemon = null;
            fullReplacement = null;
        }
    }
    return result;
}

function editTeachableLearnsets(fileText, pokemonList) {
    const lines = fileText.split('\n');
    let currentLearnsetId = null;
    let currentPokemon = null;
    let blockStart = -1;
    let result = fileText;

    let blocksFound = 0;
    let blocksMatched = 0;
    let blocksReplaced = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('static const u16 ') && line.includes('TeachableLearnset')) {
            currentLearnsetId = line.split('static const u16 ')[1].split('[]')[0];
            currentPokemon = pokemonList.find(p => p.teachableLearnset === currentLearnsetId);
            blockStart = i;
            blocksFound++;
            if (!currentPokemon) {
                console.log(`[TEACHABLE-DEBUG] No pokemon matched learnset: ${currentLearnsetId}`);
            }
            continue;
        }
        if (currentPokemon && line.startsWith('};')) {
            blocksMatched++;
            if (!currentPokemon.teachables || currentPokemon.teachables.length === 0) {
                console.log(`[TEACHABLE-DEBUG] ${currentLearnsetId}: teachables empty, skipping write.`);
                currentPokemon = null;
                continue;
            }
            // Mismatch detection: derive expected species fragment from array name.
            // e.g. sGibleTeachableLearnset → GIBLE; warn if matched pokemon ID doesn't contain it.
            const expectedFragment = currentLearnsetId.slice(1).split('TeachableLearnset')[0].toUpperCase();
            if (!currentPokemon.id.toUpperCase().includes(expectedFragment)) {
                console.warn(`[TEACHABLE-MISMATCH] Array "${currentLearnsetId}" (expected ~${expectedFragment}) matched to ${currentPokemon.id} — possible data swap!`);
            }
            const originalBlock = lines.slice(blockStart, i + 1).join('\n');
            const newMoves = currentPokemon.teachables.map(m => `    ${m},`).join('\n');
            const newBlock = `static const u16 ${currentLearnsetId}[] = {\n${newMoves}\n    MOVE_UNAVAILABLE,\n};`;
            const before = result;
            result = result.replace(originalBlock, newBlock);
            if (result === before) {
                console.log(`[TEACHABLE-DEBUG] REPLACE FAILED for ${currentLearnsetId} — originalBlock not found in file. First 80 chars of block: ${JSON.stringify(originalBlock.slice(0, 80))}`);
            } else {
                blocksReplaced++;
            }
            currentPokemon = null;
        }
    }

    console.log(`[TEACHABLE-DEBUG] editTeachableLearnsets: ${blocksFound} arrays found, ${blocksMatched} matched to pokemon, ${blocksReplaced} successfully replaced.`);
    return result;
}

async function savePokemonData(pokemonList) {
    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        const genSpeciesFilePath = path.resolve(SPECIES_DIR, `gen_${gen}_families.h`);
        const genSpeciesFileText = await fs.readFile(genSpeciesFilePath, 'utf-8');
        const result = stripWildHeldItems(editSpeciesFile(genSpeciesFileText, pokemonList));
        await fs.writeFile(genSpeciesFilePath, result, 'utf-8');
    }
    const learnsetsFilePath = path.resolve(LEVEL_UP_LEARNSETS_DIR, 'gen_9.h');
    const learnsetsFileText = await fs.readFile(learnsetsFilePath, 'utf-8');
    const learnsetsResult = await editLearnsetsFile(learnsetsFileText, pokemonList);
    await fs.writeFile(learnsetsFilePath, learnsetsResult, 'utf-8');

    const teachablesFilePath = path.resolve(SPECIES_DIR, '..', 'teachable_learnsets.h');
    const teachablesFileText = await fs.readFile(teachablesFilePath, 'utf-8');
    const teachablesResult = editTeachableLearnsets(teachablesFileText, pokemonList);
    await fs.writeFile(teachablesFilePath, teachablesResult, 'utf-8');
}

module.exports = {
    savePokemonData,
    editSpeciesFile,
    stripWildHeldItems,
};
