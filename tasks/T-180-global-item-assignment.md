---
id: T-180
title: Order-independent (global) held-item assignment across a trainer's team
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-21
updated: 2026-07-21
target-version: 1.1.0
links: [T-179, B-047, randomizer/modules/itemAssignment.js, randomizer/modules/resolveTrainerTeam.js, randomizer/modules/itemLinks.js, randomizer/docs/trainer-determinism.md]
blocked-by: []
---

# T-180 — Order-independent (global) held-item assignment across a trainer's team

## Context

Sibling of [T-179](T-179-trainer-item-selector-coverage.md). Today held items are assigned **greedily, one
Pokémon at a time, in team order**: for each mon without a preset item the selector rates the whole bag with
`rateItemForAPokemon`, takes the best `> 0`, and **consumes** it (link-aware, `itemLinks.consumeLinkedUnit`).
See [resolveTrainerTeam.js:550](../randomizer/modules/resolveTrainerTeam.js#L550).

Because each pick consumes from a shared bag, **team order changes the outcome**: the first mon takes first
pick of the whole bag, so it can grab a scarce item (Life Orb, a Choice item, Assault Vest, Focus Sash — the
`goodItemPool`/`premiumItems` are mostly single copies) that a later teammate would have valued more. Greedy
is a reasonable heuristic but it is neither optimal nor order-invariant.

**Goal:** items placed to maximise the team's *total* held-item rating, and the order we visit the mons in must
not affect the result.

This is the classic **assignment problem** (max-weight bipartite matching): rows = the mons needing an item
(≤ 6), columns = the bag's distinct resources.

## Cost analysis (the crux — is the fear founded?)

**Short answer: the cost fear is essentially unfounded.** The expensive part is *already paid today*.

### What actually costs anything

The only non-trivial cost is `rateItemForAPokemon`. Everything else in an assignment (the matching algorithm)
is arithmetic on an already-built matrix.

- **Team size N ≤ 6** (usually fewer need an item — presets take some slots).
- **Bag size M ≈ tens** of distinct item entries for a late-game trainer (TMs are routed elsewhere).
- **Greedy already builds ~the full N×M rating matrix.** The loop `trainer.bag.map(id => rateItemForAPokemon(...))`
  rates the **entire** remaining bag for **every** mon. Greedy's total ≈ `Σ Mᵢ` (bag shrinks as items are
  consumed) = `N·M − N(N−1)/2`. An optimal assignment needs the full `N·M` matrix — for N=6, M=40 that is
  **240 vs ~225** `rateItemForAPokemon` calls. Same order of magnitude; the delta is ~15 extra calls/trainer.

### What the matching adds

Building the matrix is the cost; solving it is not. The Hungarian algorithm on a 6×40 matrix is `O(N²·M)`
≈ 1 500 primitive ops (compares/adds), or `O(N³)` ≈ 216 — **zero extra `rateItemForAPokemon` calls**.

### Relative to the whole randomization

Per mon, moveset selection dominates: `chooseMoveset` rates **all** learnable moves (L ≈ 40–90) across
~3 passes (tier + select + adjust) → ~150–300 `rateMoveForAPokemon` calls/mon, and `rateMove` is heavier than
`rateItem`. Item rating is already only ~10–20 % of a mon's rating work. Across a run: ~860 trainers × ~6 mons
× ~200 rateMove ≈ **~1 M `rateMove` calls**. The matching overhead for the whole run is ~860 × ~1 500 ops
≈ **1.3 M primitive ops = single-digit milliseconds**, i.e. **< 0.1 %** of the pipeline.

**Verdict:** an order-independent assignment does **not** add meaningful CPU. The real cost is not compute — it
is **implementation complexity and determinism**, below.

## Real implications (the actual cost)

