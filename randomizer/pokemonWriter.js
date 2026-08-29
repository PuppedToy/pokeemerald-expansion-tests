const path = require("path");
const fs = require("fs").promises;

const { TOTAL_GENS, SPECIES_DIR, LEVEL_UP_LEARNSETS_DIR, POKEMON_TYPES } = require("./constants");
// T-237 — learnset arrays are declared at a fixed capacity so the injector can overwrite them in place
// (ADR-022). Both counts include the terminator, so a payload may be at most capacity - 1 long.
const { LEVEL_UP_LEARNSET_CAPACITY, TEACHABLE_LEARNSET_CAPACITY } = require("./layout");

// T-283 — some species own no stat lines of their own: they are written
// `[SPECIES_X] = SOME_SPECIES_INFO,` and their fields live in a `#define` body shared with their
// sibling forms. The writer used to walk straight past those bodies, so those species kept their base
// stats in the ROM while the parser read the macro and the docs showed the mutated ones — a docs≠ROM
// defect of the same class as B-062. Six live species are affected, all survivors of a T-154 cosmetic
// collapse: Mothim, Vivillon-Icy-Snow, Flabebe/Floette/Florges-Red, Alcremie-Strawberry-Vanilla-Cream.
//
// Writing a macro body moves EVERY species that invokes it. That is safe here only because each of the
// six is the sole survivor of its macro — every co-user is a removed species — and a test pins it.
// Two spellings for "my stats live in a macro":
//   [SPECIES_MOTHIM_PLANT] = MOTHIM_SPECIES_INFO,          — the whole entry is the macro
//   [SPECIES_VIVILLON_ICY_SNOW] = { VIVILLON_MISC_INFO(IcySnow, …), .description = … }
//                                                          — a real block whose stat lines are not
const MACRO_SPECIES_DECL = /^\s*\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*([A-Z][A-Z0-9_]*)\s*(?:\([^)]*\))?\s*,/;
const MACRO_INVOCATION = /^\s{4,}([A-Z][A-Z0-9_]*)\s*\(/;
const MACRO_DEFINE = /^#define\s+([A-Z][A-Z0-9_]*)/;
const STAT_LINE = /^\s*\.(baseHP|baseAttack|baseDefense|baseSpeed|baseSpAttack|baseSpDefense|types|abilities)\s*=/;

function editSpeciesFile(genSpeciesFileText, pokemonList) {
    const lines = genSpeciesFileText.split('\n');

    // Which species owns each macro body. Built first because a `#define` can appear before or after
    // the declarations that use it.
    //
    // Only macros whose body actually declares stat lines can be owned — that keeps the scan from
    // claiming SHADOW(), FOOTPRINT(), OVERWORLD() and friends, which a species block also invokes.
    const statMacros = new Set();
    {
        let openMacro = null;
        for (const line of lines) {
            const def = line.match(MACRO_DEFINE);
            if (def) { openMacro = def[1]; continue; }
            if (!openMacro) continue;
            if (STAT_LINE.test(line)) statMacros.add(openMacro);
            if (!/\\\s*$/.test(line)) openMacro = null;   // the body ends at the first un-continued line
        }
    }

    const macroOwner = new Map();
    let declaringSpecies = null;
    for (const line of lines) {
        // A `#define` ends the species block scan: a macro invoked inside another macro's body belongs
        // to whoever owns that body (resolved by the propagation pass below), never to whichever
        // species header happened to come before the `#define`.
        if (MACRO_DEFINE.test(line)) { declaringSpecies = null; continue; }
        const decl = line.match(MACRO_SPECIES_DECL);
        if (decl) {
            const owner = pokemonList.find(p => p.id === decl[1]);
            if (owner && !macroOwner.has(decl[2])) macroOwner.set(decl[2], owner);
            declaringSpecies = null;
            continue;
        }
        const header = line.match(/^\s*\[(SPECIES_[A-Z0-9_]+)\]\s*=/);
        if (header) { declaringSpecies = pokemonList.find(p => p.id === header[1]) || null; continue; }
        const invocation = declaringSpecies && line.match(MACRO_INVOCATION);
        if (invocation && statMacros.has(invocation[1]) && !macroOwner.has(invocation[1])) {
            macroOwner.set(invocation[1], declaringSpecies);
        }
    }

    // Macros nest: Alcremie's entry is ALCREMIE_REGULAR_SPECIES_INFO(...), whose body invokes
    // ALCREMIE_MISC_INFO(color) — and the stats are in the inner one. Propagate ownership inward so
    // the body that actually holds the stat lines is reachable. Bounded: each pass can only claim an
    // unowned macro, so it converges.
    for (let pass = 0; pass < 4; pass++) {
        let claimed = false;
        let openMacro = null;
        for (const line of lines) {
            const def = line.match(MACRO_DEFINE);
            if (def) { openMacro = def[1]; continue; }
            if (!openMacro) continue;
            const inner = line.match(MACRO_INVOCATION);
            if (inner && macroOwner.has(openMacro) && !macroOwner.has(inner[1]) && statMacros.has(inner[1])) {
                macroOwner.set(inner[1], macroOwner.get(openMacro));
                claimed = true;
            }
            if (!/\\\s*$/.test(line)) openMacro = null;
        }
        if (!claimed) break;
    }

    let currentPokemonId;
    let currentPokemon;
    let currentLog = [];
    for (let i = 0; i < lines.length; i++) {
        const macro = lines[i].match(MACRO_DEFINE);
        if (macro) {
            // Always reset here, even when nothing owns this macro. Otherwise an unconsumed entry from
            // whichever species block happened to precede the `#define` rewrites the macro body and so
            // moves every species that uses it — the hazard injector/modules/species.js warns about.
            currentPokemon = macroOwner.get(macro[1]);
            currentPokemonId = currentPokemon ? currentPokemon.id : undefined;
            currentLog = [...(currentPokemon?.log || [])];
            continue;
        }
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
        // B-025 — inside a `#define` body every line ends in a `\` continuation. A `//` comment before
        // it would swallow the next macro line and break the build, so those rewrites are re-emitted
        // with a block comment below. Captured before the rewrites so the check is on the ORIGINAL.
        const wasContinuation = /\\\s*$/.test(lines[i]);
        const originalLine = lines[i];
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
        // B-025 — a rewritten line inside a `#define` body must keep its continuation, and its comment
        // must be a block comment: a `//` before the trailing `\` swallows the next macro line.
        // Untouched lines and ordinary species blocks are left exactly as they were, so the output of
        // every non-macro rewrite stays byte-identical to before T-283.
        if (wasContinuation && lines[i] !== originalLine) {
            lines[i] = `${lines[i].replace(/\s*\/\/\s?/, ' /* ').trimEnd()} */ \\`;
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
        const declaration = learnsetLines[i].match(/^(?:static )?const struct LevelUpMove (\w+)\[/);
        if (declaration) {
            const currentLearnsetId = declaration[1];
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
            // +1 for LEVEL_UP_END. Overflowing the slot would shift every table after it in the ROM,
            // which is exactly what the fixed capacity exists to prevent — fail here, not in the build.
            if (currentPokemon.learnset.length + 1 > LEVEL_UP_LEARNSET_CAPACITY) {
                throw new Error(`pokemonWriter: ${currentPokemon.levelUpLearnset} has ${currentPokemon.learnset.length} `
                    + `level-up moves; LEVEL_UP_LEARNSET_CAPACITY is ${LEVEL_UP_LEARNSET_CAPACITY} `
                    + `(${LEVEL_UP_LEARNSET_CAPACITY - 1} moves + terminator). Raise it in include/constants/randomizer_layout.h.`);
            }
            result = result.replace(fullReplacement, `const struct LevelUpMove ${currentPokemon.levelUpLearnset}[LEVEL_UP_LEARNSET_CAPACITY] = {\n${currentPokemon.learnset
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
        const declaration = line.match(/^(?:static )?const u16 (\w*TeachableLearnset)\[/);
        if (declaration) {
            currentLearnsetId = declaration[1];
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
            // +1 for MOVE_UNAVAILABLE — see the level-up guard above for why this must not overflow.
            if (currentPokemon.teachables.length + 1 > TEACHABLE_LEARNSET_CAPACITY) {
                throw new Error(`pokemonWriter: ${currentLearnsetId} has ${currentPokemon.teachables.length} `
                    + `teachable moves; TEACHABLE_LEARNSET_CAPACITY is ${TEACHABLE_LEARNSET_CAPACITY} `
                    + `(${TEACHABLE_LEARNSET_CAPACITY - 1} moves + terminator). Raise it in include/constants/randomizer_layout.h.`);
            }
            const originalBlock = lines.slice(blockStart, i + 1).join('\n');
            const newMoves = currentPokemon.teachables.map(m => `    ${m},`).join('\n');
            const newBlock = `const u16 ${currentLearnsetId}[TEACHABLE_LEARNSET_CAPACITY] = {\n${newMoves}\n    MOVE_UNAVAILABLE,\n};`;
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
    editLearnsetsFile,
    editTeachableLearnsets,
    LEVEL_UP_LEARNSET_CAPACITY,
    TEACHABLE_LEARNSET_CAPACITY,
};
