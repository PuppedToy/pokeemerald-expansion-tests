'use strict';

// T-279 / ADR-026 — a species' stage comes from its DEGREE in the evolution graph, not from its
// index inside `evoTree[family]`.
//
// The old `getEvolutionType` was purely positional: no tree for your family ⇒ SOLO, index 0 ⇒ LC,
// anything else ⇒ LAST. Where the family string and the graph disagreed it produced nonsense that
// decided which wild/starter/reward slots a mon could fill:
//   · Cursola, Weezing-Galar, Sirfetch'd and Overqwil were "non-evolving mons" — real stage-2s, all
//     placeable in solo slots;
//   · Sliggoo-Hisui and Mr. Mime-Galar were FIRST stages, placeable as wild base forms even though
//     each only exists via a stone from another line;
//   · Basculin Red/Blue-Striped were finals of the White-Striped line they can never join.

const { classifyStages } = require('../../evoStages');
const {
    EVO_TYPE_SOLO, EVO_TYPE_LC_OF_2, EVO_TYPE_LC_OF_3,
    EVO_TYPE_NFE_OF_3, EVO_TYPE_LAST_OF_2, EVO_TYPE_LAST_OF_3, EVO_TYPE_MEGA,
} = require('../../constants');

const mon = (id, ...targets) => ({
    id,
    ...(targets.length ? { evolutions: targets.map(pokemon => ({ method: 'LEVEL', param: '20', pokemon })) } : {}),
});

const DEX = [
    // 3-stage line
    mon('PICHU', 'PIKACHU'), mon('PIKACHU', 'RAICHU'), mon('RAICHU'),
    // 2-stage branching line, one branch in another family
    mon('KOFFING', 'WEEZING', 'WEEZING_GALAR'), mon('WEEZING'), mon('WEEZING_GALAR'),
    // 3-stage line whose middle stage branches
    mon('GOOMY', 'SLIGGOO', 'SLIGGOO_HISUI'), mon('SLIGGOO', 'GOODRA'),
    mon('SLIGGOO_HISUI', 'GOODRA_HISUI'), mon('GOODRA'), mon('GOODRA_HISUI'),
    // regional base whose evolution is named after the non-regional line
    mon('CORSOLA_GALAR', 'CURSOLA'), mon('CURSOLA'),
    // genuinely non-evolving mons
    mon('CORSOLA'), mon('BASCULIN_RED_STRIPED'),
    // convergence
    mon('BURMY_PLANT', 'WORMADAM_PLANT', 'MOTHIM'),
    mon('BURMY_SANDY', 'WORMADAM_SANDY', 'MOTHIM'),
    mon('WORMADAM_PLANT'), mon('WORMADAM_SANDY'), mon('MOTHIM'),
    // a mega is not an evolution edge
    mon('SLOWBRO_MEGA'),
];

const stage = classifyStages(DEX);

describe('T-279 — stage from degree', () => {
    test.each([
        ['PICHU', EVO_TYPE_LC_OF_3],
        ['PIKACHU', EVO_TYPE_NFE_OF_3],
        ['RAICHU', EVO_TYPE_LAST_OF_3],
        ['KOFFING', EVO_TYPE_LC_OF_2],
        ['WEEZING', EVO_TYPE_LAST_OF_2],
        ['CORSOLA', EVO_TYPE_SOLO],
    ])('%s is %s', (id, type) => {
        expect(stage(id)).toBe(type);
    });
});

describe('T-279 — the cases the family key got wrong', () => {
    test('a stage-2 whose family has no tree is no longer a non-evolving mon', () => {
        expect(stage('CURSOLA')).toBe(EVO_TYPE_LAST_OF_2);
        expect(stage('WEEZING_GALAR')).toBe(EVO_TYPE_LAST_OF_2);
    });

    test('a middle stage in its own family is no longer a first stage', () => {
        expect(stage('SLIGGOO_HISUI')).toBe(EVO_TYPE_NFE_OF_3);
        expect(stage('GOODRA_HISUI')).toBe(EVO_TYPE_LAST_OF_3);
    });

    test('a truly non-evolving mon is SOLO, not a final of a line it cannot join', () => {
        expect(stage('BASCULIN_RED_STRIPED')).toBe(EVO_TYPE_SOLO);
    });

    test('a regional base is a first stage of its own line', () => {
        expect(stage('CORSOLA_GALAR')).toBe(EVO_TYPE_LC_OF_2);
    });

    test('a convergence point is a final, and its cloaks are first stages', () => {
        expect(stage('MOTHIM')).toBe(EVO_TYPE_LAST_OF_2);
        expect(stage('BURMY_PLANT')).toBe(EVO_TYPE_LC_OF_2);
        expect(stage('WORMADAM_SANDY')).toBe(EVO_TYPE_LAST_OF_2);
    });
});

describe('T-279 — megas keep their own type', () => {
    test.each([['SLOWBRO_MEGA'], ['SPECIES_KYOGRE_PRIMAL'], ['X_MEGA_X'], ['Y_MEGA_Y']])(
        '%s is EVO_TYPE_MEGA', id => {
            expect(classifyStages([{ id }])(id)).toBe(EVO_TYPE_MEGA);
        });
});

describe('T-279 — line length is the longest path, not the family size', () => {
    test('a 2-stage line inside a family that also holds a 3-stage one', () => {
        // Goomy branches into a 2-stage arm (Sliggoo-Hisui → Goodra-Hisui) and a 2-stage arm
        // (Sliggoo → Goodra); the whole thing is 3 stages deep either way.
        expect(stage('GOOMY')).toBe(EVO_TYPE_LC_OF_3);
        expect(stage('SLIGGOO')).toBe(EVO_TYPE_NFE_OF_3);
        expect(stage('GOODRA')).toBe(EVO_TYPE_LAST_OF_3);
    });

    test('an unknown species falls back to SOLO instead of throwing', () => {
        expect(stage('NOT_IN_THE_DEX')).toBe(EVO_TYPE_SOLO);
    });
});
