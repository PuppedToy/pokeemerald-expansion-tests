'use strict';

const rng = require('../rng');
const {
    EVO_TYPE_LC_OF_3,
    EVO_TYPE_LC,
    EVO_TYPE_NFE,
    EVO_TYPE_SOLO,
    EVO_TYPE_FINAL,
    TIER_UU,
    TIER_OU,
    TIER_RU,
    TIER_NU,
    TIER_PU,
    TIER_ZU,
    TIER_MAGIKARP,
    TIER_UBERS,
    TIER_RU_THRESHOLD,
} = require('../constants');

const groupedFamilies = {
    'P_FAMILY_DEERLING_SUMMER': 'P_FAMILY_DEERLING',
    'P_FAMILY_DEERLING_AUTUMN': 'P_FAMILY_DEERLING',
    'P_FAMILY_DEERLING_WINTER': 'P_FAMILY_DEERLING',
};

function getFamilyGroup(familyId) {
    return groupedFamilies[familyId] || familyId;
}

function isSubWeakTier(tier) {
    return tier === TIER_PU || tier === TIER_ZU || tier === TIER_MAGIKARP;
}

function sample(array) {
    if (array.length === 0) return null;
    return array[Math.floor(rng.random() * array.length)];
}

function sampleAndRemove(array) {
    if (array.length === 0) return null;
    const index = Math.floor(rng.random() * array.length);
    const element = array[index];
    array.splice(index, 1);
    return element;
}

function hasValidMega(poke) {
    const invalidMegas = ['SPECIES_FROSLASS', 'SPECIES_KLEAVOR'];
    return poke.evolutionData.megaEvos
        && poke.evolutionData.megaEvos.length > 0
        && !invalidMegas.includes(poke.id);
}

/**
 * Picks extra starters, pokemon rewards (gym/legend), and wild encounter replacements.
 *
 * @param {Object[]} pokemonList   - Rated pokémon list (already filtered for banned species).
 * @param {Object}   startersArtifact - { starters, alreadyChosenFamilies } from runStartersModule.
 * @param {Object}   [wildConfig]  - Wild data (replacements, replacementTypes, maps).
 *                                   Defaults to require('../wild'). Pass a mock in tests.
 * @returns {{ extraStarters, replacementLog, foundMegaEvos }}
 */
