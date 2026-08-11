---
id: B-065
title: The Route 121 berry pick only ever offers 2 options
status: fixed           # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-08-10
updated: 2026-08-11
found-in: 0.5.0         # version where the bug was observed
fixed-in: 0.9.0         # version that ships the fix (set when fixed)
regression-test: randomizer/__tests__/unit/berryPickSizes.test.js
links: [T-262]
---

# B-065 — The Route 121 berry pick only ever offers 2 options

## Symptom

Run `735016030` (app 0.5.0, owner's `run-presentation` bundle): the Route 121 resist-berry item ball
(`FLAG_ITEM_ROUTE_121_PICK_BERRY` → `PICK_ROUTE121_BERRIES`) shows a 2-option menu — Occa Berry /
Shuca Berry — instead of the 4 every other berry pick shows. Cristin's mirrored reward confirms it:
`["Occa Berry","Shuca Berry"]`.

Expected: the last berry pick of the run (post-badge 6) is at least as rich as the early ones.
Actual: it is the poorest item ball in the game, and **deterministically so** — the outcome does not
depend on the seed.

## Root cause

There are 18 resist berries (one per type) and 5 locations asking for 4 each = 20. The pool is handed
out in consecutive non-wrapping slices (`randomizer/itemRandomizer.js` — `berry()` →
`berriesPool.slice(bI, (bI += n))`) in a fixed order: Route 104 (0-3), Route 116 (4-7), Route 111
(8-11), Route 117 (12-15), Route 121 (16-**19**). The pool runs out at index 17, so Route 121 always
gets exactly the 2 leftovers.

The consequence was known and documented as accepted in `randomizer/docs/items.md` ("Route 121 is a
pick-2, not a pick-4"), but never registered as a defect.

## Fix

T-262. The Route 121 ball left the berry pool and now draws 3 items from `averageItemPool`
(`route121Items`); the 18 berries feed exactly 4 locations at 4 each. `gItemPicks` index 6 is
unchanged, so no base-ROM rebuild is involved — only the injected table and its menu labels.

Regression test `randomizer/__tests__/unit/berryPickSizes.test.js` finds the berry picks **by content**
(any assignment whose items are all resist berries) and asserts each offers 4. Verified red before the
fix — `["route121Berries", 2]` vs `["route121Berries", 4]` on seeds 1 / 42 / 735016030 — and green
after. Owner confirmed the result on 2026-08-11.
