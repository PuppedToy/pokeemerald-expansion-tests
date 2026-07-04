---
id: T-056
title: Rebalance — swap rival rewards (stones earlier) + move Lum Berry bag entry
status: in-progress
type: feature
created: 2026-07-04
updated: 2026-07-04
target-version: 0.6.0
links: []
blocked-by: []
---

# T-056 — Rival reward + item-progression rebalance

## Context

Player feedback on early-game reward pacing:

- The **Rustboro** rival rewarded a Lum Berry and the **Route 110** rival rewarded Evolution Stones —
  the stones felt too late. Swap them so the stones come **earlier** (Rustboro) and the Lum Berry later
  (Route 110).
- Opponents began carrying **Lum Berry** in their bags from the Rustboro rival onward; move that entry
  point to the **Route 110** rival's bag so Brawly/Steven/Slateport trainers no longer carry it.

Data lives in `randomizer/trainers.js` (rival trainer `reward` fields + the cumulative bag-cascade
functions `rivalRustboroBag` / `rivalRoute110Bag`).

## Plan

- Swap the `reward` on the three Rustboro rival variants (`Lum Berry` → `Evolution Stones`) and the three
  Route 110 rival variants (`Evolution Stones` → `Lum Berry`). Brendan copies inherit via `copy:`.
- Remove `'Lum Berry'` from `rivalRustboroBag()` and add it to `rivalRoute110Bag()` (cumulative, so it
  then propagates from the Route 110 rival onward, not from Rustboro).

Acceptance criteria:
- [x] Rustboro rival reward is `Evolution Stones`; Route 110 rival reward is `Lum Berry`.
- [x] `Lum Berry` is absent from the Rustboro rival's bag and present in the Route 110 rival's bag.
- [x] Deterministic guard test (`__tests__/integration/rivalRewards.test.js`) covers both, via the real
      `getTrainersData` pipeline; full randomizer suite green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-04** — Implemented in `trainers.js`: rewards swapped on the six rival variants; `'Lum Berry'`
  moved from `rivalRustboroBag` to `rivalRoute110Bag`. Added a TDD guard (Red → Green). Randomizer suite
  609 green. (A second, later `'Lum Berry'` in `shellyBag` is left as-is — it sits after Route 110, so it
  stays consistent with "from Route 110 onward".)

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
