---
id: T-148
title: Remove Maxie Mt Chimney as a level-cap boss (keep story flag)
status: in-progress
type: feature
created: 2026-07-18
updated: 2026-07-18
target-version: 0.9.0
links: [src/caps.c, randomizer/bossCaps.js, data/maps/MtChimney/scripts.inc]
blocked-by: []
---

# T-148 — Remove Maxie Mt Chimney as a level-cap boss (keep story flag)

## Context

The Maxie confrontation at Mt Chimney currently doubles as a "major boss" level-cap
checkpoint (`FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY` → level 33 in
[src/caps.c](../src/caps.c)). We want to drop that checkpoint: no Maxie battle and no
cap upgrade at Mt Chimney. The character stays in the game; interacting with him should
still trigger the existing Archie cutscene so the story keeps flowing.

Key finding: `FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY` is **not only a cap flag** — it gates
~15 downstream story events (Fallarbor expert, Cozmo's house, object visibility on Routes
110/117/118, match calls, pokenav, the Mt Chimney meteorite machine). Owner decision
(2026-07-18): keep the script's `setflag` so the flag becomes a **story-only** flag, and
remove it **only** from the cap files. The cutscene stays as-is minus the battle and the
cap fanfare (Team Magma vanishes, Archie approaches, thanks the player, gives the Good
Rod, sets the story flags).

## Plan

Remove the Maxie/Mt Chimney entry from the two cap SSOTs and strip the battle + cap
fanfare from the map script while preserving the story flag and the Archie cutscene.

1. `src/caps.c` — drop `{FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY, 33}` from `sLevelCapFlagMap`.
2. `randomizer/bossCaps.js` — drop the matching `FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY`
   entry from `BOSS_CAP_TRAINERS` (its `buildBossCaps` asserts a strict 1-to-1 relation
   with caps.c, so both must move together). `frontend/data/bosscaps.json` (the in-app
   "trainer documentation" / Mail feature) regenerates from this via `build.js`.
3. `data/maps/MtChimney/scripts.inc` `MtChimney_EventScript_Maxie` — remove the
   `trainerbattle_no_intro` line and the cap block (`message MtChimney_LevelCap_Major` /
   `waitmessage` / `call Common_EventScript_PlayLevelCapFanfare`). Keep
   `setflag FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY` and the whole Archie cutscene. Delete the
   now-orphaned `MtChimney_LevelCap_Major` string.
4. TDD (randomizer): regression test asserting Maxie/Mt Chimney is no longer a level-cap
   boss (absent from parsed caps.c and from `BOSS_CAP_TRAINERS`).

Acceptance criteria:
- [ ] `FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY` is absent from `sLevelCapFlagMap` in `src/caps.c`.
- [ ] `FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY` / `TRAINER_MAXIE_MT_CHIMNEY` are absent from
      `BOSS_CAP_TRAINERS`; `buildBossCaps` still passes its 1-to-1 assertion.
- [ ] `MtChimney_EventScript_Maxie` no longer starts a battle nor plays the cap fanfare,
      but still `setflag FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY` and runs the Archie cutscene.
- [ ] Regression test added; `cd randomizer && npm test` green.
- [ ] Owner manual-tests a build: talking to Maxie triggers Archie + story continuation,
      no battle, no level jump; downstream story gates still work.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-18** — Task created. Investigated the flag's footprint (grep): used in caps.c,
  bossCaps.js, the MtChimney script (`setflag` + meteorite machine gate), and ~13 story
  gates (Fallarbor, Cozmo, Routes 110/117/118 map.json, match_call.c,
  pokenav_match_call_data.c). Confirmed `randomizer/bossCaps.js` is the "other caps file"
  (strict 1-to-1 assertion with caps.c) and `frontend/data/bosscaps.json` is the derived,
  gitignored in-app trainer doc. Owner confirmed: keep the `setflag` (story-only flag),
  remove only from cap files, keep the cutscene minus battle/cap fanfare.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned. -->
