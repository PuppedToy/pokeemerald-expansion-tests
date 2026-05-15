'use strict';

const { isSuperEffective } = require('../rating');
const {
    EVO_TYPE_LC_OF_3,
    TIER_UU,
} = require('../constants');
const { getFamilyGroup, isSubWeakTier, sample, sampleAndRemove } = require('./utils');

/**
 * Selects 3 starter Pokémon that form a type triangle.
 *
 * @param {Object[]} pokemonList - Rated pokémon list (already filtered for banned species).
 * @returns {{ starters: string[], alreadyChosenFamilies: string[] }}
 *   starters: array of 3 species ID strings
 *   alreadyChosenFamilies: family IDs already claimed by starters (for wild/rewards modules)
 */
function runStartersModule(pokemonList) {
    const eligibleFilter = poke =>
        poke.evolutionData.type === EVO_TYPE_LC_OF_3
        && poke.evolutionData.isLC
        && poke.rating.bestEvoTier === TIER_UU
        && isSubWeakTier(poke.rating.tier);

    let eligiblePokemonForStarters = pokemonList.filter(eligibleFilter);

    const starters = [null, null, null];

    while (eligiblePokemonForStarters.length > 0 && (starters[0] === null || starters[1] === null || starters[2] === null)) {
        starters[0] = sampleAndRemove(eligiblePokemonForStarters);

        const starters0Types = starters[0].parsedTypes;
        const weakToStarters0Types = eligiblePokemonForStarters.filter(poke => {
            if (poke.id === starters[0].id) return false;
            return starters0Types.some(type => isSuperEffective(type, poke.parsedTypes));
        });

        if (weakToStarters0Types.length === 0) {
            starters[0] = null;
            continue;
        }
        starters[1] = sample(weakToStarters0Types);

        const starters1Types = starters[1].parsedTypes;
        const weakToStarters1TypesAndStrongToStarters0 = eligiblePokemonForStarters.filter(poke => {
            if (poke.id === starters[1].id) return false;
            return starters1Types.some(type => isSuperEffective(type, poke.parsedTypes))
                && poke.parsedTypes.some(type => isSuperEffective(type, starters[0].parsedTypes))
                && poke.id !== starters[0].id
                && poke.id !== starters[1].id;
        });

        if (weakToStarters1TypesAndStrongToStarters0.length === 0) {
            starters[0] = null;
            starters[1] = null;
            continue;
        }
        starters[2] = sample(weakToStarters1TypesAndStrongToStarters0);
    }

    const alreadyChosenFamilySet = new Set();

    if (starters[0] === null || starters[1] === null || starters[2] === null) {
        // Fallback: no type triangle found — pick any 3 eligible without type constraints.
        console.error('Failed to find valid starter Pokémon. Going through fallback method.');
        const fallbackPool = pokemonList.filter(eligibleFilter);
        for (let i = 0; i < 3; i++) {
            const picked = sampleAndRemove(fallbackPool);
            starters[i] = picked;
            if (picked) alreadyChosenFamilySet.add(getFamilyGroup(picked.family));
        }
        return {
            starters: starters.map(s => s ? s.id : null),
            alreadyChosenFamilies: [...alreadyChosenFamilySet],
        };
    }

    starters.forEach((starter, index) => {
        starters[index] = starter.id;
        alreadyChosenFamilySet.add(getFamilyGroup(starter.family));
    });

    return {
        starters,
        alreadyChosenFamilies: [...alreadyChosenFamilySet],
    };
}

module.exports = { runStartersModule };
