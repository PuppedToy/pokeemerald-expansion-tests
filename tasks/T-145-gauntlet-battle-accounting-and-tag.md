---
id: T-145
title: Grunt gauntlets count as one battle for the mixed proportion, share a type, and carry a "Gauntlet Battle N" tag
status: done
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

- [x] In `mixed`, each gauntlet counts as ONE unit in the `bossTrainers` proportion and all its members
      share one singles/doubles type; unit-tested (battleFormat.test.js).
- [x] Every gauntlet member carries `gauntletTag` in singles, doubles and mixed; surfaced in the docs SSOT.
- [x] Viewer shows a "Gauntlet Battle N" badge for gauntlet members, additional to the battle-type badge.
- [x] `cd randomizer && npm test` + frontend tests green; determinism gates intact.

## Progress log

- **2026-07-17** — Task created; design in ADR-018 §1 (owner-validated). Batched with T-146. Starting TDD.
- **2026-07-17** — Implemented (Red→Green): `GAUNTLET_GROUPS` + `gauntletTagOf`/`gauntletGroupOf` in
  `battleFormat.js`; the mixed proportional pools operate over UNITS (`poolUnits`, gauntlet = 1 unit, shared
  type); `trainersModule` stamps `gauntletTag`; `writerDocs` carries it; `template.html` renders a
  `bt-gauntlet` badge. Unit tests added.
- **2026-07-17** — Owner review found two issues, both fixed: (1) the tag must number by **battle position
  within the gauntlet** (Museum 1,2 / Space Center 1,2,3), not a per-gauntlet id → split `gauntletTagOf`
  (position) from `gauntletGroupOf` (accounting key); (2) the badge **bled out of the 204px card rail** →
  cap to rail width + wrap (`max-width:100%; white-space:normal`). Verified: unit tests (Museum 1/2, Space
  1/2/3); real doc fixture (5 tags: 2×1, 2×2, 1×3); Playwright render confirms the badge is contained in the
  card+rail at 1400px and 390px. **Owner confirmed → close.**

## Outcome

Shipped (owner-confirmed 2026-07-17). The Slateport Museum (2) and Mossdeep Space Center (3) grunt gauntlets
each count as ONE unit in the mixed singles/doubles proportion and share one battle type (`poolUnits` in
`battleFormat.js`), and every member carries a **"Gauntlet Battle N"** display badge — N = its battle number
within the gauntlet (Museum 1,2 / Space Center 1,2,3) — shown in every format, orthogonal to `battleType`.
`gauntletTagOf` (position) / `gauntletGroupOf` (accounting key) / `poolUnits`; stamped in `trainersModule`,
carried by `writerDocs`, rendered as a rail-contained `bt-gauntlet` badge. No ROM/writer change. Design:
ADR-018 §1. npm test 1190 + frontend 78 green; determinism gates 18/18.
