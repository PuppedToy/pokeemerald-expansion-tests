'use strict';

// T-129 — items respect roles. A Choice item (Band/Specs/Scarf) locks the holder into the first move it
// uses, so it must NEVER be scored for a mon whose set carries a move it can't be locked into: any STATUS
// move (hazards / setup / status / recovery) or a REACTIVE damaging move (Counter / Mirror Coat / Metal
// Burst). Regression for Champion Steven's Solgaleo = Choice Specs + Stealth Rock (and + Metal Burst).

const { rateItemForAPokemon, rateMove } = require('../../rating');
const rng = require('../../rng');
const moves = require('../fixtures/miniMoves');
const { STARMIE, MACHAMP, BLISSEY } = require('../fixtures/miniPokes');

const rated = mv => ({ ...mv, rating: rateMove(mv) });
const set = (...ids) => ids.map(id => rated(moves[id]));
// deviation=0 → the rater's random deviation term collapses to 1, so results are deterministic.
const rate = (item, poke, moveset) => rateItemForAPokemon(item, poke, null, moveset, 50, 5, 0);

describe('rateItemForAPokemon — Choice items respect roles (T-129)', () => {
    test('Choice Specs rates > 0 for a pure special-attacking set', () => {
        const clean = set('MOVE_SURF', 'MOVE_THUNDERBOLT', 'MOVE_FLAMETHROWER', 'MOVE_BLIZZARD');
        expect(rate('Choice Specs', STARMIE, clean)).toBeGreaterThan(0);
    });

    test('Choice Specs = 0 when the set carries a hazard/status move (Solgaleo + Stealth Rock)', () => {
        const withRocks = set('MOVE_SURF', 'MOVE_THUNDERBOLT', 'MOVE_FLAMETHROWER', 'MOVE_STEALTH_ROCK');
        expect(rate('Choice Specs', STARMIE, withRocks)).toBe(0);
    });

    test('Choice Scarf = 0 with a status move (Toxic)', () => {
        const withToxic = set('MOVE_SURF', 'MOVE_THUNDERBOLT', 'MOVE_FLAMETHROWER', 'MOVE_TOXIC');
        expect(rate('Choice Scarf', STARMIE, withToxic)).toBe(0);
    });

    test('Choice Band = 0 with a reactive damaging move (Counter / Mirror Coat / Metal Burst)', () => {
        const withCounter = set('MOVE_CLOSE_COMBAT', 'MOVE_EARTHQUAKE', 'MOVE_KNOCK_OFF', 'MOVE_COUNTER');
        expect(rate('Choice Band', MACHAMP, withCounter)).toBe(0);
    });

    test('Choice Band rates > 0 for a pure physical-attacking set', () => {
        const clean = set('MOVE_CLOSE_COMBAT', 'MOVE_EARTHQUAKE', 'MOVE_KNOCK_OFF', 'MOVE_MEGA_PUNCH');
        expect(rate('Choice Band', MACHAMP, clean)).toBeGreaterThan(0);
    });

    test('a damaging pivot move (U-turn) does NOT block a Choice item', () => {
        const pivot = set('MOVE_CLOSE_COMBAT', 'MOVE_EARTHQUAKE', 'MOVE_KNOCK_OFF', 'MOVE_U_TURN');
        expect(rate('Choice Band', MACHAMP, pivot)).toBeGreaterThan(0);
    });
});

// T-147 — anti-support tech (Safety Goggles vs Rage Powder/Spore; Covert Cloak vs Fake Out/secondaries) is
// worth much more on an OFFENSIVE doubles mon; a dedicated support does not get the bump.
describe('rateItemForAPokemon — anti-support items scale up on offensive doubles mons (T-147)', () => {
    const dbl = (item, poke, moveset, doubles) => rateItemForAPokemon(item, poke, null, moveset, 50, 5, 0, doubles);
    const atkSet = set('MOVE_SURF', 'MOVE_THUNDERBOLT', 'MOVE_FLAMETHROWER', 'MOVE_BLIZZARD');

    test('Safety Goggles: worth more on an offensive doubles mon than in singles', () => {
        expect(dbl('Safety Goggles', STARMIE, atkSet, true)).toBeGreaterThan(dbl('Safety Goggles', STARMIE, atkSet, false));
        expect(dbl('Safety Goggles', STARMIE, atkSet, false)).toBeGreaterThan(0);
    });

    test('Covert Cloak: marginal in singles, a real pick on an offensive doubles mon', () => {
        expect(dbl('Covert Cloak', STARMIE, atkSet, true)).toBeGreaterThan(dbl('Covert Cloak', STARMIE, atkSet, false));
        expect(dbl('Covert Cloak', STARMIE, atkSet, true)).toBeGreaterThan(0);
    });

    test('a dedicated support does NOT get the offensive-doubles bump', () => {
        const support = { ...STARMIE, isSupportDoubles: true };
        expect(dbl('Safety Goggles', support, atkSet, true)).toBe(dbl('Safety Goggles', STARMIE, atkSet, false));
    });
});

