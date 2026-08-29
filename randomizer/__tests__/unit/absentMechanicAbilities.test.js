'use strict';

// T-292 — Terastallization does not exist in this base, so the abilities that only do something when
// a Pokémon Terastallizes are worth nothing, in both formats.
//
// Owner: *"la terastalización no existe así que es como si no tuviese habilidad (rating 0 a la
// habilidad de terapagos)"*.
//
// The C `aiRating` scores them as if the mechanic were there — Tera Shift is a 10 — which inflates
// Terapagos' tier on the strength of something the cartridge cannot do. This is the same shape as
// T-141's ally-only correction, but it applies to BOTH formats: an ally-only ability at least works
// in doubles, whereas an absent mechanic works nowhere.

const { rateAbilitySingles, rateAbilityDoubles } = require('../../rating');

const ability = rating => ({ rating });

describe('T-292 — abilities that need a mechanic this game does not have rate 0', () => {
    test.each([
        ['ABILITY_TERA_SHIFT', 10],
        ['ABILITY_TERA_SHELL', 10],
        ['ABILITY_TERAFORM_ZERO', 10],
    ])('%s rates 0 in both formats despite an aiRating of %i', (key, aiRating) => {
        expect(rateAbilitySingles(key, ability(aiRating))).toBe(0);
        expect(rateAbilityDoubles(key, ability(aiRating))).toBe(0);
    });
});

describe('T-292 — the correction is narrow', () => {
    test('an ordinary ability keeps its aiRating in both formats', () => {
        expect(rateAbilitySingles('ABILITY_INTIMIDATE', ability(8))).toBe(8);
        expect(rateAbilityDoubles('ABILITY_INTIMIDATE', ability(8))).toBeGreaterThanOrEqual(8);
    });

    test('T-141 ally-only abilities keep their doubles value — they are a different case', () => {
        // Absent-mechanic abilities are dead in both formats; ally-only ones only in singles.
        expect(rateAbilitySingles('ABILITY_COMMANDER', ability(10))).toBe(0);
        expect(rateAbilityDoubles('ABILITY_COMMANDER', ability(10))).toBeGreaterThan(0);
    });
});

describe('T-292 — Terapagos: the catchable form is the placeable one', () => {
    const { BANNED_SPECIES_FOR_PICKING } = require('../../modules/wildModule');

    test('the form the player owns outside battle may be placed', () => {
        expect(BANNED_SPECIES_FOR_PICKING).not.toContain('SPECIES_TERAPAGOS_NORMAL');
    });

    test.each([['SPECIES_TERAPAGOS_TERASTAL'], ['SPECIES_TERAPAGOS_STELLAR']])(
        '%s is a battle state and stays banned', id => {
            expect(BANNED_SPECIES_FOR_PICKING).toContain(id);
        });
});
