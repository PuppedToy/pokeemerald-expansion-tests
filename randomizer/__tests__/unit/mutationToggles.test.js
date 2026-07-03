'use strict';

// T-052 Step 5 — the four mutation categories (stats / abilities / types / learnsets) are
// independently toggleable. Disabling a category removes exactly that class of change from the
// mutation log; all four on (default) still produces every class. Coupling: the type-change-driven
// learnset edit lives under mutateTypes, the independent random pass under mutateLearnsets.

const moves = require('../fixtures/miniMoves');
const { STARMIE } = require('../fixtures/miniPokes');
const abilities = require('../fixtures/miniAbilities');

function freshBalancer() {
    let balancePokemon, isolatedRng;
    jest.isolateModules(() => {
        ({ balancePokemon } = require('../../rebalancer'));
        isolatedRng = require('../../rng');
    });
    return { balancePokemon, rng: isolatedRng };
}

const abilityNames = Object.keys(abilities).map(k => k.replace('ABILITY_', ''));
const STAT_TARGETS = new Set(['baseHP', 'baseAttack', 'baseDefense', 'baseSpAttack', 'baseSpDefense', 'baseSpeed']);

// Run many seeds with the gate forced fully open (balanceChance = 1) and tally which log-target
// categories appear. Unique family per call so family-inheritance never pollutes the tally.
function tally(options, seeds = 80) {
    const { balancePokemon, rng } = freshBalancer();
    const counts = { stat: 0, type: 0, ability: 0, learnsetMove: 0 };
    for (let s = 0; s < seeds; s++) {
        rng.seed(s + 1);
        const poke = { ...STARMIE, family: `FAM_${s}` };
        const { log } = balancePokemon(poke, abilityNames, moves, 1, options);
        for (const entry of log) {
            if (STAT_TARGETS.has(entry.target)) counts.stat++;
            else if (entry.target === 'type') counts.type++;
            else if (entry.target === 'ability') counts.ability++;
            else if (entry.target === 'learnsetMove') counts.learnsetMove++;
        }
    }
    return counts;
}

describe('mutation category toggles', () => {
    test('baseline (all on) produces every category of change', () => {
        const c = tally({});
        expect(c.stat).toBeGreaterThan(0);
        expect(c.type).toBeGreaterThan(0);
        expect(c.ability).toBeGreaterThan(0);
        expect(c.learnsetMove).toBeGreaterThan(0);
    });

    test('mutateStats:false removes all stat changes (others still occur)', () => {
        const c = tally({ mutateStats: false });
        expect(c.stat).toBe(0);
        expect(c.type + c.ability + c.learnsetMove).toBeGreaterThan(0);
    });

    test('mutateAbilities:false removes all ability changes', () => {
        expect(tally({ mutateAbilities: false }).ability).toBe(0);
    });

    test('mutateTypes:false removes all type changes', () => {
        expect(tally({ mutateTypes: false }).type).toBe(0);
    });

    test('learnset changes require the right toggle: types (step 1) + learnsets (step 2)', () => {
        // Both learnset sources off → no learnsetMove entries at all.
        expect(tally({ mutateTypes: false, mutateLearnsets: false }).learnsetMove).toBe(0);
    });

    test('all four off → the mutation log is empty', () => {
        const c = tally({ mutateStats: false, mutateAbilities: false, mutateTypes: false, mutateLearnsets: false });
        expect(c.stat + c.type + c.ability + c.learnsetMove).toBe(0);
    });
});
