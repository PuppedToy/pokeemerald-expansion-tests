'use strict';

// T-052 Step 6 — every mutation probability is overridable via options.probs, each falling back to
// its historical constant. Extreme values (0 / 1) prove each knob is wired; omitting probs is
// identical to passing the defaults (byte-identical fallback).

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

function tally(options, seeds = 60) {
    const { balancePokemon, rng } = freshBalancer();
    const counts = { stat: 0, type: 0, ability: 0 };
    for (let s = 0; s < seeds; s++) {
        rng.seed(s + 1);
        const { log } = balancePokemon({ ...STARMIE, family: `FAM_${s}` }, abilityNames, moves, 1, options);
        for (const e of log) {
            if (STAT_TARGETS.has(e.target)) counts.stat++;
            else if (e.target === 'type') counts.type++;
            else if (e.target === 'ability') counts.ability++;
        }
    }
    return { counts, seeds };
}

describe('mutation probability overrides', () => {
    test('typeBalanceChance:1 changes the type of every mutated Pokémon', () => {
        const { counts, seeds } = tally({ probs: { typeBalanceChance: 1 } });
        expect(counts.type).toBe(seeds);
    });

    test('statBalanceChance:0 disables stat shifts', () => {
        expect(tally({ probs: { statBalanceChance: 0 } }).counts.stat).toBe(0);
    });

    test('abilityBalanceChance:1 swaps an ability for every mutated Pokémon', () => {
        const { counts, seeds } = tally({ probs: { abilityBalanceChance: 1 } });
        expect(counts.ability).toBe(seeds);
    });

    test('omitting probs is identical to passing the defaults (byte-identical fallback)', () => {
        const defaults = {
            statBalanceChance: 0.7, buffStatChance: 0.6, repeatStatChance: 0.5,
            typeBalanceChance: 0.1, monotypeBalanceChance: 0.1, abilityBalanceChance: 0.1,
            learnsetBalanceChance: 0.2, changeTypeMoveFromOldChance: 0.9,
            changeTypeMoveFromOtherChance: 0.05, moveInsertChance: 0.5, moveRatingDeviation: 0.2,
        };
        const bare = freshBalancer();
        const withDefaults = freshBalancer();
        for (let s = 0; s < 40; s++) {
            bare.rng.seed(s + 1);
            const a = bare.balancePokemon({ ...STARMIE, family: `F_${s}` }, abilityNames, moves, 1, {});
            withDefaults.rng.seed(s + 1);
            const b = withDefaults.balancePokemon({ ...STARMIE, family: `F_${s}` }, abilityNames, moves, 1, { probs: defaults });
            expect(JSON.stringify(b.log)).toBe(JSON.stringify(a.log));
        }
    });
});
