'use strict';

// B-069 — a second generation in the same process ignored the seed.
//
// `familyTracking` in rebalancer.js is module-level state: within one run it is the point (a family's
// members inherit the family's mutations), but it survived the end of a run, so the FIRST member of
// every family in run 2 arrived with run 1's mutations already logged. That takes different branches
// and draws a different number of RNG values, which shifts the whole stream — the seed stopped
// reproducing anything from run 2 onwards.
//
// The suite's other rebalancer tests reach for `jest.isolateModules` to get an empty `familyTracking`,
// which was the workaround; `resetFamilyTracking()` makes it explicit and lets the pipeline call it.

const moves = require('../fixtures/miniMoves');
const { MACHOP, MACHAMP } = require('../fixtures/miniPokes');
const abilities = require('../fixtures/miniAbilities');

const abilityNames = Object.keys(abilities).map(k => k.replace('ABILITY_', ''));

// One rebalancer instance shared by both "generations" — the whole point is that state must not leak
// between them WITHOUT a fresh module. Uses the same rng instance the rebalancer does.
const { balancePokemon, resetFamilyTracking } = require('../../rebalancer');
const rng = require('../../rng');

// A "generation": rebalance a family front-to-back under a fixed seed, from a clean family log.
function generation(seed) {
    resetFamilyTracking();
    rng.seed(seed);
    return [MACHOP, MACHAMP].map(poke =>
        balancePokemon(JSON.parse(JSON.stringify(poke)), abilityNames, moves, 1, {}));
}

describe('generation repeatability in one process (B-069)', () => {
    afterAll(() => { rng.reset(); resetFamilyTracking(); });

    test('the same seed produces the same result on a second run in the same process', () => {
        const first = generation(2231547897);
        const second = generation(2231547897);
        expect(second).toEqual(first);
    });

    test('it still holds on a third run (state does not accumulate)', () => {
        const first = generation(11);
        generation(11);
        const third = generation(11);
        expect(third).toEqual(first);
    });

    test('different seeds still produce different results (the reset does not flatten the RNG)', () => {
        const a = generation(1);
        const b = generation(999999);
        expect(b).not.toEqual(a);
    });

    test('without the reset, family state leaks into the next run', () => {
        // Guards the reason resetFamilyTracking has to exist: replaying the same seeded sequence with
        // NO reset in between must diverge, otherwise the tests above prove nothing about the leak.
        // A single mon is not enough to show it — its inherited entries reproduce the same deltas from
        // the same base stats, so the result looks identical. The divergence appears on a LATER family
        // member (Machamp inheriting Machop's log twice over), which is exactly the pipeline's shape.
        const sequence = () => {
            rng.seed(4242);
            return [MACHOP, MACHAMP].map(poke =>
                balancePokemon(JSON.parse(JSON.stringify(poke)), abilityNames, moves, 1, {}));
        };
        resetFamilyTracking();
        const clean = sequence();
        const leaked = sequence();   // no reset — this is what every run after the first used to get
        expect(leaked).not.toEqual(clean);
    });

    test('within a run, a family still inherits its earlier members mutations', () => {
        // The reset must not break what familyTracking is for.
        resetFamilyTracking();
        rng.seed(7);
        const [machop] = [balancePokemon(JSON.parse(JSON.stringify(MACHOP)), abilityNames, moves, 1, {})];
        const machamp = balancePokemon(JSON.parse(JSON.stringify(MACHAMP)), abilityNames, moves, 1, {});
        expect(machop.log.length).toBeGreaterThan(0);
        expect(machamp.log.length).toBeGreaterThanOrEqual(machop.log.length);
    });
});
