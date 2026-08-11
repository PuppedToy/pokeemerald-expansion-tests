'use strict';

// T-269 — a traded gift generates its mega stone like any other found family (owner's note with the
// trader rework): if a trader hands over a Scyther, the world must grow a Scizorite exactly as it does
// when Scyther turns up wild. The rule lives once, in wildModule's mega pool.

const { megaEvoEntries, addTradeMegaEvos } = require('../../modules/wildModule');

const mkMega = (id, { family, item, baseFormId }) => ({
    id,
    family,
    rating: { megaEvoTier: 'OU' },
    evolutionData: { megaBaseForm: baseFormId, megaItem: item, megaEvos: [] },
});

// SCYTHER --Metal Coat--> SCIZOR --mega--> MEGA_SCIZOR
function scytherFamily() {
    const family = 'P_FAMILY_SCYTHER';
    const scyther = {
        id: 'SPECIES_SCYTHER', family,
        rating: { megaEvoTier: 'OU' },
        evolutions: [{ method: 'ITEM', param: 'ITEM_METAL_COAT', minLevel: 34, pokemon: 'SPECIES_SCIZOR' }],
        evolutionData: { megaEvos: [] },
    };
    const scizor = {
        id: 'SPECIES_SCIZOR', family,
        rating: { megaEvoTier: 'OU' },
        evolutions: [],
        evolutionData: { megaEvos: ['SPECIES_SCIZOR_MEGA'] },
    };
    const mega = mkMega('SPECIES_SCIZOR_MEGA', { family, item: 'ITEM_SCIZORITE', baseFormId: 'SPECIES_SCIZOR' });
    return [scyther, scizor, mega];
}

const plainFamily = (id) => ({
    id, family: `P_FAMILY_${id}`, rating: { megaEvoTier: null }, evolutions: [], evolutionData: { megaEvos: [] },
});

describe('megaEvoEntries', () => {
    const list = scytherFamily();

    test('yields the stone a mega-capable family needs, filed at the level it was found', () => {
        const [entry, ...rest] = megaEvoEntries(list[1], list, 46);
        expect(rest).toEqual([]);
        expect(entry).toEqual({
            family: 'P_FAMILY_SCYTHER',
            megaFormId: 'SPECIES_SCIZOR_MEGA',
            baseFormId: 'SPECIES_SCIZOR',
            item: 'ITEM_SCIZORITE',
            level: 46,
        });
    });

    test('a family with no mega yields nothing', () => {
        expect(megaEvoEntries(plainFamily('SPECIES_RATTATA'), list, 20)).toEqual([]);
    });

    test('an AG mega is never placed', () => {
        const ag = { ...list[1], rating: { megaEvoTier: 'AG' } };
        expect(megaEvoEntries(ag, list, 20)).toEqual([]);
    });
});

describe('addTradeMegaEvos', () => {
    test('adds the gift\'s stone to the run\'s pool, filed at the trade level', () => {
        const list = scytherFamily();
        const wild = { foundMegaEvos: [] };
        const added = addTradeMegaEvos(wild, [{ offeredSpecies: 'SPECIES_SCIZOR', level: 46 }], list);
        expect(added).toHaveLength(1);
        expect(wild.foundMegaEvos).toEqual(added);
        expect(wild.foundMegaEvos[0].item).toBe('ITEM_SCIZORITE');
        expect(wild.foundMegaEvos[0].level).toBe(46);
    });

    test('does not add a second stone for a family the run already found', () => {
        const list = scytherFamily();
        const wild = { foundMegaEvos: [{ family: 'P_FAMILY_SCYTHER', megaFormId: 'SPECIES_SCIZOR_MEGA', level: 12 }] };
        expect(addTradeMegaEvos(wild, [{ offeredSpecies: 'SPECIES_SCIZOR', level: 46 }], list)).toEqual([]);
        expect(wild.foundMegaEvos).toHaveLength(1);
    });

    test('leaves the pool untouched when no gift can mega-evolve', () => {
        const list = [plainFamily('SPECIES_RATTATA')];
        const wild = { foundMegaEvos: [] };
        expect(addTradeMegaEvos(wild, [{ offeredSpecies: 'SPECIES_RATTATA', level: 20 }], list)).toEqual([]);
        expect(wild.foundMegaEvos).toEqual([]);
    });

    test('an unfilled trade (no gift) is skipped, not a crash', () => {
        const wild = { foundMegaEvos: [] };
        expect(addTradeMegaEvos(wild, [{ offeredSpecies: null, level: 20 }], scytherFamily())).toEqual([]);
    });
});
