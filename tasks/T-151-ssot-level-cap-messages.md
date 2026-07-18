---
id: T-151
title: Level-cap fanfare messages read the cap from the SSOT (caps.c) instead of hard-coded numbers
status: in-progress
type: fix
created: 2026-07-18
updated: 2026-07-18
target-version: 0.9.0
links: [src/caps.c, data/specials.inc, T-148, T-149]
blocked-by: []
---

# T-151 — SSOT level-cap fanfare messages

## Context

~30 on-screen "Your Pokémon have leveled up to N!" fanfare messages across `data/maps/**/scripts.inc`
hard-code the level N. T-148 (removed the Maxie Mt Chimney cap) and T-149 (+1 shift rival→Tabitha)
desynced them. Owner wants them fixed and, preferably, sourced directly from the cap SSOT (caps.c).

Finding (owner-relevant): the number a message *should* show is exactly `GetCurrentLevelCap()` at that
moment — because the very next thing each site does is `call Common_EventScript_PlayLevelCapFanfare`,
which runs `special LevelUpAllPokemonToCap` → levels the party to `GetCurrentLevelCap()`. The message is
shown immediately before, with **no setflag in between**, so buffering `GetCurrentLevelCap()` into a
string var and printing `{STR_VAR_1}` makes the message equal to what the party actually reached — for
any cap configuration, forever. This also auto-corrects Tabitha (now 36, the next milestone) and the +1.

## Plan

1. `src/caps.c` — add `void BufferLevelCap(void)` that writes `GetCurrentLevelCap()` into `gStringVar1`
   (`ConvertIntToDecimalStringN`, LEFT_ALIGN). Register `def_special BufferLevelCap` in `data/specials.inc`.
2. For every level-cap message site (`message <X>` → `waitmessage` → `call …PlayLevelCapFanfare`):
   - replace the hard-coded number in its `.string` with `{STR_VAR_1}`,
   - insert `special BufferLevelCap` immediately before the `message` line.
   Flow-preserving (no shared-script restructure). The Lilycove post-Wally `msgbox` fanfare (no cap
   message, levels silently) is intentionally NOT matched and left untouched.
3. Regression guard (JS): a test asserting no `leveled up to <digit>` literal remains in `data/maps`.

Acceptance criteria:
- [ ] `BufferLevelCap` special added + registered.
- [ ] No hard-coded "leveled up to <number>" remains; every cap message uses `{STR_VAR_1}` and has a
      `special BufferLevelCap` before it.
- [ ] Guard test added; `cd randomizer && npm test` green.
- [ ] Owner playtests a build: each milestone shows the correct, cap-matching number.

## Progress log

- **2026-07-18** — Task created. Verified the mechanic: message → waitmessage → PlayLevelCapFanfare
  (LevelUpAllPokemonToCap → GetCurrentLevelCap), no setflag between message and fanfare, so a buffered
  GetCurrentLevelCap equals the party's new level. 31 files carry a cap fanfare; pattern uniform except
  LilycoveCity's post-Wally silent level-up (msgbox, excluded by design).

## Outcome

<!-- Filled when closing. -->
