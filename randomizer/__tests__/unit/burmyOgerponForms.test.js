'use strict';

// T-157 — Burmy and Ogerpon on the Deerling multi-form model: each catchable form is its own family
// (so forms randomize independently), but they collapse to one family group for the "one obtainable per
// family per run" dedup (one in the wild; a trainer holds at most one). Their form suffixes therefore
// go in BOTH POKE_FORMS (parser split) and COSMETIC_FORM_SUFFIXES (getFamilyGroup collapse). Ogerpon's
// battle-only `_TERA` forms are dropped.

const { POKE_FORMS } = require('../../constants');
const { getFamilyGroup } = require('../../modules/utils');
const { parseSpeciesFile, nameizyPokemonId } = require('../../parser');

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

    // B-040 — Mothim has no cloak forms (Plant/Sandy/Trash are identical dupes; SPECIES_MOTHIM aliases
    // MOTHIM_PLANT). All Burmy cloaks evolve into the ONE base Mothim. Wormadam's three forms are real
    // (distinct types) and must be kept. Uses the real species ids so the actual fix config applies.
    // cloak: emits Burmy's real branched evo (Level→Wormadam on one line, Dawn-Stone→Mothim on the next
    // continuation line, exactly like the source data). base: no evolution.
    const burmyBase = (id, dex, types) => `    [${id}] =
    {
        .baseHP = 40, .baseAttack = 29, .baseDefense = 45,
        .baseSpeed = 36, .baseSpAttack = 29, .baseSpDefense = 45,
        .types = MON_TYPES(${types}),
        .abilities = { ABILITY_SHED_SKIN, ABILITY_NONE },
        .speciesName = _("Mon"),
        .natDexNum = ${dex},
    },
`;
    const burmyCloak = (id, wormadam, mothim) => `    [${id}] =
    {
        .baseHP = 40, .baseAttack = 29, .baseDefense = 45,
        .baseSpeed = 36, .baseSpAttack = 29, .baseSpDefense = 45,
        .types = MON_TYPES(TYPE_BUG),
        .abilities = { ABILITY_SHED_SKIN, ABILITY_NONE },
        .speciesName = _("Mon"),
        .natDexNum = NATIONAL_DEX_BURMY,
        .evolutions = EVOLUTION({EVO_LEVEL, 20, ${wormadam}},
                                {EVO_ITEM, ITEM_DAWN_STONE, ${mothim}, CONDITIONS({IF_MIN_LEVEL, 25})}),
    },
`;
    const BURMY_MOTHIM = `
#if P_FAMILY_BURMY
${burmyCloak('SPECIES_BURMY_PLANT', 'SPECIES_WORMADAM_PLANT', 'SPECIES_MOTHIM_PLANT')}${burmyCloak('SPECIES_BURMY_SANDY', 'SPECIES_WORMADAM_SANDY', 'SPECIES_MOTHIM_SANDY')}${burmyCloak('SPECIES_BURMY_TRASH', 'SPECIES_WORMADAM_TRASH', 'SPECIES_MOTHIM_TRASH')}${burmyBase('SPECIES_WORMADAM_PLANT', 'NATIONAL_DEX_WORMADAM', 'TYPE_BUG, TYPE_GRASS')}${burmyBase('SPECIES_WORMADAM_SANDY', 'NATIONAL_DEX_WORMADAM', 'TYPE_GROUND, TYPE_STEEL')}${burmyBase('SPECIES_WORMADAM_TRASH', 'NATIONAL_DEX_WORMADAM', 'TYPE_BUG, TYPE_STEEL')}${burmyBase('SPECIES_MOTHIM_PLANT', 'NATIONAL_DEX_MOTHIM', 'TYPE_BUG, TYPE_FLYING')}${burmyBase('SPECIES_MOTHIM_SANDY', 'NATIONAL_DEX_MOTHIM', 'TYPE_BUG, TYPE_FLYING')}${burmyBase('SPECIES_MOTHIM_TRASH', 'NATIONAL_DEX_MOTHIM', 'TYPE_BUG, TYPE_FLYING')}#endif //P_FAMILY_BURMY
`;

    test('B-040 — only one Mothim survives, but Wormadam keeps its three real forms', () => {
        const list = parseSpeciesFile(BURMY_MOTHIM, {}, {});
        const ids = list.map(p => p.id);
        const mothims = ids.filter(id => id.startsWith('SPECIES_MOTHIM'));
        const wormadams = ids.filter(id => id.startsWith('SPECIES_WORMADAM'));
        expect(mothims).toEqual(['SPECIES_MOTHIM_PLANT']); // the one base Mothim; Sandy/Trash dropped
        expect(wormadams.sort()).toEqual([
            'SPECIES_WORMADAM_PLANT', 'SPECIES_WORMADAM_SANDY', 'SPECIES_WORMADAM_TRASH',
        ]);
    });

    test('B-040 — the surviving Mothim displays as plain "Mothim" (no cloak suffix)', () => {
        expect(nameizyPokemonId('SPECIES_MOTHIM_PLANT')).toBe('Mothim');
        // sanity: a non-overridden id is still derived from the id
        expect(nameizyPokemonId('SPECIES_PIKACHU')).toBe('Pikachu');
        // a non-overridden multi-word id still starts with its base name (nameizy quirk: it emits a
        // double space between words, harmlessly collapsed by HTML — pre-existing, out of scope here)
        expect(nameizyPokemonId('SPECIES_WORMADAM_SANDY').replace(/\s+/g, ' ')).toBe('Wormadam Sandy');
    });

    test('B-040 — every Burmy cloak evolves (by stone) into the single base Mothim', () => {
        const list = parseSpeciesFile(BURMY_MOTHIM, {}, {});
        for (const cloak of ['SPECIES_BURMY_PLANT', 'SPECIES_BURMY_SANDY', 'SPECIES_BURMY_TRASH']) {
            const burmy = list.find(p => p.id === cloak);
            const stoneEvo = burmy.evolutions.find(e => e.method === 'ITEM');
            expect(stoneEvo.pokemon).toBe('SPECIES_MOTHIM_PLANT');
        }
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
