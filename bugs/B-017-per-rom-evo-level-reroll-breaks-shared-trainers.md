---
id: B-017
title: Per-ROM evolution-level re-roll makes shared-trainer teams diverge and can place illegal evolved mons
status: fixed
severity: major
created: 2026-07-01
updated: 2026-07-01
found-in: 0.5.0
fixed-in: 0.5.1
regression-test: randomizer/__tests__/integration/crossRomBossDeterminism.test.js
links: [T-042, T-043]
---

# B-017 — Per-ROM evolution-level re-roll makes shared-trainer teams diverge and can place illegal evolved mons

## Symptom

In a shared-trainer soul-link bundle, a boss trainer with **no committed slot**
gets a **different team in different ROMs**, and a ROM can end up with a trainer
Pokémon whose evolution is **illegal at that trainer's level**.

Concrete reproduction (bundle in `tasks/assets/T-042/`, `seed=1830319788`,
`runType=soullink`, 2 players × 3 ROMs, shared pokedex + trainers):
- `player-1-rom-3` (`roms[3]`) → `TRAINER_GRUNT_RUSTURF_TUNNEL` (level 15, no
  encounter/starter slot) has `SPECIES_LUDICOLO` in its GRASS slot.
- The bundle's evolution data has `SPECIES_LOMBRE → SPECIES_LUDICOLO` at **LEVEL 21**.
  A level-15 trainer therefore cannot legitimately field a Ludicolo.
- The same trainer resolves to a **different team in each of the 6 ROMs**, despite
  having no slot that legitimately depends on per-ROM state.

Expected: shared-trainer bosses without a committed slot are **identical across
all ROMs**, and no team member's minimum evolution level exceeds the trainer's
level (measured against the evolution levels serialized in the same bundle).

Actual: teams diverge per ROM and the serialized evolution table is inconsistent
with the resolved teams.

## Root cause

Confirmed by RNG replay (full analysis + evidence in
[T-042](../tasks/T-042-trainer-illegal-evolved-mon.md)).

Evolution levels are chosen by `applyEvoLevels(pokemonList)`
(`randomizer/evoLevelWriter.js`), which **consumes RNG (`rng.random()`) and mutates
`evo.param` in place**. It is called at the top of `writerDocs()`
(`randomizer/writerDocs.js:115`). The per-ROM docs loop reseeds
`rng.seed(romSeed)` with `romSeed = (cfg.seed ^ (i * 0x9E3779B9)) >>> 0` — a
**per-ROM-index seed** — before each `writerDocs` call
(`frontend/js/randomizer-worker.cjs`; same pattern in `backend/generator.js`).

Consequences:
1. Each ROM rolls a **different** set of evolution levels on the **shared**
   `sharedData.pokedex` object.
2. Each ROM's trainer team is resolved against *that ROM's* transient levels, so
   `checkValidEvo`'s candidate pool differs per ROM → the same slot picks
   different species even under identical per-slot reseeding (defeats the
   trainer-determinism guarantee).
3. `sharedData.pokedex` is serialized **once, after the loop**, capturing only the
   **last ROM's** roll. Every earlier ROM's team is validated against evolution
   levels that no longer match the serialized table.

RNG replay of Lombre→Ludicolo per ROM: `[19, 21, 17, 15, 20, 21]`. ROM[3] rolled
**15** (so `checkValidEvo(Ludicolo, 15)` passes: `15 <= 15`); the bundle serialized
**21** (= ROM[5], the last ROM). Ludicolo is simply the borderline evolution whose
rolled level straddles 15; most evolutions roll consistently low and never show
the inconsistency.

## Fix

Evolution levels are now rolled **exactly once per pokedex, when the pokedex is created**,
instead of once per ROM inside the docs loop:

- `randomizer/generate.js` — new `makePokedex(mcfg, baseData)` helper wraps
  `runPokedexModule` and calls `applyEvoLevels(pokedex.pokes)` once. Every pokedex-creation
  site (default / nuzlocke / soullink global+player+per-ROM) goes through it. The levels
  become a fixed property of the pokedex, so the object serialized into `sharedData.pokedex`
  carries the exact levels every ROM's trainer resolution used.
- `randomizer/writerDocs.js` — removed the per-ROM `applyEvoLevels(pokemonList)` call (and its
  import). `writerDocs` no longer mutates the shared pokedex; it reads the already-set levels.

Because the pokedex is generated once (when shared) and its levels are fixed before the
per-ROM docs loop reseeds `romSeed`, `romSeed` no longer perturbs evolution levels — it only
drives wild placeholders and per-slot trainer reseeding, as intended.

The ROM build is unaffected by design: `writer.js` calls `writeEvoLevels(pokemonList,
{ recompute: !docs })`, and in bundle mode (`docs` present) `recompute` is `false`, so it reads
the serialized levels rather than re-rolling. The build therefore writes exactly the levels the
bundle stores — which are now the same ones the teams were resolved against.

**Regression test:** `randomizer/__tests__/integration/crossRomBossDeterminism.test.js`
(gated behind `npm run test:determinism`; see T-043). Generates a shared-trainer soul-link
through the real generation path and asserts every non-per-ROM-slot boss has an identical team
in every ROM.
- **Verified RED before the fix:** 5/7 comparable bosses diverged — `TRAINER_GRUNT_RUSTURF_TUNNEL`
  (6 distinct teams / 9 ROMs), `TRAINER_GRUNT_PETALBURG_WOODS`, `TRAINER_BRAWLY_1`,
  `TRAINER_GRUNT_MUSEUM_1`, `TRAINER_GRUNT_MUSEUM_2`.
- **Verified GREEN after the fix:** all comparable bosses identical across all 9 ROMs.

Owner confirmed the end-to-end manual check OK (illegal evolved mon gone, shared-trainer teams
match across ROMs) on 2026-07-01 → marked `fixed`, `fixed-in: 0.5.1` (ships under `[Unreleased]`).
