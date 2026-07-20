---
id: T-167
title: Move relearner charges money for previously-learned moves, free for never-learned
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-20
updated: 2026-07-20
target-version: 0.6.0
links: []
blocked-by: []
---

# T-167 — Move relearner charges money for previously-learned moves, free for never-learned

## Context

Requested feature (C game engine, not the randomizer pipeline): the move relearner should be
free the first time a Pokémon relearns a given move, and cost ¥250 every subsequent time.

"Has learned before" is defined per the user as: the initial moveset a Pokémon receives when
created/caught counts as learned, and any move auto-learned on level-up counts. So a move a mon
skipped (because it was caught above the move's level and it fell out of the initial 4-move
window) or a level-up move the player declined has NOT been learned → relearning it is free.

Design decisions (confirmed with owner):
- **Exact per-move history**: each Pokémon carries a real "moves-ever-learned" bitmask, set on
  every learn event and remapped on evolution. Accurate for evolved mons. Consumes the mon's
  remaining spare bits.
- **Relearning only via the summary screen** (START on the moves page). The Fallarbor Move
  Relearner NPC is gutted to a flavour line and does nothing (its Heart-Scale flow is removed).
- Price shown **in the relearn UI**: `¥0` green (free), `¥250` dark-gray (affordable),
  `¥250` red (can't afford). Money is charged from `gSaveBlock1Ptr->money` on confirm; an
  unaffordable move can't be selected.

## Plan

Storage: repurpose the 20 free bits in the box-mon secure block (Substruct0 unused_02/04/0A =
11, Substruct1 unused_04/06 = 8, Substruct3 unused_0B = 1) as a 20-bit mask indexed by
level-up-learnset slot (MAX_LEVEL_UP_MOVES == 20, matching the relearner's own iteration).
Exposed via a new `MON_DATA_LEARNED_MOVES_MASK` virtual field in Get/SetBoxMonData.

Hooks to set bits (find move's learnset slot for the mon's current species, set that bit):
- `GiveBoxMonInitialMoveset` (initial moveset)
- `GiveMoveToBoxMon` (empty-slot learn: level-up, relearner, TM/tutor, egg hatch)
- `SetMonMoveSlot` (chosen-slot overwrite)
- `DeleteFirstMoveAndGiveMoveToMon` / `...BoxMon` (overflow append)
- Evolution: remap mask old→new species by move id at the species-set points in evolution_scene.c

Relearner UI (move_relearner.c + menu_specialized.c):
- price = mask-bit-set ? 250 : 0; block A-press when 250 and unaffordable; charge on learn.
- draw colored price in the battle/contest move-info window (refreshes per cursor move).
- copy the mask back to the box mon in the box-mon relearner return path.

Fallarbor NPC script gutted to a flavour message.

Acceptance criteria:
- [ ] Relearning a move the mon never actually had is free (¥0, green).
- [ ] Relearning a move the mon had before (initial moveset or level-up) costs ¥250.
- [ ] Once a move is relearned, relearning it again later costs ¥250.
- [ ] ¥250 shows red and cannot be selected when the player lacks the money.
- [ ] History is preserved across box deposit/withdraw and remapped correctly on evolution.
- [ ] Fallarbor Move Relearner NPC no longer teaches; shows a flavour line only.
- [ ] Builds on CI/builder (`make`); C battle tests unaffected.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-20** — Task created. Recon complete (relearner list/cost, box-mon free space, move-learning paths, UI windows, std_menu palette has red@4/green@6). Confirmed 20 free bits == MAX_LEVEL_UP_MOVES, relearner iterates learnset by slot index. Starting implementation.
- **2026-07-20** — Implemented. Files touched:
  - `include/pokemon.h`: renamed the 6 box-mon `unused_*` bitfields (Substruct0/1/3) to `learnedMovesMaskA..F` (20 bits) and added `MON_DATA_LEARNED_MOVES_MASK` + helper prototypes.
  - `src/pokemon.c`: Get/SetBoxMonData assemble/disassemble the 20-bit mask; `GetLevelUpMoveLearnsetSlot`, `MarkBoxMonMoveAsLearned`/`MarkMonMoveAsLearned`, `WasMonMoveEverLearned`, `RemapLearnedMovesMaskForEvolution`; hooks in `GiveBoxMonInitialMoveset`, `GiveMoveToBoxMon`, `SetMonMoveSlot`, `DeleteFirstMoveAndGiveMoveTo(Box)Mon`.
  - `src/evolution_scene.c`: remap mask at the battle/trade/Shedinja species-set points.
  - `src/move_relearner.c` + `include/move_relearner.h`: `GetMoveRelearnerMoveCost`/`MoveRelearnerCanAfford` (cost 0 or 250); block A-press on unaffordable (SE_FAILURE); charge on empty-slot learn and on overwrite; persist mask on box-mon return.
  - `src/menu_specialized.c`: `MoveRelearnerDrawMovePrice` draws the colored `¥` price into the battle/contest move-info window (refreshes per cursor move).
  - `data/maps/FallarborTown_MoveRelearnersHouse/scripts.inc`: NPC gutted to a flavour line; kept the `_ChooseMon` label as a debug-only entry (referenced by `src/debug.c` "Move Reminder").
  - `CHANGELOG.brooktec.md`: [Unreleased] Added entry.
  - Cannot compile locally (no GBA toolchain — builds on CI/builder). Randomizer Jest suite not run (no `randomizer/` changes). Storage/UI decisions verified by reading engine internals; visual placement of the price label (title-row, right-aligned) is the one thing that needs an on-device look.
  - Known/accepted edge: pre-existing save mons have an all-zero mask, so their first relearn of any move reads as free until they re-learn/relevel it; gift/scripted mons created with a custom moveset also mark their auto initial moveset. Awaiting owner manual test on the builder before closing.

## Outcome

<!-- Filled when closing. -->
