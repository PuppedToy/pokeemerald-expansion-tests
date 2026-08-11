---
id: T-262
title: Give Route 121 a real item ball and stop starving the berry picks
status: done            # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-08-10
updated: 2026-08-11
target-version: 0.9.0
links: [B-065, B-066]
blocked-by: []
---

# T-262 — Give Route 121 a real item ball and stop starving the berry picks

## Context

Owner review of run `735016030` (the `run-presentation` bundle) flagged two odd item balls on Route
121. Investigation split them into two defects:

- [B-065](../bugs/B-065-route121-berry-pick-has-two-options.md) — the berry pick there always shows
  only 2 options, deterministically. **This task fixes it.**
- [B-066](../bugs/B-066-terrain-tms-cluster-in-one-pick.md) — the terrain moves in the TM pools.
  Diagnosed here (provenance + measured odds) but the fix awaits an owner design decision; **out of
  scope for this task.**

Owner decision (2026-08-10): keep the berry picks at 4 each and give the freed Route 121 ball a
different pool — an `averageItemPool` choose-3.

## Plan

1. `randomizer/itemRandomizer.js` — drop `route121Berries: berry(4)`. The 18 berries now feed 4
   locations (104/116/111/117) at 4 each = 16 drawn, 2 unused per run, exactly how `averageItemPool`
   already behaves.
2. Same file — the Route 121 ball becomes `route121Items: pool(3)` and keeps `gItemPicks` index 6, so
   **no base-ROM rebuild**: the menu labels resolve at runtime and the injector rewrites the table
   (`injector/modules/dataDrivenAndToggles.js`).
3. Bundle compatibility: `genItemPicksSection` throws on a missing `itemAssignments` key, so renaming
   the key would break every bundle already generated. Add an alias so `route121Berries` from an old
   bundle still resolves to the Route 121 pick.
4. `PICK_ROUTE121_BERRIES` → `PICK_ROUTE121_ITEMS` in `include/constants/randomizer_picks.h`,
   `src/randomizer_picks.c` and `data/maps/Route121/scripts.inc` — index unchanged (6), so the
   compiled bytecode is byte-identical.
5. `randomizer/trainers.js` — Cristin's reward/bag follows the new pool.
6. Docs (SSOT): update the berry and `averageItemPool` sections of `randomizer/docs/items.md`,
   including deleting the "Route 121 is a pick-2" note that documented the old behaviour.

Acceptance criteria:
- [x] No berry pick has fewer than 4 options (regression test named for B-065, red before the fix).
- [x] The Route 121 ball offers 3 `averageItemPool` items, none of them a resist berry.
- [x] Every berry a location offers is unique across locations (no duplicates introduced).
- [x] A pre-existing bundle (`route121Berries` key) still writes `gItemPicks[]` without throwing.
- [x] `cd randomizer && npm test` green.
- [x] `randomizer/docs/items.md` matches the new reality; no stale pick-2 note.
- [x] Owner manual-tests the Route 121 balls in a fresh run and confirms.

## Progress log

- **2026-08-10** — Task created. Investigation of the owner's `run-presentation` run (bundle
  `735016030`, viewer `docs/rom-1.html`) confirmed both symptoms and separated them: B-065 is
  deterministic pool exhaustion, B-066 is inherited pool membership plus a missing family constraint.
  Also confirmed the owner's Route 110 recollection was the **seed** pick (Joseph's 4 seeds), not
  terrain TMs — Route 110's TM pick this run was Wonder Room / Captivate / Venom Drench, so there was
  no duplicated offer.

- **2026-08-10 — shipped (B-065).** Red first: the regression test asserts every berry-bearing
  assignment offers 4, found by content rather than key name, so it stays true if a berry location
  moves later. Confirmed red for the right reason (`["route121Berries", 2]`), then green.
  - `itemRandomizer.js`: `route121Berries: berry(4)` → `route121Items: pool(3)`; `buildAssignments`
    exported for the test; `PICK_ROUTE121_BERRIES`/`route121Berries` → `PICK_ROUTE121_ITEMS`/
    `route121Items` in `PICK_TABLE` and the returned display names.
  - **Bundle compatibility:** `LEGACY_ASSIGNMENT_KEYS` maps a pre-T-262 bundle's `route121Berries`
    onto the Route 121 pick, so old bundles (e.g. the owner's `735016030`) still build and reproduce
    their own original 2-berry menu. Covered by a new case in `itemPicksWriter.test.js`.
  - C/scripts: constant renamed in `randomizer_picks.h` / `randomizer_picks.c` and the script label
    `Route121_EventScript_PickBerry` → `PickItem` (+ its `map.json` reference). Index stays **6**, so
    the compiled bytecode is unchanged and no base rebuild / corpus re-verify is needed.
  - `trainers.js`: `route121BerryItems`/`choiceCristinBerries` → `route121ItemItems`/
    `choiceCristinItems`.
  - Test fixtures: 7 suites mock the itemAssignments key list; renamed the key there. No assertion
    was weakened — the fixtures mirror a production key name.
  - **Deliberately NOT renamed:** `FLAG_ITEM_ROUTE_121_PICK_BERRY`. Every `FLAG_ITEM_*` in this repo
    keeps its upstream name regardless of content (`..._ZINC` is Walter's TM pick, `..._CAPSULE` is
    TM52), and renaming it would touch `flags.h` + `map.json` for zero player-visible gain.
  - **Drift repaired in `items.md` while there:** `averageItemPool` claimed 40 draws of 53 — measured
    31 (now 31 with Route 121 included) — and listed 4 pick-3 rows that are no longer this pool at
    all: `FLAG_ITEM_ROUTE_114_WIDE` is Nolan's TM pick, `..._ZOOM` is Angelina's, `..._POWERHERB` is
    Wilton's, and `..._ENERGY_POWDER` is Wyatt's **goodItemPool** ball, which was missing from the
    goodItemPool table (it listed 9 rows while claiming 10 of 10 consumed). Fixed both tables.
  - `node build.js` re-run so the browser Worker bundle carries the change; `npm test` 2257 passed /
    23 skipped; `check-tracker` OK.
  - B-066 (terrain TMs) left open on purpose — owner is still deciding whether terrain moves leave
    the TM pools; the bug file carries the provenance, the measured odds and the two knock-on effects.

- **2026-08-11** — Owner reviewed the result and approved ("lo veo bien"). Closing.

## Outcome

The Route 121 ball left the resist-berry pool and now offers 3 `averageItemPool` items; the 18 berries
feed exactly 4 locations at 4 each (16 drawn, 2 unused per run). B-065 fixed, with
`berryPickSizes.test.js` finding berry picks by content so the invariant survives a location moving.

Cheap by construction: `gItemPicks` index 6 never moved, so the compiled bytecode is unchanged and
no base-ROM rebuild or corpus re-verify was needed — only the injected table and its runtime labels.
Bundles generated before the rename still build through `LEGACY_ASSIGNMENT_KEYS` and reproduce their
own original 2-berry menu.

Deviations from the plan: none in substance. Two things were added along the way — the legacy-key
alias (the plan had it as a risk, it became code plus a test) and the `items.md` drift repair
(`averageItemPool` claimed 40 draws where the real number is 31; four pick-3 rows were TM picks or a
`goodItemPool` ball; Wyatt's ball was missing from the goodItemPool table). `FLAG_ITEM_ROUTE_121_PICK_BERRY`
kept its legacy name, consistent with every other `FLAG_ITEM_*` in this repo.

No follow-ups spawned. B-066, found during the same investigation, went to [T-263](T-263-status-tm-reclassification.md).
