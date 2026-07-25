---
id: T-208
title: QoL — show Hidden Power's IV-derived type in summary & teach-move UI
status: proposed        # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-207]
blocked-by: []
---

# T-208 — QoL: show Hidden Power's IV-derived type in summary & teach-move UI

## Context

QoL feature: when the player is about to teach Hidden Power to a Pokémon, and when Hidden Power sits in a
Pokémon's moveset, the game should compute Hidden Power's **actual type from the Pokémon's IVs** and display
that type instead of the default (Normal). C-engine work (**builder-only compile — not verifiable locally**).
Related to [T-207](T-207-hidden-power-teachable-list-inconsistency.md) (Hidden Power teachable-list fix).

### Findings from the current code — largely already gated behind a config flag
- **The IV→type helper already exists:** `GetDynamicMoveType` (`src/battle_main.c:5877`) with an
  `EFFECT_HIDDEN_POWER` case (`:5950-5981`) that computes the type from IV bits **including an out-of-battle
  path** reading `MON_DATA_*_IV`; public wrapper `CheckDynamicMoveType` (`src/pokemon.c:7218`, decl
  `include/pokemon.h:886`). Static lookup (returns Normal for HP) is `GetMoveType` (`include/move.h:195`).
- **The display sites already have the branch:** `SetMoveTypeIcons` (`src/pokemon_summary_screen.c:4312-4337`)
  uses `GetMoveType` at `:4323` but already has an `if (P_SHOW_DYNAMIC_TYPES)` branch calling
  `CheckDynamicMoveType` (`:4324-4328`); the teach/learn-move icon `SetNewMoveTypeIcon`
  (`:4352-4378`) has the same pattern (`:4357-4361`).
- **The gate:** `include/config/pokemon.h:64` `#define P_SHOW_DYNAMIC_TYPES FALSE`. Turning it **TRUE** already
  makes the summary + teach-move screens reflect Hidden Power's real IV type — but it also reflects **all**
  dynamic-type moves (Weather Ball, Judgment, Tera-style, etc.).
- The **move relearner** (`src/move_relearner.c`) renders no type sprite — nothing to change there.

### Decision to make with the owner
- **(a)** Flip `P_SHOW_DYNAMIC_TYPES` to TRUE (one line; also reflects other dynamic-type moves), or
- **(b)** Special-case **only Hidden Power** at the two display sites so no other move's type changes.

## Plan

Confirm option (a) vs (b) with the owner, apply it, and verify on a builder ROM build (summary screen + the
teach-move / TMHM learn prompt show Hidden Power's IV type; the pre-battle behaviour is unchanged).

Acceptance criteria:
- [ ] Hidden Power shows its IV-derived type in the summary move list and in the teach/learn-move prompt.
- [ ] Scope matches the chosen option (HP-only vs all dynamic types) — no unintended type changes elsewhere.
- [ ] Verified on a builder ROM build; logged in this task.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed). Found the feature is essentially pre-built: `GetDynamicMoveType` /
  `CheckDynamicMoveType` compute HP's IV type out of battle, and both display sites
  (`pokemon_summary_screen.c` `SetMoveTypeIcons` / `SetNewMoveTypeIcon`) already branch on
  `P_SHOW_DYNAMIC_TYPES` (`include/config/pokemon.h:64`, currently FALSE). Captured the flip-all vs
  Hidden-Power-only decision for the owner.

## Outcome

<!-- Filled when closing. -->
