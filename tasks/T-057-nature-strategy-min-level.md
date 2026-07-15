---
id: T-057
title: Lower the level at which trainers pick strategic natures and abilities to 12 (Roxanne)
status: done
type: feature
created: 2026-07-04
updated: 2026-07-15
target-version: 0.6.0
links: []
blocked-by: []
---

# T-057 — Lower the level at which trainers pick strategic natures to 12 (Roxanne)

## Context

Trainer Pokémon only got a *strategic* nature (`chooseNature`, based on moveset/stats) once
the trainer's level reached **28**; below that they got a purely **random** nature
(`sample(Object.values(NATURES))`). That threshold was a hardcoded `28` literal duplicated across
`randomizer/writer.js` and `randomizer/writerDocs.js`, and it was shared with the (separate)
ability-selection heuristic.

The owner wants strategic natures **and abilities** to start at **level 12** — the level of the first
gym leader, Roxanne — so early-game teams already have coherent natures and abilities. (Ability was
folded in after the initial nature-only scope; see the progress log.) The two thresholds are kept as
separate constants so they can be tuned independently later, but both default to 12.

## Plan

- Introduce named constants `NATURE_STRATEGY_MIN_LEVEL = 12` and `ABILITY_STRATEGY_MIN_LEVEL = 12` in
  `randomizer/constants.js` (single home for each fact) and pure predicates `usesStrategicNature(level)`
  / `usesStrategicAbility(level)` in `randomizer/modules/utils.js`.
- Wire the predicates into the nature and ability blocks of both `writer.js` and `writerDocs.js` (they
  must stay in sync — the ROM is guaranteed to match the docs). `writerDocs.js` is the SSOT that feeds
  the bundle; `writer.js` is the standalone `analyze.js` path.
- TDD: unit test each predicate / constant boundary first (Roxanne @12 → strategic, @11 → random).

Acceptance criteria:
- [ ] `NATURE_STRATEGY_MIN_LEVEL === 12` / `usesStrategicNature(12|11)` behave; same for `ABILITY_STRATEGY_MIN_LEVEL` / `usesStrategicAbility`.
- [ ] Both `writer.js` and `writerDocs.js` use the predicates for nature AND ability selection (no stray `28` in either block).
- [ ] `cd randomizer && npm test` green.
- [ ] Owner confirms in a ROM build that Roxanne-level trainers now get sensible natures and abilities.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-04** — Task created. Located the shared `trainer.level < 28` threshold in
  `writer.js:771` / `writerDocs.js:397` (nature) and `:673/:680` / `:334/:338` (ability).
- **2026-07-04** — TDD: added `__tests__/unit/natureStrategyLevel.test.js` (Red — `usesStrategicNature`
  undefined). Added `NATURE_STRATEGY_MIN_LEVEL: 12` to `constants.js` and pure `usesStrategicNature(level)`
  to `modules/utils.js` (Green). Wired the predicate into the nature block of `writer.js` and
  `writerDocs.js` (branches flipped: strategic first, random else); ability `< 28` logic left untouched.
  Full suite green (614 passed, 1 skipped). Changelog line added under [Unreleased] → Changed.
  Left open pending an owner ROM-build check (Roxanne-level natures) — this is manually testable.
- **2026-07-04** — Scope extended (owner request): abilities too. Traced the pipeline to confirm
  where the decision actually lands — bundle generation (`backend/generator.js` → `generate.js`
  `computeRomDocs` → `writerDocs()`) fully resolves each team (species/item/nature/ability/moves/IVs)
  into `rom.docs.trainersResultsSimplified`; `make.js` → `writer(..., rom.docs)` reads it **verbatim**
  (`writer.js:528` `buildTrainersResultsFromDocs`, no recompute). So `writerDocs.js` is the SSOT for
  the frontend/ROM; `writer.js`'s selection loop only runs in the standalone `analyze.js` (`!docs`)
  path and is kept in sync. Added `ABILITY_STRATEGY_MIN_LEVEL: 12` + `usesStrategicAbility(level)`
  (Red via `abilityStrategyLevel.test.js`, then Green), wired both `< 28` ability call-sites in
  `writer.js` (:673/:680) and `writerDocs.js` (:334/:338). No `< 28` left in either writer.
  Full suite green (619 passed, 1 skipped). Changelog line updated to cover abilities.

## Outcome

ABILITY_STRATEGY_MIN_LEVEL=12 + usesStrategicAbility wired into both writer.js and writerDocs.js (no <28 left) so trainers pick strategic natures+abilities from Roxanne. Full suite green. Owner-validated 2026-07-15. Closed.
