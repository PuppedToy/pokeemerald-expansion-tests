---
id: T-096
title: Doubles ability rating — redirection, Intimidate, Friend Guard, Telepathy…
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
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

Acceptance criteria:
- [ ] Redirection + doubles-support abilities are re-valued for doubles (independent), singles untouched.
- [ ] The doubles ability value flows into the doubles tier pipeline.
- [ ] Re-valuation justified against the research catalog (T-100) where available.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
