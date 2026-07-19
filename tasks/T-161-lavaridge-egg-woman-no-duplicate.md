---
id: T-161
title: Stop the Lavaridge egg woman gifting a duplicate egg
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-19
updated: 2026-07-19
target-version: 0.0.1
links: []
blocked-by: []
---

# T-161 — Stop the Lavaridge egg woman gifting a duplicate egg

## Context

In Lavaridge Town (Flannery's gym town) the old woman
(`LavaridgeTown_EventScript_EggWoman`) gifts a `SPECIES_WYNAUT` egg. In this
randomizer the town gym leader already hands out a gym-reward Pokémon
(`givemon GYM_REWARD_MON, 36` in `data/maps/LavaridgeTown_Gym_1F/scripts.inc`),
so the egg is a redundant/duplicate encounter. The owner wants the woman to keep
her egg-flavoured dialogue but give nothing.

## Plan

Rewrite `LavaridgeTown_EventScript_EggWoman` in
`data/maps/LavaridgeTown/scripts.inc` so it is a plain talking NPC: an egg-themed
line, no `giveegg`, no yes/no prompt, no party-size check, no
`FLAG_RECEIVED_LAVARIDGE_EGG`. Remove the now-dead sub-scripts and their unused
text labels. The object event in `map.json` keeps pointing at the same label.

Acceptance criteria:
- [ ] The Lavaridge egg woman gives no egg and shows only dialogue.
- [ ] Her line still references eggs (flavour preserved).
- [ ] No dangling references to the removed egg sub-scripts/texts.
- [ ] `data/maps/LavaridgeTown_Gym_1F` (Flannery's reward) is untouched.
- [ ] Owner manually verifies in-game (no local GBA toolchain; build is CI-only).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-19** — Task created. Confirmed `LavaridgeTown/scripts.inc` and
  `map.json` are tracked source and that `randomizer/writer.js` mutates only
  `LavaridgeTown_Gym_1F/scripts.inc` (not the town map), so editing the egg
  woman is safe from runtime rewriting. `FLAG_RECEIVED_LAVARIDGE_EGG` is used
  nowhere except this script + its definition in `include/constants/flags.h`.
- **2026-07-19** — Implemented. `LavaridgeTown_EventScript_EggWoman` is now a
  plain `MSGBOX_NPC` talker with a new egg-themed line
  (`LavaridgeTown_Text_UsedToHatchEggsInHotSand`). Removed the yes/no branch,
  party-size check, fanfare, `giveegg SPECIES_WYNAUT`, the
  `FLAG_RECEIVED_LAVARIDGE_EGG` set, the three dead sub-scripts and their six
  now-unused text blocks. Grep confirms no dangling references; `map.json`
  object event still resolves to the same label. Changelog line added under
  `[Unreleased] → Changed`. Can't compile locally (no GBA toolchain) — awaiting
  owner in-game test.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
