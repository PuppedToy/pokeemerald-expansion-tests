'use strict';

// T-107 (107d) — identity-aware refinement: given the emerged team identity, pick the archetype role
// move a just-chosen member should also carry so the team actually DELIVERS the role (not just has a
// role-capable species). Pure planner; the resolver injects the returned move as a fixed move before
// chooseMoveset (reusing the tryToHaveMove machinery → move quality preserved). Gated by sophistication.

const { resolvedDetectMon, planMemberRoleMove, ROLE_MOVE_SETS } = require('../../modules/archetypeRefine');
const { getArchetypeModel } = require('../../archetypes');
const { BIAS_MIN_SOPH } = require('../../modules/archetypePicker');

const singles = getArchetypeModel('singles');

function mon(o = {}) {
    return {
        id: 'SPECIES_T', parsedTypes: ['NORMAL'], parsedAbilities: [],
        baseHP: 70, baseAttack: 70, baseDefense: 70, baseSpeed: 70, baseSpAttack: 70, baseSpDefense: 70,
        learnset: [], teachables: [], evolutionData: { isMega: false }, ...o,
    };
}
const withLearn = (...mv) => ({ learnset: mv.map(m => ({ level: '1', move: m })) });
// A member wrapper as the resolver builds them: { pokemon, ability, moves }.
const member = (pokemon, ability = null, moves = []) => ({ pokemon, ability, moves });

const regenSpecies = () => mon({ parsedAbilities: ['REGENERATOR'], baseHP: 100, baseDefense: 90, baseSpDefense: 90 });
const regenMember = () => member(regenSpecies(), 'REGENERATOR', []);
// prior team of two Regenerator pivots → Balance identity (confidence 1); it delivers regeneratorPivot
// (ability/stat, move-independent) but NOT hazards.
const balanceTeam = () => [regenMember(), regenMember()];

describe('resolvedDetectMon — detection view from a resolved member', () => {
    test('uses the resolved ability + actual moves (not species potential)', () => {
        const rocker = mon({ ...withLearn('MOVE_STEALTH_ROCK') });
        // Member that CAN learn SR but its chosen moveset does NOT include it → not delivering it.
        const notDelivering = resolvedDetectMon(member(rocker, 'GUTS', ['MOVE_TACKLE']));
        expect(notDelivering.teachables).not.toContain('MOVE_STEALTH_ROCK');
        expect(notDelivering.parsedAbilities).toEqual(['GUTS']);
        // Member that actually runs SR → delivering.
        const delivering = resolvedDetectMon(member(rocker, 'GUTS', ['MOVE_STEALTH_ROCK']));
        expect(delivering.teachables).toContain('MOVE_STEALTH_ROCK');
    });
});

describe('ROLE_MOVE_SETS covers the move-deliverable roles', () => {
    test('maps hazardSetter/tailwindSetter/etc to move sets', () => {
        expect([...ROLE_MOVE_SETS.hazardSetter]).toContain('MOVE_STEALTH_ROCK');
        expect([...ROLE_MOVE_SETS.tailwindSetter]).toContain('MOVE_TAILWIND');
        expect([...ROLE_MOVE_SETS.trickRoomSetter]).toContain('MOVE_TRICK_ROOM');
        // ability/stat-only roles are NOT move-deliverable
        expect(ROLE_MOVE_SETS.intimidateUser).toBeUndefined();
        expect(ROLE_MOVE_SETS.wallbreaker).toBeUndefined();
    });
});

describe('planMemberRoleMove', () => {
    const opts = (over) => ({ team: balanceTeam(), model: singles, ctx: {}, sophistication: 1, ...over });

    test('returns the top under-delivered role move the mon can deliver', () => {
        // Balance wants a hazardSetter (delivered 0). A mon that can set rocks → gets Stealth Rock.
        const rocker = mon({ ...withLearn('MOVE_STEALTH_ROCK') });
        expect(planMemberRoleMove({ species: rocker, ...opts() })).toBe('MOVE_STEALTH_ROCK');
    });

    test('returns null below the sophistication gate (early game — no refinement)', () => {
        const rocker = mon({ ...withLearn('MOVE_STEALTH_ROCK') });
        expect(planMemberRoleMove({ species: rocker, ...opts({ sophistication: BIAS_MIN_SOPH - 0.01 }) })).toBeNull();
    });

    test('returns null with no emerged identity (incoherent prior team)', () => {
        const rocker = mon({ ...withLearn('MOVE_STEALTH_ROCK') });
        expect(planMemberRoleMove({ species: rocker, ...opts({ team: [member(mon()), member(mon())] }) })).toBeNull();
    });

    test('returns null when the mon cannot deliver any needed role', () => {
        const plain = mon(); // no relevant moves
        expect(planMemberRoleMove({ species: plain, ...opts() })).toBeNull();
    });

    test('does not re-inject a role the team already delivers', () => {
        // A prior member already runs Stealth Rock → hazardSetter delivered; a new rock-capable mon
        // that can ONLY set rocks has no remaining role → null.
        const team = [regenMember(), member(mon({ ...withLearn('MOVE_STEALTH_ROCK') }), 'REGENERATOR', ['MOVE_STEALTH_ROCK'])];
        const rocker = mon({ ...withLearn('MOVE_STEALTH_ROCK') });
        expect(planMemberRoleMove({ species: rocker, team, model: singles, ctx: {}, sophistication: 1 })).toBeNull();
    });

    test('no model → null (graceful)', () => {
        const rocker = mon({ ...withLearn('MOVE_STEALTH_ROCK') });
        expect(planMemberRoleMove({ species: rocker, ...opts({ model: null }) })).toBeNull();
    });

    test('a seed primes refinement before an identity emerges (T-107 107e)', () => {
        // Empty prior team → no emergent identity; a Balance seed makes a rock-capable mon get rocks.
        const rocker = mon({ ...withLearn('MOVE_STEALTH_ROCK') });
        const move = planMemberRoleMove({ species: rocker, team: [], model: singles, ctx: {}, sophistication: 1, seed: { base: 'balance' } });
        expect(move).toBe('MOVE_STEALTH_ROCK');
        // ...but not without the seed (no identity at all).
        expect(planMemberRoleMove({ species: rocker, team: [], model: singles, ctx: {}, sophistication: 1 })).toBeNull();
    });
});
