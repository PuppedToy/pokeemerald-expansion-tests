---
id: T-205
title: Norman hands over the New Mauville key on defeat (advance area state)
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-059]
blocked-by: []
---

# T-205 — Norman hands over the New Mauville key on defeat (advance area state)

## Context

Today the player must go back and talk to the overworld **Wattson** NPC to receive the New Mauville
**Basement Key**, which is a detour. Instead, **Norman** should hand over the key **on defeat**, and the New
Mauville area state should advance to the "key already delivered" state at that moment. This is C map-script
work (**builder-only compile — not verifiable locally**, see memory note "No GBA toolchain here"). Interacts
with [T-059](T-059-wattson-ability-patch-reward.md) (Wattson's post-New-Mauville reward chain).

### Findings from the current code
- **Current Wattson give (overworld NPC, not the gym):** `data/maps/MauvilleCity/scripts.inc:409-421`
  (`MauvilleCity_EventScript_Wattson`) — `giveitem ITEM_BASEMENT_KEY` at `:416`, gated by
  `goto_if_set FLAG_GOT_BASEMENT_KEY_FROM_WATTSON` (`:414`), flag set at `:418`. The give itself does **not**
  advance `VAR_NEW_MAUVILLE_STATE`.
- **New Mauville progression var:** `VAR_NEW_MAUVILLE_STATE` — `0` door closed → `1` "key delivered/inserted"
  (set at `data/maps/NewMauville_Entrance/scripts.inc:57` when the key is **used** at the door,
  consumption logic `:44-57`) → `2` generator solved (`NewMauville_Inside/scripts.inc:147`).
- **Norman post-battle hook:** `data/maps/PetalburgCity_Gym/scripts.inc:370-401`
  (`PetalburgCity_Gym_EventScript_NormanBattle`) — battle at `:372`, reward block `:373-400` (badge,
  level-cap fanfare, reward mon, HM03, TM31…). This is where to add the key give + advance the state.

### Resolved during implementation
- **Which state:** `VAR_NEW_MAUVILLE_STATE = 1` (door pre-opened). Confirmed safe by the entrance map data:
  the locked-door trigger is a coord event at `(4,2)` gated `var_value: 0` (fires only at state 0), and there
  is a warp at `(4,1)` into `MAP_NEW_MAUVILLE_INSIDE`. At state 1 the trigger is disabled, `OnLoad` doesn't
  close the door (map default metatiles are open), so the player walks straight in — no "insert the key" prompt.
- **Wattson give:** left in place, but it is now **provably unreachable**. The overworld Wattson NPC is hidden
  until Norman is beaten (`PetalburgCity_Gym/scripts.inc:386` `clearflag FLAG_HIDE_MAUVILLE_CITY_WATTSON`), and
  Norman now sets `FLAG_GOT_BASEMENT_KEY_FROM_WATTSON`, so when Wattson first becomes talk-able his
  `goto_if_set FLAG_GOT_BASEMENT_KEY_FROM_WATTSON` (`MauvilleCity/scripts.inc:414`) always routes to
  `BegunNewMauville` — his key-give branch (`:415-418`) can never run. No Wattson edit needed (minimal risk).
- **T-059 preserved:** the Ability-Patch reward lives in the `VAR_NEW_MAUVILLE_STATE == 2` Wattson branch
  (`MauvilleCity/scripts.inc:413,428-435`), untouched.

## Plan

Move the Basement Key give to Norman's defeat reward block, advance `VAR_NEW_MAUVILLE_STATE` to the
key-delivered state, and remove/neutralise the Wattson handoff. Confirm the exact door flow with the owner.
Verify on a builder compile (cannot run `make` locally).

Acceptance criteria:
- [x] Beating Norman gives `ITEM_BASEMENT_KEY` and advances New Mauville to the key-delivered state
      (`VAR_NEW_MAUVILLE_STATE = 1`). *(3 lines added to Norman's reward block.)*
- [x] The Wattson overworld handoff no longer gives the key (its give branch is provably unreachable — flag set
      by Norman before Wattson is ever talk-able).
- [x] New Mauville is reachable without revisiting Wattson and without a double-give (door pre-opened; give
      branch dead). *(design-verified against the map data; in-game confirmation pending the builder.)*
- [ ] Verified on a builder ROM build (compile + in-game); logged in this task. **Builder-only — cannot compile
      locally (no GBA toolchain).**

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed). Mapped the current Wattson give (`MauvilleCity/scripts.inc:416`),
  the `VAR_NEW_MAUVILLE_STATE` ladder (0→1→2, door consumption `NewMauville_Entrance/scripts.inc:44-57`), and
  Norman's reward block (`PetalburgCity_Gym/scripts.inc:373-400`). Captured the door-flow open questions.
- **2026-07-25** — **Implemented (in-progress).** Key realisation from the scripts: the overworld Wattson who
  gives the key is **hidden until Norman is beaten** (`PetalburgCity_Gym/scripts.inc:386`), so the key was
  already a post-Norman errand — the owner just wants to skip the Mauville trip. Also read
  `NewMauville_Entrance/map.json`: the locked-door prompt is a `var_value: 0` coord trigger at `(4,2)` and
  there's a warp at `(4,1)`, so `VAR_NEW_MAUVILLE_STATE = 1` cleanly pre-opens the door (see Resolved above).
  Added 3 lines to Norman's reward block (`PetalburgCity_Gym/scripts.inc:401-403`): `giveitem
  ITEM_BASEMENT_KEY`, `setflag FLAG_GOT_BASEMENT_KEY_FROM_WATTSON`, `setvar VAR_NEW_MAUVILLE_STATE, 1`. Wattson
  script left untouched (give branch now unreachable); T-059's state-2 Ability-Patch branch preserved. **No
  local test possible (decomp map script — builder-only compile).** Needs an in-game builder verification of the
  full loop: beat Norman → receive Basement Key → New Mauville door already open → enter → generator → state 2 →
  Wattson gives the Ability Patch.

## Outcome

<!-- Filled when closing. -->
