---
id: T-173
title: Remove the overworld version of Pickup; rescope its description to the battle effect
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-21
updated: 2026-07-21
target-version: 0.6.0
links: []
blocked-by: []
---

# T-173 — Remove the overworld version of Pickup; rescope its description to the battle effect

## Context

The Pickup ability has two independent behaviours in the decomp:

1. **In battle** (`src/battle_util.c`, `ABILITYEFFECT_ENDTURN`, `case ABILITY_PICKUP`): at end of
   turn, a holder with no item may pick up an item another Pokémon used/consumed that turn. This is
   the interesting, skill-relevant effect and is fully covered by `test/battle/ability/pickup.c`.
2. **Out of battle** (`Cmd_pickup` in `src/battle_script_commands.c`, run by
   `BattleScript_PayDayMoneyAndPickUpItems` / `BattleScript_TryPickUpItems`): after most battles, any
   party member with Pickup and no held item has a 1-in-10 chance to be handed a random item from
   `sPickupTable` (or a Battle Pyramid item). This is a free item faucet — an infinite-money source we
   do not want in this romhack.

We keep behaviour (1) and remove behaviour (2). The in-game ability description
(`src/data/abilities.h`, `"May pick up items."`) currently implies the overworld version, so it is
rewritten to describe only the battle effect.

## Plan

1. Rewrite the Pickup description to describe only the in-battle effect, matching the terse style of
   neighbouring abilities (e.g. Harvest = `"May recycle a used Berry."`). Chosen wording:
   `"Picks up items foes have used."` (30 chars; longest existing description is 31, no length assert).
2. Delete the `ABILITY_PICKUP` branch inside `Cmd_pickup` (both the `sPickupTable` overworld path and
   the Battle Pyramid path), keeping the Honey Gather and Shuckle→Berry Juice branches intact.
3. Delete the now-unused `sPickupTable` (and its `#define _`/`#undef _` scaffolding) and the
   `struct PickupItem` definition in `include/battle_script_commands.h`, plus the now-dead loop var `j`
   and `isInPyramid` local.

Acceptance criteria:
- [ ] Pickup's in-game description reads `"Picks up items foes have used."`.
- [ ] Pickup no longer grants any party member an item out of battle (normal battles or Battle Pyramid).
- [ ] Honey Gather and the Shuckle→Berry Juice mechanic still work (the `pickup` command still runs).
- [ ] The in-battle Pickup effect and its tests (`test/battle/ability/pickup.c`) are untouched.
- [ ] Build is green in CI (`make check`), no unused-variable/unused-const errors introduced.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-21** — Task created. Mapped the two Pickup behaviours; confirmed `sPickupTable` and
  `struct PickupItem` are used only by the overworld branch of `Cmd_pickup`, and that the battle-test
  suite exercises only the in-battle effect (so removing the overworld path breaks no tests).
  `GetBattlePyramidPickupItemId` becomes unreferenced but is a public (external-linkage) function, so
  it triggers no unused warning; left in place to avoid a cascade of Battle-Pyramid-subsystem removals
  (`sPickupPercentages`, etc.) that are out of scope for this task.
- **2026-07-21** — Implemented. (1) `src/data/abilities.h`: Pickup description →
  `"Picks up items foes have used."`. (2) `src/battle_script_commands.c`: deleted the `ABILITY_PICKUP`
  branch of `Cmd_pickup` (overworld table + pyramid paths), removed the now-unused `sPickupTable`,
  `#define _`/`#undef _` scaffolding and the `j`/`isInPyramid` locals; kept Honey Gather + Shuckle.
  (3) `include/battle_script_commands.h`: removed the now-orphaned `struct PickupItem`. Verified no
  dangling references remain and the in-battle Pickup path (`src/battle_util.c`) and its tests
  (`test/battle/ability/pickup.c`) are untouched. No GBA toolchain locally — `make check` will verify
  the build in CI. Awaiting a ROM build + manual confirmation before closing.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
