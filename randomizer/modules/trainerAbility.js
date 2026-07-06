'use strict';

// T-065 — single source of truth for a trainer Pokémon's ability pick.
//
// This was duplicated in writer.js and writerDocs.js, and the two had silently diverged:
// writerDocs (the LIVE resolver for bundle ROM builds) intersected the chosen mon's abilities with
// the PRIMARY poke-definition's abilities instead of the EFFECTIVE definition that actually selected
// the mon. For a weather-setter slot whose primary requires the setter ability (e.g. ['DRIZZLE'])
// and whose fallback is a rain abuser (Swift Swim/Rain Dish/…), the fallback mon never has DRIZZLE,
// so the intersection was empty and the code fell through to the generic "best ability by rating"
// branch — handing a rain mon Intimidate instead of Swift Swim. Keying off effectiveDef.abilities
// (which the selector already filtered the mon on) guarantees a matching weather ability. This
// covers rain/sun/sand/snow uniformly since they all share the same fallback mechanism.

const rng = require('../rng');
const { sample, usesStrategicAbility } = require('./utils');
const { GENERIC_DEVIATION } = require('../constants');

/**
 * Pick the ability a trainer's Pokémon should run, and map it back to the base form's ability slot.
 *
 * @param {Object} p
 * @param {Object} p.chosenTrainerMon  the (possibly evolved/mega) mon actually placed; has parsedAbilities.
 * @param {Object} p.baseFormMon       the base form written to the party; the returned ability is one of ITS slots.
 * @param {string[]} [p.trainerAbilities]  team-theme abilities (trainer.abilities), if any.
 * @param {Object|null} p.effectiveDef  the poke-definition that selected the mon (primary OR its fallback).
 *                                       Its `abilities` (when present) are the legal picks for this slot.
 * @param {number} p.level             trainer level (gates strategic vs random pick).
 * @param {Object} p.abilities         ability DB ({ ABILITY_X: { rating } }).
 * @returns {{ability: string, originalAbility: string}} `ability` is the pick on the chosen (possibly
 *   evolved/mega) mon — used downstream for moveset/nature/item/mega rating; `originalAbility` is the
 *   same slot mapped onto the base form and is what gets written to the party.
 */
function pickTrainerMonAbility({ chosenTrainerMon, baseFormMon, trainerAbilities, effectiveDef, level, abilities }) {
    let validAbilities = [];
    if (trainerAbilities && trainerAbilities.length > 0) {
        validAbilities = [...validAbilities, ...chosenTrainerMon.parsedAbilities.filter(a => trainerAbilities.includes(a))];
    }
    // Use the EFFECTIVE definition's abilities (fallback-aware), not the primary's.
    if (effectiveDef?.abilities) {
        validAbilities = [...validAbilities, ...chosenTrainerMon.parsedAbilities.filter(a => effectiveDef.abilities.includes(a))];
    }

    let ability;
    if (validAbilities.length > 0) {
        ability = sample(validAbilities);
    } else {
        // No role-constrained ability (e.g. terrain / type-only fallbacks) — pick the best by rating.
        validAbilities = [...chosenTrainerMon.parsedAbilities];
        if (!usesStrategicAbility(level)) {
            validAbilities = validAbilities.slice(0, 2); // no hidden ability below the strategic level
        }
        validAbilities = validAbilities.filter(a => Boolean(a) && a !== 'NONE').sort((a, b) => {
            if (!usesStrategicAbility(level)) return rng.random() - 0.5;
            const abilityA = abilities[`ABILITY_${a}`];
            const abilityB = abilities[`ABILITY_${b}`];
            const ratingA = abilityA?.rating * (1 + (rng.random() * GENERIC_DEVIATION * 2 - GENERIC_DEVIATION));
            const ratingB = abilityB?.rating * (1 + (rng.random() * GENERIC_DEVIATION * 2 - GENERIC_DEVIATION));
            return ratingB - ratingA;
        });
        ability = validAbilities[0];
    }

    // Map the chosen ability's slot index onto the base form (the party member is the base form).
    let abilityIndex = chosenTrainerMon.parsedAbilities.indexOf(ability);
    let originalAbility = baseFormMon.parsedAbilities[abilityIndex];
    if (originalAbility === 'NONE') {
        abilityIndex = 0;
        originalAbility = baseFormMon.parsedAbilities[0];
    }
    return { ability, originalAbility };
}

module.exports = { pickTrainerMonAbility };