// T-160 — a crit item (Razor Claw) is useless on a mon that already carries an always-crit move; the
// zeroing must cover ALL six always-crit moves, incl. Flower Trick / Zippy Zap (previously missed).
describe('rateItemForAPokemon — crit items are 0 on an always-crit set (T-160)', () => {
    const flowerTrick = { ...rated(moves.MOVE_MEGA_PUNCH), id: 'MOVE_FLOWER_TRICK', alwaysCriticalHit: 'TRUE' };
    // A high-crit move (Stone Edge id) pushes razorClawRating above its 6 floor, so Razor Claw would
    // otherwise score > 0 — isolating the always-crit zeroing.
    const highCrit = { ...rated(moves.MOVE_EARTHQUAKE), id: 'MOVE_STONE_EDGE' };
    const withAlwaysCrit = [flowerTrick, highCrit, rated(moves.MOVE_CLOSE_COMBAT), rated(moves.MOVE_KNOCK_OFF)];

    test('Razor Claw = 0 when the set has Flower Trick (always crit)', () => {
        expect(rate('Razor Claw', MACHAMP, withAlwaysCrit)).toBe(0);
    });
});

// T-159 — Weakness Policy raises Atk AND SpAtk after a super-effective hit, so it is dead weight on a
// mon with no move that scales with those stats (a pure doubles/singles support, or a mon whose only
// "damage" is fixed / reactive / target-stat based). It must score 0 there instead of on bulk alone.
describe('rateItemForAPokemon — Weakness Policy needs an offense-boosted move (T-159)', () => {
    beforeEach(() => rng.seed(42));

    test('Weakness Policy = 0 on a pure-support set (no damaging move)', () => {
        const pureStatus = set('MOVE_TOXIC', 'MOVE_PROTECT', 'MOVE_WILL_O_WISP', 'MOVE_ROOST');
        expect(rate('Weakness Policy', BLISSEY, pureStatus)).toBe(0);
    });

    test('Weakness Policy > 0 once the set carries a real attacking move', () => {
        const withAttack = set('MOVE_FLAMETHROWER', 'MOVE_PROTECT', 'MOVE_WILL_O_WISP', 'MOVE_ROOST');
        expect(rate('Weakness Policy', BLISSEY, withAttack)).toBeGreaterThan(0);
    });

    test('Weakness Policy = 0 when the only damage is offense-independent (Counter)', () => {
        const reactiveOnly = set('MOVE_COUNTER', 'MOVE_PROTECT', 'MOVE_TOXIC', 'MOVE_ROOST');
        expect(rate('Weakness Policy', MACHAMP, reactiveOnly)).toBe(0);
    });
});

