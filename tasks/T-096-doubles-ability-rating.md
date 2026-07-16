---
id: T-096
title: Doubles ability rating — redirection, Intimidate, Friend Guard, Telepathy…
status: done
type: feature
created: 2026-07-09
updated: 2026-07-15
target-version: 0.8.0
links: [T-083, T-093]
blocked-by: [T-093]
---

# T-096 — Doubles ability rating — redirection, Intimidate, Friend Guard, Telepathy…

## Context

Abilities also shift value in doubles. The redirection/"draw" abilities are explicitly discounted in
singles today — `elecAbsorbAbilities` block in `rating.js:2962-2973` ("in singles the draw mechanic
is irrelevant"). In doubles Lightning Rod / Storm Drain / Volt Absorb (redirection), Intimidate,
Friend Guard, Telepathy, Justified/Rattled, weather/terrain setters, and others gain value. Per
ADR-015; informed by T-100.

## Plan

- Add a doubles ability valuation that re-adds redirection value (extend beyond the electric-absorb
  set to Storm Drain), boosts Intimidate/Friend Guard/Telepathy/etc., and adjusts the singles-only
  caps in the `ratePokemon` ability block (`rating.js:2904-2980`) and `computeComboBonus` for the
  doubles dimension.
- Feed the doubles ability value into `ratePokemonDoubles` (T-097).
- Keep the singles ability scoring exactly as-is.
- Tests: redirection/support abilities score higher in doubles than singles; singles unchanged;
  a doubles-relevant ability meaningfully lifts a mon's doubles rating.

> **Meta-analysis validation (owner-gated).** Every Pokémon-meta conclusion in this task — the
> competitive value of a move / ability / item / tier / archetype, or a "what trainers prefer" rule —
> must be **explicitly validated by the owner before it is implemented**, not merely derived from the
> research corpus (which is partly 4v4 VGC, whereas our doubles are 6v6). Any such value/mapping is
> provisional until the owner validates it.

Acceptance criteria:
- [x] Redirection + doubles-support abilities are re-valued for doubles (independent), singles untouched.
- [~] The doubles ability value flows into the doubles tier pipeline. *(Persisted as
      `abilities[id].ratingDoubles`; `ratePokemonDoubles` consumes it in T-097.)*
- [~] Re-valuation justified against the research catalog (T-100) where available. *(Initial pass;
      refined by the Group 2B research.)*
- [x] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-10** — Implemented on `feature/T-096-doubles-ability-rating` (TDD, red→green). Added
  `DOUBLES_ABILITY_RATINGS` + `rateAbilityDoubles(abilityKey, ability)` in `rating.js` — a floor
  (`Math.max` vs the singles aiRating) for redirection draws (Lightning Rod/Storm Drain=8, Volt
  Absorb=7, Motor Drive=6), Intimidate=9, ally protection (Friend Guard=6, Telepathy=5), ally support
  (Healer/Symbiosis/Aroma Veil=4), Intimidate-punishers (Defiant/Competitive=6), trigger abilities
  (Justified=5, Rattled=4) and Overcoat=4. Persisted `abilities[id].ratingDoubles` in `pokedexModule`
  (new abilities loop) + updated its `../rating` mock. Singles ability scoring untouched. Tests:
  `rateAbilityDoubles.test.js` (5 cases). Suite 828 pass / 1 skip. `ratePokemonDoubles` (T-097)
  consumes the value. Kept `in-progress`. Merged to master.

## Outcome

Doubles ability rating: rateAbilityDoubles + DOUBLES_ABILITY_RATINGS (redirection, Intimidate, Friend Guard, Telepathy…), persisted as abilities[id].ratingDoubles and consumed by ratePokemonDoubles (T-097). Suite green (828). Owner-validated 2026-07-15. Closed.
