'use strict';

// T-097 — doubles Pokémon rating: re-weighted bstRating (bulk↑/speed↓), doubles combo (TR / spread /
// redirection / Intimidate / Fake Out / speed control / terrain / weather / pivot), frailty + passive-wall
// penalties, and the own doubles tier scale. Owner-validated design + calibration.

const { bstRatingDoubles, computeComboBonusDoubles, tierFromRatingDoubles, ratePokemonDoubles, rateMoveDoubles, rateAbilityDoubles, rateAbilitySingles, supportScore, isDedicatedSupport } = require('../../rating');

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

describe('T-141 Phase 1 — doubles ability & move rating fixes', () => {
    test('Hospitality is floored in doubles (dedicated ally support), unlike its neutral singles value', () => {
        expect(rateAbilityDoubles('ABILITY_HOSPITALITY', { rating: 5 })).toBeGreaterThanOrEqual(6);
    });
    test('Defiant / Competitive rise in doubles (punish the ubiquitous Intimidate)', () => {
        expect(rateAbilityDoubles('ABILITY_DEFIANT', { rating: 5 })).toBeGreaterThanOrEqual(7);
        expect(rateAbilityDoubles('ABILITY_COMPETITIVE', { rating: 5 })).toBeGreaterThanOrEqual(7);
    });
    test('Encore gets a doubles disruption floor', () => {
        const encore = { id: 'MOVE_ENCORE', power: 0, effect: 'EFFECT_ENCORE', target: 'MOVE_TARGET_SELECTED', category: 'DAMAGE_CATEGORY_STATUS', type: 'NORMAL', accuracy: 100, pp: 5 };
        expect(rateMoveDoubles(encore)).toBeGreaterThanOrEqual(6.5);
    });
    test('Hospitality earns a doubles combo credit (ally-support ability, like Friend Guard)', () => {
        const mon = { parsedAbilities: ['HOSPITALITY'], baseSpeed: 70, learnset: [], teachables: [] };
        expect(computeComboBonusDoubles(mon, {}, { offensePower: 4 })).toBeGreaterThan(0);
    });
    test('Prankster + a support move earns a combo credit; Prankster alone or the move alone does not', () => {
        const prankSupport = { parsedAbilities: ['PRANKSTER'], baseSpeed: 70, learnset: [{ level: 1, move: 'MOVE_THUNDER_WAVE' }], teachables: [] };
        const prankAlone = { parsedAbilities: ['PRANKSTER'], baseSpeed: 70, learnset: [], teachables: [] };
        const twaveAlone = { parsedAbilities: ['NONE'], baseSpeed: 70, learnset: [{ level: 1, move: 'MOVE_THUNDER_WAVE' }], teachables: [] };
        expect(computeComboBonusDoubles(prankSupport, {}, { offensePower: 3 })).toBeGreaterThan(0);
        expect(computeComboBonusDoubles(prankAlone, {}, { offensePower: 3 })).toBe(0);
        expect(computeComboBonusDoubles(twaveAlone, {}, { offensePower: 3 })).toBe(0);
    });
});

describe('T-141 Phase 2 — singles clear-error corrections (ally-only abilities are dead in singles)', () => {
    test('Commander / Hospitality / Costar / Power Spot are corrected to 0 in singles', () => {
        expect(rateAbilitySingles('ABILITY_COMMANDER', { rating: 10 })).toBe(0);
        expect(rateAbilitySingles('ABILITY_HOSPITALITY', { rating: 5 })).toBe(0);
        expect(rateAbilitySingles('ABILITY_COSTAR', { rating: 5 })).toBe(0);
        expect(rateAbilitySingles('ABILITY_POWER_SPOT', { rating: 2 })).toBe(0);
    });
    test('a normal (self-affecting) ability keeps its singles rating', () => {
        expect(rateAbilitySingles('ABILITY_INTIMIDATE', { rating: 7 })).toBe(7);
    });
    test('the singles correction does not sink the doubles value (Hospitality still floors to 6)', () => {
        const corrected = { rating: rateAbilitySingles('ABILITY_HOSPITALITY', { rating: 5 }) };
        expect(rateAbilityDoubles('ABILITY_HOSPITALITY', corrected)).toBeGreaterThanOrEqual(6);
    });
});