// T-179 — coverage of previously-untreated items and re-derivation of the flat/rng-only handlers. Self-
// contained move stubs + a `mon()` builder (the shared fixtures don't expose every stat/type combo needed).
describe('rateItemForAPokemon — T-179 item coverage', () => {
    beforeEach(() => rng.seed(7));
    // signature: (item, poke, ability, moveset, level, bagSize, deviation, doubles, ctx)
    const r = (item, poke, moveset = [], ability = null, doubles = false, ctx = {}) =>
        rateItemForAPokemon(item, poke, ability, moveset, 50, 5, 0, doubles, ctx);
    const mon = (o = {}) => ({
        id: 'SPECIES_TEST', name: 'Test',
        baseHP: 80, baseAttack: 100, baseDefense: 80, baseSpAttack: 100, baseSpDefense: 80, baseSpeed: 80,
        parsedTypes: ['NORMAL'], parsedAbilities: ['NONE'], evolutionData: { isNFE: false }, ...o,
    });
    const phys = (id, type = 'NORMAL', acc = 100, rating = 5) =>
        ({ id, type, category: 'DAMAGE_CATEGORY_PHYSICAL', accuracy: acc, power: 90, effect: 'EFFECT_HIT', rating });
    const spec = (id, type = 'NORMAL', acc = 100, rating = 5) =>
        ({ id, type, category: 'DAMAGE_CATEGORY_SPECIAL', accuracy: acc, power: 90, effect: 'EFFECT_HIT', rating });
    const status = (id, effect = 'EFFECT_HIT') =>
        ({ id, type: 'NORMAL', category: 'DAMAGE_CATEGORY_STATUS', accuracy: 0, rating: 3, effect });

    const physAttacker = mon({ baseAttack: 130, baseSpAttack: 60 });
    const specAttacker = mon({ baseAttack: 60, baseSpAttack: 130, baseSpeed: 115 });
    const slowSpec = mon({ baseAttack: 60, baseSpAttack: 130, baseSpeed: 30 });
    const wall = mon({ baseHP: 200, baseDefense: 130, baseSpDefense: 130, baseAttack: 40, baseSpAttack: 60, baseSpeed: 40 });

    test('no used-pool item logs a "not rated" warning anymore', () => {
        const items = require('../../items');
        const { displayNameToItemConst } = require('../../itemRandomizer');
        const itemsJson = require('../../items.json');
        const toDisplay = {};
        for (const dn of Object.keys(itemsJson)) toDisplay[displayNameToItemConst(dn)] = dn;
        const ids = [
            ...Object.keys(items.plates), ...items.gems, ...items.premiumItems, ...items.otherLockedItems,
            ...items.goodItemPool, ...items.averageItemPool, ...Object.values(items.protectionBerries),
        ];
        const warn = jest.spyOn(console, 'log').mockImplementation(() => {});
        const set4 = [phys('MOVE_A'), spec('MOVE_B'), status('MOVE_C'), phys('MOVE_D', 'ROCK', 90)];
        for (const id of ids) {
            const dn = toDisplay[id] || items && id.replace('ITEM_', '').toLowerCase();
            const display = toDisplay[id] || 'Heavy-Duty Boots';
            r(display, mon(), set4);
        }
        const warned = warn.mock.calls.filter(c => String(c[0] || '').includes('not rated'));
        warn.mockRestore();
        expect(warned).toEqual([]);
    });

    // --- Type-hit stat items: immune holder → 0 ---
    test('Cell Battery: > 0 on a physical attacker neutral to Electric, 0 when Electric-immune', () => {
        expect(r('Cell Battery', physAttacker, [phys('MOVE_X')])).toBeGreaterThan(0);
        expect(r('Cell Battery', mon({ baseAttack: 130, parsedTypes: ['GROUND'] }), [phys('MOVE_X')])).toBe(0);
        expect(r('Cell Battery', mon({ baseAttack: 130 }), [phys('MOVE_X')], 'VOLT_ABSORB')).toBe(0);
    });
    test('Absorb Bulb: > 0 on a special attacker, 0 when Water-immune (Water Absorb)', () => {
        expect(r('Absorb Bulb', specAttacker, [spec('MOVE_X')])).toBeGreaterThan(0);
        expect(r('Absorb Bulb', specAttacker, [spec('MOVE_X')], 'WATER_ABSORB')).toBe(0);
    });
    test('Snowball: > 0 on a physical attacker', () => {
        expect(r('Snowball', physAttacker, [phys('MOVE_X')])).toBeGreaterThan(0);
    });

    // --- Accuracy lenses ---
    test('Wide Lens: 0 with an all-accurate set + no Hustle, > 0 with an imprecise quality move', () => {
        expect(r('Wide Lens', physAttacker, [phys('MOVE_ACC', 'NORMAL', 100)])).toBe(0);
        expect(r('Wide Lens', physAttacker, [phys('MOVE_RS', 'ROCK', 90, 6)])).toBeGreaterThan(0);
    });
    test('Wide Lens: > 0 with Hustle even on an accurate set', () => {
        expect(r('Wide Lens', physAttacker, [phys('MOVE_ACC', 'NORMAL', 100)], 'HUSTLE')).toBeGreaterThan(0);
    });
    test('Zoom Lens: > 0 on a slow mon with an imprecise move, 0 on a fast mon', () => {
        expect(r('Zoom Lens', slowSpec, [spec('MOVE_FB', 'FIGHTING', 70, 6)])).toBeGreaterThan(0);
        expect(r('Zoom Lens', specAttacker, [spec('MOVE_FB', 'FIGHTING', 70, 6)])).toBe(0);
    });

    // --- Flat power boosters gated by attacking stat ---
    test('Muscle Band: > 0 on a physical attacker, 0 on a special attacker', () => {
        expect(r('Muscle Band', physAttacker, [phys('MOVE_X')])).toBeGreaterThan(0);
        expect(r('Muscle Band', specAttacker, [spec('MOVE_X')])).toBe(0);
    });
    test('Wise Glasses: > 0 on a special attacker, 0 on a physical attacker', () => {
        expect(r('Wise Glasses', specAttacker, [spec('MOVE_X')])).toBeGreaterThan(0);
        expect(r('Wise Glasses', physAttacker, [phys('MOVE_X')])).toBe(0);
    });

    // --- Pinch berries: reliable trigger unlocks the value ---
    test('Salac Berry: Endure/Sturdy scores higher than no trigger', () => {
        const withEndure = r('Salac Berry', physAttacker, [phys('MOVE_X'), status('MOVE_ENDURE', 'EFFECT_ENDURE')]);
        const noTrigger = r('Salac Berry', physAttacker, [phys('MOVE_X')]);
        expect(withEndure).toBeGreaterThan(noTrigger);
        expect(r('Salac Berry', physAttacker, [phys('MOVE_X')], 'STURDY')).toBeGreaterThan(noTrigger);
    });
    test('Liechi Berry: Unburden bumps a physical attacker', () => {
        const base = r('Liechi Berry', physAttacker, [phys('MOVE_X')]);
        expect(r('Liechi Berry', physAttacker, [phys('MOVE_X')], 'UNBURDEN')).toBeGreaterThan(base);
    });

    // --- Figy: corpus-backed defensive recovery, scales with bulk ---
    test('Figy Berry: > 0 and higher on a bulky mon than a frail one', () => {
        expect(r('Figy Berry', wall, [phys('MOVE_X')])).toBeGreaterThan(r('Figy Berry', physAttacker, [phys('MOVE_X')]));
        expect(r('Figy Berry', physAttacker, [phys('MOVE_X')])).toBeGreaterThan(0);
    });

    // --- Mental Herb: needs a status/setup move ---
    test('Mental Herb: higher with a status move than a pure attacker', () => {
        const withStatus = r('Mental Herb', wall, [status('MOVE_TRICK_ROOM', 'EFFECT_TRICK_ROOM'), spec('MOVE_X')]);
        const pureAtk = r('Mental Herb', physAttacker, [phys('MOVE_X'), phys('MOVE_Y')]);
        expect(withStatus).toBeGreaterThan(pureAtk);
    });

    // --- Trapping items: gated on a binding move ---
    test('Grip Claw / Binding Band: 0 without a binding move, > 0 with one', () => {
        expect(r('Grip Claw', wall, [phys('MOVE_X')])).toBe(0);
        expect(r('Grip Claw', wall, [phys('MOVE_FIRE_SPIN', 'FIRE'), status('MOVE_TOXIC', 'EFFECT_TOXIC')].map((m, i) => i === 0 ? { ...m, id: 'MOVE_FIRE_SPIN' } : m))).toBeGreaterThan(0);
        expect(r('Binding Band', wall, [{ ...phys('MOVE_BIND'), id: 'MOVE_BIND' }])).toBeGreaterThan(0);
    });

    // --- Trick-Room-only items ---
    test('Room Service: 0 without Trick Room, > 0 with a Trick Room move in the set', () => {
        expect(r('Room Service', slowSpec, [spec('MOVE_X')])).toBe(0);
        expect(r('Room Service', slowSpec, [spec('MOVE_X'), status('MOVE_TRICK_ROOM', 'EFFECT_TRICK_ROOM')])).toBeGreaterThan(0);
    });
    test('Room Service: > 0 when a teammate sets Trick Room (ctx.trickRoom)', () => {
        expect(r('Room Service', slowSpec, [spec('MOVE_X')], null, false, { trickRoom: true })).toBeGreaterThan(0);
    });

    // --- Blunder Policy: needs a shaky (≤85%) move ---
    test('Blunder Policy: 0 without a shaky move, > 0 with a ≤85% move', () => {
        expect(r('Blunder Policy', physAttacker, [phys('MOVE_ACC', 'NORMAL', 100)])).toBe(0);
        expect(r('Blunder Policy', physAttacker, [spec('MOVE_FB', 'FIGHTING', 70, 6)])).toBeGreaterThan(0);
    });

    // --- Quick Claw: only for slow mons ---
    test('Quick Claw: 0 on a fast mon, > 0 on a slow one', () => {
        expect(r('Quick Claw', mon({ baseSpeed: 130, baseAttack: 120 }), [phys('MOVE_X')])).toBe(0);
        expect(r('Quick Claw', slowSpec, [spec('MOVE_X')])).toBeGreaterThan(0);
    });

    // --- Utility Umbrella: dead on weather abusers / weather teams ---
    test('Utility Umbrella: 0 on a Chlorophyll abuser and under active weather, > 0 otherwise', () => {
        expect(r('Utility Umbrella', specAttacker, [spec('MOVE_X')], 'CHLOROPHYLL')).toBe(0);
        expect(r('Utility Umbrella', specAttacker, [spec('MOVE_X')], null, false, { sun: true })).toBe(0);
        expect(r('Utility Umbrella', specAttacker, [spec('MOVE_X')])).toBeGreaterThan(0);
    });

    // --- Clear Amulet: doubles-aware ---
    test('Clear Amulet: worth more in doubles than in singles for a physical attacker', () => {
        expect(r('Clear Amulet', physAttacker, [phys('MOVE_X')], null, true))
            .toBeGreaterThan(r('Clear Amulet', physAttacker, [phys('MOVE_X')], null, false));
    });

    // --- Re-derivations of the poorly-reasoned handlers ---
    test('Custap Berry: no-trigger base is low; a reliable trigger scores much higher', () => {
        const noTrigger = r('Custap Berry', physAttacker, [phys('MOVE_X')]);
        const withSturdy = r('Custap Berry', physAttacker, [phys('MOVE_X')], 'STURDY');
        expect(withSturdy).toBeGreaterThan(noTrigger * 2); // 7.5 vs 2 base
    });
    test('Eject Button: deterministic (no bare rng) and lower on a setup sweeper', () => {
        const a = r('Eject Button', mon(), [phys('MOVE_X')]);
        const b = r('Eject Button', mon(), [phys('MOVE_X')]);
        expect(a).toBe(b);
        expect(r('Eject Button', mon(), [status('MOVE_SWORDS_DANCE', 'EFFECT_ATTACK_UP_2'), phys('MOVE_X')].map((m, i) => i === 0 ? { ...m, id: 'MOVE_SWORDS_DANCE' } : m)))
            .toBeLessThan(a);
    });
    test('Red Card / Mirror Herb / Adrenaline Orb / Rowap are deterministic (rng removed)', () => {
        for (const it of ['Red Card', 'Mirror Herb', 'Adrenaline Orb', 'Rowap Berry']) {
            const a = r(it, wall, [phys('MOVE_X')]);
            const b = r(it, wall, [phys('MOVE_X')]);
            expect(a).toBe(b);
        }
    });
    test('Eject Pack: higher with a self-lowering nuke (Overheat) than without', () => {
        const withCombo = r('Eject Pack', specAttacker, [{ ...spec('MOVE_OVERHEAT', 'FIRE'), id: 'MOVE_OVERHEAT' }]);
        const without = r('Eject Pack', specAttacker, [spec('MOVE_X')]);
        expect(withCombo).toBeGreaterThan(without);
    });
    test('Adrenaline Orb: real value only in doubles', () => {
        expect(r('Adrenaline Orb', physAttacker, [phys('MOVE_X')], null, true))
            .toBeGreaterThan(r('Adrenaline Orb', physAttacker, [phys('MOVE_X')], null, false));
    });

    // B-047 — the bag delivers "Heavy Duty Boots" (space; itemDisplayName/nameify title-case the constant),
    // but the handler only matched the hyphenated items.json form, so the boots were never rated in real runs.
    test('Heavy Duty Boots (bag/space form) is rated identically to the hyphen form, not the fallback', () => {
        const neutral = mon({ parsedTypes: ['NORMAL'] });
        const spaceForm = r('Heavy Duty Boots', neutral, [phys('MOVE_X')]);
        const hyphenForm = r('Heavy-Duty Boots', neutral, [phys('MOVE_X')]);
        expect(spaceForm).toBe(hyphenForm);
        expect(spaceForm).toBeGreaterThan(1); // above the `not rated` fallback (≈ calculatedDeviation)
    });
});
