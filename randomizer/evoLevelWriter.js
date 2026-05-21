const fs = require('fs').promises;
const path = require('path');
const rng = require('./rng');

const {
    SPECIES_DIR,
    TIER_MAGIKARP,
    EVO_TYPE_LC_OF_2,
    EVO_TYPE_LC_OF_3,
    EVO_TYPE_NFE_OF_3,
    EVO_LEVEL_BASE_RANGES,
    EVO_LEVEL_PRE_EVO_MODIFIERS,
    EVO_LEVEL_STAGE_ADJUSTMENTS,
    EVO_LEVEL_DEVIATION,
    EVO_LEVEL_MIN,
    EVO_LEVEL_MAX,
} = require('./constants');

/**
 * Returns the stage adjustment multiplier for a given evo type.
 * Defaults to 0 (no adjustment) for any type not explicitly listed.
 */
function getStageAdjustment(evoType) {
    return EVO_LEVEL_STAGE_ADJUSTMENTS[evoType] !== undefined
        ? EVO_LEVEL_STAGE_ADJUSTMENTS[evoType]
        : 0;
}

/**
 * Picks a random float uniformly in [min, max].
 */
function randInRange(min, max) {
    return min + rng.random() * (max - min);
}

/**
 * Computes the evo level for a single evo entry.
 *
 * @param {string} preEvoTier - Tier of the pokemon holding the evo entry (e.g. 'ZU')
 * @param {string} evoTier    - Tier of the target pokemon being evolved into
 * @param {number} stageAdj  - Stage adjustment fraction (e.g. -0.20)
 * @returns {number} - Final clamped integer evo level
 */
function computeEvoLevel(preEvoTier, evoTier, stageAdj) {
    const baseRange = EVO_LEVEL_BASE_RANGES[evoTier] || EVO_LEVEL_BASE_RANGES[TIER_MAGIKARP];
    const modRange  = EVO_LEVEL_PRE_EVO_MODIFIERS[preEvoTier] || EVO_LEVEL_PRE_EVO_MODIFIERS[TIER_MAGIKARP];

    const baseLevel = randInRange(baseRange[0], baseRange[1]);
    const modifier  = randInRange(modRange[0],  modRange[1]);
    const deviation = randInRange(-EVO_LEVEL_DEVIATION, EVO_LEVEL_DEVIATION);

    const raw = baseLevel * (1 + modifier + stageAdj + deviation);
    return Math.round(Math.max(EVO_LEVEL_MIN, Math.min(EVO_LEVEL_MAX, raw)));
}

/**
 * Scans pokemonList for every EVO_LEVEL evolution, computes a dynamic level,
 * and mutates evo.param in-memory. Does NOT write to any files.
 * Call this from any pipeline that needs the updated levels without touching game files.
 *
 * @param {Array} pokemonList - Full rated pokemon list
 * @returns {Map<string, number>} evoLevelMap — species ID → computed level
 */
function applyEvoLevels(pokemonList) {
    const pokemonMap = new Map(pokemonList.map(p => [p.id, p]));
    const evoLevelMap = new Map();

    for (const pokemon of pokemonList) {
        if (!pokemon.evolutions || pokemon.evolutions.length === 0) continue;

        for (const evo of pokemon.evolutions) {
            if (evo.method !== 'LEVEL') continue;

            const evoPokemon = pokemonMap.get(evo.pokemon);
            if (!evoPokemon) continue;

            const preEvoTier = pokemon.rating.tier;
            const evoTier    = evoPokemon.rating.tier;
            const stageAdj   = getStageAdjustment(pokemon.evolutionData.type);

            const level = computeEvoLevel(preEvoTier, evoTier, stageAdj);
            evoLevelMap.set(evo.pokemon, level);

            // Mutate in-memory so the HTML viewer and trainer logic use the new levels
            evo.param = String(level);
        }
    }

    return evoLevelMap;
}

/**
 * Scans pokemonList for every EVO_LEVEL evolution, computes a dynamic level,
 * and writes the updated levels into the gen_*_families.h source files.
 *
 * @param {Array} pokemonList - Full rated pokemon list from index.js
 */
async function writeEvoLevels(pokemonList) {
    const evoLevelMap = applyEvoLevels(pokemonList);

    if (evoLevelMap.size === 0) {
        console.log('No EVO_LEVEL evolutions found — skipping evo level write.');
        return;
    }

    console.log(`Updating ${evoLevelMap.size} EVO_LEVEL entries across gen files...`);

    // All gen files are single flat .h files
    const genFiles = [];
    for (let i = 1; i <= 9; i++) {
        genFiles.push(path.join(SPECIES_DIR, `gen_${i}_families.h`));
    }

    let totalReplaced = 0;

    for (const filePath of genFiles) {
        let content;
        try {
            content = await fs.readFile(filePath, 'utf8');
        } catch {
            continue; // skip missing files
        }

        let modified = false;

        for (const [evoSpecies, level] of evoLevelMap) {
            // Match {EVO_LEVEL, <any number>, SPECIES_XXX} — handles optional spaces
            const regex = new RegExp(
                `\\{EVO_LEVEL,\\s*\\d+,\\s*${evoSpecies}\\}`,
                'g'
            );
            const replacement = `{EVO_LEVEL, ${level}, ${evoSpecies}}`;
            const updated = content.replace(regex, replacement);
            if (updated !== content) {
                content = updated;
                modified = true;
                totalReplaced++;
            }
        }

        if (modified) {
            await fs.writeFile(filePath, content, 'utf8');
        }
    }

    console.log(`Done — replaced ${totalReplaced} EVO_LEVEL entries.`);
}

module.exports = { applyEvoLevels, writeEvoLevels };
