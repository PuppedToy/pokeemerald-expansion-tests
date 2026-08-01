---
id: T-247
title: "Phase-2 cleanup — delete the multichoice lists and writer loops the data-driven migration orphaned"
status: in-progress     # proposed | in-progress | done | abandoned
type: chore             # feature | fix | refactor | docs | chore
created: 2026-08-01
updated: 2026-08-01
target-version: 0.7.0
links: [T-235, T-236, B-055, docs/base-plus-injection-strategy.md]
blocked-by: []
---

# T-247 — Phase-2 cleanup (orphaned multichoice lists + dead writer loops)

## Context

T-235 and T-236 moved rewards, item picks, TM picks and mega-NPC removal to runtime tables. Both
tasks deliberately left their now-dead predecessors in place rather than deleting them mid-flight:
each deletion changes the base ROM, and the base was being frozen for a golden-master re-snapshot at
the time (see the Outcome of [T-236](T-236-base-injection-data-driven-item-placement.md) and the
deferred-cleanup note in [T-235](T-235-base-injection-data-driven-rewards.md)). Doing it in one pass
means the corpus is re-snapshotted **once** instead of twice.

Nothing here is load-bearing — it is dead weight that costs ROM space and misleads readers into
thinking the old mechanism is still live.

## Plan

One sweep, then one re-snapshot. Measure the ROM saving before/after (the 32 MB ceiling is the
budget that gates Phase-3 B1 padding — see GATE-1).

Inventory to remove:
1. **`src/data/script_menu.h` + `include/constants/script_menu.h`** — the **50** orphaned
   `MULTI_*` / `MultichoiceList_*` pairs left by T-236 (161 dead `COMPOUND_STRING`s), plus
   `MultichoiceList_SkypillarTopLegend` left by T-235. Verify orphanhood mechanically (no
   `data/maps/**` or `data/scripts/**` reference) rather than by eye; **do not** touch the 33
   pre-existing vanilla orphans (`MULTI_UNUSED_*`, shards, PC…) — out of scope, they are upstream's.
2. **`randomizer/writer.js`** — the legacy reward token `.replace` loops, now no-ops on migrated
   scripts. Careful: the gym loop still collects `gymRewardItems` for the `gGymRewards[]` table, so
   the collection must survive the deletion of the substitution.
3. Any `RAND_*` anchor comments left behind in `data/maps/**/scripts.inc`.

Acceptance criteria:
- [ ] 0 orphaned pick-related `MULTI_*`/`MultichoiceList_*` pairs remain (script-verified); the 33
      vanilla orphans are untouched.
- [ ] Dead token `.replace` loops gone from `writer.js`, `gymRewardItems` collection still intact.
- [ ] `cd randomizer && npm test` green; `make` compiles on PRO.
- [ ] Full corpus builds (12/12) and `manifest.json` re-captured on the post-cleanup base, with the
      ROM-size delta recorded in this task.
- [ ] Owner play-tests one item pick, one TM pick and the Sky Pillar menu to confirm nothing that is
      still reachable was deleted by mistake.

## Progress log

- **2026-08-01** — Task created, carved out of the T-236 Outcome so the follow-up has its own id.
  Inventory measured at close of T-236: 50 pick-related orphans / 161 dead menu strings / 83 orphans
  total of which 33 are pre-existing vanilla.
