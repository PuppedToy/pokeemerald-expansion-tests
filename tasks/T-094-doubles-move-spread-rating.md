---
id: T-094
title: Doubles move rating — spread detection (move.target) + rateMoveDoubles
status: done
type: feature
created: 2026-07-09
updated: 2026-07-15
target-version: 0.8.0
links: [T-083, T-093]
blocked-by: [T-093]
---

# T-094 — Doubles move rating — spread detection (move.target) + rateMoveDoubles

## Context

Damage moves change value in doubles: spread moves (hit both foes / all adjacent) gain value, and a
few lose it. `move.target` is already present in the parsed data (`MOVE_TARGET_BOTH`,
`_FOES_AND_ALLY`, `_ALL_BATTLERS`) but is read by nothing in `rateMove`. Per ADR-015.

## Plan

- Add `rateMoveDoubles(move)` in `rating.js` starting from the singles `rateMove` base and applying a
  spread adjustment keyed on the normalized `move.target` (spread damage bonus; account for the ~25%
  spread damage reduction so it's a net positive but not overvalued; handle `_ALL_BATTLERS` /
  ally-hitting moves like Earthquake/Surf/Discharge).
- Normalize the gen-conditional target strings first (per ADR-015).
- Persist `moves[id].ratingDoubles` alongside `.rating` at the pokedex-module seam
  (`modules/pokedexModule.js:56`).
- Add a doubles-aware `rateMoveForAPokemon` path (or parameter) that starts from `ratingDoubles`.
- Tests: spread moves rank above equivalent single-target moves in doubles; single-target and
  status moves unaffected in spread logic; singles ratings unchanged.

> **Meta-analysis validation (owner-gated).** Every Pokémon-meta conclusion in this task — the
> competitive value of a move / ability / item / tier / archetype, or a "what trainers prefer" rule —
> must be **explicitly validated by the owner before it is implemented**, not merely derived from the
> research corpus (which is partly 4v4 VGC, whereas our doubles are 6v6). Any such value/mapping is
> provisional until the owner validates it.

Acceptance criteria:
- [x] `rateMoveDoubles` gives spread moves a net bonus (damage-reduction aware); `moves[id].ratingDoubles` persisted.
- [x] Gen-conditional/`DEPENDS` targets are normalized correctly (via `isSpreadMove` `.includes`).
- [x] Singles `rateMove` output is byte-identical to before (existing `rateMove.test.js` unchanged & green; no singles code touched).
- [x] `cd randomizer && npm test` green.
- [~] Doubles-aware `rateMoveForAPokemon` path deferred to when the doubles team-selection consumes it
      (Group 2C, ADR-015 §5) — the base `ratingDoubles` it will start from exists now.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-10** — Implemented on `feature/T-094-doubles-move-rating` (TDD, red→green). `rating.js`:
  `isSpreadMove(move)` normalises `move.target` (a `.includes` over BOTH / FOES_AND_ALLY /
  ALL_BATTLERS, which also matches the gen-conditional Surf/Earthquake ternary strings);
  `rateMoveDoubles(move)` = singles `rateMove` + a spread bonus for damaging moves (×1.35 foes-only,
  ×1.2 when it also hits the ally — friendly-fire cost). Persisted `moves[id].ratingDoubles` beside
  `.rating` in `pokedexModule.js`. No singles code touched. Tests:
  `__tests__/unit/rateMoveDoubles.test.js` (6 cases); updated the `pokedexModule.test.js` `../rating`
  mock to provide `rateMoveDoubles`. Suite 818 pass / 1 skip. Context-aware `rateMoveForAPokemonDoubles`
  deferred to 2C consumption (ADR-015 §5). Kept `in-progress` (Group 2 checkpoint). Merged to master.

## Outcome

Doubles move spread rating: rateMoveDoubles + spread detection (move.target) + persisted moves[id].ratingDoubles; DOUBLES_SUPPORT_RATINGS floors. Suite green (818), merged to master. Doubles-aware rateMoveForAPokemon deliberately handed to the 2C consumer. Owner-validated 2026-07-15. Closed.
