'use strict';

// T-097 — doubles Pokémon rating: re-weighted bstRating (bulk↑/speed↓), doubles combo (TR / spread /
// redirection / Intimidate / Fake Out / speed control / terrain / weather / pivot), frailty + passive-wall
// penalties, and the own doubles tier scale. Owner-validated design + calibration.

const { bstRatingDoubles, computeComboBonusDoubles, tierFromRatingDoubles, ratePokemonDoubles } = require('../../rating');

describe('bstRatingDoubles — bulk↑ / speed↓ re-weighting', () => {
    test('OFFENSIVE weights offence 0.5 / def 0.25 / speed 0.25', () => {
        expect(bstRatingDoubles({ offensePower: 10, defensePower: 4, speedPower: 8 }, 'OFFENSIVE')).toBeCloseTo(10 * 0.5 + 4 * 0.25 + 8 * 0.25, 5);
    });
    test('a bulky attacker out-rates a fast-frail one of equal offence (doubles values bulk over speed)', () => {
        const bulky = bstRatingDoubles({ offensePower: 8, defensePower: 8, speedPower: 3 }, 'BULKY');
        const frailFast = bstRatingDoubles({ offensePower: 8, defensePower: 3, speedPower: 9 }, 'OFFENSIVE');
        expect(bulky).toBeGreaterThan(frailFast);
    });
});

describe('computeComboBonusDoubles — doubles value credits (capped 1.0)', () => {
    const mon = (o = {}) => ({ parsedAbilities: [], baseSpeed: 80, learnset: [], teachables: [], ...o });
    const learns = (...mv) => ({ learnset: mv.map(m => ({ level: 1, move: m })) });
    const MOVES = { MOVE_EARTHQUAKE: { id: 'MOVE_EARTHQUAKE', power: 100, target: 'MOVE_TARGET_BOTH' } };

    test('Intimidate → credit', () => {
        expect(computeComboBonusDoubles(mon({ parsedAbilities: ['INTIMIDATE'] }), {}, { offensePower: 7 })).toBeGreaterThan(0);
    });
    test('redirection ability, Fake Out, terrain surge, weather setter each credit', () => {
        expect(computeComboBonusDoubles(mon({ parsedAbilities: ['LIGHTNING_ROD'] }), {}, { offensePower: 6 })).toBeGreaterThan(0);
        expect(computeComboBonusDoubles(mon(learns('MOVE_FAKE_OUT')), {}, { offensePower: 6 })).toBeGreaterThan(0);
        expect(computeComboBonusDoubles(mon({ parsedAbilities: ['GRASSY_SURGE'] }), {}, { offensePower: 6 })).toBeGreaterThan(0);
        expect(computeComboBonusDoubles(mon({ parsedAbilities: ['DROUGHT'] }), {}, { offensePower: 6 })).toBeGreaterThan(0);
    });
    test('a slow + strong mon gets the Trick Room credit; a plain mon gets nothing', () => {
        expect(computeComboBonusDoubles(mon({ baseSpeed: 30 }), {}, { offensePower: 7 })).toBeGreaterThanOrEqual(0.5);
        expect(computeComboBonusDoubles(mon({ baseSpeed: 100 }), {}, { offensePower: 7 })).toBe(0);
    });
    test('a spread move (potential) credits when offence is decent', () => {
        expect(computeComboBonusDoubles(mon(learns('MOVE_EARTHQUAKE')), MOVES, { offensePower: 6 })).toBeGreaterThan(0);
    });
    test('bonus is capped at 1.0 even when many credits stack', () => {
        const stacked = mon({ parsedAbilities: ['INTIMIDATE', 'GRASSY_SURGE'], baseSpeed: 20, ...learns('MOVE_FAKE_OUT', 'MOVE_EARTHQUAKE', 'MOVE_TAILWIND') });
        expect(computeComboBonusDoubles(stacked, MOVES, { offensePower: 8 })).toBeLessThanOrEqual(1.0);
    });
});

describe('tierFromRatingDoubles — own scale', () => {
    test('maps ratings to the calibrated doubles tiers', () => {
        expect(tierFromRatingDoubles(9.5)).toBe('AG');
        expect(tierFromRatingDoubles(8.5)).toBe('UBERS');
        expect(tierFromRatingDoubles(7.8)).toBe('OU');
        expect(tierFromRatingDoubles(7.0)).toBe('UU');
        expect(tierFromRatingDoubles(6.1)).toBe('RU');
        expect(tierFromRatingDoubles(5.0)).toBe('NU');
        expect(tierFromRatingDoubles(3.2)).toBe('PU');
        expect(tierFromRatingDoubles(1.5)).toBe('ZU');
    });
});

describe('ratePokemonDoubles — end to end (frailty penalty + support premium)', () => {
    // Minimal moves/abilities with doubles values; a fixed moveset (rng-free path).
    const abilities = {
        ABILITY_INTIMIDATE: { rating: 6, ratingDoubles: 9 },
        ABILITY_NONE: { rating: 0, ratingDoubles: 0 },
    };
    const moves = {
        MOVE_EARTHQUAKE: { id: 'MOVE_EARTHQUAKE', power: 100, target: 'MOVE_TARGET_BOTH', type: 'GROUND', category: 'DAMAGE_CATEGORY_PHYSICAL', rating: 8, ratingDoubles: 8 * 1.35 },
        MOVE_ROCK_SLIDE: { id: 'MOVE_ROCK_SLIDE', power: 75, target: 'MOVE_TARGET_BOTH', type: 'ROCK', category: 'DAMAGE_CATEGORY_PHYSICAL', rating: 7, ratingDoubles: 7 * 1.35 },
    };
    const base = { parsedAbilities: ['NONE'], learnset: [], teachables: [], evolutionData: {} };
    const bulkyIntim = { ...base, id: 'A', parsedAbilities: ['INTIMIDATE'], baseHP: 110, baseAttack: 120, baseDefense: 110, baseSpAttack: 60, baseSpDefense: 110, baseSpeed: 60, learnset: [{ level: 1, move: 'MOVE_EARTHQUAKE' }, { level: 1, move: 'MOVE_ROCK_SLIDE' }] };
    const frailFast = { ...base, id: 'B', baseHP: 60, baseAttack: 130, baseDefense: 35, baseSpAttack: 60, baseSpDefense: 40, baseSpeed: 150 };

    test('a bulky Intimidate spread attacker out-rates a frail fast glass cannon in doubles', () => {
        const a = ratePokemonDoubles(bulkyIntim, moves, abilities, [], ['MOVE_EARTHQUAKE', 'MOVE_ROCK_SLIDE']).ratingDoubles;
        const b = ratePokemonDoubles(frailFast, moves, abilities, [], ['MOVE_EARTHQUAKE', 'MOVE_ROCK_SLIDE']).ratingDoubles;
        expect(a).toBeGreaterThan(b);
    });
    test('returns a tierDoubles from the own scale', () => {
        const r = ratePokemonDoubles(bulkyIntim, moves, abilities, [], ['MOVE_EARTHQUAKE', 'MOVE_ROCK_SLIDE']);
        expect(typeof r.ratingDoubles).toBe('number');
        expect(typeof r.tierDoubles).toBe('string');
    });
});
