---
id: B-072
title: The Route 104 south TM pick (TM08-10, Koichi) never enters any trainer bag
status: fixed           # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-08-11
updated: 2026-08-11
found-in: 0.5.0         # version where the bug was observed
fixed-in: 0.9.0         # version that ships the fix (set when fixed)
regression-test: randomizer/__tests__/unit/tmPickCascade.test.js
links: [T-266, B-071]
---

# B-072 — The Route 104 south TM pick (TM08-10, Koichi) never enters any trainer bag

## Symptom

Found in bundle `bundle-2231547897.json` (seed 2231547897, appVersion 0.5.0). The Petalburg Woods grunt
cannot use any of Koichi's TMs. Its bag carries exactly one TM, `TM_WHIRLWIND` (slot 71, inherited from
`rival103Bag`), while Koichi — fought earlier, on Route 104 — rewards and carries TM08/09/10.

The player can hold those TMs before entering the woods: both the pick's item ball (Route 104 x=20,y=56)
and Koichi (x=21,y=55) sit on Route 104 **south**, and their object-event flag is
`FLAG_DEFEATED_RIVAL_RUSTBORO`, which is only set in `data/maps/RustboroCity/scripts.inc` — after the
woods. `petalwoodGruntBag()` already collects other Route-104-south loot (the `Eviolite` is
`TRAINER_CINDY_1`'s reward, four tiles from Koichi, behind the same flag).

Widening it: across the bundle's 221 trainer definitions, TM09 and TM10 appear in **exactly one bag in the
whole game — Koichi's own**. TM08 reappears only from `rivalRoute110Bag` onward, via the unrelated
late-unlock line added in `422802ec1d`. So three TM slots are effectively absent from trainer teams for
most of the run.

Expected: the pick enters the cascade at Petalburg Woods (its geographic position) as a linked pick-group,
exactly like every other 3-choice pick — see `randomizer/docs/items.md` § Trainer Bag Cascade.

## Root cause

`choice104TMs2` was declared in `randomizer/trainers.js` by commit `762c2a5bea` ("Add TM08-10 pick at
Route 104 and TRAINER_KOICHI") and wired only into `TRAINER_KOICHI`'s own `reward`/`bag`. No bag function
was touched, so the pick never joined the cumulative cascade. A static scan of `trainers.js` confirms
`choice104TMs2` was the **only** pick group in the file absent from every bag function; the docs table in
`randomizer/docs/items.md` carried the same hole.

## Fix

`randomizer/trainers.js` — `petalwoodGruntBag()` now adds `linkedChoiceSample([...choice104TMs2])`, placed
beside Cindy's `Eviolite` (same area, same visibility flag) and before the Petalburg plates. It cascades
forward from there like every other pick. `randomizer/docs/items.md` updated to match.

Regression test `randomizer/__tests__/unit/tmPickCascade.test.js` asserts the grunt carries the pick as one
linked group, that it cascades to Roxanne/Brawly/Norman, and — as a guard against the next occurrence of
this class — that no pick group declared in `trainers.js` is orphaned from the bag functions. Verified to
FAIL before the fix and PASS after. Fixed under [T-266](../tasks/T-266-tm-charging-and-koichi-tm-cascade.md).
