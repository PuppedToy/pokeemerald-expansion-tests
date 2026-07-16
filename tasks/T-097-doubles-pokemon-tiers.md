---
id: T-097
title: Doubles Pokémon tiers — ratePokemonDoubles + contextualRatingsDoubles
status: done
type: feature
created: 2026-07-09
updated: 2026-07-15
target-version: 0.8.0
links: [T-083, T-093, T-094, T-095, T-096, T-109, T-111]
blocked-by: []
status-note: contextualRatingsDoubles deferred to T-111 (its consumer)
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
- [x] Every mon carries a doubles rating + tier (`poke.ratingDoubles` + `poke.tierDoubles`).
      `contextualRatingsDoubles` DEFERRED to T-111 (per-level doubles tiers — its only consumer; needs a
      `rateContextualDoubles` and no consumer exists yet). Owner-noted.
- [x] Doubles-favoured mons tier higher in doubles (Incineroar/Landorus-T/Cresselia/Amoonguss rise; glass
      cannons Pheromosa/Kartana/Regieleki drop) — tested + calibration-verified.
- [x] Singles ratings/tiers are unchanged — the doubles rater consumes NO rng (reuses the singles moveset),
      verified byte-identical by the determinism + continuity gates (17/17).
- [x] `cd randomizer && npm test` green (1080).

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

## Progress log (cont.)

- **2026-07-14 — built + first-cut calibration.** Extracted `computePowerAndRole` (singles byte-identical,
  committed 6069e0a153); built `bstRatingDoubles` (re-weighted), `computeComboBonusDoubles` (TR/spread/
  redirection/Intimidate/FakeOut/speed-control/pivot, potential-based), `ratePokemonDoubles`; wired
  `poke.ratingDoubles` in pokedexModule. Calibration harness (base pokedex, 1203 mons) → **proposed doubles
  thresholds matching singles tier proportions**: UBERS 8.21 · OU 7.60 · UU 6.91 · RU 6.05 · NU 5.03 · PU
  3.99 · ZU 2.99. **Anchor sanity-check surfaced tuning issues (pending owner validation):**
  - CORRECT direction: Incineroar RU→OU (8.01), Landorus-T OU→Ubers (8.80), Cresselia UU→OU (7.67), Rotom-W
    RU→UU (7.22), Amoonguss RU→UU (7.38) — doubles staples rise. ✓
  - OFF: **Hariyama 8.27 (→Ubers)** + **Blissey 8.40 (→Ubers)** too high (bulk↑ over-rewards passive/bulky);
    **Tapu Fini OU→RU (6.88)** too low (bulky terrain support under-credited); frail glass cannons drop in
    RATING (Pheromosa 9.40→8.78, Kartana 9.38→8.46, Regieleki 9.30→8.22) but stay Ubers on the doubles scale.
  - → tuning pass needed: punish frailty more, temper the bulk premium for passive walls, credit terrain/
    bulky-support. Presented to owner for validation of the anchors + thresholds before finalizing.
- **2026-07-14 — CRITICAL FIX + tuning applied.** Found that `ratePokemonDoubles` called `chooseMoveset` (which
  consumes rng via move-selection deviation), so wiring it DOUBLED the pokedex-rating rng consumption →
  silently shifted the SINGLES ratings + downstream (the consistency gates can't catch this). Fixed:
  `ratePokemonDoubles` now REUSES the singles `bestMoveset` (rng-free); verified singles + downstream
  byte-identical (gates 17/17). Also seeded the calibration harness (was noisy). Applied the 3 owner-approved
  tunings: frailty penalty (`def<5.5 → −(5.5−def)·0.5`), passive-wall penalty (`off<4 & combo<0.3 → −0.8`),
  combo credits for terrain surges (+0.45) + Friend Guard (+0.35), combo cap 1.5→1.0. **Tuned anchors** (thr:
  UBERS 8.33 / OU 7.65 / UU 7.01 / RU 6.07 / NU 4.76): Incineroar→OU, Landorus-T→Ubers, Cresselia→OU,
  Amoonguss→UU (staples rise ✓); Pheromosa Ubers→OU, Kartana LEGEND→OU, Regieleki Ubers→OU (glass cannons drop
  ✓); Hariyama tempered Ubers→OU; Tapu Fini RU→UU (terrain credit). Remaining debatable edges: **Blissey**
  still Ubers (8.88 — passive wall, but the passivity gate `off<4` misses it: SpA 75 → offensePower 5.8; and
  singles ALSO rates it Ubers), **Torkoal** →RU (weather-setting Drought not credited for doubles like
  terrains are). Presented to owner.

## Outcome

Shipped the doubles Pokémon rating dimension: `ratePokemonDoubles` (rating.js) mirrors the singles
composition with a RE-WEIGHTED bstRating (bulk↑/speed↓), the doubles move/ability values
(`ratingDoubles`), a doubles combo (Trick Room / spread / redirection / Intimidate / Fake Out / speed
control / terrain / weather / pivot, capped 1.0), and frailty + passive-wall penalties — mapped to its OWN
calibrated tier scale (`tierFromRatingDoubles`, thresholds proportion-matched to singles on the base
pokedex). `poke.ratingDoubles` + `poke.tierDoubles` wired in pokedexModule. Extracted `computePowerAndRole`
as the shared SSOT so singles/doubles compute the power profile identically.

**Singles untouched** — the doubles rater reuses the singles `bestMoveset` (consumes NO rng); verified
byte-identical by the determinism + continuity gates (17/17). Owner validated the design (re-weight + own
scale), the tuning (frailty/passive/terrain), and the weather-setter credit; calibration anchors sensible
(staples rise, glass cannons drop). `npm test` 1080.

Deferred: `contextualRatingsDoubles` (per-level doubles tiers) → **T-111** (its consumer; unblocked by this).
Next: **T-109** makes the team-builder picker consume `ratingDoubles`/`tierDoubles` (doubles-aware selection)
and regenerate the E4 doubles clones with the doubles engine.
