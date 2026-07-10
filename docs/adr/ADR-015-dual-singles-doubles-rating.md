# ADR-015: Doubles is a second, parallel rating dimension alongside singles — not a replacement

- **Status:** accepted
- **Date:** 2026-07-10
- **Task:** T-093

## Context

Group 2 of the epic ([T-083](../../tasks/T-083-epic-battle-formats-and-teambuilding.md)) begins by
isolating the **value of moves, abilities and Pokémon in doubles**, which differs from singles:
spread damage moves hit two targets; "bad in singles" support/gimmick moves (Follow Me, Rage Powder,
Helping Hand, Wide/Quick Guard, Ally Switch, Trick Room, After You, Decorate…) gain real value;
redirection/lightning-rod-style abilities and Intimidate/Friend Guard/Telepathy matter far more.

The owner directive: **"everything currently built for teambuilding in singles applies to single
battles"** — so the existing singles rating must stay intact. Doubles gets its **own** rating.

What the read-only exploration established about the current rating engine (all in
`randomizer/rating.js`):

- Move value: base `rateMove(move)` (singles-only; **no** spread/target awareness) → context-aware
  `rateMoveForAPokemon(...)`. Every move already carries a `target` field (`MOVE_TARGET_BOTH`,
  `_FOES_AND_ALLY`, `_ALL_BATTLERS`, …) — read by nothing today, and Surf/Earthquake use a
  gen-conditional target string that needs normalisation.
- The "bad in singles" values live in the hardcoded `statusList` map — the exact set to re-value for
  doubles.
- Ability value: base is the ROM's `.aiRating`; context adjustments live in `ratePokemon`'s
  ability block and in `computeComboBonus`. The `elecAbsorbAbilities` block already *documents*
  "in singles the draw/redirection is irrelevant" — the canonical seam to re-value for doubles.
- Tiers: `ratePokemon → tierFromRating` (already factored out for reuse), with per-level-cap
  `rateContextual → contextualRatings[cap]`. There are ~20 hardcoded singles-specific floors/caps.

## Decision

**1. Doubles is a parallel dimension, computed alongside singles — never replacing it.** Singles
rating code and values are left unchanged. New sibling computations produce doubles values that live
next to the singles ones on the same objects:

- Moves: `moves[id].ratingDoubles` next to `.rating`.
- Pokémon: `poke.ratingDoubles` (same shape as `poke.rating`) and
  `poke.contextualRatingsDoubles[cap]` next to `contextualRatings[cap]`.
- Abilities: doubles-specific adjustments fold into `ratingDoubles`/its ability sub-score (no change
  to the ROM's base `.aiRating`).

**2. New sibling functions in `rating.js`, reusing the shared primitives.** `rateMoveDoubles(move)`
(spread + support re-valuation, from `rateMove` + `move.target`), `rateMoveForAPokemonDoubles(...)`,
`ratePokemonDoubles(...)`, `rateContextualDoubles(...)`. `tierFromRating` and the tier thresholds are
**shared** (a tier is a tier; only the rating that feeds it differs). Written and persisted in
`modules/pokedexModule.js` right beside the existing singles calls, into the JSON caches.

**3. `move.target` is normalised once** into a small helper (`isSpreadMove`/spread factor) that
resolves the gen-conditional strings and `MOVE_TARGET_DEPENDS`, so spread logic has a single source.

**4. Singles-specific floors/caps are not blindly reused.** The ~20 hardcoded floors/caps in
`ratePokemon` and the ability caps are singles heuristics; the doubles path gets its own (or a shared,
explicitly-parameterised) set — decided per case in T-094…T-097, not copied wholesale.

**5. Computation now, consumption in the new engine (Group 2C).** Group 2A only *computes, stores and
surfaces* doubles ratings/tiers. Which trainers select from the doubles dimension is wired by the
archetype-driven engine in Group 2C (ADR-016, forthcoming): singles-format trainers use the singles
dimension, doubles-format trainers the doubles dimension, mixed per-trainer. The current slot engine
is **not** retrofitted (it is being replaced) — the Run & Bun doubles clones keep singles-based teams
until then (the `TODO(T-109)` seam already left in `trainersModule.js`).

**6. Docs surface both.** The viewer/tiers work (Group 2D) shows a Pokémon's singles **and** doubles
tier; in a mixed run both are relevant. `output/*.js` carry the new fields automatically once written
to the caches.

## Alternatives considered

- **One blended rating** (fold a doubles bonus into the single rating). Rejected: it would corrupt
  singles output (violating the owner directive) and can't express "great in doubles, mediocre in
  singles" (e.g. Amoonguss, Indeedee).
- **A `format` parameter on the existing functions** instead of sibling functions. Rejected for the
  hot path: it would thread a flag through dozens of call sites and risk silently changing singles
  behaviour; sibling functions keep singles untouched and make the doubles logic auditable. (Shared
  leaf helpers like `tierFromRating` are still parameter-free and reused.)
- **Retrofitting the current slot engine to consume doubles rating now.** Rejected as throwaway — the
  engine is rewritten in 2C; wiring consumption there avoids double work.

## Consequences

- Singles output for a given seed is unchanged (no singles code touched) — protects the existing
  behaviour and the determinism tests.
- Two rating dimensions must be kept coherent (same tier ladder, same structural shape); the sibling
  functions share every leaf primitive to minimise drift.
- Until Group 2C lands, doubles *ratings* exist and are visible but do not yet change team selection —
  a deliberate, documented gap (not a regression).
- `move.target` normalisation becomes a small shared utility other code can reuse.
- The doubles floors/caps are new surface area to tune with the research (Group 2B) rather than
  inherited singles assumptions.
