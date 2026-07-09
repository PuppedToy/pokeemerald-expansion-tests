---
id: T-086
title: Randomizer assigns per-trainer battle type by pool proportions and marks it in the bundle
status: proposed
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
- [ ] `singles`/`doubles`/`mixed` produce the expected battle-type distribution per pool (tested).
- [ ] Champion follows the majority rule; the Mossdeep tag battle is never converted.
- [ ] No trainer with <2 mons is marked doubles.
- [ ] `battleType` appears on both `trainersData` and `docs.trainersResultsSimplified` in the bundle.
- [ ] Assignment is deterministic under the seed; `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
