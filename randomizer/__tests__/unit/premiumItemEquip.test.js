'use strict';

// T-290 rules 3, 4 and 5 — WHO may use a premium item, once it exists in the run.
//
//   3. usable only by the Elite Four and the Champion;
//   4. EXTRA — "pueden usar además de su mega de rigor y no cuentan como 'el mega'";
//   5. "se les puede equipar si llevan uno de los 4 base".
//
// Rule 1 (where it is found) is a separate question, answered by `assignPremiumItems`. A trainer can
// only equip an item the run actually placed, which is what ties the two together.

const { equipPremiumItem } = require('../../premiumItems');

const mon = (species, extra = {}) => ({ species, ...extra });
const pick = (item, base) => ({ item, base, form: `${base}_TRANSFORMED` });

const PLACED = [
    pick('ITEM_RED_ORB', 'SPECIES_GROUDON'),
    pick('ITEM_GRISEOUS_ORB', 'SPECIES_GIRATINA_ALTERED'),
];

describe('T-290 — rule 5: only alongside the base form', () => {
    test('a team fielding the base form gets the item, on that mon', () => {
        const team = [mon('SPECIES_PIKACHU'), mon('SPECIES_GROUDON'), mon('SPECIES_SWAMPERT')];
        expect(equipPremiumItem(team, PLACED)).toEqual({
            monIndex: 1, item: 'ITEM_RED_ORB', base: 'SPECIES_GROUDON',
            form: 'SPECIES_GROUDON_TRANSFORMED',
        });
    });

    test('a team fielding none of the base forms gets nothing', () => {
        expect(equipPremiumItem([mon('SPECIES_PIKACHU')], PLACED)).toBeNull();
    });

    test('an item the run never placed cannot be equipped, even with its base form', () => {
        const team = [mon('SPECIES_KYOGRE')];
        expect(equipPremiumItem(team, PLACED)).toBeNull();
    });
});

describe('T-290 — rule 4: one per trainer, and it is not "the mega"', () => {
    test('a team with two eligible base forms takes only the first', () => {
        const team = [mon('SPECIES_GIRATINA_ALTERED'), mon('SPECIES_GROUDON')];
        const equipped = equipPremiumItem(team, PLACED);
        expect(equipped.item).toBe('ITEM_GRISEOUS_ORB');
        expect(equipped.monIndex).toBe(0);
    });

    test('a mon already carrying a mega stone is skipped, not overwritten', () => {
        // The premium item is EXTRA: it goes on a different mon rather than displacing the mega.
        const team = [
            mon('SPECIES_GROUDON', { megaStone: 'ITEM_MEGA_19' }),
            mon('SPECIES_GIRATINA_ALTERED'),
        ];
        const equipped = equipPremiumItem(team, PLACED);
        expect(equipped.item).toBe('ITEM_GRISEOUS_ORB');
        expect(equipped.monIndex).toBe(1);
    });

    test('a mon already holding an item keeps it', () => {
        const team = [mon('SPECIES_GROUDON', { item: 'ITEM_LEFTOVERS' }), mon('SPECIES_PIKACHU')];
        expect(equipPremiumItem(team, PLACED)).toBeNull();
    });
});

describe('T-290 — defensive', () => {
    test.each([
        ['no team', undefined, PLACED],
        ['empty team', [], PLACED],
        ['nothing placed', [mon('SPECIES_GROUDON')], []],
        ['placed undefined', [mon('SPECIES_GROUDON')], undefined],
    ])('%s returns null', (_label, team, placed) => {
        expect(equipPremiumItem(team, placed)).toBeNull();
    });
});
