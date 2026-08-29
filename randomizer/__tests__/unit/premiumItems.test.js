'use strict';

// T-290 — premium transformation items: a tier of their own, alongside mega stones.
//
// Owner's rules (randomizer/docs/families-and-forms.md):
//   1. only in the LAST mega-stone batch (the one unlocked by defeating May);
//   2. placed only if the associated base Pokémon is obtainable in this run;
//   3. usable only by the Elite Four and the Champion;
//   4. EXTRA — a trainer may carry one as well as its regular mega stone; it is not "the mega";
//   5. a trainer may equip one only if it fields one of the base Pokémon;
//   6. the transformed form is rated as a STANDARD Pokémon, and if it comes out AG the item is not
//      placed at all;
//   7. mega stones have priority — when slots run short, the premium items are dropped first.
//
// O9: one Ogerpon mask per run and one Genesect Drive per run, chosen at random; every other mask and
// drive is simply not placed. So the per-run candidate set is at most nine.
//
// This module owns rules 2, 6 and O9 — which items a run may place at all — and the ordering rule 7
// consumes. Placement itself is the caller's business.

const rng = require('../../rng');
const { PREMIUM_ITEMS, selectPremiumItems } = require('../../premiumItems');

afterEach(() => rng.reset());

const poke = (id, tier) => ({ id, rating: { tier } });

// A dex where every premium form is comfortably placeable.
function healthyDex() {
    return [
        poke('SPECIES_ZACIAN_HERO', 'LEGEND'), poke('SPECIES_ZACIAN_CROWNED', 'LEGEND'),
        poke('SPECIES_ZAMAZENTA_HERO', 'LEGEND'), poke('SPECIES_ZAMAZENTA_CROWNED', 'LEGEND'),
        poke('SPECIES_GROUDON', 'LEGEND'), poke('SPECIES_GROUDON_PRIMAL', 'LEGEND'),
        poke('SPECIES_KYOGRE', 'LEGEND'), poke('SPECIES_KYOGRE_PRIMAL', 'LEGEND'),
        poke('SPECIES_DIALGA', 'LEGEND'), poke('SPECIES_DIALGA_ORIGIN', 'LEGEND'),
        poke('SPECIES_PALKIA', 'LEGEND'), poke('SPECIES_PALKIA_ORIGIN', 'LEGEND'),
        poke('SPECIES_GIRATINA_ALTERED', 'LEGEND'), poke('SPECIES_GIRATINA_ORIGIN', 'LEGEND'),
        poke('SPECIES_OGERPON_TEAL', 'UU'),
        poke('SPECIES_OGERPON_WELLSPRING', 'UU'), poke('SPECIES_OGERPON_HEARTHFLAME', 'UU'),
        poke('SPECIES_OGERPON_CORNERSTONE', 'UU'),
        poke('SPECIES_GENESECT', 'OU'),
    ];
}
const allObtainable = new Set(healthyDex().map(p => p.id));

describe('T-290 — the catalogue', () => {
    test('every entry names a base, and either an item or a group of choices', () => {
        for (const entry of PREMIUM_ITEMS) {
            expect(typeof entry.base).toBe('string');
            if (entry.choices) {
                expect(entry.choices.length).toBeGreaterThan(1);
                entry.choices.forEach(c => {
                    expect(typeof c.item).toBe('string');
                    expect(typeof c.form).toBe('string');
                });
            } else {
                expect(typeof entry.item).toBe('string');
                expect(typeof entry.form).toBe('string');
            }
        }
    });

    test('the nine the owner listed, and no more', () => {
        expect(PREMIUM_ITEMS).toHaveLength(9);
    });
});

describe('T-290 — rule 2: the base Pokémon must be obtainable', () => {
    test('an item whose base is not in the run is not placed', () => {
        const obtainable = new Set(allObtainable);
        obtainable.delete('SPECIES_KYOGRE');
        const picked = selectPremiumItems(healthyDex(), obtainable);
        expect(picked.map(p => p.item)).not.toContain('ITEM_BLUE_ORB');
        expect(picked.map(p => p.item)).toContain('ITEM_RED_ORB');
    });

    test('with nothing obtainable, nothing is placed', () => {
        expect(selectPremiumItems(healthyDex(), new Set())).toEqual([]);
    });
});

