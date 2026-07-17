---
id: T-145
title: Grunt gauntlets count as one battle for the mixed proportion, share a type, and carry a "Gauntlet Battle N" tag
status: in-progress
type: feature
created: 2026-07-17
updated: 2026-07-17
target-version: 0.8.0
links: [T-086, T-116, ADR-014, ADR-018]
blocked-by: []
---

# T-145 — Gauntlet battle accounting + display tag

## Context

Owner (2026-07-17, TAREA 1). The Slateport Museum grunts (`TRAINER_GRUNT_MUSEUM_1/_2`) and the Mossdeep
Space Center grunts (`TRAINER_GRUNT_SPACE_CENTER_5/_6/_7`) are back-to-back gauntlet fights but ADR-014
counts each `isBoss` grunt independently in the `bossTrainers` singles/doubles proportion. See ADR-018 §1.

## Plan

- **`battleFormat.js`** — `GAUNTLET_GROUPS` (Museum → "Gauntlet Battle 1", Space Center → "Gauntlet Battle
  2") + `gauntletTagOf(id)`. In the proportional `mixed` branch, collapse each gauntlet to ONE unit in the
  `bossTrainers` pool (one proportion slot) and broadcast its type to all members (shared singles/doubles).
- **`modules/trainersModule.js`** — stamp `trainer.gauntletTag` on every member in ALL formats.
- **`writerDocs.js` `processTrainer`** — carry `gauntletTag` (both the normal and `copy:` branches) so the
  bundle/docs SSOT surfaces it.
- **`frontend/template.html`** — render a "Gauntlet Battle N" badge alongside the battleType badge (shown in
  every format; driven off `gauntletTag`, not `battleType`).
- No ROM/writer change — each gauntlet member is mechanically an ordinary singles/doubles trainer.

## Acceptance criteria

- [ ] In `mixed`, each gauntlet counts as ONE unit in the `bossTrainers` proportion and all its members
      share one singles/doubles type; unit-tested (battleFormat.test.js).
- [ ] Every gauntlet member carries `gauntletTag` in singles, doubles and mixed; surfaced in the docs SSOT.
- [ ] Viewer shows a "Gauntlet Battle N" badge for gauntlet members, additional to the battle-type badge.
- [ ] `cd randomizer && npm test` + frontend tests green; determinism gates intact.

## Progress log

- **2026-07-17** — Task created; design in ADR-018 §1 (owner-validated). Batched with T-146. Starting TDD.

## Outcome

_(pending)_
