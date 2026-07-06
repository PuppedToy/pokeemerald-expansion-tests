'use strict';

// T-064 — Meloetta tier blend.
//
// Meloetta can switch between Aria (base, placeable) and Pirouette (battle-only, banned from
// picking) mid-battle via Relic Song. Because a placed Meloetta effectively has access to both
// forms, its tier should reflect a weighted average of the two forms' ratings rather than Aria's
// alone. This runs after the base rating pass (both forms rated) and before the best-evo pass, so
// bestEvo/megaEvo ratings pick up Aria's blended value automatically.

const { tierFromRating } = require('./rating');
const {
    MELOETTA_ARIA_ID,
    MELOETTA_PIROUETTE_ID,
    MELOETTA_ARIA_WEIGHT,
    MELOETTA_PIROUETTE_WEIGHT,
} = require('./constants');

/**
 * Blend Meloetta-Aria's rating/tier with Meloetta-Pirouette's (weights from constants) in place.
 * No-op (returns null) if either form or its rating is missing. Returns the Aria poke when applied.
 */
function applyMeloettaTierBlend(allPokes) {
    const aria = allPokes.find(p => p.id === MELOETTA_ARIA_ID);
    const pirouette = allPokes.find(p => p.id === MELOETTA_PIROUETTE_ID);
    if (!aria || !pirouette || !aria.rating || !pirouette.rating) return null;

    const blended = MELOETTA_ARIA_WEIGHT * aria.rating.absoluteRating
                  + MELOETTA_PIROUETTE_WEIGHT * pirouette.rating.absoluteRating;

    aria.rating.absoluteRating = blended;
    // Meloetta is not a stone mega → the standard (non-mega) AG threshold applies.
    aria.rating.tier = tierFromRating(blended, { isStoneMega: false });
    return aria;
}

module.exports = { applyMeloettaTierBlend };
