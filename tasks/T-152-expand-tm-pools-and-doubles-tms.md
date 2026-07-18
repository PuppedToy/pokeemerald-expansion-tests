---
id: T-152
title: Add owner-classified TM moves to the pools + doubles-only status TMs
status: in-progress
type: feature
created: 2026-07-18
updated: 2026-07-18
target-version: 0.9.0
links: [randomizer/tms.js, randomizer/tmRandomizer.js]
blocked-by: []
---

# T-152 — Expand TM pools + doubles-only status TMs

## Context

The TM pool ([randomizer/tms.js](../randomizer/tms.js)) only covered a subset of moves that have been
official TMs. Research (this session) produced the full gap vs every official TM/HM; the owner then
classified 39 of them into pools. New concept: **doubles-only status TMs** — moves that join their
status pool **only when the battle format is doubles or mixed** (they're doubles-relevant support).

Owner classification:
- avgDmg: Fire Spin, Incinerate, Sand Tomb, Snore, Whirlpool, Fury Cutter, Dragon Breath, Silver Wind, Bubble Beam, Submission
- goodDmg: Power-Up Punch, Rock Climb, Egg Bomb, Sky Attack
- strongDmg: Dynamic Punch, Zap Cannon
- avgStatus: Confuse Ray, Captivate, Defense Curl, Gravity, Imprison, Metal Sound, Mimic, Quash, Snatch, Telekinesis, Teleport, Whirlwind
- goodStatus: Hone Claws
- goodStatus (doubles-only): Ally Switch, Coaching, Detect, Dragon Cheer
- godlikeStatus: Soft-Boiled
- godlikeStatus (doubles-only): Helping Hand
- niche: Bide, Counter, Natural Gift, Nature Power

## Plan

1. `tms.js` — append the classified moves to their base pools; add `goodStatusMovesDoubles`
   (Ally Switch, Coaching, Detect, Dragon Cheer) and `godlikeStatusMovesDoubles` (Helping Hand),
   exported.
2. `tmRandomizer.js` — make the TM ranges a function of "include doubles": when the run is doubles or
   mixed, the goodStatus (78–90) and godlikeStatus (91–95) pools concat their `*Doubles` moves; else
   not. `buildTMList(battleFormat)` / `randomizeTMs(battleFormat)` take the format. `TM_RANGES` export
   (pricing SSOT, T-073) stays the base — the pool TIER per slot is format-independent.
3. `pokedexModule.js` — pass `config.battleFormat` into `randomizeTMs`/`buildTMList`. The doubles
   moves then flow into the rating tmPool automatically (it's built from the assigned TM file).

Acceptance criteria:
- [ ] All 39 moves are in their classified pools; the 5 doubles-only moves are NOT in the base pools.
- [ ] Doubles/mixed runs can assign the doubles-only moves to goodStatus/godlikeStatus slots; singles
      runs never do.
- [ ] Existing TM tests stay green; regression tests added. `cd randomizer && npm test` green.
- [ ] Browser: `node build.js` rebuild for the bundle; owner manual-tests.

## Progress log

- **2026-07-18** — Task created. Verified all 39 moves exist as `MOVE_` constants; confirmed the rating
  tmPool is derived from the assigned TM file, so doubles moves flow through once `buildTMList` includes
  them; existing TM tests don't assert pool contents or TM-func args (safe). Owner classification above.

- **2026-07-18** — Implemented. `tms.js`: appended the 34 non-doubles moves to their pools + added
  `goodStatusMovesDoubles` / `godlikeStatusMovesDoubles`. `tmRandomizer.js`: `tmRanges(includeDoubles)`
  folds the doubles arrays into the goodStatus/godlikeStatus tiers; `buildTMList`/`randomizeTMs` take the
  format; `TM_RANGES` export unchanged (pricing tier is format-independent). `pokedexModule.js` passes
  `config.battleFormat`. TDD (`tmPoolsDoubles.test.js`): pools contain the new moves, singles never
  assigns the doubles-only moves; empirically verified doubles/mixed surface all 5 and singles surfaces
  none. Full suite green (1243). Doc note added to `randomizer/docs/tms.md`. Browser needs `node build.js`.

## Outcome

<!-- Filled when closing. -->
