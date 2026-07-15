'use strict';

// T-097 — doubles Pokémon rating: re-weighted bstRating (bulk↑/speed↓), doubles combo (TR / spread /
// redirection / Intimidate / Fake Out / speed control / terrain / weather / pivot), frailty + passive-wall
// penalties, and the own doubles tier scale. Owner-validated design + calibration.

const { bstRatingDoubles, computeComboBonusDoubles, tierFromRatingDoubles, ratePokemonDoubles, rateMoveDoubles, rateAbilityDoubles, rateAbilitySingles, supportSignals, isDedicatedSupport } = require('../../rating');
const { TIER_SEQ: _TIER_SEQ } = require('../../constants');

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

describe('T-141 Phase 3 — dedicated support = a COMBINATION of top-tier support signals (count-based)', () => {
    const learns = (...mv) => mv.map(m => ({ level: 1, move: m }));

    test('supportSignals counts DISTINCT support categories (Whimsicott: Prankster + Tailwind + Encore = 3)', () => {
        const whimsicott = { parsedAbilities: ['PRANKSTER'], learnset: learns('MOVE_TAILWIND', 'MOVE_ENCORE'), teachables: [] };
        expect(supportSignals(whimsicott)).toBe(3);
    });
    test('Amoonguss (Rage Powder + Regenerator + Spore) = 3 signals; Farigiraf (Armor Tail + TR + Helping Hand) = 3', () => {
        expect(supportSignals({ parsedAbilities: ['REGENERATOR'], learnset: learns('MOVE_RAGE_POWDER', 'MOVE_SPORE'), teachables: [] })).toBe(3);
        expect(supportSignals({ parsedAbilities: ['ARMOR_TAIL'], learnset: learns('MOVE_TRICK_ROOM', 'MOVE_HELPING_HAND'), teachables: [] })).toBe(3);
    });
    test('redundant tools within a category count ONCE (Follow Me + Rage Powder = 1 redirection signal)', () => {
        expect(supportSignals({ parsedAbilities: [], learnset: learns('MOVE_FOLLOW_ME', 'MOVE_RAGE_POWDER'), teachables: [] })).toBe(1);
    });
    test('a no-support mon = 0 signals', () => {
        expect(supportSignals({ parsedAbilities: ['BLAZE'], learnset: learns('MOVE_FLAMETHROWER'), teachables: [] })).toBe(0);
    });

    test('≥2 signals = dedicated support (offense IRRELEVANT — Sinistcha 121 SpA IS support); a 1-signal attacker is NOT', () => {
        const sinistcha = { parsedAbilities: ['HOSPITALITY'], baseAttack: 60, baseSpAttack: 121, learnset: learns('MOVE_RAGE_POWDER'), teachables: [] }; // ally + redirection = 2
        const landoT = { parsedAbilities: ['INTIMIDATE'], baseAttack: 145, baseSpAttack: 105, learnset: learns('MOVE_EARTHQUAKE'), teachables: [] };    // Intimidate only = 1
        const tailwindAtk = { parsedAbilities: ['NONE'], baseAttack: 130, baseSpAttack: 60, learnset: learns('MOVE_TAILWIND', 'MOVE_BRAVE_BIRD'), teachables: [] }; // Tailwind only = 1 (half-support)
        expect(isDedicatedSupport(sinistcha)).toBe(true);
        expect(isDedicatedSupport(landoT)).toBe(false);
        expect(isDedicatedSupport(tailwindAtk)).toBe(false);
    });
    test('a Spore-only attacker (Brute Bonnet case) is NOT dedicated support — 1 signal', () => {
        expect(isDedicatedSupport({ parsedAbilities: ['PROTOSYNTHESIS'], baseAttack: 127, baseSpAttack: 60, learnset: learns('MOVE_SPORE', 'MOVE_SUCKER_PUNCH'), teachables: [] })).toBe(false);
    });

    // Tier by count: ≥3 → OU floor, 2 → UU floor, capped at OU. (Uses low move/ability ratings so the base
    // rating is well below the floor — proving the FLOOR sets the tier.)
    const abilities = { ABILITY_NONE: { rating: 0, ratingDoubles: 0 }, ABILITY_PRANKSTER: { rating: 8, ratingDoubles: 8 } };
    const mv = (id) => ({ id, power: 0, target: 'MOVE_TARGET_USER', type: 'NORMAL', category: 'DAMAGE_CATEGORY_STATUS', rating: 1, ratingDoubles: 1 });
    const moves = { MOVE_TAILWIND: mv('MOVE_TAILWIND'), MOVE_ENCORE: mv('MOVE_ENCORE'), MOVE_HELPING_HAND: mv('MOVE_HELPING_HAND') };
    const frailStat = { baseHP: 60, baseAttack: 50, baseDefense: 55, baseSpAttack: 67, baseSpDefense: 85, baseSpeed: 116, teachables: [], evolutionData: {} };
    test('3-signal support floors to OU; 2-signal to at least UU', () => {
        const three = { ...frailStat, id: 'W', parsedAbilities: ['PRANKSTER'], learnset: learns('MOVE_TAILWIND', 'MOVE_ENCORE') }; // prankster+tailwind+encore
        const two = { ...frailStat, id: 'T', parsedAbilities: ['NONE'], learnset: learns('MOVE_TAILWIND', 'MOVE_HELPING_HAND') };  // tailwind+helping hand
        const rThree = ratePokemonDoubles(three, moves, abilities, [], ['MOVE_TAILWIND', 'MOVE_ENCORE']);
        const rTwo = ratePokemonDoubles(two, moves, abilities, [], ['MOVE_TAILWIND', 'MOVE_HELPING_HAND']);
        expect(rThree.tierDoubles).toBe('OU');
        expect(_TIER_SEQ.indexOf(rTwo.tierDoubles)).toBeGreaterThanOrEqual(_TIER_SEQ.indexOf('UU')); // UU or better
        expect(_TIER_SEQ.indexOf(rThree.tierDoubles)).toBeLessThanOrEqual(_TIER_SEQ.indexOf('UBERS') - 1); // capped at OU (not Ubers)
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
