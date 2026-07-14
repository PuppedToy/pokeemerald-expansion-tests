---
id: T-129
title: Coherent item + move co-assignment for trainer mons
status: done
type: fix
created: 2026-07-13
updated: 2026-07-14
target-version: 0.8.0
links: [T-117, T-133]
blocked-by: []
---

# T-129 — Coherent item + move co-assignment

## Context

Review feedback on `tasks/assets/T-128/run-2585940843`: Champion Steven's Solgaleo resolved to
**Choice Specs + Stealth Rock** (a Choice item locked onto a hazard-setting status move — never done
competitively), and **Choice Specs + Metal Burst** (equally incoherent). The item and the moveset are
currently chosen in separate steps (`chooseMoveset` then a bag-item rating pass in
`modules/resolveTrainerTeam.js`), so the item can contradict the moves (e.g. a Choice item on a set
built around status/utility moves).

## Plan

Diagnose the item↔move assignment with a critical eye and make them coherent:
- Trace how `chooseMoveset` and the bag-item selection interact today; identify why a Choice item lands
  on a status/utility set (and Metal Burst — a damage-reflect move — pairs with Choice Specs).
- Decide whether item and moves should be chosen **together** (co-optimised) or whether item selection
  should veto/adjust incoherent pairings (e.g. no Choice item unless the set is ≥3 attacking moves of one
  split; Assault Vest only with 0 status moves; etc.).
- Keep it data-driven and tested; do not special-case single species.

Owner scoping (2026-07-13): this task = **two objectives** — (1) the small, correct fix now: *items respect
roles*, a Choice item must never land on a mon carrying a move it can't be locked into; (2) **plan** the
larger intelligent item economy for later. (2) is now **T-133** (bound pick-groups + planner-assigned items,
incl. the forward path where a Choice-*role* mon builds an attacking set). This task delivers (1) only.

Acceptance criteria:
- [x] No Choice item (Band/Specs/Scarf) on a set that is not overwhelmingly attacking / is locked to a
      status move; documented rule. → hard rule in `rateItemForAPokemon`: Choice = 0 if the set has any
      STATUS move or a REACTIVE damaging move (Counter/Mirror Coat/Metal Burst).
- [x] The Steven-Solgaleo case (and Metal Burst) no longer produces the incoherent pairing. → verified on
      seed 2585940843: Champion Steven's Solgaleo now holds Shell Bell (not Choice Specs); a full-bundle
      scan found 0 of 15 Choice-holders paired with a status/reactive move.
- [x] Unit test(s) covering the incoherent combinations that must not occur. →
      `randomizer/__tests__/unit/rateItemForAPokemon.test.js` (6 tests: baselines + status + reactive +
      pivot-is-fine).
- [x] `cd randomizer && npm test` green. → 994 passing, no regressions.
- [ ] Owner manual-confirmation, then close (with T-133 spun off for the rest).

## Progress log

<!-- Append-only. -->

### 2026-07-13 — analysis (no code yet; pending owner validation)
Traced the item↔move flow (`modules/resolveTrainerTeam.js` + `rating.js`):
- **The move-chooser is already coherent.** `rateMoveForAPokemon` (rating.js:1050) returns 0 for a STATUS
  move when the held item is Choice Band/Specs/Scarf or Assault Vest — so *if the item is known at
  moveset-time*, status/hazard moves are never added to a Choice/AV set.
- **The item-rater is already coherent for most items** — Assault Vest returns 0 on any status move,
  Throat Spray needs a sound move, Loaded Dice needs a multi-hit move, Focus Sash rejects self-damage,
  Expert Belt scales with coverage. **But the Choice items (Band/Specs/Scarf, rating.js:1436-1444) rate on
  raw stats and `return` before ever inspecting the moveset.** That is the single blind spot.
- **Why the incoherent pair survives (ordering + fixed moves):** a boss ace's `chooseMoveset` runs while
  `item` is still undefined (bag items are rated *after*), so the Choice/AV status-guard never fires and a
  hazard/utility role move (Stealth Rock — injected as a FIXED move by the T-107 archetype refinement, or
  Metal Burst from the natural set) enters the moveset. `rateItemForAPokemon` then scores Choice Specs at
  the top on Solgaleo's SpA alone, blind to that fixed move. `adjustMoveset` re-rates with the item but
  cannot drop a FIXED injected move → Choice Specs + Stealth Rock coexist.

**Proposed fix (localized, matches the existing AV/Throat-Spray pattern — item-rater becomes moveset-aware):**
Make the Choice ratings scale down with "anti-Choice" moves in the set, so a non-locking item wins instead:
- `antiChoice = count of moves that are STATUS (hazards/utility/status), a SETUP move, or a REACTIVE move
  you must not lock into (Counter, Mirror Coat, Metal Burst)`.
- `choiceRating *= max(0, 1 - antiChoice / 2)` → 0 anti = full (pure attacker keeps Choice), 1 = ×0.5,
  ≥2 = 0. On Solgaleo (SR = 1 anti) Choice Specs drops ~9→~4.5×, below Life Orb (~8.5×) → Life Orb wins,
  and `adjustMoveset` keeps the set (Life Orb doesn't lock, so SR is fine).
This needs no reordering and no co-optimisation refactor. Open question for the owner: is the item-rater
penalty enough, or do we also want to stop the refinement from handing a hazard/setup role move to a
would-be Choice attacker (a team-role decision, T-107 territory)?

### 2026-07-13 (cont.) — small fix implemented (owner reframed the rule to a HARD "items respect roles")
- Owner's direction: not a soft penalty — a hazard/reactive mon must **never** be Choiced. The larger
  intelligent system (planner assigns items, bound pick-groups, forward Choice-role move-building) is a
  **future task → created T-133**.
- **Fix** (`rating.js`, `rateItemForAPokemon`): before the Choice Band/Specs/Scarf branches, return 0 if the
  moveset has any `DAMAGE_CATEGORY_STATUS` move OR a reactive damaging move (`EFFECT_COUNTER` /
  `EFFECT_MIRROR_COAT` / `EFFECT_METAL_BURST`). Damaging pivots (U-turn/Volt Switch/Flip Turn) are allowed —
  they switch out, which unlocks. Mirrors the existing Assault Vest rule (0 on any status move).
- TDD: wrote `__tests__/unit/rateItemForAPokemon.test.js` first (3 "must be 0" cases RED against the old
  stats-only Choice rating), then the fix (GREEN, 6/6). Full suite 994, no regressions (no integration
  snapshot depended on the incoherent pairing). End-to-end scan confirms 0 incoherent Choice-holders and
  Steven's Solgaleo fixed.
- **Note (out of scope, → T-107/T-133):** Solgaleo's *set* is still hazard+reactive-heavy (Stealth Rock +
  Metal Burst) because the archetype refinement handed it those roles; the ITEM is now coherent. The forward
  fix (a Choice-role ace building 4 attacks) lands in T-133.

## Outcome

Shipped: items respect roles — a Choice item (Band/Specs/Scarf) scores 0 in `rateItemForAPokemon` when the
set carries a move it can't be locked into (any status/hazard/setup move, or a reactive move Counter/Mirror
Coat/Metal Burst), so Steven's Solgaleo no longer runs Choice Specs + Stealth Rock. Regression:
`__tests__/unit/rateItemForAPokemon.test.js` (6 tests); full suite green. The larger item economy (planner
assigns items, Choice as a forward role) is spun off to **T-133**. Closed 2026-07-14 with the weather batch.
