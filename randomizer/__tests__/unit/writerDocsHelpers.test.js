'use strict';

const { filterByNearestContextualTier } = require('../../writerDocs');

function makePoke(id, tierAtCap7) {
    return {
        id,
        contextualRatings: tierAtCap7 !== null ? { 7: { tier: tierAtCap7, absoluteRating: 5.0 } } : {},
    };
}

describe('filterByNearestContextualTier', () => {
    const magikarpPoke = makePoke('MAGIKARP_MON', 'MAGIKARP');
    const zuPoke       = makePoke('ZU_MON', 'ZU');
    const puPoke       = makePoke('PU_MON', 'PU');
    const nuPoke       = makePoke('NU_MON', 'NU');
    const ruPoke       = makePoke('RU_MON', 'RU');
    const noCapPoke    = makePoke('NOCAP_MON', null);

    test('exact tier match returns only matching Pokémon', () => {
        const list = [zuPoke, puPoke, nuPoke, noCapPoke];
        expect(filterByNearestContextualTier(list, ['PU'], 7)).toEqual([puPoke]);
    });

    test('prefers tier above (NU) over tier below (ZU) when exact tier PU has 0 results', () => {
        const list = [zuPoke, nuPoke, noCapPoke];
        expect(filterByNearestContextualTier(list, ['PU'], 7)).toEqual([nuPoke]);
    });

    test('falls back to tier below (ZU) when tier above (NU) also has 0 results', () => {
        const list = [zuPoke, noCapPoke];
        expect(filterByNearestContextualTier(list, ['PU'], 7)).toEqual([zuPoke]);
    });

    test('walks two steps up (RU) when one step up and one step down both yield 0', () => {
        const list = [ruPoke, noCapPoke];
        expect(filterByNearestContextualTier(list, ['PU'], 7)).toEqual([ruPoke]);
    });

    test('returns original list reference when no tier has any Pokémon', () => {
        const list = [noCapPoke];
        expect(filterByNearestContextualTier(list, ['PU'], 7)).toBe(list);
    });

    test('returns original list reference for unknown tier string', () => {
        const list = [zuPoke, puPoke];
        expect(filterByNearestContextualTier(list, ['INVALID_TIER'], 7)).toBe(list);
    });

    test('multiple requested tiers returns union match on exact hit', () => {
        const list = [zuPoke, puPoke, nuPoke];
        expect(filterByNearestContextualTier(list, ['ZU', 'PU'], 7)).toEqual([zuPoke, puPoke]);
    });

    test('MAGIKARP tier is reachable — bottom of ZU falls back to MAGIKARP', () => {
        const list = [magikarpPoke, noCapPoke];
        expect(filterByNearestContextualTier(list, ['ZU'], 7)).toEqual([magikarpPoke]);
    });
});
