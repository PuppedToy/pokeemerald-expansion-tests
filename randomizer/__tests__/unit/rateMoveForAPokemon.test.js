'use strict';

const { rateMoveForAPokemon } = require('../../rating');
const moves = require('../fixtures/miniMoves');
const { RIOLU, BLISSEY, MACHOP } = require('../fixtures/miniPokes');

// Helper: pre-populate move.rating from rateMove (rating.js stores it on the object at
// chooseMoveset time; tests must mirror that so rateMoveForAPokemon receives a correct base).
const { rateMove } = require('../../rating');
function rated(move) {
    return { ...move, rating: rateMove(move) };
}

const r = Object.fromEntries(Object.entries(moves).map(([k, v]) => [k, rated(v)]));

// Minimal no-item no-ability calls
function rate(move, poke, opts = {}) {
    const { ability = null, item = null, otherMoves = [], currentMoves = [] } = opts;
    return rateMoveForAPokemon(rated(move), poke, ability, item, otherMoves, currentMoves);
}

// ──────────────────────────────────────────────────────────────────────────────
describe('Fix 1 — Endure without combo partner → 0', () => {
    test('Endure alone (no Flail/Reversal in pool) returns 0', () => {
        const result = rate(moves.MOVE_ENDURE, RIOLU, {
            currentMoves: [r.MOVE_TACKLE],
            otherMoves: [r.MOVE_TACKLE],
        });
        expect(result).toBe(0);
    });

    test('Endure when Flail is in otherMoves returns > 0', () => {
        const result = rate(moves.MOVE_ENDURE, RIOLU, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_EARTHQUAKE],
            otherMoves: [r.MOVE_FLAIL],
        });
        expect(result).toBeGreaterThan(0);
    });

    test('Endure when Flail is already in currentMoves returns > 0', () => {
        const result = rate(moves.MOVE_ENDURE, RIOLU, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_EARTHQUAKE, r.MOVE_FLAIL],
            otherMoves: [],
        });
        expect(result).toBeGreaterThan(0);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('Fix 2 — Counter bulk scaling (not HP-only)', () => {
    test('Counter on Riolu (HP 40, Def 40) rates below 3.0', () => {
        const result = rate(moves.MOVE_COUNTER, RIOLU, {
            currentMoves: [r.MOVE_TACKLE],
            otherMoves: [],
        });
        expect(result).toBeLessThan(3.0);
    });

    const HARIYAMA_LIKE = {
        ...RIOLU,
        id: 'SPECIES_HARIYAMA',
        baseHP: 144, baseAttack: 120, baseDefense: 60,
        baseSpeed: 50, baseSpAttack: 40, baseSpDefense: 60,
    };
    test('Counter on Hariyama-like (HP 144, Def 60) rates above 4.0', () => {
        const result = rate(moves.MOVE_COUNTER, HARIYAMA_LIKE, {
            currentMoves: [r.MOVE_TACKLE],
            otherMoves: [],
        });
        expect(result).toBeGreaterThan(4.0);
    });

    test('Counter rates higher for bulkier Pokémon', () => {
        const lean = rate(moves.MOVE_COUNTER, RIOLU, { currentMoves: [r.MOVE_TACKLE], otherMoves: [] });
        const bulk = rate(moves.MOVE_COUNTER, HARIYAMA_LIKE, { currentMoves: [r.MOVE_TACKLE], otherMoves: [] });
        expect(bulk).toBeGreaterThan(lean);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('Fix 3 — Priority stacking', () => {
    test('Feint rates lower when Quick Attack is already in moveset', () => {
        const withoutQA = rate(moves.MOVE_FEINT, RIOLU, {
            currentMoves: [r.MOVE_TACKLE],
            otherMoves: [],
        });
        const withQA = rate(moves.MOVE_FEINT, RIOLU, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_QUICK_ATTACK],
            otherMoves: [],
        });
        expect(withQA).toBeLessThan(withoutQA);
    });

    test('Fake Out in moveset does NOT suppress Quick Attack bonus (exempt as EFFECT_FIRST_TURN_ONLY)', () => {
        const withoutFO = rate(moves.MOVE_QUICK_ATTACK, RIOLU, {
            currentMoves: [r.MOVE_TACKLE],
            otherMoves: [],
        });
        const withFO = rate(moves.MOVE_QUICK_ATTACK, RIOLU, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_FAKE_OUT],
            otherMoves: [],
        });
        expect(withFO).toBe(withoutFO);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('Fix 4 — Coverage gap bonus', () => {
    test('Metal Claw gets a bonus vs a Normal-only moveset (Ghost immunity)', () => {
        const withoutCoverage = rate(moves.MOVE_METAL_CLAW, RIOLU, {
            currentMoves: [],
            otherMoves: [],
        });
        const withNormalCurrent = rate(moves.MOVE_METAL_CLAW, RIOLU, {
            currentMoves: [r.MOVE_MEGA_PUNCH],
            otherMoves: [],
        });
        expect(withNormalCurrent).toBeGreaterThan(withoutCoverage);
    });

    test('Earthquake gets no immunity bonus when Ground already covers the same types', () => {
        // Surf (Water) vs Fire: already 2×. Earthquake adding more Water coverage → no big bonus.
        const withSurf = rate(moves.MOVE_EARTHQUAKE, RIOLU, {
            currentMoves: [r.MOVE_SURF],
            otherMoves: [],
        });
        const withoutCurrent = rate(moves.MOVE_EARTHQUAKE, RIOLU, {
            currentMoves: [],
            otherMoves: [],
        });
        // Earthquake (Ground) doesn't add immunity coverage beyond Surf — no big spike
        expect(withSurf).toBeCloseTo(withoutCurrent, 0);
    });

    test('Coverage bonus is larger for more offensive Pokémon', () => {
        const offBonus = rate(moves.MOVE_METAL_CLAW, RIOLU, {
            currentMoves: [r.MOVE_MEGA_PUNCH],
            otherMoves: [],
        });
        const defBonus = rate(moves.MOVE_METAL_CLAW, BLISSEY, {
            currentMoves: [r.MOVE_MEGA_PUNCH],
            otherMoves: [],
        });
        expect(offBonus).toBeGreaterThan(defBonus);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('Fix 5 — Focus Energy: context gate', () => {
    test('Focus Energy without crit ability/item/move returns 0', () => {
        const result = rate(moves.MOVE_FOCUS_ENERGY, RIOLU, {
            ability: null,
            item: null,
            currentMoves: [r.MOVE_TACKLE, r.MOVE_EARTHQUAKE],
            otherMoves: [],
        });
        expect(result).toBe(0);
    });

    test('Focus Energy with Sniper ability returns > 0', () => {
        const result = rate(moves.MOVE_FOCUS_ENERGY, RIOLU, {
            ability: 'SNIPER',
            item: null,
            currentMoves: [r.MOVE_TACKLE, r.MOVE_EARTHQUAKE],
            otherMoves: [],
        });
        expect(result).toBeGreaterThan(0);
    });

    test('Focus Energy with Scope Lens item returns > 0', () => {
        const result = rate(moves.MOVE_FOCUS_ENERGY, RIOLU, {
            ability: null,
            item: 'Scope Lens',
            currentMoves: [r.MOVE_TACKLE, r.MOVE_EARTHQUAKE],
            otherMoves: [],
        });
        expect(result).toBeGreaterThan(0);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('Fix 6 — Sand Attack: base reduction + offensive penalty', () => {
    test('Sand Attack on Riolu-like (offRatio ~1.75) rates below 1.0', () => {
        const result = rate(moves.MOVE_SAND_ATTACK, RIOLU, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_EARTHQUAKE],
            otherMoves: [],
        });
        expect(result).toBeLessThan(1.0);
    });

    test('Sand Attack on Blissey (offRatio ~0.56) rates above 2.0 (no penalty)', () => {
        const result = rate(moves.MOVE_SAND_ATTACK, BLISSEY, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_EARTHQUAKE],
            otherMoves: [],
        });
        expect(result).toBeGreaterThan(2.0);
    });

    test('Sand Attack rates lower on Riolu than on Blissey', () => {
        const rioluRate = rate(moves.MOVE_SAND_ATTACK, RIOLU, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_EARTHQUAKE],
            otherMoves: [],
        });
        const blisseyRate = rate(moves.MOVE_SAND_ATTACK, BLISSEY, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_EARTHQUAKE],
            otherMoves: [],
        });
        expect(rioluRate).toBeLessThan(blisseyRate);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('Fix 7 — Second status move penalty on offensive Pokémon', () => {
    test('Second status move on Riolu rates lower than the first', () => {
        // First status move (no status in current): no penalty
        const first = rate(moves.MOVE_SAND_ATTACK, RIOLU, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_EARTHQUAKE],
            otherMoves: [],
        });
        // Second status move (Work Up already selected): penalty applied
        const second = rate(moves.MOVE_SAND_ATTACK, RIOLU, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_EARTHQUAKE, r.MOVE_WORK_UP],
            otherMoves: [],
        });
        expect(second).toBeLessThan(first);
    });

    test('Second status move on Blissey (defensive) is NOT penalised vs first', () => {
        const first = rate(moves.MOVE_SAND_ATTACK, BLISSEY, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_EARTHQUAKE],
            otherMoves: [],
        });
        const second = rate(moves.MOVE_SAND_ATTACK, BLISSEY, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_EARTHQUAKE, r.MOVE_WORK_UP],
            otherMoves: [],
        });
        expect(second).toBeCloseTo(first, 5);
    });
});
