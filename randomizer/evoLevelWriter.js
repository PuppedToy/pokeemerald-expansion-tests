const fs = require('fs').promises;
const path = require('path');
const rng = require('./rng');

const {
    SPECIES_DIR,
    TIER_MAGIKARP,
    TIER_SEQ,
    EVO_TYPE_LC_OF_2,
    EVO_TYPE_LC_OF_3,
    EVO_TYPE_NFE_OF_3,
    EVO_LEVEL_BASE_RANGES,
    EVO_LEVEL_PRE_EVO_MODIFIERS,
    EVO_LEVEL_STAGE_ADJUSTMENTS,
    EVO_LEVEL_FINAL_STAGE_DELAYS,
    EVO_LEVEL_DEVIATION,
    EVO_LEVEL_MIN,
    EVO_LEVEL_MAX,
} = require('./constants');

// T-066 — minimum level gap enforced between stage0→1 and stage1→2 of a 3-stage line.
const MIN_STAGE_GAP = 2;

/**
 * T-052 — resolve the evolution-level knobs from config, each falling back to its historical
 * constant so a no-config call is byte-identical. `stageAdjustments` uses the frontend's
 * lcOf2/lcOf3/nfeOf3 keys; `baseRanges`/`preEvoModifiers` are whole-table overrides (Step 8).
 */
function resolveEvoParams(cfg = {}) {
    const num = (v, def) => (typeof v === 'number' && Number.isFinite(v) ? v : def);
    const stage = cfg.stageAdjustments || {};
    return {
        baseRanges: cfg.baseRanges || EVO_LEVEL_BASE_RANGES,
        preEvoModifiers: cfg.preEvoModifiers || EVO_LEVEL_PRE_EVO_MODIFIERS,
        // T-066 — extra stage0→1 delay by final stage-2 tier. Whole-table override; pass {} to disable.
        finalStageDelays: cfg.finalStageDelays || EVO_LEVEL_FINAL_STAGE_DELAYS,
        deviation: num(cfg.deviation, EVO_LEVEL_DEVIATION),
        min: num(cfg.min, EVO_LEVEL_MIN),
        max: num(cfg.max, EVO_LEVEL_MAX),
        stageAdjustments: {
            [EVO_TYPE_LC_OF_2]:  num(stage.lcOf2,  EVO_LEVEL_STAGE_ADJUSTMENTS[EVO_TYPE_LC_OF_2]),
            [EVO_TYPE_LC_OF_3]:  num(stage.lcOf3,  EVO_LEVEL_STAGE_ADJUSTMENTS[EVO_TYPE_LC_OF_3]),
            [EVO_TYPE_NFE_OF_3]: num(stage.nfeOf3, EVO_LEVEL_STAGE_ADJUSTMENTS[EVO_TYPE_NFE_OF_3]),
        },
    };
}

/**
 * Returns the stage adjustment multiplier for a given evo type.
 * Defaults to 0 (no adjustment) for any type not explicitly listed.
 */
