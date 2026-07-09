---
id: T-106
title: Engine — backwards generation (endgame-first, devolve preserving ID continuity)
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, T-103, T-104, T-105]
blocked-by: [T-105]
---

# T-106 — Engine — backwards generation (endgame-first, devolve preserving ID continuity)

## Context

Per ADR-016, produce the endgame teams first (max sophistication) and derive earlier trainers by
devolving mons, so a rival's/boss's identity is consistent across the game. The current
`TRAINER_REPEAT_ID` / `evolutionTier` / `devolveToBase` machinery (`modules/utils.js`,
`trainerSelector.js`) is the raw material to generalize.

## Plan

- Implement the endgame-first generation order and a devolution step that walks ID-locked/continuity
  mons back down their evolutionary line for earlier appearances, respecting level caps.
- Preserve determinism (per-slot reseed) so shared-trainer ROMs and docs still match.
- Keep at-most-one-mega and family-dedup invariants during backwards derivation.
- Tests: an ID-locked line devolves consistently across appearances; endgame teams are generated at
  full sophistication; determinism holds across shared ROMs.

Acceptance criteria:
- [ ] Generation runs endgame→early; continuity mons devolve consistently per appearance.
- [ ] Determinism and one-mega/family-dedup invariants preserved.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
