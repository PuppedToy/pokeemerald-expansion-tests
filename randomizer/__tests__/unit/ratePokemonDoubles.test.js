'use strict';

// T-097 — doubles Pokémon rating: re-weighted bstRating (bulk↑/speed↓), doubles combo (TR / spread /
// redirection / Intimidate / Fake Out / speed control / terrain / weather / pivot), frailty + passive-wall
// penalties, and the own doubles tier scale. Owner-validated design + calibration.

const { bstRatingDoubles, computeComboBonusDoubles, tierFromRatingDoubles, ratePokemonDoubles, rateMoveDoubles, rateAbilityDoubles, rateAbilitySingles, supportRating, supportTierDoubles, isDedicatedSupport } = require('../../rating');
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

describe('T-141 Phase 3 — support = corpus-weighted RATING with an offensive-tier penalty; its own tier + tag', () => {
    const learns = (...mv) => mv.map(m => ({ level: 1, move: m }));

    test('tool points are CAPPED so a ubiquitous tool (Intimidate 43) cannot dominate', () => {
        expect(supportRating({ parsedAbilities: ['INTIMIDATE'], learnset: [], teachables: [] }, 'RU')).toBeLessThanOrEqual(8);
    });
    test('offensive-tier penalty: high UNUSED offence keeps support value; a real OU+ attacker is discounted', () => {
        const kit = { parsedAbilities: ['HOSPITALITY'], learnset: learns('MOVE_RAGE_POWDER', 'MOVE_HELPING_HAND', 'MOVE_TRICK_ROOM'), teachables: [] };
        const asSupport = supportRating(kit, 'RU');    // offensively weak (Sinistcha-like) → no penalty
        const asAttacker = supportRating(kit, 'UBERS'); // same kit but a genuine Ubers threat → penalised
        expect(asSupport).toBeGreaterThan(asAttacker + 10);
    });
    // viable BST (≥ OU support-min 440) so the RATING, not the BST floor, sets the tier.
    const viable = { baseHP: 70, baseAttack: 67, baseDefense: 85, baseSpAttack: 77, baseSpDefense: 75, baseSpeed: 116 }; // 490 (Whimsicott-like)
    test('supportTierDoubles maps the rating to OU / UU / RU / null (viable BST)', () => {
        const strong = { ...viable, parsedAbilities: ['PRANKSTER'], learnset: learns('MOVE_TAILWIND', 'MOVE_ENCORE', 'MOVE_HELPING_HAND', 'MOVE_TAUNT'), teachables: [] };
        expect(supportTierDoubles(strong, 'RU')).toBe('OU');
        expect(supportTierDoubles({ ...viable, parsedAbilities: [], learnset: learns('MOVE_TAILWIND'), teachables: [] }, 'RU')).toBeNull(); // lone tool → not a support
    });
    test('a frail pre-evo with a big support kit is NOT a viable support (BST floor)', () => {
        const frailPreEvo = { baseHP: 41, baseAttack: 50, baseDefense: 40, baseSpAttack: 40, baseSpDefense: 70, baseSpeed: 30, parsedAbilities: ['PRANKSTER'], learnset: learns('MOVE_TAILWIND', 'MOVE_ENCORE', 'MOVE_HELPING_HAND'), teachables: [] }; // BST 271
        expect(supportTierDoubles(frailPreEvo, 'RU')).toBeNull();
    });
    test('a good OU attacker with a couple of support tools is NOT a dedicated support (owner rule)', () => {
        const ouAttacker = { ...viable, parsedAbilities: ['NONE'], ratingDoubles: 7.8, learnset: learns('MOVE_FAKE_OUT', 'MOVE_WIDE_GUARD', 'MOVE_EARTHQUAKE'), teachables: [] };
        expect(isDedicatedSupport(ouAttacker)).toBe(false); // OU penalty (10) cancels its 2 capped tools (16) → below RU bar
    });

    // End-to-end: support as its own doubles tier + the "support" tag.
    const abilities = { ABILITY_NONE: { rating: 0, ratingDoubles: 0 }, ABILITY_HOSPITALITY: { rating: 0, ratingDoubles: 6 } };
    const mv = (id) => ({ id, power: 0, target: 'MOVE_TARGET_USER', type: 'NORMAL', category: 'DAMAGE_CATEGORY_STATUS', rating: 1, ratingDoubles: 1 });
    const moves = { MOVE_RAGE_POWDER: mv('MOVE_RAGE_POWDER'), MOVE_TRICK_ROOM: mv('MOVE_TRICK_ROOM'), MOVE_HELPING_HAND: mv('MOVE_HELPING_HAND') };
    // Sinistcha-like: high SpA it never uses (weak offensive set) + a strong support kit.
    const sinistcha = { id: 'S', parsedAbilities: ['HOSPITALITY'], baseHP: 71, baseAttack: 60, baseDefense: 106, baseSpAttack: 121, baseSpDefense: 106, baseSpeed: 70, learnset: learns('MOVE_RAGE_POWDER', 'MOVE_TRICK_ROOM', 'MOVE_HELPING_HAND'), teachables: [], evolutionData: {} };
    test('a support-dominant mon gets the support TIER + tag (Sinistcha: offensively RU, support OU)', () => {
        const r = ratePokemonDoubles(sinistcha, moves, abilities, [], ['MOVE_RAGE_POWDER', 'MOVE_TRICK_ROOM', 'MOVE_HELPING_HAND']);
        expect(r.supportTierDoubles).toBe('OU');
        expect(r.isSupportDoubles).toBe(true);  // support strictly beats its offensive tier → tagged
        expect(r.tierDoubles).toBe('OU');        // worth its support tier
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
