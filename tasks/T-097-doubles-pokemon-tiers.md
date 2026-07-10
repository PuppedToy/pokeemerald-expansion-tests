---
id: T-097
title: Doubles Pokémon tiers — ratePokemonDoubles + contextualRatingsDoubles
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, T-093, T-094, T-095, T-096]
blocked-by: [T-094, T-095, T-096]
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

## Outcome

<!-- Filled when closing. -->
