const { parseSpeciesFile, COSMETIC_FAMILIES, nameizyPokemonId } = require('../../parser');

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

    test('base-only families (Genesect) keep the base and drop the alternate forms', () => {
        const GENESECT = `
#if P_FAMILY_GENESECT
    [SPECIES_GENESECT] =
    {
        .baseHP = 71, .baseAttack = 120, .baseDefense = 95,
        .baseSpeed = 99, .baseSpAttack = 120, .baseSpDefense = 95,
        .types = MON_TYPES(TYPE_BUG, TYPE_STEEL),
        .abilities = { ABILITY_DOWNLOAD, ABILITY_NONE },
        .speciesName = _("Genesect"),
        .natDexNum = NATIONAL_DEX_GENESECT,
    },
    [SPECIES_GENESECT_DOUSE] =
    {
        .baseHP = 71, .baseAttack = 120, .baseDefense = 95,
        .baseSpeed = 99, .baseSpAttack = 120, .baseSpDefense = 95,
        .types = MON_TYPES(TYPE_BUG, TYPE_STEEL),
        .abilities = { ABILITY_DOWNLOAD, ABILITY_NONE },
        .speciesName = _("Genesect"),
        .natDexNum = NATIONAL_DEX_GENESECT,
    },
#endif //P_FAMILY_GENESECT
`;
        const list = parseSpeciesFile(GENESECT, {}, {});
        expect(list.map(p => p.id)).toEqual(['SPECIES_GENESECT']);
        expect(COSMETIC_FAMILIES).toContain('P_FAMILY_GENESECT');
    });

    // B-043 — the kept representative is the FIRST-declared form (a suffixed id like
    // SPECIES_SPEWPA_ICY_SNOW), so its id-derived display name would carry the form suffix. But T-154's
    // intent is that cosmetic forms vanish leaving only the base — and "Icy Snow" is a Vivillon-only
    // wing pattern, so "Spewpa Icy Snow" names a form that does not exist. The docs must show the base
    // name. Arceus Normal / Silvally Normal (T-156/T-158) are deliberately NOT overridden here.
    test('B-043 — kept cosmetic representatives display as their base name (no form suffix)', () => {
        expect(nameizyPokemonId('SPECIES_SCATTERBUG_ICY_SNOW')).toBe('Scatterbug');
        expect(nameizyPokemonId('SPECIES_SPEWPA_ICY_SNOW')).toBe('Spewpa');
        expect(nameizyPokemonId('SPECIES_VIVILLON_ICY_SNOW')).toBe('Vivillon');
        expect(nameizyPokemonId('SPECIES_FLABEBE_RED')).toBe('Flabebe');
        expect(nameizyPokemonId('SPECIES_FLOETTE_RED')).toBe('Floette');
        expect(nameizyPokemonId('SPECIES_FLORGES_RED')).toBe('Florges');
        expect(nameizyPokemonId('SPECIES_FURFROU_NATURAL')).toBe('Furfrou');
        expect(nameizyPokemonId('SPECIES_ALCREMIE_STRAWBERRY_VANILLA_CREAM')).toBe('Alcremie');
        // Unown / Milcery keep the base id already, so they are unaffected
        expect(nameizyPokemonId('SPECIES_UNOWN')).toBe('Unown');
        expect(nameizyPokemonId('SPECIES_MILCERY')).toBe('Milcery');
        // type forms still derive from the id (owner decision) — but with a single space (B-046).
        expect(nameizyPokemonId('SPECIES_ARCEUS_NORMAL')).toBe('Arceus Normal');
    });

    // B-046 — the id→display-name transform must not double the space between words.
    test('B-046 — multi-word species names use a single space', () => {
        expect(nameizyPokemonId('SPECIES_ARCEUS_NORMAL')).toBe('Arceus Normal');
        expect(nameizyPokemonId('SPECIES_DEERLING_SPRING')).toBe('Deerling Spring');
        expect(nameizyPokemonId('SPECIES_NIDORAN_F')).toBe('Nidoran F');
        expect(nameizyPokemonId('SPECIES_TYPE_NULL')).toBe('Type Null');
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
