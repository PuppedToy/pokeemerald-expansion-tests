'use strict';

// B-010 (defense-in-depth): even if a non-type token reaches the writer, it must NOT be mangled into
// an undefined TYPE_<token>. A token that isn't a known type is emitted verbatim (it's a valid in-file
// macro/constant), so `make` never breaks the way it did on Kirlia (TYPE_RALTS_FAMILY_TYPE2).

const { editSpeciesFile } = require('../../pokemonWriter');

const speciesFile = [
    '    [SPECIES_KIRLIA] =',
    '    {',
    '        .types = MON_TYPES(TYPE_PSYCHIC, RALTS_FAMILY_TYPE2),',
    '    },',
].join('\n');

describe('editSpeciesFile type emission (B-010)', () => {
    test('clean parsed types are written as valid TYPE_ constants', () => {
        const out = editSpeciesFile(speciesFile, [{
            id: 'SPECIES_KIRLIA', parsedTypes: ['FIRE', 'FAIRY'],
            log: [{ target: 'type', oldValue: 'PSYCHIC' }],
        }]);
        expect(out).toContain('MON_TYPES(TYPE_FIRE, TYPE_FAIRY)');
        expect(out).not.toContain('TYPE_RALTS_FAMILY_TYPE2');
    });

    test('an unrecognized token is emitted verbatim, never TYPE_-prefixed', () => {
        const out = editSpeciesFile(speciesFile, [{
            id: 'SPECIES_KIRLIA', parsedTypes: ['FIRE', 'RALTS_FAMILY_TYPE2'],
            log: [{ target: 'type', oldValue: 'PSYCHIC' }],
        }]);
        expect(out).toContain('MON_TYPES(TYPE_FIRE, RALTS_FAMILY_TYPE2)');
        expect(out).not.toContain('TYPE_RALTS_FAMILY_TYPE2');
    });
});