function runWildModule(pokemonList, startersArtifact, wildConfig) {
    if (!wildConfig) {
        wildConfig = require('../wild');
    }

    const alreadyChosenFamilySet = new Set(
        (startersArtifact.alreadyChosenFamilies || []).map(f => getFamilyGroup(f))
    );
    const foundMegaEvos = [];

    const addToFoundMegaEvosIfHasMegaEvo = (poke, levelFound = 0) => {
        if (
            hasValidMega(poke)
            && poke.rating.megaEvoTier !== 'UBERS'
            && foundMegaEvos.every(m => m.family !== poke.family)
        ) {
            (poke.evolutionData.megaEvos || []).forEach(megaEvoId => {
                const megaForm = pokemonList.find(p => p.id === megaEvoId);
                if (!megaForm) return;
                const baseForm = pokemonList.find(p => p.id === megaForm.evolutionData.megaBaseForm);
                if (!baseForm) return;
                const pokeThatEvolvesToBase = pokemonList.filter(p =>
                    (p.evolutions || []).some(e => e.pokemon === baseForm.id)
                )[0];
                const evolveLevel = (pokeThatEvolvesToBase && pokeThatEvolvesToBase.evolutions)
                    ? (pokeThatEvolvesToBase.evolutions.find(e => e.pokemon === baseForm.id)?.param || 25)
                    : 0;
                foundMegaEvos.push({
                    family: poke.family,
                    megaFormId: megaForm.id,
                    baseFormId: baseForm.id,
                    item: megaForm.evolutionData.megaItem,
                    level: Math.max(levelFound, Number(evolveLevel)),
                });
            });
        }
    };

    // ── Extra starters ──────────────────────────────────────────────────────────

    // Slot 1: 1 OU LC-of-3, fallback to any OU LC
    let ouLCPokes = pokemonList.filter(poke =>
        poke.evolutionData.type === EVO_TYPE_LC_OF_3
        && poke.evolutionData.isLC
        && poke.rating.bestEvoTier === TIER_OU
        && isSubWeakTier(poke.rating.tier)
        && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
    );
    if (ouLCPokes.length === 0) {
        ouLCPokes = pokemonList.filter(poke =>
            poke.evolutionData.isLC
            && poke.rating.bestEvoTier === TIER_OU
            && isSubWeakTier(poke.rating.tier)
            && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
        );
    }
    if (ouLCPokes.length === 0) {
        throw new Error('No OU LC pokemon found for extra starters.');
    }

    const alreadyChosenTypes = new Set();
    const chosenExtraPokemon = [sample(ouLCPokes)];
    alreadyChosenFamilySet.add(getFamilyGroup(chosenExtraPokemon[0].family));
    chosenExtraPokemon[0].parsedTypes.forEach(t => alreadyChosenTypes.add(t));
    addToFoundMegaEvosIfHasMegaEvo(chosenExtraPokemon[0]);

    // Slot 2: 1 UU LC (prefer type-diverse pick)
    const uuLCPokes = pokemonList.filter(poke =>
        poke.evolutionData.isLC
        && poke.rating.bestEvoTier === TIER_UU
        && isSubWeakTier(poke.rating.tier)
        && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
    );
    const uuLCFiltered = uuLCPokes.filter(p =>
        ![...alreadyChosenTypes].some(t => p.parsedTypes.includes(t))
    );
    const uuPool = uuLCFiltered.length > 0 ? uuLCFiltered : uuLCPokes;
    if (uuPool.length > 0) {
        const pick = sample(uuPool);
        chosenExtraPokemon.push(pick);
        alreadyChosenFamilySet.add(getFamilyGroup(pick.family));
        pick.parsedTypes.forEach(t => alreadyChosenTypes.add(t));
        addToFoundMegaEvosIfHasMegaEvo(pick);
    }

    // Slot 3: 1 NU SOLO (earlyGame)
    const earlyGame = pokemonList.filter(poke =>
        poke.evolutionData.type === EVO_TYPE_SOLO
        && poke.rating.bestEvoRating <= TIER_RU_THRESHOLD
        && poke.rating.tier === TIER_NU
        && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
    );
    const earlyGameFiltered = earlyGame.filter(p =>
        ![...alreadyChosenTypes].some(t => p.parsedTypes.includes(t))
    );
    if (earlyGameFiltered.length > 0) {
        const pick = sampleAndRemove(earlyGameFiltered);
        chosenExtraPokemon.push(pick);
        alreadyChosenFamilySet.add(getFamilyGroup(pick.family));
        pick.parsedTypes.forEach(t => alreadyChosenTypes.add(t));
        addToFoundMegaEvosIfHasMegaEvo(pick);
    }

    // Slots 4-9: up to 6 RU LC (type-diverse first, then unrestricted)
    const ruLC = pokemonList.filter(poke =>
        poke.evolutionData.isLC
        && poke.rating.bestEvoTier === TIER_RU
        && isSubWeakTier(poke.rating.tier)
        && !alreadyChosenFamilySet.has(getFamilyGroup(poke.family))
    );
    const ruLCFiltered = ruLC.filter(p =>
        ![...alreadyChosenTypes].some(t => p.parsedTypes.includes(t))
    );
    while (chosenExtraPokemon.length < 9 && ruLCFiltered.length > 0) {
        const pick = sampleAndRemove(ruLCFiltered);
        const idxInBase = ruLC.findIndex(p => p.id === pick.id);
        if (idxInBase >= 0) ruLC.splice(idxInBase, 1);
        chosenExtraPokemon.push(pick);
        alreadyChosenFamilySet.add(getFamilyGroup(pick.family));
        pick.parsedTypes.forEach(t => alreadyChosenTypes.add(t));
        for (let i = ruLCFiltered.length - 1; i >= 0; i--) {
            if ([...alreadyChosenTypes].some(t => ruLCFiltered[i].parsedTypes.includes(t))) {
                ruLCFiltered.splice(i, 1);
            }
        }
        addToFoundMegaEvosIfHasMegaEvo(pick);
    }
    while (chosenExtraPokemon.length < 9 && ruLC.length > 0) {
        const pick = sampleAndRemove(ruLC);
        chosenExtraPokemon.push(pick);
        alreadyChosenFamilySet.add(getFamilyGroup(pick.family));
        addToFoundMegaEvosIfHasMegaEvo(pick);
    }

    const extraStarters = chosenExtraPokemon.map(p => p.id);

    // ── Wild encounter replacements ──────────────────────────────────────────────

    const replacementLog = {};
    const { replacements = {}, replacementTypes = {} } = wildConfig;

    const replacementLists = {};
    Object.entries(replacementTypes).forEach(([key, value]) => {
        const { replace: tiers, type: types, hasMega, megaTiers } = value;
        replacementLists[key] = pokemonList.filter(poke => {
            if (poke.evolutionData.isMega) return false;
            if (alreadyChosenFamilySet.has(getFamilyGroup(poke.family))) return false;
            if (tiers && !tiers.includes(poke.rating.bestEvoTier)) return false;
            if (megaTiers && !megaTiers.includes(poke.rating.megaEvoTier)) return false;
            if (hasMega && !poke.evolutionData.megaEvos?.length) return false;
            let hasAnyType = false;
            (types || []).forEach(replacementType => {
                if (replacementType === EVO_TYPE_LC)    hasAnyType = hasAnyType || poke.evolutionData.isLC;
                else if (replacementType === EVO_TYPE_NFE)  hasAnyType = hasAnyType || poke.evolutionData.isNFE;
                else if (replacementType === EVO_TYPE_SOLO) hasAnyType = hasAnyType || poke.evolutionData.type === EVO_TYPE_SOLO;
                else if (replacementType === EVO_TYPE_FINAL)hasAnyType = hasAnyType || poke.evolutionData.isFinal;
            });
            return hasAnyType;
        });
    });

    const newlyAddedFamilies = new Set();

    Object.entries(replacements).forEach(([speciesId, replacementTypeKey]) => {
        const list = replacementLists[replacementTypeKey];
        if (!list || list.length === 0) return;
        for (let i = list.length - 1; i >= 0; i--) {
            if (newlyAddedFamilies.has(list[i].family)) list.splice(i, 1);
        }
        if (list.length === 0) return;
        const replacement = sampleAndRemove(list);
        if (!replacement) return;
        alreadyChosenFamilySet.add(getFamilyGroup(replacement.family));
        newlyAddedFamilies.add(replacement.family);
        addToFoundMegaEvosIfHasMegaEvo(replacement);
        replacementLog[speciesId] = replacement.id;
    });

    return { extraStarters, replacementLog, foundMegaEvos };
}

module.exports = { runWildModule };
