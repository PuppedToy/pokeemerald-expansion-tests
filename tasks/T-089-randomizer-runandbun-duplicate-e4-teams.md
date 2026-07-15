---
id: T-089
title: Randomizer generates duplicated E4 singles+doubles teams for Run & Bun
status: done
type: feature
created: 2026-07-09
updated: 2026-07-15
target-version: 0.7.0
links: [T-083, T-086, T-088]
blocked-by: [T-086, T-088]
---

# T-089 — Randomizer generates duplicated E4 singles+doubles teams for Run & Bun

## Context

When `mixed` + `leagueRunAndBun`, each E4 member needs two distinct resolved teams — one singles,
one doubles — written to the base id and the new `TRAINER_*_DOUBLES` id from
[T-088](T-088-decomp-e4-doubles-trainers.md). The doubles team should be built to be reasonable in
doubles; until the Group 2A doubles rating lands it uses the current (singles) rating as a
placeholder, flagged for a later pass.

## Plan

- In the trainer table / resolution, when `leagueRunAndBun` is on, emit for each E4 member a
  singles-flagged team (base id) and a doubles-flagged team (the `_DOUBLES` id) into
  `docs.trainersResultsSimplified` (both, so T-087 stamps `Double Battle:` correctly).
- Teams must be deterministic under the seed and independent (different teams, not a copy).
- When Run & Bun is **off** (plain `mixed`/`singles`/`doubles`), the `_DOUBLES` ids are left as
  harmless placeholders (never entered in-game) — document this.
- Leave a clearly-marked seam so the doubles team is regenerated with the doubles rating once
  Group 2A (T-093…T-097) is available.
- Tests: with Run & Bun on, each E4 base id is singles and each `_DOUBLES` id is doubles with a
  different valid team; determinism across shared ROMs.

Acceptance criteria:
- [x] Run & Bun on → each E4 member has a singles team (base) and a distinct doubles team (`_DOUBLES`).
      *(Distinctness comes from the per-slot RNG reseed keyed by the new id; full end-to-end team
      resolution is confirmed at the T-092 checkpoint.)*
- [x] Both teams are valid, deterministic under seed, and flagged with the correct battle type.
- [x] Run & Bun off → `_DOUBLES` ids carry a benign placeholder and are unused in-game.
- [x] A TODO/seam references the future doubles-rating regeneration (`TODO(T-109)` in trainersModule).
- [x] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-10** — Implemented on `feature/T-089-runandbun-e4-teams` (TDD, red→green). In
  `runTrainersModule`, when `battleFormat === 'mixed' && leagueRunAndBun`, each base E4 def is
  `structuredClone`d into a `TRAINER_<X>_DOUBLES` entry (before the difficulty transform, so both get
  the same deterministic transform); the differing id makes the per-slot reseed resolve a distinct
  team. `battleFormat.js` is now Run & Bun-aware: `poolOf` classifies the clones as `e4Doubles` (always
  doubles), and in Run & Bun the base E4 pool is forced all-singles (champion still follows the
  majority; gyms/bosses/normals still proportional). Clones flow through the existing writer/writerDocs
  resolution, so `docs.trainersResultsSimplified` gains the resolved `_DOUBLES` teams (battleType
  doubles) and the writer (T-087) emits `Double Battle: Yes` for them. Left a `TODO(T-109)` seam to
  regenerate the doubles team with the doubles-shaped engine later. Tests: 2 new battleFormat Run & Bun
  cases + new `runAndBunClones.test.js` (4 cases). Full suite green (796 pass / 1 skip; +6). Kept
  `in-progress` for the T-092 checkpoint. Merged to master.

## Outcome

Randomizer duplicates E4 singles+doubles teams for Run & Bun (writer emits `Double Battle: Yes`); TODO(T-109) seam left for doubles-shaped regen. runAndBunClones.test.js. Suite green. Owner-validated 2026-07-15. Closed.
