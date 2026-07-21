'use strict';

// T-181 — move-accuracy rating rework.
//   1. Expected-value (multiplicative) accuracy instead of the old flat -(100-acc)/10 penalty.
//   2. Never-miss reliability bonus attenuated from ~+1 to a small residual.
//   3. Imprecise-move stacking penalty (ability/weather aware) so a set doesn't pile up imprecise moves.
// Owner goals: Fire Blast > Flamethrower; Focus Blast ≈ Aura Sphere; consistent high-power moves (Close
// Combat) still on top; only ~1 imprecise move per set.

const { rateMove, rateMoveForAPokemon, chooseMoveset } = require('../../rating');
const moves = require('../fixtures/miniMoves');

// Mirror chooseMoveset: it stamps move.rating = rateMove(move) before per-mon rating.
const rated = (move) => ({ ...move, rating: rateMove(move) });
const r = Object.fromEntries(Object.entries(moves).map(([k, v]) => [k, rated(v)]));

const base = {
    additionalEffects: [], pp: 10, target: 'MOVE_TARGET_SELECTED',
    priority: 0, makesContact: 'TRUE', strikeCount: '1',
};

// A neutral (NORMAL) special attacker — no STAB skew, high SpA so the multiplier is uniform.
const SPEC_ATTACKER = {
    id: 'SPECIES_TEST', family: 'P_FAMILY_TEST', form: null,
    parsedTypes: ['NORMAL'],
    parsedAbilities: ['INNER_FOCUS'],
    baseHP: 70, baseAttack: 60, baseDefense: 70,
    baseSpeed: 90, baseSpAttack: 130, baseSpDefense: 70,
    baseBST: 490,
    learnset: [], teachables: [], newTeachables: [], oldTeachables: [],
};

function rate(move, poke, opts = {}) {
    const { ability = null, item = null, otherMoves = [], currentMoves = [],
        sun = false, rain = false, snow = false, sand = false, powerHerb = false } = opts;
    return rateMoveForAPokemon(rated(move), poke, ability, item, otherMoves, currentMoves,
        { sun, rain, snow, sand, powerHerb });
}

