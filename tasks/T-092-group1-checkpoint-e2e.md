---
id: T-092
title: Group 1 checkpoint — end-to-end ROM builds + manual test in every battle-format mode
status: proposed
type: chore
created: 2026-07-09
updated: 2026-07-09
target-version: 0.7.0
links: [T-083, T-085, T-086, T-087, T-088, T-089, T-090, T-091]
blocked-by: [T-085, T-086, T-087, T-088, T-089, T-090, T-091]
---

# T-092 — Group 1 checkpoint — end-to-end ROM builds + manual test in every battle-format mode

## Context

The firm-ground checkpoint for Group 1 (see [T-083](T-083-epic-battle-formats-and-teambuilding.md)).
Because there is no local GBA toolchain, real ROMs are built on the builder machine; this task
assembles the manual-test matrix the owner runs before we advance to Group 2.

## Plan

- Produce bundles for: `singles`; `doubles`; `mixed` at a couple of percentages; `mixed` +
  `leagueRunAndBun`.
- Build ROMs (builder) and verify in-game:
  - Normal/boss/gym/E4 trainers fight in the expected format per pool and proportion.
  - Champion takes the majority type; the Mossdeep Steven tag battle is unchanged.
  - Run & Bun: E4 prompts singles/doubles while quota remains, forces the rest, counters correct,
    branches to the right team; champion not prompted.
  - Doubles trainers actually field 2 mons; no 1-mon trainer is doubles.
- Capture findings; file bugs (B-0NN) for any defect with a regression test before fixing.

Acceptance criteria:
- [ ] All four mode families build and run without crashes.
- [ ] Battle types in-game match the bundle across all pools (spot-checked per pool).
- [ ] Run & Bun flow behaves per spec (prompt, quota, forced type, correct teams).
- [ ] Owner has manually tested and confirmed Group 1 is OK.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
