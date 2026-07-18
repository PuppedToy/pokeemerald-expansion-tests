'use strict';

// T-157 — Burmy and Ogerpon on the Deerling multi-form model: each catchable form is its own family
// (so forms randomize independently), but they collapse to one family group for the "one obtainable per
// family per run" dedup (one in the wild; a trainer holds at most one). Their form suffixes therefore
// go in BOTH POKE_FORMS (parser split) and COSMETIC_FORM_SUFFIXES (getFamilyGroup collapse). Ogerpon's
// battle-only `_TERA` forms are dropped.

const { POKE_FORMS } = require('../../constants');
const { getFamilyGroup } = require('../../modules/utils');
const { parseSpeciesFile } = require('../../parser');

const NEW_SUFFIXES = ['SANDY', 'TRASH', 'WELLSPRING', 'HEARTHFLAME', 'CORNERSTONE'];

const mon = (id, evoLine) => `    [${id}] =
    {
        .baseHP = 80, .baseAttack = 120, .baseDefense = 84,
        .baseSpeed = 110, .baseSpAttack = 60, .baseSpDefense = 96,
        .types = MON_TYPES(TYPE_GRASS),
        .abilities = { ABILITY_DEFIANT, ABILITY_NONE },
        .speciesName = _("Testmon"),
        .natDexNum = NATIONAL_DEX_TESTMON,
${evoLine ? `        .evolutions = EVOLUTION(${evoLine}),\n` : ''}    },
`;

const SPLIT_FIXTURE = `
#if P_FAMILY_TESTMON
${mon('SPECIES_TESTMON')}${mon('SPECIES_TESTMON_SANDY')}${mon('SPECIES_TESTMON_WELLSPRING')}${mon('SPECIES_TESTMON_TERA')}#endif //P_FAMILY_TESTMON
`;

describe('Burmy/Ogerpon form suffixes (T-157)', () => {
    test('the new form suffixes are registered in POKE_FORMS', () => {
        expect(POKE_FORMS).toEqual(expect.arrayContaining(NEW_SUFFIXES));
    });

    test('getFamilyGroup collapses the new suffixes back to the base family', () => {
        expect(getFamilyGroup('P_FAMILY_BURMY_SANDY')).toBe('P_FAMILY_BURMY');
        expect(getFamilyGroup('P_FAMILY_BURMY_TRASH')).toBe('P_FAMILY_BURMY');
        expect(getFamilyGroup('P_FAMILY_OGERPON_WELLSPRING')).toBe('P_FAMILY_OGERPON');
        expect(getFamilyGroup('P_FAMILY_OGERPON_HEARTHFLAME')).toBe('P_FAMILY_OGERPON');
        expect(getFamilyGroup('P_FAMILY_OGERPON_CORNERSTONE')).toBe('P_FAMILY_OGERPON');
        // base families are unchanged
        expect(getFamilyGroup('P_FAMILY_BURMY')).toBe('P_FAMILY_BURMY');
        expect(getFamilyGroup('P_FAMILY_OGERPON')).toBe('P_FAMILY_OGERPON');
    });

    test('parser splits each form into its own family (independent randomization) and drops _TERA', () => {
        const list = parseSpeciesFile(SPLIT_FIXTURE, {}, {});
        const byId = Object.fromEntries(list.map(p => [p.id, p]));
        expect(byId['SPECIES_TESTMON'].family).toBe('P_FAMILY_TESTMON');
        expect(byId['SPECIES_TESTMON'].form).toBeNull();
        expect(byId['SPECIES_TESTMON_SANDY'].family).toBe('P_FAMILY_TESTMON_SANDY');
        expect(byId['SPECIES_TESTMON_SANDY'].form).toBe('SANDY');
        expect(byId['SPECIES_TESTMON_WELLSPRING'].family).toBe('P_FAMILY_TESTMON_WELLSPRING');
        expect(byId['SPECIES_TESTMON_WELLSPRING'].form).toBe('WELLSPRING');
        // battle-only Tera form dropped
        expect(byId['SPECIES_TESTMON_TERA']).toBeUndefined();
    });
});
