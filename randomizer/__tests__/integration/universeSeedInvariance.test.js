'use strict';

// T-189 — two-tier seed invariance, proven through the REAL generation path
// (randomizer/generate.js). The fast unit suite covers the pure seed helpers
// (seeds.test.js); this asserts the end-to-end guarantees the whole feature rests on:
//
//   1. A fixed universeSeed reproduces the shared world (Pokédex / trainer templates /
//      starters) byte-for-byte regardless of the runSeed — so a user can regenerate more
//      ROMs of the same universe later.
//   2. A fresh runSeed under the same universeSeed rerolls per-ROM content (the wild plan).
//   3. With no universeSeed pinned, the universe follows the runSeed (single-seed runs behave
//      exactly as before: same seed ⇒ same everything; different seed ⇒ different).
//
// Each generation runs in an ISOLATED module registry (jest.resetModules + fresh require).
// The pipeline holds module-level mutable state (parsed base data, in-place pokedex mutation),
// so two generations in the SAME module registry are not idempotent — production is unaffected
// because every generation runs in a fresh Worker/process. Isolating the registry reproduces
// that fresh-process determinism, which is exactly what the seed contract promises.
//
// Heavy (parses ~1200 mons and generates several isolated batches), so it is gated out of the
// default fast suite: RUN_DETERMINISM=1 npx jest universeSeedInvariance.

jest.mock('fs', () => {
    const real = jest.requireActual('fs');
    const noopCb = (...args) => { const cb = args[args.length - 1]; if (typeof cb === 'function') cb(null); };
    return {
        ...real,
        writeFile: noopCb,
        writeFileSync: () => {},
        appendFile: noopCb,
        appendFileSync: () => {},
        promises: { ...real.promises, writeFile: async () => {}, appendFile: async () => {} },
    };
});

const fs = require('fs');
const path = require('path');

const BASE_DATA_PATH = path.resolve(__dirname, '../../../frontend/data/base-data.json');
const baseData = () => JSON.parse(fs.readFileSync(BASE_DATA_PATH, 'utf-8'));

const mcfg = { difficulty: 7, rebalance: true, balanceChance: 0.4, allTms: false };
const cfgFor = (seed, universeSeed) => ({
    runType: 'nuzlocke',
    seed,
    universeSeed,
    difficulty: 7,
    rebalance: true,
    balanceChance: 0.4,
    numROMs: 2,
    shared: { pokedex: true, trainers: true, starters: true },
});

// Each generation in its own module registry ⇒ fresh module-level state ⇒ the deterministic
// behaviour a fresh Worker/process gets in production.
async function genFresh(seed, universeSeed) {
    jest.resetModules();
    const { runGeneration } = require('../../generate');
    return runGeneration(cfgFor(seed, universeSeed), mcfg, 'seed-invariance', { baseData: baseData() });
}

// Fingerprint of the universeSeed-pure shared world: trainer templates + starters + the
// pokedex's mutated moves/abilities (all resolved once in the shared block from universeSeed).
// Deliberately EXCLUDES `sharedData.pokedex.pokes` and `generatedAt`:
//   - `pokes` carries a legitimately per-run side-effect (mega-evolution availability gating is
//     written onto the shared pokemon objects by the per-ROM wild pass — mega discovery is per-ROM
//     by design, see randomizer/docs/trainer-determinism.md), so it is not part of the shared world.
//   - `generatedAt` is a wall-clock timestamp metadata field.
// `trainers`/`starters` being byte-identical across different runSeeds is the strongest proof the
// universe pokedex they were built from is identical.
const worldFp = (b) => JSON.stringify({
    trainers: b.sharedData.trainers,
    starters: b.sharedData.starters,
    moves: b.sharedData.pokedex.moves,
    abilities: b.sharedData.pokedex.abilities,
});
const wildFp = (b, i) => JSON.stringify(b.roms[i].artifacts.wild);

const describeDeterminism = process.env.RUN_DETERMINISM === '1' ? describe : describe.skip;

describeDeterminism('two-tier seed invariance (T-189)', () => {
    test('same universeSeed + different runSeed ⇒ identical shared world, different wilds', async () => {
        const a = await genFresh(111, 42);
        const b = await genFresh(222, 42);   // same universe, fresh run
        expect(a.config.universeSeed).toBe(42);          // resolved universe persisted
        expect(worldFp(a)).toBe(worldFp(b));             // shared world byte-identical
        expect(wildFp(a, 0)).not.toBe(wildFp(b, 0));     // per-ROM wilds rerolled by runSeed
    }, 300000);

    test('different universeSeed ⇒ different shared world', async () => {
        const a = await genFresh(111, 42);
        const c = await genFresh(111, 99);   // same run, different universe
        expect(worldFp(a)).not.toBe(worldFp(c));
    }, 300000);

    test('no universeSeed pinned ⇒ universe follows runSeed (single-seed back-compat)', async () => {
        const a = await genFresh(999, undefined);
        const b = await genFresh(999, undefined);        // identical inputs ⇒ identical output
        expect(worldFp(a)).toBe(worldFp(b));
        expect(wildFp(a, 0)).toBe(wildFp(b, 0));
        expect(a.config.universeSeed).toBe(999 >>> 0);   // resolved from runSeed
        const c = await genFresh(1000, undefined);       // different seed, no pin
        expect(worldFp(a)).not.toBe(worldFp(c));         // whole world changes with the seed
    }, 300000);
});
