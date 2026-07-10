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

The per-team generation algorithm (owner-validated 2026-07-10 — see `docs/research/rating-decisions.md`):

1. **Optional seed / initial direction.** A trainer may carry a soft lean (archetype and/or gimmick
   preference — e.g. Aqua grunt → offensive + light weather) or **none** (pure random). Whether a seed
   is present, and how strong, scales with the sophistication scalar (T-105): early game often has no
   direction; endgame usually does.
2. **Stochastic slot-fill.** Randomize picks (respecting rating/type/legality + the retained fixed
   points), so a team accretes organically instead of filling fixed positional slots.
3. **Emergent crystallization.** After picks, read the partial team against the archetype models
   (T-101/T-102 entry conditions) and detect whether it has "fallen into" an archetype and/or gimmick —
   the seeded one **or a new emergent one** (e.g. two picks make a weather gimmick viable). Once a
   candidate crystallizes (confidence gated by sophistication), commit to it and bias later picks.
4. **Completion.** Fill remaining slots toward the crystallized identity's preferred roles — still
   soft: an impossible preference lowers fit, never forces (graceful degradation).
5. **Identity-aware refinement pass.** Knowing the finished team's archetype+gimmick, review it and
   nudge members/moves/items/abilities toward that "vision." The **strength of this pass is the
   sophistication scalar** (early = little/none → "a pile of mons"; endgame = strong → coherent
   competitive team). A residual randomness + a refinement cap keep endgame teams from homogenising.

- Gimmicks are a **weighted layer** that can stack (Batch-3 decision), not fixed slots.
- Port the weather-grunt intent (`trainers.js:177-247`) into this model: setter+abuser is a preferred
  (crystallizing) weather gimmick with a graceful non-weather fallback.
- Migrate trainer definitions from slot tables to (optional) preference declarations.
- Determinism (per-slot reseed) and cost (<2s test budget, per-ROM build) hold across all phases.

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
- **2026-07-10 (sequencing)** — Promoted to the **next actionable 2C task**: blockers T-101 and T-105
  are both done, and the T-106 investigation established that continuity inversion (reverse-order +
  authoritative-latest roster + devolution) must plug into *this* engine rather than precede it — so
  **T-107 lands before T-106 + T-108** (see T-106 log). Design implication for this task: the new
  per-team build must expose the hooks that continuity/fixed-ID work will consume —
  (a) **build-a-trainer-at-a-given-sophistication** (already seeded: the resolver computes
  `context.sophistication` from the T-105 scale), and (b) a **`storedIds`-style continuity channel**
  on the new engine so a recurring character's roster can be decided once (at max sophistication) and
  reused. Keep those seams explicit so T-106/T-108 layer on without reworking this engine.

## Outcome

<!-- Filled when closing. -->
