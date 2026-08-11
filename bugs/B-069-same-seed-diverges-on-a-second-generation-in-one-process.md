---
id: B-069
title: A second generation in the same process ignores the seed and builds a different world
status: fixing          # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-08-11
updated: 2026-08-11
found-in: 0.5.0         # version where the bug was observed
fixed-in:               # version that ships the fix (set when fixed)
regression-test: randomizer/__tests__/unit/generationRepeatability.test.js
links: [T-264, B-017]
---

# B-069 — A second generation in the same process ignores the seed and builds a different world

## Symptom

Calling `runGeneration` more than once in one Node process with the **same seed and the same config**
produces a **different world each time**. Three consecutive calls with seed `2231547897`:

```
run 1: Basculin gates=["34","33"]  Wally=JOLTEON,COMBUSKEN,MORGREM,KIRLIA,HAPPINY,THWACKEY
run 2: Basculin gates=["33","30"]  Wally=JOLTEON,SLIGGOO,MORGREM,KIRLIA,GROWLITHE,DEWOTT
run 3: Basculin gates=["35","23"]  Wally=CROCONAW,PANCHAM,MORGREM,KIRLIA,GROWLITHE,SOLOSIS
```

Run 1 in a fresh process is reproducible; runs 2+ are not. Found while sweeping seeds to verify
[B-067](B-067-stone-evolutions-ignore-their-min-level.md) — the first batch of numbers was silently
worthless, which is the real danger here: nothing warns you, the run just succeeds with a different
world.

**No end-user impact today.** `frontend/js/app.js:484` creates a **fresh `Worker` per generation** and
terminates it when done, so every browser run is a clean process. The only in-process repeat caller is
`backend/generator.js`, used solely by `backend/build/golden-corpus/generate.mjs`; that builder always
emits the same sequence in the same order, so the corpus stays self-consistent as a sequence — but its
bundles are not reproducible from their seeds individually.

## Root cause

`familyTracking` in `randomizer/rebalancer.js` — the log of what mutations each family received, so a
family's later members inherit its earlier ones. Within one run that is the whole point; it was declared
at module scope and never cleared, so it lived for the **process**. On a second generation the first
member of every family arrived with the previous run's mutations already logged, took different branches
and drew a different number of RNG values, which shifted the entire stream from that point on.

Localised by counting RNG draws at each progress boundary across two runs in one process: identical
through "Generating Pokédex", then 171,001 extra draws by "Generating trainer teams". Bisecting inside the
pokédex build gave identical counts for `buildTMList` (286) and `expandAllTeachables` (147,533) but
`balancePokemon` diverging (10,156 vs 9,711), and the rest of the delta followed from *which* mons got
rebalanced changing how many re-rate passes ran.

Two hypotheses were checked and ruled out first: `baseData` is not mutated (fingerprinting every field
across runs shows no change — `allPokes` and `moves` are deep-cloned at
`randomizer/modules/pokedexModule.js:172` and `:178`), and the RNG *is* reseeded at the top of
`runGeneration`. The tell was already in the suite: the rebalancer's own tests reach for
`jest.isolateModules` to get an empty `familyTracking`, which was this state being worked around.

## Fix

`resetFamilyTracking()` is exported from `rebalancer.js` and called by `runPokedexModule` before its
rebalance pass, so the state is explicitly per-run. `familyTracking` went from `const` to `let` to allow
the reassignment.

Regression test: `randomizer/__tests__/unit/generationRepeatability.test.js`, verified RED before the fix
and GREEN after. It also pins the two things the fix must not break — different seeds must still diverge,
and within a run a family must still inherit its earlier members' mutations — and includes a guard that
replaying the same seeded sequence WITHOUT the reset still diverges, so the other assertions cannot pass
vacuously. Note a single mon is not enough to show the leak (its inherited entries reproduce the same
deltas from the same base stats, so the result looks identical); the divergence needs a later family
member, which is the pipeline's shape.

Verified end-to-end: three generations of seed `2231547897` in one process now produce identical worlds
(before: three different ones), and a seven-seed sweep gives the same per-seed results whether the seeds
run in one process or one process each.
