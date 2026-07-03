---
id: B-018
title: Endure protects for the entire battle instead of a single turn
status: open            # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-07-03
updated: 2026-07-03
found-in: 0.5.0         # Brooktec version where observed (expansion base 1.13.2)
fixed-in:               # set when fixed (expected 0.6.0 via T-050)
regression-test:        # will be test/battle/move_effect/endure.c — the case added by RHH #7838 (set when fixed)
links: [T-050, T-049]
---

# B-018 — Endure protects for the entire battle instead of a single turn

## Symptom

After a Pokémon uses **Endure**, its "survive on 1 HP" protection never expires: instead of lasting
only the turn it was used, the Pokémon endures every hit for the **rest of the battle** (until it
switches out or the battle ends). Reported in the current build (expansion base 1.13.2).

Expected: Endure guarantees survival only for the turn it was used, then wears off.

## Root cause

The per-turn Endure flag is set but never reset. `gDisableStructs[battler].endured` is set to `TRUE`
in [battle_script_commands.c:9584](../src/battle_script_commands.c#L9584) and is only ever cleared by
the wholesale `memset(&gDisableStructs[battler], 0, …)` on switch/battle-init
([battle_main.c:3203](../src/battle_main.c#L3203)). There is **no per-turn reset** — a grep for
`endured = FALSE` / `.endured = 0` across `src/`+`include/` finds nothing. So while the user stays on
the field, the flag stays `TRUE`.

## Fix

Upstream fixed this in **expansion 1.13.3**, PR
[#7838 "Fixes Endure lasting forever"](https://github.com/rh-hideout/pokeemerald-expansion/pull/7838)
(@AlexOn1ine), which adds the missing per-turn reset. We take it by cherry-pick under the bugfix-sync
process ([ADR-012](../docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md)) as part of **T-050**
(absorb 1.13.3 bugfixes). #7838 touches battle-engine files only (no sensitive/randomizer-parsed
files), so it is a safe pick.

Regression test: `test/battle/move_effect/endure.c` — the case added by #7838, cherry-picked
alongside the fix, run via `make check`. Per the iron rule it must FAIL on our current base and PASS
after the pick; **this bug stays `open` until that is verified**. (Not distinct from PR #7687
"Endure and Eject Pack issues" — that is a related but separate change; #7838 is the persistence fix.)

**Staged (2026-07-03):** cherry-pick `a347e47b7a` (from upstream #7838) on branch
`feature/T-050-sync-1.13.3` adds the per-turn reset `gDisableStructs[i].endured = FALSE;` to
`TurnValuesCleanUp()` in `src/battle_main.c` — precisely the missing reset above. Verification runs in
CI (`make check`), not locally (no GBA toolchain here). Stays `open` until CI confirms
FAIL-before / PASS-after.