// ──────────────────────────────────────────────────────────────────────────────
// 1 — Expected-value accuracy (base rateMove)
// ──────────────────────────────────────────────────────────────────────────────
describe('T-181 · expected-value accuracy — base rateMove', () => {
    test('Fire Blast (110/85) is preferred over Flamethrower (90/100)', () => {
        expect(rateMove(moves.MOVE_FIRE_BLAST)).toBeGreaterThan(rateMove(moves.MOVE_FLAMETHROWER));
    });

    test('Focus Blast (120/70) and Aura Sphere (80/never-miss) end up close (within 0.5)', () => {
        const diff = Math.abs(rateMove(moves.MOVE_FOCUS_BLAST) - rateMove(moves.MOVE_AURA_SPHERE));
        expect(diff).toBeLessThan(0.5);
    });

    test('a low-accuracy move is still worth less than the same power at 100% (Hydro Pump 110/80)', () => {
        const clean110 = { ...base, id: 'MOVE_CLEAN110', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'WATER', power: 110, accuracy: 100, effect: 'EFFECT_HIT' };
        expect(rateMove(moves.MOVE_HYDRO_PUMP)).toBeLessThan(rateMove(clean110));
    });

    test('consistent high-power moves stay on top — Close Combat > Fire Blast and > Focus Blast', () => {
        expect(rateMove(moves.MOVE_CLOSE_COMBAT)).toBeGreaterThan(rateMove(moves.MOVE_FIRE_BLAST));
        expect(rateMove(moves.MOVE_CLOSE_COMBAT)).toBeGreaterThan(rateMove(moves.MOVE_FOCUS_BLAST));
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// 2 — Never-miss bonus attenuated
// ──────────────────────────────────────────────────────────────────────────────
describe('T-181 · never-miss bonus attenuated', () => {
    const neverMiss = { ...base, id: 'MOVE_NM', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'NORMAL', power: 80, accuracy: 0, effect: 'EFFECT_HIT' };
    const acc100 = { ...base, id: 'MOVE_AC', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'NORMAL', power: 80, accuracy: 100, effect: 'EFFECT_HIT' };

    test('never-miss is not worse than an equal-power 100%-accurate move', () => {
        expect(rateMove(neverMiss)).toBeGreaterThanOrEqual(rateMove(acc100));
    });

    test('the never-miss bonus is small (≤ 0.3, down from the old +1)', () => {
        expect(rateMove(neverMiss) - rateMove(acc100)).toBeLessThanOrEqual(0.3);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// 3 — Accuracy-affecting abilities / weather (rateMoveForAPokemon correction)
// ──────────────────────────────────────────────────────────────────────────────
describe('T-181 · ability/weather accuracy correction', () => {
    test('No Guard restores an imprecise move to full value (Focus Blast rated higher than without it)', () => {
        const withNoGuard = rate(moves.MOVE_FOCUS_BLAST, SPEC_ATTACKER, { ability: 'NO_GUARD' });
        const without = rate(moves.MOVE_FOCUS_BLAST, SPEC_ATTACKER, { ability: null });
        expect(withNoGuard).toBeGreaterThan(without);
    });

    test('Compound Eyes raises an imprecise move (Thunder 70% → ~91%)', () => {
        const withCE = rate(moves.MOVE_THUNDER, SPEC_ATTACKER, { ability: 'COMPOUND_EYES' });
        const without = rate(moves.MOVE_THUNDER, SPEC_ATTACKER, { ability: null });
        expect(withCE).toBeGreaterThan(without);
    });

    test('rain makes Thunder land like a 100%-accurate move (rated higher than in clear weather)', () => {
        const inRain = rate(moves.MOVE_THUNDER, SPEC_ATTACKER, { rain: true });
        const clear = rate(moves.MOVE_THUNDER, SPEC_ATTACKER, { rain: false });
        expect(inRain).toBeGreaterThan(clear);
    });

    test('a 100%-accurate move is unaffected by No Guard', () => {
        const withNoGuard = rate(moves.MOVE_SURF, SPEC_ATTACKER, { ability: 'NO_GUARD' });
        const without = rate(moves.MOVE_SURF, SPEC_ATTACKER, { ability: null });
        expect(withNoGuard).toBeCloseTo(without, 5);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// 4 — Imprecise-stacking penalty (the selection principle chooseMoveset relies on)
// ──────────────────────────────────────────────────────────────────────────────
describe('T-181 · imprecise-move stacking penalty', () => {
    // Two WATER coverage candidates (same type ⇒ identical coverage bonus, so only accuracy/base differ),
    // evaluated against a set that already holds one imprecise FIRE move.
    const impreciseInSet = rated({ ...base, id: 'MOVE_SET_FIRE', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'FIRE', power: 110, accuracy: 85, effect: 'EFFECT_HIT' });
    const preciseInSet = rated({ ...base, id: 'MOVE_SET_FIRE_P', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'FIRE', power: 90, accuracy: 100, effect: 'EFFECT_HIT' });
    // Candidate Q: higher-base but imprecise (120/80). Candidate P: lower-base but precise (90/100).
    const Q_impreciseHiBase = { ...base, id: 'MOVE_Q', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'WATER', power: 120, accuracy: 80, effect: 'EFFECT_HIT' };
    const P_preciseLoBase = { ...base, id: 'MOVE_P', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'WATER', power: 90, accuracy: 100, effect: 'EFFECT_HIT' };

    test('with one imprecise move already in the set, a precise move outranks a higher-base imprecise one', () => {
        const q = rate(Q_impreciseHiBase, SPEC_ATTACKER, { currentMoves: [impreciseInSet] });
        const p = rate(P_preciseLoBase, SPEC_ATTACKER, { currentMoves: [impreciseInSet] });
        expect(p).toBeGreaterThan(q);
    });

    test('with a precise move already in the set, the higher-base imprecise move still wins (no penalty yet)', () => {
        const q = rate(Q_impreciseHiBase, SPEC_ATTACKER, { currentMoves: [preciseInSet] });
        const p = rate(P_preciseLoBase, SPEC_ATTACKER, { currentMoves: [preciseInSet] });
        expect(q).toBeGreaterThan(p);
    });

    test('the same imprecise candidate is rated lower when the set already has an imprecise move', () => {
        const afterImprecise = rate(Q_impreciseHiBase, SPEC_ATTACKER, { currentMoves: [impreciseInSet] });
        const afterPrecise = rate(Q_impreciseHiBase, SPEC_ATTACKER, { currentMoves: [preciseInSet] });
        expect(afterImprecise).toBeLessThan(afterPrecise);
    });

    test('No Guard disables the stacking penalty (nothing counts as imprecise)', () => {
        const afterImprecise = rate(Q_impreciseHiBase, SPEC_ATTACKER, { ability: 'NO_GUARD', currentMoves: [impreciseInSet] });
        const afterPrecise = rate(Q_impreciseHiBase, SPEC_ATTACKER, { ability: 'NO_GUARD', currentMoves: [preciseInSet] });
        expect(afterImprecise).toBeCloseTo(afterPrecise, 5);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// 5 — chooseMoveset integration smoke test
// ──────────────────────────────────────────────────────────────────────────────
describe('T-181 · chooseMoveset still returns a valid 4-move set', () => {
    const mon = {
        ...SPEC_ATTACKER,
        learnset: [
            { level: '1', move: 'MOVE_FIRE_BLAST' },
            { level: '1', move: 'MOVE_FOCUS_BLAST' },
            { level: '1', move: 'MOVE_THUNDER' },
            { level: '1', move: 'MOVE_SURF' },
            { level: '1', move: 'MOVE_ICE_BEAM' },
            { level: '1', move: 'MOVE_PSYCHIC' },
        ],
        teachables: [],
    };

    test('returns exactly 4 distinct moves from the learnable pool', () => {
        const { moveset } = chooseMoveset(mon, r, 100, [], null, null, null, 0);
        expect(moveset).toHaveLength(4);
        expect(new Set(moveset).size).toBe(4);
        moveset.forEach(id => expect(mon.learnset.some(ls => ls.move === id)).toBe(true));
    });
});
