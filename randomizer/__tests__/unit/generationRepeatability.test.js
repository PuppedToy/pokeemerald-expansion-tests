'use strict';

// B-069 — a second generation in the same process ignored the seed.
//
// The rebalancer's mutation log is module-level state: within one run it is the point (an evolution
// inherits its pre-evolution's mutations), but it survived the end of a run, so the FIRST member of
// every line in run 2 arrived with run 1's mutations already logged. That takes different branches
// and draws a different number of RNG values, which shifts the whole stream — the seed stopped
// reproducing anything from run 2 onwards.
//
// The suite's other rebalancer tests reach for `jest.isolateModules` to get an empty store, which was
// the workaround; `resetInheritance()` makes it explicit and lets the pipeline call it.
//
// T-278/ADR-026 — the store is now keyed by SPECIES and fed by the evolution graph, so these tests
// pass each mon its real parents. The guarantee under test is unchanged: no state may cross runs.

const moves = require('../fixtures/miniMoves');
const { MACHOP, MACHOKE, MACHAMP } = require('../fixtures/miniPokes');
const abilities = require('../fixtures/miniAbilities');

const abilityNames = Object.keys(abilities).map(k => k.replace('ABILITY_', ''));

// One rebalancer instance shared by both "generations" — the whole point is that state must not leak
// between them WITHOUT a fresh module. Uses the same rng instance the rebalancer does.
const { balancePokemon, resetInheritance } = require('../../rebalancer');
const rng = require('../../rng');

// The real Machop line, with the edges the evolution graph would supply.
const LINE = [
    { poke: MACHOP,  parents: [] },
    { poke: MACHOKE, parents: ['SPECIES_MACHOP'] },
    { poke: MACHAMP, parents: ['SPECIES_MACHOKE'] },
];

// A "generation": rebalance a line front-to-back under a fixed seed, from a clean store.
function generation(seed) {
    resetInheritance();
    rng.seed(seed);
    return LINE.map(({ poke, parents }) =>
        balancePokemon(JSON.parse(JSON.stringify(poke)), abilityNames, moves, 1, { parents }));
}

describe('generation repeatability in one process (B-069)', () => {
    afterAll(() => { rng.reset(); resetInheritance(); });

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

    test('replaying the same dex without a reset can no longer accumulate', () => {
        // T-278 removed B-069's original failure mode by construction. The old store was keyed by
        // FAMILY and appended, so a second run doubled every family's log. The new one is keyed by
        // SPECIES and overwrites, so re-running the same dex rewrites each entry before its evolution
        // reads it. Pinned so a future change back to an appending store fails loudly here.
        const sequence = () => {
            rng.seed(4242);
            return LINE.map(({ poke, parents }) =>
                balancePokemon(JSON.parse(JSON.stringify(poke)), abilityNames, moves, 1, { parents }));
        };
        resetInheritance();
        const clean = sequence();
        const repeated = sequence();   // no reset in between
        expect(repeated).toEqual(clean);
    });

    test('without the reset, a run over a DIFFERENT dex still leaks the previous one', () => {
        // The hazard the reset exists for, in the species-keyed model: a mon that run 2 does not
        // rebalance leaves its run-1 log behind, and run 2's evolution of it inherits that instead of
        // nothing. Here run 1 logs the whole line; run 2 rebalances only Machoke.
        const machoke = () => balancePokemon(
            JSON.parse(JSON.stringify(MACHOKE)), abilityNames, moves, 1, { parents: ['SPECIES_MACHOP'] });

        // Run 1 uses its own seed, so the stale Machop log cannot coincide with whatever Machoke
        // rolls for itself under run 2's seed.
        resetInheritance();
        rng.seed(1);
        const staleParent = LINE.map(({ poke, parents }) =>
            balancePokemon(JSON.parse(JSON.stringify(poke)), abilityNames, moves, 1, { parents }))[0];
        const stale = staleParent.log.map(e => `${e.target}:${e.value}`);
        expect(stale.length).toBeGreaterThan(0);

        rng.seed(4242);
        const leaked = machoke();   // no reset — Machop's run-1 log is still in the store

        resetInheritance();
        rng.seed(4242);
        const clean = machoke();    // nothing to inherit, as a fresh run must see

        // The leak is precisely this: run 1's Machop entries replayed onto run 2's Machoke.
        const asKeys = r => r.log.map(e => `${e.target}:${e.value}`);
        expect(asKeys(leaked).slice(0, stale.length)).toEqual(stale);
        expect(asKeys(clean).slice(0, stale.length)).not.toEqual(stale);
    });

    test('within a run, an evolution still inherits its pre-evolution mutations', () => {
        // The reset must not break what the store is for.
        resetInheritance();
        rng.seed(7);
        const [machop, machoke] = generation(7).slice(0, 2);
        expect(machop.log.length).toBeGreaterThan(0);
        expect(machoke.log.length).toBeGreaterThanOrEqual(machop.log.length);
    });
});
