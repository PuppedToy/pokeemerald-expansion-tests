---
id: T-105
title: Engine — sophistication scalar driven by boss progression
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
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
- [ ] A pure, tested `sophistication(trainer)` in [0,1] increasing along boss progression.
- [ ] Wired into the shared resolver as a weight (consumed later by T-107).
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
