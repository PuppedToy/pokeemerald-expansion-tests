---
id: T-107
title: Engine — preference/rules system replacing fixed slots (archetype-fit scoring)
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, T-101, T-103, T-105]
blocked-by: [T-105, T-101]
---

# T-107 — Engine — preference/rules system replacing fixed slots (archetype-fit scoring)

## Context

The heart of the rewrite: trainers express **preferences** ("prefers aqua-type + weather", "prefers
offensive archetype") rather than fixed positional slots, and the generator scores candidate teams by
archetype fit (from T-101 singles model), weighted by the sophistication scalar (T-105). Weather/
terrain gimmick teams become *light* preferences that degrade gracefully — never forced by a slot.
This replaces the `presets.js` `SPLITS`/slot machinery and the per-slot POKEDEFs in `trainers.js`.

## Plan

- Define the per-trainer preference format (types, weather/terrain bias, archetype bias, role hints)
  and a candidate-team scoring function combining archetype-fit + rating + preferences, weighted by
  sophistication (low soph → near-random fill; high soph → strong archetype pull).
- Port the existing weather-grunt intent (`trainers.js:177-247` factories) into preferences: the
  setter+abuser combo is preferred, with a graceful non-weather fallback.
- Migrate trainer definitions from slot tables to preference declarations.
- Keep degradation graceful: an impossible preference reduces fit score, never crashes or forces.
- Tests: high-sophistication teams score high archetype-fit; low-sophistication teams are looser;
  a trainer whose preferred weather is impossible still builds a legal, reasonable team.

> **Meta-analysis validation (owner-gated).** Every Pokémon-meta conclusion in this task — the
> competitive value of a move / ability / item / tier / archetype, or a "what trainers prefer" rule —
> must be **explicitly validated by the owner before it is implemented**, not merely derived from the
> research corpus (which is partly 4v4 VGC, whereas our doubles are 6v6). Any such value/mapping is
> provisional until the owner validates it.

Acceptance criteria:
- [ ] Trainers are defined by preferences, not fixed slots; candidate teams scored by archetype-fit.
- [ ] Sophistication modulates how strongly archetype fit is pursued (tested at both ends).
- [ ] Weather/terrain are soft preferences with graceful fallback (no forced slots).
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
