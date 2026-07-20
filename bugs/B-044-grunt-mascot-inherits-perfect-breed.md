---
id: B-044
title: Villain-grunt mascot inherits the leader's perfect IVs
status: fixing
severity: major
created: 2026-07-20
updated: 2026-07-20
found-in: 0.6.0
fixed-in:
regression-test: randomizer/__tests__/integration/reverseOrderContinuity.test.js (B-044 block) + randomizer/__tests__/unit/ivCacheKey.test.js
links: [T-144, T-168]
---

# B-044 — Villain-grunt mascot inherits the leader's perfect IVs

## Symptom

The early villain grunts field a "mascot" — a devolved copy of their leader's signature mega
(T-134/T-144): TRAINER_GRUNT_PETALBURG_WOODS leads a Carvanha (Archie's Mega Sharpedo devolved) and
TRAINER_GRUNT_RUSTURF_TUNNEL leads a Numel (Maxie's Mega Camerupt devolved). The mascot should be an
**independently generated** grunt Pokémon of the **same family** as the leader's favourite — NOT a
perfect-breed mon. The leaders themselves (Archie/Maxie) keep their perfect-breed favourites.

Observed (seed 1830319788, full pipeline): the mascot's `breedTier` is `null`, yet its IVs sum to
**186 (all 31)** — identical to the leader's perfect-breed mega — while every other grunt mon has
ordinary random IVs. Expected: the mascot has ordinary (random) IVs like the rest of the grunt's team.

```
TRAINER_ARCHIE                 SPECIES_SHARPEDO pokeId=ARCHIE_MEGA breed=perfect ivsum=186  (leader — correct)
TRAINER_GRUNT_PETALBURG_WOODS  SPECIES_CARVANHA pokeId=ARCHIE_MEGA breed=null    ivsum=186  (mascot — WRONG)
TRAINER_MAXIE_MAGMA_HIDEOUT    SPECIES_CAMERUPT pokeId=MAXIE_MEGA  breed=perfect ivsum=186  (leader — correct)
TRAINER_GRUNT_RUSTURF_TUNNEL   SPECIES_NUMEL    pokeId=MAXIE_MEGA  breed=null    ivsum=186  (mascot — WRONG)
```

## Root cause

The mascot slot (`mascotSlot` in `randomizer/trainers.js`) is a `TRAINER_REPEAT_ID` slot whose `id`
is the leader's favourite tag (`ARCHIE_MEGA` / `MAXIE_MEGA`). That `id` is used for two things in
`randomizer/modules/resolveTrainerTeam.js`: (1) the `storedIds` lookup that finds the leader's
committed mega species — correct; and (2) the per-`pokeId` IV cache key
(`const pokeId = trainerMonDefinition.id || null`). Because the leader's perfect-breed favourite is
built first (authoritative hoist) under the SAME `pokeId`, it populates the shared IV cache with
`{all 31}`; the mascot then reads that cached entry instead of generating its own IVs — so it silently
inherits the leader's perfect breed regardless of its own `breedTier: null`.

Same-character continuity echoes (e.g. rival Metang echoing the Champion Metagross) legitimately
share a `pokeId` so their IVs stay consistent; only the CROSS-character mascot should be independent.

## Fix

Decouple the mascot's IV identity from its species-lookup `id`. `resolveTrainerTeam.js` now derives the
per-`pokeId` IV-cache key through a small pure helper, `ivCacheKeyForDefinition(def)`, which returns
`null` for any slot carrying `independentIvs` (else `def.id`). `mascotSlot` (in `trainers.js`) sets
`independentIvs: true`: it still reuses the leader's stored SPECIES via `id`, but no longer shares the
leader's IV-cache entry, so it rolls its own (ordinary, non-perfect) IVs. Same-character continuity echoes
keep their `id` → their IVs stay consistent across appearances (unchanged).

Regression tests (verified FAIL before the fix, PASS after):
- `randomizer/__tests__/integration/reverseOrderContinuity.test.js` — "villain-grunt mascot is same family
  but not perfect breed (B-044)": the two grunts' mascots share their leader's ace family yet are NOT
  perfect breed, while the leaders keep their perfect favourites. (Gated behind `RUN_DETERMINISM=1`,
  reusing the existing full-pipeline run for seed 1830319788.)
- `randomizer/__tests__/unit/ivCacheKey.test.js` — pins the fix seam: a mascot slot (`independentIvs`)
  maps to a `null` cache key; continuity/plain slots keep their `id`. Runs in the normal `npm test`.
