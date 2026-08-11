'use strict';

// B-067 / T-264 — a stone evolution is legal only once its own IF_MIN_LEVEL is met.
//
// `isValidEvolution` used to switch on the METHOD (`method === 'ITEM' && level > 28`) instead of
// reading the level, so every stone evolution was legal from a hardcoded level 29 up regardless of
// the per-run gate `evoLevelWriter` writes into `evo.minLevel`. Wally at Route 110 (level 29) fielded
// a Basculegion M whose Dawn Stone gate was level 49 — 20 levels early — and Norman (39) / Jessica
// (49) both fielded a Kleavor gated at 55.
//
// The fixtures below are the two real cases from bundle 2231547897, with that run's levels.

const {
    isValidEvolution,
    evolutionMinLevel,
    checkValidEvo,
    devolveToLevel,
} = require('../../modules/utils');

// Basculin White-Striped (LC) --Dawn Stone, min lvl 49--> Basculegion M (final).
// The line also branches by level to Basculegion F at 46; neither is reachable at 29.
const basculin = {
    id: 'SPECIES_BASCULIN_WHITE_STRIPED',
    evolutions: [
        { method: 'ITEM', param: 'ITEM_DAWN_STONE', pokemon: 'SPECIES_BASCULEGION_M', minLevel: '49' },
        { method: 'LEVEL', param: '46', pokemon: 'SPECIES_BASCULEGION_F' },
    ],
    evolutionData: { type: 'EVO_TYPE_LC_OF_2', isLC: true, isNFE: true, isFinal: false },
};
const basculegionM = {
    id: 'SPECIES_BASCULEGION_M',
    evolutions: undefined,
    evolutionData: { type: 'EVO_TYPE_LAST_OF_2', isLC: false, isNFE: false, isFinal: true },
};

// Scyther (LC) --Leaf Stone, min lvl 55--> Kleavor (final).
const scyther = {
    id: 'SPECIES_SCYTHER',
    evolutions: [{ method: 'ITEM', param: 'ITEM_LEAF_STONE', pokemon: 'SPECIES_KLEAVOR', minLevel: '55' }],
    evolutionData: { type: 'EVO_TYPE_LC_OF_2', isLC: true, isNFE: true, isFinal: false },
};
const kleavor = {
    id: 'SPECIES_KLEAVOR',
    evolutions: undefined,
    evolutionData: { type: 'EVO_TYPE_LAST_OF_2', isLC: false, isNFE: false, isFinal: true },
};

const list = [basculin, basculegionM, scyther, kleavor];

const dawnStoneEvo = basculin.evolutions[0];
const levelEvo = basculin.evolutions[1];

describe('evolutionMinLevel (B-067)', () => {
    test('a level evolution carries its level in param', () => {
        expect(evolutionMinLevel(levelEvo)).toBe(46);
    });

    test('a stone evolution carries its level in minLevel, not in param', () => {
        expect(evolutionMinLevel(dawnStoneEvo)).toBe(49);
    });

    test('a stone evolution with no IF_MIN_LEVEL clause falls back to the default evolution level', () => {
        expect(evolutionMinLevel({ method: 'ITEM', param: 'ITEM_FIRE_STONE', pokemon: 'SPECIES_X' })).toBe(25);
    });

    test('the gym-2 reward filter (evolves by 25) rejects a late stone evolution', () => {
        // randomizer/modules/wildModule.js used to treat ANY `method === 'ITEM'` evolution as early
        // enough, which is the same defect one level up.
        expect(evolutionMinLevel(scyther.evolutions[0])).toBeGreaterThan(25);
    });
});

describe('isValidEvolution (B-067)', () => {
    test('a stone evolution is illegal below its min level, even above the old hardcoded 28', () => {
        expect(isValidEvolution(29, dawnStoneEvo)).toBe(false);
    });

    test('a stone evolution is legal exactly at its min level', () => {
        expect(isValidEvolution(49, dawnStoneEvo)).toBe(true);
    });

    test('a stone evolution stays legal above its min level', () => {
        expect(isValidEvolution(67, dawnStoneEvo)).toBe(true);
    });

    test('a level evolution is unaffected: legal at its level, illegal below', () => {
        expect(isValidEvolution(46, levelEvo)).toBe(true);
        expect(isValidEvolution(45, levelEvo)).toBe(false);
    });
});

describe('checkValidEvo — the trainer candidate filter (B-067)', () => {
    test('Norman (lvl 39) may not field a Kleavor whose Leaf Stone is gated at 55', () => {
        expect(checkValidEvo(list, kleavor, 39)).toBe(false);
    });

    test('the same Kleavor is a legal pick once the trainer reaches the gate', () => {
        expect(checkValidEvo(list, kleavor, 55)).toBe(true);
    });

    test('Basculegion M is rejected at Wally-Mauville level and accepted at its gate', () => {
        expect(checkValidEvo(list, basculegionM, 29)).toBe(false);
        expect(checkValidEvo(list, basculegionM, 49)).toBe(true);
    });
});

describe('devolveToLevel — the continuity echo (B-067)', () => {
    test("Wally's Basculegion M projected onto level 29 devolves to Basculin White-Striped", () => {
        expect(devolveToLevel(list, basculegionM, 29).id).toBe('SPECIES_BASCULIN_WHITE_STRIPED');
    });

    test('at its Dawn Stone gate it stays Basculegion M', () => {
        expect(devolveToLevel(list, basculegionM, 49).id).toBe('SPECIES_BASCULEGION_M');
    });

    test('one level below the gate it is still devolved', () => {
        expect(devolveToLevel(list, basculegionM, 48).id).toBe('SPECIES_BASCULIN_WHITE_STRIPED');
    });
});
