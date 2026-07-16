---
id: B-028
title: ALLOW_ONLY_TYPES (and NO_REPEATED_TYPE) bypassed in the strict-empty fallback path
status: fixed
severity: medium
created: 2026-07-12
updated: 2026-07-12
found-in: Unreleased
fixed-in: 0.8.0
regression-test: randomizer/__tests__/unit/trainerSelector.test.js
links: [T-128, B-027]
---

# B-028 — Trainer type/ability restrictions were bypassed when the filtered pool was empty

## Symptom

A trainer with `TRAINER_RESTRICTION_ALLOW_ONLY_TYPES` (+ `trainer.types`) could still field an
off-type Pokémon. Surfaced while verifying the restriction ahead of the pool-consumption favourite
redesign (T-128): a type-locked slot whose tier had no on-type candidate fell back to an off-type mon.

## Root cause

`modules/trainerSelector.js` applied the trainer restrictions only to the family-deduped list
(`filteredLooseList`) which was merged into `pokemonStrictList`. When the type/ability filter emptied
that list AND there was no strict pick, the resolver dropped to the strict-empty fallback branch
(`else if (pokemonLooseList.length > 0)`) which used the **raw, unrestricted `pokemonLooseList`** — so it
re-applied only family dedup and picked a candidate that violated the restriction (e.g. a Rock gym
fielding a non-Rock mon). The restriction was also untested and unused by any trainer, so it had never
actually run correctly (cf. B-027).

## Fix

Apply the restrictions to `pokemonLooseList` FIRST (before family dedup), so both the main pick and the
family-relaxation fallback operate on the already-restricted pool. When the restricted pool is empty the
slot now returns nothing (→ tier-down / drop) instead of an off-type mon.

## Regression test

`randomizer/__tests__/unit/trainerSelector.test.js` → `describe('createChooser — ALLOW_ONLY_TYPES
restriction (B-028)')`: (1) keeps only on-type candidates; (2) is NOT bypassed when no candidate matches
(a Fire-only trainer with only a Water mon fields nothing, not the Water mon). RED before the fix (the
Water mon leaked through), GREEN after.
