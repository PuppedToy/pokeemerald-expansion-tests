---
id: T-178
title: Caught Pokemon are fully healed (HP, PP, status) into party or PC
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-21
updated: 2026-07-21
target-version: 0.6.0
links: []
blocked-by: []
---

# T-178 — Caught Pokemon are fully healed (HP, PP, status) into party or PC

## Context

Catching a wild Pokemon that carries a status condition (e.g. paralysis) leaves it statused after
capture — most visibly when it is sent to the PC, where it stays paralyzed.

Root cause: in this expansion build `SetMonData(mon, MON_DATA_STATUS, ...)` mirrors the status into
`mon->box` (`src/pokemon.c` `MON_DATA_STATUS` case), so **boxed mons persist their status**. On
capture, `GiveMonToPlayer` (`src/pokemon.c`) runs a Brooktec block commented *"Level up to cap and
fully heal before adding to party/PC"* — but it only restores **HP**, never status or PP. The
paralysis therefore rides along into the PC (and the party) unchanged.

Owner request: on capture, do a **full heal of HP, PP and status**, independent of whether the mon
lands in the party or the PC.

## Plan

`GiveMonToPlayer` is the single choke point both the party branch (`CopyMon` into `gPlayerParty`) and
the PC branch (`CopyMonToPC`) pass through. Its existing heal block already levels the mon to the cap
and sets HP to max; complete it to a real full heal by calling the existing `HealPokemon(mon)` helper
(HP → max, status → `STATUS1_NONE`, `MonRestorePP`). Because `SetMonData` mirrors HP/status into the
box, this cleans both party and PC destinations from one place.

Acceptance criteria:
- [ ] A caught paralyzed wild mon that goes to the **party** has no status condition.
- [ ] A caught paralyzed wild mon that goes to the **PC** (party full) has no status condition.
- [ ] HP is full and PP is restored on the caught mon in both cases (unchanged for HP; PP now restored
      for the party path too).
- [ ] Regression test in `test/battle/item_effect/throw_ball.c` covering both destinations.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-21** — Task created. Traced the catch flow: `Cmd_givecaughtmon`
  (`src/battle_script_commands.c`) → `GiveMonToPlayer` (`src/pokemon.c:3355`). Confirmed the box-status
  mirror at `src/pokemon.c:2941` is why PC mons keep status. Chose to fix at the shared `GiveMonToPlayer`
  heal block (replace the HP-only heal with `HealPokemon(mon)`) rather than duplicate heal logic in the
  catch-specific command, keeping a single home for "fully heal on give".
- **2026-07-21** — Implemented. `src/pokemon.c` `GiveMonToPlayer`: the existing HP-only heal block is
  replaced with `HealPokemon(mon)` (HP → max, status → `STATUS1_NONE`, `MonRestorePP`) after
  `CalculateMonStats`. Because `SetMonData` mirrors HP/status into `mon->box`, this heals both the
  party copy and the PC (box) copy from one place. Regression tests added to
  `test/battle/item_effect/throw_ball.c`: catch a paralyzed HP(1) Caterpie with an Ultra Ball and assert
  `STATUS1_NONE` on the caught mon — one test for the party path (`gPlayerParty[1]`) and one for the PC
  path (party full → box, `B_CATCH_SWAP_INTO_PARTY == FALSE` so no swap prompt). No local GBA toolchain,
  so `make check` runs in CI / the builder; not runnable here. Awaiting owner manual ROM test before
  closing.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
