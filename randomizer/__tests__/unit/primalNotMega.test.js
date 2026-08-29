'use strict';

// T-290 rule 6 — "la forma transformada no sigue las reglas de valoración de los megas. En vez de eso,
// sigue las de un pokemon estandar."
//
// `getEvolutionType` typed any id ending in `_PRIMAL` as `EVO_TYPE_MEGA`, so Kyogre-Primal and
// Groudon-Primal were megas: they consumed a mega-stone slot, their orbs were mega stones, and they
// carried the mega-only rating rules — including the cap that stops a mega out-tiering its base form.
//
// Under the premium-item tier they are ordinary Pokémon reached by a held item, exactly like
// Zacian-Crowned (which was never a mega, because its id has no `_MEGA` suffix — the inconsistency
// this fixes). The orb becomes a premium item, carried IN ADDITION to a trainer's real mega stone.

const { classifyStages, megaEvosOf } = require('../../evoStages');
const { hasValidMega } = require('../../modules/utils');
const { EVO_TYPE_MEGA, EVO_TYPE_SOLO } = require('../../constants');

const mon = (id, extra = {}) => ({ id, evolutionData: { isMega: false }, ...extra });
const DEX = [
    mon('SPECIES_KYOGRE'), mon('SPECIES_KYOGRE_PRIMAL'),
    mon('SPECIES_GROUDON'), mon('SPECIES_GROUDON_PRIMAL'),
    mon('SPECIES_ZACIAN_HERO'), mon('SPECIES_ZACIAN_CROWNED'),
    mon('SPECIES_VENUSAUR'),
    { id: 'SPECIES_VENUSAUR_MEGA', evolutionData: { isMega: true, megaBaseForm: 'SPECIES_VENUSAUR' } },
];
const stageOf = classifyStages(DEX);

describe('T-290 — a primal form is not a mega', () => {
    test.each([['SPECIES_KYOGRE_PRIMAL'], ['SPECIES_GROUDON_PRIMAL']])('%s is a standard Pokemon', id => {
        expect(stageOf(id)).toBe(EVO_TYPE_SOLO);
        expect(stageOf(id)).not.toBe(EVO_TYPE_MEGA);
    });

    test('it is classified exactly like Zacian-Crowned, the other item-held form', () => {
        expect(stageOf('SPECIES_KYOGRE_PRIMAL')).toBe(stageOf('SPECIES_ZACIAN_CROWNED'));
    });

    test('a real mega is still a mega', () => {
        expect(stageOf('SPECIES_VENUSAUR_MEGA')).toBe(EVO_TYPE_MEGA);
    });
});

describe('T-290 — the base stops spending a mega-stone slot on it', () => {
    const megas = megaEvosOf(DEX);

    test('Kyogre and Groudon reach no mega', () => {
        expect(megas('SPECIES_KYOGRE')).toEqual([]);
        expect(megas('SPECIES_GROUDON')).toEqual([]);
        expect(hasValidMega({ id: 'SPECIES_KYOGRE', evolutionData: { megaEvos: megas('SPECIES_KYOGRE') } }))
            .toBe(false);
    });

    test('a species with a real mega still reaches it', () => {
        expect(megas('SPECIES_VENUSAUR')).toEqual(['SPECIES_VENUSAUR_MEGA']);
    });
});
