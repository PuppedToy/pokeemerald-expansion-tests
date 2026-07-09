---
id: T-101
title: Singles archetype model — JSON of archetypes, entry conditions and team structure
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, T-099, T-100]
blocked-by: [T-100]
---

# T-101 — Singles archetype model — JSON of archetypes, entry conditions and team structure

## Context

The new teambuilding engine (2C) targets **archetypes** rather than fixed slots. This task defines
the singles archetype model as data: a bird's-eye description of how competitive singles teams are
built, grounded in the research (T-099) and modern archetype analysis. Categories at least:
**balanced, offensive, defensive, gimmick** (+ any others found, e.g. hyper-offense, stall,
weather, hazard-stack).

## Plan

- Design a JSON schema for archetypes: `id`, `category`, human description, **entry conditions**
  (what makes a set of mons "fall into" this archetype), and **general team structure** (soft roles /
  proportions / preferences — NOT fixed slots).
- Populate `randomizer/data/archetypes/singles.json` (path TBD in ADR-016) from the research +
  reputable online archetype analyses (cited).
- Add a validator + tests (schema shape, category coverage, no contradictory conditions).
- Keep it engine-agnostic: this is data the 2C generator will consume, not code.

Acceptance criteria:
- [ ] `singles.json` archetype set covering balanced/offensive/defensive/gimmick (+ others), with
      entry conditions and structure for each.
- [ ] A schema + validation test guards the file.
- [ ] Content is grounded in the research/analysis with sources noted.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