- **2026-08-01 — SWEEP DONE (source side).** Run first, ahead of [[T-237]], so Phase 2 ends with a
  **single** corpus re-snapshot instead of two (owner's call).
  - **Orphanhood proved mechanically, not by eye.** A `git grep` of every `MULTI_*` token over
    `data/ src/ include/` (excluding the two `script_menu` tables themselves, which are the definition
    site, not a use) gives the orphan set; running the same query against `HEAD` — i.e. *before* the
    uncommitted Phase-2 tree — splits it into "orphaned by our migration" vs "already dead".
    **172 ids: 91 used, 81 orphaned = 44 orphaned by T-235/T-236 + 8 project picks already dead before
    Phase 2 + 29 upstream** (`MULTI_UNUSED_*`, `MULTI_SHARDS_*`, `MULTI_UNUSED_SSTIDAL_*`).
  - **Deleted 52** (44 + 8 — the 8 are ours by name: `MULTI_ROUTE109_PICK_BALL`,
    `MULTI_ROUTE120_PICK_ITEM`, …, left over from earlier randomizer tasks, not upstream's), with their
    52 `sMultichoiceLists[]` rows and 52 `MultichoiceList_*` arrays (**167 `COMPOUND_STRING`s**).
    **−17,520 B of source** (`script_menu.h` 57,515 → 39,995). The 29 upstream ids stay, which also
    keeps every surviving id's numeric value unchanged (they are explicit `#define`s, so deleting
    others shifts nothing).
  - Counts differ slightly from the T-236 estimate (50/161/33) because that one was eyeballed; the
    mechanical split is the accurate one.
  - **Verified after the fact:** 0 dangling references for the 52 deleted ids (word-boundary grep), and
    the tables are internally consistent — 119 rows, all pointing at a defined id and an existing list;
    107 list definitions, all referenced.
  - **`writer.js`:** deleted the legacy token `.replace` loops. Confirmed dead first by checking the
    tokens no longer exist in their targets (`GYM_REWARD_MON/NAME/ITEM`, `SPECIES_REGIROCK/REGICE/
    REGISTEEL/MEW`, `SPECIES_LEGEND1/2/3` → 0 hits in the reward scripts; the only `SPECIES_MEW` left is
    vanilla FarawayIsland, which the writer never touched, and the `SPECIES_LEGEND*` hits were in the
    dead `MultichoiceList_SkypillarTopLegend` this sweep deletes). **Kept** the two live side effects:
    `gymRewardItems[]` (feeds `gGymRewards[]`) and every `replacementLog[…]` entry (feeds the docs).
    The writer now touches **no** `scripts.inc` reward file and **no** `script_menu.h` at all — 11 gym
    files + 4 static-encounter files + `script_menu.h` + `SkyPillar_Top` dropped from its write set.
  - **Item 3 of the plan was already clean:** 0 `RAND_*` anchors left anywhere in `data/`.
  - **New guard test** `randomizer/__tests__/unit/scriptMenuNoOrphans.test.js` (3 tests): every
    `MULTI_*` id must be reachable from a script or from C (upstream's 29 explicitly allowlisted), no
    row may point at a missing id/list, no list may be defined for nobody. **Falsifiability checked**:
    re-introducing one orphan pair (`MULTI_T247_PROBE`) turns test 1 RED naming the probe; reverted.
  - Doc drift repaired: `pokedexModule.js`'s "Node: writes tms_hms.h + script_menu.h" comment (stale
    since T-236).
  - Suite green (**1712** = 1709 + 3). Browser bundle **not** affected — `writer.js` is builder-side
    and is not in the worker's import graph (checked: 0 hits in `frontend/js/randomizer.bundle.js`).
  - **Still open:** `make` on PRO + the corpus re-snapshot + owner play-test — all deliberately folded
    into the single T-237 re-snapshot at the end of Phase 2.

- **2026-08-01 (found while doing [[T-239]], not fixed here)** — one more dead `.replace` loop in
  `writer.js`: the **mail-mint** substitution over the 26 `routeFiles` (`ITEM_WOOD_MAIL` /
  `ITEM_WAVE_MAIL` / `ITEM_MECH_MAIL` → the chosen mints). Those tokens no longer exist anywhere under
  `data/maps/**` (0 hits) — T-236 moved that placement into `gItemPicks` — so the loop reads and rewrites
  26 `map.json`s unchanged. `resolveMailMints()` itself still feeds the docs, so only the loop is dead.
  Left for this task's next pass rather than folded into T-239, which is deliberately injection-only.

## Outcome
