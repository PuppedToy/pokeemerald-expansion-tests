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
    const {
        ability = null, item = null, otherMoves = [], currentMoves = [],
        // legacy opts map onto the ctx object; new tests can pass rain/snow/sand/sun/powerHerb directly
        teamHasSun = false, powerHerbAvailable = false,
        sun = teamHasSun, rain = false, snow = false, sand = false, powerHerb = powerHerbAvailable,
    } = opts;
    return rateMoveForAPokemon(rated(move), poke, ability, item, otherMoves, currentMoves, { sun, rain, snow, sand, powerHerb });
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

// ──────────────────────────────────────────────────────────────────────────────
describe('Fix 8 — Non-STAB Normal redundancy penalty', () => {
    const { rateMove } = require('../../rating');

    // True red test: with broad coverage non-STAB Normal should lose to a weaker typed move.
    // Metal Claw (50 BP Steel) rates ~2.9; without Fix 8, Strength (80 BP Normal) rates ~4.4
    // and wins. With Fix 8 (0.5× penalty), Strength drops to ~2.2 and correctly loses.
    test('Strength loses to Metal Claw when moveset already has diverse coverage (no immunity gap)', () => {
        const strengthRate  = rate(moves.MOVE_STRENGTH,  RIOLU, { currentMoves: [r.MOVE_EARTHQUAKE, r.MOVE_CLOSE_COMBAT], otherMoves: [] });
        const metalClawRate = rate(moves.MOVE_METAL_CLAW, RIOLU, { currentMoves: [r.MOVE_EARTHQUAKE, r.MOVE_CLOSE_COMBAT], otherMoves: [] });
        expect(strengthRate).toBeLessThan(metalClawRate);
    });

    // Coverage gate guard: Normal breaking a type immunity keeps its full value (no penalty).
    // If Fix 8 were applied here it would halve the Flying-immunity bonus, dropping below rateMove.
    test('Strength is NOT penalized when Normal breaks a Flying immunity (Ground-only set)', () => {
        const result = rate(moves.MOVE_STRENGTH, RIOLU, {
            currentMoves: [r.MOVE_EARTHQUAKE],
            otherMoves: [],
        });
        expect(result).toBeGreaterThan(rateMove(moves.MOVE_STRENGTH));
    });

    // comboActivated guard: Flail+Endure combo overrides the Normal penalty.
    test('Flail+Endure combo exempts Flail from Normal penalty (comboActivated)', () => {
        const withEndure = rate(moves.MOVE_FLAIL, RIOLU, {
            currentMoves: [r.MOVE_CLOSE_COMBAT, r.MOVE_EARTHQUAKE, r.MOVE_ENDURE],
            otherMoves: [],
        });
        const withoutEndure = rate(moves.MOVE_FLAIL, RIOLU, {
            currentMoves: [r.MOVE_CLOSE_COMBAT, r.MOVE_EARTHQUAKE],
            otherMoves: [],
        });
        expect(withEndure).toBeGreaterThan(withoutEndure);
    });

    // Normal-type guard: STAB Normal moves are never penalized.
    // If Fix 8 incorrectly fired for Normal-type Pokémon, normalRate would drop below fightingRate.
    test('Normal-type Pokémon is not penalized for Normal moves (STAB exemption)', () => {
        const NORMAL_RIOLU = { ...RIOLU, parsedTypes: ['NORMAL'] };
        const normalRate   = rate(moves.MOVE_STRENGTH, NORMAL_RIOLU, { currentMoves: [r.MOVE_EARTHQUAKE, r.MOVE_CLOSE_COMBAT], otherMoves: [] });
        const fightingRate = rate(moves.MOVE_STRENGTH, RIOLU,        { currentMoves: [r.MOVE_EARTHQUAKE, r.MOVE_CLOSE_COMBAT], otherMoves: [] });
        expect(normalRate).toBeGreaterThan(fightingRate);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('Fix 9 — Dream Eater: zero-rated without sleep move, combo-rated with one', () => {
    test('Dream Eater alone (no sleep move in pool) returns 0', () => {
        const result = rate(moves.MOVE_DREAM_EATER, RIOLU, {
            currentMoves: [r.MOVE_TACKLE],
            otherMoves:   [r.MOVE_SURF],
        });
        expect(result).toBe(0);
    });

    test('Dream Eater with Sleep Powder in otherMoves returns 7', () => {
        const result = rate(moves.MOVE_DREAM_EATER, RIOLU, {
            currentMoves: [r.MOVE_TACKLE],
            otherMoves:   [r.MOVE_SLEEP_POWDER],
        });
        expect(result).toBe(7);
    });

    test('Dream Eater with Sleep Powder already in currentMoves returns 7', () => {
        const result = rate(moves.MOVE_DREAM_EATER, RIOLU, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_SLEEP_POWDER],
            otherMoves:   [],
        });
        expect(result).toBe(7);
    });

    test('Dream Eater with Spore in otherMoves returns 8', () => {
        const result = rate(moves.MOVE_DREAM_EATER, RIOLU, {
            currentMoves: [r.MOVE_TACKLE],
            otherMoves:   [r.MOVE_SPORE],
        });
        expect(result).toBe(8);
    });

    test('Dream Eater with Spore already in currentMoves returns 8', () => {
        const result = rate(moves.MOVE_DREAM_EATER, RIOLU, {
            currentMoves: [r.MOVE_TACKLE, r.MOVE_SPORE],
            otherMoves:   [],
        });
        expect(result).toBe(8);
    });

    test('Yawn in pool still triggers combo rating 7', () => {
        const result = rate(moves.MOVE_DREAM_EATER, RIOLU, {
            currentMoves: [],
            otherMoves:   [r.MOVE_YAWN],
        });
        expect(result).toBe(7);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// T-013 — two-turn / charge moves need an enabler (Power Herb, or sun for Solar moves)
const TWO_TURN_BASE = { additionalEffects: [], pp: 10, priority: 0, makesContact: 'FALSE', strikeCount: '1', accuracy: 100 };
const SOLAR_BEAM = { ...TWO_TURN_BASE, id: 'MOVE_SOLAR_BEAM', name: 'Solar Beam', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'GRASS', power: 120, effect: 'EFFECT_TWO_TURNS_ATTACK' };
const BELCH      = { ...TWO_TURN_BASE, id: 'MOVE_BELCH', name: 'Belch', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'POISON', power: 120, accuracy: 90, effect: 'EFFECT_BELCH' };

describe('T-013 — two-turn / charge moves without an enabler', () => {
    const cm = { currentMoves: [r.MOVE_TACKLE], otherMoves: [] };

    test('Solar Beam rates much lower without Power Herb than with', () => {
        const without  = rate(SOLAR_BEAM, RIOLU, cm);
        const withHerb = rate(SOLAR_BEAM, RIOLU, { ...cm, item: 'Power Herb' });
        expect(without).toBeLessThan(withHerb);
        expect(without).toBeLessThan(withHerb * 0.5); // "much" lower
    });

    test('Fly (semi-invulnerable) rates much lower without Power Herb', () => {
        const without  = rate(moves.MOVE_FLY, RIOLU, cm);
        const withHerb = rate(moves.MOVE_FLY, RIOLU, { ...cm, item: 'Power Herb' });
        expect(without).toBeLessThan(withHerb);
    });

    test('Solar Beam is exempt when the mon sets sun (Drought)', () => {
        const noSun = rate(SOLAR_BEAM, RIOLU, cm);
        const sun   = rate(SOLAR_BEAM, RIOLU, { ...cm, ability: 'DROUGHT' });
        expect(sun).toBeGreaterThan(noSun);
    });

    test('Solar Beam is exempt with own Desolate Land (own-only sun)', () => {
        const noSun = rate(SOLAR_BEAM, RIOLU, cm);
        const sun   = rate(SOLAR_BEAM, RIOLU, { ...cm, ability: 'DESOLATE_LAND' });
        expect(sun).toBeGreaterThan(noSun);
    });

    const SUNNY_DAY = { id: 'MOVE_SUNNY_DAY', name: 'Sunny Day', category: 'DAMAGE_CATEGORY_STATUS', type: 'FIRE', power: 0, accuracy: 0, effect: 'EFFECT_SUNNY_DAY', additionalEffects: [], pp: 15, priority: 0 };

    test('Solar Beam is exempt when the mon itself runs Sunny Day', () => {
        const noSun = rate(SOLAR_BEAM, RIOLU, cm);
        const ownSun = rate(SOLAR_BEAM, RIOLU, { currentMoves: [r.MOVE_TACKLE, SUNNY_DAY], otherMoves: [] });
        expect(ownSun).toBeGreaterThan(noSun);
    });

    test('Solar Beam is exempt when a teammate provides sun (teamHasSun)', () => {
        const noSun = rate(SOLAR_BEAM, RIOLU, cm);
        const teamSun = rate(SOLAR_BEAM, RIOLU, { ...cm, teamHasSun: true });
        expect(teamSun).toBeGreaterThan(noSun);
    });

    test('teammate sun does NOT rescue Fly (only Solar moves benefit from sun)', () => {
        const flyTeamSun = rate(moves.MOVE_FLY, RIOLU, { ...cm, teamHasSun: true });
        const flyHerb    = rate(moves.MOVE_FLY, RIOLU, { ...cm, item: 'Power Herb' });
        expect(flyTeamSun).toBeLessThan(flyHerb);
    });

    test('Fly is NOT exempted by Drought (only Solar moves are) — still penalized vs Power Herb', () => {
        const flyDrought = rate(moves.MOVE_FLY, RIOLU, { ...cm, ability: 'DROUGHT' });
        const flyHerb    = rate(moves.MOVE_FLY, RIOLU, { ...cm, item: 'Power Herb' });
        expect(flyDrought).toBeLessThan(flyHerb);
    });
});

describe('T-013 — Meteor Beam / Power Herb combo', () => {
    const cm = { currentMoves: [r.MOVE_TACKLE], otherMoves: [] };
    const METEOR_BEAM = { ...TWO_TURN_BASE, id: 'MOVE_METEOR_BEAM', name: 'Meteor Beam', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'ROCK', power: 120, effect: 'EFFECT_TWO_TURNS_ATTACK' };

    test('Meteor Beam rates poorly with no Power Herb anywhere', () => {
        const none = rate(METEOR_BEAM, RIOLU, cm);
        const held = rate(METEOR_BEAM, RIOLU, { ...cm, item: 'Power Herb' });
        expect(none).toBeLessThan(held);
    });

    test('Meteor Beam is stimulated when a Power Herb is available in the bag (combo)', () => {
        const none      = rate(METEOR_BEAM, RIOLU, cm);
        const available = rate(METEOR_BEAM, RIOLU, { ...cm, powerHerbAvailable: true });
        expect(available).toBeGreaterThan(none);
        // and the available-in-bag boost matches the held-item value (combo recognised either way)
        const held = rate(METEOR_BEAM, RIOLU, { ...cm, item: 'Power Herb' });
        expect(available).toBeCloseTo(held, 5);
    });
});

describe('T-013 — weather-conditional moves (self / earlier teammate)', () => {
    const ELECTRO_SHOT = { ...TWO_TURN_BASE, id: 'MOVE_ELECTRO_SHOT', name: 'Electro Shot', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'ELECTRIC', power: 130, effect: 'EFFECT_TWO_TURNS_ATTACK' };
    const WEATHER_BALL = { ...TWO_TURN_BASE, id: 'MOVE_WEATHER_BALL', name: 'Weather Ball', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'NORMAL', power: 50, effect: 'EFFECT_WEATHER_BALL' };
    const THUNDER      = { ...TWO_TURN_BASE, id: 'MOVE_THUNDER', name: 'Thunder', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'ELECTRIC', power: 110, accuracy: 70, effect: 'EFFECT_HIT' };
    const BLIZZARD     = { ...TWO_TURN_BASE, id: 'MOVE_BLIZZARD', name: 'Blizzard', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'ICE', power: 110, accuracy: 70, effect: 'EFFECT_HIT' };
    const GROWTH       = { ...TWO_TURN_BASE, id: 'MOVE_GROWTH', name: 'Growth', category: 'DAMAGE_CATEGORY_STATUS', type: 'NORMAL', power: 0, accuracy: 0, effect: 'EFFECT_GROWTH' };
    const AURORA_VEIL  = { ...TWO_TURN_BASE, id: 'MOVE_AURORA_VEIL', name: 'Aurora Veil', category: 'DAMAGE_CATEGORY_STATUS', type: 'ICE', power: 0, accuracy: 0, effect: 'EFFECT_AURORA_VEIL' };
    // 2 damage moves (1 physical + 1 special, neither Normal) so status/boost gating doesn't interfere
    const dmg2 = { currentMoves: [r.MOVE_SURF, r.MOVE_EARTHQUAKE], otherMoves: [] };

    test('Electro Shot is MUY PREMIUM in rain — beats the no-rain Power-Herb case', () => {
        const none = rate(ELECTRO_SHOT, RIOLU, dmg2);
        const rain = rate(ELECTRO_SHOT, RIOLU, { ...dmg2, rain: true });
        const herb = rate(ELECTRO_SHOT, RIOLU, { ...dmg2, powerHerb: true });
        expect(rain).toBeGreaterThan(none);
        expect(herb).toBeGreaterThan(none);
        expect(rain).toBeGreaterThan(herb);
    });

    test('Weather Ball is much better under weather', () => {
        expect(rate(WEATHER_BALL, RIOLU, { ...dmg2, sun: true })).toBeGreaterThan(rate(WEATHER_BALL, RIOLU, dmg2));
    });

    test('Thunder is better in rain (100% accurate)', () => {
        expect(rate(THUNDER, RIOLU, { ...dmg2, rain: true })).toBeGreaterThan(rate(THUNDER, RIOLU, dmg2));
    });

    test('Blizzard is better in snow (100% accurate)', () => {
        expect(rate(BLIZZARD, RIOLU, { ...dmg2, snow: true })).toBeGreaterThan(rate(BLIZZARD, RIOLU, dmg2));
    });

    test('Growth reaches setup quality in sun', () => {
        expect(rate(GROWTH, RIOLU, { ...dmg2, sun: true })).toBeGreaterThan(rate(GROWTH, RIOLU, dmg2));
    });

    test('Aurora Veil is dead weight without snow and premium with it', () => {
        expect(rate(AURORA_VEIL, RIOLU, dmg2)).toBe(0);
        expect(rate(AURORA_VEIL, RIOLU, { ...dmg2, snow: true })).toBe(10);
    });
});

describe('T-013 — Belch needs a Berry', () => {
    const cm = { currentMoves: [r.MOVE_TACKLE], otherMoves: [] };

    test('Belch rates near-zero (last resort) without a Berry', () => {
        expect(rate(BELCH, RIOLU, cm)).toBeLessThanOrEqual(0.05);
    });

    test('Belch rates much higher with a Berry held', () => {
        const berry   = rate(BELCH, RIOLU, { ...cm, item: 'Sitrus Berry' });
        const noBerry = rate(BELCH, RIOLU, cm);
        expect(berry).toBeGreaterThan(noBerry);
        expect(berry).toBeGreaterThan(1);
    });
});
