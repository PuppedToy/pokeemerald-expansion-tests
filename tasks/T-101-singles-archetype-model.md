---
id: T-101
title: Singles archetype model — JSON of archetypes, entry conditions and team structure
status: in-progress
type: feature
created: 2026-07-09
updated: 2026-07-10
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

> **Meta-analysis validation (owner-gated).** Every Pokémon-meta conclusion in this task — the
> competitive value of a move / ability / item / tier / archetype, or a "what trainers prefer" rule —
> must be **explicitly validated by the owner before it is implemented**, not merely derived from the
> research corpus (which is partly 4v4 VGC, whereas our doubles are 6v6). Any such value/mapping is
> provisional until the owner validates it.

Acceptance criteria:
- [x] `singles.json` archetype set covering balanced/offensive/defensive + a gimmick layer, with
      entry conditions and structure for each.
- [x] A schema + validation test guards the file (`randomizer/archetypes.js` + `archetypes.test.js`).
- [x] Content is grounded in the research/analysis (`docs/research/team-archetypes.md`, cited).
- [x] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-10** — Built `randomizer/data/archetypes/singles.json` (v1): 4 base archetypes (Balance
  balanced · Bulky/Hyper Offense offensive · Full Stall defensive) + a stackable gimmick layer
  (weather · screens · trick_room), each with `entry` conditions (for emergent crystallization) and a
  soft `structure` (roles/min/max/weight) over a documented `featureDefinitions` vocabulary. Loader +
  validator `randomizer/archetypes.js` (referential integrity: every entry/structure feature is
  defined) + `archetypes.test.js`. Suite 844 pass. **Provisional** per the meta-analysis clause —
  the specific entry thresholds / structure weights are the encoding of the validated research and
  await owner review. Kept `in-progress`.

## Outcome

<!-- Filled when closing. -->