function getStageAdjustment(evoType, stageAdjustments = EVO_LEVEL_STAGE_ADJUSTMENTS) {
    return stageAdjustments[evoType] !== undefined ? stageAdjustments[evoType] : 0;
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
 * @param {Object} params    - Resolved evo params (from resolveEvoParams); defaults = constants
 * @param {number} finalDelay - T-066 extra delay fraction from the final stage-2 tier (default 0)
 * @returns {number} - Final clamped integer evo level
 */
function computeEvoLevel(preEvoTier, evoTier, stageAdj, params = resolveEvoParams(), finalDelay = 0) {
    const baseRange = params.baseRanges[evoTier] || params.baseRanges[TIER_MAGIKARP] || EVO_LEVEL_BASE_RANGES[TIER_MAGIKARP];
    const modRange  = params.preEvoModifiers[preEvoTier] || params.preEvoModifiers[TIER_MAGIKARP] || EVO_LEVEL_PRE_EVO_MODIFIERS[TIER_MAGIKARP];

    const baseLevel = randInRange(baseRange[0], baseRange[1]);
    const modifier  = randInRange(modRange[0],  modRange[1]);
    const deviation = randInRange(-params.deviation, params.deviation);

    const raw = baseLevel * (1 + modifier + stageAdj + finalDelay + deviation);
    return Math.round(Math.max(params.min, Math.min(params.max, raw)));
}

/**
 * T-066 — the tier of the strongest stage-2 mon reachable FROM a given stage-1, down this branch
 * only (walks the stage-1's own evolutions[], so Wurmple→Silcoon keys off Beautifly, not the family
 * max). Returns null when the stage-1 has no level/stone evolutions (not a real 3-stage line).
 */
function finalStageTierFor(stage1, pokemonMap) {
    const finals = (stage1.evolutions || [])
        .filter(e => e.method === 'LEVEL' || e.method === 'ITEM')
        .map(e => pokemonMap.get(e.pokemon))
        .filter(Boolean);
    if (finals.length === 0) return null;
    return finals.reduce(
        (best, f) => (TIER_SEQ.indexOf(f.rating.tier) > TIER_SEQ.indexOf(best) ? f.rating.tier : best),
        finals[0].rating.tier,
    );
}

/**
 * Scans pokemonList for every EVO_LEVEL evolution, computes a dynamic level,
 * and mutates evo.param in-memory. Does NOT write to any files.
 * Call this from any pipeline that needs the updated levels without touching game files.
 *
 * @param {Array} pokemonList - Full rated pokemon list
 * @returns {Map<string, number>} evoLevelMap — species ID → computed level
 */
function applyEvoLevels(pokemonList, evoConfig = {}) {
    const params = resolveEvoParams(evoConfig);
    const pokemonMap = new Map(pokemonList.map(p => [p.id, p]));
    const levelMap = new Map();   // EVO_LEVEL target → level (stored on evo.param)
    const stoneMap = new Map();   // EVO_ITEM  target → level (stored on evo.minLevel)

    for (const pokemon of pokemonList) {
        if (!pokemon.evolutions || pokemon.evolutions.length === 0) continue;

        for (const evo of pokemon.evolutions) {
            const isLevel = evo.method === 'LEVEL';
            const isStone = evo.method === 'ITEM';
            if (!isLevel && !isStone) continue;

            const evoPokemon = pokemonMap.get(evo.pokemon);
            if (!evoPokemon) continue;

            const preEvoTier = pokemon.rating.tier;
            const evoTier    = evoPokemon.rating.tier;
            const stageAdj   = getStageAdjustment(pokemon.evolutionData.type, params.stageAdjustments);

            // T-066 — for the stage0→1 evo of a 3-stage line (LC_OF_3 holder), add an EXTRA delay
            // scaled by the FINAL stage-2 tier reachable down THIS branch. The RNG draw happens only
            // when a delay band exists (OU+), so lines whose final is RU/UU/… — and any config that
            // disables the feature (finalStageDelays: {}) — keep the exact pre-T066 RNG stream.
            let finalDelay = 0;
            if (pokemon.evolutionData.type === EVO_TYPE_LC_OF_3) {
                const finalTier = finalStageTierFor(evoPokemon, pokemonMap);
                const band = finalTier && params.finalStageDelays[finalTier];
                if (band) finalDelay = randInRange(band[0], band[1]);
            }

            // Every branch is balanced from its own target's tier, so per-branch levels
            // (level vs stone, and stone vs stone) are independent.
            const level = computeEvoLevel(preEvoTier, evoTier, stageAdj, params, finalDelay);

            // Mutate in-memory so the HTML viewer and trainer logic use the new levels.
            if (isLevel) {
                levelMap.set(evo.pokemon, level);
                evo.param = String(level);
            } else {
                // Stone evolutions keep their item in evo.param; the level lives on
                // evo.minLevel (written to the CONDITIONS({IF_MIN_LEVEL, N}) clause).
                stoneMap.set(evo.pokemon, level);
                evo.minLevel = String(level);
            }
        }
    }

    // T-066 — safeguard: guarantee at least MIN_STAGE_GAP levels between stage0→1 and stage1→2 of a
    // 3-stage line (the extra final-stage delay, especially against a stage1→2 pinned at max, could
    // otherwise compress or invert the gap). Runs after all levels are set; consumes no RNG. For a
    // stage-1 that branches to several stage-2s, the smallest stage1→2 level bounds the cap.
    const readLevel  = (evo) => parseInt(evo.method === 'LEVEL' ? evo.param : evo.minLevel, 10);
    const writeLevel = (evo, lvl) => {
        if (evo.method === 'LEVEL') { evo.param = String(lvl); levelMap.set(evo.pokemon, lvl); }
        else { evo.minLevel = String(lvl); stoneMap.set(evo.pokemon, lvl); }
    };
    for (const pokemon of pokemonList) {
        if (pokemon.evolutionData?.type !== EVO_TYPE_LC_OF_3) continue;
        for (const evo of pokemon.evolutions || []) {
            if (evo.method !== 'LEVEL' && evo.method !== 'ITEM') continue;
            const stage1 = pokemonMap.get(evo.pokemon);
            if (!stage1) continue;
            const stage2Levels = (stage1.evolutions || [])
                .filter(e => e.method === 'LEVEL' || e.method === 'ITEM')
                .map(readLevel)
                .filter(Number.isFinite);
            if (stage2Levels.length === 0) continue;
            const minStage2 = Math.min(...stage2Levels);
            const l1 = readLevel(evo);
            if (Number.isFinite(l1) && l1 > minStage2 - MIN_STAGE_GAP) {
                writeLevel(evo, Math.max(params.min, minStage2 - MIN_STAGE_GAP));
            }
        }
    }

    return { levelMap, stoneMap };
}

/**
 * Builds the species → evo-level map from the levels ALREADY stored on each
 * pokemon's evolutions[].param, without recomputing anything (and without
 * consuming RNG). Used in bundle mode, where the levels were chosen once at
 * bundle-creation time (writerDocs → applyEvoLevels) so the ROM writes exactly
 * those values rather than re-rolling them with a second RNG stream.
 *
 * @param {Array} pokemonList
 * @returns {Map<string, number>} evoSpeciesId → level
 */
function buildEvoLevelMapFromParams(pokemonList) {
    const levelMap = new Map();
    const stoneMap = new Map();
    for (const pokemon of pokemonList) {
        if (!pokemon.evolutions || pokemon.evolutions.length === 0) continue;
        for (const evo of pokemon.evolutions) {
            if (evo.method === 'LEVEL') {
                levelMap.set(evo.pokemon, parseInt(evo.param, 10));
            } else if (evo.method === 'ITEM' && evo.minLevel !== undefined) {
                stoneMap.set(evo.pokemon, parseInt(evo.minLevel, 10));
            }
        }
    }
    return { levelMap, stoneMap };
}

/**
 * Pure helper: rewrite the level in a plain {EVO_LEVEL, <n>, SPECIES} tuple.
 * Deliberately only matches tuples that close immediately after the species, so
 * conditional level evolutions ({EVO_LEVEL, 0, SPECIES, CONDITIONS(...)}) are left alone.
 */
function patchEvoLevelInContent(content, evoSpecies, level) {
    const regex = new RegExp(`\\{EVO_LEVEL,\\s*\\d+,\\s*${evoSpecies}\\}`, 'g');
    return content.replace(regex, `{EVO_LEVEL, ${level}, ${evoSpecies}}`);
}

/**
 * Pure helper: rewrite only the IF_MIN_LEVEL number inside a stone evolution
 * {EVO_ITEM, ITEM_X, SPECIES, CONDITIONS({IF_MIN_LEVEL, <n>})}, keeping the item and species.
 */
function patchStoneMinLevelInContent(content, evoSpecies, level) {
    const regex = new RegExp(
        `(\\{EVO_ITEM,\\s*ITEM_\\w+,\\s*${evoSpecies},\\s*CONDITIONS\\(\\{IF_MIN_LEVEL,\\s*)\\d+(\\}\\)\\})`,
        'g'
    );
    return content.replace(regex, `$1${level}$2`);
}

/**
 * Scans pokemonList for every EVO_LEVEL evolution and writes the levels into
 * the gen_*_families.h source files.
 *
 * @param {Array} pokemonList - Full rated pokemon list from index.js
 * @param {object} [opts]
 * @param {boolean} [opts.recompute=true] - When true, re-roll levels via RNG
 *        (randomize/analyze mode). When false, write the levels already stored
 *        on evo.param (bundle mode — single source of truth, no RNG).
 */
async function writeEvoLevels(pokemonList, { recompute = true, evoConfig = {} } = {}) {
    const { levelMap, stoneMap } = recompute
        ? applyEvoLevels(pokemonList, evoConfig)
        : buildEvoLevelMapFromParams(pokemonList);

    if (levelMap.size === 0 && stoneMap.size === 0) {
        console.log('No evolutions with levels found — skipping evo level write.');
        return;
    }

    console.log(`Updating ${levelMap.size} EVO_LEVEL and ${stoneMap.size} stone (IF_MIN_LEVEL) entries across gen files...`);

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

        for (const [evoSpecies, level] of levelMap) {
            const updated = patchEvoLevelInContent(content, evoSpecies, level);
            if (updated !== content) {
                content = updated;
                modified = true;
                totalReplaced++;
            }
        }

        for (const [evoSpecies, level] of stoneMap) {
            const updated = patchStoneMinLevelInContent(content, evoSpecies, level);
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

    console.log(`Done — replaced ${totalReplaced} evolution level entries.`);
}

module.exports = {
    applyEvoLevels,
    writeEvoLevels,
    buildEvoLevelMapFromParams,
    patchEvoLevelInContent,
    patchStoneMinLevelInContent,
    // Exported for unit testing (T-052).
    resolveEvoParams,
    computeEvoLevel,
    // Exported for unit testing (T-066).
    finalStageTierFor,
};
