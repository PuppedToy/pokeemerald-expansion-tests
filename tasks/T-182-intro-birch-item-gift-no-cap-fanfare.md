---
id: T-182
title: Intro — Birch gifts all starting items after the Zigzagoon, starter spawns at cap, no bogus level-cap fanfare
status: in-progress
type: feature
created: 2026-07-21
updated: 2026-07-21
target-version: 1.1.0
links: [src/battle_setup.c, src/new_game.c, data/maps/Route101/scripts.inc, T-151, T-148]
blocked-by: []
---

# T-182 — Intro item gift + spawn-at-cap + remove the intro level-cap fanfare

## Context

The whole intro handoff runs in `Route101_EventScript_BirchsBag`
([data/maps/Route101/scripts.inc](../data/maps/Route101/scripts.inc)): you beat the wild Zigzagoon with
your just-picked starter, Birch walks over, a level-cap fanfare fires, he says "Good job!", you get the
"received {STR_VAR_1} and 9 other Pokémon!" message, then he leaves. Two things are wrong for this
point in the game:

1. **A level-cap fanfare plays that shouldn't.** The intro is *not* a cap milestone — the cap is 8 from
   the very start (first entry of `sLevelCapFlagMap`, see [src/caps.c](../src/caps.c)). Defeating the
   Zigzagoon raises no flag and no cap. The "Your Pokémon have leveled up to 8!" message wrongly implies
   a milestone. Owner: the party should simply be *at* the cap already — no level-up event here.

   Subtlety (`B_EXP_CAP_TYPE == EXP_CAP_HARD`, mons gain 0 exp and only level via cap fanfares): the
   starter is created at **level 7** and it is that fanfare's `LevelUpAllPokemonToCap` that silently
   takes the party 7→8. Removing the whole fanfare would strand the team at 7 until the Route 103 rival.
   Owner decision (2026-07-21): **the starter + 9 extras must spawn directly at the cap** (8 now), so you
   fight the Zigzagoon already at cap and the fanfare is redundant and can be deleted outright.

2. **The starting items are handed out too early.** All 13 intro items (Evolve Candy, Old Rod, both
   bikes, 99× Ultra/Quick/Timer Ball, 6 status berries) are added at new-game init
   ([src/new_game.c](../src/new_game.c) lines 192-204) — before the player has even left the truck.
   Owner: **Birch should give all of them, at once, right after the starter and before he leaves**, with
   a single "received … and N other items!" message, and his dialogue should read as him handing them
   over.

## Plan

Spawn-at-cap + delete the intro fanfare + relocate the item grant into Birch's Route 101 scene.

1. **`src/battle_setup.c` `CB2_GiveStarter`** — create the chosen starter and the 9 extras at
   `GetCurrentLevelCap()` instead of the hard-coded `7` (SSOT: reads the cap from caps.c, tracks any
   future cap change). Add `#include "caps.h"`.
2. **`data/maps/Route101/scripts.inc` `Route101_EventScript_BirchsBag`** — delete the fanfare block
   (`special BufferLevelCap` / `message Route101_LevelCap` / `waitmessage` /
   `call Common_EventScript_PlayLevelCapFanfare`) and the now-orphaned `Route101_LevelCap` string.
   After the existing "received … Pokémon!" fanfare and before Birch leaves, add: a Birch line offering
   the gear, the 13 `additem` grants (silent), a single consolidated "received an Evolve Candy, Balls
   and N other items!" `message`, and one `MUS_OBTAIN_ITEM` fanfare.
3. **`src/new_game.c`** — remove the 13 `AddBagItem` intro lines (keep `ClearBag()` so the bag starts
   empty). The `NewGameInitPCItems()` and later item grants are untouched.
4. **Regression guard (JS structural, C/scripts can't be built locally)** — assert: (a) the Route 101
   intro script no longer references the cap fanfare / `Route101_LevelCap` / `BufferLevelCap`; (b) it now
   grants `ITEM_RARE_CANDY` (Evolve Candy) via `additem`; (c) `new_game.c` no longer `AddBagItem`s the
   intro items; (d) `CB2_GiveStarter` no longer hard-codes the starter level (`, 7,`) and uses
   `GetCurrentLevelCap()`.

Acceptance criteria:
- [ ] Starter + 9 extras spawn at `GetCurrentLevelCap()`; no hard-coded intro level in `CB2_GiveStarter`.
- [ ] The intro level-cap fanfare + message are gone from `Route101_EventScript_BirchsBag`; the orphan
      `Route101_LevelCap` string is deleted; the shared `Common_EventScript_PlayLevelCapFanfare` and all
      other milestone sites are untouched.
- [ ] All 13 items are granted by Birch on Route 101, after the starter and before he leaves, with one
      coherent Birch line + one consolidated received-items message + one fanfare.
- [ ] The 13 `AddBagItem` intro grants are removed from `new_game.c` (bag starts empty via `ClearBag`).
- [ ] Regression test added; `cd randomizer && npm test` green.
- [ ] Owner playtests a build: fight Zigzagoon at cap, no "leveled up" message, Birch hands over the
      items with a coherent message, bag is otherwise empty until then.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-21** — Task created. Mapped the intro: entire handoff is `Route101_EventScript_BirchsBag`
  (the vanilla lab starter scene is dead code, reachable only via debug). Confirmed starter+extras
  created at lvl 7 in `CB2_GiveStarter`, cap 8, `EXP_CAP_HARD` (0 exp → only cap fanfares level mons),
  items added in `new_game.c:192-204`. Owner decisions: spawn at cap directly; move all 13 items to a
  Birch gift after the starter.

- **2026-07-21** — Implemented (TDD, structural regression test red→green): removed the intro cap
  fanfare + orphan `Route101_LevelCap` string; `CB2_GiveStarter` now spawns starter + 9 extras at
  `GetCurrentLevelCap()` (`#include "caps.h"`); moved all 13 items out of `new_game.c` into a Birch gift
  on Route 101 (dialogue `Route101_Text_BirchGivesGear` + consolidated `Route101_Text_ReceivedGear` +
  `MUS_OBTAIN_ITEM`). Shared fanfare + 30 other milestone sites untouched. `cd randomizer && npm test`
  green (1460 pass). Merged to `master`. Pending owner playtest of a build before close.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
