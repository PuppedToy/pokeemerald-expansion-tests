---
id: T-097
title: Doubles Pokémon tiers — ratePokemonDoubles + contextualRatingsDoubles
status: in-progress
type: feature
created: 2026-07-09
updated: 2026-07-14
target-version: 0.8.0
links: [T-083, T-093, T-094, T-095, T-096]
blocked-by: []
---

# T-097 — Doubles Pokémon tiers — ratePokemonDoubles + contextualRatingsDoubles

## Context

With doubles move + ability values in place, each Pokémon gets a doubles rating/tier alongside its
singles one. `tierFromRating` is already factored out for reuse (`rating.js:2885-2888`), and the
per-level-cap `contextualRatings` pattern (`pokedexModule.js:300-313`) can be mirrored for doubles.

## Plan

- Add `ratePokemonDoubles` reusing `tierFromRating`, consuming the doubles move/ability values and a
  doubles-appropriate set of the floors/caps (per ADR-015 — parameterize rather than blind-reuse the
  ~20 singles special cases in `rating.js:3216-3328`).
- Compute `poke.ratingDoubles` and `poke.contextualRatingsDoubles[cap]` in `pokedexModule.js`
  alongside the singles calls; write them into the JSON caches (they then flow to the viewer automatically).
- Do not change the singles `poke.rating`/`contextualRatings`.
- Tests: mons that gain in doubles (spread abusers, redirectors, TR-friendly slow bulky mons) tier
  up in doubles vs singles; singles tiers unchanged.

> **Meta-analysis validation (owner-gated).** Every Pokémon-meta conclusion in this task — the
> competitive value of a move / ability / item / tier / archetype, or a "what trainers prefer" rule —
> must be **explicitly validated by the owner before it is implemented**, not merely derived from the
> research corpus (which is partly 4v4 VGC, whereas our doubles are 6v6). Any such value/mapping is
> provisional until the owner validates it.

Acceptance criteria:
- [ ] Every mon carries a doubles rating + tier + `contextualRatingsDoubles`.
- [ ] Doubles-favoured mons tier higher in doubles than singles (tested examples).
- [ ] Singles ratings/tiers are unchanged (regression test).
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-14 — design validated with owner.** `ratePokemonDoubles` mirrors the singles composition
  (`bstRating·0.8 + movesRating·0.1 + abilityRating·0.1 + comboBonus`) with doubles pieces:
  - **movesRating** ← `move.ratingDoubles`; **abilityRating** ← `ability.ratingDoubles` (both already
    computed, T-094/095/096).
  - **bstRating RE-WEIGHTED** (owner ✔): bulk↑, raw Speed↓ — in 6v6 speed control (TR/Tailwind/Icy Wind +
    redundancy) makes Speed less binary and bulk premium (survive spread). New per-role stat weightings.
  - **comboBonusDoubles**: the doubles-specific value the SSOT says must live in the tier (rating-decisions.md
    Batch 2 → T-097): Trick Room inversion (slow+strong premium), spread attacker, support (redirection /
    Intimidate / Fake Out / speed control), pivots/Regenerator premium (6v6).
  - **DOUBLES-SPECIFIC TIER SCALE** (owner ✔): its OWN thresholds (not the singles ones) — must be
    CALIBRATED against the doubles-rating distribution + anchor mons (Amoonguss/Incineroar/Landorus-T should
    be high; frail fast glass cannons drop), then owner-validated (meta-validation clause).
  - Singles `poke.rating`/`contextualRatings` untouched; add `ratingDoubles` + `tierDoubles` +
    `contextualRatingsDoubles[cap]`.

## Implementation plan (validated design → build steps)

Build test-first, keeping singles byte-identical (regression + determinism gates):
1. **Extract `computePowerAndRole(poke)`** from `ratePokemon` (the ~130-line offense/def/speed power +
   ability-multiplier + role block, `rating.js:2993-3115`) into a shared helper. Singles unchanged (verify:
   same `poke.rating` for all mons + determinism gates).
2. **Doubles bstRating weights** (owner ✔ bulk↑/speed↓): a `bstRatingDoubles(power, role)` with re-weighted
   per-role formulas (e.g. OFFENSIVE off·0.5/def·0.25/spe·0.25 vs singles off·0.55/spe·0.4/def·0.05; BULKY/
   TANK lean further into def; BALANCED slightly bulk-weighted).
3. **`computeComboBonusDoubles`** — the doubles value the tier must reflect (rating-decisions.md → T-097):
   Trick Room inversion (slow+strong premium), spread attacker, support (redirection/Intimidate/Fake Out/
   speed control), pivots/Regenerator premium. Additive, like `computeComboBonus`.
4. **`ratePokemonDoubles`** = `bstRatingDoubles·0.8 + movesRatingDoubles·0.1 + abilityRatingDoubles·0.1 +
   comboBonusDoubles`, where movesRating uses `move.ratingDoubles` + abilityRating uses `ability.ratingDoubles`.
   Parameterize the BST-floor/mega special-cases (reuse the general ones per ADR-015).
5. **Doubles tier scale (own thresholds)** — `tierFromRatingDoubles` with `TIER_*_THRESHOLD_DOUBLES`
   constants; CALIBRATE against the doubles-rating distribution + anchor mons, then owner-validate the tiers.
6. **Wire** `poke.ratingDoubles` + `poke.tierDoubles` + `contextualRatingsDoubles[cap]` in `pokedexModule.js`
   (mirror the singles calls); flow to caches/viewer.
7. Tests: doubles-favoured mons (Amoonguss/Incineroar/Landorus-T/slow bulky TR mons) tier ≥ singles; frail
   fast glass cannons drop; singles unchanged.

## Outcome

<!-- Filled when closing. -->
