'use strict';

function isHazard1Setter(entry) {
    return (entry.moves && entry.moves.includes('MOVE_STEALTH_ROCK'))
        || entry.ability === 'TOXIC_DEBRIS';
}

// Sticky Web is a lead hazard like Stealth Rock, but ranked below it (T-013): its phase runs after
// the Stealth Rock phase, so a Stealth Rock setter wins the lead when a team carries both.
function isStickyWebSetter(entry) {
    return entry.moves && entry.moves.includes('MOVE_STICKY_WEB');
}

function isHazard2Setter(entry) {
    return entry.moves && (
        entry.moves.includes('MOVE_SPIKES') || entry.moves.includes('MOVE_TOXIC_SPIKES')
    );
}

function isIllusion(entry) {
    return entry.ability === 'ILLUSION';
}

/**
 * Reorders a shuffled team so that hazard setters and Illusion users gravitate toward
 * the front of the team. Does not mutate the input array.
 *
 * @param {Array} team     - Shuffled team entries (each has .moves and .ability)
 * @param {function} rngFn - () => float in [0,1); called only when a relevant setter is found
 * @returns {Array} New array with lead logic applied
 */
function applyLeadLogic(team, rngFn) {
    if (team.length <= 1) return [...team];

    // Phase 1 — Stealth Rock / Toxic Debris: 90% lead
    const h1 = team.findIndex(isHazard1Setter);
    if (h1 !== -1 && rngFn() < 0.90) {
        const r = [...team];
        const [m] = r.splice(h1, 1);
        r.unshift(m);
        return r;
    }

    // Phase 1b — Sticky Web: 90% lead, but only reached if no Stealth Rock setter took the lead
    // above (so Stealth Rock keeps priority). Like Phase 1, the roll is consumed only when a setter
    // exists, so teams without Sticky Web are unaffected.
    const web = team.findIndex(isStickyWebSetter);
    if (web !== -1 && rngFn() < 0.90) {
        const r = [...team];
        const [m] = r.splice(web, 1);
        r.unshift(m);
        return r;
    }

    // Phase 2 — Spikes / Toxic Spikes: 80% lead
    const h2 = team.findIndex(isHazard2Setter);
    if (h2 !== -1 && rngFn() < 0.80) {
        const r = [...team];
        const [m] = r.splice(h2, 1);
        r.unshift(m);
        return r;
    }

    // Phase 3 — Illusion: 30% lead, 70% slot 2; extras fill slots 3, 4, …
    const illusionIdxs = team.reduce((acc, e, i) => (isIllusion(e) ? [...acc, i] : acc), []);
    if (illusionIdxs.length === 0) return [...team];

    const illusionUsers = illusionIdxs.map(i => team[i]);
    const rest = team.filter((_, i) => !illusionIdxs.includes(i));
    const startPos = rngFn() < 0.30 ? 0 : 1;

    const result = [...rest];
    illusionUsers.forEach((mon, offset) => result.splice(startPos + offset, 0, mon));
    return result;
}

module.exports = { applyLeadLogic };
