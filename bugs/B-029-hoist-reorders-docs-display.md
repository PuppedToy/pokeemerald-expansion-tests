---
id: B-029
title: Reverse-order continuity hoist also reordered the docs trainer display order
status: fixed
severity: major
created: 2026-07-13
updated: 2026-07-13
found-in: Unreleased
fixed-in: 0.8.0
regression-test: randomizer/__tests__/integration/reverseOrderContinuity.test.js
links: [T-106, T-128]
---

# B-029 — The authoritative-first build hoist leaked into the docs display order

## Symptom

In the docs (bundle `roms[].docs.trainersResultsSimplified` / `rom-*.html`), recurring characters were
listed in the wrong order: **May Ever Grande appeared before May Route 103**, Champion Steven before
Granite-Cave Steven, and Wally's Victory Road battle before Mauville/Lilycove. Expected: the original
story order (Route 103 → … → Ever Grande; Granite Cave → partner → Champion; Mauville → Lilycove →
Victory Road).

Reproduced in `tasks/assets/T-128/run-3992061500` (seed 3992061500): `EVERGRANDE_CITY_TREECKO` at docs
index 7, `ROUTE_103_TREECKO` at index 8; `CHAMPION_STEVEN` at 53 before `TRAINER_STEVEN` (Granite Cave)
at 54.

## Root cause

T-106 `hoistAuthoritativeAppearances` splices each recurring character's authoritative (endgame)
appearance to just before its earliest one, so its roster resolves FIRST and the earlier appearances
echo it devolved. That reordered `trainersData` array was then used for BOTH resolution AND the docs
output: `writerDocs.js` builds `trainersResults` by iterating `trainersData`, and the docs display
follows that (object insertion) order — so the hoisted BUILD order leaked into the DISPLAY order. The
owner's intent was "build back-to-front, but SHOW trainers in the original order."

## Fix

Separate the build order from the display order. `hoistAuthoritativeAppearances` now stamps each trainer
with its original index (`displayOrder`) before reordering. `writerDocs.js` re-keys `trainersResults` by
`displayOrder` before building `trainersResultsSimplified`, so resolution still runs in the hoisted order
(continuity + `copy:` targets resolve before their dependents) while the docs list trainers canonically.
The ROM-builder path (`writer.js`, bundle mode) reads from the now-correct docs, so it inherits the fix.

## Regression test

`randomizer/__tests__/integration/reverseOrderContinuity.test.js` → `describe('docs display order stays
canonical, not the hoisted build order')`: asserts Route 103 < Rustboro < Route 119 < Ever Grande (each
starter), Granite Cave + partner < Champion, Mauville < Lilycove < Victory Road. FAILS before the fix
(the hoisted order inverts them), PASSES after. Gated behind `RUN_DETERMINISM=1` (full-pipeline test).
