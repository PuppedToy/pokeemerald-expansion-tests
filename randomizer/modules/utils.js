'use strict';

const rng = require('../rng');
const {
    TIER_PU,
    TIER_ZU,
    TIER_MAGIKARP,
    EVO_TYPE_SOLO,
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
            console.warn(`WARN: Could not find base form for mega pokemon ${evaluatedPokemon.id} when checking valid evolutions for trainer ${trainer.id}.`);
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
            console.warn(`WARN: Multiple pre-evolutions found for ${devolvedForm.id} in trainer ${trainer?.id}: ${pokemonThatEvolveToThis.map(p => p.id).join(', ')}.`);
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
};
