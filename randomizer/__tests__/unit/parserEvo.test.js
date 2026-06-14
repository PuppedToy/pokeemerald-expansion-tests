const { parseEvo } = require('../../parser');

describe('parseEvo — IF_MIN_LEVEL capture', () => {
    test('captures minLevel from a stone evolution with CONDITIONS({IF_MIN_LEVEL, N})', () => {
        const line = '        .evolutions = EVOLUTION({EVO_ITEM, ITEM_FIRE_STONE, SPECIES_FOO, CONDITIONS({IF_MIN_LEVEL, 25})}),';
        const evo = parseEvo('P_FAMILY_FOO', 'SPECIES_PREFOO', line, {});
        expect(evo).toEqual(expect.objectContaining({
            method: 'ITEM',
            param: 'ITEM_FIRE_STONE',
            pokemon: 'SPECIES_FOO',
            minLevel: '25',
        }));
    });

    test('captures a non-default minLevel', () => {
        const line = '                                {EVO_ITEM, ITEM_SUN_STONE, SPECIES_BAR, CONDITIONS({IF_MIN_LEVEL, 41})}),';
        const evo = parseEvo('P_FAMILY_BAR', 'SPECIES_PREBAR', line, {});
        expect(evo.minLevel).toBe('41');
        expect(evo.param).toBe('ITEM_SUN_STONE');
    });

    test('plain level evolution has no minLevel', () => {
        const line = '        .evolutions = EVOLUTION({EVO_LEVEL, 16, SPECIES_BAZ}),';
        const evo = parseEvo('P_FAMILY_BAZ', 'SPECIES_PREBAZ', line, {});
        expect(evo.method).toBe('LEVEL');
        expect(evo.param).toBe('16');
        expect(evo.minLevel).toBeUndefined();
    });
});
