---
id: T-161
title: Stop the Lavaridge egg woman gifting a duplicate egg
status: done            # proposed | in-progress | done | abandoned
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
- [x] The Lavaridge egg woman gives no egg and shows only dialogue.
- [x] Her line still references eggs (flavour preserved).
- [x] No dangling references to the removed egg sub-scripts/texts.
- [x] `data/maps/LavaridgeTown_Gym_1F` (Flannery's reward) is untouched.
- [ ] Owner manually verifies in-game — delegated to owner/CI; no local GBA
  toolchain here. Closed on the owner's explicit go-ahead (see Outcome).

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
- **2026-07-19** — Owner trimmed the dialogue to a single sentence
  (`"In my younger days, I'd hatch POKéMON EGGS by burying them in the hot sand
  here by the hot springs."`); amended the fix commit. Merged into `master`
  (`--no-ff`). Owner then gave the explicit go-ahead to close.

## Outcome

Shipped: `LavaridgeTown_EventScript_EggWoman` is now a plain `MSGBOX_NPC` talker.
It no longer gifts a `SPECIES_WYNAUT` egg (the town gym leader already hands out
a gym-reward Pokémon, so the egg was a duplicate encounter). Removed the yes/no
prompt, party-size check, fanfare, `giveegg`, the `FLAG_RECEIVED_LAVARIDGE_EGG`
set, three dead sub-scripts and six now-unused text blocks; added one egg-themed
line (`LavaridgeTown_Text_UsedToHatchEggsInHotSand`).

Deviation from plan: dialogue trimmed to a single sentence at the owner's
request (originally three sentences).

Verification: randomizer Jest suite green (map-script change, not covered by it);
grep confirms no dangling references; `LavaridgeTown_Gym_1F` untouched. No local
GBA build available, so in-game verification is delegated to the owner/CI —
this task was closed on the owner's explicit instruction, not on a local in-game
check.

Follow-ups: none.
