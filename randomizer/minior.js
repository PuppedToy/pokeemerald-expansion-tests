'use strict';

// T-155 — Minior tier blend.
//
// Only the Meteor form is placed. Shields Down keeps Minior in the bulky, status-immune Meteor shell
// (Def/SpD 100, no offense) while HP >= 50%, then flips it to the Core glass-cannon (Atk/SpA 100,
// Speed 120) below 50%. Because a placed Minior effectively battles as both — a defensive/status-immune
// setup turn followed by the Core sweeper payoff — its rating is a weighted blend of the two forms
// (owner choice, mirroring Meloetta). The Core form is parsed (so its stats are available here) but
// banned from picking (see BANNED_SPECIES_FOR_PICKING). Blends BOTH the absolute rating/tier and the
// per-level contextual ratings the teambuilder scores on, so trainers actually field it as a threat.

const { tierFromRating } = require('./rating');
const {
    MINIOR_METEOR_ID,
    MINIOR_CORE_ID,
    MINIOR_METEOR_WEIGHT,
    MINIOR_CORE_WEIGHT,
} = require('./constants');

/**
 * Blend Minior-Meteor's absolute rating/tier with Minior-Core's (weights from constants) in place.
 * Runs after the base rating pass (both forms rated) and before best-evo. No-op (returns null) if
 * either form or its rating is missing. Returns the Meteor poke when applied.
 */
function applyMiniorTierBlend(allPokes) {
    const meteor = allPokes.find(p => p.id === MINIOR_METEOR_ID);
    const core = allPokes.find(p => p.id === MINIOR_CORE_ID);
    if (!meteor || !core || !meteor.rating || !core.rating) return null;

    const blended = MINIOR_METEOR_WEIGHT * meteor.rating.absoluteRating
                  + MINIOR_CORE_WEIGHT * core.rating.absoluteRating;

    meteor.rating.absoluteRating = blended;
    // Minior is not a stone mega → the standard (non-mega) AG threshold applies.
    meteor.rating.tier = tierFromRating(blended, { isStoneMega: false });
    return meteor;
}

/**
 * Blend Minior-Meteor's per-cap contextual ratings (singles and doubles) with Minior-Core's, in place.
 * Runs after the contextual pass has rated both forms at every cap. The teambuilder scores candidates
 * on contextualRatings[cap].absoluteRating, so this is what makes trainers value the Core payoff at
 * each level. No-op (returns null) if either form is missing. Returns the Meteor poke when applied.
 */
function applyMiniorContextualBlend(allPokes, levelCaps) {
    const meteor = allPokes.find(p => p.id === MINIOR_METEOR_ID);
    const core = allPokes.find(p => p.id === MINIOR_CORE_ID);
    if (!meteor || !core) return null;

    const blendField = (mObj, cObj) => {
        if (mObj && cObj
            && typeof mObj.absoluteRating === 'number'
            && typeof cObj.absoluteRating === 'number') {
            mObj.absoluteRating = MINIOR_METEOR_WEIGHT * mObj.absoluteRating
                                + MINIOR_CORE_WEIGHT * cObj.absoluteRating;
        }
    };

    for (const cap of levelCaps) {
        blendField(meteor.contextualRatings?.[cap], core.contextualRatings?.[cap]);
        blendField(meteor.contextualRatingsDoubles?.[cap], core.contextualRatingsDoubles?.[cap]);
    }
    return meteor;
}

module.exports = { applyMiniorTierBlend, applyMiniorContextualBlend };
