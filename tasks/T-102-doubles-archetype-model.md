---
id: T-102
title: Doubles archetype model — JSON of archetypes (weather, TR, redirection, ability-swap…)
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
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
- [ ] `doubles.json` archetype set covering balanced/offensive/defensive + doubles gimmicks, with
      entry conditions and structure for each.
- [ ] A schema + validation test guards the file (shared with T-101 where possible).
- [ ] Content grounded in the VGC research with sources noted.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
