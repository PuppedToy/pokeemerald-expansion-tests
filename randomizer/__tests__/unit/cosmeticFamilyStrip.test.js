const { parseSpeciesFile, COSMETIC_FAMILIES } = require('../../parser');

// T-154 — families whose alternate forms are purely cosmetic keep only the FIRST species per
// natDexNum; later same-dex duplicates are dropped (so they neither randomize independently nor emit
// one docs entry each). Fixtures use real cosmetic family names with synthetic species.

const UNOWN_LIKE = `
#if P_FAMILY_UNOWN
    [SPECIES_UNOWN] =
    {
        .baseHP = 48, .baseAttack = 72, .baseDefense = 48,
        .baseSpeed = 48, .baseSpAttack = 72, .baseSpDefense = 48,
        .types = MON_TYPES(TYPE_PSYCHIC),
        .abilities = { ABILITY_LEVITATE, ABILITY_NONE },
        .speciesName = _("Unown"),
        .natDexNum = NATIONAL_DEX_UNOWN,
    },
    [SPECIES_UNOWN_B] =
    {
        .baseHP = 48, .baseAttack = 72, .baseDefense = 48,
        .baseSpeed = 48, .baseSpAttack = 72, .baseSpDefense = 48,
        .types = MON_TYPES(TYPE_PSYCHIC),
        .abilities = { ABILITY_LEVITATE, ABILITY_NONE },
        .speciesName = _("Unown"),
        .natDexNum = NATIONAL_DEX_UNOWN,
    },
    [SPECIES_UNOWN_C] =
    {
        .baseHP = 48, .baseAttack = 72, .baseDefense = 48,
        .baseSpeed = 48, .baseSpAttack = 72, .baseSpDefense = 48,
        .types = MON_TYPES(TYPE_PSYCHIC),
        .abilities = { ABILITY_LEVITATE, ABILITY_NONE },
        .speciesName = _("Unown"),
        .natDexNum = NATIONAL_DEX_UNOWN,
    },
#endif //P_FAMILY_UNOWN
`;

// Two patterns x two evolution stages. natDexNum is placed BEFORE .evolutions (as in the real data)
// so the dropped patterns never register an evolution.
function stage(id, dex, evoLine) {
    return `    [${id}] =
    {
        .baseHP = 40, .baseAttack = 40, .baseDefense = 40,
        .baseSpeed = 40, .baseSpAttack = 40, .baseSpDefense = 40,
        .types = MON_TYPES(TYPE_BUG),
        .abilities = { ABILITY_SHIELD_DUST, ABILITY_NONE },
        .speciesName = _("Bugmon"),
        .natDexNum = ${dex},
${evoLine ? `        .evolutions = EVOLUTION(${evoLine}),\n` : ''}    },
`;
}

const SCATTERBUG_LIKE = `
#if P_FAMILY_SCATTERBUG
${stage('SPECIES_SCATTERBUG_ICY_SNOW', 'NATIONAL_DEX_SCATTERBUG', '{EVO_LEVEL, 9, SPECIES_SPEWPA_ICY_SNOW}')}${stage('SPECIES_SCATTERBUG_POLAR', 'NATIONAL_DEX_SCATTERBUG', '{EVO_LEVEL, 9, SPECIES_SPEWPA_POLAR}')}${stage('SPECIES_SPEWPA_ICY_SNOW', 'NATIONAL_DEX_SPEWPA', null)}${stage('SPECIES_SPEWPA_POLAR', 'NATIONAL_DEX_SPEWPA', null)}#endif //P_FAMILY_SCATTERBUG
`;

describe('parseSpeciesFile — cosmetic family strip (T-154)', () => {
    test('the real cosmetic families are registered', () => {
        expect(COSMETIC_FAMILIES).toEqual(expect.arrayContaining([
            'P_FAMILY_UNOWN', 'P_FAMILY_SCATTERBUG', 'P_FAMILY_FLABEBE',
            'P_FAMILY_FURFROU', 'P_FAMILY_MILCERY',
        ]));
    });

    test('keeps only the first species per natDexNum (Unown → 1)', () => {
        const list = parseSpeciesFile(UNOWN_LIKE, {}, {});
        const unowns = list.filter(p => p.id.startsWith('SPECIES_UNOWN'));
        expect(unowns.map(p => p.id)).toEqual(['SPECIES_UNOWN']);
    });

    test('keeps one per stage and leaves the evo tree clean (no dropped-pattern pollution)', () => {
        const evoTree = {};
        const list = parseSpeciesFile(SCATTERBUG_LIKE, {}, evoTree);
        const ids = list.map(p => p.id).sort();
        expect(ids).toEqual(['SPECIES_SCATTERBUG_ICY_SNOW', 'SPECIES_SPEWPA_ICY_SNOW']);
        // evo tree links the kept representatives only
        const tree = JSON.stringify(evoTree.P_FAMILY_SCATTERBUG);
        expect(tree).toContain('SPECIES_SCATTERBUG_ICY_SNOW');
        expect(tree).toContain('SPECIES_SPEWPA_ICY_SNOW');
        expect(tree).not.toContain('POLAR');
    });
});