describe('T-290 — rule 6: an AG transformed form withholds its item', () => {
    test('the item is not placed at all', () => {
        const dex = healthyDex().map(p =>
            p.id === 'SPECIES_ZACIAN_CROWNED' ? poke(p.id, 'AG') : p);
        const picked = selectPremiumItems(dex, allObtainable);
        expect(picked.map(p => p.item)).not.toContain('ITEM_RUSTED_SWORD');
        // its sibling is unaffected
        expect(picked.map(p => p.item)).toContain('ITEM_RUSTED_SHIELD');
    });

    test('a base that is AG does not withhold anything — rule 6 is about the FORM', () => {
        const dex = healthyDex().map(p => (p.id === 'SPECIES_GROUDON' ? poke(p.id, 'AG') : p));
        expect(selectPremiumItems(dex, allObtainable).map(p => p.item)).toContain('ITEM_RED_ORB');
    });

    test('a form missing from the dex falls back to the base tier', () => {
        // Genesect's Drive forms are cut by T-155, and a Drive only retypes Techno Blast, so the
        // base's rating is the honest one to test.
        const dex = healthyDex().map(p => (p.id === 'SPECIES_GENESECT' ? poke(p.id, 'AG') : p));
        const picked = selectPremiumItems(dex, allObtainable);
        expect(picked.some(p => /DRIVE/.test(p.item))).toBe(false);
    });
});

describe('T-290 — O9: one mask and one drive per run', () => {
    test('exactly one of each group is chosen', () => {
        for (const seed of [1, 2, 3, 7, 42]) {
            rng.seed(seed);
            const picked = selectPremiumItems(healthyDex(), allObtainable);
            expect(picked.filter(p => /_MASK$/.test(p.item))).toHaveLength(1);
            expect(picked.filter(p => /_DRIVE$/.test(p.item))).toHaveLength(1);
        }
    });

    test('the choice varies with the seed', () => {
        const masks = new Set();
        for (let seed = 0; seed < 30; seed++) {
            rng.seed(seed);
            masks.add(selectPremiumItems(healthyDex(), allObtainable).find(p => /_MASK$/.test(p.item)).item);
        }
        expect(masks.size).toBeGreaterThan(1);
    });

    test('a group whose base is not obtainable contributes nothing', () => {
        const obtainable = new Set(allObtainable);
        obtainable.delete('SPECIES_OGERPON_TEAL');
        const picked = selectPremiumItems(healthyDex(), obtainable);
        expect(picked.some(p => /_MASK$/.test(p.item))).toBe(false);
    });

    test('a group only offers choices whose form is not AG', () => {
        const dex = healthyDex().map(p =>
            (p.id === 'SPECIES_OGERPON_WELLSPRING' || p.id === 'SPECIES_OGERPON_HEARTHFLAME')
                ? poke(p.id, 'AG') : p);
        for (let seed = 0; seed < 12; seed++) {
            rng.seed(seed);
            const mask = selectPremiumItems(dex, allObtainable).find(p => /_MASK$/.test(p.item));
            expect(mask.item).toBe('ITEM_CORNERSTONE_MASK');
        }
    });

    test('a group with every choice AG contributes nothing', () => {
        const dex = healthyDex().map(p => (/OGERPON_(WELLSPRING|HEARTHFLAME|CORNERSTONE)/.test(p.id)
            ? poke(p.id, 'AG') : p));
        expect(selectPremiumItems(dex, allObtainable).some(p => /_MASK$/.test(p.item))).toBe(false);
    });
});

describe('T-290 — the result is a random order, so rule 7 can truncate it fairly', () => {
    test('at most nine, and the order varies with the seed', () => {
        const orders = new Set();
        for (let seed = 0; seed < 20; seed++) {
            rng.seed(seed);
            const picked = selectPremiumItems(healthyDex(), allObtainable);
            expect(picked.length).toBeLessThanOrEqual(9);
            orders.add(picked.map(p => p.item).join(','));
        }
        expect(orders.size).toBeGreaterThan(1);
    });

    test('one seed always gives the same answer', () => {
        rng.seed(99);
        const a = selectPremiumItems(healthyDex(), allObtainable);
        rng.seed(99);
        expect(selectPremiumItems(healthyDex(), allObtainable)).toEqual(a);
    });

    test('every pick carries what a caller needs to place and equip it', () => {
        rng.seed(5);
        for (const pick of selectPremiumItems(healthyDex(), allObtainable)) {
            expect(pick).toEqual(expect.objectContaining({
                item: expect.any(String), base: expect.any(String), form: expect.any(String),
            }));
        }
    });
});
