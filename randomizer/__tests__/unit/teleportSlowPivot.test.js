'use strict';

// T-261 / B-064 — Teleport is the SLOW pivot: -6 priority, no damage, and its only job is letting a
// slow, bulky mon eat a hit in place of the frail teammate coming in. It is a strictly inferior
// U-turn / Volt Switch / Flip Turn, so it must be worthless on a fast attacker and worth a slot only
// on a slow bulky pivot — most of all one that heals the cycle back (Regenerator / reliable recovery).
// Baton Pass is deliberately NOT in this category: it passes setup, a different and strong job.
//
// B-064: run 2653882998 shipped a Wally Gardevoir (spd 80 / SpA 135) with Teleport in slot 1. It was
// never chosen by the rater — the archetype role-move injector forced it in as a fixed move.

const { rateMove, rateMoveForAPokemon, chooseMoveset } = require('../../rating');
const { DETECTORS, THRESHOLDS, MOVE_SETS } = require('../../modules/featureDetectors');
const { planMemberRoleMove, ROLE_MOVE_SETS } = require('../../modules/archetypeRefine');
const { getArchetypeModel } = require('../../archetypes');
const moves = require('../fixtures/miniMoves');

const singles = getArchetypeModel('singles');
const rated = move => ({ ...move, rating: rateMove(move) });
const r = Object.fromEntries(Object.entries(moves).map(([k, v]) => [k, rated(v)]));

function poke(over = {}) {
    return {
        id: 'SPECIES_TEST', name: 'Test', parsedTypes: ['PSYCHIC'], parsedAbilities: [],
        baseHP: 70, baseAttack: 70, baseDefense: 70, baseSpeed: 70, baseSpAttack: 70, baseSpDefense: 70,
        learnset: [], teachables: [], ...over,
    };
}
// The run's Gardevoir (B-064): fast, frail-ish for a pivot, huge SpA.
const GARDEVOIR = poke({
    id: 'SPECIES_GARDEVOIR', name: 'Gardevoir', parsedTypes: ['PSYCHIC', 'FAIRY'], parsedAbilities: ['TRACE'],
    baseHP: 78, baseAttack: 65, baseDefense: 85, baseSpeed: 80, baseSpAttack: 135, baseSpDefense: 115,
    learnset: [{ level: '1', move: 'MOVE_TELEPORT' }, { level: '1', move: 'MOVE_PSYCHIC' }, { level: '1', move: 'MOVE_SURF' }],
});
// A genuine slow pivot: slow, bulky, low offence.
const SLOW_PIVOT = poke({
    id: 'SPECIES_SLOWPOKE_LIKE', parsedTypes: ['WATER', 'PSYCHIC'], parsedAbilities: ['REGENERATOR'],
    baseHP: 95, baseAttack: 75, baseDefense: 110, baseSpeed: 30, baseSpAttack: 100, baseSpDefense: 80,
});
// Two attacks already on the set — status moves are gated until then (rateMoveForAPokemon).
const twoAttacks = [r.MOVE_PSYCHIC, r.MOVE_SURF];
const rate = (move, mon, { ability = null, otherMoves = [], currentMoves = twoAttacks } = {}) =>
    rateMoveForAPokemon(rated(move), mon, ability, null, otherMoves, currentMoves);

