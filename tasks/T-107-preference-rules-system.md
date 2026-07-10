---
id: T-107
title: Engine — preference/rules system replacing fixed slots (archetype-fit scoring)
status: in-progress
type: feature
created: 2026-07-09
updated: 2026-07-10
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

### Architecture — the "layer" model (owner-validated 2026-07-10)

The current per-boss tier tables (`presets.js`) are BOTH the **difficulty knob** (power level per boss,
difficulty scaling `getDifficultyTransform`, non-boss derivation `easyTransform`) AND the composition.
Owner decision: **keep the tier BUDGET; add archetype-aware composition as a LAYER that chooses which
tier-valid mon fills each slot.** "Preferences over slots" applies to *composition within the power
budget*, not to the power budget itself. This preserves the validated difficulty curve (satisfies the
singles-not-worse gate) and localises the behaviour change to high-sophistication (boss/endgame) teams.

Consequences for the algorithm — the 5 phases map onto the EXISTING tier-slot pipeline
(`createChooser` still produces the tier-valid candidate pool per slot; the layer changes *which*
candidate is chosen + adds crystallization + refinement):
1. **Seed** — optional archetype/gimmick lean on the trainer (or none). Presence/strength scales with
   sophistication (T-105).
2. **Weighted fill** — among the tier-valid candidates `createChooser` already returns, bias the pick
   by archetype-fit + seed (via feature-detectors). At **sophistication ≈ 0 the bias vanishes → the
   pick reduces to today's tier-based random pick** (early-game output ≈ current — the not-worse gate
   holds by construction).
3. **Emergent crystallization** — feature-detectors on the partial team detect a fallen-into archetype/
   gimmick (seeded or emergent); commit above a sophistication-gated confidence.
4. **Completion** — remaining tier slots bias toward the crystallized identity's `structure` (soft).
5. **Identity-aware refinement** — post-team nudge of moves/items/abilities toward the identity;
   strength = sophistication; residual randomness + cap so endgame doesn't homogenise.

Feature-detectors: pure `(mon, teamContext, format) -> Set<featureTag>` grounded in **existing** signals
(tiers, `aiRatings`, base stats, learnset/teachables, `parsedAbilities`) with provisional thresholds
(tunable like the sophistication params; not a meta claim requiring separate validation).

### Incremental build (each: TDD, sophistication-gated, verified vs. the determinism gate + not-worse)

- **107a — feature-detector module** (pure, unit-tested, output-neutral; the foundation everything
  else reads). ← first increment.
- **107b — archetype-fit scoring + crystallization detector** (pure; reads 107a + the archetype JSONs).
- **107c — weighted fill** wired into the resolver's `context.sophistication` seam (bias vanishes at
  soph≈0 → early-game byte-identical; change concentrates at high soph).
- **107d — completion + identity-aware refinement pass** (moves/items/abilities toward identity).
- **107e — trainer seed declarations** (migrate the weather-grunt intent etc. to soft leans).
Each increment lands green (full suite + `RUN_DETERMINISM=1`), and the singles-not-worse comparison is
checked before the layer is allowed to alter high-sophistication teams.

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
- **2026-07-10** — Started. Design+validation pass: read the archetype models
  (`data/archetypes/{singles,doubles}.json`), their research grounding
  (`docs/research/team-archetypes.md` + `rating-decisions.md` — Batches 1-3 taxonomy/gimmick model
  already owner-VALIDATED), and the current slot/tier machinery (`presets.js` SPLITS + `trainerSelector`
  fill). **Foundational decision — owner-validated 2026-07-10: the "layer" model (Option A).** Keep the
  per-boss tier BUDGET (difficulty/power/non-boss derivation intact) and add archetype composition as a
  layer choosing which tier-valid mon fills each slot; the bias vanishes at sophistication ≈ 0 so
  early-game output ≈ today (not-worse gate holds by construction) and the change concentrates on
  boss/endgame teams. Recorded the architecture + 5-phase→tier-slot mapping + the incremental build
  (107a detectors → 107b fit/crystallization → 107c weighted fill → 107d completion+refinement →
  107e trainer seeds) in the Plan above. Feature-detector thresholds are grounded in existing rating
  signals and provisional/tunable (not a meta claim). Beginning **107a** (pure feature-detector module,
  output-neutral) under TDD.

## Outcome

<!-- Filled when closing. -->
