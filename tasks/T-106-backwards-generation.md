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

**Why last→first order (owner, 2026-07-10):** the whole trainer set is generated in **reverse game
order — the last trainer (Champion) first, the first trainer (Route 103) last**. A team is **not**
built backwards internally; the per-team build (T-107) is always the same. The reverse *order* exists
so that a **recurring character's final, well-built teams are already decided before we build their
earlier appearances.** Today the engine runs the other way (Route 103 → Champion): it drops a random
mon on the Route 103 rival and evolves it forward, so an early random pick drives the late team. We
invert that — build the Champion / final rival teams first (well-built), so when we reach the Route
103 rival the roster is already known and the early appearance simply uses **the most-evolved form
each of those final mons is allowed at that level** (base forms early, fully evolved late). Example:
Champion Steven's aces → their earlier evo stages at Granite Cave `TRAINER_STEVEN`. It is better that
the *early* appearance carries this constraint, since it matters less that an early team is strong.

## Plan

- Generate **all trainers in reverse game order (last → first)**. The per-team build (T-107) is
  identical regardless of position; only the *order* changes.
- For **recurring characters** (rival May/Brendan, Steven), the latest/strongest appearance is built
  first and owns the roster. Each **earlier appearance reuses that same roster**, showing each mon at
  the **most-evolved form its level cap allows** (earlier evo stages early on) — a coherent earlier
  snapshot of the final team, not a fresh random team. (Generalizes today's `TRAINER_REPEAT_ID` /
  `evolutionTier` / `devolveToBase`.)
- **Non-recurring trainers** are built independently in that same order at their local sophistication
  (T-105); the order does not change their result — only recurring-character continuity depends on it.
- Preserve determinism (per-slot reseed) so shared-trainer ROMs and docs still match.
- Keep at-most-one-mega and family-dedup invariants.
- Tests: a recurring line is consistent across appearances at level-appropriate evo stages (Champion
  Steven ↔ Granite Cave Steven); the latest appearance is the authoritative/strong one; determinism
  holds across shared ROMs.

Acceptance criteria:
- [ ] Generation runs endgame→early; continuity mons devolve consistently per appearance.
- [ ] Determinism and one-mega/family-dedup invariants preserved.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
