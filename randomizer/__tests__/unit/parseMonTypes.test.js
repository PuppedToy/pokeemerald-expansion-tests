'use strict';

// B-010: a species' .types can reference a config-driven family-type MACRO (defined inside the
// species_info .h file), e.g. Ralts: MON_TYPES(TYPE_PSYCHIC, RALTS_FAMILY_TYPE2). The parser used to
// keep the raw macro token as a "type"; the writer then prepended TYPE_ -> TYPE_RALTS_FAMILY_TYPE2,
// which is undefined and broke `make`. parseMonTypes must resolve these macros to real types.

const parser = require('../../parser');

describe('parser.parseMonTypes (B-010)', () => {
    test('resolves a family macro in the SECOND slot (Ralts family)', () => {
        // P_UPDATED_TYPES defaults to GEN_LATEST (>= GEN_6) -> RALTS_FAMILY_TYPE2 = FAIRY
        expect(parser.parseMonTypes('MON_TYPES(TYPE_PSYCHIC, RALTS_FAMILY_TYPE2)')).toEqual(['PSYCHIC', 'FAIRY']);
    });

    test('resolves a family macro in the FIRST slot (Togepi family)', () => {
        expect(parser.parseMonTypes('MON_TYPES(TOGEPI_FAMILY_TYPE, TYPE_FLYING)')).toEqual(['FAIRY', 'FLYING']);
    });

    test('resolves a mono-type family macro', () => {
        expect(parser.parseMonTypes('MON_TYPES(TOGEPI_FAMILY_TYPE)')).toEqual(['FAIRY']);
    });

    test('leaves plain types untouched and strips trailing comments', () => {
        expect(parser.parseMonTypes('MON_TYPES(TYPE_FIRE, TYPE_FLYING), // whatever')).toEqual(['FIRE', 'FLYING']);
        expect(parser.parseMonTypes('MON_TYPES(TYPE_WATER)')).toEqual(['WATER']);
    });
});
