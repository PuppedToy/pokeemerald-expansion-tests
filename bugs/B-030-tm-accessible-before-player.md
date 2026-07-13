---
id: B-030
title: A trainer can teach a TM the player cannot have accessed yet (incremental TM bag leak)
status: open
severity: critical
created: 2026-07-13
updated: 2026-07-13
found-in: Unreleased
fixed-in:
regression-test:
links: [T-128]
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

## Fix

<!-- Filled during the fix. -->

## Regression test

<!-- REQUIRED to mark fixed: a test that fails before and passes after — e.g. assert no trainer's
     resolved teachable moves reference a TM slot outside that trainer's accessible bag. -->
