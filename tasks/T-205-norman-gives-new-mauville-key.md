---
id: T-205
title: Norman hands over the New Mauville key on defeat (advance area state)
status: proposed        # proposed | in-progress | done | abandoned
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

### Open questions (resolve with owner before/while implementing)
- Exactly which state to set so New Mauville behaves as "key already delivered" — likely `setvar
  VAR_NEW_MAUVILLE_STATE, 1` at the door, and possibly bypass the door "insert the key" prompt. Confirm the
  desired in-world flow (does the player still carry/insert the key, or is the door pre-opened?).
- Whether to keep or remove `FLAG_GOT_BASEMENT_KEY_FROM_WATTSON` and neutralise the Wattson give at
  `MauvilleCity/scripts.inc:414-418`.

## Plan

Move the Basement Key give to Norman's defeat reward block, advance `VAR_NEW_MAUVILLE_STATE` to the
key-delivered state, and remove/neutralise the Wattson handoff. Confirm the exact door flow with the owner.
Verify on a builder compile (cannot run `make` locally).

Acceptance criteria:
- [ ] Beating Norman gives `ITEM_BASEMENT_KEY` and advances New Mauville to the key-delivered state.
- [ ] The Wattson overworld handoff no longer blocks progression (removed or made a no-op).
- [ ] New Mauville is reachable/openable without revisiting Wattson; no soft-lock or double-give.
- [ ] Verified on a builder ROM build (compile + in-game); logged in this task.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed). Mapped the current Wattson give (`MauvilleCity/scripts.inc:416`),
  the `VAR_NEW_MAUVILLE_STATE` ladder (0→1→2, door consumption `NewMauville_Entrance/scripts.inc:44-57`), and
  Norman's reward block (`PetalburgCity_Gym/scripts.inc:373-400`). Captured the door-flow open questions.

## Outcome

<!-- Filled when closing. -->
