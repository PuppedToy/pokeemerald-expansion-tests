---
id: T-086
title: Randomizer assigns per-trainer battle type by pool proportions and marks it in the bundle
status: in-progress
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.7.0
links: [T-083, T-084]
blocked-by: [T-084]
---

# T-086 — Randomizer assigns per-trainer battle type by pool proportions and marks it in the bundle

## Context

The randomizer chooses which battles are singles vs doubles and records the decision in the bundle;
the maker only obeys (see [T-084](T-084-battle-format-architecture-adr.md)). Trainers are declared in
`randomizer/trainers.js` (`getTrainersData`) and resolved into `docs.trainersResultsSimplified` (the
ROM SSOT) by the writer path; battle type must be stamped on both.

## Plan

- Read `config.battleFormat` / `config.singlesPercent` at the trainer-module seam
  (`randomizer/modules/trainersModule.js:23-28`, via `getTrainersData`).
- For `singles` → all trainers singles; `doubles` → all eligible trainers doubles; `mixed` →
  per-pool proportional assignment closest to the chosen %, deterministic under the run seed
  (reuse the per-slot reseed convention so shared-trainer ROMs stay consistent).
- Champion (`TRAINER_CHAMPION_STEVEN`) = majority type (51/50/49 rule).
- Doubles only when the resolved team has **≥2** mons; exclude the Mossdeep tag battle
  (`TRAINER_MAXIE_MOSSDEEP`, `TRAINER_TABITHA_MOSSDEEP`, `PARTNER_STEVEN`).
- Stamp `battleType: 'singles'|'doubles'` on each `trainersData` entry and each
  `docs.trainersResultsSimplified[id]`.
- Diagnostics: log a count per pool (how many doubles vs singles) and any trainer forced back to
  singles by the ≥2 rule, via `randomizer/diagnostics.js`.
- Tests: unit tests for the proportion math per pool (incl. champion majority + coin-flip at 50%),
  the ≥2 gate, the exclusion, and determinism across a shared-trainer set.

Acceptance criteria:
- [x] `singles`/`doubles`/`mixed` produce the expected battle-type distribution per pool (tested).
- [x] Champion follows the majority rule; the Mossdeep tag battle is never converted.
- [x] No trainer with <2 mons is marked doubles.
- [~] `battleType` appears on both `trainersData` and `docs.trainersResultsSimplified` in the bundle.
      *(Stamped on `trainersData` here; copying it onto the resolved docs SSOT is done by the writer
      in T-087, which also re-checks the resolved team size as the ≥2 safety net.)*
- [x] Assignment is deterministic under the seed; `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-09** — Implemented on `feature/T-086-assign-battle-type` (TDD, red→green). New pure module
  `randomizer/battleFormat.js`: `poolOf` (champion / e4 / gymBosses / bossTrainers / normalTrainers /
  excluded by concrete trainer-ID membership), `isEligible` (teamSize ≥2 and not the excluded Mossdeep
  tag battle), and `assignBattleTypes(trainers, {battleFormat, singlesPercent, seed})`. Mixed mode:
  champion = majority (>50 singles / <50 doubles / =50 seeded coin-flip), multi-member pools mark
  `round(fraction×eligible)` singles and fill doubles from the front of a deterministic order — the gym
  pool pins Tate & Liza first (ADR-014 rule 8). Uses an **isolated** mulberry32 seeded from the run
  seed, so the global rng stream is untouched; in `singles` (default) it consumes no randomness, so
  existing seeded output is byte-identical. Wired into `runTrainersModule` after the colours pass to
  stamp `trainer.battleType` on every `trainersData` entry (mirrors `trainer.colors`), using the
  definition slot count as the ≥2 proxy. Tests: `__tests__/unit/battleFormat.test.js` (9 cases —
  pools, eligibility, pure formats, proportions, champion rule, Tate & Liza priority, determinism).
  Full suite green (783 pass / 1 skip; +9). Docs-SSOT propagation + resolved-team safety net + the
  `Double Battle:` emission are T-087. Kept `in-progress` for the T-092 checkpoint. Merged to master.

## Outcome

<!-- Filled when closing. -->