1. **Loop restructure.** The item pick currently lives *inside* the slot loop, after each mon's moveset is
   built. `chooseNature` and `adjustMoveset` both depend on the chosen item, so deferring the pick means
   deferring those too. The clean shape: (a) slot loop builds species/ability/moveset(pre-adjust)/preset-items
   and the incremental `selCtx`, **storing each non-preset mon's rating vector over the bag**; (b) a global
   pass runs the assignment + link-aware consumption; (c) a short second pass runs `adjustMoveset` + nature per
   mon with its final item. `resolveTrainerTeam.js` is heavily T-1xx-tested → contained but careful refactor.

2. **Pick-group ("link") constraint.** The bag is not M independent items: pick-packs are capacity-1 groups
   (taking one member forgoes its siblings, T-133). So it is not a plain Hungarian assignment. Model cleanly as
   columns = {unique items with their unlinked copy-count as capacity} ∪ {each pick-group as one capacity-1
   column, weighted by its **best member for that mon**}; then min-cost matching. Small (N≤6) → any method works.

3. **Determinism.** `rateItemForAPokemon` consumes RNG (`GENERIC_DEVIATION = 0.1`; even at 0 the deviation term
   burns 2 `rng.random()` per call). Changing when/how many rating calls happen **shifts the whole bundle's RNG
   stream** → every downstream team changes **once**. That is acceptable for a version bump but: (a) many test
   snapshots regenerate, (b) the per-slot reseeding that keeps **shared trainers consistent across a bundle's
   ROMs** (`docs/trainer-determinism.md`) must be preserved — the global item pass must be deterministic given
   `(team, bag)` and reseed from the trainer/slot seed, or shared-trainer consistency breaks.

4. **Marginal, systematic quality gain.** The change only matters when two mons contend for the same scarce
   item (common with 2+ similar attackers vs the ~18 single-copy good/premium items). Per team it is a "2nd-best
   instead of best for one mon" delta; across 860 trainers it is a consistent, if small, improvement — squarely
   in line with T-179's item-quality goal. It is a *polish* gain, not a correctness fix.

## Options

| Option | What | Order-independent | Optimal | Compute | Code/risk |
|---|---|---|---|---|---|
| **A — Optimal assignment** | Build N×M matrix, min-cost bipartite matching with group-capacity columns | ✅ by construction | ✅ global | ≈ greedy (+<0.1 %) | Medium (matching + links + loop refactor) |
| **B — Iterative improvement** | Greedy first, then repeatedly swap/reassign any pair that raises total until stable | ✅ in practice (symmetric neighbourhood) | ⚠️ local optimum | ≈ greedy (+ a few passes) | Low–medium (no matching algo; links via existing consume checks) |
| **C — Keep as-is** | Greedy in team order | ❌ | ❌ | baseline | none |

