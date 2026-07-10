---
id: T-103
title: Design the archetype-driven teambuilding engine + ADR-016 (+ teardown plan)
status: done
type: docs
created: 2026-07-09
updated: 2026-07-10
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
- **Per-team generation flow (owner-validated, see `docs/research/rating-decisions.md` + T-107):**
  optional seed/direction → stochastic slot-fill → **emergent** archetype/gimmick crystallization
  (commit to the seeded *or* an emergent identity) → completion → **identity-aware refinement pass**.
  Sophistication (T-105) modulates seed probability, crystallization confidence, and refinement
  strength (early = loose/random pile; endgame = tight competitive team). Gimmicks are a weighted,
  stackable layer, not fixed slots.
- **Reverse-order generation:** generate **all trainers last→first (Champion first, Route 103 last)**
  so a recurring character's final, well-built teams exist before its earlier appearances are built
  (today's engine runs first→last and lets an early random pick drive the late team). The per-team
  build is identical regardless of order. **Recurring characters** (rival, Steven) reuse their final
  roster at each earlier appearance, each mon at the **most-evolved form its level allows** (Champion
  Steven → earlier evo stages at Granite Cave); non-recurring trainers are unaffected by the order.
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
- [x] `docs/adr/ADR-016.md` written and accepted, added to `docs/INDEX.md`.
- [x] The preference model, per-team algorithm, sophistication scalar, reverse-order generation and
      retained fixed points are specified precisely enough to implement T-104…T-110.
- [x] A concrete teardown + verification plan (singles-not-worse gate) is written (ADR-016 Consequences).
- [x] The data contract with the archetype JSONs (T-101/T-102) and the dual rating (2A) is pinned.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-10** — Wrote and accepted **ADR-016** (indexed in `docs/INDEX.md`), formalising the design
  already validated across the joint-analysis batches: preferences over slots; the per-team pipeline
  (optional seed → stochastic fill → emergent archetype/gimmick crystallization → completion →
  identity-aware refinement) with the sophistication scalar modulating seed probability, crystallization
  confidence and refinement strength; reverse-order generation (last→first) for recurring-character
  continuity (devolve the final roster); single shared resolver; dual-rating + archetype-JSON contracts;
  retained fixed points; and a singles-not-worse teardown/verification gate. Open points recorded
  (doubles defensive base; item rating → 2C; T-097 tier surgery). Closed on green (design/docs; the
  design was owner-validated piece by piece).

## Outcome

Shipped **ADR-016** — the architecture SSOT for the 2C teambuilding rewrite (T-104…T-110 implement it).
No deviations; the design encodes the owner-validated algorithm, archetype model and generation order.
Follow-ups are the implementation tasks + the recorded open points.
