---
id: T-261
title: Value Teleport as a slow pivot and stop the role injector forcing dead-weight moves
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-08-09
updated: 2026-08-09
target-version: 0.9.0
links: [B-064]
blocked-by: []
---

# T-261 — Value Teleport as a slow pivot and stop the role injector forcing dead-weight moves

## Context

B-064: Wally's Gardevoir came out of run `2653882998` with Teleport in slot 1. The move is not chosen
by the rater — it is injected as a fixed archetype role move, which bypasses move rating entirely.
Owner's model of the move, which this task encodes: Teleport is a **very inferior U-turn / Volt Switch /
Flip Turn**, useless on fast attackers, and worth a slot only on a **slow, bulky pivot** — most of all
one that heals the pivot cycle back (Regenerator or reliable recovery). Baton Pass is explicitly NOT in
the same category: it passes setup, a different and strong job, and stays a first-class pivot move.

## Plan

Three pieces (owner-approved thresholds: speed ≤ 60, bulk HP+Def+SpD ≥ 260, value 5 → 6 with
Regenerator / reliable recovery):

- **A — contextual value** (`randomizer/rating.js`): `MOVE_TELEPORT` gets a profile-aware rating in
  `rateMoveForAPokemon` instead of the status-move default of 1. Non-slow-bulky mons get a floor value;
  slow+bulky mons get real value, more with Regenerator or reliable recovery. Always below the damaging
  pivots, which keep winning the slot whenever they are available.
- **B — role gate** (`randomizer/modules/featureDetectors.js`): Teleport leaves `PIVOT_MOVES` for a new
  `SLOW_PIVOT_MOVES`, and `pivotUser` / `regeneratorPivot` only count it for a mon that passes the
  slow+bulky profile. Baton Pass stays in `PIVOT_MOVES`.
- **C — best deliverer, not the first one** (`randomizer/modules/archetypeRefine.js`): `planMemberRoleMove`
  ranks the role's learnable candidates by their rating on that mon and returns the best, instead of the
  first in set insertion order (which is what made it fall through to Teleport once the good pivots
  failed the TM-bag gate).

Acceptance criteria:
- [x] Teleport rates near-zero for a fast/frail attacker and ~5–6 for a slow, bulky pivot (6 with
      Regenerator or reliable recovery), and never above U-turn / Volt Switch / Flip Turn on the same mon.
- [x] A fast attacker that can learn Teleport is NOT detected as `pivotUser`; a slow bulky one still is.
- [x] `planMemberRoleMove` returns the best-rated reachable deliverer for a role, not the first listed.
- [x] Regression test for B-064: the run's Gardevoir is not offered Teleport as its pivot role move.
- [x] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-09** — Task created from B-064. Diagnosis reproduced from the run bundle: the rater scores
  Teleport 1.93 for that Gardevoir (vs Volt Switch 15.49 / Aura Sphere 12.28 / Mystical Fire 11.15), and
  forcing only `MOVE_TELEPORT` into `chooseMoveset` reproduces the shipped set exactly.
- **2026-08-09** — Dead end (measured, then dropped): piece C was first planned as a **rating floor** —
  refuse to inject a role move worth less than an absolute value (2.5) and less than 30% of the move it
  displaces. Measured dex-wide against the run's data, that guard rejects legitimate injections wholesale
  because the injector runs *before* the set exists, so any value computed there is context-blind:
  Follow Me 14/14, Quick Guard 43/43 and Nasty Plot 74/74 (no special attack on the set yet), Aurora Veil
  225/233 (no snow in the synthetic context), Rapid Spin 27/45. Replaced with **ranking** — pick the best
  deliverer instead of rejecting — which cannot leave a role undelivered and has no such blast radius.
- **2026-08-09** — Note for later: in this run's dex only Cosmoem passes the slow+bulky gate among the 23
  species that learn Teleport (the Abra / Ralts / Natu / Deoxys / Claydol / Elgyem lines are all too fast
  or too frail). Piece A therefore mostly matters for runs where learnset mutation hands Teleport to a
  bulky slow mon — which is exactly the case it should cover.

- **2026-08-09** — Owner's clarification, encoded: Baton Pass is NOT a Teleport-like. It passes setup and
  stays in `PIVOT_MOVES`, qualifying any profile; only Teleport moved to `SLOW_PIVOT_MOVES`.
- **2026-08-09** — Pieces A/B/C implemented; 18 tests in
  `randomizer/__tests__/unit/teleportSlowPivot.test.js` (8 of them red before the fix), full suite green
  (2250 passed). First implementation of B gated only the DETECTOR, and re-running the real run's data
  showed the bug still reproduced: Gardevoir learns U-turn / Volt Switch / Flip Turn as TMs, so it stays a
  legitimate `pivotUser` species, and with Wally's empty pivot-TM bag the injector still fell to Teleport
  as the last reachable candidate. Fixed by giving a conditional role move ONE gate
  (`ROLE_MOVE_PROFILE_GATES` / `moveFitsProfile`) applied at BOTH ends — tagging and delivery — with a
  second regression case covering exactly that shape.
- **2026-08-09** — Verified against the run bundle: Teleport 1.93 → 1.00 on that Gardevoir, role move
  offered `MOVE_TELEPORT` → none, Cosmoem (slow + bulky) keeps it at 5.00. Awaiting the owner's manual test.

## Outcome

<!-- Filled when closing. -->
