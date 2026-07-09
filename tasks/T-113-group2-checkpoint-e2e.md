---
id: T-113
title: Group 2 checkpoint — end-to-end builds + per-format team-quality review
status: proposed
type: chore
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, T-097, T-110, T-111, T-112]
blocked-by: [T-097, T-110, T-111, T-112]
---

# T-113 — Group 2 checkpoint — end-to-end builds + per-format team-quality review

## Context

The firm-ground checkpoint closing the epic (see [T-083](T-083-epic-battle-formats-and-teambuilding.md)):
verify the new doubles rating, archetype engine and per-format tiers produce good, legal teams in
singles, doubles and mixed — and that singles did not regress.

## Plan

- Generate + build (builder) ROMs for singles, doubles, and mixed (incl. Run & Bun).
- Review team quality per format: archetype coherence rises with progression (sophistication),
  doubles teams show doubles logic (spread/redirection/TR/weather), continuity mons stay consistent,
  legality/level-appropriateness hold.
- Compare singles teams against the pre-epic baseline (owner review) — not worse.
- Confirm viewer per-format tiers render correctly.
- File bugs (with regression tests) for any defects.

Acceptance criteria:
- [ ] Singles/doubles/mixed all build and produce coherent, legal teams.
- [ ] Doubles teams reflect doubles archetype/rating logic; sophistication curve visible.
- [ ] Singles not worse than baseline (owner-confirmed).
- [ ] Owner has manually tested and confirmed Group 2 is OK.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
