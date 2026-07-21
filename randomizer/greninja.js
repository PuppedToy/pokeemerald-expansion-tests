'use strict';

// T-185 — Greninja Battle Bond tier blend.
//
// Only the Battle Bond form is placed (as a SOLO). Its Battle Bond ability KO-transforms it into the
// battle-only, non-obtainable Ash-Greninja (banned from picking — see BANNED_SPECIES_FOR_PICKING).
// Because a placed Battle Bond effectively battles as Ash for the rest of the fight after its first KO,
// its rating is a weighted blend of the two forms (owner: 0.70 Ash / 0.30 Battle Bond — the 0.30
// discounts the turns spent before the transform triggers). Mirrors Minior/Meloetta: blends BOTH the
// absolute rating/tier and the per-level contextual ratings the teambuilder scores on, so trainers
// actually field it as the threat it becomes. (The moveset/item/nature itself is built from Ash's
// stats via greninjaEffectivePoke in resolveTrainerTeam — Palafin-style — a separate concern.)

const { tierFromRating } = require('./rating');
const {
    GRENINJA_BOND_ID,
    GRENINJA_ASH_ID,
    GRENINJA_ASH_WEIGHT,
    GRENINJA_BOND_WEIGHT,
} = require('./constants');

/**
 * Blend Battle Bond's absolute rating/tier with Ash's (weights from constants) in place.
 * Runs after the base rating pass (both forms rated) and before best-evo. No-op (returns null) if
 * either form or its rating is missing. Returns the Battle Bond poke when applied.
 */
function applyGreninjaTierBlend(allPokes) {
    const bond = allPokes.find(p => p.id === GRENINJA_BOND_ID);
    const ash = allPokes.find(p => p.id === GRENINJA_ASH_ID);
    if (!bond || !ash || !bond.rating || !ash.rating) return null;

    const blended = GRENINJA_ASH_WEIGHT * ash.rating.absoluteRating
                  + GRENINJA_BOND_WEIGHT * bond.rating.absoluteRating;

    bond.rating.absoluteRating = blended;
    // Battle Bond is not a stone mega → the standard (non-mega) AG threshold applies.
    bond.rating.tier = tierFromRating(blended, { isStoneMega: false });
    return bond;
}

/**
 * Blend Battle Bond's per-cap contextual ratings (singles and doubles) with Ash's, in place.
 * Runs after the contextual pass has rated both forms at every cap. The teambuilder scores candidates
 * on contextualRatings[cap].absoluteRating, so this is what makes trainers value the Ash payoff at
 * each level. No-op (returns null) if either form is missing. Returns the Battle Bond poke when applied.
 */
function applyGreninjaContextualBlend(allPokes, levelCaps) {
    const bond = allPokes.find(p => p.id === GRENINJA_BOND_ID);
    const ash = allPokes.find(p => p.id === GRENINJA_ASH_ID);
    if (!bond || !ash) return null;

    const blendField = (bObj, aObj) => {
        if (bObj && aObj
            && typeof bObj.absoluteRating === 'number'
            && typeof aObj.absoluteRating === 'number') {
            bObj.absoluteRating = GRENINJA_ASH_WEIGHT * aObj.absoluteRating
                                + GRENINJA_BOND_WEIGHT * bObj.absoluteRating;
        }
    };

    for (const cap of levelCaps) {
        blendField(bond.contextualRatings?.[cap], ash.contextualRatings?.[cap]);
        blendField(bond.contextualRatingsDoubles?.[cap], ash.contextualRatingsDoubles?.[cap]);
    }
    return bond;
}

module.exports = { applyGreninjaTierBlend, applyGreninjaContextualBlend };