(A "smart order only" variant was rejected: making item order irrelevant *requires* the same loop refactor —
items are picked inside the order-dependent slot loop — so it carries A/B's main cost for less benefit.)

## Recommendation

**Do it — the compute fear is unfounded** (the rating matrix is already built by greedy; matching is free at
N≤6). Between the two:

- **Preferred: Option A (optimal assignment).** It fully delivers the goal ("order cannot matter"), is provably
  best, and the matching code is not much larger than B's swap loop. Model pick-groups as capacity-1 columns.
- **Acceptable lighter-touch: Option B (iterative improvement).** Smallest diff, near-all the benefit,
  order-independent in practice; accept a local (not guaranteed global) optimum. Good if we want to minimise
  churn in `resolveTrainerTeam.js`.

Either way, **budget the work for the determinism/refactor, not for CPU.** Ship with a test that permutes team
order and asserts an identical assignment (the order-independence guarantee), plus regenerated snapshots.

**Not recommended: Option C** — it leaves the stated goal unmet.

## Plan (Option A — chosen by owner)

New pure module `modules/itemAssignment.js`: max-weight bipartite matching (Hungarian, O(n²·m)) of the mons
needing an item against the bag's distinct resources — each loose copy of an item is a column, each pick-group
is one capacity-1 column valued by its best member for that mon; n dummy columns model "no item". Pure,
deterministic, no RNG.

`resolveTrainerTeam.js` refactor: the slot loop now, for a mon drawing a **generic** item, computes its
per-item ratings under its slot seed (same as before) but **defers** the pick; a post-loop phase runs the
global assignment and finalises each deferred mon's item / nature / `adjustMoveset` / audit under its own slot
seed. Preset items (Choice/mega, weather rocks, terrain seeds/extender) keep the in-loop path and are claimed
first, so they take priority over generic picks. Consumption stays link-aware (`consumeLinkedUnit`); the
matching already respects capacities, so consumption order is irrelevant.

Acceptance criteria:
- [x] Held-item assignment is independent of the order the mons are processed in — proven at the assignment
  layer (`itemAssignment.test.js`: explicit 6-permutation test + the pure module is the *only* order-dependent
  step, now order-independent by construction). Per-slot rating bias (`GENERIC_DEVIATION`, keyed by
  `trainer.id`+slotIndex) is a separate, intended determinism mechanism, not processing-order dependence.
- [x] Total team item-rating is **provably optimal** (Hungarian), cross-checked against brute force on 200
  random instances.
- [x] Pick-group/link semantics preserved (a pack yields at most one unit; loose + pack copies both usable) —
  `itemAssignment.test.js` + `itemLinks.test.js` green.
- [x] Shared-trainer determinism preserved — `crossRomBossDeterminism` + `reverseOrderContinuity` green
  (`RUN_DETERMINISM=1`).
- [x] `cd randomizer && npm test` green (1437; no snapshot tests exist — the suite asserts properties, so no
  regeneration needed).

## Progress log

- **2026-07-21** — Task created as an analysis/recommendation (sibling of T-179). Studied the current greedy
  path and quantified cost: greedy already builds ~the full N×M rating matrix, so an order-independent
  assignment adds ~0 `rateItemForAPokemon` calls + a negligible O(N³) matching step (< 0.1 % of the pipeline,
  which is dominated by ~1 M `rateMoveForAPokemon` calls). Real cost is the loop refactor + link constraint +
  RNG-determinism churn, not compute. Recommended **Option A (optimal)**, with **Option B (iterative)** as a
  lighter-touch fallback. Awaiting owner decision.
- **2026-07-21** — Owner chose **Option A**. Implemented via TDD:
  - **Pure core** `modules/itemAssignment.js` + `itemAssignment.test.js` (10 tests): Hungarian max-weight
    matching, brute-force optimality cross-check (200 random instances), copy-count/pick-group capacity, and
    an explicit order-independence permutation test.
  - **Integration** in `resolveTrainerTeam.js`: defer generic-item mons (store per-slot ratings), run one
    global `assignItemsGlobally` after the slot loop, finalise item/nature/adjustMoveset/audit per mon under
    its slot seed. Presets unchanged and prioritised. Confirmed `bagSize` is unused by the rater (ratings are
    bag-state-independent), which makes the defer clean.
  - Full suite green (1437); determinism suites (`crossRomBossDeterminism`, `reverseOrderContinuity`) green
    under `RUN_DETERMINISM=1`.
  - The determinism run surfaced a **pre-existing** bug logged/fixed as **[B-047](../bugs/B-047-heavy-duty-boots-name-mismatch.md)**
    (Heavy-Duty Boots handler string mismatch — the bag delivers "Heavy Duty Boots"). The T-179 probe missed
    it because it used items.json display names, not the bag's `itemDisplayName` form.
  - Also logged (out of scope): sell-only items like **Nugget** reach some bags and still warn — not in the
    seven held-item pools; follow-up decision whether to hard-zero pure sell items.
  - **Not closing** — the effect is only observable in a built ROM; awaiting the owner's manual/batch test.

## Outcome

<!-- Filled when closing. -->
