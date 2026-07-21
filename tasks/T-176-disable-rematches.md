---
id: T-176
title: Disable all trainer rematches (regular + gym leaders) at the source
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-21
updated: 2026-07-21
target-version: 0.6.0
links: [T-173, T-174, T-175]
blocked-by: []
---

# T-176 — Disable all trainer rematches (regular + gym leaders) at the source

## Context

Last of the infinite-money faucets: rematches let the player refight trainers for prize money over and
over. The owner asked to "make the rematch timer not advance"; while implementing, the rematch system
turned out to have **three** runtime paths, so freezing the step counter alone would be incomplete. The
owner chose to close it **at the source** instead. The paths (this game's config: `FREE_MATCH_CALL =
FALSE`, VS Seeker off `I_VS_SEEKER_CHARGING = 0`):

1. **Regular trainers** — flagged ready for rematch by `SetRematchIdForTrainer` (battle_setup.c), which
   both the step-counter (walking) path (`IncrementRematchStepCounter` →
   `TryUpdateRandomTrainerRematches`) and the Match Call phone path (`UpdateRematchIfDefeated`) call.
   It is the *only* place that writes a non-zero value into `gSaveBlock1Ptr->trainerRematches[]` for
   regular trainers.
2. **Gym leaders** — flagged by `UpdateGymLeaderRematch` (gym_leader_rematch.c), a separate system
   reached after battles via `TryUpdateGymLeaderRematchFrom{Wild,Trainer}` and from battle_tower.c.
3. **VS Seeker** — its own writers in vs_seeker.c, but gated behind `I_VS_SEEKER_CHARGING`, which is 0
   here, so that path never runs. Left untouched.

## Plan

Neutralize the two active choke points; no need to touch the step counter or the Match Call path
individually once the choke points are closed:

1. `src/battle_setup.c` — `SetRematchIdForTrainer`: always store `0` (never flag a regular trainer as
   rematch-ready). Drops the level-scan loop; `table` param becomes unused (fine — build uses
   `-Wall -Werror`, not `-Wextra`, so unused params don't warn).
2. `src/gym_leader_rematch.c` — make `UpdateGymLeaderRematch` a no-op and delete the now-dead static
   helpers (`UpdateGymLeaderRematchFromArray`, `GetRematchIndex`) and rematch arrays (they would
   otherwise trip `-Wunused-function` under `-Werror`).

Acceptance criteria:
- [ ] No regular trainer ever becomes available for a rematch — neither by walking (step counter) nor
      by a Match Call phone request.
- [ ] No gym leader ever becomes available for a rematch after the E4.
- [ ] The build stays green (no unused-function/variable errors introduced).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-21** — Task created. Initially scoped to "freeze the step counter", but tracing the writers
  of `trainerRematches[]` revealed the Match Call path bypasses the counter and, separately, the gym
  leader system (`gym_leader_rematch.c`) is a third writer. Owner chose to close at the source. Verified
  `SetRematchIdForTrainer` is the sole non-zero writer for regular trainers and `UpdateGymLeaderRematch`
  the sole entry for gym leaders; VS Seeker writers are compiled but never run (`I_VS_SEEKER_CHARGING =
  0`). Overworld rematch logic isn't reachable by the battle-test harness, so this is verified by review
  + manual ROM test (no local GBA toolchain).

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
