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

    const eligiblePokemonForStarters = pokemonList.filter(eligibleFilter);

    // True when any of x's types is super-effective against y (i.e. "x beats y").
    const beats = (x, y) => x.parsedTypes.some(type => isSuperEffective(type, y.parsedTypes));

    // Exhaustive search (T-032): enumerate EVERY valid type triangle (a beats b, b beats c, c beats a)
    // in the eligible pool, then pick one at random. The previous greedy version committed to a single
    // random `starters[1]` and discarded `starters[0]` on a dead end, so it could exhaust the pool and
    // hit the fallback even when a triangle existed (~14% of seeds — B-007). Enumerating first means a
    // triangle is found whenever one exists, and the random pick stays unbiased across all of them.
    const triangles = [];
    for (const a of eligiblePokemonForStarters) {
        for (const b of eligiblePokemonForStarters) {
            if (b.id === a.id || !beats(a, b)) continue;
            for (const c of eligiblePokemonForStarters) {
                if (c.id === a.id || c.id === b.id) continue;
                if (beats(b, c) && beats(c, a)) triangles.push([a, b, c]);
            }
        }
    }

    const alreadyChosenFamilySet = new Set();

    if (triangles.length === 0) {
        // Fallback: the pool genuinely admits no triangle — pick any 3 eligible without type constraints.
        console.error('Failed to find valid starter Pokémon. Going through fallback method.');
        const fallbackPool = pokemonList.filter(eligibleFilter);
        const starters = [null, null, null];
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

    const chosen = sample(triangles); // uniform among all valid triangles; deterministic per seed
    chosen.forEach(starter => alreadyChosenFamilySet.add(getFamilyGroup(starter.family)));

    return {
        starters: chosen.map(s => s.id),
        alreadyChosenFamilies: [...alreadyChosenFamilySet],
    };
}

module.exports = { runStartersModule };
