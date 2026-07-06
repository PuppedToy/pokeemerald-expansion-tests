'use strict';

// T-063 — cosmetic multi-form families (Pumpkaboo/Shellos/Deerling/Sinistea) must collapse to a
// single canonical family so the "one obtainable per family per run" dedup treats their forms as
// one. Regional (Alola/Galar/Hisui/Paldea) and functional (Own Tempo/Roaming/Artisan) forms are
// intentionally OUT of scope — they stay distinct.

const { getFamilyGroup } = require('../../modules/utils');

describe('getFamilyGroup — cosmetic form collapse (T-063)', () => {
    test.each([
        ['P_FAMILY_PUMPKABOO_SMALL', 'P_FAMILY_PUMPKABOO'],
        ['P_FAMILY_PUMPKABOO_LARGE', 'P_FAMILY_PUMPKABOO'],
        ['P_FAMILY_PUMPKABOO_SUPER', 'P_FAMILY_PUMPKABOO'],
        ['P_FAMILY_SHELLOS_EAST', 'P_FAMILY_SHELLOS'],
        ['P_FAMILY_DEERLING_SUMMER', 'P_FAMILY_DEERLING'],
        ['P_FAMILY_DEERLING_AUTUMN', 'P_FAMILY_DEERLING'],
        ['P_FAMILY_DEERLING_WINTER', 'P_FAMILY_DEERLING'],
        ['P_FAMILY_SINISTEA_ANTIQUE', 'P_FAMILY_SINISTEA'],
    ])('%s collapses to %s', (form, base) => {
        expect(getFamilyGroup(form)).toBe(base);
    });

    test('base (suffix-less) families are unchanged', () => {
        ['P_FAMILY_PUMPKABOO', 'P_FAMILY_SHELLOS', 'P_FAMILY_DEERLING', 'P_FAMILY_SINISTEA', 'P_FAMILY_PIKACHU']
            .forEach(f => expect(getFamilyGroup(f)).toBe(f));
    });

    test('regional forms stay distinct (out of scope — genuinely different Pokémon)', () => {
        ['P_FAMILY_MEOWTH_ALOLA', 'P_FAMILY_MEOWTH_GALAR', 'P_FAMILY_GEODUDE_ALOLA',
         'P_FAMILY_QWILFISH_HISUI', 'P_FAMILY_STUNFISK_GALAR', 'P_FAMILY_TAUROS_PALDEA']
            .forEach(f => expect(getFamilyGroup(f)).toBe(f));
    });

    test('functional forms stay distinct (Own Tempo / Roaming / Artisan)', () => {
        ['P_FAMILY_ROCKRUFF_OWN_TEMPO', 'P_FAMILY_GIMMIGHOUL_ROAMING', 'P_FAMILY_SINISTCHA_ARTISAN']
            .forEach(f => expect(getFamilyGroup(f)).toBe(f));
    });

    test('two cosmetic forms share a group; a form and a regional variant do not', () => {
        expect(getFamilyGroup('P_FAMILY_PUMPKABOO_SUPER')).toBe(getFamilyGroup('P_FAMILY_PUMPKABOO'));
        expect(getFamilyGroup('P_FAMILY_MEOWTH_ALOLA')).not.toBe(getFamilyGroup('P_FAMILY_MEOWTH_GALAR'));
    });
});
