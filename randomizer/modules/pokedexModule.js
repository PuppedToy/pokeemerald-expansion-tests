'use strict';

const fs = require('fs').promises;
const path = require('path');
const parser = require('../parser');
const { randomizeTMs, buildTMList, annotateTmNumbers } = require('../tmRandomizer');
const { parseTmLocations } = require('../tmLocations');
const { expandAllTeachables, buildTmPoolFromFile } = require('../teachableExpander');
const { ratePokemon, rateContextual, wishiwashiEffectivePoke, palafinEffectivePoke, rateMove, rateMoveDoubles, rateAbilityDoubles } = require('../rating');
const { balancePokemon } = require('../rebalancer');
const { applyMegaBaseStab } = require('../megaBaseStab');
const { applyMeloettaTierBlend } = require('../meloetta');
const {
    TOTAL_GENS, SPECIES_DIR, LEVEL_UP_LEARNSETS_DIR, ABILITIES_FILE_PATH, ITEMS_FILE_PATH, MEGA_EVOS_PATH,
    EVO_TYPE_MEGA,
    TIER_LEGEND, TIER_UBERS, TIER_LEGEND_THRESHOLD, TIER_SEQ,
    WISHIWASHI_SOLO_ID, WISHIWASHI_SCHOOL_ID,
    PALAFIN_ZERO_ID, PALAFIN_HERO_ID,
} = require('../constants');

const LEVEL_CAPS = [5, 7, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 35, 38, 40, 43, 46, 50, 55, 60, 65, 70];

