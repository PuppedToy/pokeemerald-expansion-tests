'use strict';

const { TIER_SEQ } = require('../constants');

/**
 * Tries a definition against chooseFn, automatically tiering down through the tier sequence
 * when the primary definition yields no result, then walking any explicit fallback entries.
 *
 * Single-tier defs (contextualTier.length === 1) get automatic tier-down.
 * Multi-tier defs skip auto-tier-down and fall through directly to explicit fallback.
 * maxTierDownSteps caps how many auto-tier-down steps are attempted (default: unlimited).
 *
 * @param {object} definition - POKEDEF-style object
 * @param {function} chooseFn - (def) => pokemon|null
 * @returns {object|null} chosen pokemon, or null if nothing found
 */
function selectWithAutoFallback(definition, chooseFn) {
    // 1. Try primary
    let result = chooseFn(definition);
    if (result) return result;

    // 2. Auto-tier-down — only for single-tier defs
    if (definition.contextualTier && definition.contextualTier.length === 1) {
        const startIdx = TIER_SEQ.indexOf(definition.contextualTier[0]);
        const maxSteps = definition.maxTierDownSteps != null ? definition.maxTierDownSteps : Infinity;
        let stepsDown = 0;
        for (let i = startIdx - 1; i >= 0 && stepsDown < maxSteps; i--, stepsDown++) {
            const tierDownDef = Object.assign({}, definition, {
                contextualTier: [TIER_SEQ[i]],
                maxTierDownSteps: undefined,
            });
            result = chooseFn(tierDownDef);
            if (result) return result;
        }
    }

    // 3. Walk explicit fallback array — each entry also gets auto-tier-down recursively
    const fallbacks = definition.fallback;
    if (fallbacks && fallbacks.length > 0) {
        for (const fb of fallbacks) {
            result = selectWithAutoFallback(fb, chooseFn);
            if (result) return result;
        }
    }

    // 4. Hard break — nothing found
    return null;
}

module.exports = { selectWithAutoFallback };
