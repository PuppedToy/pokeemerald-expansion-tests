---
id: B-047
title: Heavy-Duty Boots is never rated — handler string mismatch (hyphen vs space)
status: fixed           # open | fixing | fixed | wont-fix
severity: minor
created: 2026-07-21
updated: 2026-07-21
found-in: 1.1.0
fixed-in: 1.1.0
regression-test: randomizer/__tests__/unit/rateItemForAPokemon.test.js
links: [T-179, T-180]
---

# B-047 — Heavy-Duty Boots is never rated — handler string mismatch (hyphen vs space)

## Symptom

The trainer item selector logs `Warning: Item Heavy Duty Boots not rated for <mon>` and never applies the
dedicated Heavy-Duty Boots logic. `ITEM_HEAVY_DUTY_BOOTS` lives in `averageItemPool`, so it can reach any
late-game trainer bag; whenever it does, it falls through to the generic `not rated` fallback (rating ≈ 1)
instead of its intended Rock-immunity-aware score.

Surfaced by the T-180 determinism suite (`RUN_DETERMINISM=1`), which builds real trainer bags: e.g. "Sawsbuck
Spring" carries **Heavy Duty Boots** and warns.

## Root cause

Every constant→display conversion in the pipeline (`itemDisplayName` in `itemRandomizer.js`,
`itemIdToName`/`nameify` in `resolveTrainerTeam.js`) title-cases underscore-separated words, so
`ITEM_HEAVY_DUTY_BOOTS` becomes **`"Heavy Duty Boots"`** (space, no hyphen). The rating handler in `rating.js`
matched only `item === 'Heavy-Duty Boots'` (the hyphenated `items.json` display form), which the bag never
produces — so the branch was dead for every real bag item.

The T-179 coverage probe used `items.json` display names ("Heavy-Duty Boots"), which *did* match the handler,
so it reported the item as "treated" — a false negative that hid this pre-existing mismatch.

## Fix

`rating.js` now matches both the pipeline form (`'Heavy Duty Boots'`) and the `items.json` form
(`'Heavy-Duty Boots'`). Regression test in `randomizer/__tests__/unit/rateItemForAPokemon.test.js` (B-047):
the bag form must be rated identically to the hyphen form and above the `not rated` fallback — verified to FAIL
before the fix and PASS after.

Note (out of scope, logged): sell-only items such as **Nugget** also reach some bags and warn; they are not in
the seven held-item pools T-179 covers, so they still fall through. Whether to hard-zero pure sell items is a
follow-up decision.
