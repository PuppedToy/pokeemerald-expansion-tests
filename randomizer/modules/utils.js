'use strict';

const rng = require('../rng');
const {
    TIER_PU,
    TIER_ZU,
    TIER_MAGIKARP,
    EVO_TYPE_SOLO,
    NATURE_STRATEGY_MIN_LEVEL,
    ABILITY_STRATEGY_MIN_LEVEL,
} = require('../constants');
const { activeDiagnostics, DIAGNOSTIC_CODES } = require('../diagnostics');

// T-063 — cosmetic multi-form suffixes. A family named `P_FAMILY_<BASE>_<SUFFIX>` whose suffix is
// one of these is a size/seasonal/sea/antique variant of `P_FAMILY_<BASE>` and must collapse to it,
// so the "one obtainable per family per run" dedup treats all its forms as one. Deliberately a
// curated SUBSET of POKE_FORMS: regional forms (ALOLA/GALAR/HISUI/PALDEA) and functional forms
// (OWN_TEMPO/ROAMING/ARTISAN) are genuinely distinct Pokémon and stay their own families.
const COSMETIC_FORM_SUFFIXES = ['EAST', 'SUMMER', 'AUTUMN', 'WINTER', 'SMALL', 'LARGE', 'SUPER', 'ANTIQUE'];

// Explicit overrides (win over the suffix strip) for any family that can't be derived by stripping.
const groupedFamilies = {};

function getFamilyGroup(familyId) {
    if (groupedFamilies[familyId]) return groupedFamilies[familyId];
    for (const suffix of COSMETIC_FORM_SUFFIXES) {
        if (familyId.endsWith('_' + suffix)) return familyId.slice(0, -(suffix.length + 1));
    }
    return familyId;
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

const invalidMegas = ['SPECIES_FROSLASS', 'SPECIES_KLEAVOR'];
function hasValidMega(poke) {
    return poke.evolutionData.megaEvos
        && poke.evolutionData.megaEvos.length > 0
        && !invalidMegas.includes(poke.id);
}

function devolveToBase(pokemonList, pokemon) {
    if (
        pokemon.evolutionData.type === EVO_TYPE_SOLO
        || pokemon.evolutionData.isLC
        || !pokemon.evoTree?.length
    ) {
        return pokemon;
    }
    if (pokemon.evolutionData.megaBaseForm) {
        return devolveToBase(pokemonList, pokemonList.find(p => p.id === pokemon.evolutionData.megaBaseForm));
    }
    const baseForm = pokemon.evoTree[0];
    return pokemonList.find(p => p.id === baseForm);
}

function isValidEvolution(level, { param, method }) {
    return (!isNaN(parseInt(param)) && parseInt(param) <= level && parseInt(param) > 4)
        || ((method === 'ITEM' || param === '0') && level > 28);
}

function checkValidEvo(pokemonList, evaluatedPokemon, level, trainer) {
    let devolvedForm = evaluatedPokemon;
    if (devolvedForm.evolutionData.megaBaseForm) {
        devolvedForm = pokemonList.find(p => p.id === devolvedForm.evolutionData.megaBaseForm);
    }
    if (devolvedForm.evolutionData.type === EVO_TYPE_SOLO || devolvedForm.evolutionData.isLC) {
        return true;
    }
    if (!devolvedForm) {
        if (trainer) {
            activeDiagnostics().warn(
                DIAGNOSTIC_CODES.MEGA_NO_BASE_FORM,
                `Could not find base form for mega pokemon ${evaluatedPokemon.id} when checking valid evolutions`,
                { pokemon: evaluatedPokemon.id, trainerId: trainer.id },
            );
        }
        return false;
    }
    const filterMethod = p => {
        const evolutions = (p.evolutions || []).filter(e => e.pokemon === devolvedForm.id);
        if (!evolutions.length) return false;
        return evolutions.some(evo => isValidEvolution(level, evo));
    };
    let pokemonThatEvolveToThis = pokemonList.filter(filterMethod);
    if (pokemonThatEvolveToThis.length > 1
        && devolvedForm.id !== 'SPECIES_GHOLDENGO'
        && !devolvedForm.id.includes('SPECIES_LYCANROC')) {
        if (trainer) {
            activeDiagnostics().warn(
                DIAGNOSTIC_CODES.MULTIPLE_PRE_EVOLUTIONS,
                `Multiple pre-evolutions found for ${devolvedForm.id}`,
                {
                    pokemon: devolvedForm.id,
                    trainerId: trainer?.id,
                    preEvolutions: pokemonThatEvolveToThis.map(p => p.id),
                },
            );
        }
    }
    if (pokemonThatEvolveToThis.length === 0) {
        return false;
    }
    if (pokemonThatEvolveToThis[0].evolutionData.isLC) {
        return true;
    }
    devolvedForm = pokemonThatEvolveToThis[0];
    pokemonThatEvolveToThis = pokemonList.filter(filterMethod);
    return pokemonThatEvolveToThis.length > 0;
}

// T-057: whether a trainer of this level picks a strategic nature (true) or a random one (false).
function usesStrategicNature(level) {
    return level >= NATURE_STRATEGY_MIN_LEVEL;
}

// T-057: whether a trainer of this level picks a strategic ability (true) or a random one (false).
function usesStrategicAbility(level) {
    return level >= ABILITY_STRATEGY_MIN_LEVEL;
}

function canLearnMove(pokemon, moveToLearn, trainerLevel) {
    return (
        (pokemon.teachables && pokemon.teachables.includes(moveToLearn)) ||
        (pokemon.learnset && pokemon.learnset.some(lu => lu.move === moveToLearn && lu.level <= trainerLevel))
    );
}

module.exports = {
    getFamilyGroup,
    isSubWeakTier,
    sample,
    sampleAndRemove,
    hasValidMega,
    devolveToBase,
    checkValidEvo,
    canLearnMove,
    usesStrategicNature,
    usesStrategicAbility,
};
