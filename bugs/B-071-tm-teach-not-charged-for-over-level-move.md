---
id: B-071
title: A TM teach is never charged when the move also sits higher in the mon's learnset
status: fixed           # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-08-11
updated: 2026-08-11
found-in: 0.5.0         # version where the bug was observed
fixed-in: 0.9.0         # version that ships the fix (set when fixed)
regression-test: randomizer/__tests__/unit/tmChargeOverLevelMove.test.js
links: [T-266, B-072]
---

# B-071 — A TM teach is never charged when the move also sits higher in the mon's learnset

## Symptom

Found in bundle `bundle-2231547897.json` (seed 2231547897, appVersion 0.5.0). Roxanne, level 13, fields
three Pokémon holding Water Pulse, but her bag holds a **single** unit of it — TM05, inside the linked
pick-pack `[TM_WATER_PULSE, TM_THIEF, TM_CHILLING_WATER]`:

| Mon | Water Pulse in its learnset | Charged? |
|---|---|---|
| Shellos West | level 15 (mon is level 13) | no |
| Tentacool | level 16 (mon is level 13) | no |
| Clamperl | not in learnset (teachable only) | yes |

Expected: a bag unit is spent by the first teach, and — being a pack member — spending it forgoes its
siblings for that trainer. Actual: only the teachable-only mon charges it; the other two teach it for free,
so one unit covers a whole team and the "choose 1 of 3" pack never activates.

Not limited to Roxanne. Across the bundle's 213 resolved trainers: **28 uncharged teaches over 21
trainers**, and **7 trainers spend more units of a TM than their bag contains** — Steven teaches Iron
Defense to 3 mons from 1 unit, Shelly Ice Beam to 2, Athena Hydro Pump to 2, the Ever Grande May Outrage
to 2. Koichi himself is one of the 21: his level-11 Tentacool carries Bubble Beam, a level-24 learnset move.

Note this is *not* the same as a mon knowing a move above its level — TMs are deliberately level-agnostic
(`injectableMove` in `randomizer/modules/resolveTrainerTeam.js` allows teachable + TM-in-bag with no level
requirement). The defect is purely the accounting.

## Root cause

`chooseMoveset` in `randomizer/rating.js` builds its candidate pool **with** a level filter:

```js
...poke.learnset.filter(ls => ls.level <= level).map(ls => ls.move),
...tms,
```

so a learnset move above the mon's level can only enter the set through the `tms` branch. But the
`tmsUsed` accounting at the end of the function asked the same learnset **without** the level filter:

```js
if (!poke.learnset.some(ls => ls.move === move.id) && tms.includes(move.id))
```

Any move present in the learnset at *any* level was therefore treated as self-taught and omitted from
`tmsUsed`. `resolveTrainerTeam` drives `consumeLinkedUnit` from `tmsUsed`, so the TM was neither removed
from `trainer.tms` nor did it activate its pick-pack link.

## Fix

`randomizer/rating.js` — the accounting now mirrors the pool's own level filter:

```js
if (!poke.learnset.some(ls => ls.move === move.id && ls.level <= level) && tms.includes(move.id))
```

A move reachable by level-up is still never charged; a move that could only have come from the bag now is.
Regression test `randomizer/__tests__/unit/tmChargeOverLevelMove.test.js` covers both directions and was
verified to FAIL on the third case before the fix and PASS after. Fixed under [T-266](../tasks/T-266-tm-charging-and-koichi-tm-cascade.md).