// Parse all source .h files → raw deterministic objects.
// No RNG, no file writes. Called by build.js and (as fallback) by runPokedexModule in Node.
async function parseBaseData() {
    // 1. Parse abilities
    const abilitiesFileText = await fs.readFile(ABILITIES_FILE_PATH, 'utf-8');
    const abilities = parser.parseAbilitiesFile(abilitiesFileText);
    // T-096/ADR-015 — doubles ability value beside the singles aiRating.
    Object.keys(abilities).forEach(abilityKey => {
        abilities[abilityKey].ratingDoubles = rateAbilityDoubles(abilityKey, abilities[abilityKey]);
    });

    // 2. Parse mega evo stones
    const megaEvosFileText = await fs.readFile(MEGA_EVOS_PATH, 'utf-8');
    const megaEvoStones = parser.parseMegaEvoStonesFile(megaEvosFileText);

    // 2b. Parse item descriptions (T-078) — keyed by display name so the docs can show a hover
    // tooltip on held items and trainer rewards (both reach the viewer as display names).
    const itemsFileText = await fs.readFile(ITEMS_FILE_PATH, 'utf-8');
    const items = parser.parseItemsFile(itemsFileText);

    // 3. Parse moves
    const movesFilePath = path.resolve(__dirname, '..', '..', 'src', 'data', 'moves_info.h');
    const movesFileText = await fs.readFile(movesFilePath, 'utf-8');
    const moves = parser.parseMovesFile(movesFileText);
    // TM in-world locations (fixed per slot) — parsed from the docs SSOT so the Moves tab can show
    // where each TM is obtained (route + trainer). Best-effort: missing file → empty map (T-011).
    let tmLocations = {};
    try {
        const tmsMdText = await fs.readFile(path.resolve(__dirname, '..', 'docs', 'tms.md'), 'utf-8');
        tmLocations = parseTmLocations(tmsMdText);
    } catch (e) { tmLocations = {}; }
    Object.keys(moves).forEach(moveId => {
        moves[moveId].power    = parser.parseMoveStat(moves[moveId].power);
        moves[moveId].accuracy = parser.parseMoveStat(moves[moveId].accuracy);
        moves[moveId].pp       = parser.parseMoveStat(moves[moveId].pp);
        moves[moveId].priority = parser.parseMoveStat(moves[moveId].priority);
        moves[moveId].type     = moves[moveId].type.replace('TYPE_', '');
        moves[moveId].rating   = rateMove(moves[moveId]);
        moves[moveId].ratingDoubles = rateMoveDoubles(moves[moveId]);   // T-094/ADR-015
    });

    // 4. Parse learnsets
    const levelUpLearnsets = {};
    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        const learnsetsFilePath = path.resolve(LEVEL_UP_LEARNSETS_DIR, `gen_${gen}.h`);
        const learnsetsFileText = await fs.readFile(learnsetsFilePath, 'utf-8');
        Object.assign(levelUpLearnsets, parser.parseLearnsetsFile(learnsetsFileText));
    }

    // 5. Parse teachables
    const teachablesFilePath = path.resolve(__dirname, '..', '..', 'src', 'data', 'pokemon', 'teachable_learnsets.h');
    const teachablesFileText = await fs.readFile(teachablesFilePath, 'utf-8');
    const TMTeachables = parser.parseTeachableFile(teachablesFileText);

    // 6. Parse species (all gens) — deterministic enrichment with learnsets/teachables/evoTree
    const definitions = { VICTREEBEL_SP_DEF: '70', EXEGGUTOR_SP_DEF: '75' };
    const evoTree = {};
    const megaEvoTree = {};
    const allPokes = [];

    for (let gen = 1; gen <= TOTAL_GENS; gen++) {
        const genSpeciesFilePath = path.resolve(SPECIES_DIR, `gen_${gen}_families.h`);
        const genSpeciesFileText = await fs.readFile(genSpeciesFilePath, 'utf-8');
        const parsedPokes = parser.parseSpeciesFile(genSpeciesFileText, definitions, evoTree);

        parsedPokes.forEach(poke => {
            const learnset   = (poke.levelUpLearnset  && levelUpLearnsets[poke.levelUpLearnset])  ? levelUpLearnsets[poke.levelUpLearnset]  : [];
            const teachables = (poke.teachableLearnset && TMTeachables[poke.teachableLearnset]) ? TMTeachables[poke.teachableLearnset] : [];

            const evolutionType = parser.getEvolutionType(poke, evoTree);
            const isMega = evolutionType === EVO_TYPE_MEGA;
            let megaBaseForm, megaItem;
            if (isMega) {
                if (!megaEvoTree[poke.family]) megaEvoTree[poke.family] = [];
                megaEvoTree[poke.family].push(poke.id);
                megaBaseForm = poke.natDexNum.replace('NATIONAL_DEX_', 'SPECIES_');
                megaItem = megaEvoStones[poke.id];
            }

            const baseHP        = parser.parseStat(poke.baseHP, definitions);
            const baseAttack    = parser.parseStat(poke.baseAttack, definitions);
            const baseDefense   = parser.parseStat(poke.baseDefense, definitions);
            const baseSpeed     = parser.parseStat(poke.baseSpeed, definitions);
            const baseSpAttack  = parser.parseStat(poke.baseSpAttack, definitions);
            const baseSpDefense = parser.parseStat(poke.baseSpDefense, definitions);
            const baseBST = baseHP + baseAttack + baseDefense + baseSpeed + baseSpAttack + baseSpDefense;

            const fullPoke = {
                name: parser.nameizyPokemonId(poke.id),
                parsedTypes: parser.parseMonTypes(poke.types),
                parsedAbilities: poke.abilities.replace(/\/\/.*$/, '').trim().replace(/{ /, '').replace(/ }/, '').split(', ').map(a => a.replace('ABILITY_', '')),
                ...poke,
                baseHP, baseAttack, baseDefense, baseSpeed, baseSpAttack, baseSpDefense, baseBST,
                evolutionData: {
                    type: evolutionType,
                    isMega,
                    megaBaseForm,
                    megaItem,
                    isLC:    parser.evoIsLC(evolutionType),
                    isNFE:   parser.evoIsNFE(evolutionType),
                    isFinal: parser.evoIsFinal(evolutionType),
                },
                ...parser.FIXED_PROPERTIES,
                learnset,
                teachables,
                evoTree: evoTree[poke.family],
            };
            allPokes.push(fullPoke);
        });
    }

    return { abilities, items, megaEvoStones, moves, levelUpLearnsets, TMTeachables, evoTree, megaEvoTree, allPokes, tmLocations };
}

