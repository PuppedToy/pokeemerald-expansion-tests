'use strict';

// T-107 (107d) — identity-aware refinement (the move half).
//
// The weighted fill (107c) biases the team toward archetype-CAPABLE species, but the moveset is still
// chosen on raw rating — so a mon picked for (say) hazard potential may not actually run hazards.
// This module decides, for a just-chosen member, the ONE archetype role move it should also carry so
// the team DELIVERS a still-missing role of its emerged identity. The resolver injects the returned
// move as a fixed move before chooseMoveset (same path as tryToHaveMove), so move QUALITY is preserved
// (the rater fits it into the best set) rather than crudely swapped in.
//
// Pure + deterministic. Gated by sophistication (shares the picker's thresholds), so early-game teams
// get no refinement and stay byte-identical.

const { detectFeatures, MOVE_SETS } = require('./featureDetectors');
const { teamFeatureCounts, combinedStructure } = require('./archetypeFit');
const { BIAS_MIN_SOPH, resolveIdentity } = require('./archetypePicker');

// Move-deliverable roles → the moves that deliver them. Ability/stat-only roles (intimidateUser,
// wallbreaker, walls, regeneratorPivot, weatherSetter/abuser) are absent — they can't be fixed by a
// move, and the 107c pick already biased toward mons that have them.
const ROLE_MOVE_SETS = {
    hazardSetter: MOVE_SETS.HAZARD_MOVES,
    hazardRemover: MOVE_SETS.HAZARD_REMOVAL_MOVES,
    screenSetter: MOVE_SETS.SCREEN_MOVES,
    trickRoomSetter: MOVE_SETS.TRICK_ROOM_MOVES,
    tailwindSetter: MOVE_SETS.TAILWIND_MOVES,
    cleric: MOVE_SETS.CLERIC_MOVES,
    pivotUser: MOVE_SETS.PIVOT_MOVES,
    wideGuardUser: MOVE_SETS.WIDE_GUARD_MOVES,
    redirector: MOVE_SETS.REDIRECT_MOVES,
    setupSweeper: MOVE_SETS.SETUP_MOVES,
    perishSongUser: new Set(['MOVE_PERISH_SONG']),
    fakeOutUser: new Set(['MOVE_FAKE_OUT']),
};

// A detection view of a RESOLVED member: its actual ability + actual moves (so a role only counts as
// "delivered" if the chosen moveset/ability really provides it — unlike species-potential detection).
function resolvedDetectMon(member) {
    const poke = (member && member.pokemon) || member || {};
    const mv = (member && member.moves) || [];
    return {
        ...poke,
        parsedAbilities: (member && member.ability) ? [member.ability] : (poke.parsedAbilities || []),
        learnset: mv.map(m => ({ level: '1', move: m })),
        teachables: mv,
    };
}

function speciesCanLearn(species, move) {
    return (species.learnset || []).some(l => l.move === move) || (species.teachables || []).includes(move);
}

// The archetype role move `species` should also carry, or null. `team` is the members chosen so far
// (newTeamMember wrappers). Deterministic; returns null unless a coherent identity has emerged and
// sophistication is high enough.
function planMemberRoleMove({ species, team, model, ctx = {}, sophistication, seed = null }) {
    if (!model || !species || (sophistication || 0) < BIAS_MIN_SOPH) return null;

    // Effective identity (emergent, else the trainer's seed) over the prior team, from species
    // potential — same basis as the 107c fill.
    const speciesMons = (team || []).map(m => (m && m.pokemon) ? m.pokemon : m);
    const identity = resolveIdentity(speciesMons, model, ctx, seed);
    if (!identity) return null;
    const structure = combinedStructure(model, identity.baseId, identity.gimmickIds);

    // Roles the prior team ACTUALLY delivers (resolved movesets/abilities).
    const delivered = teamFeatureCounts((team || []).map(resolvedDetectMon), ctx);
    const speciesFeats = detectFeatures(species, ctx);

    const candidates = structure
        .filter(s => ROLE_MOVE_SETS[s.role] && speciesFeats.has(s.role) && (delivered[s.role] || 0) < s.min)
        .sort((a, b) => b.weight - a.weight);

    for (const s of candidates) {
        for (const move of ROLE_MOVE_SETS[s.role]) {
            if (speciesCanLearn(species, move)) return move;
        }
    }
    return null;
}

module.exports = { resolvedDetectMon, planMemberRoleMove, ROLE_MOVE_SETS };
