const { parseSpeciesFile } = require('../../parser');

// T-153 — the parser must expand multi-line species-info C macros with parameter substitution,
// so species defined as `[SPECIES_X] = FOO_SPECIES_INFO(args)` (instead of an inline struct) parse
// their stats/types/abilities/learnsets/natDexNum. Without expansion these species have no field
// lines and no closing `},`, so they are silently dropped.

const PARAM_MACRO = `
#define TEST_SPECIES_INFO(type, ability)                       \\
    {                                                          \\
        .baseHP        = 50,                                   \\
        .baseAttack    = 60,                                   \\
        .baseDefense   = 70,                                   \\
        .baseSpeed     = 80,                                   \\
        .baseSpAttack  = 90,                                   \\
        .baseSpDefense = 100,                                  \\
        .types = MON_TYPES(TYPE_NORMAL, type),                 \\
        .abilities = { ability, ABILITY_NONE, ABILITY_NONE },  \\
        .speciesName = _("Testmon"),                           \\
        .levelUpLearnset = sTestmonLevelUpLearnset,            \\
        .teachableLearnset = sTestmonTeachableLearnset,        \\
        .natDexNum = NATIONAL_DEX_TESTMON,                     \\
    }

#if P_FAMILY_TESTMON
    [SPECIES_TESTMON] = TEST_SPECIES_INFO(TYPE_FLYING, ABILITY_LEVITATE),
#endif //P_FAMILY_TESTMON
`;

const PARAMLESS_MACRO = `
#define PLAIN_SPECIES_INFO                                     \\
    {                                                          \\
        .baseHP        = 11,                                   \\
        .baseAttack    = 22,                                   \\
        .baseDefense   = 33,                                   \\
        .baseSpeed     = 44,                                   \\
        .baseSpAttack  = 55,                                   \\
        .baseSpDefense = 66,                                   \\
        .types = MON_TYPES(TYPE_BUG),                          \\
        .abilities = { ABILITY_SWARM, ABILITY_NONE },          \\
        .speciesName = _("Plainmon"),                          \\
        .natDexNum = NATIONAL_DEX_PLAINMON,                    \\
    }

#if P_FAMILY_PLAINMON
    [SPECIES_PLAINMON] = PLAIN_SPECIES_INFO,
#endif //P_FAMILY_PLAINMON
`;

const INLINE_SPECIES = `
#if P_FAMILY_INLINEMON
    [SPECIES_INLINEMON] =
    {
        .baseHP        = 1,
        .baseAttack    = 2,
        .baseDefense   = 3,
        .baseSpeed     = 4,
        .baseSpAttack  = 5,
        .baseSpDefense = 6,
        .types = MON_TYPES(TYPE_WATER),
        .abilities = { ABILITY_TORRENT, ABILITY_NONE },
        .speciesName = _("Inlinemon"),
        .natDexNum = NATIONAL_DEX_INLINEMON,
    },
#endif //P_FAMILY_INLINEMON
`;

describe('parseSpeciesFile — macro expansion (T-153)', () => {
    test('expands a parameterized species-info macro with argument substitution', () => {
        const list = parseSpeciesFile(PARAM_MACRO, {}, {});
        const mon = list.find(p => p.id === 'SPECIES_TESTMON');
        expect(mon).toBeDefined();
        expect(mon.baseHP).toBe('50');
        expect(mon.baseAttack).toBe('60');
        expect(mon.baseSpDefense).toBe('100');
        // `type` param -> TYPE_FLYING substituted into the MON_TYPES list
        expect(mon.types).toContain('TYPE_FLYING');
        expect(mon.types).toContain('TYPE_NORMAL');
        // `ability` param -> ABILITY_LEVITATE substituted into the abilities list
        expect(mon.abilities).toContain('ABILITY_LEVITATE');
        expect(mon.levelUpLearnset).toBe('sTestmonLevelUpLearnset');
        expect(mon.teachableLearnset).toBe('sTestmonTeachableLearnset');
        expect(mon.natDexNum).toBe('NATIONAL_DEX_TESTMON');
    });

    test('expands a paramless species-info macro', () => {
        const list = parseSpeciesFile(PARAMLESS_MACRO, {}, {});
        const mon = list.find(p => p.id === 'SPECIES_PLAINMON');
        expect(mon).toBeDefined();
        expect(mon.baseHP).toBe('11');
        expect(mon.baseSpDefense).toBe('66');
        expect(mon.types).toContain('TYPE_BUG');
        expect(mon.abilities).toContain('ABILITY_SWARM');
        expect(mon.natDexNum).toBe('NATIONAL_DEX_PLAINMON');
    });

    test('inline (non-macro) species still parse unchanged', () => {
        const list = parseSpeciesFile(INLINE_SPECIES, {}, {});
        const mon = list.find(p => p.id === 'SPECIES_INLINEMON');
        expect(mon).toBeDefined();
        expect(mon.baseHP).toBe('1');
        expect(mon.baseSpDefense).toBe('6');
        expect(mon.types).toContain('TYPE_WATER');
        expect(mon.abilities).toContain('ABILITY_TORRENT');
    });
});

