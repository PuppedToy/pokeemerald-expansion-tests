'use strict';

// T-281 / ADR-026 — a mega belongs to the species it is a mega OF, and to the line that can reach
// that species. Not to a family.
//
// `megaEvoTree` was keyed by family and handed the whole list to every non-mega member, so a mega
// bled across sibling branches: Slowking carried Slowbro-Mega, Gardevoir and Gallade each carried
// BOTH megas, Kleavor carried Scizor-Mega and Froslass carried Glalie-Mega. The `invalidMegas`
// blocklist in modules/utils.js was a hand-patch for exactly this — and it only covered Froslass and
// Kleavor, never Slowking.

const { megaEvosOf } = require('../../evoStages');
const { hasValidMega } = require('../../modules/utils');

const mon = (id, ...targets) => ({
    id, evolutionData: { isMega: false },
    ...(targets.length ? { evolutions: targets.map(pokemon => ({ method: 'LEVEL', param: '20', pokemon })) } : {}),
});
const mega = (id, base) => ({ id, evolutionData: { isMega: true, megaBaseForm: base } });

// Slowpoke branches into Slowbro (which has a mega) and Slowking (which does not).
// Kirlia branches into Gardevoir and Gallade, each with its own mega.
// Scyther branches into Scizor (mega) and Kleavor (none).
const DEX = [
    mon('SPECIES_SLOWPOKE', 'SPECIES_SLOWBRO', 'SPECIES_SLOWKING'),
    mon('SPECIES_SLOWBRO'), mon('SPECIES_SLOWKING'),
    mega('SPECIES_SLOWBRO_MEGA', 'SPECIES_SLOWBRO'),

    mon('SPECIES_RALTS', 'SPECIES_KIRLIA'),
    mon('SPECIES_KIRLIA', 'SPECIES_GARDEVOIR', 'SPECIES_GALLADE'),
    mon('SPECIES_GARDEVOIR'), mon('SPECIES_GALLADE'),
    mega('SPECIES_GARDEVOIR_MEGA', 'SPECIES_GARDEVOIR'),
    mega('SPECIES_GALLADE_MEGA', 'SPECIES_GALLADE'),

    mon('SPECIES_SCYTHER', 'SPECIES_SCIZOR', 'SPECIES_KLEAVOR'),
    mon('SPECIES_SCIZOR'), mon('SPECIES_KLEAVOR'),
    mega('SPECIES_SCIZOR_MEGA', 'SPECIES_SCIZOR'),
];

const megas = megaEvosOf(DEX);

describe('T-281 — a mega reaches only the line that can reach its base', () => {
    test('the base species itself carries its mega', () => {
        expect(megas('SPECIES_SLOWBRO')).toEqual(['SPECIES_SLOWBRO_MEGA']);
    });

    test('a pre-evolution carries it too — it can still get there', () => {
        expect(megas('SPECIES_SLOWPOKE')).toEqual(['SPECIES_SLOWBRO_MEGA']);
        expect(megas('SPECIES_RALTS').sort())
            .toEqual(['SPECIES_GALLADE_MEGA', 'SPECIES_GARDEVOIR_MEGA']);
    });

    test('a sibling branch carries nothing — this is the bug', () => {
        expect(megas('SPECIES_SLOWKING')).toEqual([]);
        expect(megas('SPECIES_KLEAVOR')).toEqual([]);
    });

    test('two siblings with a mega each keep only their own', () => {
        expect(megas('SPECIES_GARDEVOIR')).toEqual(['SPECIES_GARDEVOIR_MEGA']);
        expect(megas('SPECIES_GALLADE')).toEqual(['SPECIES_GALLADE_MEGA']);
    });

    test('a mega does not carry itself', () => {
        expect(megas('SPECIES_SLOWBRO_MEGA')).toEqual([]);
    });
});

describe('T-281 — hasValidMega needs no blocklist', () => {
    const withMegas = id => ({ id, evolutionData: { megaEvos: megas(id) } });

    test.each([
        ['SPECIES_SLOWBRO', true],
        ['SPECIES_SLOWKING', false],
        ['SPECIES_KLEAVOR', false],
        ['SPECIES_GALLADE', true],
    ])('%s → %s', (id, expected) => {
        expect(hasValidMega(withMegas(id))).toBe(expected);
    });

    test('Froslass and Kleavor are handled by the graph, not by a hardcoded list', () => {
        // The old fix was `const invalidMegas = ['SPECIES_FROSLASS', 'SPECIES_KLEAVOR']`. No blocklist
        // may be declared again — the graph decides. (The historical note in the comment above the
        // function is fine; what must not come back is the declaration.)
        const utils = require('fs').readFileSync(require.resolve('../../modules/utils'), 'utf8');
        expect(utils).not.toMatch(/^\s*(const|let|var)\s+invalidMegas\b/m);
    });
});
