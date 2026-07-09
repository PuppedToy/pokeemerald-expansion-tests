---
id: T-094
title: Doubles move rating — spread detection (move.target) + rateMoveDoubles
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
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

Acceptance criteria:
- [ ] `rateMoveDoubles` gives spread moves a net bonus (damage-reduction aware); `moves[id].ratingDoubles` persisted.
- [ ] Gen-conditional/`DEPENDS` targets are normalized correctly.
- [ ] Singles `rateMove` output is byte-identical to before (regression test).
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