// A macro that nests a brace-less field-fragment macro (like real Minior/Alcremie: the outer struct
// carries the stats and delegates types/abilities/natDexNum to a shared `*_MISC_INFO(...)` fragment).
const NESTED_FRAGMENT = `
#define FRAG_MISC_INFO(bodyColor)                              \\
        .types = MON_TYPES(TYPE_ROCK, TYPE_FLYING),            \\
        .abilities = { ABILITY_STURDY, ABILITY_NONE },         \\
        .bodyColor = bodyColor,                                \\
        .speciesName = _("Fragmon"),                           \\
        .natDexNum = NATIONAL_DEX_FRAGMON

#define OUTER_SPECIES_INFO(Form, color)                        \\
    {                                                          \\
        .baseHP        = 61,                                   \\
        .baseAttack    = 62,                                   \\
        .baseDefense   = 63,                                   \\
        .baseSpeed     = 64,                                   \\
        .baseSpAttack  = 65,                                   \\
        .baseSpDefense = 66,                                   \\
        .palette = gMonPalette_Frag##Form,                     \\
        FRAG_MISC_INFO(color),                                 \\
    }

#if P_FAMILY_FRAGMON
    [SPECIES_FRAGMON_RED] = OUTER_SPECIES_INFO(Red, BODY_COLOR_RED),
#endif //P_FAMILY_FRAGMON
`;

// A fully inline struct whose body invokes a fragment macro (like real Vivillon), plus a macro whose
// evolution target is built with the C token-paste operator `##` (like real Scatterbug/Spewpa).
const INLINE_FRAGMENT_AND_TOKENPASTE = `
#define VMISC_INFO(pat, color)                                 \\
        .baseHP        = 80,                                   \\
        .baseAttack    = 52,                                   \\
        .baseDefense   = 50,                                   \\
        .baseSpeed     = 89,                                   \\
        .baseSpAttack  = 90,                                   \\
        .baseSpDefense = 50,                                   \\
        .types = MON_TYPES(TYPE_BUG, TYPE_FLYING),             \\
        .abilities = { ABILITY_SHIELD_DUST, ABILITY_NONE },    \\
        .speciesName = _("Vmon"),                              \\
        .natDexNum = NATIONAL_DEX_VMON

#define PRE_SPECIES_INFO(evolution)                            \\
    {                                                          \\
        .baseHP        = 38,                                   \\
        .baseAttack    = 35,                                   \\
        .baseDefense   = 40,                                   \\
        .baseSpeed     = 35,                                   \\
        .baseSpAttack  = 27,                                   \\
        .baseSpDefense = 25,                                   \\
        .types = MON_TYPES(TYPE_BUG),                          \\
        .abilities = { ABILITY_SHIELD_DUST, ABILITY_NONE },    \\
        .speciesName = _("Premon"),                            \\
        .natDexNum = NATIONAL_DEX_PREMON,                      \\
        .evolutions = EVOLUTION({EVO_LEVEL, 9, SPECIES_VMON_##evolution}), \\
    }

#if P_FAMILY_VMON
    [SPECIES_PREMON_ICY_SNOW] = PRE_SPECIES_INFO(ICY_SNOW),
    [SPECIES_VMON_ICY_SNOW] =
    {
        VMISC_INFO(IcySnow, BODY_COLOR_WHITE),
        .description = COMPOUND_STRING("A test mon."),
    },
#endif //P_FAMILY_VMON
`;

describe('parseSpeciesFile — nested/fragment macros & token-paste (T-153)', () => {
    test('expands a macro that nests a brace-less field fragment', () => {
        const list = parseSpeciesFile(NESTED_FRAGMENT, {}, {});
        const mon = list.find(p => p.id === 'SPECIES_FRAGMON_RED');
        expect(mon).toBeDefined();
        // stats come from the outer struct...
        expect(mon.baseHP).toBe('61');
        expect(mon.baseSpDefense).toBe('66');
        // ...types/abilities/natDexNum come from the nested fragment (with its param substituted)
        expect(mon.types).toContain('TYPE_ROCK');
        expect(mon.abilities).toContain('ABILITY_STURDY');
        expect(mon.natDexNum).toBe('NATIONAL_DEX_FRAGMON');
    });

    test('expands a fragment macro invoked inside an inline struct body', () => {
        const list = parseSpeciesFile(INLINE_FRAGMENT_AND_TOKENPASTE, {}, {});
        const mon = list.find(p => p.id === 'SPECIES_VMON_ICY_SNOW');
        expect(mon).toBeDefined();
        expect(mon.baseHP).toBe('80');
        expect(mon.baseSpAttack).toBe('90');
        expect(mon.types).toContain('TYPE_FLYING');
        expect(mon.abilities).toContain('ABILITY_SHIELD_DUST');
        expect(mon.natDexNum).toBe('NATIONAL_DEX_VMON');
    });

    test('resolves the C token-paste operator in a macro evolution target', () => {
        const evoTree = {};
        parseSpeciesFile(INLINE_FRAGMENT_AND_TOKENPASTE, {}, evoTree);
        // The `##` in SPECIES_VMON_##evolution must collapse to the real id, so the evo links.
        expect(JSON.stringify(evoTree)).toContain('SPECIES_VMON_ICY_SNOW');
        expect(JSON.stringify(evoTree)).not.toContain('##');
    });
});
