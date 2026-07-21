---
id: T-174
title: Make Honey Gather a battle-only clone of Pickup; drop its overworld item find
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-21
updated: 2026-07-21
target-version: 0.6.0
links: [T-173]
blocked-by: []
---

# T-174 — Make Honey Gather a battle-only clone of Pickup; drop its overworld item find

## Context

Follow-up to [T-173](T-173-remove-overworld-pickup.md), which removed Pickup's out-of-battle item
find. Honey Gather is the same class of out-of-battle faucet (it lives in the very same `Cmd_pickup`
branch that T-173 trimmed): after each battle a holder with no item had a level-scaling chance to be
handed a `ITEM_HONEY` (sellable → a second infinite-money source), and it had **no** in-battle effect
at all, so it was a dead ability in combat.

Decision (owner): make Honey Gather do **exactly** what Pickup now does in battle (pick up an item a
foe used up during the turn) and share Pickup's description, and remove its out-of-battle Honey find.

## Plan

Alias Honey Gather onto Pickup's in-battle end-turn effect at the three sites that gate it on the
ability, and delete the out-of-battle branch:

1. `src/data/abilities.h` — Honey Gather description → `"Picks up items foes have used."` (identical to
   Pickup), and `aiRating` 0 → 1 (match Pickup, since the effect is now identical).
2. `src/battle_end_turn.c` — add `case ABILITY_HONEY_GATHER:` to the `THIRD_EVENT_BLOCK_ABILITIES`
   dispatcher group that calls `AbilityBattleEffects(ABILITYEFFECT_ENDTURN, …)`.
3. `src/battle_util.c` — add `case ABILITY_HONEY_GATHER:` as a fall-through to `case ABILITY_PICKUP:` in
   the `ABILITYEFFECT_ENDTURN` switch (same body: `PickupHasValidTarget` → `RandomUniformExcept` →
   `BattleScript_PickupActivates`).
4. `src/battle_script_commands.c` — in `Cmd_tryrecycleitem`, extend the `gCurrentMove == MOVE_NONE &&
   ability == ABILITY_PICKUP` guard to also accept `ABILITY_HONEY_GATHER` (so the picked-up item is the
   target's used item, not the holder's own). Remove the Honey Gather branch from `Cmd_pickup` and the
   now-unused `ability`/`lvlDivBy10` locals; only Shuckle→Berry Juice remains out of battle.
5. `test/battle/ability/honey_gather.c` — replace the TODO stub with tests mirroring the core Pickup
   tests, using `SPECIES_COMBEE` (canonical Honey Gather holder).

Acceptance criteria:
- [ ] Honey Gather's in-game description reads `"Picks up items foes have used."` (identical to Pickup).
- [ ] In battle, Honey Gather triggers the same end-turn pickup as Pickup (popup + "found one …!" +
      the foe's used item transfers to the holder), including the wild-Gen9 self-pickup path.
- [ ] Honey Gather no longer hands out Honey (or anything) out of battle.
- [ ] Pickup itself is unchanged; Shuckle→Berry Juice still works.
- [ ] `test/battle/ability/honey_gather.c` covers the new behavior; suite green in CI (`make check`).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-21** — Task created. Mapped the three ability-gated sites of Pickup's in-battle effect
  (`battle_end_turn.c` dispatcher, `battle_util.c` end-turn switch, `Cmd_tryrecycleitem` target/self
  guard); the shared `canPickupItem`/`CantPickupItem`/`PickupHasValidTarget` machinery is ability-
  agnostic, so aliasing the three gates is enough for an exact clone. Confirmed no AI/other special-
  casing of `ABILITY_HONEY_GATHER` beyond `Cmd_pickup`. Also confirmed (for the owner's money question)
  that Pickup + Honey Gather were the only post-battle item faucets; the remaining item abilities
  (Pickpocket, Magician, Ball Fetch, Harvest, Cud Chew, Symbiosis) move/recover existing items rather
  than mint them.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