// ──────────────────────────────────────────────────────────────────────────────
describe('T-261 A — Teleport is rated on the user profile, not flat', () => {
    test('a fast attacker gets no value from it', () => {
        expect(rate(moves.MOVE_TELEPORT, GARDEVOIR)).toBeLessThanOrEqual(2);
    });

    test('it never beats the damaging pivots on the same mon', () => {
        const tele = rate(moves.MOVE_TELEPORT, GARDEVOIR);
        expect(tele).toBeLessThan(rate(moves.MOVE_VOLT_SWITCH, GARDEVOIR));
        expect(tele).toBeLessThan(rate(moves.MOVE_U_TURN, GARDEVOIR));
        // ...and it loses to the ordinary attacking options it was displacing in the shipped set.
        expect(tele).toBeLessThan(rate(moves.MOVE_PSYCHIC, GARDEVOIR));
    });

    test('a slow bulky pivot gets real value out of it', () => {
        expect(rate(moves.MOVE_TELEPORT, SLOW_PIVOT)).toBeGreaterThanOrEqual(5);
    });

    test('Regenerator raises it further (the pivot cycle is HP-positive)', () => {
        const plain = rate(moves.MOVE_TELEPORT, SLOW_PIVOT, { ability: 'OWN_TEMPO' });
        const regen = rate(moves.MOVE_TELEPORT, SLOW_PIVOT, { ability: 'REGENERATOR' });
        expect(regen).toBeGreaterThan(plain);
        expect(regen).toBeGreaterThanOrEqual(6);
    });

    test('reliable recovery raises it too, without Regenerator', () => {
        const plain = rate(moves.MOVE_TELEPORT, SLOW_PIVOT, { ability: 'OWN_TEMPO' });
        const healer = rate(moves.MOVE_TELEPORT, SLOW_PIVOT, { ability: 'OWN_TEMPO', otherMoves: [r.MOVE_RECOVER] });
        expect(healer).toBeGreaterThan(plain);
        expect(healer).toBeGreaterThanOrEqual(6);
    });

    test('even on a slow bulky pivot a damaging pivot still wins the slot', () => {
        expect(rate(moves.MOVE_TELEPORT, SLOW_PIVOT, { ability: 'REGENERATOR' }))
            .toBeLessThan(rate(moves.MOVE_VOLT_SWITCH, SLOW_PIVOT, { ability: 'REGENERATOR' }));
    });

    test('B-064 — chooseMoveset never picks it up for the run Gardevoir', () => {
        // A real pool: five usable attacks competing for four slots, so Teleport has to earn its place.
        const mon = { ...GARDEVOIR, learnset: [
            'MOVE_TELEPORT', 'MOVE_PSYCHIC', 'MOVE_SURF', 'MOVE_THUNDERBOLT', 'MOVE_ICE_BEAM',
            'MOVE_FLAMETHROWER', 'MOVE_AURA_SPHERE',
        ].map(move => ({ level: '1', move })) };
        const { moveset } = chooseMoveset(mon, moves, 50, [], 'TRACE', null, null, 0);
        expect(moveset).not.toContain('MOVE_TELEPORT');
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('T-261 B — Teleport only makes a mon a pivotUser when the profile fits', () => {
    const ctx = { moves };
    const learns = (...mv) => ({ learnset: mv.map(m => ({ level: '1', move: m })) });

    test('Teleport is not a plain pivot move any more; the real pivots still are', () => {
        expect([...MOVE_SETS.PIVOT_MOVES]).not.toContain('MOVE_TELEPORT');
        expect([...MOVE_SETS.PIVOT_MOVES]).toEqual(expect.arrayContaining([
            'MOVE_U_TURN', 'MOVE_VOLT_SWITCH', 'MOVE_FLIP_TURN', 'MOVE_PARTING_SHOT', 'MOVE_CHILLY_RECEPTION',
        ]));
        expect([...MOVE_SETS.SLOW_PIVOT_MOVES]).toContain('MOVE_TELEPORT');
    });

    test('Baton Pass stays a first-class pivot — it passes setup, a different job', () => {
        expect([...MOVE_SETS.PIVOT_MOVES]).toContain('MOVE_BATON_PASS');
        // ...and it qualifies a fast frail mon, which Teleport must not.
        expect(DETECTORS.pivotUser(poke({ baseSpeed: 120, baseSpAttack: 130, ...learns('MOVE_BATON_PASS') }), ctx)).toBe(true);
    });

    test('B-064 — a fast attacker that only learns Teleport is NOT a pivotUser', () => {
        expect(DETECTORS.pivotUser({ ...GARDEVOIR }, ctx)).toBe(false);
    });

    test('a slow bulky mon that learns Teleport IS a pivotUser', () => {
        expect(DETECTORS.pivotUser(poke({
            baseSpeed: THRESHOLDS.SLOW_PIVOT_MAX_SPEED, baseHP: 100, baseDefense: 100, baseSpDefense: 100,
            ...learns('MOVE_TELEPORT'),
        }), ctx)).toBe(true);
    });

    test('a real pivot move qualifies any profile', () => {
        expect(DETECTORS.pivotUser(poke({ baseSpeed: 120, ...learns('MOVE_U_TURN') }), ctx)).toBe(true);
        expect(DETECTORS.pivotUser(poke({ teachables: ['MOVE_VOLT_SWITCH'] }), ctx)).toBe(true);
    });

    test('the role move set still offers Teleport (last) so a slow pivot can be given it', () => {
        expect([...ROLE_MOVE_SETS.pivotUser]).toContain('MOVE_TELEPORT');
        const list = [...ROLE_MOVE_SETS.pivotUser];
        expect(list.indexOf('MOVE_TELEPORT')).toBe(list.length - 1);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('T-261 C — the role injector picks the BEST deliverer, not the first listed', () => {
    // Empty prior team + a seed primes refinement (T-107 107e); bulky_offense wants a pivotUser.
    const opts = (over = {}) => ({
        team: [], model: singles, sophistication: 1, seed: { base: 'bulky_offense' }, ...over,
    });

    test('ranks the reachable candidates by their rating on that mon', () => {
        // A special attacker that can run both. Insertion order would hand it U-turn (listed first);
        // ranking must pick Volt Switch, which its 130 SpA actually uses.
        const specialPivot = poke({
            parsedTypes: ['ELECTRIC'], baseAttack: 60, baseSpAttack: 130,
            teachables: ['MOVE_U_TURN', 'MOVE_VOLT_SWITCH'],
        });
        const move = planMemberRoleMove({
            species: specialPivot,
            ctx: { moves, tms: ['MOVE_U_TURN', 'MOVE_VOLT_SWITCH'], level: 50 },
            ...opts(),
        });
        expect(move).toBe('MOVE_VOLT_SWITCH');
    });

    test('without a moves database it falls back to insertion order (pure planner unchanged)', () => {
        const bothPivots = poke({ teachables: ['MOVE_U_TURN', 'MOVE_VOLT_SWITCH'] });
        const move = planMemberRoleMove({
            species: bothPivots, ctx: { tms: ['MOVE_U_TURN', 'MOVE_VOLT_SWITCH'], level: 50 }, ...opts(),
        });
        expect(move).toBe('MOVE_U_TURN');
    });

    test('B-064 — the run Gardevoir is never handed Teleport as its pivot role move', () => {
        // As in the run: no pivot TM this mon can use is in the trainer's bag, so only Teleport is
        // reachable (Gardevoir's one real pivot, Volt Switch, is a teachable Wally does not carry).
        const move = planMemberRoleMove({
            species: GARDEVOIR, ctx: { moves, tms: [], level: 49 }, ...opts(),
        });
        expect(move).not.toBe('MOVE_TELEPORT');
    });

    test('B-064 — ...not even when the real pivots are only unreachable TMs', () => {
        // The shipped case exactly: Gardevoir DOES learn a real pivot as a TM (Volt Switch), so it is a
        // legitimate pivotUser species — but that TM is not in Wally's bag, leaving Teleport as the last
        // reachable candidate. Its profile must veto it there too, or the role fills with a move the mon
        // cannot use.
        const gardevoirWithPivotTms = { ...GARDEVOIR, teachables: ['MOVE_U_TURN', 'MOVE_VOLT_SWITCH', 'MOVE_FLIP_TURN'] };
        expect(DETECTORS.pivotUser(gardevoirWithPivotTms, { moves })).toBe(true);   // capable species
        const move = planMemberRoleMove({
            species: gardevoirWithPivotTms, ctx: { moves, tms: [], level: 49 }, ...opts(),
        });
        expect(move).not.toBe('MOVE_TELEPORT');
        // ...and once Wally does hold the TM, the real pivot is delivered.
        expect(planMemberRoleMove({
            species: gardevoirWithPivotTms, ctx: { moves, tms: ['MOVE_VOLT_SWITCH'], level: 49 }, ...opts(),
        })).toBe('MOVE_VOLT_SWITCH');
    });

    test('a slow bulky mon with only Teleport reachable still gets it', () => {
        const slow = poke({
            parsedTypes: ['WATER'], baseHP: 100, baseDefense: 110, baseSpDefense: 90,
            baseSpeed: 30, baseAttack: 60, baseSpAttack: 80,
            learnset: [{ level: '1', move: 'MOVE_TELEPORT' }, { level: '1', move: 'MOVE_SURF' }],
        });
        const move = planMemberRoleMove({ species: slow, ctx: { moves, tms: [], level: 49 }, ...opts() });
        expect(move).toBe('MOVE_TELEPORT');
    });
});
