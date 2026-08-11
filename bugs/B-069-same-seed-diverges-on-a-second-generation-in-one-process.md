---
id: B-069
title: A second generation in the same process ignores the seed and builds a different world
status: open            # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-08-11
updated: 2026-08-11
found-in: 0.5.0         # version where the bug was observed
fixed-in:               # version that ships the fix (set when fixed)
regression-test:        # REQUIRED to mark as fixed: path/to/test (named or annotated with this id)
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

<!-- Filled during the fix. The real cause, not the patch. -->

Not identified. What the evidence rules in and out:

- **Not the pokédex build.** All three runs report identical teachable expansion
  (`1230 pokemon processed, 21228 total new moves added`), so the parse/expand stage is stable.
- **Not `allPokes` or `moves` mutation.** `runPokedexModule` deep-clones both
  (`randomizer/modules/pokedexModule.js:172` and `:178`).
- **The RNG is reseeded** at the top of `runGeneration` (`rng.seed(universeSeed)`), so the drift is not
  a missing reset — it is that a *different number of draws* is consumed before the evolution levels are
  rolled, which shifts the whole stream. The gates diverge on run 2, and `applyEvoLevels` runs at the
  very start of `makePokedex`, so the extra/missing consumption happens in or before the pokédex build.
- **Remaining candidates:** the baseData fields that are passed by reference and never cloned —
  `abilities`, `items`, `evoTree`, `megaEvoTree`, `tmLocations` — plus any module-level accumulator in
  `tms.js` / `teachableExpander.js` / `itemRandomizer.js`.

Same family as [B-017](B-017-per-rom-evo-level-reroll-breaks-shared-trainers.md): shared state that survives
across a boundary it was assumed not to cross.

## Fix

<!-- What was changed and where (link commits/PR/task). The regression test reproduces the
     symptom: verified to FAIL before the fix and PASS after. No test, no `fixed` status. -->

Not fixed. The regression test writes itself — generate twice with one seed in one process, assert the
two bundles are identical — and should be the starting point.
