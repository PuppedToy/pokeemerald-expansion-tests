---
id: B-064
title: Teleport is forced onto fast attackers by the archetype role-move injector
status: fixed           # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-08-09
updated: 2026-08-09
found-in: 0.5.0         # version where the bug was observed
fixed-in: 0.9.0         # version that ships the fix
regression-test: randomizer/__tests__/unit/teleportSlowPivot.test.js
links: [T-261]
---

# B-064 — Teleport is forced onto fast attackers by the archetype role-move injector

## Symptom

Run `2653882998` (app 0.5.0): Wally's Lilycove team fields a Gardevoir (Bold, Trace, Shell Bell,
level 49) whose first move is **Teleport**, ahead of Mystical Fire, Calm Mind and every other TM
it could run. Teleport is a −6 priority escape: its only job is letting a slow, bulky mon eat a hit
in place of the frail teammate coming in. On a 80-speed / 135-SpA attacker it is dead weight, and a
strictly worse U-turn / Volt Switch / Flip Turn everywhere else.

Reproduced from the run's own bundle (`rateMoveForAPokemon`, that Gardevoir, two attacks already on
the set): Volt Switch 15.49, Aura Sphere 12.28, Mystical Fire 11.15, Calm Mind 7.93, **Teleport 1.93**.
The rater would never pick it — `chooseMoveset` with that trainer's real TM bag and no forced move
returns `MOONBLAST / PSYCHIC / AURA_SPHERE / FRENZY_PLANT`. Forcing only `MOVE_TELEPORT` reproduces the
run's set exactly: `TELEPORT / MOONBLAST / PSYCHIC / AURA_SPHERE`.

Mystical Fire and Calm Mind were both genuinely on the table — they are level-up moves of that
Gardevoir at level 49, needing no TM — so Teleport displaced moves the mon could actually have run.

## Root cause

Three defects stacked, in the archetype role-move path (T-107 107d):

1. `pivotUser` in `randomizer/modules/featureDetectors.js` was **the only role detector with no profile
   gate** (`canLearnAny(mon, PIVOT_MOVES)`), and `PIVOT_MOVES` contained `MOVE_TELEPORT` — so any mon
   that could learn Teleport counted as a pivot user, however fast and frail.
2. `planMemberRoleMove` in `randomizer/modules/archetypeRefine.js` returned the **first** move of the
   role's set in insertion order that passed the B-030 TM-bag gate — and for this pair nothing else
   passed it. Wally Lilycove's bag is far from empty (87 entries, ~80 distinct TM moves, Flip Turn among
   them), but Gardevoir cannot learn U-turn or Flip Turn at all, and the one real pivot it does learn —
   Volt Switch, a teachable — is not in that bag. So the loop fell through to Teleport, a level-1 move of
   the Ralts line and therefore always reachable.
3. The resolver injects that move as a **fixed** move (`resolveTrainerTeam.js`), and `chooseMoveset`
   keeps fixed moves unconditionally — so the injection bypasses the rater entirely. That is also why
   Teleport lands in slot 1.

A fourth, separate mis-modelling made the move invisible to the rater in the cases where it IS useful:
`EFFECT_TELEPORT` had no branch in `rateMove`, so it fell through to the default `return 1` for status
moves. Measured: 1.93 for that Gardevoir and 1.95 for a 30-speed Regenerator Slowbro — identical.

## Fix

T-261, three pieces — see the task for the plan and the measured dead end:

- `randomizer/rating.js` — `MOVE_TELEPORT` is finalised on the user's profile (`TELEPORT_*` constants)
  instead of the status-move default: 1 for anyone outside the profile, 5 for a slow bulky pivot
  (speed ≤ 60, HP+Def+SpD ≥ 260), 6 when the cycle heals back (Regenerator or reliable recovery). The
  recovery set was hoisted to a module-level `RELIABLE_RECOVERY_MOVES` so the combo bonus and this rule
  share one home. New `rankMovesForPokemon` exposes set-independent move ranking.
- `randomizer/modules/featureDetectors.js` — Teleport leaves `PIVOT_MOVES` for `SLOW_PIVOT_MOVES`, and
  `ROLE_MOVE_PROFILE_GATES` / `moveFitsProfile` give a conditional role move ONE gate used at both ends:
  `pivotUser` / `regeneratorPivot` for tagging, and the injector for delivering. The second half is what
  actually closes the shipped case — Gardevoir learns Volt Switch as a TM, so it is a legitimate pivot
  species, and only the delivery gate stops Teleport reaching it when that TM is not in Wally's bag.
- `randomizer/modules/archetypeRefine.js` — `planMemberRoleMove` now ranks the reachable deliverers by
  their rating on that mon and returns the best, instead of the first in set-declaration order.

Verified against the run's own bundle, using Wally Lilycove's real 80-move TM bag: Teleport 1.93 → 1.00
for that Gardevoir, and the pivot role move offered goes from `MOVE_TELEPORT` to none. A slow bulky
Teleport user (Cosmoem in that dex) keeps it at 5.00.

The regression test failed before the fix (8 of its cases, including both B-064 cases) and passes after.
