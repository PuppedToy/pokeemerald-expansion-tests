---
id: B-019
title: Brawly's team resolves to 5 pokemon instead of 6 (Makuhita slot dropped, no fallback)
status: fixed           # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-07-05
updated: 2026-07-05
found-in: 0.5.0         # version where the bug was observed
fixed-in: 0.5.1         # set when fixed
regression-test: randomizer/__tests__/unit/trainersBrawlyFallback.test.js
links: [T-058]
---

# B-019 — Brawly's team resolves to 5 pokemon instead of 6 (Makuhita slot dropped, no fallback)

## Symptom

In a randomizer bundle (seed 1151989835, difficulty 7, rebalance on — see
`tasks/assets/T-058/bundle.json`), gym leader Brawly (`TRAINER_BRAWLY_1`) ships with a
**5-pokemon** team. The spec (`artifacts.trainers.trainersData`) has **6** slots, but the
resolved team (`docs.trainersResultsSimplified`) has only 5. Bosses must field their full
intended team size.

**Reproduce:** resolve Brawly's 6th slot against the bundle's pokedex with the real chooser
(`createChooser` + `selectWithAutoFallback`), with the 5 already-picked Fighting mons on the
team → the slot returns `null` in 200/200 attempts, and the team-build loop silently drops it.

Expected: 6 pokemon. Actual: 5.

## Root cause

Brawly's slot 6 has two branches ([trainers.js:1628-1656](../randomizer/trainers.js#L1628-L1656)):
when the gym type is **randomized** the slot carries a `fallback` array, but when the gym type
is **kept** (Fighting — this bundle's case) the slot is
`{ specificIfTier: SPECIES_MAKUHITA, contextualTier: [PU], type: [FIGHTING], abilities: [GUTS],
checkValidEvo: true, item: Flame Orb }` **with no `fallback`**.

The `specificIfTier` gate ([trainerSelector.js:117-133](../randomizer/modules/trainerSelector.js#L117-L133))
requires `TIER_SEQ.indexOf(base rating.tier) <= TIER_SEQ.indexOf(contextual tier)`. At Brawly's
level (cap 18) Makuhita's base tier is **NU** but its contextual tier is **PU** (weaker), so
`NU <= PU` is false → Makuhita never qualifies for its own slot and is also excluded from the loose
fallback pool. The loose pool (Fighting + GUTS + `contextualTier` PU→ZU→MAGIKARP auto-tier-down +
`checkValidEvo@19` + family-dedup) is empty: the game has only 11 Fighting+GUTS mons and every one
is either too strong for the weak tier or its family (Machop, Timburr) is already on the team
(survivors at PU/ZU/MAGIKARP = 0/0/0). With no `fallback`, `selectWithAutoFallback` returns `null`,
and the team-build loop ([writer.js:578-584](../randomizer/writer.js#L578-L584); mirrored in
`writerDocs.js:256`) silently skips the slot (`console.error` + `return`), leaving 5 mons.

Full analysis: [T-058](../tasks/T-058-brawly-five-pokemon-bundle.md).

## Fix

Give the Makuhita (unchanged gym-type) branch a `fallback` array — a generic typed slot
(`{ ...getBossPreset('BRAWLY')[5], type: [gymMainTypes[1]], breedTier: 'perfect' }`) that drops
the `specificIfTier`/GUTS/item constraints so any legal Fighting mon in the tier can fill it,
mirroring the changed-type branch. Verified against the bundle: the fallback resolves the slot
200/200 (Crabrawler / Meditite / Medicham). Regression test reproduces the symptom (FAIL before,
PASS after).