// Run the full pokedex pipeline.
//
// baseData: pre-parsed result from parseBaseData(). Pass this from the browser
//   (loaded from base-data.json) to skip all file I/O.
//   When null (Node CLI), parseBaseData() is called internally and JSON caches are written.
async function runPokedexModule(config, baseData = null) {
    const allTms  = config.allTms ?? false;
    const nodeMode = !baseData;

    if (nodeMode) {
        baseData = await parseBaseData();
        // Write JSON caches (Node-only — used by the HTML viewer and as intermediate artifacts)
        await fs.writeFile(path.resolve(__dirname, '..', 'abilities.json'),             JSON.stringify(baseData.abilities,         null, 2), 'utf-8');
        await fs.writeFile(path.resolve(__dirname, '..', 'items.json'),                 JSON.stringify(baseData.items,             null, 2), 'utf-8');
        await fs.writeFile(path.resolve(__dirname, '..', 'moves.json'),                 JSON.stringify(baseData.moves,             null, 2), 'utf-8');
        await fs.writeFile(path.resolve(__dirname, '..', 'level_up_learnsets.json'),    JSON.stringify(baseData.levelUpLearnsets,  null, 2), 'utf-8');
        await fs.writeFile(path.resolve(__dirname, '..', 'teachable_learnsets.json'),   JSON.stringify(baseData.TMTeachables,      null, 2), 'utf-8');
    }

    const { abilities, items, moves, evoTree, megaEvoTree, allPokes: basePokes } = baseData;

    // Deep-clone allPokes so we never mutate the shared pre-cooked base data.
    const allPokes = JSON.parse(JSON.stringify(basePokes));

    // 6. Randomize TMs — Node: writes tms_hms.h + script_menu.h; Browser: RNG only
    let tmList, tmPool;
    if (nodeMode) {
        tmList = await randomizeTMs();
        tmPool = allTms ? null : await buildTmPoolFromFile();
    } else {
        tmList = buildTMList();
        tmPool = allTms ? null : new Set(tmList.map(m => 'MOVE_' + m));
    }

    // Stamp each move with its TM number (1-based) so the docs can label/filter TM moves (T-011).
    annotateTmNumbers(moves, tmList);
    // Attach the fixed in-world location of each TM slot (route + trainer) for the Moves tab (T-011).
    const tmLocations = baseData.tmLocations || {};
    Object.keys(moves).forEach(id => { if (moves[id].tm && tmLocations[moves[id].tm]) moves[id].tmLocation = tmLocations[moves[id].tm]; });

    // 7. Expand teachables with randomized pool
    expandAllTeachables(allPokes, tmPool, moves);

    // 8. Rate all pokemon
    for (const poke of allPokes) {
        poke.rating = ratePokemon(poke, moves, abilities, tmPool);
    }

    // 9. Optional rebalance
    if (config.rebalance) {
        const abilityKeys = Object.keys(abilities).map(key => key.replace('ABILITY_', ''));
        // T-052 — per-category mutation toggles + probability overrides (default on / defaults).
        const mutationOptions = {
            mutateStats: config.mutateStats !== false,
            mutateAbilities: config.mutateAbilities !== false,
            mutateTypes: config.mutateTypes !== false,
            mutateLearnsets: config.mutateLearnsets !== false,
            probs: config.mutationProbs,
        };
        for (let i = 0; i < allPokes.length; i++) {
            allPokes[i] = balancePokemon(allPokes[i], abilityKeys, moves, config.balanceChance, mutationOptions);
            if (allPokes[i].log && allPokes[i].log.length) {
                allPokes[i].baseBST = allPokes[i].baseHP + allPokes[i].baseAttack + allPokes[i].baseDefense + allPokes[i].baseSpAttack + allPokes[i].baseSpDefense + allPokes[i].baseSpeed;
                allPokes[i].rating = ratePokemon(allPokes[i], moves, abilities, tmPool);
            }
        }
    }

    // 9b. Wishiwashi special case — the placed Solo form schools into the School form at
    // lvl 20+. Rate Solo using the live School entry's stats + typing (post-rebalance),
    // nerfed 25% HP for the unusable revert zone. Runs after rebalance so both forms have
    // final stats, and before best-evo so downstream tier/bestEvo use the corrected rating.
    const wishiSolo   = allPokes.find(p => p.id === WISHIWASHI_SOLO_ID);
    const wishiSchool = allPokes.find(p => p.id === WISHIWASHI_SCHOOL_ID);
    if (wishiSolo && wishiSchool) {
        wishiSolo.rating = ratePokemon(wishiwashiEffectivePoke(wishiSolo, wishiSchool), moves, abilities, tmPool);
    }

    // 9c. Palafin Zero-to-Hero special case — the placed Zero form transforms into the battle-only
    // Hero form on its first switch out (free, permanent). Rate Zero using the live Hero entry's
    // stats + typing (post-rebalance), with NO level gate and NO HP nerf. Runs after rebalance so
    // both forms have final stats, and before best-evo so Finizen inherits the elevated rating.
    const palafinZero = allPokes.find(p => p.id === PALAFIN_ZERO_ID);
    const palafinHero = allPokes.find(p => p.id === PALAFIN_HERO_ID);
    if (palafinZero && palafinHero) {
        palafinZero.rating = ratePokemon(palafinEffectivePoke(palafinZero, palafinHero), moves, abilities, tmPool);
    }

    // 9c-bis. Meloetta (T-064) — Aria (placeable) can switch to Pirouette (battle-only, banned) via
    // Relic Song, so Aria's tier is a weighted blend of both forms. Runs after both forms are rated
    // and before best-evo so the blended rating propagates. Unconditional (a classification fix).
    applyMeloettaTierBlend(allPokes);

    // 9d. Mega base-form STAB (T-062) — when a mega's type was MUTATED this run to a type its base
    // lacks (e.g. Mega Aggron gaining Fighting), the base form gains a damaging move of that type.
    // A mega fights with the base's known moves and its own learnset is discarded at write, so the
    // base is the only place the STAB can live. Runs after rebalance (so mega type logs exist) and
    // before best-evo (so the re-rated base propagates into bestEvo/megaEvo ratings). No-op when
    // rebalance/mutateTypes didn't run (no type logs).
    if (config.rebalance) {
        const megaStabbedBases = applyMegaBaseStab(allPokes, moves, {
            moveInsertChance: config.mutationProbs && config.mutationProbs.moveInsertChance,
            moveRatingDeviation: config.mutationProbs && config.mutationProbs.moveRatingDeviation,
        });
        for (const base of megaStabbedBases) {
            base.baseBST = base.baseHP + base.baseAttack + base.baseDefense + base.baseSpAttack + base.baseSpDefense + base.baseSpeed;
            base.rating = ratePokemon(base, moves, abilities, tmPool);
        }
    }

    // 10. Best-evo / mega-evo ratings
    allPokes.forEach(poke => {
        let bestEvo = poke.id;
        let bestEvoRating = poke.rating.absoluteRating;
        let bestEvoTier   = poke.rating.tier;
        (poke.evoTree || []).forEach(evoStage => {
            const candidates = Array.isArray(evoStage) ? evoStage : [evoStage];
            candidates.forEach(evo => {
                const evoPoke = allPokes.find(p => p.id === evo);
                if (evoPoke && evoPoke.rating.absoluteRating > bestEvoRating) {
                    bestEvo = evoPoke.id; bestEvoRating = evoPoke.rating.absoluteRating; bestEvoTier = evoPoke.rating.tier;
                }
            });
        });
        poke.rating.bestEvo       = bestEvo;
        poke.rating.bestEvoRating = bestEvoRating;
        poke.rating.bestEvoTier   = bestEvoTier;
        if (megaEvoTree[poke.family] && !poke.evolutionData.isMega) {
            poke.evolutionData.megaEvos = megaEvoTree[poke.family];
        }
        if (poke.evolutionData.megaEvos && poke.evolutionData.megaEvos.length) {
            let bestMegaEvo = poke.evolutionData.megaEvos[0];
            let bestMegaEvoRating = 0;
            let bestMegaEvoTier = 'PU';
            poke.evolutionData.megaEvos.forEach(megaEvoId => {
                const megaEvoPoke = allPokes.find(p => p.id === megaEvoId);
                if (megaEvoPoke && megaEvoPoke.rating.absoluteRating > bestMegaEvoRating) {
                    bestMegaEvo = megaEvoPoke.id; bestMegaEvoRating = megaEvoPoke.rating.absoluteRating; bestMegaEvoTier = megaEvoPoke.rating.tier;
                }
            });
            if (bestMegaEvoRating > bestEvoRating) {
                bestEvo = bestMegaEvo; bestEvoRating = bestMegaEvoRating; bestEvoTier = bestMegaEvoTier;
            }
            poke.rating.megaEvo       = bestMegaEvo;
            poke.rating.megaEvoRating = bestMegaEvoRating;
            poke.rating.megaEvoTier   = bestMegaEvoTier;
        }
    });

    // Megas can only reach LEGEND if their base form is LEGEND or higher (AG).
    // Using TIER_SEQ comparison: base-form-AG megas (e.g. Mega Rayquaza) are allowed through,
    // since their base form is objectively stronger than LEGEND. Base-form-UBERS megas are capped.
    for (const poke of allPokes) {
        if (poke.evolutionData.isMega && poke.rating.tier === TIER_LEGEND) {
            const baseForm = allPokes.find(p => p.id === poke.evolutionData.megaBaseForm);
            if (!baseForm || TIER_SEQ.indexOf(baseForm.rating.tier) < TIER_SEQ.indexOf(TIER_LEGEND)) {
                poke.rating.tier = TIER_UBERS;
                poke.rating.absoluteRating = TIER_LEGEND_THRESHOLD - 0.01;
            }
        }
    }

    // Rayquaza special case
    const rayquaza = allPokes.find(p => p.id === 'SPECIES_RAYQUAZA');
    const rayquazaMega = allPokes.find(p => p.id === 'SPECIES_RAYQUAZA_MEGA');
    if (rayquaza && rayquazaMega) rayquaza.rating = { ...rayquazaMega.rating };

    // 11. Contextual ratings
    for (const poke of allPokes) {
        poke.contextualRatings = {};
        for (const cap of LEVEL_CAPS) {
            // Wishiwashi Solo: below lvl 20 it's the weak Solo form; at 20+ it schools.
            // Palafin Zero: rated as Hero at every level (no level gate — the transform is free).
            let ctxPoke = poke;
            if (poke.id === WISHIWASHI_SOLO_ID && wishiSchool) {
                ctxPoke = wishiwashiEffectivePoke(poke, wishiSchool, cap);
            } else if (poke.id === PALAFIN_ZERO_ID && palafinHero) {
                ctxPoke = palafinEffectivePoke(poke, palafinHero);
            }
            poke.contextualRatings[cap] = rateContextual(ctxPoke, moves, abilities, { level: cap, tms: [] });
        }
    }

    // Write final JSON caches (Node-only)
    if (nodeMode) {
        await fs.writeFile(path.resolve(__dirname, '..', 'evoTree.json'), JSON.stringify(evoTree, null, 2), 'utf-8');
        await fs.writeFile(path.resolve(__dirname, '..', 'pokes.json'),   JSON.stringify(allPokes, null, 2), 'utf-8');
    }

    return {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        seed: config.seed,
        difficulty: config.difficulty,
        rebalance: config.rebalance,
        pokes: allPokes,
        moves,
        abilities,
        items: items || {},
        evoTree,
        tmList,
        tmPool,
    };
}

module.exports = { runPokedexModule, parseBaseData };
