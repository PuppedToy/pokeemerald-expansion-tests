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

**Why endgame-first (owner, 2026-07-10):** for a character that appears multiple times sharing ID'd
Pokémon — the clearest case is **Steven**: Champion (endgame) and Granite Cave `TRAINER_STEVEN`
(early) — we build the **latest/strongest appearance first and unconstrained** (the Champion "owns"
the ideal team and has **prevalence** in deckbuilding). The **earlier** appearance (Granite Cave) then
reuses those ID'd mons **devolved** to its level cap. The earlier appearance **bears the continuity
restriction** precisely because it matters less that an early team is strong — so the constraint falls
on it, not on the endgame team. Backwards generation + devolution applies **only to ID-locked /
continuity mons**; every non-continuity trainer is built forward at its own local sophistication (so
early route teams stay loose/random — that is not a devolved endgame team).

## Plan

- Generate in **latest→earliest** order for continuity characters: build the Champion (and any
  final/strongest appearance) first and unconstrained; it owns the ideal team and the ID'd mons.
- **Devolution step:** for each earlier appearance of a continuity mon, walk it back down its
  evolutionary line to fit that appearance's level cap — the earlier appearance carries the
  restriction (e.g. Champion Steven's ace → its devolved form at Granite Cave `TRAINER_STEVEN`).
- Backwards/devolution is scoped to **ID-locked / continuity mons only**; non-continuity trainers are
  built forward via the per-team algorithm (T-107) at their local sophistication (T-105) — early teams
  stay loose, they are not devolved endgame teams.
- Preserve determinism (per-slot reseed) so shared-trainer ROMs and docs still match.
- Keep at-most-one-mega and family-dedup invariants during backwards derivation.
- Tests: an ID-locked line devolves consistently across appearances (Champion Steven ↔ Granite Cave
  Steven); the endgame appearance is the unconstrained/strong one; endgame teams generate at full
  sophistication; determinism holds across shared ROMs.

Acceptance criteria:
- [ ] Generation runs endgame→early; continuity mons devolve consistently per appearance.
- [ ] Determinism and one-mega/family-dedup invariants preserved.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