describe('T-141 Phase 3 — dedicated-support signature bonus (doubles quality lift)', () => {
    const learns = (...mv) => mv.map(m => ({ level: 1, move: m }));

    test('supportScore sums the support kit (redirection + ally ability)', () => {
        const mon = { parsedAbilities: ['HOSPITALITY'], learnset: learns('MOVE_RAGE_POWDER'), teachables: [] };
        expect(supportScore(mon, {})).toBeGreaterThanOrEqual(0.9 + 0.6);
    });
    test('a mon with no support kit scores 0', () => {
        expect(supportScore({ parsedAbilities: ['BLAZE'], learnset: learns('MOVE_FLAMETHROWER'), teachables: [] }, {})).toBe(0);
    });

    // Two identical low-offense stat lines; only the support kit differs → the support mon rates higher.
    const abilities = { ABILITY_NONE: { rating: 0, ratingDoubles: 0 }, ABILITY_HOSPITALITY: { rating: 0, ratingDoubles: 6 } };
    const moves = {
        MOVE_SLASH: { id: 'MOVE_SLASH', power: 70, target: 'MOVE_TARGET_SELECTED', type: 'NORMAL', category: 'DAMAGE_CATEGORY_PHYSICAL', rating: 5, ratingDoubles: 5 },
        MOVE_RAGE_POWDER: { id: 'MOVE_RAGE_POWDER', power: 0, target: 'MOVE_TARGET_USER', type: 'BUG', category: 'DAMAGE_CATEGORY_STATUS', rating: 1, ratingDoubles: 7 },
        MOVE_PROTECT: { id: 'MOVE_PROTECT', power: 0, target: 'MOVE_TARGET_USER', type: 'NORMAL', category: 'DAMAGE_CATEGORY_STATUS', rating: 4.5, ratingDoubles: 5.5 },
        MOVE_RECOVER: { id: 'MOVE_RECOVER', power: 0, target: 'MOVE_TARGET_USER', type: 'NORMAL', category: 'DAMAGE_CATEGORY_STATUS', rating: 5, ratingDoubles: 5 },
    };
    const stat = { baseHP: 80, baseAttack: 60, baseDefense: 100, baseSpAttack: 60, baseSpDefense: 100, baseSpeed: 70, teachables: [], evolutionData: {} };
    const plain = { ...stat, id: 'P', parsedAbilities: ['NONE'], learnset: learns('MOVE_SLASH') };
    const supp = { ...stat, id: 'S', parsedAbilities: ['HOSPITALITY'], learnset: learns('MOVE_RAGE_POWDER', 'MOVE_PROTECT', 'MOVE_RECOVER') };

    test('a low-offense dedicated support out-rates an identical-stat non-support mon in doubles', () => {
        const rPlain = ratePokemonDoubles(plain, moves, abilities, [], ['MOVE_SLASH']).ratingDoubles;
        const rSupp = ratePokemonDoubles(supp, moves, abilities, [], ['MOVE_RAGE_POWDER', 'MOVE_PROTECT', 'MOVE_RECOVER']).ratingDoubles;
        expect(rSupp).toBeGreaterThan(rPlain);
    });
    test('a full support kit scores above the generic combo cap (1.0) — the headroom the dedicated-support lift unlocks', () => {
        // Sinistcha-like full kit: Hospitality + Rage Powder + Protect + Recover → well past the 1.0 combo cap.
        expect(supportScore(supp, moves)).toBeGreaterThan(1.0);
    });
    test('isDedicatedSupport: a STRONG kit qualifies regardless of offense (Sinistcha, 121 SpA); an attacker with one tool does not (Landorus-T)', () => {
        const sinistcha = { parsedAbilities: ['HOSPITALITY'], baseAttack: 60, baseSpAttack: 121, learnset: learns('MOVE_RAGE_POWDER'), teachables: [] };
        const landoT = { parsedAbilities: ['INTIMIDATE'], baseAttack: 145, baseSpAttack: 105, learnset: [], teachables: [] };
        expect(isDedicatedSupport(sinistcha)).toBe(true);
        expect(isDedicatedSupport(landoT)).toBe(false);
    });
});

describe('ratePokemonDoubles — BST floor (T-140, nuzlocke pacing parity with singles)', () => {
    // A neutral ability (no offensive multiplier, no doubles-combo credit) so rawBST == the true BST.
    // (A ['NONE']-only mon would trip the TRUANT/DEFEATIST/SLOW_START `every()` penalties and get a
    // deflated effective BST — an artifact of using NONE, not how real mons behave.)
    const abilities = { ABILITY_PRESSURE: { rating: 3, ratingDoubles: 3 }, ABILITY_NONE: { rating: 0, ratingDoubles: 0 } };
    const moves = { MOVE_SLASH: { id: 'MOVE_SLASH', power: 70, target: 'MOVE_TARGET_SELECTED', type: 'NORMAL', category: 'DAMAGE_CATEGORY_PHYSICAL', rating: 5, ratingDoubles: 5 } };
    const base = { parsedAbilities: ['PRESSURE'], teachables: [], evolutionData: {}, learnset: [{ level: 1, move: 'MOVE_SLASH' }] };
    const { TIER_SEQ } = require('../../constants');
    const set = ['MOVE_SLASH'];

    // A 660-BST frail glass cannon: heavy frailty penalty, no support/combo. Its computed doubles rating
    // lands far below LEGEND — but the BST floor must still guarantee LEGEND, exactly as singles does.
    const frailGod = { ...base, id: 'G', baseHP: 70, baseAttack: 170, baseDefense: 40, baseSpAttack: 170, baseSpDefense: 40, baseSpeed: 170 }; // BST 660
    test('a high-BST (660) frail glass cannon is floored to LEGEND in doubles', () => {
        expect(ratePokemonDoubles(frailGod, moves, abilities, [], set).tierDoubles).toBe('LEGEND');
    });

    // A 600-BST frail attacker → at least OU (the OU BST floor).
    const ouBudget = { ...base, id: 'O', baseHP: 80, baseAttack: 150, baseDefense: 55, baseSpAttack: 150, baseSpDefense: 55, baseSpeed: 110 }; // BST 600
    test('a 600-BST frail attacker is floored to at least OU', () => {
        const t = ratePokemonDoubles(ouBudget, moves, abilities, [], set).tierDoubles;
        expect(TIER_SEQ.indexOf(t)).toBeGreaterThanOrEqual(TIER_SEQ.indexOf('OU')); // OU or better (TIER_SEQ: weakest→strongest)
    });

    // A genuinely weak, low-BST mon (240) is NOT floored up.
    const weakling = { ...base, id: 'W', baseHP: 40, baseAttack: 40, baseDefense: 40, baseSpAttack: 40, baseSpDefense: 40, baseSpeed: 40 };
    test('a low-BST mon gets no spurious BST floor', () => {
        const t = ratePokemonDoubles(weakling, moves, abilities, [], set).tierDoubles;
        expect(TIER_SEQ.indexOf(t)).toBeLessThanOrEqual(TIER_SEQ.indexOf('NU')); // stays NU-or-worse, not floored up
    });
});
