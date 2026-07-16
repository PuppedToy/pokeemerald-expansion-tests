---
id: B-030
title: A trainer can teach a TM the player cannot have accessed yet (incremental TM bag leak)
status: fixed
severity: critical
created: 2026-07-13
updated: 2026-07-13
found-in: Unreleased
fixed-in: 0.8.0
regression-test: randomizer/__tests__/unit/archetypeRefine.test.js
links: [T-128, T-117]
---

# B-030 — TM accessible to a trainer before the player could obtain it

## Symptom

In `tasks/assets/T-128/run-2585940843` (seed 2585940843), **Wattson** (3rd gym, lvl 29) fields an
**Oricorio-Pom-Pom holding MOVE_VOLT_SWITCH** as a *teachable* (TM) move. The Volt Switch TM is only
handed out much later — by Auron (lvl 59, Mossdeep Space Center). A trainer must only ever be able to
teach TMs the player has already had access to at that point in the game (the "incremental bag"). Volt
Switch should be reachable only from the Space Center grunts (inclusive) / Auron onward.

## Root cause

<!-- To investigate. Confirmed so far:
  - Volt Switch is NOT in Oricorio-Pom-Pom's (mutated) level-up learnset — it is a TEACHABLE.
  - chooseMoveset (rating.js:1840) gates teachables by the trainer's accessible TM list:
        tmsInBag ? poke.teachables.filter(tm => tmsInBag.includes(tm)) : poke.teachables
    and resolveTrainerTeam passes `trainer.tms || []`. So for Oricorio to learn it, Wattson's
    `trainer.tms` (derived from wattsonBag()'s TM_* slots by normalizeTrainerBagTms) must already
    contain Volt Switch — i.e. the TM SLOT that got Volt Switch is present in an early bag.
  - The TM/bag/teachable engine (tmRandomizer.js, teachableExpander.js, rating.js, the bag helpers in
    trainers.js) is UNCHANGED on the T-128/T-106 branch; only resolveTrainerTeam.js changed (favourites).
    So DO NOT assume it is a favourite regression without proof (cf. the evo-level false alarm, which
    turned out to be a config value). Investigate: (a) which TM slot holds Volt Switch this run and
    whether that slot appears in wattsonBag()'s chain; (b) whether the TM-slot placement vs the bag
    composition disagree; (c) whether the teachable EXPANSION (newTeachables) widened the mon's pool;
    (d) reproduce on master with the same seed to confirm regression vs pre-existing. -->

## Investigation log

### 2026-07-13 — mechanism traced
- `normalizeTrainerBagTms` turns any `TM_<MOVE>` bag entry into `trainer.tms` (`MOVE_<MOVE>`);
  `tmItem(n) = 'TM_' + tmList[n - 1]` resolves TM SLOT n to the move the TM randomizer put there.
- Wattson's bag references slots via `tmItem(11)` (gym TM) + `choiceHectorTMs = [tmItem(77), tmItem(76)]`
  + the nested `wallyBag()`/`rivalRoute110Bag()` slots. So Volt Switch reached Wattson because its
  randomized slot this seed is one of the slots those EARLY bags reference — i.e. the "which slots are
  available by Wattson" bag composition and the "which move lives in each slot / where that slot is
  placed in the world" assignment disagree.
- NEXT: from the bundle, read `tmList` → find Volt Switch's slot number; check that slot's world
  location (randomizer/docs/tms.md) vs the slots Wattson's bag references; and reproduce the SAME
  seed on `master` to confirm whether this is a branch regression or pre-existing (the TM/bag/teachable
  engine is unchanged on this branch, so pre-existing is likely — cf. the evo-level config false alarm).

### 2026-07-13 — root cause found (from the owner's decision log)

`run-2585940843/decision-log.txt` shows it directly:
`slot 2: Oricorio Pom Pom — bulky_offense (emergent 0.68) → fills pivotUser  [+Volt Switch]`.

The move did NOT come from the bag: the ARCHETYPE role-move injection forced it. `chooseMoveset` gates
its own teachable selection by `trainer.tms` (correct), but two INJECTION paths in
`modules/resolveTrainerTeam.js` bypassed that gate because they used `utils.canLearnMove`, which treats
ANY teachable as learnable regardless of TM access:
  - the archetype role move (`planMemberRoleMove` → `pivotUser` = Volt Switch), and
  - a def's `tryToHaveMove`.
So a seeded trainer (Wattson, sophistication floored to 0.6) got Volt Switch as its `pivotUser` role move
even though Volt Switch's TM (slot 54 = Auron / Route 125) isn't in `wattsonBag()`. Pre-existing in the
T-117 archetype code (untouched on this branch); not a favourite/T-128 regression.

## Fix

Injected moves now respect the incremental bag, mirroring `chooseMoveset`:
- `modules/archetypeRefine.js` — `speciesCanLearn(species, move, { tms, level })` gates a teachable role
  move by the trainer's accessible TMs and a level-up move by the trainer's level; `planMemberRoleMove`
  now tries the next accessible role move (so an inaccessible TM neither blocks the role nor leaks in).
  Permissive when `tms`/`level` are absent (pure-planner unit calls unchanged).
- `modules/resolveTrainerTeam.js` — passes `ctx.tms`/`ctx.level` into `planMemberRoleMove`, and gates BOTH
  injection sites (`tryToHaveMove` and the role move) with an `injectableMove` check (level-up ≤ level, or
  teachable held in `trainer.tms`).

## Regression test

`randomizer/__tests__/unit/archetypeRefine.test.js` → `describe('planMemberRoleMove — B-030: role moves
respect the incremental TM bag')`: a teachable-only role move (Stealth Rock) is offered only when the
trainer holds that TM (`ctx.tms`), and a level-up role move above the trainer's level is not offered. RED
before the fix (the ungated `speciesCanLearn` returned the move), GREEN after.

Note: the exact frontend bundle couldn't be byte-reproduced via node `runGeneration` (different RNG
stream), so the guard is a deterministic UNIT test on the gate rather than a full-pipeline repro — the
bug and mechanism were confirmed from the owner's actual decision log + the code paths above.
