---
id: T-105
title: Engine — sophistication scalar driven by boss progression
status: in-progress
type: feature
created: 2026-07-09
updated: 2026-07-10
target-version: 0.8.0
links: [T-083, T-103, T-104]
blocked-by: [T-104]
---

# T-105 — Engine — sophistication scalar driven by boss progression

## Context

Per ADR-016, teams should feel like "a pile of mons" early and "a well-built archetype team" late.
This task introduces the sophistication scalar and its progression, independent of the archetype
matching itself (which lands in T-107). `bossCaps.js` already maps bosses to a progression order we
can key off.

## Plan

- Define a sophistication value in [0,1] per trainer, rising with the number of bosses defeated by the
  point that trainer appears (endgame ≈ 1, first routes ≈ low).
- Expose it to the resolver as the "try-harder" knob that later stages (T-107) use to weight
  archetype-fit vs. randomness.
- Keep it deterministic and unit-testable in isolation (a pure function of trainer progression
  position + config).
- Tests: monotonic non-decreasing along the boss order; endpoints near the intended bounds.

Acceptance criteria:
- [x] A pure, tested `sophistication(trainer)` in [0,1] increasing along boss progression.
- [x] Wired into the shared resolver as a weight (consumed later by T-107).
- [x] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-10** — Built `randomizer/modules/sophistication.js`: pure
  `createSophisticationScale(bossCaps, config) -> sophistication(trainer)` in `[floor,ceil]`. The
  progression signal is the trainer's **level** positioned in the boss level-cap range (`bossCaps`,
  SSOT `src/caps.c`) — cap levels rise monotonically along boss order, so the scalar is monotonic
  non-decreasing along the progression by construction, and it places *every* trainer (boss or not)
  by the one signal all trainers carry (level). Config: `floor`/`ceil` bounds + `gamma` easing;
  degenerate/empty caps → neutral (1); invalid level → low end. TDD: wrote the spec test against a
  deliberately-wrong stub (assertion-level Red), then implemented to green — 10 tests
  (`__tests__/unit/sophistication.test.js`): endpoints, monotonicity (both along caps and across all
  levels), `[0,1]` clamping, config bounds, gamma easing, degenerate/invalid inputs, + the resolver
  seam. **Wiring:** `createTeamResolver` takes an optional `sophistication` dep (defaults to neutral
  `() => 1`), computes it once per trainer onto `context.sophistication` (where the T-107 stages will
  read it), and exposes `sophisticationFor`. **Output-neutral:** the weight is not yet applied to
  selection, so full suite (854 pass) + the `RUN_DETERMINISM=1` cross-ROM gate stay green (teams
  byte-identical). The live caps.c-sourced scale is threaded from the callers in T-107, when it is
  first consumed. **Provisional (design tuning, not a meta claim):** the default curve params
  (`floor=0, ceil=1, gamma=1`, linear) are a starting shape to tune during T-107 integration; they
  are not a Pokémon-meta conclusion, so no owner meta-validation gate applies. Kept `in-progress` —
  closes with the 2C batch manual test.

## Outcome

<!-- Filled when closing. -->
