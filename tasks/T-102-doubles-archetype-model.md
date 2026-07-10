---
id: T-102
title: Doubles archetype model — JSON of archetypes (weather, TR, redirection, ability-swap…)
status: in-progress
type: feature
created: 2026-07-09
updated: 2026-07-10
target-version: 0.8.0
links: [T-083, T-098, T-100]
blocked-by: [T-100]
---

# T-102 — Doubles archetype model — JSON of archetypes (weather, TR, redirection, ability-swap…)

## Context

The doubles counterpart to [T-101](T-101-singles-archetype-model.md), grounded in the VGC research
(T-098). Doubles gimmicks are central (weather, Trick Room, redirection, ability-swap / Skill Swap
plays, terrain), and balanced/offensive/defensive still apply with different structure than singles.

## Plan

- Same schema as T-101, populated for doubles into `randomizer/data/archetypes/doubles.json`.
- Emphasize doubles-specific gimmick archetypes and their conditions/structure (weather core + abuser,
  TR + slow attackers, redirection + spread, etc.).
- Validator + tests; content cited from research/analysis.

> **Meta-analysis validation (owner-gated).** Every Pokémon-meta conclusion in this task — the
> competitive value of a move / ability / item / tier / archetype, or a "what trainers prefer" rule —
> must be **explicitly validated by the owner before it is implemented**, not merely derived from the
> research corpus (which is partly 4v4 VGC, whereas our doubles are 6v6). Any such value/mapping is
> provisional until the owner validates it.

Acceptance criteria:
- [x] `doubles.json` archetype set (base offensive/balanced + doubles gimmicks) with entry conditions
      and structure for each. *(No pure-defensive base — see the flag below; owner to confirm.)*
- [x] A schema + validation test guards the file (shared loader `randomizer/archetypes.js` + test).
- [x] Content grounded in the 6v6 DOU research (`docs/research/team-archetypes.md`, 6v6-adjusted).
- [x] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-10** — Built `randomizer/data/archetypes/doubles.json` (v1), sharing the T-101 schema +
  loader: 3 base archetypes (Bulky Offense [Intimidate/Fake Out] · Balance/Dual-Mode · Hyper Offense)
  + a stackable gimmick layer (weather · trick_room · redirection · trapping · screens_tailwind), tuned
  for our **6v6** (not 4v4 VGC). Suite 844 pass. **Provisional** per the meta-analysis clause.
  **Owner-validation flag:** the DOU research surfaced no pure *defensive/stall* base archetype for
  doubles (6v6 DOU is offensive/balanced-leaning); doubles currently has base categories
  offensive + balanced only. Confirm whether our game wants a defensive doubles base or that's fine.
  Kept `in-progress`.

## Outcome

<!-- Filled when closing. -->
