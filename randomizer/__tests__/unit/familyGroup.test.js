'use strict';

// G1 (ADR-026) — dedup is per SUPERFAMILY: the player may obtain one member of a dev block
// (`#if P_FAMILY_x`) per run, whatever that block splits into. One invariant rule, no per-case map.
//
// This **supersedes T-063 decision #1**, which made every regional line its own obtainable so a run
// could offer Meowth-Alola *and* Meowth-Galar. The owner's ruling:
//   *"el dedup clause hace que el jugador solo pueda obtener 1 en general de la superfamilia, aunque
//    sean familias independientes. Es la regla general y ayuda mucho porque es invariable."*
//
// The identity split is unaffected and still real: Meowth, Meowth-Alola and Meowth-Galar remain three
// separate families that inherit nothing from each other (T-278). They just cannot both be handed out.

const { getFamilyGroup } = require('../../modules/utils');
const { POKE_FORMS } = require('../../constants');

describe('G1 — every form suffix collapses to its dev block', () => {
    test.each([
        // cosmetic sets (was T-063's whole scope — still true)
        ['P_FAMILY_PUMPKABOO_SMALL', 'P_FAMILY_PUMPKABOO'],
        ['P_FAMILY_PUMPKABOO_LARGE', 'P_FAMILY_PUMPKABOO'],
        ['P_FAMILY_PUMPKABOO_SUPER', 'P_FAMILY_PUMPKABOO'],
        ['P_FAMILY_SHELLOS_EAST', 'P_FAMILY_SHELLOS'],
        ['P_FAMILY_DEERLING_SUMMER', 'P_FAMILY_DEERLING'],
        ['P_FAMILY_DEERLING_AUTUMN', 'P_FAMILY_DEERLING'],
        ['P_FAMILY_DEERLING_WINTER', 'P_FAMILY_DEERLING'],
        ['P_FAMILY_SINISTEA_ANTIQUE', 'P_FAMILY_SINISTEA'],
        // T-157 sets
        ['P_FAMILY_BURMY_SANDY', 'P_FAMILY_BURMY'],
        ['P_FAMILY_BURMY_TRASH', 'P_FAMILY_BURMY'],
        ['P_FAMILY_OGERPON_WELLSPRING', 'P_FAMILY_OGERPON'],
        // regional lines — NEW under G1
        ['P_FAMILY_MEOWTH_ALOLA', 'P_FAMILY_MEOWTH'],
        ['P_FAMILY_MEOWTH_GALAR', 'P_FAMILY_MEOWTH'],
        ['P_FAMILY_GEODUDE_ALOLA', 'P_FAMILY_GEODUDE'],
        ['P_FAMILY_QWILFISH_HISUI', 'P_FAMILY_QWILFISH'],
        ['P_FAMILY_STUNFISK_GALAR', 'P_FAMILY_STUNFISK'],
        ['P_FAMILY_TAUROS_PALDEA', 'P_FAMILY_TAUROS'],
        ['P_FAMILY_KOFFING_GALAR', 'P_FAMILY_KOFFING'],
        ['P_FAMILY_CORSOLA_GALAR', 'P_FAMILY_CORSOLA'],
        // the last functional suffix (Own Tempo and Roaming lost their species in T-289)
        ['P_FAMILY_POLTCHAGEIST_ARTISAN', 'P_FAMILY_POLTCHAGEIST'],
    ])('%s → %s', (form, block) => {
        expect(getFamilyGroup(form)).toBe(block);
    });

    test('a suffix-less family is its own group', () => {
        ['P_FAMILY_PUMPKABOO', 'P_FAMILY_SHELLOS', 'P_FAMILY_DEERLING', 'P_FAMILY_SINISTEA',
         'P_FAMILY_PIKACHU', 'P_FAMILY_MEOWTH']
            .forEach(f => expect(getFamilyGroup(f)).toBe(f));
    });

    test('every suffix the parser can append is stripped — no curated subset', () => {
        // The old list was a hand-picked subset of POKE_FORMS, which is how regional forms escaped.
        for (const suffix of POKE_FORMS) {
            expect(getFamilyGroup(`P_FAMILY_TESTMON_${suffix}`)).toBe('P_FAMILY_TESTMON');
        }
    });
});

describe('G1 — the three Meowth lines share one obtainable slot', () => {
    test('all three collapse together', () => {
        const groups = ['P_FAMILY_MEOWTH', 'P_FAMILY_MEOWTH_ALOLA', 'P_FAMILY_MEOWTH_GALAR']
            .map(getFamilyGroup);
        expect(new Set(groups).size).toBe(1);
    });

    test('Koffing yields Weezing or Weezing-Galar, never both', () => {
        expect(getFamilyGroup('P_FAMILY_KOFFING_GALAR')).toBe(getFamilyGroup('P_FAMILY_KOFFING'));
    });

    test('unrelated blocks stay apart', () => {
        expect(getFamilyGroup('P_FAMILY_MEOWTH_ALOLA')).not.toBe(getFamilyGroup('P_FAMILY_PIKACHU'));
        expect(getFamilyGroup('P_FAMILY_CORSOLA')).not.toBe(getFamilyGroup('P_FAMILY_KOFFING'));
    });
});

describe('G1 — explicit overrides still win over the suffix strip', () => {
    test('Greninja Battle Bond collapses into the Froakie line (T-185)', () => {
        expect(getFamilyGroup('P_FAMILY_GRENINJA_BATTLE_BOND')).toBe('P_FAMILY_FROAKIE');
    });
});
