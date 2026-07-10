---
id: T-103
title: Design the archetype-driven teambuilding engine + ADR-016 (+ teardown plan)
status: proposed
type: docs
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, T-101, T-102, docs/adr/ADR-016.md]
blocked-by: [T-101, T-102]
---

# T-103 — Design the archetype-driven teambuilding engine + ADR-016 (+ teardown plan)

## Context

Group 2C opener and the highest-risk design in the epic. We hard-replace the current fixed-slot
engine (`trainers.js` slot table + `presets.js` `SPLITS` + the duplicated `writer.js`/`writerDocs.js`
resolver) with an archetype-driven, preference-based generator that produces teams **backwards**
(endgame first, then devolve) with a **sophistication curve**. It must serve both formats and must
not leave singles worse than today.

## Plan

Write **ADR-016** deciding the architecture:
- **Preferences over slots:** trainers carry soft "what they prefer to do" rules (types, weather,
  terrain, archetype bias) instead of fixed positional slots. If randomization makes a preference
  impossible (e.g. no weather setter available), the team degrades gracefully instead of forcing it.
  Example: Aqua grunt #1 prefers aqua-type[0] + weather; grunt #2 prefers aqua-type[2] + weather.
- **Sophistication scalar (0..1):** how hard the generator tries to hit an archetype. Low early-game
  ("a pile of mons put together"), rising per boss defeated to ~1 by the endgame.
- **Backwards generation:** build endgame teams first at max sophistication, then derive earlier
  trainers by devolving mons while preserving ID continuity (rivals, Steven, starters keep identity).
- **Fixed points retained:** ID-locked mons, at-most-one-mega, family dedup, exemptions, determinism
  (per-slot reseed), and the battle-type stamping from Group 1.
- **Single resolver:** one shared selection module (kills the writer/writerDocs drift).
- **Format-awareness:** consumes singles vs doubles rating (2A) and archetype models (2B) per the
  trainer's battle type.
- **Teardown plan:** what of `trainers.js`/`presets.js`/`trainerSelector.js`/`trainerFallback.js`
  survives, what is deleted, and the migration/verification strategy (how we prove singles ≥ baseline).

> **Meta-analysis validation (owner-gated).** Every Pokémon-meta conclusion in this task — the
> competitive value of a move / ability / item / tier / archetype, or a "what trainers prefer" rule —
> must be **explicitly validated by the owner before it is implemented**, not merely derived from the
> research corpus (which is partly 4v4 VGC, whereas our doubles are 6v6). Any such value/mapping is
> provisional until the owner validates it.

Acceptance criteria:
- [ ] `docs/adr/ADR-016.md` written (accepted), added to `docs/INDEX.md`.
- [ ] The preference model, sophistication scalar, backwards generation, and retained fixed points
      are specified precisely enough to implement T-104…T-110.
- [ ] A concrete teardown + verification plan (singles-not-worse) is written.
- [ ] The data contract with the archetype JSONs (T-101/T-102) and the dual rating (2A) is pinned.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
