'use strict';

// B-067 (second half) — a stone evolution needs BOTH its own rolled gate AND a stone in the bag.
//
// The old `level > 28` rule was, badly, standing in for "you cannot have a stone yet". Removing it
// left the run's rolled gate as the only constraint, and `evoLevels.min` is 5, so a run could put a
// stone evolution at level 9 — before the player has any stone at all.
//
// In this game every one of the ten stones arrives at once, from the Rustboro rival
// (`RustboroCity_EventScript_GiveEvolutionStones`, which sets FLAG_DEFEATED_RIVAL_RUSTBORO). So the real
// requirement is `max(that cap's level, rolled gate)`, and the floor is applied where the gate is
// DECIDED — in applyEvoLevels — so the ROM's IF_MIN_LEVEL clause, the docs and the trainer check all
// read the same number and no ambient state has to be threaded into the check.

const { applyEvoLevels } = require('../../evoLevelWriter');
const { stoneUnlockLevel, EVOLUTION_STONES_UNLOCK_FLAG } = require('../../bossCaps');
const rng = require('../../rng');

const mon = (id, tier, evolutions, type) => ({
    id, family: `P_FAMILY_${id}`, evolutions,
    evolutionData: { type, isLC: type === 'EVO_TYPE_LC_OF_2', isNFE: type === 'EVO_TYPE_LC_OF_2', isFinal: type !== 'EVO_TYPE_LC_OF_2' },
    rating: { tier },
});

// A weak line, so the computed gate lands low enough to be clamped.
function makeList() {
    return [
        mon('SPECIES_WURMPLE', 'MAGIKARP', [
            { method: 'ITEM', param: 'ITEM_MOON_STONE', pokemon: 'SPECIES_CASCOON' },
            { method: 'LEVEL', param: '7', pokemon: 'SPECIES_SILCOON' },
        ], 'EVO_TYPE_LC_OF_2'),
        mon('SPECIES_CASCOON', 'ZU', undefined, 'EVO_TYPE_LAST_OF_2'),
        mon('SPECIES_SILCOON', 'ZU', undefined, 'EVO_TYPE_LAST_OF_2'),
    ];
}

const gates = (list) => {
    const evos = list[0].evolutions;
    return {
        stone: parseInt(evos.find(e => e.method === 'ITEM').minLevel, 10),
        level: parseInt(evos.find(e => e.method === 'LEVEL').param, 10),
    };
};

describe('stoneUnlockLevel reads the caps SSOT (B-067)', () => {
    test('resolves the Rustboro rival cap from a capLevels map', () => {
        expect(stoneUnlockLevel({ [EVOLUTION_STONES_UNLOCK_FLAG]: 18 })).toBe(18);
    });

    test('returns null when the map is missing or has no such flag, so callers keep their default', () => {
        expect(stoneUnlockLevel(undefined)).toBeNull();
        expect(stoneUnlockLevel({})).toBeNull();
    });
});

describe('applyEvoLevels floors stone gates at the stone-unlock level (B-067)', () => {
    afterEach(() => rng.reset());

    test('a stone gate rolled below the unlock level is raised to it', () => {
        rng.seed(1);
        const list = makeList();
        applyEvoLevels(list, { min: 5, max: 65 }, { stoneUnlockLevel: 30 });
        expect(gates(list).stone).toBeGreaterThanOrEqual(30);
    });

    test('a level evolution is NOT floored — it needs no item', () => {
        rng.seed(1);
        const list = makeList();
        applyEvoLevels(list, { min: 5, max: 65 }, { stoneUnlockLevel: 30 });
        expect(gates(list).level).toBeLessThan(30);
    });

    test('a stone gate already above the unlock level is left exactly where the roll put it', () => {
        rng.seed(1);
        const floored = makeList();
        applyEvoLevels(floored, { min: 5, max: 65 }, { stoneUnlockLevel: 2 });
        rng.seed(1);
        const unfloored = makeList();
        applyEvoLevels(unfloored, { min: 5, max: 65 }, {});
        expect(gates(floored).stone).toBe(gates(unfloored).stone);
    });

    test('the floor consumes no RNG, so the rest of the world is untouched', () => {
        rng.seed(1);
        const a = makeList();
        applyEvoLevels(a, { min: 5, max: 65 }, { stoneUnlockLevel: 30 });
        const afterFloored = rng.random();
        rng.seed(1);
        const b = makeList();
        applyEvoLevels(b, { min: 5, max: 65 }, {});
        expect(rng.random()).toBe(afterFloored);
        expect(gates(a).level).toBe(gates(b).level);
    });

    test('the returned stoneMap carries the floored level, not the raw roll', () => {
        rng.seed(1);
        const list = makeList();
        const { stoneMap } = applyEvoLevels(list, { min: 5, max: 65 }, { stoneUnlockLevel: 30 });
        expect(stoneMap.get('SPECIES_CASCOON')).toBe(gates(list).stone);
        expect(stoneMap.get('SPECIES_CASCOON')).toBeGreaterThanOrEqual(30);
    });
});
