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
- [x] **ROM (map scripts) swapped too:** the Rustboro rival script now grants the 10 evolution stones and
      the Route 110 rival grants a Lum Berry — the swap is real in-game, not only the docs label.
- [ ] Deploy: the server's git HEAD must be synced so `make.js` `checkDataClean` stays clean (see log).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-04** — Implemented in `trainers.js`: rewards swapped on the six rival variants; `'Lum Berry'`
  moved from `rivalRustboroBag` to `rivalRoute110Bag`. Added a TDD guard (Red → Green). Randomizer suite
  609 green. (A second, later `'Lum Berry'` in `shellyBag` is left as-is — it sits after Route 110, so it
  stays consistent with "from Route 110 onward".)
- **2026-07-04** — The rival `reward` was NOT only a docs label — the in-game `giveitem` scripts already
  existed, so the swap must also happen in the ROM (owner clarified). Swapped the **map scripts**: moved
  `EventScript_GiveEvolutionStones` (+ its "Obtained the Evolution Stones!" text) into
  `data/maps/RustboroCity/scripts.inc` and pointed the 6 Rustboro rival branches at it; the 2 Route 110
  rival branches now `finditem ITEM_LUM_BERRY`, and the rival dialogue text was updated (Evolution Stones
  → Lum Berry). Diff touches only static content — no `RAND_`-anchored sections. Verified counts + asm by
  hand (no local GBA toolchain; `make` validates on CI/builder).
  - **Deploy caveat (blocks the ROM change reaching prod):** this is the first change to a git-tracked
    `data/maps` file. `make.js` `checkDataClean` aborts a build if `git status data/` is dirty. The deploy
    (`update.sh`) rsyncs the working tree but **excludes `.git`**, so the box's git HEAD (currently
    `17fa476`, clean) would no longer match the rsynced `scripts.inc` → every build would abort with
    "Uncommitted changes in data/". Fix needed before deploy: sync the box's git (snapshot-commit the
    working tree inside the container after rsync, or `git reset --hard` to the pushed commit). Not yet
    resolved — flagged to owner.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
