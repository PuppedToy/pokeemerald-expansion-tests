# ADR-016: Archetype-driven teambuilding — preferences over slots, per-team generate→crystallize→refine, reverse-order generation

- **Status:** accepted
- **Date:** 2026-07-10
- **Task:** T-103

## Context

Group 2C hard-replaces the current fixed-slot trainer engine (`randomizer/trainers.js` slot table +
`randomizer/presets.js` `SPLITS` + the duplicated `writer.js` / `writerDocs.js` resolver). The current
engine assigns each trainer fixed positional slots at fixed tiers and builds teams first→last,
dropping a random mon early and evolving it forward — teams have "no personality," and the early random
pick drives the late team.

The redesign's shape has been **validated with the owner** through the joint analysis (see
`docs/research/rating-decisions.md`): the archetype taxonomy + gimmick layer (Batch 3), the per-team
algorithm, and the reverse generation order. The archetype models exist as data
(`randomizer/data/archetypes/{singles,doubles}.json`, T-101/T-102) and the dual singles/doubles rating
exists (Group 2A, ADR-015). This ADR freezes the engine architecture so T-104…T-110 can implement it.

Our doubles are **6v6** (not VGC 4v4) — see `docs/research/6v6-vs-4v4-doubles.md`.

## Decision

**1. Preferences over slots.** A trainer no longer carries fixed positional slots. It may carry a soft
**seed/direction** — an archetype and/or gimmick lean (e.g. Aqua grunt → offensive + light weather) —
or **none**. Everything is a soft preference: an impossible preference lowers a fit score, it never
forces a slot or crashes (graceful degradation).

**2. Per-team generation algorithm.** Each team (regardless of trainer) is built by the same pipeline:
1. **Optional seed** — present/strong with a probability that scales with sophistication (§3).
2. **Stochastic slot-fill** — randomized, rating/type/legality-aware picks, honoring the retained
   fixed points (§7).
3. **Emergent crystallization** — after picks, evaluate the partial team against the archetype models'
   `entry` conditions (T-101/T-102) and detect whether it has fallen into an archetype and/or gimmick —
   the seeded one **or a new emergent one**. On enough confidence (gated by sophistication) commit to
   that identity and bias later picks.
4. **Completion** — fill remaining slots toward the crystallized identity's preferred `structure`.
5. **Identity-aware refinement** — knowing the final archetype+gimmick, nudge members/moves/items/
   abilities toward that structure. Refinement **strength = the sophistication scalar**, with residual
   randomness + a cap so endgame teams don't homogenise.

**3. Sophistication scalar (0..1).** How hard the generator pursues an identity. Rises with bosses
defeated (≈0 at the start → ≈1 by the endgame). It modulates: seed probability, crystallization
confidence threshold, and refinement strength. Low = "a pile of mons"; high = a coherent competitive
team.

**4. Reverse-order generation (last→first).** All trainers are generated in reverse game order
(Champion first, Route-103 rival last). A team is never built "backwards" — the order exists so a
**recurring character's** final, well-built teams are decided before its earlier appearances. Each
earlier appearance of a recurring character (rival, Steven) reuses that final roster at the
**most-evolved form its level cap allows** (Champion Steven → earlier evo stages at Granite Cave). The
earlier appearance carries the devolution constraint (it matters less that an early team is strong).
Non-recurring trainers are unaffected by the order.

**5. Archetype model consumption.** The generator reads `data/archetypes/<format>.json` (per the
trainer's `battleType` from Group 1): `entry` drives crystallization (§2.3), `structure` drives
completion (§2.4), refinement (§2.5) and archetype-fit scoring. Gimmicks are a **weighted, stackable
layer** on the base archetype (a team may carry several); commitment is a spectrum, not a separate
archetype (Batch-3 decision). **Feature detectors** — pure functions mapping a candidate mon (+ team
context) to the model's `featureDefinitions` keys (weatherSetter, redirector, trickRoomAbuser, …) —
are the new code the engine needs; they live in one module and are unit-tested.

**6. Dual-rating consumption.** Singles-format trainers select from the singles rating dimension,
doubles-format trainers from the doubles dimension (`ratingDoubles` / doubles tiers, Group 2A),
per-trainer in mixed. "Singles = current behaviour" is preserved.

**7. Fixed points retained.** ID-locked/continuity mons (rivals, Steven, starters), at-most-one-mega,
family dedup, trainer exemptions, **determinism** (per-slot reseed so shared-trainer ROMs + docs match
byte-for-byte), and the Group-1 battle-type stamping.

**8. Single resolver.** One shared selection/resolution module replaces the duplicated
`writer.js`/`writerDocs.js` loops (T-104), ending their historical drift; the docs SSOT and the ROM
`.party` are produced from the same path.

## Alternatives considered

- **Top-down archetype-then-fill** (assign an archetype, fill its slots). Rejected: it reproduces the
  "fixed slots" rigidity and misses emergent combos; the owner-validated emergent model produces
  organic variety and matches how real teams are discovered.
- **Keep first→last generation** and evolve continuity mons forward. Rejected: the early random pick
  drives the late team; reverse order lets the strong endgame team be authored first (§4).
- **Incremental refactor of the slot engine.** Rejected: the slot/`SPLITS` machinery is the thing
  being replaced; a hard replace (behind tests, singles-not-worse) is cleaner than perpetuating it.

## Consequences

- Teams gain "personality" (archetype + gimmick identity) that tightens with game progress; early
  teams stay loose by design.
- New surface area: the feature detectors (§5), the crystallization detector, and the refinement pass —
  each must stay deterministic and within the perf budget (<2s test suite; per-ROM build).
- Two rating dimensions + the archetype models must stay coherent; the single resolver (§8) removes the
  writer/writerDocs drift risk.
- **Migration is high-risk** (it replaces the core). It ships behind the full suite with a
  **singles-not-worse** gate: before/after comparison on fixed seeds + owner manual review at the 2C
  checkpoint; the old engine is deleted only once green (teardown detailed in T-110).
- Meta values (archetype `entry`/`structure`, rating floors) remain **owner-gated** (the meta-analysis
  validation clause) and are tuned against the corpus, not assumed.

## Open points

- **Doubles has no pure-defensive base archetype** (6v6 DOU is offensive/balanced-leaning). Owner to
  confirm whether our game wants one added (T-102 flag).
- **Item rating in doubles** (AV/Weakness Policy/Sash-on-leads/Choice) is deferred to the 2C item-
  selection consumption (rating-gaps Batch-2).
- The T-097 doubles-tier surgery (`ratePokemonDoubles`, TR speed-inversion, weather-pairing) lands
  before/with the doubles selection path (T-109).
